# from fastapi import Request
# from fastapi.responses import JSONResponse
# from fastapi.exceptions import RequestValidationError
# from starlette.exceptions import HTTPException as StarletteHTTPException


# async def validation_exception_handler(
#     request: Request,
#     exc: RequestValidationError
# ):

#     return JSONResponse(

#         status_code=422,

#         content={

#             "success": False,

#             "message": "Validation Error",

#             "errors": exc.errors()

#         }

#     )


# async def http_exception_handler(
#     request: Request,
#     exc: StarletteHTTPException
# ):

#     return JSONResponse(

#         status_code=exc.status_code,

#         content={

#             "success": False,

#             "message": exc.detail

#         }

#     )


# async def global_exception_handler(
#     request: Request,
#     exc: Exception
# ):

#     return 00JSONResponse(

#         status_code=500,

#         content={

#             "success": False,

#             "message": "Internal Server Error"

#         }

#     )


from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    errors = []

    for error in exc.errors():
        # Convert FastAPI/Pydantic validation error
        # into a JSON-serializable structure.
        clean_error = {
            "type": error.get("type"),
            "loc": list(error.get("loc", [])),
            "msg": error.get("msg"),
            "input": error.get("input"),
        }

        # ctx can contain non-JSON-serializable objects
        # such as ValueError.
        if "ctx" in error:
            ctx = {}

            for key, value in error["ctx"].items():
                if isinstance(value, Exception):
                    ctx[key] = str(value)
                else:
                    ctx[key] = value

            clean_error["ctx"] = ctx

        errors.append(clean_error)

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Validation Error",
            "errors": errors
        }
    )


async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException
):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail)
        }
    )


async def global_exception_handler(
    request: Request,
    exc: Exception
):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal Server Error"
        }
    )


def register_exception_handlers(app):
    """Wire the handlers above onto the FastAPI app instance."""
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, global_exception_handler)

