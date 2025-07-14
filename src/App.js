import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import MainLayout from './components/Layout/MainLayout';
import Consultations from './pages/Consultations/Consultations';
import PreSurgery from './pages/PreSurgery/PreSurgery';
import PreSurgeryReport from './pages/PreSurgery/PreSurgeryReport';
import OrthoK from './pages/OrthoK/OrthoK';
import OrthoKReport from './pages/OrthoK/OrthoKReport';
import Statistics from './pages/Statistics/Statistics';
import Doctors from './pages/Doctors/Doctors';
import Password from './pages/Password/Password';
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

  return !isAuthenticated ? children : <Navigate to="/consultations" replace />;
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
      <AntdApp>
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
                  {/* 默认重定向到预问诊记录 */}
                  <Route index element={<Navigate to="/consultations" replace />} />

                  {/* 预问诊记录页面 */}
                  <Route path="consultations" element={<Consultations />} />

                  {/* 术前分析页面 */}
                  <Route path="pre-surgery" element={<PreSurgery />} />
                  <Route path="pre-surgery/report/:id" element={<PreSurgeryReport />} />

                  {/* 塑形镜分析页面 */}
                  <Route path="orthok" element={<OrthoK />} />
                  <Route path="orthok/report/:id" element={<OrthoKReport />} />

                  {/* 统计分析页面 */}
                  <Route path="statistics" element={<Statistics />} />

                  {/* 账号管理页面 */}
                  <Route path="doctors" element={<Doctors />} />

                  {/* 密码管理页面 */}
                  <Route path="password" element={<Password />} />
                </Route>

                {/* 404页面重定向 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
