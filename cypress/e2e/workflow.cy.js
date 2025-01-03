describe('完整工作流测试', () => {
    beforeEach(() => {
        // 访问插件弹出页面
        cy.visit('/popup.html');
    });

    it('完成完整的金句卡片生成流程', () => {
        // 1. 文本编辑
        cy.get('[data-testid=text-input]')
            .type('这是一段测试文本')
            .should('have.value', '这是一段测试文本');

        // 2. 选择模板
        cy.get('[data-testid=template-select]')
            .click()
            .get('[data-testid=template-option-1]')
            .click();

        // 3. 自定义样式
        cy.get('[data-testid=style-editor]').within(() => {
            // 设置背景色
            cy.get('[data-testid=background-color]')
                .clear()
                .type('#f5f5f5');

            // 设置字体
            cy.get('[data-testid=font-family]')
                .select('Arial');

            // 设置字号
            cy.get('[data-testid=font-size]')
                .clear()
                .type('18');

            // 设置对齐方式
            cy.get('[data-testid=text-align-center]')
                .click();
        });

        // 4. 预览效果
        cy.get('[data-testid=preview-button]')
            .click();

        cy.get('[data-testid=preview-modal]')
            .should('be.visible')
            .within(() => {
                cy.get('[data-testid=preview-content]')
                    .should('contain', '这是一段测试文本');
            });

        // 5. 导出图片
        cy.get('[data-testid=export-button]')
            .click();

        cy.get('[data-testid=export-modal]')
            .should('be.visible')
            .within(() => {
                // 选择导出格式
                cy.get('[data-testid=format-select]')
                    .select('PNG');

                // 设置导出尺寸
                cy.get('[data-testid=width-input]')
                    .clear()
                    .type('800');
                cy.get('[data-testid=height-input]')
                    .clear()
                    .type('600');

                // 确认导出
                cy.get('[data-testid=confirm-export]')
                    .click();
            });

        // 验证导出结果
        cy.get('[data-testid=export-success]')
            .should('be.visible');
    });

    it('处理错误情况', () => {
        // 1. 空文本验证
        cy.get('[data-testid=generate-button]')
            .click();
        cy.get('[data-testid=error-message]')
            .should('contain', '请输入文本内容');

        // 2. 无效模板处理
        cy.get('[data-testid=text-input]')
            .type('测试文本');
        cy.get('[data-testid=template-select]')
            .click();
        cy.get('[data-testid=invalid-template]')
            .click();
        cy.get('[data-testid=error-message]')
            .should('contain', '模板加载失败');

        // 3. 导出失败处理
        cy.get('[data-testid=export-button]')
            .click();
        cy.get('[data-testid=format-select]')
            .select('INVALID');
        cy.get('[data-testid=confirm-export]')
            .click();
        cy.get('[data-testid=error-message]')
            .should('contain', '导出格式不支持');
    });

    it('测试性能指标', () => {
        // 记录操作时间
        cy.window().then((win) => {
            const startTime = performance.now();

            // 执行一系列操作
            cy.get('[data-testid=text-input]')
                .type('性能测试文本');
            cy.get('[data-testid=template-select]')
                .click()
                .get('[data-testid=template-option-1]')
                .click();
            cy.get('[data-testid=generate-button]')
                .click();

            // 验证性能指标
            const endTime = performance.now();
            const operationTime = endTime - startTime;
            expect(operationTime).to.be.lessThan(1000); // 操作时间应小于1秒
        });

        // 验证内存使用
        cy.window().then((win) => {
            if (win.performance.memory) {
                const memoryUsage = win.performance.memory.usedJSHeapSize;
                expect(memoryUsage).to.be.lessThan(50 * 1024 * 1024); // 内存使用应小于50MB
            }
        });
    });
});
