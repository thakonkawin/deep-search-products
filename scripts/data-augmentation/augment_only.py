import os
import cv2
import shutil
import random
import numpy as np
from PIL import Image, ImageEnhance

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "dataset")
RAW_PATH = os.path.join(DATA_PATH, "Raw")
TRAIN_PATH = os.path.join(DATA_PATH, "Train")


def augment_image(image):
    # Flip horizontal หรือ vertical แบบสุ่ม
    flip_type = random.choice(["none", "horizontal", "vertical"])
    if flip_type == "horizontal":
        image = image.transpose(Image.FLIP_LEFT_RIGHT)
    elif flip_type == "vertical":
        image = image.transpose(Image.FLIP_TOP_BOTTOM)

    # Rotate ภาพ ±25 องศา
    angle = random.uniform(-25, 25)
    image = image.rotate(angle, expand=True)

    # Scale (resize) แบบสุ่ม ±10%
    scale_factor = random.uniform(0.9, 1.1)
    w, h = image.size
    new_w, new_h = int(w * scale_factor), int(h * scale_factor)
    image = image.resize((new_w, new_h), Image.BICUBIC)

    # Translate (เลื่อนภาพ) ±10% ของขนาดภาพ
    max_dx = int(0.1 * new_w)
    max_dy = int(0.1 * new_h)
    dx = random.randint(-max_dx, max_dx)
    dy = random.randint(-max_dy, max_dy)

    # สร้าง canvas ใหม่ขนาดเท่าเดิม แล้ววางภาพที่เลื่อน
    canvas = Image.new("RGBA", (new_w, new_h), (0, 0, 0, 0))
    canvas.paste(image, (dx, dy))

    image = canvas

    # ปรับ brightness, contrast, saturation แบบสุ่ม
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(random.uniform(0.7, 1.3))

    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(random.uniform(0.8, 1.2))

    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(random.uniform(0.8, 1.2))

    # ใส่ noise เบาๆ
    img_np = np.array(image)
    if random.random() > 0.5:
        noise = np.random.normal(0, 5, img_np.shape).astype(np.uint8)  # noise std dev=5
        img_np = cv2.add(img_np, noise)

    image = Image.fromarray(img_np)

    return image


def process_dataset_with_aug_only(
    input_root="phoom/Train", output_root="train_with_aug_only", augment_per_image=3
):
    if os.path.exists(output_root):
        shutil.rmtree(output_root)
    for class_name in os.listdir(input_root):
        class_path = os.path.join(input_root, class_name)
        if not os.path.isdir(class_path):
            continue

        output_class_path = os.path.join(output_root, class_name)
        os.makedirs(output_class_path, exist_ok=True)

        for filename in os.listdir(class_path):
            if filename.lower().endswith(".png"):
                input_path = os.path.join(class_path, filename)

                # 1. Save original image to output folder (ถ้ายังไม่มี)
                orig_output_path = os.path.join(output_class_path, filename)
                if not os.path.exists(orig_output_path):
                    img_orig = Image.open(input_path)
                    img_orig.save(orig_output_path)

                # 2. ทำ augmentation ซ้ำๆ ตามจำนวนที่กำหนด
                for i in range(augment_per_image):
                    img = Image.open(input_path).convert("RGBA")
                    img_aug = augment_image(img)

                    # ตั้งชื่อไฟล์ใหม่ เช่น image_aug1.png, image_aug2.png
                    base_name = os.path.splitext(filename)[0]
                    out_filename = f"{base_name}_aug{i+1}.png"
                    out_path = os.path.join(output_class_path, out_filename)

                    # Save เป็น PNG พร้อม alpha channel
                    img_aug.save(out_path)
                    print(f"✅ Saved augmented PNG image: {out_path}")


# เรียกใช้
process_dataset_with_aug_only(RAW_PATH, TRAIN_PATH, augment_per_image=5)
