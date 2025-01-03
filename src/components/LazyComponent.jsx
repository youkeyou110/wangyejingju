import React, { Suspense } from 'react';
import { Spin } from 'antd';

const Loading = () => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin size="large" />
    </div>
);

export const lazyLoad = (importFunc) => {
    const LazyComponent = React.lazy(importFunc);

    return (props) => (
        <Suspense fallback={<Loading />}>
            <LazyComponent {...props} />
        </Suspense>
    );
};
