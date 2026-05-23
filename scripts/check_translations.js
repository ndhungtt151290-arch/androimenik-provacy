const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('src/data/questions.json', 'utf8'));

// Cấu trúc: { chapterOrder, simple: [...], scenarioGroups: [...] }
const data = raw.simple;

console.log(`Tổng số câu trong file: ${data.length}`);
console.log(`Kiểm tra 100 câu đầu...\n`);

const startIdx = 0;
const count = 1010;

const results = [];
let correct = 0;
let errors = 0;
let output = '';

console.log(`Tổng số câu trong file: ${data.length}`);
console.log(`Kiểm tra 100 câu đầu...\n`);

output += '='.repeat(80) + '\n';
output += `KẾT QUẢ KIỂM TRA ${count} CÂU ĐẦU (${startIdx + 1} - ${startIdx + count})\n`;
output += '='.repeat(80) + '\n';
output += `ĐÚNG: ${correct} | SAI: ${errors} | TỔNG: ${correct + errors}\n`;
output += '='.repeat(80) + '\n';

for (let i = startIdx; i < startIdx + count && i < data.length; i++) {
  const q = data[i];
  const num = i + 1;
  const jpText = q.text || '';
  const jpExpl = q.explanation || '';
  const viText = q.textVi || '';
  const viExpl = q.explanationVi || '';
  const answer = q.answer || '';
  const isCorrect = answer === '○';

  let hasError = false;
  let reasons = [];

  // ========== CHECK 1: Giải thích VI phải khớp với đáp án ==========
  const viExplLower = viExpl.toLowerCase();

  if (isCorrect) {
    const hasDung = /\b(dung|đúng|正しい|right|correct)\b/i.test(viExplLower);
    const hasSai = /\b(sai|誤り|wrong|incorrect|không đúng)\b/i.test(viExplLower);

    if (hasSai && !hasDung) {
      hasError = true;
      reasons.push('Câu ○ nhưng giải thích VI có "Sai"');
    }
  } else {
    const hasSai = /\b(sai|誤り|wrong|incorrect)\b/i.test(viExplLower);
    const hasDung = /\b(dung|đúng|正しい|right|correct)\b/i.test(viExplLower);

    if (hasDung && !hasSai) {
      hasError = true;
      reasons.push('Câu × nhưng giải thích VI có "Đúng"');
    }
  }

  // ========== CHECK 2: Cặp từ trái ngược ==========
  const jpLower = (jpText + jpExpl).toLowerCase();

  // 徐行 vs 停止 (giảm tốc vs dừng lại)
  if (jpLower.includes('徐行') && !jpLower.includes('停止') && !jpLower.includes('停車')) {
    if (/dừng (lại|hẳn)/i.test(viExpl) && isCorrect) {
      hasError = true;
      reasons.push('JP nói 徐行 (giảm tốc) nhưng VI nói "dừng lại"');
    }
  }

  // 追い越し vs 追い抜き (vượt vs đuổi kịp)
  if (jpLower.includes('追い越し') && !jpLower.includes('追い抜き')) {
    if (/đuổi kịp|ou?nuki/i.test(viExpl) && isCorrect) {
      hasError = true;
      reasons.push('JP nói 追い越し (vượt) nhưng VI nói 追い抜き (đuổi kịp)');
    }
  }

  // 追い抜き vs 追い越し
  if (jpLower.includes('追い抜き') && !jpLower.includes('追い越し')) {
    if (/vượt\s/i.test(viExpl) && isCorrect) {
      hasError = true;
      reasons.push('JP nói 追い抜き (đuổi kịp) nhưng VI nói 追い越し (vượt)');
    }
  }

  // ========== CHECK 3: 禁止 vs được phép ==========
  if (jpLower.includes('禁止') || jpLower.includes('禁じ')) {
    if (/được phép|có thể(?! không)|không (bị )?cấm/i.test(viExpl) && isCorrect) {
      hasError = true;
      reasons.push('JP nói 禁止 (cấm) nhưng VI nói "được phép"');
    }
  }

  // ========== CHECK 4: Bắt buộc vs không bắt buộc ==========
  if (jpLower.includes('ねばならない') || jpLower.includes('必須') || jpLower.includes('べき')) {
    if (/không (cần|bắt buộc|phải)/i.test(viExpl) && isCorrect) {
      hasError = true;
      reasons.push('JP nói bắt buộc nhưng VI nói không bắt buộc');
    }
  }

  // ========== CHECK 5: Copy paste JP vào VI ==========
  const jpRatio = (viText.match(/[\u3040-\u309F\u30A0-\u30FF]/g) || []).length;
  if (jpRatio > 20) {
    hasError = true;
    reasons.push('textVi chứa quá nhiều tiếng Nhật (copy paste JP)');
  }

  // ========== CHECK 6: Giải thích VI quá ngắn ==========
  if (jpExpl.length > 30 && viExpl.length < 5) {
    hasError = true;
    reasons.push('Giải thích VI quá ngắn hoặc thiếu');
  }

  // ========== CHECK 7: 原動機付自転車 vs 軽車両 ==========
  if (jpLower.includes('原動機付自転車') || jpLower.includes('原付')) {
    if (/\bxe đạp\b/i.test(viText) || /\bxe đạp nhẹ\b/i.test(viExpl)) {
      hasError = true;
      reasons.push('JP nói 原動機付自転車 (xe gắn máy) nhưng VI dịch thành xe đạp');
    }
  }

  if (jpLower.includes('軽車両')) {
    if (/\bxe gắn máy\b/i.test(viText) || /\bô tô\b/i.test(viText)) {
      hasError = true;
      reasons.push('JP nói 軽車両 (xe thô sơ) nhưng VI dịch thành xe gắn máy/ô tô');
    }
  }

  // ========== CHECK 8: Trái ngược nghĩa khác ==========
  // 左折 vs 右折
  if (jpLower.includes('左折') && !jpLower.includes('右折')) {
    if (/\brẽ phải\b/i.test(viText) || /\brẽ phải\b/i.test(viExpl)) {
      hasError = true;
      reasons.push('JP nói 左折 (rẽ trái) nhưng VI nói rẽ phải');
    }
  }

  if (jpLower.includes('右折') && !jpLower.includes('左折')) {
    if (/\brẽ trái\b/i.test(viText) || /\brẽ trái\b/i.test(viExpl)) {
      hasError = true;
      reasons.push('JP nói 右折 (rẽ phải) nhưng VI nói rẽ trái');
    }
  }

  if (hasError) {
    errors++;
    results.push({
      num,
      id: q.id,
      answer,
      reasons,
      jpText: jpText,
      jpExpl: jpExpl,
      viText: viText,
      viExpl: viExpl
    });
  } else {
    correct++;
  }
}

