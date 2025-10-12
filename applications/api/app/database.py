from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

# for run manual
# DATABASE_URL = (
#     "postgresql+asyncpg://myuser:mypassword@127.0.0.1:5432/deep_project_db"
# )

# for run with docker
DATABASE_URL = (
    "postgresql+asyncpg://myuser:mypassword@host.docker.internal:5432/deep_project_db"
)

engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
