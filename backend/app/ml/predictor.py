from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd

from app.ml.mongo_training import build_student_dataset


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"


def _load(name: str):
    path = MODEL_DIR / name

    if not path.exists():
        raise FileNotFoundError(
            f"ML model is not trained yet: {path.name}"
        )

    return joblib.load(path)


def _student_features(data):
    return [{
        "attendance": float(data.attendance),
        "cgpa": float(data.cgpa),
        "avg_marks_percentage": float(data.avg_marks_percentage),
        "failed_results": int(data.failed_results),
        "result_count": int(data.result_count),
        "semester": int(data.semester),
        "department": str(data.department).strip(),
    }]


def predict_student(data):
    model = _load("performance_model.joblib")

    row = pd.DataFrame(_student_features(data))

    prediction = model.predict(row)[0]

    confidence = None

    if hasattr(model, "predict_proba"):
        confidence = round(
            float(max(model.predict_proba(row)[0])) * 100,
            2
        )

    return {
        "prediction": str(prediction),
        "confidence": confidence,
        "model": "performance"
    }


def predict_dropout(data):
    model = _load("dropout_model.joblib")

    row = pd.DataFrame(_student_features(data))

    prediction = model.predict(row)[0]

    confidence = None

    if hasattr(model, "predict_proba"):
        confidence = round(
            float(max(model.predict_proba(row)[0])) * 100,
            2
        )

    return {
        "prediction": str(prediction),
        "confidence": confidence,
        "model": "dropout"
    }


def predict_course(data):
    model = _load("course_demand_model.joblib")

    row = pd.DataFrame([{
        "department": str(data.department).strip(),
        "semester": int(data.semester),
        "students_enrolled": int(data.students_enrolled),
        "teacher_count": int(data.teacher_count),
        "previous_demand": float(data.previous_demand),
    }])

    prediction = model.predict(row)[0]

    confidence = None

    if hasattr(model, "predict_proba"):
        confidence = round(
            float(max(model.predict_proba(row)[0])) * 100,
            2
        )

    return {
        "prediction": str(prediction),
        "confidence": confidence,
        "model": "course_demand"
    }


def student_data_from_db(db, student_id: str):
    df = build_student_dataset(db)

    sid = student_id.strip().upper()

    if df.empty:
        return None

    rows = df[
        df["student_id"]
        .astype(str)
        .str.upper() == sid
    ]

    if rows.empty:
        return None

    row = rows.iloc[0]

    return {
        "student_id": row["student_id"],
        "attendance": float(row["attendance"]),
        "cgpa": float(row["cgpa"]),
        "avg_marks_percentage": float(
            row["avg_marks_percentage"]
        ),
        "failed_results": int(row["failed_results"]),
        "result_count": int(row["result_count"]),
        "semester": int(row["semester"]),
        "department": str(row["department"]),
    }