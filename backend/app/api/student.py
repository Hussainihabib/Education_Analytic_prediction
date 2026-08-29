from fastapi import APIRouter, HTTPException, Depends, Query, Path
from app.schemas.student_schema import StudentCreate, StudentUpdate
from app.services.student_service import add_student, update_student, delete_student
from app.services.scoped_service import list_scoped, count_scoped, get_scoped
from app.auth.dependencies import get_current_user, admin_only, admin_or_teacher

router = APIRouter()


def _read_access(user):
    if user["role"] not in {"Admin", "Teacher", "Student"}:
        raise HTTPException(status_code=403, detail="Access Denied")


@router.post("/")
def create_new_student(student: StudentCreate, user=Depends(admin_only)):
    result = add_student(student)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result["message"])
    return {"message": "Student Added Successfully", "student": result["student"]}


@router.get("/")
def get_students(user=Depends(get_current_user)):
    _read_access(user)
    students = list_scoped("students", user)
    return {"total": len(students), "students": students}


@router.get("/search/")
def search_student(query: str = Query(..., min_length=1, max_length=100), user=Depends(get_current_user)):
    _read_access(user)
    query = query.strip()
    if not query:
        raise HTTPException(status_code=422, detail="Search query cannot be empty")
    import re
    safe = re.escape(query)
    extra = {"$or": [
        {"student_id": {"$regex": safe, "$options": "i"}},
        {"first_name": {"$regex": safe, "$options": "i"}},
        {"last_name": {"$regex": safe, "$options": "i"}},
        {"email": {"$regex": safe, "$options": "i"}},
    ]}
    students = list_scoped("students", user, extra)
    return {"total": len(students), "students": students}


@router.get("/filter/department/{department}")
def department_filter(department: str = Path(..., min_length=2, max_length=100), user=Depends(get_current_user)):
    _read_access(user)
    students = list_scoped("students", user, {"department": department.strip()})
    return {"total": len(students), "students": students}


@router.get("/filter/semester/{semester}")
def semester_filter(semester: int = Path(..., ge=1, le=8), user=Depends(get_current_user)):
    _read_access(user)
    students = list_scoped("students", user, {"semester": semester})
    return {"total": len(students), "students": students}


@router.get("/filter/status/{status}")
def status_filter(status: str = Path(..., pattern="^(Active|Inactive)$"), user=Depends(get_current_user)):
    _read_access(user)
    students = list_scoped("students", user, {"status": status})
    return {"total": len(students), "students": students}


@router.get("/page/")
def pagination(page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100), user=Depends(get_current_user)):
    _read_access(user)
    skip = (page - 1) * limit
    students = list_scoped("students", user, skip=skip, limit=limit)
    return {"page": page, "limit": limit, "total": count_scoped("students", user), "students": students}


@router.get("/{student_id}")
def get_single_student(student_id: str = Path(..., min_length=3, max_length=20), user=Depends(get_current_user)):
    _read_access(user)
    student = get_scoped("students", user, "student_id", student_id.strip().upper())
    if not student:
        raise HTTPException(status_code=404, detail="Student Not Found")
    return student


@router.put("/{student_id}")
def edit_student(student_id: str, student: StudentUpdate, user=Depends(admin_or_teacher)):
    student_id = student_id.strip().upper()
    existing = get_scoped("students", user, "student_id", student_id)
    if not existing:
        raise HTTPException(status_code=403 if user["role"] == "Teacher" else 404, detail="Student not found or access denied")
    if user["role"] == "Teacher" and student.teacher_id and student.teacher_id != user.get("teacher_id"):
        raise HTTPException(status_code=403, detail="Teacher cannot reassign this student to another teacher")
    result = update_student(student_id, student)
    if not result.get("success"):
        raise HTTPException(status_code=400 if result["message"] != "Student not found." else 404, detail=result["message"])
    return {"message": "Student Updated Successfully"}


@router.delete("/{student_id}")
def remove_student(student_id: str, user=Depends(admin_only)):
    deleted = delete_student(student_id.strip().upper())
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Student Not Found")
    return {"message": "Student Deleted Successfully"}
