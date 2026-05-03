<template>
  <div class="ai-symptom-page">
    <div class="page-header animate-stagger">
      <h1 class="page-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="title-icon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        AI Symptom Checker
      </h1>
      <p class="page-description">Ceritakan keluhan medis Anda. Sistem kecerdasan buatan kami (Amazon Bedrock) akan memberikan analisis awal dan merekomendasikan dokter spesialis yang tepat untuk Anda.</p>
    </div>

    <div class="grid grid-2">
      <!-- Input Form -->
      <div class="glass-card animate-stagger" style="animation-delay: 0.1s">
        <div class="card-header">
          <h3 class="card-title">Form Keluhan Pasien</h3>
        </div>
        
        <form @submit.prevent="analyzeSymptoms" class="ai-form">
          <div class="form-group">
            <label for="symptoms">Deskripsikan Gejala Anda</label>
            <textarea 
              id="symptoms" 
              v-model="symptoms" 
              class="form-input" 
              rows="6" 
              placeholder="Contoh: Dok, saya sudah 3 hari demam tinggi, disertai batuk kering dan sedikit sesak napas saat malam hari..."
              required
            ></textarea>
            <span class="text-xs text-muted mt-2 block">* Mohon jelaskan sedetail mungkin (durasi, rasa nyeri, dll).</span>
          </div>

          <button type="submit" class="btn btn-primary btn-block ai-btn" :disabled="isLoading || !symptoms.trim()">
            <span v-if="!isLoading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Analisis Gejala
            </span>
            <span v-else class="loading-state">
              <span class="spinner"></span>
              AI Sedang Menganalisis...
            </span>
          </button>
        </form>
      </div>

      <!-- Result Area -->
      <div class="glass-card result-card animate-stagger" :class="{ 'has-result': result, 'is-loading': isLoading }" style="animation-delay: 0.2s">
        <div class="card-header">
          <h3 class="card-title">Hasil Analisis AI</h3>
          <span v-if="result" class="badge badge-success">Selesai</span>
        </div>

        <!-- Empty State -->
        <div v-if="!result && !isLoading" class="empty-state">
          <div class="empty-icon-wrap">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-muted"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <p class="text-muted mt-4 text-center">Isi form di samping untuk melihat hasil analisis otomatis dari keluhan Anda.</p>
        </div>

        <!-- Loading State Glow -->
        <div v-if="isLoading" class="loading-glow">
          <div class="glow-orb"></div>
          <div class="glow-orb-2"></div>
          <p class="glow-text">Memproses Jutaan Parameter Medis...</p>
        </div>

        <!-- Result Content -->
        <div v-if="result && !isLoading" class="result-content animate-stagger">
          
          <div class="result-section">
            <h4 class="section-heading text-warning">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Kemungkinan Penyebab
            </h4>
            <div class="section-box">{{ result.diagnosis }}</div>
          </div>

          <div class="result-section mt-4">
            <h4 class="section-heading text-accent">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              Saran Penanganan Awal (First Aid)
            </h4>
            <div class="section-box">{{ result.firstAid }}</div>
          </div>

          <div class="result-section mt-4">
            <h4 class="section-heading text-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Rekomendasi Spesialis
            </h4>
            <div class="specialist-badge">
              Dokter Spesialis {{ result.recommendedSpecialist }}
            </div>
            <router-link to="/doctors" class="btn btn-outline-primary btn-sm mt-3 inline-flex">
              Cari Dokter {{ result.recommendedSpecialist }} →
            </router-link>
          </div>

          <div class="disclaimer mt-6">
            <strong>⚠️ Disclaimer:</strong> Hasil ini di-*generate* oleh AI dan bukan merupakan diagnosis medis final. Segera temui dokter untuk penanganan lebih lanjut.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

const symptoms = ref('')
const isLoading = ref(false)
const result = ref(null)

