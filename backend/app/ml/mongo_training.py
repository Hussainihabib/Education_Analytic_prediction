
# from __future__ import annotations

# from datetime import datetime, timezone
# from pathlib import Path
# import json
# import os
# from typing import Any

# import joblib
# import numpy as np
# import pandas as pd
# from sklearn.compose import ColumnTransformer
# from sklearn.ensemble import IsolationForest, RandomForestClassifier
# from sklearn.impute import SimpleImputer
# from sklearn.metrics import accuracy_score, classification_report
# from sklearn.model_selection import train_test_split
# from sklearn.pipeline import Pipeline
# from sklearn.preprocessing import OneHotEncoder

# BASE_DIR = Path(__file__).resolve().parent
# MODEL_DIR = BASE_DIR / "models"
# MODEL_DIR.mkdir(parents=True, exist_ok=True)
# METADATA_PATH = MODEL_DIR / "training_metadata.json"

# PERF_FEATURES = [
#     "attendance", "cgpa", "avg_marks_percentage", "failed_results",
#     "result_count", "semester", "department"
# ]
# DROPOUT_FEATURES = [
#     "attendance", "cgpa", "avg_marks_percentage", "failed_results",
#     "result_count", "semester", "department"
# ]
# COURSE_FEATURES = [
#     "department", "semester", "students_enrolled", "teacher_count", "previous_demand"
# ]


# def _now() -> str:
#     return datetime.now(timezone.utc).isoformat()


# def _safe_float(value: Any, default: float = 0.0) -> float:
#     try:
#         if value is None or value == "":
#             return default
#         return float(value)
#     except (TypeError, ValueError):
#         return default


# def _safe_int(value: Any, default: int = 0) -> int:
#     try:
#         return int(float(value))
#     except (TypeError, ValueError):
#         return default


# def _collection_df(db, name: str) -> pd.DataFrame:
#     rows = list(db[name].find({}))
#     if not rows:
#         return pd.DataFrame()
#     for row in rows:
#         row.pop("_id", None)
#     return pd.DataFrame(rows)


# def build_student_dataset(db) -> pd.DataFrame:
#     students = _collection_df(db, "students")
#     results = _collection_df(db, "results")
#     if students.empty:
#         return pd.DataFrame()

#     if results.empty:
#         results = pd.DataFrame(columns=["student_id", "marks_obtained", "total_marks", "status"])

#     student_id_col = "student_id"
#     rows = []
#     for _, student in students.iterrows():
#         sid = str(student.get(student_id_col, "")).strip().upper()
#         if not sid:
#             continue
#         r = results[results["student_id"].astype(str).str.strip().str.upper() == sid] if "student_id" in results else results.iloc[0:0]
#         percentages = []
#         failed = 0
#         if not r.empty:
#             for _, result in r.iterrows():
#                 total = _safe_float(result.get("total_marks"))
#                 marks = _safe_float(result.get("marks_obtained"))
#                 if total > 0:
#                     percentages.append((marks / total) * 100)
#                 status = str(result.get("status", "")).strip().lower()
#                 if status == "fail":
#                     failed += 1
#         avg_pct = float(np.mean(percentages)) if percentages else _safe_float(student.get("average_percentage"), 0)
#         result_count = len(percentages)
#         rows.append({
#             "student_id": sid,
#             "attendance": _safe_float(student.get("attendance")),
#             "cgpa": _safe_float(student.get("cgpa")),
#             "avg_marks_percentage": round(avg_pct, 2),
#             "failed_results": failed,
#             "result_count": result_count,
#             "semester": max(1, min(8, _safe_int(student.get("semester"), 1))),
#             "department": str(student.get("department") or "Unknown").strip() or "Unknown",
#             # Actual labels are used when present. Otherwise a transparent derived label is used.
#             "observed_result": "Fail" if failed > 0 and avg_pct < 50 else "Pass",
#             "dropout_risk": student.get("dropout_risk", student.get("dropout", student.get("dropout_status"))),
#         })
#     return pd.DataFrame(rows)


# def _pipeline(features: list[str]):
#     categorical = [f for f in features if f == "department"]
#     numeric = [f for f in features if f != "department"]
#     prep = ColumnTransformer([
#         ("num", Pipeline([("imputer", SimpleImputer(strategy="median"))]), numeric),
#         ("cat", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")),
#                           ("onehot", OneHotEncoder(handle_unknown="ignore"))]), categorical),
#     ])
#     return Pipeline([
#         ("preprocess", prep),
#         ("model", RandomForestClassifier(n_estimators=250, random_state=42, class_weight="balanced")),
#     ])


