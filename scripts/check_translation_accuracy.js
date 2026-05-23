/**
 * Script kiểm tra độ chính xác bản dịch tiếng Việt trong questions.json
 * Chỉ báo cáo khi 30% đầu câu Nhật và Việt hoàn toàn khác bối cảnh
 * (VD: một bên nói về biển báo, một bên nói về kỹ thuật lái xe)
 *
 * Chạy: node scripts/check_translation_accuracy.js
 */

const fs = require('fs');

const INPUT_FILE = './src/data/questions.json';
const OUTPUT_FILE = './translation_mismatch_report.json';

// ── Từ điển chuyên ngành luật giao thông Nhật → Việt ──────────────────────
// Cụm từ có nghĩa cốt lõi (ưu tiên dài → ngắn)
const CORE_TERMS = [
  // === Bối cảnh BIỂN BÁO / ĐÁNH DẤU ===
  ['標識', 'biển báo'], ['この標識', 'biển báo này'], ['この標識のある', 'nơi có biển báo'],
  ['標示', 'biển chỉ'], ['この標示', 'biển chỉ này'], ['この標示のある', 'nơi có biển chỉ'],
  ['マーク', 'dấu hiệu'], ['このマーク', 'dấu hiệu này'],
  ['信号', 'đèn tín hiệu'], ['青色信号', 'đèn xanh'], ['黄色信号', 'đèn vàng'],
  ['赤色信号', 'đèn đỏ'], ['信号機', 'đèn tín hiệu'],

  // === Bối cảnh TỐC ĐỘ / GIỚI HẠN ===
  ['制限速度', 'tốc độ giới hạn'], ['最高速度', 'tốc độ tối đa'],
  ['時速', 'km/h'], ['的速度', 'tốc độ'], ['速度を', 'tốc độ'], ['速度違反', 'vi phạm tốc độ'],
  [' Acceleration', ''],

  // === Bối cảnh ĐƯỜNG / KẾT CẤU ===
  ['道路', 'đường'], ['交差点', 'giao lộ/ngã tư'], ['交差点付近', 'gần ngã tư'],
  ['横断歩道', 'vạch qua đường/đường dành cho người đi bộ'],
  ['自転車横断帯', 'làn đường cho xe đạp'], ['步行者専用道路', 'đường dành cho người đi bộ'],
  ['軽車両', 'xe nhẹ'], ['歩行者専用', 'người đi bộ riêng'],
  ['車両通行帯', 'làn đường'], ['通行帯', 'làn đường'],
  ['黄色の線', 'vạch vàng'], ['白色の線', 'vạch trắng'],
  ['中央線', 'đường giữa'], ['路側', 'lề đường'],
  ['踏切', 'lối qua đường sắt'], ['トンネル', 'đường hầm'],
  ['坂', 'dốc'], ['カーブ', 'cua'], ['頂上', 'đỉnh dốc'],
  ['幅', 'bề rộng'], ['狭い', 'hẹp'], ['狭隘', 'hẹp'],
  ['凍結', 'đóng băng'], ['視界', 'tầm nhìn'],

  // === Bối cảnh LÁI XE / HÀNH VI ===
  ['追い越し', 'vượt'], ['追い越し禁止', 'cấm vượt'],
  ['追い越し', 'vượt'], ['追い抜き', 'vượt'], ['，右折', 'rẽ phải'], ['，左折', 'rẽ trái'],
  ['右折', 'rẽ phải'], ['左折', 'rẽ trái'], ['直進', 'đi thẳng'],
  ['徐行', 'đi chậm'], ['駐停車', 'đỗ xe'], ['駐車', 'đỗ xe'], ['，停車', 'dừng xe'],
  ['停車', 'dừng xe'], ['駐停車禁止', 'cấm đỗ xe'],
  ['车内', 'trong xe'], ['乗客', 'hành khách'], ['乗車', 'lên xe'], ['降車', 'xuống xe'],
  ['乘客', 'hành khách'], ['正しく', 'đúng cách'],
  ['车内通話', 'nói chuyện trong xe'],

  // === Bối cảnh BIỂN BÁO / QUY TẮC ===
  ['優先道路', 'đường ưu tiên'], ['優先', 'ưu tiên'],
  ['緊急自動車', 'xe ưu tiên'], ['パトカー', 'xe tuần tra'],
  ['制限', 'giới hạn'], ['禁止', 'cấm'], ['義務', 'bắt buộc'],
  ['横断禁止', 'cấm băng qua'], ['喇叭', 'còi'], ['クラクション', 'còi xe'],
  ['指導', 'hướng dẫn'], ['警告', 'cảnh cáo'],

  // === Bối cảnh PHƯƠNG TIỆN ===
  ['原動機付自転車', 'xe gắn máy'], ['原付', 'xe gắn máy'],
  ['四輪車', 'xe bốn bánh'], ['二輪車', 'xe hai bánh'],
  ['自動車', 'ô tô'], ['トラック', 'xe tải'], ['バス', 'xe buýt'],
  ['大型', 'cỡ lớn'], ['中型', 'cỡ trung'], ['小型', 'cỡ nhỏ'],
  ['側車', 'xe có cầu'],

  // === Bối cảnh GIẤY TỜ / PHÁP LÝ ===
  ['免許', 'bằng lái'], ['違反', 'vi phạm'], ['違反点', 'điểm vi phạm'],
  ['保険', 'bảo hiểm'], ['登録', 'đăng ký'],

  // === Bối cảnh AN TOÀN / TÌNH HUỐNG ===
  ['饮酒', 'uống rượu'], ['酒', 'rượu'], ['酔っ', 'say'],
  ['疲労', 'mệt mỏi'], ['眠気', 'buồn ngủ'], ['危険', 'nguy hiểm'],
  ['衝突', 'va chạm'], ['追突', 'va chạm từ phía sau'],
  ['制動', 'phanh'], ['ブレーキ', 'phanh'], ['(inner)', 'nội tuyến'],
  ['内輪差', 'hiệu số trong'],
  ['すり抜け', 'lọt giữa các xe (kẹt)'], ['車間距離', 'khoảng cách'],
  ['遠心力', 'lực ly tâm'], ['加速度', 'gia tốc'], ['慣性', 'quán tính'],
  ['スリップ', 'trượt'], [' 横滑り', 'trượt ngang'],

  // === Bối cảnh THỜI TIẾT / MÔI TRƯỜNG ===
  ['夜間', 'ban đêm'], ['雨天', 'trời mưa'], ['悪天候', 'thời tiết xấu'],
  ['霧', 'sương mù'], ['凍結', 'đóng băng'],
  ['高齢者', 'người cao tuổi'], ['子供', 'trẻ em'],
];

