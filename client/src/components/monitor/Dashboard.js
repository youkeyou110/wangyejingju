import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Spin } from 'antd';
import SystemOverview from './SystemOverview';
import PerformanceMetrics from './PerformanceMetrics';
import AlertList from './AlertList';
import LogViewer from './LogViewer';
import { getSystemOverview } from '../../services/monitor.service';

const { Option } = Select;

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(5);
    const [overview, setOverview] = useState(null);

    useEffect(() => {
        fetchOverview();
        const timer = setInterval(fetchOverview, timeRange * 60000);
        return () => clearInterval(timer);
    }, [timeRange]);

    const fetchOverview = async () => {
        try {
            const data = await getSystemOverview(timeRange);
            setOverview(data);
        } catch (error) {
            console.error('获取系统概览失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="monitor-dashboard">
            <Row gutter={[16, 16]} className="dashboard-header">
                <Col span={12}>
                    <h2>系统监控面板</h2>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                    <Select
                        value={timeRange}
                        onChange={setTimeRange}
                        style={{ width: 120 }}
                    >
                        <Option value={5}>最近5分钟</Option>
                        <Option value={15}>最近15分钟</Option>
                        <Option value={30}>最近30分钟</Option>
                        <Option value={60}>最近1小时</Option>
                    </Select>
                </Col>
            </Row>

            <Spin spinning={loading}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card title="系统概览">
                            <SystemOverview data={overview?.system} />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col span={12}>
                        <Card title="性能指标">
                            <PerformanceMetrics
                                data={overview?.database}
                                timeRange={timeRange}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="告警信息">
                            <AlertList />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col span={24}>
                        <Card title="系统日志">
                            <LogViewer />
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
};

export default Dashboard;
