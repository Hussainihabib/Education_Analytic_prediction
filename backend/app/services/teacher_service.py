# from app.database.connection import db
# from app.models.teacher_model import create_teacher

# teacher_collection = db["teachers"]
# users_collection = db["users"]
# def teacher_exists(teacher_id: str):

#     return teacher_collection.find_one(
#         {
#             "teacher_id": teacher_id
#         }
#     )

# def email_exists(email: str):

#     return teacher_collection.find_one(
#         {
#             "email": email
#         }
#     )

# def add_teacher(teacher):

#     if teacher_exists(teacher.teacher_id):
#         return "teacher_exists"

#     if email_exists(teacher.email):
#         return "email_exists"

#     new_teacher = create_teacher(teacher)

#     result = teacher_collection.insert_one(new_teacher)

#     new_teacher["_id"] = str(result.inserted_id)

#     return new_teacher

# def get_all_teachers():

#     teachers = []

#     for teacher in teacher_collection.find():

#         teacher["_id"] = str(teacher["_id"])

#         teachers.append(teacher)

#     return teachers

# def get_teacher(teacher_id: str):

#     teacher = teacher_collection.find_one(
#         {
#             "teacher_id": teacher_id
#         }
#     )

#     if teacher:

#         teacher["_id"] = str(teacher["_id"])

#     return teacher

# def update_teacher(teacher_id: str, teacher):

#     result = teacher_collection.update_one(
#         {
#             "teacher_id": teacher_id
#         },
#         {
#             "$set": {

#                 "first_name": teacher.first_name,
#                 "last_name": teacher.last_name,
#                 "email": teacher.email,
#                 "gender": teacher.gender,
#                 "age": teacher.age,
#                 "department": teacher.department,
#                 "designation": teacher.designation,
#                 "qualification": teacher.qualification,
#                 "experience": teacher.experience,
#                 "phone": teacher.phone,
#                 "address": teacher.address,
#                 "status": teacher.status
#             }
#         }
#     )

#     return result.modified_count

# def delete_teacher(teacher_id: str):

#     result = teacher_collection.delete_one(
#         {
#             "teacher_id": teacher_id
#         }
#     )

#     return result.deleted_count

# def search_teachers(query: str):

#     teachers = []

#     results = teacher_collection.find({

#         "$or": [

#             {"teacher_id": {"$regex": query, "$options": "i"}},

#             {"first_name": {"$regex": query, "$options": "i"}},

#             {"last_name": {"$regex": query, "$options": "i"}},

#             {"email": {"$regex": query, "$options": "i"}},

#             {"department": {"$regex": query, "$options": "i"}},

#             {"designation": {"$regex": query, "$options": "i"}}

#         ]
#     })

#     for teacher in results:

#         teacher["_id"] = str(teacher["_id"])

#         teachers.append(teacher)

#     return teachers

# def filter_by_department(department: str):

#     teachers = []

#     for teacher in teacher_collection.find(
#         {
#             "department": department
#         }
#     ):

#         teacher["_id"] = str(teacher["_id"])

#         teachers.append(teacher)

#     return teachers

# def filter_by_designation(designation: str):

#     teachers = []

#     for teacher in teacher_collection.find(
#         {
#             "designation": designation
#         }
#     ):

#         teacher["_id"] = str(teacher["_id"])

#         teachers.append(teacher)

#     return teachers

# def filter_by_status(status: str):

#     teachers = []

#     for teacher in teacher_collection.find(
#         {
#             "status": {
#                 "$regex": f"^{status}$",
#                 "$options": "i"
#             }
#         }
#     ):

#         teacher["_id"] = str(teacher["_id"])

#         teachers.append(teacher)

#     return teachers


# def get_teachers_paginated(page: int, limit: int):

#     skip = (page - 1) * limit

#     teachers = []

#     cursor = teacher_collection.find().skip(skip).limit(limit)

#     for teacher in cursor:

#         teacher["_id"] = str(teacher["_id"])

#         teachers.append(teacher)

#     total = teacher_collection.count_documents({})

#     return {

#         "page": page,

#         "limit": limit,

#         "total": total,

#         "teachers": teachers

#     }





from app.database.connection import db
from app.models.teacher_model import create_teacher

# ============================================================
# TEACHER COLLECTION
# ============================================================

teacher_collection = db["teachers"]
users_collection = db["users"]

# ============================================================
# BASIC LOOKUPS
# ============================================================

def teacher_exists(teacher_id: str):
    """
    Check whether a teacher ID already exists.
    """

    return teacher_collection.find_one(
        {
            "teacher_id": teacher_id
        }
    )


def email_exists(email: str):
    """Check whether an email exists anywhere in the identity data."""
    email = str(email).strip().lower()
    return (
        teacher_collection.find_one({"email": email})
        or db["students"].find_one({"email": email})
        or users_collection.find_one({"email": email})
    )


