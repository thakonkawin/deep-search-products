import os
import cv2
import random
import shutil
import numpy as np
from PIL import Image


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.path.join(BASE_DIR, "data", "dataset")
RAW_PATH = os.path.join(DATA_PATH, "Raw")
TRAIN_PATH = os.path.join(DATA_PATH, "Train")
BG_PATH = os.path.join(DATA_PATH, "BG")


def apply_blurred_random_background(
    input_path, output_path, bg_folder="bg_phoom", blur_ksize=(81, 81)
):
    image = Image.open(input_path).convert("RGBA")
    alpha = image.split()[-1]
    rgb_image = image.convert("RGB")

    # Convert foreground to OpenCV format
    fg_image = np.array(rgb_image)
    fg_image = cv2.cvtColor(fg_image, cv2.COLOR_RGB2BGR)

    # Load a random background image
    bg_files = [
        f
        for f in os.listdir(bg_folder)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]
    if not bg_files:
        raise Exception("❌ ไม่พบไฟล์พื้นหลังในโฟลเดอร์ bg_phoom")

    bg_path = os.path.join(bg_folder, random.choice(bg_files))
    bg_image = Image.open(bg_path).convert("RGB")
    bg_image = bg_image.resize(image.size)  # Resize to match foreground
    bg_image = cv2.cvtColor(np.array(bg_image), cv2.COLOR_RGB2BGR)

    # ✅ Apply blur to the background
    blurred_bg = cv2.GaussianBlur(bg_image, blur_ksize, 0)

    # Prepare alpha mask
    alpha_np = np.array(alpha).astype(np.float32) / 255.0
    alpha_3c = cv2.merge([alpha_np, alpha_np, alpha_np])

    # Composite: blend fg over blurred background using alpha mask
    composite = (fg_image * alpha_3c + blurred_bg * (1 - alpha_3c)).astype(np.uint8)

    # Add alpha channel back
    composite_rgba = cv2.cvtColor(composite, cv2.COLOR_BGR2BGRA)
    composite_rgba[:, :, 3] = (alpha_np * 255).astype(np.uint8)

    if composite_rgba.shape[2] == 4:
        composite_bgr = cv2.cvtColor(composite_rgba, cv2.COLOR_BGRA2BGR)
    else:
        composite_bgr = composite_rgba

    output_path_jpg = os.path.splitext(output_path)[0] + ".jpg"
    # Save result
    os.makedirs(os.path.dirname(output_path_jpg), exist_ok=True)
    cv2.imwrite(output_path_jpg, composite_rgba)
    print(f"✅ Saved with blurred background: {output_path_jpg}")


def process_dataset_with_blurred_bg(
    input_root=RAW_PATH, output_root="train_with_blurred_bg", bg_folder="bg_phoom"
):
    if os.path.exists(output_root):
        shutil.rmtree(output_root)
    for class_name in os.listdir(input_root):
        class_path = os.path.join(input_root, class_name)
        if not os.path.isdir(class_path):
            continue

        for filename in os.listdir(class_path):
            if filename.lower().endswith(".png"):
                input_path = os.path.join(class_path, filename)
                output_path = os.path.join(output_root, class_name, filename)
                apply_blurred_random_background(input_path, output_path, bg_folder)


process_dataset_with_blurred_bg(RAW_PATH, TRAIN_PATH, BG_PATH)
