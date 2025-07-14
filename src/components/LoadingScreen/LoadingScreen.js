import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import './LoadingScreen.css';

const { Title, Text } = Typography;

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState('系统初始化中...');

  useEffect(() => {
    const loadingTexts = [
      '麦迪格眼科系统初始化中...',
      '连接智慧眼科平台...',
      '加载眼科诊疗数据...',
      '准备视力分析引擎...',
      '麦迪格眼科系统启动完成'
    ];
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        
        // 根据进度更新文字
        if (newProgress >= 20 && newProgress < 40) {
          setCurrentText(loadingTexts[1]);
        } else if (newProgress >= 40 && newProgress < 60) {
          setCurrentText(loadingTexts[2]);
        } else if (newProgress >= 60 && newProgress < 80) {
          setCurrentText(loadingTexts[3]);
        } else if (newProgress >= 80) {
          setCurrentText(loadingTexts[4]);
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 500);
          return 100;
        }
        
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="loading-screen">
      {/* 背景动画 */}
      <div className="bg-animation">
        <div className="grid-lines"></div>
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i}`}></div>
          ))}
        </div>
      </div>

      {/* 主要内容 */}
      <div className="loading-content">
        {/* Logo区域 */}
        <div className="logo-section">
          <div className="logo-container">
            {/* 眼科专业图标 */}
            <div className="eye-icon">
              <div className="eye-outer">
                <div className="eye-inner">
                  <div className="pupil"></div>
                  <div className="iris-ring"></div>
                </div>
              </div>
              <div className="eyelash eyelash-top"></div>
              <div className="eyelash eyelash-bottom"></div>
            </div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring pulse-ring-delay"></div>
          </div>

          <div className="brand-section">
            <Title level={2} className="brand-title">
              麦迪格眼科集团
            </Title>
            <Text className="brand-subtitle">
              MAIDIGE OPHTHALMOLOGY GROUP
            </Text>
            <div className="system-info">
              <Text className="system-name">
                智慧眼科分析系统
              </Text>
            </div>
          </div>
        </div>

        {/* 进度区域 */}
        <div className="progress-section">
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
              <div className="progress-glow"></div>
            </div>
            <div className="progress-text">
              <Text className="loading-text">{currentText}</Text>
              <Text className="progress-percentage">{progress}%</Text>
            </div>
          </div>
        </div>

        {/* 眼科专业图标动画 */}
        <div className="medical-icons">
          <div className="icon-container">
            <div className="medical-icon vision-chart">
              <div className="chart-lines">
                <div className="chart-line line-1"></div>
                <div className="chart-line line-2"></div>
                <div className="chart-line line-3"></div>
                <div className="chart-line line-4"></div>
              </div>
            </div>
            <div className="medical-icon lens">
              <div className="lens-outer">
                <div className="lens-inner"></div>
                <div className="lens-reflection"></div>
              </div>
            </div>
            <div className="medical-icon retina">
              <div className="retina-center"></div>
              <div className="blood-vessel vessel-1"></div>
              <div className="blood-vessel vessel-2"></div>
              <div className="blood-vessel vessel-3"></div>
              <div className="blood-vessel vessel-4"></div>
            </div>
          </div>
        </div>

        {/* 数据流动效果 */}
        <div className="data-streams">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`data-stream stream-${i}`}>
              <div className="data-point"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 版权信息 */}
      <div className="footer-info">
        <Text type="secondary">
          © 2024 麦迪格眼科集团 - 专业眼科诊疗数据分析平台
        </Text>
      </div>
    </div>
  );
};

export default LoadingScreen;
