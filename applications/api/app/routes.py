import os
import torch
import numpy as np
from typing import List
from .database import get_db
from sqlalchemy import insert, select, func, delete
from fastapi.params import Form, File
from .models.model import DeepSearchShoeModel
from .models.utils import get_image_embedding, cosine_distance_to_percent
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from .products import (
    Product,
    ProductSchema,
    ProductStatisticsResponse,
    LowStockProduct,
    ProductVector,
)
import base64
from fastapi.responses import Response
import uuid

router = APIRouter()

MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "models/deep_search_shoe_model.pth"
)

model = DeepSearchShoeModel(embedding_size=128)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
state_dict = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(state_dict)
model.to(device)
model.eval()


@router.get("/products", tags=["Product"], response_model=list[ProductSchema])
async def get_products(
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(
            Product.product_code,
            Product.product_name,
            Product.description,
            Product.price,
            Product.quantity,
            Product.category,
            Product.unit,
            Product.shelf,
            func.array_agg(ProductVector.id).label("image_id"),
        )
        .join(
            ProductVector,
            Product.product_code == ProductVector.product_code,
            isouter=True,
        )
        .group_by(
            Product.product_code,
            Product.product_name,
            Product.description,
            Product.price,
            Product.quantity,
            Product.category,
            Product.unit,
            Product.shelf,
        )
        .order_by(Product.product_code)
    )

    result = await db.execute(stmt)

    rows = result.mappings().all()

    products = []
    for row in rows:
        raw_image_ids = row["image_id"] or []

        image_ids = []
        for item in raw_image_ids:
            if item is not None:
                if isinstance(item, uuid.UUID):
                    image_ids.append(item)
                else:
                    image_ids.append(uuid.UUID(str(item)))

        products.append(
            ProductSchema(
                product_code=row["product_code"],
                product_name=row["product_name"],
                description=row["description"],
                price=float(row["price"]),
                quantity=row["quantity"],
                category=row["category"],
                unit=row["unit"],
                shelf=row["shelf"],
                image_id=image_ids,
            )
        )

    return products


@router.get(
    "/products/statistics", tags=["Product"], response_model=ProductStatisticsResponse
)
async def get_product_statistics(db: AsyncSession = Depends(get_db)):
    try:
        total_stmt = select(func.count(Product.product_code))
        total_result = await db.execute(total_stmt)
        total_products = total_result.scalar()

        quantity_stmt = select(func.sum(Product.quantity))
        quantity_result = await db.execute(quantity_stmt)
        total_quantity = quantity_result.scalar() or 0

        category_stmt = select(func.count(func.distinct(Product.category)))
        category_result = await db.execute(category_stmt)
        total_categories = category_result.scalar()

        low_stock_stmt = (
            select(Product.product_code, Product.product_name, Product.quantity)
            .order_by(Product.quantity.asc())
            .limit(5)
        )
        low_stock_result = await db.execute(low_stock_stmt)
        low_stock_products = low_stock_result.all()

        return ProductStatisticsResponse(
            total_products=total_products,
            total_quantity=total_quantity,
            total_categories=total_categories,
            low_stock_products=[
                LowStockProduct(
                    product_code=row.product_code,
                    product_name=row.product_name,
                    quantity=row.quantity,
                )
                for row in low_stock_products
            ],
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching statistics: {str(e)}"
        )


@router.get("/products/{product_code}", response_model=ProductSchema, tags=["Product"])
async def get_product_details(product_code: str, db: AsyncSession = Depends(get_db)):
    product_stmt = select(Product).where(Product.product_code == product_code)
    product_result = await db.execute(product_stmt)
    product = product_result.scalars().first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    vector_stmt = select(ProductVector.id).where(
        ProductVector.product_code == product_code
    )
    vector_result = await db.execute(vector_stmt)
    image_ids = [row[0] for row in vector_result.all()]

    product_data = ProductSchema.model_validate(product)
    product_data.image_id = image_ids

    return product_data


