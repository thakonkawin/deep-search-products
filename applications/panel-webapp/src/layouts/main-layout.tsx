import SidebarComponent from "../components/sidebar/sidebar-component";

export default function MainLayout({
  children,
}: {
  children: preact.ComponentChildren;
}) {
  return (
    <div class="flex h-screen w-full select-none">
      <SidebarComponent />
      <main class="p-5 w-full h-full overflow-y-scroll">{children}</main>
    </div>
  );
}
