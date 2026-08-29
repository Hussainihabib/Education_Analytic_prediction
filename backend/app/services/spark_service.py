from fastapi import HTTPException

from app.spark.analytics import (
    students_by_department,
    attendance_summary,
    result_summary
)


def get_students_department():

    data = students_by_department()

    if not data:
        raise HTTPException(
            status_code=404,
            detail="No student data found."
        )

    return data


def get_attendance_summary():

    data = attendance_summary()

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Attendance data not found."
        )

    return data


def get_result_summary():

    data = result_summary()

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Result data not found."
        )

    return data