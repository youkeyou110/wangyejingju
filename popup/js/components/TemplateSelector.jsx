import React, { useState, useEffect } from 'react';
import { Card, List, Input, Empty, Skeleton, message } from 'antd';
import {
    SearchOutlined,
    StarOutlined,
    StarFilled,
    HeartOutlined,
    HeartFilled
} from '@ant-design/icons';

const { Search } = Input;

const TemplateSelector = ({
    templates = [],
    onSelect,
    loading = false
}) => {
    const [searchText, setSearchText] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [filteredTemplates, setFilteredTemplates] = useState(templates);

    // 加载收藏数据
    useEffect(() => {
        chrome.storage.sync.get(['favoriteTemplates'], (result) => {
            if (result.favoriteTemplates) {
                setFavorites(result.favoriteTemplates);
            }
        });
    }, []);

    // 处理搜索
    const handleSearch = (value) => {
        setSearchText(value);
        const filtered = templates.filter(template =>
            template.name.toLowerCase().includes(value.toLowerCase()) ||
            template.description?.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredTemplates(filtered);
    };

    // 处理收藏
    const handleFavorite = async (templateId) => {
        try {
            let newFavorites;
            if (favorites.includes(templateId)) {
                newFavorites = favorites.filter(id => id !== templateId);
                message.success('已取消收藏');
            } else {
                newFavorites = [...favorites, templateId];
                message.success('已添加到收藏');
            }
            setFavorites(newFavorites);
            await chrome.storage.sync.set({ favoriteTemplates: newFavorites });
        } catch (error) {
            message.error('操作失败，请重试');
            console.error('Favorite operation failed:', error);
        }
    };

    // 渲染模板卡片
    const renderTemplateCard = (template) => {
        const isFavorite = favorites.includes(template.id);

        return (
            <Card
                hoverable
                className="template-card"
                cover={
                    <div className="template-preview">
                        <img
                            alt={template.name}
                            src={template.preview}
                            loading="lazy"
                        />
                    </div>
                }
                actions={[
                    <div
                        key="favorite"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFavorite(template.id);
                        }}
                    >
                        {isFavorite ? <HeartFilled /> : <HeartOutlined />}
                    </div>,
                    <div
                        key="rating"
                        className="template-rating"
                    >
                        <StarFilled /> {template.rating || 4.5}
                    </div>
                ]}
                onClick={() => onSelect(template)}
            >
                <Card.Meta
                    title={template.name}
                    description={template.description}
                />
                {template.tags && (
                    <div className="template-tags">
                        {template.tags.map(tag => (
                            <span key={tag} className="template-tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </Card>
        );
    };

    return (
        <div className="template-selector">
            <div className="template-search">
                <Search
                    placeholder="搜索模板..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    onChange={(e) => handleSearch(e.target.value)}
                    value={searchText}
                />
            </div>

            {loading ? (
                <div className="template-skeleton">
                    {[1, 2, 3, 4].map(key => (
                        <Card key={key}>
                            <Skeleton active />
                        </Card>
                    ))}
                </div>
            ) : filteredTemplates.length > 0 ? (
                <List
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 2,
                        md: 2,
                        lg: 3,
                        xl: 3,
                        xxl: 4,
                    }}
                    dataSource={filteredTemplates}
                    renderItem={template => (
                        <List.Item>
                            {renderTemplateCard(template)}
                        </List.Item>
                    )}
                />
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        searchText ? "没有找到匹配的模板" : "暂无可用模板"
                    }
                />
            )}
        </div>
    );
};

export default TemplateSelector;
