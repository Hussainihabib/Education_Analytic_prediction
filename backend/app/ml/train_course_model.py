import os
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# ==========================================
# Paths
# ==========================================

BASE_DIR = os.path.dirname(__file__)

DATASET_PATH = os.path.join(
    BASE_DIR,
    "dataset",
    "course_demand.csv"
)

MODEL_FOLDER = os.path.join(
    BASE_DIR,
    "models"
)

os.makedirs(MODEL_FOLDER, exist_ok=True)

# ==========================================
# Load Dataset
# ==========================================

df = pd.read_csv(DATASET_PATH)

# ==========================================
# Handle Missing Values
# ==========================================

df = df.drop_duplicates()

df = df.fillna({
    "department": "Unknown",
    "semester": 1,
    "students_enrolled": 0,
    "teacher_count": 0,
    "previous_demand": 0,
    "course_demand": "Low"
})

# ==========================================
# Encode Department
# ==========================================

department_encoder = LabelEncoder()

df["department"] = department_encoder.fit_transform(
    df["department"]
)

# ==========================================
# Encode Target
# ==========================================

demand_encoder = LabelEncoder()

df["course_demand"] = demand_encoder.fit_transform(
    df["course_demand"]
)

# ==========================================
# Features
# ==========================================

X = df[[
    "department",
    "semester",
    "students_enrolled",
    "teacher_count",
    "previous_demand"
]]

y = df["course_demand"]

# ==========================================
# Split
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# ==========================================
# Train Model
# ==========================================

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(
    X_train,
    y_train
)

prediction = model.predict(X_test)

# ==========================================
# Evaluation
# ==========================================

accuracy = accuracy_score(
    y_test,
    prediction
)

print("\n===================================")
print("Course Demand Accuracy")
print("===================================")
print(f"{accuracy*100:.2f}%")

print("\n===================================")
print("Classification Report")
print("===================================")

print(classification_report(
    y_test,
    prediction
))

print("\n===================================")
print("Confusion Matrix")
print("===================================")

print(confusion_matrix(
    y_test,
    prediction
))

# ==========================================
# Save Model
# ==========================================

joblib.dump(
    model,
    os.path.join(
        MODEL_FOLDER,
        "course_demand_model.pkl"
    )
)

joblib.dump(
    department_encoder,
    os.path.join(
        MODEL_FOLDER,
        "course_department_encoder.pkl"
    )
)

joblib.dump(
    demand_encoder,
    os.path.join(
        MODEL_FOLDER,
        "course_demand_encoder.pkl"
    )
)

print("\nCourse Demand Model Saved Successfully")