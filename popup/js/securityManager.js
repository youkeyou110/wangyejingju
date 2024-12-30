class SecurityManager {
    constructor(errorHandler) {
        this.errorHandler = errorHandler;
        this.encryptionKey = null;
        this.permissions = new Map();
        this.initialized = false;
    }

    async initialize() {
        try {
            // 初始化加密密钥
            await this.initializeEncryptionKey();

            // 初始化权限系统
            await this.initializePermissions();

            // 设置 CSP
            this.setupCSP();

            // 设置输入验证规则
            this.setupValidationRules();

            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleError(error, 'securityInitialize');
        }
    }

    // 数据加密
    async encrypt(data) {
        try {
            const key = await this.getEncryptionKey();
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encodedData = new TextEncoder().encode(JSON.stringify(data));

            const encryptedData = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv
                },
                key,
                encodedData
            );

            return {
                data: Array.from(new Uint8Array(encryptedData)),
                iv: Array.from(iv)
            };
        } catch (error) {
            this.errorHandler.handleError(error, 'encrypt');
            throw error;
        }
    }

    async decrypt(encryptedData, iv) {
        try {
            const key = await this.getEncryptionKey();
            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: new Uint8Array(iv)
                },
                key,
                new Uint8Array(encryptedData)
            );

            return JSON.parse(new TextDecoder().decode(decryptedData));
        } catch (error) {
            this.errorHandler.handleError(error, 'decrypt');
            throw error;
        }
    }

    // 权限控制
    async checkPermission(action, resource) {
        try {
            const permissions = await this.getPermissions();
            const required = this.getRequiredPermissions(action, resource);

            return required.every(permission =>
                permissions.includes(permission)
            );
        } catch (error) {
            this.errorHandler.handleError(error, 'checkPermission');
            return false;
        }
    }

    // 输入验证
    validateInput(input, rules) {
        try {
            const validator = this.getValidator(rules);
            const sanitizedInput = this.sanitizeInput(input);
            return validator(sanitizedInput);
        } catch (error) {
            this.errorHandler.handleError(error, 'validateInput');
            return false;
        }
    }

    // XSS 防护
    sanitizeHTML(html) {
        try {
            const template = document.createElement('template');
            template.innerHTML = html;
            this.sanitizeNode(template.content);
            return template.innerHTML;
        } catch (error) {
            this.errorHandler.handleError(error, 'sanitizeHTML');
            return '';
        }
    }

    // 私有方法
    private async initializeEncryptionKey() {
        try {
            const storedKey = await chrome.storage.local.get('encryptionKey');
            if (storedKey.encryptionKey) {
                this.encryptionKey = await crypto.subtle.importKey(
                    'jwk',
                    storedKey.encryptionKey,
                    { name: 'AES-GCM' },
                    true,
                    ['encrypt', 'decrypt']
                );
            } else {
                this.encryptionKey = await crypto.subtle.generateKey(
                    { name: 'AES-GCM', length: 256 },
                    true,
                    ['encrypt', 'decrypt']
                );
                const exportedKey = await crypto.subtle.exportKey('jwk', this.encryptionKey);
                await chrome.storage.local.set({ encryptionKey: exportedKey });
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'initializeEncryptionKey');
            throw error;
        }
    }

    private async initializePermissions() {
        // 初始化权限配置
        this.permissions.set('template', {
            create: ['create_template'],
            read: ['read_template'],
            update: ['update_template'],
            delete: ['delete_template']
        });

        this.permissions.set('comment', {
            create: ['create_comment'],
            read: ['read_comment'],
            update: ['update_comment'],
            delete: ['delete_comment']
        });
    }

    private setupCSP() {
        // 设置内容安全策略
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = `
            default-src 'self';
            script-src 'self';
            style-src 'self' 'unsafe-inline';
            img-src 'self' data: https:;
            connect-src 'self' https://api.example.com;
            font-src 'self';
            object-src 'none';
            media-src 'none';
            frame-src 'none';
            form-action 'self';
            base-uri 'self';
            frame-ancestors 'none';
        `;
        document.head.appendChild(meta);
    }

    private setupValidationRules() {
        // 设置输入验证规则
        this.validationRules = {
            template: {
                name: /^[\w\s-]{1,50}$/,
                content: /^[\s\S]{1,5000}$/,
                type: /^(text|image|mixed)$/
            },
            comment: {
                content: /^[\s\S]{1,500}$/,
                rating: /^[1-5]$/
            }
        };
    }

    private sanitizeNode(node) {
        // 清理 DOM 节点
        const allowedTags = new Set(['div', 'span', 'p', 'br', 'b', 'i', 'u']);
        const allowedAttrs = new Set(['class', 'id', 'style']);

        const nodes = node.getElementsByTagName('*');
        for (const element of nodes) {
            if (!allowedTags.has(element.tagName.toLowerCase())) {
                element.remove();
                continue;
            }

            const attrs = element.attributes;
            for (let i = attrs.length - 1; i >= 0; i--) {
                const attr = attrs[i];
                if (!allowedAttrs.has(attr.name)) {
                    element.removeAttribute(attr.name);
                }
            }

            // 清理内联样式
            if (element.style) {
                const allowedStyles = new Set([
                    'color', 'background-color', 'font-size',
                    'font-weight', 'font-style', 'text-decoration'
                ]);
                const styles = element.style;
                for (let i = styles.length - 1; i >= 0; i--) {
                    const style = styles[i];
                    if (!allowedStyles.has(style)) {
                        styles.removeProperty(style);
                    }
                }
            }
        }
    }

    private getValidator(rules) {
        return (input) => {
            if (typeof rules === 'function') {
                return rules(input);
            }
            if (rules instanceof RegExp) {
                return rules.test(input);
            }
            if (typeof rules === 'object') {
                return Object.entries(rules).every(([key, rule]) =>
                    this.getValidator(rule)(input[key])
                );
            }
            return false;
        };
    }

    private sanitizeInput(input) {
        if (typeof input === 'string') {
            return input.replace(/[<>]/g, '');
        }
        if (typeof input === 'object') {
            return Object.entries(input).reduce((acc, [key, value]) => ({
                ...acc,
                [key]: this.sanitizeInput(value)
            }), {});
        }
        return input;
    }
}

export default SecurityManager;
