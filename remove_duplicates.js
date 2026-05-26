const data = require('./src/data/questions.json');
const fs = require('fs');

// Extract questions from scenarioGroups
const questions = data.scenarioGroups || [];
console.log('Tong so cau hoi ban dau:', questions.length);

// Tao key de so sanh: stem + 3 text cua subs
function createCompareKey(q) {
    const subTexts = q.subs ? q.subs.slice(0, 3).map(s => s.text || '').join('|||') : '';
    return (q.stem || '') + '###' + subTexts;
}

// Tim cac cau trung lap va danh sach groupId can xoa
const keyCount = {};

questions.forEach((q, idx) => {
    const key = createCompareKey(q);
    if (!keyCount[key]) {
        keyCount[key] = [];
    }
    keyCount[key].push({
        groupId: q.groupId,
        chapter: q.chapter,
        index: idx
    });
});

// Tim cac groupId thuoc 危険予測問題 can xoa
const groupIdsToRemove = [];

for (const key in keyCount) {
    if (keyCount[key].length > 1) {
        // Tim bản 危険予測 và 危険予測問題
        const kiken = keyCount[key].find(q => q.groupId.startsWith('危険予測::'));
        const kikenMondai = keyCount[key].find(q => q.groupId.startsWith('危険予測問題::'));
        
        // Neu co ca 2, xoa ban 危険予測問題
        if (kiken && kikenMondai) {
            groupIdsToRemove.push(kikenMondai.groupId);
            console.log('Can xoa: ' + kikenMondai.groupId + ' (trung voi ' + kiken.groupId + ')');
        }
    }
}

console.log('\nSo cau can xoa:', groupIdsToRemove.length);

// Loc bo cac cau can xoa
const filteredQuestions = questions.filter(q => !groupIdsToRemove.includes(q.groupId));
console.log('So cau con lai:', filteredQuestions.length);

// Cap nhat file JSON
data.scenarioGroups = filteredQuestions;
fs.writeFileSync('./src/data/questions.json', JSON.stringify(data, null, 2), 'utf8');

console.log('\nDa cap nhat file questions.json!');
console.log('Da xoa ' + groupIdsToRemove.length + ' cau trung lap.');
