const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const updateVersion = (type) => {
  const packagePath = path.join(__dirname, '../package.json');
  const manifestPath = path.join(__dirname, '../manifest.json');
  
  // 更新 package.json
  const pkg = require(packagePath);
  const currentVersion = pkg.version;
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  let newVersion;
  switch(type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
    default:
      throw new Error('Invalid version type');
  }
  
  pkg.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  
  // 更新 manifest.json
  const manifest = require(manifestPath);
  manifest.version = newVersion;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  // 更新 CHANGELOG.md
  const changelogPath = path.join(__dirname, '../CHANGELOG.md');
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  
  const newChangelog = changelog.replace(
    '## [未发布]',
    `## [未发布]\n\n## [${newVersion}] - ${today}`
  );
  
  fs.writeFileSync(changelogPath, newChangelog);
  
  // 提交更改
  execSync('git add package.json manifest.json CHANGELOG.md');
  execSync(`git commit -m "chore: release v${newVersion}"`);
  execSync(`git tag v${newVersion}`);
  
  console.log(`Version ${newVersion} prepared for release`);
  console.log('Run git push && git push --tags to publish');
};

const type = process.argv[2];
if (!['major', 'minor', 'patch'].includes(type)) {
  console.error('Please specify version type: major, minor, or patch');
  process.exit(1);
}

updateVersion(type); 