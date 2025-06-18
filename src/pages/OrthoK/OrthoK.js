import React from 'react';
import { Card, Typography, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import './OrthoK.css';

const { Title, Text } = Typography;

const OrthoK = () => {
  return (
    <div className="orthok-page">
      <Card className="development-card">
        <div className="development-content">
          <Space direction="vertical" size="large" align="center">
            <EyeOutlined className="development-icon" />
            <Title level={2} className="development-title">
              塑形镜分析
            </Title>
            <Title level={4} className="development-subtitle">
              正在开发
            </Title>
            <Text type="secondary" className="development-description">
              塑形镜分析功能正在紧张开发中，敬请期待...
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default OrthoK;
