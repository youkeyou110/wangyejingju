// 模拟 Chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  }
};

// 模拟 DOM API
global.HTMLCanvasElement.prototype.getContext = () => ({
  drawImage: jest.fn()
}); 