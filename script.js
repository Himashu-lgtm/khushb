/* ---------- 1. Welcome screen + background music ---------- */
const music = new Audio('audio/wedding-music.mp3');
music.loop = true;
music.volume = 0.35;

const musicBtn = document.getElementById('musicBtn');
function updateMusicIcon() { musicBtn.textContent = music.paused ? '🔇' : '🔊'; }

document.getElementById('openBtn').addEventListener('click', () => {
  document.getElementById('welcome').classList.add('hidden');
  music.play().catch(() => {});   // browsers only allow sound after a click
  updateMusicIcon();
});

musicBtn.addEventListener('click', () => {
  music.paused ? music.play() : music.pause();
  updateMusicIcon();
});

/* ---------- 2. Floating hearts & gold sparkles ---------- */
const petals = document.getElementById('petals');
const pctx = petals.getContext('2d');
let W, H;
function resizePetals() { W = petals.width = innerWidth; H = petals.height = innerHeight; }
resizePetals();
addEventListener('resize', resizePetals);

const small = innerWidth < 768;
const hearts = Array.from({ length: small ? 14 : 24 }, () => ({
  x: Math.random() * W, y: Math.random() * -H,
  size: 12 + Math.random() * 16, vy: 0.7 + Math.random() * 1.4,
  vx: (Math.random() - 0.5) * 0.9, rot: Math.random() * 360,
  rotSpeed: (Math.random() - 0.5) * 1.2, alpha: 0.35 + Math.random() * 0.45,
  wobble: Math.random() * 6.28
}));
const sparkles = Array.from({ length: small ? 20 : 35 }, () => ({
  x: Math.random() * W, y: Math.random() * H,
  r: 1 + Math.random() * 2.2, a: Math.random(),
  da: 0.015 + Math.random() * 0.02, vy: -0.3 - Math.random() * 0.5
}));

function drawHeart(h) {
  const s = h.size;
  pctx.save();
  pctx.translate(h.x, h.y);
  pctx.rotate(h.rot * Math.PI / 180);
  pctx.globalAlpha = h.alpha;
  pctx.beginPath();
  pctx.moveTo(0, s * 0.25);
  pctx.bezierCurveTo(-s * 0.05, s * 0.05, -s * 0.5, -s * 0.1, -s * 0.5, s * 0.2);
  pctx.bezierCurveTo(-s * 0.5, s * 0.55, -s * 0.1, s * 0.75, 0, s);
  pctx.bezierCurveTo(s * 0.1, s * 0.75, s * 0.5, s * 0.55, s * 0.5, s * 0.2);
  pctx.bezierCurveTo(s * 0.5, -s * 0.1, s * 0.05, s * 0.05, 0, s * 0.25);
  pctx.fillStyle = '#CC0000';
  pctx.fill();
  pctx.restore();
}

function animatePetals() {
  pctx.clearRect(0, 0, W, H);
  sparkles.forEach(s => {
    s.a += s.da;
    if (s.a > 1 || s.a < 0.1) s.da = -s.da;
    s.y += s.vy;
    if (s.y < 0) s.y = H + 10;
    pctx.beginPath();
    pctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    pctx.fillStyle = `rgba(235, 200, 110, ${Math.min(1, Math.max(0, s.a))})`;
    pctx.fill();
  });
  hearts.forEach(h => {
    h.wobble += 0.02;
    h.x += h.vx + Math.sin(h.wobble) * 0.7;
    h.y += h.vy;
    h.rot += h.rotSpeed;
    if (h.y > H + 30) { h.y = -30; h.x = Math.random() * W; }
    drawHeart(h);
  });
  requestAnimationFrame(animatePetals);
}
animatePetals();

/* ---------- 3. Scratch card ---------- */
const scratch = document.getElementById('scratch');
const wrap = document.getElementById('scratchWrap');
const sctx = scratch.getContext('2d', { willReadFrequently: true });
let drawing = false, revealed = false;

function paintCover() {
  scratch.width = wrap.offsetWidth;
  scratch.height = wrap.offsetHeight;
  const g = sctx.createLinearGradient(0, 0, scratch.width, scratch.height);
  g.addColorStop(0, '#d4af37'); g.addColorStop(0.5, '#f3dfa2'); g.addColorStop(1, '#b38428');
  sctx.globalCompositeOperation = 'source-over';
  sctx.fillStyle = g;
  sctx.fillRect(0, 0, scratch.width, scratch.height);
  sctx.fillStyle = '#440a12';
  sctx.textAlign = 'center';
  sctx.font = '600 24px Cinzel, serif';
  sctx.fillText('Scratch to Reveal', scratch.width / 2, scratch.height / 2 - 5);
  sctx.font = 'italic 16px "Cormorant Garamond", serif';
  sctx.fillText('Our Wedding Date', scratch.width / 2, scratch.height / 2 + 22);
}
paintCover();

function scratchAt(e) {
  if (!drawing || revealed) return;
  e.preventDefault();
  const rect = scratch.getBoundingClientRect();
  const p = e.touches ? e.touches[0] : e;
  sctx.globalCompositeOperation = 'destination-out';
  sctx.beginPath();
  sctx.arc(p.clientX - rect.left, p.clientY - rect.top, 40, 0, Math.PI * 2);
  sctx.fill();
  checkRevealed();
}

let checking = false;
function checkRevealed() {
  if (checking) return;
  checking = true;
  setTimeout(() => {
    const px = sctx.getImageData(0, 0, scratch.width, scratch.height).data;
    let clear = 0;
    for (let i = 3; i < px.length; i += 4) if (px[i] === 0) clear++;
    if (clear / (px.length / 4) > 0.4) {      // 40% scratched -> reveal all
      sctx.clearRect(0, 0, scratch.width, scratch.height);
      revealed = true;
      scratch.style.pointerEvents = 'none';
    }
    checking = false;
  }, 100);
}

scratch.addEventListener('mousedown', e => { drawing = true; scratchAt(e); });
scratch.addEventListener('mousemove', scratchAt);
addEventListener('mouseup', () => drawing = false);
scratch.addEventListener('touchstart', e => { drawing = true; scratchAt(e); }, { passive: false });
scratch.addEventListener('touchmove', scratchAt, { passive: false });
scratch.addEventListener('touchend', () => drawing = false);

/* ---------- 4. Click an invitation card to see it full size ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
document.querySelectorAll('.invite').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.add('open');
  });
});
lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
addEventListener('keydown', e => { if (e.key === 'Escape') lightbox.classList.remove('open'); });

/* ---------- 5. Share & print buttons ---------- */
document.getElementById('printBtn').addEventListener('click', () => window.print());

document.getElementById('shareBtn').addEventListener('click', async () => {
  const data = {
    title: 'Wedding Invitation of Khushboo & Akash',
    text: 'You are cordially invited to celebrate the wedding of Khushboo & Akash on 25 November 2026 at Panaghar!',
    url: location.href
  };
  if (navigator.share) {
    try { await navigator.share(data); } catch (err) {}
  } else {
    navigator.clipboard.writeText(location.href);
    alert('Invitation link copied to clipboard!');
  }
});

document.getElementById('whatsappBtn').addEventListener('click', () => {
  const text = encodeURIComponent(
    'Join us in celebrating the wedding of Khushboo & Akash on 25 November 2026 at Panaghar!\n\nView invitation: ' + location.href
  );
  window.open('https://api.whatsapp.com/send?text=' + text, '_blank');
});
