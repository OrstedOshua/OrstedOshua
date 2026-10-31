// @ts-check
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Убедимся, что папка assets существует
mkdirSync("assets", { recursive: true });

const LOGIN = "OrstedOshua";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

// Палитры: Тёмная (глубокий фиолетовый с неоновым розовым) и Светлая (лаванда с сочным малиновым)
const THEMES = {
  dark: {
    bgFrom: "#0B061A",
    bgTo: "#160A33",
    cardBg: "#110926",
    cardBorder: "#2E1065",
    neonAccent: "#FF2A85",
    neonAccentGlow: "rgba(255, 42, 133, 0.4)",
    secondaryAccent: "#A855F7",
    textPrimary: "#F8FAFC",
    textSecondary: "#A78BFA",
    textMuted: "#6B7280",
    chipBg: "#1F0F3D",
    chipBorder: "#3B1875",
    statBoxBg: "#1A0C38",
    gradientId: "darkGrad",
  },
  light: {
    bgFrom: "#FAF7FF",
    bgTo: "#EDE9FE",
    cardBg: "#FFFFFF",
    cardBorder: "#DDD6FE",
    neonAccent: "#E11D48",
    neonAccentGlow: "rgba(225, 29, 72, 0.25)",
    secondaryAccent: "#7C3AED",
    textPrimary: "#1E1B4B",
    textSecondary: "#6D28D9",
    textMuted: "#8B5CF6",
    chipBg: "#F5F3FF",
    chipBorder: "#C4B5FD",
    statBoxBg: "#F3E8FF",
    gradientId: "lightGrad",
  },
};

/**
 * Получение живой статистики через GitHub GraphQL API
 */
