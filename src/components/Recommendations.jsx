import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Tooltip, Empty } from 'antd';
import recommendationManager from '../managers/RecommendationManager';

const Recommendations = ({ type, onSelect }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadRecommendations();
        const handleUpdate = () => loadRecommendations();
        recommendationManager.on('recommendationsUpdated', handleUpdate);
        return () => {
            recommendationManager.off('recommendationsUpdated', handleUpdate);
        };
    }, [type]);

    const loadRecommendations = async () => {
        setLoading(true);
        try {
            const items = recommendationManager.getRecommendations(type);
            setRecommendations(items);
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = (item) => {
        switch (type) {
            case 'template':
                return renderTemplateItem(item);
            case 'style':
                return renderStyleItem(item);
            case 'content':
                return renderContentItem(item);
            default:
                return null;
        }
    };

    const renderTemplateItem = (template) => (
        <List.Item
            actions={[
                <Button type="link" onClick={() => onSelect(template)}>
                    使用此模板
                </Button>
            ]}
        >
            <List.Item.Meta
                title={template.name}
                description={
                    <div>
                        <Tag color="blue">{template.category}</Tag>
                        <Tag color="green">使用次数: {template.useCount}</Tag>
                    </div>
                }
            />
            <div className="template-preview">
                {/* 模板预览 */}
            </div>
        </List.Item>
    );

    const renderStyleItem = (style) => (
        <List.Item
            actions={[
                <Button type="link" onClick={() => onSelect(style)}>
                    应用样式
                </Button>
            ]}
        >
            <List.Item.Meta
                title={style.name}
                description={
                    <div className="style-preview" style={style.preview}>
                        预览效果
                    </div>
                }
            />
        </List.Item>
    );

    const renderContentItem = (content) => (
        <List.Item
            actions={[
                <Button type="link" onClick={() => onSelect(content)}>
                    使用此内容
                </Button>
            ]}
        >
            <List.Item.Meta
                title={content.text}
                description={
                    <div>
                        {content.tags.map(tag => (
                            <Tag key={tag}>{tag}</Tag>
                        ))}
                        <div className="content-source">
                            来源: {content.source}
                        </div>
                    </div>
                }
            />
        </List.Item>
    );

    return (
        <Card
            title="推荐"
            extra={
                <Tooltip title="刷新推荐">
                    <Button
                        type="link"
                        icon={<ReloadOutlined />}
                        onClick={loadRecommendations}
                    />
                </Tooltip>
            }
            loading={loading}
        >
            {recommendations.length > 0 ? (
                <List
                    dataSource={recommendations}
                    renderItem={renderItem}
                    split={true}
                />
            ) : (
                <Empty description="暂无推荐" />
            )}
        </Card>
    );
};

export default Recommendations;
