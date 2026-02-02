// ──────────────────────────────
//  FIREWORKS
// ──────────────────────────────
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
let particles = [];
let fireworkTimer = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor(x, y, hue) {
    this.x = x; this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3.5 + 0.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.008;
    this.hue = hue + (Math.random() - 0.5) * 40;
    this.size = Math.random() * 2.5 + 1;
    this.trail = [];
  }
  update() {
    this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
    if (this.trail.length > 4) this.trail.shift();
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.04; // gravity
    this.vx *= 0.985;
    this.alpha -= this.decay;
  }
  draw() {
    // trail
    this.trail.forEach((t, i) => {
      ctx.globalAlpha = t.alpha * (i / this.trail.length) * 0.3;
      ctx.fillStyle = `hsl(${this.hue}, 85%, 60%)`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
    // main
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = `hsl(${this.hue}, 90%, 65%)`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = `hsla(${this.hue}, 90%, 60%, 0.6)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

function launchFirework() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height * 0.45 + 30;
  const hue = Math.random() * 60 + 330; // pinks/reds/golds
  const count = Math.floor(Math.random() * 40) + 30;
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y, hue));
}

function animateFireworks() {
  ctx.fillStyle = 'rgba(26, 10, 15, 0.18)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  fireworkTimer++;
  if (fireworkTimer % 55 === 0) launchFirework();

  particles = particles.filter(p => p.alpha > 0);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateFireworks);
}
// kick off
launchFirework();
setTimeout(launchFirework, 600);
animateFireworks();

// ──────────────────────────────
//  CAROUSEL
// ──────────────────────────────
let currentSlide = 0;
const totalSlides = 5;
const carousel = document.getElementById('carousel');
const dotsEl = document.getElementById('dots');

// create dots
for (let i = 0; i < totalSlides; i++) {
  const d = document.createElement('div');
  d.className = 'dot' + (i === 0 ? ' active' : '');
  d.onclick = () => goToSlide(i);
  dotsEl.appendChild(d);
}

function goToSlide(n) {
  currentSlide = n;
  carousel.style.transform = `translateX(-${n * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === n));
}
function nextSlide() { goToSlide((currentSlide + 1) % totalSlides); }
function prevSlide() { goToSlide((currentSlide - 1 + totalSlides) % totalSlides); }

// auto-play
setInterval(nextSlide, 3200);

// touch swipe support
let touchStartX = 0;
const wrap = document.getElementById('carouselWrap');
wrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
wrap.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (diff > 40) nextSlide();
  else if (diff < -40) prevSlide();
});

// ──────────────────────────────
//  YES / NO LOGIC
// ──────────────────────────────
let noCount = 0;
const btnYes = document.getElementById('btnYes');
const btnNo  = document.getElementById('btnNo');
const noMsg  = document.getElementById('noMsg');

const noMessages = [
  "Ay sure naka? 🥺",
  "Tarong lovee ba 💕",
  "Huna-hunaag maayo 💭",
  "Final? Ga sakit na akong kasing2… 💔",
  "Last chance… Yes na baaaa! 🌹",
  "Stangg, yes na LOVEE! 😭💝",
  "Sige mo Cry nako...🥲",
  "NO CHOICE NA HAHAHA! 😘❤️"
];

function onNo() {
  noCount++;
  // grow YES button
  const scale = 1 + noCount * 0.18;
  const fontSize = 1.1 + noCount * 0.14;
  const padH = 42 + noCount * 10;
  const padV = 14 + noCount * 4;
  btnYes.style.fontSize = fontSize + 'rem';
  btnYes.style.padding = padV + 'px ' + padH + 'px';
  btnYes.style.boxShadow = `0 ${4 + noCount*2}px ${20 + noCount*8}px rgba(230,57,100,${0.4 + noCount*0.06})`;

  // shrink NO button
  const noScale = Math.max(0.55, 1 - noCount * 0.08);
  btnNo.style.fontSize = (0.85 * noScale) + 'rem';
  btnNo.style.padding = (10 * noScale) + 'px ' + (28 * noScale) + 'px';
  btnNo.style.opacity = Math.max(0.35, 1 - noCount * 0.1);

  // message
  const idx = Math.min(noCount - 1, noMessages.length - 1);
  noMsg.textContent = noMessages[idx];
  noMsg.classList.add('visible');

  // cap NO at 8 presses
  if (noCount >= 8) btnNo.style.display = 'none';
}

