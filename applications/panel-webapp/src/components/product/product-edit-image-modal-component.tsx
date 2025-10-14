import { useEffect, useState } from "preact/hooks";
import {
  Modal,
  Group,
  Text,
  SimpleGrid,
  Image,
  ActionIcon,
  rem,
  Button,
  LoadingOverlay,
} from "@mantine/core";
import {
  Dropzone,
  IMAGE_MIME_TYPE,
  type FileWithPath,
} from "@mantine/dropzone";
import {
  IconUpload,
  IconX,
  IconPhoto,
  IconTrash,
} from "@tabler/icons-react";
import { Notifications } from "@mantine/notifications";
import lodash from "lodash";
import config from "../../config";
import {
  deleteProductProductsImageIdDelete,
  uploadProductVectorsProductsVectorsPost,
  type ProductSchema,
} from "../../services/openapi";

interface Props {
  opened: boolean;
  onClose: () => void;
  product?: ProductSchema;
  onRemoveExistingImage?: (index: number) => void;
  onUploadNewImages?: (files: File[]) => void;
  callback: () => void;
}

export function ProductEditImageModal({
  opened,
  onClose,
  product,
  onRemoveExistingImage,
  onUploadNewImages,
  callback,
}: Props) {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleDrop = (files: FileWithPath[]) => {
    const newFiles = [...uploadedImages, ...files];
    setUploadedImages(newFiles);
    onUploadNewImages?.(newFiles);
  };

  const removeUploadedImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onUploadNewImages?.(newImages);
  };

  const handleRemoveExistingImage = async (index: number) => {
    const imageId = images[index];
    try {
      await deleteProductProductsImageIdDelete({ path: { id: imageId } });
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onRemoveExistingImage?.(index);
      Notifications.show({
        title: "ลบรูปภาพสำเร็จ",
        message: "ลบรูปภาพจากระบบแล้ว",
        color: "green",
      });
      callback();
    } catch (err) {
      console.error("Failed to delete image:", err);
      Notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: "ไม่สามารถลบรูปภาพได้",
        color: "red",
      });
    }
  };

  const uploadImageHandler = async (productId: string, files: File[]) => {
    try {
      const res = await uploadProductVectorsProductsVectorsPost({
        body: {
          files: files,
          product_code: productId,
        },
      });
      if (res.status !== 200) {
        throw new Error("Upload failed");
      }
    } catch (err) {
      throw new Error("ไม่สามารถอัปโหลดรูปภาพได้");
    }
  };

  const handleSave = async () => {
    if (!product || uploadedImages.length === 0) return;
    setLoading(true);
    try {
      await uploadImageHandler(product.product_code, uploadedImages);

      Notifications.show({
        title: "อัปโหลดสำเร็จ",
        message: "อัปโหลดรูปภาพเรียบร้อยแล้ว",
        color: "green",
      });

      callback();
      setUploadedImages([]);
      onClose();
    } catch (error) {
      Notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: (error as Error).message || "ไม่สามารถอัปโหลดรูปภาพได้",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageURL = (imageId: string) => {
    return !lodash.isEmpty(imageId)
      ? `${config.VITE_BASE_URL}/products/image/${imageId}`
      : "https://placehold.co/600x400?text=No+Image";
  };

  useEffect(() => {
    if (product?.image_id) {
      setImages(product.image_id);
    } else {
      setImages([]);
    }

    if (!opened) {
      // ล้างข้อมูลเมื่อปิด Modal
      setUploadedImages([]);
      setLoading(false);
    }
  }, [product, opened]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="อัปโหลดรูปสินค้า"
      size="lg"
      centered
    >
      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />

      <Dropzone
        onDrop={handleDrop}
        maxSize={5 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
        multiple
      >
        <Group justify="center" gap="xl" mih={150} style={{ pointerEvents: "none" }}>
          <Dropzone.Accept>
            <IconUpload style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-blue-6)" }} stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-red-6)" }} stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-dimmed)" }} stroke={1.5} />
          </Dropzone.Idle>
          <div>
            <Text size="xl" inline>
              ลากรูปภาพมาวางหรือคลิกเพื่อเลือก
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              รองรับไฟล์รูปภาพ ขนาดไม่เกิน 5MB
            </Text>
          </div>
        </Group>
      </Dropzone>

      {/* ภาพที่มีอยู่แล้ว */}
      {images.length > 0 && (
        <>
          <Text size="sm" fw={500} mt="lg" mb="xs">
            รูปภาพปัจจุบัน
          </Text>
          <SimpleGrid cols={{ base: 3, sm: 4 }} spacing="sm" mb="md">
            {images.map((image, index) => (
              <div key={index} style={{ position: "relative" }}>
                <Image
                  src={getImageURL(image)}
                  height={100}
                  radius="sm"
                  fallbackSrc="https://placehold.co/150x100?text=Error"
                />
                <ActionIcon
                  color="red"
                  variant="filled"
                  size="sm"
                  radius="xl"
                  style={{ position: "absolute", top: 5, right: 5 }}
                  onClick={() => handleRemoveExistingImage(index)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </div>
            ))}
          </SimpleGrid>
        </>
      )}

      {/* ภาพใหม่ที่อัปโหลด */}
      {uploadedImages.length > 0 && (
        <>
          <Text size="sm" fw={500} mt="lg" mb="xs">
            รูปภาพใหม่ที่อัปโหลด
          </Text>
          <SimpleGrid cols={{ base: 3, sm: 4 }} spacing="sm" mb="md">
            {uploadedImages.map((file, index) => {
              const imageUrl = URL.createObjectURL(file);
              return (
                <div key={index} style={{ position: "relative" }}>
                  <Image
                    src={imageUrl}
                    height={100}
                    radius="sm"
                    onLoad={() => URL.revokeObjectURL(imageUrl)}
                  />
                  <ActionIcon
                    color="red"
                    variant="filled"
                    size="sm"
                    radius="xl"
                    style={{ position: "absolute", top: 5, right: 5 }}
                    onClick={() => removeUploadedImage(index)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </div>
              );
            })}
          </SimpleGrid>
        </>
      )}

      <Group justify="end" mt="lg">
        <Button variant="default" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button
          onClick={handleSave}
          disabled={uploadedImages.length === 0 || loading}
        >
          อัปโหลด
        </Button>
      </Group>
    </Modal>
  );
}
