/*
 * ตัวแปลงฟอนต์ Unicode (ใช้ร่วมกันระหว่างหน้า "แปลงฟอนต์" และ "AA อวยพร")
 * ส่วนใหญ่ใช้ Mathematical Alphanumeric Symbols ซึ่งรองรับเฉพาะ A–Z, a–z, 0–9
 */
(function () {
  "use strict";

  // สร้างตัวแปลงจากจุดเริ่มต้นของตัวพิมพ์ใหญ่ / เล็ก / ตัวเลข (+ ตัวที่ Unicode แยกไว้ที่อื่น)
  function offsetStyle(upper, lower, digit, exceptions) {
    exceptions = exceptions || {};
    return function (ch) {
      if (exceptions[ch]) return exceptions[ch];
      var c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90 && upper) return String.fromCodePoint(upper + c - 65);
      if (c >= 97 && c <= 122 && lower) return String.fromCodePoint(lower + c - 97);
      if (c >= 48 && c <= 57 && digit) return String.fromCodePoint(digit + c - 48);
      return ch;
    };
  }

  function mapStyle(from, to) {
    var a = [...from], b = [...to], m = {};
    a.forEach(function (ch, i) { m[ch] = b[i]; });
    return function (ch) { return m[ch] || ch; };
  }

  // สไตล์ที่ทำงานกับทุกตัวอักษร (รวมภาษาไทย) — แปลงทั้งข้อความ ไม่ใช่ทีละตัว
  function combining(mark) {
    return function (text) {
      // ใส่เครื่องหมายหลังทุก grapheme ที่ไม่ใช่ช่องว่าง/ขึ้นบรรทัด
      return splitGraphemes(text).map(function (g) { return /\s/.test(g) ? g : g + mark; }).join("");
    };
  }

  function splitGraphemes(text) {
    if (window.Intl && Intl.Segmenter) {
      return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), function (s) { return s.segment; });
    }
    return [...text];
  }

  var STYLES = [
    { id: "script", name: "Script", per: offsetStyle(0x1D4D0, 0x1D4EA, 0x1D7CE) },
    { id: "bold", name: "Bold", per: offsetStyle(0x1D400, 0x1D41A, 0x1D7CE) },
    { id: "fraktur", name: "Fraktur", per: offsetStyle(0x1D56C, 0x1D586, 0x1D7CE) },
    { id: "double", name: "Double", per: offsetStyle(0x1D538, 0x1D552, 0x1D7D8, {
      C: "ℂ", H: "ℍ", N: "ℕ", P: "ℙ", Q: "ℚ", R: "ℝ", Z: "ℤ" }) },
    { id: "mono", name: "Mono", per: offsetStyle(0x1D670, 0x1D68A, 0x1D7F6) },
    { id: "smallcaps", name: "Small caps", per: mapStyle(
      "abcdefghijklmnopqrstuvwxyz",
      "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ") },
    { id: "bolditalic", name: "Bold italic", per: offsetStyle(0x1D468, 0x1D482, 0x1D7CE) },
    { id: "sans", name: "Sans bold", per: offsetStyle(0x1D5D4, 0x1D5EE, 0x1D7EC) },
    { id: "italic", name: "Sans italic", per: offsetStyle(0x1D608, 0x1D622, 0) },
    { id: "bubble", name: "Bubble", per: offsetStyle(0x24B6, 0x24D0, 0, {
      "0": "⓪", "1": "①", "2": "②", "3": "③", "4": "④", "5": "⑤", "6": "⑥", "7": "⑦", "8": "⑧", "9": "⑨" }) },
    { id: "square", name: "Square", per: function (ch) {
      var c = ch.toUpperCase().charCodeAt(0);
      return c >= 65 && c <= 90 ? String.fromCodePoint(0x1F130 + c - 65) : ch;
    } },
    { id: "wide", name: "Wide", per: function (ch) {
      var c = ch.charCodeAt(0);
      if (ch === " ") return "　";
      return c >= 0x21 && c <= 0x7E ? String.fromCharCode(c + 0xFEE0) : ch;
    } },
    { id: "tiny", name: "Tiny", per: mapStyle(
      "abcdefghijklmnoprstuvwxyzABDEGHIJKLMNOPRTUVW0123456789",
      "ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻᴬᴮᴰᴱᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᴿᵀᵁⱽᵂ⁰¹²³⁴⁵⁶⁷⁸⁹") },
    { id: "strike", name: "Strike", all: combining("̶") },
    { id: "under", name: "Underline", all: combining("̲") },
    { id: "hearts", name: "Hearts", all: function (text) {
      return text.split("\n").map(function (line) {
        return splitGraphemes(line).filter(function (g) { return g !== " "; }).join("♡");
      }).join("\n");
    } }
  ];

  function convert(styleId, text) {
    var s = STYLES.find(function (x) { return x.id === styleId; });
    if (!s) return text;
    if (s.all) return s.all(text);
    return Array.from(text, s.per).join("");
  }

  window.KaoFonts = {
    styles: STYLES,
    convert: convert,
    // ตัวอย่างสำหรับปุ่มเลือกสไตล์
    sample: function (id) { return convert(id, id === "square" || id === "bubble" ? "Cute" : "sample"); },
    graphemes: splitGraphemes
  };
})();
