/* Incoming Birthday Call */

const params = new URLSearchParams(location.search);
const NAME =
  (params.get("HappyBirthdaySurprise") || params.get("name") || "Friend").trim().slice(0, 30) ||
  "Friend";
const FROM = (params.get("from") || "").trim().slice(0, 30);
const MSG = (params.get("msg") || "").trim().slice(0, 200);
const VIDEO_RAW = (params.get("v") || params.get("video") || "").trim();

const CALLER = FROM || "Someone";
const DEFAULT_END =
  "The line went quiet, but the wish stays with you. May this year ring with joy.";

const scenes = {
  ring: document.getElementById("scene-ring"),
  declined: document.getElementById("scene-declined"),
  active: document.getElementById("scene-active"),
  ended: document.getElementById("scene-ended"),
};

function showScene(key) {
  Object.values(scenes).forEach((s) => s.classList.remove("active"));
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
  // classic two-tone ringtone chirp
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
function playHangup() {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(340, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.35);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.42);
}

/* ---------- Video URL parsing ---------- */
function parseVideoEmbed(raw) {
  if (!raw) return { kind: "none" };
  let url;
  try {
    url = new URL(raw);
  } catch {
    return { kind: "external", href: raw };
  }
  const host = url.hostname.replace(/^www\./, "");

  // YouTube
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    if (id) {
      return {
        kind: "iframe",
        src: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`,
      };
    }
  }
  if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
    let id = url.searchParams.get("v");
    if (!id && url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2];
    if (!id && url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2];
    if (id) {
      return {
        kind: "iframe",
        src: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`,
      };
    }
  }

  // Google Drive
  if (host.includes("drive.google.com")) {
    const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
    const id = fileMatch?.[1] || url.searchParams.get("id");
    if (id) {
      return {
        kind: "iframe",
        src: `https://drive.google.com/file/d/${id}/preview`,
      };
    }
  }

  // Dropbox → raw-ish
  if (host.includes("dropbox.com")) {
    url.searchParams.set("raw", "1");
    return { kind: "external", href: url.toString() };
  }

  // direct media
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url.pathname)) {
    return { kind: "external", href: raw };
  }

  return { kind: "external", href: raw };
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
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    el.textContent = `${m}:${s}`;
  }, 1000);
}
function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

/* ---------- Flow ---------- */
function fillCallerUI() {
  const nameEl = document.getElementById("caller-name");
  nameEl.textContent = CALLER;
  document.getElementById("caller-avatar").textContent = CALLER.charAt(0).toUpperCase();
  document.getElementById("end-name").textContent = NAME;
  document.getElementById("end-from").textContent = CALLER;
  document.getElementById("end-message").textContent = MSG || DEFAULT_END;
  document.title = `${CALLER} is calling…`;
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
    openBtn.href = "#";
    openBtn.textContent = "No video linked";
    openBtn.classList.add("hidden");
    fallback.querySelector("p").textContent = "This call has no video link — enjoy the birthday message instead.";
  }

  const caption = document.getElementById("call-caption");
  caption.textContent = MSG || "";
}

function answerCall() {
  stopRinging();
  playAnswerClick();
  loadVideo();
  showScene("active");
  startTimer();
  if (navigator.vibrate) navigator.vibrate(40);
}

function declineCall() {
  stopRinging();
  playHangup();
  const msg = document.getElementById("declined-msg");
  msg.textContent = MSG || `${CALLER} tried to reach you with a birthday wish. Answer anyway to see their video.`;
  document.getElementById("declined-from").textContent = `— ${CALLER}`;
  showScene("declined");
}

function endCall() {
  stopTimer();
  playHangup();
  const iframe = document.getElementById("wish-video");
  iframe.src = "";
  showScene("ended");
  confettiRain(160);
  burstConfetti(innerWidth / 2, innerHeight * 0.35, 80, 8);
}

document.getElementById("answer-btn").addEventListener("click", answerCall);
document.getElementById("answer-anyway-btn").addEventListener("click", answerCall);
document.getElementById("decline-btn").addEventListener("click", declineCall);
document.getElementById("hangup-btn").addEventListener("click", endCall);
document.getElementById("replay-call-btn").addEventListener("click", () => {
  particles = [];
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
});
requestAnimationFrame(drawStars);
requestAnimationFrame(tickFx);

try {
  startRinging();
} catch {
  /* wait for tap */
}
document.body.addEventListener(
  "pointerdown",
  () => {
    if (!ringTimer && scenes.ring.classList.contains("active")) startRinging();
  },
  { once: true }
);

if (!VIDEO_RAW) {
  document.getElementById("ring-hint").textContent = "Answer to open their birthday message";
}
