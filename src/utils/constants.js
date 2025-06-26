// 项目常量定义
export const THEME_COLOR = '#004EA2';
export const PROJECT_NAME = '麦迪格预问诊后台';
export const LOGO_URL = 'https://mdgemg.oss-cn-beijing.aliyuncs.com/uploads/2025/06/18/68528158e69ac.png';

// 用户角色
export const USER_ROLES = {
  DOCTOR: 'doctor'
};

// 菜单项
export const MENU_ITEMS = [
  {
    key: 'consultations',
    label: '预问诊记录',
    path: '/consultations',
    permission: { action: 'read', subject: 'Consultation' }
  },
  {
    key: 'statistics',
    label: '统计分析',
    path: '/statistics',
    permission: { action: 'read', subject: 'Consultation' }
  },
  {
    key: 'doctors',
    label: '账号管理',
    path: '/doctors',
    permission: { action: 'manage', subject: 'Doctor' },
    adminOnly: true
  },
  {
    key: 'password',
    label: '密码管理',
    path: '/password',
    permission: { action: 'read', subject: 'Auth' }
  }
];

// 预问诊记录状态
export const CONSULTATION_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed',
  GENERATED: 'generated'
};

// 预问诊记录状态中文名称
export const CONSULTATION_STATUS_NAMES = {
  [CONSULTATION_STATUS.COMPLETED]: '已完成',
  [CONSULTATION_STATUS.PENDING]: '待处理',
  [CONSULTATION_STATUS.FAILED]: '失败',
  [CONSULTATION_STATUS.GENERATED]: '已生成'
};

// 预问诊记录状态颜色
export const CONSULTATION_STATUS_COLORS = {
  [CONSULTATION_STATUS.COMPLETED]: 'success',
  [CONSULTATION_STATUS.PENDING]: 'warning',
  [CONSULTATION_STATUS.FAILED]: 'error',
  [CONSULTATION_STATUS.GENERATED]: 'success'
};

// 组织类型
export const ORGANIZATION_TYPES = {
  1: '诊所',
  2: '医院',
  3: '连锁机构'
};

// 分页配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: ['10', '15', '20', '50', '100'],
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true,
  SHOW_TOTAL: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
};

// 日期格式
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss'
};

// API配置
export const API_CONFIG = {
  BASE_URL: 'https://app-api.maidige.com:7443/api/consultation-backend',
  TIMEOUT: 30000
};
