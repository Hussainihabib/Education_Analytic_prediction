# from faker import Faker
# from random import choice, randint
# from app.database.connection import db

# fake = Faker()

# course_collection = db["courses"]
# teacher_collection = db["teachers"]
# department_collection = db["departments"]

# TOTAL_COURSES = 1000

# teachers = list(
#     teacher_collection.find(
#         {},
#         {
#             "teacher_id": 1,
#             "department": 1
#         }
#     )
# )

# departments = list(
#     department_collection.find(
#         {},
#         {
#             "department_id": 1,
#             "department_name": 1
#         }
#     )
# )

# course_collection.delete_many({})

# course_names = [
#     "Programming Fundamentals",
#     "Object Oriented Programming",
#     "Database Systems",
#     "Data Structures",
#     "Algorithms",
#     "Operating Systems",
#     "Computer Networks",
#     "Software Engineering",
#     "Artificial Intelligence",
#     "Machine Learning",
#     "Deep Learning",
#     "Data Mining",
#     "Cloud Computing",
#     "Big Data Analytics",
#     "Cyber Security",
#     "Web Development",
#     "Mobile Application Development",
#     "Computer Vision",
#     "Natural Language Processing",
#     "Internet of Things"
# ]

# courses = []

# for i in range(1, TOTAL_COURSES + 1):

#     department = choice(departments)

#     teacher = choice(
#         [
#             t for t in teachers
#             if t["department"] == department["department_name"]
#         ]

#     )

#     course = {

#         "course_id": f"C{i:05}",

#         "course_name": choice(course_names),

#         "course_code": f"CS-{1000 + i}",

#         "department_id": department["department_id"],

#         "department": department["department_name"],

#         "teacher_id": teacher["teacher_id"],

#         "credit_hours": randint(2, 4),

#         "semester": randint(1, 8),

#         "description": fake.sentence(),

#         "status": choice([
#             "Active",
#             "Active",
#             "Active",
#             "Inactive"
#         ]),

#         "created_at": fake.date_time_this_decade()

#     }

#     courses.append(course)

#     if len(courses) == 500:

#         course_collection.insert_many(courses)

#         courses = []
# if courses:

#     course_collection.insert_many(courses)

# print(f"{TOTAL_COURSES} Courses Generated Successfully")


from faker import Faker
from random import choice, randint
from app.database.connection import db

fake = Faker()

course_collection = db["courses"]
teacher_collection = db["teachers"]
department_collection = db["departments"]

TOTAL_COURSES = 150

teachers = list(
    teacher_collection.find(
        {},
        {
            "teacher_id": 1,
            "department": 1
        }
    )
)

departments = list(
    department_collection.find(
        {},
        {
            "department_id": 1,
            "department_name": 1
        }
    )
)

course_collection.delete_many({})

course_names = [
    "Programming Fundamentals",
    "Object Oriented Programming",
    "Database Systems",
    "Data Structures",
    "Algorithms",
    "Operating Systems",
    "Computer Networks",
    "Software Engineering",
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Data Mining",
    "Cloud Computing",
    "Big Data Analytics",
    "Cyber Security",
    "Web Development",
    "Mobile Application Development",
    "Computer Vision",
    "Natural Language Processing",
    "Internet of Things"
]

courses = []

# ==========================================
# Ensure every department gets at least one course
# ==========================================

course_number = 1

for department in departments:

    dept_teachers = [
        t for t in teachers
        if t["department"] == department["department_name"]
    ]

    if not dept_teachers:
        continue

    teacher = choice(dept_teachers)

    course = {

        "course_id": f"C{course_number:05}",

        "course_name": choice(course_names),

        "course_code": f"CS-{1000 + course_number}",

        "department_id": department["department_id"],

        "department": department["department_name"],

        "teacher_id": teacher["teacher_id"],

        "credit_hours": randint(2, 4),

        "semester": randint(1, 8),

        "description": fake.sentence(),

        "status": choice([
            "Active",
            "Active",
            "Active",
            "Inactive"
        ]),

        "created_at": fake.date_time_this_decade()

    }

    courses.append(course)

    course_number += 1

# ==========================================
# Generate remaining random courses
# ==========================================

while course_number <= TOTAL_COURSES:

    department = choice(departments)

    dept_teachers = [
        t for t in teachers
        if t["department"] == department["department_name"]
    ]

    if not dept_teachers:
        continue

    teacher = choice(dept_teachers)

    course = {

        "course_id": f"C{course_number:05}",

        "course_name": choice(course_names),

        "course_code": f"CS-{1000 + course_number}",

        "department_id": department["department_id"],

        "department": department["department_name"],

        "teacher_id": teacher["teacher_id"],

        "credit_hours": randint(2, 4),

        "semester": randint(1, 8),

        "description": fake.sentence(),

        "status": choice([
            "Active",
            "Active",
            "Active",
            "Inactive"
        ]),

        "created_at": fake.date_time_this_decade()

    }

    courses.append(course)

    course_number += 1

    if len(courses) >= 500:

        course_collection.insert_many(courses)

        courses = []

if courses:

    course_collection.insert_many(courses)

print("----------------------------------")
print(f"{TOTAL_COURSES} Courses Generated Successfully")
print("----------------------------------")






