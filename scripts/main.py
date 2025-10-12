import torch
from model import DeepSearchShoeModel
from utils import get_image_embedding

IMG_PATH = "../data/system/test/554724-122/554724-122_test_1.jpg"
MODEL_PATH = "../models/deep_search_shoe_model.pth"

model = DeepSearchShoeModel(embedding_size=128)
state_dict = torch.load(MODEL_PATH, map_location=torch.device("cpu"))
model.load_state_dict(state_dict)

embedding = get_image_embedding(model, IMG_PATH)
print("Embedding shape:", embedding.shape)
print("-----------------------------------------")
print("Embedding vector:", embedding)
