import React, { useRef, useEffect } from 'react';
import dragManager from '../managers/DragManager';

const Draggable = ({
    children,
    handle,
    bounds,
    grid,
    onStart,
    onDrag,
    onEnd,
    className,
    style,
    ...props
}) => {
    const elementRef = useRef(null);
    const handleRef = useRef(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const cleanup = dragManager.init(elementRef.current, {
            handle: handleRef.current || elementRef.current,
            bounds,
            grid,
            onStart,
            onDrag,
            onEnd
        });

        return cleanup;
    }, [bounds, grid, onStart, onDrag, onEnd]);

    return (
        <div
            ref={elementRef}
            className={`draggable ${className || ''}`}
            style={{
                cursor: 'move',
                ...style
            }}
            draggable="true"
            {...props}
        >
            {handle ? (
                <div ref={handleRef} className="drag-handle">
                    {handle}
                </div>
            ) : null}
            {children}
        </div>
    );
};

export default Draggable;
