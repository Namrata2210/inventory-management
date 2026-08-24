<template>
  <div class="app">
    <TitleBar @minimize="isMinimized = true" />

    <div class="app-body" :class="{ 'app-body-minimized': isMinimized }">
      <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="brand">
          <h1 class="brand-name">{{ t('nav.companyName') }}</h1>
          <span class="brand-subtitle">{{ t('nav.subtitle') }}</span>
          <span class="brand-mark">{{ brandInitials }}</span>
          <button
            type="button"
            class="sidebar-toggle"
            @click="sidebarCollapsed = !sidebarCollapsed"
            :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          >
            <svg class="sidebar-toggle-icon" viewBox="0 0 20 20" fill="none">
              <path
                v-if="!sidebarCollapsed"
                d="M12.5 4.5L7 10l5.5 5.5"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                v-else
                d="M7.5 4.5L13 10l-5.5 5.5"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <nav class="nav-tabs">
          <router-link
            to="/"
            :class="{ active: $route.path === '/' }"
            :title="t('nav.overview')"
          >
            <svg class="nav-icon" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 9.5L10 3l7 6.5"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M5 8v8a1 1 0 001 1h3v-5h2v5h3a1 1 0 001-1V8"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="nav-label">{{ t('nav.overview') }}</span>
          </router-link>
          <router-link
            to="/inventory"
            :class="{ active: $route.path === '/inventory' }"
            :title="t('nav.inventory')"
          >
            <svg class="nav-icon" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 6l7-3.5L17 6v8l-7 3.5L3 14V6z"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M3 6l7 3.5L17 6M10 9.5V17.5"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="nav-label">{{ t('nav.inventory') }}</span>
          </router-link>
          <router-link
            to="/orders"
            :class="{ active: $route.path === '/orders' }"
            :title="t('nav.orders')"
          >
            <svg class="nav-icon" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 3h10a1 1 0 011 1v13l-2.5-1.5L11 17l-2.5-1.5L6 17l-2.5-1.5L4 17V4a1 1 0 011-1z"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7 7h6M7 10h6M7 13h3"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
              />
            </svg>
            <span class="nav-label">{{ t('nav.orders') }}</span>
          </router-link>
          <router-link
            to="/spending"
            :class="{ active: $route.path === '/spending' }"
            :title="t('nav.finance')"
          >
            <svg class="nav-icon" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 17V9M8 17V5M13 17V11M18 17V3"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="nav-label">{{ t('nav.finance') }}</span>
          </router-link>
          <router-link
            to="/demand"
            :class="{ active: $route.path === '/demand' }"
            :title="t('nav.demandForecast')"
          >
            <svg class="nav-icon" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 14l4-4 3 3 6-7"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 6h4v4"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="nav-label">{{ t('nav.demandForecast') }}</span>
          </router-link>
          <router-link
            to="/restocking"
            :class="{ active: $route.path === '/restocking' }"
            :title="t('nav.restocking')"
          >
            <svg class="nav-icon" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 5h9v9H3V5z"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M15 8h2l2 2v4h-4V8z"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M6.5 8.5v3M5 10h3"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
              />
              <circle
                cx="7"
                cy="16"
                r="1.25"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <circle
                cx="15"
                cy="16"
                r="1.25"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
            <span class="nav-label">{{ t('nav.restocking') }}</span>
          </router-link>
          <router-link
            to="/reports"
            :class="{ active: $route.path === '/reports' }"
            :title="t('nav.reports')"
          >
            <svg class="nav-icon" viewBox="0 0 20 20" fill="none">
              <path
                d="M6 3h6l3 3v11a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 3v3h3M7 10h6M7 13h6M7 16h4"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
              />
            </svg>
            <span class="nav-label">{{ t('nav.reports') }}</span>
          </router-link>
        </nav>

        <div class="sidebar-spacer"></div>
        <div class="sidebar-divider"></div>

        <div class="sidebar-footer">
          <LanguageSwitcher />
          <ProfileMenu
            @show-profile-details="showProfileDetails = true"
            @show-tasks="showTasks = true"
          />
        </div>
      </aside>

      <div class="content-column">
        <FilterBar />
        <main class="main-content">
          <router-view />
        </main>
      </div>
    </div>

    <Transition name="minimize-pill">
      <button
        v-if="isMinimized"
        type="button"
        class="restore-pill"
        @click="isMinimized = false"
        :title="t('titleBar.restoreApp')"
      >
        <svg class="restore-pill-icon" viewBox="0 0 12 12" fill="none">
          <rect
            x="3.5"
            y="1.5"
            width="7"
            height="7"
            stroke="currentColor"
            stroke-width="1.15"
          />
          <rect
            x="1.5"
            y="3.5"
            width="7"
            height="7"
            class="restore-pill-icon-front"
            stroke="currentColor"
            stroke-width="1.15"
          />
        </svg>
        <span class="restore-pill-label">{{ t('nav.companyName') }}</span>
      </button>
    </Transition>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import TitleBar from './components/TitleBar.vue'

