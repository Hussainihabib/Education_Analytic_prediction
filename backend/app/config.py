# from dotenv import load_dotenv
# import os

# load_dotenv()

# MONGO_URI = os.getenv("MONGO_URI")
# DATABASE_NAME = os.getenv("DATABASE_NAME")

# SECRET_KEY = os.getenv("SECRET_KEY")
# ALGORITHM = os.getenv("ALGORITHM")
# ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

from dotenv import load_dotenv
import os

load_dotenv()

# ==========================
# Database
# ==========================

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# ==========================
# JWT
# ==========================

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)
)

# ==========================
# ML Model
# ==========================

MODEL_PATH = os.getenv(
    "MODEL_PATH",
    "app/ml/models/student_prediction.pkl"
)

# ==========================
# Debug Mode
# ==========================

DEBUG = os.getenv(
    "DEBUG",
    "True"
).lower() == "true"

# ==========================
# Startup Validation
# ==========================

_missing = [
    name for name, value in {
        "MONGO_URI": MONGO_URI,
        "DATABASE_NAME": DATABASE_NAME,
        "SECRET_KEY": SECRET_KEY,
        "ALGORITHM": ALGORITHM,
    }.items() if not value
]

if _missing:
    raise RuntimeError(
        f"Missing required environment variable(s): {', '.join(_missing)}. "
        "Check your .env file."
    )

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)    