"""
EduPredict demo database seeder.

Run from the backend directory:
    python -m app.seed_database

For a clean demo database (deletes demo domain collections first):
    python -m app.seed_database --reset

The seeder creates reproducible RBAC-compatible data for university demos.
It does NOT delete or modify arbitrary users; only the Admin/Analyst demo
accounts are created when they do not already exist.
"""

from __future__ import annotations

import argparse
import random
from datetime import datetime, timedelta
from pathlib import Path

from faker import Faker

from app.auth.hash import hash_password
from app.database.connection import db

SEED = 20260808
TOTAL_DEPARTMENTS = 20
TOTAL_STUDENTS = 1000
TOTAL_TEACHERS = 150
TOTAL_COURSES = 50
TOTAL_ATTENDANCE = 5000
TOTAL_RESULTS = 2000

fake = Faker()
rng = random.Random(SEED)
fake.seed_instance(SEED)

DEPARTMENTS = [
    "Computer Science", "Software Engineering", "Information Technology",
    "Artificial Intelligence", "Data Science", "Cyber Security",
    "Business Administration", "Accounting", "Finance", "Economics",
    "Marketing", "Management", "Electrical Engineering",
    "Mechanical Engineering", "Civil Engineering", "Architecture",
    "Mathematics", "Physics", "Chemistry", "Biology",
]

COURSE_NAMES = [
    "Programming Fundamentals", "Object Oriented Programming", "Database Systems",
    "Data Structures", "Algorithms", "Operating Systems", "Computer Networks",
    "Software Engineering", "Artificial Intelligence", "Machine Learning",
    "Deep Learning", "Data Mining", "Cloud Computing", "Big Data Analytics",
    "Cyber Security", "Web Development", "Mobile Application Development",
    "Computer Vision", "Natural Language Processing", "Internet of Things",
]

DESIGNATIONS = ["Lecturer", "Assistant Professor", "Associate Professor", "Professor"]
QUALIFICATIONS = [
    "BS Computer Science", "MS Computer Science", "MPhil Computer Science",
    "PhD Computer Science", "MS Software Engineering", "PhD Artificial Intelligence",
    "MS Data Science", "PhD Information Technology",
]
EXAM_TYPES = ["Quiz", "Assignment", "Mid", "Final"]
ATTENDANCE_STATUSES = ["Present"] * 7 + ["Late"] * 1 + ["Absent"] * 1 + ["Leave"] * 1
GENDERS = ["Male", "Female"]


def insert_batches(collection, documents, batch_size=1000):
    for start in range(0, len(documents), batch_size):
        collection.insert_many(documents[start:start + batch_size], ordered=False)


def ensure_indexes():
    db["departments"].create_index("department_id", unique=True)
    db["students"].create_index("student_id", unique=True)
    db["teachers"].create_index("teacher_id", unique=True)
    db["courses"].create_index("course_id", unique=True)
    db["courses"].create_index("course_code", unique=True)
    db["attendance"].create_index("attendance_id", unique=True)
    db["results"].create_index("result_id", unique=True)
    db["users"].create_index("email", unique=True)

    # Compound indexes matching the app's most frequent scoped
    # queries (see app/auth/access.py get_scope_query and
    # app/services/dashboard_service.py).
    db["attendance"].create_index([("student_id", 1), ("date", -1)])
    db["attendance"].create_index([("teacher_id", 1), ("date", -1)])
    db["results"].create_index([("student_id", 1), ("semester", 1)])
    db["results"].create_index([("teacher_id", 1), ("status", 1)])
    db["students"].create_index([("teacher_id", 1), ("status", 1)])
    db["notifications"].create_index([("receiver_email", 1), ("created_at", -1)])
    db["notifications"].create_index([("title", 1), ("receiver_email", 1), ("created_at", -1)])
    db["support"].create_index([("user_email", 1), ("created_at", -1)])
    db["support"].create_index([("status", 1), ("priority", 1)])


def seed_departments():
    docs = []
    buildings = ["A Block", "B Block", "C Block", "D Block", "E Block", "F Block"]
    for i, name in enumerate(DEPARTMENTS, 1):
        docs.append({
            "department_id": f"DEP{i:03}",
            "department_name": name,
            "head_of_department": f"Dr. HOD {i}",
            "building": rng.choice(buildings),
            "status": "Active",
        })
    insert_batches(db["departments"], docs)
    return docs


