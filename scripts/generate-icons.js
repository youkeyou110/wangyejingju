const sharp = require('sharp');
const path = require('path');

const sizes = [16, 32, 48, 128];
const svgPath = path.join(__dirname, '../assets/icon.svg');

async function generateIcons() {
  try {
    for (const size of sizes) {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, `../assets/icon${size}.png`));

      console.log(`Generated icon${size}.png`);
    }
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
