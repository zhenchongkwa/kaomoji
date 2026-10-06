/*
 * ทำให้ Google และ AI (ChatGPT, Claude, Perplexity ฯลฯ) อ่านเว็บได้ครบ
 *
 * บอท AI ส่วนใหญ่ไม่รัน JavaScript เห็นแค่ HTML ดิบ ซึ่งเดิมแทบว่างเปล่า (ข้อความใส่ด้วย JS)
 * สคริปต์นี้เลยสร้าง/อัปเดต:
 *   - ข้อความภาษาไทยใส่ลงใน HTML ทุกหน้าตรงๆ (JS เปลี่ยนเป็นอังกฤษให้ทีหลังถ้าผู้ใช้เลือก)
 *   - <title> / description / canonical / Open Graph / JSON-LD ของทุกหน้า
 *   - หน้าหมวดหมู่ kaomoji/<ชื่อ>.html หนึ่งหน้าต่อหมวด (คาโอโมจิอยู่ใน HTML เลย)
 *   - หน้ารวมหมวด kaomoji/index.html และลิงก์ทุกหมวดท้ายหน้าแรก
 *   - sitemap.xml, robots.txt, llms.txt, llms-full.txt
 *
 * ก่อนขึ้นเว็บจริง: ใส่โดเมนใน tools/site.json แล้วรัน   node tools/build-seo.js
 * (รันใหม่ทุกครั้งที่เพิ่มคาโอโมจิ/หมวด/แก้ข้อความ — คำสั่งนี้อัปเดตฟอนต์ให้ด้วย)
 */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const write = (f, s) => {
  fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
  fs.writeFileSync(path.join(root, f), s);
};

// อัปเดตลิงก์ฟอนต์คาโอโมจิก่อน (หน้าที่สร้างใหม่คัดลอกส่วนหัวจากหน้าแรก)
require("./font-subset.js");

// ---------- โหลดข้อมูลของเว็บ ----------
global.window = {};
eval(read("data/kaomoji.js"));
eval(read("data/search.js"));
eval(read("js/i18n.js"));
eval(read("js/fonts.js"));
eval(read("js/config.js"));
const CONFIG = window.KAO_CONFIG || {};
const DATA = window.KAOMOJI_DATA;
const TH = window.I18N.th, EN = window.I18N.en;
const FONT_COUNT = window.KaoFonts.styles.length;

const site = JSON.parse(read("tools/site.json"));
const SITE = site.url.replace(/\/+$/, "");
if (/example/.test(SITE)) {
  console.warn("\n  ⚠  ยังไม่ได้ใส่โดเมนจริงใน tools/site.json (ตอนนี้: " + SITE + ")");
  console.warn("     ลิงก์ canonical/sitemap จะยังไม่ถูกต้องจนกว่าจะแก้แล้วรันใหม่\n");
}
// ลิงก์เต็มของแต่ละหน้า (cleanUrls: ตัด .html ออก ตามที่ Cloudflare Pages / Netlify / GitHub Pages เสิร์ฟ)
const url = (p) => {
  if (p === "index.html") return SITE + "/";
  if (/(^|\/)index\.html$/.test(p)) return SITE + "/" + p.replace(/index\.html$/, "");
  return SITE + "/" + (site.cleanUrls ? p.replace(/\.html$/, "") : p);
};

