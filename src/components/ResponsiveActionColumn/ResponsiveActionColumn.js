import React from 'react';
import { Space, Grid } from 'antd';
import './ResponsiveActionColumn.css';

const { useBreakpoint } = Grid;

/**
 * 响应式操作列组件
 * 在桌面端水平排列按钮，在移动端垂直排列按钮
 */
const ResponsiveActionColumn = ({ children, size = "small", className = "" }) => {
  const screens = useBreakpoint();
  const isMobile = screens.xs || (screens.sm && !screens.md);

  return (
    <Space 
      size={size} 
      direction={isMobile ? "vertical" : "horizontal"}
      className={`responsive-action-column ${className} ${isMobile ? 'mobile' : 'desktop'}`}
    >
      {children}
    </Space>
  );
};

export default ResponsiveActionColumn;
