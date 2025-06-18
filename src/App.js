import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import MainLayout from './components/Layout/MainLayout';
import PreConsultation from './pages/PreConsultation/PreConsultation';
import PreSurgery from './pages/PreSurgery/PreSurgery';
import OrthoK from './pages/OrthoK/OrthoK';
import { THEME_COLOR } from './utils/constants';
import './App.css';

// 私有路由组件
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 公共路由组件（已登录用户不能访问）
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/pre-consultation" replace />;
};

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: THEME_COLOR,
        },
      }}
    >
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* 登录页面 */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              {/* 主应用路由 */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <MainLayout />
                  </PrivateRoute>
                }
              >
                {/* 默认重定向到预问诊 */}
                <Route index element={<Navigate to="/pre-consultation" replace />} />

                {/* 预问诊页面 */}
                <Route path="pre-consultation" element={<PreConsultation />} />

                {/* 术前分析页面 */}
                <Route path="pre-surgery" element={<PreSurgery />} />

                {/* 塑形镜分析页面 */}
                <Route path="orthok" element={<OrthoK />} />
              </Route>

              {/* 404页面重定向 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
