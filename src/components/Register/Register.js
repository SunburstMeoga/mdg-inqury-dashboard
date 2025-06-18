import React, { useState } from 'react';
import { Form, Input, Button, Select, message, Modal } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES, USER_ROLE_NAMES, HOSPITAL_AREAS } from '../../utils/constants';

const { Option } = Select;

const Register = ({ visible, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { register } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await register(values);
      if (result.success) {
        message.success(result.message);
        form.resetFields();
        onSuccess && onSuccess();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel && onCancel();
  };

  return (
    <Modal
      title="注册新用户"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          label="姓名"
          name="name"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入姓名"
          />
        </Form.Item>

        <Form.Item
          label="用户名"
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 4, message: '用户名至少4个字符' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入用户名"
          />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6个字符' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入密码"
          />
        </Form.Item>

        <Form.Item
          label="确认密码"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请确认密码"
          />
        </Form.Item>

        <Form.Item
          label="角色"
          name="role"
          rules={[{ required: true, message: '请选择角色' }]}
        >
          <Select
            placeholder="请选择角色"
            prefix={<TeamOutlined />}
          >
            <Option value={USER_ROLES.DOCTOR}>{USER_ROLE_NAMES[USER_ROLES.DOCTOR]}</Option>
            <Option value={USER_ROLES.COUNSELOR}>{USER_ROLE_NAMES[USER_ROLES.COUNSELOR]}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="院区"
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

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            注册
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Register;