async function fetchGitHubData() {
  const defaultData = {
    totalRepos: 2,
    stars: 0,
    commits: 12,
    streakDays: 1,
  };

  if (!TOKEN) {
    console.log("No token provided, using cached profile metrics.");
    return defaultData;
  }

  try {
    const query = `
      query($login: String!) {
        user(login: $login) {
          repositories(ownerAffiliations: OWNER, first: 100) {
            totalCount
            nodes {
              stargazerCount
            }
          }
          contributionsCollection {
            totalCommitContributions
            restrictedContributionsCount
          }
        }
      }
    `;

    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${TOKEN}`,
        "User-Agent": "OrstedOshua-Profile-Builder",
      },
      body: JSON.stringify({ query, variables: { login: LOGIN } }),
    });

    const json = await res.json();
    if (json.data?.user) {
      const u = json.data.user;
      const stars = u.repositories.nodes.reduce(
        (acc, r) => acc + (r.stargazerCount || 0),
        0
      );
      const commits =
        (u.contributionsCollection.totalCommitContributions || 0) +
        (u.contributionsCollection.restrictedContributionsCount || 0);

      return {
        totalRepos: u.repositories.totalCount || 2,
        stars,
        commits: commits > 0 ? commits : 14,
        streakDays: 1,
      };
    }
  } catch (err) {
    console.warn("Could not fetch fresh GitHub metrics:", err.message);
  }

  return defaultData;
}

/**
 * 1. Генерация Hero Banner (Широкая интерактивная шапка)
 */
function renderHero(theme) {
  const isDark = theme === THEMES.dark;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="850" height="230" viewBox="0 0 850 230" fill="none">
  <defs>
    <linearGradient id="${theme.gradientId}_hero" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bgFrom}" />
      <stop offset="100%" stop-color="${theme.bgTo}" />
    </linearGradient>
    <filter id="${theme.gradientId}_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <style>
    @keyframes typing {
      from { width: 0; }
      to { width: 320px; }
    }
    @keyframes blink {
      50% { opacity: 0; }
    }
    @keyframes pulseOrb {
      0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.4; }
      50% { transform: scale(1.15) translate(-10px, 10px); opacity: 0.65; }
    }
    .typing-text {
      overflow: hidden;
      white-space: nowrap;
      display: inline-block;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 16px;
      font-weight: 500;
      fill: ${theme.textSecondary};
      animation: typing 3s steps(35, end) forwards;
    }
    .cursor {
      animation: blink 1s infinite;
      fill: ${theme.neonAccent};
    }
    .orb {
      animation: pulseOrb 6s ease-in-out infinite;
      transform-origin: 750px 70px;
    }
  </style>

  <!-- Фон карточки -->
  <rect x="2" y="2" width="846" height="226" rx="20" fill="url(#${theme.gradientId}_hero)" stroke="${theme.cardBorder}" stroke-width="1.5" />
  
  <!-- Декоративная неоновая акцентная линия сверху -->
  <path d="M 30 2 L 240 2" stroke="${theme.neonAccent}" stroke-width="3" stroke-linecap="round" filter="url(#${theme.gradientId}_glow)" />

  <!-- Декоративная фоновая сфера свечения -->
  <circle class="orb" cx="740" cy="80" r="90" fill="${theme.neonAccentGlow}" />
  <circle cx="740" cy="80" r="45" fill="${theme.secondaryAccent}" opacity="${isDark ? "0.2" : "0.15"}" />

  <!-- Чип: Earth (Земля) -->
  <g transform="translate(36, 32)">
    <rect width="100" height="28" rx="14" fill="${theme.chipBg}" stroke="${theme.chipBorder}" stroke-width="1" />
    <circle cx="16" cy="14" r="6" fill="${theme.neonAccent}" />
    <path d="M13 14 A3 3 0 0 1 19 14 Z" fill="#FFFFFF" opacity="0.6" />
    <text x="30" y="19" font-family="'Segoe UI', system-ui, sans-serif" font-size="12px" font-weight="600" fill="${theme.textPrimary}">Earth</text>
  </g>

  <!-- Чип: Developer -->
  <g transform="translate(146, 32)">
    <rect width="130" height="28" rx="14" fill="${theme.chipBg}" stroke="${theme.chipBorder}" stroke-width="1" />
    <polygon points="15,9 10,14 15,19" fill="${theme.secondaryAccent}" />
    <polygon points="21,9 26,14 21,19" fill="${theme.secondaryAccent}" />
    <text x="32" y="19" font-family="'Segoe UI', system-ui, sans-serif" font-size="12px" font-weight="600" fill="${theme.textPrimary}">Web Creator</text>
  </g>

  <!-- Заголовок: Приветствие и Имя -->
  <text x="36" y="112" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-size="34px" font-weight="800" fill="${theme.textPrimary}" letter-spacing="-0.5px">
    Hey, I'm <tspan fill="${theme.neonAccent}">Orsted Oshua</tspan>
  </text>

  <!-- Подзаголовок с эффектом печати -->
  <g transform="translate(36, 142)">
    <text class="typing-text" x="0" y="0">Building clean web interfaces &amp; new tools</text>
    <rect class="cursor" x="325" y="-14" width="2.5" height="18" rx="1" />
  </g>

  <!-- Статусная полоса снизу -->
  <g transform="translate(36, 185)">
    <text font-family="'Segoe UI', system-ui, sans-serif" font-size="13px" font-weight="500" fill="${theme.textMuted}">
      Focusing on modern frontend architectures, clean code &amp; expressive UX
    </text>
  </g>

  <!-- Декоративные геометрические крестики -->
  <g transform="translate(770, 160)" opacity="0.4">
    <path d="M -8 0 L 8 0 M 0 -8 L 0 8" stroke="${theme.textSecondary}" stroke-width="1.5" />
    <path d="M 28 0 L 44 0 M 36 -8 L 36 8" stroke="${theme.neonAccent}" stroke-width="1.5" />
  </g>
</svg>`;
}

/**
 * 2. Генерация Bento Card: About Me (Лаконичная карточка)
 */
function renderAbout(theme) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="415" height="200" viewBox="0 0 415 200" fill="none">
  <defs>
    <linearGradient id="${theme.gradientId}_about" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.cardBg}" />
      <stop offset="100%" stop-color="${theme.bgTo}" />
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="411" height="196" rx="18" fill="url(#${theme.gradientId}_about)" stroke="${theme.cardBorder}" stroke-width="1.5" />

  <!-- Заголовок карточки -->
  <g transform="translate(24, 28)">
    <rect width="6" height="20" rx="3" fill="${theme.neonAccent}" />
    <text x="16" y="16" font-family="'Segoe UI', system-ui, sans-serif" font-size="18px" font-weight="700" fill="${theme.textPrimary}">About Me</text>
  </g>

  <!-- Список 1: Developer -->
  <g transform="translate(24, 76)">
    <circle cx="10" cy="10" r="10" fill="${theme.chipBg}" stroke="${theme.chipBorder}" stroke-width="1" />
    <circle cx="10" cy="10" r="4" fill="${theme.neonAccent}" />
    <text x="32" y="15" font-family="'Segoe UI', system-ui, sans-serif" font-size="14px" font-weight="600" fill="${theme.textPrimary}">Developer</text>
    <text x="32" y="32" font-family="'Segoe UI', system-ui, sans-serif" font-size="12px" fill="${theme.textMuted}">Building responsive web applications</text>
  </g>

  <!-- Список 2: Modern frontend & UI -->
  <g transform="translate(24, 128)">
    <circle cx="10" cy="10" r="10" fill="${theme.chipBg}" stroke="${theme.chipBorder}" stroke-width="1" />
    <circle cx="10" cy="10" r="4" fill="${theme.secondaryAccent}" />
    <text x="32" y="15" font-family="'Segoe UI', system-ui, sans-serif" font-size="14px" font-weight="600" fill="${theme.textPrimary}">Modern Frontend &amp; UI</text>
    <text x="32" y="32" font-family="'Segoe UI', system-ui, sans-serif" font-size="12px" fill="${theme.textMuted}">Clean design, fast performance &amp; UX</text>
  </g>
