class LoadingManager {
  constructor(i18n) {
    this.overlay = document.getElementById('loadingOverlay');
    this.spinner = this.overlay.querySelector('.loading-spinner');
    this.i18n = i18n;
  }

  show(message) {
    this.spinner.dataset.text = message || this.i18n.getMessage('messages.loading.default');
    this.overlay.classList.add('fade-enter');
    this.overlay.style.display = 'flex';
    
    requestAnimationFrame(() => {
      this.overlay.classList.remove('fade-enter');
      this.overlay.classList.add('fade-enter-active');
    });
  }

  hide() {
    this.overlay.classList.remove('fade-enter-active');
    this.overlay.classList.add('fade-exit');
    
    requestAnimationFrame(() => {
      this.overlay.classList.remove('fade-exit');
      this.overlay.classList.add('fade-exit-active');
      
      setTimeout(() => {
        this.overlay.style.display = 'none';
        this.overlay.classList.remove('fade-exit-active');
      }, 300);
    });
  }

  // 包装异步操作
  async wrap(promise, message) {
    this.show(message);
    try {
      return await promise;
    } finally {
      this.hide();
    }
  }
} 