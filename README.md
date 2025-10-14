# DEEP-SEARCH-PRODUCTS

DEEP-SEARCH-PRODUCTS is a project developed to solve the problem of damaged or
missing product codes, which often occurs in warehouses, retail stores, and
distribution centers.

To address this issue, the system uses image-based product search as the main
method. Users can upload a photo of a product they want to identify, and the
system will utilize Deep Learning to extract visual features (such as color,
shape, pattern, and label) from the image. These features are then compared with
the existing product image database to find and display the most visually
similar products.

## Objectives

- Solve the issue of identifying products when product codes are damaged or lost

- Reduce time and errors in product identification

- Improve efficiency in warehouse and inventory management

- Demonstrate real-world applications of AI and Deep Learning in business
  environments

## Structures

```text
.
├─ applications/                            # ชุดคำสั่งโปรแกรม api, database, mobile และ website
│  ├─ api/                               
│  ├─ database/
│  ├─ mobile/                                         
│  └─ website/
│  
├─ data/                                    # ชุดข้อมูลหรือสคริปต์ดาวน์โหลดข้อมูล
│  ├─ system/                               # ชุดข้อมูลสำหรับทดสอบระบบ
│  ├─ train/                                # ชุดข้อมูลสำหรับเทรนโมเดล
│  └─ test/                                 # ชุดข้อมูลสำหรับทดสอบโมเดล
│  
├─ demos/                                   # คลิปวิดีโอ Demo ของทั้ง 3 Scenarios     
│  ├─ easy.mp4                                
│  ├─ medium.mp4                                           
│  └─ hard.mp4
│        
├─ models/                                  # ไฟล์ weight ของโมเดล หรือวิธีการสร้างซ้ำ    
│
├─ scripts/                                 # สคริปต์สำหรับการฝึกและประเมินผล          
│  └─ train_model.ipynb                        
│  
├─ README.md                                # คำอธิบายโครงงาน วิธีติดตั้ง และวิธีรัน
│  
└─ requirements.txt                         # สำหรับติดตั้ง dependencies
```

## ⚙️ Installation & Run Model

1. Clone the repository:

```bash
git clone https://github.com/thakonkawin/deep-product-search.git
cd deep-product-search
```

2. Create a new Conda environment:

```bash
conda create -y --name deep_search python=3.10
```

3. Activate the environment:

```bash
conda activate deep_search
```

4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Run the model training notebook:

```bash
jupyter notebook train_model.ipynb
```

## Software Requirements

| Software                   | Version | Installation Guide                                                                 |
| -------------------------- | ------- | ---------------------------------------------------------------------------------- |
| **PostgreSQL**             | 15+     | [https://www.postgresql.org/download/](https://www.postgresql.org/download/)       |
| **UNKNOWN**                | ---     | [https://nodejs.org/en/download](https://nodejs.org/en/download)                   |
| **Flutter SDK (Optional)** | 3.0+    | [https://docs.flutter.dev/install/manual](https://docs.flutter.dev/install/manual) |
| **Docker**                 | Latest  | [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)         |
| **Postman (Optional)**     | Latest  | [https://www.postman.com/downloads/](https://www.postman.com/downloads/)           |

## ⚙️ Application Installation Guide

### 1️⃣ Run the Database

1. Navigate to the database directory:

```bash
cd applications/database
```

2. Start the database service using Docker Compose:

```bash
docker compose up --build
```

3. (Optional) Restore sample data from backup:
   `./applications/database/backup_v1.dump`

4. (Optional) Initialize the database by executing the SQL script:
   `./applications/database/init.sql`

---

### 2️⃣ Run the API Service

1. Navigate to the API directory:

```bash
cd applications/api
```

2. Start the API service:

```bash
docker compose up --build
```

---

### 3️⃣ Import Postman Collection

To test the API endpoints using Postman, import the following files:

- `applications/api/deep-search.postman_collection.json`

💡 These files include all API routes needed to test the Deep Search API.

---

### 4️⃣ Run the Web application (Optional)

1. Navigate to the Website directory:

```bash
cd applications/website
```

2. Start the Website:

```bash
docker compose up --build
```

---

### 5️⃣ Run the Mobile application (Optional)

1. Navigate to the Mobile directory:

```bash
cd applications/mobile
```

2. List all available devices:

```bash
flutter devices
```

💡 This command shows all connected simulators or physical devices available for
testing.

3. Start the Mobile:

```bash
flutter run -d <device_id>
```

Replace <device_id> with the ID shown in the previous command.

## System Workflow

1. User uploads or captures a product image via mobile (Flutter) or web (....)

2. Image is sent to the FastAPI backend

3. The backend processes the image using a Deep Learning model to extract
   feature vectors

4. These features are compared with vectors stored in PostgreSQL

5. The system returns a ranked list of the most visually similar products
