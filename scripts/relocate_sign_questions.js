/**
 * Script phân loại lại câu hỏi liên quan đến biển báo/vạch kẻ/tín hiệu
 *
 * Tìm các câu hỏi KHÔNG thuộc chương "標識・標示・信号" nhưng:
 *   - Có trường 'image' khác rỗng/null
 *   - Nội dung 'text' hoặc 'explanation' chứa từ khóa liên quan đến biển báo/vạch kẻ/tín hiệu
 *
 * Sau đó kiểm tra xem câu đó đã tồn tại trong "標識・標示・信号" chưa (theo ID).
 *   - Nếu CHƯA: chuyển chapter sang "標識・標示・信号"
 *   - Nếu ĐÃ: giữ nguyên
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const MAIN_FILE = path.join(DATA_DIR, 'questions.json');

// Các ID trùng với câu đang có trong chương đích (textVi + answer + explanationVi + image giống nhau) — BỎ QUA
const DUPLICATE_IDS = new Set([
  'menkyogentsuki_gentsuki_1_18_2',
  'menkyogentsuki_gentsuki_1_16_4',
  'menkyogentsuki_gentsuki_2_16_2',
  'menkyogentsuki_gentsuki_2_17_1',
  'menkyogentsuki_gentsuki_4_22_4',
  'menkyogentsuki_gentsuki_4_20_5',
  'menkyogentsuki_gentsuki_5_22_1',
]);

// Chương bị loại trừ hoàn toàn (không bao giờ chuyển sang "標識・標示・信号")
const EXCLUDED_CHAPTERS = new Set([
  '危険予測',
  '危険予測問題',
]);

// Từ khóa chỉ liên quan trực tiếp đến biển báo / vạch kẻ / tín hiệu
// KHÔNG bao gồm: 交差点, 自転車, 高齢, 横断, 通行止め, 禁止, 制限, 指示, 警戒
const SIGN_KEYWORDS = [
  '標識', '標示', '信号', '信号機',
  '止まれ', '徐行', '最高速度', '速度制限',
  '一方通行', '通行止め', '踏切',
  'レーン', 'YellowBox', 'yellow box',
  'bike lane', 'bicycle lane', 'bus lane',
  '中央線', 'Yellow', '横断帯',
  '停車', '駐停車',
];

function loadData(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(raw);
}

function saveData(filepath, data) {
  fs.writeFileSync(filepath, '\ufeff' + JSON.stringify(data, null, 2), 'utf8');
}

function buildIdSet(questions) {
  const ids = new Set();
  for (const q of questions) {
    ids.add(q.id);
    // Nếu có subs, thêm partId
    if (q.subs) {
      for (const sub of q.subs) {
        if (sub.partId) ids.add(sub.partId);
      }
    }
  }
  return ids;
}

function containsSignKeyword(text) {
  if (!text) return false;
  return SIGN_KEYWORDS.some(kw => text.includes(kw));
}

function findQuestionsWithImageAndSignKeyword(questions, targetChapter) {
  const results = [];
  for (const q of questions) {
    // Bỏ qua các chương bị loại trừ
    if (EXCLUDED_CHAPTERS.has(q.chapter)) continue;
    // Bỏ qua chương đích
    if (q.chapter === targetChapter) continue;

    const hasImage = (q.image && q.image.trim() !== '') || (q.subs && q.subs.some(s => s.image && s.image.trim() !== ''));
    const textHasKeyword = containsSignKeyword(q.text) || containsSignKeyword(q.stem);
    const explanationHasKeyword = containsSignKeyword(q.explanation);

    if (hasImage && (textHasKeyword || explanationHasKeyword)) {
      // Bỏ qua câu có ID undefined
      if (!q.id || q.id === 'undefined') continue;
      // Bỏ qua câu trùng 4 trường với câu đang có trong chương đích
      if (DUPLICATE_IDS.has(q.id)) continue;
      results.push(q);
    }
  }
  return results;
}

function main() {
  const args = process.argv.slice(2);
  const DRY_RUN = args.includes('--dry-run');
  const VERBOSE = args.includes('--verbose') || DRY_RUN;

  console.log('='.repeat(70));
  console.log('🔍 Script phân loại lại câu hỏi về biển báo / vạch kẻ / tín hiệu');
  if (DRY_RUN) console.log('   [DRY-RUN] Chỉ xem trước, KHÔNG thay đổi file!');
  console.log('='.repeat(70));

  // 1. Tải dữ liệu chính
  if (!fs.existsSync(MAIN_FILE)) {
    console.error(`❌ Không tìm thấy file: ${MAIN_FILE}`);
    process.exit(1);
  }
  const data = loadData(MAIN_FILE);
  console.log(`\n📂 Đã tải: ${MAIN_FILE}`);
  console.log(`   ChapterOrder: ${JSON.stringify(data.chapterOrder)}`);

  const TARGET_CHAPTER = '標識・標示・信号';

  // 2. Xây dựng tập hợp ID trong chương đích
  let targetQuestions = [];
  for (const key of Object.keys(data)) {
    if (key === 'chapterOrder' || key === 'simple') continue;
    const arr = data[key];
    if (Array.isArray(arr)) {
      const filtered = arr.filter(q => q.chapter === TARGET_CHAPTER);
      targetQuestions.push(...filtered);
    }
  }
  // Lấy từ simple nếu có
  if (data.simple) {
    targetQuestions.push(...data.simple.filter(q => q.chapter === TARGET_CHAPTER));
  }

  const existingIds = buildIdSet(targetQuestions);
  console.log(`\n📋 Số câu hỏi hiện có trong chương "${TARGET_CHAPTER}": ${existingIds.size} ID`);

  // 3. Tìm tất cả câu hỏi trong TẤT CẢ các mảng
  const allQuestions = [];
  for (const key of Object.keys(data)) {
    if (key === 'chapterOrder') continue;
    if (Array.isArray(data[key])) {
      allQuestions.push(...data[key]);
    }
  }

  // 4. Tìm câu hỏi thỏa điều kiện
  const candidates = findQuestionsWithImageAndSignKeyword(allQuestions, TARGET_CHAPTER);
  console.log(`\n🔎 Tìm thấy ${candidates.length} câu hỏi có image + từ khóa biển báo (không thuộc chương đích)`);

  // 5. Phân loại: cần chuyển vs đã tồn tại
  const toMove = [];
  const alreadyExists = [];

  for (const q of candidates) {
    if (existingIds.has(q.id)) {
      alreadyExists.push(q);
    } else {
      toMove.push(q);
    }
  }

  console.log(`\n📦 Cần chuyển (ID mới): ${toMove.length}`);
  console.log(`📦 Đã tồn tại (giữ nguyên): ${alreadyExists.length}`);

  // 6. Hiển thị chi tiết
  if (toMove.length > 0) {
    console.log('\n' + '─'.repeat(70));
    console.log('✅ CÁC CÂU HỎI SẼ ĐƯỢC CHUYỂN:');
    console.log('─'.repeat(70));
    for (const q of toMove) {
      const idDisplay = q.id || q.groupId || 'N/A';
      const textPreview = (q.text || q.stem || '').substring(0, 60);
      const keywords = SIGN_KEYWORDS.filter(kw =>
        (q.text || '').includes(kw) ||
        (q.stem || '').includes(kw) ||
        (q.explanation || '').includes(kw)
      );
      console.log(`\n  ID:        ${idDisplay}`);
      console.log(`  Chapter:   ${q.chapter}  →  ${TARGET_CHAPTER}`);
      console.log(`  Section:   ${q.section}`);
      console.log(`  Text:      ${textPreview}...`);
      console.log(`  Image:     ${q.image || '(trong subs)'}`);
      console.log(`  Keyword:   ${keywords.join(', ')}`);
    }
  }

  if (alreadyExists.length > 0) {
    console.log('\n' + '─'.repeat(70));
    console.log('⏭️  CÁC CÂU ĐÃ TỒN TẠI (GIỮ NGUYÊN):');
    console.log('─'.repeat(70));
    for (const q of alreadyExists) {
      const idDisplay = q.id || q.groupId || 'N/A';
      console.log(`  • ${idDisplay}  (chapter hiện tại: ${q.chapter})`);
    }
  }

  // 7. Thực hiện thay đổi
  if (DRY_RUN) {
    console.log('\n✅ [DRY-RUN] Không có thay đổi nào được ghi.');
  } else if (toMove.length > 0) {
    const backupFile = MAIN_FILE + '.backup-relocate-' + Date.now();
    saveData(backupFile, data);
    console.log(`\n💾 Đã tạo backup: ${path.basename(backupFile)}`);

    // Chuyển chapter
    for (const q of toMove) {
      q.chapter = TARGET_CHAPTER;
    }

    saveData(MAIN_FILE, data);
    console.log(`\n✅ Đã chuyển ${toMove.length} câu hỏi sang chương "${TARGET_CHAPTER}"`);
    console.log(`📝 Danh sách đã chuyển:`);
    for (const q of toMove) {
      const idDisplay = q.id || q.groupId || 'N/A';
      console.log(`   ${idDisplay}`);
    }
  } else {
    console.log('\n✅ Không có câu hỏi nào cần chuyển.');
  }

  if (VERBOSE) {
    console.log('\n📋 TỔNG KẾT:');
    console.log(`   Tổng câu hỏi trong "${TARGET_CHAPTER}": ${existingIds.size} ID`);
    console.log(`   Câu mới: ${toMove.length} | Đã tồn tại: ${alreadyExists.length}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎉 Hoàn tất!');
  console.log('='.repeat(70));
}

main();
