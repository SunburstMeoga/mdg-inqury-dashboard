import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Table, 
  Space, 
  Tag, 
  Image, 
  message, 
  Modal,
  Typography,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  DownloadOutlined, 
  EyeOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import ApiService from '../../services/api';
import './PreConsultation.css';

const { Search } = Input;
const { Title, Text } = Typography;

const PreConsultation = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState({
    visible: false,
    url: '',
    title: ''
  });

  // 初始加载数据
  useEffect(() => {
    handleSearch('');
  }, []);

  // 搜索报告
  const handleSearch = async (value) => {
    setLoading(true);
    try {
      const result = await ApiService.searchPreConsultationReports(value);
      if (result.success) {
        setReports(result.data);
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

  // 下载报告
  const handleDownload = async (record) => {
    try {
      const result = await ApiService.downloadReport(record.id);
      if (result.success) {
        message.success(result.message);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('下载失败，请重试');
    }
  };

  // 预览图片
  const handlePreview = (record) => {
    setImagePreview({
      visible: true,
      url: record.reportThumbnail,
      title: `${record.patientName} - 预问诊报告`
    });
  };

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 表格列定义
  const columns = [
    {
      title: '患者姓名',
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
      title: '患者ID',
      dataIndex: 'patientId',
      key: 'patientId',
      width: 120,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '手机号码',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (text) => (
        <Space>
          <PhoneOutlined style={{ color: '#666' }} />
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      key: 'idCard',
      width: 180,
      render: (text) => (
        <Space>
          <IdcardOutlined style={{ color: '#666' }} />
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: '问诊时间',
      dataIndex: 'consultationTime',
      key: 'consultationTime',
      width: 160,
      render: (text) => (
        <Space>
          <CalendarOutlined style={{ color: '#666' }} />
          <Text>{formatDate(text)}</Text>
        </Space>
      )
    },
    {
      title: '报告生成时间',
      dataIndex: 'reportGenerateTime',
      key: 'reportGenerateTime',
      width: 160,
      render: (text) => (
        <Space>
          <CalendarOutlined style={{ color: '#666' }} />
          <Text>{formatDate(text)}</Text>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status === 'completed' ? '已完成' : '待处理'}
        </Tag>
      )
    },
    {
      title: '报告缩略图',
      dataIndex: 'reportThumbnail',
      key: 'reportThumbnail',
      width: 120,
      render: (url, record) => (
        <div className="thumbnail-container">
          <Image
            width={60}
            height={80}
            src={url}
            alt="报告缩略图"
            preview={false}
            className="report-thumbnail"
          />
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handlePreview(record)}
            className="preview-btn"
          >
            查看大图
          </Button>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="下载报告">
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => handleDownload(record)}
          >
            下载
          </Button>
        </Tooltip>
      )
    }
  ];

  return (
    <div className="pre-consultation-page">
      <Card className="search-card">
        <div className="search-header">
          <Title level={4} style={{ margin: 0, color: '#004EA2' }}>
            预问诊报告查询
          </Title>
          <Text type="secondary">
            请输入患者手机号码或身份证号进行搜索
          </Text>
        </div>
        
        <div className="search-container">
          <Search
            placeholder="请输入手机号码或身份证号"
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
            共找到 {reports.length} 条记录
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: reports.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
          }}
          className="reports-table"
        />
      </Card>

      <Modal
        open={imagePreview.visible}
        title={imagePreview.title}
        footer={null}
        onCancel={() => setImagePreview({ visible: false, url: '', title: '' })}
        width={600}
        centered
      >
        <div className="image-preview-container">
          <Image
            src={imagePreview.url}
            alt="报告预览"
            style={{ width: '100%' }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default PreConsultation;
