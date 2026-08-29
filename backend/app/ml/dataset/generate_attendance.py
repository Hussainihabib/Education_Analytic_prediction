from faker import Faker
from random import choice, randint
from datetime import datetime, timedelta

from app.database.connection import db

fake = Faker()

attendance_collection = db["attendance"]
student_collection = db["students"]
course_collection = db["courses"]

TOTAL_RECORDS = 50000

students = list(
    student_collection.find(
        {},
        {
            "student_id": 1,
            "department": 1
        }
    )
)

courses = list(
    course_collection.find(
        {},
        {
            "course_id": 1,
            "teacher_id": 1,
            "department": 1
        }
    )
)

attendance_collection.delete_many({})

statuses = [
    "Present",
    "Present",
    "Present",
    "Present",
    "Late",
    "Absent"
]

attendance = []

start_date = datetime(2025, 1, 1)

for i in range(1, TOTAL_RECORDS + 1):

    student = choice(students)

    course = choice(
        [
            c for c in courses
            if c["department"] == student["department"]
        ]
    )

    attendance_date = start_date + timedelta(
        days=randint(0, 365)

    )


    record = {

        "attendance_id": f"AT{i:07}",

        "student_id": student["student_id"],

        "course_id": course["course_id"],

        "teacher_id": course["teacher_id"],

        "attendance_date": attendance_date.isoformat(),

        "status": choice(statuses),

        "remarks": choice([
            "",
            "",
            "",
            "Medical Leave",
            "Late Arrival",
            "Absent Without Notice"
        ]),

        "created_at": fake.date_time_this_decade()

    }

    attendance.append(record)

    if len(attendance) == 1000:

        attendance_collection.insert_many(attendance)

        attendance = []

        print(f"{i} Attendance Records Generated...")



if attendance:

    attendance_collection.insert_many(attendance)

print("\n-----------------------------------")
print(f"{TOTAL_RECORDS} Attendance Records Generated Successfully")
print("-----------------------------------")










