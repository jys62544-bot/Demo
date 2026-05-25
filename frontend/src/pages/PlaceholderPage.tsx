import { Card, Empty } from "antd";
import AppShell from "../layouts/AppShell";

export default function PlaceholderPage({ scope, title }: { scope: "employee" | "admin"; title: string }) {
  return (
    <AppShell scope={scope} title={title} subtitle="该模块将在下一轮补齐完整交互">
      <Card>
        <Empty description="页面骨架已接入路由，等待实现演示内容" />
      </Card>
    </AppShell>
  );
}
