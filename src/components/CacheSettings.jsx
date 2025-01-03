import React, { useEffect, useState } from 'react';
import { Card, Form, InputNumber, Switch, Button, Statistic, Row, Col, Alert } from 'antd';
import { CloudOutlined, DatabaseOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import cacheManager from '../managers/CacheManager';

const CacheSettings = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 60000); // 每分钟更新一次
        return () => clearInterval(interval);
    }, []);

    const loadStats = async () => {
        const stats = await cacheManager.getStats();
        setStats(stats);
    };

    const handleClearCache = async () => {
        setLoading(true);
        try {
            await cacheManager.clear();
            await loadStats();
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = async (values) => {
        setLoading(true);
        try {
            Object.assign(cacheManager.config, values);
            await loadStats();
        } finally {
            setLoading(false);
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <Card title="缓存设置" loading={loading}>
            <Alert
                message="缓存配置"
                description="配置缓存策略可以提高应用性能，减少资源加载时间。"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Statistic
                        title="内存缓存数量"
                        value={stats?.memory.count || 0}
                        prefix={<DatabaseOutlined />}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title="内存缓存大小"
                        value={formatSize(stats?.memory.size || 0)}
                        prefix={<DatabaseOutlined />}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title="存储缓存数量"
                        value={stats?.storage.count || 0}
                        prefix={<CloudOutlined />}
                    />
                </Col>
            </Row>

            <Form
                form={form}
                layout="vertical"
                initialValues={cacheManager.config}
                onFinish={handleSaveConfig}
            >
                <Form.Item
                    label="最大内存缓存条目"
                    name="maxMemoryEntries"
                    rules={[{ required: true }]}
                >
                    <InputNumber min={100} max={10000} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    label="缓存过期时间(小时)"
                    name="maxAge"
                    rules={[{ required: true }]}
                >
                    <InputNumber
                        min={1}
                        max={72}
                        style={{ width: '100%' }}
                        formatter={value => `${value}小时`}
                        parser={value => value.replace('小时', '')}
                    />
                </Form.Item>

                <Form.Item
                    label="清理间隔(小时)"
                    name="cleanupInterval"
                    rules={[{ required: true }]}
                >
                    <InputNumber
                        min={1}
                        max={24}
                        style={{ width: '100%' }}
                        formatter={value => `${value}小时`}
                        parser={value => value.replace('小时', '')}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        保存配置
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleClearCache}
                        style={{ marginLeft: 8 }}
                    >
                        清空缓存
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadStats}
                        style={{ marginLeft: 8 }}
                    >
                        刷新统计
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default CacheSettings;
