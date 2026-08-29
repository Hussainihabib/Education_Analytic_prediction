import os
import pandas as pd


# ==========================================
# Dataset Path
# ==========================================

BASE_DIR = os.path.dirname(__file__)

DATASET_PATH = os.path.join(
    BASE_DIR,
    "dataset",
    "student_performance.csv"
)


# ==========================================
# Load Dataset
# ==========================================

df = pd.read_csv(DATASET_PATH)


# ==========================================
# Average Semester Performance
# ==========================================

trend = (

    df.groupby("semester")

    .agg({

        "cgpa": "mean",
        "attendance": "mean",
        "assignment_marks": "mean",
        "quiz_marks": "mean",
        "mid_marks": "mean",
        "final_marks": "mean"

    })

    .round(2)

    .reset_index()

)


# ==========================================
# Trend Direction
# ==========================================

trend["cgpa_trend"] = trend["cgpa"].diff()

trend["attendance_trend"] = trend["attendance"].diff()

trend["cgpa_status"] = trend["cgpa_trend"].apply(

    lambda x: "Increasing"
    if pd.notna(x) and x > 0
    else (
        "Decreasing"
        if pd.notna(x) and x < 0
        else "Start"
    )

)

trend["attendance_status"] = trend["attendance_trend"].apply(

    lambda x: "Increasing"
    if pd.notna(x) and x > 0
    else (
        "Decreasing"
        if pd.notna(x) and x < 0
        else "Start"
    )

)


# ==========================================
# Output
# ==========================================

print("\n======================================")
print("Semester Trend Analysis")
print("======================================\n")

print(

    trend[[

        "semester",

        "cgpa",

        "attendance",

        "cgpa_status",

        "attendance_status"

    ]]

)


# ==========================================
# Save Trend
# ==========================================

OUTPUT_PATH = os.path.join(
    BASE_DIR,
    "dataset",
    "semester_trend.csv"
)

trend.to_csv(
    OUTPUT_PATH,
    index=False
)

print("\nTrend file saved successfully.")

print(OUTPUT_PATH)