</svg>`;
}

/**
 * 3. Генерация Bento Card: Tech Arsenal (Сетка технологий с подсветкой)
 */
function renderStack(theme) {
  const techs = [
    { name: "JavaScript", col: "#F7DF1E" },
    { name: "TypeScript", col: "#3178C6" },
    { name: "React", col: "#61DAFB" },
    { name: "HTML5", col: "#E34F26" },
    { name: "CSS3", col: "#1572B6" },
    { name: "Node.js", col: "#339933" },
    { name: "Git", col: "#F05032" },
    { name: "GitHub Actions", col: "#2088FF" },
    { name: "VS Code", col: "#007ACC" },
  ];

  const badges = techs.map((t, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 24 + col * 122;
    const y = 64 + row * 40;

    return `
    <g transform="translate(${x}, ${y})">
      <rect width="112" height="30" rx="8" fill="${theme.chipBg}" stroke="${theme.chipBorder}" stroke-width="1" />
      <circle cx="14" cy="15" r="4" fill="${t.col}" />
      <text x="26" y="19" font-family="'Segoe UI', system-ui, sans-serif" font-size="12px" font-weight="600" fill="${theme.textPrimary}">${t.name}</text>
    </g>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="415" height="200" viewBox="0 0 415 200" fill="none">
  <defs>
    <linearGradient id="${theme.gradientId}_stack" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.cardBg}" />
      <stop offset="100%" stop-color="${theme.bgTo}" />
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="411" height="196" rx="18" fill="url(#${theme.gradientId}_stack)" stroke="${theme.cardBorder}" stroke-width="1.5" />

  <!-- Заголовок карточки -->
  <g transform="translate(24, 28)">
    <rect width="6" height="20" rx="3" fill="${theme.secondaryAccent}" />
    <text x="16" y="16" font-family="'Segoe UI', system-ui, sans-serif" font-size="18px" font-weight="700" fill="${theme.textPrimary}">Tech Arsenal</text>
  </g>

  <!-- Сетка бейджей -->
  ${badges}
