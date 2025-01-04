describe('分享功能测试', () => {
    test('图片上传', async () => {
        const dataUrl = 'mock-data-url';
        const result = await ShareUtil.uploadToTempStorage(dataUrl);
        expect(result).toMatch(/^https?:\/\//);
    });

    test('预览页面访问', async () => {
        const url = ShareUtil.generatePreviewUrl('test-image.jpg', 'test text');
        const response = await fetch(url);
        expect(response.status).toBe(200);
    });
});
