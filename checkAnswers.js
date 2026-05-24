/**
 * checkAnswers.js
 *
 * Quet file JSON cau hoi, phat hien mau thuan giua answer va explanationVi.
 *
 * Chi quy tac don gian:
 *   - answer = × VA explanationVi chua "Dung" (co dau)  -> BAO LOI
 *   - answer = ○ VA explanationVi chua "Sai"            -> BAO LOI
 *
 * Chay: node checkAnswers.js
 */

const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(__dirname, "src", "data", "questions.json");

// ─── Doc file ────────────────────────────────────────────────────────────────

let raw = fs.readFileSync(FILE_PATH, "utf-8");
raw = raw.replace(/^\uFEFF/, "");
const data = JSON.parse(raw);

// ─── Quet ───────────────────────────────────────────────────────────────────

const errors = [];

function scanFlat(arr, arrayName) {
  if (!Array.isArray(arr)) return;
  arr.forEach((q, i) => {
    const ans = q.answer;
    const exp = q.explanationVi ?? "";
    const txt = q.textVi ?? "";

    if (ans === "×" && exp.includes("Đúng")) {
      // Chi khi "Đúng" (D hoa) xuat hien — tranh false-positive nhu "Đúng thứ tự phải là"
      errors.push({ type: 1, arrayName, i, id: q.id ?? q.partId ?? i, ans, exp, txt, subKey: q.subKey ?? null });
    }
    if (ans === "○" && exp.includes("Sai")) {
      errors.push({ type: 2, arrayName, i, id: q.id ?? q.partId ?? i, ans, exp, txt, subKey: q.subKey ?? null });
    }
  });
}

function scanGroup(arr, arrayName) {
  if (!Array.isArray(arr)) return;
  arr.forEach((g, i) => {
    if (!Array.isArray(g.subs)) return;
    g.subs.forEach((sub, si) => {
      const ans = sub.answer;
      const exp = sub.explanationVi ?? "";
      const txt = sub.textVi ?? "";

      if (ans === "×" && exp.includes("Đúng")) {
        errors.push({ type: 1, arrayName, i, si, id: sub.partId ?? i, ans, exp, txt, subKey: sub.subKey ?? null });
      }
      if (ans === "○" && exp.includes("Sai")) {
        errors.push({ type: 2, arrayName, i, si, id: sub.partId ?? i, ans, exp, txt, subKey: sub.subKey ?? null });
      }
    });
  });
}

// Quet tat ca mang top-level
for (const key of ["simple", "multiChoice"]) {
  if (data[key]) scanFlat(data[key], key);
}
if (data.group) scanGroup(data.group, "group");

// ─── In ket qua ─────────────────────────────────────────────────────────────

console.log("\n=== KET QUA QUET MAU THUAN ===\n");

if (errors.length === 0) {
  console.log("Khong co mau thuan nao.\n");
  process.exit(0);
}

errors.forEach((e, idx) => {
  const loc = e.si !== undefined
    ? `${e.arrayName}[${e.i}].subs[${e.si}]`
    : `${e.arrayName}[${e.i}]`;
  const typeLabel = e.type === 1 ? "LOAI 1" : "LOAI 2";
  const typeDesc  = e.type === 1
    ? "answer = × nhung explanationVi chua 'Dung'"
    : "answer = ○ nhung explanationVi chua 'Sai'";
  const sub = e.subKey ? ` | subKey: ${e.subKey}` : "";

  console.log(`${idx + 1}. [${typeLabel}] ${e.id}${sub}`);
  console.log(`   Vi tri   : ${FILE_PATH}  >  ${loc}`);
  console.log(`   Ly do    : ${typeDesc}`);
  console.log(`   textVi   : ${(e.txt || "").replace(/\n/g, " ").trim().slice(0, 100)}`);
  console.log(`   explanationVi: ${(e.exp || "").replace(/\n/g, " ").trim().slice(0, 100)}`);
  console.log();
});

console.log(`Tong cong: ${errors.length} loi phat hien.\n`);
process.exit(1);
