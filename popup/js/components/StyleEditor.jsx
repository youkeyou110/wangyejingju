import React, { useState, useCallback } from 'react';
import {
    Collapse,
    Slider,
    ColorPicker,
    Select,
    Radio,
    Switch,
    Input,
    Space,
    Upload,
    message
} from 'antd';
import {
    BgColorsOutlined,
    FontSizeOutlined,
    LayoutOutlined,
    StarOutlined,
    UploadOutlined,
    InboxOutlined
} from '@ant-design/icons';
import debounce from 'lodash/debounce';

const { Panel } = Collapse;
const { Option } = Select;
const { Dragger } = Upload;

const StyleEditor = ({ style, onChange }) => {
    const [currentStyle, setCurrentStyle] = useState(style);

    // 防抖处理样式更新
    const debouncedOnChange = useCallback(
        debounce((newStyle) => {
            onChange(newStyle);
        }, 300),
        []
    );

    // 更新样式
    const updateStyle = (path, value) => {
        const newStyle = { ...currentStyle };
        let target = newStyle;
        const keys = path.split('.');
        const lastKey = keys.pop();

        for (const key of keys) {
            target = target[key];
        }
        target[lastKey] = value;

        setCurrentStyle(newStyle);
        debouncedOnChange(newStyle);
    };

    // 处理背景图片上传
    const handleBackgroundUpload = async (file) => {
        try {
            // 这里可以添加图片处理逻辑
            const reader = new FileReader();
            reader.onload = (e) => {
                updateStyle('background.image', e.target.result);
                updateStyle('background.type', 'image');
            };
            reader.readAsDataURL(file);
            return false; // 阻止自动上传
        } catch (error) {
            message.error('图片上传失败');
            return false;
        }
    };

    // 处理图片上传
    const handleImageUpload = async (file) => {
        try {
            // 检查文件类型
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('只能上传图片文件！');
                return false;
            }

            // 检查文件大小（限制为2MB）
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('图片必须小于2MB！');
                return false;
            }

            // 读取图片文件
            const reader = new FileReader();
            reader.readAsDataURL(file);

            return new Promise((resolve, reject) => {
                reader.onload = () => {
                    // 创建图片对象以获取尺寸
                    const img = new Image();
                    img.src = reader.result;

                    img.onload = () => {
                        // 检查图片尺寸
                        if (img.width > 2000 || img.height > 2000) {
                            message.error('图片尺寸不能超过2000x2000！');
                            reject();
                            return;
                        }

                        // 更新背景设置
                        const newStyle = {
                            ...style,
                            background: {
                                ...style.background,
                                type: 'image',
                                image: reader.result
                            }
                        };

                        handleStyleChange(newStyle);
                        message.success('图片上传成功！');
                        resolve();
                    };

                    img.onerror = () => {
                        message.error('图片加载失败！');
                        reject();
                    };
                };

                reader.onerror = () => {
                    message.error('图片读取失败！');
                    reject();
                };
            });
        } catch (error) {
            console.error('Failed to upload image:', error);
            message.error('图片上传失败！');
            return false;
        }
    };

    return (
        <div className="style-editor">
            <Collapse defaultActiveKey={['background']}>
                {/* 背景设置 */}
                <Panel
                    header={
                        <Space>
                            <BgColorsOutlined />
                            背景设置
                        </Space>
                    }
                    key="background"
                >
                    <div className="style-section">
                        <div className="style-item">
                            <label>背景类型</label>
                            <Radio.Group
                                value={currentStyle.background.type}
                                onChange={(e) => updateStyle('background.type', e.target.value)}
                            >
                                <Radio.Button value="solid">纯色</Radio.Button>
                                <Radio.Button value="gradient">渐变</Radio.Button>
                                <Radio.Button value="image">图片</Radio.Button>
                            </Radio.Group>
                        </div>

                        {currentStyle.background.type === 'solid' && (
                            <div className="style-item">
                                <label>背景颜色</label>
                                <ColorPicker
                                    value={currentStyle.background.color}
                                    onChange={(color) => updateStyle('background.color', color.toHexString())}
                                />
                            </div>
                        )}

                        {currentStyle.background.type === 'gradient' && (
                            <>
                                <div className="style-item">
                                    <label>起始颜色</label>
                                    <ColorPicker
                                        value={currentStyle.background.gradient.start}
                                        onChange={(color) => updateStyle('background.gradient.start', color.toHexString())}
                                    />
                                </div>
                                <div className="style-item">
                                    <label>结束颜色</label>
                                    <ColorPicker
                                        value={currentStyle.background.gradient.end}
                                        onChange={(color) => updateStyle('background.gradient.end', color.toHexString())}
                                    />
                                </div>
                            </>
                        )}

                        {currentStyle.background.type === 'image' && (
                            <div className="style-item">
                                <label>背景图片</label>
                                <Dragger
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={handleImageUpload}
                                    className="upload-dragger"
                                >
                                    {currentStyle.background.image ? (
                                        <div className="image-preview">
                                            <img
                                                src={currentStyle.background.image}
                                                alt="背景图片"
                                                style={{ maxWidth: '100%', maxHeight: 200 }}
                                            />
                                            <div className="image-overlay">
                                                <p>点击或拖拽更换图片</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="upload-hint">
                                            <p className="ant-upload-drag-icon">
                                                <InboxOutlined />
                                            </p>
                                            <p className="ant-upload-text">
                                                点击或拖拽图片到此区域上传
                                            </p>
                                            <p className="ant-upload-hint">
                                                支持PNG、JPG、WEBP格式，大小不超过2MB
                                            </p>
                                        </div>
                                    )}
                                </Dragger>
                            </div>
                        )}
                    </div>
                </Panel>

                {/* 字体设置 */}
                <Panel
                    header={
                        <Space>
                            <FontSizeOutlined />
                            字体设置
                        </Space>
                    }
                    key="font"
                >
                    <div className="style-section">
                        <div className="style-item">
                            <label>字体</label>
                            <Select
                                value={currentStyle.font.family}
                                onChange={(value) => updateStyle('font.family', value)}
                            >
                                <Option value="Noto Sans SC">思源黑体</Option>
                                <Option value="LXGW WenKai">霞鹜文楷</Option>
                                <Option value="Ma Shan Zheng">马善政楷书</Option>
                            </Select>
                        </div>

                        <div className="style-item">
                            <label>字号</label>
                            <Slider
                                min={12}
                                max={72}
                                value={parseInt(currentStyle.font.size)}
                                onChange={(value) => updateStyle('font.size', `${value}px`)}
                            />
                        </div>

                        <div className="style-item">
                            <label>颜色</label>
                            <ColorPicker
                                value={currentStyle.font.color}
                                onChange={(color) => updateStyle('font.color', color.toHexString())}
                            />
                        </div>

                        <div className="style-item">
                            <label>行高</label>
                            <Slider
                                min={1}
                                max={3}
                                step={0.1}
                                value={parseFloat(currentStyle.font.lineHeight)}
                                onChange={(value) => updateStyle('font.lineHeight', value.toString())}
                            />
                        </div>

                        <div className="style-item">
                            <label>字间距</label>
                            <Slider
                                min={0}
                                max={10}
                                value={parseInt(currentStyle.font.letterSpacing)}
                                onChange={(value) => updateStyle('font.letterSpacing', `${value}px`)}
                            />
                        </div>
                    </div>
                </Panel>

                {/* 布局设置 */}
                <Panel
                    header={
                        <Space>
                            <LayoutOutlined />
                            布局设置
                        </Space>
                    }
                    key="layout"
                >
                    <div className="style-section">
                        <div className="style-item">
                            <label>内边距</label>
                            <Slider
                                min={0}
                                max={100}
                                value={parseInt(currentStyle.layout.padding)}
                                onChange={(value) => updateStyle('layout.padding', `${value}px`)}
                            />
                        </div>

                        <div className="style-item">
                            <label>圆角</label>
                            <Slider
                                min={0}
                                max={50}
                                value={parseInt(currentStyle.layout.borderRadius)}
                                onChange={(value) => updateStyle('layout.borderRadius', `${value}px`)}
                            />
                        </div>
                    </div>
                </Panel>

                {/* 特效设置 */}
                <Panel
                    header={
                        <Space>
                            <StarOutlined />
                            特效设置
                        </Space>
                    }
                    key="effects"
                >
                    <div className="style-section">
                        <div className="style-item">
                            <label>阴影</label>
                            <Switch
                                checked={!!currentStyle.effects.shadow}
                                onChange={(checked) => {
                                    if (checked) {
                                        updateStyle('effects.shadow', {
                                            x: '0',
                                            y: '2px',
                                            blur: '4px',
                                            color: 'rgba(0,0,0,0.1)'
                                        });
                                    } else {
                                        updateStyle('effects.shadow', null);
                                    }
                                }}
                            />
                        </div>

                        {currentStyle.effects.shadow && (
                            <>
                                <div className="style-item">
                                    <label>阴影颜色</label>
                                    <ColorPicker
                                        value={currentStyle.effects.shadow.color}
                                        onChange={(color) => updateStyle('effects.shadow.color', color.toRgbString())}
                                    />
                                </div>
                                <div className="style-item">
                                    <label>阴影模糊</label>
                                    <Slider
                                        min={0}
                                        max={50}
                                        value={parseInt(currentStyle.effects.shadow.blur)}
                                        onChange={(value) => updateStyle('effects.shadow.blur', `${value}px`)}
                                    />
                                </div>
                            </>
                        )}

                        <div className="style-item">
                            <label>边框</label>
                            <Switch
                                checked={!!currentStyle.effects.border}
                                onChange={(checked) => {
                                    if (checked) {
                                        updateStyle('effects.border', {
                                            width: '1px',
                                            style: 'solid',
                                            color: '#eee'
                                        });
                                    } else {
                                        updateStyle('effects.border', null);
                                    }
                                }}
                            />
                        </div>

                        {currentStyle.effects.border && (
                            <>
                                <div className="style-item">
                                    <label>边框颜色</label>
                                    <ColorPicker
                                        value={currentStyle.effects.border.color}
                                        onChange={(color) => updateStyle('effects.border.color', color.toHexString())}
                                    />
                                </div>
                                <div className="style-item">
                                    <label>边框宽度</label>
                                    <Slider
                                        min={1}
                                        max={10}
                                        value={parseInt(currentStyle.effects.border.width)}
                                        onChange={(value) => updateStyle('effects.border.width', `${value}px`)}
                                    />
                                </div>
                            </>
                        )}

                        {/* 水印设置 */}
                        <div className="style-item">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div className="style-item-header">
                                    <label>水印</label>
                                    <Switch
                                        checked={currentStyle.effects.watermark?.enabled}
                                        onChange={(checked) => updateStyle('effects.watermark.enabled', checked)}
                                    />
                                </div>

                                {currentStyle.effects.watermark?.enabled && (
                                    <>
                                        <div className="style-item">
                                            <label>水印类型</label>
                                            <Radio.Group
                                                value={currentStyle.effects.watermark.type}
                                                onChange={(e) => updateStyle('effects.watermark.type', e.target.value)}
                                            >
                                                <Radio.Button value="text">文本</Radio.Button>
                                                <Radio.Button value="image">图片</Radio.Button>
                                            </Radio.Group>
                                        </div>

                                        {currentStyle.effects.watermark.type === 'text' && (
                                            <>
                                                <div className="style-item">
                                                    <label>水印文本</label>
                                                    <Input
                                                        value={currentStyle.effects.watermark.text}
                                                        onChange={(e) => updateStyle('effects.watermark.text', e.target.value)}
                                                        placeholder="请输入水印文本"
                                                    />
                                                </div>

                                                <div className="style-item">
                                                    <label>字体</label>
                                                    <Select
                                                        value={currentStyle.effects.watermark.font}
                                                        onChange={(value) => updateStyle('effects.watermark.font', value)}
                                                    >
                                                        <Option value="Noto Sans SC">思源黑体</Option>
                                                        <Option value="LXGW WenKai">霞鹜文楷</Option>
                                                        <Option value="Ma Shan Zheng">马善政楷书</Option>
                                                    </Select>
                                                </div>

                                                <div className="style-item">
                                                    <label>字体大小</label>
                                                    <Slider
                                                        min={12}
                                                        max={48}
                                                        value={currentStyle.effects.watermark.fontSize}
                                                        onChange={(value) => updateStyle('effects.watermark.fontSize', value)}
                                                    />
                                                </div>

                                                <div className="style-item">
                                                    <label>颜色</label>
                                                    <ColorPicker
                                                        value={currentStyle.effects.watermark.color}
                                                        onChange={(color) => updateStyle('effects.watermark.color', color.toHexString())}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {currentStyle.effects.watermark.type === 'image' && (
                                            <div className="style-item">
                                                <label>水印图片</label>
                                                <Upload
                                                    accept="image/*"
                                                    showUploadList={false}
                                                    beforeUpload={handleWatermarkUpload}
                                                    className="watermark-upload"
                                                >
                                                    {currentStyle.effects.watermark.image ? (
                                                        <div className="watermark-preview">
                                                            <img
                                                                src={currentStyle.effects.watermark.image}
                                                                alt="水印图片"
                                                                style={{ maxWidth: '100%', maxHeight: 100 }}
                                                            />
                                                            <div className="watermark-overlay">
                                                                <p>点击更换图片</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="upload-button">
                                                            <UploadOutlined />
                                                            <span>上传水印图片</span>
                                                        </div>
                                                    )}
                                                </Upload>
                                            </div>
                                        )}

                                        <div className="style-item">
                                            <label>不透明度</label>
                                            <Slider
                                                min={0}
                                                max={1}
                                                step={0.1}
                                                value={currentStyle.effects.watermark.opacity}
                                                onChange={(value) => updateStyle('effects.watermark.opacity', value)}
                                                marks={{
                                                    0: '透明',
                                                    0.5: '半透明',
                                                    1: '不透明'
                                                }}
                                            />
                                        </div>

                                        <div className="style-item">
                                            <label>旋转角度</label>
                                            <Slider
                                                min={-180}
                                                max={180}
                                                value={currentStyle.effects.watermark.rotate}
                                                onChange={(value) => updateStyle('effects.watermark.rotate', value)}
                                                marks={{
                                                    '-180': '-180°',
                                                    0: '0°',
                                                    180: '180°'
                                                }}
                                            />
                                        </div>

                                        <div className="style-item">
                                            <label>重复模式</label>
                                            <Radio.Group
                                                value={currentStyle.effects.watermark.repeat}
                                                onChange={(e) => updateStyle('effects.watermark.repeat', e.target.value)}
                                            >
                                                <Radio.Button value="none">不重复</Radio.Button>
                                                <Radio.Button value="repeat">重复</Radio.Button>
                                                <Radio.Button value="repeat-x">横向重复</Radio.Button>
                                                <Radio.Button value="repeat-y">纵向重复</Radio.Button>
                                            </Radio.Group>
                                        </div>

                                        <div className="style-item">
                                            <label>位置</label>
                                            <Select
                                                value={currentStyle.effects.watermark.position}
                                                onChange={(value) => updateStyle('effects.watermark.position', value)}
                                            >
                                                <Option value="center">居中</Option>
                                                <Option value="top-left">左上角</Option>
                                                <Option value="top-right">右上角</Option>
                                                <Option value="bottom-left">左下角</Option>
                                                <Option value="bottom-right">右下角</Option>
                                            </Select>
                                        </div>
                                    </>
                                )}
                            </Space>
                        </div>
                    </div>
                </Panel>
            </Collapse>
        </div>
    );
};

export default StyleEditor;
