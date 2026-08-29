from fastapi import APIRouter, Depends
from app.services.spark_service import get_students_department, get_attendance_summary, get_result_summary
from app.auth.dependencies import admin_or_analyst

router = APIRouter()


@router.get("/students-by-department")
def students_department(user=Depends(admin_or_analyst)):
    return get_students_department()


@router.get("/attendance-summary")
def attendance(user=Depends(admin_or_analyst)):
    return get_attendance_summary()


@router.get("/result-summary")
def results(user=Depends(admin_or_analyst)):
    return get_result_summary()
