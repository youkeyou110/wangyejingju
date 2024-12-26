class PreviewManager {
  constructor() {
    this.container = document.getElementById('cardPreview');
    this.zoomLevel = 1;
    this.minZoom = 0.5;
    this.maxZoom = 2;
    this.zoomStep = 0.1;

    // 使用防抖处理缩放更新
    this.debouncedUpdateZoom = Utils.debounce((level) => {
      this.container.style.transform = `scale(${level})`;
      this.updateZoomLevel();
    }, 16); // 约60fps

    // 使用节流处理拖动
    this.throttledHandleDrag = Utils.throttle((x, y) => {
      this.container.style.transform = `translate(${x}px, ${y}px) scale(${this.zoomLevel})`;
    }, 16);

    this.init();
  }

  init() {
    try {
      this.bindZoomControls();
      this.initDragToScroll();
      Utils.log('预览管理器初始化成功');
    } catch (error) {
      const message = Utils.handleError(error, 'PreviewManager.init');
      Utils.log(message, 'error');
    }
  }

  bindZoomControls() {
    const zoomOut = document.getElementById('zoomOut');
    const zoomIn = document.getElementById('zoomIn');
    const resetZoom = document.getElementById('resetZoom');
    const zoomLevel = document.getElementById('zoomLevel');

    zoomOut.addEventListener('click', () => {
      this.zoom(this.zoomLevel - this.zoomStep);
    });

    zoomIn.addEventListener('click', () => {
      this.zoom(this.zoomLevel + this.zoomStep);
    });

    resetZoom.addEventListener('click', () => {
      this.zoom(1);
    });

    // 鼠标滚轮缩放
    this.container.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
        this.zoom(this.zoomLevel + delta);
      }
    });

    // 更新缩放显示
    this.updateZoomLevel = () => {
      zoomLevel.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    };
  }

  initDragToScroll() {
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;

    const preview = document.querySelector('.preview-section');

    preview.addEventListener('mousedown', (e) => {
      if (e.target === this.container) {
        isDragging = true;
        startX = e.pageX - preview.offsetLeft;
        startY = e.pageY - preview.offsetTop;
        scrollLeft = preview.scrollLeft;
        scrollTop = preview.scrollTop;
      }
    });

    preview.addEventListener('mouseleave', () => {
      isDragging = false;
    });

    preview.addEventListener('mouseup', () => {
      isDragging = false;
    });

    preview.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      e.preventDefault();
      const x = e.pageX - preview.offsetLeft;
      const y = e.pageY - preview.offsetTop;
      const walkX = (x - startX) * 2;
      const walkY = (y - startY) * 2;

      preview.scrollLeft = scrollLeft - walkX;
      preview.scrollTop = scrollTop - walkY;
    });
  }

  zoom(level) {
    try {
      this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, level));
      this.debouncedUpdateZoom(this.zoomLevel);
    } catch (error) {
      const message = Utils.handleError(error, 'PreviewManager.zoom');
      Utils.log(message, 'error');
    }
  }

  showLoading() {
    try {
      document.getElementById('loadingOverlay').style.display = 'flex';
    } catch (error) {
      Utils.handleError(error, 'PreviewManager.showLoading');
    }
  }

  hideLoading() {
    try {
      document.getElementById('loadingOverlay').style.display = 'none';
    } catch (error) {
      Utils.handleError(error, 'PreviewManager.hideLoading');
    }
  }
} 