const L = (th, en) => `<span data-l="th">${th}</span> <span data-l="en">${en}</span>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const today = new Date().toISOString().slice(0, 10);
const ALL = new Set();
DATA.forEach((c) => c.items.forEach((k) => ALL.add(k)));
const TOTAL = ALL.size;
const fmt = (n) => n.toLocaleString("en-US");

// กลุ่มหมวด: อ่านจาก js/app.js ให้ตรงกับหน้าเว็บเสมอ
const GROUPS = [];
read("js/app.js").replace(/\{ key: "(\w+)", ids: \[([^\]]+)\] \}/g, (m, key, ids) => {
  GROUPS.push({ key, ids: ids.match(/"([^"]+)"/g).map((x) => x.slice(1, -1)) });
});
const groupOf = {};
GROUPS.forEach((g) => g.ids.forEach((id) => { groupOf[id] = g; }));

// ชื่อไฟล์ของหมวด: จากชื่ออังกฤษ เช่น "Table flip" -> table-flip
const slugOf = {};
DATA.forEach((c) => {
  let s = c.en.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || c.id;
  while (Object.values(slugOf).includes(s)) s += "-2";
  slugOf[c.id] = s;
});

// ตัวอย่างหน้าสั้นๆ ของหมวด (ใช้ในชื่อหน้า/คำอธิบาย)
const samples = (c, n) => c.items.filter((k) => [...k].length <= 12).slice(0, n);

// ---------- ส่วนหัว <head> ที่ใช้ร่วมกัน (ฟอนต์ ธีม CSS) เอาจากหน้าแรก ----------
const indexHtml = read("index.html");
const sharedHead = indexHtml.slice(indexHtml.indexOf('  <link rel="preconnect"'), indexHtml.indexOf("</head>"));
const ver = (indexHtml.match(/js\/common\.js\?v=(\d+)/) || [])[1] || "1";
const scripts = (list) => list.map((s) => `  <script src="${s}?v=${ver}"></script>`).join("\n");

function seoBlock(o) {
  const ld = JSON.stringify(o.ld, null, 0).replace(/</g, "\\u003c");
  return [
    "<!-- seo:start -->",
    `  <link rel="canonical" href="${esc(o.url)}">`,
    `  <meta property="og:type" content="website">`,
    `  <meta property="og:site_name" content="Kaomoji Library">`,
    `  <meta property="og:title" content="${esc(o.title)}">`,
    `  <meta property="og:description" content="${esc(o.desc)}">`,
    `  <meta property="og:url" content="${esc(o.url)}">`,
    `  <meta property="og:locale" content="th_TH">`,
    `  <meta property="og:locale:alternate" content="en_US">`,
    `  <meta name="twitter:card" content="summary">`,
    `  <script type="application/ld+json">${ld}</script>`,
    "  <!-- seo:end -->"
  ].join("\n");
}

// ใส่ title / description / บล็อก SEO ลงใน HTML ที่มีอยู่
function applyHead(html, o) {
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(o.title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(o.desc)}">`);
  const block = seoBlock(o);
  if (html.includes("<!-- seo:start -->")) html = html.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, block);
  else html = html.replace(/(<meta name="description"[^>]*>\n)/, `$1  ${block}\n`);
  return html;
}

