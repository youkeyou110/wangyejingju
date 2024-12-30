const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [16, 48, 128];
const sourceIcon = path.join(__dirname, '../src/icons/icon.png');
const outputDir = path.join(__dirname, '../src/icons');

async function generateIcons() {
    try {
        // 确保输出目录存在
        await fs.mkdir(outputDir, { recursive: true });

        // 为每个尺寸生成图标
        for (const size of sizes) {
            await sharp(sourceIcon)
                .resize(size, size)
                .toFile(path.join(outputDir, `icon${size}.png`));
        }

        console.log('图标生成成功！');
    } catch (error) {
        console.error('生成图标时出错:', error);
        process.exit(1);
    }
}

generateIcons();
