from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import certifi

from app.config import (
    MONGO_URI,
    DATABASE_NAME
)

try:
    client = MongoClient(
        MONGO_URI,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=20000,
        connectTimeoutMS=20000,
    )

    client.admin.command("ping")

    print("MongoDB Connected Successfully")

    db = client[DATABASE_NAME]

except ConnectionFailure:
    print("MongoDB Connection Failed")
    raise


def get_database():
    return db