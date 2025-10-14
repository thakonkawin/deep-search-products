CREATE TABLE products (
    product_code        VARCHAR(50) PRIMARY KEY,  -- รหัสสินค้า
    product_name        TEXT NOT NULL,           -- ชื่อสินค้า
    description         TEXT,                    -- รายละเอียด
    price               NUMERIC(10, 2) NOT NULL, -- ราคา
    quantity            INTEGER NOT NULL,        -- จำนวนคงเหลือ
    category             VARCHAR(100),          -- หมวดหมู่
    unit                VARCHAR(50),           -- หน่วย (ชิ้น, กล่อง, ฯลฯ)
    shelf               VARCHAR(50),            -- ที่เก็บ / ชั้นวาง
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE product_image_vectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_code VARCHAR(50) NOT NULL REFERENCES products(product_code),
    embeded VECTOR(128) NOT NULL,
	image TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);