from datetime import datetime


def create_teacher(teacher):

    return {

        "teacher_id": teacher.teacher_id,

        "first_name": teacher.first_name,

        "last_name": teacher.last_name,

        "email": teacher.email,

        "gender": teacher.gender,

        "age": teacher.age,

        "department": teacher.department,

        "designation": teacher.designation,

        "qualification": teacher.qualification,

        "experience": teacher.experience,

        "phone": teacher.phone,

        "address": teacher.address,

        "status": teacher.status,

        "created_at": datetime.utcnow()

    }