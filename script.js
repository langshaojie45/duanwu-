const wishes = [
  "愿你万事顺意，生活像甜粽一样，拆开都是惊喜。",
  "端午安康，愿清风绕肩，好运靠岸，烦恼都被浪花带走。",
  "愿你今日有粽香，明日有锋芒，日日都有热气腾腾的盼头。",
  "愿艾草替你挡住坏心情，龙舟替你划来好消息。",
  "粽叶一层层包住平安，也包住这一整年的好运气。",
  "愿你一路高“粽”，所遇皆甜，所行皆稳。"
];

const wishText = document.querySelector("#wishText");
const launchBtn = document.querySelector("#launchBtn");
const copyBtn = document.querySelector("#copyBtn");
const toast = document.querySelector("#toast");
const card = document.querySelector(".reel-card");
const canvas = document.querySelector("#sparkCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
let previousWish = 0;

function sizeCanvas() {
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createBurst() {
  const rect = card.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height * 0.52;
  const colors = ["#ffd46b", "#19c98b", "#23e6ff", "#ff3d4f", "#fff8e7"];

  for (let i = 0; i < 92; i += 1) {
    particles.push({
      x: centerX,
      y: centerY,
      vx: randomBetween(-5.2, 5.2),
      vy: randomBetween(-7.4, 2.6),
      size: randomBetween(3, 8),
      life: randomBetween(42, 78),
      maxLife: 78,
      color: colors[Math.floor(Math.random() * colors.length)],
      spin: randomBetween(-0.18, 0.18),
      angle: randomBetween(0, Math.PI)
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter((particle) => particle.life > 0);

  for (const particle of particles) {
    particle.life -= 1;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.12;
    particle.angle += particle.spin;

    const alpha = Math.max(particle.life / particle.maxLife, 0);
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.angle);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 1.8);
    ctx.restore();
  }

  requestAnimationFrame(drawParticles);
}

function nextWish() {
  let index = Math.floor(Math.random() * wishes.length);
  if (index === previousWish) {
    index = (index + 1) % wishes.length;
  }
  previousWish = index;
  wishText.textContent = wishes[index];
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1400);
}

launchBtn.addEventListener("click", () => {
  nextWish();
  createBurst();
  card.classList.remove("burst");
  void card.offsetWidth;
  card.classList.add("burst");
});

copyBtn.addEventListener("click", async () => {
  const text = `端午安康！${wishText.textContent}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast("祝福已复制");
  } catch {
    showToast("可以长按祝福复制");
  }
});

window.addEventListener("resize", sizeCanvas);
sizeCanvas();
drawParticles();
