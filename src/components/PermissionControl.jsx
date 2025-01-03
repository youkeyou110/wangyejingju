import React, { useEffect, useState } from 'react';
import { Card, Table, Tabs, Button, Form, Input, Select, Tag, Space, Modal } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    SafetyCertificateOutlined,
    AuditOutlined
} from '@ant-design/icons';
import permissionManager from '../managers/PermissionManager';

const { TabPane } = Tabs;
const { Option } = Select;

const PermissionControl = () => {
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadData();
        setupListeners();

        return () => {
            removeListeners();
        };
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // 加载角色数据
            const roleData = Array.from(permissionManager.roles.values());
            setRoles(roleData);

            // 加载审计日志
            const logs = await permissionManager.getAuditLogs();
            setAuditLogs(logs);
        } finally {
            setLoading(false);
        }
    };

    const setupListeners = () => {
        permissionManager.on('roleAdded', handleRoleChange);
        permissionManager.on('roleUpdated', handleRoleChange);
        permissionManager.on('roleDeleted', handleRoleChange);
        permissionManager.on('userRoleAssigned', handleUserRoleChange);
        permissionManager.on('auditLogged', handleAuditLog);
    };

    const removeListeners = () => {
        permissionManager.off('roleAdded', handleRoleChange);
        permissionManager.off('roleUpdated', handleRoleChange);
        permissionManager.off('roleDeleted', handleRoleChange);
        permissionManager.off('userRoleAssigned', handleUserRoleChange);
        permissionManager.off('auditLogged', handleAuditLog);
    };

    const handleRoleChange = () => {
        const roleData = Array.from(permissionManager.roles.values());
        setRoles(roleData);
    };

    const handleUserRoleChange = () => {
        loadData();
    };

    const handleAuditLog = () => {
        loadData();
    };

    const handleAddRole = async (values) => {
        setLoading(true);
        try {
            await permissionManager.addRole(values.id, {
                name: values.name,
                description: values.description,
                permissions: values.permissions
            });
            form.resetFields();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (roleId, values) => {
        setLoading(true);
        try {
            await permissionManager.updateRole(roleId, values);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRole = async (roleId) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个角色吗？',
            onOk: async () => {
                setLoading(true);
                try {
                    await permissionManager.deleteRole(roleId);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const renderRoleManagement = () => {
        const columns = [
            {
                title: '角色ID',
                dataIndex: 'id',
                key: 'id'
            },
            {
                title: '角色名称',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: '描述',
                dataIndex: 'description',
                key: 'description'
            },
            {
                title: '权限',
                dataIndex: 'permissions',
                key: 'permissions',
                render: permissions => (
                    <Space wrap>
                        {permissions.map(perm => (
                            <Tag key={perm} color="blue">{perm}</Tag>
                        ))}
                    </Space>
                )
            },
            {
                title: '操作',
                key: 'action',
                render: (_, record) => (
                    <Space>
                        <Button
                            size="small"
                            onClick={() => handleUpdateRole(record.id, record)}
                        >
                            编辑
                        </Button>
                        <Button
                            size="small"
                            danger
                            onClick={() => handleDeleteRole(record.id)}
                        >
                            删除
                        </Button>
                    </Space>
                )
            }
        ];

        return (
            <div>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddRole}
                    style={{ marginBottom: 24 }}
                >
                    <Form.Item
                        name="id"
                        label="角色ID"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="角色名称"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="描述"
                    >
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item
                        name="permissions"
                        label="权限"
                        rules={[{ required: true }]}
                    >
                        <Select mode="multiple">
                            <Option value="*">所有权限</Option>
                            <Option value="user:manage">用户管理</Option>
                            <Option value="role:view">角色查看</Option>
                            <Option value="template:manage">模板管理</Option>
                            <Option value="style:manage">样式管理</Option>
                            <Option value="backup:manage">备份管理</Option>
                            <Option value="template:use">使用模板</Option>
                            <Option value="style:use">使用样式</Option>
                            <Option value="export:basic">基础导出</Option>
                            <Option value="template:view">查看模板</Option>
                            <Option value="style:view">查看样式</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            添加角色
                        </Button>
                    </Form.Item>
                </Form>

                <Table
                    columns={columns}
                    dataSource={roles}
                    rowKey="id"
                    loading={loading}
                />
            </div>
        );
    };

    const renderAuditLogs = () => {
        const columns = [
            {
                title: '时间',
                dataIndex: 'timestamp',
                key: 'timestamp',
                render: timestamp => new Date(timestamp).toLocaleString()
            },
            {
                title: '操作',
                dataIndex: 'action',
                key: 'action'
            },
            {
                title: '用户',
                dataIndex: 'userId',
                key: 'userId'
            },
            {
                title: '详情',
                dataIndex: 'details',
                key: 'details'
            }
        ];

        return (
            <Table
                columns={columns}
                dataSource={auditLogs}
                rowKey="timestamp"
                loading={loading}
            />
        );
    };

    return (
        <Card title="权限控制">
            <Tabs defaultActiveKey="roles">
                <TabPane
                    tab={
                        <span>
                            <TeamOutlined />
                            角色管理
                        </span>
                    }
                    key="roles"
                >
                    {renderRoleManagement()}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <UserOutlined />
                            用户权限
                        </span>
                    }
                    key="users"
                >
                    {/* 用户权限管理界面 */}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <SafetyCertificateOutlined />
                            访问控制
                        </span>
                    }
                    key="access"
                >
                    {/* 访问控制配置界面 */}
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <AuditOutlined />
                            操作审计
                        </span>
                    }
                    key="audit"
                >
                    {renderAuditLogs()}
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default PermissionControl;
