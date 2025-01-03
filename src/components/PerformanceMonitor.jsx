import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Alert, Timeline, Button, Tooltip } from 'antd';
import {
    DashboardOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    LineChartOutlined,
    AreaChartOutlined,
    AlertOutlined
} from '@ant-design/icons';
import metricsManager from '../managers/MetricsManager';

const PerformanceMonitor = () => {
    const [metrics, setMetrics] = useState({});
    const [alerts, setAlerts] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 订阅指标更新
        metricsManager.on('metricsUpdated', handleMetricsUpdate);
        metricsManager.on('thresholdExceeded', handleAlert);
        metricsManager.on('budgetExceeded', handleAlert);

        // 开始收集指标
        startMonitoring();

        return () => {
            metricsManager.off('metricsUpdated', handleMetricsUpdate);
            metricsManager.off('thresholdExceeded', handleAlert);
            metricsManager.off('budgetExceeded', handleAlert);
        };
    }, []);

    const startMonitoring = async () => {
        setLoading(true);
        try {
            await metricsManager.collectMetrics();
        } finally {
            setLoading(false);
        }
    };

    const handleMetricsUpdate = (newMetrics) => {
        setMetrics(newMetrics);
        updateHistory(newMetrics);
    };

    const handleAlert = (alert) => {
        setAlerts(prev => [
            {
                id: Date.now(),
                timestamp: new Date(),
                ...alert
            },
            ...prev
        ].slice(0, 100)); // 保留最近100条告警
    };

    const updateHistory = (newMetrics) => {
        setHistory(prev => [
            {
                timestamp: Date.now(),
                metrics: newMetrics
            },
            ...prev
        ].slice(0, 1000)); // 保留最近1000条记录
    };

    const renderMetricCard = (title, value, threshold, unit = '', icon) => {
        const percentage = threshold ? (value / threshold) * 100 : 0;
        const status = percentage > 90 ? 'exception' : percentage > 70 ? 'warning' : 'success';

        return (
            <Card size="small" className="metric-card">
                <Statistic
                    title={title}
                    value={value}
                    suffix={unit}
                    prefix={icon}
                    valueStyle={{
                        color: status === 'exception' ? '#ff4d4f' :
                               status === 'warning' ? '#faad14' : '#52c41a'
                    }}
                />
                <Progress
                    percent={Math.min(percentage, 100)}
                    status={status}
                    size="small"
                    showInfo={false}
                />
            </Card>
        );
    };

    const renderAlerts = () => (
        <Card title="性能告警" extra={<AlertOutlined />} className="alerts-card">
            <Timeline>
                {alerts.map(alert => (
                    <Timeline.Item
                        key={alert.id}
                        color={alert.value > alert.threshold * 1.2 ? 'red' : 'orange'}
                    >
                        <p>
                            {alert.metric} 超出阈值
                            ({alert.value.toFixed(2)} > {alert.threshold})
                            <span className="alert-time">
                                {new Date(alert.timestamp).toLocaleString()}
                            </span>
                        </p>
                    </Timeline.Item>
                ))}
            </Timeline>
        </Card>
    );

    const renderHistory = () => (
        <Card title="历史趋势" extra={<LineChartOutlined />} className="history-card">
            {/* 这里可以添加图表组件来展示历史趋势 */}
            <div className="history-placeholder">
                图表开发中...
            </div>
        </Card>
    );

    return (
        <div className="performance-monitor">
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Alert
                        message="性能监控"
                        description="实时监控系统性能指标，包括CPU使用率、内存占用、帧率等。"
                        type="info"
                        showIcon
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="metrics-row">
                <Col span={6}>
                    {renderMetricCard(
                        'CPU使用率',
                        metrics.cpu?.current || 0,
                        100,
                        '%',
                        <DashboardOutlined />
                    )}
                </Col>
                <Col span={6}>
                    {renderMetricCard(
                        '内存使用',
                        (metrics.memory?.current || 0) / 1024 / 1024,
                        100,
                        'MB',
                        <AreaChartOutlined />
                    )}
                </Col>
                <Col span={6}>
                    {renderMetricCard(
                        '帧率',
                        metrics.fps?.current || 0,
                        60,
                        'FPS',
                        <SyncOutlined />
                    )}
                </Col>
                <Col span={6}>
                    {renderMetricCard(
                        '网络请求',
                        metrics.network?.current || 0,
                        1000,
                        'ms',
                        <LineChartOutlined />
                    )}
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col span={12}>
                    {renderAlerts()}
                </Col>
                <Col span={12}>
                    {renderHistory()}
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="actions-row">
                <Col span={24}>
                    <Button
                        type="primary"
                        icon={<SyncOutlined />}
                        loading={loading}
                        onClick={startMonitoring}
                    >
                        刷新数据
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default PerformanceMonitor;
