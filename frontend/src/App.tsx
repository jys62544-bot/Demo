import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "./store/useAuth";
import type { UserRole } from "./types";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeUpload from "./pages/employee/EmployeeUpload";
import LoginPage from "./pages/LoginPage";
import PlaceholderPage from "./pages/PlaceholderPage";

function RequireAuth({ role, children }: { role: UserRole; children: ReactElement }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard"} replace />;
  }
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/employee/dashboard"
        element={
          <RequireAuth role="employee">
            <EmployeeDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/employee/upload"
        element={
          <RequireAuth role="employee">
            <EmployeeUpload />
          </RequireAuth>
        }
      />
      <Route
        path="/employee/assistant"
        element={
          <RequireAuth role="employee">
            <PlaceholderPage scope="employee" title="AI 助手" />
          </RequireAuth>
        }
      />
      <Route
        path="/employee/contribution"
        element={
          <RequireAuth role="employee">
            <PlaceholderPage scope="employee" title="我的贡献" />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <RequireAuth role="admin">
            <AdminDashboard />
          </RequireAuth>
        }
      />
      {["knowledge", "graph", "abnormal", "ranking", "decision-agent"].map((page) => (
        <Route
          key={page}
          path={`/admin/${page}`}
          element={
            <RequireAuth role="admin">
              <PlaceholderPage scope="admin" title={adminTitles[page]} />
            </RequireAuth>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const adminTitles: Record<string, string> = {
  knowledge: "知识库",
  graph: "知识图谱",
  abnormal: "异常案例",
  ranking: "贡献排行榜",
  "decision-agent": "Agent 决策",
};
