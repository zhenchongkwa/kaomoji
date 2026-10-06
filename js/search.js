/*
 * ระบบค้นหาคาโอโมจิ (ทำงานในเบราว์เซอร์ล้วนๆ ไม่ใช้ API)
 *  - ตัดคำภาษาไทยด้วย Intl.Segmenter ("แมวน่ารัก" -> แมว + น่ารัก)
 *  - คำพ้อง/สแลง/อีโมจิของแต่ละหมวดจาก data/search.js
 *  - พิมพ์ผิดนิดหน่อยก็เจอ ("slepy" -> sleepy)
 *  - เรียงผลจากตรงที่สุดก่อน, ถ้าไม่มีอันไหนตรงทุกคำ แสดงอันที่ตรงบางคำแทน
 *
 *   KaoSearch.run("แมวน่ารัก") -> { items: [...], partial: false, fixed: [["slepy","sleepy"]] }
 */
(function () {
  "use strict";

  var DATA = window.KAOMOJI_DATA || [];
  var EXTRA = (window.KAO_SEARCH && window.KAO_SEARCH.words) || {};
  var STOP = new Set(((window.KAO_SEARCH && window.KAO_SEARCH.stop) || "").split(/\s+/));
  var THAI = /[฀-๿]/;
  var LATIN_WORD = /^[a-z]+$/;
  var EMOJI = /\p{Extended_Pictographic}/u;

  // น้ำหนัก: ชื่อหมวด > คำค้นในข้อมูล/คำพ้อง
  var W_NAME = 10, W_WORD = 6, W_GLYPH = 8;

  function norm(s) { return String(s).toLowerCase().replace(/️/g, "").trim(); }

  // ---------- เตรียมคำของแต่ละหมวด ----------
  var cats = DATA.map(function (c) {
    var words = new Map();
    function add(list, w) {
      list.forEach(function (x) {
        x = norm(x);
        if (x && (words.get(x) || 0) < w) words.set(x, w);
      });
    }
    add((c.th + " " + c.en).split(/\s+/), W_NAME);
    add([c.th, c.en], W_NAME); // ชื่อเต็มหลายคำ เช่น "table flip"
    add(c.tags, W_WORD);
    add((EXTRA[c.id] || "").split(/\s+/), W_WORD);
    return { id: c.id, words: words, list: Array.from(words.entries()) };
  });

  // kaomoji -> หมวดที่อยู่ (ตัวเดียวกันอาจอยู่หลายหมวด)
  var itemCats = new Map(), order = [];
  DATA.forEach(function (c, ci) {
    c.items.forEach(function (k) {
      if (!itemCats.has(k)) { itemCats.set(k, []); order.push(k); }
      itemCats.get(k).push(ci);
    });
  });
  var lower = new Map(order.map(function (k) { return [k, k.toLowerCase()]; }));

  // คำทั้งหมด (ใช้หาคำที่ใกล้เคียงตอนพิมพ์ผิด)
  var vocab = new Set();
  cats.forEach(function (c) { c.words.forEach(function (_, w) { if (LATIN_WORD.test(w) && w.length >= 3) vocab.add(w); }); });

  // ---------- ตัดคำค้น ----------
  var seg = window.Intl && Intl.Segmenter ? new Intl.Segmenter("th", { granularity: "word" }) : null;
  var graph = window.Intl && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;

  function knownExact(t) { return cats.some(function (c) { return c.words.has(t); }); }

  function tokenize(query) {
    var out = [];
    norm(query).split(/\s+/).forEach(function (chunk) {
      if (!chunk) return;
      // อีโมจิแยกเป็นคำละตัว ส่วนที่เหลือค้นตามปกติ
      if (EMOJI.test(chunk) && graph) {
        var rest = "";
        Array.from(graph.segment(chunk), function (s) { return s.segment; }).forEach(function (g) {
          if (EMOJI.test(g)) { if (rest) { out.push(rest); rest = ""; } out.push(g); }
          else rest += g;
        });
        if (rest) out.push(rest);
        return;
      }
      // ไทยไม่เว้นวรรค: ถ้าทั้งก้อนเป็นคำที่รู้จักก็ใช้ทั้งก้อน ไม่งั้นตัดคำ
      if (THAI.test(chunk) && seg && !knownExact(chunk)) {
        var parts = Array.from(seg.segment(chunk)).filter(function (s) {
          return s.isWordLike !== false && s.segment.trim();
        }).map(function (s) { return s.segment; });
        // ตัวตัดคำบางทีแยกเกินไป (น่ารัก -> น่า + รัก): ต่อชิ้นติดกันกลับถ้ารวมแล้วเป็นคำที่รู้จัก
        for (var i = 0; i < parts.length; i++) {
          var take = 1;
          for (var j = parts.length; j > i + 1; j--) {
            if (knownExact(parts.slice(i, j).join(""))) { take = j - i; break; }
          }
          out.push(parts.slice(i, i + take).join(""));
          i += take - 1;
        }
        return;
      }
      out.push(chunk);
    });
    var kept = out.filter(function (t) { return !STOP.has(t); });
    // ถ้าตัดคำฟุ่มเฟือยออกหมดเลย (เช่นค้นแค่ "หน้า") ใช้คำเดิม
    kept = kept.length ? kept : out;
    return kept.filter(function (t, i) { return kept.indexOf(t) === i; });
  }

  // ---------- ให้คะแนน ----------
  // คะแนนของคำค้นหนึ่งคำกับหมวดหนึ่ง: ตรงเป๊ะ > ขึ้นต้นเหมือนกัน > คำค้นยาวกว่า (crying ~ cry) > อยู่ข้างในคำ
  function catScore(cat, t) {
    var exact = cat.words.get(t);
    if (exact) return exact;
    var best = 0;
    for (var i = 0; i < cat.list.length; i++) {
      var w = cat.list[i][0], wt = cat.list[i][1], s = 0;
      if (t.length >= 2 && w.indexOf(t) === 0) s = wt * 0.6;
      else if (t.length >= 4 && w.length >= 3 && t.indexOf(w) === 0) s = wt * 0.5;
      else if (t.length >= 3 && w.indexOf(t) > 0) s = wt * 0.35;
      if (s > best) best = s;
    }
    return best;
  }

  // ระยะห่างการพิมพ์ (Damerau-Levenshtein แบบง่าย) หยุดเร็วถ้าเกิน max
  function dist(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev2 = null, prev = [], cur;
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      cur = [i];
      var rowMin = i;
      for (j = 1; j <= b.length; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        var v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
        cur[j] = v;
        if (v < rowMin) rowMin = v;
      }
      if (rowMin > max) return max + 1;
      prev2 = prev;
      prev = cur;
    }
    return prev[b.length];
  }

  function fix(t) {
    if (!LATIN_WORD.test(t) || t.length < 4) return null;
    var max = t.length >= 7 ? 2 : 1, best = null, bestD = max + 1;
    vocab.forEach(function (w) {
      var d = dist(t, w, max);
      if (d < bestD || (d === bestD && best && w.length < best.length)) { bestD = d; best = w; }
    });
    return bestD <= max ? best : null;
  }

  function run(query) {
    var tokens = tokenize(query);
    var fixed = [];
    if (!tokens.length) return { items: [], partial: false, fixed: fixed };

    // คะแนนของแต่ละคำกับทุกหมวด (คำนวณครั้งเดียวต่อการค้นหา)
    var table = tokens.map(function (t) {
      var scores = cats.map(function (c) { return catScore(c, t); });
      var any = scores.some(function (s) { return s > 0; });
      // ไม่เจอในหมวดไหนเลย และไม่ใช่ตัวอักษรในหน้าคาโอโมจิ ลองแก้คำที่พิมพ์ผิด
      if (!any && !order.some(function (k) { return lower.get(k).indexOf(t) !== -1; })) {
        var f = fix(t);
        if (f) {
          fixed.push([t, f]);
          t = f;
          scores = cats.map(function (c) { return catScore(c, f); });
        }
      }
      return { t: t, scores: scores };
    });

    var full = [], some = [];
    order.forEach(function (k, idx) {
      var cs = itemCats.get(k), total = 0, hit = 0;
      table.forEach(function (row) {
        var s = 0;
        for (var i = 0; i < cs.length; i++) if (row.scores[cs[i]] > s) s = row.scores[cs[i]];
        // ค้นด้วยตัวอักษรในหน้าเลย เช่น ω หรือ (╯°□°）╯
        if (row.t.length >= 1 && !LATIN_WORD.test(row.t) && !THAI.test(row.t) && lower.get(k).indexOf(row.t) !== -1) s = Math.max(s, W_GLYPH);
        else if (LATIN_WORD.test(row.t) && row.t.length >= 2 && lower.get(k).indexOf(row.t) !== -1) s = Math.max(s, 4);
        if (s > 0) { hit++; total += s; }
      });
      if (!hit) return;
      var r = { k: k, total: total, hit: hit, idx: idx };
      (hit === table.length ? full : some).push(r);
    });

    var partial = !full.length;
    var list = partial ? some : full;
    list.sort(function (a, b) { return b.hit - a.hit || b.total - a.total || a.idx - b.idx; });
    return { items: list.map(function (r) { return r.k; }), partial: partial && list.length > 0, fixed: fixed };
  }

  window.KaoSearch = { run: run, tokenize: tokenize };
})();
