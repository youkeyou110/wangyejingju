import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Table, Progress, Alert, Space, Statistic } from 'antd';
import {
    LineChartOutlined,
    ThunderboltOutlined,
    ClockCircleOutlined,
    TeamOutlined
} from '@ant-design/icons';
import performanceTestManager from '../managers/PerformanceTestManager';

const { TabPane } = Tabs;

const PerformanceTest = () => {
    const [activeTest, setActiveTest] = useState(null);
    const [testResults, setTestResults] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setupListeners();
        return () => removeListeners();
    }, []);

    const setupListeners = () => {
        performanceTestManager.on('loadTestComplete', handleLoadTestComplete);
        performanceTestManager.on('stressTestComplete', handleStressTestComplete);
        performanceTestManager.on('stabilityTestComplete', handleStabilityTestComplete);
        performanceTestManager.on('concurrencyTestComplete', handleConcurrencyTestComplete);
    };

    const removeListeners = () => {
        performanceTestManager.off('loadTestComplete', handleLoadTestComplete);
        performanceTestManager.off('stressTestComplete', handleStressTestComplete);
        performanceTestManager.off('stabilityTestComplete', handleStabilityTestComplete);
        performanceTestManager.off('concurrencyTestComplete', handleConcurrencyTestComplete);
    };

    const handleLoadTestComplete = (results) => {
        setTestResults(prev => ({ ...prev, loadTest: results }));
        setLoading(false);
    };

    const handleStressTestComplete = (results) => {
        setTestResults(prev => ({ ...prev, stressTest: results }));
        setLoading(false);
    };

    const handleStabilityTestComplete = (results) => {
        setTestResults(prev => ({ ...prev, stabilityTest: results }));
        setLoading(false);
    };

    const handleConcurrencyTestComplete = (results) => {
        setTestResults(prev => ({ ...prev, concurrencyTest: results }));
        setLoading(false);
    };

    const startTest = async (testType) => {
        setLoading(true);
        setActiveTest(testType);
        try {
            switch (testType) {
                case 'loadTest':
                    await performanceTestManager.runLoadTest();
                    break;
                case 'stressTest':
                    await performanceTestManager.runStressTest();
                    break;
                case 'stabilityTest':
                    await performanceTestManager.runStabilityTest();
                    break;
                case 'concurrencyTest':
                    await performanceTestManager.runConcurrencyTest();
                    break;
                default:
                    throw new Error(`Unknown test type: ${testType}`);
            }
        } catch (error) {
            console.error('Test failed:', error);
            setLoading(false);
        }
    };

    const renderLoadTestResults = () => {
        const results = testResults.loadTest;
        if (!results) return null;

        const columns = [
            {
                title: '用户数',
                dataIndex: 'userCount',
                key: 'userCount'
            },
            {
                title: '平均响应时间',
                dataIndex: 'avgResponseTime',
                key: 'avgResponseTime',
                render: time => `${time}ms`
            },
            {
                title: '错误率',
                dataIndex: 'errorRate',
                key: 'errorRate',
                render: rate => `${(rate * 100).toFixed(2)}%`
            },
            {
                title: '吞吐量',
                dataIndex: 'throughput',
                key: 'throughput',
                render: tps => `${tps} TPS`
            }
        ];

        return (
            <div>
                <Alert
                    message="负载测试结果"
                    description={`测试持续时间: ${(results.endTime - results.startTime) / 1000}秒`}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Table
                    columns={columns}
                    dataSource={results.metrics}
                    rowKey="userCount"
                    size="small"
                />
            </div>
        );
    };

    const renderStressTestResults = () => {
        const results = testResults.stressTest;
        if (!results) return null;

        return (
            <div>
                <Alert
                    message="压力测试结果"
                    description={`最大并发用户数: ${results.summary.maxUsers}`}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Space size="large" style={{ marginBottom: 16 }}>
                    <Statistic
                        title="平均响应时间"
                        value={results.summary.avgResponseTime}
                        suffix="ms"
                    />
                    <Statistic
                        title="最大RPS"
                        value={results.summary.maxRPS}
                    />
                    <Statistic
                        title="错误率"
                        value={results.summary.errorRate * 100}
                        suffix="%"
                    />
                </Space>
                {results.errors.length > 0 && (
                    <Alert
                        message="发现错误"
                        description={`共发现 ${results.errors.length} 个错误`}
                        type="error"
                        showIcon
                    />
                )}
            </div>
        );
    };

    const renderStabilityTestResults = () => {
        const results = testResults.stabilityTest;
        if (!results) return null;

        return (
            <div>
                <Alert
                    message="稳定性测试结果"
                    description={`测试持续时间: ${results.summary.duration / 3600}小时`}
                    type="success"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Space size="large" style={{ marginBottom: 16 }}>
                    <Statistic
                        title="系统稳定性"
                        value={results.summary.stability * 100}
                        suffix="%"
                    />
                    <Statistic
                        title="平均响应时间"
                        value={results.summary.avgResponseTime}
                        suffix="ms"
                    />
                    <Statistic
                        title="发现问题数"
                        value={results.issues.length}
                    />
                </Space>
            </div>
        );
    };

    const renderConcurrencyTestResults = () => {
        const results = testResults.concurrencyTest;
        if (!results) return null;

        const columns = [
            {
                title: '线程数',
                dataIndex: 'threadCount',
                key: 'threadCount'
            },
            {
                title: '完成时间',
                dataIndex: 'completionTime',
                key: 'completionTime',
                render: time => `${time}ms`
            },
            {
                title: '成功率',
                dataIndex: 'successRate',
                key: 'successRate',
                render: rate => `${(rate * 100).toFixed(2)}%`
            },
            {
                title: '每秒处理量',
                dataIndex: 'throughput',
                key: 'throughput',
                render: tps => `${tps} ops/s`
            }
        ];

        return (
            <div>
                <Alert
                    message="并发测试结果"
                    description={`最优线程数: ${results.summary.optimalThreads}`}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Table
                    columns={columns}
                    dataSource={results.threadResults}
                    rowKey="threadCount"
                    size="small"
                />
            </div>
        );
    };

    return (
        <Card title="性能测试">
            <Tabs defaultActiveKey="loadTest">
                <TabPane
                    tab={
                        <span>
                            <LineChartOutlined />
                            负载测试
                        </span>
                    }
                    key="loadTest"
                >
                    <Button
                        type="primary"
                        onClick={() => startTest('loadTest')}
                        loading={loading && activeTest === 'loadTest'}
                        style={{ marginBottom: 16 }}
                    >
                        开始负载测试
                    </Button>
                    {renderLoadTestResults()}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <ThunderboltOutlined />
                            压力测试
                        </span>
                    }
                    key="stressTest"
                >
                    <Button
                        type="primary"
                        onClick={() => startTest('stressTest')}
                        loading={loading && activeTest === 'stressTest'}
                        style={{ marginBottom: 16 }}
                    >
                        开始压力测试
                    </Button>
                    {renderStressTestResults()}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <ClockCircleOutlined />
                            稳定性测试
                        </span>
                    }
                    key="stabilityTest"
                >
                    <Button
                        type="primary"
                        onClick={() => startTest('stabilityTest')}
                        loading={loading && activeTest === 'stabilityTest'}
                        style={{ marginBottom: 16 }}
                    >
                        开始稳定性测试
                    </Button>
                    {renderStabilityTestResults()}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <TeamOutlined />
                            并发测试
                        </span>
                    }
                    key="concurrencyTest"
                >
                    <Button
                        type="primary"
                        onClick={() => startTest('concurrencyTest')}
                        loading={loading && activeTest === 'concurrencyTest'}
                        style={{ marginBottom: 16 }}
                    >
                        开始并发测试
                    </Button>
                    {renderConcurrencyTestResults()}
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default PerformanceTest;
