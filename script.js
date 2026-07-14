/* ============================================================
   Interactive Birthday Wish
   Personalize via URL:  ?name=Priya&msg=Have%20an%20amazing%20day
   ============================================================ */

// ---------- Personalization from URL ----------
// decoder kept so previously shared ?w= token links continue to work
function decodeWish(token) {
  try {
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

const params = new URLSearchParams(location.search);
const wish = params.has("w") ? decodeWish(params.get("w")) : null;
// primary format: ?HappyBirthdaySurprise=Advik&from=Sai
// (?w= tokens and plain ?name= links keep working as fallbacks)
const IS_HOME =
  !wish &&
  !params.has("HappyBirthdaySurprise") &&
  !params.has("name") && !params.has("from") && !params.has("msg");
const NAME =
  String(wish?.n ?? params.get("HappyBirthdaySurprise") ?? params.get("name") ?? "Friend")
    .trim().slice(0, 30) || "Friend";
const CUSTOM_MSG = String(wish?.m ?? params.get("msg") ?? "").slice(0, 200);
const FROM = String(wish?.f ?? params.get("from") ?? "").trim().slice(0, 30);

const DEFAULT_MSG =
  "Today the universe celebrates you. May this year bring you " +
  "wild adventures, warm hugs, and everything you've been wishing for.";

// ---------- Scene management ----------
const scenes = {
  home: document.getElementById("scene-home"),
  gift: document.getElementById("scene-gift"),
  greeting: document.getElementById("scene-greeting"),
  cake: document.getElementById("scene-cake"),
  party: document.getElementById("scene-party"),
};

function showScene(key) {
  Object.values(scenes).forEach((s) => s.classList.remove("active"));
  scenes[key].classList.add("active");
}

/* ============================================================
   Star background
   ============================================================ */
const starsCanvas = document.getElementById("stars-canvas");
const starsCtx = starsCanvas.getContext("2d");
let stars = [];

function initStars() {
  starsCanvas.width = innerWidth;
  starsCanvas.height = innerHeight;
  stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.6 + 0.3,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 1.5 + 0.5,
  }));
}

// an occasional shooting star crossing the upper sky
let shootingStar = null;
let nextShootAt = 4000;

function drawStars(t) {
  starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
  for (const s of stars) {
    const alpha = 0.35 + 0.65 * Math.abs(Math.sin(t / 1000 * s.speed + s.phase));
    starsCtx.beginPath();
    starsCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    starsCtx.fillStyle = `rgba(255, 240, 220, ${alpha})`;
    starsCtx.fill();
  }

  if (!shootingStar && t > nextShootAt) {
    shootingStar = {
      x: Math.random() * innerWidth * 0.7,
      y: Math.random() * innerHeight * 0.3,
      vx: 7 + Math.random() * 5,
      vy: 2.5 + Math.random() * 2,
      life: 1,
    };
  }
  if (shootingStar) {
    const ss = shootingStar;
    const grad = starsCtx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * 10, ss.y - ss.vy * 10);
    grad.addColorStop(0, `rgba(255, 244, 214, ${ss.life})`);
    grad.addColorStop(1, "rgba(255, 244, 214, 0)");
    starsCtx.strokeStyle = grad;
    starsCtx.lineWidth = 2;
    starsCtx.beginPath();
    starsCtx.moveTo(ss.x, ss.y);
    starsCtx.lineTo(ss.x - ss.vx * 10, ss.y - ss.vy * 10);
    starsCtx.stroke();
    ss.x += ss.vx;
    ss.y += ss.vy;
    ss.life -= 0.022;
    if (ss.life <= 0 || ss.x > innerWidth + 120) {
      shootingStar = null;
      nextShootAt = t + 5000 + Math.random() * 8000;
    }
  }
  requestAnimationFrame(drawStars);
}

/* ============================================================
   Confetti & fireworks (single fx canvas)
   ============================================================ */
const fxCanvas = document.getElementById("fx-canvas");
const fx = fxCanvas.getContext("2d");
let particles = [];

const COLORS = ["#e6c27a", "#f5dfae", "#fff2cf", "#d98ba0", "#b8924a", "#f7f3ea"];

function resizeFx() {
  fxCanvas.width = innerWidth;
  fxCanvas.height = innerHeight;
}

function burstConfetti(x, y, count = 80, spread = 9) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * spread + 2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: Math.random() * 7 + 3,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      life: 1,
      decay: Math.random() * 0.012 + 0.006,
      shape: Math.random() > 0.5 ? "rect" : "circle",
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
    });
  }
}

