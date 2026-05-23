const fs = require('fs');

const filePath = './src/data/questions.json';
let content = fs.readFileSync(filePath, 'utf-8');

// Xóa BOM nếu có
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}

const data = JSON.parse(content);

// Thống kê thay đổi
const stats = {};

// Regex cho chữ Kanji (Unicode range: \u4e00-\u9faf)
const KANJI_PATTERN = '[\\u4e00-\\u9faf]';

// Quy tắc thay thế theo thứ tự ưu tiên (TỪ DÀI NHẤT đến NGẮN NHẤT)
const replacements = [
  // Mức 1: Từ ghép 5+ ký tự
  {
    pattern: '原動機付自転車',
    replacement: 'xe gắn máy 50cc',
    desc: 'xe gắn máy 50cc'
  },

  // Mức 2: Từ ghép 3-4 ký tự
  {
    pattern: '自動二輪車',
    replacement: 'xe mô tô',
    desc: 'xe mô tô'
  },
  {
    pattern: '緊急自動車',
    replacement: 'xe ưu tiên',
    desc: 'xe ưu tiên'
  },

  // Mức 3: Từ ghép 3 ký tự
  {
    pattern: '自動車',
    replacement: 'ô tô',
    desc: 'ô tô'
  },
  {
    pattern: '二輪車',
    replacement: 'xe hai bánh',
    desc: 'xe hai bánh'
  },
  {
    pattern: '三輪車',
    replacement: 'xe ba bánh',
    desc: 'xe ba bánh'
  },
  {
    pattern: '四輪車',
    replacement: 'xe bốn bánh',
    desc: 'xe bốn bánh'
  },

  // Mức 4: Từ ghép 2 ký tự
  {
    pattern: '車両',
    replacement: 'phương tiện',
    desc: 'phương tiện'
  },

  // Mức 5: Chữ đơn "車" - chỉ thay khi KHÔNG có Kanji trước/sau
  // Negative Lookbehind: (?<![Kanji]) - phía trước không phải Kanji
  // Negative Lookahead: (?![Kanji]) - phía sau không phải Kanji
  {
    pattern: new RegExp(`(?<!${KANJI_PATTERN})車(?!${KANJI_PATTERN})`, 'g'),
    replacement: 'xe',
    desc: 'xe (chữ đơn)'
  },
];

console.log('=== BẮT ĐẦU QUÁ TRÌNH CHUẨN HÓA ===\n');
console.log('Quy tắc ưu tiên: Từ dài nhất -> ngắn nhất\n');

// Đếm số lần xuất hiện (chỉ cho pattern dạng string)
replacements.forEach(({ pattern, replacement, desc }) => {
  if (typeof pattern === 'string') {
    const regex = new RegExp(pattern, 'g');
    const matches = content.match(regex);
    const count = matches ? matches.length : 0;
    stats[pattern] = { newText: replacement, count, desc };
  } else {
    // Regex object - đếm sau khi đã xử lý các string patterns
    const count = 0;
    stats['車 (chữ đơn)'] = { newText: replacement, count, desc };
  }
});

function processObject(obj) {
  if (typeof obj === 'string') {
    let result = obj;
    // Áp dụng tất cả replacements theo thứ tự (đã sorted theo độ dài)
    replacements.forEach(({ pattern, replacement }) => {
      if (typeof pattern === 'string') {
        const regex = new RegExp(pattern, 'g');
        result = result.replace(regex, replacement);
      } else {
        // Regex object với lookbehind/lookahead
        result = result.replace(pattern, replacement);
      }
    });
    return result;
  } else if (Array.isArray(obj)) {
    return obj.map(item => processObject(item));
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = processObject(obj[key]);
    }
    return newObj;
  }
  return obj;
}

// Xử lý trước để đếm chữ "車" đơn lẻ
let tempContent = content;
replacements.forEach(({ pattern, replacement }) => {
  if (typeof pattern === 'string') {
    const regex = new RegExp(pattern, 'g');
    tempContent = tempContent.replace(regex, replacement);
  }
});

// Đếm chữ 車 còn lại sau khi xử lý các từ ghép
const singleCarRegex = new RegExp(`(?<!${KANJI_PATTERN})車(?!${KANJI_PATTERN})`, 'g');
const singleCarMatches = tempContent.match(singleCarRegex);
stats['車 (chữ đơn)'].count = singleCarMatches ? singleCarMatches.length : 0;

const processedData = processObject(data);

// Ghi file
fs.writeFileSync(filePath, JSON.stringify(processedData, null, 2), 'utf-8');

// In báo cáo
console.log('=== BÁO CÁO THAY ĐỔI ===\n');
console.log('Đã cập nhật các thuật ngữ sau:');
console.log('-'.repeat(60));

let totalCount = 0;
for (const [oldText, info] of Object.entries(stats)) {
  if (info.count > 0) {
    console.log(`  "${oldText}" -> "${info.desc}": ${info.count} vị trí`);
    totalCount += info.count;
  }
}

console.log('-'.repeat(60));
console.log(`Tổng số thay đổi: ${totalCount} vị trí trong file`);
console.log('\nFile đã được cập nhật: ' + filePath);
