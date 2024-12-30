const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [16, 32, 48, 128];
const inputFile = path.join(__dirname, '../src/images/icon.svg');
const outputDir = path.join(__dirname, '../src/images');

async function generateIcons() {
    try {
        // 确保输出目录存在
        await fs.mkdir(outputDir, { recursive: true });

        // 为每个尺寸生成图标
        for (const size of sizes) {
            await sharp(inputFile)
                .resize(size, size)
                .png()
                .toFile(path.join(outputDir, `icon${size}.png`));

            console.log(`Generated icon${size}.png`);
        }

        console.log('All icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
        process.exit(1);
    }
}

generateIcons();
