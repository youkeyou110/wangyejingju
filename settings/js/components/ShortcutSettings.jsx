import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Table,
    Space,
    Alert,
    Card,
    Tooltip,
    Modal,
    message
} from 'antd';
import {
    KeyOutlined,
    ReloadOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';

const ShortcutSettings = ({ settings, onUpdate }) => {
    const [form] = Form.useForm();
    const [recording, setRecording] = useState(null);
    const [conflicts, setConflicts] = useState([]);

    // 默认快捷键
    const defaultShortcuts = {
        createCard: 'Ctrl+Shift+Q',
        quickExport: 'Ctrl+Shift+S',
        openSettings: 'Ctrl+Shift+,',
        clearSelection: 'Esc'
    };

    // 快捷键列表
    const shortcutColumns = [
        {
            title: '功能',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <KeyOutlined />
                    <span>{record.description}</span>
                </Space>
            )
        },
        {
            title: '快捷键',
            dataIndex: 'shortcut',
            key: 'shortcut',
            render: (text, record) => (
                <Form.Item
                    name={record.key}
                    noStyle
                >
                    <Input
                        placeholder="点击录入快捷键"
                        value={text}
                        onFocus={() => startRecording(record.key)}
                        onBlur={() => stopRecording()}
                        onKeyDown={handleKeyDown}
                        readOnly
                    />
                </Form.Item>
            )
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="重置为默认">
                        <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={() => resetShortcut(record.key)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    // 快捷键数据
    const shortcutData = [
        {
            key: 'createCard',
            name: 'createCard',
            description: '创建卡片',
            shortcut: settings.createCard
        },
        {
            key: 'quickExport',
            name: 'quickExport',
            description: '快速导出',
            shortcut: settings.quickExport
        },
        {
            key: 'openSettings',
            name: 'openSettings',
            description: '打开设置',
            shortcut: settings.openSettings
        },
        {
            key: 'clearSelection',
            name: 'clearSelection',
            description: '清除选择',
            shortcut: settings.clearSelection
        }
    ];

    // 开始录制快捷键
    const startRecording = (key) => {
        setRecording(key);
        message.info('请按下新的快捷键组合');
    };

    // 停止录制快捷键
    const stopRecording = () => {
        setRecording(null);
    };

    // 处理按键事件
    const handleKeyDown = (event) => {
        if (!recording) return;

        event.preventDefault();

        const keys = [];
        if (event.ctrlKey) keys.push('Ctrl');
        if (event.shiftKey) keys.push('Shift');
        if (event.altKey) keys.push('Alt');
        if (event.metaKey) keys.push('Cmd');

        // 添加主键
        const key = event.key.toUpperCase();
        if (!['CONTROL', 'SHIFT', 'ALT', 'META'].includes(key)) {
            keys.push(key);
        }

        // 生成快捷键字符串
        const shortcut = keys.join('+');

        // 检查冲突
        const conflicts = checkConflicts(shortcut, recording);
        if (conflicts.length > 0) {
            showConflictWarning(conflicts);
            return;
        }

        // 更新快捷键
        const values = form.getFieldsValue();
        values[recording] = shortcut;
        form.setFieldsValue(values);
        onUpdate(values);

        stopRecording();
        message.success('快捷键设置成功');
    };

    // 检查快捷键冲突
    const checkConflicts = (shortcut, currentKey) => {
        return shortcutData
            .filter(item => item.key !== currentKey && item.shortcut === shortcut)
            .map(item => item.description);
    };

    // 显示冲突警告
    const showConflictWarning = (conflicts) => {
        Modal.confirm({
            title: '快捷键冲突',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>该快捷键已被以下功能使用：</p>
                    <ul>
                        {conflicts.map(conflict => (
                            <li key={conflict}>{conflict}</li>
                        ))}
                    </ul>
                    <p>请选择其他快捷键组合。</p>
                </div>
            ),
            okText: '确定',
            cancelText: null
        });
    };

    // 重置快捷键
    const resetShortcut = (key) => {
        const values = form.getFieldsValue();
        values[key] = defaultShortcuts[key];
        form.setFieldsValue(values);
        onUpdate(values);
        message.success('已重置为默认快捷键');
    };

    // 重置所有快捷键
    const resetAllShortcuts = () => {
        Modal.confirm({
            title: '重置所有快捷键',
            content: '确定要将所有快捷键重置为默认值吗？',
            onOk: () => {
                form.setFieldsValue(defaultShortcuts);
                onUpdate(defaultShortcuts);
                message.success('已重置所有快捷键');
            }
        });
    };

    return (
        <div className="shortcut-settings">
            <Alert
                message="快捷键设置说明"
                description={
                    <ul className="shortcut-tips">
                        <li>点击输入框并按下新的快捷键组合</li>
                        <li>支持的按键：字母、数字、功能键</li>
                        <li>支持的修饰键：Ctrl、Shift、Alt、Cmd(Mac)</li>
                        <li>部分快捷键可能与浏览器或系统快捷键冲突</li>
                    </ul>
                }
                type="info"
                showIcon
                className="shortcut-alert"
            />

            <Card className="settings-card">
                <Form
                    form={form}
                    initialValues={settings}
                    className="shortcut-form"
                >
                    <Table
                        columns={shortcutColumns}
                        dataSource={shortcutData}
                        pagination={false}
                        rowKey="key"
                    />
                </Form>

                <div className="shortcut-actions">
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={resetAllShortcuts}
                    >
                        重置所有快捷键
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ShortcutSettings;
