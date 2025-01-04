import { ShareUtil } from '../utils/ShareUtil';

export class ShareDialog {
    constructor(container, onClose) {
        this.container = container;
        this.onClose = onClose;
        this.dataUrl = null;
        this.text = '';
    }

    async show(dataUrl, text) {
        this.dataUrl = dataUrl;
        this.text = text;

        this.container.innerHTML = `
            <div class="share-dialog">
                <div class="share-header">
                    <h3>分享卡片</h3>
                    <button class="btn-close">×</button>
                </div>

                <div class="share-preview">
                    <img src="${dataUrl}" alt="预览图">
                </div>

                <div class="share-options">
                    <button class="btn share-btn" id="share-social">
                        <span class="icon">📱</span>
                        分享到社交媒体
                    </button>

                    <button class="btn share-btn" id="copy-image">
                        <span class="icon">📋</span>
                        复制图片
                    </button>

                    <button class="btn share-btn" id="show-qrcode">
                        <span class="icon">📱</span>
                        显示二维码
                    </button>
                </div>

                <div class="qrcode-container" style="display: none;">
                    <div class="qrcode-loading">生成二维码中...</div>
                    <img id="qrcode" alt="二维码" style="display: none;">
                    <div class="qrcode-tip" style="display: none;">
                        扫描二维码后访问在线预览页面<br>
                        <small style="opacity: 0.7">支持微信、支付宝等扫码工具</small>
                    </div>
                </div>

                <div class="share-status"></div>
            </div>
        `;

        this.container.style.display = 'block';
        this.bindEvents();
    }

    async bindEvents() {
        // 关闭按钮
        this.container.querySelector('.btn-close').onclick = () => {
            this.container.style.display = 'none';
            this.onClose?.();
        };

        // 分享到社交媒体
        this.container.querySelector('#share-social').onclick = async () => {
            const success = await ShareUtil.shareToSocial(this.dataUrl, this.text);
            this.showStatus(success ? '分享成功！' : '分享失败，请尝试其他方式');
        };

        // 复制图片
        this.container.querySelector('#copy-image').onclick = async () => {
            const success = await ShareUtil.copyToClipboard(this.dataUrl);
            this.showStatus(success ? '已复制到剪贴板！' : '复制失败，请尝试其他方式');
        };

        // 显示/隐藏二维码
        this.container.querySelector('#show-qrcode').onclick = async () => {
            const qrcodeContainer = this.container.querySelector('.qrcode-container');
            const qrcodeImage = this.container.querySelector('#qrcode');
            const loadingElement = this.container.querySelector('.qrcode-loading');

            if (qrcodeContainer.style.display === 'none') {
                qrcodeContainer.style.display = 'block';
                loadingElement.style.display = 'block';
                qrcodeImage.style.display = 'none';

                console.log('开始生成二维码');
                try {
                    // 生成二维码
                    const qrcodeUrl = await ShareUtil.generateQRCode(this.dataUrl);
                    console.log('二维码生成成功');
                    qrcodeImage.src = qrcodeUrl;
                    qrcodeImage.onload = () => {
                        console.log('二维码图片加载完成');
                        loadingElement.style.display = 'none';
                        qrcodeImage.style.display = 'block';
                        this.container.querySelector('.qrcode-tip').style.display = 'block';
                    };
                    qrcodeImage.onerror = (error) => {
                        console.error('二维码图片加载失败:', error);
                        loadingElement.textContent = '加载二维码失败，请重试';
                    };
                } catch (error) {
                    const errorMessage = error.message || '生成二维码失败，请重试';
                    console.error('生成二维码失败:', errorMessage);
                    loadingElement.textContent = errorMessage;
                    loadingElement.style.color = '#ff4444';
                    // 添加重试按钮
                    loadingElement.innerHTML += `
                        <div style="margin-top: 10px;">
                            <button class="btn" onclick="this.closest('.qrcode-container').style.display='none'">关闭</button>
                        </div>
                    `;
                }
            } else {
                qrcodeContainer.style.display = 'none';
                // 重置状态
                loadingElement.style.color = '#666';
                loadingElement.textContent = '生成二维码中...';
            }
        };
    }

    showStatus(message) {
        const status = this.container.querySelector('.share-status');
        status.textContent = message;
        status.style.opacity = '1';

        setTimeout(() => {
            status.style.opacity = '0';
        }, 2000);
    }
}
