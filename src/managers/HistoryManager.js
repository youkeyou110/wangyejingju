class HistoryManager {
    constructor(options = {}) {
        this.maxHistory = options.maxHistory || 50;
        this.compressionThreshold = options.compressionThreshold || 1024 * 1024; // 1MB
        this.history = [];
        this.currentIndex = -1;
        this.isRecording = true;
        this.changeHandlers = new Set();
    }

    // 记录状态
    record(state) {
        if (!this.isRecording) return;

        // 压缩状态
        const compressedState = this.compressState(state);

        // 删除当前位置之后的历史
        this.history = this.history.slice(0, this.currentIndex + 1);

        // 添加新状态
        this.history.push({
            state: compressedState,
            timestamp: Date.now(),
            type: this.getStateType(state)
        });

        // 限制历史数量
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }

        // 触发变更事件
        this.notifyChange();

        // 自动保存
        this.autoSave();
    }

    // 撤销
    undo() {
        if (!this.canUndo()) return null;

        this.currentIndex--;
        const entry = this.history[this.currentIndex];

        // 触发变更事件
        this.notifyChange();

        return this.decompressState(entry.state);
    }

    // 重做
    redo() {
        if (!this.canRedo()) return null;

        this.currentIndex++;
        const entry = this.history[this.currentIndex];

        // 触发变更事件
        this.notifyChange();

        return this.decompressState(entry.state);
    }

    // 跳转到指定历史
    goto(index) {
        if (index < 0 || index >= this.history.length) return null;

        this.currentIndex = index;
        const entry = this.history[index];

        // 触发变更事件
        this.notifyChange();

        return this.decompressState(entry.state);
    }

    // 清空历史
    clear() {
        this.history = [];
        this.currentIndex = -1;

        // 触发变更事件
        this.notifyChange();
    }

    // 获取历史列表
    getHistory() {
        return this.history.map((entry, index) => ({
            ...entry,
            current: index === this.currentIndex,
            canUndo: index > 0,
            canRedo: index < this.history.length - 1
        }));
    }

    // 检查是否可以撤销
    canUndo() {
        return this.currentIndex > 0;
    }

    // 检查是否可以重做
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    // 压缩状态
    compressState(state) {
        const stateString = JSON.stringify(state);

        if (stateString.length < this.compressionThreshold) {
            return stateString;
        }

        // 这里可以添加更复杂的压缩算法
        return stateString;
    }

    // 解压状态
    decompressState(compressedState) {
        // 这里可以添加解压算法
        return JSON.parse(compressedState);
    }

    // 获取状态类型
    getStateType(state) {
        // 根据状态变化类型返回对应的描述
        if (state.content !== this.getCurrentState()?.content) {
            return '文本更新';
        }
        if (state.style !== this.getCurrentState()?.style) {
            return '样式更新';
        }
        return '状态更新';
    }

    // 获取当前状态
    getCurrentState() {
        if (this.currentIndex === -1) return null;
        const entry = this.history[this.currentIndex];
        return this.decompressState(entry.state);
    }

    // 自动保存
    autoSave() {
        try {
            const data = {
                history: this.history,
                currentIndex: this.currentIndex
            };
            localStorage.setItem('history', JSON.stringify(data));
        } catch (error) {
            console.error('History auto save failed:', error);
        }
    }

    // 恢复历史
    restore() {
        try {
            const data = JSON.parse(localStorage.getItem('history'));
            if (data) {
                this.history = data.history;
                this.currentIndex = data.currentIndex;
                this.notifyChange();
            }
        } catch (error) {
            console.error('History restore failed:', error);
        }
    }

    // 注册变更事件
    onChange(handler) {
        this.changeHandlers.add(handler);
        return () => this.changeHandlers.delete(handler);
    }

    // 触发变更事件
    notifyChange() {
        const state = {
            history: this.getHistory(),
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            currentState: this.getCurrentState()
        };

        this.changeHandlers.forEach(handler => handler(state));
    }

    // 开始记录
    startRecording() {
        this.isRecording = true;
    }

    // 停止记录
    stopRecording() {
        this.isRecording = false;
    }
}

export default new HistoryManager();