function confettiRain(count = 120) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * innerWidth,
      y: -20 - Math.random() * innerHeight * 0.5,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2.5 + 1.5,
      size: Math.random() * 8 + 4,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      life: 1,
      decay: 0.003,
      shape: "rect",
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.25,
      sway: Math.random() * 2,
    });
  }
}

// gold dust trailing the cursor / finger
const DUST_COLORS = ["#f5dfae", "#e6c27a", "#fff2cf"];
addEventListener("pointermove", (e) => {
  if (particles.length > 500) return;
  for (let i = 0; i < 2; i++) {
    particles.push({
      x: e.clientX + (Math.random() - 0.5) * 10,
      y: e.clientY + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 0.9,
      vy: -0.3 - Math.random() * 0.7,
      size: 1.2 + Math.random() * 2.4,
      color: DUST_COLORS[(Math.random() * DUST_COLORS.length) | 0],
      life: 0.9,
      decay: 0.025 + Math.random() * 0.02,
      shape: "circle",
      rot: 0,
      vr: 0,
      dust: true,
    });
  }
});

function firework() {
  const x = innerWidth * (0.15 + Math.random() * 0.7);
  const y = innerHeight * (0.12 + Math.random() * 0.35);
  burstConfetti(x, y, 60, 6);
}

function tickFx() {
  fx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  particles = particles.filter((p) => p.life > 0 && p.y < innerHeight + 40);
  for (const p of particles) {
    p.vy += p.dust ? -0.008 : 0.12;   // dust drifts up, confetti falls
    p.vx *= 0.99;
    p.x += p.vx + (p.sway ? Math.sin(p.y / 30) * p.sway : 0);
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= p.decay;

    fx.save();
    fx.globalAlpha = Math.max(p.life, 0);
    fx.translate(p.x, p.y);
    fx.rotate(p.rot);
    fx.fillStyle = p.color;
    if (p.shape === "rect") {
      fx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      fx.beginPath();
      fx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      fx.fill();
    }
    fx.restore();
  }
  requestAnimationFrame(tickFx);
}

/* ============================================================
   Web Audio: sparkle sfx + synthesized "Happy Birthday"
   ============================================================ */
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playPop() {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(600 + Math.random() * 300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

function playSlice() {
  // soft "shhk" of a knife through sponge: filtered noise burst
  const ctx = getAudio();
  const dur = 0.5;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(2400, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + dur);
  filter.Q.value = 0.9;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
}

function playPuff() {
  // a breathy little puff as a flame goes out
  const ctx = getAudio();
  const dur = 0.2;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.22, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
}

function playSparkle() {
  const ctx = getAudio();
  [880, 1174.7, 1568].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    const t = ctx.currentTime + i * 0.07;
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  });
}

// "Happy Birthday" melody: [semitones from C4, beats]
const MELODY = [
  [7, 0.75], [7, 0.25], [9, 1], [7, 1], [12, 1], [11, 2],
  [7, 0.75], [7, 0.25], [9, 1], [7, 1], [14, 1], [12, 2],
  [7, 0.75], [7, 0.25], [19, 1], [16, 1], [12, 1], [11, 1], [9, 2],
  [17, 0.75], [17, 0.25], [16, 1], [12, 1], [14, 1], [12, 2],
];

let songPlaying = false;
function playBirthdaySong() {
  if (songPlaying) return;
  songPlaying = true;
  const ctx = getAudio();
  const beat = 0.42;
  let t = ctx.currentTime + 0.1;
  const master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(ctx.destination);

  for (const [semi, beats] of MELODY) {
    const freq = 261.63 * Math.pow(2, semi / 12);
    const dur = beats * beat;
    // main voice + soft octave for warmth
    [[freq, "triangle", 1], [freq * 2, "sine", 0.25]].forEach(([f, type, vol]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.03);
      gain.gain.setValueAtTime(vol, t + dur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.95);
      osc.connect(gain).connect(master);
      osc.start(t);
      osc.stop(t + dur);
    });
    t += dur;
  }
  const total = (t - ctx.currentTime) * 1000;
  setTimeout(() => { songPlaying = false; }, total);
  return total;
}

/* ============================================================
   Balloons
   ============================================================ */
const balloonLayer = document.getElementById("balloons");
let balloonTimer = null;

