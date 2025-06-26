import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Space,
  Button,
  Typography,
  message,
  Spin
} from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import ApiService from '../../services/api';
import { DATE_FORMATS } from '../../utils/constants';
import './Statistics.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

const Statistics = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [filters, setFilters] = useState({
    date_range: null,
    organization_id: ''
  });

  // 加载统计数据
  const loadStatistics = async () => {
    setLoading(true);
    try {
      const params = {
        ...(filters.date_range && {
          start_date: filters.date_range[0].format(DATE_FORMATS.DATE),
          end_date: filters.date_range[1].format(DATE_FORMATS.DATE)
        }),
        ...(filters.organization_id && { organization_id: filters.organization_id })
      };

      const result = await ApiService.getConsultationStatistics(params);
      if (result.success) {
        setStatistics(result.data);
        // 如果有组织数据，更新组织列表
        if (result.queryParams?.accessible_organizations) {
          setOrganizations(result.queryParams.accessible_organizations);
        }
      } else {
        message.error(result.message || '加载统计数据失败');
      }
    } catch (error) {
      message.error('加载统计数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // 日期范围变化
  const handleDateRangeChange = (dates) => {
    setFilters(prev => ({ ...prev, date_range: dates }));
  };

  // 组织变化
  const handleOrganizationChange = (value) => {
    setFilters(prev => ({ ...prev, organization_id: value }));
  };

  // 刷新数据
  const handleRefresh = () => {
    loadStatistics();
  };

  return (
    <div className="statistics-page">
      <Card className="filter-card">
        <div className="filter-header">
          <Title level={4} style={{ margin: 0, color: '#004EA2' }}>
            统计分析
          </Title>
        </div>

        <div className="filter-container">
          <Space wrap size="middle">
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              onChange={handleDateRangeChange}
              style={{ width: 280 }}
            />

            {organizations.length > 0 && (
              <Select
                placeholder="选择组织"
                allowClear
                style={{ width: 200 }}
                onChange={handleOrganizationChange}
              >
                {organizations.map(org => (
                  <Option key={org.id} value={org.id}>{org.name}</Option>
                ))}
              </Select>
            )}

            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        </div>
      </Card>

      <Spin spinning={loading}>
        {statistics ? (
          <div className="statistics-content">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card">
                  <Statistic
                    title="总咨询数"
                    value={statistics.total_consultations || 0}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card">
                  <Statistic
                    title="已完成"
                    value={statistics.completed_consultations || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card">
                  <Statistic
                    title="待处理"
                    value={statistics.pending_consultations || 0}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card">
                  <Statistic
                    title="失败"
                    value={statistics.failed_consultations || 0}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* 完成率统计 */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col xs={24} lg={12}>
                <Card title="完成率统计" className="completion-card">
                  <div className="completion-stats">
                    <div className="completion-item">
                      <span className="completion-label">总体完成率</span>
                      <span className="completion-value">
                        {statistics.total_consultations > 0
                          ? ((statistics.completed_consultations / statistics.total_consultations) * 100).toFixed(1)
                          : 0
                        }%
                      </span>
                    </div>

                    <div className="completion-item">
                      <span className="completion-label">成功率</span>
                      <span className="completion-value">
                        {statistics.total_consultations > 0
                          ? (((statistics.total_consultations - statistics.failed_consultations) / statistics.total_consultations) * 100).toFixed(1)
                          : 0
                        }%
                      </span>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="组织统计" className="organization-card">
                  {statistics.organization_stats && statistics.organization_stats.length > 0 ? (
                    <div className="organization-stats">
                      {statistics.organization_stats.map((org, index) => (
                        <div key={index} className="organization-item">
                          <span className="organization-name">{org.name}</span>
                          <span className="organization-count">{org.count} 条</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-data">暂无组织统计数据</div>
                  )}
                </Card>
              </Col>
            </Row>

            {/* 时间范围信息 */}
            {filters.date_range && (
              <Card style={{ marginTop: 24 }} className="date-info-card">
                <div className="date-info">
                  <span>统计时间范围：</span>
                  <span className="date-range">
                    {filters.date_range[0].format('YYYY年MM月DD日')} 至 {filters.date_range[1].format('YYYY年MM月DD日')}
                  </span>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card className="no-data-card">
            <div className="no-data">
              <FileTextOutlined style={{ fontSize: 48, color: '#ccc' }} />
              <p>暂无统计数据</p>
            </div>
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default Statistics;