function onYes() {
  document.getElementById('questionSection').style.display = 'none';
  document.getElementById('celebration').classList.add('show');
  launchConfetti();
  for (let i = 0; i < 5; i++) setTimeout(launchFirework, i * 200);
}

// ──────────────────────────────
//  OUTFIT PICKER
// ──────────────────────────────
const outfitColors = [
  { name: 'Rose Red',      light: '#e63964', dark: '#c41e52' },
  { name: 'Midnight Blue', light: '#3a7bd5', dark: '#1e4d8c' },
  { name: 'Emerald',       light: '#2ecc71', dark: '#1a9e56' },
  { name: 'Royal Purple',  light: '#8e44ad', dark: '#6c3483' },
  { name: 'Blush Pink',    light: '#f48fb1', dark: '#ec407a' },
  { name: 'Champagne',     light: '#d4a843', dark: '#a88230' },
  { name: 'Ivory White',   light: '#f5f0e8', dark: '#d9d0c0' },
  { name: 'Jet Black',     light: '#2c2c2c', dark: '#1a1a1a' },
  { name: 'Burgundy',      light: '#800020', dark: '#5c0015' },
  { name: 'Sky Blue',      light: '#87ceeb', dark: '#5ba3c9' }
];

let selectedColorIdx = 0;

// Build swatches
const swatchGrid = document.getElementById('swatchGrid');
outfitColors.forEach((c, i) => {
  const s = document.createElement('div');
  s.className = 'swatch' + (i === 0 ? ' active' : '');
  s.style.background = c.light;
  s.onclick = () => selectColor(i);
  swatchGrid.appendChild(s);
});

function selectColor(idx) {
  selectedColorIdx = idx;
  document.querySelectorAll('.swatch').forEach((s, i) => s.classList.toggle('active', i === idx));
  applyDressColor(outfitColors[idx]);
  document.getElementById('swatchLabel').textContent = outfitColors[idx].name;
}

function applyDressColor(color) {
  const s1 = document.getElementById('gradStop1');
  const s2 = document.getElementById('gradStop2');
  s1.setAttribute('stop-color', color.light);
  s2.setAttribute('stop-color', color.dark);
}

function showOutfitPicker() {
  document.getElementById('celebration').classList.remove('show');
  document.getElementById('celebration').style.display = 'none';
  document.getElementById('outfitSection').classList.add('show');
  // apply default
  applyDressColor(outfitColors[0]);
  document.getElementById('swatchLabel').textContent = outfitColors[0].name;
  launchConfetti();
  for (let i = 0; i < 3; i++) setTimeout(launchFirework, i * 300);
}

function confirmOutfit() {
  document.getElementById('outfitSection').classList.remove('show');
  document.getElementById('outfitSection').style.display = 'none';
  document.getElementById('chosenColorName').textContent = outfitColors[selectedColorIdx].name;
  document.getElementById('finalMsg').classList.add('show');
  launchConfetti();
  for (let i = 0; i < 6; i++) setTimeout(launchFirework, i * 180);
}

// ──────────────────────────────
//  CONFETTI
// ──────────────────────────────
function launchConfetti() {
  const colors = ['#e63964','#f7c5d5','#d4a843','#ff6b9d','#fff','#c41e52'];
  for (let i = 0; i < 70; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = '-10px';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.width = (Math.random() * 8 + 6) + 'px';
      el.style.height = (Math.random() * 8 + 6) + 'px';
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      el.style.animationDuration = (Math.random() * 2 + 2) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4500);
    }, i * 30);
  }
}

// ──────────────────────────────
//  FLOATING HEARTS (ambient)
// ──────────────────────────────
function spawnHeart() {
  const el = document.createElement('div');
  el.className = 'float-heart';
  el.textContent = ['💕','♡','❤️','💝'][Math.floor(Math.random()*4)];
  el.style.left = Math.random() * 100 + 'vw';
  el.style.bottom = '-30px';
  el.style.fontSize = (Math.random() * 14 + 10) + 'px';
  el.style.animationDuration = (Math.random() * 6 + 6) + 's';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 13000);
}
setInterval(spawnHeart, 1800);
spawnHeart();
// ──────────────────────────────
//  BACKGROUND MUSIC
  const bgMusic = document.getElementById("bg-music");
  let musicStarted = false;

  function startMusic() {
    if (!musicStarted) {
      bgMusic.volume = 0.4;
      bgMusic.play().catch(err => console.log(err));
      musicStarted = true;
    }
  }

  // Start on clicking Yes
  document.querySelector(".btn-yes").addEventListener("click", startMusic);