import React, { useState, useEffect } from 'react';
import {
    Card,
    List,
    Button,
    Space,
    Tooltip,
    Empty,
    Modal
} from 'antd';
import {
    UndoOutlined,
    RedoOutlined,
    DeleteOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import historyManager from '../managers/HistoryManager';

const { confirm } = Modal;

const HistoryPanel = ({ onStateChange }) => {
    const [history, setHistory] = useState([]);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // 监听历史变化
    useEffect(() => {
        const cleanup = historyManager.onChange(({ history, canUndo, canRedo }) => {
            setHistory(history);
            setCanUndo(canUndo);
            setCanRedo(canRedo);
        });

        // 恢复历史
        historyManager.restore();

        return cleanup;
    }, []);

    // 处理撤销
    const handleUndo = () => {
        const state = historyManager.undo();
        if (state) {
            onStateChange(state);
        }
    };

    // 处理重做
    const handleRedo = () => {
        const state = historyManager.redo();
        if (state) {
            onStateChange(state);
        }
    };

    // 处理清空历史
    const handleClear = () => {
        confirm({
            title: '确认清空历史记录？',
            icon: <ExclamationCircleOutlined />,
            content: '此操作不可恢复',
            onOk() {
                historyManager.clear();
            }
        });
    };

    // 处理历史跳转
    const handleGoto = (index) => {
        const state = historyManager.goto(index);
        if (state) {
            onStateChange(state);
        }
    };

    // 格式化时间
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    };

    return (
        <Card
            title="操作历史"
            extra={
                <Space>
                    <Tooltip title="撤销">
                        <Button
                            icon={<UndoOutlined />}
                            onClick={handleUndo}
                            disabled={!canUndo}
                        />
                    </Tooltip>
                    <Tooltip title="重做">
                        <Button
                            icon={<RedoOutlined />}
                            onClick={handleRedo}
                            disabled={!canRedo}
                        />
                    </Tooltip>
                    <Tooltip title="清空历史">
                        <Button
                            icon={<DeleteOutlined />}
                            onClick={handleClear}
                            disabled={history.length === 0}
                        />
                    </Tooltip>
                </Space>
            }
        >
            {history.length === 0 ? (
                <Empty description="暂无历史记录" />
            ) : (
                <List
                    className="history-list"
                    dataSource={history}
                    renderItem={(item, index) => (
                        <List.Item
                            key={item.timestamp}
                            className={`history-item ${item.current ? 'current' : ''}`}
                            onClick={() => handleGoto(index)}
                        >
                            <Space>
                                <ClockCircleOutlined />
                                <span className="history-time">
                                    {formatTime(item.timestamp)}
                                </span>
                                <span className="history-type">
                                    {item.type}
                                </span>
                            </Space>
                        </List.Item>
                    )}
                />
            )}
        </Card>
    );
};

export default HistoryPanel;
