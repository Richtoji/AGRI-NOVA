const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\1fef4066-7612-4c1e-ac47-4a8333d0e772';
const destDir = 'C:\\Users\\LENOVO\\Desktop\\AGRI-NOVA PROJECT\\public\\images';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const filesToCopy = [
  'media__1786691511064.png',
  'media__1786691538858.png',
  'media__1786691560897.jpg'
];

filesToCopy.forEach((file, index) => {
  const ext = path.extname(file);
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, `slide${index + 1}${ext}`);
  fs.copyFileSync(src, dest);
  console.log(`Copied ${file} to slide${index + 1}${ext}`);
});
