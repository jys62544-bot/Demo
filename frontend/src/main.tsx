import React from "react";
import ReactDOM from "react-dom/client";
import { App as AntApp, ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./store/AuthProvider";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#059669",
          borderRadius: 8,
          fontFamily:
            'Inter, "Fira Sans", "Microsoft YaHei", "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        },
      }}
    >
      <BrowserRouter>
        <AntApp>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AntApp>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
);
