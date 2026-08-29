import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)
from app.ml.preprocess import preprocess_data


# ==========================================
# Paths
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(
    BASE_DIR,
    "dataset",
    "student_performance.csv"
)

MODEL_FOLDER = os.path.join(
    BASE_DIR,
    "models"
)

os.makedirs(MODEL_FOLDER, exist_ok=True)


# ==========================================
# Load & Preprocess Data
# ==========================================

X, y, department_encoder, result_encoder = preprocess_data(
    DATASET_PATH
)


# ==========================================
# Train Test Split
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


# ==========================================
# Prediction
# ==========================================

prediction = model.predict(X_test)


# ==========================================
# Evaluation
# ==========================================

accuracy = accuracy_score(
    y_test,
    prediction
)

print("\n===================================")
print("Model Accuracy")
print("===================================")

print(f"{accuracy*100:.2f}%")

print("\n===================================")
print("Classification Report")
print("===================================")

print(
    classification_report(
        y_test,
        prediction
    )
)

print("\n===================================")
print("Confusion Matrix")
print("===================================")

print(
    confusion_matrix(
        y_test,
        prediction
    )
)


# ==========================================
# Save Model
# ==========================================

joblib.dump(
    model,
    os.path.join(
        MODEL_FOLDER,
        "performance_model.pkl"
    )
)

joblib.dump(
    department_encoder,
    os.path.join(
        MODEL_FOLDER,
        "department_encoder.pkl"
    )
)

joblib.dump(
    result_encoder,
    os.path.join(
        MODEL_FOLDER,
        "result_encoder.pkl"
    )
)

print("\nModel Saved Successfully")