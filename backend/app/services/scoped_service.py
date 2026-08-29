from app.database.connection import db
from app.auth.access import get_scope_query, merge_filters

_COLLECTIONS = {
    "students": "students",
    "teachers": "teachers",
    "courses": "courses",
    "attendance": "attendance",
    "results": "results",
}


def _collection(resource):
    return db[_COLLECTIONS[resource]]


def list_scoped(resource, user, extra=None, sort=None, skip=None, limit=None):
    collection = _collection(resource)
    query = merge_filters(get_scope_query(user, resource), extra)
    cursor = collection.find(query)
    if sort:
        cursor = cursor.sort(*sort)
    if skip is not None:
        cursor = cursor.skip(skip)
    if limit is not None:
        cursor = cursor.limit(limit)
    rows = []
    for row in cursor:
        row["_id"] = str(row["_id"])
        rows.append(row)
    return rows


def count_scoped(resource, user, extra=None):
    return _collection(resource).count_documents(
        merge_filters(get_scope_query(user, resource), extra)
    )


def get_scoped(resource, user, field, value):
    query = merge_filters(get_scope_query(user, resource), {field: value})
    row = _collection(resource).find_one(query)
    if row:
        row["_id"] = str(row["_id"])
    return row


def delete_scoped(resource, user, field, value):
    query = merge_filters(get_scope_query(user, resource), {field: value})
    return _collection(resource).delete_one(query).deleted_count


def update_scoped(resource, user, field, value, update):
    query = merge_filters(get_scope_query(user, resource), {field: value})
    return _collection(resource).update_one(query, {"$set": update}).modified_count
