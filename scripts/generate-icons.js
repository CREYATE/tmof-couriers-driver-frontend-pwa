// This script would generate different icon sizes from tmof-logo.png
// For now, we'll copy the existing logo to the required names and sizes

const fs = require('fs');
const path = require('path');

// Copy tmof-logo.png to different names for now
// In production, you'd want to resize these to exact dimensions

const publicDir = path.join(__dirname, '../public');
const logoPath = path.join(publicDir, 'tmof-logo.png');

// Copy logo to different required names
const iconPaths = [
  'tmof-logo-192.png',
  'tmof-logo-512.png',
  'icon-192x192.png', // For apple-touch-icon
  'icon-512x512.png'
];

iconPaths.forEach(iconName => {
  const targetPath = path.join(publicDir, iconName);
  fs.copyFileSync(logoPath, targetPath);
  console.log(`Created ${iconName}`);
});

console.log('Icon generation complete!');
console.log('Note: For production, resize images to exact dimensions:');
console.log('- favicon.ico: 16x16, 32x32, 48x48');
console.log('- tmof-logo-192.png: 192x192');
console.log('- tmof-logo-512.png: 512x512');