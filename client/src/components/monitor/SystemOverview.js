import React from 'react';
import { Row, Col, Statistic, Progress } from 'antd';
import { formatBytes, formatUptime } from '../../utils/format';

const SystemOverview = ({ data }) => {
    if (!data) return null;

    const { cpu, memory, uptime } = data;
    const memoryUsage = (memory.used / memory.total) * 100;

    return (
        <Row gutter={[16, 16]}>
            <Col span={6}>
                <Statistic
                    title="CPU 使用率"
                    value={cpu}
                    suffix="%"
                    precision={2}
                />
                <Progress
                    percent={cpu}
                    status={cpu > 80 ? 'exception' : 'normal'}
                    showInfo={false}
                />
            </Col>
            <Col span={6}>
                <Statistic
                    title="内存使用率"
                    value={memoryUsage}
                    suffix="%"
                    precision={2}
                />
                <Progress
                    percent={memoryUsage}
                    status={memoryUsage > 80 ? 'exception' : 'normal'}
                    showInfo={false}
                />
            </Col>
            <Col span={6}>
                <Statistic
                    title="总内存"
                    value={formatBytes(memory.total)}
                />
            </Col>
            <Col span={6}>
                <Statistic
                    title="运行时间"
                    value={formatUptime(uptime)}
                />
            </Col>
        </Row>
    );
};

export default SystemOverview;
