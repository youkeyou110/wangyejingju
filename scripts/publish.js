const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const semver = require('semver');
const { execSync } = require('child_process');
const { version } = require('../package.json');

// 版本检查
const checkVersion = () => {
    const manifest = require('../dist/manifest.json');
    if (semver.gt(manifest.version, version)) {
        throw new Error('manifest.json version is ahead of package.json');
    }
    if (semver.lt(manifest.version, version)) {
        console.log('Updating manifest.json version...');
        manifest.version = version;
        fs.writeFileSync(
            path.join(__dirname, '../dist/manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
    }
};

// 打包扩展
const packageExtension = () => {
    const output = fs.createWriteStream(
        path.join(__dirname, `../releases/extension-v${version}.zip`)
    );
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    return new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(output);
        archive.directory('dist/', false);
        archive.finalize();
    });
};

// 生成更新日志
const generateChangelog = () => {
    const commits = execSync('git log --pretty=format:"%s" $(git describe --tags --abbrev=0)..HEAD')
        .toString()
        .split('\n')
        .filter(msg => msg.match(/^(feat|fix|perf|refactor):/));

    const changes = {
        features: commits.filter(msg => msg.startsWith('feat:')),
        fixes: commits.filter(msg => msg.startsWith('fix:')),
        performance: commits.filter(msg => msg.startsWith('perf:')),
        refactors: commits.filter(msg => msg.startsWith('refactor:'))
    };

    const changelog = [
        `# Version ${version}`,
        '',
        '## Features',
        ...changes.features.map(msg => `- ${msg.slice(5)}`),
        '',
        '## Bug Fixes',
        ...changes.fixes.map(msg => `- ${msg.slice(4)}`),
        '',
        '## Performance Improvements',
        ...changes.performance.map(msg => `- ${msg.slice(5)}`),
        '',
        '## Refactors',
        ...changes.refactors.map(msg => `- ${msg.slice(9)}`)
    ].join('\n');

    fs.writeFileSync(
        path.join(__dirname, '../CHANGELOG.md'),
        changelog + '\n\n' + fs.readFileSync('CHANGELOG.md', 'utf8')
    );
};

// 主流程
const publish = async () => {
    try {
        console.log('Checking version...');
        checkVersion();

        console.log('Building extension...');
        execSync('npm run build', { stdio: 'inherit' });

        console.log('Generating changelog...');
        generateChangelog();

        console.log('Packaging extension...');
        await packageExtension();

        console.log('Publishing to Chrome Web Store...');
        // 这里需要集成 Chrome Web Store API
        // 使用 chrome-webstore-upload-cli 等工具

        console.log(`Successfully published version ${version}!`);
    } catch (error) {
        console.error('Publication failed:', error);
        process.exit(1);
    }
};

publish();
