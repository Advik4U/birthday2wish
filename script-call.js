/* Incoming Birthday Call → Cake → After-party table finale */

const params = new URLSearchParams(location.search);
const NAME =
  (params.get("HappyBirthdaySurprise") || params.get("name") || "Friend").trim().slice(0, 30) ||
  "Friend";
const FROM = (params.get("from") || "").trim().slice(0, 30);
const MSG = (params.get("msg") || "").trim().slice(0, 200);
const VIDEO_RAW = (params.get("v") || params.get("video") || "").trim();
const CALLER = FROM || "Someone";
const DEFAULT_MSG =
  "May this year find you laughing harder, dreaming bigger, and feeling deeply loved.";

const scenes = {
  ring: document.getElementById("scene-ring"),
  declined: document.getElementById("scene-declined"),
  active: document.getElementById("scene-active"),
  bridge: document.getElementById("scene-bridge"),
  cake: document.getElementById("scene-cake"),
  finale: document.getElementById("scene-finale"),
};

function showScene(key) {
  Object.values(scenes).forEach((s) => s?.classList.remove("active"));
  scenes[key].classList.add("active");
}

/* ---------- Stars + confetti ---------- */
const starsCanvas = document.getElementById("stars-canvas");
const starsCtx = starsCanvas.getContext("2d");
let stars = [];
function initStars() {
  starsCanvas.width = innerWidth;
  starsCanvas.height = innerHeight;
  stars = Array.from({ length: 100 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.5 + 0.3,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 1.4 + 0.5,
  }));
}
function drawStars(t) {
  starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
  for (const s of stars) {
    const a = 0.35 + 0.65 * Math.abs(Math.sin((t / 1000) * s.speed + s.phase));
    starsCtx.beginPath();
    starsCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    starsCtx.fillStyle = `rgba(255, 240, 220, ${a})`;
    starsCtx.fill();
  }
  requestAnimationFrame(drawStars);
}

const fxCanvas = document.getElementById("fx-canvas");
const fx = fxCanvas.getContext("2d");
let particles = [];
const COLORS = ["#e6c27a", "#f5dfae", "#fff2cf", "#d98ba0", "#b8924a", "#f7f3ea"];

function resizeFx() {
  fxCanvas.width = innerWidth;
  fxCanvas.height = innerHeight;
}
function burstConfetti(x, y, count = 90, spread = 9) {
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
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
    });
  }
}
function confettiRain(count = 140) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * innerWidth,
      y: -20 - Math.random() * innerHeight * 0.4,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2.5 + 1.5,
      size: Math.random() * 8 + 4,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      life: 1,
      decay: 0.003,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.25,
      sway: Math.random() * 2,
    });
  }
}
function firework() {
  burstConfetti(
    innerWidth * (0.15 + Math.random() * 0.7),
    innerHeight * (0.12 + Math.random() * 0.35),
    55,
    6
  );
}
function tickFx() {
  fx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  particles = particles.filter((p) => p.life > 0 && p.y < innerHeight + 40);
  for (const p of particles) {
    p.vy += 0.12;
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
    fx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    fx.restore();
  }
  requestAnimationFrame(tickFx);
}

/* ---------- Audio ---------- */
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

let ringTimer = null;
function playRingTone() {
  const ctx = getAudio();
  const now = ctx.currentTime;
  [[880, 0], [1046.5, 0.18]].forEach(([freq, delay]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + delay;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  });
}
function startRinging() {
  stopRinging();
  playRingTone();
  ringTimer = setInterval(playRingTone, 2200);
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}
function stopRinging() {
  clearInterval(ringTimer);
  ringTimer = null;
  if (navigator.vibrate) navigator.vibrate(0);
}
function playAnswerClick() {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(520, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}
function playSparkle() {
  const ctx = getAudio();
  [880, 1174.7, 1568].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    const t = ctx.currentTime + i * 0.07;
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  });
}
function playPop() {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(600 + Math.random() * 300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.22, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}
function playPuff() {
  const ctx = getAudio();
  const dur = 0.2;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
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
function playSlice() {
  const ctx = getAudio();
  const dur = 0.5;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
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
  setTimeout(() => { songPlaying = false; }, (t - ctx.currentTime) * 1000);
}

/* ---------- Balloons ---------- */
const balloonLayer = document.getElementById("balloons");
let balloonTimer = null;
let fireworkTimer = null;
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
    burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 20, 5);
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
  balloonTimer = setInterval(spawnBalloon, 1700);
}
function stopBalloons() {
  clearInterval(balloonTimer);
  balloonTimer = null;
  balloonLayer.innerHTML = "";
}

