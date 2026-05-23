const fs = require('fs');

const questionsPath = './src/data/questions.json';
const auditPath = './translation_audit.json';

// Đọc files
let questionsContent = fs.readFileSync(questionsPath, 'utf-8');
if (questionsContent.charCodeAt(0) === 0xFEFF) {
  questionsContent = questionsContent.slice(1);
}
const questionsData = JSON.parse(questionsContent);

const auditContent = fs.readFileSync(auditPath, 'utf-8');
const auditData = JSON.parse(auditContent);

// Các sửa đổi đã biết (được xác minh thủ công)
const knownFixes = {
  'menkyogentsuki_gentsuki_9_6_2': {
    textVi: 'Khi cảnh sát giơ tay ngang, đối với giao thông đi qua (cắt ngang) có ý nghĩa tương đương đèn tín hiệu xanh.',
    reason: '平行する交通 = giao thông đi qua/cắt ngang, không phải "giao thông song song"'
  },
  'menkyogentsuki_gentsuki_9_3_1': {
    textVi: 'Đi guốc hoặc giày cao gót để lái xe hai bánh là rất nguy hiểm.',
    reason: 'Câu đã dịch đúng, chỉ là script đánh giá sai'
  },
};

// Các cặp thuật ngữ cần thay thế nếu có trong câu
const termFixes = [
  // [pattern cũ, pattern mới, lý do]
  ['giao thông song song', 'giao thông đi qua (cắt ngang)', 'sai thuật ngữ'],
];

let fixedCount = 0;
let errors = [];

// Tạo map để tra cứu nhanh
const questionMap = new Map();
for (const q of questionsData.simple) {
  questionMap.set(q.id, q);
}

console.log('=== BẮT ĐẦU SỬA BẢN DỊCH ===\n');

for (const auditItem of auditData) {
  const id = auditItem.id;
  const question = questionMap.get(id);

  if (!question) {
    console.log(`[BỎ QUA] Không tìm thấy câu hỏi: ${id}`);
    continue;
  }

  let fixed = false;
  let fixReason = '';

  // 1. Kiểm tra knownFixes trước
  if (knownFixes[id]) {
    const fix = knownFixes[id];
    question.textVi = fix.textVi;
    fixed = true;
    fixReason = fix.reason;
  }

  // 2. Áp dụng các sửa đổi thuật ngữ chung
  for (const [oldPattern, newPattern, reason] of termFixes) {
    if (question.textVi && question.textVi.includes(oldPattern)) {
      question.textVi = question.textVi.replace(oldPattern, newPattern);
      fixed = true;
      fixReason = reason;
    }
  }

  if (fixed) {
    fixedCount++;
    console.log(`[SỬA] ${id}`);
    console.log(`      Lý do: ${fixReason}`);
    console.log(`      Mới: ${question.textVi}`);
    console.log('');
  }
}

// Ghi file
fs.writeFileSync(questionsPath, JSON.stringify(questionsData, null, 2), 'utf-8');

console.log('='.repeat(60));
console.log(`\nĐã sửa ${fixedCount} câu trong questions.json`);
console.log(`File: ${questionsPath}`);
