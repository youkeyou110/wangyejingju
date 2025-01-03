import React, { useEffect, useState } from 'react';
import { Card, Table, Tabs, Alert, Progress, Button, Space, Tag } from 'antd';
import {
    SecurityScanOutlined,
    BugOutlined,
    SafetyCertificateOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import securityAuditManager from '../managers/SecurityAuditManager';

const { TabPane } = Tabs;

const SecurityAudit = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadReport();
        securityAuditManager.on('auditComplete', handleAuditComplete);

        return () => {
            securityAuditManager.off('auditComplete', handleAuditComplete);
        };
    }, []);

    const loadReport = async () => {
        setLoading(true);
        try {
            const report = securityAuditManager.getAuditReport();
            if (report) {
                setReport(report);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAuditComplete = (newReport) => {
        setReport(newReport);
        setLoading(false);
    };

    const startAudit = async () => {
        setLoading(true);
        try {
            await securityAuditManager.runFullAudit();
        } catch (error) {
            console.error('Audit failed:', error);
        }
    };

    const renderSeverityTag = (severity) => {
        const colors = {
            critical: 'red',
            high: 'orange',
            medium: 'yellow',
            low: 'blue',
            info: 'green'
        };

        return (
            <Tag color={colors[severity]}>
                {severity.toUpperCase()}
            </Tag>
        );
    };

    const renderCodeAudit = () => {
        if (!report?.codeAudit) return null;

        const columns = [
            {
                title: '问题',
                dataIndex: 'description',
                key: 'description'
            },
            {
                title: '严重程度',
                dataIndex: 'severity',
                key: 'severity',
                render: renderSeverityTag
            },
            {
                title: '位置',
                dataIndex: 'location',
                key: 'location'
            },
            {
                title: '建议',
                dataIndex: 'recommendation',
                key: 'recommendation'
            }
        ];

        return (
            <div>
                <Alert
                    message={`发现 ${report.codeAudit.issues.length} 个代码问题`}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Table
                    columns={columns}
                    dataSource={report.codeAudit.issues}
                    rowKey="id"
                    size="small"
                />
            </div>
        );
    };

    const renderDependencyCheck = () => {
        if (!report?.dependencyCheck) return null;

        const columns = [
            {
                title: '依赖包',
                dataIndex: 'package',
                key: 'package'
            },
            {
                title: '当前版本',
                dataIndex: 'currentVersion',
                key: 'currentVersion'
            },
            {
                title: '漏洞',
                dataIndex: 'vulnerability',
                key: 'vulnerability'
            },
            {
                title: '严重程度',
                dataIndex: 'severity',
                key: 'severity',
                render: renderSeverityTag
            },
            {
                title: '建议版本',
                dataIndex: 'recommendedVersion',
                key: 'recommendedVersion'
            }
        ];

        return (
            <div>
                <Alert
                    message={`发现 ${report.dependencyCheck.vulnerabilities.length} 个依赖问题`}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Table
                    columns={columns}
                    dataSource={report.dependencyCheck.vulnerabilities}
                    rowKey="id"
                    size="small"
                />
            </div>
        );
    };

    const renderVulnerabilityScan = () => {
        if (!report?.vulnerabilityScan) return null;

        const columns = [
            {
                title: '漏洞',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: '类型',
                dataIndex: 'type',
                key: 'type'
            },
            {
                title: '严重程度',
                dataIndex: 'severity',
                key: 'severity',
                render: renderSeverityTag
            },
            {
                title: '描述',
                dataIndex: 'description',
                key: 'description'
            },
            {
                title: '修复建议',
                dataIndex: 'remediation',
                key: 'remediation'
            }
        ];

        return (
            <div>
                <Alert
                    message={`发现 ${report.vulnerabilityScan.vulnerabilities.length} 个安全漏洞`}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Table
                    columns={columns}
                    dataSource={report.vulnerabilityScan.vulnerabilities}
                    rowKey="id"
                    size="small"
                />
            </div>
        );
    };

    return (
        <Card
            title="安全审计"
            extra={
                <Space>
                    <Button
                        type="primary"
                        icon={<SecurityScanOutlined />}
                        loading={loading}
                        onClick={startAudit}
                    >
                        开始审计
                    </Button>
                </Space>
            }
        >
            <Tabs defaultActiveKey="code">
                <TabPane
                    tab={
                        <span>
                            <BugOutlined />
                            代码审计
                        </span>
                    }
                    key="code"
                >
                    {renderCodeAudit()}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <SafetyCertificateOutlined />
                            依赖检查
                        </span>
                    }
                    key="dependency"
                >
                    {renderDependencyCheck()}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <ExclamationCircleOutlined />
                            漏洞扫描
                        </span>
                    }
                    key="vulnerability"
                >
                    {renderVulnerabilityScan()}
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default SecurityAudit;
