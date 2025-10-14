import {
  Avatar,
  Code,
  Flex,
  Group,
  NavLink,
  ScrollArea,
  Text,
} from "@mantine/core";
import classes from "./sidebar-component.module.css";
import { IconBox, IconUser } from "@tabler/icons-react";
import { useLocation } from "preact-iso";
import { ChevronRight } from "lucide-preact";

const menu = [
  {
    label: "จัดการสินค้า",
    leftSection: <IconBox />,
    href: "/",
  },
  {
    label: "จัดการสมาชิก",
    leftSection: <IconUser />,
    href: "/member",
    disabled: true,
  },
];

export default function SidebarComponent() {
  const location = useLocation();
  const links = menu.map((item) => (
    <NavLink
      draggable={false}
      {...item}
      key={item.label}
      active={location.path === item.href}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <Text fw={700}>DEEP SEARCH</Text>
          <Code fw={700}>v1.0.0</Code>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <Group justify="space-between" p="sm" gap="sm" align="center">
          <Flex align="center" gap="sm">
            <Avatar size="md" color="red">
              AD
            </Avatar>
            <div>
              <Text>นายชาย สมสุข</Text>
              <Text size="xs" c="dimmed">
                ผู้ดูแลระบบ
              </Text>
            </div>
          </Flex>
          <ChevronRight color="gray" />
        </Group>
      </div>
    </nav>
  );
}
