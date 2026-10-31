// @ts-check
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

mkdirSync("assets", { recursive: true });

const LOGIN = "OrstedOshua";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

// Палитры Material 3 в мягких пастельных тонах (без едкого неона)
const THEMES = {
  dark: {
    bgCard: "#1D1A24",        // Мягкий матовый баклажан
    borderCard: "#2E2A38",    // Еле заметная нежная граница
    stripeBg: "#272430",      // Монолитная плашка для элементов внутри
    chipBg: "#2E2A3A",        // Мягкий пилл
    chipText: "#EDE7F6",
    textPrimary: "#EDE7F6",   // Мягкий молочный
    textSecondary: "#C5BBD9", // Пастельная лаванда
    textMuted: "#8E869E",     // Приглушенный лавандовый
    accentPink: "#F48FB1",    // Пудрово-розовый / пыльная роза (акцент)
    accentPinkTonal: "#3B2633", // Тональная подложка под акцент
    accentPurple: "#CE93D8",  // Нежный пастельный пурпур
    tileEmpty: "#2C2836",     // Пустой день в календаре
    tileActive: "#F48FB1",    // Активный день в календаре
    gradStart: "#1E1A26",
    gradEnd: "#191622",
  },
  light: {
    bgCard: "#FFFFFF",        // Чистый белый
    borderCard: "#E7E0EC",    // Мягкий контур
    stripeBg: "#F7F2FA",      // Нежная лавандово-кремовая полоса
    chipBg: "#ECE6F0",        // Пастельный пилл
    chipText: "#1D192B",
    textPrimary: "#1D192B",   // Глубокий баклажан
    textSecondary: "#49454F", // Нейтральный серый
    textMuted: "#79747E",     // Приглушенный
    accentPink: "#D81B60",    // Ягодная роза (акцент)
    accentPinkTonal: "#FCE4EC",
    accentPurple: "#7B1FA2",  // Пастельный пурпур
    tileEmpty: "#E7E0EC",
    tileActive: "#D81B60",
    gradStart: "#FFFFFF",
    gradEnd: "#FAF6FD",
  },
};

/**
 * Получение метрик через GitHub GraphQL API
 */
