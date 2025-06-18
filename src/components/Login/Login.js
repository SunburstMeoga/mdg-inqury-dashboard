import React, { useState } from 'react';
import { Form, Input, Button, Select, Card, message } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { PROJECT_NAME, LOGO_URL, HOSPITAL_AREAS } from '../../utils/constants';
import './Login.css';

const { Option } = Select;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await login(values);
      if (result.success) {
        message.success('登录成功');
      } else {
        message.error(result.message);
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
        </div>

        <Form
          name="login"
          className="login-form"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="hospitalArea"
            rules={[{ required: true, message: '请选择院区' }]}
          >
            <Select
              placeholder="请选择院区"
              prefix={<BankOutlined />}
            >
              {HOSPITAL_AREAS.map(area => (
                <Option key={area} value={area}>{area}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
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
          <p>测试账号：</p>
          <p>医生：doctor001 / 123456</p>
          <p>咨询师：counselor001 / 123456</p>
          <p>管理员：admin / admin123</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
