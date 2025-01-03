import { EventEmitter } from 'events';
import logManager from './LogManager';
import CryptoJS from 'crypto-js';

class CryptoManager extends EventEmitter {
    constructor() {
        super();
        this.config = {
            algorithm: 'AES',
            keySize: 256,
            iterations: 10000,
            saltSize: 128,
            ivSize: 128
        };
        this.initialized = false;
        this.masterKey = null;
    }

    // 初始化加密系统
    async initialize() {
        try {
            if (this.initialized) return;

            // 获取或生成主密钥
            this.masterKey = await this.getMasterKey();

            // 验证密钥有效性
            await this.validateMasterKey();

            this.initialized = true;
            this.emit('initialized');
        } catch (error) {
            logManager.error('Failed to initialize crypto system:', error);
            throw error;
        }
    }

    // 获取主密钥
    async getMasterKey() {
        try {
            // 从安全存储获取密钥
            const stored = await chrome.storage.local.get('masterKey');
            if (stored.masterKey) {
                return stored.masterKey;
            }

            // 生成新密钥
            const key = CryptoJS.lib.WordArray.random(this.config.keySize / 8);
            await chrome.storage.local.set({ masterKey: key.toString() });
            return key.toString();
        } catch (error) {
            logManager.error('Failed to get master key:', error);
            throw error;
        }
    }

    // 验证主密钥
    async validateMasterKey() {
        try {
            const testData = 'test';
            const encrypted = await this.encrypt(testData);
            const decrypted = await this.decrypt(encrypted);
            return testData === decrypted;
        } catch (error) {
            logManager.error('Master key validation failed:', error);
            throw error;
        }
    }

    // 加密数据
    async encrypt(data, options = {}) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            // 生成盐值和IV
            const salt = CryptoJS.lib.WordArray.random(this.config.saltSize / 8);
            const iv = CryptoJS.lib.WordArray.random(this.config.ivSize / 8);

            // 生成密钥
            const key = CryptoJS.PBKDF2(
                this.masterKey,
                salt,
                {
                    keySize: this.config.keySize / 32,
                    iterations: this.config.iterations
                }
            );

            // 加密数据
            const encrypted = CryptoJS.AES.encrypt(
                JSON.stringify(data),
                key,
                {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            );

            // 组合加密结果
            return {
                data: encrypted.toString(),
                salt: salt.toString(),
                iv: iv.toString(),
                timestamp: Date.now()
            };
        } catch (error) {
            logManager.error('Encryption failed:', error);
            throw error;
        }
    }

    // 解密数据
    async decrypt(encryptedData) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const { data, salt, iv } = encryptedData;

            // 生成密钥
            const key = CryptoJS.PBKDF2(
                this.masterKey,
                CryptoJS.enc.Hex.parse(salt),
                {
                    keySize: this.config.keySize / 32,
                    iterations: this.config.iterations
                }
            );

            // 解密数据
            const decrypted = CryptoJS.AES.decrypt(
                data,
                key,
                {
                    iv: CryptoJS.enc.Hex.parse(iv),
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            );

            return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        } catch (error) {
            logManager.error('Decryption failed:', error);
            throw error;
        }
    }

    // 生成密钥对
    async generateKeyPair() {
        // 这里使用Web Crypto API生成RSA密钥对
        try {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: 'RSA-OAEP',
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: 'SHA-256'
                },
                true,
                ['encrypt', 'decrypt']
            );

            return keyPair;
        } catch (error) {
            logManager.error('Failed to generate key pair:', error);
            throw error;
        }
    }

    // 哈希数据
    hash(data, algorithm = 'SHA-256') {
        try {
            switch (algorithm) {
                case 'SHA-256':
                    return CryptoJS.SHA256(data).toString();
                case 'SHA-512':
                    return CryptoJS.SHA512(data).toString();
                case 'MD5':
                    return CryptoJS.MD5(data).toString();
                default:
                    throw new Error(`Unsupported hash algorithm: ${algorithm}`);
            }
        } catch (error) {
            logManager.error('Hashing failed:', error);
            throw error;
        }
    }

    // 生成随机值
    generateRandom(length) {
        return CryptoJS.lib.WordArray.random(length).toString();
    }

    // 安全比较
    secureCompare(a, b) {
        if (typeof a !== 'string' || typeof b !== 'string') {
            return false;
        }

        if (a.length !== b.length) {
            return false;
        }

        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    }

    // 清除敏感数据
    clearSensitiveData() {
        this.masterKey = null;
        this.initialized = false;
    }
}

export default new CryptoManager();
