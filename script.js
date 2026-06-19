const wishBank = {
  sweet: [
    "愿你万事顺意，生活像甜粽一样，拆开都是惊喜。",
    "愿艾香绕过窗边，替你留住今天所有温柔和好消息。",
    "愿你的日子有清风、有甜意，也有刚刚好的热闹。"
  ],
  lucky: [
    "今日福签：好运靠岸，贵人同行，想做的事会被温柔推一把。",
    "今日福签：心愿上上签，适合出发、表白、开新局。",
    "今日福签：粽叶包平安，龙舟载喜讯，接下来一路顺。"
  ],
  bold: [
    "愿你一路高粽，冲过浪头，把想要的答案稳稳拿下。",
    "愿你像龙舟一样破浪向前，今天接福，明天开挂。",
    "愿所有拖住你的事都退潮，所有支持你的风都正好。"
  ]
};

const fortuneTags = ["今日福签", "端午彩蛋", "好运到账", "高粽时刻"];
const fortuneStickPhrases = [
  "心愿上上签适合出发",
  "好运正靠岸一路顺风",
  "龙舟载喜讯平安到岸",
  "贵人同行好事将近",
  "清风送甜意万事顺遂"
];
const charms = {
  "甜粽": "你拆到一枚甜粽：今天适合被偏爱，也适合把快乐说出口。",
  "艾草": "你领取一束艾草：替你挡住坏心情，留下清爽和平安。",
  "龙舟": "你点亮一艘龙舟：好运正在加速靠岸，记得抬头接住。"
};

const card = document.querySelector(".festival-card");
const canvas = document.querySelector("#sparkCanvas");
const ctx = canvas.getContext("2d");
const wishText = document.querySelector("#wishText");
const fortuneTag = document.querySelector("#fortuneTag");
const nameInput = document.querySelector("#nameInput");
const recipientName = document.querySelector("#recipientName");
const modeLabel = document.querySelector("#modeLabel");
const nameLabel = document.querySelector("#nameLabel");
const launchBtn = document.querySelector("#launchBtn");
const fortuneBtn = document.querySelector("#fortuneBtn");
const copyBtn = document.querySelector("#copyBtn");
const themeBtn = document.querySelector("#themeBtn");
const danmakuBtn = document.querySelector("#danmakuBtn");
const danmakuLayer = document.querySelector("#danmakuLayer");
const nameField = document.querySelector(".name-field");
const fortuneReveal = document.querySelector("#fortuneReveal");
const fortuneStickText = document.querySelector("#fortuneStickText");
const toast = document.querySelector("#toast");
const modeTabs = [...document.querySelectorAll(".mode-tab")];
const charmButtons = [...document.querySelectorAll(".tap-zongzi")];

let mode = "sweet";
let previousWish = -1;
let particles = [];
let theme = "jade";
let danmakuOn = true;
let fortuneRevealTimer = null;
let fortuneHideTimer = null;

function cleanName(value) {
  return value.trim().replace(/\s+/g, "").slice(0, 8);
}

function syncDraftUrl() {
  const url = new URL(window.location.href);
  const name = cleanName(nameInput.value);
  if (name) {
    url.searchParams.set("to", name);
  } else {
    url.searchParams.delete("to");
  }
  url.searchParams.delete("lock");
  window.history.replaceState({}, "", url);
  return url.toString();
}

function buildLockedShareUrl() {
  const url = new URL(window.location.href);
  const name = cleanName(nameInput.value);
  if (name) {
    url.searchParams.set("to", name);
    url.searchParams.set("lock", "1");
  } else {
    url.searchParams.delete("to");
    url.searchParams.delete("lock");
  }
  return url.toString();
}

function hydrateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const name = cleanName(params.get("to") || "");
  if (!name) return;
  nameInput.value = name;
  recipientName.textContent = name;
  setWish(wishBank.sweet[0], "专属祝福");
  if (params.get("lock") === "1") {
    nameInput.readOnly = true;
    nameInput.setAttribute("aria-readonly", "true");
    card.classList.add("is-receiver");
    nameField.classList.add("is-locked");
    modeLabel.textContent = "端午 · 专属祝福";
    nameLabel.textContent = "送给";
  } else {
    modeLabel.textContent = "端午 · 制作祝福";
    nameLabel.textContent = "写给谁";
  }
}

