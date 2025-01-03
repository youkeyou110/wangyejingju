import '@cypress/code-coverage/support';
import './commands';

beforeEach(() => {
    // 重置覆盖率数据
    cy.window().then((win) => {
        win.__coverage__ = {};
    });
});

after(() => {
    // 合并所有测试的覆盖率数据
    cy.window().then((win) => {
        const coverage = win.__coverage__;
        cy.task('combineCoverage', coverage);
    });
});