// ใส่ข้อความภาษาไทยลงใน HTML ดิบ (data-i18n) ให้บอทที่ไม่รัน JS เห็น
function prefill(html) {
  html = html.replace(/(<([a-z0-9]+)\b[^>]*\sdata-i18n="([A-Za-z0-9_]+)"[^>]*>)[^<]*(<\/\2>)/g, (m, open, tag, key, close) =>
    TH[key] != null ? open + esc(TH[key]) + close : m);
  html = html.replace(/(<(?:input|textarea)\b[^>]*\sdata-i18n-ph="([A-Za-z0-9_]+)")((?:\s+placeholder="[^"]*")?)/g, (m, open, key) =>
    TH[key] != null ? `${open} placeholder="${esc(TH[key])}"` : m);
  return html;
}

const webSite = { "@type": "WebSite", name: "Kaomoji Library", url: SITE + "/", inLanguage: ["th", "en"] };
const app = (name, desc, p) => ({
  "@context": "https://schema.org", "@type": "WebApplication", name, description: desc, url: url(p),
  applicationCategory: "UtilitiesApplication", operatingSystem: "Any", inLanguage: ["th", "en"],
  offers: { "@type": "Offer", price: "0", priceCurrency: "THB" }, isPartOf: webSite
});

// ---------- หน้าหลัก 6 หน้า ----------
const PAGES = {
  "index.html": {
    title: `คาโอโมจิน่ารัก ${fmt(TOTAL)} แบบ กดคัดลอกได้เลย · Kaomoji Library (Cute Japanese Emoticons)`,
    desc: `รวมคาโอโมจิ (Kaomoji) อีโมติคอนญี่ปุ่น ${fmt(TOTAL)} แบบ ${DATA.length} หมวด เช่น แมว ร้องไห้ ดีใจ เขิน ค้นได้ทั้งไทยและอังกฤษ กดเพื่อคัดลอก · ${fmt(TOTAL)} cute kaomoji (Japanese text faces) to copy and paste.`,
    ld: { "@context": "https://schema.org", ...webSite,
      potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: SITE + "/index.html?q={search_term_string}" }, "query-input": "required name=search_term_string" } }
  },
  "font.html": {
    title: `แปลงฟอนต์น่ารัก ${FONT_COUNT} แบบ ก๊อปไปวางได้ · Fancy Font Generator | Kaomoji Library`,
    desc: `แปลงตัวอักษรอังกฤษเป็นฟอนต์น่ารัก ${FONT_COUNT} แบบ ตัวเขียน ตัวหนา Small caps ตัวกลับหัว ไว้แต่งไบโอ IG TikTok X · Free fancy text generator with ${FONT_COUNT} styles to copy and paste.`
  },
  "aa.html": {
    title: "AA อวยพรวันเกิด ใส่ชื่อได้ · Birthday ASCII Art Generator | Kaomoji Library",
    desc: "สร้าง AA (ASCII art) อวยพรวันเกิดและวันพิเศษ ใส่ชื่อเพื่อน เลือกลาย แล้วคัดลอกไปส่งได้เลย · Make cute birthday and celebration ASCII art with your own text."
  },
  "frame.html": {
    title: "กรอบข้อความน่ารัก + สัตว์ · Cute Text Frame Maker | Kaomoji Library",
    desc: "ใส่ข้อความในกรอบหัวใจ ดาว ริบบิ้น มีแมว หมา หมี เกาะด้านบน ปรับความกว้างให้พอดีจอมือถือ · Put your text in a cute ASCII frame with animals, sized for phone screens."
  },
  "kirakira.html": {
    title: "สัญลักษณ์น่ารัก แต่งข้อความวิบวับ · Aesthetic Symbols & Sparkle Text | Kaomoji Library",
    desc: "สัญลักษณ์น่ารักกว่า 200 แบบ ดาว หัวใจ ดอกไม้ วงเล็บ ꒰ა ໒꒱ ⋆｡˚ กดเพื่อแทรก หรือหยิบชุดสำเร็จรูปไปใช้ · Cute aesthetic symbols and sparkle text decorations to copy and paste."
  },
  "emoji.html": {
    title: "สุ่มอีโมจิต่อท้ายข้อความ · Emoji Combo Generator | Kaomoji Library",
    desc: "สุ่มชุดอีโมจิน่ารักต่อท้ายโพสต์ เลือกธีม อาหาร ทะเล ปาร์ตี้ หรือสีหัวใจ แล้วคัดลอกไปใช้ · Add a random cute emoji combo to the end of your post, by theme or color."
  }
};
const F = window.KaoFonts;
const fx = (id, t) => F.convert(id, t);
const ABOUT = {
  "index.html": [
    `คาโอโมจิ (顔文字) คือหน้าตาที่ทำจากตัวอักษร เช่น ( ˘ᵕ˘ ) หรือ (╥﹏╥) นิยมใช้ในแชทและโซเชียล เว็บนี้รวมไว้ ${fmt(TOTAL)} แบบ แบ่งเป็น ${DATA.length} หมวด ค้นหาได้ทั้งภาษาไทยและอังกฤษ`,
    `Kaomoji (顔文字, "face characters") are faces made from text, like ( ˘ᵕ˘ ) or (╥﹏╥). This site has ${fmt(TOTAL)} of them in ${DATA.length} categories, searchable in Thai and English.`],
  "font.html": [
    `แปลงตัวอักษรภาษาอังกฤษเป็นฟอนต์แบบต่างๆ ${FONT_COUNT} สไตล์ เช่น ${fx("script", "Cute")} ${fx("bold", "Cute")} ${fx("double", "Cute")} ${fx("smallcaps", "cute")} เป็นตัวอักษร Unicode ไม่ใช่รูปภาพ เลยใช้แต่งชื่อโปรไฟล์ ไบโอ IG TikTok หรือโพสต์ใน X ได้`,
    `Turns English letters into ${FONT_COUNT} Unicode styles like ${fx("script", "Cute")}, ${fx("bold", "Cute")} and ${fx("smallcaps", "cute")}. They are real characters, not images, so they work in bios, display names and posts.`],
  "aa.html": [
    "AA (ASCII art) คือรูปที่วาดด้วยตัวอักษรและสัญลักษณ์ ใส่ชื่อหรือคำอวยพรลงในลาย แล้วคัดลอกไปส่งในแชทหรือโพสต์วันเกิด มีลายดาว หัวใจ แมว หมี เค้ก ขอบคุณ ยินดีด้วย และอื่นๆ",
    "ASCII art is a picture made from text characters. Type a name or message, pick a design (stars, hearts, cats, bears, cakes, thank-you and congrats) and copy it into a chat or birthday post."],
  "frame.html": [
    "ใส่ข้อความในกรอบที่ทำจากตัวอักษร เช่น ┏━♡━┓ ╭⌒╮ ୨୧ เลือกสัตว์ให้เกาะด้านบนได้ ตัวอย่างจำลองหน้าจอมือถือ เพื่อให้กรอบไม่เพี้ยนตอนโพสต์",
    "Wraps your text in a frame made of characters like ┏━♡━┓ or ╭⌒╮, with an optional animal on top. The preview mimics a phone screen so the frame stays aligned when you post it."],
  "kirakira.html": [
    "สัญลักษณ์น่ารักกว่า 200 แบบ เช่น ⋆｡˚ ꒰ა ໒꒱ ✧˖° ୨୧ ไว้แต่งชื่อ แคปชั่น หรือไบโอ กดเพื่อแทรกตรงเคอร์เซอร์ หรือคัดลอกชุดสำเร็จรูปไปใช้เลย",
    "200+ cute symbols like ⋆｡˚, ꒰ა ໒꒱ and ✧˖° for names, captions and bios. Click to insert them where your cursor is, or copy a ready-made set."],
  "emoji.html": [
    "สุ่มอีโมจิ 2 ถึง 3 ตัวต่อท้ายข้อความ เลือกธีมได้ เช่น อาหาร ทะเล ปาร์ตี้ หรือเลือกตามสีหัวใจให้เข้ากับสีด้อม",
    "Adds 2 or 3 random emoji to the end of your text. Pick a theme like food, sea or party, or a color to match your fandom."]
};
const aboutBlock = (p) => `<!-- about:start --><p class="page-about">${L(esc(ABOUT[p][0]), esc(ABOUT[p][1]))}</p><!-- about:end -->`;

