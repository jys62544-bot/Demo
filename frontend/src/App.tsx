import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "./store/useAuth";
import type { UserRole } from "./types";
import AgentChatPage from "./pages/AgentChatPage";
import AdminAbnormal from "./pages/admin/AdminAbnormal";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGraph from "./pages/admin/AdminGraph";
import AdminKnowledge from "./pages/admin/AdminKnowledge";
import AdminRanking from "./pages/admin/AdminRanking";
import EmployeeContribution from "./pages/employee/EmployeeContribution";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeUpload from "./pages/employee/EmployeeUpload";
import LoginPage from "./pages/LoginPage";

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
            <AgentChatPage scope="employee" title="AI 助手" defaultRole="operation_qa" />
          </RequireAuth>
        }
      />
      <Route
        path="/employee/contribution"
        element={
          <RequireAuth role="employee">
            <EmployeeContribution />
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
      <Route
        path="/admin/knowledge"
        element={
          <RequireAuth role="admin">
            <AdminKnowledge />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/graph"
        element={
          <RequireAuth role="admin">
            <AdminGraph />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/abnormal"
        element={
          <RequireAuth role="admin">
            <AdminAbnormal />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/ranking"
        element={
          <RequireAuth role="admin">
            <AdminRanking />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/decision-agent"
        element={
          <RequireAuth role="admin">
            <AgentChatPage scope="admin" title="Agent 决策" defaultRole="management_decision" />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