# def _train_classifier(df: pd.DataFrame, features: list[str], target: str, model_name: str):
#     if df.empty:
#         raise ValueError("No MongoDB records are available for training.")
#     data = df.dropna(subset=[target]).copy()
#     data = data.drop_duplicates()
#     if data[target].nunique() < 2:
#         raise ValueError(f"{model_name}: at least two target classes are required.")
#     X = data[features]
#     y = data[target].astype(str)
#     if len(data) < 10:
#         raise ValueError(f"{model_name}: at least 10 training records are recommended; found {len(data)}.")
#     stratify = y if y.value_counts().min() >= 2 else None
#     X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=stratify)
#     pipe = _pipeline(features)
#     pipe.fit(X_train, y_train)
#     pred = pipe.predict(X_test)
#     accuracy = float(accuracy_score(y_test, pred))
#     model_path = MODEL_DIR / f"{model_name}_model.joblib"
#     joblib.dump(pipe, model_path)
#     return {
#         "model": model_name,
#         "accuracy": round(accuracy * 100, 2),
#         "records": int(len(data)),
#         "classes": sorted(y.unique().tolist()),
#         "model_path": str(model_path.name),
#         "trained_at": _now(),
#         "report": classification_report(y_test, pred, output_dict=True, zero_division=0),
#     }


# def train_performance(db):
#     df = build_student_dataset(db)
#     return _train_classifier(df, PERF_FEATURES, "observed_result", "performance")


# def _derive_dropout_label(row):
#     raw = row.get("dropout_risk")
#     if raw is not None and str(raw).strip():
#         return str(raw).strip().title()
#     score = 0
#     if row["attendance"] < 60: score += 2
#     elif row["attendance"] < 75: score += 1
#     if row["cgpa"] < 2.0: score += 2
#     elif row["cgpa"] < 2.5: score += 1
#     if row["avg_marks_percentage"] < 50: score += 2
#     elif row["avg_marks_percentage"] < 65: score += 1
#     if row["failed_results"] >= 2: score += 2
#     elif row["failed_results"] == 1: score += 1
#     return "High" if score >= 5 else "Medium" if score >= 2 else "Low"


# def train_dropout(db):
#     df = build_student_dataset(db)
#     if df.empty:
#         raise ValueError("No MongoDB student records are available for dropout training.")
#     df["dropout_target"] = df.apply(_derive_dropout_label, axis=1)
#     result = _train_classifier(df, DROPOUT_FEATURES, "dropout_target", "dropout")
#     result["target_source"] = "student.dropout_risk/dropout_status when present; otherwise derived from current attendance, CGPA, marks and failures"
#     return result


# def build_course_dataset(db):
#     courses = _collection_df(db, "courses")
#     results = _collection_df(db, "results")

#     if courses.empty:
#         return pd.DataFrame()

#     course_data = []

#     # ---------------------------------------------------------
#     # Step 1: Calculate current enrollment for every course
#     # ---------------------------------------------------------
#     for _, course in courses.iterrows():

#         code = str(
#             course.get("course_code", course.get("course_id", ""))
#         ).strip()

#         if not code:
#             continue

#         rr = (
#             results[
#                 results["course_id"]
#                 .astype(str)
#                 .str.strip()
#                 .str.upper()
#                 == code.upper()
#             ]
#             if "course_id" in results
#             else results.iloc[0:0]
#         )

#         students_enrolled = (
#             int(rr["student_id"].nunique())
#             if not rr.empty and "student_id" in rr
#             else _safe_int(course.get("students_enrolled"))
#         )

#         teacher_count = (
#             int(rr["teacher_id"].nunique())
#             if not rr.empty and "teacher_id" in rr
#             else _safe_int(course.get("teacher_count"))
#         )

#         previous = _safe_float(
#             course.get("previous_demand", students_enrolled)
#         )

#         course_data.append({
#             "course": course,
#             "code": code,
#             "students_enrolled": students_enrolled,
#             "teacher_count": teacher_count,
#             "previous": previous,
#         })

#     if not course_data:
#         return pd.DataFrame()

#     # ---------------------------------------------------------
#     # Step 2: Rank courses by current enrollment
#     # ---------------------------------------------------------
#     #
#     # Lowest enrollment courses -> Low
#     # Middle enrollment courses -> Medium
#     # Highest enrollment courses -> High
#     #
#     # Existing MongoDB course_demand values are intentionally
#     # ignored because they may all contain "High".
#     # ---------------------------------------------------------

