import { enableGPUAcceleration } from '../utils/animationUtils';

class DragManager {
    constructor() {
        this.draggingElement = null;
        this.initialPosition = { x: 0, y: 0 };
        this.offset = { x: 0, y: 0 };
        this.dropTargets = new Map();
        this.dragStartHandlers = new Set();
        this.dragEndHandlers = new Set();
    }

    // 初始化拖拽
    init(element, options = {}) {
        const {
            handle = element,
            bounds = null,
            grid = null,
            onStart,
            onDrag,
            onEnd
        } = options;

        // 启用GPU加速
        enableGPUAcceleration(element);

        // 设置样式
        element.style.userSelect = 'none';
        element.style.touchAction = 'none';
        element.style.position = 'relative';

        // 绑定事件
        handle.addEventListener('mousedown', this.handleDragStart);
        handle.addEventListener('touchstart', this.handleDragStart, { passive: false });

        // 保存配置
        element.dragConfig = {
            bounds,
            grid,
            onStart,
            onDrag,
            onEnd
        };

        return () => this.destroy(element, handle);
    }

    // 处理拖拽开始
    handleDragStart = (e) => {
        e.preventDefault();
        const element = e.currentTarget.closest('[draggable]');
        if (!element) return;

        this.draggingElement = element;
        const rect = element.getBoundingClientRect();

        // 记录初始位置
        this.initialPosition = {
            x: rect.left,
            y: rect.top
        };

        // 计算偏移
        const point = this.getPoint(e);
        this.offset = {
            x: point.x - rect.left,
            y: point.y - rect.top
        };

        // 添加事件监听
        document.addEventListener('mousemove', this.handleDrag);
        document.addEventListener('touchmove', this.handleDrag, { passive: false });
        document.addEventListener('mouseup', this.handleDragEnd);
        document.addEventListener('touchend', this.handleDragEnd);

        // 触发开始回调
        const { onStart } = element.dragConfig;
        if (onStart) {
            onStart(element, this.initialPosition);
        }
        this.dragStartHandlers.forEach(handler => handler(element));
    };

    // 处理拖拽中
    handleDrag = (e) => {
        e.preventDefault();
        if (!this.draggingElement) return;

        const point = this.getPoint(e);
        const { bounds, grid, onDrag } = this.draggingElement.dragConfig;

        // 计算新位置
        let position = {
            x: point.x - this.offset.x,
            y: point.y - this.offset.y
        };

        // 应用网格对齐
        if (grid) {
            position = {
                x: Math.round(position.x / grid[0]) * grid[0],
                y: Math.round(position.y / grid[1]) * grid[1]
            };
        }

        // 应用边界限制
        if (bounds) {
            const rect = this.draggingElement.getBoundingClientRect();
            position.x = Math.max(bounds.left, Math.min(bounds.right - rect.width, position.x));
            position.y = Math.max(bounds.top, Math.min(bounds.bottom - rect.height, position.y));
        }

        // 更新位置
        this.draggingElement.style.transform = `translate(${position.x}px, ${position.y}px)`;

        // 检查放置目标
        this.checkDropTargets(point);

        // 触发拖拽回调
        if (onDrag) {
            onDrag(this.draggingElement, position);
        }
    };

    // 处理拖拽结束
    handleDragEnd = (e) => {
        if (!this.draggingElement) return;

        const point = this.getPoint(e);
        const { onEnd } = this.draggingElement.dragConfig;

        // 查找放置目标
        const dropTarget = this.findDropTarget(point);
        if (dropTarget) {
            dropTarget.onDrop?.(this.draggingElement);
        }

        // 触发结束回调
        if (onEnd) {
            onEnd(this.draggingElement, dropTarget);
        }
        this.dragEndHandlers.forEach(handler => handler(this.draggingElement, dropTarget));

        // 清理
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('touchmove', this.handleDrag);
        document.removeEventListener('mouseup', this.handleDragEnd);
        document.removeEventListener('touchend', this.handleDragEnd);

        this.draggingElement = null;
    };

    // 注册放置目标
    registerDropTarget(element, options = {}) {
        const { accept, onDrop, onDragEnter, onDragLeave } = options;
        this.dropTargets.set(element, { accept, onDrop, onDragEnter, onDragLeave });
        return () => this.dropTargets.delete(element);
    }

    // 检查放置目标
    checkDropTargets(point) {
        this.dropTargets.forEach((config, element) => {
            const rect = element.getBoundingClientRect();
            const isOver = this.isPointInRect(point, rect);

            if (isOver && !element.dragOver) {
                element.dragOver = true;
                element.classList.add('drag-over');
                config.onDragEnter?.(this.draggingElement);
            } else if (!isOver && element.dragOver) {
                element.dragOver = false;
                element.classList.remove('drag-over');
                config.onDragLeave?.(this.draggingElement);
            }
        });
    }

    // 查找放置目标
    findDropTarget(point) {
        for (const [element, config] of this.dropTargets) {
            const rect = element.getBoundingClientRect();
            if (this.isPointInRect(point, rect)) {
                if (!config.accept || config.accept(this.draggingElement)) {
                    return element;
                }
            }
        }
        return null;
    }

    // 工具方法
    getPoint(e) {
        return {
            x: e.touches ? e.touches[0].clientX : e.clientX,
            y: e.touches ? e.touches[0].clientY : e.clientY
        };
    }

    isPointInRect(point, rect) {
        return point.x >= rect.left && point.x <= rect.right &&
               point.y >= rect.top && point.y <= rect.bottom;
    }

    // 销毁
    destroy(element, handle) {
        handle.removeEventListener('mousedown', this.handleDragStart);
        handle.removeEventListener('touchstart', this.handleDragStart);
        delete element.dragConfig;
    }

    // 添加事件监听
    onDragStart(handler) {
        this.dragStartHandlers.add(handler);
        return () => this.dragStartHandlers.delete(handler);
    }

    onDragEnd(handler) {
        this.dragEndHandlers.add(handler);
        return () => this.dragEndHandlers.delete(handler);
    }
}

export default new DragManager();
