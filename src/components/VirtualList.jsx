import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';

const VirtualList = ({
    data,
    itemHeight,
    containerHeight,
    renderItem,
    onScroll,
    overscan = 5
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef(null);
    const contentRef = useRef(null);

    // 计算可见区域的起始和结束索引
    const getVisibleRange = useCallback(() => {
        const start = Math.floor(scrollTop / itemHeight);
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const end = start + visibleCount;

        return {
            start: Math.max(0, start - overscan),
            end: Math.min(data.length, end + overscan)
        };
    }, [scrollTop, itemHeight, containerHeight, data.length, overscan]);

    // 处理滚动事件
    const handleScroll = useCallback(debounce((e) => {
        const { scrollTop } = e.target;
        setScrollTop(scrollTop);
        onScroll?.(scrollTop);
    }, 16), [onScroll]);

    // 获取需要渲染的项
    const getVisibleItems = () => {
        const { start, end } = getVisibleRange();
        return data.slice(start, end).map((item, index) => ({
            ...item,
            index: start + index,
            style: {
                position: 'absolute',
                top: (start + index) * itemHeight,
                width: '100%',
                height: itemHeight
            }
        }));
    };

    // 优化滚动性能
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 使用Intersection Observer优化滚动
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    const target = entry.target;
                    if (entry.isIntersecting) {
                        target.style.visibility = 'visible';
                    } else {
                        target.style.visibility = 'hidden';
                    }
                });
            },
            {
                root: container,
                rootMargin: `${overscan * itemHeight}px 0px`
            }
        );

        // 观察所有列表项
        const items = contentRef.current?.children || [];
        Array.from(items).forEach(item => observer.observe(item));

        return () => observer.disconnect();
    }, [scrollTop, itemHeight, overscan]);

    return (
        <div
            ref={containerRef}
            style={{
                height: containerHeight,
                overflow: 'auto',
                position: 'relative',
                willChange: 'transform'
            }}
            onScroll={handleScroll}
        >
            <div
                ref={contentRef}
                style={{
                    height: data.length * itemHeight,
                    position: 'relative'
                }}
            >
                {getVisibleItems().map(item => (
                    <div
                        key={item.id || item.index}
                        style={item.style}
                    >
                        {renderItem(item, item.index)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(VirtualList);
