import React, { useState, useEffect } from 'react';
import { Progress, Typography } from 'antd';
import './ProgressTimer.css';

const { Text } = Typography;

const ProgressTimer = ({ 
  duration = 600000, // 默认10分钟 (600秒 * 1000毫秒)
  onComplete,
  autoStart = true,
  size = 'small'
}) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1000; // 每秒减少1000毫秒
          const newProgress = ((duration - newTime) / duration) * 100;
          setProgress(Math.min(newProgress, 100));
          
          if (newTime <= 0) {
            setIsRunning(false);
            if (onComplete) {
              onComplete();
            }
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeLeft <= 0) {
      setProgress(100);
      setIsRunning(false);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft, duration, onComplete]);

  // 格式化剩余时间
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 获取进度条状态
  const getProgressStatus = () => {
    if (progress >= 100) return 'success';
    if (progress >= 80) return 'normal';
    return 'active';
  };

  return (
    <div className="progress-timer">
      <Progress
        percent={Math.round(progress)}
        size={size}
        status={getProgressStatus()}
        showInfo={false}
        strokeColor={{
          '0%': '#108ee9',
          '100%': '#87d068',
        }}
      />
      <div className="progress-info">
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {progress >= 100 ? '生成完成' : `剩余 ${formatTime(timeLeft)}`}
        </Text>
      </div>
    </div>
  );
};

export default ProgressTimer;
