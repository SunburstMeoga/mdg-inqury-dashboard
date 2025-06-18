// 项目常量定义
export const THEME_COLOR = '#004EA2';
export const PROJECT_NAME = '麦迪格预问诊看板';
export const LOGO_URL = 'https://mdgemg.oss-cn-beijing.aliyuncs.com/uploads/2025/06/18/68528158e69ac.png';

// 用户角色
export const USER_ROLES = {
  DOCTOR: 'doctor',
  COUNSELOR: 'counselor', 
  ADMIN: 'admin'
};

// 用户角色中文名称
export const USER_ROLE_NAMES = {
  [USER_ROLES.DOCTOR]: '医生',
  [USER_ROLES.COUNSELOR]: '咨询师',
  [USER_ROLES.ADMIN]: '超级管理员'
};

// 菜单项
export const MENU_ITEMS = [
  {
    key: 'pre-consultation',
    label: '预问诊',
    path: '/pre-consultation'
  },
  {
    key: 'pre-surgery',
    label: '术前分析',
    path: '/pre-surgery'
  },
  {
    key: 'orthok',
    label: '塑形镜分析',
    path: '/orthok'
  }
];

// 院区列表
export const HOSPITAL_AREAS = [
  '北京总院',
  '上海分院',
  '广州分院',
  '深圳分院',
  '杭州分院',
  '成都分院',
  '武汉分院',
  '西安分院'
];