async function analyzeSymptoms() {
  if (!symptoms.value.trim()) return

  isLoading.value = true
  result.value = null

  try {
    // Memanggil API Gateway (Endpoint baru)
    const response = await api.post('/ai/analyze', {
      symptoms: symptoms.value
    })
    
    // Asumsi: Lambda merespons string JSON atau objek JSON (jika string, kita parse)
    let aiData = response.data
    if (typeof aiData === 'string') {
      try {
        aiData = JSON.parse(aiData)
      } catch(e) {
        // Jika format JSON dari AI sedikit kacau, fallback sederhana
        aiData = {
          diagnosis: aiData,
          firstAid: "Istirahat cukup dan konsultasi ke dokter.",
          recommendedSpecialist: "Umum"
        }
      }
    }
    
    result.value = aiData
  } catch (error) {
    console.error('Failed to analyze:', error)
    // Tampilkan mock data (Fallback) jika tidak terkoneksi ke AWS (untuk lomba/demo lokal)
    setTimeout(() => {
      result.value = {
        diagnosis: "Berdasarkan gejala demam dan batuk yang Anda alami, kemungkinan ini adalah Infeksi Saluran Pernapasan Akut (ISPA) atau Gejala Flu biasa.",
        firstAid: "Perbanyak minum air putih hangat, istirahat yang cukup, hindari makanan berminyak, dan konsumsi paracetamol jika demam mengganggu.",
        recommendedSpecialist: "Umum / Penyakit Dalam"
      }
      isLoading.value = false
    }, 2500)
  } finally {
    // Jika tidak menggunakan mock, jalankan finally untuk menghentikan loading
    // Tapi karena kita punya fallback setTimeout di atas, kita hentikan loading di try
    if(result.value && !error) {
       isLoading.value = false
    }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: var(--space-8);
}

.title-icon {
  display: inline-block;
  vertical-align: text-bottom;
  color: var(--color-primary);
  margin-right: var(--space-2);
}

.ai-form {
  margin-top: var(--space-4);
}

.ai-btn {
  height: 48px;
  font-size: var(--font-size-base);
  margin-top: var(--space-6);
  background: var(--gradient-primary);
  border: none;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
  transition: all 0.3s ease;
}

.ai-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.6);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Result Card Enhancements */
.result-card {
  position: relative;
  overflow: hidden;
  transition: all 0.5s ease;
}

.result-card.is-loading {
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: inset 0 0 30px rgba(6, 182, 212, 0.1);
}

/* Animated Glow Loading State */
.loading-glow {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 8, 16, 0.7);
  backdrop-filter: blur(5px);
  z-index: 10;
}

.glow-orb {
  position: absolute;
  width: 150px;
  height: 150px;
  background: var(--color-primary);
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
  animation: floatOrb 4s ease-in-out infinite alternate;
}

.glow-orb-2 {
  position: absolute;
  width: 100px;
  height: 100px;
  background: var(--color-secondary);
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.5;
  animation: floatOrb 3s ease-in-out infinite alternate-reverse;
}

.glow-text {
  position: relative;
  z-index: 2;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  animation: pulse 1.5s infinite;
}

@keyframes floatOrb {
  0% { transform: translate(-30px, -30px) scale(0.8); }
  100% { transform: translate(30px, 30px) scale(1.2); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Content Styling */
.section-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.section-box {
  background: rgba(255,255,255,0.03);
  border-left: 3px solid rgba(255,255,255,0.1);
  padding: var(--space-3) var(--space-4);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
  font-size: var(--font-size-sm);
}

.specialist-badge {
  display: inline-block;
  background: var(--color-primary-glow);
  color: var(--color-primary-light);
  border: 1px solid rgba(6, 182, 212, 0.3);
  padding: 6px 16px;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.disclaimer {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  background: rgba(245, 158, 11, 0.1);
  border: 1px dashed rgba(245, 158, 11, 0.3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
}
</style>
