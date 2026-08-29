import random
import pandas as pd

random.seed(42)

departments = [
    "Computer Science",
    "Software Engineering",
    "Artificial Intelligence",
    "Data Science",
    "Information Technology"
]

records = []

TOTAL_STUDENTS = 1000

for i in range(1, TOTAL_STUDENTS + 1):

    profile = random.choices(

        ["Excellent", "Average", "Weak"],

        weights=[30, 45, 25]

    )[0]

    if profile == "Excellent":

        attendance = random.randint(85, 100)
        cgpa = round(random.uniform(3.2, 4.0), 2)

        assignment = random.randint(16, 20)
        quiz = random.randint(8, 10)
        mid = random.randint(40, 50)
        final = random.randint(75, 100)

        dropout = "Low"

    elif profile == "Average":

        attendance = random.randint(65, 84)
        cgpa = round(random.uniform(2.3, 3.19), 2)

        assignment = random.randint(10, 17)
        quiz = random.randint(5, 8)
        mid = random.randint(25, 40)
        final = random.randint(45, 74)

        dropout = random.choice(["Low", "Medium"])

    else:

        attendance = random.randint(40, 64)
        cgpa = round(random.uniform(1.5, 2.29), 2)

        assignment = random.randint(5, 12)
        quiz = random.randint(2, 5)
        mid = random.randint(20, 30)
        final = random.randint(20, 44)

        dropout = random.choice(["Medium", "High"])

    semester = random.randint(1, 8)

    department = random.choice(departments)

    total_marks = (
        assignment
        + quiz
        + mid
        + final
    )

    if (
        total_marks >= 90
        and attendance >= 75
        and cgpa >= 2.50
    ):
        result = "Pass"
    else:
        result = "Fail"

    records.append({

        "student_id": f"ST{i:04}",

        "department": department,

        "semester": semester,

        "attendance": attendance,

        "cgpa": cgpa,

        "assignment_marks": assignment,

        "quiz_marks": quiz,

        "mid_marks": mid,

        "final_marks": final,

        "dropout_risk": dropout,

        "result": result

    })

df = pd.DataFrame(records)

df.to_csv(

    "app/ml/dataset/student_performance.csv",

    index=False

)

print("\nDataset Generated Successfully\n")

print(df.head())

print("\n==============================")

print("Result Distribution")

print("==============================")

print(df["result"].value_counts())

print("\n==============================")

print("Dropout Distribution")

print("==============================")

print(df["dropout_risk"].value_counts())

print("\n==============================")

print("Department Distribution")

print("==============================")

print(df["department"].value_counts())