def seed_teachers(departments):
    docs = []
    for i in range(1, TOTAL_TEACHERS + 1):
        dept = rng.choice(departments)
        first = fake.first_name()
        last = fake.last_name()
        docs.append({
            "teacher_id": f"T{i:05}",
            "first_name": first,
            "last_name": last,
            "email": f"teacher{i}@edupredict.com",
            "phone": f"03{rng.randint(100000000, 999999999)}",
            "gender": rng.choice(GENDERS),
            "age": rng.randint(25, 60),
            "department_id": dept["department_id"],
            "department": dept["department_name"],
            "designation": rng.choice(DESIGNATIONS),
            "qualification": rng.choice(QUALIFICATIONS),
            "experience": rng.randint(1, 35),
            "salary": rng.randint(70000, 350000),
            "joining_year": rng.randint(2010, 2026),
            "status": rng.choices(["Active", "Inactive"], weights=[9, 1])[0],
            "address": fake.address().replace("\n", ", "),
            "created_at": datetime.utcnow(),
        })
    insert_batches(db["teachers"], docs)
    return docs


def seed_students(departments, teachers):
    docs = []
    teachers_by_dept = {}
    for teacher in teachers:
        teachers_by_dept.setdefault(teacher["department_id"], []).append(teacher)

    for i in range(1, TOTAL_STUDENTS + 1):
        dept = rng.choice(departments)
        dept_teachers = teachers_by_dept[dept["department_id"]]
        teacher = rng.choice(dept_teachers)
        first = fake.first_name()
        last = fake.last_name()
        docs.append({
            "student_id": f"S{i:06}",
            "first_name": first,
            "last_name": last,
            "email": f"student{i}@edupredict.com",
            "phone": f"03{rng.randint(100000000, 999999999)}",
            "gender": rng.choice(GENDERS),
            "age": rng.randint(18, 28),
            "department_id": dept["department_id"],
            "department": dept["department_name"],
            "teacher_id": teacher["teacher_id"],
            "semester": rng.randint(1, 8),
            "cgpa": round(rng.uniform(2.0, 4.0), 2),
            "attendance": rng.randint(50, 100),
            "status": rng.choices(["Active", "Inactive"], weights=[9, 1])[0],
            "address": fake.address().replace("\n", ", "),
            "admission_year": rng.randint(2021, 2026),
            "created_at": datetime.utcnow(),
        })
    insert_batches(db["students"], docs)
    return docs


def seed_courses(departments, teachers):
    docs = []
    teachers_by_dept = {}
    for teacher in teachers:
        teachers_by_dept.setdefault(teacher["department_id"], []).append(teacher)

    for i in range(1, TOTAL_COURSES + 1):
        dept = departments[(i - 1) % len(departments)] if i <= len(departments) else rng.choice(departments)
        teacher = rng.choice(teachers_by_dept[dept["department_id"]])
        name = COURSE_NAMES[(i - 1) % len(COURSE_NAMES)]
        docs.append({
            "course_id": f"C{i:05}",
            "course_name": name,
            "course_code": f"CS-{1000 + i}",
            "department_id": dept["department_id"],
            "department": dept["department_name"],
            "teacher_id": teacher["teacher_id"],
            "teacher_name": f"{teacher['first_name']} {teacher['last_name']}",
            "credit_hours": rng.randint(2, 4),
            "semester": rng.randint(1, 8),
            "course_type": rng.choice(["Core", "Elective"]),
            "description": fake.sentence(nb_words=8),
            "status": rng.choices(["Active", "Inactive"], weights=[9, 1])[0],
            "created_at": datetime.utcnow(),
        })
    insert_batches(db["courses"], docs)
    return docs


def seed_attendance(students, courses):
    courses_by_dept = {}
    for course in courses:
        courses_by_dept.setdefault(course["department_id"], []).append(course)

    docs = []
    start_date = datetime(2025, 1, 1)
    for i in range(1, TOTAL_ATTENDANCE + 1):
        student = rng.choice(students)
        course = rng.choice(courses_by_dept[student["department_id"]])
        status = rng.choice(ATTENDANCE_STATUSES)
        docs.append({
            "attendance_id": f"AT{i:07}",
            "student_id": student["student_id"],
            "course_id": course["course_id"],
            "teacher_id": course["teacher_id"],
            "attendance_date": (start_date + timedelta(days=rng.randint(0, 365))).date().isoformat(),
            "status": status,
            "remarks": "" if status == "Present" else rng.choice(["", "Medical Leave", "Late Arrival", "Absent Without Notice"]),
            "created_at": datetime.utcnow(),
        })
        if len(docs) >= 1000:
            insert_batches(db["attendance"], docs)
            docs.clear()
    if docs:
        insert_batches(db["attendance"], docs)


