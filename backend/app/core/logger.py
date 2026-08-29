import logging
import sys

logger = logging.getLogger("EduPredict")

logger.setLevel(logging.INFO)

# Duplicate handlers avoid karne ke liye
if not logger.handlers:

    console_handler = logging.StreamHandler(sys.stdout)

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(message)s"
    )

    console_handler.setFormatter(formatter)

    logger.addHandler(console_handler)

# Parent logger ko duplicate logs bhejne se rokta hai
logger.propagate = False