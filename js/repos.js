import { CONFIG } from './config.js';
import { escapeHtml, formatNumber, formatDate, languageColor, setHtml } from './utils.js';

// Repository list only. No charts.
export function topRepos(repos, limit = CONFIG.topReposLimit) {
  return [...repos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, limit);
}

export function renderRepos(repos) {
  const list = topRepos(repos);

  if (list.length === 0) {
    setHtml('#repos', '<p class="empty">No public repositories found.</p>');
    return;
  }

  setHtml(
    '#repos',
    list
      .map(
        (repo, i) => `
      <a class="repo" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
        <div class="repo-name">${escapeHtml(repo.name)}</div>
        <p class="repo-desc">${escapeHtml(repo.description || 'No description')}</p>
        <div class="repo-meta">
          <span>⭐ ${formatNumber(repo.stargazers_count)}</span>
          <span>🍴 ${formatNumber(repo.forks_count)}</span>
          ${repo.language ? `<span><i class="dot" style="background:${languageColor(repo.language, i)}"></i>${escapeHtml(repo.language)}</span>` : ''}
          <span>${formatDate(repo.updated_at)}</span>
        </div>
      </a>
    `,
      )
      .join(''),
  );
}
