from datetime import datetime


def create_attendance(attendance):

    return {

        "attendance_id": attendance.attendance_id,

        "student_id": attendance.student_id,

        "course_id": attendance.course_id,

        "teacher_id": attendance.teacher_id,

     "attendance_date": attendance.attendance_date.isoformat(),
        "status": attendance.status,

        "remarks": attendance.remarks,

        "created_at": datetime.utcnow()
    }