import React, { useEffect, useRef } from 'react';
import { Input, Card, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

const TextEditor = ({ value, onChange, maxLength = 500 }) => {
    const textAreaRef = useRef(null);

    // 自动获取焦点
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.focus();
        }
    }, []);

    // 处理文本变化
    const handleChange = (e) => {
        const text = e.target.value;
        if (text.length <= maxLength) {
            onChange(text);
        }
    };

    // 处理快捷键
    const handleKeyDown = (e) => {
        // Ctrl/Cmd + Enter 触发保存
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            // TODO: 触发保存事件
        }
    };

    return (
        <Card
            title={
                <div className="editor-header">
                    <EditOutlined /> 编辑文本
                </div>
            }
            className="text-editor"
        >
            <TextArea
                ref={textAreaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="在这里输入或粘贴文本..."
                autoSize={{ minRows: 6, maxRows: 12 }}
                className="editor-textarea"
            />
            <div className="editor-footer">
                <Text type="secondary">
                    {value.length} / {maxLength} 字
                </Text>
            </div>
        </Card>
    );
};

export default TextEditor;
