import React from 'react';
import { Layout, Tabs } from 'antd';
import { useTheme } from '../ThemeProvider';
import TemplateSelector from './TemplateSelector';
import TextEditor from './TextEditor';
import StyleEditor from './StyleEditor';
import Preview from './Preview';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;

const Popup = () => {
    const { theme } = useTheme();
    const [selectedTemplate, setSelectedTemplate] = React.useState(null);
    const [text, setText] = React.useState('');
    const [style, setStyle] = React.useState({});

    return (
        <Layout className="popup-container">
            <Sider width={280} theme={theme.key === 'dark' ? 'dark' : 'light'}>
                <Tabs defaultActiveKey="template">
                    <TabPane tab="模板" key="template">
                        <TemplateSelector
                            value={selectedTemplate}
                            onChange={setSelectedTemplate}
                        />
                    </TabPane>
                    <TabPane tab="样式" key="style">
                        <StyleEditor
                            value={style}
                            onChange={setStyle}
                        />
                    </TabPane>
                </Tabs>
            </Sider>
            <Content>
                <Layout>
                    <Content className="editor-container">
                        <TextEditor
                            value={text}
                            onChange={setText}
                            style={style}
                        />
                    </Content>
                    <Content className="preview-container">
                        <Preview
                            template={selectedTemplate}
                            text={text}
                            style={style}
                        />
                    </Content>
                </Layout>
            </Content>
        </Layout>
    );
};

export default Popup;
