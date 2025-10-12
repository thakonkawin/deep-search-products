import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Integer, Numeric, Text, DateTime, ForeignKey

Base = declarative_base()


class Product(Base):
    __tablename__ = "products"

    product_code = Column(String(50), primary_key=True, index=True)
    product_name = Column(Text, nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    category = Column(String(100))
    unit = Column(String(50))
    shelf = Column(String(50))
    image_url = Column(Text)


class ProductSchema(BaseModel):
    product_code: str
    product_name: str
    description: Optional[str] = None
    price: float
    quantity: int
    category: Optional[str] = None
    unit: Optional[str] = None
    shelf: Optional[str] = None
    image_url: Optional[str] = None

    model_config = dict(from_attributes=True)


class ShortProductSchema(BaseModel):
    product_code: str
    product_name: str
    image_url: Optional[str] = None

    model_config = dict(from_attributes=True)


class ProductVector(Base):
    __tablename__ = "product_image_vectors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_code = Column(
        String(50), ForeignKey("products.product_code"), nullable=False
    )
    embeded = Column(Vector(128), nullable=False)
    created_at = Column(DateTime, default=datetime.now())
