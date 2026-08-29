from datetime import datetime


def create_student(student):

    return {

        "student_id": student.student_id,

        "first_name": student.first_name,

        "last_name": student.last_name,

        "email": student.email,

        "gender": student.gender,

        "age": student.age,

        "department": student.department,

        "semester": student.semester,

        "cgpa": student.cgpa,

        "attendance": student.attendance,

        "phone": student.phone,

        "address": student.address,
        "teacher_id": student.teacher_id,
        "status": "Active",

        "created_at": datetime.utcnow()

    }  