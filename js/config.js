// Configuração central do projeto
export const CONFIG = {
  username: 'CodeWizardProtech',
  apiBase: 'https://api.github.com',
  topReposLimit: 6,
  // Atualização automática dos dados (ms)
  refreshInterval: 10 * 60 * 1000,
  activityMonths: 6,
  locale: 'pt-BR',
};

// Cores por linguagem usadas nos gráficos
export const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  PHP: '#4F5D95',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Vue: '#41b883',
};

export const FALLBACK_COLORS = ['#22d3ee', '#34d399', '#a78bfa', '#f472b6', '#fbbf24', '#60a5fa'];
