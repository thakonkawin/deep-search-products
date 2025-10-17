import uvicorn
from .products import Base
from .database import engine
from fastapi import FastAPI
from contextlib import asynccontextmanager
from .routes import router as products_router
from fastapi.middleware.cors import CORSMiddleware


# DB Connection
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

    await engine.dispose()


app = FastAPI(lifespan=lifespan, title="Deep Product Search API", version="1.0.0")

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router)


# if __name__ == "__main__":
#     uvicorn.run("app.main:app", host="127.0.0.1", port=4345, reload=True)