export default {
  name: 'App',
  components: {
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher,
    TitleBar,
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])
    const isMinimized = ref(false)
    const sidebarCollapsed = ref(
      localStorage.getItem('sidebar-collapsed') === 'true',
    )

    watch(sidebarCollapsed, (value) => {
      localStorage.setItem('sidebar-collapsed', value)
    })

    const brandInitials = computed(() => {
      const name = t('nav.companyName') || ''
      return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase()
    })

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        // Add new task to the beginning of the array
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const isMockTask = currentUser.value.tasks.some((t) => t.id === taskId)

        if (isMockTask) {
          // Remove from mock tasks
          const index = currentUser.value.tasks.findIndex(
            (t) => t.id === taskId,
          )
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          // Remove from API tasks
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter((t) => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const mockTask = currentUser.value.tasks.find((t) => t.id === taskId)

        if (mockTask) {
          // Toggle mock task status
          mockTask.status =
            mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          // Toggle API task
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex((t) => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    // Best-effort: browsers only allow requestFullscreen() during a genuine
    // user gesture, so we can't just call it on mount. Instead, listen for
    // the very first click/keydown after load and use that gesture to enter
    // fullscreen automatically. Only attempted once per browser session
    // (tracked via sessionStorage) so reloads don't keep hijacking the
    // user's first interaction, and it never re-triggers if they exit
    // fullscreen later. The Maximize button in TitleBar.vue remains the
    // reliable manual fallback either way.
    const setupAutoFullscreen = () => {
      if (document.fullscreenElement) return
      if (sessionStorage.getItem('fullscreen-auto-requested') === 'true') return

      const requestFullscreenOnce = (event) => {
        document.removeEventListener('click', requestFullscreenOnce, true)
        document.removeEventListener('keydown', requestFullscreenOnce, true)
        sessionStorage.setItem('fullscreen-auto-requested', 'true')

        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch((err) => {
            console.debug('Auto fullscreen request was not granted:', err)
          })
        }
        // Intentionally don't call preventDefault/stopPropagation - the
        // user's actual click/keypress should still do whatever it was
        // going to do.
      }

      document.addEventListener('click', requestFullscreenOnce, true)
      document.addEventListener('keydown', requestFullscreenOnce, true)
    }

    onMounted(() => {
      loadTasks()
      setupAutoFullscreen()
    })

    return {
      t,
      brandInitials,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask,
      isMinimized,
      sidebarCollapsed,
    }
  },
}
</script>

<style>
/* Theme variables: light is the default/existing slate palette, dark is a
   parallel palette applied via [data-theme="dark"] on <html> (see
   composables/useTheme.js + index.html's pre-paint script). Status colors
   (badges, success/warning/danger/info) are intentionally left as literal
   values in both themes - they already have enough contrast against both
   light and dark card backgrounds. */
:root {
  --color-bg: #f8fafc;
  --color-text: #1e293b;
  --color-text-strong: #0f172a;
  --color-text-muted: #64748b;
  --color-text-subtle: #475569;
  --color-border: #e2e8f0;
  --color-border-subtle: #f1f5f9;
  --color-card-bg: #ffffff;
  --color-table-head-bg: #f8fafc;
  --color-row-hover: #f8fafc;
  --shadow-card:
    0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06);
}

