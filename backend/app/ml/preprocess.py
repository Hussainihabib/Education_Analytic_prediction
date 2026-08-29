import pandas as pd
from sklearn.preprocessing import LabelEncoder


def preprocess_data(file_path):
    """
    Load and preprocess student performance dataset.
    Returns:
        X
        y
        department_encoder
        result_encoder
    """

    # ==========================
    # Load Dataset
    # ==========================
    df = pd.read_csv(file_path)

    # ==========================
    # Remove Duplicate Records
    # ==========================
    df = df.drop_duplicates()

    # ==========================
    # Handle Missing Values
    # ==========================
    df = df.fillna({
        "attendance": 0,
        "cgpa": 0,
        "assignment_marks": 0,
        "quiz_marks": 0,
        "mid_marks": 0,
        "final_marks": 0,
        "semester": 1,
        "department": "Unknown",
        "result": "Fail"
    })

    # ==========================
    # Encode Department
    # ==========================
    department_encoder = LabelEncoder()

    df["department"] = department_encoder.fit_transform(
        df["department"]
    )

    # ==========================
    # Encode Result
    # ==========================
    result_encoder = LabelEncoder()

    df["result"] = result_encoder.fit_transform(
        df["result"]
    )

    # ==========================
    # Features
    # ==========================
    X = df[[
        "attendance",
        "cgpa",
        "assignment_marks",
        "quiz_marks",
        "mid_marks",
        "final_marks",  
        "semester",
        "department"
    ]]

    # ==========================
    # Target
    # ==========================
    y = df["result"]

    return (
        X,
        y,
        department_encoder,
        result_encoder
    )
    
    
    
    
def preprocess_dropout(file_path):

    df = pd.read_csv(file_path)

    df = df.drop_duplicates()

    df = df.fillna({
        "attendance": 0,
        "cgpa": 0,
        "assignment_marks": 0,
        "quiz_marks": 0,
        "mid_marks": 0,
        "final_marks": 0,
        "semester": 1,
        "department": "Unknown",
        "dropout_risk": "Medium"
    })

    department_encoder = LabelEncoder()

    df["department"] = department_encoder.fit_transform(
        df["department"]
    )

    dropout_encoder = LabelEncoder()

    df["dropout_risk"] = dropout_encoder.fit_transform(
        df["dropout_risk"]
    )

    X = df[[
        "attendance",
        "cgpa",
        "assignment_marks",
        "quiz_marks",
        "mid_marks",
        "final_marks",
        "semester",
        "department"
    ]]

    y = df["dropout_risk"]

    return (
        X,
        y,
        department_encoder,
        dropout_encoder
    )