function spawnBalloon() {
  const b = document.createElement("div");
  b.className = "balloon";
  b.style.left = Math.random() * 88 + 2 + "vw";
  b.style.background = COLORS[(Math.random() * COLORS.length) | 0];
  b.style.animationDuration = 7 + Math.random() * 6 + "s";
  b.addEventListener("pointerdown", () => {
    if (b.classList.contains("pop")) return;
    b.classList.add("pop");
    playPop();
    const rect = b.getBoundingClientRect();
    burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 24, 5);
    setTimeout(() => b.remove(), 200);
  });
  b.addEventListener("animationend", (e) => {
    if (e.animationName === "floatUp") b.remove();
  });
  balloonLayer.appendChild(b);
}

function startBalloons() {
  if (balloonTimer) return;
  spawnBalloon();
  balloonTimer = setInterval(spawnBalloon, 1600);
}

function stopBalloons() {
  clearInterval(balloonTimer);
  balloonTimer = null;
}

/* ============================================================
   Scene 1 → 2: gift open
   ============================================================ */
const giftBox = document.getElementById("gift-box");
giftBox.addEventListener("click", () => {
  if (giftBox.classList.contains("opening")) return;
  giftBox.classList.add("opening");
  playSparkle();
  const rect = giftBox.getBoundingClientRect();
  burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 3, 120, 10);
  // let the lid fly off and the confetti settle before moving on
  setTimeout(() => {
    showScene("greeting");
    startGreeting();
  }, 1700);
});

/* ============================================================
   Scene 2: greeting + typewriter
   ============================================================ */
const nameEl = document.getElementById("greeting-name");
const typeEl = document.getElementById("typewriter");
const toCakeBtn = document.getElementById("to-cake-btn");

function startGreeting() {
  nameEl.textContent = NAME + "!";
  const msg = CUSTOM_MSG || DEFAULT_MSG;
  let i = 0;
  // wait for the name and divider to cascade in before typing begins
  setTimeout(function type() {
    if (i <= msg.length) {
      typeEl.textContent = msg.slice(0, i++);
      setTimeout(type, 52);
    } else {
      setTimeout(() => toCakeBtn.classList.remove("hidden-soft"), 700);
    }
  }, 2100);
}

toCakeBtn.addEventListener("click", () => {
  showScene("cake");
  setupCake();
  // give the scene a moment to appear, then switch the lights off
  requestAnimationFrame(positionCandleGlow);
  setTimeout(() => document.body.classList.add("lights-off"), 800);
});

// center the candlelight pool on the cake's candles
function positionCandleGlow() {
  const cakeRect = document.getElementById("cake").getBoundingClientRect();
  const darkness = document.getElementById("darkness");
  darkness.style.setProperty("--glow-x", cakeRect.left + cakeRect.width / 2 + "px");
  darkness.style.setProperty("--glow-y", cakeRect.top + 70 + "px");
}

/* ============================================================
   Scene 3: cake, candles, mic blow detection
   ============================================================ */
const CANDLE_COUNT = 5;
const candlesEl = document.getElementById("candles");
const candlesLeftEl = document.getElementById("candles-left");
const blowHint = document.getElementById("blow-hint");
let candlesLit = 0;
let micStream = null;
let cakeDone = false;

function setupCake() {
  cakeDone = false;
  candlesEl.innerHTML = "";
  candlesLit = CANDLE_COUNT;

  // reset the cutting ceremony (matters on replay)
  document.getElementById("cake-heading").textContent = "Make a wish & blow out the candles";
  knife.classList.add("hidden");
  knife.classList.remove("cutting", "done");
  document.getElementById("cut-notch").classList.remove("visible");
  document.getElementById("slice").classList.remove("served");

  const candleColors = ["#e6c27a", "#d98ba0", "#b8924a", "#c9a3b5", "#e6c27a"];
  for (let i = 0; i < CANDLE_COUNT; i++) {
    const c = document.createElement("div");
    c.className = "candle";
    c.style.setProperty("--candle-color", candleColors[i % candleColors.length]);
    c.style.height = 40 + ((i * 7) % 14) + "px";
    const f = document.createElement("div");
    f.className = "flame";
    f.style.animationDelay = Math.random() * 0.2 + "s";
    c.appendChild(f);
    c.addEventListener("pointerdown", () => extinguish(c));
    candlesEl.appendChild(c);
  }
  updateCandleCounter();
  startMic();
}

function updateCandleCounter() {
  const cheer = {
    5: "5 candles glowing — take a deep breath…",
    4: "4 to go — keep blowing!",
    3: "3 left — you're doing great!",
    2: "just 2 more!",
    1: "one more — big breath! 🌬",
    0: "Your wish is on its way… 💫",
  };
  candlesLeftEl.textContent = cheer[candlesLit] ?? `${candlesLit} candles still burning`;
}