[data-theme='dark'] {
  --color-bg: #0b1120;
  --color-text: #e2e8f0;
  --color-text-strong: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-text-subtle: #cbd5e1;
  --color-border: #334155;
  --color-border-subtle: #1e293b;
  --color-card-bg: #1e293b;
  --color-table-head-bg: #0f172a;
  --color-row-hover: #273548;
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.4);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

html,
body,
#app {
  height: 100%;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.app-body {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;
}

.app-body-minimized {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .app-body {
    transition: none;
  }
}

/* Restore pill (in-page "minimize" equivalent) */
.restore-pill {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #0f172a;
  color: #f1f5f9;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.813rem;
  font-weight: 600;
}

.restore-pill:hover {
  background: #1e293b;
}

.restore-pill-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.restore-pill-icon-front {
  fill: #0f172a;
}

.restore-pill:hover .restore-pill-icon-front {
  fill: #1e293b;
}

.minimize-pill-enter-active,
.minimize-pill-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.minimize-pill-enter-from,
.minimize-pill-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .minimize-pill-enter-active,
  .minimize-pill-leave-active {
    transition: none;
  }
}

/* Sidebar */
.sidebar {
  width: 264px;
  flex-shrink: 0;
  height: 100%;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  z-index: 100;
  overflow: hidden;
}

.brand {
  position: relative;
  padding: 0 0.75rem 1.25rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.sidebar-toggle {
  position: absolute;
  top: 0;
  right: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background: #1e293b;
  color: #f1f5f9;
}

.sidebar-toggle-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.brand-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.025em;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 400;
}

.brand-mark {
  display: none;
}

.nav-tabs {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.75rem;
  overflow-y: auto;
  min-height: 0;
}

.nav-tabs a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  position: relative;
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.nav-tabs a:hover {
  color: #f1f5f9;
  background: #1e293b;
}

.nav-tabs a.active {
  color: #ffffff;
  background: rgba(37, 99, 235, 0.15);
  border-left-color: #3b82f6;
}

.sidebar-spacer {
  flex: 1;
}

.sidebar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0.75rem 0.25rem;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Dark-sidebar theming for ProfileMenu / LanguageSwitcher */
.sidebar-footer .profile-button,
.sidebar-footer .language-button {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.08);
  width: 100%;
}

.sidebar-footer .profile-button:hover,
.sidebar-footer .language-button:hover {
  background: #273548;
  border-color: rgba(255, 255, 255, 0.15);
}

.sidebar-footer .profile-name,
.sidebar-footer .language-label {
  color: #e2e8f0;
}

.sidebar-footer .globe-icon,
.sidebar-footer .chevron {
  color: #94a3b8;
}

/* Content column */
.content-column {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 1400px;
  padding: 1.5rem 2rem;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text-strong);
  margin-bottom: 0.375rem;
  letter-spacing: -0.025em;
}

.page-header p {
  color: var(--color-text-muted);
  font-size: 0.938rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--color-card-bg);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.stat-label {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.625rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text-strong);
  letter-spacing: -0.025em;
}

.stat-card.warning .stat-value {
  color: #ea580c;
}

.stat-card.success .stat-value {
  color: #059669;
}

.stat-card.danger .stat-value {
  color: #dc2626;
}

.stat-card.info .stat-value {
  color: #2563eb;
}

