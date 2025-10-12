import torchvision
import torch.nn as nn
import torch.nn.functional as F
from torchvision.models import ResNet18_Weights


class DeepSearchShoeModel(nn.Module):
    def __init__(self, embedding_size=128):
        super(DeepSearchShoeModel, self).__init__()
        # self.backbone = torchvision.models.resnet18(pretrained=True)
        self.backbone = torchvision.models.resnet18(weights=ResNet18_Weights.DEFAULT)
        in_dim = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()
        self.fc = nn.Linear(in_dim, embedding_size)
        self.dropout = nn.Dropout(0.3)

    def forward(self, x):
        feat = self.backbone(x)
        emb = self.fc(feat)
        emb = self.dropout(emb)
        emb = F.normalize(emb, p=2, dim=1)
        return emb
