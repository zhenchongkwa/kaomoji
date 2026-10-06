/*
 * เอฟเฟกต์เสียงสไตล์ "ป๊อป / ฟองสบู่" สังเคราะห์ด้วย Web Audio API (ไม่ต้องใช้ไฟล์เสียง)
 * KaoSound.play("pop" | "copy" | "favOn" | "favOff" | "toggle" | "sparkle")
 */
(function () {
  "use strict";

  var ctx = null, master = null;
  var muted = false;
  try { muted = localStorage.getItem("kao.mute") === "1"; } catch (e) {}
  var last = {};

  // สร้าง AudioContext ตอนผู้ใช้กดครั้งแรก (เบราว์เซอร์ไม่ให้เล่นเสียงก่อนมีการกด)
  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.25;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // เสียงหนึ่งโน้ต: รูปคลื่น, ความถี่เริ่ม→จบ, เวลาเริ่ม (วินาทีจากตอนนี้), ความยาว, ความดัง
  function tone(type, f1, f2, at, dur, vol) {
    var t = ctx.currentTime + at;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t);
    if (f2 !== f1) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
    return o;
  }

  function jitter(f) { return f * (0.95 + Math.random() * 0.1); }

  var PENTA = [1047, 1175, 1319, 1568, 1760, 2093]; // C6 D6 E6 G6 A6 C7

  var SOUNDS = {
    // ป๊อปเบาๆ สำหรับปุ่ม / หมวด / แท็บ
    pop: function () { tone("sine", jitter(620), 240, 0, 0.07, 0.6); },
    // ฟองแตก + ประกายวิ้ง สองโน้ต
    copy: function () {
      tone("sine", jitter(520), 1100, 0, 0.06, 0.7);
      tone("triangle", 1047, 1047, 0.05, 0.14, 0.35);
      tone("triangle", 1319, 1319, 0.1, 0.2, 0.3);
    },
    favOn: function () {
      tone("triangle", 784, 784, 0, 0.12, 0.45);
      tone("triangle", 1047, 1047, 0.08, 0.22, 0.45);
    },
    favOff: function () { tone("triangle", 660, 440, 0, 0.16, 0.35); },
    // "ดึ๋ง" สำหรับสลับธีม / ภาษา / เสียง
    toggle: function () {
      var o = tone("sine", 300, 520, 0, 0.18, 0.55);
      var lfo = ctx.createOscillator(), depth = ctx.createGain();
      lfo.frequency.value = 28;
      depth.gain.value = 25;
      lfo.connect(depth);
      depth.connect(o.frequency);
      lfo.start();
      lfo.stop(ctx.currentTime + 0.2);
    },
    // "บุ๋ม" นุ่มๆ ตอนจิ้มโลโก้ / ตัวป๊อป (เสียงต่ำลงเร็วๆ + ป๊อปเบาๆ ซ้อน)
    boop: function () {
      var f = jitter(380);
      tone("sine", f, f * 0.45, 0, 0.09, 0.75);
      tone("triangle", f * 2.6, f * 1.8, 0, 0.035, 0.18);
    },
    // วิ้งเสียงสูงแบบสุ่มโน้ต (ปุ่มสัญลักษณ์วิบวับ)
    sparkle: function () {
      var f = PENTA[Math.floor(Math.random() * PENTA.length)];
      tone("triangle", f, f, 0, 0.12, 0.3);
      tone("sine", f * 2, f * 2, 0.03, 0.08, 0.12);
    }
  };

  function play(name) {
    if (muted || !SOUNDS[name]) return;
    var now = Date.now();
    if (last[name] && now - last[name] < 40) return; // กันเสียงซ้อนตอนกดรัว
    last[name] = now;
    try {
      if (!audio()) return;
      SOUNDS[name]();
    } catch (e) {}
  }

  window.KaoSound = {
    play: play,
    get muted() { return muted; },
    setMuted: function (m) {
      muted = !!m;
      try { localStorage.setItem("kao.mute", muted ? "1" : "0"); } catch (e) {}
    }
  };
})();
