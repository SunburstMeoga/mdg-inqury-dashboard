import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Modal, message, Switch, Select } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import ApiService from '../../services/api';

const { Option } = Select;

const DoctorForm = ({ visible, doctor, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form] = Form.useForm();

  // 加载组织列表
  const loadOrganizations = async () => {
    setOrganizationsLoading(true);
    try {
      const result = await ApiService.getOrganizationList({ MaxResultCount: 200 });
      if (result.success) {
        setOrganizations(result.data || []);
      } else {
        message.error(result.message || '加载组织列表失败');
      }
    } catch (error) {
      message.error('加载组织列表失败');
    } finally {
      setOrganizationsLoading(false);
    }
  };

  // 加载角色选项
  const loadRoles = async () => {
    setRolesLoading(true);
    try {
      const result = await ApiService.getDoctorRoleOptions();
      if (result.success) {
        setRoles(result.data || []);
      } else {
        message.error(result.message || '加载角色选项失败');
      }
    } catch (error) {
      message.error('加载角色选项失败');
    } finally {
      setRolesLoading(false);
    }
  };

  // 当医生数据变化时，更新表单
  useEffect(() => {
    if (visible) {
      loadOrganizations(); // 加载组织列表
      loadRoles(); // 加载角色选项

      if (doctor) {
        // 编辑模式 - 处理医生的组织信息
        let orgIds = [];
        if (doctor.organizations && Array.isArray(doctor.organizations)) {
          // 如果有organizations数组，提取ID
          orgIds = doctor.organizations.map(org => org.id || org.Id);
        } else if (doctor.org_ids && Array.isArray(doctor.org_ids)) {
          // 如果有org_ids数组
          orgIds = doctor.org_ids;
        } else if (doctor.org_id) {
          // 如果只有单个org_id
          orgIds = [doctor.org_id];
        }

        form.setFieldsValue({
          name: doctor.name,
          email: doctor.email,
          is_active: doctor.is_active,
          is_admin: doctor.is_admin,
          doctor_role_id: doctor.doctor_role_id || 1, // 默认为医生角色
          org_ids: orgIds
        });
      } else {
        // 新增模式
        form.resetFields();
        form.setFieldsValue({
          is_active: true,
          is_admin: false,
          doctor_role_id: 1 // 默认选择医生角色
        });
      }
    }
  }, [visible, doctor, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let result;

      if (doctor) {
        // 编辑医生
        result = await ApiService.updateDoctor({
          id: doctor.id,
          ...values
        });
      } else {
        // 创建医生
        result = await ApiService.createDoctor(values);
      }

      if (result.success) {
        message.success(result.message || `医生${doctor ? '更新' : '创建'}成功`);
        form.resetFields();
        onSuccess && onSuccess();
      } else {
        message.error(result.message || `${doctor ? '更新' : '创建'}医生失败`);
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
      message.error(`${doctor ? '更新' : '创建'}医生失败，请重试`);
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
      title={doctor ? '编辑账号' : '新增账号'}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        name="doctorForm"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          label="用户角色"
          name="doctor_role_id"
          rules={[
            { required: true, message: '请选择用户角色' }
          ]}
        >
          <Select
            placeholder="请选择用户角色"
            disabled={!!doctor}
            loading={rolesLoading}
            showSearch
            filterOption={(input, option) => {
              const label = option.label;
              if (typeof label === 'string') {
                return label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }
              return false;
            }}
            options={roles.map(role => ({
              value: role.id,
              label: role.name,
              title: role.description // 鼠标悬停时显示描述
            }))}
          />
        </Form.Item>

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
            placeholder="请输入姓名"
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
            disabled={!!doctor} // 编辑时不允许修改邮箱
          />
        </Form.Item>

        {!doctor && (
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

        {!doctor && (
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
            filterOption={(input, option) => {
              const children = option.children;
              if (typeof children === 'string') {
                return children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }
              return false;
            }}
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

        <Form.Item
          label="管理员权限"
          name="is_admin"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="是"
            unCheckedChildren="否"
          />
        </Form.Item>

        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f6f8fa', borderRadius: 6 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
            <strong>注意事项：</strong>
          </p>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 16, fontSize: 12, color: '#666' }}>
            <li>邮箱将作为登录账号，创建后不可修改</li>
            <li>密码要求：至少6位，包含大小写字母和数字</li>
            <li>可以选择多个院区，用户将能够访问所选院区的数据</li>
            <li>管理员可以管理其他用户和查看所有数据</li>
            <li>角色决定了用户的职能和权限范围</li>
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
            {doctor ? '更新' : '创建'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DoctorForm;
