const data = require('./src/data/questions.json');
const fs = require('fs');
const path = require('path');

// Lay tat ca image tu 41 cau hien tai
const usedImages = new Set();
const questions = data.scenarioGroups || [];

questions.forEach(q => {
    if (q.subs) {
        q.subs.forEach(sub => {
            if (sub.image) {
                usedImages.add(sub.image);
            }
        });
    }
});

console.log('So image dang duoc su dung (41 cau): ' + usedImages.size);

// Lay tat ca file trong folder images
const imagesDir = './src/assets/images';
const allFiles = fs.readdirSync(imagesDir);

// Tim cac file can xoa (co trong folder nhung khong duoc su dung)
const toDelete = allFiles.filter(file => 
    file.endsWith('.png') && !usedImages.has(file)
);

console.log('\nSo image can xoa: ' + toDelete.length);
console.log('\nDanh sach image can xoa:');
toDelete.forEach(f => console.log('  ' + f));

// Xoa cac file
let deleted = 0;
toDelete.forEach(file => {
    const filePath = path.join(imagesDir, file);
    fs.unlinkSync(filePath);
    deleted++;
    console.log('Da xoa: ' + file);
});

console.log('\n========================================');
console.log('Da xoa ' + deleted + ' image.');
console.log('Con lai ' + usedImages.size + ' image dang su dung.');
