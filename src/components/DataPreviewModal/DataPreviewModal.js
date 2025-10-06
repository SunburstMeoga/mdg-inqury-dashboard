import React from 'react';
import { Modal, Typography, Descriptions, Tag, Divider, Empty, Spin } from 'antd';
import './DataPreviewModal.css';

const { Title, Text } = Typography;

// 字段名映射表，将英文字段名映射为中文名称
const fieldNameMap = {
  // 基本信息字段
  visit_id: '就诊ID',
  patient_id: '患者ID',
  outpatient_number: '就诊号',
  id_card_number: '身份证号',
  org_id: '机构ID',
  organization_name: '机构名称',
  
  // 记录相关字段
  records: '检查记录',
  pacs_id: 'PACS记录ID',
  hospital_code: '医院代码',
  examination_type: '检查类型',
  image_url: '图像URL',
  exam_date: '检查日期',
  report_status: '报告状态',
  report_status_text: '报告状态文本',
  report: '报告内容',
  
  // 综合报告字段
  comprehensive_report: '综合报告',
  comprehensive_reports: '综合报告列表',
  id: 'ID',
  report_id: '报告ID',
  status: '状态',
  progress: '进度',
  pdf_url: 'PDF链接',
  download_url: '下载链接',
  generated_at: '生成时间',
  created_at: '创建时间',
  pacs_count: 'PACS记录数量',
  
  // 格式化数据字段
  formatted_data: '格式化数据',
  
  // 其他常见字段
  name: '名称',
  key: '键名',
  value: '值',
  unit: '单位',
  exam_data: '检查数据',
  ophthalmology_data: '眼科数据',
  
  // 眼科检查相关字段
  tear_film_break_time_right: '右眼泪膜破裂时间',
  tear_film_break_time_left: '左眼泪膜破裂时间',
  dry_eye_examination_right: '右眼干眼检查',
  dry_eye_examination_left: '左眼干眼检查',
  myopia_right: '右眼近视度数',
  myopia_left: '左眼近视度数',
  astigmatism_right: '右眼散光度数',
  astigmatism_left: '左眼散光度数',
  corrected_vision_right: '右眼矫正视力',
  corrected_vision_left: '左眼矫正视力',
  sphere_right: '右眼球镜度数',
  sphere_left: '左眼球镜度数',
  cylinder_right: '右眼柱镜度数',
  cylinder_left: '左眼柱镜度数',
  axis_right: '右眼轴位',
  axis_left: '左眼轴位',
  computer_myopia_right: '右眼电脑验光近视度数',
  computer_myopia_left: '左眼电脑验光近视度数',
  computer_astigmatism_right: '右眼电脑验光散光度数',
  computer_astigmatism_left: '左眼电脑验光散光度数',
  pd_left: '左眼瞳距',
  pd_right: '右眼瞳距',
  pupil_diameter_left: '左眼瞳孔直径',
  pupil_diameter_right: '右眼瞳孔直径',
  eye_pressure_avg_left: '左眼平均眼压',
  eye_pressure_avg_right: '右眼平均眼压',
  remark: '备注',
  exam_time: '检查时间'
};

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
                // 获取字段的中文名称，如果映射表中没有则使用原字段名
                const fieldLabel = fieldNameMap[key] || key;
                
                // 特殊处理 formatted_data 字段
                if (key === 'formatted_data' && Array.isArray(value)) {
                  return (
                    <Descriptions.Item key={key} label={fieldLabel}>
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
                  <Descriptions.Item key={key} label={fieldLabel}>
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