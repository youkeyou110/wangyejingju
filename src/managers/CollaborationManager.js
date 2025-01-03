import { EventEmitter } from 'events';
import logManager from './LogManager';
import { generateId } from '../utils/idUtils';

class CollaborationManager extends EventEmitter {
    constructor() {
        super();
        this.sessions = new Map();
        this.users = new Map();
        this.changes = new Map();
        this.comments = new Map();
        this.setupWebSocket();
    }

    // 设置WebSocket连接
    setupWebSocket() {
        this.ws = new WebSocket(process.env.WEBSOCKET_URL);

        this.ws.onopen = () => {
            this.emit('connected');
            logManager.info('Collaboration WebSocket connected');
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };

        this.ws.onclose = () => {
            this.emit('disconnected');
            logManager.warn('Collaboration WebSocket disconnected');
            // 尝试重连
            setTimeout(() => this.setupWebSocket(), 5000);
        };

        this.ws.onerror = (error) => {
            logManager.error('WebSocket error:', error);
        };
    }

    // 创建协作会话
    async createSession(data) {
        const sessionId = generateId();
        const session = {
            id: sessionId,
            owner: this.currentUser,
            members: new Set([this.currentUser]),
            data,
            createdAt: Date.now(),
            status: 'active'
        };

        this.sessions.set(sessionId, session);
        await this.sendMessage({
            type: 'session_created',
            session
        });

        return sessionId;
    }

    // 加入会话
    async joinSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }

        session.members.add(this.currentUser);
        await this.sendMessage({
            type: 'member_joined',
            sessionId,
            user: this.currentUser
        });

        return session;
    }

    // 发送更改
    async sendChange(sessionId, change) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }

        const changeId = generateId();
        const changeData = {
            id: changeId,
            sessionId,
            user: this.currentUser,
            change,
            timestamp: Date.now()
        };

        this.changes.set(changeId, changeData);
        await this.sendMessage({
            type: 'change',
            change: changeData
        });

        return changeId;
    }

    // 添加评论
    async addComment(sessionId, data) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }

        const commentId = generateId();
        const comment = {
            id: commentId,
            sessionId,
            user: this.currentUser,
            ...data,
            timestamp: Date.now(),
            replies: []
        };

        this.comments.set(commentId, comment);
        await this.sendMessage({
            type: 'comment_added',
            comment
        });

        return commentId;
    }

    // 处理消息
    async handleMessage(message) {
        const { type, data } = message;

        try {
            switch (type) {
                case 'session_created':
                    await this.handleSessionCreated(data);
                    break;
                case 'member_joined':
                    await this.handleMemberJoined(data);
                    break;
                case 'change':
                    await this.handleChange(data);
                    break;
                case 'comment_added':
                    await this.handleCommentAdded(data);
                    break;
                case 'error':
                    this.handleError(data);
                    break;
                default:
                    logManager.warn('Unknown message type:', type);
            }
        } catch (error) {
            logManager.error('Error handling message:', error);
        }
    }

    // 发送消息
    async sendMessage(message) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            throw new Error('WebSocket not connected');
        }
    }

    // 获取会话历史
    getSessionHistory(sessionId) {
        const changes = Array.from(this.changes.values())
            .filter(change => change.sessionId === sessionId)
            .sort((a, b) => a.timestamp - b.timestamp);

        return changes;
    }

    // 获取会话评论
    getSessionComments(sessionId) {
        const comments = Array.from(this.comments.values())
            .filter(comment => comment.sessionId === sessionId)
            .sort((a, b) => b.timestamp - a.timestamp);

        return comments;
    }

    // 获取在线用户
    getOnlineUsers(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return [];

        return Array.from(session.members)
            .map(userId => this.users.get(userId))
            .filter(Boolean);
    }

    // 清理会话
    async cleanupSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        session.status = 'closed';
        await this.sendMessage({
            type: 'session_closed',
            sessionId
        });

        this.sessions.delete(sessionId);
    }
}

export default new CollaborationManager();
