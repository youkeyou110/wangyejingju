import React, { useCallback, useMemo, useRef } from 'react';
import { debounce, isEqual } from 'lodash';

const withOptimizedRender = (WrappedComponent, options = {}) => {
    const {
        debounceTime = 16,
        memoProps = [],
        shouldComponentUpdate = null
    } = options;

    return React.memo(function OptimizedComponent(props) {
        const prevPropsRef = useRef(props);

        // 防抖更新
        const debouncedUpdate = useCallback(
            debounce((newProps) => {
                prevPropsRef.current = newProps;
            }, debounceTime),
            []
        );

        // 记忆化props
        const memoizedProps = useMemo(() => {
            const memoized = {};
            memoProps.forEach(key => {
                memoized[key] = props[key];
            });
            return memoized;
        }, [props, ...memoProps]);

        // 自定义更新判断
        const shouldUpdate = useCallback((prevProps, nextProps) => {
            if (shouldComponentUpdate) {
                return shouldComponentUpdate(prevProps, nextProps);
            }
            return !isEqual(prevProps, nextProps);
        }, []);

        // 批量更新处理
        React.useLayoutEffect(() => {
            if (shouldUpdate(prevPropsRef.current, props)) {
                debouncedUpdate(props);
            }
        }, [props, shouldUpdate, debouncedUpdate]);

        return (
            <WrappedComponent
                {...props}
                {...memoizedProps}
                ref={props.forwardedRef}
            />
        );
    });
};

export default withOptimizedRender;
