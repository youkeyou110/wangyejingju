import React, { useEffect, useState } from 'react';
import { Card, List, Avatar, Input, Button, Tooltip, Badge, Space } from 'antd';
import {
    TeamOutlined,
    CommentOutlined,
    HistoryOutlined,
    ShareAltOutlined
} from '@ant-design/icons';
import collaborationManager from '../managers/CollaborationManager';

const Collaboration = ({ sessionId }) => {
    const [users, setUsers] = useState([]);
    const [comments, setComments] = useState([]);
    const [history, setHistory] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        if (!sessionId) return;

        // 加载初始数据
        loadSessionData();

        // 监听更新
        collaborationManager.on('member_joined', handleMemberJoined);
        collaborationManager.on('comment_added', handleCommentAdded);
        collaborationManager.on('change', handleChange);

        return () => {
            collaborationManager.off('member_joined', handleMemberJoined);
            collaborationManager.off('comment_added', handleCommentAdded);
            collaborationManager.off('change', handleChange);
        };
    }, [sessionId]);

    const loadSessionData = () => {
        setUsers(collaborationManager.getOnlineUsers(sessionId));
        setComments(collaborationManager.getSessionComments(sessionId));
        setHistory(collaborationManager.getSessionHistory(sessionId));
    };

    const handleMemberJoined = (data) => {
        if (data.sessionId === sessionId) {
            setUsers(collaborationManager.getOnlineUsers(sessionId));
        }
    };

    const handleCommentAdded = (data) => {
        if (data.sessionId === sessionId) {
            setComments(collaborationManager.getSessionComments(sessionId));
        }
    };

    const handleChange = (data) => {
        if (data.sessionId === sessionId) {
            setHistory(collaborationManager.getSessionHistory(sessionId));
        }
    };

    const addComment = async () => {
        if (!newComment.trim()) return;

        try {
            await collaborationManager.addComment(sessionId, {
                content: newComment
            });
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    return (
        <Card className="collaboration-card">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* 在线用户 */}
                <div>
                    <h4>
                        <TeamOutlined /> 在线用户 ({users.length})
                    </h4>
                    <Avatar.Group maxCount={5}>
                        {users.map(user => (
                            <Tooltip key={user.id} title={user.name}>
                                <Avatar src={user.avatar} />
                            </Tooltip>
                        ))}
                    </Avatar.Group>
                </div>

                {/* 评论区 */}
                <div>
                    <h4>
                        <CommentOutlined /> 评论
                    </h4>
                    <List
                        dataSource={comments}
                        renderItem={comment => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar src={comment.user.avatar} />}
                                    title={comment.user.name}
                                    description={comment.content}
                                />
                                <div className="comment-time">
                                    {new Date(comment.timestamp).toLocaleString()}
                                </div>
                            </List.Item>
                        )}
                    />
                    <div className="comment-input">
                        <Input.TextArea
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="添加评论..."
                            autoSize={{ minRows: 2, maxRows: 4 }}
                        />
                        <Button
                            type="primary"
                            onClick={addComment}
                            style={{ marginTop: 8 }}
                        >
                            发送
                        </Button>
                    </div>
                </div>

                {/* 历史记录 */}
                <div>
                    <h4>
                        <HistoryOutlined /> 历史记录
                    </h4>
                    <List
                        dataSource={history}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar src={item.user.avatar} />}
                                    title={`${item.user.name} 进行了修改`}
                                    description={
                                        <div className="change-time">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </div>
            </Space>
        </Card>
    );
};

export default Collaboration;
