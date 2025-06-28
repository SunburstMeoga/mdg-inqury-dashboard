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
    const initializeUser = async () => {
      // 检查本地存储中的用户信息
      const savedUser = localStorage.getItem('doctor_user');
      const token = localStorage.getItem('doctor_token');

      if (savedUser && token) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // 如果用户信息不包含doctor_role，尝试刷新获取完整信息
          if (!parsedUser.doctor_role && parsedUser.id) {
            try {
              const detailResult = await ApiService.getDoctorDetail(parsedUser.id);
              if (detailResult.success) {
                setUser(detailResult.data);
                localStorage.setItem('doctor_user', JSON.stringify(detailResult.data));
              }
            } catch (error) {
              console.log('刷新用户信息失败，使用缓存信息');
            }
          }
        } catch (error) {
          console.error('解析用户信息失败:', error);
          localStorage.removeItem('doctor_user');
          localStorage.removeItem('doctor_token');
        }
      }
      setLoading(false);
    };

    initializeUser();
  }, []);

  const login = async (credentials) => {
    try {
      const result = await ApiService.login(credentials);
      if (result.success) {
        const basicUserData = result.data.userData;

        // 登录成功后，获取完整的用户信息（包括doctor_role）
        try {
          const detailResult = await ApiService.getDoctorDetail(basicUserData.id);
          if (detailResult.success) {
            // 使用完整的用户信息
            const fullUserData = detailResult.data;
            setUser(fullUserData);
            localStorage.setItem('doctor_user', JSON.stringify(fullUserData));
            return { success: true, user: fullUserData, message: result.message };
          } else {
            // 如果获取详情失败，使用基础用户信息
            setUser(basicUserData);
            return { success: true, user: basicUserData, message: result.message };
          }
        } catch (error) {
          // 如果获取详情出错，使用基础用户信息
          setUser(basicUserData);
          return { success: true, user: basicUserData, message: result.message };
        }
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
      // 首先尝试获取基础用户信息
      const basicResult = await ApiService.getDoctorInfo();
      if (basicResult.success && basicResult.data?.id) {
        // 然后获取完整的用户详情
        const detailResult = await ApiService.getDoctorDetail(basicResult.data.id);
        if (detailResult.success) {
          setUser(detailResult.data);
          localStorage.setItem('doctor_user', JSON.stringify(detailResult.data));
          return { success: true, user: detailResult.data };
        } else {
          // 如果获取详情失败，使用基础信息
          setUser(basicResult.data);
          localStorage.setItem('doctor_user', JSON.stringify(basicResult.data));
          return { success: true, user: basicResult.data };
        }
      } else {
        return { success: false, message: basicResult.message };
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
      // 如果没有用户信息，返回false
      if (!user) return false;

      // 如果有ability字段，使用原有逻辑
      if (user.ability && Array.isArray(user.ability)) {
        return user.ability.some(ability =>
          (ability.action === action || ability.action === 'manage') &&
          ability.subject === subject
        );
      }

      // 如果没有ability字段，使用简化的权限逻辑
      // 管理员拥有所有权限
      if (user.is_admin) {
        return true;
      }

      // 普通用户的基础权限
      if (subject === 'Consultation' && action === 'read') {
        return true; // 所有用户都可以查看咨询记录
      }

      if (subject === 'Auth' && action === 'read') {
        return true; // 所有用户都可以管理自己的密码
      }

      if (subject === 'Doctor' && action === 'manage') {
        return user.is_admin; // 只有管理员可以管理医生
      }

      return false;
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
