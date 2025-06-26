import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Table,
  Space,
  Tag,
  Button,
  Input,
  Select,
  DatePicker,
  message,
  Modal,
  Typography,
  Image
} from 'antd';
import {
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import ApiService from '../../services/api';
import {
  CONSULTATION_STATUS_NAMES,
  CONSULTATION_STATUS_COLORS,
  PAGINATION_CONFIG,
  DATE_FORMATS
} from '../../utils/constants';
import './Consultations.css';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const Consultations = () => {
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [total, setTotal] = useState(0);
  const [organizations, setOrganizations] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    per_page: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
    search: '',
    status: '',
    organization_id: '',
    date_range: null
  });
  const [imagePreview, setImagePreview] = useState({
    visible: false,
    url: '',
    title: ''
  });

  // 使用ref来防止重复请求
  const isLoadingRef = useRef(false);

  // 加载预问诊记录列表
  const loadConsultations = async () => {
    // 防止重复请求
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);

    try {
      const params = {
        page: filters.page,
        per_page: filters.per_page,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.organization_id && { organization_id: filters.organization_id }),
        ...(filters.date_range && {
          start_date: filters.date_range[0].format(DATE_FORMATS.DATE),
          end_date: filters.date_range[1].format(DATE_FORMATS.DATE)
        })
      };

      const result = await ApiService.getConsultationList(params);
      if (result.success) {
        setConsultations(result.data || []);
        setTotal(result.total || 0);
        setOrganizations(result.organizations || []);
      } else {
        message.error(result.message || '加载预问诊记录失败');
      }
    } catch (error) {
      message.error('加载预问诊记录失败，请重试');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  // 初始加载和依赖变化时加载
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadConsultations();
    }, 100); // 添加小延迟防止快速连续调用

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page,
    filters.per_page,
    filters.search,
    filters.status,
    filters.organization_id,
    filters.date_range
  ]);

  // 搜索
  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  // 状态筛选
  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  };

  // 组织筛选
  const handleOrganizationChange = (value) => {
    setFilters(prev => ({ ...prev, organization_id: value, page: 1 }));
  };

  // 日期范围筛选
  const handleDateRangeChange = (dates) => {
    setFilters(prev => ({ ...prev, date_range: dates, page: 1 }));
  };

  // 分页变化
  const handleTableChange = (pagination) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      per_page: pagination.pageSize
    }));
  };

  // 下载报告
  const handleDownload = async (record) => {
    try {
      const result = await ApiService.downloadReport(record);
      if (result.success) {
        message.success(result.message);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('下载失败，请重试');
    }
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
      title: '患者姓名',
      key: 'patient_name',
      width: 120,
      render: (_, record) => (
        <Text strong>{record.patient?.Name || record.patient_id}</Text>
      )
    },
    {
      title: '手机号码',
      dataIndex: 'PhoneNumber',
      key: 'phone_number',
      width: 130,
      render: (_,record) => record.patient?.PhoneNumber || '-'
    },
    {
      title: '渠道来源',
      dataIndex: 'ChannelSource',
      key: 'channel_source',
      width: 120,
      render: (_,record) => record.patient?.ChannelSource || '-'
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (text) => formatDate(text)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={CONSULTATION_STATUS_COLORS[status]}>
          {CONSULTATION_STATUS_NAMES[status] || status}
        </Tag>
      )
    },
    {
      title: '院区',
      key: 'organization',
      width: 120,
      render: (_, record) => record.organization?.Name || '-'
    },

    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<DownloadOutlined />}
          onClick={() => handleDownload(record)}
          disabled={!record.report_url}
        >
          下载报告
        </Button>
      )
    }
  ];

  return (
    <div className="consultations-page">
      <Card className="filter-card">
        <div className="filter-header">
          <Title level={4} style={{ margin: 0, color: '#004EA2' }}>
            预问诊记录管理
          </Title>
        </div>

        <div className="filter-container">
          <Space wrap size="middle">
            <Search
              placeholder="搜索手机号码或身份证号"
              allowClear
              style={{ width: 250 }}
              onSearch={handleSearch}
            />

            {/* <Select
              placeholder="选择状态"
              allowClear
              style={{ width: 120 }}
              onChange={handleStatusChange}
            >
              {Object.entries(CONSULTATION_STATUS_NAMES).map(([key, value]) => (
                <Option key={key} value={key}>{value}</Option>
              ))}
            </Select> */}

            {organizations.length > 0 && (
              <Select
                placeholder="选择组织"
                allowClear
                style={{ width: 150 }}
                onChange={handleOrganizationChange}
              >
                {organizations.map(org => (
                  <Option key={org.Id} value={org.Id}>{org.Name}</Option>
                ))}
              </Select>
            )}

            <RangePicker
              placeholder={['开始日期', '结束日期']}
              onChange={handleDateRangeChange}
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={loadConsultations}
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
          dataSource={consultations}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: filters.page,
            pageSize: filters.per_page,
            total: total,
            showSizeChanger: PAGINATION_CONFIG.SHOW_SIZE_CHANGER,
            showQuickJumper: PAGINATION_CONFIG.SHOW_QUICK_JUMPER,
            showTotal: PAGINATION_CONFIG.SHOW_TOTAL,
            pageSizeOptions: PAGINATION_CONFIG.PAGE_SIZE_OPTIONS
          }}
          onChange={handleTableChange}
          className="consultations-table"
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

export default Consultations;
