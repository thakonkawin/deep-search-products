import torch
from PIL import Image
from io import BytesIO
from torchvision import transforms

CONFIG = {"IMAGE_SIZE": (224, 224)}

preprocess = transforms.Compose(
    [
        transforms.Resize(CONFIG["IMAGE_SIZE"]),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)

def get_image_embedding(model, image_input, device):

    if isinstance(image_input, bytes):
        img = Image.open(BytesIO(image_input)).convert("RGB")
    elif isinstance(image_input, str):
        img = Image.open(image_input).convert("RGB")
    else:
        raise ValueError("image_input ต้องเป็น str (path) หรือ bytes")

    input_tensor = preprocess(img).unsqueeze(0).to(device)

    with torch.no_grad():
        embedding = model(input_tensor)

    return embedding

def cosine_distance_to_percent(distance: float) -> float:
    return max(0, min(100, (1 - distance / 2) * 100))