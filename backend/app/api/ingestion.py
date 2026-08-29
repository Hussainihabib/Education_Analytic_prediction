"""
Data Ingestion API — Functional Requirement #2.

Lets an Admin upload a CSV/Excel/JSON file of academic records,
student demographics, attendance, or results and have it merged
into MongoDB. This did not exist anywhere in the original backend:
`ingestion/csv_loader.py` was an empty stub and there was no
UploadFile endpoint at all — only an internal Mongo -> CSV export
used for Spark.

Design notes:
  - Each supported collection has a natural unique key (student_id,
    teacher_id, course_code, attendance_id, result_id). Rows are
    upserted on that key so re-uploading a corrected file updates
    existing records instead of creating duplicates.
  - attendance/result rows commonly come from external LMS exports
    that won't have this app's internal *_id — one is generated
    automatically when missing.
  - Rows missing a genuinely required reference field (e.g. no
    student_id at all) are skipped and reported individually rather
    than failing the whole upload, per Functional Requirement #4
    (graceful handling of missing/incomplete data).
"""

from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, Path, UploadFile

from app.auth.dependencies import admin_only
from app.database.connection import db
from app.ingestion.csv_loader import SUPPORTED_EXTENSIONS, clean_records, load_dataframe

router = APIRouter()

ingestion_log_collection = db["ingestion_logs"]

# collection -> (unique key field, other required fields)
COLLECTION_RULES = {
    "students": ("student_id", ["student_id", "email"]),
    "teachers": ("teacher_id", ["teacher_id", "email"]),
    "courses": ("course_code", ["course_code", "course_name"]),
    "attendance": ("attendance_id", ["student_id", "course_id", "teacher_id"]),
    "results": ("result_id", ["student_id", "course_id", "teacher_id"]),
}


@router.get("/collections")
def list_ingestible_collections(user=Depends(admin_only)):
    """What this endpoint can currently accept — used by the frontend upload form."""
    return {
        "collections": list(COLLECTION_RULES.keys()),
        "supported_formats": sorted(SUPPORTED_EXTENSIONS),
    }


@router.get("/history")
def get_ingestion_history(limit: int = 50, user=Depends(admin_only)):
    """Recent upload attempts — real audit trail, not simulated."""
    logs = list(
        ingestion_log_collection.find({}, {"_id": 0})
        .sort("uploaded_at", -1)
        .limit(max(1, min(limit, 200)))
    )
    return {"total": len(logs), "history": logs}


@router.post("/upload/{collection}")
async def upload_dataset(
    collection: str = Path(..., pattern="^(students|teachers|courses|attendance|results)$"),
    file: UploadFile = File(...),
    user=Depends(admin_only),
):
    if collection not in COLLECTION_RULES:
        raise HTTPException(status_code=400, detail="Unsupported collection")

    filename = file.filename or ""
    if not any(filename.lower().endswith(ext) for ext in SUPPORTED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Use one of: {', '.join(sorted(SUPPORTED_EXTENSIONS))}",
        )

    content = await file.read()
    size_label = f"{len(content) / (1024 * 1024):.1f} MB" if content else "0 MB"

    if not content:
        _log_upload(filename, collection, size_label, status="failed", rows=0, errors=0,
                     detail="Uploaded file is empty")
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        df = load_dataframe(filename, content)
    except Exception as exc:
        _log_upload(filename, collection, size_label, status="failed", rows=0, errors=0,
                     detail=f"Could not parse file: {exc}")
        raise HTTPException(status_code=400, detail=f"Could not parse file: {exc}")

    records = clean_records(df)
    if not records:
        _log_upload(filename, collection, size_label, status="failed", rows=0, errors=0,
                     detail="No usable rows found in file")
        raise HTTPException(status_code=400, detail="No usable rows found in file")

    unique_key, required_fields = COLLECTION_RULES[collection]
    collection_ref = db[collection]

    inserted = 0
    updated = 0
    errors: list[dict] = []

    for index, row in enumerate(records, start=2):  # start=2 → row 1 is the header
        missing = [f for f in required_fields if not row.get(f)]

        # attendance/results: auto-generate the internal ID if the
        # source file (e.g. an LMS export) doesn't have one.
        if unique_key not in required_fields and not row.get(unique_key):
            row[unique_key] = str(uuid.uuid4())[:8].upper()

        if missing:
            errors.append({"row": index, "reason": f"Missing required field(s): {', '.join(missing)}"})
            continue

        key_value = row[unique_key]
        result = collection_ref.update_one(
            {unique_key: key_value},
            {"$set": row},
            upsert=True,
        )

        if result.upserted_id is not None:
            inserted += 1
        elif result.matched_count:
            updated += 1

    status = "success" if not errors else ("warning" if inserted or updated else "failed")

    _log_upload(
        filename, collection, size_label,
        status=status, rows=len(records), errors=len(errors),
        detail=f"{inserted} inserted, {updated} updated",
    )

    return {
        "collection": collection,
        "total_rows": len(records),
        "inserted": inserted,
        "updated": updated,
        "skipped": len(errors),
        "errors": errors[:50],  # cap so a bad file doesn't blow up the response
    }


def _log_upload(filename, collection, size_label, *, status, rows, errors, detail):
    ingestion_log_collection.insert_one({
        "log_id": str(uuid.uuid4())[:8].upper(),
        "file": filename,
        "type": (filename.rsplit(".", 1)[-1].upper() if "." in filename else "?"),
        "collection": collection,
        "size": size_label,
        "rows": rows,
        "errors": errors,
        "status": status,
        "detail": detail,
        "uploaded_at": datetime.now(),
    })
