import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileTextOutlined,
  ScissorOutlined,
  EyeOutlined
} from '@ant-design/icons';

import './Sidebar.css';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: 'pre-consultation',
      icon: <FileTextOutlined />,
      label: '预问诊',
      onClick: () => navigate('/pre-consultation')
    },
    {
      key: 'pre-surgery',
      icon: <ScissorOutlined />,
      label: '术前分析',
      onClick: () => navigate('/pre-surgery')
    },
    {
      key: 'orthok',
      icon: <EyeOutlined />,
      label: '塑形镜分析',
      onClick: () => navigate('/orthok')
    }
  ];

  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('pre-consultation')) return 'pre-consultation';
    if (path.includes('pre-surgery')) return 'pre-surgery';
    if (path.includes('orthok')) return 'orthok';
    return 'pre-consultation'; // 默认选中预问诊
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
        items={menuItems}
        className="sidebar-menu"
      />
    </Sider>
  );
};

export default Sidebar;
