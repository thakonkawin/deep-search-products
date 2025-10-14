import { useState } from "preact/hooks";
import {
  Modal,
  Button,
  Group,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Stepper,
  Text,
  Image,
  SimpleGrid,
  ActionIcon,
  rem,
  LoadingOverlay,
  Autocomplete,
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
  IconBox,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { ImageIcon, PlusIcon } from "lucide-preact";
import { Notifications } from "@mantine/notifications";
import { addProductProductsPost, deleteProductProductsProductCodeDelete, uploadProductVectorsProductsVectorsPost } from "../../services/openapi";

const schema = z.object({
  product_code: z.string().min(1, "กรุณากรอกรหัสสินค้า"),
  name: z.string().min(1, "กรุณากรอกชื่อสินค้า"),
  description: z.string().min(1, "กรุณากรอกรายละเอียดสินค้า"),
  price: z.number().min(0, "ราคาต้องมากกว่าหรือเท่ากับ 0"),
  category: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  unit: z.string().min(1, "กรุณากรอกหน่วยสินค้า"),
  shelf: z.string().min(1, "กรุณากรอกที่เก็บสินค้า"),
  stock: z.number().min(0, "จำนวนต้องมากกว่าหรือเท่ากับ 0"),
});

export function ProductCreateModal({ callback }: { callback: () => void }) {
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [opened, setOpened] = useState(false);

  const form = useForm({
    validate: zod4Resolver(schema),
    initialValues: {
      product_code: '',
      name: "",
      description: "",
      price: 0,
      category: "",
      stock: 0,
      unit: '',
      shelf: '',
    },
  });

  const handleClose = () => {
    form.reset();
    setUploadedImages([]);
    setExistingImages([]);
    setOpened(false);
    setActive(0);
  };

  const generateRandomProductCode = (): string => {
    const prefix = "PRD";
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${randomNumber}`;
  };

  const createProductHandler = async (): Promise<string> => {
    try {
      const res = await addProductProductsPost({
        body: {
          product_name: form.values.name,
          price: form.values.price,
          product_code: form.values.product_code,
          description: form.values.description,
          category: form.values.category,
          quantity: form.values.stock,
          unit: form.values.unit,
          shelf: form.values.shelf,
          image_id: []
        }
      });

      if (res.status === 200 && res.data?.product_code) {
        return res.data.product_code;
      } else {
        throw new Error("Failed to create product");
      }
    } catch (error) {
      console.error(error);
      return '';
    }
  };

  const uploadImageHandler = async (productId: string, files: File[]) => {
    uploadProductVectorsProductsVectorsPost({
      body: {
        files: files,
        product_code: productId,
      }
    }).then((res) => {
      if (res.status === 200) {
        return;
      } else {
        throw new Error("Failed to upload images");
      }
    });
  };

  const deleteProductHandler = async (productId: string) => {
    const res = await deleteProductProductsProductCodeDelete({
      path: {
        product_code: productId
      }
    });
    if (res.status !== 200) {
      console.warn("Failed to delete product after upload failure");
    }
  };

  const handleSubmit = async () => {
    const validation = form.validate();
    if (!validation.hasErrors) {
      setLoading(true);
      try {
        const productId = await createProductHandler();

        console.log("Created product with ID:", productId);
        if (productId === '') {
          throw new Error("Product ID is empty after creation");
        }

        if (uploadedImages.length > 0) {
          try {
            await uploadImageHandler(productId, uploadedImages);
          } catch (uploadError) {
            await deleteProductHandler(productId);
            throw uploadError;
          }
        }

        Notifications.show({
          title: "สำเร็จ",
          message: "เพิ่มสินค้าสำเร็จ",
          color: "green",
        });
        callback();
        handleClose();
      } catch (error) {
        console.error(error);
        Notifications.show({
          title: "เกิดข้อผิดพลาด",
          message: "ไม่สามารถเพิ่มสินค้าได้ กรุณาลองใหม่อีกครั้ง",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDrop = (files: FileWithPath[]) => {
    setUploadedImages((prev) => [...prev, ...files]);
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (active === 0) {
      const validation = form.validate();
      if (!validation.hasErrors) {
        setActive(1);
      }
    }
  };

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const categories = [
    { value: "เสื้อ", label: "เสื้อ" },
    { value: "กางเกง", label: "กางเกง" },
    { value: "ชุดเดรส", label: "ชุดเดรส" },
    { value: "ชุดกีฬา", label: "ชุดกีฬา" },
    { value: "รองเท้า", label: "รองเท้า" },
    { value: "เครื่องประดับ", label: "เครื่องประดับ" },
    { value: "กระเป๋า", label: "กระเป๋า" },
    { value: "อื่นๆ", label: "อื่นๆ" },
  ];

  const units = [
    { value: "ชิ้น", label: "ชิ้น" },
    { value: "กล่อง", label: "กล่อง" },
    { value: "กิโลกรัม", label: "กิโลกรัม" },
    { value: "กรัม", label: "กรัม" },
    { value: "ชุด", label: "ชุด" },
    { value: "แพ็ค", label: "แพ็ค" },
    { value: "ลิตร", label: "ลิตร" },
    { value: "มิลลิลิตร", label: "มิลลิลิตร" },
    { value: "เมตร", label: "เมตร" },
    { value: "ม้วน", label: "ม้วน" },
    { value: "อื่นๆ", label: "อื่นๆ" },
  ];

  return (
    <>
      <Button
        onClick={() => setOpened(true)}
        leftSection={<PlusIcon size={14} />}
      >
        เพิ่มสินค้า
      </Button>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={"เพิ่มสินค้าใหม่"}
        size="lg"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        centered
      >
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <Stepper active={active} onStepClick={setActive}>
          <Stepper.Step
            icon={<IconBox size={18} />}
            label="ขั้นที่ 1"
            description="รายละเอียดสินค้า"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <TextInput
                label="รหัสสินค้า"
                placeholder="กรอกรหัสสินค้า"
                required
                mb="md"
                {...form.getInputProps("product_code")}
                rightSectionWidth={100}
                rightSection={
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() =>
                      form.setFieldValue("product_code", generateRandomProductCode())
                    }
                  >
                    สุ่มรหัส
                  </Button>
                }
              />

              <TextInput
                label="ชื่อสินค้า"
                placeholder="กรอกชื่อสินค้า"
                required
                mb="md"
                {...form.getInputProps("name")}
              />

              <Textarea
                label="รายละเอียดสินค้า"
                placeholder="กรอกรายละเอียดสินค้า"
                required
                minRows={3}
                mb="md"
                {...form.getInputProps("description")}
              />

              <NumberInput
                label="ราคา (บาท)"
                placeholder="0"
                min={0}
                mb="md"
                thousandSeparator=","
                {...form.getInputProps("price")}
              />

              <Select
                label="หมวดหมู่"
                placeholder="เลือกหมวดหมู่"
                required
                data={categories}
                mb="md"
                {...form.getInputProps("category")}
              />

              <Autocomplete
                label="หน่วยสินค้า"
                placeholder="เช่น ชิ้น, กล่อง, กิโลกรัม"
                required
                data={units}
                mb="md"
                {...form.getInputProps("unit")}
              />

              <TextInput
                label="ชั้นวางสินค้า"
                placeholder="กรอกชั้นวางสินค้า"
                required
                mb="md"
                {...form.getInputProps("shelf")}
              />

              <NumberInput
                label="จำนวนสินค้า"
                placeholder="0"
                min={0}
                mb="md"
                {...form.getInputProps("stock")}
              />
            </form>
          </Stepper.Step>

          <Stepper.Step
            icon={<ImageIcon size={18} />}
            label="ขั้นที่ 2"
            description="อัพโหลดรูปภาพ"
          >
            <div>
              <Dropzone
                onDrop={handleDrop}
                maxSize={5 * 1024 ** 2}
                accept={IMAGE_MIME_TYPE}
                multiple
              >
                <Group
                  justify="center"
                  gap="xl"
                  mih={150}
                  style={{ pointerEvents: "none" }}
                >
                  <Dropzone.Accept>
                    <IconUpload
                      style={{
                        width: rem(52),
                        height: rem(52),
                        color: "var(--mantine-color-blue-6)",
                      }}
                      stroke={1.5}
                    />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX
                      style={{
                        width: rem(52),
                        height: rem(52),
                        color: "var(--mantine-color-red-6)",
                      }}
                      stroke={1.5}
                    />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconPhoto
                      style={{
                        width: rem(52),
                        height: rem(52),
                        color: "var(--mantine-color-dimmed)",
                      }}
                      stroke={1.5}
                    />
                  </Dropzone.Idle>

                  <div>
                    <Text size="xl" inline>
                      ลากรูปภาพมาวางหรือคลิกเพื่อเลือก
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                      รองรับไฟล์รูปภาพขนาดไม่เกิน 5MB
                    </Text>
                  </div>
                </Group>
              </Dropzone>

              {existingImages.length > 0 && (
                <>
                  <Text size="sm" fw={500} mt="lg" mb="xs">
                    รูปภาพปัจจุบัน
                  </Text>
                  <SimpleGrid cols={{ base: 3, sm: 4 }} spacing="sm" mb="md">
                    {existingImages.map((image, index) => (
                      <div key={index} style={{ position: "relative" }}>
                        <Image
                          src={image}
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
                          onClick={() => removeExistingImage(index)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </div>
                    ))}
                  </SimpleGrid>
                </>
              )}

              {uploadedImages.length > 0 && (
                <>
                  <Text size="sm" fw={500} mt="lg" mb="xs">
                    รูปภาพใหม่ที่อัพโหลด
                  </Text>
                  <SimpleGrid cols={{ base: 3, sm: 4 }} spacing="sm">
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
            </div>
          </Stepper.Step>
        </Stepper>

        <Group justify="space-between" mt="xl">
          {active > 0 && (
            <Button variant="default" onClick={prevStep}>
              ย้อนกลับ
            </Button>
          )}
          {active < 1 ? (
            <>
              <div></div>
              <Button onClick={nextStep}>ถัดไป</Button>
            </>
          ) : (
            <Button
              disabled={
                !form.isValid() ||
                (uploadedImages.length === 0 && existingImages.length === 0)
              }
              onClick={handleSubmit}
            >
              เพิ่มสินค้า
            </Button>
          )}
        </Group>
      </Modal>
    </>
  );
}
