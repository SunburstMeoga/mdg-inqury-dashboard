import axios from 'axios';

// API基础配置
const API_BASE_URL = 'https://app-api.maidige.com:7443/api/consultation-backend';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('doctor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理认证错误
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除token并跳转到登录页
      localStorage.removeItem('doctor_token');
      localStorage.removeItem('doctor_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API服务类
class ApiService {
  // ==================== 认证相关 ====================

  // 医生登录
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { access_token, userData } = response.data;

      // 存储token和用户信息
      localStorage.setItem('doctor_token', access_token);
      localStorage.setItem('doctor_user', JSON.stringify(userData));

      return {
        success: true,
        data: response.data,
        message: response.data?.message || '登录成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '登录失败，请重试'
      };
    }
  }

  // 医生登出
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      // 只有在API调用成功时才返回成功状态
      return {
        success: true,
        message: response.data?.message || '成功登出'
      };
    } catch (error) {
      // API调用失败时返回失败状态，不清除本地存储
      return {
        success: false,
        message: error.response?.data?.message || '登出失败'
      };
    }
  }

  // 获取当前医生信息
  async getDoctorInfo() {
    try {
      const response = await apiClient.get('/auth/info');
      return {
        success: true,
        data: response.data.userData,
        message: response.data?.message || '获取用户信息成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取用户信息失败'
      };
    }
  }

  // ==================== 密码管理 ====================

  // 修改密码
  async changePassword(passwordData) {
    try {
      const response = await apiClient.post('/password/change', passwordData);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '密码修改失败'
      };
    }
  }

  // 重置密码（管理员）
  async resetPassword(resetData) {
    try {
      const response = await apiClient.post('/password/reset', resetData);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '密码重置失败'
      };
    }
  }

  // 批量重置密码（管理员）
  async batchResetPassword(batchData) {
    try {
      const response = await apiClient.post('/password/batch-reset', batchData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '批量重置密码失败'
      };
    }
  }

  // ==================== 预问诊记录管理 ====================

  // 获取预问诊记录列表
  async getConsultationList(params = {}) {
    try {
      const response = await apiClient.get('/consultations', { params });
      return {
        success: true,
        data: response.data.consultations,
        total: response.data.total,
        currentPage: response.data.current_page,
        perPage: response.data.per_page,
        lastPage: response.data.last_page,
        message: response.data?.message || '获取咨询记录成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取预问诊记录失败'
      };
    }
  }

  // 获取预问诊记录详情
  async getConsultationDetail(id) {
    try {
      const response = await apiClient.get(`/consultations/${id}`);
      return {
        success: true,
        data: response.data.consulation
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取预问诊记录详情失败'
      };
    }
  }

  // 获取统计信息
  async getConsultationStatistics(params = {}) {
    try {
      const response = await apiClient.get('/consultations/statistics/summary', { params });
      return {
        success: true,
        data: response.data.statistics,
        queryParams: response.data.query_params
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取统计信息失败'
      };
    }
  }

  // 手动获取报告
  async fetchReport(id) {
    try {
      const response = await apiClient.post(`/consultations/${id}/fetch-report`);
      return {
        success: true,
        data: response.data.consulation,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取报告失败',
        error: error.response?.data?.error,
        fetchAttempts: error.response?.data?.fetch_attempts
      };
    }
  }

  // 强制重新获取报告
  async forceFetchReport(id) {
    try {
      const response = await apiClient.post(`/consultations/${id}/force-fetch-report`);
      return {
        success: true,
        data: response.data.consulation,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '强制获取报告失败',
        error: error.response?.data?.error,
        fetchAttempts: error.response?.data?.fetch_attempts,
        canRetry: error.response?.data?.can_retry
      };
    }
  }

  // 下载报告
  async downloadReport(consultation) {
    try {
      if (consultation.report_url) {
        // 创建下载链接
        const link = document.createElement('a');
        link.href = consultation.report_url;
        link.download = `咨询报告_${consultation.patient?.Name || consultation.patient_id}_${consultation.id}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return {
          success: true,
          message: '报告下载成功'
        };
      } else {
        return {
          success: false,
          message: '报告文件不存在'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '下载失败，请重试'
      };
    }
  }

  // ==================== 医生管理（管理员权限） ====================

  // 获取医生角色选项
  async getDoctorRoleOptions() {
    try {
      const response = await apiClient.get('/doctors/role-options');
      return {
        success: true,
        data: response.data.roles,
        message: response.data?.message || '获取角色选项成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取角色选项失败'
      };
    }
  }

  // 获取医生列表
  async getDoctorList(params = {}) {
    try {
      const response = await apiClient.get('/doctors', { params });
      return {
        success: true,
        data: response.data.doctors,
        total: response.data.total,
        message: response.data?.message || '获取医生列表成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取医生列表失败'
      };
    }
  }

  // 获取医生详情
  async getDoctorDetail(id) {
    try {
      const response = await apiClient.get(`/doctors/${id}`);
      return {
        success: true,
        data: response.data.doctor
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取医生详情失败'
      };
    }
  }

  // 创建医生
  async createDoctor(doctorData) {
    try {
      const response = await apiClient.post('/doctors', doctorData);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '创建医生失败',
        errors: error.response?.data?.errors
      };
    }
  }

  // 更新医生
  async updateDoctor(doctorData) {
    try {
      const response = await apiClient.post('/doctors', {
        ...doctorData,
        id: doctorData.id // 必须包含ID以区分更新操作
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新医生失败',
        errors: error.response?.data?.errors
      };
    }
  }

  // 删除医生
  async deleteDoctor(id) {
    try {
      const response = await apiClient.delete('/doctors', {
        data: { id }
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除医生失败'
      };
    }
  }

  // ==================== 咨询师管理（管理员权限） ====================

  // 获取咨询师列表
  async getCounselorList(params = {}) {
    try {
      const response = await apiClient.get('/counselors', { params });
      return {
        success: true,
        data: response.data.counselors,
        total: response.data.total
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取咨询师列表失败'
      };
    }
  }

  // 获取咨询师详情
  async getCounselorDetail(id) {
    try {
      const response = await apiClient.get(`/counselors/${id}`);
      return {
        success: true,
        data: response.data.counselor
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取咨询师详情失败'
      };
    }
  }

  // 创建咨询师
  async createCounselor(counselorData) {
    try {
      const response = await apiClient.post('/counselors', counselorData);
      return {
        success: true,
        data: response.data.counselor,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '创建咨询师失败',
        errors: error.response?.data?.errors
      };
    }
  }

  // 更新咨询师
  async updateCounselor(counselorData) {
    try {
      const response = await apiClient.put('/counselors', counselorData);
      return {
        success: true,
        data: response.data.counselor,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新咨询师失败',
        errors: error.response?.data?.errors
      };
    }
  }

  // 删除咨询师
  async deleteCounselor(id) {
    try {
      const response = await apiClient.delete('/counselors', {
        data: { id }
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '删除咨询师失败'
      };
    }
  }

  // ==================== 组织管理 ====================

  // 获取组织列表
  async getOrganizationList(params = {}) {
    try {
      const requestParams = {
        type: 2, // 固定传递type=2
        ...params
      };

      // 为组织API使用不同的baseURL
      const organizationApiClient = axios.create({
        baseURL: 'https://app-api.maidige.com:7443/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 添加认证token
      const token = localStorage.getItem('doctor_token');
      if (token) {
        organizationApiClient.defaults.headers.Authorization = `Bearer ${token}`;
      }

      const response = await organizationApiClient.get('/common/organization', { params: requestParams });
      return {
        success: true,
        data: response.data.items || response.data.organizations || response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取组织列表失败'
      };
    }
  }

  // ==================== 工具方法 ====================

  // 获取当前用户信息（从本地存储）
  getCurrentUser() {
    const userStr = localStorage.getItem('doctor_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 检查是否已登录
  isAuthenticated() {
    return !!localStorage.getItem('doctor_token');
  }

  // 检查是否为管理员
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.is_admin === true;
  }

  // 获取用户权限
  getUserAbilities() {
    const user = this.getCurrentUser();
    return user?.ability || [];
  }

  // 检查用户是否有特定权限
  hasPermission(action, subject) {
    const abilities = this.getUserAbilities();
    return abilities.some(ability =>
      (ability.action === action || ability.action === 'manage') &&
      ability.subject === subject
    );
  }
}

const apiService = new ApiService();
export default apiService;
