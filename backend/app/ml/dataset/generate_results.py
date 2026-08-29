from faker import Faker
from random import choice, randint
from datetime import datetime

from app.database.connection import db

fake = Faker()

# ==========================================
# MongoDB Collections
# ==========================================

result_collection = db["results"]
student_collection = db["students"]
course_collection = db["courses"]

TOTAL_RESULTS = 20000

# ==========================================
# Load Students & Courses
# ==========================================

students = list(
    student_collection.find(
        {},
        {
            "student_id": 1,
            "semester": 1
        }
    )
)

courses = list(
    course_collection.find(
        {},
        {
            "course_id": 1,
            "teacher_id": 1,
            "semester": 1
        }
    )
)

# Delete old data
result_collection.delete_many({})

# ==========================================
# Helper Functions
# ==========================================

def calculate_percentage(obtained, total):
    return round((obtained / total) * 100, 2)


def calculate_grade(percentage):

    if percentage >= 90:
        return "A+"

    elif percentage >= 85:
        return "A"

    elif percentage >= 80:
        return "B+"

    elif percentage >= 75:
        return "B"

    elif percentage >= 70:
        return "C+"

    elif percentage >= 60:
        return "C"

    elif percentage >= 50:
        return "D"

    else:
        return "F"


def calculate_status(percentage):
    return "Pass" if percentage >= 50 else "Fail"


results = []

# ==========================================
# Generate Results
# ==========================================

exam_types = [
    "Quiz",
    "Assignment",
    "Mid",
    "Final"
]

for i in range(1, TOTAL_RESULTS + 1):

    student = choice(students)

    matching_courses = [
        c for c in courses
        if c["semester"] == student["semester"]
    ]

    if not matching_courses:
        continue

    course = choice(matching_courses)

    total_marks = choice([20, 30, 50, 100])

    if total_marks == 20:
        marks_obtained = randint(5, 20)

    elif total_marks == 30:
        marks_obtained = randint(8, 30)

    elif total_marks == 50:
        marks_obtained = randint(15, 50)

    else:
        marks_obtained = randint(25, 100)

    percentage = calculate_percentage(
        marks_obtained,
        total_marks
    )

    grade = calculate_grade(percentage)

    status = calculate_status(percentage)

    result = {

        "result_id": f"R{i:07}",

        "student_id": student["student_id"],

        "course_id": course["course_id"],

        "teacher_id": course["teacher_id"],

        "marks_obtained": marks_obtained,

        "total_marks": total_marks,

        "percentage": percentage,

        "grade": grade,

        "status": status,

        "semester": student["semester"],

        "exam_type": choice(exam_types),

        "remarks": choice([
            "",
            "",
            "",
            "Excellent",
            "Needs Improvement",
            "Average Performance"
        ]),

        "created_at": fake.date_time_this_decade()

    }

    results.append(result)

    if len(results) == 1000:

        result_collection.insert_many(results)

        results = []

        print(f"{i} Results Generated...")


# ==========================================
# Insert Remaining Results
# ==========================================

if results:

    result_collection.insert_many(results)

# ==========================================
# Finished
# ==========================================

print("\n-----------------------------------")
print(f"{TOTAL_RESULTS} Results Generated Successfully")
print("-----------------------------------")








