class ErrorHandler {
  constructor(i18n) {
    this.i18n = i18n;
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  handleError(error, source, context = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      source,
      message: error.message,
      stack: error.stack,
      context,
    };

    // 记录错误
    this.logError(errorInfo);

    // 上报错误
    this.reportError(errorInfo);

    // 显示错误消息
    this.showErrorMessage(error, source);

    // 记录到控制台
    console.error('[ErrorHandler]', errorInfo);
  }

  logError(errorInfo) {
    this.errorLog.unshift(errorInfo);

    // 限制日志大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop();
    }

    // 保存到本地存储
    try {
      chrome.storage.local.set({
        errorLog: this.errorLog
      });
    } catch (error) {
      console.error('Failed to save error log:', error);
    }
  }

  async reportError(errorInfo) {
    try {
      const response = await fetch('https://api.example.com/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorInfo)
      });

      if (!response.ok) {
        throw new Error('Failed to report error');
      }
    } catch (error) {
      console.error('Failed to report error:', error);
    }
  }

  showErrorMessage(error, source) {
    let message = error.message;

    // 使用国际化消息
    if (error.code && this.i18n.getMessage(`error_${error.code}`)) {
      message = this.i18n.getMessage(`error_${error.code}`);
    } else if (this.i18n.getMessage(`error_${source}`)) {
      message = this.i18n.getMessage(`error_${source}`);
    }

    // 显示错误通知
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon-48.png',
      title: this.i18n.getMessage('error_title'),
      message: message
    });
  }

  async getErrorLog() {
    try {
      const data = await chrome.storage.local.get('errorLog');
      return data.errorLog || [];
    } catch (error) {
      console.error('Failed to get error log:', error);
      return [];
    }
  }

  clearErrorLog() {
    this.errorLog = [];
    try {
      chrome.storage.local.remove('errorLog');
    } catch (error) {
      console.error('Failed to clear error log:', error);
    }
  }

  // 自定义错误类型
  static get ErrorTypes() {
    return {
      NETWORK: 'network',
      VALIDATION: 'validation',
      PERMISSION: 'permission',
      STORAGE: 'storage',
      UNKNOWN: 'unknown'
    };
  }

  // 创建自定义错误
  createError(type, message, code = null) {
    const error = new Error(message);
    error.type = type;
    error.code = code;
    return error;
  }
}

export default ErrorHandler;
