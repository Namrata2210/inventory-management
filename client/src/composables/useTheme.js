import { ref } from 'vue'

// Module-level ref: single shared theme state across every component that
// imports this composable (same pattern as the filters composable).
const theme = ref(localStorage.getItem('theme') || 'light')

const applyTheme = (value) => {
  document.documentElement.setAttribute('data-theme', value)
}

// Re-apply on module load too. index.html already sets the attribute
// synchronously pre-paint to avoid a flash of the wrong theme; this keeps
// the two sources of truth (localStorage + DOM attribute) in sync in case
// they ever diverge.
applyTheme(theme.value)

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', theme.value)
    applyTheme(theme.value)
  }

  return { theme, toggleTheme }
}
