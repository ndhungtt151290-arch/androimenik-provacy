const data = require('./src/data/questions.json');
const fs = require('fs');

// Extract questions from scenarioGroups
const questions = data.scenarioGroups || [];
console.log('Tong so cau hoi trong scenarioGroups:', questions.length);

// Tao key de so sanh: stem + 3 text cua subs
function createCompareKey(q) {
    const subTexts = q.subs ? q.subs.slice(0, 3).map(s => s.text || '').join('|||') : '';
    return (q.stem || '') + '###' + subTexts;
}

// Tim cac cau trung lap (stem + 3 text)
const keyCount = {};

questions.forEach((q, idx) => {
    const key = createCompareKey(q);
    if (!keyCount[key]) {
        keyCount[key] = [];
    }
    keyCount[key].push({
        index: idx + 1,
        groupId: q.groupId,
        chapter: q.chapter,
        section: q.section,
        stem: q.stem,
        subs: q.subs ? q.subs.slice(0, 3).map(s => ({ text: s.text, answer: s.answer })) : []
    });
});

// Xuat ra file text
let output = '';
output += '=== BANG CAC CAU TRUNG LAP (stem + 3 text) ===\n';
output += 'Tong so cau hoi: ' + questions.length + '\n\n';

let dupCount = 0;
for (const key in keyCount) {
    if (keyCount[key].length > 1) {
        dupCount++;
        const first = keyCount[key][0];
        output += '============================================================\n';
        output += 'CAU TRUNG #' + dupCount + ' (xuat hien ' + keyCount[key].length + ' lan)\n';
        output += '============================================================\n\n';
        output += 'Stem: "' + first.stem + '"\n\n';
        
        first.subs.forEach((sub, i) => {
            output += 'Sub ' + (i + 1) + ': "' + sub.text + '" => ' + sub.answer + '\n';
        });
        
        output += '\n--- Cac phien ban (groupId) ---\n';
        keyCount[key].forEach((q, i) => {
            output += '  ' + (i + 1) + '. ' + q.groupId + '\n';
        });
        output += '\n';
    }
}

output += '============================================================\n';
output += 'TONG SO CAU TRUNG LAP: ' + dupCount + '\n';
output += '============================================================\n';

// Luu file
fs.writeFileSync('duplicates_output.txt', output, 'utf8');
console.log('Da luu vao file: duplicates_output.txt');
console.log('\nNoi dung file:');
console.log(output);
