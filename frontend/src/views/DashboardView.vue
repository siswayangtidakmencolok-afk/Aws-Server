<template>
  <div class="dashboard">
    <!-- Welcome Banner -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h2 class="welcome-title">
          Selamat {{ greeting }}, <span class="text-primary">{{ authStore.userName }}</span> 👋
        </h2>
        <p class="welcome-subtitle">
          {{ authStore.userRole === 'doctor' ? 'Kelola jadwal konsultasi dan chat dengan pasien Anda.' : 'Jadwalkan konsultasi dengan dokter spesialis terpercaya.' }}
        </p>
      </div>
      <div class="welcome-illustration animate-float">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-primary)">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-4 mb-8">
      <div class="stat-card" v-for="(stat, i) in stats" :key="i">
        <div class="stat-icon" :style="{ background: stat.iconBg, color: stat.iconColor }">
          <span v-html="stat.icon"></span>
        </div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-2">
      <!-- Upcoming Appointments -->
      <div class="glass-card-static">
        <div class="card-header">
          <h3 class="card-title">📅 Appointment Mendatang</h3>
          <router-link to="/appointments" class="btn btn-ghost btn-sm">Lihat Semua →</router-link>
        </div>

        <div v-if="appointments.length === 0" class="empty-state" style="padding: var(--space-8) 0">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">Belum ada appointment</div>
          <div class="empty-state-text">Jadwalkan konsultasi pertama Anda dengan dokter spesialis.</div>
          <router-link to="/appointments" class="btn btn-primary btn-sm" style="margin-top:var(--space-4)">
            Buat Appointment
          </router-link>
        </div>

        <div v-else class="appointment-list">
          <div v-for="apt in appointments" :key="apt.id" class="appointment-item">
            <div class="apt-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="apt-info">
              <div class="apt-doctor">{{ apt.doctor_name || apt.patient_email }}</div>
              <div class="apt-schedule">{{ formatDate(apt.schedule) }}</div>
            </div>
            <span class="badge" :class="statusBadge(apt.status)">{{ apt.status }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="glass-card-static">
        <div class="card-header">
          <h3 class="card-title">⚡ Aksi Cepat</h3>
        </div>

        <div class="quick-actions">
          <router-link to="/doctors" class="action-card">
            <div class="action-icon" style="background: rgba(6, 182, 212, 0.12); color: var(--color-primary-light);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="action-text">
              <span class="action-title">Cari Dokter</span>
              <span class="action-desc">Temukan dokter spesialis</span>
            </div>
          </router-link>

          <router-link to="/appointments" class="action-card">
            <div class="action-icon" style="background: rgba(139, 92, 246, 0.12); color: var(--color-secondary-light);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div class="action-text">
              <span class="action-title">Buat Appointment</span>
              <span class="action-desc">Jadwalkan konsultasi</span>
            </div>
          </router-link>

          <router-link to="/upload" class="action-card">
            <div class="action-icon" style="background: rgba(16, 185, 129, 0.12); color: var(--color-accent-light);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
            <div class="action-text">
              <span class="action-title">Upload Dokumen</span>
              <span class="action-desc">Unggah rekam medis</span>
            </div>
          </router-link>

          <router-link to="/chat" class="action-card">
            <div class="action-icon" style="background: rgba(245, 158, 11, 0.12); color: var(--color-warning);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div class="action-text">
              <span class="action-title">Live Chat</span>
              <span class="action-desc">Chat dengan dokter</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const authStore = useAuthStore()
const appointments = ref([])

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Pagi'
  if (hour < 15) return 'Siang'
  if (hour < 18) return 'Sore'
  return 'Malam'
})

const stats = computed(() => [
  {
    value: appointments.value.length,
    label: 'Total Appointment',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    iconBg: 'rgba(6, 182, 212, 0.15)',
    iconColor: 'var(--color-primary-light)',
  },
  {
    value: appointments.value.filter(a => a.status === 'confirmed').length,
    label: 'Terkonfirmasi',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: 'var(--color-accent-light)',
  },
  {
    value: appointments.value.filter(a => a.status === 'pending').length,
    label: 'Menunggu',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: 'var(--color-warning)',
  },
  {
    value: 0,
    label: 'Dokumen Medis',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    iconBg: 'rgba(139, 92, 246, 0.15)',
    iconColor: 'var(--color-secondary-light)',
  },
])

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusBadge(status) {
  const map = {
    confirmed: 'badge-success',
    pending: 'badge-warning',
    cancelled: 'badge-danger',
  }
  return map[status] || 'badge-primary'
}

onMounted(async () => {
  try {
    const res = await api.get('/appointment')
    appointments.value = res.data
  } catch (err) {
    console.log('Could not load appointments:', err.message)
  }
})
</script>

<style scoped>
/* Welcome Banner */
.welcome-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-8);
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  margin-bottom: var(--space-8);
  position: relative;
  overflow: hidden;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-primary);
}

.welcome-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.welcome-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  max-width: 500px;
}

.welcome-illustration {
  opacity: 0.3;
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

/* Appointment List */
.appointment-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.appointment-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.appointment-item:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg-hover);
}

.apt-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-glow);
  border-radius: var(--radius-md);
  color: var(--color-primary-light);
}

.apt-info {
  flex: 1;
}

.apt-doctor {
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.apt-schedule {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.action-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  text-decoration: none;
  color: inherit;
}

.action-card:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
}

.action-text {
  display: flex;
  flex-direction: column;
}

.action-title {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.action-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}

@media (max-width: 768px) {
  .welcome-illustration { display: none; }
  .quick-actions { grid-template-columns: 1fr; }
}
</style>
