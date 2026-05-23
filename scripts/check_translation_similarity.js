/**
 * Script kiểm tra lệch nội dung (Data Mismatch) giữa text (Nhật) và textVi (Việt)
 * Kết hợp: Semantic Embedding (Cosine Similarity) + Rule-based Cross-check
 *
 * Chạy: node scripts/check_translation_similarity.js
 *
 * Yêu cầu: npm install --save-dev @xenova/transformers
 */

const fs = require('fs');

const INPUT_FILE = './src/data/questions.json';
const OUTPUT_FILE = './translation_mismatch_report.json';
const EMBED_THRESHOLD = 0.3; // Ngưỡng cứng cho embedding: < 0.3 = chắc chắn lệch

// ── Cosine Similarity ─────────────────────────────────────────
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; normA += a[i] * a[i]; normB += b[i] * b[i]; }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function toArray(vec) {
  if (Array.isArray(vec)) return vec;
  if (vec && typeof vec.data === 'object' && vec.data instanceof Float32Array) return Array.from(vec.data);
  return null;
}

// ── Rule-based cross-check ────────────────────────────────────
// Kiểm tra các cặp từ trái ngược nghĩa Nhật-Việt
const RULE_PAIRS = [
  // Cặp trái ngược rõ ràng trong luật giao thông
  ['徐行', 'dừng lại', '徐行 (đi chậm) ≠ dừng lại hoàn toàn'],
  ['停止', 'đi chậm', '停止 (dừng hẳn) ≠ đi chậm'],
  ['追い越し', 'đuổi kịp', '追い越し (vượt) ≠ 追い抜き (đuổi kịp)'],
  ['追い抜き', 'vượt xe', '追い抜き (đuổi kịp từ bên phải) ≠ vượt'],
  ['禁止', 'được phép', '禁止 (cấm) ≠ được phép'],
  ['左折', 'rẽ phải', '左折 (trái) ≠ rẽ phải'],
  ['右折', 'rẽ trái', '右折 (phải) ≠ rẽ trái'],
  ['直進', 'rẽ', '直進 (thẳng) ≠ rẽ'],
  ['優先道路', 'đường thường', '優先道路 (ưu tiên) ≠ đường thường'],
  ['優先', 'nhường đường', '優先 (có quyền ưu tiên) ≠ nhường'],
  ['横断禁止', 'được băng qua', '横断禁止 (cấm băng) ≠ được băng'],
  ['飲酒', 'không uống rượu', '飲酒 (có uống rượu) ≠ không uống'],
  ['車検証', 'bằng lái', '車検証 (đăng kiểm) ≠ bằng lái'],
  [' клаксон', 'giảm tốc', '喇叭 (bấm còi) ≠ giảm tốc'],
  ['喇叭使用', 'tăng tốc', '喇叭使用 (bấm còi) ≠ tăng tốc'],
  [' 内輪差', 'khoảng cách', '内輪差 (hiệu số trong) ≠ khoảng cách'],
  ['制動距離', 'quãng đường phanh', '制動距離 (quãng đường phanh) ≠ quãng đường phanh'],
  ['空走距離', 'quãng đường phanh', '空走距離 (quãng đường phản xạ) ≠ quãng đường phanh'],
];

function ruleBasedMismatch(jaText, viText) {
  if (!jaText || !viText) return null;
  const ja = jaText.toLowerCase();
  const vi = viText.toLowerCase();

  for (const [jaKw, viKw, desc] of RULE_PAIRS) {
    const jaNorm = jaKw.replace(/[\u3040-\u309F\u30A0-\u30FF]/g, '').trim();
    if (ja.includes(jaKw) && vi.includes(viKw)) {
      return desc;
    }
  }
  return null;
}

