class MarketManager {
    constructor(i18n, errorHandler) {
        this.i18n = i18n;
        this.errorHandler = errorHandler;
        this.apiEndpoint = 'https://api.template-market.example.com/v1';
        this.pageSize = 20;
    }

    async fetchTemplates(page = 1, filters = {}) {
        try {
            const params = new URLSearchParams({
                page,
                limit: this.pageSize,
                ...filters
            });

            const response = await fetch(`${this.apiEndpoint}/templates?${params}`);
            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }

            const data = await response.json();
            return {
                templates: data.templates,
                total: data.total,
                currentPage: page,
                totalPages: Math.ceil(data.total / this.pageSize)
            };
        } catch (error) {
            this.errorHandler.handleError(error, 'fetchTemplates');
            throw error;
        }
    }

    async getTemplateDetails(templateId) {
        try {
            const response = await fetch(`${this.apiEndpoint}/templates/${templateId}`);
            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }

            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'getTemplateDetails');
            throw error;
        }
    }

    async downloadTemplate(templateId) {
        try {
            const response = await fetch(`${this.apiEndpoint}/templates/${templateId}/download`);
            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }

            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'downloadTemplate');
            throw error;
        }
    }

    async searchTemplates(query, filters = {}) {
        try {
            const params = new URLSearchParams({
                q: query,
                ...filters
            });

            const response = await fetch(`${this.apiEndpoint}/search?${params}`);
            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }

            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'searchTemplates');
            throw error;
        }
    }

    async getCategories() {
        try {
            const response = await fetch(`${this.apiEndpoint}/categories`);
            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }

            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'getCategories');
            throw error;
        }
    }

    async getTags() {
        try {
            const response = await fetch(`${this.apiEndpoint}/tags`);
            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }

            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'getTags');
            throw error;
        }
    }

    async getPopular() {
        try {
            const response = await fetch(`${this.apiEndpoint}/templates/popular`);
            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }

            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'getPopular');
            throw error;
        }
    }

    async getNew() {
        try {
            const response = await fetch(`${this.apiEndpoint}/templates/new`);
            if (!response.ok) {
                throw new Error(this.i18n.getMessage('messages_error_network'));
            }

            return await response.json();
        } catch (error) {
            this.errorHandler.handleError(error, 'getNew');
            throw error;
        }
    }
}

export default MarketManager;
