from fastapi import APIRouter, Depends, Query
from app.auth.dependencies import get_current_user
from app.services.role_dashboard_service import (
    stats, students_by_department, students_by_semester, attendance_summary,
    average_cgpa, average_attendance, result_summary, grade_distribution,
    department_performance, top_students, monthly_attendance, course_performance,
    teacher_performance, at_risk_students, department_pass_rate,
    performance_trend, get_departments, get_semesters, admin_filter, full_dashboard
)

router = APIRouter()


def u(user=Depends(get_current_user)): return user


@router.get("/stats")
def dashboard_stats(user=Depends(get_current_user)): return stats(user)

@router.get("/students-by-department")
def students_department(user=Depends(get_current_user)): return students_by_department(user)

@router.get("/students-by-semester")
def semester_stats(user=Depends(get_current_user)): return students_by_semester(user)

@router.get("/attendance-summary")
def attendance_stats(user=Depends(get_current_user)): return attendance_summary(user)

@router.get("/average-cgpa")
def cgpa_average(user=Depends(get_current_user)): return average_cgpa(user)

@router.get("/average-attendance")
def attendance_average(user=Depends(get_current_user)): return average_attendance(user)

@router.get("/result-summary")
def results_stats(user=Depends(get_current_user)): return result_summary(user)

@router.get("/admin")
def admin_dashboard_api(user=Depends(get_current_user)): return full_dashboard(user)

@router.get("/grade-distribution")
def grade_distribution_api(user=Depends(get_current_user)): return {"grades": grade_distribution(user)}

@router.get("/department-performance")
def department_performance_api(user=Depends(get_current_user)): return {"departments": department_performance(user)}

@router.get("/top-students")
def top_students_api(user=Depends(get_current_user)): return {"students": top_students(user)}

@router.get("/monthly-attendance")
def monthly_attendance_api(user=Depends(get_current_user)): return {"attendance": monthly_attendance(user)}

@router.get("/course-performance")
def course_performance_api(user=Depends(get_current_user)): return {"courses": course_performance(user)}

@router.get("/teacher-performance")
def teacher_performance_api(user=Depends(get_current_user)): return {"teachers": teacher_performance(user)}

@router.get("/at-risk-students")
def at_risk_students_api(user=Depends(get_current_user)): return {"students": at_risk_students(user)}

@router.get("/department-pass-rate")
def department_pass_rate_api(user=Depends(get_current_user)): return {"departments": department_pass_rate(user)}

@router.get("/performance-trend")
def performance_trend_api(user=Depends(get_current_user)): return {"trend": performance_trend(user)}

@router.get("/departments")
def departments_api(user=Depends(get_current_user)): return {"departments": get_departments(user)}

@router.get("/semesters")
def semesters_api(user=Depends(get_current_user)): return {"semesters": get_semesters(user)}

@router.get("/admin-filter")
def admin_dashboard_filter_api(
    department: str | None = Query(None, max_length=100),
    semester: int | None = Query(None, ge=1, le=8),
    status: str | None = Query(None, pattern="^(Active|Inactive)$"),
    user=Depends(get_current_user)
):
    return admin_filter(user, department, semester, status)
