import sys
sys.path.append('../')
from pycore.tikzeng import *
from pycore.blocks  import *

arch = [ 
    to_head('..'), 
    to_cor(),
    to_begin(),
    
    # Input image
    to_input('../../phoom.png'),

    # Stem: Conv1 + MaxPool
    to_Conv(name='conv1', s_filer=224, n_filer=64, offset="(0,0,0)", to="(0,0,0)", width=7, height=40, depth=40, caption='Conv 7x7'),
    to_Pool(name='maxpool', offset="(0,0,0)", to="(conv1-east)", width=1, height=35, depth=35),

    # Layer1: BasicBlock x2 (64 filters)
    to_ConvConvRelu(name='layer1_block1', s_filer=56, n_filer=(64, 64), offset="(2,0,0)", to="(maxpool-east)", width=(3,3), height=40, depth=40, caption='Conv 3x3'),
    to_ConvConvRelu(name='layer1_block2', s_filer=56, n_filer=(64, 64), offset="(2,0,0)", to="(layer1_block1-east)", width=(3,3), height=40, depth=40, caption='Conv 3x3'),

    # Layer2: BasicBlock x2 (128 filters)
    to_ConvConvRelu(name='layer2_block1', s_filer=28, n_filer=(128, 128), offset="(2,0,0)", to="(layer1_block2-east)", width=(3,3), height=35, depth=35, caption='Conv 3x3'),
    to_ConvConvRelu(name='layer2_block2', s_filer=28, n_filer=(128, 128), offset="(2,0,0)", to="(layer2_block1-east)", width=(3,3), height=35, depth=35, caption='Conv 3x3'),


    # Layer3: BasicBlock x2 (256 filters)
    to_ConvConvRelu(name='layer3_block1', s_filer=14, n_filer=(256, 256), offset="(2,0,0)", to="(layer2_block2-east)", width=(4,4), height=30, depth=30, caption='Conv 3x3'),
    to_ConvConvRelu(name='layer3_block2', s_filer=14, n_filer=(256, 256), offset="(2,0,0)", to="(layer3_block1-east)", width=(4,4), height=30, depth=30, caption='Conv 3x3'),
    

    # Layer4: BasicBlock x2 (512 filters)
    to_ConvConvRelu(name='layer4_block1', s_filer=7, n_filer=(512, 512), offset="(2,0,0)", to="(layer3_block2-east)", width=(5,5), height=25, depth=25, caption='Conv 3x3'),
    to_ConvConvRelu(name='layer4_block2', s_filer=7, n_filer=(512, 512), offset="(2,0,0)", to="(layer4_block1-east)", width=(5,5), height=25, depth=25, caption='Conv 3x3'),
   

    # Average Pooling
    to_Pool(name='avgpool', offset="(2,0,0)", to="(layer4_block2-east)", width=3, height=10, depth=10, caption='AvgPool'),

    # FC Layer (embedding size 128)
    to_Conv(name='fc', s_filer=1, n_filer=128, offset="(3,0,0)", to="(avgpool-east)", width=1.5, height=1.5, depth=10, caption='FC'),
    to_connection("avgpool", "fc"),

    # Dropout Layer
    to_Conv(name='dropout', s_filer=1, n_filer=128, offset="(3,0,0)", to="(fc-east)", width=1, height=1, depth=10, caption='Dropout'),
    to_connection("fc", "dropout"),

    # L2 Normalization (แทนด้วย SoftMax)
    to_SoftMax(name='norm', s_filer=1, offset="(3,0,0)", to="(dropout-east)", width=1, height=1, depth=10, caption='L2 Norm'),
    to_connection("dropout", "norm"),
    
    to_end()
]


def main():
    namefile = str(sys.argv[0]).split('.')[0]
    to_generate(arch, namefile + '.tex' )

if __name__ == '__main__':
    main()
