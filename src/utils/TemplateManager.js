export class TemplateManager {
    static exportTemplates(templates) {
        const data = JSON.stringify(templates, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `quote-card-templates-${new Date().getTime()}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    static importTemplates(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const templates = JSON.parse(e.target.result);
                    // 验证模板格式
                    if (this.validateTemplates(templates)) {
                        resolve(templates);
                    } else {
                        reject(new Error('无效的模板文件格式'));
                    }
                } catch (error) {
                    reject(new Error('解析模板文件失败'));
                }
            };

            reader.onerror = () => reject(new Error('读取文件失败'));
            reader.readAsText(file);
        });
    }

    static validateTemplates(templates) {
        if (!Array.isArray(templates)) return false;

        return templates.every(template => {
            return (
                template.id &&
                template.name &&
                template.style &&
                typeof template.style === 'object'
            );
        });
    }
}
