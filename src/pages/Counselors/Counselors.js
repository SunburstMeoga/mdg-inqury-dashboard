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
import { PAGINATION_CONFIG } from '../../utils/constants';
import CounselorForm from './CounselorForm';
import './Counselors.css';

const { Search } = Input;
const { Title, Text } = Typography;

const Counselors = () => {
  const [loading, setLoading] = useState(false);
  const [counselors, setCounselors] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
  });
  const [formVisible, setFormVisible] = useState(false);
  const [editingCounselor, setEditingCounselor] = useState(null);

  const { isAdmin } = useAuth();

  // 加载咨询师列表
  const loadCounselors = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        per_page: pagination.pageSize,
        user_type: 'counselor',
        ...(searchTerm && { search: searchTerm })
      };

      const result = await ApiService.getCounselorList(params);
      if (result.success) {
        setCounselors(result.data);
        setTotal(result.total);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('加载咨询师列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    if (isAdmin) {
      loadCounselors();
    }
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

  // 新增咨询师
  const handleAdd = () => {
    setEditingCounselor(null);
    setFormVisible(true);
  };

  // 编辑咨询师
  const handleEdit = (record) => {
    setEditingCounselor(record);
    setFormVisible(true);
  };

  // 删除咨询师
  const handleDelete = (record) => {
    Modal.confirm({
      title: '删除咨询师',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除咨询师 "${record.name}" 吗？此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await ApiService.deleteCounselor(record.id);
          if (result.success) {
            message.success(result.message);
            loadCounselors(); // 重新加载列表
          } else {
            message.error(result.message);
          }
        } catch (error) {
          message.error('删除咨询师失败，请重试');
        }
      }
    });
  };

  // 表单成功回调
  const handleFormSuccess = () => {
    setFormVisible(false);
    setEditingCounselor(null);
    loadCounselors(); // 重新加载列表
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
      title: '所属院区',
      dataIndex: 'organizations',
      key: 'organizations',
      width: 200,
      render: (organizations) => {
        if (!organizations || organizations.length === 0) return '-';
        return (
          <div>
            {organizations.map(org => (
              <Tag key={org.Id} color="blue" style={{ marginBottom: 4 }}>
                {org.Name}
              </Tag>
            ))}
          </div>
        );
      }
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
          <p>只有管理员可以访问咨询师管理功能</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="counselors-page">
      <Card className="filter-card">
        <div className="filter-header">
          <Title level={4} style={{ margin: 0, color: '#004EA2' }}>
            咨询师管理
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增咨询师
          </Button>
        </div>

        <div className="filter-container">
          <Space wrap size="middle">
            <Search
              placeholder="搜索咨询师姓名或邮箱"
              allowClear
              style={{ width: 300 }}
              onSearch={handleSearch}
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={loadCounselors}
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
          dataSource={counselors}
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
          className="counselors-table"
        />
      </Card>

      <CounselorForm
        visible={formVisible}
        counselor={editingCounselor}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Counselors;
