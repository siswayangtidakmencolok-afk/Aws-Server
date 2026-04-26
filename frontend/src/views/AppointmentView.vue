<template>
  <div class="appointment-page">
    <div class="section-header">
      <h1 class="section-title">Appointment</h1>
      <p class="section-subtitle">Kelola jadwal konsultasi Anda dengan dokter spesialis.</p>
    </div>

    <div class="grid grid-2">
      <!-- Booking Form -->
      <div class="glass-card-static">
        <h3 class="card-title mb-6">📋 Buat Appointment Baru</h3>

        <transition name="slide-up">
          <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>
        </transition>
        <transition name="slide-up">
          <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>
        </transition>

        <form @submit.prevent="createAppointment" id="booking-form">
          <div class="form-group">
            <label class="form-label" for="select-doctor">Pilih Dokter</label>
            <select id="select-doctor" v-model="form.doctor_id" class="form-input form-select" required>
              <option value="" disabled>— Pilih dokter —</option>
              <option v-for="doc in doctors" :key="doc.id" :value="doc.id">
                {{ doc.name }} — {{ doc.specialization || 'Umum' }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="schedule-date">Tanggal</label>
            <input id="schedule-date" v-model="form.date" type="date" class="form-input" :min="minDate" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="schedule-time">Waktu</label>
            <select id="schedule-time" v-model="form.time" class="form-input form-select" required>
              <option value="" disabled>— Pilih waktu —</option>
              <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="notes">Catatan (opsional)</label>
            <textarea id="notes" v-model="form.notes" class="form-input" placeholder="Keluhan atau catatan tambahan..." rows="3"></textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-lg btn-block" :disabled="submitting" id="submit-booking">
            <span v-if="submitting" class="spinner" style="width:20px;height:20px;border-width:2px;"></span>
            <span v-else>Buat Appointment</span>
          </button>
        </form>
      </div>

      <!-- Appointment List -->
      <div class="glass-card-static">
        <h3 class="card-title mb-6">📅 Daftar Appointment</h3>

        <div v-if="loadingList" class="loading-overlay" style="min-height:200px">
          <div class="spinner"></div>
        </div>

        <div v-else-if="appointments.length === 0" class="empty-state" style="padding: var(--space-8) 0">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">Belum ada appointment</div>
          <div class="empty-state-text">Buat appointment pertama Anda di form sebelah.</div>
        </div>

        <div v-else class="appointment-list">
          <div v-for="apt in appointments" :key="apt.id" class="apt-card">
            <div class="apt-card-header">
              <div class="apt-card-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div class="apt-card-info">
                <span class="apt-card-doctor">{{ apt.doctor_name || apt.patient_email || 'Dokter' }}</span>
                <span class="apt-card-spec">{{ apt.specialization || '' }}</span>
              </div>
              <span class="badge" :class="statusClass(apt.status)">{{ statusLabel(apt.status) }}</span>
            </div>
            <div class="apt-card-body">
              <div class="apt-card-detail">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>{{ formatDate(apt.schedule) }}</span>
              </div>
              <div class="apt-card-detail">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{{ formatTime(apt.schedule) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()

const doctors = ref([])
const appointments = ref([])
const loadingList = ref(true)
const submitting = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const form = ref({
  doctor_id: route.query.doctor_id || '',
  date: '',
  time: '',
  notes: '',
})

const today = new Date()
const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
]

function statusClass(status) {
  return {
    confirmed: 'badge-success',
    pending: 'badge-warning',
    cancelled: 'badge-danger',
  }[status] || 'badge-primary'
}

function statusLabel(status) {
  return {
    confirmed: 'Terkonfirmasi',
    pending: 'Menunggu',
    cancelled: 'Dibatalkan',
  }[status] || status
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function loadData() {
  try {
    const [docRes, aptRes] = await Promise.allSettled([
      api.get('/doctor'),
      api.get('/appointment'),
    ])

    if (docRes.status === 'fulfilled') {
      doctors.value = docRes.value.data
    } else {
      // Fallback demo data
      doctors.value = [
        { id: 1, name: 'Dr. Budi Santoso', specialization: 'Kardiologi' },
        { id: 2, name: 'Dr. Sari Dewi', specialization: 'Dermatologi' },
        { id: 3, name: 'Dr. Andi Pratama', specialization: 'Neurologi' },
        { id: 4, name: 'Dr. Maya Putri', specialization: 'Pediatri' },
      ]
    }

    if (aptRes.status === 'fulfilled') {
      appointments.value = aptRes.value.data
    }
  } catch (err) {
    console.error('Load data error:', err)
  } finally {
    loadingList.value = false
  }
}

async function createAppointment() {
  submitting.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const schedule = `${form.value.date} ${form.value.time}`
    await api.post('/appointment', {
      doctor_id: parseInt(form.value.doctor_id),
      schedule,
    })

    successMsg.value = 'Appointment berhasil dibuat!'
    form.value = { doctor_id: '', date: '', time: '', notes: '' }

    // Reload appointments
    const res = await api.get('/appointment')
    appointments.value = res.data

    setTimeout(() => { successMsg.value = '' }, 5000)
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Gagal membuat appointment. Silakan coba lagi.'
    setTimeout(() => { errorMsg.value = '' }, 5000)
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.card-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

/* Appointment Cards */
.appointment-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-height: 500px;
  overflow-y: auto;
}

.apt-card {
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: all var(--transition-fast);
}

.apt-card:hover {
  border-color: var(--color-border-hover);
}

.apt-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.apt-card-avatar {
  width: 36px;
  height: 36px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-glow);
  border-radius: var(--radius-md);
  color: var(--color-primary-light);
}

.apt-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.apt-card-doctor {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.apt-card-spec {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.apt-card-body {
  display: flex;
  gap: var(--space-6);
  padding-left: calc(36px + var(--space-3));
}

.apt-card-detail {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
</style>
