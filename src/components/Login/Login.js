import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { PROJECT_NAME, LOGO_URL } from '../../utils/constants';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await login(values);
      if (result.success) {
        message.success(result.message || '登录成功');
      } else {
        message.error(result.message || '登录失败');
      }
    } catch (error) {
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <Card className="login-card">
        <div className="login-header">
          <img src={LOGO_URL} alt="Logo" className="login-logo" />
          <h1 className="login-title">{PROJECT_NAME}</h1>
          <p className="login-subtitle">医生后台管理系统</p>
        </div>

        <Form
          name="login"
          className="login-form"
          onFinish={onFinish}
          size="large"
          initialValues={{
            remember_me: false
          }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱地址"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item name="remember_me" valuePropName="checked">
            <Checkbox>记住登录状态（7天）</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="login-tips">
          <p>系统说明：</p>
          <p>• 请使用医生邮箱和密码登录</p>
          <p>• 普通医生可查看本组织预问诊记录</p>
          <p>• 管理员可管理医生和查看所有数据</p>
          <p>• 如忘记密码请联系管理员重置</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
