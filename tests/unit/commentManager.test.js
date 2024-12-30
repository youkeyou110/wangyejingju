import CommentManager from '@/commentManager';

describe('CommentManager', () => {
    let commentManager;
    let mockErrorHandler;
    let mockMarketManager;
    let mockI18n;

    beforeEach(() => {
        mockErrorHandler = {
            handleError: jest.fn()
        };
        mockMarketManager = {
            apiEndpoint: 'https://api.example.com'
        };
        mockI18n = {
            getMessage: jest.fn(key => key)
        };
        commentManager = new CommentManager(mockErrorHandler, mockMarketManager, mockI18n);
    });

    test('addComment should post comment', async () => {
        const templateId = 'test-template';
        const comment = {
            content: 'Test comment',
            rating: 5
        };
        const response = { id: 'comment-1', ...comment };
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(response)
            })
        );

        const result = await commentManager.addComment(templateId, comment);

        expect(result).toEqual(response);
        expect(fetch).toHaveBeenCalledWith(
            `${mockMarketManager.apiEndpoint}/templates/${templateId}/comments`,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(comment)
            })
        );
    });

    test('getComments should fetch comments', async () => {
        const templateId = 'test-template';
        const comments = [
            { id: 'comment-1', content: 'Test 1' },
            { id: 'comment-2', content: 'Test 2' }
        ];
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(comments)
            })
        );

        const result = await commentManager.getComments(templateId);

        expect(result).toEqual(comments);
        expect(fetch).toHaveBeenCalledWith(
            `${mockMarketManager.apiEndpoint}/templates/${templateId}/comments`
        );
    });

    test('deleteComment should remove comment', async () => {
        const templateId = 'test-template';
        const commentId = 'comment-1';
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({ ok: true })
        );

        const result = await commentManager.deleteComment(templateId, commentId);

        expect(result).toBe(true);
        expect(fetch).toHaveBeenCalledWith(
            `${mockMarketManager.apiEndpoint}/templates/${templateId}/comments/${commentId}`,
            expect.objectContaining({
                method: 'DELETE'
            })
        );
    });

    test('likeComment should toggle like', async () => {
        const templateId = 'test-template';
        const commentId = 'comment-1';
        const response = { likes: 10 };
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(response)
            })
        );

        const result = await commentManager.likeComment(templateId, commentId);

        expect(result).toEqual(response);
        expect(fetch).toHaveBeenCalledWith(
            `${mockMarketManager.apiEndpoint}/templates/${templateId}/comments/${commentId}/like`,
            expect.objectContaining({
                method: 'POST'
            })
        );
    });

    test('reportComment should send report', async () => {
        const templateId = 'test-template';
        const commentId = 'comment-1';
        const reason = 'Inappropriate content';
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true })
            })
        );

        const result = await commentManager.reportComment(templateId, commentId, reason);

        expect(result).toEqual({ success: true });
        expect(fetch).toHaveBeenCalledWith(
            `${mockMarketManager.apiEndpoint}/templates/${templateId}/comments/${commentId}/report`,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ reason })
            })
        );
    });
});
