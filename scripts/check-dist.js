const fs = require('fs');
const path = require('path');

function checkDirectory(dir, structure = null) {
  const expectedStructure = structure || {
    '_locales': {
      'en': ['messages.json'],
      'zh_CN': ['messages.json']
    },
    'assets': ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'],
    'background': ['background.js'],
    'content': ['content.js'],
    'popup': ['popup.html', 'popup.js', 'popup.css'],
    '': ['manifest.json']  // root level files
  };

  let hasError = false;

  // 检查每个目录
  for (const [directory, expected] of Object.entries(expectedStructure)) {
    const dirPath = path.join(dir, directory);

    // 检查目录是否存在
    if (!fs.existsSync(dirPath)) {
      console.error(`❌ Missing directory: ${directory}`);
      hasError = true;
      continue;
    }

    // 如果是嵌套结构，递归检查
    if (typeof expected === 'object' && !Array.isArray(expected)) {
      const subResult = checkDirectory(dirPath, expected);
      hasError = hasError || subResult;
    }
    // 如果是文件列表，检查文件
    else if (Array.isArray(expected)) {
      for (const file of expected) {
        const filePath = path.join(dirPath, file);
        if (!fs.existsSync(filePath)) {
          console.error(`❌ Missing file: ${directory}/${file}`);
          hasError = true;
        } else {
          console.log(`✅ Found: ${directory}/${file}`);
        }
      }
    }
  }

  return hasError;
}

// 检查 dist 目录
const hasError = checkDirectory(path.join(__dirname, '../dist'));
if (hasError) {
  console.error('\n❌ Directory structure check failed!');
  process.exit(1);
} else {
  console.log('\n✅ Directory structure check passed!');
}