async function fetchGitHubData() {
  const defaultData = {
    totalRepos: 2,
    stars: 0,
    commits: 14,
    followers: 0,
    streakDays: 1,
    languages: [
      { name: "JavaScript", percent: 69.7, color: "#F7DF1E" },
      { name: "CSS", percent: 26.1, color: "#1572B6" },
      { name: "HTML", percent: 4.2, color: "#E34F26" },
    ],
  };

  if (!TOKEN) {
    return defaultData;
  }

  try {
    const query = `
      query($login: String!) {
        user(login: $login) {
          followers { totalCount }
          repositories(ownerAffiliations: OWNER, first: 100) {
            totalCount
            nodes {
              stargazerCount
              primaryLanguage { name }
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
        "User-Agent": "OrstedOshua-Profile",
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
        followers: u.followers.totalCount || 0,
        streakDays: 1,
        languages: defaultData.languages,
      };
    }
  } catch (err) {
    console.warn("Using fallback GitHub data:", err.message);
  }

  return defaultData;
}

/**
 * 1. Hero Header (Широкий баннер в стиле Material 3, 840x240)
 */
function renderHero(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="240" viewBox="0 0 840 240" fill="none">
  <defs>
    <linearGradient id="hero_bg_${t.accentPink.replace('#','')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.gradStart}" />
      <stop offset="100%" stop-color="${t.gradEnd}" />
    </linearGradient>
  </defs>

  <style>
    @keyframes typing {
      from { width: 0; }
      to { width: 330px; }
    }
    @keyframes blink { 50% { opacity: 0; } }
    .hero-type {
      overflow: hidden;
      white-space: nowrap;
      display: inline-block;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 16px;
      font-weight: 500;
      fill: ${t.textSecondary};
      animation: typing 3s steps(35, end) forwards;
    }
    .hero-cursor {
      animation: blink 1s infinite;
      fill: ${t.accentPink};
    }
  </style>

  <!-- Карточка -->
  <rect width="840" height="240" rx="24" fill="url(#hero_bg_${t.accentPink.replace('#','')})" stroke="${t.borderCard}" stroke-width="1.5" />

  <!-- Аватар-бейдж в форме Material 3 Squircle -->
  <g transform="translate(42, 42)">
    <rect width="156" height="156" rx="42" fill="${t.stripeBg}" stroke="${t.borderCard}" stroke-width="1.5" />
    <circle cx="78" cy="78" r="42" fill="${t.accentPinkTonal}" />
    <!-- Стильный монограммный глиф -->
    <text x="78" y="93" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="44px" font-weight="800" fill="${t.accentPink}">O</text>
  </g>

  <!-- Информационная часть -->
  <g transform="translate(228, 48)">
    <!-- Приветствие -->
    <text x="0" y="24" font-family="'Segoe UI', system-ui, sans-serif" font-size="16px" font-weight="600" fill="${t.accentPink}">
      Hey there! I'm
    </text>

    <!-- Имя -->
    <text x="0" y="70" font-family="'Segoe UI', system-ui, sans-serif" font-size="40px" font-weight="800" fill="${t.textPrimary}" letter-spacing="-0.5px">
      Orsted Oshua
    </text>

    <!-- Подзаголовок с печатным эффектом -->
    <g transform="translate(0, 102)">
      <text class="hero-type" x="0" y="0">Software developer &amp; web creator.</text>
      <rect class="hero-cursor" x="335" y="-14" width="2.5" height="18" rx="1" />
    </g>

    <!-- Пиллы: Earth и Стек -->
    <g transform="translate(0, 126)">
      <!-- Earth Chip -->
      <rect width="96" height="32" rx="16" fill="${t.chipBg}" />
      <circle cx="16" cy="16" r="6" fill="${t.accentPink}" />
      <text x="30" y="21" font-family="'Segoe UI', system-ui, sans-serif" font-size="13px" font-weight="600" fill="${t.chipText}">Earth</text>

      <!-- Stack Chip -->
      <g transform="translate(108, 0)">
        <rect width="210" height="32" rx="16" fill="${t.chipBg}" />
        <polygon points="16,11 11,16 16,21" fill="${t.textMuted}" />
        <polygon points="22,11 27,16 22,21" fill="${t.textMuted}" />
        <text x="34" y="21" font-family="'Segoe UI', system-ui, sans-serif" font-size="13px" font-weight="600" fill="${t.chipText}">JavaScript · TypeScript · Web</text>
      </g>
    </g>
  </g>
</svg>`;
}

/**
 * 2. About Me (Полноразмерная карточка с мягкими плашками-полосами, 840x200)
 */
function renderAbout(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="200" viewBox="0 0 840 200" fill="none">
  <!-- Карточка -->
  <rect width="840" height="200" rx="24" fill="${t.bgCard}" stroke="${t.borderCard}" stroke-width="1.5" />

  <!-- Заголовок секции -->
  <g transform="translate(36, 32)">
    <circle cx="10" cy="10" r="10" fill="${t.accentPinkTonal}" />
    <circle cx="10" cy="10" r="4" fill="${t.accentPink}" />
    <text x="28" y="16" font-family="'Segoe UI', system-ui, sans-serif" font-size="18px" font-weight="700" fill="${t.textPrimary}">About me</text>
  </g>

  <!-- Полоса 1: Developer -->
  <g transform="translate(36, 68)">
    <rect width="768" height="34" rx="12" fill="${t.stripeBg}" />
    <circle cx="20" cy="17" r="4" fill="${t.accentPink}" />
    <text x="34" y="22" font-family="'Segoe UI', system-ui, sans-serif" font-size="14px" font-weight="700" fill="${t.textPrimary}">Developer</text>
    <text x="110" y="22" font-family="'Segoe UI', system-ui, sans-serif" font-size="14px" font-weight="500" fill="${t.textSecondary}">— passionate about building modern web applications</text>
  </g>

  <!-- Полоса 2: Modern frontend & UI -->
  <g transform="translate(36, 110)">
    <rect width="768" height="34" rx="12" fill="${t.stripeBg}" />
    <circle cx="20" cy="17" r="4" fill="${t.accentPurple}" />
    <text x="34" y="22" font-family="'Segoe UI', system-ui, sans-serif" font-size="14px" font-weight="700" fill="${t.textPrimary}">Modern frontend &amp; UI</text>
    <text x="195" y="22" font-family="'Segoe UI', system-ui, sans-serif" font-size="14px" font-weight="500" fill="${t.textSecondary}">— creating responsive, clean and expressive interfaces</text>
  </g>

  <!-- Полоса 3: Learning new technologies -->
  <g transform="translate(36, 152)">
    <rect width="768" height="34" rx="12" fill="${t.stripeBg}" />
    <circle cx="20" cy="17" r="4" fill="${t.accentPink}" />
    <text x="34" y="22" font-family="'Segoe UI', system-ui, sans-serif" font-size="14px" font-weight="700" fill="${t.textPrimary}">Learning new technologies</text>
    <text x="228" y="22" font-family="'Segoe UI', system-ui, sans-serif" font-size="14px" font-weight="500" fill="${t.textSecondary}">— continuously exploring tools, clean code and architecture</text>
  </g>
</svg>`;
}

/**
 * 3. Tech Stack (Витрина технологий в стиле Material 3, 840x220)
 */
function renderStack(t) {
  const core = [
    { name: "JavaScript", col: "#F7DF1E" },
    { name: "TypeScript", col: "#3178C6" },
    { name: "React", col: "#61DAFB" },
    { name: "HTML5", col: "#E34F26" },
    { name: "CSS3", col: "#1572B6" },
  ];

  const tools = [
    { name: "Git", col: "#F05032" },
    { name: "GitHub", col: "#8E869E" },
    { name: "Node.js", col: "#339933" },
    { name: "GitHub Actions", col: "#2088FF" },
    { name: "VS Code", col: "#007ACC" },
  ];

  function renderPills(list, startX, startY) {
    let curX = startX;
    return list.map(item => {
      const width = item.name.length * 8 + 38;
      const x = curX;
      curX += width + 10;
      return `
      <g transform="translate(${x}, ${startY})">
        <rect width="${width}" height="32" rx="16" fill="${t.stripeBg}" />
        <circle cx="15" cy="16" r="4" fill="${item.col}" />
        <text x="26" y="21" font-family="'Segoe UI', system-ui, sans-serif" font-size="13px" font-weight="600" fill="${t.textPrimary}">${item.name}</text>
      </g>`;
    }).join("");
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="220" viewBox="0 0 840 220" fill="none">
  <!-- Карточка -->
  <rect width="840" height="220" rx="24" fill="${t.bgCard}" stroke="${t.borderCard}" stroke-width="1.5" />

  <!-- Заголовок секции -->
  <g transform="translate(36, 32)">
    <circle cx="10" cy="10" r="10" fill="${t.accentPinkTonal}" />
    <circle cx="10" cy="10" r="4" fill="${t.accentPink}" />
    <text x="28" y="16" font-family="'Segoe UI', system-ui, sans-serif" font-size="18px" font-weight="700" fill="${t.textPrimary}">Tech stack</text>
  </g>

  <!-- Подзаголовок 1: CORE & WEB -->
  <text x="36" y="78" font-family="'Segoe UI', system-ui, sans-serif" font-size="11px" font-weight="700" fill="${t.textMuted}" letter-spacing="1px">CORE &amp; WEB</text>
  ${renderPills(core, 36, 90)}

  <!-- Подзаголовок 2: TOOLS & ECOSYSTEM -->
  <text x="36" y="148" font-family="'Segoe UI', system-ui, sans-serif" font-size="11px" font-weight="700" fill="${t.textMuted}" letter-spacing="1px">TOOLS &amp; ECOSYSTEM</text>
  ${renderPills(tools, 36, 160)}
</svg>`;
}

/**
 * 4. GitHub Activity (С 21-дневным календарём и шкалой языков, 840x260)
 */
function renderStats(t, data) {
  // Генерация 21 дня календаря (3 строки по 7 дней)
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  const headerDays = weekdays.map((d, i) => `
    <text x="${i * 30 + 12}" y="12" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="11px" font-weight="600" fill="${t.textMuted}">${d}</text>
  `).join("");

  // 21 день (дни месяца с 11 по 31)
  const days = [];
  for (let i = 0; i < 21; i++) {
    const dayNum = 11 + i;
    const col = i % 7;
    const row = Math.floor(i / 7);
    const x = col * 30;
    const y = 22 + row * 30;
    const isActive = (i === 20 || i === 19 || i === 12); // Активные дни коммитов
    const bg = isActive ? t.tileActive : t.tileEmpty;
    const numColor = isActive ? "#FFFFFF" : t.textMuted;

    days.push(`
      <g transform="translate(${x}, ${y})">
        <rect width="24" height="24" rx="8" fill="${bg}" />
        <text x="12" y="16" text-anchor="middle" font-family="'Segoe UI', system-ui, sans-serif" font-size="11px" font-weight="700" fill="${numColor}">${dayNum}</text>
      </g>
    `);
  }

  // Расчет полосы языков
  let currentX = 0;
  const barWidth = 768;
  const segments = data.languages.map(lang => {
    const w = (barWidth * lang.percent) / 100;
    const rect = `<rect x="${currentX}" y="0" width="${w}" height="10" rx="5" fill="${lang.color}" />`;
    currentX += w + 2;
    return rect;
  }).join("");

  const legend = data.languages.map((lang, idx) => `
    <g transform="translate(${idx * 160}, 0)">
      <circle cx="5" cy="5" r="4" fill="${lang.color}" />
      <text x="15" y="9" font-family="'Segoe UI', system-ui, sans-serif" font-size="12px" font-weight="600" fill="${t.textPrimary}">${lang.name} <tspan fill="${t.textMuted}">${lang.percent}%</tspan></text>
    </g>
  `).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="260" viewBox="0 0 840 260" fill="none">
  <!-- Карточка -->
  <rect width="840" height="260" rx="24" fill="${t.bgCard}" stroke="${t.borderCard}" stroke-width="1.5" />

  <!-- Заголовок секции -->
  <g transform="translate(36, 28)">
    <circle cx="10" cy="10" r="10" fill="${t.accentPinkTonal}" />
    <circle cx="10" cy="10" r="4" fill="${t.accentPink}" />
    <text x="28" y="16" font-family="'Segoe UI', system-ui, sans-serif" font-size="18px" font-weight="700" fill="${t.textPrimary}">GitHub activity</text>
  </g>

  <!-- Левая колонка: 4 плашки метрик (2x2) -->
  <g transform="translate(36, 64)">
    <!-- Stars -->
    <g transform="translate(0, 0)">
      <rect width="180" height="52" rx="14" fill="${t.stripeBg}" />
      <text x="18" y="24" font-family="'Segoe UI', system-ui, sans-serif" font-size="11px" font-weight="600" fill="${t.textMuted}">Stars earned</text>
      <text x="18" y="44" font-family="'Segoe UI', system-ui, sans-serif" font-size="18px" font-weight="800" fill="${t.textPrimary}">${data.stars}</text>
    </g>
    <!-- Contributions -->
    <g transform="translate(192, 0)">
      <rect width="180" height="52" rx="14" fill="${t.stripeBg}" />
      <text x="18" y="24" font-family="'Segoe UI', system-ui, sans-serif" font-size="11px" font-weight="600" fill="${t.textMuted}">Contributions</text>
      <text x="18" y="44" font-family="'Segoe UI', system-ui, sans-serif" font-size="18px" font-weight="800" fill="${t.accentPink}">${data.commits}</text>
    </g>
    <!-- Public Repos -->
    <g transform="translate(0, 60)">
      <rect width="180" height="52" rx="14" fill="${t.stripeBg}" />
      <text x="18" y="24" font-family="'Segoe UI', system-ui, sans-serif" font-size="11px" font-weight="600" fill="${t.textMuted}">Public repos</text>
      <text x="18" y="44" font-family="'Segoe UI', system-ui, sans-serif" font-size="18px" font-weight="800" fill="${t.textPrimary}">${data.totalRepos}</text>
    </g>
    <!-- Followers -->
    <g transform="translate(192, 60)">
      <rect width="180" height="52" rx="14" fill="${t.stripeBg}" />
      <text x="18" y="24" font-family="'Segoe UI', system-ui, sans-serif" font-size="11px" font-weight="600" fill="${t.textMuted}">Followers</text>
      <text x="18" y="44" font-family="'Segoe UI', system-ui, sans-serif" font-size="18px" font-weight="800" fill="${t.textPrimary}">${data.followers}</text>
    </g>
  </g>

  <!-- Правая колонка: Календарь на 21 день -->
  <g transform="translate(480, 52)">
    <text x="0" y="8" font-family="'Segoe UI', system-ui, sans-serif" font-size="12px" font-weight="600" fill="${t.textSecondary}">Last 21 days</text>
    <g transform="translate(0, 16)">
      ${headerDays}
      ${days.join("")}
    </g>
  </g>

  <!-- Нижняя часть: Языковая шкала -->
  <g transform="translate(36, 196)">
    <text x="0" y="-8" font-family="'Segoe UI', system-ui, sans-serif" font-size="12px" font-weight="600" fill="${t.textSecondary}">Languages across my repositories</text>
    <g transform="translate(0, 0)">
      ${segments}
    </g>
    <g transform="translate(0, 26)">
      ${legend}
    </g>
  </g>
</svg>`;
}

/**
 * 5. Streak (Широкая карточка непрерывного режима, 840x130)
 */
function renderStreak(t, data) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="130" viewBox="0 0 840 130" fill="none">
  <!-- Карточка -->
  <rect width="840" height="130" rx="24" fill="${t.bgCard}" stroke="${t.borderCard}" stroke-width="1.5" />

  <!-- Заголовок секции -->
  <g transform="translate(36, 26)">
    <circle cx="10" cy="10" r="10" fill="${t.accentPinkTonal}" />
    <circle cx="10" cy="10" r="4" fill="${t.accentPink}" />
    <text x="28" y="16" font-family="'Segoe UI', system-ui, sans-serif" font-size="18px" font-weight="700" fill="${t.textPrimary}">Streak</text>
  </g>

  <!-- Блок текущего стрика -->
  <g transform="translate(36, 62)">
    <rect width="374" height="48" rx="14" fill="${t.stripeBg}" />
    <!-- Иконка огня -->
    <circle cx="24" cy="24" r="14" fill="${t.accentPinkTonal}" />
    <path d="M 24 16 L 20 23 L 24 23 L 23 31 L 28 22 L 25 22 Z" fill="${t.accentPink}" />
    <text x="48" y="29" font-family="'Segoe UI', system-ui, sans-serif" font-size="18px" font-weight="800" fill="${t.accentPink}">${data.streakDays} <tspan font-size="13px" font-weight="600" fill="${t.textPrimary}">days current streak</tspan></text>
  </g>

  <!-- Блок лучшего стрика -->
  <g transform="translate(430, 62)">
    <rect width="374" height="48" rx="14" fill="${t.stripeBg}" />
    <!-- Иконка трофея -->
    <circle cx="24" cy="24" r="14" fill="${t.chipBg}" />
    <polygon points="19,18 29,18 27,25 21,25" fill="${t.accentPurple}" />
    <rect x="23" y="25" width="2" height="4" fill="${t.accentPurple}" />
    <rect x="21" y="29" width="6" height="2" fill="${t.accentPurple}" />
    <text x="48" y="29" font-family="'Segoe UI', system-ui, sans-serif" font-size="18px" font-weight="800" fill="${t.textPrimary}">${data.streakDays} <tspan font-size="13px" font-weight="600" fill="${t.textSecondary}">days longest this year</tspan></text>
  </g>
</svg>`;
}

/**
 * Главный запуск генерации
 */
async function main() {
  console.log("Rendering authentic Material 3 pastel SVG cards for @OrstedOshua...");
  const data = await fetchGitHubData();

  for (const [mode, t] of Object.entries(THEMES)) {
    writeFileSync(join("assets", `m3-hero-${mode}.svg`), renderHero(t), "utf8");
    writeFileSync(join("assets", `m3-about-${mode}.svg`), renderAbout(t), "utf8");
    writeFileSync(join("assets", `m3-stack-${mode}.svg`), renderStack(t), "utf8");
    writeFileSync(join("assets", `m3-stats-${mode}.svg`), renderStats(t, data), "utf8");
    writeFileSync(join("assets", `m3-streak-${mode}.svg`), renderStreak(t, data), "utf8");
    console.log(`Rendered Material 3 ${mode} theme cards.`);
  }

  console.log("All Material 3 cards generated successfully!");
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
