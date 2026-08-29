from app.database.connection import db
from app.models.result_model import (
    create_result,
    calculate_percentage,
    calculate_grade,
    calculate_status
)

result_collection = db["results"]


def result_exists(result_id: str):

    return result_collection.find_one(
        {
            "result_id": result_id
        }
    )


def add_result(result):

    if result_exists(result.result_id):
        return None

    new_result = create_result(result)

    inserted = result_collection.insert_one(new_result)

    new_result["_id"] = str(inserted.inserted_id)

    return new_result


def get_all_results():

    results = []

    for result in result_collection.find():

        result["_id"] = str(result["_id"])

        results.append(result)

    return results


def get_result(result_id: str):

    result = result_collection.find_one(
        {
            "result_id": result_id
        }
    )

    if result:

        result["_id"] = str(result["_id"])

    return result


def update_result(result_id: str, result):

    percentage = calculate_percentage(
        result.marks_obtained,
        result.total_marks
    )

    grade = calculate_grade(percentage)

    status = calculate_status(percentage)

    updated = result_collection.update_one(
        {
            "result_id": result_id
        },
        {
            "$set": {

                "student_id": result.student_id,

                "course_id": result.course_id,

                "teacher_id": result.teacher_id,

                "marks_obtained": result.marks_obtained,

                "total_marks": result.total_marks,

                "percentage": percentage,

                "grade": grade,

                "status": status,

                "semester": result.semester,

                "exam_type": result.exam_type,

                "remarks": result.remarks
            }
        }
    )

    return updated.modified_count


def delete_result(result_id: str):

    deleted = result_collection.delete_one(
        {
            "result_id": result_id
        }
    )

    return deleted.deleted_count


def search_results(query: str):

    results = []

    data = result_collection.find({

        "$or": [

            {"result_id": {"$regex": query, "$options": "i"}},

            {"student_id": {"$regex": query, "$options": "i"}},

            {"course_id": {"$regex": query, "$options": "i"}},

            {"teacher_id": {"$regex": query, "$options": "i"}}

        ]

    })

    for result in data:

        result["_id"] = str(result["_id"])

        results.append(result)

    return results



def filter_by_status(status: str):

    results = []

    data = result_collection.find({

        "status": {

            "$regex": f"^{status}$",

            "$options": "i"

        }

    })

    for result in data:

        result["_id"] = str(result["_id"])

        results.append(result)

    return results


def filter_by_semester(semester: int):

    results = []

    data = result_collection.find({

        "semester": semester

    })

    for result in data:

        result["_id"] = str(result["_id"])

        results.append(result)

    return results


def filter_by_exam(exam_type: str):

    results = []

    data = result_collection.find({

        "exam_type": {

            "$regex": f"^{exam_type}$",

            "$options": "i"

        }

    })

    for result in data:

        result["_id"] = str(result["_id"])

        results.append(result)

    return results




def get_results_paginated(page: int, limit: int):

    skip = (page - 1) * limit

    results = []

    cursor = result_collection.find().skip(skip).limit(limit)

    for result in cursor:

        result["_id"] = str(result["_id"])

        results.append(result)

    total = result_collection.count_documents({})

    return {

        "page": page,

        "limit": limit,

        "total": total,

        "results": results

    }