.card {
  background: var(--color-card-bg);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  margin-bottom: 1.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--color-border);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-strong);
  letter-spacing: -0.025em;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--color-table-head-bg);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  color: var(--color-text-subtle);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--color-border-subtle);
  color: var(--color-text);
  font-size: 0.875rem;
}

tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background: var(--color-row-hover);
}

.badge {
  display: inline-block;
  padding: 0.313rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.success {
  background: #d1fae5;
  color: #065f46;
}

.badge.warning {
  background: #fed7aa;
  color: #92400e;
}

.badge.danger {
  background: #fecaca;
  color: #991b1b;
}

.badge.info {
  background: #dbeafe;
  color: #1e40af;
}

.badge.increasing {
  background: #d1fae5;
  color: #065f46;
}

.badge.decreasing {
  background: #fecaca;
  color: #991b1b;
}

.badge.stable {
  background: #e0e7ff;
  color: #3730a3;
}

.badge.high {
  background: #fecaca;
  color: #991b1b;
}

.badge.medium {
  background: #fed7aa;
  color: #92400e;
}

.badge.low {
  background: #dbeafe;
  color: #1e40af;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
  font-size: 0.938rem;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.938rem;
}

/* Manual collapse: reproduces the icon-rail look at any viewport width */
.sidebar.sidebar-collapsed {
  width: 72px;
  padding: 1.5rem 0.5rem;
  align-items: center;
}

.sidebar.sidebar-collapsed .brand {
  padding: 0 0 1.25rem;
  align-items: center;
}

.sidebar.sidebar-collapsed .brand-name,
.sidebar.sidebar-collapsed .brand-subtitle {
  display: none;
}

.sidebar.sidebar-collapsed .brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.2);
  color: #f1f5f9;
  font-weight: 700;
  font-size: 0.875rem;
}

.sidebar.sidebar-collapsed .sidebar-toggle {
  position: static;
  margin-top: 0.5rem;
}

.sidebar.sidebar-collapsed .nav-tabs {
  width: 100%;
}

.sidebar.sidebar-collapsed .nav-tabs a {
  justify-content: center;
  padding: 0.75rem 0;
}

.sidebar.sidebar-collapsed .nav-label {
  display: none;
}

.sidebar.sidebar-collapsed .sidebar-footer {
  width: 100%;
  align-items: center;
}

.sidebar.sidebar-collapsed .sidebar-footer .profile-button,
.sidebar.sidebar-collapsed .sidebar-footer .language-button {
  width: 44px;
  height: 44px;
  padding: 0;
  justify-content: center;
}

.sidebar.sidebar-collapsed .sidebar-footer .profile-name,
.sidebar.sidebar-collapsed .sidebar-footer .language-label,
.sidebar.sidebar-collapsed .sidebar-footer .chevron {
  display: none;
}

/* Responsive: collapse sidebar to icon rail (forced regardless of manual toggle state) */
@media (max-width: 1080px) {
  .sidebar {
    width: 72px;
    padding: 1.5rem 0.5rem;
    align-items: center;
  }

  .brand {
    padding: 0 0 1.25rem;
    align-items: center;
  }

  .brand-name,
  .brand-subtitle {
    display: none;
  }

  .brand-mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(37, 99, 235, 0.2);
    color: #f1f5f9;
    font-weight: 700;
    font-size: 0.875rem;
  }

  .sidebar-toggle {
    position: static;
    margin-top: 0.5rem;
  }

  .nav-tabs {
    width: 100%;
  }

  .nav-tabs a {
    justify-content: center;
    padding: 0.75rem 0;
  }

  .nav-label {
    display: none;
  }

  .sidebar-footer {
    width: 100%;
    align-items: center;
  }

  .sidebar-footer .profile-button,
  .sidebar-footer .language-button {
    width: 44px;
    height: 44px;
    padding: 0;
    justify-content: center;
  }

  .sidebar-footer .profile-name,
  .sidebar-footer .language-label,
  .sidebar-footer .chevron {
    display: none;
  }
}
</style>
