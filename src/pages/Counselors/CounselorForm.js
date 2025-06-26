import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Modal, message, Switch, Select } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import ApiService from '../../services/api';

const { Option } = Select;

const CounselorForm = ({ visible, counselor, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [form] = Form.useForm();

  // 加载组织列表
  const loadOrganizations = async () => {
    setOrganizationsLoading(true);
    try {
      const result = await ApiService.getOrganizationList({ MaxResultCount: 200 });
      if (result.success) {
        setOrganizations(result.data || []);
      } else {
        message.error('加载组织列表失败');
      }
    } catch (error) {
      message.error('加载组织列表失败');
    } finally {
      setOrganizationsLoading(false);
    }
  };

  // 当咨询师数据变化时，更新表单
  useEffect(() => {
    if (visible) {
      loadOrganizations(); // 加载组织列表

      if (counselor) {
        // 编辑模式 - 处理咨询师的组织信息
        let orgIds = [];
        if (counselor.organizations && Array.isArray(counselor.organizations)) {
          // 如果有organizations数组，提取ID
          orgIds = counselor.organizations.map(org => org.id || org.Id);
        } else if (counselor.org_ids && Array.isArray(counselor.org_ids)) {
          // 如果有org_ids数组
          orgIds = counselor.org_ids;
        } else if (counselor.org_id) {
          // 如果只有单个org_id
          orgIds = [counselor.org_id];
        }

        form.setFieldsValue({
          name: counselor.name,
          email: counselor.email,
          is_active: counselor.is_active,
          org_ids: orgIds
        });
      } else {
        // 新增模式
        form.resetFields();
        form.setFieldsValue({
          is_active: true
        });
      }
    }
  }, [visible, counselor, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let result;

      // 添加用户类型标识
      const formData = {
        ...values,
        user_type: 'counselor'
      };

      if (counselor) {
        // 编辑咨询师
        result = await ApiService.updateCounselor({
          id: counselor.id,
          ...formData
        });
      } else {
        // 创建咨询师
        result = await ApiService.createCounselor(formData);
      }

      if (result.success) {
        message.success(result.message || `咨询师${counselor ? '更新' : '创建'}成功`);
        form.resetFields();
        onSuccess && onSuccess();
      } else {
        message.error(result.message);
        // 如果有字段错误，显示在表单中
        if (result.errors) {
          const fieldErrors = Object.keys(result.errors).map(field => ({
            name: field,
            errors: result.errors[field]
          }));
          form.setFields(fieldErrors);
        }
      }
    } catch (error) {
      message.error(`${counselor ? '更新' : '创建'}咨询师失败，请重试`);
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
      title={counselor ? '编辑咨询师' : '新增咨询师'}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        name="counselorForm"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          label="姓名"
          name="name"
          rules={[
            { required: true, message: '请输入姓名' },
            { min: 2, message: '姓名至少2个字符' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入咨询师姓名"
          />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="请输入邮箱地址"
            disabled={!!counselor} // 编辑时不允许修改邮箱
          />
        </Form.Item>

        {!counselor && (
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含大小写字母和数字' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>
        )}

        {!counselor && (
          <Form.Item
            label="确认密码"
            name="password_confirmation"
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
        )}

        <Form.Item
          label="所属院区"
          name="org_ids"
          rules={[
            { required: true, message: '请选择所属院区' }
          ]}
        >
          <Select
            mode="multiple"
            placeholder="请选择所属院区（可多选）"
            loading={organizationsLoading}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {organizations.map(org => (
              <Option key={org.id || org.Id} value={org.id || org.Id}>
                {org.name || org.Name} ({org.type === 2 ? '医院' : org.TypeText || '未知类型'})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="账号状态"
          name="is_active"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="启用"
            unCheckedChildren="禁用"
          />
        </Form.Item>

        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f6f8fa', borderRadius: 6 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
            <strong>注意事项：</strong>
          </p>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 16, fontSize: 12, color: '#666' }}>
            <li>邮箱将作为登录账号，创建后不可修改</li>
            <li>密码要求：至少6位，包含大小写字母和数字</li>
            <li>可以选择多个院区，咨询师将能够访问所选院区的数据</li>
            <li>咨询师主要负责心理咨询和患者沟通工作</li>
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
            {counselor ? '更新' : '创建'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CounselorForm;