@router.post("/products", response_model=ProductSchema, tags=["Product"])
async def add_product(product: ProductSchema, db: AsyncSession = Depends(get_db)):
    product_data = product.model_dump(exclude={"image_id"})
    new_product = Product(**product_data)
    db.add(new_product)
    try:
        await db.commit()
        await db.refresh(new_product)
        return new_product
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/products-vectors", tags=["Product"])
async def upload_product_vectors(
    product_code: str = Form(...),
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
):
    try:

        if len(files) == 0:
            raise HTTPException(status_code=400, detail="No file uploaded")

        vectors_to_insert = []

        for file in files:
            image_bytes = await file.read()
            if not image_bytes:
                raise HTTPException(status_code=400, detail="Uploaded file is empty")

            embedding = get_image_embedding(model, image_bytes, device)
            if embedding is None:
                raise HTTPException(status_code=500, detail="Failed to get embedding")
            vector = np.array(embedding).flatten().tolist()

            image_base64 = base64.b64encode(image_bytes).decode("utf-8")
            vectors_to_insert.append(
                {
                    "product_code": product_code,
                    "embeded": vector,
                    "image": image_base64,
                }
            )

        stmt = insert(ProductVector).values(vectors_to_insert)
        await db.execute(stmt)
        await db.commit()

        return {
            "status": "success",
            "product_code": product_code,
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/deep", tags=["Product"])
async def upload_product_vectors(
    file: UploadFile = File(...), db: AsyncSession = Depends(get_db)
):
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")

        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        embedding = get_image_embedding(model, image_bytes, device)
        if embedding is None:
            raise HTTPException(status_code=500, detail="Failed to generate embedding")

        vector = np.array(embedding).flatten()

        stmt = (
            select(
                ProductVector.id,
                ProductVector.product_code,
                ProductVector.embeded.cosine_distance(vector).label("distance"),
            )
            .order_by("distance")
            .limit(10)
        )

        result = await db.execute(stmt)
        rows = result.all()

        seen = set()
        unique_matches = []
        for row in rows:
            if row.product_code not in seen:
                distance = cosine_distance_to_percent(row.distance)
                unique_matches.append(
                    {
                        # "id": str(row.id),
                        "product_code": row.product_code,
                        "similarity": distance,
                    }
                )
                seen.add(row.product_code)
            if len(unique_matches) >= 5:
                break

            if not unique_matches or all(
                match["similarity"] < 50 for match in unique_matches
            ):
                raise HTTPException(status_code=400, detail="Image not match")

        return {"matches": unique_matches}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/products/image/{id}", tags=["Product"])
async def get_product_image(id: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(ProductVector).where(ProductVector.id == id))
        product = result.scalars().first()

        if not product or not product.image:
            raise HTTPException(status_code=404, detail="Image not found")

        image_blob = base64.b64decode(product.image)
        return Response(content=image_blob, media_type="image/jpeg")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/products/{product_code}", status_code=204, tags=["Product"])
async def delete_product(product_code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product).where(Product.product_code == product_code)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.execute(
        delete(ProductVector).where(ProductVector.product_code == product_code)
    )

    await db.delete(product)
    await db.commit()

    return


@router.delete("/products/image/{id}", status_code=204, tags=["Product"])
async def delete_product(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProductVector).where(ProductVector.id == id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="ProductVector not found")

    await db.delete(product)
    await db.commit()

    return


@router.put("/products/{product_code}", response_model=ProductSchema, tags=["Product"])
async def update_product(
    product_code: str,
    product_update: ProductSchema,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product).where(Product.product_code == product_code)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_update.model_dump(exclude={"product_code", "image_id"})
    for key, value in update_data.items():
        setattr(product, key, value)

    db.add(product)
    await db.commit()
    await db.refresh(product)

    vector_stmt = select(ProductVector.id).where(
        ProductVector.product_code == product_code
    )
    vector_result = await db.execute(vector_stmt)
    image_ids = [row[0] for row in vector_result.all()]

    product_data = ProductSchema.model_validate(product)
    product_data.image_id = image_ids
    return product_data
