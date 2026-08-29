import os
import pandas as pd

from sklearn.ensemble import IsolationForest


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
# Features for Anomaly Detection
# ==========================================

features = df[[
    "attendance",
    "cgpa",
    "assignment_marks",
    "quiz_marks",
    "mid_marks",
    "final_marks"
]]


# ==========================================
# Isolation Forest Model
# ==========================================

model = IsolationForest(

    contamination=0.05,
    random_state=42

)

model.fit(features)


# ==========================================
# Prediction
# ==========================================

df["anomaly"] = model.predict(features)

df["anomaly"] = df["anomaly"].replace({

    1: "Normal",
    -1: "Anomaly"

})


# ==========================================
# Results
# ==========================================

print("\n==============================")
print("Anomaly Detection Summary")
print("==============================\n")

print(df["anomaly"].value_counts())


print("\n==============================")
print("Detected Anomalies")
print("==============================\n")

print(

    df[df["anomaly"] == "Anomaly"][[
        "student_id",
        "attendance",
        "cgpa",
        "assignment_marks",
        "quiz_marks",
        "mid_marks",
        "final_marks",
        "anomaly"
    ]].head(20)

)