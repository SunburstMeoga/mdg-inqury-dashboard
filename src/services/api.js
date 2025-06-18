import { searchReports, getReportById } from './mockData';

// 模拟API延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API服务类
class ApiService {
  // 搜索预问诊报告
  async searchPreConsultationReports(searchTerm) {
    await delay(500); // 模拟网络延迟

    try {
      const reports = searchReports(searchTerm);
      return {
        success: true,
        data: reports,
        total: reports.length
      };
    } catch (error) {
      return {
        success: false,
        message: '搜索失败，请重试'
      };
    }
  }

  // 获取报告详情
  async getReportDetail(reportId) {
    await delay(300);

    try {
      const report = getReportById(reportId);
      if (report) {
        return {
          success: true,
          data: report
        };
      } else {
        return {
          success: false,
          message: '报告不存在'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '获取报告详情失败'
      };
    }
  }

  // 下载报告
  async downloadReport(reportId) {
    await delay(200);

    try {
      const report = getReportById(reportId);
      if (report) {
        // 模拟下载
        const link = document.createElement('a');
        link.href = report.reportUrl;
        link.download = `预问诊报告_${report.patientName}_${report.id}.pdf`;
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
          message: '报告不存在'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '下载失败，请重试'
      };
    }
  }
}

const apiService = new ApiService();
export default apiService;
