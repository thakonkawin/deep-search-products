import os
import torch
import numpy as np
from typing import List
from .database import get_db
from sqlalchemy import insert, select
from fastapi.params import Form, File
from .models.model import DeepSearchShoeModel
from .models.utils import get_image_embedding
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from .products import Product, ProductSchema, ShortProductSchema, ProductVector

router = APIRouter()


MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "models/deep_search_shoe_model.pth"
)


model = DeepSearchShoeModel(embedding_size=128)
state_dict = torch.load(MODEL_PATH, map_location=torch.device("cpu"))
model.load_state_dict(state_dict)


@router.get("/products", response_model=list[ShortProductSchema])
async def get_products(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Product).order_by(Product.product_code))
    return result.scalars().all()


@router.get("/products/{product_code}", response_model=ProductSchema)
async def get_product_details(product_code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product).where(Product.product_code == product_code)
    )
    product = result.scalars().first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/products", response_model=ProductSchema)
async def add_product(product: ProductSchema, db: AsyncSession = Depends(get_db)):
    new_product = Product(**product.model_dump())
    db.add(new_product)
    try:
        await db.commit()
        await db.refresh(new_product)
        return new_product
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/products-vectors")
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

            embedding = get_image_embedding(model, image_bytes)
            if embedding is None:
                raise HTTPException(status_code=500, detail="Failed to get embedding")
            vector = np.array(embedding).flatten().tolist()

            vectors_to_insert.append(
                {
                    "product_code": product_code,
                    "embeded": vector,
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


@router.post("/deep")
async def upload_product_vectors(
    file: UploadFile = File(...), db: AsyncSession = Depends(get_db)
):
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")

        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        # สร้าง embedding
        embedding = get_image_embedding(model, image_bytes)
        if embedding is None:
            raise HTTPException(status_code=500, detail="Failed to generate embedding")

        # vector = np.array(embedding).flatten().tolist()
        vector = np.array(embedding).flatten()

        stmt = (
            select(
                ProductVector.product_code,
                ProductVector.embeded.l2_distance(vector).label("distance"),
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
                distance = float(row.distance)
                # cosine_sim = 1.0 - (0.5 * (distance**2))

                unique_matches.append(
                    {
                        "product_code": row.product_code,
                        "similarity": distance,
                    }
                )
                seen.add(row.product_code)
            if len(unique_matches) >= 5:
                break

            # ตรวจสอบ threshold ของ cosine_similarity
            # if not unique_matches or all(
            #     match["similarity"] > 0.7 for match in unique_matches
            # ):
            #     raise HTTPException(status_code=400, detail="Image not match")

        return {"matches": unique_matches}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


def cosine_distance_to_percent(distance: float) -> float:
    return max(0, min(100, (1 - distance / 2) * 100))
