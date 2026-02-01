const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const SOURCE_ICON = './icons/bio-logo.png';
const OUTPUT_DIR = './icons';

// All required sizes for PWA and Android Play Store
const sizes = [16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512];

async function generateIcons() {
    console.log('Loading source icon...');
    const image = await Jimp.read(SOURCE_ICON);

    for (const size of sizes) {
        const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
        const resized = image.clone().resize(size, size);
        await resized.writeAsync(outputPath);
        console.log(`✓ Generated: ${outputPath}`);
    }

    // Maskable icon with padding
    const maskable = image.clone().resize(410, 410);
    const background = new Jimp(512, 512, 0x0d0d0fff);
    background.composite(maskable, 51, 51);
    await background.writeAsync(path.join(OUTPUT_DIR, 'maskable-512x512.png'));
    console.log('✓ Generated: maskable-512x512.png');

    console.log('\n✅ All icons generated!');
}

generateIcons().catch(console.error);
