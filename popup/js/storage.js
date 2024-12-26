class StorageManager {
  constructor() {
    this.storage = chrome.storage.local;
  }

  async get(key) {
    return new Promise((resolve) => {
      this.storage.get(key, (result) => {
        resolve(result[key]);
      });
    });
  }

  async set(key, value) {
    return new Promise((resolve) => {
      this.storage.set({ [key]: value }, resolve);
    });
  }

  async remove(key) {
    return new Promise((resolve) => {
      this.storage.remove(key, resolve);
    });
  }

  async clear() {
    return new Promise((resolve) => {
      this.storage.clear(resolve);
    });
  }
}
