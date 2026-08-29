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

print("\n====================================")
print("Student Performance Correlation")
print("====================================\n")

# ==========================================
# Select Numeric Columns
# ==========================================

numeric_df = df.select_dtypes(include=["number"])

# ==========================================
# Correlation Matrix
# ==========================================

correlation = numeric_df.corr()

print(correlation)

# ==========================================
# Strong Correlations
# ==========================================

print("\n====================================")
print("Strong Correlations (> 0.60)")
print("====================================\n")

for column in correlation.columns:

    for row in correlation.index:

        value = correlation.loc[row, column]

        if row != column and abs(value) >= 0.60:

            print(
                f"{row:20} <--> {column:20} = {value:.2f}"
            )