#     course_data.sort(
#         key=lambda item: item["students_enrolled"]
#     )

#     total_courses = len(course_data)

#     low_end = total_courses // 3
#     medium_end = (total_courses * 2) // 3

#     # ---------------------------------------------------------
#     # Step 3: Build training dataset
#     # ---------------------------------------------------------

#     rows = []

#     for index, item in enumerate(course_data):

#         if index < low_end:
#             demand = "Low"
#         elif index < medium_end:
#             demand = "Medium"
#         else:
#             demand = "High"

#         course = item["course"]

#         rows.append({
#             "course_code": item["code"],

#             "department": str(
#                 course.get("department") or "Unknown"
#             ).strip() or "Unknown",

#             "semester": max(
#                 1,
#                 min(
#                     8,
#                     _safe_int(course.get("semester"), 1)
#                 )
#             ),

#             "students_enrolled": item["students_enrolled"],

#             "teacher_count": item["teacher_count"],

#             "previous_demand": item["previous"],

#             "course_demand": demand,
#         })

#     return pd.DataFrame(rows)



# def train_course_demand(db):
#     df = build_course_dataset(db)
#     result = _train_classifier(df, COURSE_FEATURES, "course_demand", "course_demand")
#     result["target_source"] = "course.course_demand when present; otherwise derived from current enrollment"
#     return result


# def train_anomaly(db):
#     df = build_student_dataset(db)
#     if len(df) < 10:
#         raise ValueError("At least 10 student records are recommended for anomaly detection.")
#     features = ["attendance", "cgpa", "avg_marks_percentage", "failed_results", "semester"]
#     x = df[features].fillna(0)
#     contamination = min(0.15, max(0.01, 5 / len(df)))
#     model = IsolationForest(contamination=contamination, random_state=42)
#     model.fit(x)
#     model_path = MODEL_DIR / "anomaly_model.joblib"
#     joblib.dump({"model": model, "features": features}, model_path)
#     labels = model.predict(x)
#     return {
#         "model": "anomaly",
#         "records": int(len(df)),
#         "anomalies": int((labels == -1).sum()),
#         "trained_at": _now(),
#         "model_path": model_path.name,
#     }


# def retrain_all(db):
#     results = []
#     for fn in (train_performance, train_dropout, train_course_demand, train_anomaly):
#         results.append(fn(db))
#     metadata = {
#         "trained_at": _now(),
#         "source": "MongoDB",
#         "models": results,
#     }
#     METADATA_PATH.write_text(json.dumps(metadata, indent=2, default=str), encoding="utf-8")
#     return metadata


# def load_metadata():
#     if not METADATA_PATH.exists():
#         return {"trained_at": None, "source": "MongoDB", "models": []}
#     try:
#         return json.loads(METADATA_PATH.read_text(encoding="utf-8"))
#     except Exception:
#         return {"trained_at": None, "source": "MongoDB", "models": []}


# def anomaly_results(db, limit: int = 50):
#     df = build_student_dataset(db)
#     if df.empty:
#         return []
#     features = ["attendance", "cgpa", "avg_marks_percentage", "failed_results", "semester"]
#     x = df[features].fillna(0)
#     if len(df) < 10:
#         return []
#     model_path = MODEL_DIR / "anomaly_model.joblib"
#     if model_path.exists():
#         artifact = joblib.load(model_path)
#         model = artifact["model"]
#     else:
#         model = IsolationForest(contamination=min(0.15, max(0.01, 5 / len(df))), random_state=42).fit(x)
#     labels = model.predict(x)
#     scores = model.decision_function(x)
#     out = []
#     for i, (_, row) in enumerate(df.iterrows()):
#         if labels[i] == -1:
#             out.append({
#                 "student_id": row["student_id"],
#                 "attendance": row["attendance"],
#                 "cgpa": row["cgpa"],
#                 "avg_marks_percentage": row["avg_marks_percentage"],
#                 "failed_results": row["failed_results"],
#                 "anomaly_score": round(float(scores[i]), 4),
#                 "status": "Anomaly",
#             })
#     return sorted(out, key=lambda x: x["anomaly_score"])[:limit]


