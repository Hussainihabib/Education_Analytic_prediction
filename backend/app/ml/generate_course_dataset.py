import random
import pandas as pd

departments = [
    "Computer Science",
    "Software Engineering",
    "Artificial Intelligence",
    "Data Science",
    "Information Technology"
]

records = []

for i in range(1, 1001):

    department = random.choice(departments)

    semester = random.randint(1, 8)

    students = random.randint(20, 300)

    teachers = random.randint(2, 15)

    previous_demand = random.randint(20, 300)

    score = (
        students * 0.5 +
        previous_demand * 0.4 -
        teachers * 5
    )

    if score >= 180:
        demand = "High"

    elif score >= 100:
        demand = "Medium"

    else:
        demand = "Low"

    records.append({

        "department": department,

        "semester": semester,

        "students_enrolled": students,

        "teacher_count": teachers,

        "previous_demand": previous_demand,

        "course_demand": demand

    })

df = pd.DataFrame(records)

df.to_csv(
    "app/ml/dataset/course_demand.csv",
    index=False
)

print("\nDataset Generated Successfully\n")

print(df.head())

print("\n==============================")

print("Course Demand Distribution")

print("==============================")

print(df["course_demand"].value_counts())

print("\n==============================")

print("Department Distribution")

print("==============================")

print(df["department"].value_counts())