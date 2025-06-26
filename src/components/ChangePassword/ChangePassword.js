import React, { useState } from 'react';
import { Form, Input, Button, Modal, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const ChangePassword = ({ visible, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { changePassword } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await changePassword({
        current_password: values.currentPassword,
        new_password: values.newPassword,
        new_password_confirmation: values.confirmPassword
      });

      if (result.success) {
        message.success(result.message || '密码修改成功');
        form.resetFields();
        onSuccess && onSuccess();
      } else {
        message.error(result.message || '密码修改失败');
      }
    } catch (error) {
      message.error('密码修改失败，请重试');
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
      title="修改密码"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnHidden
    >
      <Form
        form={form}
        name="changePassword"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          label="当前密码"
          name="currentPassword"
          rules={[{ required: true, message: '请输入当前密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入当前密码"
          />
        </Form.Item>

        <Form.Item
          label="新密码"
          name="newPassword"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码至少6个字符' },
            { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含大小写字母和数字' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入新密码"
          />
        </Form.Item>

        <Form.Item
          label="确认新密码"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请确认新密码"
          />
        </Form.Item>

        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f6f8fa', borderRadius: 6 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
            <strong>密码要求：</strong>
          </p>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 16, fontSize: 12, color: '#666' }}>
            <li>至少6个字符</li>
            <li>必须包含大写字母</li>
            <li>必须包含小写字母</li>
            <li>必须包含数字</li>
          </ul>
        </div>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            修改密码
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePassword;