# def correlation_matrix(db):
#     df = build_student_dataset(db)
#     if df.empty:
#         return []
#     numeric = df[["attendance", "cgpa", "avg_marks_percentage", "failed_results", "result_count", "semester"]].corr().round(3)
#     return [{"feature": idx, **{col: float(numeric.loc[idx, col]) for col in numeric.columns}} for idx in numeric.index]


# def semester_trend(db):
#     df = build_student_dataset(db)
#     if df.empty:
#         return []
#     trend = df.groupby("semester").agg(
#         average_cgpa=("cgpa", "mean"),
#         average_attendance=("attendance", "mean"),
#         average_marks=("avg_marks_percentage", "mean"),
#     ).reset_index().round(2)
#     trend["cgpa_status"] = trend["average_cgpa"].diff().apply(lambda x: "Increasing" if pd.notna(x) and x > 0 else "Decreasing" if pd.notna(x) and x < 0 else "Start")
#     trend["attendance_status"] = trend["average_attendance"].diff().apply(lambda x: "Increasing" if pd.notna(x) and x > 0 else "Decreasing" if pd.notna(x) and x < 0 else "Start")
#     return trend.to_dict(orient="records")



"""Train EduPredict ML models from the current MongoDB data.

The training functions intentionally read the application's MongoDB collections
instead of the demo CSV files. The CSV datasets remain available as optional
fallback/demo data only.

This version also optimizes MongoDB -> Pandas data preparation so that
correlation, trend and anomaly APIs do not repeatedly scan the complete
results collection for every student.
"""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import json
from typing import Any

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

METADATA_PATH = MODEL_DIR / "training_metadata.json"


# =========================================================
# FEATURES
# =========================================================

PERF_FEATURES = [
    "attendance",
    "cgpa",
    "avg_marks_percentage",
    "failed_results",
    "result_count",
    "semester",
    "department",
]

DROPOUT_FEATURES = [
    "attendance",
    "cgpa",
    "avg_marks_percentage",
    "failed_results",
    "result_count",
    "semester",
    "department",
]

COURSE_FEATURES = [
    "department",
    "semester",
    "students_enrolled",
    "teacher_count",
    "previous_demand",
]


# =========================================================
# HELPERS
# =========================================================

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or value == "":
            return default

        return float(value)

    except (TypeError, ValueError):
        return default


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(float(value))

    except (TypeError, ValueError):
        return default


def _collection_df(db, name: str) -> pd.DataFrame:
    """Load a MongoDB collection into a Pandas DataFrame."""

    rows = list(db[name].find({}))

    if not rows:
        return pd.DataFrame()

    for row in rows:
        row.pop("_id", None)

    return pd.DataFrame(rows)


# =========================================================
# OPTIMIZED STUDENT DATASET
# =========================================================

