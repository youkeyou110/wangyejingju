import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Alert, Space, Statistic, Timeline } from 'antd';
import {
    SafetyCertificateOutlined,
    SyncOutlined,
    WarningOutlined,
    ExperimentOutlined
} from '@ant-design/icons';
import disasterRecoveryManager from '../managers/DisasterRecoveryManager';

const { TabPane } = Tabs;

const DisasterRecovery = () => {
    const [backups, setBackups] = useState([]);
    const [recoveryPoints, setRecoveryPoints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeOperation, setActiveOperation] = useState(null);

    useEffect(() => {
        loadData();
        setupListeners();
        return () => removeListeners();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const currentBackups = disasterRecoveryManager.getBackups();
            const currentRecoveryPoints = disasterRecoveryManager.getRecoveryPoints();
            setBackups(currentBackups);
            setRecoveryPoints(currentRecoveryPoints);
        } finally {
            setLoading(false);
        }
    };

    const setupListeners = () => {
        disasterRecoveryManager.on('backupComplete', handleBackupComplete);
        disasterRecoveryManager.on('failoverComplete', handleFailoverComplete);
        disasterRecoveryManager.on('recoveryComplete', handleRecoveryComplete);
        disasterRecoveryManager.on('drillComplete', handleDrillComplete);
    };

    const removeListeners = () => {
        disasterRecoveryManager.off('backupComplete', handleBackupComplete);
        disasterRecoveryManager.off('failoverComplete', handleFailoverComplete);
        disasterRecoveryManager.off('recoveryComplete', handleRecoveryComplete);
        disasterRecoveryManager.off('drillComplete', handleDrillComplete);
    };

    const handleBackupComplete = (result) => {
        setBackups(prev => [...prev, result]);
        setLoading(false);
    };

    const handleFailoverComplete = () => {
        loadData();
        setLoading(false);
    };

    const handleRecoveryComplete = () => {
        loadData();
        setLoading(false);
    };

    const handleDrillComplete = () => {
        loadData();
        setLoading(false);
    };

    const startBackup = async (type) => {
        setLoading(true);
        setActiveOperation('backup');
        try {
            await disasterRecoveryManager.createBackup(type);
        } catch (error) {
            console.error('Backup failed:', error);
            setLoading(false);
        }
    };

    const startFailover = async () => {
        setLoading(true);
        setActiveOperation('failover');
        try {
            await disasterRecoveryManager.executeFailover();
        } catch (error) {
            console.error('Failover failed:', error);
            setLoading(false);
        }
    };

    const startRecovery = async (recoveryPointId) => {
        setLoading(true);
        setActiveOperation('recovery');
        try {
            await disasterRecoveryManager.executeRecovery(recoveryPointId);
        } catch (error) {
            console.error('Recovery failed:', error);
            setLoading(false);
        }
    };

    const startDrill = async (scenario) => {
        setLoading(true);
        setActiveOperation('drill');
        try {
            await disasterRecoveryManager.startDrill(scenario);
        } catch (error) {
            console.error('Drill failed:', error);
            setLoading(false);
        }
    };

    const renderBackups = () => {
        const columns = [
            {
                title: '备份ID',
                dataIndex: 'id',
                key: 'id'
            },
            {
                title: '类型',
                dataIndex: 'type',
                key: 'type'
            },
            {
                title: '时间',
                dataIndex: 'timestamp',
                key: 'timestamp',
                render: time => new Date(time).toLocaleString()
            },
            {
                title: '操作',
                key: 'action',
                render: (_, record) => (
                    <Button
                        type="primary"
                        onClick={() => startRecovery(record.id)}
                        loading={loading && activeOperation === 'recovery'}
                    >
                        恢复
                    </Button>
                )
            }
        ];

        return (
            <div>
                <Space style={{ marginBottom: 16 }}>
                    <Button
                        type="primary"
                        onClick={() => startBackup('full')}
                        loading={loading && activeOperation === 'backup'}
                    >
                        完整备份
                    </Button>
                    <Button
                        onClick={() => startBackup('incremental')}
                        loading={loading && activeOperation === 'backup'}
                    >
                        增量备份
                    </Button>
                </Space>
                <Table
                    columns={columns}
                    dataSource={backups}
                    rowKey="id"
                    size="small"
                />
            </div>
        );
    };

    const renderFailover = () => {
        return (
            <div>
                <Alert
                    message="故障转移"
                    description="执行故障转移将切换到备用系统，请确保操作必要性。"
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Button
                    type="primary"
                    danger
                    icon={<SyncOutlined />}
                    onClick={startFailover}
                    loading={loading && activeOperation === 'failover'}
                >
                    执行故障转移
                </Button>
            </div>
        );
    };

    const renderDrills = () => {
        const scenarios = [
            {
                name: 'data-loss',
                title: '数据丢失',
                description: '模拟数据丢失场景的恢复演练'
            },
            {
                name: 'system-crash',
                title: '系统崩溃',
                description: '模拟系统崩溃场景的恢复演练'
            },
            {
                name: 'network-failure',
                title: '网络故障',
                description: '模拟网络故障场景的恢复演练'
            }
        ];

        return (
            <div>
                <Space direction="vertical" style={{ width: '100%' }}>
                    {scenarios.map(scenario => (
                        <Card key={scenario.name}>
                            <Card.Meta
                                title={scenario.title}
                                description={scenario.description}
                            />
                            <Button
                                type="primary"
                                style={{ marginTop: 16 }}
                                onClick={() => startDrill(scenario.name)}
                                loading={loading && activeOperation === 'drill'}
                            >
                                开始演练
                            </Button>
                        </Card>
                    ))}
                </Space>
            </div>
        );
    };

    return (
        <Card title="灾备管理">
            <Tabs defaultActiveKey="backup">
                <TabPane
                    tab={
                        <span>
                            <SafetyCertificateOutlined />
                            数据备份
                        </span>
                    }
                    key="backup"
                >
                    {renderBackups()}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <WarningOutlined />
                            故障转移
                        </span>
                    }
                    key="failover"
                >
                    {renderFailover()}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <ExperimentOutlined />
                            恢复演练
                        </span>
                    }
                    key="drill"
                >
                    {renderDrills()}
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default DisasterRecovery;
