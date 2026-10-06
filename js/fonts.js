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
    { id: "hearts", name: "Hearts", all: joinWith("♡") },

    // ---------- ตัวอักษรคณิตศาสตร์เพิ่มเติม ----------
    { id: "scriptthin", name: "Script light", per: offsetStyle(0x1D49C, 0x1D4B6, 0, {
      B: "ℬ", E: "ℰ", F: "ℱ", H: "ℋ", I: "ℐ", L: "ℒ", M: "ℳ", R: "ℛ", e: "ℯ", g: "ℊ", o: "ℴ" }) },
    { id: "frakturthin", name: "Gothic", per: offsetStyle(0x1D504, 0x1D51E, 0, {
      C: "ℭ", H: "ℌ", I: "ℑ", R: "ℜ", Z: "ℨ" }) },
    { id: "serifitalic", name: "Italic", per: offsetStyle(0x1D434, 0x1D44E, 0, { h: "ℎ" }) },
    { id: "sansplain", name: "Sans", per: offsetStyle(0x1D5A0, 0x1D5BA, 0x1D7E2) },
    { id: "sansbolditalic", name: "Sans bold italic", per: offsetStyle(0x1D63C, 0x1D656, 0x1D7EC) },
    { id: "bubbleblack", name: "Bubble dark", per: function (ch) {
      var c = ch.toUpperCase().charCodeAt(0);
      return c >= 65 && c <= 90 ? String.fromCodePoint(0x1F150 + c - 65) : ch;
    } },
    { id: "paren", name: "Parentheses", per: function (ch) {
      var c = ch.toLowerCase().charCodeAt(0);
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x249C + c - 97);
      if (c >= 49 && c <= 57) return String.fromCodePoint(0x2474 + c - 49);
      return ch;
    } },
    { id: "sub", name: "Subscript", per: mapStyle(
      "aehijklmnoprstuvx0123456789+-=()",
      "ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎") },
    { id: "upside", name: "Upside down", all: upsideDown },

    // ---------- เครื่องหมายซ้อน (ใช้ได้ทุกภาษา) ----------
    { id: "slash", name: "Slashed", all: combining("̸") },
    { id: "overline", name: "Overline", all: combining("̅") },
    { id: "doubleunder", name: "Double underline", all: combining("̳") },
    { id: "cross", name: "Crossed", all: combining("̽") },
    { id: "stars", name: "Stars", all: joinWith("☆") },
    { id: "dots", name: "Dots", all: joinWith("・") },
    { id: "sparkles", name: "Sparkles", all: function (text) {
      return text.split("\n").map(function (l) { return l.trim() ? "⋆｡˚ " + l + " ˚｡⋆" : l; }).join("\n");
    } },

    // ---------- ตัวอักษรหน้าตาคล้าย (ใช้อักษรภาษาอื่นแทน) ----------
    { id: "curvy", name: "Curvy", per: caseless("abcdefghijklmnopqrstuvwxyz", "ᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ") },
    { id: "yi", name: "Doodle", per: caseless("abcdefghijklmnopqrstuvwxyz", "ꍏꌃꏳꀷꏂꎇꁅꀍꀤ꒻ꀘ꒒ꎭꈤꂦᖘꆰꋪꌚ꓄ꀎ꒦ꅐꉧꌩꁴ") },
    { id: "greek", name: "Greek-ish", per: caseless("abcdefghijklmnopqrstuvwxyz", "αв¢∂єƒgнιנкℓмησρqяѕтυνωχуz") },
    { id: "cyrillic", name: "Cyrillic-ish", per: caseless("abcdefghijklmnopqrstuvwxyz", "дбҁↁєfбнiјќlмиоpqяѕгцvщжчз") },
    { id: "kana", name: "Kana-ish", per: caseless("abcdefghijklmnopqrstuvwxyz", "ﾑ乃ᄃり乇ｷムんﾉﾌズﾚﾶ刀のｱゐ尺丂ｲひ√Wﾒﾘ乙") }
  ];

  // กลุ่มของแต่ละสไตล์ (ใช้กรองในหน้าแปลงฟอนต์)
  var GROUPS = {
    fancy: "script scriptthin fraktur frakturthin double",
    basic: "bold bolditalic sans sansplain italic serifitalic sansbolditalic mono smallcaps wide",
    shapes: "bubble bubbleblack square paren tiny sub upside",
    deco: "strike under slash overline doubleunder cross hearts stars dots sparkles",
    alike: "curvy yi greek cyrillic kana"
  };
  Object.keys(GROUPS).forEach(function (g) {
    GROUPS[g].split(" ").forEach(function (id) {
      var st = STYLES.find(function (x) { return x.id === id; });
      if (st) st.group = g;
    });
  });

  // ใส่สัญลักษณ์คั่นระหว่างตัวอักษร (ข้ามช่องว่าง)
  function joinWith(sym) {
    return function (text) {
      return text.split("\n").map(function (line) {
        return splitGraphemes(line).filter(function (g) { return g !== " "; }).join(sym);
      }).join("\n");
    };
  }

  // แปลงตัวพิมพ์เล็ก/ใหญ่ให้เป็นตัวเดียวกัน
  function caseless(from, to) {
    var m = mapStyle(from, to);
    return function (ch) { return m(ch.toLowerCase()) === ch.toLowerCase() ? ch : m(ch.toLowerCase()); };
  }

  // กลับหัว: แปลงทีละตัวแล้วเรียงย้อนหลัง (บรรทัดก็กลับลำดับด้วย)
  var FLIP = mapStyle(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMPQRTUVWY12345679.,?!()[]{}<>_&'\"",
    "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz∀ꓭƆꓷƎℲ⅁Hſꓘ˥WԀΌꓤ⊥∩ΛM⅄⇂↊Ɛㄣϛ9ㄥ6˙'¿¡)(][}{><‾⅋,„");
  function upsideDown(text) {
    return text.split("\n").reverse().map(function (line) {
      return splitGraphemes(line).reverse().map(FLIP).join("");
    }).join("\n");
  }

  function convert(styleId, text) {
    var s = STYLES.find(function (x) { return x.id === styleId; });
    if (!s) return text;
    if (s.all) return s.all(text);
    return Array.from(text, s.per).join("");
  }

  window.KaoFonts = {
    styles: STYLES,
    groups: Object.keys(GROUPS),
    convert: convert,
    // ตัวอย่างสำหรับปุ่มเลือกสไตล์
    sample: function (id) { return convert(id, id === "square" || id === "bubble" ? "Cute" : "sample"); },
    graphemes: splitGraphemes
  };
})();
