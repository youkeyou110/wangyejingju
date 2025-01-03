import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Modal,
    Upload,
    message,
    Input,
    Tooltip,
    Popconfirm,
    Select
} from 'antd';
import {
    PlusOutlined,
    UploadOutlined,
    DownloadOutlined,
    EditOutlined,
    DeleteOutlined,
    CopyOutlined,
    EyeOutlined,
    TagOutlined,
    SearchOutlined,
    SortAscendingOutlined
} from '@ant-design/icons';
import { TemplateManager } from '../managers';

const { Search } = Input;
const { Option } = Select;

const TemplateSettings = ({ settings, onUpdate }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const templateManager = new TemplateManager();

    // 加载模板数据
    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const allTemplates = await templateManager.getAllTemplates();
            setTemplates(allTemplates);
        } catch (error) {
            console.error('Failed to load templates:', error);
            message.error('加载模板失败');
        } finally {
            setLoading(false);
        }
    };

    // 表格列定义
    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <span>{text}</span>
                    {record.tags?.map(tag => (
                        <Tag key={tag} color="blue">
                            {tag}
                        </Tag>
                    ))}
                </Space>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: type => (
                <Tag color={
                    type === 'preset' ? 'green' :
                    type === 'custom' ? 'blue' :
                    'purple'
                }>
                    {type === 'preset' ? '预设' :
                     type === 'custom' ? '自定义' :
                     '市场'}
                </Tag>
            ),
            filters: [
                { text: '预设', value: 'preset' },
                { text: '自定义', value: 'custom' },
                { text: '市场', value: 'market' }
            ],
            onFilter: (value, record) => record.type === value
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            render: category => (
                <Tag color="orange">{category}</Tag>
            ),
            filters: [
                { text: '引用', value: 'quote' },
                { text: '诗歌', value: 'poetry' },
                { text: '智慧', value: 'wisdom' },
                { text: '励志', value: 'motivation' }
            ],
            onFilter: (value, record) => record.category === value
        },
        {
            title: '评分',
            dataIndex: 'rating',
            key: 'rating',
            width: 100,
            sorter: (a, b) => a.rating - b.rating
        },
        {
            title: '更新时间',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 160,
            sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Tooltip title="预览">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handlePreview(record)}
                        />
                    </Tooltip>
                    {record.type === 'custom' && (
                        <>
                            <Tooltip title="编辑">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEdit(record)}
                                />
                            </Tooltip>
                            <Tooltip title="删除">
                                <Popconfirm
                                    title="确定要删除这个模板吗？"
                                    onConfirm={() => handleDelete(record)}
                                >
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                    />
                                </Popconfirm>
                            </Tooltip>
                        </>
                    )}
                    <Tooltip title="复制">
                        <Button
                            type="text"
                            icon={<CopyOutlined />}
                            onClick={() => handleCopy(record)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    // 处理预览
    const handlePreview = (template) => {
        setPreviewTemplate(template);
        setPreviewVisible(true);
    };

    // 处理编辑
    const handleEdit = (template) => {
        setEditingTemplate(template);
        setEditModalVisible(true);
    };

    // 处理删除
    const handleDelete = async (template) => {
        try {
            await templateManager.deleteTemplate(template.id);
            message.success('删除成功');
            loadTemplates();
        } catch (error) {
            console.error('Failed to delete template:', error);
            message.error('删除失败');
        }
    };

    // 处理复制
    const handleCopy = async (template) => {
        try {
            const copy = {
                ...template,
                id: undefined,
                name: `${template.name} (副本)`,
                type: 'custom'
            };
            await templateManager.importTemplate(copy);
            message.success('复制成功');
            loadTemplates();
        } catch (error) {
            console.error('Failed to copy template:', error);
            message.error('复制失败');
        }
    };

    // 处理导入
    const handleImport = async (file) => {
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const template = JSON.parse(e.target.result);
                    await templateManager.importTemplate(template);
                    message.success('导入成功');
                    loadTemplates();
                } catch (error) {
                    message.error('导入失败：无效的模板格式');
                }
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('Failed to import template:', error);
            message.error('导入失败');
        }
        return false;
    };

    // 处理导出
    const handleExport = async (templateIds) => {
        try {
            const templates = templateIds.map(id =>
                templateManager.exportTemplate(id)
            );

            // 创建下载
            const blob = new Blob([JSON.stringify(templates, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `templates_${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);

            message.success('导出成功');
        } catch (error) {
            console.error('Failed to export templates:', error);
            message.error('导出失败');
        }
    };

    // 处理搜索
    const handleSearch = (value) => {
        setSearchText(value);
    };

    // 处理排序
    const handleSort = (type) => {
        const sorted = [...templates].sort((a, b) => {
            switch (type) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'rating':
                    return b.rating - a.rating;
                case 'updated':
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                default:
                    return 0;
            }
        });
        setTemplates(sorted);
    };

    return (
        <div className="template-settings">
            {/* 工具栏 */}
            <Card className="settings-card">
                <Space className="template-toolbar">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleEdit(null)}
                    >
                        新建模板
                    </Button>
                    <Upload
                        accept=".json"
                        showUploadList={false}
                        beforeUpload={handleImport}
                    >
                        <Button icon={<UploadOutlined />}>
                            导入模板
                        </Button>
                    </Upload>
                    <Button
                        icon={<DownloadOutlined />}
                        disabled={selectedRows.length === 0}
                        onClick={() => handleExport(selectedRows.map(r => r.id))}
                    >
                        导出选中
                    </Button>
                    <div className="template-search">
                        <Search
                            placeholder="搜索模板..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 200 }}
                        />
                    </div>
                    <Select
                        placeholder="排序方式"
                        style={{ width: 120 }}
                        onChange={handleSort}
                    >
                        <Option value="name">按名称</Option>
                        <Option value="rating">按评分</Option>
                        <Option value="updated">按更新时间</Option>
                    </Select>
                </Space>
            </Card>

            {/* 模板列表 */}
            <Card className="settings-card">
                <Table
                    columns={columns}
                    dataSource={templates.filter(t =>
                        t.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        t.tags?.some(tag =>
                            tag.toLowerCase().includes(searchText.toLowerCase())
                        )
                    )}
                    rowKey="id"
                    rowSelection={{
                        onChange: (_, selectedRows) => setSelectedRows(selectedRows)
                    }}
                    loading={loading}
                />
            </Card>

            {/* 预览模态框 */}
            <Modal
                title="模板预览"
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={null}
                width={800}
            >
                {previewTemplate && (
                    <div className="template-preview">
                        {/* 预览内容 */}
                    </div>
                )}
            </Modal>

            {/* 编辑模态框 */}
            <Modal
                title={editingTemplate ? "编辑模板" : "新建模板"}
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                width={800}
                destroyOnClose
            >
                {/* 编辑表单 */}
            </Modal>
        </div>
    );
};

export default TemplateSettings;
