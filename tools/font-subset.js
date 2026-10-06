/*
 * สร้างลิงก์ฟอนต์ M PLUS Rounded 1c แบบ "เฉพาะตัวอักษรที่เว็บใช้จริง" แล้วเขียนลงทุกหน้า HTML
 * (Google Fonts ปกติแบ่งฟอนต์ญี่ปุ่นเป็น ~126 ไฟล์ย่อย คาโอโมจิหน้าแรกหน้าเดียวก็โหลดไป 20+ ไฟล์)
 *
 * รันใหม่ทุกครั้งที่เพิ่มคาโอโมจิ / สัญลักษณ์:   node tools/font-subset.js
 */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

const JS = ["data/kaomoji.js", "js/kirakira.js", "js/aa.js", "js/frame.js", "js/common.js", "js/app.js", "js/motion.js", "js/fonts.js"];
const HTML = ["index.html", "font.html", "aa.html", "frame.html", "kirakira.html", "emoji.html"];

let src = JS.map(read).join("");
HTML.forEach((f) => { const s = read(f); src += s.slice(s.indexOf("<body")); });

// ขอเฉพาะช่วงตัวอักษรที่ฟอนต์ญี่ปุ่นแบบนี้มีจริง (อักษรอื่น เช่น ไทย อีโมจิ ตัวคณิตศาสตร์ 𝓐
// อักษรยี่ ฯลฯ ฟอนต์นี้ไม่มีอยู่แล้ว ใส่ไปก็แค่ทำให้ลิงก์ยาว และถ้ายาวเกินไป Google จะไม่ตัดให้)
const COVERED = [
  [0x0080, 0x024F], // ละติน เพิ่มเติม
  [0x0250, 0x02FF], // IPA + modifier letters (˘ ˙ ˚ ˊ ˋ)
  [0x0300, 0x036F], // เครื่องหมายซ้อน
  [0x0370, 0x04FF], // กรีก ซีริลลิก
  [0x1D00, 0x1DBF], // phonetic extensions (ᴗ ᵕ ᴥ)
  [0x2000, 0x22FF], // วรรคตอน ลูกศร ตัวยก สัญลักษณ์คณิต
  [0x2300, 0x23FF], // misc technical (⌒)
  [0x2460, 0x27BF], // ตัวเลขในวง กรอบ บล็อก รูปทรง สัญลักษณ์ ดิงแบต
  [0x2E80, 0x30FF], // CJK สัญลักษณ์ ฮิรางานะ คาตาคานะ
  [0x3100, 0x33FF], // CJK อื่นๆ
  [0x4E00, 0x9FFF], // คันจิ
  [0xFE30, 0xFE4F], // CJK compatibility forms (︶ ︵)
  [0xFF00, 0xFFEF]  // ตัวเต็ม/ครึ่งความกว้าง
];
const set = new Set();
for (let c = 0x21; c < 0x7f; c++) set.add(String.fromCharCode(c)); // ASCII ทั้งหมด (ผู้ใช้พิมพ์เองได้)
for (const ch of src) {
  const c = ch.codePointAt(0);
  if (c < 0x80) continue;
  if (!COVERED.some(function (r) { return c >= r[0] && c <= r[1]; })) continue;
  set.add(ch);
}
// Google รับ text= ได้ไม่ยาวมาก (เกินราวๆ 800 ตัว จะไม่ตัดให้แล้วส่งฟอนต์ครบ 126 ไฟล์มาแทน)
// เลยแบ่งเป็นหลายลิงก์ ลิงก์ละไม่เกิน 400 ตัว แต่ละไฟล์มี unicode-range ของตัวเอง เบราว์เซอร์รวมให้เอง
const CHUNK = 400;
const chars = [...set].sort();
const links = [];
for (let i = 0; i < chars.length; i += CHUNK) {
  const text = encodeURIComponent(chars.slice(i, i + CHUNK).join(""));
  links.push('  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c&amp;display=swap&amp;text=' +
    text + '" media="print" onload="this.media=\'all\'">');
}
const block = "<!-- kaoFont:start -->\n" + links.join("\n") + "\n  <!-- kaoFont:end -->";

HTML.forEach((f) => {
  const p = path.join(root, f);
  let s = fs.readFileSync(p, "utf8");
  // รูปแบบเก่า (ลิงก์เดียว id="kaoFont") -> เปลี่ยนเป็นบล็อกที่มีเครื่องหมายเริ่ม/จบ
  s = s.replace(/<link id="kaoFont"[^>]*>/, "<!-- kaoFont:start --><!-- kaoFont:end -->");
  s = s.replace(/<!-- kaoFont:start -->[\s\S]*?<!-- kaoFont:end -->/, block);
  fs.writeFileSync(p, s);
});
console.log(set.size + " characters in " + links.length + " font request(s)");
