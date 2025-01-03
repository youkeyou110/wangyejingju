import React, { useState, useEffect } from 'react';
import { Layout, Menu, Tabs, message } from 'antd';
import {
    SettingOutlined,
    KeyOutlined,
    AppstoreOutlined,
    DatabaseOutlined
} from '@ant-design/icons';

import PreferenceSettings from './PreferenceSettings';
import ShortcutSettings from './ShortcutSettings';
import TemplateSettings from './TemplateSettings';
import BackupSettings from './BackupSettings';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;

const Settings = () => {
    const [currentTab, setCurrentTab] = useState('preferences');
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);

    // 加载设置
    useEffect(() => {
        loadSettings();
    }, []);

    // 加载设置数据
    const loadSettings = async () => {
        try {
            const result = await chrome.storage.sync.get('settings');
            setSettings(result.settings || getDefaultSettings());
        } catch (error) {
            console.error('Failed to load settings:', error);
            message.error('加载设置失败');
        } finally {
            setLoading(false);
        }
    };

    // 保存设置
    const saveSettings = async (newSettings) => {
        try {
            await chrome.storage.sync.set({
                settings: {
                    ...settings,
                    ...newSettings,
                    updatedAt: new Date().toISOString()
                }
            });
            message.success('设置已保存');
            await loadSettings(); // 重新加载以确保数据同步
        } catch (error) {
            console.error('Failed to save settings:', error);
            message.error('保存设置失败');
        }
    };

    // 获取默认设置
    const getDefaultSettings = () => ({
        preferences: {
            theme: 'light',
            language: 'zh_CN',
            defaultTemplate: null,
            exportFormat: 'png',
            exportQuality: 0.9
        },
        shortcuts: {
            createCard: 'Ctrl+Shift+Q',
            quickExport: 'Ctrl+Shift+S'
        },
        templates: {
            sortBy: 'name',
            sortOrder: 'asc',
            showPreview: true
        },
        backup: {
            autoBackup: true,
            backupInterval: 'daily',
            maxBackups: 10
        }
    });

    // 处理标签页切换
    const handleTabChange = (key) => {
        setCurrentTab(key);
    };

    // 处理设置更新
    const handleSettingsUpdate = (section, values) => {
        saveSettings({
            [section]: {
                ...settings[section],
                ...values
            }
        });
    };

    if (loading) {
        return <div className="settings-loading">加载中...</div>;
    }

    return (
        <Layout className="settings-layout">
            <Sider width={200} className="settings-sider">
                <Menu
                    mode="inline"
                    selectedKeys={[currentTab]}
                    onClick={({ key }) => handleTabChange(key)}
                >
                    <Menu.Item key="preferences" icon={<SettingOutlined />}>
                        偏好设置
                    </Menu.Item>
                    <Menu.Item key="shortcuts" icon={<KeyOutlined />}>
                        快捷键配置
                    </Menu.Item>
                    <Menu.Item key="templates" icon={<AppstoreOutlined />}>
                        模板管理
                    </Menu.Item>
                    <Menu.Item key="backup" icon={<DatabaseOutlined />}>
                        数据备份
                    </Menu.Item>
                </Menu>
            </Sider>
            <Content className="settings-content">
                <div className="settings-container">
                    {currentTab === 'preferences' && (
                        <PreferenceSettings
                            settings={settings.preferences}
                            onUpdate={(values) => handleSettingsUpdate('preferences', values)}
                        />
                    )}
                    {currentTab === 'shortcuts' && (
                        <ShortcutSettings
                            settings={settings.shortcuts}
                            onUpdate={(values) => handleSettingsUpdate('shortcuts', values)}
                        />
                    )}
                    {currentTab === 'templates' && (
                        <TemplateSettings
                            settings={settings.templates}
                            onUpdate={(values) => handleSettingsUpdate('templates', values)}
                        />
                    )}
                    {currentTab === 'backup' && (
                        <BackupSettings
                            settings={settings.backup}
                            onUpdate={(values) => handleSettingsUpdate('backup', values)}
                        />
                    )}
                </div>
            </Content>
        </Layout>
    );
};

export default Settings;
