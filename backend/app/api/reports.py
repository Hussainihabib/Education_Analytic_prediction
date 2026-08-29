from __future__ import annotations

import csv
import io
import math
import textwrap
from datetime import date, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Path
from fastapi.responses import StreamingResponse

from app.auth.dependencies import get_current_user
from app.auth.access import get_scope_query, merge_filters
from app.database.connection import db
from app.ml.mongo_training import load_metadata

router = APIRouter()

REPORT_TYPES = {
    "student-performance": "Student Performance Summary",
    "dropout-risk": "Dropout Risk Report",
    "department-analytics": "Department Analytics",
    "teacher-performance": "Teacher Performance Report",
    "attendance-compliance": "Attendance Compliance Report",
    "ml-model-accuracy": "ML Model Accuracy Report",
}

FORMATS = {"pdf", "csv"}


def _string(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return ""
        return str(round(value, 4))
    return str(value)


def _clean_row(row: dict) -> dict:
    return {str(k): _string(v) for k, v in row.items() if k != "_id"}


def _scoped(resource: str, user: dict, extra: dict | None = None) -> list[dict]:
    query = merge_filters(get_scope_query(user, resource), extra)
    return list(db[resource].find(query, {"_id": 0}))


def _student_metrics(user: dict) -> list[dict]:
    students = _scoped("students", user)
    results = _scoped("results", user)
    attendance = _scoped("attendance", user)

    result_by_student: dict[str, list[dict]] = {}
    for row in results:
        result_by_student.setdefault(str(row.get("student_id", "")).upper(), []).append(row)

    attendance_by_student: dict[str, list[dict]] = {}
    for row in attendance:
        attendance_by_student.setdefault(str(row.get("student_id", "")).upper(), []).append(row)

    output = []
    for student in students:
        sid = str(student.get("student_id", "")).upper()
        rs = result_by_student.get(sid, [])
        ats = attendance_by_student.get(sid, [])
        percentages = [float(r["percentage"]) for r in rs if r.get("percentage") is not None]
        failed = sum(1 for r in rs if str(r.get("status", "")).lower() == "fail")
        present = sum(1 for a in ats if str(a.get("status", "")).lower() == "present")
        attendance_rate = round((present / len(ats)) * 100, 2) if ats else student.get("attendance", 0)
        avg_marks = round(sum(percentages) / len(percentages), 2) if percentages else 0
        output.append({
            "student_id": student.get("student_id"),
            "name": f"{student.get('first_name', '')} {student.get('last_name', '')}".strip(),
            "department": student.get("department"),
            "semester": student.get("semester"),
            "cgpa": student.get("cgpa"),
            "attendance": attendance_rate,
            "avg_marks_percentage": avg_marks,
            "failed_results": failed,
            "result_count": len(rs),
            "status": student.get("status", "Active"),
        })
    return output


def _dropout_rows(user: dict) -> list[dict]:
    # Reuse one MongoDB-built feature dataset and one loaded model for the
    # entire report. This keeps RBAC unchanged while avoiding an expensive
    # database rebuild/model load for every student. Predictions are also
    # batched so a large report does not call the model once per row.
    from app.ml.predictor import _load
    from app.ml.mongo_training import build_student_dataset

    students = _scoped("students", user)
    if not students:
        return []

    try:
        model = _load("dropout_model.joblib")
    except FileNotFoundError:
        model = None

    feature_df = build_student_dataset(db)
    feature_map = {}
    if not feature_df.empty and "student_id" in feature_df.columns:
        for _, row in feature_df.iterrows():
            sid = str(row.get("student_id", "")).upper()
            if sid:
                feature_map[sid] = {
                    "attendance": float(row.get("attendance", 0)),
                    "cgpa": float(row.get("cgpa", 0)),
                    "avg_marks_percentage": float(row.get("avg_marks_percentage", 0)),
                    "failed_results": int(row.get("failed_results", 0)),
                    "result_count": int(row.get("result_count", 0)),
                    "semester": int(row.get("semester", 1)),
                    "department": str(row.get("department", "")),
                }

    base_rows = []
    prediction_ids = []
    prediction_features = []

    for student in students:
        sid = str(student.get("student_id", "")).upper()
        name = f"{student.get('first_name', '')} {student.get('last_name', '')}".strip()
        base = {
            "student_id": student.get("student_id"),
            "name": name,
            "department": student.get("department"),
            "semester": student.get("semester"),
            "prediction": "No data",
            "confidence": "",
            "model": "dropout",
        }

        features = feature_map.get(sid)
        if not features:
            base_rows.append(base)
            continue

        if model is None:
            base["prediction"] = "Model not trained"
            base_rows.append(base)
            continue

        base_rows.append(base)
        prediction_ids.append(sid)
        prediction_features.append(features)

    if model is not None and prediction_features:
        try:
            import pandas as pd
            frame = pd.DataFrame(prediction_features)
            predictions = model.predict(frame)
            probabilities = model.predict_proba(frame) if hasattr(model, "predict_proba") else None
            prediction_map = {}
            for index, sid in enumerate(prediction_ids):
                confidence = None
                if probabilities is not None:
                    confidence = round(float(max(probabilities[index])) * 100, 2)
                prediction_map[sid] = (str(predictions[index]), confidence)

            for row in base_rows:
                sid = str(row.get("student_id", "")).upper()
                if sid in prediction_map:
                    row["prediction"], row["confidence"] = prediction_map[sid]
        except Exception:
            for row in base_rows:
                sid = str(row.get("student_id", "")).upper()
                if sid in prediction_ids:
                    row["prediction"] = "Prediction unavailable"

    return base_rows


def _department_rows(user: dict) -> list[dict]:
    students = _scoped("students", user)
    courses = _scoped("courses", user)
    teachers = _scoped("teachers", user)
    departments = sorted({str(x.get("department", "")) for x in students + courses + teachers if x.get("department")})
    rows = []
    for department in departments:
        rows.append({
            "department": department,
            "students": sum(1 for x in students if x.get("department") == department),
            "courses": sum(1 for x in courses if x.get("department") == department),
            "teachers": sum(1 for x in teachers if x.get("department") == department),
        })
    return rows


def _teacher_rows(user: dict) -> list[dict]:
    teachers = _scoped("teachers", user)
    students = _scoped("students", user)
    results = _scoped("results", user)
    attendance = _scoped("attendance", user)
    rows = []
    for teacher in teachers:
        tid = str(teacher.get("teacher_id", "")).upper()
        rs = [r for r in results if str(r.get("teacher_id", "")).upper() == tid]
        ats = [a for a in attendance if str(a.get("teacher_id", "")).upper() == tid]
        students_count = len({str(s.get("student_id", "")).upper() for s in students if str(s.get("teacher_id", "")).upper() == tid})
        rows.append({
            "teacher_id": teacher.get("teacher_id"),
            "name": f"{teacher.get('first_name', '')} {teacher.get('last_name', '')}".strip(),
            "department": teacher.get("department"),
            "designation": teacher.get("designation"),
            "students": students_count,
            "results_recorded": len(rs),
            "attendance_recorded": len(ats),
            "status": teacher.get("status"),
        })
    return rows


def _attendance_rows(user: dict) -> list[dict]:
    rows = _scoped("attendance", user)
    return [{
        "attendance_id": r.get("attendance_id"),
        "student_id": r.get("student_id"),
        "course_id": r.get("course_id"),
        "teacher_id": r.get("teacher_id"),
        "attendance_date": r.get("attendance_date"),
        "status": r.get("status"),
        "remarks": r.get("remarks"),
    } for r in rows]


def _ml_rows(user: dict) -> list[dict]:
    metadata = load_metadata() or {}
    models = metadata.get("models", []) if isinstance(metadata, dict) else []
    return [{
        "model": row.get("model"),
        "accuracy": row.get("accuracy"),
        "anomalies": row.get("anomalies"),
        "records": row.get("records", 0),
        "trained_at": row.get("trained_at"),
    } for row in models]


def _report_data(report_type: str, user: dict) -> tuple[str, list[dict]]:
    if report_type == "student-performance":
        return REPORT_TYPES[report_type], _student_metrics(user)
    if report_type == "dropout-risk":
        return REPORT_TYPES[report_type], _dropout_rows(user)
    if report_type == "department-analytics":
        return REPORT_TYPES[report_type], _department_rows(user)
    if report_type == "teacher-performance":
        return REPORT_TYPES[report_type], _teacher_rows(user)
    if report_type == "attendance-compliance":
        return REPORT_TYPES[report_type], _attendance_rows(user)
    if report_type == "ml-model-accuracy":
        return REPORT_TYPES[report_type], _ml_rows(user)
    raise HTTPException(status_code=404, detail="Unknown report type")


def _csv_response(title: str, rows: list[dict], filename: str) -> StreamingResponse:
    output = io.StringIO()
    if rows:
        fieldnames = list(rows[0].keys())
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows([_clean_row(r) for r in rows])
    else:
        output.write("No records available\n")
    return StreamingResponse(
        iter([output.getvalue().encode("utf-8-sig")]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


REPORT_COLUMNS = {
    "student-performance": [
        ("student_id", "Student ID"), ("name", "Student Name"),
        ("department", "Department"), ("semester", "Semester"),
        ("cgpa", "CGPA"), ("attendance", "Attendance %"),
        ("avg_marks_percentage", "Average Marks %"),
        ("failed_results", "Failed Results"), ("result_count", "Result Count"),
        ("status", "Status"),
    ],
    "dropout-risk": [
        ("student_id", "Student ID"), ("name", "Student Name"),
        ("department", "Department"), ("semester", "Semester"),
        ("prediction", "Dropout Risk"), ("confidence", "Confidence %"),
        ("model", "Model"),
    ],
    "department-analytics": [
        ("department", "Department"), ("students", "Students"),
        ("courses", "Courses"), ("teachers", "Teachers"),
    ],
    "teacher-performance": [
        ("teacher_id", "Teacher ID"), ("name", "Teacher Name"),
        ("department", "Department"), ("designation", "Designation"),
        ("students", "Students"), ("results_recorded", "Results Recorded"),
        ("attendance_recorded", "Attendance Recorded"), ("status", "Status"),
    ],
    "attendance-compliance": [
        ("attendance_id", "Attendance ID"), ("student_id", "Student ID"),
        ("course_id", "Course ID"), ("teacher_id", "Teacher ID"),
        ("attendance_date", "Date"), ("status", "Status"),
        ("remarks", "Remarks"),
    ],
    "ml-model-accuracy": [
        ("model", "Model"), ("accuracy", "Accuracy %"),
        ("anomalies", "Anomalies"), ("records", "Records"),
        ("trained_at", "Trained At"),
    ],
}


def _report_columns(report_type: str, rows: list[dict]) -> list[tuple[str, str]]:
    columns = REPORT_COLUMNS.get(report_type, [])
    if columns:
        return columns
    if not rows:
        return []
    return [(key, key.replace("_", " ").title()) for key in rows[0].keys()]


def _csv_response(report_type: str, title: str, rows: list[dict], filename: str) -> StreamingResponse:
    output = io.StringIO()
    columns = _report_columns(report_type, rows)
    if rows and columns:
        fieldnames = [key for key, _ in columns]
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
        writer.writerow({key: label for key, label in columns})
        for row in rows:
            writer.writerow({key: _string(row.get(key)) for key in fieldnames})
    else:
        output.write("No records available\n")
    return StreamingResponse(
        iter([output.getvalue().encode("utf-8-sig")]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _pdf_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)").replace("\r", " ").replace("\n", " ")


def _pdf_text(value: Any) -> str:
    value = _string(value)
    # Keep the dependency-free Helvetica PDF writer robust for normal project data.
    return value.encode("latin-1", "replace").decode("latin-1")


def _pdf_response(report_type: str, title: str, rows: list[dict], filename: str, user: dict) -> StreamingResponse:
    """Create a professional, dependency-free table PDF.

    The report data is already RBAC-scoped before this function is called.
    No additional records are fetched here.
    """
    columns = _report_columns(report_type, rows)
    page_w, page_h = 792, 612  # landscape A4-like page
    margin = 32
    content_w = page_w - (margin * 2)
    header_h = 76
    footer_h = 24
    table_top = page_h - margin - header_h - 14
    table_bottom = margin + footer_h + 8
    available_h = table_top - table_bottom
    header_row_h = 30
    body_row_h = 30
    font_size = 7.4 if len(columns) >= 8 else 8.2
    cell_pad = 5

    width_preferences = {
        "student_id": 62, "teacher_id": 62, "attendance_id": 72,
        "name": 104, "department": 92, "designation": 92,
        "semester": 54, "cgpa": 48, "attendance": 66,
        "avg_marks_percentage": 76, "failed_results": 66, "result_count": 62,
        "status": 62, "prediction": 82, "confidence": 70, "model": 70,
        "students": 58, "courses": 58, "teachers": 58,
        "results_recorded": 76, "attendance_recorded": 82,
        "course_id": 70, "teacher_id": 70, "attendance_date": 78,
        "remarks": 112, "accuracy": 66, "anomalies": 64, "records": 62,
        "trained_at": 106,
    }
    widths = [width_preferences.get(key, 72) for key, _ in columns]
    total_pref = sum(widths)
    widths = [w * content_w / total_pref for w in widths] if total_pref else []

    # Approximate character capacity for Helvetica at the selected font size.
    def capacity(width: float) -> int:
        return max(6, int((width - cell_pad * 2) / (font_size * 0.52)))

    def wrap_cell(value: Any, width: float, max_lines: int = 2) -> list[str]:
        text = _pdf_text(value).strip() or "—"
        chunks = textwrap.wrap(text, width=capacity(width), break_long_words=True, break_on_hyphens=False)
        if not chunks:
            chunks = ["—"]
        if len(chunks) > max_lines:
            chunks = chunks[:max_lines]
            last = chunks[-1]
            if len(last) >= 2:
                chunks[-1] = last[:-1] + "…"
        return chunks

    # Pre-wrap rows so page breaks never split a table row.
    prepared_rows = []
    for row in rows:
        cells = [wrap_cell(row.get(key), widths[i]) for i, (key, _) in enumerate(columns)]
        row_h = max(body_row_h, max((len(c) for c in cells), default=1) * 11 + 12)
        prepared_rows.append((row, cells, row_h))

    pages_data = []
    current = []
    used = header_row_h
    for item in prepared_rows:
        if current and used + item[2] > available_h:
            pages_data.append(current)
            current = []
            used = header_row_h
        current.append(item)
        used += item[2]
    if current or not pages_data:
        pages_data.append(current)

    objects: list[bytes] = [b"", b""]
    offsets = [0]
    pdf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")

    def add_object(content: bytes) -> int:
        objects.append(content)
        return len(objects)

    catalog_num = 1
    pages_num = 2
    font_num = add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    bold_font_num = add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    page_nums = []

    def rect(cmds: list[str], x: float, y: float, w: float, h: float, r: float, g: float, b: float, stroke: bool = False):
        cmds.append(f"{r:.3f} {g:.3f} {b:.3f} rg")
        cmds.append(f"{x:.2f} {y:.2f} {w:.2f} {h:.2f} re")
        cmds.append("B" if stroke else "f")

    def text(cmds: list[str], x: float, y: float, value: str, size: float, bold: bool = False, r: float = 0.12, g: float = 0.16, b: float = 0.22):
        cmds.append(f"{r:.3f} {g:.3f} {b:.3f} rg")
        cmds.append(f"/{'F2' if bold else 'F1'} {size:.2f} Tf")
        cmds.append(f"1 0 0 1 {x:.2f} {y:.2f} Tm")
        cmds.append(f"({_pdf_escape(value)}) Tj")

    role = _pdf_text(user.get("role") or "User")
    identity = _pdf_text(user.get("name") or user.get("email") or "Authenticated user")
    generated = datetime.utcnow().strftime("%d %b %Y, %H:%M UTC")

    for page_index, page_rows in enumerate(pages_data, start=1):
        cmds = ["q"]
        # Header band
        rect(cmds, margin, page_h - margin - header_h, content_w, header_h, 0.055, 0.09, 0.17)
        text(cmds, margin + 18, page_h - margin - 28, "EduPredict", 18, True, 0.95, 0.96, 0.98)
        text(cmds, margin + 18, page_h - margin - 48, _pdf_text(title), 10.5, True, 0.74, 0.84, 0.92)
        text(cmds, page_w - margin - 190, page_h - margin - 26, f"Role: {role}", 8, False, 0.82, 0.87, 0.92)
        text(cmds, page_w - margin - 190, page_h - margin - 44, f"User: {identity[:32]}", 7.5, False, 0.72, 0.79, 0.86)
        text(cmds, page_w - margin - 190, page_h - margin - 61, f"Generated: {generated}", 7.2, False, 0.72, 0.79, 0.86)

        # Summary strip
        summary_y = table_top + 7
        rect(cmds, margin, summary_y, content_w, 18, 0.95, 0.97, 0.98)
        text(cmds, margin + 8, summary_y + 6, f"Records: {len(rows)}", 7.6, True)
        text(cmds, margin + 100, summary_y + 6, f"Page {page_index} of {len(pages_data)}", 7.2)
        text(cmds, page_w - margin - 160, summary_y + 6, "RBAC-scoped report", 7.2, False, 0.35, 0.42, 0.50)

        # Table header
        y = table_top
        x = margin
        for i, (_, label) in enumerate(columns):
            w = widths[i]
            rect(cmds, x, y - header_row_h, w, header_row_h, 0.07, 0.31, 0.43)
            text(cmds, x + cell_pad, y - 19, _pdf_text(label), font_size, True, 1, 1, 1)
            x += w

        y -= header_row_h
        for row_index, (row, cells, row_h) in enumerate(page_rows):
            x = margin
            fill = (0.985, 0.99, 0.995) if row_index % 2 == 0 else (0.94, 0.965, 0.98)
            for i, (key, _) in enumerate(columns):
                w = widths[i]
                rect(cmds, x, y - row_h, w, row_h, *fill)
                cmds.append("0.78 0.82 0.86 RG")
                cmds.append(f"{x:.2f} {y - row_h:.2f} {w:.2f} {row_h:.2f} re S")
                cell_lines = cells[i]
                for line_i, line in enumerate(cell_lines):
                    color = (0.12, 0.16, 0.22)
                    if key == "prediction":
                        low = line.lower()
                        if "high" in low:
                            color = (0.75, 0.12, 0.12)
                        elif "medium" in low or "moderate" in low:
                            color = (0.72, 0.42, 0.05)
                        elif "low" in low:
                            color = (0.05, 0.48, 0.28)
                    text(cmds, x + cell_pad, y - 12 - (line_i * 11), line, font_size, key in {"student_id", "teacher_id", "prediction"}, *color)
                x += w
            y -= row_h

        # Footer
        footer_y = 17
        cmds.append("0.80 0.84 0.88 RG")
        cmds.append(f"{margin} {footer_y + 8} m {page_w - margin} {footer_y + 8} l S")
        text(cmds, margin, footer_y, "EduPredict • Confidential • Access controlled by user role", 6.8, False, 0.42, 0.48, 0.55)
        text(cmds, page_w - margin - 55, footer_y, f"{page_index}/{len(pages_data)}", 6.8, False, 0.42, 0.48, 0.55)
        cmds.append("Q")

        stream = "\n".join(cmds).encode("latin-1", "replace")
        content_num = add_object(f"<< /Length {len(stream)} >>\nstream\n".encode() + stream + b"\nendstream")
        page_num = add_object(
            f"<< /Type /Page /Parent {pages_num} 0 R /MediaBox [0 0 {page_w} {page_h}] /Resources << /Font << /F1 {font_num} 0 R /F2 {bold_font_num} 0 R >> >> /Contents {content_num} 0 R >>".encode()
        )
        page_nums.append(page_num)

    kids = " ".join(f"{n} 0 R" for n in page_nums)
    objects[pages_num - 1] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_nums)} >>".encode()
    objects[catalog_num - 1] = f"<< /Type /Catalog /Pages {pages_num} 0 R >>".encode()

    for i, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{i} 0 obj\n".encode())
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode())
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode())
    pdf.extend(f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_num} 0 R >>\nstartxref\n{xref}\n%%EOF".encode())

    return StreamingResponse(
        iter([bytes(pdf)]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{report_type}/{file_format}")
def download_report(
    report_type: str = Path(...),
    file_format: str = Path(...),
    user=Depends(get_current_user),
):
    report_type = report_type.strip().lower()
    file_format = file_format.strip().lower()
    if report_type not in REPORT_TYPES:
        raise HTTPException(status_code=404, detail="Unknown report type")
    if file_format not in FORMATS:
        raise HTTPException(status_code=400, detail="Supported formats are PDF and CSV")

    title, rows = _report_data(report_type, user)
    safe_name = report_type.replace("-", "_")

    if file_format == "csv":
        return _csv_response(report_type, title, rows, f"{safe_name}.csv")
    return _pdf_response(report_type, title, rows, f"{safe_name}.pdf", user)
