from fastapi import APIRouter, HTTPException, Depends, Query, Path
from app.schemas.course_schema import CourseCreate, CourseUpdate
from app.services.course_service import add_course, update_course, delete_course
from app.services.scoped_service import list_scoped, count_scoped, get_scoped
from app.auth.dependencies import get_current_user, admin_only

router = APIRouter()


def _read_access(user):
    if user["role"] not in {"Admin", "Teacher", "Student"}:
        raise HTTPException(status_code=403, detail="Access Denied")


@router.post("/")
def create_new_course(course: CourseCreate, user=Depends(admin_only)):
    created = add_course(course)
    if created is None:
        raise HTTPException(status_code=400, detail="Course Code Already Exists")
    return {"message": "Course Added Successfully", "course": created}


@router.get("/")
def get_courses(user=Depends(get_current_user)):
    _read_access(user)
    courses = list_scoped("courses", user)
    return {"total": len(courses), "courses": courses}


@router.get("/search/")
def search_course(query: str = Query(..., min_length=1, max_length=100), user=Depends(get_current_user)):
    _read_access(user)
    import re
    q = re.escape(query.strip())
    extra = {"$or": [
        {"course_code": {"$regex": q, "$options": "i"}},
        {"course_name": {"$regex": q, "$options": "i"}},
        {"department": {"$regex": q, "$options": "i"}},
        {"teacher_name": {"$regex": q, "$options": "i"}},
    ]}
    courses = list_scoped("courses", user, extra)
    return {"total": len(courses), "courses": courses}


@router.get("/filter/department/{department}")
def department_filter(department: str, user=Depends(get_current_user)):
    _read_access(user)
    courses = list_scoped("courses", user, {"department": department.strip()})
    return {"total": len(courses), "courses": courses}


@router.get("/filter/semester/{semester}")
def semester_filter(semester: int = Path(..., ge=1, le=8), user=Depends(get_current_user)):
    _read_access(user)
    courses = list_scoped("courses", user, {"semester": semester})
    return {"total": len(courses), "courses": courses}


@router.get("/filter/status/{status}")
def status_filter(status: str = Path(..., pattern="^(Active|Inactive)$"), user=Depends(get_current_user)):
    _read_access(user)
    courses = list_scoped("courses", user, {"status": status})
    return {"total": len(courses), "courses": courses}


@router.get("/page/")
def pagination(page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100), user=Depends(get_current_user)):
    _read_access(user)
    skip = (page - 1) * limit
    courses = list_scoped("courses", user, skip=skip, limit=limit)
    return {"page": page, "limit": limit, "total": count_scoped("courses", user), "courses": courses}


@router.get("/{course_code}")
def get_single_course(course_code: str, user=Depends(get_current_user)):
    _read_access(user)
    course = get_scoped("courses", user, "course_code", course_code.strip().upper())
    if not course:
        raise HTTPException(status_code=404, detail="Course Not Found")
    return course


@router.put("/{course_code}")
def edit_course(course_code: str, course: CourseUpdate, user=Depends(admin_only)):
    updated = update_course(course_code.strip().upper(), course)
    if updated == 0:
        raise HTTPException(status_code=404, detail="Course Not Found or No Changes Made")
    return {"message": "Course Updated Successfully"}


@router.delete("/{course_code}")
def remove_course(course_code: str, user=Depends(admin_only)):
    deleted = delete_course(course_code.strip().upper())
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Course Not Found")
    return {"message": "Course Deleted Successfully"}
