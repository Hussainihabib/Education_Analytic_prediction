import re
from typing import Any


def text(value: Any, field: str, *, min_len: int = 1, max_len: int = 255) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field} must be text")
    if not value.strip():
        raise ValueError(f"{field} cannot be empty")
    if value != value.strip():
        raise ValueError(f"{field} cannot have leading or trailing spaces")
    if "  " in value:
        raise ValueError(f"{field} cannot contain multiple consecutive spaces")
    if not min_len <= len(value) <= max_len:
        raise ValueError(f"{field} length must be between {min_len} and {max_len}")
    return value


def name(value: Any, field: str) -> str:
    value = text(value, field, min_len=2, max_len=50)
    if not re.fullmatch(r"[A-Za-z]+(?: [A-Za-z]+)*", value):
        raise ValueError(f"{field} must contain alphabets only")
    return value


def identifier(value: Any, field: str, min_len: int = 3, max_len: int = 20) -> str:
    value = text(value, field, min_len=min_len, max_len=max_len)
    if not re.fullmatch(r"[A-Za-z0-9_-]+", value):
        raise ValueError(f"{field} can contain only letters, numbers, '-' and '_'")
    return value.upper()


def alphabetic_text(value: Any, field: str, min_len: int = 2, max_len: int = 100) -> str:
    value = text(value, field, min_len=min_len, max_len=max_len)
    if not re.fullmatch(r"[A-Za-z]+(?: [A-Za-z]+)*", value):
        raise ValueError(f"{field} must contain alphabets only")
    return value


def general_text(value: Any, field: str, min_len: int = 1, max_len: int = 255) -> str:
    return text(value, field, min_len=min_len, max_len=max_len)


def phone(value: Any) -> str:
    if not isinstance(value, str) or not re.fullmatch(r"03\d{9}", value):
        raise ValueError("Phone must contain exactly 11 digits and start with 03")
    return value


def numeric(value: Any, field: str) -> Any:
    # JSON numbers only: reject numeric strings and booleans.
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{field} must be a number")
    return value


def integer(value: Any, field: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError(f"{field} must be an integer")
    return value
