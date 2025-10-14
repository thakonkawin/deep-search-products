import {
  Title,
  Text,
  Stack,
  Flex,
  SimpleGrid,
  Card,
  Group,
  ThemeIcon,
} from "@mantine/core";
import { ProductCard } from "../components/product/product-card-component";
import { useEffect, useState } from "preact/hooks";
import { WarehouseIcon } from "lucide-preact";
import { ProductCreateModal } from "../components/product/product-create-modal-component";
import { IconBox, IconCategory } from "@tabler/icons-react";
import CountUp from "react-countup";
import { modals } from "@mantine/modals";
import { ProductEditModal } from "../components/product/product-edit-modal-component";
import { ProductEditImageModal } from "../components/product/product-edit-image-modal-component";
import { deleteProductProductsProductCodeDelete, getProductsProductsGet, getProductStatisticsProductsStatisticsGet, type ProductSchema, type ProductStatisticsResponse } from "../services/openapi";
import { Notifications } from "@mantine/notifications";

export default function ProductPage() {
  const [edit, setEdit] = useState<string | null>(null);
  const [editImage, setEditImage] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductSchema[]>([]);
  const [statisticProducts, setStatisticProducts] = useState<ProductStatisticsResponse>({
    low_stock_products: [],
    total_categories: 0,
    total_products: 0,
    total_quantity: 0,
  } as ProductStatisticsResponse);

  const deleteHandler = (id: string) => {
    modals.openConfirmModal({
      title: "ยืนยันการลบ",
      children: "คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?",
      labels: { confirm: "ลบ", cancel: "ยกเลิก" },
      confirmProps: { color: "red" },
      overlayProps: {},
      onConfirm: () => {
        deleteProductProductsProductCodeDelete({
          path: {
            product_code: id
          }
        }).then((res) => {
          if (res.status === 204) {
            Notifications.show({
              title: "ลบรายการสำเร็จ",
              message: "ลบรายการสินค้าสำเร็จ",
              color: "green",
            });
            refreshFetch();
          } else {
            Notifications.show({
              title: "เกิดข้อผิดพลาด",
              message: "ไม่สามารถลบรายการสินค้าได้ กรุณาลองใหม่อีกครั้ง",
              color: "red",
            });
          }
        }).catch((err) => {
          console.error("Failed to delete product:", err);
          Notifications.show({
            title: "เกิดข้อผิดพลาด",
            message: "ไม่สามารถลบรายการสินค้าได้ กรุณาลองใหม่อีกครั้ง",
            color: "red",
          });
        });
      },
    });
  };

  const fetchProductHandler = async () => {
    getProductsProductsGet().then((res) => {
      if (res.status === 200) {
        setProducts(res.data || []);
      }
    }).catch((err) => {
      console.error("Failed to fetch products:", err);
      Notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: "ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่อีกครั้ง",
        color: "red",
      });
    });
  }

  const fetchProductStatisticsHandler = async () => {
    getProductStatisticsProductsStatisticsGet().then((res) => {
      if (res.status === 200) {
        setStatisticProducts(res.data || {
          low_stock_products: [],
          total_categories: 0,
          total_products: 0,
          total_quantity: 0,
        } as ProductStatisticsResponse);
      }
    }).catch((err) => {
      console.error("Failed to fetch products:", err);
      Notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: "ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่อีกครั้ง",
        color: "red",
      });
    });
  }

  const refreshFetch = () => {
    fetchProductHandler();
    fetchProductStatisticsHandler();
  }

  useEffect(() => {
    refreshFetch();
  }, []);

  return (
    <>
      {
        (Array.isArray(products) && products.length > 0) && (
          <>
            <ProductEditModal
              initialValues={products.find((x) => x.product_code == edit)}
              opened={!!edit}
              onClose={() => setEdit(null)}
              callback={() => refreshFetch()}
            />
            <ProductEditImageModal
              product={products.find((x) => x.product_code == editImage)}
              opened={!!editImage}
              onClose={() => setEditImage(null)}
              callback={() => refreshFetch()}
            />
          </>
        )
      }
      <Stack gap="md">
        <div class="w-full flex justify-between">
          <Title order={2}>จัดการสินค้า</Title>
          <ProductCreateModal callback={() => refreshFetch()} />
        </div>

        <SimpleGrid cols={{ base: 1, sm: 1, md: 2, lg: 3 }}>
          <Card shadow="sm" withBorder>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="blue" radius="xl" size="xl">
                <IconBox size={24} />
              </ThemeIcon>
              <div>
                <Text size="sm" c="dimmed">
                  สินค้าทั้งหมด
                </Text>
                <Text size="lg">
                  <CountUp end={statisticProducts.total_products} /> รายการ
                </Text>
              </div>
            </Group>
          </Card>
          <Card shadow="sm" withBorder>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="green" radius="xl" size="xl">
                <WarehouseIcon size={24} />
              </ThemeIcon>
              <div>
                <Text size="sm" c="dimmed">
                  สินค้าคงเหลือ
                </Text>
                <Text size="lg">
                  <CountUp end={statisticProducts.total_quantity} /> รายการ
                </Text>
              </div>
            </Group>
          </Card>
          <Card shadow="sm" withBorder>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="orange" radius="xl" size="xl">
                <IconCategory size={24} />
              </ThemeIcon>
              <div>
                <Text size="sm" c="dimmed">
                  ประเภทสินค้าทั้งหมด
                </Text>
                <Text size="lg">
                  <CountUp end={statisticProducts.total_categories} /> ประเภท
                </Text>
              </div>
            </Group>
          </Card>
          {/* <Card shadow="sm" withBorder>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="red" radius="xl" size="xl">
                <ChevronsDown size={24} />
              </ThemeIcon>
              <div>
                <Text size="sm" c="dimmed">
                  สินค้าคงเหลือต่ำกว่าเกณฑ์
                </Text>
                <Text size="lg">
                  <CountUp end={statisticProducts.low_stock_products.length} /> รายการ
                </Text>
              </div>
            </Group>
          </Card> */}
        </SimpleGrid>

        <Flex mt="md" justify="center" gap="md" wrap="wrap" align="center">
          {Array.isArray(products) && products.map((product) => (
            <ProductCard
              key={product.product_code}
              product={product}
              onEdit={() => setEdit(product.product_code)}
              onDelete={() => deleteHandler(product.product_code)}
              onEditImage={() => setEditImage(product.product_code)}
            />
          ))}
        </Flex>
      </Stack>
    </>
  );
}
