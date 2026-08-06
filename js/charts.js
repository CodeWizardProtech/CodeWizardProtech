import { CONFIG } from './config.js';
import { escapeHtml, formatNumber, languageColor, monthLabel, setHtml } from './utils.js';

// Charts only (pure SVG, no external libraries).

function polar(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(cx, cy, r, inner, start, end) {
  const [x1, y1] = polar(cx, cy, r, start);
  const [x2, y2] = polar(cx, cy, r, end);
  const [x3, y3] = polar(cx, cy, inner, end);
  const [x4, y4] = polar(cx, cy, inner, start);
  const large = end - start > 180 ? 1 : 0;
  return `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`;
}

export function languageData(repos) {
  const count = {};
  repos.forEach((r) => {
    if (r.language) count[r.language] = (count[r.language] || 0) + 1;
  });
  return Object.entries(count)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

// 1) Pizza — linguagens
export function renderPieChart(repos) {
  const data = languageData(repos);
  const total = data.reduce((s, d) => s + d.value, 0);

  if (!total) {
    setHtml('#chart-languages', '<p class="empty">No languages detected.</p>');
    return;
  }

  let angle = 0;
  const slices = data
    .map((d, i) => {
      const sweep = (d.value / total) * 360;
      const path = arcPath(110, 110, 100, 58, angle, angle + (sweep === 360 ? 359.99 : sweep));
      angle += sweep;
      return `<path d="${path}" fill="${languageColor(d.name, i)}"><title>${escapeHtml(d.name)}: ${d.value}</title></path>`;
    })
    .join('');

  const legend = data
    .map(
      (d, i) => `
      <li>
        <i class="dot" style="background:${languageColor(d.name, i)}"></i>
        <span class="legend-name">${escapeHtml(d.name)}</span>
        <span class="legend-value">${Math.round((d.value / total) * 100)}%</span>
      </li>`,
    )
    .join('');

  setHtml(
    '#chart-languages',
    `
    <div class="pie-wrap">
      <svg viewBox="0 0 220 220" role="img" aria-label="Language distribution">
        ${slices}
        <text x="110" y="104" class="pie-center-value">${total}</text>
        <text x="110" y="126" class="pie-center-label">repos</text>
      </svg>
      <ul class="legend">${legend}</ul>
    </div>
  `,
  );
}

// 2) Barras — top repositórios por estrelas
export function renderBarChart(repos) {
  const data = [...repos]
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 5)
    .map((r) => ({ name: r.name, value: r.stargazers_count || 0 }));

  if (data.length === 0) {
    setHtml('#chart-stars', '<p class="empty">No repositories to display.</p>');
    return;
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  setHtml(
    '#chart-stars',
    `<ul class="bars">${data
      .map(
        (d) => `
        <li>
          <span class="bar-label" title="${escapeHtml(d.name)}">${escapeHtml(d.name)}</span>
          <span class="bar-track"><span class="bar-fill" style="width:${Math.max((d.value / max) * 100, 2)}%"></span></span>
          <span class="bar-value">${formatNumber(d.value)}</span>
        </li>`,
      )
      .join('')}</ul>`,
  );
}

export function activityData(repos, months = CONFIG.activityMonths) {
  const now = new Date();
  const buckets = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d), value: 0 });
  }

  repos.forEach((r) => {
    const d = new Date(r.updated_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.value += 1;
  });

  return buckets;
}

// 3) Linha — atividade dos repositórios (updated_at)
export function renderLineChart(repos) {
  const data = activityData(repos);
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 520;
  const h = 200;
  const padX = 32;
  const padY = 24;
  const stepX = (w - padX * 2) / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => [padX + i * stepX, h - padY - (d.value / max) * (h - padY * 2)]);
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${points[points.length - 1][0].toFixed(1)} ${h - padY} L${points[0][0].toFixed(1)} ${h - padY} Z`;

  const grid = [0, 0.25, 0.5, 0.75, 1]
    .map((p) => `<line x1="${padX}" x2="${w - padX}" y1="${padY + p * (h - padY * 2)}" y2="${padY + p * (h - padY * 2)}" class="grid" />`)
    .join('');

  const dots = points
    .map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4"><title>${data[i].label}: ${data[i].value}</title></circle>`)
    .join('');

  const labels = data
    .map((d, i) => `<text x="${(padX + i * stepX).toFixed(1)}" y="${h - 4}" text-anchor="middle" class="axis">${escapeHtml(d.label)}</text>`)
    .join('');

  setHtml(
    '#chart-activity',
    `<svg viewBox="0 0 ${w} ${h}" class="line-chart" role="img" aria-label="Repository activity by month">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#22d3ee" stop-opacity="0" />
        </linearGradient>
      </defs>
      ${grid}
      <path d="${area}" fill="url(#areaFill)" />
      <path d="${line}" class="line" />
      ${dots}
      ${labels}
    </svg>`,
  );
}

export function renderCharts(repos) {
  renderPieChart(repos);
  renderBarChart(repos);
  renderLineChart(repos);
}