Object.keys(PAGES).forEach((p) => {
  const o = PAGES[p];
  o.url = url(p);
  if (!o.ld) o.ld = app(o.title.split(" · ")[0], o.desc, p);
});

// ---------- หน้าหมวดหมู่ ----------

function catPage(c) {
  const slug = slugOf[c.id], file = `kaomoji/${slug}.html`, n = c.items.length;
  const ex = samples(c, 3);
  const title = `คาโอโมจิ${c.th} ${n} แบบ ${ex[0] || ""} · ${c.en} Kaomoji | Kaomoji Library`;
  const desc = `รวมคาโอโมจิ${c.th} ${n} แบบ เช่น ${ex.join(" ")} กดเพื่อคัดลอกไปใช้ในแชทหรือโพสต์ · ${n} ${c.en.toLowerCase()} kaomoji (Japanese text faces) to copy and paste.`;
  const g = groupOf[c.id];
  const related = (g ? g.ids : []).filter((id) => id !== c.id).map((id) => DATA.find((x) => x.id === id)).filter(Boolean);
  const words = ((window.KAO_SEARCH.words[c.id] || "") + " " + c.tags.join(" ")).split(/\s+/)
    .filter((w, i, a) => w && !/\p{Extended_Pictographic}/u.test(w) && a.indexOf(w) === i && w !== c.th && w.toLowerCase() !== c.en.toLowerCase())
    .slice(0, 14);
  const ld = [
    { "@context": "https://schema.org", "@type": "CollectionPage", name: `คาโอโมจิ${c.th} · ${c.en} Kaomoji`, description: desc,
      url: url(file), inLanguage: ["th", "en"], isPartOf: webSite,
      mainEntity: { "@type": "ItemList", numberOfItems: n, itemListElement: c.items.slice(0, 20).map((k, i) => ({ "@type": "ListItem", position: i + 1, name: k })) } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Kaomoji Library", item: url("index.html") },
      { "@type": "ListItem", position: 2, name: "หมวดหมู่ · Categories", item: url("kaomoji/index.html") },
      { "@type": "ListItem", position: 3, name: `${c.th} · ${c.en}`, item: url(file) }] }
  ];
  const cards = c.items.map((k) => `<button type="button" class="card${[...k].length > 16 ? " wide" : ""}" data-k="${esc(k)}">${esc(k)}</button>`).join("\n        ");
  const body = `
  <main class="main tool wide cat-page">
    <nav class="crumbs" aria-label="breadcrumb">
      <a href="index.html">${L("หน้าแรก", "Home")}</a> <span aria-hidden="true">›</span>
      <a href="kaomoji/">${L("หมวดหมู่", "Categories")}</a> <span aria-hidden="true">›</span>
      <span>${L(esc(c.th), esc(c.en))}</span>
    </nav>
    <div class="cat-head">
      <h1 class="page-title">${L("คาโอโมจิ" + esc(c.th), esc(c.en) + " kaomoji")} ${ex[0] ? `<span class="face">${esc(ex[0])}</span>` : ""}</h1>
      <p class="lead">${L(
        `${n} แบบ กดที่การ์ดเพื่อคัดลอก แล้ววางในแชทหรือโพสต์ได้เลย`,
        `${n} ${esc(c.en.toLowerCase())} kaomoji (Japanese text faces). Click one to copy it, then paste it into a chat or post.`)}</p>
    </div>
    <div class="grid" id="grid">
        ${cards}
    </div>
    <p class="cat-open"><a class="btn btn-outline" href="index.html?cat=${esc(c.id)}">${L("เปิดในคลัง (ค้นหา · รายการโปรด)", "Open in the library (search · favorites)")}</a></p>
    ${related.length ? `<section class="related">
      <h2 class="section-title">${L("หมวดใกล้เคียง", "Related")}</h2>
      <nav class="related-links">
        ${related.map((r) => `<a class="chip" href="kaomoji/${slugOf[r.id]}.html">${L(esc(r.th), esc(r.en))}</a>`).join("\n        ")}
        <a class="chip" href="kaomoji/">${L("ทั้งหมด", "All")} →</a>
      </nav>
    </section>` : ""}
    ${words.length ? `<p class="cat-words">${L("ค้นหาด้วยคำว่า", "Also searched as")}: ${esc(words.join(", "))}</p>` : ""}
  </main>`;
  return { file, html: pageShell({ title, desc, url: url(file), ld, body, scripts: ["js/i18n.js", "js/sound.js", "js/motion.js", "js/common.js", "js/config.js", "js/support.js", "js/category.js"] }) };
}

