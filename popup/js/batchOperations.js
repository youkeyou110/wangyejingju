class BatchOperations {
    constructor(batchManager, i18n) {
        this.batchManager = batchManager;
        this.i18n = i18n;
        this.container = null;
    }

    init(container) {
        this.container = container;
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="batch-operations">
                <div class="batch-buttons">
                    <label class="batch-button import">
                        <input type="file" id="batchImport" accept=".json" multiple hidden />
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                        </svg>
                        ${this.i18n.getMessage('batch_import')}
                    </label>
                    <button class="batch-button export">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                        </svg>
                        ${this.i18n.getMessage('batch_export')}
                    </button>
                </div>
                <div class="batch-progress hidden">
                    <div class="progress-bar">
                        <div class="progress-value"></div>
                    </div>
                    <div class="progress-text"></div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 批量导入
        const importInput = this.container.querySelector('#batchImport');
        importInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            try {
                this.showProgress();
                let totalSuccess = 0;
                let totalFailed = 0;

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const results = await this.batchManager.importTemplates(file);
                    totalSuccess += results.success;
                    totalFailed += results.failed;

                    this.updateProgress(
                        (i + 1) / files.length * 100,
                        this.i18n.getMessage('batch_progress_importing', {
                            current: i + 1,
                            total: files.length
                        })
                    );
                }

                this.showResults(totalSuccess, totalFailed);
                importInput.value = '';
            } catch (error) {
                // 错误已由 BatchManager 处理
            } finally {
                this.hideProgress();
            }
        });

        // 批量导出
        this.container.querySelector('.export').addEventListener('click', async () => {
            try {
                const count = await this.batchManager.exportTemplates();
                alert(this.i18n.getMessage('batch_export_success', { count }));
            } catch (error) {
                // 错误已由 BatchManager 处理
            }
        });
    }

    showProgress() {
        const progress = this.container.querySelector('.batch-progress');
        progress.classList.remove('hidden');
    }

    hideProgress() {
        const progress = this.container.querySelector('.batch-progress');
        progress.classList.add('hidden');
    }

    updateProgress(percent, text) {
        const progressBar = this.container.querySelector('.progress-value');
        const progressText = this.container.querySelector('.progress-text');
        progressBar.style.width = `${percent}%`;
        progressText.textContent = text;
    }

    showResults(success, failed) {
        alert(this.i18n.getMessage('batch_import_results', {
            success,
            failed
        }));
    }
}

export default BatchOperations;
