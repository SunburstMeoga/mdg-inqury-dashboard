import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  message,
  Typography,
  Spin,
  Modal,
  Input
} from 'antd';
import { 
  ArrowLeftOutlined,
  CheckOutlined,
  EditOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ApiService from '../../services/api';
import './OrthoKReport.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const OrthoKReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // 'edit' 表示修改模式
  
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modifyModalVisible, setModifyModalVisible] = useState(false);
  const [modifyComment, setModifyComment] = useState('');

  // 加载报告数据
  useEffect(() => {
    loadReportData();
  }, [id]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const result = await ApiService.getOrthoKReportDetail(id);
      if (result.success) {
        setReportData(result.data);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('加载报告失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 返回列表
  const handleBack = () => {
    navigate('/orthok');
  };

  // 提交订单
  const handleConfirm = () => {
    Modal.confirm({
      title: '提交订单',
      icon: <ExclamationCircleOutlined />,
      content: '确认提交塑形镜订单？提交后状态将变为"已提交订单"。',
      okText: '提交订单',
      cancelText: '取消',
      onOk: async () => {
        setActionLoading(true);
        try {
          const result = await ApiService.confirmOrthoKReport(id);
          if (result.success) {
            message.success(result.message);
            // 返回列表页面
            navigate('/orthok');
          } else {
            message.error(result.message);
          }
        } catch (error) {
          message.error('提交失败，请重试');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  // 显示修改对话框
  const handleShowModifyModal = () => {
    setModifyModalVisible(true);
    setModifyComment('');
  };

  // 提交修改意见
  const handleSubmitModification = async () => {
    if (!modifyComment.trim()) {
      message.warning('请填写修改意见');
      return;
    }

    setActionLoading(true);
    try {
      const result = await ApiService.submitOrthoKModification(id, modifyComment);
      if (result.success) {
        message.success(result.message);
        setModifyModalVisible(false);
        // 返回列表页面
        navigate('/orthok');
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('提交失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 取消修改
  const handleCancelModify = () => {
    setModifyModalVisible(false);
    setModifyComment('');
  };

  if (loading) {
    return (
      <div className="report-loading">
        <Spin size="large" />
        <Text style={{ marginTop: 16, display: 'block', textAlign: 'center' }}>
          正在加载报告...
        </Text>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="report-error">
        <Text type="danger">报告加载失败</Text>
        <Button type="primary" onClick={handleBack} style={{ marginTop: 16 }}>
          返回列表
        </Button>
      </div>
    );
  }

  return (
    <div className="orthok-report-page">
      {/* 头部操作栏 */}
      <Card className="report-header-card">
        <div className="report-header">
          <div className="header-left">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              type="text"
            >
              返回列表
            </Button>
            <div className="report-info">
              <Title level={4} style={{ margin: 0 }}>
                塑形镜分析报告
              </Title>
              <Text type="secondary">
                患者：{reportData.patientName} | 就诊号：{reportData.visitNumber}
              </Text>
            </div>
          </div>
          
          <div className="header-actions">
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={actionLoading}
                onClick={handleConfirm}
              >
                提交订单
              </Button>
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={handleShowModifyModal}
              >
                修改
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      {/* 报告内容 */}
      <Card className="report-content-card">
        <div className="report-content">
          <div className="report-pdf-container">
            {reportData.reportUrl ? (
              <iframe
                src={reportData.reportUrl}
                title="塑形镜分析报告"
                className="pdf-viewer"
                style={{
                  width: '100%',
                  height: '800px',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
            ) : (
              <div className="pdf-placeholder">
                <Spin size="large" />
                <Text style={{ marginTop: 16, display: 'block' }}>
                  正在加载报告...
                </Text>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 修改意见对话框 */}
      <Modal
        title="填写修改意见"
        open={modifyModalVisible}
        onOk={handleSubmitModification}
        onCancel={handleCancelModify}
        okText="提交"
        cancelText="取消"
        confirmLoading={actionLoading}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            请详细描述需要修改的内容，提交后系统将重新生成报告。
          </Text>
        </div>
        <TextArea
          value={modifyComment}
          onChange={(e) => setModifyComment(e.target.value)}
          placeholder="请输入修改意见..."
          rows={6}
          maxLength={500}
          showCount
          style={{ marginBottom: 16 }}
        />
      </Modal>
    </div>
  );
};

export default OrthoKReport;
