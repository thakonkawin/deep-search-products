import { useEffect, useState } from "preact/hooks";
import {
  Modal,
  Button,
  Group,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Autocomplete,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Notifications } from "@mantine/notifications";
import { updateProductProductsProductCodePut, type ProductSchema } from "../../services/openapi";

export interface ProductEditModalProps {
  opened: boolean;
  onClose: () => void;
  initialValues?: ProductSchema;
  callback: () => void;
}

const schema = z.object({
  product_code: z.string().min(1, "กรุณากรอกรหัสสินค้า"),
  product_name: z.string().min(1, "กรุณากรอกชื่อสินค้า"),
  description: z.string().optional(),
  price: z.number().min(0, "ราคาต้องมากกว่าหรือเท่ากับ 0"),
  quantity: z.number().min(0, "จำนวนต้องมากกว่าหรือเท่ากับ 0"),
  category: z.string().optional(),
  unit: z.string().optional(),
  shelf: z.string().optional(),
});

export function ProductEditModal({
  opened,
  onClose,
  initialValues,
  callback,
}: ProductEditModalProps) {
  const form = useForm({
    validate: zod4Resolver(schema),
    initialValues: {
      product_code: "",
      product_name: "",
      description: "",
      price: 0,
      quantity: 0,
      category: "",
      unit: "",
      shelf: "",
    },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened && initialValues) {
      form.setValues({
        ...initialValues,
        description: initialValues.description ?? "",
        category: initialValues.category ?? "",
        unit: initialValues.unit ?? "",
        shelf: initialValues.shelf ?? "",
      });
    }
  }, [opened, initialValues]);

  const handleSubmit = async () => {
    const validation = form.validate();
    if (validation.hasErrors) return;

    setLoading(true);
    try {
      const res = await updateProductProductsProductCodePut({
        path: { product_code: form.values.product_code },
        body: {
          ...form.values,
        },
      });

      if (res.status === 200) {
        Notifications.show({
          title: "สำเร็จ",
          message: "แก้ไขสินค้าสำเร็จ",
          color: "green",
        });
        callback();
        onClose();
      } else {
        throw new Error("การแก้ไขล้มเหลว");
      }
    } catch (error) {
      console.error(error);
      Notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: "ไม่สามารถแก้ไขสินค้าได้ กรุณาลองใหม่",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

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
    <Modal
      opened={opened}
      onClose={onClose}
      title="แก้ไขรายละเอียดสินค้า"
      size="lg"
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2 }} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <TextInput
          label="รหัสสินค้า"
          placeholder="กรอกรหัสสินค้า"
          required
          disabled
          mb="md"
          {...form.getInputProps("product_code")}
        />

        <TextInput
          label="ชื่อสินค้า"
          placeholder="กรอกชื่อสินค้า"
          required
          mb="md"
          {...form.getInputProps("product_name")}
        />

        <Textarea
          label="รายละเอียดสินค้า"
          placeholder="กรอกรายละเอียดสินค้า"
          minRows={3}
          mb="md"
          {...form.getInputProps("description")}
        />

        <NumberInput
          label="ราคา (บาท)"
          placeholder="0"
          min={0}
          thousandSeparator=","
          mb="md"
          {...form.getInputProps("price")}
        />

        <Select
          label="หมวดหมู่"
          placeholder="เลือกหมวดหมู่"
          data={categories}
          mb="md"
          {...form.getInputProps("category")}
        />

        <Autocomplete
          label="หน่วยสินค้า"
          placeholder="เช่น ชิ้น, กล่อง, กิโลกรัม"
          data={units}
          mb="md"
          {...form.getInputProps("unit")}
        />

        <TextInput
          label="ชั้นวางสินค้า"
          placeholder="กรอกชั้นวางสินค้า"
          mb="md"
          {...form.getInputProps("shelf")}
        />

        <NumberInput
          label="จำนวนสินค้า"
          placeholder="0"
          min={0}
          mb="md"
          {...form.getInputProps("quantity")}
        />

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit">บันทึกการแก้ไข</Button>
        </Group>
      </form>
    </Modal>
  );
}
