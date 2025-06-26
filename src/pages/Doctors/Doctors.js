import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Space,
  Tag,
  Button,
  Input,
  message,
  Modal,
  Typography,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import ApiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PAGINATION_CONFIG, ORGANIZATION_TYPES } from '../../utils/constants';
import DoctorForm from './DoctorForm';
import './Doctors.css';

const { Search } = Input;
const { Title, Text } = Typography;

const Doctors = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
  });
  const [formVisible, setFormVisible] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const { isAdmin } = useAuth();

  // 加载医生列表
  const loadDoctors = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        per_page: pagination.pageSize,
        ...(searchTerm && { search: searchTerm })
      };

      // 获取所有用户（医生和咨询师）
      const [doctorResult, counselorResult] = await Promise.all([
        ApiService.getDoctorList(params),
        ApiService.getCounselorList(params)
      ]);

      let allUsers = [];
      let totalCount = 0;

      if (doctorResult.success) {
        allUsers = [...allUsers, ...(doctorResult.data || [])];
        totalCount += doctorResult.total || 0;
      }

      if (counselorResult.success) {
        allUsers = [...allUsers, ...(counselorResult.data || [])];
        totalCount += counselorResult.total || 0;
      }

      if (doctorResult.success || counselorResult.success) {
        setDoctors(allUsers);
        setTotal(totalCount);
      } else {
        // 显示具体的错误信息
        const errorMessage = doctorResult.message || counselorResult.message || '加载用户列表失败';
        message.error(errorMessage);
      }
    } catch (error) {
      message.error('加载医生列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    if (isAdmin) {
      loadDoctors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, searchTerm, isAdmin]);

  // 搜索
  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // 分页变化
  const handleTableChange = (paginationConfig) => {
    setPagination({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    });
  };

  // 新增医生
  const handleAdd = () => {
    setEditingDoctor(null);
    setFormVisible(true);
  };

  // 编辑医生
  const handleEdit = (record) => {
    setEditingDoctor(record);
    setFormVisible(true);
  };

  // 删除用户
  const handleDelete = (record) => {
    const userType = record.user_type || 'doctor';
    const userTypeText = userType === 'counselor' ? '咨询师' : '医生';

    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除${userTypeText} "${record.name}" 吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          let result;
          if (userType === 'counselor') {
            result = await ApiService.deleteCounselor(record.id);
          } else {
            result = await ApiService.deleteDoctor(record.id);
          }

          if (result.success) {
            message.success(result.message || `${userTypeText}删除成功`);
            loadDoctors();
          } else {
            message.error(result.message || `删除${userTypeText}失败`);
          }
        } catch (error) {
          message.error('删除失败，请重试');
        }
      }
    });
  };

  // 表单提交成功
  const handleFormSuccess = () => {
    setFormVisible(false);
    setEditingDoctor(null);
    loadDoctors();
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200
    },
    {
      title: '组织',
      key: 'organization',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.organization?.name || '-'}</div>
          {record.organization?.type && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {ORGANIZATION_TYPES[record.organization.type]}
            </Text>
          )}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '角色',
      key: 'role',
      width: 100,
      render: (_, record) => {
        if (record.is_admin) {
          return <Tag color="blue">管理员</Tag>;
        }
        const userType = record.user_type || 'doctor';
        return (
          <Tag color={userType === 'counselor' ? 'green' : 'default'}>
            {userType === 'counselor' ? '咨询师' : '医生'}
          </Tag>
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (text) => formatDate(text)
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Tooltip title="删除">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 检查管理员权限
  if (!isAdmin) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <ExclamationCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />
          <h3>权限不足</h3>
          <p>只有管理员可以访问账号管理功能</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="doctors-page">
      <Card className="filter-card">
        <div className="filter-header">
          <Title level={4} style={{ margin: 0, color: '#004EA2' }}>
            账号管理
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增账号
          </Button>
        </div>

        <div className="filter-container">
          <Space wrap size="middle">
            <Search
              placeholder="搜索姓名或邮箱"
              allowClear
              style={{ width: 300 }}
              onSearch={handleSearch}
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={loadDoctors}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        </div>
      </Card>

      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={doctors}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: PAGINATION_CONFIG.SHOW_SIZE_CHANGER,
            showQuickJumper: PAGINATION_CONFIG.SHOW_QUICK_JUMPER,
            showTotal: PAGINATION_CONFIG.SHOW_TOTAL,
            pageSizeOptions: PAGINATION_CONFIG.PAGE_SIZE_OPTIONS
          }}
          onChange={handleTableChange}
          className="doctors-table"
        />
      </Card>

      <DoctorForm
        visible={formVisible}
        doctor={editingDoctor}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Doctors;
