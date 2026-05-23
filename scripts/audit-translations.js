const fs = require('fs');
const path = require('path');

const filePath = './src/data/questions.json';
const outputPath = './translation_audit.json';

let content = fs.readFileSync(filePath, 'utf-8');
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}

const data = JSON.parse(content);

// Các thuật ngữ giao thông quan trọng cần kiểm tra
const IMPORTANT_TERMS = {
  // Từ ghép quan trọng
  '停止': 'dừng xe/ngừng',
  '徐行': 'đi chậm',
  '駐停車': 'đỗ xe và dừng xe',
  '交差点': 'ngã tư/giao lộ',
  '横断': 'băng qua',
  '通行': 'lưu thông',
  '優先': 'ưu tiên',
  '義務': 'nghĩa vụ',
  '違反': 'vi phạm',
  '信号': 'tín hiệu đèn/đèn tín hiệu',
  '標識': 'biển báo',
  '標示': 'vạch kẻ/mark',
  '最高速度': 'tốc độ tối đa',
  '最低速度': 'tốc độ tối thiểu',
  '一方通行': 'một chiều',
  '右折': 'rẽ phải',
  '左折': 'rẽ trái',
  '直進': 'đi thẳng',
  '追い越し': 'vượt (có chuyển làn)',
  '追い抜き': 'đi qua/vượt',
  '前方': 'phía trước',
  '后方': 'phía sau',
  '安全': 'an toàn',
  '確認': 'xác nhận/kiểm tra',
  '注意': 'chú ý/cẩn thận',
  '制限': 'giới hạn/hạn chế',
  '飲酒': 'uống rượu',
  '酔っ': 'say/rượu',
  '無謀': 'liều lĩnh',
  '急': 'đột ngột/nhanh',
  '危険': 'nguy hiểm',
  '禁止': 'cấm',
  '必須': 'bắt buộc',
  '放置': 'để đó/bỏ mặc',
  '超過': 'vượt quá',
  '保持': 'giữ/duy trì',
  '距離': 'khoảng cách',
  '車間': 'khoảng cách giữa các xe',
  '前方注': 'chú ý phía trước',
  '左右': 'trái phải',
  '横断者': 'người băng qua',
  '歩行者': 'người đi bộ',
  '自転車': 'xe đạp',
  '大型': 'xe lớn/lớn',
  '中型': 'xe trung',
  '小型': 'xe nhỏ',
  '積載': 'chở/xếp',
  '整備': 'bảo dưỡng',
  '点検': 'kiểm tra',
  '検査': 'kiểm định',
  '有効': 'có hiệu lực/còn hạn',
  '期限': 'thời hạn',
  '応急': 'sơ cứu/cấp cứu',
  '急救': 'cấp cứu',
  '義務教育': 'giáo dục bắt buộc',
};

// Các cụm từ tiếng Nhật cần dịch chính xác
const CRITICAL_PHRASES = [
  'なければならない',
  'なければらない',
  '際しては',
  'において',
  'についての',
  'ようなとき',
  'ことができる',
  '年以来',
  '日以内',
  'メートル以内',
  '時より',
];

// Ngưỡng để flag
const LENGTH_RATIO_MIN = 0.3;  // Tiếng Việt phải >= 30% độ dài tiếng Nhật
const LENGTH_RATIO_MAX = 3.0;  // Tiếng Việt không nên > 3 lần tiếng Nhật

/**
 * Kiểm tra xem có thuật ngữ quan trọng nào bị thiếu trong bản dịch
 */
function checkMissingTerms(japanese, vietnamese) {
  const missing = [];
  const jpnLower = japanese.toLowerCase();
  const vieLower = vietnamese.toLowerCase();

  for (const [term, meaning] of Object.entries(IMPORTANT_TERMS)) {
    if (japanese.includes(term)) {
      // Kiểm tra xem ý nghĩa của thuật ngữ có trong tiếng Việt không
      const termKeywords = meaning.split(/[\/,\s]+/).filter(w => w.length >= 2);
      const hasTranslation = termKeywords.some(keyword => vieLower.includes(keyword.toLowerCase()));

      if (!hasTranslation) {
        missing.push({ term, expected: meaning });
      }
    }
  }

  return missing;
}

/**
 * Kiểm tra các cụm từ quan trọng có bị mất không
 */
function checkCriticalPhrases(japanese, vietnamese) {
  const missing = [];

  for (const phrase of CRITICAL_PHRASES) {
    if (japanese.includes(phrase)) {
      // Kiểm tra xem cụm từ này có được diễn đạt trong tiếng Việt không
      // (đây là kiểm tra đơn giản - không hoàn hảo)
      const hasPhrase = vietnamese.includes(phrase) ||
        // Hoặc có từ khóa liên quan
        (phrase.includes('以内') && vietnamese.includes('trong') && vietnamese.includes('khoảng')) ||
        (phrase.includes('メートル') && vietnamese.includes('mét')) ||
        (phrase.includes('年以来') && vietnamese.includes('năm')) ||
        (phrase.includes('日以内') && (vietnamese.includes('ngày') || vietnamese.includes('ngày')));

      if (!hasPhrase) {
        missing.push(phrase);
      }
    }
  }

  return missing;
}

