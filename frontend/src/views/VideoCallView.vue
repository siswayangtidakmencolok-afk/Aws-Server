<template>
  <div class="video-call-page">
    <div class="vc-header animate-stagger">
      <div>
        <h1 class="vc-title">Konsultasi Langsung</h1>
        <div class="vc-status">
          <span class="status-dot"></span> Secure End-to-End Encryption
        </div>
      </div>
      <div class="vc-timer font-mono text-primary">
        {{ formatTime(callDuration) }}
      </div>
    </div>

    <div class="vc-workspace animate-stagger" style="animation-delay: 0.1s">
      <!-- Main Video Area (Doctor) -->
      <div class="main-video-container">
        <div class="video-placeholder">
          <!-- Animated abstract rings to simulate waiting/connecting -->
          <div class="pulse-ring ring-1"></div>
          <div class="pulse-ring ring-2"></div>
          <div class="pulse-ring ring-3"></div>
          
          <div class="doctor-avatar-large">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h3 class="mt-4 font-semibold text-lg">Dr. Spesialis</h3>
          <p class="text-muted">Menunggu dokter bergabung...</p>
        </div>
        
        <!-- Doctor Name Tag -->
        <div class="name-tag">
          <span class="badge badge-primary" style="margin-right: 8px">Host</span>
          Dr. Budi Santoso (Kardiologi)
        </div>
      </div>

      <!-- PiP Area (Self View) -->
      <div class="pip-video-container">
        <div class="self-view-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-secondary">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="mt-2 text-xs">Anda</span>
        </div>
      </div>

      <!-- Control Bar -->
      <div class="control-bar">
        <button class="control-btn" :class="{ 'btn-off': isMuted }" @click="toggleMute">
          <svg v-if="!isMuted" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        </button>

        <button class="control-btn" :class="{ 'btn-off': !isVideoOn }" @click="toggleVideo">
          <svg v-if="isVideoOn" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        </button>
        
        <button class="control-btn btn-share">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><polyline points="16 8 12 12 8 8"/></svg>
        </button>

        <button class="control-btn btn-end" @click="endCall">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 2.6 3.41L10.68 13.31z"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isMuted = ref(false)
const isVideoOn = ref(true)
const callDuration = ref(0)
let timer = null

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function toggleMute() {
  isMuted.value = !isMuted.value
}

function toggleVideo() {
  isVideoOn.value = !isVideoOn.value
}

function endCall() {
  router.push('/dashboard')
}

onMounted(() => {
  timer = setInterval(() => {
    callDuration.value++
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.video-call-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--navbar-height) - var(--space-8) * 2);
  min-height: 600px;
}

/* Header */
.vc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-4);
}

.vc-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.vc-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-xs);
  color: var(--color-accent-light);
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: var(--color-accent);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--color-accent);
  animation: pulse 2s infinite;
}

.vc-timer {
  font-size: var(--font-size-xl);
  font-weight: 600;
  background: var(--color-bg-glass);
  padding: 4px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
}

/* Workspace */
.vc-workspace {
  flex: 1;
  position: relative;
  background: #000; /* Pure black for video feel */
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg), 0 0 40px rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Main Video */
.main-video-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: radial-gradient(circle at center, #111827 0%, #000000 100%);
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
}

.doctor-avatar-large {
  width: 100px;
  height: 100px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(6, 182, 212, 0.4);
  z-index: 2;
  position: relative;
}

/* Abstract Pulse Rings */
.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  opacity: 0;
  z-index: 1;
}

.ring-1 { width: 140px; height: 140px; animation: wave 3s infinite; }
.ring-2 { width: 140px; height: 140px; animation: wave 3s infinite 1s; }
.ring-3 { width: 140px; height: 140px; animation: wave 3s infinite 2s; }

@keyframes wave {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}

.name-tag {
  position: absolute;
  bottom: 100px;
  left: 32px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
}

/* PiP Video */
.pip-video-container {
  position: absolute;
  top: 32px;
  right: 32px;
  width: 240px;
  height: 160px;
  background: #1e293b;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 2px solid rgba(255, 255, 255, 0.1);
  z-index: 20;
  transition: transform var(--transition-base);
}

.pip-video-container:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.self-view-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b, #0f172a);
}

/* Control Bar */
.control-bar {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--space-4);
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(20px);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  z-index: 30;
}

.control-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
}

.control-btn.btn-off {
  background: rgba(239, 68, 68, 0.2);
  color: var(--color-danger-light);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.control-btn.btn-share {
  background: rgba(16, 185, 129, 0.2);
  color: var(--color-accent-light);
}

.control-btn.btn-end {
  background: var(--color-danger);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

.control-btn.btn-end:hover {
  background: #dc2626;
  transform: scale(1.1);
}
</style>
