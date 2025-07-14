import React, { useState } from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import './LoadingDemo.css';

const { Title, Text } = Typography;

const LoadingDemo = () => {
  const [showLoading, setShowLoading] = useState(false);

  const handleShowLoading = () => {
    setShowLoading(true);
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  return (
    <div className="loading-demo-page">
      <Card className="demo-card">
        <div className="demo-content">
          <Title level={3} style={{ color: '#004EA2', textAlign: 'center' }}>
            麦迪格眼科集团加载屏幕演示
          </Title>

          <div className="demo-description">
            <Text type="secondary">
              这是一个专为麦迪格眼科集团定制的科技感加载屏幕，包含以下特效：
            </Text>
            <ul className="feature-list">
              <li>渐变背景和网格动画</li>
              <li>浮动粒子效果</li>
              <li>眼科专业图标（眼球、瞳孔动画、眨眼效果）</li>
              <li>麦迪格品牌标识和进度条</li>
              <li>眼科专业图标动画（视力表、镜片、视网膜）</li>
              <li>数据流动效果</li>
              <li>响应式设计</li>
            </ul>
          </div>

          <div className="demo-actions">
            <Space size="large">
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleShowLoading}
                disabled={showLoading}
              >
                查看加载屏幕
              </Button>
              
              <Button
                type="default"
                size="large"
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              >
                刷新页面体验
              </Button>
            </Space>
          </div>

          <div className="demo-note">
            <Text type="secondary" style={{ fontSize: '12px' }}>
              注意：加载屏幕会自动在5秒后关闭，或者您可以刷新页面在应用启动时查看麦迪格眼科集团完整品牌展示效果。
            </Text>
          </div>
        </div>
      </Card>

      {showLoading && (
        <LoadingScreen onComplete={handleLoadingComplete} />
      )}
    </div>
  );
};

export default LoadingDemo;