/**
 * Kiểm tra độ dài bất thường
 */
function checkAbnormalLength(japanese, vietnamese) {
  const jpnLen = japanese.length;
  const vieLen = vietnamese.replace(/<[^>]*>/g, '').length; // Loại bỏ HTML tags

  const ratio = vieLen / jpnLen;

  if (ratio < LENGTH_RATIO_MIN) {
    return `Bản dịch quá ngắn (tỷ lệ: ${ratio.toFixed(2)}, ngưỡng tối thiểu: ${LENGTH_RATIO_MIN})`;
  }
  if (ratio > LENGTH_RATIO_MAX) {
    return `Bản dịch quá dài (tỷ lệ: ${ratio.toFixed(2)}, ngưỡng tối đa: ${LENGTH_RATIO_MAX})`;
  }

  return null;
}

/**
 * Kiểm tra các thuật ngữ dễ bị dịch sai
 */
function checkSuspiciousTerms(vietnamese) {
  const issues = [];
  const vieLower = vietnamese.toLowerCase();

  // Các cặp thuật ngữ dễ nhầm lẫn
  const ambiguousTerms = {
    'đi chậm': ['dừng', 'đỗ', 'đậu', 'đỗ xe'],
    'dừng xe': ['đỗ', 'đậu', 'đỗ xe'],
    'đỗ xe': ['dừng', 'đậu'],
    'vượt': ['đi qua', 'chạy qua'],
  };

  // Kiểm tra độ dài từ quá ngắn
  const words = vietnamese.split(/\s+/).filter(w => w.length > 0);
  if (words.some(w => w.length === 1 || w === 'a' || w === 'i')) {
    // Có thể là lỗi gõ
  }

  return issues;
}

/**
 * Tính điểm độ tương đồng đơn giản dựa trên từ khóa
 */
function calculateSimilarityScore(japanese, vietnamese) {
  let score = 0;
  let totalWeight = 0;

  // Trọng số cho các loại từ khóa
  const keywordWeights = {
    // Thập phân cao (2.0)
    '違反': 2.0, '禁止': 2.0, '義務': 2.0, '認め': 2.0, 'なら': 2.0, '必須': 2.0,
    // Thập phân trung bình (1.5)
    '場合': 1.5, 'とき': 1.5, ' Meter': 1.5, '以内': 1.5, 'より': 1.5, '以来': 1.5,
    // Thập phân thấp (1.0)
    'する': 1.0, 'ない': 1.0, 'ある': 1.0, 'れる': 1.0, 'でき': 1.0,
  };

  for (const [keyword, weight] of Object.entries(keywordWeights)) {
    if (japanese.includes(keyword)) {
      totalWeight += weight;
      // Kiểm tra xem có từ liên quan trong tiếng Việt không
      const hasRelated = vietnamese.includes('vi phạm') ||
        vietnamese.includes('cấm') ||
        vietnamese.includes('nghĩa vụ') ||
        vietnamese.includes('trường hợp') ||
        vietnamese.includes('khi') ||
        vietnamese.includes('phải') ||
        vietnamese.includes('được') ||
        vietnamese.includes('có thể');

      if (hasRelated) {
        score += weight;
      }
    }
  }

  return totalWeight > 0 ? score / totalWeight : 1;
}

/**
 * Phân tích một câu hỏi
 */
function analyzeQuestion(question) {
  const id = question.id || question._id || 'unknown';
  const japanese = question.text || question.japaneseContent || '';
  const vietnamese = question.textVi || question.vietnameseContent || '';
  const explanationVi = question.explanationVi || question.explanationViet || '';

  const flags = [];
  const reasons = [];

  // Ghép nội dung để kiểm tra đầy đủ hơn
  const fullViet = vietnamese + ' ' + explanationVi;

  // 1. Kiểm tra độ dài bất thường
  const lengthIssue = checkAbnormalLength(japanese, vietnamese);
  if (lengthIssue) {
    flags.push('LENGTH_ISSUE');
    reasons.push(lengthIssue);
  }

  // 2. Kiểm tra thuật ngữ bị thiếu
  const missingTerms = checkMissingTerms(japanese, fullViet);
  if (missingTerms.length > 0) {
    flags.push('MISSING_TERMS');
    reasons.push(`Thiếu thuật ngữ: ${missingTerms.map(t => `"${t.term}" (→ ${t.expected})`).join(', ')}`);
  }

  // 3. Kiểm tra cụm từ quan trọng bị mất
  const missingPhrases = checkCriticalPhrases(japanese, fullViet);
  if (missingPhrases.length > 0) {
    flags.push('MISSING_PHRASES');
    reasons.push(`Thiếu cụm từ: ${missingPhrases.join(', ')}`);
  }

  // 4. Kiểm tra thuật ngữ nghi ngờ
  const suspicious = checkSuspiciousTerms(vietnamese);
  if (suspicious.length > 0) {
    flags.push('SUSPICIOUS_TERMS');
    reasons.push(...suspicious);
  }

  // 5. Tính điểm tương đồng
  const similarity = calculateSimilarityScore(japanese, fullViet);
  if (similarity < 0.4) {
    flags.push('LOW_SIMILARITY');
    reasons.push(`Điểm tương đồng thấp: ${(similarity * 100).toFixed(0)}%`);
  }

  return {
    id,
    japanese,
    vietnamese,
    flags,
    reason: reasons.length > 0 ? reasons.join('; ') : null,
    similarity: (similarity * 100).toFixed(0) + '%'
  };
}

