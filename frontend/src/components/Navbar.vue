<template>
  <header class="navbar">
    <div class="navbar-left">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <span class="page-breadcrumb">{{ breadcrumb }}</span>
    </div>

    <div class="navbar-right">
      <!-- Search -->
      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" class="search-input" placeholder="Cari..." />
      </div>

      <!-- Notification Bell -->
      <button class="navbar-icon-btn" aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="notification-dot"></span>
      </button>

      <!-- Time Display -->
      <div class="time-display">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>{{ currentTime }}</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentTime = ref('')
let timeInterval = null

const pageTitles = {
  '/': 'Dashboard',
  '/doctors': 'Daftar Dokter',
  '/appointments': 'Appointment',
  '/upload': 'Dokumen Medis',
  '/chat': 'Live Chat',
}

const pageTitle = computed(() => pageTitles[route.path] || 'Dashboard')

const breadcrumb = computed(() => {
  if (route.path === '/') return 'Beranda'
  return `Beranda / ${pageTitle.value}`
})

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 30000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: var(--sidebar-width);
  height: var(--navbar-height);
  background: rgba(10, 14, 26, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-8);
  z-index: 90;
  transition: left var(--transition-base);
}

.navbar-left {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.page-breadcrumb {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

/* Search */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-input {
  width: 220px;
  padding: var(--space-2) var(--space-4) var(--space-2) 36px;
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
  width: 280px;
}

/* Icon Button */
.navbar-icon-btn {
  position: relative;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.navbar-icon-btn:hover {
  border-color: var(--color-border-hover);
  color: var(--color-text-primary);
  background: var(--color-bg-hover);
}

.notification-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 7px;
  height: 7px;
  background: var(--color-danger);
  border-radius: 50%;
  border: 2px solid var(--color-bg-primary);
  animation: pulse 2s ease-in-out infinite;
}

/* Time */
.time-display {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .navbar {
    left: 0;
    padding: 0 var(--space-4);
  }

  .search-box {
    display: none;
  }

  .time-display {
    display: none;
  }
}
</style>
