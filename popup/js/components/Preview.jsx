import React, { useRef, useEffect, useState } from 'react';
import { Card, Button, Dropdown, Space, Tooltip, Progress, message } from 'antd';
import {
    DownloadOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    FullscreenOutlined,
    LoadingOutlined,
    CameraOutlined
} from '@ant-design/icons';
import ShareButton from './ShareButton';

const Preview = ({ data, exportManager }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [scale, setScale] = useState(1);
    const [exporting, setExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    // 导出选项
    const exportItems = [
        {
            key: 'png',
            label: '导出PNG',
            icon: <DownloadOutlined />,
        },
        {
            key: 'jpg',
            label: '导出JPG',
            icon: <DownloadOutlined />,
        },
        {
            key: 'webp',
            label: '导出WEBP',
            icon: <DownloadOutlined />,
        },
        {
            type: 'divider',
        },
        {
            key: 'batch',
            label: '批量导出',
            icon: <CameraOutlined />,
        },
    ];

    // 更新预览
    useEffect(() => {
        if (data && canvasRef.current) {
            renderPreview();
        }
    }, [data, scale]);

    // 渲染预览
    const renderPreview = async () => {
        if (!data) return;

        setLoading(true);
        try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // 设置画布尺寸
            const container = containerRef.current;
            const { width, height } = container.getBoundingClientRect();
            canvas.width = width * scale;
            canvas.height = height * scale;

            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 应用样式
            const { text, style } = data;
            applyStyle(ctx, style);

            // 绘制文本
            drawText(ctx, text, style);

            // 绘制水印
            if (style.effects.watermark) {
                drawWatermark(ctx, style.effects.watermark);
            }
        } catch (error) {
            console.error('Preview rendering failed:', error);
            message.error('预览渲染失败');
        } finally {
            setLoading(false);
        }
    };

    // 应用样式
    const applyStyle = (ctx, style) => {
        const { background, effects } = style;

        // 绘制背景
        if (background.type === 'gradient') {
            const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
            gradient.addColorStop(0, background.gradient.start);
            gradient.addColorStop(1, background.gradient.end);
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = background.color;
        }
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // 应用阴影
        if (effects.shadow) {
            ctx.shadowColor = effects.shadow.color;
            ctx.shadowBlur = parseInt(effects.shadow.blur);
            ctx.shadowOffsetX = parseInt(effects.shadow.x);
            ctx.shadowOffsetY = parseInt(effects.shadow.y);
        }

        // 应用边框
        if (effects.border) {
            ctx.strokeStyle = effects.border.color;
            ctx.lineWidth = parseInt(effects.border.width);
            ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    };

    // 绘制文本
    const drawText = (ctx, text, style) => {
        const { font } = style;
        ctx.font = `${font.weight} ${font.size} ${font.family}`;
        ctx.fillStyle = font.color;
        ctx.textAlign = font.align;
        ctx.textBaseline = 'middle';

        // 文本换行处理
        const lines = wrapText(ctx, text, ctx.canvas.width - 40);
        const lineHeight = parseFloat(font.lineHeight);
        const totalHeight = lines.length * lineHeight;
        const startY = (ctx.canvas.height - totalHeight) / 2;

        lines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            ctx.fillText(line, ctx.canvas.width / 2, y);
        });
    };

    // 文本换行
    const wrapText = (ctx, text, maxWidth) => {
        const words = text.split('');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });

        lines.push(currentLine);
        return lines;
    };

    // 绘制水印
    const drawWatermark = (ctx, watermark) => {
        const { text, font, color, opacity } = watermark;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(text, ctx.canvas.width - 10, ctx.canvas.height - 10);
        ctx.restore();
    };

    // 处理导出
    const handleExport = async ({ key }) => {
        if (!data) return;

        setExporting(true);
        setExportProgress(0);

        try {
            if (key === 'batch') {
                // 批量导出
                const results = await exportManager.batchExport(
                    [data],
                    { format: 'png', quality: 0.9 },
                    (progress) => setExportProgress(progress * 100)
                );

                if (results.some(r => !r.success)) {
                    message.warning('部分导出失败');
                } else {
                    message.success('批量导出完成');
                }
            } else {
                // 单张导出
                await exportManager.exportImage(data, {
                    format: key,
                    quality: 0.9,
                    filename: `quote-card-${Date.now()}`
                });
                message.success('导出成功');
            }
        } catch (error) {
            console.error('Export failed:', error);
            message.error('导出失败');
        } finally {
            setExporting(false);
            setExportProgress(0);
        }
    };

    // 缩放控制
    const handleZoom = (delta) => {
        const newScale = Math.max(0.5, Math.min(2, scale + delta));
        setScale(newScale);
    };

    return (
        <Card
            className="preview-card"
            title="预览"
            extra={
                <Space>
                    <ShareButton
                        data={{
                            text: data.text,
                            image: canvasRef.current?.toDataURL()
                        }}
                        className="preview-share-button"
                    />
                    <Tooltip title="缩小">
                        <Button
                            icon={<ZoomOutOutlined />}
                            onClick={() => handleZoom(-0.1)}
                            disabled={scale <= 0.5}
                        />
                    </Tooltip>
                    <Tooltip title="放大">
                        <Button
                            icon={<ZoomInOutlined />}
                            onClick={() => handleZoom(0.1)}
                            disabled={scale >= 2}
                        />
                    </Tooltip>
                    <Tooltip title="重置">
                        <Button
                            icon={<FullscreenOutlined />}
                            onClick={() => setScale(1)}
                        />
                    </Tooltip>
                    <Dropdown
                        menu={{
                            items: exportItems,
                            onClick: handleExport
                        }}
                        disabled={!data || loading || exporting}
                    >
                        <Button type="primary" icon={<DownloadOutlined />}>
                            导出
                        </Button>
                    </Dropdown>
                </Space>
            }
        >
            <div className="preview-container" ref={containerRef}>
                {loading && (
                    <div className="preview-loading">
                        <LoadingOutlined />
                        <span>渲染中...</span>
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    className="preview-canvas"
                    style={{
                        transform: `scale(${1 / scale})`,
                        opacity: loading ? 0.5 : 1
                    }}
                />
                {exporting && (
                    <div className="preview-progress">
                        <Progress
                            type="circle"
                            percent={exportProgress}
                            width={80}
                        />
                        <span>导出中...</span>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default Preview;
