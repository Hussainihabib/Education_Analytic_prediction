from app.database.connection import db

student_collection = db["students"]
teacher_collection = db["teachers"]
course_collection = db["courses"]
attendance_collection = db["attendance"]
result_collection = db["results"]


def get_dashboard_stats():

    return {

        "total_students":
            student_collection.count_documents({}),

        "active_students":
            student_collection.count_documents(
                {"status": "Active"}
            ),

        "inactive_students":
            student_collection.count_documents(
                {"status": "Inactive"}
            ),

        "total_teachers":
            teacher_collection.count_documents({}),

        "active_teachers":
            teacher_collection.count_documents(
                {"status": "Active"}
            ),

        "inactive_teachers":
            teacher_collection.count_documents(
                {"status": "Inactive"}
            ),

        "total_courses":
            course_collection.count_documents({}),

        "total_attendance":
            attendance_collection.count_documents({}),

        "total_results":
            result_collection.count_documents({})
    }
    
def students_by_department():

    data = []

    results = student_collection.aggregate([

        {
            "$group": {

                "_id": "$department",

                "count": {
                    "$sum": 1
                }

            }

        },

        {
            "$sort": {
                "_id": 1
            }
        }

    ])

    for item in results:

        data.append({

            "department": item["_id"],

            "count": item["count"]

        })

    return data        

def students_by_semester():

    data = []

    results = student_collection.aggregate([

        {
            "$group": {
                "_id": "$semester",
                "count": {
                    "$sum": 1
                }
            }
        },

        {
            "$sort": {
                "_id": 1
            }
        }

    ])

    for item in results:

        data.append({

            "semester": item["_id"],

            "count": item["count"]

        })

    return data



def attendance_summary():

    data = []

    results = attendance_collection.aggregate([

        {
            "$group": {
                "_id": "$status",
                "count": {
                    "$sum": 1
                }
            }
        },

        {
            "$sort": {
                "_id": 1
            }
        }

    ])

    for item in results:

        data.append({

            "status": item["_id"],

            "count": item["count"]

        })

    return data


def average_cgpa():

    result = list(

        student_collection.aggregate([

            {
                "$group": {

                    "_id": None,

                    "average": {
                        "$avg": "$cgpa"
                    }

                }

            }

        ])

    )

    if not result:

        return {
            "average_cgpa": 0
        }

    return {

        "average_cgpa": round(
            result[0]["average"],
            2
        )

    }
    
def average_attendance():

    result = list(

        student_collection.aggregate([

            {
                "$group": {

                    "_id": None,

                    "average": {
                        "$avg": "$attendance"
                    }

                }

            }

        ])

    )

    if not result:

        return {
            "average_attendance": 0
        }

    return {

        "average_attendance": round(
            result[0]["average"],
            2
        )

    }  
def result_summary():

    data = {}

    results = result_collection.aggregate([

        {
            "$group": {
                "_id": "$status",
                "count": {
                    "$sum": 1
                }
            }
        }

    ])

    for item in results:

        data[item["_id"]] = item["count"]

    return data

from datetime import datetime

def admin_dashboard():

    stats = get_dashboard_stats()

    attendance = average_attendance()

    cgpa = average_cgpa()

    departments = students_by_department()

    semesters = students_by_semester()

    attendance_status = attendance_summary()

    results = result_summary()

    high_risk = []

    students = student_collection.find(
        {},
        {
            "_id": 0,
            "student_id": 1,
            "first_name": 1,
            "last_name": 1,
            "department": 1,
            "attendance": 1,
            "cgpa": 1,
        }
    )

    for student in students:

        risk = "Low"

        if student["attendance"] < 75 or student["cgpa"] < 2.5:
            risk = "High"

        elif student["attendance"] < 85 or student["cgpa"] < 3:
            risk = "Medium"

        if risk == "High":

            high_risk.append({

                "id": student["student_id"],

                "name": f'{student["first_name"]} {student["last_name"]}',

                "department": student["department"],

                "attendance": student["attendance"],

                "cgpa": student["cgpa"],

                "risk": risk

            })

    dashboard = {

        **stats,

        **attendance,

        **cgpa,

        "students_by_department": departments,

        "students_by_semester": semesters,

        "attendance_summary": attendance_status,

        "result_summary": results,

        "high_risk_students": high_risk,

        "last_updated": datetime.now()

    }

    return dashboard



