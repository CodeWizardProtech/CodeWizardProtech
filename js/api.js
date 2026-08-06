import { CONFIG } from './config.js';

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Profile not found');
    if (res.status === 403) throw new Error('GitHub API rate limit reached. Please try again in a few minutes.');
    throw new Error(`Error fetching data (${res.status})`);
  }

  return res.json();
}

// Somente comunicação com o GitHub.
export function getUser() {
  return getJson(`${CONFIG.apiBase}/users/${CONFIG.username}`);
}

export function getRepos() {
  return getJson(`${CONFIG.apiBase}/users/${CONFIG.username}/repos?sort=updated&per_page=100`);
}

export async function getProfileData() {
  const [user, repos] = await Promise.all([getUser(), getRepos()]);
  return { user, repos: Array.isArray(repos) ? repos : [], updatedAt: new Date() };
}
