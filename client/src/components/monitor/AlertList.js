import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, message } from 'antd';
import { getAlerts, updateAlertStatus } from '../../services/monitor.service';

const AlertList = () => {
    const [loading, setLoading] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        fetchAlerts();
    }, [pagination.current]);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const data = await getAlerts({
                page: pagination.current,
                limit: pagination.pageSize
            });
            setAlerts(data.alerts);
            setPagination({
                ...pagination,
                total: data.total
            });
        } catch (error) {
            message.error('获取告警列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (alertId, status) => {
        try {
            await updateAlertStatus(alertId, status);
            message.success('更新状态成功');
            fetchAlerts();
        } catch (error) {
            message.error('更新状态失败');
        }
    };

    const columns = [
        {
            title: '时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text) => new Date(text).toLocaleString()
        },
        {
            title: '级别',
            dataIndex: 'level',
            key: 'level',
            render: (level) => (
                <Tag color={
                    level === 'error' ? 'red' :
                    level === 'warning' ? 'orange' : 'blue'
                }>
                    {level.toUpperCase()}
                </Tag>
            )
        },
        {
            title: '消息',
            dataIndex: 'message',
            key: 'message'
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={
                    status === 'new' ? 'red' :
                    status === 'acknowledged' ? 'orange' : 'green'
                }>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    {record.status === 'new' && (
                        <Button
                            size="small"
                            onClick={() => handleStatusChange(record._id, 'acknowledged')}
                        >
                            确认
                        </Button>
                    )}
                    {record.status !== 'resolved' && (
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => handleStatusChange(record._id, 'resolved')}
                        >
                            解决
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={alerts}
            rowKey="_id"
            pagination={pagination}
            loading={loading}
            onChange={(newPagination) => setPagination(newPagination)}
        />
    );
};

export default AlertList;
