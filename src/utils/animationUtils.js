// 动画帧管理器
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.frameId = null;
    }

    // 添加动画
    add(key, callback) {
        this.animations.set(key, {
            callback,
            lastTimestamp: 0
        });
        this.start();
    }

    // 移除动画
    remove(key) {
        this.animations.delete(key);
        if (this.animations.size === 0) {
            this.stop();
        }
    }

    // 启动动画循环
    start() {
        if (!this.frameId) {
            this.loop();
        }
    }

    // 停止动画循环
    stop() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    // 动画循环
    loop = (timestamp) => {
        this.animations.forEach((animation, key) => {
            const { callback, lastTimestamp } = animation;
            const deltaTime = lastTimestamp ? timestamp - lastTimestamp : 0;

            if (deltaTime >= 16) { // 限制60fps
                callback(deltaTime);
                animation.lastTimestamp = timestamp;
            }
        });

        this.frameId = requestAnimationFrame(this.loop);
    };
}

// 创建CSS动画
export const createKeyframeAnimation = (name, keyframes) => {
    const style = document.createElement('style');
    const rules = Object.entries(keyframes)
        .map(([key, value]) => {
            const props = Object.entries(value)
                .map(([prop, val]) => `${prop}: ${val};`)
                .join(' ');
            return `${key} { ${props} }`;
        })
        .join(' ');

    style.textContent = `@keyframes ${name} { ${rules} }`;
    document.head.appendChild(style);

    return {
        name,
        duration: keyframes.duration || '300ms',
        timingFunction: keyframes.timingFunction || 'ease',
        remove: () => style.remove()
    };
};

// GPU加速工具
export const enableGPUAcceleration = (element) => {
    const styles = {
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: 1000,
        willChange: 'transform'
    };

    Object.assign(element.style, styles);
};

// 动画节流
export const throttleAnimation = (callback, fps = 60) => {
    const interval = 1000 / fps;
    let lastTime = 0;

    return (timestamp) => {
        if (timestamp - lastTime >= interval) {
            callback(timestamp);
            lastTime = timestamp;
        }
    };
};

// 导出动画管理器实例
export const animationManager = new AnimationManager();