def build_student_dataset(db) -> pd.DataFrame:
    """
    Build one student-level ML dataset.

    OPTIMIZATION:
    Instead of scanning the complete results DataFrame for every student,
    results are normalized and aggregated once using groupby().
    """

    students = _collection_df(db, "students")
    results = _collection_df(db, "results")

    if students.empty:
        return pd.DataFrame()

    # -----------------------------------------------------
    # Normalize student IDs
    # -----------------------------------------------------

    students["student_id"] = (
        students["student_id"]
        .astype(str)
        .str.strip()
        .str.upper()
    )

    students = students[students["student_id"] != ""]

    # -----------------------------------------------------
    # If there are no results
    # -----------------------------------------------------

    if results.empty or "student_id" not in results.columns:

        students["attendance"] = pd.to_numeric(
            students.get("attendance", 0),
            errors="coerce"
        ).fillna(0)

        students["cgpa"] = pd.to_numeric(
            students.get("cgpa", 0),
            errors="coerce"
        ).fillna(0)

        students["semester"] = (
            pd.to_numeric(
                students.get("semester", 1),
                errors="coerce"
            )
            .fillna(1)
            .clip(1, 8)
            .astype(int)
        )

        students["department"] = (
            students.get("department", "Unknown")
            .fillna("Unknown")
            .astype(str)
            .str.strip()
            .replace("", "Unknown")
        )

        students["avg_marks_percentage"] = 0.0
        students["failed_results"] = 0
        students["result_count"] = 0

        students["observed_result"] = "Pass"

        students["dropout_risk"] = students.get(
            "dropout_risk",
            students.get(
                "dropout",
                students.get("dropout_status")
            )
        )

        return students[
            [
                "student_id",
                "attendance",
                "cgpa",
                "avg_marks_percentage",
                "failed_results",
                "result_count",
                "semester",
                "department",
                "observed_result",
                "dropout_risk",
            ]
        ].copy()

    # =====================================================
    # RESULTS NORMALIZATION
    # =====================================================

    results["student_id"] = (
        results["student_id"]
        .astype(str)
        .str.strip()
        .str.upper()
    )

    # -----------------------------------------------------
    # Numeric conversion
    # -----------------------------------------------------

    if "marks_obtained" in results.columns:
        results["marks_obtained"] = pd.to_numeric(
            results["marks_obtained"],
            errors="coerce"
        ).fillna(0)
    else:
        results["marks_obtained"] = 0

    if "total_marks" in results.columns:
        results["total_marks"] = pd.to_numeric(
            results["total_marks"],
            errors="coerce"
        ).fillna(0)
    else:
        results["total_marks"] = 0

    # -----------------------------------------------------
    # Calculate percentage ONCE for all results
    # -----------------------------------------------------

    results["percentage"] = np.where(
        results["total_marks"] > 0,
        (results["marks_obtained"] / results["total_marks"]) * 100,
        np.nan,
    )

    # =====================================================
    # OPTIMIZATION
    # =====================================================
    #
    # OLD:
    #
    # for every student:
    #     results[results.student_id == student_id]
    #
    # NEW:
    #
    # group all results once.
    # =====================================================

    result_summary = (
        results
        .groupby("student_id", sort=False)
        .agg(
            avg_marks_percentage=("percentage", "mean"),
            result_count=("percentage", lambda x: x.notna().sum()),
        )
        .reset_index()
    )

    # -----------------------------------------------------
    # Failed result count
    # -----------------------------------------------------

    if "status" in results.columns:

        failed_results = (
            results.assign(
                is_failed=
                results["status"]
                .astype(str)
                .str.strip()
                .str.lower()
                .eq("fail")
                .astype(int)
            )
            .groupby("student_id", sort=False)["is_failed"]
            .sum()
            .reset_index(name="failed_results")
        )

        result_summary = result_summary.merge(
            failed_results,
            on="student_id",
            how="left",
        )

    else:

        result_summary["failed_results"] = 0

    # -----------------------------------------------------
    # Merge student data with result summary
    # -----------------------------------------------------

    df = students.merge(
        result_summary,
        on="student_id",
        how="left",
    )

    # =====================================================
    # STUDENT FEATURES
    # =====================================================

    df["attendance"] = pd.to_numeric(
        df.get("attendance", 0),
        errors="coerce"
    ).fillna(0)

    df["cgpa"] = pd.to_numeric(
        df.get("cgpa", 0),
        errors="coerce"
    ).fillna(0)

    df["semester"] = (
        pd.to_numeric(
            df.get("semester", 1),
            errors="coerce"
        )
        .fillna(1)
        .clip(1, 8)
        .astype(int)
    )

    df["department"] = (
        df.get("department", "Unknown")
        .fillna("Unknown")
        .astype(str)
        .str.strip()
        .replace("", "Unknown")
    )

    # -----------------------------------------------------
    # Fill result values
    # -----------------------------------------------------

    df["avg_marks_percentage"] = (
        pd.to_numeric(
            df["avg_marks_percentage"],
            errors="coerce"
        )
        .fillna(
            pd.to_numeric(
                df.get("average_percentage", 0),
                errors="coerce"
            )
        )
        .fillna(0)
        .round(2)
    )

    df["result_count"] = (
        pd.to_numeric(
            df["result_count"],
            errors="coerce"
        )
        .fillna(0)
        .astype(int)
    )

    df["failed_results"] = (
        pd.to_numeric(
            df["failed_results"],
            errors="coerce"
        )
        .fillna(0)
        .astype(int)
    )

    # -----------------------------------------------------
    # Performance target
    # -----------------------------------------------------

    df["observed_result"] = np.where(
        (df["failed_results"] > 0)
        & (df["avg_marks_percentage"] < 50),
        "Fail",
        "Pass",
    )

    # -----------------------------------------------------
    # Dropout information
    # -----------------------------------------------------

    if "dropout_risk" in df.columns:
        dropout_values = df["dropout_risk"]
    elif "dropout" in df.columns:
        dropout_values = df["dropout"]
    elif "dropout_status" in df.columns:
        dropout_values = df["dropout_status"]
    else:
        dropout_values = pd.Series(
            [None] * len(df),
            index=df.index,
        )

    df["dropout_risk"] = dropout_values

    # -----------------------------------------------------
    # Return only ML fields
    # -----------------------------------------------------

    return df[
        [
            "student_id",
            "attendance",
            "cgpa",
            "avg_marks_percentage",
            "failed_results",
            "result_count",
            "semester",
            "department",
            "observed_result",
            "dropout_risk",
        ]
    ].copy()


