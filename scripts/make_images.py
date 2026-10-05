"""
สร้างรูปสำหรับเว็บ: favicon (svg/png), apple-touch-icon และรูปพรีวิวตอนแชร์ลิงก์ (og.png 1200x630)
วิธีใช้:  python scripts/make_images.py   (ต้องมี Pillow และฟอนต์ Windows: Segoe UI, Leelawadee, Yu Gothic)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = Path("C:/Windows/Fonts")

INK = (59, 47, 53)
CREAM = (255, 248, 238)
PINK = (255, 208, 220)
TILES = [(255, 208, 220), (255, 232, 168), (196, 236, 217), (221, 210, 255), (203, 231, 255)]


def font(name, size, index=0):
    return ImageFont.truetype(str(FONTS / name), size, index=index)


# ---------- ไอคอน: หน้ายิ้ม ˘ᵕ˘ วาดเป็นเส้น บนสี่เหลี่ยมมุมมนสีชมพู ----------
FAVICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect x="3" y="3" width="58" height="58" rx="16" fill="#ffd0dc" stroke="#3b2f35" stroke-width="4"/>
  <path d="M15 27 q6 7 12 0 M37 27 q6 7 12 0" fill="none" stroke="#3b2f35" stroke-width="4" stroke-linecap="round"/>
  <path d="M27 40 q5 6 10 0" fill="none" stroke="#3b2f35" stroke-width="4" stroke-linecap="round"/>
</svg>
"""


def icon(size):
    s = 4  # วาดใหญ่แล้วย่อ ให้ขอบเนียน
    big = size * s
    k = big / 64
    im = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    w = round(4 * k)
    d.rounded_rectangle([3 * k, 3 * k, 61 * k, 61 * k], radius=16 * k, fill=PINK, outline=INK, width=w)
    # ตา: ส่วนโค้งคว่ำ (◡), ปาก: ส่วนโค้งเล็ก
    for x in (15, 37):
        d.arc([x * k, 20 * k, (x + 12) * k, 34 * k], 20, 160, fill=INK, width=w)
    d.arc([27 * k, 34 * k, 37 * k, 46 * k], 20, 160, fill=INK, width=w)
    return im.resize((size, size), Image.LANCZOS)


def og():
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(im)
    word = font("segoeuib.ttf", 170)
    # "kao ▢ moji" แบบหน้า intro
    kao, moji = "kao", "moji"
    kw = d.textlength(kao, font=word)
    mw = d.textlength(moji, font=word)
    gap = 300
    x0 = (W - (kw + gap + mw)) / 2
    y = 165
    d.text((x0, y), kao, font=word, fill="white")
    d.text((x0 + kw + gap, y), moji, font=word, fill="white")

    # การ์ดคาโอโมจิตรงกลาง (เอียงเล็กน้อย)
    tile = Image.new("RGBA", (250, 140), (0, 0, 0, 0))
    td = ImageDraw.Draw(tile)
    td.rounded_rectangle([0, 0, 249, 139], radius=26, fill=TILES[0])
    kf = font("YuGothB.ttc", 50)
    face = "(＾▽＾)"
    fw = td.textlength(face, font=kf)
    td.text(((250 - fw) / 2, 36), face, font=kf, fill=(17, 17, 17))
    tile = tile.rotate(8, resample=Image.BICUBIC, expand=True)
    tx = int(x0 + kw + (gap - tile.width) / 2)
    im.paste(tile, (tx, y + 40), tile)

    # คำบรรยายภาษาไทย + เครดิต
    th = font("leelawad.ttf", 40)
    sub = "รวมคาโอโมจิ 1,500+ แบบ · คลิกคัดลอกได้ทันที"
    d.text(((W - d.textlength(sub, font=th)) / 2, 420), sub, font=th, fill=(200, 200, 200))
    mono = font("consola.ttf", 26)
    by = "b y   z h e n c h o n g"
    d.text(((W - d.textlength(by, font=mono)) / 2, 500), by, font=mono, fill=(140, 140, 140))

    # แถบสีพาสเทลด้านล่าง
    bw = W / len(TILES)
    for i, c in enumerate(TILES):
        d.rectangle([i * bw, H - 14, (i + 1) * bw, H], fill=c)
    return im


(ROOT / "favicon.svg").write_text(FAVICON_SVG, encoding="utf-8")
icon(32).save(ROOT / "favicon-32.png")
icon(180).save(ROOT / "apple-touch-icon.png")
og().save(ROOT / "og.png", optimize=True)
print("wrote favicon.svg, favicon-32.png, apple-touch-icon.png, og.png")
