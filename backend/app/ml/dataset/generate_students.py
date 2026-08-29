from faker import Faker
from random import choice, randint, uniform
from app.database.connection import db

fake = Faker()

student_collection = db["students"]
department_collection = db["departments"]

TOTAL_STUDENTS = 2000

departments = list(
    department_collection.find(
        {},
        {
            "department_id": 1,
            "department_name": 1
        }
    )
)

student_collection.delete_many({})

genders = [
    "Male",
    "Female"
]

students = []

for i in range(1, TOTAL_STUDENTS + 1):

    department = choice(departments)

    cgpa = round(
        uniform(2.00, 4.00),
        2
    )

    attendance = randint(
        50,
        100
    )

    student = {

        "student_id": f"S{i:06}",

        "first_name": fake.first_name(),

        "last_name": fake.last_name(),

        "email": f"student{i}@edupredict.com",

        "phone": fake.msisdn()[:11],

        "gender": choice(genders),

        "age": randint(18, 28),

        "department_id": department["department_id"],

        "department": department["department_name"],

        "semester": randint(1, 8),

        "cgpa": cgpa,

        "attendance": attendance,

        "status": choice([
            "Active",
            "Active",
            "Active",
            "Active",
            "Inactive"
        ]),

        "address": fake.address(),

        "admission_year": randint(2021, 2026),

        "created_at": fake.date_time_this_decade()

    }

    students.append(student)

    if len(students) == 500:

        student_collection.insert_many(students)

        students = []




if students:

    student_collection.insert_many(students)

print(f"{TOTAL_STUDENTS} Students Generated Successfully")












