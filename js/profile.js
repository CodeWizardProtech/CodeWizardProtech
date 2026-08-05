import { escapeHtml, formatUrl, formatNumber, formatDate, setHtml } from './utils.js';

// Somente o cabeçalho do perfil e os indicadores. Nada de gráficos.
export function renderProfile(user) {
  const blogUrl = formatUrl(user.blog);

  setHtml(
    '#profile',
    `
    <img class="avatar" src="${user.avatar_url}" alt="Avatar de ${escapeHtml(user.name || user.login)}" loading="eager" decoding="async">
    <div class="profile-info">
      <h1>${escapeHtml(user.name || user.login)}</h1>
      <p class="username">@${escapeHtml(user.login)}</p>
      <p class="bio">${escapeHtml(user.bio || 'Desenvolvedor(a) no GitHub')}</p>
      <div class="profile-meta">
        ${user.location ? `<span>📍 ${escapeHtml(user.location)}</span>` : ''}
        ${user.company ? `<span>🏢 ${escapeHtml(user.company)}</span>` : ''}
        <span>📅 Desde ${formatDate(user.created_at)}</span>
      </div>
      <div class="links">
        <a class="btn btn-primary" href="${user.html_url}" target="_blank" rel="noopener noreferrer">Ver no GitHub</a>
        ${blogUrl ? `<a class="btn btn-secondary" href="${blogUrl}" target="_blank" rel="noopener noreferrer">Site/Blog</a>` : ''}
        ${user.twitter_username ? `<a class="btn btn-secondary" href="https://x.com/${escapeHtml(user.twitter_username)}" target="_blank" rel="noopener noreferrer">X / Twitter</a>` : ''}
      </div>
    </div>
  `,
  );
}

export function computeMetrics(user, repos) {
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

  const langCount = {};
  repos.forEach((r) => {
    if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
  });
  const topLanguage = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const mostPopular = [...repos].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))[0];
  const mostRecent = [...repos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

  return {
    totalStars,
    totalForks,
    topLanguage,
    publicRepos: user.public_repos,
    gists: user.public_gists,
    createdAt: user.created_at,
    profileUpdatedAt: user.updated_at,
    mostPopular,
    mostRecent,
    followers: user.followers,
    following: user.following,
  };
}

function card(icon, label, value, hint = '') {
  return `
    <div class="metric">
      <div class="metric-icon">${icon}</div>
      <div class="metric-body">
        <div class="metric-value">${value}</div>
        <div class="metric-label">${label}</div>
        ${hint ? `<div class="metric-hint">${hint}</div>` : ''}
      </div>
    </div>
  `;
}

export function renderMetrics(metrics) {
  setHtml(
    '#metrics',
    [
      card('⭐', 'Estrelas recebidas', formatNumber(metrics.totalStars)),
      card('🍴', 'Total de forks', formatNumber(metrics.totalForks)),
      card('💻', 'Linguagem mais usada', escapeHtml(metrics.topLanguage)),
      card('📦', 'Repositórios públicos', formatNumber(metrics.publicRepos)),
      card('📝', 'Gists públicos', formatNumber(metrics.gists)),
      card('👥', 'Seguidores', formatNumber(metrics.followers), `Seguindo ${formatNumber(metrics.following)}`),
      card('🎂', 'Conta criada em', formatDate(metrics.createdAt)),
      card('🔄', 'Perfil atualizado', formatDate(metrics.profileUpdatedAt)),
      card(
        '🏆',
        'Repositório mais popular',
        escapeHtml(metrics.mostPopular?.name || '—'),
        metrics.mostPopular ? `⭐ ${formatNumber(metrics.mostPopular.stargazers_count)}` : '',
      ),
      card(
        '⏱️',
        'Atualizado recentemente',
        escapeHtml(metrics.mostRecent?.name || '—'),
        metrics.mostRecent ? formatDate(metrics.mostRecent.updated_at) : '',
      ),
    ].join(''),
  );
}
