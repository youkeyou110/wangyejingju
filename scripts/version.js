const fs = require('fs');
const path = require('path');
const semver = require('semver');
const { execSync } = require('child_process');

// 更新版本号
const updateVersion = (type = 'patch') => {
    // 读取package.json
    const packagePath = path.resolve(__dirname, '../package.json');
    const package = require(packagePath);

    // 更新版本号
    const newVersion = semver.inc(package.version, type);
    package.version = newVersion;

    // 更新manifest.json
    const manifestPath = path.resolve(__dirname, '../src/manifest.json');
    const manifest = require(manifestPath);
    manifest.version = newVersion;

    // 写入文件
    fs.writeFileSync(packagePath, JSON.stringify(package, null, 2));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    // 生成更新日志
    generateChangelog(newVersion);

    // 提交更改
    commitChanges(newVersion);

    console.log(`Version updated to ${newVersion}`);
    return newVersion;
};

// 生成更新日志
const generateChangelog = (version) => {
    const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');
    const date = new Date().toISOString().split('T')[0];

    // 获取最近的提交记录
    const commits = execSync('git log --pretty=format:"%s" $(git describe --tags --abbrev=0)..HEAD')
        .toString()
        .split('\n')
        .filter(Boolean);

    // 生成更新内容
    const changes = commits.map(commit => `- ${commit}`).join('\n');

    // 更新日志内容
    const content = `# ${version} (${date})\n\n${changes}\n\n`;

    // 写入文件
    fs.writeFileSync(changelogPath, content + fs.readFileSync(changelogPath));
};

// 提交更改
const commitChanges = (version) => {
    execSync('git add package.json src/manifest.json CHANGELOG.md');
    execSync(`git commit -m "chore: bump version to ${version}"`);
    execSync(`git tag -a v${version} -m "version ${version}"`);
};

// 执行更新
const type = process.argv[2] || 'patch';
updateVersion(type);