// ── Topic summarizer ─────────────────────────────────────────
const TOPIC_MAP = [
  ['標識', 'Biển báo'], ['この標識', 'Biển báo'], ['この標識のある', 'Biển báo'],
  ['標示', 'Biển chỉ dẫn'], ['この標示', 'Biển chỉ dẫn'],
  ['信号', 'Đèn tín hiệu'],
  ['制限速度', 'Giới hạn tốc độ'], ['最高速度', 'Tốc độ tối đa'],
  ['交差点', 'Ngã tư / Giao lộ'], ['横断歩道', 'Vạch qua đường'],
  ['自転車', 'Xe đạp'], ['原動機付自転車', 'Xe gắn máy'],
  ['追い越し', 'Vượt xe'], ['追い越し禁止', 'Cấm vượt'],
  ['右折', 'Rẽ phải'], ['左折', 'Rẽ trái'], ['直進', 'Đi thẳng'],
  ['停車', 'Dừng xe'], ['駐車', 'Đỗ xe'], ['駐停車禁止', 'Cấm đỗ xe'],
  ['優先道路', 'Đường ưu tiên'], ['優先', 'Ưu tiên'],
  ['緊急自動車', 'Xe ưu tiên'], ['パトカー', 'Xe tuần tra'],
  ['徐行', 'Đi chậm'], ['横断', 'Băng qua'],
  ['飲酒', 'Uống rượu'], ['酒', 'Rượu bia'],
  [' клаксон', 'Còi xe'], ['喇叭', 'Còi xe'],
  ['衝突', 'Va chạm'], ['追突', 'Va chạm từ sau'],
  ['カーブ', 'Cua / Quanh co'], ['坂', 'Dỡc'],
  [' Brake', 'Phanh'], ['制動', 'Phanh'], ['ブレーキ', 'Phanh'],
  [' 内輪差', 'Hiệu số trong'],
  ['スリップ', 'Trượt'], ['横滑り', 'Trượt ngang'],
  ['視界', 'Tầm nhìn'], ['夜間', 'Ban đêm'],
  ['雨天', 'Trời mưa'], ['悪天候', 'Thời tiết xấu'],
  ['高齢者', 'Người cao tuổi'], ['子供', 'Trẻ em'],
  [' 版名', 'Đăng kiểm'], [' 点数', 'Điểm phạt'],
  ['免許', 'Bằng lái xe'], ['整備', 'Bảo dưỡng'],
  ['乗車', 'Lên xe'], ['降車', 'Xuống xe'],
  ['通行区分', 'Phân luồng'], [' 中央線', 'Vạch giữa'],
  ['踏切', 'Lối qua đường sắt'], ['トンネル', 'Đường hầm'],
];

function summarizeTopic(jaText) {
  if (!jaText) return 'Không xác định';
  for (const [kw, label] of TOPIC_MAP) {
    if (jaText.includes(kw)) return label;
  }
  return jaText.trim().substring(0, 20) + '...';
}

// ── Trích xuất câu hỏi ───────────────────────────────────────
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

