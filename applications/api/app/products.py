import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Integer, Numeric, Text, DateTime, ForeignKey
from typing import List, Optional

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
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class ProductSchema(BaseModel):
    product_code: str
    product_name: str
    description: Optional[str] = None
    price: float
    quantity: int
    category: Optional[str] = None
    unit: Optional[str] = None
    shelf: Optional[str] = None
    image_id: List[uuid.UUID] = Field(default_factory=list)

    model_config = dict(from_attributes=True)


class ShortProductSchema(BaseModel):
    product_code: str
    product_name: str
    image_id: List[uuid.UUID] = Field(default_factory=list)

    model_config = dict(from_attributes=True)


class ProductVector(Base):
    __tablename__ = "product_image_vectors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_code = Column(
        String(50), ForeignKey("products.product_code"), nullable=False
    )
    embeded = Column(Vector(128), nullable=False)
    image = Column(Text)
    created_at = Column(DateTime, default=datetime.now)

class LowStockProduct(BaseModel):
    product_code: str
    product_name: str
    quantity: int

class ProductStatisticsResponse(BaseModel):
    total_products: int
    total_quantity: int
    total_categories: int
    low_stock_products: List[LowStockProduct]