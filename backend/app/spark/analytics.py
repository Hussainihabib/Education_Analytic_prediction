# from app.spark.spark_session import get_spark_session


# def load_csv(file_name):

#     spark = get_spark_session()

#     df = spark.read.csv(
#         f"app/dataset/{file_name}",
#         header=True,
#         inferSchema=True
#     )

#     return spark, df


# def students_by_department():

#     spark, df = load_csv("students.csv")

#     result = (
#         df.groupBy("department")
#         .count()
#         .orderBy("count", ascending=False)
#     )

#     result.show()

#     spark.stop()


# def attendance_summary():

#     spark, df = load_csv("attendance.csv")

#     result = (
#         df.groupBy("status")
#         .count()
#     )

#     result.show()

#     spark.stop()


# def result_summary():

#     spark, df = load_csv("results.csv")

#     result = (
#         df.groupBy("status")
#         .count()
#     )

#     result.show()

#     spark.stop()


from app.spark.spark_session import get_spark_session
from pyspark.sql.functions import col


def load_csv(file_name):

    spark = get_spark_session()

    df = spark.read.csv(
        f"app/dataset/{file_name}",
        header=True,
        inferSchema=True
    )

    return spark, df


def students_by_department():

    spark, df = load_csv("students.csv")

    if df.count() == 0:
        spark.stop()
        return []

    result = (
        df.groupBy("department")
        .count()
        .orderBy(col("count").desc())
    )

    data = result.toPandas().to_dict("records")

    spark.stop()

    return data


def attendance_summary():

    spark, df = load_csv("attendance.csv")

    if df.count() == 0:
        spark.stop()
        return []

    result = (
        df.groupBy("status")
        .count()
    )

    data = result.toPandas().to_dict("records")

    spark.stop()

    return data


def result_summary():

    spark, df = load_csv("results.csv")

    if df.count() == 0:
        spark.stop()
        return []

    result = (
        df.groupBy("status")
        .count()
    )

    data = result.toPandas().to_dict("records")

    spark.stop()

    return data
