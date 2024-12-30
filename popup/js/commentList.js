class CommentList {
    constructor(commentManager, i18n) {
        this.commentManager = commentManager;
        this.i18n = i18n;
        this.container = null;
        this.templateId = null;
        this.currentPage = 1;
        this.comments = [];
        this.totalPages = 1;
    }

    init(container, templateId) {
        this.container = container;
        this.templateId = templateId;
        this.render();
        this.loadComments();
    }

    async render() {
        this.container.innerHTML = `
            <div class="comments-section">
                <div class="comments-header">
                    <h3>${this.i18n.getMessage('market_comments_title')}</h3>
                    <div class="rating-input">
                        <div class="stars">
                            ${Array(5).fill(0).map((_, i) => `
                                <button class="star" data-rating="${i + 1}">
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                    </svg>
                                </button>
                            `).join('')}
                        </div>
                        <button class="add-comment-button">
                            ${this.i18n.getMessage('market_comments_add')}
                        </button>
                    </div>
                </div>
                <div class="comment-form hidden">
                    <textarea placeholder="${this.i18n.getMessage('market_comments_placeholder')}"></textarea>
                    <div class="form-buttons">
                        <button class="cancel-button">
                            ${this.i18n.getMessage('buttons_cancel')}
                        </button>
                        <button class="submit-button">
                            ${this.i18n.getMessage('buttons_submit')}
                        </button>
                    </div>
                </div>
                <div class="comments-list"></div>
                <div class="comments-pagination"></div>
            </div>
        `;

        this.bindEvents();
    }

    async loadComments() {
        try {
            const data = await this.commentManager.getComments(this.templateId, this.currentPage);
            this.comments = data.comments;
            this.totalPages = data.totalPages;
            this.renderComments();
            this.renderPagination();
        } catch (error) {
            // 错误已由 CommentManager 处理
        }
    }

    renderComments() {
        const list = this.container.querySelector('.comments-list');
        list.innerHTML = this.comments.map(comment => `
            <div class="comment-item" data-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-author">
                        <img src="${comment.authorAvatar}" alt="${comment.author}">
                        <span class="author-name">${comment.author}</span>
                    </div>
                    <div class="comment-meta">
                        <div class="rating">
                            ${Array(5).fill(0).map((_, i) => `
                                <svg class="${i < comment.rating ? 'filled' : ''}" viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                </svg>
                            `).join('')}
                        </div>
                        <span class="comment-date">${new Date(comment.date).toLocaleDateString()}</span>
                    </div>
                </div>
                <p class="comment-content">${comment.content}</p>

                <div class="comment-actions">
                    <button class="like-button ${comment.isLiked ? 'active' : ''}" data-likes="${comment.likes}">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                        </svg>
                        <span class="likes-count">${comment.likes}</span>
                    </button>
                    <button class="reply-button">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                        </svg>
                        ${this.i18n.getMessage('market_comments_reply')}
                    </button>
                    <button class="report-button">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
                        </svg>
                        ${this.i18n.getMessage('market_comments_report')}
                    </button>
                </div>

                <div class="reply-form hidden">
                    <textarea placeholder="${this.i18n.getMessage('market_comments_reply_placeholder')}"></textarea>
                    <div class="form-buttons">
                        <button class="cancel-reply-button">
                            ${this.i18n.getMessage('buttons_cancel')}
                        </button>
                        <button class="submit-reply-button">
                            ${this.i18n.getMessage('buttons_submit')}
                        </button>
                    </div>
                </div>

                <div class="replies-list">
                    ${comment.replies ? this.renderReplies(comment.replies) : ''}
                </div>
            </div>
        `).join('');

        // 加载所有评论的回复
        this.comments.forEach(comment => {
            if (!comment.replies) {
                this.loadReplies(comment.id);
            }
        });
    }

    renderReplies(replies) {
        return replies.map(reply => `
            <div class="reply-item" data-id="${reply.id}">
                <div class="reply-header">
                    <div class="reply-author">
                        <img src="${reply.authorAvatar}" alt="${reply.author}">
                        <span class="author-name">${reply.author}</span>
                    </div>
                    <div class="reply-meta">
                        <button class="like-button ${reply.isLiked ? 'active' : ''}" data-likes="${reply.likes}">
                            <svg viewBox="0 0 24 24" width="14" height="14">
                                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                            </svg>
                            <span class="likes-count">${reply.likes}</span>
                        </button>
                        <button class="report-button">
                            <svg viewBox="0 0 24 24" width="14" height="14">
                                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
                            </svg>
                        </button>
                        <span class="reply-date">${new Date(reply.date).toLocaleDateString()}</span>
                    </div>
                </div>
                <p class="reply-content">${reply.content}</p>
            </div>
        `).join('');
    }

    async loadReplies(commentId) {
        try {
            const replies = await this.commentManager.getReplies(this.templateId, commentId);
            const repliesList = this.container.querySelector(
                `.comment-item[data-id="${commentId}"] .replies-list`
            );
            repliesList.innerHTML = this.renderReplies(replies);
        } catch (error) {
            // 错误已由 CommentManager 处理
        }
    }

    renderPagination() {
        const pagination = this.container.querySelector('.comments-pagination');
        if (this.totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        const pages = [];

        // 首页
        if (this.currentPage > 1) {
            pages.push('<button class="page-first">1</button>');
        }

        // 省略号
        if (this.currentPage > 3) {
            pages.push('<span class="page-ellipsis">...</span>');
        }

        // 当前页附近的页码
        for (let i = Math.max(2, this.currentPage - 1);
             i <= Math.min(this.totalPages - 1, this.currentPage + 1);
             i++) {
            pages.push(`<button class="page-number${i === this.currentPage ? ' active' : ''}">${i}</button>`);
        }

        // 省略号
        if (this.currentPage < this.totalPages - 2) {
            pages.push('<span class="page-ellipsis">...</span>');
        }

        // 末页
        if (this.currentPage < this.totalPages) {
            pages.push(`<button class="page-last">${this.totalPages}</button>`);
        }

        pagination.innerHTML = pages.join('');
    }

    bindEvents() {
        // 评分
        this.container.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', async () => {
                const rating = parseInt(star.dataset.rating);
                try {
                    await this.commentManager.rateTemplate(this.templateId, rating);
                    this.container.querySelectorAll('.star').forEach((s, i) => {
                        s.classList.toggle('active', i < rating);
                    });
                } catch (error) {
                    // 错误已由 CommentManager 处理
                }
            });
        });

        // 显示评论表单
        this.container.querySelector('.add-comment-button').addEventListener('click', () => {
            this.container.querySelector('.comment-form').classList.remove('hidden');
        });

        // 取消评论
        this.container.querySelector('.cancel-button').addEventListener('click', () => {
            this.container.querySelector('.comment-form').classList.add('hidden');
            this.container.querySelector('textarea').value = '';
        });

        // 提交评论
        this.container.querySelector('.submit-button').addEventListener('click', async () => {
            const content = this.container.querySelector('textarea').value.trim();
            if (!content) return;

            try {
                await this.commentManager.addComment(this.templateId, {
                    content,
                    rating: this.container.querySelectorAll('.star.active').length
                });

                this.container.querySelector('.comment-form').classList.add('hidden');
                this.container.querySelector('textarea').value = '';
                this.currentPage = 1;
                this.loadComments();
            } catch (error) {
                // 错误已由 CommentManager 处理
            }
        });

        // 分页
        this.container.querySelector('.comments-pagination').addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                this.currentPage = parseInt(button.textContent);
                this.loadComments();
                window.scrollTo(0, this.container.offsetTop);
            }
        });

        // 显示回复表单
        this.container.addEventListener('click', (e) => {
            const replyButton = e.target.closest('.reply-button');
            if (replyButton) {
                const commentItem = replyButton.closest('.comment-item');
                const replyForm = commentItem.querySelector('.reply-form');
                replyForm.classList.remove('hidden');
            }
        });

        // 取消回复
        this.container.addEventListener('click', (e) => {
            const cancelButton = e.target.closest('.cancel-reply-button');
            if (cancelButton) {
                const replyForm = cancelButton.closest('.reply-form');
                replyForm.classList.add('hidden');
                replyForm.querySelector('textarea').value = '';
            }
        });

        // 提交回复
        this.container.addEventListener('click', async (e) => {
            const submitButton = e.target.closest('.submit-reply-button');
            if (submitButton) {
                const commentItem = submitButton.closest('.comment-item');
                const commentId = commentItem.dataset.id;
                const replyForm = commentItem.querySelector('.reply-form');
                const content = replyForm.querySelector('textarea').value.trim();

                if (!content) return;

                try {
                    await this.commentManager.addReply(this.templateId, commentId, { content });
                    replyForm.classList.add('hidden');
                    replyForm.querySelector('textarea').value = '';
                    this.loadReplies(commentId);
                } catch (error) {
                    // 错误已由 CommentManager 处理
                }
            }
        });

        // 评论点赞
        this.container.addEventListener('click', async (e) => {
            const likeButton = e.target.closest('.like-button');
            if (!likeButton) return;

            const isReply = likeButton.closest('.reply-item');
            const item = likeButton.closest(isReply ? '.reply-item' : '.comment-item');
            const itemId = item.dataset.id;
            const isLiked = likeButton.classList.contains('active');
            const likesCount = likeButton.querySelector('.likes-count');
            const currentLikes = parseInt(likeButton.dataset.likes);

            try {
                if (isReply) {
                    const commentItem = item.closest('.comment-item');
                    const commentId = commentItem.dataset.id;

                    if (isLiked) {
                        await this.commentManager.unlikeReply(this.templateId, commentId, itemId);
                        likeButton.classList.remove('active');
                        likesCount.textContent = currentLikes - 1;
                        likeButton.dataset.likes = currentLikes - 1;
                    } else {
                        await this.commentManager.likeReply(this.templateId, commentId, itemId);
                        likeButton.classList.add('active');
                        likesCount.textContent = currentLikes + 1;
                        likeButton.dataset.likes = currentLikes + 1;
                    }
                } else {
                    if (isLiked) {
                        await this.commentManager.unlikeComment(this.templateId, itemId);
                        likeButton.classList.remove('active');
                        likesCount.textContent = currentLikes - 1;
                        likeButton.dataset.likes = currentLikes - 1;
                    } else {
                        await this.commentManager.likeComment(this.templateId, itemId);
                        likeButton.classList.add('active');
                        likesCount.textContent = currentLikes + 1;
                        likeButton.dataset.likes = currentLikes + 1;
                    }
                }
            } catch (error) {
                // 错误已由 CommentManager 处理
            }
        });

        // 举报评论或回复
        this.container.addEventListener('click', async (e) => {
            const reportButton = e.target.closest('.report-button');
            if (!reportButton) return;

            const isReply = reportButton.closest('.reply-item');
            const item = reportButton.closest(isReply ? '.reply-item' : '.comment-item');
            const itemId = item.dataset.id;

            const reason = prompt(this.i18n.getMessage('market_comments_report_prompt'));
            if (!reason) return;

            try {
                if (isReply) {
                    const commentItem = item.closest('.comment-item');
                    const commentId = commentItem.dataset.id;
                    await this.commentManager.reportReply(this.templateId, commentId, itemId, reason);
                } else {
                    await this.commentManager.reportComment(this.templateId, itemId, reason);
                }
                alert(this.i18n.getMessage('market_report_success'));
            } catch (error) {
                // 错误已由 CommentManager 处理
            }
        });
    }
}

export default CommentList;
