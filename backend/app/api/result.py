from fastapi import APIRouter, HTTPException, Depends, Query, Path
from app.database.connection import db
from app.schemas.result_schema import ResultCreate, ResultUpdate
from app.services.result_service import add_result, update_result, delete_result
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
        raise HTTPException(status_code=400, detail="Result teacher is not assigned to this student")
    if not db["courses"].find_one({"course_code": data.course_id}):
        raise HTTPException(status_code=400, detail="Course does not exist")
    if user["role"] == "Teacher" and data.teacher_id != user.get("teacher_id"):
        raise HTTPException(status_code=403, detail="You can manage results only for your assigned students")


@router.post("/")
def create_new_result(result: ResultCreate, user=Depends(admin_or_teacher)):
    _validate_relationship(result, user)
    created = add_result(result)
    if created is None:
        raise HTTPException(status_code=400, detail="Result ID already exists")
    return {"message": "Result Added Successfully", "result": created}


@router.get("/")
def get_results(user=Depends(get_current_user)):
    _read_access(user)
    results = list_scoped("results", user)
    return {"total": len(results), "results": results}


@router.get("/search/")
def search_result(query: str = Query(..., min_length=1, max_length=100), user=Depends(get_current_user)):
    _read_access(user)
    import re
    q = re.escape(query.strip())
    extra = {"$or": [
        {"result_id": {"$regex": q, "$options": "i"}},
        {"student_id": {"$regex": q, "$options": "i"}},
        {"course_id": {"$regex": q, "$options": "i"}},
        {"teacher_id": {"$regex": q, "$options": "i"}},
    ]}
    results = list_scoped("results", user, extra)
    return {"total": len(results), "results": results}


@router.get("/filter/status/{status}")
def status_filter(status: str = Path(..., pattern="^(Pass|Fail)$"), user=Depends(get_current_user)):
    _read_access(user)
    results = list_scoped("results", user, {"status": status})
    return {"total": len(results), "results": results}


@router.get("/filter/semester/{semester}")
def semester_filter(semester: int = Path(..., ge=1, le=8), user=Depends(get_current_user)):
    _read_access(user)
    results = list_scoped("results", user, {"semester": semester})
    return {"total": len(results), "results": results}


@router.get("/filter/exam/{exam_type}")
def exam_filter(exam_type: str = Path(..., pattern="^(Quiz|Assignment|Mid|Final)$"), user=Depends(get_current_user)):
    _read_access(user)
    results = list_scoped("results", user, {"exam_type": exam_type})
    return {"total": len(results), "results": results}


@router.get("/page/")
def pagination(page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100), user=Depends(get_current_user)):
    _read_access(user)
    skip = (page - 1) * limit
    results = list_scoped("results", user, skip=skip, limit=limit)
    return {"page": page, "limit": limit, "total": count_scoped("results", user), "results": results}


@router.get("/{result_id}")
def get_single_result(result_id: str, user=Depends(get_current_user)):
    _read_access(user)
    result = get_scoped("results", user, "result_id", result_id.strip().upper())
    if not result:
        raise HTTPException(status_code=404, detail="Result Not Found")
    return result


@router.put("/{result_id}")
def edit_result(result_id: str, result: ResultUpdate, user=Depends(admin_or_teacher)):
    _validate_relationship(result, user)
    existing = get_scoped("results", user, "result_id", result_id.strip().upper())
    if not existing:
        raise HTTPException(status_code=403 if user["role"] == "Teacher" else 404, detail="Result not found or access denied")
    updated = update_result(result_id.strip().upper(), result)
    if updated == 0:
        raise HTTPException(status_code=404, detail="Result Not Found or No Changes Made")
    return {"message": "Result Updated Successfully"}


@router.delete("/{result_id}")
def remove_result(result_id: str, user=Depends(admin_only)):
    deleted = delete_result(result_id.strip().upper())
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Result Not Found")
    return {"message": "Result Deleted Successfully"}