# =========================================================
# ML PIPELINE
# =========================================================

def _pipeline(features: list[str]):

    categorical = [
        f for f in features
        if f == "department"
    ]

    numeric = [
        f for f in features
        if f != "department"
    ]

    prep = ColumnTransformer(
        [
            (
                "num",
                Pipeline(
                    [
                        (
                            "imputer",
                            SimpleImputer(
                                strategy="median"
                            ),
                        )
                    ]
                ),
                numeric,
            ),
            (
                "cat",
                Pipeline(
                    [
                        (
                            "imputer",
                            SimpleImputer(
                                strategy="most_frequent"
                            ),
                        ),
                        (
                            "onehot",
                            OneHotEncoder(
                                handle_unknown="ignore"
                            ),
                        ),
                    ]
                ),
                categorical,
            ),
        ]
    )

    return Pipeline(
        [
            ("preprocess", prep),
            (
                "model",
                RandomForestClassifier(
                    n_estimators=250,
                    random_state=42,
                    class_weight="balanced",
                ),
            ),
        ]
    )


# =========================================================
# CLASSIFIER TRAINING
# =========================================================

def _train_classifier(
    df: pd.DataFrame,
    features: list[str],
    target: str,
    model_name: str,
):

    if df.empty:
        raise ValueError(
            "No MongoDB records are available for training."
        )

    data = df.dropna(
        subset=[target]
    ).copy()

    data = data.drop_duplicates()

    if data[target].nunique() < 2:
        raise ValueError(
            f"{model_name}: at least two target classes are required."
        )

    X = data[features]

    y = data[target].astype(str)

    if len(data) < 10:
        raise ValueError(
            f"{model_name}: at least 10 training records "
            f"are recommended; found {len(data)}."
        )

    stratify = (
        y
        if y.value_counts().min() >= 2
        else None
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=stratify,
    )

    pipe = _pipeline(features)

    pipe.fit(
        X_train,
        y_train,
    )

    pred = pipe.predict(X_test)

    accuracy = float(
        accuracy_score(
            y_test,
            pred,
        )
    )

    model_path = (
        MODEL_DIR
        / f"{model_name}_model.joblib"
    )

    joblib.dump(
        pipe,
        model_path,
    )

    return {
        "model": model_name,
        "accuracy": round(
            accuracy * 100,
            2,
        ),
        "records": int(len(data)),
        "classes": sorted(
            y.unique().tolist()
        ),
        "model_path": model_path.name,
        "trained_at": _now(),
        "report": classification_report(
            y_test,
            pred,
            output_dict=True,
            zero_division=0,
        ),
    }


# =========================================================
# PERFORMANCE
# =========================================================

def train_performance(db):

    df = build_student_dataset(db)

    return _train_classifier(
        df,
        PERF_FEATURES,
        "observed_result",
        "performance",
    )


# =========================================================
# DROPOUT
# =========================================================

def _derive_dropout_label(row):

    raw = row.get("dropout_risk")

    if raw is not None and str(raw).strip():
        return str(raw).strip().title()

    score = 0

    if row["attendance"] < 60:
        score += 2

    elif row["attendance"] < 75:
        score += 1

    if row["cgpa"] < 2.0:
        score += 2

    elif row["cgpa"] < 2.5:
        score += 1

    if row["avg_marks_percentage"] < 50:
        score += 2

    elif row["avg_marks_percentage"] < 65:
        score += 1

    if row["failed_results"] >= 2:
        score += 2

    elif row["failed_results"] == 1:
        score += 1

    return (
        "High"
        if score >= 5
        else "Medium"
        if score >= 2
        else "Low"
    )


def train_dropout(db):

    df = build_student_dataset(db)

    if df.empty:
        raise ValueError(
            "No MongoDB student records are available "
            "for dropout training."
        )

    df["dropout_target"] = df.apply(
        _derive_dropout_label,
        axis=1,
    )

    result = _train_classifier(
        df,
        DROPOUT_FEATURES,
        "dropout_target",
        "dropout",
    )

    result["target_source"] = (
        "student.dropout_risk/dropout_status "
        "when present; otherwise derived from "
        "current attendance, CGPA, marks and failures"
    )

    return result


