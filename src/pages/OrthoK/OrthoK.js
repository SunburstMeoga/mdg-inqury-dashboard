import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Table,
  Space,
  Tag,
  message,
  Typography,
  Tooltip
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  SearchOutlined,
  PlayCircleOutlined,
  EditOutlined,
  UserOutlined,
  IdcardOutlined,
  CalendarOutlined,
  EyeOutlined,
  BankOutlined
} from '@ant-design/icons';
import ApiService from '../../services/api';
import { ANALYSIS_STATUS_NAMES, ANALYSIS_STATUS_COLORS } from '../../utils/constants';
import './OrthoK.css';

const { Search } = Input;
const { Title, Text } = Typography;

const OrthoK = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  // 初始加载数据
  useEffect(() => {
    handleSearch('');
  }, []);

  // 搜索数据
  const handleSearch = async (value) => {
    setLoading(true);
    try {
      const result = await ApiService.getOrthoKList(value);
      if (result.success) {
        setData(result.data);
        setSearchTerm(value);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 开始生成报告
  const handleStartGeneration = async (record) => {
    setActionLoading(prev => ({ ...prev, [record.id]: true }));
    try {
      const result = await ApiService.startOrthoKGeneration(record.id);
      if (result.success) {
        message.success(result.message);
        // 刷新数据
        handleSearch(searchTerm);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('操作失败，请重试');
    } finally {
      setActionLoading(prev => ({ ...prev, [record.id]: false }));
    }
  };

  // 查看报告
  const handleViewReport = (record) => {
    navigate(`/orthok/report/${record.id}`);
  };

  // 修改报告（直接跳转到报告页面）
  const handleModifyReport = (record) => {
    navigate(`/orthok/report/${record.id}?mode=edit`);
  };

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 表格列定义
  const columns = [
    {
      title: '就诊号',
      dataIndex: 'visitNumber',
      key: 'visitNumber',
      width: 150,
      render: (text) => (
        <Space>
          <IdcardOutlined style={{ color: '#666' }} />
          <Text code>{text}</Text>
        </Space>
      )
    },
    {
      title: '姓名',
      dataIndex: 'patientName',
      key: 'patientName',
      width: 100,
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: '#666' }} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 80,
      render: (age) => <Text>{age}岁</Text>
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender) => (
        <Tag color={gender === '男' ? 'blue' : 'pink'}>{gender}</Tag>
      )
    },
    {
      title: '合作机构',
      dataIndex: 'hospital',
      key: 'hospital',
      width: 180,
      render: (hospital) => (
        <Space>
          <BankOutlined style={{ color: '#666' }} />
          <Text>{hospital}</Text>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={ANALYSIS_STATUS_COLORS[status]}>
          {ANALYSIS_STATUS_NAMES[status]}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (text) => (
        <Space>
          <CalendarOutlined style={{ color: '#666' }} />
          <Text>{formatDate(text)}</Text>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => {
        if (record.status === 'pending') {
          return (
            <Tooltip title="开始生成报告">
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                size="small"
                loading={actionLoading[record.id]}
                onClick={() => handleStartGeneration(record)}
              >
                生成
              </Button>
            </Tooltip>
          );
        } else if (record.status === 'completed') {
          return (
            <Space size="small">
              <Tooltip title="查看报告">
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() => handleViewReport(record)}
                >
                  查看
                </Button>
              </Tooltip>
              <Tooltip title="修改报告">
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleModifyReport(record)}
                >
                  修改
                </Button>
              </Tooltip>
            </Space>
          );
        } else {
          return (
            <Text type="secondary">-</Text>
          );
        }
      }
    }
  ];

  return (
    <div className="orthok-page">
      <Card className="search-card">
        <div className="search-header">
          <Title level={4} style={{ margin: 0, color: '#004EA2' }}>
            <Space>
              <EyeOutlined />
              塑形镜分析
            </Space>
          </Title>
          <Text type="secondary">
            请输入就诊号或患者姓名进行搜索
          </Text>
        </div>

        <div className="search-container">
          <Search
            placeholder="请输入就诊号或患者姓名"
            allowClear
            enterButton={
              <Button type="primary" icon={<SearchOutlined />}>
                搜索
              </Button>
            }
            size="large"
            onSearch={handleSearch}
            loading={loading}
            className="search-input"
          />
        </div>
      </Card>

      <Card className="results-card">
        <div className="results-header">
          <Title level={5} style={{ margin: 0 }}>
            搜索结果
            {searchTerm && (
              <Text type="secondary" style={{ marginLeft: 8 }}>
                (关键词: "{searchTerm}")
              </Text>
            )}
          </Title>
          <Text type="secondary">
            共找到 {data.length} 条记录
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: data.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
          }}
          className="analysis-table"
        />
      </Card>
    </div>
  );
};

export default OrthoK;
