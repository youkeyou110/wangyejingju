import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Table, Alert, Space, Tag, Statistic } from 'antd';
import {
    BugOutlined,
    SafetyCertificateOutlined,
    DatabaseOutlined,
    LockOutlined
} from '@ant-design/icons';
import securityTestManager from '../managers/SecurityTestManager';

const { TabPane } = Tabs;

const SecurityTest = () => {
    const [activeTest, setActiveTest] = useState(null);
    const [testResults, setTestResults] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setupListeners();
        return () => removeListeners();
    }, []);

    const setupListeners = () => {
        securityTestManager.on('xssTestComplete', handleXSSTestComplete);
        securityTestManager.on('csrfTestComplete', handleCSRFTestComplete);
        securityTestManager.on('sqlInjectionTestComplete', handleSQLInjectionTestComplete);
        securityTestManager.on('permissionTestComplete', handlePermissionTestComplete);
    };

    const removeListeners = () => {
        securityTestManager.off('xssTestComplete', handleXSSTestComplete);
        securityTestManager.off('csrfTestComplete', handleCSRFTestComplete);
        securityTestManager.off('sqlInjectionTestComplete', handleSQLInjectionTestComplete);
        securityTestManager.off('permissionTestComplete', handlePermissionTestComplete);
    };

    const handleXSSTestComplete = (results) => {
        setTestResults(prev => ({ ...prev, xssTest: results }));
        setLoading(false);
    };

    const handleCSRFTestComplete = (results) => {
        setTestResults(prev => ({ ...prev, csrfTest: results }));
        setLoading(false);
    };

    const handleSQLInjectionTestComplete = (results) => {
        setTestResults(prev => ({ ...prev, sqlInjectionTest: results }));
        setLoading(false);
    };

    const handlePermissionTestComplete = (results) => {
        setTestResults(prev => ({ ...prev, permissionTest: results }));
        setLoading(false);
    };

    const startTest = async (testType) => {
        setLoading(true);
        setActiveTest(testType);
        try {
            switch (testType) {
                case 'xssTest':
                    await securityTestManager.runXSSTest();
                    break;
                case 'csrfTest':
                    await securityTestManager.runCSRFTest();
                    break;
                case 'sqlInjectionTest':
                    await securityTestManager.runSQLInjectionTest();
                    break;
                case 'permissionTest':
                    await securityTestManager.runPermissionTest();
                    break;
                default:
                    throw new Error(`Unknown test type: ${testType}`);
            }
        } catch (error) {
            console.error('Test failed:', error);
            setLoading(false);
        }
    };

    const renderXSSTestResults = () => {
        const results = testResults.xssTest;
        if (!results) return null;

        const columns = [
            {
                title: '目标',
                dataIndex: 'target',
                key: 'target'
            },
            {
                title: 'Payload',
                dataIndex: 'payload',
                key: 'payload',
                render: text => <code>{text}</code>
            },
            {
                title: '详情',
                dataIndex: 'details',
                key: 'details'
            }
        ];

        return (
            <div>
                <Alert
                    message="XSS测试结果"
                    description={`发现 ${results.vulnerabilities.length} 个XSS漏洞`}
                    type={results.vulnerabilities.length > 0 ? 'error' : 'success'}
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Table
                    columns={columns}
                    dataSource={results.vulnerabilities}
                    rowKey={(record, index) => `${record.target}-${index}`}
                    size="small"
                />
            </div>
        );
    };

    const renderCSRFTestResults = () => {
        const results = testResults.csrfTest;
        if (!results) return null;

        return (
            <div>
                <Alert
                    message="CSRF测试结果"
                    description={`发现 ${results.vulnerabilities.length} 个CSRF漏洞`}
                    type={results.vulnerabilities.length > 0 ? 'error' : 'success'}
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Space size="large" style={{ marginBottom: 16 }}>
                    <Statistic
                        title="测试总数"
                        value={results.summary.totalTests}
                    />
                    <Statistic
                        title="发现漏洞"
                        value={results.summary.vulnerabilitiesFound}
                    />
                    <Statistic
                        title="风险等级"
                        value={results.summary.riskLevel.toUpperCase()}
                    />
                </Space>
            </div>
        );
    };

    const renderSQLInjectionTestResults = () => {
        const results = testResults.sqlInjectionTest;
        if (!results) return null;

        const columns = [
            {
                title: '目标',
                dataIndex: 'target',
                key: 'target'
            },
            {
                title: 'Payload',
                dataIndex: 'payload',
                key: 'payload',
                render: text => <code>{text}</code>
            },
            {
                title: '详情',
                dataIndex: 'details',
                key: 'details'
            }
        ];

        return (
            <div>
                <Alert
                    message="SQL注入测试结果"
                    description={`发现 ${results.vulnerabilities.length} 个SQL注入漏洞`}
                    type={results.vulnerabilities.length > 0 ? 'error' : 'success'}
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Table
                    columns={columns}
                    dataSource={results.vulnerabilities}
                    rowKey={(record, index) => `${record.target}-${index}`}
                    size="small"
                />
            </div>
        );
    };

    const renderPermissionTestResults = () => {
        const results = testResults.permissionTest;
        if (!results) return null;

        const columns = [
            {
                title: '角色',
                dataIndex: 'role',
                key: 'role'
            },
            {
                title: '资源',
                dataIndex: 'resource',
                key: 'resource'
            },
            {
                title: '操作',
                dataIndex: 'operation',
                key: 'operation'
            },
            {
                title: '详情',
                dataIndex: 'details',
                key: 'details'
            }
        ];

        return (
            <div>
                <Alert
                    message="权限测试结果"
                    description={`发现 ${results.violations.length} 个权限问题`}
                    type={results.violations.length > 0 ? 'error' : 'success'}
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Table
                    columns={columns}
                    dataSource={results.violations}
                    rowKey={(record, index) => `${record.role}-${record.resource}-${index}`}
                    size="small"
                />
            </div>
        );
    };

    return (
        <Card title="安全测试">
            <Tabs defaultActiveKey="xssTest">
                <TabPane
                    tab={
                        <span>
                            <BugOutlined />
                            XSS测试
                        </span>
                    }
                    key="xssTest"
                >
                    <Button
                        type="primary"
                        onClick={() => startTest('xssTest')}
                        loading={loading && activeTest === 'xssTest'}
                        style={{ marginBottom: 16 }}
                    >
                        开始XSS测试
                    </Button>
                    {renderXSSTestResults()}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <SafetyCertificateOutlined />
                            CSRF测试
                        </span>
                    }
                    key="csrfTest"
                >
                    <Button
                        type="primary"
                        onClick={() => startTest('csrfTest')}
                        loading={loading && activeTest === 'csrfTest'}
                        style={{ marginBottom: 16 }}
                    >
                        开始CSRF测试
                    </Button>
                    {renderCSRFTestResults()}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <DatabaseOutlined />
                            SQL注入测试
                        </span>
                    }
                    key="sqlInjectionTest"
                >
                    <Button
                        type="primary"
                        onClick={() => startTest('sqlInjectionTest')}
                        loading={loading && activeTest === 'sqlInjectionTest'}
                        style={{ marginBottom: 16 }}
                    >
                        开始SQL注入测试
                    </Button>
                    {renderSQLInjectionTestResults()}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <LockOutlined />
                            权限测试
                        </span>
                    }
                    key="permissionTest"
                >
                    <Button
                        type="primary"
                        onClick={() => startTest('permissionTest')}
                        loading={loading && activeTest === 'permissionTest'}
                        style={{ marginBottom: 16 }}
                    >
                        开始权限测试
                    </Button>
                    {renderPermissionTestResults()}
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default SecurityTest;
