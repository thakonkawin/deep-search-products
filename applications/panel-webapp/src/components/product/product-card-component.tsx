import {
  Card,
  Image,
  Text,
  Badge,
  Group,
  Stack,
  Menu,
  ActionIcon,
} from "@mantine/core";
import { IconSettings, IconTrash } from "@tabler/icons-react";
import { ImageIcon } from "lucide-preact";
import type { ProductSchema } from "../../services/openapi";
import config from "../../config";
import { get, isArray, isEmpty } from 'lodash';

interface ProductCardProps {
  product: ProductSchema;
  onEdit: () => void;
  onEditImage: () => void;
  onDelete: () => void;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onEditImage,
}: ProductCardProps) {

  const imageIdList = get(product, 'image_id', []);
  const hasValidImage = isArray(imageIdList) && !isEmpty(imageIdList);

  const imageUrl = hasValidImage
    ? `${config.VITE_BASE_URL}/products/image/${imageIdList[0]}`
    : 'https://placehold.co/600x400?text=No+Image';

  return (
    <Card
      style={{ width: 300 }}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
    >
      <Card.Section>
        <div class="relative">
          <Image
            src={imageUrl}
            draggable={false}
            height={200}
            alt={get(product, 'product_name', 'No Name')}
            style={{
              height: 200,
              width: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            fallbackSrc="https://placehold.co/600x400?text=No+Image"
          />
          <div class="absolute top-2 right-2">
            <Menu withArrow shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon color="orange" variant="subtle">
                  <IconSettings size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  onClick={onEdit}
                  leftSection={<IconSettings size={14} />}
                >
                  แก้ไขข้อมูล
                </Menu.Item>
                <Menu.Item
                  onClick={onEditImage}
                  leftSection={<ImageIcon size={14} />}
                >
                  เปลี่ยนรูปภาพ
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={onDelete}
                >
                  ลบสินค้าชิ้นนี้
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
      </Card.Section>

      <Stack gap="sm" mt="md">
        <Group justify="space-between" align="flex-start">
          <Text fw={500} size="lg" lineClamp={1}>
            {product.product_name}
          </Text>
          <Badge color="blue" variant="light">
            {product.category}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed" lineClamp={2}>
          {product.description}
        </Text>

        <Group justify="space-between" align="center">
          <div>
            <Text size="xl" fw={700} c="blue">
              ฿{product.price.toLocaleString()}
            </Text>
            <Text size="xs" c="dimmed">
              คงเหลือ: {product.quantity} {product.unit}
            </Text>
          </div>
        </Group>
      </Stack>
    </Card>
  );
}
