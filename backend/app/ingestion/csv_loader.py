"""
Generic educational dataset loader.

Supports:
.csv
.xlsx / .xls
.json
"""

from __future__ import annotations

import io
import json
import math
from datetime import date, datetime

import pandas as pd


SUPPORTED_EXTENSIONS = {".csv", ".xlsx", ".xls", ".json"}


def load_dataframe(filename: str, content: bytes) -> pd.DataFrame:
    """Parse uploaded file bytes into a pandas DataFrame."""

    lower = filename.lower()

    if lower.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(content))

    elif lower.endswith((".xlsx", ".xls")):
        df = pd.read_excel(io.BytesIO(content))

    elif lower.endswith(".json"):
        raw = json.loads(content.decode("utf-8"))
        df = pd.DataFrame(raw if isinstance(raw, list) else [raw])

    else:
        raise ValueError(
            f"Unsupported file type for '{filename}'. "
            f"Supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
        )

    return df


def _clean_value(value):
    """Convert pandas/numpy values into MongoDB/JSON-safe values."""

    # None
    if value is None:
        return None

    # Pandas missing values: NaN, NaT, etc.
    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass

    # Python float NaN / Infinity protection
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None

    # Pandas Timestamp
    if isinstance(value, pd.Timestamp):
        return value.to_pydatetime()

    # Python date/datetime
    if isinstance(value, (datetime, date)):
        return value

    # Convert numpy scalar types to normal Python types
    if hasattr(value, "item"):
        try:
            return value.item()
        except (ValueError, TypeError):
            pass

    return value


def clean_records(df: pd.DataFrame) -> list[dict]:
    """
    Clean uploaded educational data and return
    MongoDB/JSON-safe records.
    """

    # Remove completely empty rows
    df = df.dropna(how="all").copy()

    # Normalize column names
    df.columns = [
        str(c).strip().lower().replace(" ", "_")
        for c in df.columns
    ]

    # Convert dataframe to records first
    raw_records = df.to_dict("records")

    cleaned_records = []

    for record in raw_records:
        cleaned_record = {
            str(key): _clean_value(value)
            for key, value in record.items()
        }

        cleaned_records.append(cleaned_record)

    return cleaned_records