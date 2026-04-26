<template>
  <div class="doctors-page">
    <div class="section-header">
      <h1 class="section-title">Daftar Dokter Spesialis</h1>
      <p class="section-subtitle">Temukan dan konsultasikan kondisi Anda dengan dokter terpercaya kami.</p>
    </div>

    <!-- Search & Filter -->
    <div class="filter-bar glass-card-static mb-8">
      <div class="search-box-lg">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" type="text" class="form-input has-icon-lg" placeholder="Cari dokter berdasarkan nama atau spesialisasi..." id="doctor-search" />
      </div>
      <div class="filter-chips">
        <button
          v-for="spec in specializations"
          :key="spec"
          class="chip"
          :class="{ active: activeFilter === spec }"
          @click="activeFilter = activeFilter === spec ? '' : spec"
        >
          {{ spec || 'Semua' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <span>Memuat daftar dokter...</span>
    </div>

    <!-- Doctor Cards Grid -->
    <div v-else-if="filteredDoctors.length > 0" class="grid grid-3">
      <div
        v-for="doctor in filteredDoctors"
        :key="doctor.id"
        class="doctor-card glass-card"
      >
        <div class="doctor-avatar">
          <span class="avatar-letter">{{ doctor.name.charAt(0) }}</span>
          <div class="online-dot"></div>
        </div>
        <h3 class="doctor-name">{{ doctor.name }}</h3>
        <span class="badge badge-primary">{{ doctor.specialization || 'Umum' }}</span>
        <p class="doctor-bio">{{ doctor.bio || 'Dokter spesialis berpengalaman di bidangnya.' }}</p>
        <div class="doctor-meta">
          <div class="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1 .9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>{{ doctor.email || 'Tersedia' }}</span>
          </div>
        </div>
        <div class="doctor-actions">
          <router-link :to="`/appointments?doctor_id=${doctor.id}`" class="btn btn-primary btn-sm btn-block">
            Buat Appointment
          </router-link>
          <router-link :to="`/chat?doctor_id=${doctor.id}`" class="btn btn-secondary btn-sm btn-block">
            Chat Sekarang
          </router-link>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-state-icon">🔍</div>
      <div class="empty-state-title">Dokter tidak ditemukan</div>
      <div class="empty-state-text">Coba ubah kata kunci pencarian atau filter Anda.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const doctors = ref([])
const loading = ref(true)
const searchQuery = ref('')
const activeFilter = ref('')

const specializations = computed(() => {
  const specs = ['', ...new Set(doctors.value.map(d => d.specialization).filter(Boolean))]
  return specs
})

const filteredDoctors = computed(() => {
  let result = doctors.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(d =>
      d.name.toLowerCase().includes(q) ||
      (d.specialization && d.specialization.toLowerCase().includes(q))
    )
  }

  if (activeFilter.value) {
    result = result.filter(d => d.specialization === activeFilter.value)
  }

  return result
})

onMounted(async () => {
  try {
    const res = await api.get('/doctor')
    doctors.value = res.data
  } catch (err) {
    console.error('Failed to load doctors:', err)
    // Use sample data for demo
    doctors.value = [
      { id: 1, name: 'Dr. Budi Santoso', specialization: 'Kardiologi', email: 'dr.budi@mail.com', bio: 'Spesialis jantung dan pembuluh darah dengan pengalaman 15 tahun.' },
      { id: 2, name: 'Dr. Sari Dewi', specialization: 'Dermatologi', email: 'dr.sari@mail.com', bio: 'Ahli kulit dan kelamin, berpengalaman dalam perawatan kulit modern.' },
      { id: 3, name: 'Dr. Andi Pratama', specialization: 'Neurologi', email: 'dr.andi@mail.com', bio: 'Spesialis saraf dengan keahlian penanganan migrain.' },
      { id: 4, name: 'Dr. Maya Putri', specialization: 'Pediatri', email: 'dr.maya@mail.com', bio: 'Dokter anak yang berdedikasi untuk tumbuh kembang anak-anak.' },
    ]
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Filter Bar */
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.search-box-lg {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box-lg .search-icon {
  position: absolute;
  left: 16px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.form-input.has-icon-lg {
  padding-left: 44px;
}

.filter-chips {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.chip {
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chip:hover {
  border-color: var(--color-border-hover);
  color: var(--color-text-primary);
}

.chip.active {
  background: rgba(6, 182, 212, 0.15);
  border-color: rgba(6, 182, 212, 0.4);
  color: var(--color-primary-light);
}

/* Doctor Card */
.doctor-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-8) var(--space-6);
  position: relative;
}

.doctor-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
  position: relative;
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.25);
}

.avatar-letter {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: white;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: var(--color-accent);
  border-radius: 50%;
  border: 3px solid var(--color-bg-card);
}

.doctor-name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.doctor-bio {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--space-4) 0;
  line-height: 1.6;
}

.doctor-meta {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.doctor-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

@media (max-width: 768px) {
  .doctor-card {
    padding: var(--space-6);
  }
}
</style>
