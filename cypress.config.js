const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        baseUrl: 'chrome-extension://[extension-id]',
        setupNodeEvents(on, config) {
            require('@cypress/code-coverage/task')(on, config);
            return config;
        },
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',
        supportFile: 'cypress/support/e2e.js',
        viewportWidth: 1280,
        viewportHeight: 720,
        video: true,
        screenshotOnRunFailure: true,
        chromeWebSecurity: false,
        experimentalModifyObstructiveThirdPartyCode: true,
        defaultCommandTimeout: 10000,
        execTimeout: 60000,
        taskTimeout: 60000,
        pageLoadTimeout: 60000,
        requestTimeout: 10000,
        responseTimeout: 30000
    },

    component: {
        devServer: {
            framework: 'react',
            bundler: 'webpack'
        },
        specPattern: 'src/**/*.cy.{js,jsx}'
    },

    env: {
        coverage: true
    },

    reporter: 'cypress-multi-reporters',
    reporterOptions: {
        configFile: 'reporter-config.json'
    }
});
