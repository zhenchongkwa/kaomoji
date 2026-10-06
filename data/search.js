/*
 * คำค้นเพิ่มเติมของแต่ละหมวด (คำพ้อง คำสแลง อีโมจิ) ใช้กับระบบค้นหาใน js/app.js
 * ใส่คำคั่นด้วยช่องว่าง คำเดียวกันอยู่หลายหมวดได้
 * คำหลายพยางค์ภาษาไทยไม่ต้องเว้นวรรค (ระบบตัดคำของคนค้นหาให้เอง)
 */
window.KAO_SEARCH = {
  // คำที่ตัดทิ้งจากคำค้น (ไม่ได้บอกอะไรเกี่ยวกับหน้า)
  stop: "ที่ และ ก็ แบบ หน่อย ค่ะ คับ ครับ คะ นะ น้า นะคะ จ้า จ้ะ อะ อ่ะ เลย มาก มากๆ สุด สุดๆ ๆ ด้วย กับ ของ ให้ ได้ ไหม มั้ย หน้า หน้าตา " +
    "จัง จังเลย จริง จริงๆ หนัก หนักมาก อยาก อยากได้ ขอ เอา ไป มา แล้ว เป็น คือ ว่า อยู่ ตอนนี้ วันนี้ ทุกคน ฉัน เรา เธอ แก " +
    "very so really soo sooo much lots i me you we u im am is are it some " +
    "คาโอโมจิ อีโมจิ อีโมติคอน ตัว อัน the a an of and or to for with my your face faces kaomoji emoji emoticon emoticons text",

  words: {
    "sns-simple": "minimal soft simple clean aesthetic cute basic small tiny mini korean ig instagram twitter tiktok uwu owo " +
      "เรียบๆ เรียบง่าย มินิ มินิมอล เล็กๆ น่ารักๆ คิ้วท์ คิ้วๆ ซอฟต์ ละมุน ละมุนละไม ดูดี เกาหลี ไอจี ทวิต แคปชั่น 🥹 ☺️ 😊 🙂",
    "sns-cry": "cry crying tear tears teary sob sobbing sad upset hurt touched moved emotional t_t tt qq ;-; " +
      "ร้องไห้ ร้อง น้ำตา น้ำตาคลอ น้ำตาไหล งือ งืออ ฮือ ฮืออ แง แงๆ งอแง ซึ้ง ซึ้งใจ ตื้นตัน เสียใจ เศร้า ฮึก บ่อน้ำตาแตก 😭 😢 🥺 🥹 😿 💧",
    "sns-love": "love inlove crush smitten heart hearts adore melt melting simp fan fangirl fanboy oshi bias ship " +
      "รัก หลงรัก ใจละลาย ละลาย ปลื้ม กรี๊ด ฟิน ฟินๆ เขิน ชอบ คลั่ง คลั่งรัก ติ่ง ด้อม เมน โอชิ จีบ คิดถึง 😍 🥰 😻 💕 💗 💖 ❤️ 🩷 💘 ♡",
    "sns-hands": "hand hands peace sign thumbs ok okay point pointing wave clap fingerheart please yay " +
      "ชู ชูนิ้ว สองนิ้ว ยกนิ้ว นิ้ว มือ ทำมือ โบกมือ ชี้ ปรบมือ มินิฮาร์ท ฮาร์ท คิดถึง 🫶 ✌️ 👍 👋 👉 🙏 👏 🤞 🫰",
    "sns-sparkle": "sparkle sparkly shine shiny glitter star stars excited wow amazing pretty kira kirakira bling twinkle magic " +
      "ประกาย วิบวับ วิ้ง วิ้งๆ ปิ๊ง ปิ๊งๆ ดาว ตาเป็นประกาย ตื่นเต้น ว้าว สวย ปัง ปังมาก ✨ 🌟 ⭐ 💫 🤩",
    "sns-sleepy": "sleepy sleep tired chill relax rest nap lazy zzz bed night gn goodnight yawn calm cozy " +
      "ง่วง ง่วงนอน นอน หลับ เหนื่อย ชิล ชิลๆ พัก พักผ่อน ขี้เกียจ อู้ หาว ฝันดี ราตรีสวัสดิ์ 😴 💤 🥱 😪 🛌 🌙",
    "sns-pout": "pout pouty sulk sulky grumpy annoyed mad hmph huff jealous upset angry " +
      "งอน งอนแล้ว ง้อ ง้อด้วย ปั้นปึ่ง หงุดหงิด โกรธ ฮึ่ม ฮึ หึ หึง อิจฉา ไม่พอใจ เคือง ชิ 😤 😠 😾 🙄 😒",
    "sns-animal": "animal animals pet pets critter cat dog bear bunny rabbit hamster chick tiny small " +
      "สัตว์ สัตว์เลี้ยง น้อง แมว หมา หมี กระต่าย แฮมสเตอร์ ลูกเจี๊ยบ ตัวเล็ก น่ารัก 🐱 🐶 🐻 🐰 🐹 🐥 🐾",

    happy: "happy smile smiling glad joy joyful cheerful good nice positive pleased content laugh laughing haha hehe lol lmao 555 grin " +
      "ยิ้ม ยิ้มแป้น ยิ้มหวาน ดีใจ สุข มีความสุข แฮปปี้ ร่าเริง สดใส ขำ ฮา หัวเราะ ฮ่าๆ อิอิ คิคิ 5555 😊 😄 😀 😁 🙂 ☺️ 😆",
    joy: "excited yay yey hooray woohoo celebrate celebration party cheer cheering win winner yes finally omg letsgo hype " +
      "ดีใจ ดีใจมาก เย้ เย่ ไชโย เฮ เฮ้ ฉลอง ตื่นเต้น สุดยอด ปัง กรี๊ด ได้แล้ว ชนะ ยินดี ยินดีด้วย 🥳 🎉 🙌 😆 🤩 🎊",
    love: "love heart hearts adore crush kiss romantic darling dear babe bae valentine like ily iloveyou " +
      "รัก หัวใจ ชอบ ที่รัก แฟน หวาน หวานๆ บอกรัก คิดถึง วาเลนไทน์ จีบ รักนะ ❤️ 💕 💗 😘 😍 🥰 ♡ ♥",
    shy: "shy blush blushing embarrassed flustered awkward nervous bashful hide " +
      "เขิน เขินอาย อาย หน้าแดง แก้มแดง ม้วน ม้วนต้วน เขินจัง ปิดหน้า 😳 ☺️ 🙈 😊 🫣",
    sad: "sad crying cry tear tears upset depressed down sorrow unhappy lonely heartbroken broken hurt pain miss t_t qq " +
      "เศร้า ร้องไห้ เสียใจ น้ำตา เหงา อกหัก เจ็บ ผิดหวัง หดหู่ แย่ ท้อ งือ แง ฮือ เฟล 😢 😭 😞 😔 💔 🥺",
    angry: "angry mad rage furious annoyed irritated hate grr grrr pissed fuming triggered " +
      "โกรธ โมโห หงุดหงิด เดือด ฉุน ปรี๊ด ของขึ้น ไม่พอใจ เกลียด รำคาญ หัวร้อน วีน เหวี่ยง 😡 😠 🤬 💢 👿",
    tableflip: "table flip flipping rage done fedup whatever quit unflip putback " +
      "คว่ำโต๊ะ โต๊ะ พังโต๊ะ พอแล้ว ไม่ไหว เซ็ง โมโห หัวร้อน ┻━┻ ┬─┬ ╯",
    surprised: "surprised surprise shocked shock wow omg whoa what gasp amazed scared startled stunned " +
      "ตกใจ อึ้ง ช็อก ช็อค ห๊ะ หะ ว้าย อุ๊ย เฮ้ย ตาโต อ้าปาก โอ้โห ไม่จริง 😲 😮 😱 😯 😳 ‼️",
    confused: "confused confusion hmm huh what why question puzzled lost unsure dunno idk thinking think wondering " +
      "งง งงงวย สับสน อะไร อะไรนะ ไม่เข้าใจ สงสัย หืม เอ๊ะ คิด คิดไม่ออก มึน มึนงง 🤔 😕 ❓ 😵‍💫",
    worried: "worried worry nervous anxious anxiety stress stressed panic sweat sweating scared fear afraid uhoh oops " +
      "กังวล เครียด กลัว ประหม่า เหงื่อตก เหงื่อแตก ลน ลนลาน แย่แล้ว ซวย ตื่นเต้น 😰 😥 😓 😬 😨 💦",
    bored: "bored boring meh whatever dull indifferent blank unimpressed bruh deadpan neutral " +
      "เบื่อ เซ็ง เฉย เฉยๆ ไม่สนใจ ช่างมัน เบื่อหน่าย หน้านิ่ง ไม่อิน ขี้เกียจ 😑 😐 🙄 😒 😶",
    smug: "smug cool confident proud sassy smirk boss swag sunglasses flex savage " +
      "เท่ หยิ่ง มั่นใจ ภูมิใจ เจ๋ง เก๋ เริ่ด คูล ชิค หล่อ ยิ้มเยาะ ยิ้มมุมปาก 😎 😏 🕶️ 💅",
    sorry: "sorry apology apologize apologise bow please forgive mybad oops excuse pardon plead begging " +
      "ขอโทษ โทษที ไหว้ ขอร้อง ยกโทษ ผิดไปแล้ว ก้มหัว ง้อ 🙇 🙏 🥺 😣",
    greet: "hello hi hey yo hiya wave waving greet greeting bye goodbye seeyou cya welcome morning goodmorning gm goodnight gn " +
      "สวัสดี หวัดดี ดีจ้า ทัก ทักทาย บ๊ายบาย บาย ไปก่อน ลาก่อน แล้วเจอกัน อรุณสวัสดิ์ ฝันดี โบกมือ 👋 🙋 🤗",
    hug: "hug hugs hugging cuddle cuddles embrace comfort warm squeeze " +
      "กอด กอดๆ ขอกอด อ้อมกอด ปลอบ ปลอบใจ อบอุ่น โอ๋ โอ๋ๆ ซบ 🤗 🫂",
    kiss: "kiss kisses kissing smooch mwah muah chu chuu peck blowkiss " +
      "จุ๊บ จุ๊บๆ จูบ หอม หอมแก้ม ส่งจูบ มัวะ ม๊วฟ 😘 😚 💋 😗",
    dance: "dance dancing party groove fun celebrate move boogie vibe vibing jam " +
      "เต้น เต้นๆ ปาร์ตี้ สนุก แดนซ์ ส่าย โยก มันส์ ฉลอง 💃 🕺 🎶 🎉",
    fight: "fight fighting punch punching hit attack battle beat boxing kick war fightme " +
      "ต่อย ต่อยกัน สู้ ชก ตบ ตี เตะ ทะเลาะ มวย ซัด เอาเลย 👊 🥊 💥 ⚔️",
    run: "run running escape flee hurry rush fast speed late chase goaway dash " +
      "วิ่ง หนี วิ่งหนี รีบ เร่ง ด่วน สาย ไปละ ชิ่ง เผ่น 🏃 💨",
    peek: "peek peeking hide hiding spy watching stalker sneak sneaky look stare " +
      "แอบ แอบมอง แอบดู ส่อง ซ่อน หลบ จ้อง ตามส่อง 👀 🫣 🙈",
    shrug: "shrug idk dunno whatever whoknows noidea meh ohwell eh unsure " +
      "ยักไหล่ ไม่รู้ ไม่รู้สิ ช่างมัน ช่างเถอะ แล้วแต่ ไม่แน่ใจ 🤷",
    sleep: "sleep sleeping sleepy tired nap bed bedtime night goodnight gn zzz dream dreaming rest exhausted " +
      "นอน หลับ ง่วง ง่วงนอน เหนื่อย ฝันดี ราตรีสวัสดิ์ เข้านอน งีบ หมดแรง 😴 💤 🛌 🌙",
    sick: "sick ill cold flu fever hurt pain dead dying dizzy exhausted ko rip deadinside " +
      "ป่วย ไม่สบาย เป็นไข้ หวัด เจ็บ ปวด ตาย ตายแล้ว เวียนหัว มึน หมดแรง ไม่ไหว แย่ 🤒 🤢 😵 💀 🤕 🥴",
    magic: "magic magical spell wizard witch sparkle sparkles star wand fairy power transform cast " +
      "เวทมนตร์ เวท มายากล แม่มด พ่อมด ไม้กายสิทธิ์ ประกาย วิ้ง ร่ายมนตร์ นางฟ้า ✨ 🪄 🔮 🧙 ⭐",

    cat: "cat cats kitty kitten neko meow nyan nya paw paws feline " +
      "แมว เหมียว น้องแมว เมี้ยว แมวน้อย ลูกแมว ทาสแมว อุ้งเท้า 🐱 😺 🐈 😸 🐾",
    dog: "dog dogs puppy pup doggo doge woof bark inu " +
      "หมา สุนัข น้องหมา หมาน้อย ลูกหมา โฮ่ง บ๊อก ทาสหมา 🐶 🐕 🐩 🐾",
    bear: "bear bears teddy kuma panda polarbear honey " +
      "หมี หมีน้อย หมีพูห์ ตุ๊กตาหมี แพนด้า คุมะ 🐻 🧸 🐼",
    rabbit: "rabbit rabbits bunny bunnies usagi hare carrot " +
      "กระต่าย บันนี่ กระต่ายน้อย แครอท อุซางิ 🐰 🐇 🥕",
    animals: "animal animals pig bird fish octopus spider elephant chick duck penguin frog mouse hamster sheep cow horse snake owl whale " +
      "สัตว์ หมู นก ปลา หมึก แมงมุม ช้าง ลูกเจี๊ยบ เป็ด เพนกวิน กบ หนู แฮมสเตอร์ แกะ วัว ม้า งู นกฮูก 🐷 🐦 🐟 🐙 🐘 🐧 🐸 🐭 🐹",

    food: "food eat eating hungry yummy delicious snack meal lunch dinner breakfast coffee tea drink cake dessert sweet ramen noodle cookie boba milktea " +
      "อาหาร กิน หิว อร่อย ขนม ข้าว ชา กาแฟ เค้ก ของหวาน ชานม บะหมี่ มาม่า หมูกระทะ ชาบู 🍰 ☕ 🍜 🍙 🍩 🧋 🍕 🍔",
    music: "music song sing singing singer karaoke guitar piano melody listen headphones concert idol " +
      "เพลง ร้องเพลง ดนตรี กีตาร์ เปียโน ฟังเพลง หูฟัง คาราโอเกะ คอนเสิร์ต คอน 🎵 🎶 🎤 🎸 🎧",
    writing: "write writing work working study studying homework read reading computer laptop busy office exam school notes typing " +
      "เขียน ทำงาน งาน เรียน อ่าน อ่านหนังสือ การบ้าน สอบ คอม ยุ่ง ปั่นงาน ปั่น ✍️ 📝 💻 📚",
    pointing: "point pointing look here this that there check attention " +
      "ชี้ นี่ไง ตรงนี้ ดูนี่ ดูตรงนี้ อันนี้ นั่นไง แนะนำ 👉 👈 👆 ☝️ 👇",
    thumbs: "thumbs thumbsup good great nice ok okay cool approve yes yep awesome welldone like pass " +
      "เยี่ยม โอเค ได้ ดี ดีมาก เจ๋ง ผ่าน ยกนิ้ว ไลก์ ถูกใจ 👍 👌 ✅ 💯",
    wink: "wink winking tease teasing flirt playful cheeky joke kidding " +
      "ขยิบตา ขยิบ ทะเล้น แซว หยอก ล้อเล่น อ่อย 😉 😜",
    faces: "funny silly derp goofy lol lmao haha joke tongue troll weird crazy meme 555 " +
      "ตลก ฮา ขำ ทะเล้น แลบลิ้น บ้าบอ กวน มีม เพี้ยน 5555 🤪 😜 😝 🤡 😂 🤣",
    evil: "evil sly scheme scheming devil villain sinister plan plotting mischief wicked muahaha dark " +
      "ร้าย ร้ายๆ เจ้าเล่ห์ วางแผน ปีศาจ ซาตาน ตัวร้าย คิดแผน ยิ้มร้าย 😈 👿 🦹",
    pray: "pray praying thanks thankyou ty thx grateful please wish hope bless bow namaste " +
      "ขอบคุณ ขอบใจ แต๊งกิ้ว อธิษฐาน ขอพร ภาวนา ไหว้ สาธุ ขอให้ 🙏 🥹",
    friends: "friend friends bestie besties bff buddy couple pair together duo partner squad gang " +
      "เพื่อน เพื่อนซี้ ซี้ แก๊ง คู่ แฟน คู่รัก ด้วยกัน กลุ่ม บัดดี้ 👭 👬 👫 🤝 💞",
    misc: "misc other objects symbol symbols flower flowers thing items random " +
      "อื่นๆ สัญลักษณ์ ของ ดอกไม้ สิ่งของ เบ็ดเตล็ด 🌸 🎀",

    // ---------- หมวดเทรนด์ไทย ----------
    oshi: "fan fandom idol kpop jpop oshi bias stan concert live lightstick fancam merch album photocard pc fansign ticket " +
      "ติ่ง ติ่งเกาหลี โอตะ ไอดอล เมน ด้อม แท่งไฟ คอน คอนเสิร์ต บัตรคอน กดบัตร โฟโต้การ์ด การ์ด อัลบั้ม แฟนมีต แฟนไซน์ ไลฟ์ กรี๊ด 💡 🎤 🎫 📸 💿",
    study: "study school class exam exams test quiz homework hw assignment university uni college student teacher read book grades graduate " +
      "เรียน นักเรียน นักศึกษา สอบ สอบกลางภาค สอบปลายภาค การบ้าน งานกลุ่ม รายงาน ติว อ่านหนังสือ ครู อาจารย์ มหาลัย มหาวิทยาลัย โรงเรียน เกรด รับปริญญา 📚 ✏️ 📝 🎓 🏫",
    work: "work working job office meeting boss deadline overtime ot salary payday monday friday tired busy wfh email laptop commute " +
      "ทำงาน งาน ออฟฟิศ ประชุม หัวหน้า เดดไลน์ โอที เงินเดือน เงินเดือนออก วันจันทร์ วันศุกร์ เหนื่อย ยุ่ง เบื่องาน ทำงานที่บ้าน รถติด 💼 💻 ☕ 📊 🥱",
    thaifood: "food eat eating hungry yummy delicious drink drinks bubbletea boba milktea tea coffee latte shabu bbq mookata somtam spicy dessert snack dinner lunch " +
      "ของกิน กิน หิว อร่อย ชานม ไข่มุก ชาไทย ชาเขียว กาแฟ ลาเต้ ชาบู หมูกระทะ ปิ้งย่าง ส้มตำ ข้าวเหนียวมะม่วง ขนม ของหวาน เผ็ด ไดเอท สั่งอาหาร เดลิเวอรี่ 🧋 🍜 🍲 🌶️ 🍰 ☕",
    songkran: "songkran water festival water gun splash thai new year april summer hot wet " +
      "สงกรานต์ สาดน้ำ เล่นน้ำ ปืนฉีดน้ำ ปืนน้ำ ปีใหม่ไทย เมษา เมษายน รดน้ำดำหัว ดินสอพอง เสื้อลายดอก หน้าร้อน เปียก 💦 🔫 🌺 ☀️",
    loykrathong: "loy krathong loykrathong yi peng yeepeng lantern lanterns full moon river lotus candle wish november " +
      "ลอยกระทง กระทง ลอย ยี่เป็ง โคมลอย โคม พระจันทร์เต็มดวง วันเพ็ญ อธิษฐาน เทียน ธูป ริมน้ำ พฤศจิกา 🏮 🪷 🌕 🕯️",
    celebrate: "birthday hbd bday party festival festivals holiday holidays celebrate celebration gift present cake new year newyear christmas xmas valentine chinese new year cny graduation anniversary " +
      "วันเกิด สุขสันต์วันเกิด เทศกาล วันหยุด วันสำคัญ เฮบี้ ปาร์ตี้ ฉลอง ของขวัญ เค้ก ปีใหม่ สวัสดีปีใหม่ คริสต์มาส วาเลนไทน์ ตรุษจีน อั่งเปา รับปริญญา ครบรอบ อวยพร 🎂 🎉 🎁 🎈 🥳 🧧",
    weather: "weather hot heat sunny sun rain rainy storm thunder cold winter cloudy wind pm25 dust smog umbrella " +
      "อากาศ ร้อน ร้อนมาก ร้อนตับแตก แดด แดดแรง ฝน ฝนตก พายุ ฟ้าร้อง ฟ้าผ่า หนาว ลมหนาว ฝุ่น ฝุ่นPM2.5 หมอก ร่ม เมฆ ☀️ 🌧️ ☔ ⛈️ ❄️ 🥵",
    money: "money cash rich broke poor salary shopping shop buy sale discount parcel delivery bill pay credit card lottery saving " +
      "เงิน ตังค์ รวย จน หมดตัว ถังแตก เงินเดือน ช้อปปิ้ง ช้อป ซื้อของ ลดราคา เซล โปร พัสดุ ของมาส่ง บิล จ่าย บัตรเครดิต หวย ถูกหวย เก็บเงิน ออมเงิน 💰 💸 🛍️ 🛒 📦",
    gaming: "game games gaming gamer play playing win lose gg mvp rank ranked gacha pull lag noob pro boss level up controller console " +
      "เกม เล่นเกม เกมเมอร์ ชนะ แพ้ จีจี แรงค์ กาชา สุ่มกาชา เกลือ เกลือๆ แลค เน็ตหลุด บอส เลเวล อัปเลเวล ตี้ ปาร์ตี้ 🎮 🕹️ 👾 🏆",

    // ---------- หมวดสนุกๆ ----------
    spooky: "spooky ghost ghosts halloween scary horror creepy haunted pumpkin bat vampire zombie skull witch boo " +
      "ผี ผีหลอก น่ากลัว สยอง ฮาโลวีน ฟักทอง ค้างคาว แวมไพร์ ซอมบี้ หัวกะโหลก แม่มด หลอน 👻 🎃 🦇 💀",
    sports: "sport sports workout exercise gym fitness run running football soccer basketball badminton swim yoga muscle strong cheer win medal " +
      "กีฬา ออกกำลังกาย ฟิตเนส ยิม วิ่ง ฟุตบอล บอล บาส แบด แบดมินตัน ว่ายน้ำ โยคะ กล้าม เชียร์ เหรียญ แชมป์ ⚽ 🏀 🏸 💪 🏆",
    travel: "travel trip vacation holiday journey flight plane airport beach sea island mountain camping road trip japan korea passport luggage " +
      "เที่ยว ไปเที่ยว ทริป พักร้อน วันหยุด เดินทาง เครื่องบิน สนามบิน ทะเล เกาะ ภูเขา ดอย แคมป์ปิ้ง ญี่ปุ่น เกาหลี พาสปอร์ต กระเป๋าเดินทาง ✈️ 🏝️ 🧳 🗺️",
    birds: "bird birds chick chicken duck duckling frog penguin owl swan parrot tweet " +
      "นก ลูกนก ลูกเจี๊ยบ เจี๊ยบ ไก่ เป็ด ลูกเป็ด กบ อึ่ง เพนกวิน นกฮูก หงส์ นกแก้ว 🐥 🐣 🦆 🐸 🐧 🦉"
  }
};