// ── Main ─────────────────────────────────────────────────────
async function main() {
  const questions = extractQuestions();
  console.log(`Tổng số câu hỏi: ${questions.length}`);
  console.log(`Ngưỡng Embedding: < ${EMBED_THRESHOLD}\n`);

  // Bước 1: Rule-based check (nhanh, không cần AI)
  console.log('Bước 1: Rule-based cross-check...');
  const ruleErrors = new Map(); // id -> error

  for (const q of questions) {
    const reason = ruleBasedMismatch(q.text, q.textVi);
    if (reason) {
      ruleErrors.set(q.id, {
        id: q.id,
        type: q.type,
        topic: summarizeTopic(q.text),
        textJa: q.text,
        textVi: q.textVi,
        chapter: q.chapter,
        stemJa: q.stem || '',
        stemVi: q.stemVi || '',
        reason,
        detectionMethod: 'rule-based',
      });
    }
  }
  console.log(`  Tìm thấy ${ruleErrors.size} lỗi từ rule-based\n`);

  // Bước 2: Embedding check (dùng AI)
  console.log('Bước 2: Semantic Embedding check...');
  const { pipeline } = await import('@xenova/transformers');
  const embedder = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
  console.log('  Model: Xenova/paraphrase-multilingual-MiniLM-L12-v2\n');

  const embedErrors = new Map(); // id -> error

  const BATCH = 32;
  let processed = 0;
  for (let i = 0; i < questions.length; i += BATCH) {
    const batch = questions.slice(i, i + BATCH);

    const jaEmbeds = await Promise.all(batch.map(q => embedder(q.text, { pooling: 'mean', normalize: true })));
    const viEmbeds = await Promise.all(batch.map(q => embedder(q.textVi, { pooling: 'mean', normalize: true })));

    for (let j = 0; j < batch.length; j++) {
      const q = batch[j];
      const jaVec = toArray(jaEmbeds[j]);
      const viVec = toArray(viEmbeds[j]);
      if (!jaVec || !viVec) { processed++; continue; }

      const sim = cosineSimilarity(jaVec, viVec);
      if (sim < EMBED_THRESHOLD) {
        embedErrors.set(q.id, {
          id: q.id,
          type: q.type,
          similarity: parseFloat(sim.toFixed(4)),
          topic: summarizeTopic(q.text),
          textJa: q.text,
          textVi: q.textVi,
          chapter: q.chapter,
          stemJa: q.stem || '',
          stemVi: q.stemVi || '',
          reason: null,
          detectionMethod: 'embedding',
        });
      }
      processed++;
    }

    const pct = Math.round(processed / questions.length * 100);
    process.stdout.write(`\r  Đang xử lý embedding: ${processed}/${questions.length} (${pct}%)  `);
  }
  console.log(`\n  Tìm thấy ${embedErrors.size} lỗi từ embedding (sim < ${EMBED_THRESHOLD})\n`);

  // Bước 3: Merge kết quả (prioritize rule-based, add embedding-only)
  const allErrors = new Map(ruleErrors);

  for (const [id, err] of embedErrors) {
    if (!allErrors.has(id)) {
      allErrors.set(id, err);
    }
  }

  const errors = Array.from(allErrors.values()).sort((a, b) => {
    // Ưu tiên rule-based trước
    if (a.detectionMethod === 'rule-based' && b.detectionMethod !== 'rule-based') return -1;
    if (b.detectionMethod === 'rule-based' && a.detectionMethod !== 'rule-based') return 1;
    // Cùng method thì sort theo similarity (thấp trước)
    const simA = a.similarity ?? 99;
    const simB = b.similarity ?? 99;
    return simA - simB;
  });

  // ── Xuất bảng ─────────────────────────────────────────────
  console.log('═'.repeat(100));
  console.log(`KẾT QUẢ: ${errors.length} câu bị lệch nội dung`);
  console.log(`  - Rule-based: ${ruleErrors.size} câu`);
  console.log(`  - Embedding (sim < ${EMBED_THRESHOLD}): ${embedErrors.size} câu`);
  console.log(`  - Tổng hợp (loại trùng): ${errors.length} câu`);
  console.log('═'.repeat(100) + '\n');

  if (errors.length === 0) {
    console.log('Không tìm thấy câu nào bị lệch nội dung.');
  } else {
    // Bảng ASCII
    const W = [22, 20, 58];
    console.log('┌' + '─'.repeat(W[0]) + '┬' + '─'.repeat(W[1]) + '┬' + '─'.repeat(W[2]) + '┐');
    console.log('│ ' + 'ID'.padEnd(W[0] - 1) + ' │ ' + 'Chủ đề câu Nhật'.padEnd(W[1] - 1) + ' │ ' + 'Nội dung tiếng Việt (bị lệch)'.padEnd(W[2] - 1) + ' │');
    console.log('├' + '─'.repeat(W[0]) + '┼' + '─'.repeat(W[1]) + '┼' + '─'.repeat(W[2]) + '┤');

    for (const e of errors) {
      const idCell = (e.id || '').substring(0, W[0] - 1).padEnd(W[0] - 1);
      const topicCell = (e.topic || '').substring(0, W[1] - 1).padEnd(W[1] - 1);
      const viCell = (e.textVi || '').substring(0, W[2] - 1).padEnd(W[2] - 1);
      console.log(`│ ${idCell} │ ${topicCell} │ ${viCell} │`);
    }
    console.log('└' + '─'.repeat(W[0]) + '┴' + '─'.repeat(W[1]) + '┴' + '─'.repeat(W[2]) + '┘');
  }

  console.log('\n\n=== CHI TIẾT ĐẦY ĐỦ ===\n');
  errors.forEach((e, i) => {
    console.log(`[${i + 1}] ID: ${e.id}`);
    console.log(`    Loại phát hiện: ${e.detectionMethod === 'rule-based' ? '⚠️ Rule-based (từ khóa trái ngược)' : '🤖 Embedding (sim = ' + e.similarity + ')'}`);
    console.log(`    Chủ đề Nhật: ${e.topic}`);
    if (e.reason) console.log(`    Lý do lệch: ${e.reason}`);
    if (e.chapter) console.log(`    Chương: ${e.chapter}`);
    if (e.stemJa) console.log(`    Stem (Nhật): ${e.stemJa}`);
    if (e.stemVi) console.log(`    Stem (Việt): ${e.stemVi}`);
    console.log(`    Câu tiếng Nhật: ${e.textJa}`);
    console.log(`    Câu tiếng Việt bị lệch: ${e.textVi}`);
    console.log('─'.repeat(100));
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
    totalChecked: questions.length,
    embedThreshold: EMBED_THRESHOLD,
    ruleBasedCount: ruleErrors.size,
    embedCount: embedErrors.size,
    totalUniqueErrors: errors.length,
    errors,
  }, null, 2), 'utf-8');
  console.log(`\nĐã lưu chi tiết vào: ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('Lỗi:', err.message);
  process.exit(1);
});