def get_teacher_by_email(email: str):
    """
    Get teacher using the email from the
    logged-in user's JWT.

    This is important for role-based access.
    """

    return teacher_collection.find_one(
        {
            "email": email
        }
    )


# ============================================================
# ADD TEACHER
# ============================================================

def add_teacher(teacher):

    # Check duplicate teacher ID
    if teacher_exists(teacher.teacher_id):
        return "teacher_exists"

    # Check duplicate email
    if email_exists(teacher.email):
        return "email_exists"

    # Create teacher document
    new_teacher = create_teacher(teacher)

    # Insert into MongoDB
    result = teacher_collection.insert_one(new_teacher)

    # Convert MongoDB ObjectId to string
    new_teacher["_id"] = str(result.inserted_id)

    return new_teacher


# ============================================================
# GET ALL TEACHERS
# ============================================================

def get_all_teachers():

    teachers = []

    for teacher in teacher_collection.find():

        teacher["_id"] = str(teacher["_id"])

        teachers.append(teacher)

    return teachers


# ============================================================
# GET SINGLE TEACHER
# ============================================================

def get_teacher(teacher_id: str):

    teacher = teacher_collection.find_one(
        {
            "teacher_id": teacher_id
        }
    )

    if teacher:

        teacher["_id"] = str(teacher["_id"])

    return teacher


# ============================================================
# UPDATE TEACHER
# ============================================================

def update_teacher(teacher_id: str, teacher):

    # Find existing teacher
    existing_teacher = teacher_collection.find_one(
        {
            "teacher_id": teacher_id
        }
    )

    if not existing_teacher:
        return 0

    # Check whether another teacher already uses
    # the new email address
    email = str(teacher.email).strip().lower()
    another_teacher = (
        teacher_collection.find_one({"email": email, "teacher_id": {"$ne": teacher_id}})
        or db["students"].find_one({"email": email})
        or users_collection.find_one({"email": email, "teacher_id": {"$ne": teacher_id}})
    )

    if another_teacher:
        return "email_exists"

    result = teacher_collection.update_one(
        {
            "teacher_id": teacher_id
        },
        {
            "$set": {

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

                "status": teacher.status
            }
        }
    )

    users_collection.update_one(
        {"teacher_id": teacher_id},
        {"$set": {"email": teacher.email, "name": f"{teacher.first_name} {teacher.last_name}".strip()}}
    )

    return result.modified_count


# ============================================================
# DELETE TEACHER
# ============================================================

def delete_teacher(teacher_id: str):

    result = teacher_collection.delete_one(
        {
            "teacher_id": teacher_id
        }
    )

    return result.deleted_count


# ============================================================
# SEARCH TEACHERS
# ============================================================

def search_teachers(query: str):

    teachers = []

    results = teacher_collection.find(
        {
            "$or": [

                {
                    "teacher_id": {
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
                },

                {
                    "designation": {
                        "$regex": query,
                        "$options": "i"
                    }
                }
            ]
        }
    )

    for teacher in results:

        teacher["_id"] = str(teacher["_id"])

        teachers.append(teacher)

    return teachers


# ============================================================
# FILTER BY DEPARTMENT
# ============================================================

def filter_by_department(department: str):

    teachers = []

    for teacher in teacher_collection.find(
        {
            "department": department
        }
    ):

        teacher["_id"] = str(teacher["_id"])

        teachers.append(teacher)

    return teachers


# ============================================================
# FILTER BY DESIGNATION
# ============================================================

def filter_by_designation(designation: str):

    teachers = []

    for teacher in teacher_collection.find(
        {
            "designation": designation
        }
    ):

        teacher["_id"] = str(teacher["_id"])

        teachers.append(teacher)

    return teachers


# ============================================================
# FILTER BY STATUS
# ============================================================

def filter_by_status(status: str):

    teachers = []

    for teacher in teacher_collection.find(
        {
            "status": {
                "$regex": f"^{status}$",
                "$options": "i"
            }
        }
    ):

        teacher["_id"] = str(teacher["_id"])

        teachers.append(teacher)

    return teachers


# ============================================================
# PAGINATION
# ============================================================

def get_teachers_paginated(page: int, limit: int):

    # Safety validation
    if page < 1:
        page = 1

    if limit < 1:
        limit = 10

    if limit > 100:
        limit = 100

    skip = (page - 1) * limit

    teachers = []

    cursor = (
        teacher_collection
        .find()
        .skip(skip)
        .limit(limit)
    )

    for teacher in cursor:

        teacher["_id"] = str(teacher["_id"])

        teachers.append(teacher)

    total = teacher_collection.count_documents({})

    return {

        "page": page,

        "limit": limit,

        "total": total,

        "teachers": teachers

    }















