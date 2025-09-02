import React, { useState } from 'react';
import { Layout, Avatar, Dropdown, Space, Typography, Modal, message, Button } from 'antd';
import { UserOutlined, LogoutOutlined, LockOutlined, InfoCircleOutlined, MenuOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { PROJECT_NAME, LOGO_URL, ORGANIZATION_TYPES } from '../../utils/constants';
import ChangePassword from '../ChangePassword/ChangePassword';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = ({ onMenuClick, isMobile }) => {
  const { user, logout, isAdmin } = useAuth();
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  const handleLogout = async () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const result = await logout();
        if (result.success) {
          message.success(result.message || '已成功退出登录');
        } else {
          message.error(result.message || '退出失败');
        }
      }
    });
  };

  const handleChangePassword = () => {
    setChangePasswordVisible(true);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <InfoCircleOutlined />,
      label: '个人信息',
      disabled: true // 暂时禁用，后续可以添加个人信息页面
    },
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: '修改密码',
      onClick: handleChangePassword,
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
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={onMenuClick}
              className="mobile-menu-button"
            />
          )}
          <img src={LOGO_URL} alt="Logo" className="header-logo" />
          <span className="header-title">{PROJECT_NAME}</span>
        </div>

        <div className="header-right">
          <Space size="middle">
            <div className="user-info">
              <Text className="organization-info">
                {user?.organization?.name} ({ORGANIZATION_TYPES[user?.organization?.type] || '未知类型'})
              </Text>
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
                    <Text className="user-role">
                      {user?.doctor_role?.name || '医生'}
                      {isAdmin && ' (管理员)'}
                      {user?.is_active === false && ' (已禁用)'}
                    </Text>
                  </div>
                </div>
              </Dropdown>
            </div>
          </Space>
        </div>
      </AntHeader>

      <ChangePassword
        visible={changePasswordVisible}
        onCancel={() => setChangePasswordVisible(false)}
        onSuccess={() => setChangePasswordVisible(false)}
      />
    </>
  );
};

export default Header;
