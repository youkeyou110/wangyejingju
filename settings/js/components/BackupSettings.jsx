import React, { useState, useEffect } from 'react';
import {
    Form,
    Card,
    Button,
    Switch,
    Select,
    InputNumber,
    Table,
    Space,
    Progress,
    Alert,
    Modal,
    message,
    Tooltip,
    Popconfirm
} from 'antd';
import {
    CloudUploadOutlined,
    CloudDownloadOutlined,
    DeleteOutlined,
    HistoryOutlined,
    ReloadOutlined,
    SettingOutlined
} from '@ant-design/icons';

const { Option } = Select;

const BackupSettings = ({ settings, onUpdate }) => {
    const [form] = Form.useForm();
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [backingUp, setBackingUp] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [progress, setProgress] = useState(0);

    // 加载备份列表
    useEffect(() => {
        loadBackups();
    }, []);

    // 加载备份数据
    const loadBackups = async () => {
        setLoading(true);
        try {
            const { backupList } = await chrome.storage.local.get('backupList');
            setBackups(backupList || []);
        } catch (error) {
            console.error('Failed to load backups:', error);
            message.error('加载备份列表失败');
        } finally {
            setLoading(false);
        }
    };

    // 表格列定义
    const columns = [
        {
            title: '备份时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        },
        {
            title: '备份大小',
            dataIndex: 'size',
            key: 'size',
            width: 120,
            render: size => `${(size / 1024).toFixed(2)} KB`
        },
        {
            title: '备份类型',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: type => type === 'auto' ? '自动' : '手动'
        },
        {
            title: '版本',
            dataIndex: 'version',
            key: 'version',
            width: 100
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: status => (
                <span style={{ color: status === 'success' ? '#52c41a' : '#ff4d4f' }}>
                    {status === 'success' ? '正常' : '异常'}
                </span>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Tooltip title="恢复">
                        <Button
                            type="text"
                            icon={<CloudDownloadOutlined />}
                            onClick={() => handleRestore(record)}
                            disabled={restoring}
                        />
                    </Tooltip>
                    <Tooltip title="删除">
                        <Popconfirm
                            title="确定要删除这个备份吗？"
                            onConfirm={() => handleDelete(record)}
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                disabled={backingUp || restoring}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    // 处理表单变化
    const handleValuesChange = (changedValues, allValues) => {
        onUpdate(allValues);
    };

    // 创建备份
    const handleBackup = async () => {
        setBackingUp(true);
        setProgress(0);
        try {
            // 获取所有数据
            const data = await chrome.storage.sync.get(null);

            // 创建备份对象
            const backup = {
                id: `backup-${Date.now()}`,
                createdAt: new Date().toISOString(),
                type: 'manual',
                version: chrome.runtime.getManifest().version,
                size: JSON.stringify(data).length,
                status: 'success',
                data
            };

            // 更新进度
            setProgress(50);

            // 压缩数据
            const compressed = await compressData(backup);

            // 保存备份
            const { backupList = [] } = await chrome.storage.local.get('backupList');
            const newBackupList = [compressed, ...backupList];

            // 检查备份数量限制
            if (newBackupList.length > settings.maxBackups) {
                newBackupList.pop();
            }

            await chrome.storage.local.set({ backupList: newBackupList });

            setProgress(100);
            message.success('备份创建成功');
            loadBackups();
        } catch (error) {
            console.error('Failed to create backup:', error);
            message.error('备份创建失败');
        } finally {
            setBackingUp(false);
        }
    };

    // 恢复备份
    const handleRestore = async (backup) => {
        Modal.confirm({
            title: '恢复备份',
            content: '恢复备份将覆盖当前所有设置，确定要继续吗？',
            onOk: async () => {
                setRestoring(true);
                setProgress(0);
                try {
                    // 解压数据
                    const decompressed = await decompressData(backup);
                    setProgress(50);

                    // 恢复数据
                    await chrome.storage.sync.clear();
                    await chrome.storage.sync.set(decompressed.data);

                    setProgress(100);
                    message.success('备份恢复成功');

                    // 重新加载设置
                    window.location.reload();
                } catch (error) {
                    console.error('Failed to restore backup:', error);
                    message.error('备份恢复失败');
                } finally {
                    setRestoring(false);
                }
            }
        });
    };

    // 删除备份
    const handleDelete = async (backup) => {
        try {
            const { backupList } = await chrome.storage.local.get('backupList');
            const newBackupList = backupList.filter(b => b.id !== backup.id);
            await chrome.storage.local.set({ backupList: newBackupList });
            message.success('备份删除成功');
            loadBackups();
        } catch (error) {
            console.error('Failed to delete backup:', error);
            message.error('备份删除失败');
        }
    };

    // 压缩数据
    const compressData = async (data) => {
        // TODO: 实现数据压缩
        return data;
    };

    // 解压数据
    const decompressData = async (data) => {
        // TODO: 实现数据解压
        return data;
    };

    return (
        <div className="backup-settings">
            {/* 备份设置 */}
            <Card
                title={
                    <Space>
                        <SettingOutlined />
                        <span>备份设置</span>
                    </Space>
                }
                className="settings-card"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={settings}
                    onValuesChange={handleValuesChange}
                >
                    <Form.Item
                        name="autoBackup"
                        label="自动备份"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    {form.getFieldValue('autoBackup') && (
                        <>
                            <Form.Item
                                name="backupInterval"
                                label="备份周期"
                            >
                                <Select>
                                    <Option value="daily">每天</Option>
                                    <Option value="weekly">每周</Option>
                                    <Option value="monthly">每月</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="maxBackups"
                                label="最大备份数量"
                            >
                                <InputNumber min={1} max={50} />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Card>

            {/* 备份列表 */}
            <Card
                title={
                    <Space>
                        <HistoryOutlined />
                        <span>备份历史</span>
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<CloudUploadOutlined />}
                        onClick={handleBackup}
                        loading={backingUp}
                        disabled={restoring}
                    >
                        创建备份
                    </Button>
                }
                className="settings-card"
            >
                {(backingUp || restoring) && (
                    <div className="backup-progress">
                        <Progress percent={progress} />
                    </div>
                )}

                <Table
                    columns={columns}
                    dataSource={backups}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />
            </Card>

            {/* 提示信息 */}
            <Alert
                message="备份说明"
                description={
                    <ul className="backup-tips">
                        <li>自动备份将在指定周期自动创建备份</li>
                        <li>超出最大备份数量时，将自动删除最早的备份</li>
                        <li>建议定期手动创建备份以确保数据安全</li>
                        <li>恢复备份将覆盖当前所有设置，请谨慎操作</li>
                    </ul>
                }
                type="info"
                showIcon
                className="backup-alert"
            />
        </div>
    );
};

export default BackupSettings;
