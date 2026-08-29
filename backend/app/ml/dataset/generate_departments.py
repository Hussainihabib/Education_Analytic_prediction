import random
from pymongo import MongoClient

from app.database.connection import db

department_collection = db["departments"]


department_collection.delete_many({})

fields = [
    "Computer Science",
    "Software Engineering",
    "Information Technology",
    "Artificial Intelligence",
    "Data Science",
    "Cyber Security",
    "Business Administration",
    "Accounting",
    "Finance",
    "Economics",
    "Marketing",
    "Management",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Architecture",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology"
]

buildings = [
    "A Block",
    "B Block",
    "C Block",
    "D Block",
    "E Block",
    "F Block"
]

for i in range(1, 21):

    name = random.choice(fields)

    document = {

        "department_id": f"DEP{i:03}",

        "department_name": f"{name} {i}",

        "head_of_department": f"Dr. HOD {i}",

        "building": random.choice(buildings),

        "status": "Active"

    }

    department_collection.insert_one(document)

print("20 Departments Generated Successfully")