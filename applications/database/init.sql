CREATE TABLE products (
    product_code        VARCHAR(50) PRIMARY KEY,  -- รหัสสินค้า
    product_name        TEXT NOT NULL,           -- ชื่อสินค้า
    description         TEXT,                    -- รายละเอียด
    price               NUMERIC(10, 2) NOT NULL, -- ราคา
    quantity            INTEGER NOT NULL,        -- จำนวนคงเหลือ
    category            VARCHAR(100),          -- หมวดหมู่
    unit                VARCHAR(50),           -- หน่วย (ชิ้น, กล่อง, ฯลฯ)
    shelf               VARCHAR(50),            -- ที่เก็บ / ชั้นวาง
    image_url           TEXT                    -- ลิงก์รูปภาพ
);

INSERT INTO products (product_code, product_name, description, price, quantity, category, unit, shelf, image_url) VALUES
('HQ2037-100', 'Nike Air Force 1 07 LV8 white deep royal-blue', 'Air Force', 4700, 20, 'รองเท้า', 'คู่', 'A-01', 'https://drive.google.com/file/d/1as3f2PQ0o99TvpC_GPHaqd-HJrbjA-AV/view?usp=sharing'),
('315122-001', 'Nike Air Force 1 Low 07 Triple Black', 'Air Force', 3700, 19, 'รองเท้า', 'คู่', 'A-02', 'https://drive.google.com/uc?export=view&id=1IZXs24DNOI6eJJliOR6MTaoZ7yeYt07l'),
('DJ3911-100', 'Nike Air Force 1 Low 07 Triple White', 'Air Force', 3700, 21, 'รองเท้า', 'คู่', 'A-03', 'https://drive.google.com/uc?export=view&id=1z81zcOhC7lBVbxaPtObkh8EsdRZ7d0iv'),
('NIKE-SNSAJ1HOP4V49', 'nike air jordan 1 high og panda', 'Air Jordan', 6600, 20, 'รองเท้า', 'คู่', 'B-01', 'https://drive.google.com/uc?export=view&id=1fObVR1TIqxzIEQVWemZPE78zat4gIFs1'),
('DQ8426-402', 'nike air jordan 1 Mid Game Royal White', 'Air Jordan', 4900, 21, 'รองเท้า', 'คู่', 'B-02', 'https://drive.google.com/uc?export=view&id=1gjVn3vf_D6ucviJn_3bebq8YLweTFTL7'),
('554724-122', 'nike air jordan 1 mid gym red black white', 'Air Jordan', 4900, 20, 'รองเท้า', 'คู่', 'B-03', 'https://drive.google.com/uc?export=view&id=1a5-rG7DfabY9zAzWmk1jj4nImb6tpARs'),
('FD5810-101', 'Nike Air Max 90 Essential infrared 2010', 'Air Max', 5400, 24, 'รองเท้า', 'คู่', 'C-01', 'https://drive.google.com/uc?export=view&id=11NCNRmsnQLZk-cv1N0F78yLeERkvwLPR'),
('849559-100', 'Nike Air Max 2017 White Black Pure Platinum', 'Air Max', 7300, 21, 'รองเท้า', 'คู่', 'C-02', 'https://drive.google.com/uc?export=view&id=1OOElxBFoy1-qFf4xAKzJ53-EdR94F-Gq'),
('CV3427-107', 'Nike Alpha Huarache 7 Elite LAX Lacrosse Cleats', 'Cleats', 7170, 20, 'รองเท้า', 'คู่', 'C-03', 'https://drive.google.com/uc?export=view&id=1WSDivDWJ7qi3ugDUyr3IMTAMUXoEZTo8'),
('CD4161-006', 'NIKE PHANTOM VISION ELITE DF FG', 'Cleats', 8700, 23, 'รองเท้า', 'คู่', 'C-04', 'https://drive.google.com/uc?export=view&id=1jn8Ogl9YmIX-CJ5JeYJ4vKK4ZKaatx9W'),
('831960-801', 'Nike Mercurial Veloce III DF AG-PRO', 'Cleats', 4990, 20, 'รองเท้า', 'คู่', 'C-05', 'https://drive.google.com/uc?export=view&id=1vaDgW2yOxR08Vnl4DdpC8j8THal8r8XX'),
('DD1391-101', 'Nike Dunk Low University Blue', 'Dunk', 3500, 21, 'รองเท้า', 'คู่', 'D-01', 'https://drive.google.com/uc?export=view&id=1AbQoa2TMl9MkZ49dKX-nSja8pk0n_wBB'),
('BQ6817-600', 'Nike SB Dunk Low Chicago', 'Dunk', 3600, 20, 'รองเท้า', 'คู่', 'D-02', 'https://drive.google.com/uc?export=view&id=1V_CJI54Zmm_JmlXscmn1W0el44TLviUg'),
('DD1399-101', 'Nike Dunk High Syracuse (2021)', 'Dunk', 3139, 20, 'รองเท้า', 'คู่', 'D-03', 'https://drive.google.com/uc?export=view&id=1TsM5gdyTAtKRx0xIDZKsn1uCk4fQdZua'),
('CD0917-600', 'Air Max 90 Viotech', 'Air Max', 2400.00, 20, 'รองเท้า', 'คู่', 'E-01', 'https://drive.google.com/uc?export=view&id=1aGXhAqE-9oqrbInGkz5SfEudn2n3e7i8');

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE product_image_vectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_code VARCHAR(50) NOT NULL REFERENCES products(product_code),
    embeded VECTOR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);