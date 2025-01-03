import { EventEmitter } from 'events';
import logManager from './LogManager';

class WorkerManager extends EventEmitter {
    constructor() {
        super();
        this.workers = new Map();
        this.tasks = new Map();
        this.config = {
            maxWorkers: navigator.hardwareConcurrency || 4,
            taskTimeout: 30000, // 30秒
            retryAttempts: 3
        };
        this.initialize();
    }

    // 初始化Worker池
    initialize() {
        try {
            for (let i = 0; i < this.config.maxWorkers; i++) {
                this.createWorker(`worker-${i}`);
            }
        } catch (error) {
            logManager.error('Failed to initialize workers:', error);
        }
    }

    // 创建Worker
    createWorker(id) {
        try {
            const worker = new Worker(new URL('../workers/worker.js', import.meta.url));

            worker.onmessage = (event) => this.handleWorkerMessage(id, event);
            worker.onerror = (error) => this.handleWorkerError(id, error);

            this.workers.set(id, {
                instance: worker,
                status: 'idle',
                taskCount: 0,
                lastActive: Date.now()
            });

            return worker;
        } catch (error) {
            logManager.error(`Failed to create worker ${id}:`, error);
            return null;
        }
    }

    // 执行任务
    async executeTask(taskType, data, options = {}) {
        try {
            const taskId = this.generateTaskId();
            const worker = await this.getAvailableWorker();

            if (!worker) {
                throw new Error('No available workers');
            }

            const task = {
                id: taskId,
                type: taskType,
                data,
                options,
                worker: worker.id,
                startTime: Date.now(),
                attempts: 0
            };

            this.tasks.set(taskId, task);

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    this.handleTaskTimeout(taskId);
                    reject(new Error('Task timeout'));
                }, options.timeout || this.config.taskTimeout);

                task.resolve = resolve;
                task.reject = reject;
                task.timeout = timeout;

                worker.instance.postMessage({
                    taskId,
                    type: taskType,
                    data
                });

                this.updateWorkerStatus(worker.id, 'busy');
            });
        } catch (error) {
            logManager.error('Failed to execute task:', error);
            throw error;
        }
    }

    // 处理Worker消息
    handleWorkerMessage(workerId, event) {
        const { taskId, result, error } = event.data;
        const task = this.tasks.get(taskId);

        if (!task) return;

        clearTimeout(task.timeout);

        if (error) {
            this.handleTaskError(task, error);
        } else {
            task.resolve(result);
            this.completeTask(taskId);
        }

        this.updateWorkerStatus(workerId, 'idle');
    }

    // 处理Worker错误
    handleWorkerError(workerId, error) {
        logManager.error(`Worker ${workerId} error:`, error);
        this.restartWorker(workerId);
    }

    // 处理任务超时
    handleTaskTimeout(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) return;

        if (task.attempts < this.config.retryAttempts) {
            task.attempts++;
            this.retryTask(task);
        } else {
            task.reject(new Error('Task failed after multiple attempts'));
            this.completeTask(taskId);
        }
    }

    // 重试任务
    async retryTask(task) {
        try {
            const worker = await this.getAvailableWorker();
            if (!worker) throw new Error('No available workers');

            task.worker = worker.id;
            task.startTime = Date.now();

            worker.instance.postMessage({
                taskId: task.id,
                type: task.type,
                data: task.data
            });

            this.updateWorkerStatus(worker.id, 'busy');
        } catch (error) {
            logManager.error('Failed to retry task:', error);
            task.reject(error);
            this.completeTask(task.id);
        }
    }

    // 完成任务
    completeTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) return;

        clearTimeout(task.timeout);
        this.tasks.delete(taskId);
        this.updateWorkerStatus(task.worker, 'idle');
    }

    // 获取可用Worker
    async getAvailableWorker() {
        const idleWorker = Array.from(this.workers.entries())
            .find(([, worker]) => worker.status === 'idle');

        if (idleWorker) {
            return {
                id: idleWorker[0],
                instance: idleWorker[1].instance
            };
        }

        // 如果没有空闲Worker，等待一个变为空闲
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const worker = Array.from(this.workers.entries())
                    .find(([, w]) => w.status === 'idle');

                if (worker) {
                    clearInterval(checkInterval);
                    resolve({
                        id: worker[0],
                        instance: worker[1].instance
                    });
                }
            }, 100);
        });
    }

    // 更新Worker状态
    updateWorkerStatus(workerId, status) {
        const worker = this.workers.get(workerId);
        if (!worker) return;

        worker.status = status;
        worker.lastActive = Date.now();
        if (status === 'busy') {
            worker.taskCount++;
        }

        this.emit('workerStatusChanged', {
            workerId,
            status,
            taskCount: worker.taskCount
        });
    }

    // 重启Worker
    restartWorker(workerId) {
        const worker = this.workers.get(workerId);
        if (!worker) return;

        worker.instance.terminate();
        this.createWorker(workerId);
    }

    // 生成任务ID
    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // 获取Worker统计信息
    getStats() {
        const stats = {
            totalWorkers: this.workers.size,
            activeWorkers: 0,
            completedTasks: 0,
            pendingTasks: this.tasks.size,
            averageTaskTime: 0
        };

        for (const worker of this.workers.values()) {
            if (worker.status === 'busy') {
                stats.activeWorkers++;
            }
            stats.completedTasks += worker.taskCount;
        }

        return stats;
    }

    // 清理资源
    dispose() {
        for (const worker of this.workers.values()) {
            worker.instance.terminate();
        }
        this.workers.clear();
        this.tasks.clear();
    }
}

export default new WorkerManager();