/* ---------- Video ---------- */
function parseVideoEmbed(raw) {
  if (!raw) return { kind: "none" };
  let url;
  try { url = new URL(raw); } catch { return { kind: "external", href: raw }; }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1` };
  }
  if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
    let id = url.searchParams.get("v");
    if (!id && url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2];
    if (!id && url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2];
    if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1` };
  }
  if (host.includes("drive.google.com")) {
    const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
    const id = fileMatch?.[1] || url.searchParams.get("id");
    if (id) return { kind: "iframe", src: `https://drive.google.com/file/d/${id}/preview` };
  }
  if (host.includes("dropbox.com")) {
    url.searchParams.set("raw", "1");
    return { kind: "external", href: url.toString() };
  }
  return { kind: "external", href: raw };
}

function loadVideo() {
  const parsed = parseVideoEmbed(VIDEO_RAW);
  const iframe = document.getElementById("wish-video");
  const fallback = document.getElementById("video-fallback");
  const openBtn = document.getElementById("open-video-btn");
  if (parsed.kind === "iframe") {
    iframe.src = parsed.src;
    iframe.classList.remove("hidden");
    fallback.classList.add("hidden");
  } else if (parsed.kind === "external") {
    iframe.removeAttribute("src");
    iframe.classList.add("hidden");
    fallback.classList.remove("hidden");
    openBtn.href = parsed.href;
  } else {
    iframe.removeAttribute("src");
    iframe.classList.add("hidden");
    fallback.classList.remove("hidden");
    openBtn.classList.add("hidden");
    fallback.querySelector("p").textContent = "No video linked — continue to the cake celebration.";
  }
  document.getElementById("call-caption").textContent = MSG || "";
}