function extinguish(candle) {
  if (cakeDone || candle.classList.contains("out")) return;
  candle.classList.add("out");
  candlesLit--;

  // each candle rewards you: a puff sound and a tiny gold spark burst
  playPuff();
  const rect = candle.getBoundingClientRect();
  burstConfetti(rect.left + rect.width / 2, rect.top - 20, 12, 3);

  // smoke puffs rising from the wick
  const stage = document.querySelector(".cake-stage").getBoundingClientRect();
  for (let i = 0; i < 3; i++) {
    const s = document.createElement("div");
    s.className = "smoke";
    s.style.left = rect.left - stage.left + rect.width / 2 - 5 + "px";
    s.style.top = rect.top - stage.top - 20 + "px";
    s.style.animationDelay = i * 0.15 + "s";
    document.getElementById("smoke-container").appendChild(s);
    setTimeout(() => s.remove(), 1800 + i * 150);
  }

  updateCandleCounter();
  if (candlesLit === 0) {
    cakeDone = true;
    stopMic();
    // a quiet beat for the wish itself — still in candle-smoke darkness —
    // then the lights come back on and the ceremony continues
    candlesEl.classList.remove("wavering");
    blowHint.classList.remove("listening");
    blowHint.textContent = "Close your eyes… make your wish 🌠";
    setTimeout(() => document.body.classList.remove("lights-off"), 1400);
    setTimeout(startCutting, 3200);
  }
}

/* ---------- The cake-cutting ceremony ---------- */
const knife = document.getElementById("knife");
let cutting = false;

function startCutting() {
  blowHint.classList.remove("listening");
  document.getElementById("cake-heading").textContent = "Now, the cake-cutting ceremony";
  blowHint.textContent = "Tap the knife to cut the first slice 🔪";
  candlesLeftEl.textContent = "";
  knife.classList.remove("hidden", "cutting", "done");
  cutting = false;
}

function cutCake() {
  if (cutting || knife.classList.contains("hidden")) return;
  cutting = true;
  blowHint.textContent = "";
  knife.classList.add("cutting");

  // two soft cuts as the blade passes through the tiers
  setTimeout(playSlice, 500);
  setTimeout(playSlice, 1400);

  // knife reaches the bottom of the cake (~1.9s), reveal the cut
  setTimeout(() => {
    document.getElementById("cut-notch").classList.add("visible");
    const cakeRect = document.getElementById("cake").getBoundingClientRect();
    burstConfetti(cakeRect.left + cakeRect.width * 0.66, cakeRect.top + 60, 40, 5);
    playSparkle();
  }, 2000);

  // slice glides out onto its plate
  setTimeout(() => {
    knife.classList.add("done");
    document.getElementById("slice").classList.add("served");
    candlesLeftEl.textContent = "The first slice, served with love 🍰";
  }, 2800);

  // let the served slice sit for a moment before the party begins
  setTimeout(celebrate, 5300);
}

knife.addEventListener("click", cutCake);
knife.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") cutCake();
});

function extinguishRandomLit() {
  const lit = [...candlesEl.querySelectorAll(".candle:not(.out)")];
  if (lit.length) extinguish(lit[(Math.random() * lit.length) | 0]);
}

async function startMic() {
  if (!navigator.mediaDevices?.getUserMedia) {
    blowHint.textContent = "🖱 Tap the flames to blow them out!";
    return;
  }
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = getAudio();
    const source = ctx.createMediaStreamSource(micStream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    blowHint.classList.add("listening");
    blowHint.textContent = "🎤 I'm listening… blow now!";

    let loudFrames = 0;
    let lastBlowAt = 0;
    (function listen() {
      if (cakeDone || !micStream) {
        candlesEl.classList.remove("wavering");
        return;
      }
      analyser.getByteFrequencyData(data);
      // blowing = strong broadband energy in the lower bins
      const lowEnd = data.slice(2, 40);
      const avg = lowEnd.reduce((a, b) => a + b, 0) / lowEnd.length;

      // instant feedback: flames waver as soon as they "feel" your breath
      candlesEl.classList.toggle("wavering", avg > 60);

      if (avg > 110) {
        loudFrames++;
        // cooldown so one long blow doesn't wipe out all candles at once —
        // they go out one by one, like real candles
        if (loudFrames > 4 && performance.now() - lastBlowAt > 650) {
          extinguishRandomLit();
          lastBlowAt = performance.now();
          loudFrames = 0;
        }
      } else {
        loudFrames = Math.max(0, loudFrames - 1);
      }
      requestAnimationFrame(listen);
    })();
  } catch {
    blowHint.classList.remove("listening");
    blowHint.textContent = "🖱 Mic unavailable — tap the flames instead!";
  }
}

