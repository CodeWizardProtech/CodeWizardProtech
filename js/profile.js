import { escapeHtml, formatUrl, formatNumber, formatDate, setHtml } from './utils.js';

// Profile header and metrics only. No charts.
export function renderProfile(user) {
  const blogUrl = formatUrl(user.blog);

  setHtml(
    '#profile',
    `
    <img class="avatar" src="${user.avatar_url}" alt="Avatar of ${escapeHtml(user.name || user.login)}" loading="eager" decoding="async">
    <div class="profile-info">
      <h1>${escapeHtml(user.name || user.login)}</h1>
      <p class="username">@${escapeHtml(user.login)}</p>
      <p class="bio">${escapeHtml(user.bio || 'GitHub Developer')}</p>
      <div class="profile-meta">
        ${user.location ? `<span>📍 ${escapeHtml(user.location)}</span>` : ''}
        ${user.company ? `<span>🏢 ${escapeHtml(user.company)}</span>` : ''}
        <span>📅 Since ${formatDate(user.created_at)}</span>
      </div>
      <div class="links">
        <a class="btn btn-primary" href="${user.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        ${blogUrl ? `<a class="btn btn-secondary" href="${blogUrl}" target="_blank" rel="noopener noreferrer">Website/Blog</a>` : ''}
        ${user.twitter_username ? `<a class="btn btn-secondary" href="https://x.com/${escapeHtml(user.twitter_username)}" target="_blank" rel="noopener noreferrer">X / Twitter</a>` : ''}
        <a class="btn btn-secondary" href="https://github.com/DedicatedDevExpert" target="_blank" rel="noopener noreferrer">🐙 GitHub Alt</a>
        <a class="btn btn-secondary" href="https://www.linkedin.com/in/marcosoliveiraso/" target="_blank" rel="noopener noreferrer">💼 LinkedIn</a>
        <a class="btn btn-secondary" href="https://www.instagram.com/marcos.agenteia/" target="_blank" rel="noopener noreferrer">📸 Instagram</a>
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
      card('⭐', 'Stars received', formatNumber(metrics.totalStars)),
      card('🍴', 'Total forks', formatNumber(metrics.totalForks)),
      card('💻', 'Top language', escapeHtml(metrics.topLanguage)),
      card('📦', 'Public repositories', formatNumber(metrics.publicRepos)),
      card('📝', 'Public gists', formatNumber(metrics.gists)),
      card('👥', 'Followers', formatNumber(metrics.followers), `Following ${formatNumber(metrics.following)}`),
      card('🎂', 'Account created', formatDate(metrics.createdAt)),
      card('🔄', 'Profile updated', formatDate(metrics.profileUpdatedAt)),
      card(
        '🏆',
        'Most popular repository',
        escapeHtml(metrics.mostPopular?.name || '—'),
        metrics.mostPopular ? `⭐ ${formatNumber(metrics.mostPopular.stargazers_count)}` : '',
      ),
      card(
        '⏱️',
        'Recently updated',
        escapeHtml(metrics.mostRecent?.name || '—'),
        metrics.mostRecent ? formatDate(metrics.mostRecent.updated_at) : '',
      ),
    ].join(''),
  );
}
