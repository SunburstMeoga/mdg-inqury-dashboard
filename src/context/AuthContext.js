import React, { createContext, useContext, useState, useEffect } from 'react';
import { USER_ROLES } from '../utils/constants';

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
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // 模拟登录API调用
      const { hospitalArea, username, password } = credentials;
      
      // Mock登录验证
      const mockUsers = [
        { id: 1, username: 'doctor001', password: '123456', role: USER_ROLES.DOCTOR, hospitalArea: '北京总院', name: '张医生' },
        { id: 2, username: 'counselor001', password: '123456', role: USER_ROLES.COUNSELOR, hospitalArea: '北京总院', name: '李咨询师' },
        { id: 3, username: 'admin', password: 'admin123', role: USER_ROLES.ADMIN, hospitalArea: '北京总院', name: '超级管理员' }
      ];

      const foundUser = mockUsers.find(u => 
        u.username === username && 
        u.password === password && 
        u.hospitalArea === hospitalArea
      );

      if (foundUser) {
        const userInfo = {
          id: foundUser.id,
          username: foundUser.username,
          role: foundUser.role,
          hospitalArea: foundUser.hospitalArea,
          name: foundUser.name
        };
        
        setUser(userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
        return { success: true, user: userInfo };
      } else {
        return { success: false, message: '用户名、密码或院区不正确' };
      }
    } catch (error) {
      return { success: false, message: '登录失败，请重试' };
    }
  };

  const register = async (userData) => {
    try {
      // 模拟注册API调用
      const { username, password, role, hospitalArea, name } = userData;
      
      // 只有管理员可以注册新用户
      if (!user || user.role !== USER_ROLES.ADMIN) {
        return { success: false, message: '只有超级管理员可以注册新用户' };
      }

      // Mock注册逻辑
      const newUser = {
        id: Date.now(),
        username,
        password,
        role,
        hospitalArea,
        name
      };

      // 这里应该调用真实的API保存用户
      console.log('新用户注册:', newUser);
      
      return { success: true, message: '用户注册成功' };
    } catch (error) {
      return { success: false, message: '注册失败，请重试' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === USER_ROLES.ADMIN
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
