import React from 'react';
import {
    Form,
    Select,
    Switch,
    Radio,
    Slider,
    Card,
    Space,
    Divider,
    Typography
} from 'antd';
import {
    BulbOutlined,
    GlobalOutlined,
    ExportOutlined,
    SettingOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

const PreferenceSettings = ({ settings, onUpdate }) => {
    const [form] = Form.useForm();

    // 主题选项
    const themeOptions = [
        { label: '浅色', value: 'light' },
        { label: '深色', value: 'dark' },
        { label: '跟随系统', value: 'auto' }
    ];

    // 语言选项
    const languageOptions = [
        { label: '简体中文', value: 'zh_CN' },
        { label: '繁體中文', value: 'zh_TW' },
        { label: 'English', value: 'en_US' }
    ];

    // 导出格式选项
    const exportFormatOptions = [
        { label: 'PNG', value: 'png' },
        { label: 'JPG', value: 'jpg' },
        { label: 'WEBP', value: 'webp' }
    ];

    // 处理表单变化
    const handleValuesChange = (changedValues, allValues) => {
        onUpdate(allValues);
    };

    return (
        <div className="preference-settings">
            <Form
                form={form}
                layout="vertical"
                initialValues={settings}
                onValuesChange={handleValuesChange}
            >
                {/* 外观设置 */}
                <Card
                    title={
                        <Space>
                            <BulbOutlined />
                            <span>外观设置</span>
                        </Space>
                    }
                    className="settings-card"
                >
                    <Form.Item
                        name="theme"
                        label="主题"
                        tooltip="选择界面主题风格"
                    >
                        <Radio.Group options={themeOptions} />
                    </Form.Item>

                    <Form.Item
                        name="useCustomColors"
                        label="自定义主题色"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    {form.getFieldValue('useCustomColors') && (
                        <Form.Item
                            name="customPrimaryColor"
                            label="主题色"
                        >
                            <Select>
                                <Option value="#1890ff">默认蓝</Option>
                                <Option value="#f5222d">中国红</Option>
                                <Option value="#52c41a">翠绿</Option>
                                <Option value="#722ed1">优雅紫</Option>
                            </Select>
                        </Form.Item>
                    )}
                </Card>

                {/* 语言设置 */}
                <Card
                    title={
                        <Space>
                            <GlobalOutlined />
                            <span>语言设置</span>
                        </Space>
                    }
                    className="settings-card"
                >
                    <Form.Item
                        name="language"
                        label="界面语言"
                        tooltip="选择界面显示语言"
                    >
                        <Select options={languageOptions} />
                    </Form.Item>

                    <Form.Item
                        name="autoDetectLanguage"
                        label="自动检测语言"
                        valuePropName="checked"
                        tooltip="根据浏览器设置自动选择语言"
                    >
                        <Switch />
                    </Form.Item>
                </Card>

                {/* 导出设置 */}
                <Card
                    title={
                        <Space>
                            <ExportOutlined />
                            <span>导出设置</span>
                        </Space>
                    }
                    className="settings-card"
                >
                    <Form.Item
                        name="exportFormat"
                        label="默认格式"
                        tooltip="选择默认导出格式"
                    >
                        <Radio.Group options={exportFormatOptions} />
                    </Form.Item>

                    <Form.Item
                        name="exportQuality"
                        label="导出质量"
                        tooltip="设置导出图片的质量（仅对JPG和WEBP有效）"
                    >
                        <Slider
                            min={0.1}
                            max={1}
                            step={0.1}
                            marks={{
                                0.1: '低',
                                0.5: '中',
                                1: '高'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="defaultSize"
                        label="默认尺寸"
                    >
                        <Select>
                            <Option value="auto">自适应</Option>
                            <Option value="1080x1080">方形 (1080x1080)</Option>
                            <Option value="1080x1920">竖版 (1080x1920)</Option>
                            <Option value="1920x1080">横版 (1920x1080)</Option>
                        </Select>
                    </Form.Item>
                </Card>

                {/* 其他设置 */}
                <Card
                    title={
                        <Space>
                            <SettingOutlined />
                            <span>其他设置</span>
                        </Space>
                    }
                    className="settings-card"
                >
                    <Form.Item
                        name="defaultTemplate"
                        label="默认模板"
                        tooltip="选择默认使用的模板"
                    >
                        <Select>
                            <Option value={null}>不设置</Option>
                            <Option value="template1">简约白</Option>
                            <Option value="template2">经典黑</Option>
                            <Option value="template3">渐变蓝</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="autoSave"
                        label="自动保存"
                        valuePropName="checked"
                        tooltip="自动保存编辑内容"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="showTips"
                        label="显示提示"
                        valuePropName="checked"
                        tooltip="显示功能提示和快捷键提示"
                    >
                        <Switch />
                    </Form.Item>
                </Card>
            </Form>
        </div>
    );
};

export default PreferenceSettings;
