// 工具函数集合
class Utils {
  // 防抖函数
  static debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 节流函数
  static throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  // 错误处理工具
  static handleError(error, context = '') {
    console.error(`[${context}]`, error);
    
    // 错误类型判断
    if (error instanceof TypeError) {
      return `操作错误: ${error.message}`;
    } else if (error instanceof ReferenceError) {
      return '程序错误，请刷新重试';
    } else if (error.name === 'QuotaExceededError') {
      return '存储空间不足，请清理后重试';
    } else {
      return '发生错误，请重试';
    }
  }

  // ��志工具
  static log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const log = {
      timestamp,
      type,
      message
    };

    // 存储日志
    chrome.storage.local.get('logs', ({ logs = [] }) => {
      logs.push(log);
      // 只保留最近100条日志
      if (logs.length > 100) {
        logs = logs.slice(-100);
      }
      chrome.storage.local.set({ logs });
    });

    // 开发环境下打印日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  // 检查浏览器兼容性
  static checkCompatibility() {
    const issues = [];

    // 检查必要的API
    if (!window.chrome?.storage) {
      issues.push('Chrome Storage API 不可用');
    }
    if (!window.chrome?.runtime) {
      issues.push('Chrome Runtime API 不可用');
    }
    if (!window.HTMLCanvasElement) {
      issues.push('Canvas API 不可用');
    }

    return {
      compatible: issues.length === 0,
      issues
    };
  }
} 