// Loại bỏ entries rỗng
const TRAFFIC_TERMS = CORE_TERMS.filter(([ja, vi]) => ja && vi && ja.trim().length > 0 && vi.trim().length > 0);

// Stopwords tiếng Việt
const VI_STOP = new Set([
  'và', 'là', 'của', 'có', 'được', 'trong', 'với', 'cho', 'không', 'để',
  'từ', 'một', 'các', 'những', 'này', 'đó', 'ra', 'vào', 'hay', 'hoặc',
  'thì', 'cũng', 'như', 'khi', 'đã', 'sẽ', 'còn', 'nên', 'phải', 'bị',
  'bởi', 'vì', 'nếu', 'đang', 'sau', 'trên', 'dưới', 'qua', 'tại', 'theo',
  'mà', 'do', 'rất', 'quá', 'hơn', 'cũng', 'chỉ', 'thì', 'đều', 'luôn',
  'điều', 'bằng', 'rằng', 'thật', 'hết', 'lại', 'lên', 'xuống', 'đến',
  'vậy', 'nào', 'gì', 'ai', 'đâu', 'sao', 'nhé', 'nhé',
]);

// ── Hàm tiện ích ───────────────────────────────────────────────

/**
 * Lấy 30% ký tự đầu của câu
 */
function getFirst30(text) {
  if (!text) return '';
  const t = text.trim();
  if (t.length === 0) return '';
  const len = Math.max(1, Math.floor(t.length * 30 / 100));
  return t.substring(0, len);
}

