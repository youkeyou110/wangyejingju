import React, { useEffect, useState } from 'react';
import { Card, Table, Tabs, Alert, Timeline, Empty, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import performanceLogManager from '../managers/PerformanceLogManager';

const { TabPane } = Tabs;

const PerformanceLogAnalysis = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        performanceLogManager.on('analysisComplete', handleAnalysisComplete);
        loadReport();

        return () => {
            performanceLogManager.off('analysisComplete', handleAnalysisComplete);
        };
    }, []);

    const loadReport = () => {
        setLoading(true);
        const report = performanceLogManager.getAnalysisReport();
        if (report) {
            setReport(report);
        }
        setLoading(false);
    };

    const handleAnalysisComplete = (newReport) => {
        setReport(newReport);
        setLoading(false);
    };

    const renderMetricsAnalysis = () => {
        if (!report?.metrics) return <Empty description="暂无数据" />;

        const data = Object.entries(report.metrics).map(([name, analysis]) => ({
            key: name,
            name,
            ...analysis
        }));

        const columns = [
            { title: '指标', dataIndex: 'name', key: 'name' },
            { title: '平均值', dataIndex: 'average', key: 'average',
                render: val => val.toFixed(2) },
            { title: '中位数', dataIndex: 'median', key: 'median',
                render: val => val.toFixed(2) },
            { title: '95分位', dataIndex: 'percentile95', key: 'percentile95',
                render: val => val.toFixed(2) },
            { title: '趋势', dataIndex: 'trend', key: 'trend' },
            { title: '波动性', dataIndex: 'volatility', key: 'volatility',
                render: val => (val * 100).toFixed(2) + '%' }
        ];

        return (
            <div>
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    size="small"
                />
                {renderMetricsChart(data)}
            </div>
        );
    };

    const renderMetricsChart = (data) => {
        if (!data.length) return null;

        return (
            <div style={{ marginTop: 20 }}>
                <LineChart width={800} height={400} data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="average" stroke="#8884d8" />
                    <Line type="monotone" dataKey="median" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="percentile95" stroke="#ffc658" />
                </LineChart>
            </div>
        );
    };

    const renderEventsAnalysis = () => {
        if (!report?.events) return <Empty description="暂无数据" />;

        return (
            <div>
                <Alert
                    message={`总事件数: ${report.events.total}`}
                    type="info"
                    style={{ marginBottom: 16 }}
                />
                <Timeline>
                    {Array.from(report.events.byType).map(([type, count]) => (
                        <Timeline.Item key={type}>
                            {type}: {count}次
                        </Timeline.Item>
                    ))}
                </Timeline>
            </div>
        );
    };

    const renderPatternsAnalysis = () => {
        if (!report?.patterns?.length) return <Empty description="暂无数据" />;

        return (
            <Timeline>
                {report.patterns.map((pattern, index) => (
                    <Timeline.Item key={index}>
                        <p>{pattern.description}</p>
                        <p style={{ color: '#666' }}>
                            置信度: {(pattern.confidence * 100).toFixed(2)}%
                        </p>
                    </Timeline.Item>
                ))}
            </Timeline>
        );
    };

    const renderRecommendations = () => {
        if (!report?.recommendations?.length) {
            return <Empty description="暂无建议" />;
        }

        return (
            <Timeline>
                {report.recommendations.map((rec, index) => (
                    <Timeline.Item
                        key={index}
                        color={
                            rec.severity === 'warning' ? 'red' :
                            rec.severity === 'info' ? 'blue' : 'gray'
                        }
                    >
                        <p>{rec.message}</p>
                        <p style={{ color: '#666' }}>
                            类型: {rec.type}
                        </p>
                    </Timeline.Item>
                ))}
            </Timeline>
        );
    };

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <Card title="性能日志分析">
            <Tabs defaultActiveKey="metrics">
                <TabPane tab="指标分析" key="metrics">
                    {renderMetricsAnalysis()}
                </TabPane>
                <TabPane tab="事件分析" key="events">
                    {renderEventsAnalysis()}
                </TabPane>
                <TabPane tab="模式分析" key="patterns">
                    {renderPatternsAnalysis()}
                </TabPane>
                <TabPane tab="优化建议" key="recommendations">
                    {renderRecommendations()}
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default PerformanceLogAnalysis;
