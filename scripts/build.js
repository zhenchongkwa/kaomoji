/*
 * สร้างหน้าเว็บแบบ static เพื่อ SEO:
 *   - index.html            คลังคาโอโมจิ (เขียนคาโอโมจิทั้งหมดลงใน HTML ให้ Google อ่านได้)
 *   - k/<หมวด>.html          หน้าแยกต่อหมวด (48 หน้า)
 *   - เติม meta OG/Twitter/canonical/favicon ให้หน้าเครื่องมือ (ระหว่าง <!--SEO--> ... <!--/SEO-->)
 *   - sitemap.xml, robots.txt
 * วิธีใช้:  node scripts/build.js    (รันใหม่ทุกครั้งที่แก้ data/kaomoji.js หรือเทมเพลตนี้)
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const SITE = "https://zhenchongkwa.github.io/kaomoji/";
const V = "21"; // เลขเวอร์ชันไฟล์ (กัน cache) — เพิ่มเมื่อแก้ CSS/JS
const TODAY = new Date().toISOString().slice(0, 10);

// ---------- โหลดข้อมูล ----------
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "data/kaomoji.js"), "utf8"), sandbox);
const DATA = sandbox.window.KAOMOJI_DATA;
const ALL = [...new Set(DATA.flatMap((c) => c.items))];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const write = (rel, text) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};

const FONTS = "https://fonts.googleapis.com/css2?family=Mali:wght@500;700&family=M+PLUS+Rounded+1c:wght@400;700" +
  "&family=Noto+Sans+JP:wght@400&family=Space+Grotesk:wght@700&family=Space+Mono:wght@400;700" +
  "&family=Noto+Sans+Thai:wght@400;600;700&display=swap";

// ---------- meta ที่ใช้ร่วมกัน ----------
function seoBlock({ title, desc, url, base, jsonld }) {
  return [
    "<!--SEO-->",
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="คลังคาโอโมจิ · Kaomoji Library">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${SITE}og.png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:locale" content="th_TH">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${SITE}og.png">`,
    `<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">`,
    `<link rel="icon" href="${base}favicon-32.png" sizes="32x32" type="image/png">`,
    `<link rel="apple-touch-icon" href="${base}apple-touch-icon.png">`,
    `<meta name="theme-color" content="#fff8ee">`,
    jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : "",
    "<!--/SEO-->"
  ].filter(Boolean).map((l) => "  " + l).join("\n").trimStart();
}

function head({ title, desc, url, base, jsonld }) {
  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  ${seoBlock({ title, desc, url, base, jsonld })}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONTS}" rel="stylesheet">
  <link rel="stylesheet" href="${base}css/style.css?v=${V}">
  <script src="${base}js/intro.js?v=${V}"></script>
  <script>
    // ตั้งธีมก่อน render เพื่อไม่ให้หน้ากระพริบ
    try { var t = localStorage.getItem("kao.theme"); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  </script>
</head>`;
}

function catIndex(base) {
  return `  <section class="cat-index" aria-labelledby="catIndexTitle">
    <h2 id="catIndexTitle" data-i18n="allCats">หมวดหมู่ทั้งหมด</h2>
    <nav>
${DATA.map((c) => `      <a href="${base}k/${c.id}.html">${esc(c.th)} <small>${esc(c.en)}</small></a>`).join("\n")}
    </nav>
  </section>`;
}

// ---------- หน้าคลังคาโอโมจิ (index + หมวด) ----------
function libraryPage({ cat, base, url, title, desc, jsonld }) {
  const items = cat ? cat.items : ALL;
  const hero = cat
    ? `<h1 class="hero-title"><span id="heroCat">คาโอโมจิ${esc(cat.th)}</span> <mark>${esc(cat.items[0])}</mark></h1>`
    : `<h1 class="hero-title"><span data-i18n="heroTitle">หาคาโอโมจิที่ใช่</span> <mark data-i18n="heroMark">แล้วคลิกเลย</mark></h1>`;
  const bodyAttrs = `data-page="library"${cat ? ` data-cat="${cat.id}" data-base="${base}"` : ""}`;
  return `${head({ title, desc, url, base, jsonld })}
<body ${bodyAttrs}>
  <header id="siteHeader" class="header"></header>

  <main class="main library">
    <div class="lib-top">
      ${hero}
      <p class="page-lead" id="tagline"></p>
      <div class="search-wrap">
        <input id="search" type="search" autocomplete="off" spellcheck="false" data-i18n-ph="search">
      </div>
      <p class="kbd" data-i18n="kbdHint"></p>
    </div>

    <aside class="sidebar">
      <p class="sidebar-title" data-i18n="categories"></p>
      <nav class="cat-list" id="chips" aria-label="categories"></nav>
    </aside>

    <section class="lib-list">
      <div class="toolbar">
        <h2 id="sectionTitle"></h2>
        <span class="count" id="count"></span>
        <button class="link-btn" id="clearRecent" type="button" hidden></button>
      </div>
      <div class="grid" id="grid">
${items.map((k) => `<div class="card">${esc(k)}</div>`).join("\n")}
      </div>
      <p class="empty" id="empty" hidden></p>
    </section>
  </main>

${catIndex(base)}

  <footer id="siteFooter" class="footer"></footer>

  <script src="${base}data/kaomoji.js?v=${V}"></script>
  <script src="${base}js/i18n.js?v=${V}"></script>
  <script src="${base}js/sound.js?v=${V}"></script>
  <script src="${base}js/common.js?v=${V}"></script>
  <script src="${base}js/app.js?v=${V}"></script>
</body>
</html>
`;
}

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "คลังคาโอโมจิ · Kaomoji Library",
  url: SITE,
  inLanguage: ["th", "en"],
  author: { "@type": "Person", name: "zhenchong" }
};

write("index.html", libraryPage({
  base: "",
  url: SITE,
  title: "คลังคาโอโมจิ — รวมคาโอโมจิ 2,500+ แบบ คัดลอกได้ทันที | Kaomoji Library",
  desc: `รวมคาโอโมจิ (Kaomoji) อิโมติคอนญี่ปุ่น ${ALL.length.toLocaleString()} แบบ ในหมวดน่ารัก รัก เศร้า แมว หมี และสไตล์ SNS คลิกเพื่อคัดลอก ใช้ได้ทั้ง LINE, IG, X พร้อมเครื่องมือแปลงฟอนต์และแต่งข้อความ`,
  jsonld: website
}));

for (const cat of DATA) {
  const sample = cat.items.slice(0, 3).join(" ");
  const url = `${SITE}k/${cat.id}.html`;
  write(`k/${cat.id}.html`, libraryPage({
    cat,
    base: "../",
    url,
    title: `คาโอโมจิ${cat.th} ${cat.items[0]} — ${cat.en} kaomoji ${cat.items.length} แบบ | คลังคาโอโมจิ`,
    desc: `รวมคาโอโมจิ${cat.th} ${cat.items.length} แบบ เช่น ${sample} คลิกเพื่อคัดลอก ใช้ได้ทั้ง LINE, IG, X — ${cat.en} kaomoji copy & paste.`,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "คลังคาโอโมจิ", item: SITE },
        { "@type": "ListItem", position: 2, name: `คาโอโมจิ${cat.th}`, item: url }
      ]
    }
  }));
}

// ---------- หน้าเครื่องมือ: เติม/อัปเดตบล็อก SEO + เลขเวอร์ชัน ----------
const TOOLS = ["font.html", "aa.html", "frame.html", "kirakira.html", "emoji.html", "maker.html"];
for (const file of TOOLS) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) continue;
  let html = fs.readFileSync(full, "utf8");
  const title = html.match(/<title>([^<]*)<\/title>/)[1];
  const desc = html.match(/<meta name="description" content="([^"]*)">/)[1];
  const block = seoBlock({ title, desc, url: SITE + file, base: "" });
  if (html.includes("<!--SEO-->")) {
    html = html.replace(/<!--SEO-->[\s\S]*?<!--\/SEO-->/, block);
  } else {
    html = html.replace(/(<meta name="description" content="[^"]*">)/, `$1\n  ${block}`);
  }
  html = html.replace(/\?v=\d+/g, `?v=${V}`);
  fs.writeFileSync(full, html);
}

// ---------- sitemap + robots ----------
const urls = [
  [SITE, "1.0"],
  ...TOOLS.filter((f) => fs.existsSync(path.join(ROOT, f))).map((f) => [SITE + f, "0.8"]),
  ...DATA.map((c) => [`${SITE}k/${c.id}.html`, "0.7"])
];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, p]) => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod><priority>${p}</priority></url>`).join("\n")}
</urlset>
`);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

console.log(`built index + ${DATA.length} category pages, ${urls.length} sitemap URLs, ${ALL.length} kaomoji`);