function sizeCanvas() {
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function displayName() {
  return cleanName(nameInput.value) || "你";
}

function decorateWish(text) {
  const name = displayName();
  return name === "你" ? text : `${name}，${text}`;
}

function setWish(text, tag = "今日福签") {
  wishText.textContent = decorateWish(text);
  fortuneTag.textContent = tag;
}

function nextWish(forceMode = mode) {
  const bank = wishBank[forceMode];
  let index = Math.floor(Math.random() * bank.length);
  if (index === previousWish) {
    index = (index + 1) % bank.length;
  }
  previousWish = index;
  setWish(bank[index], fortuneTags[Math.floor(Math.random() * fortuneTags.length)]);
}

function pickWish(forceMode = mode) {
  const bank = wishBank[forceMode];
  let index = Math.floor(Math.random() * bank.length);
  if (index === previousWish) {
    index = (index + 1) % bank.length;
  }
  previousWish = index;
  return bank[index];
}

function makeFortuneStickText(text) {
  const index = Math.abs(text.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % fortuneStickPhrases.length;
  return fortuneStickPhrases[index];
}

function createBurst(origin = "center") {
  const rect = card.getBoundingClientRect();
  const x = origin === "top" ? rect.left + rect.width * 0.5 : rect.left + rect.width * 0.5;
  const y = origin === "top" ? rect.top + rect.height * 0.28 : rect.top + rect.height * 0.52;
  createPointBurst(x, y, 110, 1);
}

function createPointBurst(x, y, count = 42, power = 0.62) {
  const colors = ["#f7cd70", "#17c78d", "#3dd8f5", "#e94b5f", "#fff8e8"];

  for (let i = 0; i < count; i += 1) {
    particles.push({
      x,
      y,
      vx: randomBetween(-5.6, 5.6) * power,
      vy: randomBetween(-8.2, 2.2) * power,
      size: randomBetween(3, 8),
      life: randomBetween(34, 68),
      maxLife: 82,
      color: colors[Math.floor(Math.random() * colors.length)],
      spin: randomBetween(-0.22, 0.22),
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
    particle.vy += 0.13;
    particle.angle += particle.spin;

    const alpha = Math.max(particle.life / particle.maxLife, 0);
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.angle);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 1.7);
    ctx.restore();
  }

  requestAnimationFrame(drawParticles);
}

function popCard(origin) {
  card.classList.remove("is-burst");
  void card.offsetWidth;
  card.classList.add("is-burst");
  createBurst(origin);
}

function addDanmaku(text) {
  if (!danmakuOn) return;
  const item = document.createElement("span");
  item.className = "fresh";
  item.textContent = text;
  item.style.top = `${Math.floor(randomBetween(4, 62))}px`;
  danmakuLayer.appendChild(item);
  window.setTimeout(() => item.remove(), 6200);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1400);
}

function showFortuneReveal(text) {
  fortuneStickText.textContent = makeFortuneStickText(text);
  window.clearTimeout(fortuneRevealTimer);
  window.clearTimeout(fortuneHideTimer);
  fortuneReveal.classList.remove("show", "hide");
  void fortuneReveal.offsetWidth;
  fortuneReveal.classList.add("show");
  fortuneRevealTimer = window.setTimeout(() => {
    fortuneReveal.classList.add("hide");
    fortuneHideTimer = window.setTimeout(() => {
      fortuneReveal.classList.remove("show", "hide");
    }, 480);
  }, 5000);
}

card.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || event.target.closest("input, textarea, select")) return;
  createPointBurst(event.clientX, event.clientY, 34, 0.58);
});

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    mode = tab.dataset.mode;
    modeTabs.forEach((item) => item.classList.toggle("active", item === tab));
    nextWish(mode);
    addDanmaku(tab.textContent);
  });
});

charmButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const charm = button.dataset.charm;
    setWish(charms[charm], "你拆到的祝福");
    addDanmaku(charm);
    popCard("top");
  });
});

nameInput.addEventListener("input", () => {
  if (nameInput.readOnly) return;
  recipientName.textContent = displayName();
  syncDraftUrl();
});

launchBtn.addEventListener("click", () => {
  nextWish(mode);
  addDanmaku("祝福已生成");
  popCard("center");
});

fortuneBtn.addEventListener("click", () => {
  mode = "lucky";
  modeTabs.forEach((item) => item.classList.toggle("active", item.dataset.mode === mode));
  fortuneBtn.disabled = true;
  fortuneBtn.classList.add("is-drawing");
  fortuneBtn.textContent = "抽签中";
  window.setTimeout(() => {
    const text = pickWish(mode);
    setWish(text, "上上签");
    showFortuneReveal(text);
    addDanmaku("上上签");
    popCard("top");
    fortuneBtn.textContent = "再抽一签";
    fortuneBtn.classList.remove("is-drawing");
    fortuneBtn.disabled = false;
  }, 520);
});

copyBtn.addEventListener("click", async () => {
  const shareUrl = buildLockedShareUrl();
  const text = `端午安康！${wishText.textContent} ${shareUrl}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "端午安康", text, url: shareUrl });
      showToast("分享面板已打开");
      return;
    }
    await navigator.clipboard.writeText(text);
    showToast("祝福已复制");
  } catch {
    try {
      await navigator.clipboard.writeText(text);
      showToast("祝福已复制");
    } catch {
      showToast("可以长按祝福复制");
    }
  }
});

themeBtn.addEventListener("click", () => {
  theme = theme === "jade" ? "sunset" : "jade";
  card.dataset.theme = theme;
  showToast(theme === "jade" ? "青粽配色" : "暖金配色");
});

danmakuBtn.addEventListener("click", () => {
  danmakuOn = !danmakuOn;
  danmakuBtn.classList.toggle("active", danmakuOn);
  danmakuLayer.classList.toggle("is-off", !danmakuOn);
});

window.addEventListener("resize", sizeCanvas);
sizeCanvas();
hydrateFromUrl();
drawParticles();
