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
  Tooltip,
  Progress,
  Modal
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
  BankOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import ApiService from '../../services/api';
import {
  ORTHOK_STATUS_NAMES,
  ANALYSIS_STATUS_COLORS,
  PACS_REPORT_STATUS,
  PACS_REPORT_STATUS_NAMES,
  PACS_REPORT_STATUS_COLORS,
  COMPREHENSIVE_REPORT_STATUS,
  COMPREHENSIVE_REPORT_STATUS_NAMES,
  COMPREHENSIVE_REPORT_STATUS_COLORS
} from '../../utils/constants';
import useReportPolling from '../../hooks/useReportPolling';
import ProgressTimer from '../../components/ProgressTimer/ProgressTimer';
import './OrthoK.css';

const { Search } = Input;
const { Title, Text } = Typography;

const OrthoK = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalGroups: 0,
    totalRecords: 0
  });

  // 使用报告轮询Hook
  const {
    reportPolling,
    startPolling,
    stopAllPolling,
    isPolling
  } = useReportPolling();

  // 初始加载数据
  useEffect(() => {
    handleSearch('');
  }, []);

  // 清理轮询定时器
  useEffect(() => {
    return () => {
      stopAllPolling();
    };
  }, [stopAllPolling]);

  // 搜索数据
  const handleSearch = async (value, page = 1, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      // 构建搜索参数
      const params = {
        page: page,
        per_page: pageSize,
        department: '视光科'  // 塑形镜分析页面传入视光科
      };

      if (value) {
        // 根据输入内容判断是门诊号还是患者姓名
        if (/^[A-Z]{2}\d+$/.test(value)) {
          params.outpatient_number = value;
        } else {
          // 暂时使用门诊号搜索，因为API不支持按姓名搜索
          params.outpatient_number = value;
        }
      }

      const result = await ApiService.getPacsRecordsGrouped(params);
      if (result.success) {
        setData(result.data);
        setSearchTerm(value);
        setPagination(prev => ({
          ...prev,
          current: result.current_page || page,
          pageSize: result.per_page || pageSize,
          total: result.total_groups || 0,
          totalGroups: result.total_groups || 0,
          totalRecords: result.total_records || 0
        }));
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 触发AI分析
  const handleTriggerAiAnalysis = async (record) => {
    setActionLoading(prev => ({ ...prev, [`ai_${record.visit_id}`]: true }));
    try {
      const result = await ApiService.triggerAiAnalysis(record.visit_id);
      if (result.success) {
        message.success(result.message);
        // 刷新数据
        handleSearch(searchTerm, pagination.current, pagination.pageSize);
      } else {
        // 显示详细的错误信息
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat();
          message.error(`${result.message}: ${errorMessages.join(', ')}`);
        } else {
          message.error(result.message);
        }
      }
    } catch (error) {
      message.error('触发AI分析失败，请重试');
    } finally {
      setActionLoading(prev => ({ ...prev, [`ai_${record.visit_id}`]: false }));
    }
  };

  // 生成综合报告
  const handleGenerateReport = async (record) => {
    setActionLoading(prev => ({ ...prev, [`report_${record.visit_id}`]: true }));
    try {
      const result = await ApiService.generateComprehensiveReport(record.visit_id);
      if (result.success) {
        message.success(result.message);
        // 开始轮询报告状态
        startPolling(result.data.report.report_id, record.visit_id, (status, reportData) => {
          // 轮询完成回调
          handleSearch(searchTerm, pagination.current, pagination.pageSize);
        });
        // 刷新数据
        handleSearch(searchTerm, pagination.current, pagination.pageSize);
      } else {
        // 显示详细的错误信息
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat();
          message.error(`${result.message}: ${errorMessages.join(', ')}`);
        } else {
          message.error(result.message);
        }
      }
    } catch (error) {
      message.error('生成综合报告失败，请重试');
    } finally {
      setActionLoading(prev => ({ ...prev, [`report_${record.visit_id}`]: false }));
    }
  };

  // 查询综合报告状态
  const handleQueryReportStatus = async (record) => {
    const reportId = record.comprehensive_report?.report_id;
    if (!reportId) {
      message.error('报告ID不存在');
      return;
    }

    setActionLoading(prev => ({ ...prev, [`status_${record.visit_id}`]: true }));
    try {
      const result = await ApiService.getReportStatus(reportId);
      if (result.success) {
        const { status, progress } = result.data;

        if (status === 'completed') {
          message.success('报告生成完成');
          // 更新本地数据
          setData(prevData =>
            prevData.map(item =>
              item.visit_id === record.visit_id
                ? {
                    ...item,
                    comprehensive_report: {
                      ...item.comprehensive_report,
                      status: 'completed',
                      ...result.data
                    }
                  }
                : item
            )
          );
        } else if (status === 'processing') {
          message.info(`报告生成中，进度：${progress || 0}%`);
        } else if (status === 'failed') {
          message.error('报告生成失败');
        } else {
          message.info(`报告状态：${status}`);
        }
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('查询报告状态失败，请重试');
    } finally {
      setActionLoading(prev => ({ ...prev, [`status_${record.visit_id}`]: false }));
    }
  };

  // 下载报告
  const handleDownloadReport = (record) => {
    const downloadUrl = record.comprehensive_report?.download_url;
    if (!downloadUrl) {
      message.error('下载链接不存在');
      return;
    }

    // 创建一个隐藏的链接元素来触发下载
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.download = `综合报告_${record.patient_name || record.visit_id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success('开始下载报告');
  };

  // 重新生成报告
  const handleRegenerateReport = async (record) => {
    Modal.confirm({
      title: '重新生成报告',
      content: '确认要重新生成综合报告吗？这将覆盖现有报告。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => handleGenerateReport(record)
    });
  };

  // 查看报告
  const handleViewReport = (record) => {
    navigate(`/orthok/report/${record.visit_id}`);
  };

  // 修改报告（直接跳转到报告页面）
  const handleModifyReport = (record) => {
    navigate(`/orthok/report/${record.visit_id}?mode=edit`);
  };

  // 分页变化处理
  const handleTableChange = (paginationConfig) => {
    const { current, pageSize } = paginationConfig;
    setPagination(prev => ({
      ...prev,
      current,
      pageSize
    }));
    // 重新搜索数据
    handleSearch(searchTerm, current, pageSize);
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 检查是否可以触发AI分析
  const canTriggerAiAnalysis = (records) => {
    return records && records.some(record => record.report_status === PACS_REPORT_STATUS.PENDING);
  };

  // 检查是否可以生成综合报告
  const canGenerateReport = (records) => {
    return records && records.length > 0 && records.every(record => record.report_status === PACS_REPORT_STATUS.FINISHED);
  };

  // 获取记录状态摘要
  const getRecordsSummary = (records) => {
    if (!records || records.length === 0) return '无记录';

    const pending = records.filter(r => r.report_status === PACS_REPORT_STATUS.PENDING).length;
    const processing = records.filter(r => r.report_status === PACS_REPORT_STATUS.PROCESSING).length;
    const finished = records.filter(r => r.report_status === PACS_REPORT_STATUS.FINISHED).length;

    return `总计${records.length}项 (未处理:${pending}, 处理中:${processing}, 已完成:${finished})`;
  };

  // 表格列定义
  const columns = [
    {
      title: '就诊号',
      dataIndex: 'outpatient_number',
      key: 'outpatient_number',
      width: 140,
      render: (text) => (
        <Space>
          <IdcardOutlined style={{ color: '#666' }} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: '患者ID',
      dataIndex: 'patient_id',
      key: 'patient_id',
      width: 100,
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: '#666' }} />
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: '身份证号',
      dataIndex: 'id_card_number',
      key: 'id_card_number',
      width: 160,
      render: (text) => (
        <Text>{text ? `${text.slice(0, 6)}****${text.slice(-4)}` : '-'}</Text>
      )
    },
    {
      title: '合作机构',
      dataIndex: 'organization_name',
      key: 'organization_name',
      width: 180,
      render: (text) => (
        <Space>
          <BankOutlined style={{ color: '#666' }} />
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: 'PACS记录状态',
      dataIndex: 'records',
      key: 'records_status',
      width: 200,
      render: (records, record) => {
        const polling = reportPolling[record.visit_id];

        if (polling) {
          return (
            <div>
              <Tag color="blue" style={{ marginBottom: 8 }}>
                正在生成综合报告
              </Tag>
              <Progress
                percent={polling.progress}
                size="small"
                status="active"
                format={percent => `${percent}%`}
              />
            </div>
          );
        }

        return (
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {getRecordsSummary(records)}
            </Text>
            <div style={{ marginTop: 4 }}>
              {records && records.slice(0, 3).map((record, index) => (
                <Tag
                  key={index}
                  color={PACS_REPORT_STATUS_COLORS[record.report_status]}
                  size="small"
                  style={{ marginBottom: 2 }}
                >
                  {record.examination_type}: {PACS_REPORT_STATUS_NAMES[record.report_status]}
                </Tag>
              ))}
              {records && records.length > 3 && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  ...等{records.length - 3}项
                </Text>
              )}
            </div>
          </div>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_, record) => {
        const canTriggerAi = canTriggerAiAnalysis(record.records);
        const canGenerate = canGenerateReport(record.records);
        const isPollingReport = isPolling(record.visit_id);
        const comprehensiveReport = record.comprehensive_report;

        // 根据综合报告状态决定显示的按钮
        const renderReportButtons = () => {
          if (!comprehensiveReport) {
            // comprehensive_report = null：显示生成综合报告按钮
            return canGenerate && !isPollingReport && (
              <Tooltip title="生成综合报告">
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  size="small"
                  loading={actionLoading[`report_${record.visit_id}`]}
                  onClick={() => handleGenerateReport(record)}
                >
                  生成报告
                </Button>
              </Tooltip>
            );
          } else if (comprehensiveReport.status === 'pending') {
            // status = "pending"：显示查询综合报告状态按钮
            return (
              <Tooltip title="查询综合报告状态">
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  size="small"
                  loading={actionLoading[`status_${record.visit_id}`]}
                  onClick={() => handleQueryReportStatus(record)}
                >
                  查询状态
                </Button>
              </Tooltip>
            );
          } else if (comprehensiveReport.status === 'completed') {
            // status = "completed"：显示下载报告和重新生成报告按钮
            return (
              <Space size="small">
                <Tooltip title="下载报告">
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    size="small"
                    onClick={() => handleDownloadReport(record)}
                  >
                    下载报告
                  </Button>
                </Tooltip>
                <Tooltip title="重新生成报告">
                  <Button
                    type="default"
                    icon={<ReloadOutlined />}
                    size="small"
                    loading={actionLoading[`report_${record.visit_id}`]}
                    onClick={() => handleRegenerateReport(record)}
                  >
                    重新生成
                  </Button>
                </Tooltip>
              </Space>
            );
          } else if (comprehensiveReport.status === 'processing') {
            // status = "processing"：显示查询状态按钮，并显示进度
            return (
              <Space size="small" direction="vertical">
                <Tooltip title="查询综合报告状态">
                  <Button
                    type="default"
                    icon={<EyeOutlined />}
                    size="small"
                    loading={actionLoading[`status_${record.visit_id}`]}
                    onClick={() => handleQueryReportStatus(record)}
                  >
                    查询状态
                  </Button>
                </Tooltip>
                {comprehensiveReport.progress !== undefined && (
                  <Progress
                    percent={comprehensiveReport.progress}
                    size="small"
                    status="active"
                    format={percent => `${percent}%`}
                  />
                )}
              </Space>
            );
          }
          return null;
        };

        return (
          <Space size="small" direction="vertical">
            <Space size="small">
              {canTriggerAi && (
                <Tooltip title="触发AI分析">
                  <Button
                    type="primary"
                    icon={<ExperimentOutlined />}
                    size="small"
                    loading={actionLoading[`ai_${record.visit_id}`]}
                    onClick={() => handleTriggerAiAnalysis(record)}
                  >
                    AI分析
                  </Button>
                </Tooltip>
              )}
              {renderReportButtons()}
            </Space>
          </Space>
        );
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
            共找到 {pagination.totalGroups} 个分组，{pagination.totalRecords} 条记录
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="visit_id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条分组`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
          className="analysis-table"
        />
      </Card>
    </div>
  );
};

export default OrthoK;
