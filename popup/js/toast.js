class Toast {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  show(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    this.container.appendChild(toast);

    // 动画效果
    setTimeout(() => toast.classList.add('show'), 10);

    // 自动消失
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  error(message) {
    this.show(message, 'error');
  }

  success(message) {
    this.show(message, 'success');
  }

  info(message) {
    this.show(message, 'info');
  }
} 