# =========================================================
# COURSE DATASET
# =========================================================

def build_course_dataset(db):

    courses = _collection_df(
        db,
        "courses",
    )

    results = _collection_df(
        db,
        "results",
    )

    if courses.empty:
        return pd.DataFrame()

    course_data = []

    # -----------------------------------------------------
    # Calculate enrollment
    # -----------------------------------------------------

    if not results.empty and "course_id" in results.columns:

        results["course_id"] = (
            results["course_id"]
            .astype(str)
            .str.strip()
            .str.upper()
        )

        if "student_id" in results.columns:

            enrollment_summary = (
                results.groupby("course_id")
                ["student_id"]
                .nunique()
                .to_dict()
            )

        else:
            enrollment_summary = {}

        if "teacher_id" in results.columns:

            teacher_summary = (
                results.groupby("course_id")
                ["teacher_id"]
                .nunique()
                .to_dict()
            )

        else:
            teacher_summary = {}

    else:

        enrollment_summary = {}
        teacher_summary = {}

    # -----------------------------------------------------
    # Build course data
    # -----------------------------------------------------

    for _, course in courses.iterrows():

        code = str(
            course.get(
                "course_code",
                course.get(
                    "course_id",
                    "",
                ),
            )
        ).strip()

        if not code:
            continue

        normalized_code = code.upper()

        students_enrolled = enrollment_summary.get(
            normalized_code,
            _safe_int(
                course.get(
                    "students_enrolled"
                )
            ),
        )

        teacher_count = teacher_summary.get(
            normalized_code,
            _safe_int(
                course.get(
                    "teacher_count"
                )
            ),
        )

        previous = _safe_float(
            course.get(
                "previous_demand",
                students_enrolled,
            )
        )

        course_data.append(
            {
                "course": course,
                "code": code,
                "students_enrolled": students_enrolled,
                "teacher_count": teacher_count,
                "previous": previous,
            }
        )

    if not course_data:
        return pd.DataFrame()

    # =====================================================
    # RANK COURSES
    # =====================================================

    course_data.sort(
        key=lambda item: item[
            "students_enrolled"
        ]
    )

    total_courses = len(
        course_data
    )

    low_end = total_courses // 3

    medium_end = (
        total_courses * 2
    ) // 3

    rows = []

    for index, item in enumerate(
        course_data
    ):

        if index < low_end:
            demand = "Low"

        elif index < medium_end:
            demand = "Medium"

        else:
            demand = "High"

        course = item["course"]

        rows.append(
            {
                "course_code": item["code"],

                "department": str(
                    course.get(
                        "department"
                    )
                    or "Unknown"
                ).strip()
                or "Unknown",

                "semester": max(
                    1,
                    min(
                        8,
                        _safe_int(
                            course.get(
                                "semester"
                            ),
                            1,
                        ),
                    ),
                ),

                "students_enrolled": item[
                    "students_enrolled"
                ],

                "teacher_count": item[
                    "teacher_count"
                ],

                "previous_demand": item[
                    "previous"
                ],

                "course_demand": demand,
            }
        )

    return pd.DataFrame(
        rows
    )


# =========================================================
# COURSE DEMAND TRAINING
# =========================================================

def train_course_demand(db):

    df = build_course_dataset(db)

    result = _train_classifier(
        df,
        COURSE_FEATURES,
        "course_demand",
        "course_demand",
    )

    result["target_source"] = (
        "Course demand derived from current "
        "course enrollment ranking."
    )

    return result


# =========================================================
# ANOMALY TRAINING
# =========================================================

def train_anomaly(db):

    df = build_student_dataset(db)

    if len(df) < 10:
        raise ValueError(
            "At least 10 student records are "
            "recommended for anomaly detection."
        )

    features = [
        "attendance",
        "cgpa",
        "avg_marks_percentage",
        "failed_results",
        "semester",
    ]

    x = df[
        features
    ].fillna(0)

    contamination = min(
        0.15,
        max(
            0.01,
            5 / len(df),
        ),
    )

    model = IsolationForest(
        contamination=contamination,
        random_state=42,
    )

    model.fit(x)

    model_path = (
        MODEL_DIR
        / "anomaly_model.joblib"
    )

    joblib.dump(
        {
            "model": model,
            "features": features,
        },
        model_path,
    )

    labels = model.predict(x)

    return {
        "model": "anomaly",
        "records": int(len(df)),
        "anomalies": int(
            (labels == -1).sum()
        ),
        "trained_at": _now(),
        "model_path": model_path.name,
    }


