import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储中的用户信息
    const savedUser = localStorage.getItem('doctor_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('解析用户信息失败:', error);
        localStorage.removeItem('doctor_user');
        localStorage.removeItem('doctor_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const result = await ApiService.login(credentials);
      if (result.success) {
        setUser(result.data.userData);
        return { success: true, user: result.data.userData, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: '登录失败，请重试' };
    }
  };

  const logout = async () => {
    try {
      // 尝试调用API登出
      const result = await ApiService.logout();

      // 无论API调用是否成功，都清除本地存储和跳转
      // 这是因为登出操作应该总是成功的，即使服务器无法处理请求
      localStorage.removeItem('doctor_token');
      localStorage.removeItem('doctor_user');
      setUser(null);

      // 跳转到登录页
      window.location.href = '/login';

      if (result.success) {
        return { success: true, message: result.message || '已成功退出登录' };
      } else {
        // API调用失败但本地登出成功
        return { success: true, message: '已退出登录（服务器连接异常）' };
      }
    } catch (error) {
      // 网络错误等异常情况，仍然执行本地登出
      localStorage.removeItem('doctor_token');
      localStorage.removeItem('doctor_user');
      setUser(null);
      window.location.href = '/login';
      return { success: true, message: '已退出登录（网络异常）' };
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    try {
      const result = await ApiService.getDoctorInfo();
      if (result.success) {
        setUser(result.data);
        localStorage.setItem('doctor_user', JSON.stringify(result.data));
        return { success: true, user: result.data };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: '获取用户信息失败' };
    }
  };

  // 修改密码
  const changePassword = async (passwordData) => {
    try {
      const result = await ApiService.changePassword(passwordData);
      return result;
    } catch (error) {
      return { success: false, message: '修改密码失败，请重试' };
    }
  };

  const value = {
    user,
    login,
    logout,
    refreshUser,
    changePassword,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin === true,
    // 权限检查方法
    hasPermission: (action, subject) => {
      if (!user?.ability) return false;
      return user.ability.some(ability =>
        (ability.action === action || ability.action === 'manage') &&
        ability.subject === subject
      );
    },
    // 获取用户组织信息
    getOrganization: () => user?.organization,
    // 获取用户角色
    getRole: () => user?.role,
    // 获取用户ID
    getUserId: () => user?.id,
    // 获取组织ID
    getOrgId: () => user?.org_id
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