// โครงหน้า HTML ของหน้าที่สร้างใหม่ (อยู่ในโฟลเดอร์ kaomoji/ เลยใช้ <base href="../">)
function pageShell(o) {
  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
${o.root ? "" : '  <base href="../">\n'}  <title>${esc(o.title)}</title>
  <meta name="description" content="${esc(o.desc)}">
  ${seoBlock(o)}
${sharedHead}</head>
<body data-page="library">
  <header id="siteHeader" class="header"></header>
${o.body}

  <footer id="siteFooter" class="footer"></footer>

${scripts(o.scripts)}
</body>
</html>
`;
}

// ---------- หน้ารวมหมวด ----------
function hubPage() {
  const file = "kaomoji/index.html";
  const title = `หมวดหมู่คาโอโมจิทั้งหมด ${DATA.length} หมวด · All Kaomoji Categories | Kaomoji Library`;
  const desc = `คาโอโมจิ ${fmt(TOTAL)} แบบ แบ่งเป็น ${DATA.length} หมวด เช่น แมว ร้องไห้ ดีใจ เขิน กอด ขอโทษ · All ${DATA.length} kaomoji categories: cats, crying, happy, shy, hugs and more.`;
  const sections = GROUPS.map((g) => `
    <section class="hub-group">
      <h2 class="section-title">${L(esc(TH[g.key]), esc(EN[g.key]))}</h2>
      <div class="hub-list">
        ${g.ids.map((id) => DATA.find((x) => x.id === id)).filter(Boolean).map((c) =>
          `<a class="hub-card" href="kaomoji/${slugOf[c.id]}.html"><span class="hub-face">${esc(samples(c, 1)[0] || "")}</span><span class="hub-name">${L(esc(c.th), esc(c.en))}</span><small>${c.items.length}</small></a>`).join("\n        ")}
      </div>
    </section>`).join("");
  const body = `
  <main class="main tool wide cat-page">
    <nav class="crumbs" aria-label="breadcrumb">
      <a href="index.html">${L("หน้าแรก", "Home")}</a> <span aria-hidden="true">›</span>
      <span>${L("หมวดหมู่", "Categories")}</span>
    </nav>
    <div class="cat-head">
      <h1 class="page-title">${L("หมวดหมู่คาโอโมจิ", "Kaomoji categories")} <span class="face">( ˘ᵕ˘ )</span></h1>
      <p class="lead">${L(`${fmt(TOTAL)} แบบ ใน ${DATA.length} หมวด`, `${fmt(TOTAL)} kaomoji in ${DATA.length} categories`)}</p>
    </div>${sections}
  </main>`;
  const ld = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Kaomoji categories", description: desc, url: url(file), isPartOf: webSite,
    hasPart: DATA.map((c) => ({ "@type": "CollectionPage", name: `${c.th} · ${c.en}`, url: url(`kaomoji/${slugOf[c.id]}.html`) })) };
  return { file, html: pageShell({ title, desc, url: url(file), ld, body, scripts: ["js/i18n.js", "js/sound.js", "js/motion.js", "js/common.js", "js/config.js", "js/support.js", "js/category.js"] }) };
}

// ---------- นโยบายความเป็นส่วนตัว ----------
function privacyPage() {
  const file = "privacy.html";
  const title = "นโยบายความเป็นส่วนตัว · Privacy Policy | Kaomoji Library";
  const desc = "ข้อมูลที่ Kaomoji Library เก็บ โฆษณา และคุกกี้ · What Kaomoji Library stores, and how ads and cookies work.";
  const contact = CONFIG.contact
    ? `<p class="policy">${L("ติดต่อ", "Contact")}: <a href="${esc(CONFIG.contact)}">${esc(CONFIG.contact.replace(/^(mailto:|https?:\/\/)/, ""))}</a></p>`
    : "";
  const sec = (th, en, bodyTh, bodyEn) => `
    <section class="policy">
      <h2 class="section-title">${L(th, en)}</h2>
      <p>${L(esc(bodyTh), esc(bodyEn))}</p>
    </section>`;
  const body = `
  <main class="main tool cat-page">
    <nav class="crumbs" aria-label="breadcrumb">
      <a href="index.html">${L("หน้าแรก", "Home")}</a> <span aria-hidden="true">›</span>
      <span>${L("นโยบายความเป็นส่วนตัว", "Privacy policy")}</span>
    </nav>
    <div class="cat-head">
      <h1 class="page-title">${L("นโยบายความเป็นส่วนตัว", "Privacy policy")}</h1>
      <p class="lead">${L("อัปเดตล่าสุด " + today, "Last updated " + today)}</p>
    </div>` +
    sec("ข้อมูลที่เก็บในเครื่องของคุณ", "Data stored on your device",
      "รายการโปรด คาโอโมจิที่ใช้ล่าสุด ภาษา ธีม การเปิดปิดเสียง จำนวนป๊อป และการซ่อนโฆษณา เก็บไว้ใน localStorage ของเบราว์เซอร์คุณเท่านั้น ไม่ได้ส่งมาที่เรา ลบได้ด้วยการล้างข้อมูลเว็บไซต์ในเบราว์เซอร์",
      "Favorites, recently copied kaomoji, language, theme, sound setting, pop count and your ads choice are kept in your browser's localStorage only. They are not sent to us. Clearing site data in your browser removes them.") +
    sec("ข้อความที่คุณพิมพ์", "Text you type",
      "ข้อความในเครื่องมือแปลงฟอนต์ กรอบข้อความ และเครื่องมืออื่นๆ ประมวลผลในเบราว์เซอร์ทั้งหมด ไม่มีการส่งไปเซิร์ฟเวอร์หรือบันทึกไว้",
      "Text you enter in the font converter, frame maker and other tools is processed entirely in your browser. It is never sent to a server or saved.") +
    sec("โฆษณาและคุกกี้", "Ads and cookies",
      "เว็บนี้อาจแสดงโฆษณาจาก Google AdSense ซึ่ง Google และพาร์ทเนอร์อาจใช้คุกกี้เพื่อแสดงโฆษณา รวมถึงโฆษณาตามความสนใจ คุณปิดโฆษณาตามความสนใจได้ที่ Google Ads Settings (adssettings.google.com) และกด “ซ่อนโฆษณา” บนเว็บนี้ได้ทุกเมื่อ ซึ่งจะหยุดโหลดโฆษณาในเบราว์เซอร์นี้ อ่านเพิ่มเติมได้ที่ policies.google.com/technologies/ads",
      "This site may show ads from Google AdSense. Google and its partners may use cookies to serve ads, including ads based on your interests. You can turn off personalized ads at Google Ads Settings (adssettings.google.com), and you can press “Hide ads” on this site at any time, which stops ads from loading in this browser. More at policies.google.com/technologies/ads") +
    sec("ฟอนต์", "Fonts",
      "ฟอนต์บางตัวโหลดจาก Google Fonts ซึ่งจะเห็นที่อยู่ IP ของคุณตามปกติของการโหลดไฟล์จากอินเทอร์เน็ต",
      "Some fonts are loaded from Google Fonts, which receives your IP address as part of any normal file request.") +
    sec("การเลี้ยงขนม", "Donations",
      "การเลี้ยงขนมผ่านพร้อมเพย์หรือ TrueMoney ทำในแอปธนาคารหรือแอป TrueMoney ของคุณเอง เว็บนี้ไม่เห็นและไม่เก็บข้อมูลการชำระเงินใดๆ",
      "Donations via PromptPay or TrueMoney happen in your own banking or TrueMoney app. This site never sees or stores any payment details.") + `
    ${contact}
  </main>`;
  const ld = { "@context": "https://schema.org", "@type": "WebPage", name: "Privacy policy", url: url(file), isPartOf: webSite };
  return { file, html: pageShell({ root: true, title, desc, url: url(file), ld, body,
    scripts: ["js/i18n.js", "js/sound.js", "js/motion.js", "js/common.js", "js/config.js", "js/support.js", "js/category.js"] }) };
}

// ---------- เขียนไฟล์ ----------
// 1) หน้าหลัก: title/description/SEO + ข้อความไทยใน HTML
Object.keys(PAGES).forEach((p) => {
  let html = applyHead(read(p), PAGES[p]);
  html = prefill(html);
  if (p !== "index.html") {
    if (html.includes("<!-- about:start -->")) html = html.replace(/<!-- about:start -->[\s\S]*?<!-- about:end -->/, aboutBlock(p));
    else html = html.replace(/\n  <\/main>/, "\n    " + aboutBlock(p) + "\n  </main>");
  }
  if (p === "index.html") {
    html = html.replace(/<p class="page-lead" id="tagline">[^<]*<\/p>/,
      `<p class="page-lead" id="tagline">${esc(TH.tagline.replace("{n}", fmt(TOTAL)))}</p>`);
    // ลิงก์ทุกหมวดท้ายหน้าแรก (คนก็ใช้ได้ บอทก็ตามลิงก์ไปเจอทุกหน้า)
    const block = `<!-- cats:start -->
  <section class="all-cats main" aria-label="categories">
    ${aboutBlock("index.html")}
    <h2 class="section-title"><a href="kaomoji/">${L("หมวดหมู่ทั้งหมด", "All categories")}</a></h2>
    <nav class="all-cats-links">
      ${DATA.map((c) => `<a href="kaomoji/${slugOf[c.id]}.html">${L(esc(c.th), esc(c.en))}</a>`).join("\n      ")}
    </nav>
  </section>
  <!-- cats:end -->`;
    if (html.includes("<!-- cats:start -->")) html = html.replace(/<!-- cats:start -->[\s\S]*?<!-- cats:end -->/, block);
    else html = html.replace(`  <footer id="siteFooter"`, `  ${block}\n\n  <footer id="siteFooter"`);
  }
  write(p, html);
});

// 2) หน้าหมวด + หน้ารวม
const generated = DATA.map(catPage).concat([hubPage()]);
// ลบหน้าหมวดเก่าที่ไม่มีแล้ว (เช่นเปลี่ยนชื่อหมวด)
const keep = new Set(generated.map((g) => path.basename(g.file)));
if (fs.existsSync(path.join(root, "kaomoji"))) {
  fs.readdirSync(path.join(root, "kaomoji")).forEach((f) => { if (f.endsWith(".html") && !keep.has(f)) fs.unlinkSync(path.join(root, "kaomoji", f)); });
}
generated.forEach((g) => write(g.file, g.html));

// หน้านโยบายความเป็นส่วนตัว (อยู่ที่ราก ไม่ใช่ในโฟลเดอร์ kaomoji)
const privacy = privacyPage();
write(privacy.file, privacy.html);
generated.push(privacy);

// ads.txt: AdSense ต้องมีไฟล์นี้ที่รากของโดเมน (สร้างเมื่อใส่ client ใน js/config.js แล้ว)
const pub = ((CONFIG.ads || {}).client || "").replace(/^ca-/, "");
if (pub) write("ads.txt", `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
else if (fs.existsSync(path.join(root, "ads.txt"))) fs.unlinkSync(path.join(root, "ads.txt"));

// 3) sitemap.xml
const allPages = Object.keys(PAGES).concat(generated.map((g) => g.file));
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((p) => `  <url><loc>${esc(url(p))}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);

// 4) robots.txt: อนุญาตทุกบอท รวมถึงบอทของ AI (ให้ AI อ่านแล้วอ้างอิงเว็บได้)
write("robots.txt", `# อนุญาตให้ทุกบอทอ่านทั้งเว็บ รวมถึงบอทของผู้ให้บริการ AI
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

// 5) llms.txt: สรุปเว็บแบบ Markdown สำหรับ AI  +  llms-full.txt: คาโอโมจิทั้งหมดเป็นข้อความล้วน
write("llms.txt", `# Kaomoji Library

> Free collection of ${fmt(TOTAL)} kaomoji (Japanese text emoticons) in ${DATA.length} categories, with Thai and English search, plus text tools: a fancy font converter (${FONT_COUNT} styles), birthday ASCII art, cute text frames, aesthetic symbols and an emoji combo generator. Everything runs in the browser; click any item to copy it.
> คลังคาโอโมจิ ${fmt(TOTAL)} แบบ ${DATA.length} หมวด ค้นได้ทั้งไทยและอังกฤษ พร้อมเครื่องมือแต่งข้อความ ใช้ฟรี

## Kaomoji categories

${DATA.map((c) => `- [${c.en} kaomoji · คาโอโมจิ${c.th}](${url(`kaomoji/${slugOf[c.id]}.html`)}): ${c.items.length} kaomoji, e.g. ${samples(c, 3).join("  ")}`).join("\n")}

## Tools

- [Kaomoji search](${url("index.html")}): search all kaomoji in Thai or English, e.g. ${SITE}/index.html?q=cat
- [Fancy font converter · แปลงฟอนต์](${url("font.html")}): ${FONT_COUNT} Unicode text styles for bios and posts
- [Birthday ASCII art · AA อวยพร](${url("aa.html")}): celebration ASCII art with your own text
- [Text frame maker · กรอบข้อความ](${url("frame.html")}): cute ASCII frames with animals, sized for phone screens
- [Aesthetic symbols · แต่งวิบวับ](${url("kirakira.html")}): 200+ cute symbols and ready-made decorations
- [Emoji combos · เติมอีโมจิ](${url("emoji.html")}): random emoji combos by theme or color

## Optional

- [All kaomoji as plain text](${SITE}/llms-full.txt)
`);
write("llms-full.txt", `# Kaomoji Library: all ${fmt(TOTAL)} kaomoji
# ${SITE}/
# Format: one category per section, one kaomoji per line.

${DATA.map((c) => `## ${c.en} · ${c.th}\n${url(`kaomoji/${slugOf[c.id]}.html`)}\n\n${c.items.join("\n")}`).join("\n\n")}
`);

console.log(`✓ ${Object.keys(PAGES).length} pages updated, ${generated.length} pages generated, sitemap ${allPages.length} URLs, robots.txt, llms.txt, llms-full.txt`);