# =========================================================
# RETRAIN ALL
# =========================================================

def retrain_all(db):

    results = []

    for fn in (
        train_performance,
        train_dropout,
        train_course_demand,
        train_anomaly,
    ):

        results.append(
            fn(db)
        )

    metadata = {
        "trained_at": _now(),
        "source": "MongoDB",
        "models": results,
    }

    METADATA_PATH.write_text(
        json.dumps(
            metadata,
            indent=2,
            default=str,
        ),
        encoding="utf-8",
    )

    return metadata


# =========================================================
# LOAD METADATA
# =========================================================

def load_metadata():

    if not METADATA_PATH.exists():

        return {
            "trained_at": None,
            "source": "MongoDB",
            "models": [],
        }

    try:

        return json.loads(
            METADATA_PATH.read_text(
                encoding="utf-8"
            )
        )

    except Exception:

        return {
            "trained_at": None,
            "source": "MongoDB",
            "models": [],
        }


# =========================================================
# ANOMALY RESULTS
# =========================================================

def anomaly_results(
    db,
    limit: int = 50,
):

    df = build_student_dataset(
        db
    )

    if df.empty:
        return []

    features = [
        "attendance",
        "cgpa",
        "avg_marks_percentage",
        "failed_results",
        "semester",
    ]

    x = df[
        features
    ].fillna(0)

    if len(df) < 10:
        return []

    model_path = (
        MODEL_DIR
        / "anomaly_model.joblib"
    )

    if model_path.exists():

        artifact = joblib.load(
            model_path
        )

        model = artifact[
            "model"
        ]

    else:

        model = IsolationForest(
            contamination=min(
                0.15,
                max(
                    0.01,
                    5 / len(df),
                ),
            ),
            random_state=42,
        ).fit(x)

    labels = model.predict(x)

    scores = model.decision_function(
        x
    )

    out = []

    for i, (_, row) in enumerate(
        df.iterrows()
    ):

        if labels[i] == -1:

            out.append(
                {
                    "student_id": row[
                        "student_id"
                    ],

                    "attendance": row[
                        "attendance"
                    ],

                    "cgpa": row[
                        "cgpa"
                    ],

                    "avg_marks_percentage": row[
                        "avg_marks_percentage"
                    ],

                    "failed_results": row[
                        "failed_results"
                    ],

                    "anomaly_score": round(
                        float(
                            scores[i]
                        ),
                        4,
                    ),

                    "status": "Anomaly",
                }
            )

    return sorted(
        out,
        key=lambda x:
            x["anomaly_score"],
    )[:limit]


# =========================================================
# CORRELATION
# =========================================================

def correlation_matrix(db):

    df = build_student_dataset(
        db
    )

    if df.empty:
        return []

    numeric_columns = [
        "attendance",
        "cgpa",
        "avg_marks_percentage",
        "failed_results",
        "result_count",
        "semester",
    ]

    numeric = (
        df[numeric_columns]
        .apply(
            pd.to_numeric,
            errors="coerce",
        )
        .corr()
        .round(3)
    )

    return [
        {
            "feature": index,
            **{
                column: float(
                    numeric.loc[
                        index,
                        column,
                    ]
                )
                for column in numeric.columns
            },
        }
        for index in numeric.index
    ]


# =========================================================
# SEMESTER TREND
# =========================================================

def semester_trend(db):

    df = build_student_dataset(
        db
    )

    if df.empty:
        return []

    trend = (
        df.groupby("semester")
        .agg(
            average_cgpa=(
                "cgpa",
                "mean",
            ),
            average_attendance=(
                "attendance",
                "mean",
            ),
            average_marks=(
                "avg_marks_percentage",
                "mean",
            ),
        )
        .reset_index()
        .round(2)
    )

    trend[
        "cgpa_status"
    ] = (
        trend["average_cgpa"]
        .diff()
        .apply(
            lambda x:
                "Increasing"
                if pd.notna(x)
                and x > 0
                else "Decreasing"
                if pd.notna(x)
                and x < 0
                else "Start"
        )
    )

    trend[
        "attendance_status"
    ] = (
        trend[
            "average_attendance"
        ]
        .diff()
        .apply(
            lambda x:
                "Increasing"
                if pd.notna(x)
                and x > 0
                else "Decreasing"
                if pd.notna(x)
                and x < 0
                else "Start"
        )
    )

    return trend.to_dict(
        orient="records"
    )