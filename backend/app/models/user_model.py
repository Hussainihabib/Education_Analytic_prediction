# from datetime import datetime


# def create_user(
#     name: str,
#     email: str,
#     password: str,
#     role: str
# ):
#     return {
#         "name": name,
#         "email": email,
#         "password": password,
#         "role": role,
#         "is_active": True,
#         "created_at": datetime.utcnow()

#     }   

from datetime import datetime


def create_user(
    name: str,
    email: str,
    password: str,
    role: str,
    teacher_id: str = None,
    student_id: str = None
):

    return {
        "name": name,
        "email": email,
        "password": password,
        "role": role,

        # Role-based identity
        "teacher_id": teacher_id,
        "student_id": student_id,

        "is_active": True,
        "created_at": datetime.utcnow()
    }








