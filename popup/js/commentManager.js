class CommentManager {
    constructor(marketManager, i18n, errorHandler) {
        this.marketManager = marketManager;
        this.i18n = i18n;
        this.errorHandler = errorHandler;
    }

    async getComments(templateId, page = 1) {
        try {
            const response = await fetch(`${this.marketManager.apiEndpoint}/templates/${templateId}/comments?page=${page}`);
            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }
            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'getComments');
            throw error;
        }
    }

    async addComment(templateId, data) {
        try {
            const response = await fetch(`${this.marketManager.apiEndpoint}/templates/${templateId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }
            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'addComment');
            throw error;
        }
    }

    async updateComment(templateId, commentId, data) {
        try {
            const response = await fetch(
                `${this.marketManager.apiEndpoint}/templates/${templateId}/comments/${commentId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
            );

            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }
            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'updateComment');
            throw error;
        }
    }

    async deleteComment(templateId, commentId) {
        try {
            const response = await fetch(
                `${this.marketManager.apiEndpoint}/templates/${templateId}/comments/${commentId}`,
                {
                    method: 'DELETE'
                }
            );

            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'deleteComment');
            throw error;
        }
    }

    async rateTemplate(templateId, rating) {
        try {
            const response = await fetch(`${this.marketManager.apiEndpoint}/templates/${templateId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rating })
            });

            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }
            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'rateTemplate');
            throw error;
        }
    }

    async addReply(templateId, commentId, data) {
        try {
            const response = await fetch(
                `${this.marketManager.apiEndpoint}/templates/${templateId}/comments/${commentId}/replies`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
            );

            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }
            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'addReply');
            throw error;
        }
    }

    async getReplies(templateId, commentId) {
        try {
            const response = await fetch(
                `${this.marketManager.apiEndpoint}/templates/${templateId}/comments/${commentId}/replies`
            );
            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }
            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'getReplies');
            throw error;
        }
    }

    async deleteReply(templateId, commentId, replyId) {
        try {
            const response = await fetch(
                `${this.marketManager.apiEndpoint}/templates/${templateId}/comments/${commentId}/replies/${replyId}`,
                {
                    method: 'DELETE'
                }
            );

            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'deleteReply');
            throw error;
        }
    }

    async likeComment(templateId, commentId) {
        try {
            const response = await fetch(
                `${this.marketManager.apiEndpoint}/templates/${templateId}/comments/${commentId}/like`,
                {
                    method: 'POST'
                }
            );

            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }
            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'likeComment');
            throw error;
        }
    }

    async unlikeComment(templateId, commentId) {
        try {
            const response = await fetch(
                `${this.marketManager.apiEndpoint}/templates/${templateId}/comments/${commentId}/like`,
                {
                    method: 'DELETE'
                }
            );

            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'unlikeComment');
            throw error;
        }
    }

    async likeReply(templateId, commentId, replyId) {
        try {
            const response = await fetch(
                `${this.marketManager.apiEndpoint}/templates/${templateId}/comments/${commentId}/replies/${replyId}/like`,
                {
                    method: 'POST'
                }
            );

            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }
            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'likeReply');
            throw error;
        }
    }

    async unlikeReply(templateId, commentId, replyId) {
        try {
            const response = await fetch(
                `${this.marketManager.apiEndpoint}/templates/${templateId}/comments/${commentId}/replies/${replyId}/like`,
                {
                    method: 'DELETE'
                }
            );

            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }
            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'unlikeReply');
            throw error;
        }
    }

    async reportComment(templateId, commentId, reason) {
        try {
            const response = await fetch(
                `${this.marketManager.apiEndpoint}/templates/${templateId}/comments/${commentId}/report`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ reason })
                }
            );

            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }
            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'reportComment');
            throw error;
        }
    }

    async reportReply(templateId, commentId, replyId, reason) {
        try {
            const response = await fetch(
                `${this.marketManager.apiEndpoint}/templates/${templateId}/comments/${commentId}/replies/${replyId}/report`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ reason })
                }
            );

            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }
            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'reportReply');
            throw error;
        }
    }
}

export default CommentManager;
