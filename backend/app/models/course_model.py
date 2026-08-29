from datetime import datetime


def create_course(course):

    return {

        "course_code": course.course_code,

        "course_name": course.course_name,

        "department": course.department,

        "semester": course.semester,

        "credit_hours": course.credit_hours,

        "teacher_name": course.teacher_name,

        "teacher_id": course.teacher_id,

        "course_type": course.course_type,

        "status": course.status,

        "created_at": datetime.utcnow()

    }