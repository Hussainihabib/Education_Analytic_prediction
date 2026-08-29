# from app.database.connection import db
# from app.models.student_model import create_student

# student_collection = db["students"]


# def student_exists(student_id: str):

#     return student_collection.find_one(
#         {
#             "student_id": student_id
#         }
#     )


# def add_student(student):

#     if student_exists(student.student_id):

#         return None

#     new_student = create_student(student)

#     result = student_collection.insert_one(new_student)

#     new_student["_id"] = str(result.inserted_id)

#     return new_student


# def get_all_students():

#     students = []

#     for student in student_collection.find():

#         student["_id"] = str(student["_id"])

#         students.append(student)

#     return students

# def get_student(student_id: str):

#     student = student_collection.find_one(
#         {
#             "student_id": student_id
#         }
#     )

#     if student:

#         student["_id"] = str(student["_id"])

#     return student

# def update_student(student_id: str, student):

#     result = student_collection.update_one(
#         {"student_id": student_id},
#         {
#             "$set": {
#                 "first_name": student.first_name,
#                 "last_name": student.last_name,
#                 "email": student.email,
#                 "gender": student.gender,
#                 "age": student.age,
#                 "department": student.department,
#                 "semester": student.semester,
#                 "cgpa": student.cgpa,
#                 "attendance": student.attendance,
#                 "phone": student.phone,
#                 "address": student.address,
#                 "status": student.status
#             }
#         }
#     )

#     return result.modified_count

# def delete_student(student_id: str):

#     result = student_collection.delete_one(
#         {
#             "student_id": student_id
#         }
#     )

#     return result.deleted_count
# def search_students(query: str):

#     print("========== SEARCH API ==========")
#     print("Query:", query)

#     students = []

#     results = student_collection.find({
#         "$or": [
#             {"student_id": {"$regex": query, "$options": "i"}},
#             {"first_name": {"$regex": query, "$options": "i"}},
#             {"last_name": {"$regex": query, "$options": "i"}},
#             {"email": {"$regex": query, "$options": "i"}}
#         ]
#     })

#     for student in results:
#         print(student)   # <-- ye bhi add karo
#         student["_id"] = str(student["_id"])
#         students.append(student)

#     return students
# def filter_by_department(department: str):

#     students = []

#     for student in student_collection.find(
#         {
#             "department": department
#         }
#     ):
#         student["_id"] = str(student["_id"])
#         students.append(student)

#     return students


# def filter_by_semester(semester: int):

#     students = []

#     for student in student_collection.find(
#         {
#             "semester": semester
#         }
#     ):
#         student["_id"] = str(student["_id"])
#         students.append(student)

#     return students


# def filter_by_status(status: str):

#     students = []

#     for student in student_collection.find(
#         {
#             "status": status
#         }
#     ):
#         student["_id"] = str(student["_id"])
#         students.append(student)

#     return students



# def get_students_paginated(page: int, limit: int):

#     skip = (page - 1) * limit

#     students = []

#     cursor = student_collection.find().skip(skip).limit(limit)

#     for student in cursor:
#         student["_id"] = str(student["_id"])
#         students.append(student)

#     total_students = student_collection.count_documents({})

#     return {
#         "page": page,
#         "limit": limit,
#         "total": total_students,
#         "students": students
#     }

#     }


from app.database.connection import db
from app.models.student_model import create_student

student_collection = db["students"]
teacher_collection = db["teachers"]
users_collection = db["users"]


# ==========================================
# Validation Helpers
# ==========================================

def student_exists(student_id: str):

    return student_collection.find_one(
        {
            "student_id": student_id
        }
    )


def email_exists(email: str):
    email = str(email).strip().lower()
    return (
        student_collection.find_one({"email": email})
        or teacher_collection.find_one({"email": email})
        or users_collection.find_one({"email": email})
    )


def phone_exists(phone: str):

    if not phone:
        return None

    return student_collection.find_one(
        {
            "phone": phone
        }
    )


def teacher_exists(teacher_id: str):

    if not teacher_id:
        return True

    return teacher_collection.find_one(
        {
            "teacher_id": teacher_id
        }
    )


# ==========================================
# Create Student
# ==========================================

def add_student(student):

    # Duplicate Student ID
    if student_exists(student.student_id):
        return {
            "success": False,
            "message": "Student ID already exists."
        }

    # Duplicate Email
    if email_exists(student.email):
        return {
            "success": False,
            "message": "Email already exists."
        }

    # Duplicate Phone
    if student.phone:

        if phone_exists(student.phone):
            return {
                "success": False,
                "message": "Phone number already exists."
            }

    # Teacher Validation
    if student.teacher_id:

        if not teacher_exists(student.teacher_id):
            return {
                "success": False,
                "message": "Assigned Teacher does not exist."
            }

    new_student = create_student(student)

    result = student_collection.insert_one(
        new_student
    )

    new_student["_id"] = str(
        result.inserted_id
    )

    return {
        "success": True,
        "student": new_student
    }

# ==========================================
# Get All Students
# ==========================================

def get_all_students():

    students = []

    for student in student_collection.find():

        student["_id"] = str(student["_id"])

        students.append(student)

    return students