/**
 * Lấy tất cả câu hỏi từ cấu trúc data
 */
function extractQuestions(data) {
  const questions = [];

  // Cấu trúc: data.simple = [{ id, text, textVi, explanation, explanationVi, ... }, ...]
  if (data.simple && Array.isArray(data.simple)) {
    questions.push(...data.simple);
  }

  // Cấu trúc khác: data.chapters hoặc các mảng khác
  if (data.chapters && Array.isArray(data.chapters)) {
    for (const chapter of data.chapters) {
      if (chapter.questions && Array.isArray(chapter.questions)) {
        questions.push(...chapter.questions);
      }
    }
  }

  // Duyệt tất cả key của data
  for (const key of Object.keys(data)) {
    if (key === 'simple' || key === 'chapters' || key === 'chapterOrder') continue;
    const value = data[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item.questions && Array.isArray(item.questions)) {
          questions.push(...item.questions);
        } else if (item.id && (item.text || item.textVi)) {
          questions.push(item);
        }
      }
    }
  }

  return questions;
}

// Main execution
console.log('=== BẮT ĐẦU KIỂM TRA BẢN DỊCH ===\n');

const questions = extractQuestions(data);
console.log(`Tổng số câu hỏi: ${questions.length}\n`);

const auditResults = [];
let flaggedCount = 0;

for (const question of questions) {
  const result = analyzeQuestion(question);

  if (result.reason) {
    flaggedCount++;
    auditResults.push({
      id: result.id,
      japanese: result.japanese,
      vietnamese: result.vietnamese,
      reason: result.reason,
      flags: result.flags,
      similarity: result.similarity
    });
  }
}

// Sắp xếp theo mức độ nghiêm trọng
auditResults.sort((a, b) => {
  const priorityOrder = ['MISSING_TERMS', 'LOW_SIMILARITY', 'LENGTH_ISSUE', 'MISSING_PHRASES', 'SUSPICIOUS_TERMS'];
  return priorityOrder.indexOf(a.flags[0]) - priorityOrder.indexOf(b.flags[0]);
});

// In kết quả ra console
console.log('=== KẾT QUẢ KIỂM TRA ===\n');
console.log(`Số câu hỏi cần xem xét: ${flaggedCount}/${questions.length} (${(flaggedCount/questions.length*100).toFixed(1)}%)\n`);

// Thống kê theo loại lỗi
const errorStats = {};
for (const result of auditResults) {
  for (const flag of result.flags) {
    errorStats[flag] = (errorStats[flag] || 0) + 1;
  }
}

console.log('Thống kê lỗi:');
for (const [error, count] of Object.entries(errorStats)) {
  console.log(`  ${error}: ${count}`);
}

console.log('\n' + '-'.repeat(60));
console.log('DANH SÁCH CÂU HỎI NGHI NGỜ (10 câu đầu tiên):\n');

for (let i = 0; i < Math.min(10, auditResults.length); i++) {
  const r = auditResults[i];
  console.log(`[${i + 1}] ID: ${r.id}`);
  console.log(`    Flags: ${r.flags.join(', ')}`);
  console.log(`    Lý do: ${r.reason}`);
  console.log(`    Độ tương đồng: ${r.similarity}`);
  console.log(`    Tiếng Nhật: ${r.japanese.substring(0, 100)}${r.japanese.length > 100 ? '...' : ''}`);
  console.log(`    Tiếng Việt: ${r.vietnamese.substring(0, 100)}${r.vietnamese.length > 100 ? '...' : ''}`);
  console.log('');
}

// Ghi file báo cáo
fs.writeFileSync(outputPath, JSON.stringify(auditResults, null, 2), 'utf-8');

console.log('='.repeat(60));
console.log(`\nFile báo cáo đã được lưu: ${outputPath}`);
console.log(`Tổng số câu cần xem xét: ${auditResults.length}`);
