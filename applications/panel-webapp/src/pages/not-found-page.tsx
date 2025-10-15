import { Button, Stack, Text } from "@mantine/core";
import { useLocation } from "preact-iso";
import NotFoundImg from "../assets/not-found.svg";

export default function NotFoundPage() {
  const location = useLocation();

  const onBackHandler = () => {
    location.route("/");
  };

  return (
    <div class="w-full h-screen flex justify-center items-center select-none">
      <Stack gap="lg">
        <img draggable={false} src={NotFoundImg} width={420} alt="no-image" />
        <Stack gap="sm" justify="center" align="center">
          <Text c="dark" ta="center">
            ไม่พบหน้าที่ท่านต้องการ
          </Text>
          <Button
            variant="light"
            style={{ width: 160 }}
            onClick={onBackHandler}
          >
            กลับสู่หน้าหลัก
          </Button>
        </Stack>
      </Stack>
    </div>
  );
}
