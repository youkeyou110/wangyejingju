import React, { useState, useEffect } from 'react';
import {
    Button,
    Tooltip,
    Space,
    Dropdown,
    Menu,
    Badge
} from 'antd';
import {
    UndoOutlined,
    RedoOutlined,
    SaveOutlined,
    DownloadOutlined,
    CopyOutlined,
    DeleteOutlined,
    SettingOutlined,
    DragOutlined,
    EyeOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';
import Draggable from './Draggable';
import historyManager from '../managers/HistoryManager';

const QuickToolbar = ({
    onUndo,
    onRedo,
    onSave,
    onExport,
    onCopy,
    onDelete,
    onPreview,
    onSettings,
    className,
    ...props
}) => {
    const [collapsed, setCollapsed] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // 监听历史变化
    useEffect(() => {
        return historyManager.onChange(({ canUndo, canRedo }) => {
            setCanUndo(canUndo);
            setCanRedo(canRedo);
        });
    }, []);

    // 处理拖动
    const handleDrag = (_, position) => {
        setPosition(position);
    };

    // 工具栏菜单
    const menu = (
        <Menu>
            <Menu.Item key="preview" icon={<EyeOutlined />} onClick={onPreview}>
                预览 (P)
            </Menu.Item>
            <Menu.Item key="settings" icon={<SettingOutlined />} onClick={onSettings}>
                设置 (S)
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={onDelete}>
                删除 (Del)
            </Menu.Item>
        </Menu>
    );

    // 快捷键提示
    const shortcuts = {
        undo: '⌘Z',
        redo: '⌘⇧Z',
        save: '⌘S',
        export: '⌘E',
        copy: '⌘C',
        preview: '⌘P',
        settings: '⌘,'
    };

    // 渲染工具按钮
    const renderTools = () => (
        <Space direction={collapsed ? 'vertical' : 'horizontal'} size="small">
            <Tooltip title={`撤销 (${shortcuts.undo})`} placement="right">
                <Button
                    type="text"
                    icon={<UndoOutlined />}
                    onClick={onUndo}
                    disabled={!canUndo}
                />
            </Tooltip>
            <Tooltip title={`重做 (${shortcuts.redo})`} placement="right">
                <Button
                    type="text"
                    icon={<RedoOutlined />}
                    onClick={onRedo}
                    disabled={!canRedo}
                />
            </Tooltip>
            <Tooltip title={`保存 (${shortcuts.save})`} placement="right">
                <Button
                    type="text"
                    icon={<SaveOutlined />}
                    onClick={onSave}
                />
            </Tooltip>
            <Tooltip title={`导出 (${shortcuts.export})`} placement="right">
                <Button
                    type="text"
                    icon={<DownloadOutlined />}
                    onClick={onExport}
                />
            </Tooltip>
            <Tooltip title={`复制 (${shortcuts.copy})`} placement="right">
                <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={onCopy}
                />
            </Tooltip>
            <Dropdown overlay={menu} placement="bottomRight">
                <Button type="text" icon={<MenuFoldOutlined />} />
            </Dropdown>
        </Space>
    );

    return (
        <Draggable
            handle={<DragOutlined className="toolbar-handle" />}
            onDrag={handleDrag}
            position={position}
            className={`quick-toolbar ${collapsed ? 'collapsed' : ''} ${className || ''}`}
            {...props}
        >
            <div className="toolbar-content">
                <div className="toolbar-main">
                    {renderTools()}
                </div>
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    className="toolbar-collapse"
                />
            </div>
        </Draggable>
    );
};

export default QuickToolbar;
