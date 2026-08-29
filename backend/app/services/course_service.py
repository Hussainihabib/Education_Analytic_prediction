from app.database.connection import db
from app.models.course_model import create_course

course_collection = db["courses"]


def course_exists(course_code: str):

    return course_collection.find_one(
        {
            "course_code": course_code
        }
    )


def add_course(course):

    if course_exists(course.course_code):
        return None

    new_course = create_course(course)

    result = course_collection.insert_one(new_course)

    new_course["_id"] = str(result.inserted_id)

    return new_course


def get_all_courses():

    courses = []

    for course in course_collection.find():

        course["_id"] = str(course["_id"])

        courses.append(course)

    return courses


def get_course(course_code: str):

    course = course_collection.find_one(
        {
            "course_code": course_code
        }
    )

    if course:
        course["_id"] = str(course["_id"])

    return course


def update_course(course_code: str, course):

    result = course_collection.update_one(
        {
            "course_code": course_code
        },
        {
            "$set": {
                "course_name": course.course_name,
                "department": course.department,
                "semester": course.semester,
                "credit_hours": course.credit_hours,
                "teacher_name": course.teacher_name,
                "teacher_id": course.teacher_id,
                "course_type": course.course_type,
                "status": course.status
            }
        }
    )

    return result.modified_count


def delete_course(course_code: str):

    result = course_collection.delete_one(
        {
            "course_code": course_code
        }
    )

    return result.deleted_count


def search_courses(query: str):

    courses = []

    results = course_collection.find({
        "$or": [
            {"course_code": {"$regex": query, "$options": "i"}},
            {"course_name": {"$regex": query, "$options": "i"}},
            {"department": {"$regex": query, "$options": "i"}},
            {"teacher_name": {"$regex": query, "$options": "i"}}
        ]
    })

    for course in results:
        course["_id"] = str(course["_id"])
        courses.append(course)

    return courses


def filter_by_department(department: str):

    courses=[]

    for course in course_collection.find(
        {"department": department}
    ):

        course["_id"]=str(course["_id"])

        courses.append(course)

    return courses


def filter_by_semester(semester: int):

    courses=[]

    for course in course_collection.find(
        {"semester": semester}
    ):

        course["_id"]=str(course["_id"])

        courses.append(course)

    return courses


def filter_by_status(status: str):

    courses=[]

    for course in course_collection.find(
        {
            "status":{
                "$regex":f"^{status}$",
                "$options":"i"
            }
        }
    ):

        course["_id"]=str(course["_id"])

        courses.append(course)

    return courses

def get_courses_paginated(page:int,limit:int):

    skip=(page-1)*limit

    courses=[]

    cursor=course_collection.find().skip(skip).limit(limit)

    for course in cursor:

        course["_id"]=str(course["_id"])

        courses.append(course)

    total=course_collection.count_documents({})

    return{

        "page":page,

        "limit":limit,

        "total":total,

        "courses":courses

    }