# ==========================================
# Get Student By Student ID
# ==========================================

def get_student(student_id: str):

    student = student_collection.find_one(
        {
            "student_id": student_id
        }
    )

    if student:
        student["_id"] = str(student["_id"])

    return student


# ==========================================
# Get Student By Email
# ==========================================

def get_student_by_email(email: str):

    student = student_collection.find_one(
        {
            "email": email
        }
    )

    if student:
        student["_id"] = str(student["_id"])

    return student


# ==========================================
# Get Students By Teacher
# ==========================================

def get_students_by_teacher(teacher_id: str):

    students = []

    cursor = student_collection.find(
        {
            "teacher_id": teacher_id
        }
    )

    for student in cursor:

        student["_id"] = str(student["_id"])

        students.append(student)

    return students


# ==========================================
# Update Student
# ==========================================

def update_student(student_id: str, student):

    old_student = student_collection.find_one(
        {
            "student_id": student_id
        }
    )

    if not old_student:
        return {
            "success": False,
            "message": "Student not found."
        }

    # Duplicate Email
    email = str(student.email).strip().lower()
    duplicate_email = (
        student_collection.find_one({"email": email, "student_id": {"$ne": student_id}})
        or teacher_collection.find_one({"email": email})
        or users_collection.find_one({"email": email, "student_id": {"$ne": student_id}})
    )

    if duplicate_email:
        return {"success": False, "message": "Email already exists."}

    # Duplicate Phone
    if student.phone:

        duplicate_phone = student_collection.find_one(
            {
                "phone": student.phone,
                "student_id": {
                    "$ne": student_id
                }
            }
        )

        if duplicate_phone:
            return {
                "success": False,
                "message": "Phone number already exists."
            }

    # Teacher Validation
    if student.teacher_id:

        if not teacher_exists(student.teacher_id):

            return {
                "success": False,
                "message": "Assigned Teacher does not exist."
            }

    result = student_collection.update_one(

        {
            "student_id": student_id
        },

        {
            "$set": {

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

                "status": student.status

            }
        }
    )

    if result.modified_count >= 0:
        users_collection.update_one(
            {"student_id": student_id},
            {"$set": {"email": student.email, "name": f"{student.first_name} {student.last_name}".strip()}}
        )

    return {
        "success": True,
        "modified": result.modified_count
    }

# ==========================================
# Delete Student
# ==========================================

def delete_student(student_id: str):

    result = student_collection.delete_one(
        {
            "student_id": student_id
        }
    )

    return result.deleted_count


# ==========================================
# Search Students
# ==========================================

def search_students(query: str):

    students = []

    results = student_collection.find(
        {
            "$or": [

                {
                    "student_id": {
                        "$regex": query,
                        "$options": "i"
                    }
                },

                {
                    "first_name": {
                        "$regex": query,
                        "$options": "i"
                    }
                },

                {
                    "last_name": {
                        "$regex": query,
                        "$options": "i"
                    }
                },

                {
                    "email": {
                        "$regex": query,
                        "$options": "i"
                    }
                },

                {
                    "department": {
                        "$regex": query,
                        "$options": "i"
                    }
                }

            ]
        }
    )

    for student in results:

        student["_id"] = str(student["_id"])

        students.append(student)

    return students


# ==========================================
# Filter By Department
# ==========================================

def filter_by_department(department: str):

    students = []

    cursor = student_collection.find(
        {
            "department": department
        }
    )

    for student in cursor:

        student["_id"] = str(student["_id"])

        students.append(student)

    return students


# ==========================================
# Filter By Semester
# ==========================================

def filter_by_semester(semester: int):

    students = []

    cursor = student_collection.find(
        {
            "semester": semester
        }
    )

    for student in cursor:

        student["_id"] = str(student["_id"])

        students.append(student)

    return students


# ==========================================
# Filter By Status
# ==========================================

def filter_by_status(status: str):

    students = []

    cursor = student_collection.find(
        {
            "status": status
        }
    )

    for student in cursor:

        student["_id"] = str(student["_id"])

        students.append(student)

    return students


# ==========================================
# Pagination
# ==========================================

def get_students_paginated(page: int, limit: int):

    skip = (page - 1) * limit

    students = []

    cursor = (
        student_collection
        .find()
        .skip(skip)
        .limit(limit)
    )

    for student in cursor:

        student["_id"] = str(student["_id"])

        students.append(student)

    total = student_collection.count_documents({})

    return {

        "page": page,

        "limit": limit,

        "total": total,

        "students": students

    }


# ==========================================
# Dashboard Helpers
# ==========================================

def total_students():

    return student_collection.count_documents({})


def total_active_students():

    return student_collection.count_documents(
        {
            "status": "Active"
        }
    )


def total_inactive_students():

    return student_collection.count_documents(
        {
            "status": "Inactive"
        }
    )


def total_students_by_teacher(teacher_id: str):

    return student_collection.count_documents(
        {
            "teacher_id": teacher_id
        }
    )


def department_statistics():

    pipeline = [

        {
            "$group": {

                "_id": "$department",

                "total": {
                    "$sum": 1
                }

            }
        }

    ]

    return list(student_collection.aggregate(pipeline))





