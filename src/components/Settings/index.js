import React from 'react';
import { Layout, Menu, Form, Switch, Input, Select, Button } from 'antd';
import { useTheme } from '../ThemeProvider';
import PreferenceSettings from './PreferenceSettings';
import ShortcutSettings from './ShortcutSettings';
import TemplateManager from './TemplateManager';
import BackupSettings from './BackupSettings';
import AccessibilitySettings from '../AccessibilitySettings';

const { Content, Sider } = Layout;

const Settings = () => {
    const { theme } = useTheme();
    const [currentSection, setCurrentSection] = React.useState('preferences');

    const renderContent = () => {
        switch (currentSection) {
            case 'preferences':
                return <PreferenceSettings />;
            case 'shortcuts':
                return <ShortcutSettings />;
            case 'templates':
                return <TemplateManager />;
            case 'backup':
                return <BackupSettings />;
            case 'accessibility':
                return <AccessibilitySettings />;
            default:
                return null;
        }
    };

    return (
        <Layout className="settings-container">
            <Sider width={200} theme={theme.key === 'dark' ? 'dark' : 'light'}>
                <Menu
                    mode="inline"
                    selectedKeys={[currentSection]}
                    onSelect={({ key }) => setCurrentSection(key)}
                >
                    <Menu.Item key="preferences">偏好设置</Menu.Item>
                    <Menu.Item key="shortcuts">快捷键</Menu.Item>
                    <Menu.Item key="templates">模板管理</Menu.Item>
                    <Menu.Item key="backup">数据备份</Menu.Item>
                    <Menu.Item key="accessibility">无障碍设置</Menu.Item>
                </Menu>
            </Sider>
            <Content className="settings-content">
                {renderContent()}
            </Content>
        </Layout>
    );
};

export default Settings;
