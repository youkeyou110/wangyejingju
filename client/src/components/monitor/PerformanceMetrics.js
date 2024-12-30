import React from 'react';
import { Line } from '@ant-design/charts';
import { Empty } from 'antd';

const PerformanceMetrics = ({ data, timeRange }) => {
    if (!data?.length) {
        return <Empty description="暂无数据" />;
    }

    const config = {
        data,
        xField: 'timestamp',
        yField: 'value',
        seriesField: 'type',
        point: {
            size: 4,
            shape: 'circle'
        },
        tooltip: {
            showCrosshairs: true,
            shared: true
        },
        legend: {
            position: 'top'
        },
        smooth: true,
        animation: {
            appear: {
                animation: 'path-in',
                duration: 1000
            }
        }
    };

    return <Line {...config} />;
};

export default PerformanceMetrics;
