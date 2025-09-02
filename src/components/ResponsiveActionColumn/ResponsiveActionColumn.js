import React from 'react';
import { Space, Grid } from 'antd';
import './ResponsiveActionColumn.css';

const { useBreakpoint } = Grid;

/**
 * 响应式操作列组件
 * 在桌面端水平排列按钮，在移动端当按钮超过一个时垂直排列按钮
 */
const ResponsiveActionColumn = ({ children, size = "small", className = "" }) => {
  const screens = useBreakpoint();
  const isMobile = screens.xs || (screens.sm && !screens.md);

  // 检查子元素数量，如果只有一个按钮，移动端也保持水平排列
  const childrenArray = React.Children.toArray(children);
  const hasMultipleButtons = childrenArray.length > 1;

  // 移动端：多个按钮时垂直排列，单个按钮时水平排列
  // 桌面端：始终水平排列
  const direction = isMobile && hasMultipleButtons ? "vertical" : "horizontal";

  return (
    <Space
      size={size}
      direction={direction}
      className={`responsive-action-column ${className} ${isMobile ? 'mobile' : 'desktop'}`}
    >
      {children}
    </Space>
  );
};

export default ResponsiveActionColumn;
