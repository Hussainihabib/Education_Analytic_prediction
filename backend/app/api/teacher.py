from fastapi import APIRouter, HTTPException, Depends, Query, Path
from app.schemas.teacher_schema import TeacherCreate, TeacherUpdate
from app.services.teacher_service import add_teacher, update_teacher, delete_teacher
from app.services.scoped_service import list_scoped, count_scoped, get_scoped
from app.auth.dependencies import get_current_user, admin_only

router = APIRouter()


def _read_access(user):
    if user["role"] not in {"Admin", "Teacher", "Student"}:
        raise HTTPException(status_code=403, detail="Access Denied")


@router.post("/")
def create_new_teacher(teacher: TeacherCreate, user=Depends(admin_only)):
    created = add_teacher(teacher)
    if created == "teacher_exists":
        raise HTTPException(status_code=400, detail="Teacher ID already exists")
    if created == "email_exists":
        raise HTTPException(status_code=400, detail="Email already exists")
    return {"message": "Teacher Added Successfully", "teacher": created}


@router.get("/")
def get_teachers(user=Depends(get_current_user)):
    _read_access(user)
    teachers = list_scoped("teachers", user)
    return {"total": len(teachers), "teachers": teachers}


@router.get("/me")
def get_my_teacher(user=Depends(get_current_user)):
    if user["role"] != "Teacher":
        raise HTTPException(status_code=403, detail="Teacher Access Required")
    teacher = get_scoped("teachers", user, "teacher_id", user["teacher_id"])
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    return teacher


@router.get("/search/")
def search_teacher(query: str = Query(..., min_length=1, max_length=100), user=Depends(get_current_user)):
    _read_access(user)
    import re
    q = re.escape(query.strip())
    extra = {"$or": [
        {"teacher_id": {"$regex": q, "$options": "i"}},
        {"first_name": {"$regex": q, "$options": "i"}},
        {"last_name": {"$regex": q, "$options": "i"}},
        {"email": {"$regex": q, "$options": "i"}},
        {"department": {"regex": q, "$options": "i"}},
        {"designation": {"$regex": q, "$options": "i"}},
    ]}
    # Correct Mongo operator for department while keeping the same search behavior.
    extra["$or"][4] = {"department": {"$regex": q, "$options": "i"}}
    teachers = list_scoped("teachers", user, extra)
    return {"total": len(teachers), "teachers": teachers}


@router.get("/filter/department/{department}")
def department_filter(department: str, user=Depends(get_current_user)):
    _read_access(user)
    teachers = list_scoped("teachers", user, {"department": department.strip()})
    return {"total": len(teachers), "teachers": teachers}


@router.get("/filter/designation/{designation}")
def designation_filter(designation: str, user=Depends(get_current_user)):
    _read_access(user)
    teachers = list_scoped("teachers", user, {"designation": designation.strip()})
    return {"total": len(teachers), "teachers": teachers}


@router.get("/filter/status/{status}")
def status_filter(status: str = Path(..., pattern="^(Active|Inactive)$"), user=Depends(get_current_user)):
    _read_access(user)
    teachers = list_scoped("teachers", user, {"status": status})
    return {"total": len(teachers), "teachers": teachers}


@router.get("/page/")
def pagination(page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100), user=Depends(get_current_user)):
    _read_access(user)
    skip = (page - 1) * limit
    teachers = list_scoped("teachers", user, skip=skip, limit=limit)
    return {"page": page, "limit": limit, "total": count_scoped("teachers", user), "teachers": teachers}


@router.get("/{teacher_id}")
def get_single_teacher(teacher_id: str, user=Depends(get_current_user)):
    _read_access(user)
    teacher = get_scoped("teachers", user, "teacher_id", teacher_id.strip().upper())
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher Not Found")
    return teacher


@router.put("/{teacher_id}")
def edit_teacher(teacher_id: str, teacher: TeacherUpdate, user=Depends(admin_only)):
    result = update_teacher(teacher_id.strip().upper(), teacher)
    if result == "email_exists":
        raise HTTPException(status_code=400, detail="Email already exists")
    if result == 0:
        raise HTTPException(status_code=404, detail="Teacher Not Found or No Changes Made")
    return {"message": "Teacher Updated Successfully"}


@router.delete("/{teacher_id}")
def remove_teacher(teacher_id: str, user=Depends(admin_only)):
    deleted = delete_teacher(teacher_id.strip().upper())
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Teacher Not Found")
    return {"message": "Teacher Deleted Successfully"}
