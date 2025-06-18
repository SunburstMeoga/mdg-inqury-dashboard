import React from 'react';
import { Card, Typography, Space } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import './PreSurgery.css';

const { Title, Text } = Typography;

const PreSurgery = () => {
  return (
    <div className="pre-surgery-page">
      <Card className="development-card">
        <div className="development-content">
          <Space direction="vertical" size="large" align="center">
            <ToolOutlined className="development-icon" />
            <Title level={2} className="development-title">
              术前分析
            </Title>
            <Title level={4} className="development-subtitle">
              正在开发
            </Title>
            <Text type="secondary" className="development-description">
              术前分析功能正在紧张开发中，敬请期待...
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default PreSurgery;
