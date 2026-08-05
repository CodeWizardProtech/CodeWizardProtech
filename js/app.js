import { CONFIG } from './config.js';
import { getProfileData } from './api.js';
import { formatTime, el } from './utils.js';
import { renderProfile, computeMetrics, renderMetrics } from './profile.js';
import { renderRepos } from './repos.js';
import { renderCharts } from './charts.js';

// Orquestra tudo. Praticamente sem HTML.
let timer = null;

function setStatus(state, text) {
  const node = el('#status');
  if (!node) return;
  node.dataset.state = state;
  node.textContent = text;
}

function showError(message) {
  const node = el('#error');
  if (!node) return;
  node.hidden = false;
  node.textContent = `Erro ao carregar dados: ${message}`;
}

function hideError() {
  const node = el('#error');
  if (node) node.hidden = true;
}

async function update({ silent = false } = {}) {
  if (!silent) setStatus('loading', 'Carregando dados...');

  try {
    const { user, repos, updatedAt } = await getProfileData();

    renderProfile(user);
    renderMetrics(computeMetrics(user, repos));
    renderRepos(repos);
    renderCharts(repos);

    document.body.classList.add('ready');
    hideError();
    setStatus('ok', `Atualizado às ${formatTime(updatedAt)}`);
  } catch (error) {
    setStatus('error', 'Falha na atualização');
    if (!document.body.classList.contains('ready')) showError(error.message);
  }
}

function startAutoRefresh() {
  if (timer) clearInterval(timer);
  if (CONFIG.refreshInterval > 0) {
    timer = setInterval(() => update({ silent: true }), CONFIG.refreshInterval);
  }
}

export function init() {
  update();
  startAutoRefresh();

  el('#refresh')?.addEventListener('click', () => update());
}

init();
