class ErrorHandler {
  constructor(i18n, toast) {
    this.i18n = i18n;
    this.toast = toast;
  }

  // 处理通用错误
  handleError(error, context = '') {
    console.error(`[${context}]`, error);

    // 记录错误日志
    Utils.log(error.message, 'error');

    // 根据错误类型返回适当的消息
    let message;
    if (error instanceof TypeError) {
      message = this.i18n.getMessage('messages_error_type');
    } else if (error instanceof ReferenceError) {
      message = this.i18n.getMessage('messages_error_reference');
    } else if (error.name === 'QuotaExceededError') {
      message = this.i18n.getMessage('messages_error_storage');
    } else if (error.name === 'NetworkError') {
      message = this.i18n.getMessage('messages_error_network');
    } else if (error.name === 'SecurityError') {
      message = this.i18n.getMessage('messages_error_security');
    } else {
      message = this.i18n.getMessage('messages_error_general');
    }

    // 显示错误提示
    if (this.toast) {
      this.toast.error(message);
    } else {
      alert(message);
    }

    return message;
  }

  // 处理异步操作错误
  async handleAsyncError(promise, context = '') {
    try {
      return await promise;
    } catch (error) {
      this.handleError(error, context);
      throw error; // 继续抛出错误以便上层处理
    }
  }

  // 包装事件处理器
  wrapEventHandler(handler, context = '') {
    return async (...args) => {
      try {
        await handler(...args);
      } catch (error) {
        this.handleError(error, context);
      }
    };
  }

  // 验证输入
  validateInput(value, rules = {}, context = '') {
    const errors = [];

    if (rules.required && !value) {
      errors.push(this.i18n.getMessage('messages_error_required'));
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors.push(this.i18n.getMessage('messages_error_tooShort'));
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(this.i18n.getMessage('messages_error_tooLong'));
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(this.i18n.getMessage('messages_error_invalidFormat'));
    }

    if (errors.length > 0) {
      const error = new Error(errors.join('\n'));
      this.handleError(error, context);
      return false;
    }

    return true;
  }

  showError(type, details = '') {
    let message = '';
    switch (type) {
      case 'export':
        message = chrome.i18n.getMessage('messages_error_export');
        break;
      case 'saveTemplate':
        message = chrome.i18n.getMessage('messages_error_saveTemplate');
        break;
      case 'compatibility':
        message = chrome.i18n.getMessage('messages_error_compatibility', [details]);
        break;
      case 'storage':
        message = chrome.i18n.getMessage('messages_error_storage');
        break;
      default:
        message = chrome.i18n.getMessage('messages_error_general');
    }
    // ... 显示错误消息
  }
}
