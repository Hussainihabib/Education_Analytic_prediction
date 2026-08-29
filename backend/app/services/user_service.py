from app.database.connection import db
from app.models.user_model import create_user
from app.auth.hash import hash_password

users_collection = db["users"]
teacher_collection = db["teachers"]
student_collection = db["students"]


def get_user_by_email(email: str):
    return users_collection.find_one({"email": email.strip().lower()})


def get_user_by_teacher_id(teacher_id: str):
    return users_collection.find_one({"teacher_id": teacher_id})


def get_user_by_student_id(student_id: str):
    return users_collection.find_one({"student_id": student_id})


def create_new_user(user):
    email = user.email.strip().lower()

    if get_user_by_email(email):
        return "email_exists"

    if user.role == "Teacher":
        teacher = teacher_collection.find_one({"teacher_id": user.teacher_id})
        if not teacher:
            return "teacher_not_found"
        if teacher.get("email", "").lower() != email:
            return "teacher_email_mismatch"
        if get_user_by_teacher_id(user.teacher_id):
            return "teacher_id_exists"

    if user.role == "Student":
        student = student_collection.find_one({"student_id": user.student_id})
        if not student:
            return "student_not_found"
        if student.get("email", "").lower() != email:
            return "student_email_mismatch"
        if get_user_by_student_id(user.student_id):
            return "student_id_exists"

    new_user = create_user(
        name=user.name,
        email=email,
        password=hash_password(user.password),
        role=user.role,
        teacher_id=user.teacher_id,
        student_id=user.student_id
    )
    result = users_collection.insert_one(new_user)
    new_user["_id"] = str(result.inserted_id)
    return new_user


def login_user(email: str):
    return get_user_by_email(email)
