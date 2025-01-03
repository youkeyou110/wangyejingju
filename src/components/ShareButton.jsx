import React from 'react';
import { Button, Dropdown, Menu, message, Modal, Input } from 'antd';
import { ShareAltOutlined, EditOutlined } from '@ant-design/icons';
import shareManager from '../managers/ShareManager';

const ShareButton = ({ data, className }) => {
    const [editModalVisible, setEditModalVisible] = React.useState(false);
    const [shareData, setShareData] = React.useState(data);

    // 处理分享
    const handleShare = async (platform) => {
        try {
            await shareManager.share(platform, {
                ...shareData,
                timestamp: Date.now(),
                id: `quote-${Date.now()}`
            });
            message.success(`分享到${platform}成功`);
        } catch (error) {
            message.error(`分享失败: ${error.message}`);
        }
    };

    // 编辑分享内容
    const handleEdit = () => {
        setEditModalVisible(true);
    };

    const menu = (
        <Menu>
            <Menu.Item key="edit" onClick={handleEdit}>
                <EditOutlined /> 编辑分享内容
            </Menu.Item>
            <Menu.Divider />
            {shareManager.getPlatforms().map(platform => (
                <Menu.Item
                    key={platform}
                    onClick={() => handleShare(platform)}
                    className="share-menu-item"
                >
                    分享到{platform}
                </Menu.Item>
            ))}
        </Menu>
    );

    return (
        <>
            <Dropdown overlay={menu} placement="bottomCenter">
                <Button
                    type="primary"
                    icon={<ShareAltOutlined />}
                    className={className}
                >
                    分享
                </Button>
            </Dropdown>

            <Modal
                title="编辑分享内容"
                visible={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={() => {
                    setEditModalVisible(false);
                    message.success('分享内容已更新');
                }}
            >
                <ShareForm
                    data={shareData}
                    onChange={setShareData}
                />
            </Modal>
        </>
    );
};

// 分享表单组件
const ShareForm = ({ data, onChange }) => {
    const handleChange = (field, value) => {
        onChange({
            ...data,
            [field]: value
        });
    };

    return (
        <div className="share-form">
            <Input.TextArea
                value={data.text}
                onChange={e => handleChange('text', e.target.value)}
                placeholder="分享文字"
                autoSize={{ minRows: 3, maxRows: 6 }}
            />
            <Input
                value={data.author}
                onChange={e => handleChange('author', e.target.value)}
                placeholder="作者/来源"
                className="share-form-input"
            />
            <Input
                value={data.url}
                onChange={e => handleChange('url', e.target.value)}
                placeholder="链接（选填）"
                className="share-form-input"
            />
        </div>
    );
};

export default ShareButton;
