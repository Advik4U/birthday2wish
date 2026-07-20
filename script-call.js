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
  "I couldn’t say it all on the call — so here it is forever: " +
  "may this year find you laughing harder, dreaming bigger, and feeling deeply loved.";

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

function playVoicemailBeep() {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 740;
  gain.gain.setValueAtTime(0.14, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.6);
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

function firework() {
  burstConfetti(
    innerWidth * (0.15 + Math.random() * 0.7),
    innerHeight * (0.12 + Math.random() * 0.35),
    55,
    6
  );
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
  document.getElementById("vm-from").textContent = CALLER;
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

function showAfterPhase(id) {
  ["phase-hangup", "phase-voicemail", "phase-party"].forEach((pid) => {
    document.getElementById(pid).classList.toggle("hidden", pid !== id);
  });
}

function typeVoicemail(text, done) {
  const el = document.getElementById("vm-transcript");
  const card = document.querySelector(".voicemail-card");
  el.textContent = "";
  el.classList.remove("done");
  card.classList.add("playing");
  let i = 0;
  (function step() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i++);
      setTimeout(step, 36);
    } else {
      el.classList.add("done");
      card.classList.remove("playing");
      done?.();
    }
  })();
}

let fireworkTimer = null;
function startAfterParty() {
  showAfterPhase("phase-party");
  confettiRain(180);
  startBalloons();
  playBirthdaySong();
  fireworkTimer = setInterval(firework, 1500);
  setTimeout(() => clearInterval(fireworkTimer), 14000);
  // reveal guide light after a beat
  setTimeout(() => {
    document.getElementById("guide-light").style.opacity = "1";
  }, 1800);
}

function endCall() {
  stopTimer();
  playHangup();
  const iframe = document.getElementById("wish-video");
  iframe.src = "";
  stopBalloons();
  clearInterval(fireworkTimer);

  // reset party bits
  document.getElementById("star-reveal").textContent = "";
  document.querySelectorAll(".wish-star").forEach((s) => {
    s.classList.remove("opened");
    s.textContent = "✦";
  });
  const vmBtn = document.getElementById("vm-continue-btn");
  vmBtn.classList.add("hidden-soft");

  showScene("ended");
  showAfterPhase("phase-hangup");
  burstConfetti(innerWidth / 2, innerHeight * 0.4, 40, 5);

  // hangup beat → voicemail
  setTimeout(() => {
    showAfterPhase("phase-voicemail");
    playVoicemailBeep();
    const text = MSG || DEFAULT_END;
    setTimeout(() => {
      typeVoicemail(text, () => {
        setTimeout(() => vmBtn.classList.remove("hidden-soft"), 500);
      });
    }, 600);
  }, 2200);
}

document.getElementById("answer-btn").addEventListener("click", answerCall);
document.getElementById("answer-anyway-btn").addEventListener("click", answerCall);
document.getElementById("decline-btn").addEventListener("click", declineCall);
document.getElementById("hangup-btn").addEventListener("click", endCall);

document.getElementById("vm-continue-btn").addEventListener("click", () => {
  playSparkle();
  startAfterParty();
});

document.querySelectorAll(".wish-star").forEach((star) => {
  star.addEventListener("click", () => {
    if (star.classList.contains("opened")) return;
    star.classList.add("opened");
    star.textContent = "★";
    document.getElementById("star-reveal").textContent = star.dataset.wish;
    playSparkle();
    const r = star.getBoundingClientRect();
    burstConfetti(r.left + r.width / 2, r.top, 28, 5);
  });
});

document.getElementById("music-btn").addEventListener("click", playBirthdaySong);

document.getElementById("replay-call-btn").addEventListener("click", () => {
  stopBalloons();
  clearInterval(fireworkTimer);
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
