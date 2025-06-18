import React, { useState } from 'react';
import { Layout, Avatar, Dropdown, Button, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { PROJECT_NAME, LOGO_URL, USER_ROLE_NAMES } from '../../utils/constants';
import Register from '../Register/Register';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const [registerVisible, setRegisterVisible] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleRegister = () => {
    setRegisterVisible(true);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <AntHeader className="app-header">
        <div className="header-left">
          <img src={LOGO_URL} alt="Logo" className="header-logo" />
          <span className="header-title">{PROJECT_NAME}</span>
        </div>
        
        <div className="header-right">
          <Space size="middle">
            {isAdmin && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleRegister}
                size="small"
              >
                注册用户
              </Button>
            )}
            
            <div className="user-info">
              <Text className="hospital-area">{user?.hospitalArea}</Text>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <div className="user-avatar-container">
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    className="user-avatar"
                  />
                  <div className="user-details">
                    <Text className="user-name">{user?.name}</Text>
                    <Text className="user-role">{USER_ROLE_NAMES[user?.role]}</Text>
                  </div>
                </div>
              </Dropdown>
            </div>
          </Space>
        </div>
      </AntHeader>

      <Register
        visible={registerVisible}
        onCancel={() => setRegisterVisible(false)}
        onSuccess={() => setRegisterVisible(false)}
      />
    </>
  );
};

export default Header;
