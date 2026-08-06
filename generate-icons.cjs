const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'icon.svg');
const sizes = [16, 32, 48, 128];

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(__dirname, 'public', `icon${size}.png`);
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated ${outputPath}`);
  }
}

generateIcons().catch(console.error);