/* ---------- Call timer ---------- */
let timerId = null;
let seconds = 0;
function startTimer() {
  seconds = 0;
  const el = document.getElementById("call-timer");
  el.textContent = "00:00";
  clearInterval(timerId);
  timerId = setInterval(() => {
    seconds++;
    el.textContent =
      `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }, 1000);
}
function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

/* ---------- Call flow ---------- */
function fillCallerUI() {
  document.getElementById("caller-name").textContent = CALLER;
  document.getElementById("caller-avatar").textContent = CALLER.charAt(0).toUpperCase();
  document.getElementById("finale-name").textContent = NAME;
  document.getElementById("finale-from").textContent = CALLER;
  document.getElementById("finale-avatar").textContent = CALLER.charAt(0).toUpperCase();
  document.getElementById("finale-msg").textContent = MSG || DEFAULT_MSG;
  document.title = `${CALLER} is calling…`;
}

function answerCall() {
  stopRinging();
  playAnswerClick();
  loadVideo();
  showScene("active");
  startTimer();
}

function declineCall() {
  stopRinging();
  const msg = document.getElementById("declined-msg");
  msg.textContent = MSG || `${CALLER} tried to reach you with a birthday wish. Answer anyway to continue.`;
  document.getElementById("declined-from").textContent = `— ${CALLER}`;
  showScene("declined");
}

function goToCake() {
  stopTimer();
  stopRinging();
  playSparkle();
  document.getElementById("wish-video").src = "";
  showScene("bridge");
  setTimeout(() => {
    showScene("cake");
    setupCake();
    requestAnimationFrame(positionCandleGlow);
    setTimeout(() => document.body.classList.add("lights-off"), 700);
  }, 2200);
}

/* ---------- Cake ---------- */
const CANDLE_COUNT = 5;
const candlesEl = document.getElementById("candles");
const candlesLeftEl = document.getElementById("candles-left");
const blowHint = document.getElementById("blow-hint");
const knife = document.getElementById("knife");
let candlesLit = 0;
let micStream = null;
let cakeDone = false;
let cutting = false;

function positionCandleGlow() {
  const cakeRect = document.getElementById("cake").getBoundingClientRect();
  const darkness = document.getElementById("darkness");
  darkness.style.setProperty("--glow-x", cakeRect.left + cakeRect.width / 2 + "px");
  darkness.style.setProperty("--glow-y", cakeRect.top + 70 + "px");
}

function setupCake() {
  cakeDone = false;
  cutting = false;
  candlesEl.innerHTML = "";
  candlesLit = CANDLE_COUNT;
  document.getElementById("cake-heading").textContent = "Make a wish & blow out the candles";
  knife.classList.add("hidden");
  knife.classList.remove("cutting", "done");
  document.getElementById("cut-notch").classList.remove("visible");
  document.getElementById("slice").classList.remove("served");
  blowHint.textContent = "🎤 Blow into your microphone… or tap the flames";

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
  candlesLeftEl.textContent = cheer[candlesLit] ?? "";
}

function extinguish(candle) {
  if (cakeDone || candle.classList.contains("out")) return;
  candle.classList.add("out");
  candlesLit--;
  playPuff();
  const rect = candle.getBoundingClientRect();
  burstConfetti(rect.left + rect.width / 2, rect.top - 20, 12, 3);
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
    candlesEl.classList.remove("wavering");
    blowHint.classList.remove("listening");
    blowHint.textContent = "Close your eyes… make your wish 🌠";
    setTimeout(() => document.body.classList.remove("lights-off"), 1400);
    setTimeout(startCutting, 3200);
  }
}

function startCutting() {
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
  setTimeout(playSlice, 500);
  setTimeout(playSlice, 1400);
  setTimeout(() => {
    document.getElementById("cut-notch").classList.add("visible");
    const cakeRect = document.getElementById("cake").getBoundingClientRect();
    burstConfetti(cakeRect.left + cakeRect.width * 0.66, cakeRect.top + 60, 40, 5);
    playSparkle();
  }, 2000);
  setTimeout(() => {
    knife.classList.add("done");
    document.getElementById("slice").classList.add("served");
    candlesLeftEl.textContent = "The first slice, served with love 🍰";
  }, 2800);
  setTimeout(startFinale, 5000);
}

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
      const lowEnd = data.slice(2, 40);
      const avg = lowEnd.reduce((a, b) => a + b, 0) / lowEnd.length;
      candlesEl.classList.toggle("wavering", avg > 60);
      if (avg > 110) {
        loudFrames++;
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

/* ---------- Finale: after-party table ---------- */
const afterpartyTable = document.getElementById("afterparty-table");
const savedWishPhone = document.getElementById("saved-wish-phone");
const toastBtn = document.getElementById("toast-btn");
const finaleMsgEl = document.getElementById("finale-msg");
const finaleHint = document.getElementById("finale-hint");
const tableSmoke = document.getElementById("table-smoke");
let wishPlayed = false;
let toastRaised = false;
let smokeTimer = null;

function playClink() {
  const ctx = getAudio();
  [880, 1174.7].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    const t = ctx.currentTime + i * 0.04;
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}

function spawnTableSmoke() {
  const wisp = document.createElement("span");
  wisp.className = "smoke-wisp";
  wisp.style.left = 38 + Math.random() * 24 + "%";
  wisp.style.animationDuration = 3.2 + Math.random() * 2 + "s";
  wisp.style.animationDelay = Math.random() * 0.8 + "s";
  tableSmoke.appendChild(wisp);
  setTimeout(() => wisp.remove(), 5200);
}

function startTableSmoke() {
  clearInterval(smokeTimer);
  spawnTableSmoke();
  smokeTimer = setInterval(spawnTableSmoke, 1400);
}

function stopTableSmoke() {
  clearInterval(smokeTimer);
  smokeTimer = null;
  tableSmoke.innerHTML = "";
}

function resetFinale() {
  wishPlayed = false;
  toastRaised = false;
  afterpartyTable.classList.remove("entered", "wish-playing", "wish-played", "toasting");
  savedWishPhone.classList.remove("playing");
  toastBtn.disabled = true;
  finaleMsgEl.classList.remove("visible", "typing", "done");
  finaleMsgEl.textContent = MSG || DEFAULT_MSG;
  finaleHint.textContent = "The call ended — tap the phone to hear their wish";
  stopTableSmoke();
}

function playSavedWish() {
  if (wishPlayed) return;
  wishPlayed = true;
  savedWishPhone.classList.add("playing");
  afterpartyTable.classList.add("wish-playing");
  finaleHint.textContent = "Listening…";
  playSparkle();
  const fullMsg = MSG || DEFAULT_MSG;
  finaleMsgEl.textContent = "";
  setTimeout(() => {
    afterpartyTable.classList.remove("wish-playing");
    afterpartyTable.classList.add("wish-played");
    savedWishPhone.classList.remove("playing");
    finaleMsgEl.classList.add("visible", "typing");
    finaleHint.textContent = "Their words, saved just for you";
    toastBtn.disabled = false;
    let i = 0;
    const typeInterval = setInterval(() => {
      finaleMsgEl.textContent = fullMsg.slice(0, ++i);
      if (i >= fullMsg.length) {
        clearInterval(typeInterval);
        finaleMsgEl.classList.remove("typing");
        finaleMsgEl.classList.add("done");
        finaleHint.textContent = "Tap the glasses — raise a birthday toast 🥂";
        burstConfetti(innerWidth * 0.5, innerHeight * 0.45, 35, 4);
      }
    }, 28);
  }, 1600);
}

function raiseToast() {
  if (!wishPlayed || toastRaised) return;
  toastRaised = true;
  afterpartyTable.classList.add("toasting");
  toastBtn.disabled = true;
  finaleHint.textContent = "Cheers to you — happy birthday!";
  playClink();
  playSparkle();
  confettiRain(140);
  for (let i = 0; i < 6; i++) setTimeout(firework, i * 220);
  clearInterval(fireworkTimer);
  fireworkTimer = setInterval(firework, 1200);
  setTimeout(() => clearInterval(fireworkTimer), 10000);
  const rect = toastBtn.getBoundingClientRect();
  burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 50, 6);
}

function startFinale() {
  document.body.classList.remove("lights-off");
  resetFinale();
  const timeEl = document.getElementById("finale-call-time");
  timeEl.textContent =
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  showScene("finale");
  requestAnimationFrame(() => afterpartyTable.classList.add("entered"));
  startTableSmoke();
  confettiRain(80);
  startBalloons();
  playBirthdaySong();
  fireworkTimer = setInterval(firework, 2800);
  setTimeout(() => clearInterval(fireworkTimer), 6000);
  playSparkle();
}

/* ---------- Events ---------- */
document.getElementById("answer-btn").addEventListener("click", answerCall);
document.getElementById("answer-anyway-btn").addEventListener("click", answerCall);
document.getElementById("decline-btn").addEventListener("click", declineCall);
document.getElementById("continue-btn").addEventListener("click", goToCake);
knife.addEventListener("click", cutCake);
knife.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") cutCake();
});

savedWishPhone.addEventListener("click", playSavedWish);
toastBtn.addEventListener("click", raiseToast);

document.getElementById("music-btn").addEventListener("click", playBirthdaySong);
document.getElementById("replay-call-btn").addEventListener("click", () => {
  stopBalloons();
  stopMic();
  stopTableSmoke();
  clearInterval(fireworkTimer);
  document.body.classList.remove("lights-off");
  particles = [];
  resetFinale();
  fillCallerUI();
  showScene("ring");
  startRinging();
});
document.getElementById("declined-home-btn").addEventListener("click", () => {
  location.href = new URL("./", location.href).href;
});
document.getElementById("guide-light").addEventListener("click", () => {
  location.href = new URL("./", location.href).href;
});

/* Boot */
fillCallerUI();
initStars();
resizeFx();
addEventListener("resize", () => {
  initStars();
  resizeFx();
  if (scenes.cake.classList.contains("active")) positionCandleGlow();
});
requestAnimationFrame(drawStars);
requestAnimationFrame(tickFx);

try { startRinging(); } catch { /* wait for tap */ }
document.body.addEventListener(
  "pointerdown",
  () => {
    if (!ringTimer && scenes.ring.classList.contains("active")) startRinging();
  },
  { once: true }
);

if (!VIDEO_RAW) {
  document.getElementById("ring-hint").textContent = "Answer — then continue to the cake";
}
