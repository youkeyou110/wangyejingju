import React, { useRef, useEffect } from 'react';
import dragManager from '../managers/DragManager';

const DropZone = ({
    children,
    accept,
    onDrop,
    onDragEnter,
    onDragLeave,
    className,
    style,
    ...props
}) => {
    const elementRef = useRef(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const cleanup = dragManager.registerDropTarget(elementRef.current, {
            accept,
            onDrop,
            onDragEnter,
            onDragLeave
        });

        return cleanup;
    }, [accept, onDrop, onDragEnter, onDragLeave]);

    return (
        <div
            ref={elementRef}
            className={`drop-zone ${className || ''}`}
            style={{
                position: 'relative',
                ...style
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default DropZone;
