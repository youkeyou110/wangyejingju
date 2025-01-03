const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const semver = require('semver');
const { version } = require('../package.json');

// 部署配置
const config = {
    env: process.env.NODE_ENV || 'production',
    version,
    outputDir: 'dist',
    manifestPath: 'src/manifest.json',
    buildCommand: 'npm run build',
    zipCommand: 'npm run zip',
    deployCommand: 'npm run deploy:store'
};

// 版本检查
const checkVersion = () => {
    const manifest = require(`../${config.manifestPath}`);
    if (semver.gt(manifest.version, version)) {
        throw new Error('manifest.json version is ahead of package.json');
    }
    if (semver.lt(manifest.version, version)) {
        console.log('Updating manifest.json version...');
        manifest.version = version;
        fs.writeFileSync(
            path.join(__dirname, '..', config.manifestPath),
            JSON.stringify(manifest, null, 2)
        );
    }
};

// 构建项目
const build = () => {
    console.log('Building project...');
    execSync(config.buildCommand, { stdio: 'inherit' });
};

// 打包扩展
const package = () => {
    console.log('Packaging extension...');
    execSync(config.zipCommand, { stdio: 'inherit' });
};

// 发布到商店
const deployToStore = () => {
    console.log('Deploying to store...');
    execSync(config.deployCommand, { stdio: 'inherit' });
};

// 主流程
const deploy = async () => {
    try {
        // 检查版本
        checkVersion();

        // 构建项目
        build();

        // 打包扩展
        package();

        // 发布到商店
        if (config.env === 'production') {
            deployToStore();
        }

        console.log('Deployment completed successfully!');
    } catch (error) {
        console.error('Deployment failed:', error);
        process.exit(1);
    }
};

deploy();
