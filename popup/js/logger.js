class Logger {
  constructor(level = 'info') {
    this.level = level;
    this.levels = ['debug', 'info', 'warn', 'error'];
  }

  log(level, message, data = {}) {
    if (this.levels.indexOf(level) >= this.levels.indexOf(this.level)) {
      const logData = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...data
      };

      console[level](logData);
      this.saveLog(logData);
    }
  }

  async saveLog(logData) {
    const storage = new StorageManager();
    const logs = await storage.get('logs') || [];
    logs.push(logData);

    // 保留最近1000条日志
    if (logs.length > 1000) {
      logs.shift();
    }

    await storage.set('logs', logs);
  }
}
