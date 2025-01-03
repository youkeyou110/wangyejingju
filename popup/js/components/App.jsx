import React, { useState } from 'react';
import { Layout, Tabs, Button, message } from 'antd';
import TextEditor from './TextEditor';
import TemplateSelector from './TemplateSelector';
import StyleEditor from './StyleEditor';
import Preview from './Preview';
import { StyleManager, TemplateManager, ExportManager } from '../managers';
import Recommendations from '../../components/Recommendations';
import recommendationManager from '../../managers/RecommendationManager';
import Collaboration from '../../components/Collaboration';
import collaborationManager from '../../managers/CollaborationManager';

const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;

const App = () => {
    const [selectedText, setSelectedText] = useState('');
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [currentStyle, setCurrentStyle] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [sessionId, setSessionId] = useState(null);

    // 初始化管理器
    const styleManager = new StyleManager();
    const templateManager = new TemplateManager();
    const exportManager = new ExportManager();

    // 处理文本更新
    const handleTextChange = (text) => {
        setSelectedText(text);
        updatePreview(text, currentTemplate, currentStyle);
    };

    // 处理模板选择
    const handleTemplateSelect = (template) => {
        setCurrentTemplate(template);
        const style = styleManager.applyStyle(template.style);
        setCurrentStyle(style);
        updatePreview(selectedText, template, style);
    };

    // 处理样式更新
    const handleStyleChange = (style) => {
        setCurrentStyle(style);
        updatePreview(selectedText, currentTemplate, style);
    };

    // 更新预览
    const updatePreview = (text, template, style) => {
        if (text && template && style) {
            setPreviewData({
                text,
                template,
                style
            });
        }
    };

    // 导出卡片
    const handleExport = async (options) => {
        if (previewData) {
            try {
                await exportManager.exportImage(previewData, options);
            } catch (error) {
                console.error('Export failed:', error);
                // TODO: 显示错误提示
            }
        }
    };

    // 处理推荐选择
    const handleRecommendationSelect = (type, item) => {
        switch (type) {
            case 'template':
                setCurrentTemplate(item);
                break;
            case 'style':
                setCurrentStyle(item);
                break;
            case 'content':
                setSelectedText(item.text);
                break;
        }
    };

    // 记录用户行为
    const trackUserAction = (type, data) => {
        recommendationManager.trackUserAction({
            type,
            data,
            timestamp: Date.now()
        });
    };

    // 创建协作会话
    const createCollaborationSession = async () => {
        try {
            const id = await collaborationManager.createSession({
                text: selectedText,
                template: currentTemplate,
                style: currentStyle
            });
            setSessionId(id);
        } catch (error) {
            console.error('Failed to create collaboration session:', error);
            message.error('创建协作会话失败');
        }
    };

    return (
        <Layout className="app-container">
            <Header className="app-header">
                <h1>金句卡片生成器</h1>
            </Header>
            <Layout>
                <Content className="main-content">
                    <div className="editor-container">
                        <TextEditor
                            value={selectedText}
                            onChange={handleTextChange}
                        />
                    </div>
                    <div className="preview-container">
                        <Preview data={previewData} />
                    </div>
                </Content>
                <Sider width={300} className="right-sider">
                    <Tabs defaultActiveKey="template">
                        <TabPane tab="模板" key="template">
                            <Recommendations
                                type="template"
                                onSelect={item => handleRecommendationSelect('template', item)}
                            />
                            <TemplateSelector
                                value={currentTemplate}
                                onChange={template => {
                                    setCurrentTemplate(template);
                                    trackUserAction('template', template);
                                }}
                            />
                        </TabPane>
                        <TabPane tab="样式" key="style">
                            <Recommendations
                                type="style"
                                onSelect={item => handleRecommendationSelect('style', item)}
                            />
                            <StyleEditor
                                value={currentStyle}
                                onChange={style => {
                                    setCurrentStyle(style);
                                    trackUserAction('style', style);
                                }}
                            />
                        </TabPane>
                        <TabPane tab="协作" key="collaboration">
                            {sessionId ? (
                                <Collaboration sessionId={sessionId} />
                            ) : (
                                <Button
                                    type="primary"
                                    onClick={createCollaborationSession}
                                    block
                                >
                                    创建协作会话
                                </Button>
                            )}
                        </TabPane>
                    </Tabs>
                </Sider>
            </Layout>
        </Layout>
    );
};

export default App;
