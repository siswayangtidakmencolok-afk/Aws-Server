<template>
  <div class="login-page">
    <!-- Animated Background -->
    <div class="login-bg">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-orb bg-orb-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="login-container">
      <!-- Left Side — Branding -->
      <div class="login-branding">
        <div class="branding-content">
          <div class="branding-icon animate-float">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h1 class="branding-title">Nusantara<br/>Telemedicine</h1>
          <p class="branding-subtitle">Platform konsultasi kesehatan digital terpercaya. Terhubung dengan dokter spesialis kapan saja, di mana saja.</p>

          <div class="branding-features">
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Konsultasi Online 24/7</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Dokter Spesialis Bersertifikat</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Rekam Medis Digital Aman</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot"></div>
              <span>Chat Real-Time dengan Dokter</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side — Login Form -->
      <div class="login-form-wrapper">
        <div class="login-form-card">
          <div class="form-header">
            <h2 class="form-title">{{ isRegister ? 'Daftar Akun' : 'Selamat Datang' }}</h2>
            <p class="form-subtitle">{{ isRegister ? 'Buat akun baru untuk memulai' : 'Masuk ke akun Anda' }}</p>
          </div>

          <!-- Alert -->
          <transition name="slide-up">
            <div v-if="authStore.error" class="alert alert-error">
              {{ authStore.error }}
            </div>
          </transition>

          <form @submit.prevent="handleSubmit" id="login-form">
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  class="form-input has-icon"
                  placeholder="nama@email.com"
                  required
                  autocomplete="email"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input has-icon"
                  placeholder="••••••••"
                  required
                  autocomplete="current-password"
                />
                <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="isRegister" class="form-group">
              <label class="form-label" for="role">Daftar Sebagai</label>
              <select id="role" v-model="role" class="form-input form-select">
                <option value="patient">Pasien</option>
                <option value="doctor">Dokter</option>
              </select>
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-lg btn-block"
              :disabled="authStore.loading"
              id="login-submit-btn"
            >
              <span v-if="authStore.loading" class="spinner" style="width:20px;height:20px;border-width:2px;"></span>
              <span v-else>{{ isRegister ? 'Daftar' : 'Masuk' }}</span>
            </button>
          </form>

          <div class="form-footer">
            <button class="btn btn-ghost btn-sm" @click="toggleMode" id="toggle-auth-mode">
              {{ isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar' }}
            </button>
          </div>

          <!-- Demo Credentials -->
          <div class="demo-credentials">
            <span class="demo-label">Demo Login:</span>
            <button class="demo-btn" @click="fillDemo('patient')" id="demo-patient-btn">
              👤 Pasien
            </button>
            <button class="demo-btn" @click="fillDemo('doctor')" id="demo-doctor-btn">
              👨‍⚕️ Dokter
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const role = ref('patient')
const showPassword = ref(false)
const isRegister = ref(false)

function toggleMode() {
  isRegister.value = !isRegister.value
  authStore.clearError()
}

function fillDemo(type) {
  if (type === 'patient') {
    email.value = 'patient1@mail.com'
  } else {
    email.value = 'dr.budi@mail.com'
  }
  password.value = '123456'
}

async function handleSubmit() {
  try {
    if (isRegister.value) {
      await authStore.register(email.value, password.value, role.value)
    } else {
      await authStore.login(email.value, password.value)
    }
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    // Error is handled in the store
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Animated Background */
.login-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: orbFloat 15s ease-in-out infinite;
}

.bg-orb-1 {
  width: 500px;
  height: 500px;
  background: rgba(6, 182, 212, 0.15);
  top: -10%;
  right: -5%;
  animation-delay: 0s;
}

.bg-orb-2 {
  width: 400px;
  height: 400px;
  background: rgba(139, 92, 246, 0.12);
  bottom: -10%;
  left: -5%;
  animation-delay: -5s;
}

.bg-orb-3 {
  width: 300px;
  height: 300px;
  background: rgba(16, 185, 129, 0.1);
  top: 40%;
  left: 30%;
  animation-delay: -10s;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* Container */
.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  margin: var(--space-8);
  background: var(--color-bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  position: relative;
  z-index: 1;
}

/* Left — Branding */
.login-branding {
  flex: 1;
  background: var(--gradient-card);
  border-right: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  position: relative;
  overflow: hidden;
}

.login-branding::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 40%, rgba(6, 182, 212, 0.08), transparent 60%);
}

.branding-content {
  position: relative;
  z-index: 1;
}

.branding-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: var(--radius-xl);
  color: white;
  margin-bottom: var(--space-8);
  box-shadow: 0 8px 30px rgba(6, 182, 212, 0.3);
}

.branding-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  line-height: 1.1;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-4);
}

.branding-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: var(--space-8);
  max-width: 360px;
}

.branding-features {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.feature-dot {
  width: 6px;
  height: 6px;
  min-width: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
}

/* Right — Form */
.login-form-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
}

.login-form-card {
  width: 100%;
  max-width: 380px;
}

.form-header {
  margin-bottom: var(--space-8);
}

.form-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.form-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* Input with icon */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--color-text-muted);
  pointer-events: none;
  z-index: 1;
}

.form-input.has-icon {
  padding-left: 40px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  padding: 4px;
  transition: color var(--transition-fast);
}

.password-toggle:hover {
  color: var(--color-text-primary);
}

/* Form footer */
.form-footer {
  text-align: center;
  margin-top: var(--space-6);
}

/* Demo Credentials */
.demo-credentials {
  margin-top: var(--space-6);
  padding: var(--space-4);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.demo-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  width: 100%;
  margin-bottom: var(--space-1);
}

.demo-btn {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.demo-btn:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
  color: var(--color-primary-light);
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    margin: var(--space-4);
    min-height: auto;
  }

  .login-branding {
    padding: var(--space-8);
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .branding-title {
    font-size: var(--font-size-2xl);
  }

  .branding-features {
    display: none;
  }

  .login-form-wrapper {
    padding: var(--space-8);
  }
}
</style>
