const sharp = require('sharp');

// 创建一个简单的SVG图标
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#1890ff"/>
    <text x="50%" y="50%" font-size="240" fill="white" text-anchor="middle" dy=".3em">Q</text>
</svg>
`;

// 将SVG转换为PNG
sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .png()
    .toFile('src/icons/icon.png')
    .then(() => {
        console.log('基础图标创建成功！');
    })
    .catch(err => {
        console.error('创建图标失败:', err);
    });
