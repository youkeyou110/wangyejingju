class HistoryManager {
    constructor(maxHistory = 50) {
        this.maxHistory = maxHistory;
        this.history = [];
        this.currentIndex = -1;
    }

    // 添加新状态
    push(state) {
        // 如果当前不在最新状态，删除后面的历史
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // 添加新状态
        this.history.push(JSON.parse(JSON.stringify(state)));

        // 限制历史记录数量
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
    }

    // 撤销
    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
        }
        return null;
    }

    // 重做
    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
        }
        return null;
    }

    // 是否可���撤销
    canUndo() {
        return this.currentIndex > 0;
    }

    // 是否可以重做
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    // 清空历史
    clear() {
        this.history = [];
        this.currentIndex = -1;
    }
}

export default HistoryManager;
