import { useState, useRef, useCallback } from 'react';
import { message } from 'antd';
import ApiService from '../services/api';
import { COMPREHENSIVE_REPORT_STATUS } from '../utils/constants';

/**
 * 报告状态轮询Hook
 * 用于管理综合报告生成过程中的状态轮询
 */
export const useReportPolling = () => {
  const [reportPolling, setReportPolling] = useState({});
  const pollingIntervals = useRef({});

  // 开始轮询报告状态
  const startPolling = useCallback((reportId, visitId, onComplete) => {
    // 清除之前的轮询
    if (pollingIntervals.current[visitId]) {
      clearInterval(pollingIntervals.current[visitId]);
    }

    setReportPolling(prev => ({ 
      ...prev, 
      [visitId]: { 
        reportId, 
        progress: 0,
        status: COMPREHENSIVE_REPORT_STATUS.PENDING
      } 
    }));

    pollingIntervals.current[visitId] = setInterval(async () => {
      try {
        const result = await ApiService.getReportStatus(reportId);
        if (result.success) {
          const { status, progress } = result.data;
          
          setReportPolling(prev => ({ 
            ...prev, 
            [visitId]: { 
              reportId, 
              progress: progress || 0,
              status: status
            } 
          }));

          // 检查是否完成
          if (status === COMPREHENSIVE_REPORT_STATUS.COMPLETED || 
              status === COMPREHENSIVE_REPORT_STATUS.FAILED) {
            // 停止轮询
            clearInterval(pollingIntervals.current[visitId]);
            delete pollingIntervals.current[visitId];
            
            // 从状态中移除
            setReportPolling(prev => {
              const newState = { ...prev };
              delete newState[visitId];
              return newState;
            });
            
            // 调用完成回调
            if (onComplete) {
              onComplete(status, result.data);
            }
            
            // 显示消息
            if (status === COMPREHENSIVE_REPORT_STATUS.COMPLETED) {
              message.success('综合报告生成完成');
            } else {
              message.error('综合报告生成失败');
            }
          }
        }
      } catch (error) {
        console.error('轮询报告状态失败:', error);
        // 如果轮询失败，可以选择停止轮询或继续尝试
        // 这里选择继续尝试，但可以添加重试次数限制
      }
    }, 3000); // 每3秒轮询一次
  }, []);

  // 停止特定的轮询
  const stopPolling = useCallback((visitId) => {
    if (pollingIntervals.current[visitId]) {
      clearInterval(pollingIntervals.current[visitId]);
      delete pollingIntervals.current[visitId];
    }
    
    setReportPolling(prev => {
      const newState = { ...prev };
      delete newState[visitId];
      return newState;
    });
  }, []);

  // 停止所有轮询
  const stopAllPolling = useCallback(() => {
    Object.values(pollingIntervals.current).forEach(interval => {
      if (interval) clearInterval(interval);
    });
    pollingIntervals.current = {};
    setReportPolling({});
  }, []);

  // 检查是否正在轮询
  const isPolling = useCallback((visitId) => {
    return !!reportPolling[visitId];
  }, [reportPolling]);

  // 获取轮询状态
  const getPollingStatus = useCallback((visitId) => {
    return reportPolling[visitId] || null;
  }, [reportPolling]);

  return {
    reportPolling,
    startPolling,
    stopPolling,
    stopAllPolling,
    isPolling,
    getPollingStatus
  };
};

export default useReportPolling;