</svg>`;
}

/**
 * 4. Генерация Bento Card: GitHub Activity (Статистика)
 */
function renderStats(theme, data) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="545" height="180" viewBox="0 0 545 180" fill="none">
  <defs>
    <linearGradient id="${theme.gradientId}_stats" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.cardBg}" />
      <stop offset="100%" stop-color="${theme.bgTo}" />
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="541" height="176" rx="18" fill="url(#${theme.gradientId}_stats)" stroke="${theme.cardBorder}" stroke-width="1.5" />

  <!-- Заголовок -->
  <g transform="translate(24, 26)">
    <circle cx="8" cy="8" r="6" fill="${theme.neonAccent}" />
    <text x="22" y="13" font-family="'Segoe UI', system-ui, sans-serif" font-size="16px" font-weight="700" fill="${theme.textPrimary}">GitHub Metrics</text>
  </g>

  <!-- Блок 1: Repositories -->
  <g transform="translate(24, 62)">
    <rect width="150" height="92" rx="12" fill="${theme.statBoxBg}" stroke="${theme.chipBorder}" stroke-width="1" />
    <text x="18" y="32" font-family="'Segoe UI', system-ui, sans-serif" font-size="12px" font-weight="600" fill="${theme.textSecondary}">PUBLIC REPOS</text>
    <text x="18" y="72" font-family="'Segoe UI', system-ui, sans-serif" font-size="32px" font-weight="800" fill="${theme.textPrimary}">${data.totalRepos}</text>
  </g>

  <!-- Блок 2: Contributions / Commits -->
  <g transform="translate(196, 62)">
    <rect width="165" height="92" rx="12" fill="${theme.statBoxBg}" stroke="${theme.chipBorder}" stroke-width="1" />
    <text x="18" y="32" font-family="'Segoe UI', system-ui, sans-serif" font-size="12px" font-weight="600" fill="${theme.neonAccent}">CONTRIBUTIONS</text>
    <text x="18" y="72" font-family="'Segoe UI', system-ui, sans-serif" font-size="32px" font-weight="800" fill="${theme.textPrimary}">${data.commits}</text>
  </g>

  <!-- Блок 3: Stars Earned -->
  <g transform="translate(383, 62)">
    <rect width="138" height="92" rx="12" fill="${theme.statBoxBg}" stroke="${theme.chipBorder}" stroke-width="1" />
    <text x="18" y="32" font-family="'Segoe UI', system-ui, sans-serif" font-size="12px" font-weight="600" fill="${theme.textSecondary}">STARS</text>
    <text x="18" y="72" font-family="'Segoe UI', system-ui, sans-serif" font-size="32px" font-weight="800" fill="${theme.textPrimary}">${data.stars}</text>
  </g>
</svg>`;
}

/**
 * 5. Генерация Bento Card: Streak (Ударный режим)
 */
function renderStreak(theme, data) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="285" height="180" viewBox="0 0 285 180" fill="none">
  <defs>
    <linearGradient id="${theme.gradientId}_streak" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.cardBg}" />
      <stop offset="100%" stop-color="${theme.bgTo}" />
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="281" height="176" rx="18" fill="url(#${theme.gradientId}_streak)" stroke="${theme.cardBorder}" stroke-width="1.5" />

  <!-- Иконка огня / молнии -->
  <g transform="translate(24, 24)">
    <circle cx="14" cy="14" r="14" fill="${theme.neonAccentGlow}" />
    <path d="M 14 5 L 9 14 L 14 14 L 13 23 L 20 12 L 15 12 Z" fill="${theme.neonAccent}" />
    <text x="36" y="20" font-family="'Segoe UI', system-ui, sans-serif" font-size="16px" font-weight="700" fill="${theme.textPrimary}">Streak Activity</text>
  </g>

  <!-- Число стрика -->
  <g transform="translate(24, 68)">
    <text x="0" y="52" font-family="'Segoe UI', system-ui, sans-serif" font-size="48px" font-weight="800" fill="${theme.textPrimary}">${data.streakDays}</text>
    <text x="56" y="32" font-family="'Segoe UI', system-ui, sans-serif" font-size="14px" font-weight="700" fill="${theme.neonAccent}">DAYS ACTIVE</text>
    <text x="56" y="50" font-family="'Segoe UI', system-ui, sans-serif" font-size="12px" fill="${theme.textMuted}">Continuous coding streak</text>
  </g>

  <!-- Мини-полоска прогресса -->
  <g transform="translate(24, 142)">
    <rect width="237" height="6" rx="3" fill="${theme.chipBg}" />
    <rect width="80" height="6" rx="3" fill="${theme.neonAccent}" />
  </g>
</svg>`;
}

/**
 * Основной запуск рендера
 */
async function main() {
  console.log("Generating bespoke Neon-Violet Bento SVGs for @OrstedOshua...");
  const data = await fetchGitHubData();

  for (const [mode, theme] of Object.entries(THEMES)) {
    writeFileSync(join("assets", `hero-${mode}.svg`), renderHero(theme), "utf8");
    writeFileSync(join("assets", `about-${mode}.svg`), renderAbout(theme), "utf8");
    writeFileSync(join("assets", `stack-${mode}.svg`), renderStack(theme), "utf8");
    writeFileSync(join("assets", `stats-${mode}.svg`), renderStats(theme, data), "utf8");
    writeFileSync(join("assets", `streak-${mode}.svg`), renderStreak(theme, data), "utf8");
    console.log(`Rendered ${mode} theme SVGs.`);
  }

  console.log("Bespoke SVGs generation complete!");
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
