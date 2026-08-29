# from pyspark.sql import SparkSession


# def get_spark_session():

#     spark = (

#         SparkSession.builder

#         .appName("EduPredict Analytics")

#         .master("local[*]")

#         .config(
#             "spark.sql.shuffle.partitions",
#             "4"
#         )

#         .getOrCreate()

#     )

#     spark.sparkContext.setLogLevel(
#         "ERROR"
#     )


#     return spark

import os
import sys
from pyspark.sql import SparkSession

os.environ["PYSPARK_PYTHON"] = sys.executable
os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable


def get_spark_session():

    spark = (
        SparkSession.builder
        .master("local[*]")
        .appName("EduPredict Analytics")
        .config("spark.sql.shuffle.partitions", "4")
        .getOrCreate()
    )

    spark.sparkContext.setLogLevel("ERROR")

    return spark