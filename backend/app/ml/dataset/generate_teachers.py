from faker import Faker
from random import choice, randint
from app.database.connection import db

fake = Faker()

teacher_collection = db["teachers"]
department_collection = db["departments"]

TOTAL_TEACHERS = 300

departments = list(
    department_collection.find(
        {},
        {"department_id": 1, "department_name": 1}
    )
)

designations = [
    "Lecturer",
    "Assistant Professor",
    "Associate Professor",
    "Professor"
]

genders = [
    "Male",
    "Female"
]

teacher_collection.delete_many({})

teachers = []

for i in range(1, TOTAL_TEACHERS + 1):

    department = choice(departments)

    teacher = {

        "teacher_id": f"T{i:05}",

        "first_name": fake.first_name(),

        "last_name": fake.last_name(),

        "email": f"teacher{i}@edupredict.com",

        "phone": fake.msisdn()[:11],

        "gender": choice(genders),

        "age": randint(25, 60),

        "designation": choice(designations),

        "department_id": department["department_id"],


         "department": department["department_name"],




        "qualification": choice([
            "BS Computer Science",
            "MS Computer Science",
            "MPhil Computer Science",
            "PhD Computer Science",
            "MS Software Engineering",
            "PhD Artificial Intelligence",
            "MS Data Science",
            "PhD Information Technology"
        ]),

        "experience": randint(1, 35),

        "salary": randint(70000, 350000),

        "joining_year": randint(2010, 2026),

        "status": choice([
            "Active",
            "Active",
            "Active",
            "Active",
            "Inactive"
        ]),

        "address": fake.address(),

        "created_at": fake.date_time_this_decade()
    }

    teachers.append(teacher)

    if len(teachers) == 500:

        teacher_collection.insert_many(teachers)

        teachers = []


if teachers:

    teacher_collection.insert_many(teachers)

print(f"{TOTAL_TEACHERS} Teachers Generated Successfully")















