import React from 'react';
import { Layout, Menu, Drawer } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileTextOutlined,
  BarChartOutlined,
  TeamOutlined,
  LockOutlined,
  MedicineBoxOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { MENU_ITEMS, PROJECT_NAME, LOGO_URL } from '../../utils/constants';
import './Sidebar.css';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse, mobileDrawerVisible, onMobileDrawerClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, isAdmin } = useAuth();

  // 图标映射
  const iconMap = {
    consultations: <FileTextOutlined />,
    'pre-surgery': <MedicineBoxOutlined />,
    orthok: <EyeOutlined />,
    statistics: <BarChartOutlined />,
    doctors: <TeamOutlined />,
    password: <LockOutlined />
  };

  // 过滤菜单项（根据权限）
  const getFilteredMenuItems = (isMobileMenu = false) => {
    return MENU_ITEMS.filter(item => {
      // 检查管理员权限
      if (item.adminOnly && !isAdmin) {
        return false;
      }

      // 检查具体权限
      if (item.permission) {
        return hasPermission(item.permission.action, item.permission.subject);
      }

      return true;
    }).map(item => ({
      key: item.key,
      icon: iconMap[item.key],
      label: item.label,
      onClick: () => {
        navigate(item.path);
        // 移动端点击菜单后关闭抽屉
        if (isMobileMenu) {
          onMobileDrawerClose();
        }
      }
    }));
  };

  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('consultations')) return 'consultations';
    if (path.includes('pre-surgery')) return 'pre-surgery';
    if (path.includes('orthok')) return 'orthok';
    if (path.includes('statistics')) return 'statistics';
    if (path.includes('doctors')) return 'doctors';
    if (path.includes('password')) return 'password';
    return 'consultations'; // 默认选中预问诊记录
  };

  // 渲染菜单内容
  const renderMenu = (isMobileMenu = false) => (
    <Menu
      mode="inline"
      selectedKeys={[getSelectedKey()]}
      items={getFilteredMenuItems(isMobileMenu)}
      className={isMobileMenu ? "mobile-sidebar-menu" : "sidebar-menu"}
    />
  );

  // 移动端抽屉头部
  const drawerTitle = (
    <div className="mobile-drawer-header">
      <img src={LOGO_URL} alt="Logo" className="mobile-drawer-logo" />
      <span className="mobile-drawer-title">{PROJECT_NAME}</span>
    </div>
  );

  return (
    <>
      {/* 桌面端和平板端侧边栏 */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={onCollapse}
          className="app-sidebar"
          width={240}
          collapsedWidth={80}
          theme="light"
        >
          {renderMenu()}
        </Sider>
      )}

      {/* 移动端抽屉 */}
      {isMobile && (
        <Drawer
          title={drawerTitle}
          placement="left"
          onClose={onMobileDrawerClose}
          open={mobileDrawerVisible}
          className="mobile-sidebar-drawer"
          width={280}
          styles={{
            body: { padding: 0 },
            header: { paddingBottom: 16 }
          }}
        >
          {renderMenu(true)}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
