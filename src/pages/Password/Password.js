import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Divider,
  Alert
} from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';
import './Password.css';

const Password = () => {
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [batchResetLoading, setBatchResetLoading] = useState(false);

  const [changePasswordForm] = Form.useForm();
  const [resetPasswordForm] = Form.useForm();
  const [batchResetForm] = Form.useForm();

  const { isAdmin, changePassword } = useAuth();

  // 修改自己的密码
  const handleChangePassword = async (values) => {
    setChangePasswordLoading(true);
    try {
      const result = await changePassword({
        current_password: values.currentPassword,
        new_password: values.newPassword,
        new_password_confirmation: values.confirmPassword
      });

      if (result.success) {
        message.success(result.message || '密码修改成功');
        changePasswordForm.resetFields();
      } else {
        message.error(result.message || '密码修改失败');
      }
    } catch (error) {
      message.error('密码修改失败，请重试');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // 重置其他医生密码（管理员）
  const handleResetPassword = async (values) => {
    setResetPasswordLoading(true);
    try {
      const result = await ApiService.resetPassword({
        email: values.email,
        new_password: values.newPassword,
        new_password_confirmation: values.confirmPassword
      });

      if (result.success) {
        message.success(result.message || '密码重置成功');
        resetPasswordForm.resetFields();
      } else {
        message.error(result.message || '密码重置失败');
      }
    } catch (error) {
      message.error('密码重置失败，请重试');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  // 批量重置密码（管理员）
  const handleBatchReset = async (values) => {
    setBatchResetLoading(true);
    try {
      const emails = values.emails.split('\n').map(email => email.trim()).filter(email => email);
      const result = await ApiService.batchResetPassword({
        emails: emails,
        new_password: values.newPassword,
        new_password_confirmation: values.confirmPassword
      });

      if (result.success) {
        message.success(result.message || `批量重置成功，共处理 ${result.data?.success_count || 0} 个账号`);
        if (result.data?.failed_count > 0) {
          message.warning(`${result.data.failed_count} 个账号重置失败`);
        }
        batchResetForm.resetFields();
      } else {
        message.error(result.message || '批量重置失败');
      }
    } catch (error) {
      message.error('批量重置失败，请重试');
    } finally {
      setBatchResetLoading(false);
    }
  };

  return (
    <div className="password-page">
      {/* 修改自己的密码 */}
      <Card title="修改密码" className="password-card">
        <Alert
          message="密码安全提示"
          description="为了账号安全，建议定期更换密码。新密码应包含大小写字母、数字，长度至少6位。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={changePasswordForm}
          name="changePassword"
          onFinish={handleChangePassword}
          layout="vertical"
          style={{ maxWidth: 400 }}
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

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={changePasswordLoading}
            >
              修改密码
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 管理员功能 */}
      {isAdmin && (
        <>
          <Divider />

          {/* 重置单个医生密码 */}
          <Card title="重置医生密码" className="password-card">
            <Alert
              message="管理员功能"
              description="可以重置指定医生的密码。请谨慎使用此功能。"
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={resetPasswordForm}
              name="resetPassword"
              onFinish={handleResetPassword}
              layout="vertical"
              style={{ maxWidth: 400 }}
            >
              <Form.Item
                label="医生邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入医生邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入要重置密码的医生邮箱"
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

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={resetPasswordLoading}
                  danger
                >
                  重置密码
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* 批量重置密码 */}
          <Card title="批量重置密码" className="password-card">
            <Alert
              message="批量操作"
              description="可以批量重置多个医生的密码。每行输入一个邮箱地址。"
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={batchResetForm}
              name="batchReset"
              onFinish={handleBatchReset}
              layout="vertical"
              style={{ maxWidth: 500 }}
            >
              <Form.Item
                label="医生邮箱列表"
                name="emails"
                rules={[{ required: true, message: '请输入医生邮箱列表' }]}
              >
                <Input.TextArea
                  rows={6}
                  placeholder="请输入医生邮箱，每行一个&#10;例如：&#10;doctor1@example.com&#10;doctor2@example.com"
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

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={batchResetLoading}
                  danger
                >
                  批量重置密码
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </>
      )}
    </div>
  );
};

export default Password;