def grade_distribution():

    pipeline = [
        {
            "$group": {
                "_id": "$grade",
                "count": {
                    "$sum": 1
                }
            }
        },
        {
            "$sort": {
                "_id": 1
            }
        }
    ]

    data = list(result_collection.aggregate(pipeline))

    grades = ["A+", "A", "B+", "B", "C", "F"]

    result = []

    for grade in grades:

        total = 0

        for row in data:
            if row["_id"] == grade:
                total = row["count"]
                break

        result.append({
            "grade": grade,
            "count": total
        })

    return result




def department_performance():

    pipeline = [

        {
            "$group": {

                "_id": "$department",

                "average_cgpa": {
                    "$avg": "$cgpa"
                },

                "student_count": {
                    "$sum": 1
                }

            }

        },

        {
            "$sort": {
                "average_cgpa": -1
            }

        },

        {
            "$limit": 10
        }

    ]

    departments = []

    results = student_collection.aggregate(pipeline)

    rank = 1

    for item in results:

        departments.append({

            "rank": rank,

            "department": item["_id"],

            "average_cgpa": round(
                item["average_cgpa"],
                2
            ),

            "students": item["student_count"]

        })

        rank += 1

    return departments
def top_students():

    students = []

    results = student_collection.find(
        {},
        {
            "_id": 0,
            "student_id": 1,
            "first_name": 1,
            "last_name": 1,
            "department": 1,
            "semester": 1,
            "cgpa": 1,
            "attendance": 1
        }
    ).sort(
        "cgpa",
        -1
    ).limit(10)

    rank = 1

    for student in results:

        students.append({

            "rank": rank,

            "student_id": student["student_id"],

            "name": f'{student["first_name"]} {student["last_name"]}',

            "department": student["department"],

            "semester": student["semester"],

            "cgpa": student["cgpa"],

            "attendance": student["attendance"]

        })

        rank += 1

    return students



def monthly_attendance():

    pipeline = [

        {
            "$project": {

                "month": {
                    "$substr": [
                        "$attendance_date",
                        5,
                        2
                    ]
                }

            }

        },

        {

            "$group": {

                "_id": "$month",

                "count": {
                    "$sum": 1
                }

            }

        },

        {

            "$sort": {
                "_id": 1
            }

        }

    ]

    months = {

        "01": "Jan",
        "02": "Feb",
        "03": "Mar",
        "04": "Apr",
        "05": "May",
        "06": "Jun",
        "07": "Jul",
        "08": "Aug",
        "09": "Sep",
        "10": "Oct",
        "11": "Nov",
        "12": "Dec"

    }

    attendance = []

    for item in attendance_collection.aggregate(pipeline):

        attendance.append({

            "month": months.get(item["_id"], item["_id"]),

            "count": item["count"]

        })

    return attendance
def course_performance():

    pipeline = [

        {
            "$group": {

                "_id": "$course_id",

                "average_marks": {
                    "$avg": "$marks_obtained"
                },

                "pass": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$status",
                                    "Pass"
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },

                "fail": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$status",
                                    "Fail"
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },

                "students": {
                    "$sum": 1
                }

            }

        },

        {
            "$sort": {
                "average_marks": -1
            }
        }

    ]

    courses = []

    results = result_collection.aggregate(pipeline)

    for item in results:

        courses.append({

            "course_id": item["_id"],

            "average_marks": round(
                item.get("average_marks", 0) or 0,
                2
            ),

            "pass": item.get("pass", 0),

            "fail": item.get("fail", 0),

            "students": item.get("students", 0)

        })

    return courses

def teacher_performance():

    pipeline = [

        {
            "$lookup": {

                "from": "courses",

                "localField": "teacher_id",

                "foreignField": "teacher_id",

                "as": "courses"

            }

        },

        {
            "$project": {

                "_id": 0,

                "teacher_id": 1,

                "teacher_name": {
                    "$concat": [
                        "$first_name",
                        " ",
                        "$last_name"
                    ]
                },

                "department": 1,

                "status": 1,

                "total_courses": {
                    "$size": "$courses"
                }

            }

        },

        {
            "$sort": {

                "total_courses": -1

            }

        },

        {
            "$limit": 20
        }

    ]

    teachers = []

    results = teacher_collection.aggregate(pipeline)

    rank = 1

    for item in results:

        teachers.append({

            "rank": rank,

            "teacher_id": item["teacher_id"],

            "teacher_name": item["teacher_name"],

            "department": item["department"],

            "status": item["status"],

            "total_courses": item["total_courses"]

        })

        rank += 1

    return teachers

