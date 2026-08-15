/* ===== 低频音效：Web Audio 生成嗡鸣与玻璃碎裂，音量随章节渐增 ===== */
const Drone = (function () {
  let ctx, gain, osc, started = false;

  function ensureCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  function start(opts) {
    if (started) return;
    started = true;
    ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    osc = ctx.createOscillator();
    gain = ctx.createGain();
    osc.type = (opts && opts.type) || 'sine';
    osc.frequency.value = (opts && opts.freq) || 55;
    gain.gain.value = 0;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    const lvl = (opts && opts.level) || 0.05;
    gain.gain.linearRampToValueAtTime(lvl, ctx.currentTime + 4);
  }
  function setLevel(l) {
    if (gain && ctx) gain.gain.linearRampToValueAtTime(l, ctx.currentTime + 2);
  }
  function shatter() {
    ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const dur = 0.7, sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, Math.floor(sr * dur), sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.2);
    }
    const src = ctx.createBufferSource(); src.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2200;
    const g = ctx.createGain(); g.gain.value = 0.45;
    src.connect(hp); hp.connect(g); g.connect(ctx.destination);
    src.start();
  }
  return { start: start, setLevel: setLevel, shatter: shatter, crack: shatter };
})();
