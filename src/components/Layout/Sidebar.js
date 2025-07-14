import React from 'react';
import { Layout, Menu } from 'antd';
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
import { MENU_ITEMS } from '../../utils/constants';
import './Sidebar.css';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
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
  const getFilteredMenuItems = () => {
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
      onClick: () => navigate(item.path)
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

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      className="app-sidebar"
      width={240}
      collapsedWidth={80}
      theme="light"
    >
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={getFilteredMenuItems()}
        className="sidebar-menu"
      />
    </Sider>
  );
};

export default Sidebar;
