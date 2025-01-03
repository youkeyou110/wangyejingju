import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Alert, Space, Statistic, Progress } from 'antd';
import {
    DashboardOutlined,
    BarChartOutlined,
    AlertOutlined,
    SettingOutlined
} from '@ant-design/icons';
import monitorManager from '../managers/MonitorManager';

const { TabPane } = Tabs;

const MonitorDashboard = () => {
    const [metrics, setMetrics] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
        setupListeners();
        return () => removeListeners();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const currentMetrics = monitorManager.getMetrics();
            const currentAlerts = monitorManager.getAlerts();
            setMetrics(currentMetrics);
            setAlerts(currentAlerts);
        } finally {
            setLoading(false);
        }
    };

    const setupListeners = () => {
        monitorManager.on('metric', handleMetricUpdate);
        monitorManager.on('alert', handleAlert);
    };

    const removeListeners = () => {
        monitorManager.off('metric', handleMetricUpdate);
        monitorManager.off('alert', handleAlert);
    };

    const handleMetricUpdate = (metric) => {
        setMetrics(prev => {
            const index = prev.findIndex(m => m.name === metric.name);
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = metric;
                return updated;
            }
            return [...prev, metric];
        });
    };

    const handleAlert = (alert) => {
        setAlerts(prev => [...prev, alert]);
    };

    const renderSystemMetrics = () => {
        const systemMetrics = metrics.filter(m =>
            ['cpu', 'memory', 'storage'].includes(m.name)
        );

        return (
            <Space direction="vertical" style={{ width: '100%' }}>
                {systemMetrics.map(metric => (
                    <Card key={metric.name}>
                        <Statistic
                            title={metric.name.toUpperCase()}
                            value={metric.value}
                            suffix="%"
                        />
                        <Progress
                            percent={metric.value}
                            status={metric.value > 80 ? 'exception' : 'normal'}
                            showInfo={false}
                        />
                    </Card>
                ))}
            </Space>
        );
    };

    const renderBusinessMetrics = () => {
        const businessMetrics = metrics.filter(m =>
            ['errors', 'response', 'concurrent'].includes(m.name)
        );

        const columns = [
            {
                title: '指标',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: '当前值',
                dataIndex: 'value',
                key: 'value'
            },
            {
                title: '更新时间',
                dataIndex: 'timestamp',
                key: 'timestamp',
                render: time => new Date(time).toLocaleString()
            }
        ];

        return (
            <Table
                columns={columns}
                dataSource={businessMetrics}
                rowKey="name"
                size="small"
            />
        );
    };

    const renderAlerts = () => {
        const columns = [
            {
                title: '级别',
                dataIndex: 'level',
                key: 'level',
                render: level => (
                    <Alert
                        message={level}
                        type={level === 'critical' ? 'error' : level}
                        style={{ padding: '0 8px' }}
                    />
                )
            },
            {
                title: '类型',
                dataIndex: 'type',
                key: 'type'
            },
            {
                title: '消息',
                dataIndex: 'message',
                key: 'message'
            },
            {
                title: '时间',
                dataIndex: 'timestamp',
                key: 'timestamp',
                render: time => new Date(time).toLocaleString()
            },
            {
                title: '状态',
                dataIndex: 'status',
                key: 'status'
            }
        ];

        return (
            <Table
                columns={columns}
                dataSource={alerts}
                rowKey="id"
                size="small"
            />
        );
    };

    return (
        <Card title="监控面板">
            <Tabs defaultActiveKey="system">
                <TabPane
                    tab={
                        <span>
                            <DashboardOutlined />
                            系统监控
                        </span>
                    }
                    key="system"
                >
                    {renderSystemMetrics()}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <BarChartOutlined />
                            业务监控
                        </span>
                    }
                    key="business"
                >
                    {renderBusinessMetrics()}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <AlertOutlined />
                            告警中心
                        </span>
                    }
                    key="alerts"
                >
                    {renderAlerts()}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <SettingOutlined />
                            监控配置
                        </span>
                    }
                    key="settings"
                >
                    {/* 监控配置界面 */}
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default MonitorDashboard;
