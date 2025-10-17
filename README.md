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
│  └─ panel-webapp/
│  
├─ data/                                  
│  ├─ dataset/                              # ชุดข้อมูลสำหรับเทรนและทดสอบโมเดล
│  └─ system/                               # ชุดข้อมูลสำหรับทดสอบโปรแกรมค้นหาสินค้า
│  
├─ demos/                                   # คลิปวิดีโอ Demo ของทั้ง 3 Scenarios     
│  ├─ easy.mp4                                
│  ├─ medium.mp4                                           
│  └─ hard.mp4
│        
├─ models/                                  # ไฟล์ weight ของโมเดล   
│
├─ scripts/                                         
│  └─ train_model.ipynb                     # สคริปต์สำหรับการฝึกและประเมินผล  
│  
├─ README.md                                # คำอธิบายโครงงาน วิธีติดตั้ง และวิธีรัน
│  
└─ requirements.txt                         # สำหรับติดตั้ง dependencies
```

## ⚙️ Installation & Run Model

1. Clone the repository:

```bash
git clone https://github.com/thakonkawin/deep-search-products.git
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

5. Run the script to generate training data:

```bash
python scripts/data-augmentation/add_bg_with_augment.py
```

6. Run the model training notebook:

```bash
jupyter notebook train_model.ipynb
```

## ⚙️ Installation & Run Apllication

### 1️⃣ Installation & Run Apllication

1. Navigate to the directory:

```bash
cd deep-product-search
```

2. Start the Application:

```bash
docker compose up --build
```

| Service    | URL                   | Description            |
| ---------- | --------------------- | ---------------------- |
| API        | http://localhost:4345 | Backend service        |
| WebApp     | http://localhost:3000 | Frontend web panel     |
| pgAdmin    | http://localhost:5050 | Database management UI |
| PostgreSQL | localhost:5432        | Database service       |

### 2️⃣ Run the Mobile application (Optional)

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

1. User uploads or captures a product image via mobile and web

2. Image is sent to the FastAPI backend

3. The backend processes the image using a Deep Learning model to extract
   feature vectors

4. These features are compared with vectors stored in PostgreSQL

5. The system returns a ranked list of the most visually similar products
