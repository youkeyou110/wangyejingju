class SecurityManager {
  constructor() {
    this.sanitizer = new DOMPurifier();
    this.validators = {
      text: /^[\w\u4e00-\u9fa5\s.,!?'"()-]+$/,  // 允许文字、标点
      color: /^#[0-9a-fA-F]{6}$/,               // 颜色代码
      number: /^\d+(\.\d+)?$/,                  // 数字
      url: /^https?:\/\/[\w\-]+(\.[\w\-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/ // URL
    };
  }

  sanitizeHTML(html) {
    return this.sanitizer.sanitize(html, {
      ALLOWED_TAGS: ['div', 'span', 'p', 'br'],
      ALLOWED_ATTR: ['class', 'style']
    });
  }

  validateInput(input, rules = {}) {
    const errors = [];

    // 必填检查
    if (rules.required && !input) {
      errors.push('此字段不能为空');
    }

    // 类型检查
    if (rules.type && this.validators[rules.type]) {
      if (!this.validators[rules.type].test(input)) {
        errors.push(`输入格式不正确: ${rules.type}`);
      }
    }

    // 长度检查
    if (rules.maxLength && input.length > rules.maxLength) {
      errors.push(`输入长度不能超过 ${rules.maxLength} 个字符`);
    }

    // 范围检查
    if (rules.type === 'number') {
      const num = parseFloat(input);
      if (rules.min !== undefined && num < rules.min) {
        errors.push(`数值不能小于 ${rules.min}`);
      }
      if (rules.max !== undefined && num > rules.max) {
        errors.push(`数值不能大于 ${rules.max}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async checkPermissions(permissions) {
    try {
      const result = await chrome.permissions.contains({
        permissions: Array.isArray(permissions) ? permissions : [permissions]
      });
      return result;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  // 添加 XSS 防护
  escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 添加 CSP 检查
  checkCSP() {
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!meta) {
      console.warn('No CSP meta tag found');
      return false;
    }
    return true;
  }
}
