import React, { useState, useEffect } from 'react';
import { Layout, Grid } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import './MainLayout.css';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const screens = useBreakpoint();

  // 响应式逻辑
  useEffect(() => {
    // 平板端自动折叠侧边栏
    if (screens.md && !screens.lg) {
      setCollapsed(true);
    }
    // 桌面端可以展开侧边栏
    else if (screens.lg) {
      // 保持用户之前的折叠状态，不强制展开
    }
    // 手机端关闭抽屉
    if (screens.xs || (screens.sm && !screens.md)) {
      setMobileDrawerVisible(false);
    }
  }, [screens]);

  // 移动端菜单切换
  const toggleMobileDrawer = () => {
    setMobileDrawerVisible(!mobileDrawerVisible);
  };

  // 判断是否为移动端
  const isMobile = screens.xs || (screens.sm && !screens.md);

  return (
    <Layout className="main-layout">
      <Header
        onMenuClick={toggleMobileDrawer}
        isMobile={isMobile}
      />
      <Layout className="main-content-layout">
        <Sidebar
          collapsed={collapsed}
          onCollapse={setCollapsed}
          mobileDrawerVisible={mobileDrawerVisible}
          onMobileDrawerClose={() => setMobileDrawerVisible(false)}
          isMobile={isMobile}
        />
        <Layout className="content-layout">
          <Content className="main-content">
            <div className="content-wrapper">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
