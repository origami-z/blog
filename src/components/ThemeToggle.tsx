import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

const themes: Theme[] = ['light', 'dark', 'system'];

const icons = {
  light: <Sun size={18} />,
  dark: <Moon size={18} />,
  system: <Monitor size={18} />,
};

const labels: Record<Theme, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System theme',
};

function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const initial = stored && themes.includes(stored) ? stored : 'system';
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const cycle = () => {
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  };

  return (
    <button
      onClick={cycle}
      aria-label={labels[theme]}
      title={labels[theme]}
      className="p-2 rounded-md hover:bg-[var(--color-border)] transition-colors"
    >
      {icons[theme]}
    </button>
  );
}
