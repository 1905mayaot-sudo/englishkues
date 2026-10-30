/* Генерирует Anki-файл и CSV из data.js. Запуск: node build-exports.js */
const fs = require("fs");
const path = require("path");
const verbs = require("./data.js");

const outDir = __dirname;

function firstForm(s) {
  if (!s || s === "—") return "";
  return s.split("/")[0].split(",")[0].trim();
}
function pattern(v) {
  if (!v.pp || v.pp === "—") return "MODAL";
  const p = firstForm(v.p);
  const pp = firstForm(v.pp);
  if (p === v.i && pp === v.i) return "AAA";
  if (p === pp && p !== v.i) return "ABB";
  if (p !== pp && pp === v.i) return "ABA";
  return "ABC";
}
function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Anki: 3 колонки (лицо, оборот, теги). HTML разрешён.
const anki = [
  "#separator:tab",
  "#html:true",
  "#tags column:3",
  "#deck:Irregular Verbs 131",
  ...verbs.map(v => {
    const front = `${v.i} — ${v.ru}`;
    const back = `<b>${escHtml(v.p)}</b><br><b>${escHtml(v.pp)}</b>` +
      (v.note ? `<br><br><span style="color:#777">${escHtml(v.note)}</span>` : "") +
      `<br><br><span style="color:#999">День ${v.day} · ${pattern(v)}</span>`;
    const tags = `irregular_verbs Day${v.day} ${pattern(v)}`;
    return [front, back, tags].join("\t");
  })
];
fs.writeFileSync(path.join(outDir, "anki_irregular_verbs.txt"), anki.join("\r\n"), "utf8");

// CSV для Excel / Google Sheets. Разделитель ; (русская локаль), все поля в кавычках.
function q(s) {
  return '"' + String(s).replace(/"/g, '""') + '"';
}
const rows = [
  ["Infinitive", "Past", "Participle II", "Translation", "Day", "Pattern", "Note"],
  ...verbs.map(v => [v.i, v.p, v.pp, v.ru, v.day, pattern(v), v.note || ""])
];
const csv = rows.map(r => r.map(q).join(";")).join("\r\n");
fs.writeFileSync(path.join(outDir, "irregular_verbs.csv"), "\uFEFF" + csv, "utf8");

// JSON — на случай, если захочется сделать свою программу или импорт.
fs.writeFileSync(
  path.join(outDir, "irregular_verbs.json"),
  JSON.stringify(verbs.map(v => ({ ...v, pattern: pattern(v) })), null, 2),
  "utf8"
);

// Простой текст для чтения с телефона / распечатки.
let txt = "131 НЕПРАВИЛЬНЫЙ ГЛАГОЛ · Appendix, стр. 250–255\n";
let currentDay = 0;
for (const v of verbs) {
  if (v.day !== currentDay) {
    currentDay = v.day;
    txt += `\n── День ${currentDay} ──\n`;
  }
  txt += `${v.i} – ${v.p} – ${v.pp} – ${v.ru}\n`;
}
fs.writeFileSync(path.join(outDir, "irregular_verbs.txt"), txt, "utf8");

console.log("Готово:");
console.log("  anki_irregular_verbs.txt —", verbs.length, "карточек");
console.log("  irregular_verbs.csv —", verbs.length, "строк");
console.log("  irregular_verbs.txt —", verbs.length, "строк для чтения");
console.log("  irregular_verbs.json —", verbs.length, "записей");