/**
 * Lấy N% đầu (dùng cho debug)
 */
function getFirstN(text, percent) {
  if (!text) return '';
  const t = text.trim();
  if (t.length === 0) return '';
  const len = Math.max(1, Math.floor(t.length * percent / 100));
  return t.substring(0, len);
}

/**
 * Trích keyword tiếng Việt (bỏ stopwords, dấu câu)
 */
function extractViKeywords(viText) {
  if (!viText) return [];
  const words = viText.toLowerCase().split(/\s+/);
  return words
    .filter(w => w.length > 1 && !VI_STOP.has(w) && !/^\d+$/.test(w))
    .map(w => w.replace(/[.,;:!?'"()\[\]「」『』【】]/g, ''))
    .filter(w => w.length > 0);
}

/**
 * "Dịch" 30% đầu tiếng Nhật → mảng khái niệm Việt
 * Trả về Set các khái niệm cốt lõi
 */
function getJaCoreConcepts(jaText) {
  if (!jaText) return new Set();
  const concepts = new Set();

  for (const [ja, vi] of TRAFFIC_TERMS) {
    if (jaText.includes(ja)) {
      concepts.add(vi);
    }
  }
  return concepts;
}

/**
 * Kiểm tra lệch bối cảnh hoàn toàn
 * Chỉ báo cáo khi:
 *   1. Có >= 1 khái niệm Nhật rõ ràng trong 30% đầu
 *   2. < 30% khái niệm Nhật xuất hiện trong 30% đầu tiếng Việt
 *   3. Câu Việt có >= 3 keyword riêng (đủ dài để so sánh)
 */
function isSemanticMismatch(jaText, viText) {
  if (!jaText || !viText) return false;

  const ja30 = getFirst30(jaText);
  const vi30 = getFirst30(viText);

  if (!ja30 || !vi30) return false;

  const jaConcepts = getJaCoreConcepts(ja30);
  const viKeywords = new Set(extractViKeywords(vi30));

  // Điều kiện 1: phải có ít nhất 1 khái niệm Nhật để so sánh
  if (jaConcepts.size === 0) return false;

  // Điều kiện 2: câu Việt phải đủ dài (có ít nhất 3 keyword)
  if (viKeywords.size < 3) return false;

  // Đếm xem bao nhiêu khái niệm Nhật có mặt trong keyword Việt
  let matchedConcepts = 0;
  for (const concept of jaConcepts) {
    const conceptNorm = concept.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const kw of viKeywords) {
      const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (kwNorm.includes(conceptNorm) || conceptNorm.includes(kwNorm) || kw.includes(concept)) {
        matchedConcepts++;
        break;
      }
    }
  }

  // Nếu match < 30% → lệch hoàn toàn
  return matchedConcepts === 0; // STRICT: phải KHÔNG match gì cả mới báo
}

// ── Trích xuất câu hỏi ─────────────────────────────────────────
function extractQuestions() {
  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  const results = [];

  if (data.simple && Array.isArray(data.simple)) {
    for (const q of data.simple) {
      if (q.text && q.textVi && q.textVi.trim()) {
        results.push({
          id: q.id || `simple_${results.length}`,
          type: 'simple',
          text: q.text,
          textVi: q.textVi,
          chapter: q.chapter || '',
          section: q.section || '',
        });
      }
    }
  }

  if (data.scenarioGroups && Array.isArray(data.scenarioGroups)) {
    for (const group of data.scenarioGroups) {
      if (group.subs && Array.isArray(group.subs)) {
        for (const sub of group.subs) {
          if (sub.text && sub.textVi && sub.textVi.trim()) {
            results.push({
              id: sub.partId || sub.id || group.groupId || `sub_${results.length}`,
              type: 'scenario',
              text: sub.text,
              textVi: sub.textVi,
              chapter: group.chapter || '',
              stem: group.stem || '',
              stemVi: group.stemVi || '',
            });
          }
        }
      }
    }
  }

  return results;
}

// ── Chạy ───────────────────────────────────────────────────────
const questions = extractQuestions();
console.log(`Tổng số câu hỏi được kiểm tra: ${questions.length}\n`);

const errors = [];

for (const q of questions) {
  if (isSemanticMismatch(q.text, q.textVi)) {
    const ja30 = getFirst30(q.text);
    const vi30 = getFirst30(q.textVi);
    errors.push({
      id: q.id,
      type: q.type,
      textJa: q.text,
      textVi: q.textVi,
      ja30,
      vi30,
      jaConcepts: Array.from(getJaCoreConcepts(ja30)),
      viKeywords: extractViKeywords(vi30),
      chapter: q.chapter,
      stemJa: q.stem || '',
      stemVi: q.stemVi || '',
    });
  }
}

// ── Xuất bảng ──────────────────────────────────────────────────
console.log(`=== KẾT QUẢ: ${errors.length} câu bị lệch nội dung hoàn toàn ===\n`);

if (errors.length === 0) {
  console.log('Không tìm thấy câu nào bị lệch nội dung ở 30% đầu.');
} else {
  const W1 = 20, W2 = 47, W3 = 55;
  const sep = '├' + '─'.repeat(W1) + '┼' + '─'.repeat(W2) + '┼' + '─'.repeat(W3) + '┤';
  console.log('┌' + '─'.repeat(W1) + '┬' + '─'.repeat(W2) + '┬' + '─'.repeat(W3) + '┐');
  console.log('│ ' + 'ID'.padEnd(W1 - 1) + ' │ ' + 'Câu tiếng Nhật (30% đầu)'.padEnd(W2 - 1) + ' │ ' + 'Câu tiếng Việt bị lệch (30% đầu)'.padEnd(W3 - 1) + ' │');
  console.log(sep);

  for (const e of errors) {
    const idCell = (e.id || '').substring(0, W1 - 1).padEnd(W1 - 1);
    const jaCell = (e.ja30 || '').substring(0, W2 - 1).padEnd(W2 - 1);
    const viCell = (e.vi30 || '').substring(0, W3 - 1).padEnd(W3 - 1);
    console.log(`│ ${idCell} │ ${jaCell} │ ${viCell} │`);
  }
  console.log('└' + '─'.repeat(W1) + '┴' + '─'.repeat(W2) + '┴' + '─'.repeat(W3) + '┘');
}

console.log('\n\n=== CHI TIẾT ĐẦY ĐỦ ===\n');
errors.forEach((e, i) => {
  console.log(`[${i + 1}] ID: ${e.id}`);
  console.log(`    Loại: ${e.type}`);
  if (e.chapter) console.log(`    Chương: ${e.chapter}`);
  if (e.stemJa) console.log(`    Stem (Nhật): ${e.stemJa}`);
  if (e.stemVi) console.log(`    Stem (Việt): ${e.stemVi}`);
  console.log(`    Câu tiếng Nhật: ${e.textJa}`);
  console.log(`    30% đầu Nhật:   ${e.ja30}`);
  console.log(`    Khái niệm Nhật: ${e.jaConcepts.join(', ')}`);
  console.log(`    Câu tiếng Việt: ${e.textVi}`);
  console.log(`    30% đầu Việt:   ${e.vi30}`);
  console.log(`    Keyword Việt:   ${e.viKeywords.join(', ')}`);
  console.log('─'.repeat(80));
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
  totalChecked: questions.length,
  mismatchCount: errors.length,
  errors,
}, null, 2), 'utf-8');
console.log(`\nĐã lưu chi tiết vào: ${OUTPUT_FILE}`);