console.log('='.repeat(80));
console.log(`KẾT QUẢ KIỂM TRA ${count} CÂU ĐẦU (${startIdx + 1} - ${startIdx + count})`);
console.log('='.repeat(80));
console.log(`ĐÚNG: ${correct} | SAI: ${errors} | TỔNG: ${correct + errors}`);
console.log('='.repeat(80));

output += '='.repeat(80) + '\n';
output += `KẾT QUẢ KIỂM TRA ${count} CÂU ĐẦU (${startIdx + 1} - ${startIdx + count})\n`;
output += '='.repeat(80) + '\n';
output += `ĐÚNG: ${correct} | SAI: ${errors} | TỔNG: ${correct + errors}\n`;
output += '='.repeat(80) + '\n';

if (errors > 0) {
  const errMsg = `\n📋 DANH SÁCH CÂU SAI (${errors} câu):\n`;
  console.log(errMsg);
  output += errMsg;
  results.forEach((r, idx) => {
    const item = `[${idx + 1}] CÂU ${r.num} | ID: ${r.id} | Đáp án: ${r.answer}`;
    const item2 = `   JP (text): ${r.jpText}`;
    const item3 = `   JP (expl): ${r.jpExpl}`;
    const item4 = `   VI (text): ${r.viText}`;
    const item5 = `   VI (expl): ${r.viExpl}`;
    const item6 = `   ⚠️ LÝ DO: ${r.reasons.join(' | ')}`;
    const sep = '-'.repeat(80);
    console.log(`\n${item}\n   ${item2}\n   ${item3}\n   ${item4}\n   ${item5}\n   ${item6}\n${sep}`);
    output += `\n${item}\n   ${item2}\n   ${item3}\n   ${item4}\n   ${item5}\n   ${item6}\n${sep}\n`;
  });
} else {
  const okMsg = '\n✅ Tất cả các câu đều DỊCH ĐÚNG!';
  console.log(okMsg);
  output += okMsg + '\n';
}

// Lưu báo cáo ra file
const reportFile = `report_cau_${startIdx + 1}_${startIdx + count}.txt`;
fs.writeFileSync(reportFile, output, 'utf8');
console.log(`\n📁 Báo cáo đã lưu vào: ${reportFile}`);
