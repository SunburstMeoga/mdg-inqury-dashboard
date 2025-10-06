import React from 'react';
import { Modal, Typography, Descriptions, Tag, Divider, Empty, Spin } from 'antd';
import './DataPreviewModal.css';

const { Title, Text } = Typography;

/**
 * 数据预览Modal组件
 * 用于显示ophthalmology_data数据的在线预览
 */
const DataPreviewModal = ({ visible, onClose, data, title, loading }) => {
  // 如果没有数据，显示空状态
  const renderContent = () => {
    if (loading) {
      return (
        <div className="preview-loading">
          <Spin size="large" />
          <Text style={{ marginTop: 16 }}>正在加载数据...</Text>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return <Empty description="暂无数据" />;
    }

    return (
      <div className="preview-content">
        {data.map((item, index) => (
          <div key={index} className="preview-item">
            <Divider orientation="left">数据项 {index + 1}</Divider>
            <Descriptions bordered column={1} size="small">
              {/* 处理所有普通字段 */}
              {Object.entries(item).map(([key, value]) => {
                // 特殊处理 formatted_data 字段
                if (key === 'formatted_data' && Array.isArray(value)) {
                  return (
                    <Descriptions.Item key={key} label="格式化数据">
                      <div className="formatted-data-list">
                        {value.map((formattedItem, fIndex) => (
                          <div key={fIndex} className="formatted-data-item">
                            <Text strong>{formattedItem.name}: </Text>
                            <Text>{formattedItem.value}</Text>
                            {formattedItem.unit && <Text type="secondary"> {formattedItem.unit}</Text>}
                          </div>
                        ))}
                      </div>
                    </Descriptions.Item>
                  );
                }
                // 处理其他普通字段
                return (
                  <Descriptions.Item key={key} label={key}>
                    {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                  </Descriptions.Item>
                );
              })}
            </Descriptions>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal
      title={title || "数据预览"}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      {renderContent()}
    </Modal>
  );
};

export default DataPreviewModal;