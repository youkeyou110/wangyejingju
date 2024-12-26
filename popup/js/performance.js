class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.thresholds = {
      loadTime: 2000,
      renderTime: 100,
      responseTime: 500
    };
  }

  startMeasure(name) {
    this.metrics.set(name, performance.now());
  }

  endMeasure(name) {
    const startTime = this.metrics.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.delete(name);
      this.reportMetric(name, duration);
      return duration;
    }
    return null;
  }

  observeElement(element, options = {}) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.reportMetric(entry.name, entry.duration);
        this.checkThreshold(entry.name, entry.duration);
      });
    });

    observer.observe({
      entryTypes: ['element', 'paint', 'largest-contentful-paint', 'layout-shift']
    });

    this.observers.set(element, observer);
  }

  reportMetric(name, value) {
    const metric = {
      name,
      value,
      timestamp: new Date().toISOString()
    };

    console.log(`Performance metric - ${name}: ${value}ms`);
    this.saveMetric(metric);
  }

  async saveMetric(metric) {
    const storage = new StorageManager();
    const metrics = await storage.get('performance_metrics') || [];
    metrics.push(metric);

    // 保留最近1000条记录
    if (metrics.length > 1000) {
      metrics.shift();
    }

    await storage.set('performance_metrics', metrics);
  }

  checkThreshold(name, value) {
    const threshold = this.thresholds[name];
    if (threshold && value > threshold) {
      console.warn(`Performance warning: ${name} (${value}ms) exceeded threshold (${threshold}ms)`);
      // 可以添加报警逻辑
    }
  }

  // 获取性能统计
  async getStats() {
    const storage = new StorageManager();
    const metrics = await storage.get('performance_metrics') || [];

    return {
      average: this.calculateAverage(metrics),
      percentiles: this.calculatePercentiles(metrics),
      total: metrics.length
    };
  }

  calculateAverage(metrics) {
    const groups = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {});

    return Object.entries(groups).reduce((acc, [name, values]) => {
      acc[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
      return acc;
    }, {});
  }

  calculatePercentiles(metrics) {
    const groups = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {});

    return Object.entries(groups).reduce((acc, [name, values]) => {
      values.sort((a, b) => a - b);
      acc[name] = {
        p50: values[Math.floor(values.length * 0.5)],
        p90: values[Math.floor(values.length * 0.9)],
        p95: values[Math.floor(values.length * 0.95)],
        p99: values[Math.floor(values.length * 0.99)]
      };
      return acc;
    }, {});
  }
}