function stopMic() {
  if (micStream) {
    micStream.getTracks().forEach((t) => t.stop());
    micStream = null;
  }
}

/* ============================================================
   Scene 4: celebration
   ============================================================ */
let fireworkTimer = null;

function celebrate() {
  showScene("party");
  document.getElementById("party-message").textContent =
    `${NAME}, the candles are out, the first slice is cut, and your wish ` +
    `has been sent to the stars. Now let's celebrate! 🥳`;

  confettiRain(160);
  playBirthdaySong();
  startBalloons();
  fireworkTimer = setInterval(firework, 1400);
  setTimeout(() => clearInterval(fireworkTimer), 12000);
}

// wish cards flip to reveal a message
document.querySelectorAll(".wish-card").forEach((card) => {
  card.addEventListener("click", () => {
    if (card.classList.contains("flipped")) return;
    card.classList.add("flipped");
    card.textContent = card.dataset.wish;
    playSparkle();
    const r = card.getBoundingClientRect();
    burstConfetti(r.left + r.width / 2, r.top, 30, 5);
  });
});

document.getElementById("music-btn").addEventListener("click", playBirthdaySong);

document.getElementById("replay-btn").addEventListener("click", () => {
  stopBalloons();
  clearInterval(fireworkTimer);
  document.body.classList.remove("lights-off");
  particles = [];
  giftBox.classList.remove("opening");
  typeEl.textContent = "";
  toCakeBtn.classList.add("hidden-soft");
  document.querySelectorAll(".wish-card").forEach((c) => {
    c.classList.remove("flipped");
    c.innerHTML = c.dataset.emoji + "<span>Tap me</span>";
  });
  showScene("gift");
});

// store original emoji so replay can restore cards
document.querySelectorAll(".wish-card").forEach((c) => {
  c.dataset.emoji = c.childNodes[0].textContent;
});

/* ============================================================
   Home page: build the personalized link
   ============================================================ */
const homeName = document.getElementById("home-name");
const homeFrom = document.getElementById("home-from");
const homeMsg = document.getElementById("home-msg");
const homeCopyStatus = document.getElementById("home-copy-status");

function buildLink() {
  const url = new URL(location.origin + location.pathname);
  url.searchParams.set("HappyBirthdaySurprise", homeName.value.trim() || "Friend");
  if (homeFrom.value.trim()) url.searchParams.set("from", homeFrom.value.trim());
  if (homeMsg.value.trim()) url.searchParams.set("msg", homeMsg.value.trim());
  return url.toString();
}

document.getElementById("home-create").addEventListener("click", () => {
  location.href = buildLink();
});

document.getElementById("home-copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(buildLink());
    homeCopyStatus.textContent = "Copied! Send it to someone special 💌";
  } catch {
    homeCopyStatus.textContent = buildLink();
  }
});

// Discord has no public profile URLs — copy the username instead
document.getElementById("discord-link").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await navigator.clipboard.writeText("advik4u");
    homeCopyStatus.textContent = "Discord username copied: advik4u 📋";
  } catch {
    homeCopyStatus.textContent = "Discord: advik4u";
  }
});

// the guiding light on the celebration scene leads back home
document.getElementById("guide-light").addEventListener("click", () => {
  location.href = location.pathname;
});

/* ============================================================
   Boot
   ============================================================ */
function onResize() {
  initStars();
  resizeFx();
  if (scenes.cake.classList.contains("active")) positionCandleGlow();
}
addEventListener("resize", onResize);
onResize();
requestAnimationFrame(drawStars);
requestAnimationFrame(tickFx);
// visiting with no parameters = the creator's home page;
// a personalized link goes straight into the surprise
showScene(IS_HOME ? "home" : "gift");
document.title = IS_HOME ? "Create a Birthday Wish ✨" : `Happy Birthday, ${NAME}! 🎂`;

// sender line: the name gets the golden spotlight (built with DOM APIs, not
// innerHTML, since the value comes from the URL)
{
  const hint = document.querySelector(".gift-hint");
  hint.textContent = "";
  const sender = document.createElement("span");
  sender.className = "sender";
  sender.textContent = FROM || "Someone";
  hint.append(sender, " sent you a surprise");
}
