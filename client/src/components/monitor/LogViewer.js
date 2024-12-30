import React, { useState, useEffect } from 'react';
import { Table, Select, DatePicker, Space, Button } from 'antd';
import { getSystemLogs } from '../../services/monitor.service';

const { Option } = Select;
const { RangePicker } = DatePicker;

const LogViewer = () => {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [filters, setFilters] = useState({
        level: null,
        startTime: null,
        endTime: null
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 50,
        total: 0
    });

    useEffect(() => {
        fetchLogs();
    }, [filters, pagination.current]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await getSystemLogs({
                ...filters,
                page: pagination.current,
                limit: pagination.pageSize
            });
            setLogs(data.logs);
            setPagination({
                ...pagination,
                total: data.total
            });
        } catch (error) {
            console.error('获取日志失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (dates) => {
        setFilters({
            ...filters,
            startTime: dates?.[0]?.toISOString(),
            endTime: dates?.[1]?.toISOString()
        });
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
            width: 100,
            render: (level) => (
                <span style={{
                    color: level === 'error' ? 'red' :
                           level === 'warn' ? 'orange' :
                           level === 'info' ? 'blue' : 'inherit'
                }}>
                    {level.toUpperCase()}
                </span>
            )
        },
        {
            title: '消息',
            dataIndex: 'message',
            key: 'message'
        },
        {
            title: '元数据',
            dataIndex: 'metadata',
            key: 'metadata',
            render: (metadata) => (
                <pre style={{ margin: 0 }}>
                    {JSON.stringify(metadata, null, 2)}
                </pre>
            )
        }
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Select
                    placeholder="选择日志级别"
                    style={{ width: 120 }}
                    allowClear
                    onChange={(value) => setFilters({ ...filters, level: value })}
                >
                    <Option value="error">ERROR</Option>
                    <Option value="warn">WARN</Option>
                    <Option value="info">INFO</Option>
                </Select>
                <RangePicker
                    showTime
                    onChange={handleDateRangeChange}
                />
                <Button type="primary" onClick={fetchLogs}>
                    刷新
                </Button>
            </Space>

            <Table
                columns={columns}
                dataSource={logs}
                rowKey={(record) => `${record.timestamp}_${record.level}`}
                pagination={pagination}
                loading={loading}
                onChange={(newPagination) => setPagination(newPagination)}
            />
        </div>
    );
};

export default LogViewer;