def at_risk_students():

    students = []

    results = student_collection.find(
        {},
        {
            "_id": 0,
            "student_id": 1,
            "first_name": 1,
            "last_name": 1,
            "department": 1,
            "semester": 1,
            "attendance": 1,
            "cgpa": 1
        }
    )

    for student in results:

        risk = "Low"

        if student["attendance"] < 75 or student["cgpa"] < 2.5:
            risk = "High"

        elif student["attendance"] < 85 or student["cgpa"] < 3.0:
            risk = "Medium"

        if risk != "Low":

            students.append({

                "student_id": student["student_id"],

                "name": f'{student["first_name"]} {student["last_name"]}',

                "department": student["department"],

                "semester": student["semester"],

                "attendance": student["attendance"],

                "cgpa": student["cgpa"],

                "risk": risk

            })

    students.sort(
        key=lambda x: (
            x["risk"] != "High",
            x["cgpa"],
            x["attendance"]
        )
    )

    return students[:50]
def department_pass_rate():

    pipeline = [

        {
            "$lookup": {
                "from": "students",
                "localField": "student_id",
                "foreignField": "student_id",
                "pipeline": [
                    {
                        "$project": {
                            "_id": 0,
                            "department": 1
                        }
                    }
                ],
                "as": "student"
            }
        },

        {
            "$unwind": "$student"
        },

        {
            "$group": {

                "_id": "$student.department",

                "pass": {
                    "$sum": {
                        "$cond": [
                            {"$eq": ["$status", "Pass"]},
                            1,
                            0
                        ]
                    }
                },

                "total": {
                    "$sum": 1
                }

            }

        },

        {
            "$project": {

                "_id": 0,

                "department": "$_id",

                "pass": 1,

                "fail": {
                    "$subtract": [
                        "$total",
                        "$pass"
                    ]
                },

                "pass_rate": {
                    "$round": [
                        {
                            "$multiply": [
                                {
                                    "$divide": [
                                        "$pass",
                                        "$total"
                                    ]
                                },
                                100
                            ]
                        },
                        2
                    ]
                }

            }

        },

        {
            "$sort": {
                "department": 1
            }
        }

    ]

    return list(
        result_collection.aggregate(
            pipeline,
            allowDiskUse=True
        )
    )
def performance_trend():

    pipeline = [

        {
            "$group": {

                "_id": "$semester",

                "average_marks": {

                    "$avg": "$marks_obtained"

                },

                "average_percentage": {

                    "$avg": "$percentage"

                },

                "students": {

                    "$sum": 1

                }

            }

        },

        {
            "$sort": {

                "_id": 1

            }

        }

    ]

    trend = []

    results = result_collection.aggregate(pipeline)

    for item in results:

        trend.append({

            "semester": item["_id"],

            "average_marks": round(
                item["average_marks"] or 0,
                2
            ),

            "average_percentage": round(
                item["average_percentage"] or 0,
                2
            ),

            "students": item["students"]

        })

    return trend


def get_departments():

    departments = student_collection.distinct("department")

    departments = sorted(
        [d for d in departments if d]
    )

    return departments


def get_semesters():

    semesters = student_collection.distinct("semester")

    semesters = sorted(
        [s for s in semesters if s is not None]
    )

    return semesters
def admin_dashboard_filter_service(
    department=None,
    semester=None,
    status=None
):
    query = {}

    if department:
        query["department"] = department

    if semester:
        query["semester"] = semester

    if status:
        query["status"] = status

    students = list(student_collection.find(
        query,
        {
            "_id": 0,
            "student_id": 1,
            "first_name": 1,
            "last_name": 1,
            "department": 1,
            "semester": 1,
            "attendance": 1,
            "cgpa": 1,
            "status": 1
        }
    ))

    total_students = len(students)

    if total_students == 0:
        return {
            "total_students": 0,
            "average_cgpa": 0,
            "average_attendance": 0,
            "students": []
        }

    average_cgpa = round(
        sum(s.get("cgpa", 0) for s in students) / total_students,
        2
    )

    average_attendance = round(
        sum(s.get("attendance", 0) for s in students) / total_students,
        2
    )

    return {
        "total_students": total_students,
        "average_cgpa": average_cgpa,
        "average_attendance": average_attendance,
        "students": students
    }





