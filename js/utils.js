import { CONFIG, LANGUAGE_COLORS, FALLBACK_COLORS } from './config.js';

// Tudo que é reutilizado.
export function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatUrl(url) {
  if (!url) return null;
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat(CONFIG.locale).format(value ?? 0);
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(CONFIG.locale, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString(CONFIG.locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function monthLabel(date) {
  return date.toLocaleDateString(CONFIG.locale, { month: 'short' });
}

export function languageColor(language, index = 0) {
  return LANGUAGE_COLORS[language] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export function el(selector) {
  return document.querySelector(selector);
}

export function setHtml(selector, html) {
  const node = el(selector);
  if (node) node.innerHTML = html;
}