def grade_for(percentage):
    if percentage >= 90: return "A+"
    if percentage >= 85: return "A"
    if percentage >= 80: return "B+"
    if percentage >= 75: return "B"
    if percentage >= 70: return "C+"
    if percentage >= 60: return "C"
    if percentage >= 50: return "D"
    return "F"


def seed_results(students, courses):
    courses_by_semester = {}
    for course in courses:
        courses_by_semester.setdefault(course["semester"], []).append(course)

    docs = []
    for i in range(1, TOTAL_RESULTS + 1):
        student = rng.choice(students)
        course = rng.choice(courses_by_semester[student["semester"]])
        total = rng.choice([20, 30, 50, 100])
        minimum = max(0, int(total * 0.25))
        marks = rng.randint(minimum, int(total))
        percentage = round((marks / total) * 100, 2)
        docs.append({
            "result_id": f"R{i:07}",
            "student_id": student["student_id"],
            "course_id": course["course_id"],
            "teacher_id": course["teacher_id"],
            "marks_obtained": marks,
            "total_marks": total,
            "percentage": percentage,
            "grade": grade_for(percentage),
            "status": "Pass" if percentage >= 50 else "Fail",
            "semester": student["semester"],
            "exam_type": rng.choice(EXAM_TYPES),
            "remarks": rng.choice(["", "Excellent", "Needs Improvement", "Average Performance"]),
            "created_at": datetime.utcnow(),
        })
        if len(docs) >= 1000:
            insert_batches(db["results"], docs)
            docs.clear()
    if docs:
        insert_batches(db["results"], docs)


def ensure_demo_user(email, name, role, password, teacher_id=None, student_id=None):
    users = db["users"]
    existing = users.find_one({"email": email})
    if existing:
        return False
    users.insert_one({
        "name": name,
        "email": email,
        "password": hash_password(password),
        "role": role,
        "teacher_id": teacher_id,
        "student_id": student_id,
        "is_active": True,
        "created_at": datetime.utcnow(),
    })
    return True


def seed_demo_users(teachers, students):
    ensure_demo_user("admin@edupredict.com", "EduPredict Admin", "Admin", "Admin@1234")
    ensure_demo_user("analyst@edupredict.com", "EduPredict Analyst", "Analyst", "Analyst@1234")

    # A small set of linked accounts is enough for RBAC demonstration and
    # avoids creating thousands of expensive bcrypt password hashes.
    for teacher in teachers[:10]:
        ensure_demo_user(
            teacher["email"],
            f"{teacher['first_name']} {teacher['last_name']}",
            "Teacher",
            "Teacher@1234",
            teacher_id=teacher["teacher_id"],
        )
    for student in students[:10]:
        ensure_demo_user(
            student["email"],
            f"{student['first_name']} {student['last_name']}",
            "Student",
            "Student@1234",
            student_id=student["student_id"],
        )


def main():
    parser = argparse.ArgumentParser(description="Seed EduPredict demo MongoDB data")
    parser.add_argument("--reset", action="store_true", help="Delete existing demo domain collections before seeding")
    args = parser.parse_args()

    print("Connecting to EduPredict MongoDB...")
    db.command("ping")

    domain = ["departments", "teachers", "students", "courses", "attendance", "results"]
    if not args.reset:
        counts = {name: db[name].count_documents({}) for name in domain}
        if any(counts.values()):
            print("Seed cancelled: demo data already exists.")
            print("Use 'python -m app.seed_database --reset' only when you intentionally want to replace it.")
            print(counts)
            return
    else:
        for name in domain:
            db[name].delete_many({})

    departments = seed_departments()
    teachers = seed_teachers(departments)
    students = seed_students(departments, teachers)
    courses = seed_courses(departments, teachers)
    seed_attendance(students, courses)
    seed_results(students, courses)
    seed_demo_users(teachers, students)
    ensure_indexes()

    print("\nEduPredict demo database seeded successfully.")
    print(f"Departments : {TOTAL_DEPARTMENTS}")
    print(f"Teachers    : {TOTAL_TEACHERS}")
    print(f"Students    : {TOTAL_STUDENTS}")
    print(f"Courses     : {TOTAL_COURSES}")
    print(f"Attendance  : {TOTAL_ATTENDANCE}")
    print(f"Results     : {TOTAL_RESULTS}")
    print("\nDemo logins:")
    print("Admin   : admin@edupredict.com / Admin@1234")
    print("Analyst : analyst@edupredict.com / Analyst@1234")
    print("Teacher : teacher1@edupredict.com / Teacher@1234")
    print("Student : student1@edupredict.com / Student@1234")


if __name__ == "__main__":
    main()
