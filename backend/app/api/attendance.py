from fastapi import APIRouter, HTTPException, Depends, Query, Path
from datetime import date
from app.database.connection import db
from app.schemas.attendance_schema import AttendanceCreate, AttendanceUpdate
from app.services.attendance_service import add_attendance, update_attendance, delete_attendance
from app.services.scoped_service import list_scoped, count_scoped, get_scoped
from app.auth.dependencies import get_current_user, admin_only, admin_or_teacher

router = APIRouter()


def _read_access(user):
    if user["role"] not in {"Admin", "Teacher", "Student"}:
        raise HTTPException(status_code=403, detail="Access Denied")


def _validate_relationship(data, user):
    student = db["students"].find_one({"student_id": data.student_id})
    if not student:
        raise HTTPException(status_code=400, detail="Student does not exist")
    teacher = db["teachers"].find_one({"teacher_id": data.teacher_id})
    if not teacher:
        raise HTTPException(status_code=400, detail="Teacher does not exist")
    if student.get("teacher_id") and student.get("teacher_id") != data.teacher_id:
        raise HTTPException(status_code=400, detail="Attendance teacher is not assigned to this student")
    if not db["courses"].find_one({"course_code": data.course_id}):
        raise HTTPException(status_code=400, detail="Course does not exist")
    if user["role"] == "Teacher" and data.teacher_id != user.get("teacher_id"):
        raise HTTPException(status_code=403, detail="You can manage attendance only for your assigned students")


@router.post("/")
def create_new_attendance(attendance: AttendanceCreate, user=Depends(admin_or_teacher)):
    _validate_relationship(attendance, user)
    created = add_attendance(attendance)
    if created is None:
        raise HTTPException(status_code=400, detail="Attendance ID already exists")
    return {"message": "Attendance Added Successfully", "attendance": created}


@router.get("/")
def get_attendance_list(user=Depends(get_current_user)):
    _read_access(user)
    records = list_scoped("attendance", user)
    return {"total": len(records), "attendance": records}


@router.get("/search/")
def search_records(query: str = Query(..., min_length=1, max_length=100), user=Depends(get_current_user)):
    _read_access(user)
    import re
    q = re.escape(query.strip())
    extra = {"$or": [
        {"attendance_id": {"$regex": q, "$options": "i"}},
        {"student_id": {"$regex": q, "$options": "i"}},
        {"course_id": {"$regex": q, "$options": "i"}},
        {"teacher_id": {"$regex": q, "$options": "i"}},
    ]}
    records = list_scoped("attendance", user, extra)
    return {"total": len(records), "attendance": records}


@router.get("/filter/student/{student_id}")
def student_filter(student_id: str, user=Depends(get_current_user)):
    _read_access(user)
    records = list_scoped("attendance", user, {"student_id": student_id.strip().upper()})
    return {"total": len(records), "attendance": records}


@router.get("/filter/course/{course_id}")
def course_filter(course_id: str, user=Depends(get_current_user)):
    _read_access(user)
    records = list_scoped("attendance", user, {"course_id": course_id.strip().upper()})
    return {"total": len(records), "attendance": records}


@router.get("/filter/status/{status}")
def status_filter(status: str = Path(..., pattern="^(Present|Absent|Late|Leave)$"), user=Depends(get_current_user)):
    _read_access(user)
    records = list_scoped("attendance", user, {"status": status})
    return {"total": len(records), "attendance": records}


@router.get("/filter/date/{attendance_date}")
def date_filter(attendance_date: date, user=Depends(get_current_user)):
    _read_access(user)
    records = list_scoped("attendance", user, {"attendance_date": attendance_date.isoformat()})
    return {"total": len(records), "attendance": records}


@router.get("/page/")
def pagination(page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100), user=Depends(get_current_user)):
    _read_access(user)
    skip = (page - 1) * limit
    records = list_scoped("attendance", user, skip=skip, limit=limit)
    return {"page": page, "limit": limit, "total": count_scoped("attendance", user), "attendance": records}


@router.get("/{attendance_id}")
def get_single_attendance(attendance_id: str, user=Depends(get_current_user)):
    _read_access(user)
    record = get_scoped("attendance", user, "attendance_id", attendance_id.strip().upper())
    if not record:
        raise HTTPException(status_code=404, detail="Attendance Not Found")
    return record


@router.put("/{attendance_id}")
def edit_attendance(attendance_id: str, attendance: AttendanceUpdate, user=Depends(admin_or_teacher)):
    _validate_relationship(attendance, user)
    existing = get_scoped("attendance", user, "attendance_id", attendance_id.strip().upper())
    if not existing:
        raise HTTPException(status_code=403 if user["role"] == "Teacher" else 404, detail="Attendance not found or access denied")
    updated = update_attendance(attendance_id.strip().upper(), attendance)
    if updated == 0:
        raise HTTPException(status_code=404, detail="Attendance Not Found or No Changes Made")
    return {"message": "Attendance Updated Successfully"}


@router.delete("/{attendance_id}")
def remove_attendance(attendance_id: str, user=Depends(admin_only)):
    deleted = delete_attendance(attendance_id.strip().upper())
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Attendance Not Found")
    return {"message": "Attendance Deleted Successfully"}
