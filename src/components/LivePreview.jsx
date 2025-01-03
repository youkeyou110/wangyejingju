import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import {
    Card,
    Space,
    Button,
    Slider,
    Select,
    Tooltip,
    Spin
} from 'antd';
import {
    ZoomInOutlined,
    ZoomOutOutlined,
    ExpandOutlined,
    CompressOutlined,
    SyncOutlined,
    DesktopOutlined,
    MobileOutlined,
    TabletOutlined
} from '@ant-design/icons';

const { Option } = Select;

// 预设尺寸
const PRESET_SIZES = {
    desktop: { width: 1920, height: 1080, label: '桌面' },
    tablet: { width: 1024, height: 768, label: '平板' },
    mobile: { width: 375, height: 812, label: '手机' }
};

const LivePreview = ({
    content,
    style,
    onUpdate,
    className,
    ...props
}) => {
    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fullscreen, setFullscreen] = useState(false);
    const [deviceType, setDeviceType] = useState('desktop');
    const previewRef = useRef(null);
    const canvasRef = useRef(null);

    // 防抖更新
    const debouncedUpdate = useCallback(
        debounce(async (content, style) => {
            try {
                setLoading(true);
                setError(null);

                // 渲染预览
                await renderPreview(content, style);

                // 触发更新回调
                onUpdate?.();
            } catch (error) {
                console.error('Preview update failed:', error);
                setError('预览更新失败');
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    // 监听内容和样式变化
    useEffect(() => {
        debouncedUpdate(content, style);
    }, [content, style, debouncedUpdate]);

    // 渲染预览
    const renderPreview = async (content, style) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = PRESET_SIZES[deviceType];

        // 设置画布尺寸
        canvas.width = width;
        canvas.height = height;

        // 清空画布
        ctx.clearRect(0, 0, width, height);

        // 应用背景
        if (style.background) {
            if (style.background.type === 'solid') {
                ctx.fillStyle = style.background.color;
                ctx.fillRect(0, 0, width, height);
            } else if (style.background.type === 'gradient') {
                const gradient = ctx.createLinearGradient(0, 0, width, height);
                gradient.addColorStop(0, style.background.gradient.start);
                gradient.addColorStop(1, style.background.gradient.end);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            } else if (style.background.type === 'image') {
                const image = await loadImage(style.background.image);
                ctx.drawImage(image, 0, 0, width, height);
            }
        }

        // 应用文本样式
        ctx.font = `${style.font.weight} ${style.font.size} ${style.font.family}`;
        ctx.fillStyle = style.font.color;
        ctx.textAlign = style.font.align || 'center';
        ctx.textBaseline = 'middle';

        // 绘制文本
        const lines = content.split('\n');
        const lineHeight = parseInt(style.font.lineHeight) || 1.5;
        const totalHeight = lines.length * lineHeight * parseInt(style.font.size);
        const startY = (height - totalHeight) / 2;

        lines.forEach((line, index) => {
            const y = startY + index * lineHeight * parseInt(style.font.size);
            ctx.fillText(line, width / 2, y);
        });

        // 应用特效
        if (style.effects) {
            // 阴影
            if (style.effects.shadow) {
                ctx.shadowColor = style.effects.shadow.color;
                ctx.shadowBlur = parseInt(style.effects.shadow.blur);
                ctx.shadowOffsetX = parseInt(style.effects.shadow.x);
                ctx.shadowOffsetY = parseInt(style.effects.shadow.y);
            }

            // 边框
            if (style.effects.border) {
                ctx.strokeStyle = style.effects.border.color;
                ctx.lineWidth = parseInt(style.effects.border.width);
                ctx.strokeRect(0, 0, width, height);
            }

            // 水印
            if (style.effects.watermark?.enabled) {
                await applyWatermark(ctx, style.effects.watermark, width, height);
            }
        }
    };

    // 加载图片
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    // 应用水印
    const applyWatermark = async (ctx, watermark, width, height) => {
        ctx.save();

        // 设置透明度
        ctx.globalAlpha = watermark.opacity;

        // 设置旋转
        ctx.translate(width / 2, height / 2);
        ctx.rotate((watermark.rotate || 0) * Math.PI / 180);

        if (watermark.type === 'text') {
            // 文本水印
            ctx.font = `${watermark.fontSize}px ${watermark.font}`;
            ctx.fillStyle = watermark.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (watermark.repeat === 'none') {
                ctx.fillText(watermark.text, 0, 0);
            } else {
                // 重复水印
                const text = ctx.measureText(watermark.text);
                const spacing = text.width * 2;

                for (let x = -width; x < width; x += spacing) {
                    for (let y = -height; y < height; y += spacing) {
                        ctx.fillText(watermark.text, x, y);
                    }
                }
            }
        } else if (watermark.type === 'image' && watermark.image) {
            // 图片水印
            const image = await loadImage(watermark.image);
            const size = Math.min(width, height) * 0.2;

            if (watermark.repeat === 'none') {
                ctx.drawImage(image, -size/2, -size/2, size, size);
            } else {
                // 重复水印
                const spacing = size * 1.5;

                for (let x = -width; x < width; x += spacing) {
                    for (let y = -height; y < height; y += spacing) {
                        ctx.drawImage(image, x - size/2, y - size/2, size, size);
                    }
                }
            }
        }

        ctx.restore();
    };

    // 缩放控制
    const handleZoom = (delta) => {
        setScale(scale => {
            const newScale = scale + delta;
            return Math.max(0.1, Math.min(2, newScale));
        });
    };

    // 切换全屏
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            previewRef.current?.requestFullscreen();
            setFullscreen(true);
        } else {
            document.exitFullscreen();
            setFullscreen(false);
        }
    };

    // 切换设备类型
    const handleDeviceChange = (type) => {
        setDeviceType(type);
        debouncedUpdate(content, style);
    };

    return (
        <div
            ref={previewRef}
            className={`live-preview ${className || ''}`}
            {...props}
        >
            <Card
                title="实时预览"
                extra={
                    <Space>
                        <Select
                            value={deviceType}
                            onChange={handleDeviceChange}
                            style={{ width: 100 }}
                        >
                            {Object.entries(PRESET_SIZES).map(([key, { label }]) => (
                                <Option key={key} value={key}>
                                    {label}
                                </Option>
                            ))}
                        </Select>
                        <Tooltip title="缩小">
                            <Button
                                icon={<ZoomOutOutlined />}
                                onClick={() => handleZoom(-0.1)}
                                disabled={scale <= 0.1}
                            />
                        </Tooltip>
                        <Tooltip title="放大">
                            <Button
                                icon={<ZoomInOutlined />}
                                onClick={() => handleZoom(0.1)}
                                disabled={scale >= 2}
                            />
                        </Tooltip>
                        <Tooltip title={fullscreen ? '退出全屏' : '全屏预览'}>
                            <Button
                                icon={fullscreen ? <CompressOutlined /> : <ExpandOutlined />}
                                onClick={toggleFullscreen}
                            />
                        </Tooltip>
                    </Space>
                }
            >
                <div className="preview-container">
                    {loading && (
                        <div className="preview-loading">
                            <Spin tip="渲染中..." />
                        </div>
                    )}
                    {error && (
                        <div className="preview-error">
                            {error}
                        </div>
                    )}
                    <div
                        className="preview-content"
                        style={{
                            transform: `scale(${scale})`,
                            width: PRESET_SIZES[deviceType].width,
                            height: PRESET_SIZES[deviceType].height
                        }}
                    >
                        <canvas ref={canvasRef} />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default LivePreview;
