import React from 'react';
import { Card, Switch, Select, Space, Typography } from 'antd';
import accessibilityManager from '../managers/AccessibilityManager';

const { Title } = Typography;
const { Option } = Select;

const AccessibilitySettings = () => {
    const [config, setConfig] = React.useState(accessibilityManager.getConfig());

    const handleChange = async (key, value) => {
        await accessibilityManager.updateConfig({ [key]: value });
        setConfig(accessibilityManager.getConfig());
    };

    return (
        <Card title="无障碍设置" className="accessibility-settings">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={5}>高对比度模式</Title>
                    <Switch
                        checked={config.highContrast}
                        onChange={value => handleChange('highContrast', value)}
                        aria-label="切换高对比度模式"
                    />
                </div>

                <div>
                    <Title level={5}>字体大小</Title>
                    <Select
                        value={config.fontSize}
                        onChange={value => handleChange('fontSize', value)}
                        style={{ width: 200 }}
                        aria-label="选择字体大小"
                    >
                        <Option value="normal">正常</Option>
                        <Option value="large">大</Option>
                        <Option value="larger">特大</Option>
                    </Select>
                </div>

                <div>
                    <Title level={5}>动画效果</Title>
                    <Switch
                        checked={config.animations}
                        onChange={value => handleChange('animations', value)}
                        aria-label="切换动画效果"
                    />
                </div>

                <div>
                    <Title level={5}>屏幕阅读器支持</Title>
                    <Switch
                        checked={config.screenReader}
                        onChange={value => handleChange('screenReader', value)}
                        aria-label="切换屏幕阅读器支持"
                    />
                </div>
            </Space>
        </Card>
    );
};

export default AccessibilitySettings;
