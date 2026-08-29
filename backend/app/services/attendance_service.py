from app.database.connection import db
from app.models.attendance_model import create_attendance

attendance_collection = db["attendance"]


def attendance_exists(attendance_id: str):

    return attendance_collection.find_one(
        {
            "attendance_id": attendance_id
        }
    )


def add_attendance(attendance):

    if attendance_exists(attendance.attendance_id):
        return None

    new_attendance = create_attendance(attendance)

    result = attendance_collection.insert_one(new_attendance)

    new_attendance["_id"] = str(result.inserted_id)

    return new_attendance


def get_all_attendance():

    attendance = []

    for record in attendance_collection.find():

        record["_id"] = str(record["_id"])

        attendance.append(record)

    return attendance


def get_attendance(attendance_id: str):

    record = attendance_collection.find_one(
        {
            "attendance_id": attendance_id
        }
    )

    if record:

        record["_id"] = str(record["_id"])

    return record


def update_attendance(attendance_id: str, attendance):

    result = attendance_collection.update_one(
        {
            "attendance_id": attendance_id
        },
        {
            "$set": {

                "student_id": attendance.student_id,
                "course_id": attendance.course_id,
                "teacher_id": attendance.teacher_id,"attendance_date": attendance.attendance_date.isoformat(),
                "status": attendance.status,
                "remarks": attendance.remarks

            }
        }
    )

    return result.modified_count


def delete_attendance(attendance_id: str):

    result = attendance_collection.delete_one(
        {
            "attendance_id": attendance_id
        }
    )

    return result.deleted_count


def search_attendance(query: str):

    attendance = []

    results = attendance_collection.find({

        "$or": [

            {
                "attendance_id": {
                    "$regex": query,
                    "$options": "i"
                }
            },

            {
                "student_id": {
                    "$regex": query,
                    "$options": "i"
                }
            },

            {
                "course_id": {
                    "$regex": query,
                    "$options": "i"
                }
            },

            {
                "teacher_id": {
                    "$regex": query,
                    "$options": "i"
                }
            }

        ]
    })

    for record in results:

        record["_id"] = str(record["_id"])

        attendance.append(record)

    return attendance

def filter_by_student(student_id: str):

    attendance = []

    for record in attendance_collection.find(
        {
            "student_id": student_id
        }
    ):

        record["_id"] = str(record["_id"])

        attendance.append(record)

    return attendance

def filter_by_course(course_id: str):

    attendance = []

    for record in attendance_collection.find(
        {
            "course_id": course_id
        }
    ):

        record["_id"] = str(record["_id"])

        attendance.append(record)

    return attendance


def filter_by_status(status: str):

    attendance = []

    for record in attendance_collection.find(
        {
            "status": {
                "$regex": f"^{status}$",
                "$options": "i"
            }
        }
    ):

        record["_id"] = str(record["_id"])

        attendance.append(record)

    return attendance


def filter_by_date(attendance_date):

    attendance = []

    for record in attendance_collection.find(
        {
            "attendance_date": attendance_date
        }
    ):

        record["_id"] = str(record["_id"])

        attendance.append(record)

    return attendance

def get_attendance_paginated(page: int, limit: int):

    skip = (page - 1) * limit

    attendance = []

    cursor = attendance_collection.find().skip(skip).limit(limit)

    for record in cursor:

        record["_id"] = str(record["_id"])

        attendance.append(record)

    total = attendance_collection.count_documents({})

    return {

        "page": page,

        "limit": limit,

        "total": total,

        "attendance": attendance

    }
























