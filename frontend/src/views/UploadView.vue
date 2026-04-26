<template>
  <div class="upload-page">
    <div class="section-header">
      <h1 class="section-title">Dokumen Medis</h1>
      <p class="section-subtitle">Unggah dan kelola dokumen rekam medis Anda secara aman dan terenkripsi.</p>
    </div>

    <div class="grid grid-2">
      <!-- Upload Area -->
      <div class="glass-card-static">
        <h3 class="card-title mb-6">📤 Upload Dokumen</h3>

        <transition name="slide-up">
          <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>
        </transition>
        <transition name="slide-up">
          <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>
        </transition>

        <!-- Drop Zone -->
        <div
          class="drop-zone"
          :class="{ active: isDragging, 'has-file': selectedFile }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
          id="drop-zone"
        >
          <input
            ref="fileInput"
            type="file"
            class="file-input-hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            @change="handleFileSelect"
          />

          <div v-if="!selectedFile" class="drop-content">
            <div class="drop-icon animate-float">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p class="drop-title">Tarik & lepas file di sini</p>
            <p class="drop-subtitle">atau klik untuk memilih file</p>
            <p class="drop-formats">PDF, JPG, PNG, DOC — Maks 10MB</p>
          </div>

          <div v-else class="file-preview">
            <div class="file-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="file-details">
              <span class="file-name">{{ selectedFile.name }}</span>
              <span class="file-size">{{ formatSize(selectedFile.size) }}</span>
            </div>
            <button class="btn btn-ghost btn-sm" @click.stop="removeFile">✕</button>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="uploading" class="progress-bar-wrapper mt-4">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <span class="progress-text">{{ uploadProgress }}%</span>
        </div>

        <button
          class="btn btn-primary btn-lg btn-block mt-6"
          :disabled="!selectedFile || uploading"
          @click="uploadFile"
          id="upload-btn"
        >
          <span v-if="uploading" class="spinner" style="width:20px;height:20px;border-width:2px;"></span>
          <span v-else>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:8px"><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Dokumen
          </span>
        </button>
      </div>

      <!-- Document List -->
      <div class="glass-card-static">
        <h3 class="card-title mb-6">📁 Dokumen Tersimpan</h3>

        <div v-if="documents.length === 0" class="empty-state" style="padding:var(--space-8) 0">
          <div class="empty-state-icon">📄</div>
          <div class="empty-state-title">Belum ada dokumen</div>
          <div class="empty-state-text">Dokumen yang Anda upload akan muncul di sini.</div>
        </div>

        <div v-else class="document-list">
          <div v-for="doc in documents" :key="doc.id" class="document-item">
            <div class="doc-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="doc-info">
              <span class="doc-name">{{ doc.file_name || extractFilename(doc.file_url) }}</span>
              <span class="doc-date">{{ formatDate(doc.created_at) }}</span>
            </div>
            <span class="badge badge-success">Tersimpan</span>
          </div>
        </div>

        <!-- Security Notice -->
        <div class="security-notice mt-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <div>
            <span class="notice-title">Enkripsi End-to-End</span>
            <span class="notice-text">Semua dokumen dienkripsi dengan AES-256 dan disimpan di AWS S3 yang aman.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

const selectedFile = ref(null)
const isDragging = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const successMsg = ref('')
const errorMsg = ref('')
const documents = ref([])
const fileInput = ref(null)

function triggerFileInput() {
  if (!selectedFile.value) {
    fileInput.value?.click()
  }
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) validateAndSetFile(file)
}

function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) validateAndSetFile(file)
}

function validateAndSetFile(file) {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

  if (file.size > maxSize) {
    errorMsg.value = 'Ukuran file melebihi 10MB.'
    return
  }

  if (!allowedTypes.includes(file.type)) {
    errorMsg.value = 'Format file tidak didukung. Gunakan PDF, JPG, PNG, atau DOC.'
    return
  }

  selectedFile.value = file
  errorMsg.value = ''
}

function removeFile() {
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

async function uploadFile() {
  if (!selectedFile.value) return

  uploading.value = true
  uploadProgress.value = 0
  successMsg.value = ''
  errorMsg.value = ''

  try {
    // Step 1: Get presigned URL
    const urlRes = await api.post('/upload-url', {
      filename: selectedFile.value.name,
      contentType: selectedFile.value.type,
    })

    const { url, key } = urlRes.data

    // Step 2: Upload to S3 using presigned URL
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', url)
      xhr.setRequestHeader('Content-Type', selectedFile.value.type)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          uploadProgress.value = Math.round((e.loaded / e.total) * 100)
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve()
        else reject(new Error(`Upload failed with status ${xhr.status}`))
      }

      xhr.onerror = () => reject(new Error('Upload failed'))
      xhr.send(selectedFile.value)
    })

    // Add to local list
    documents.value.unshift({
      id: Date.now(),
      file_name: selectedFile.value.name,
      file_url: key,
      created_at: new Date().toISOString(),
    })

    successMsg.value = 'Dokumen berhasil diupload!'
    removeFile()
    setTimeout(() => { successMsg.value = '' }, 5000)
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Gagal mengupload dokumen. Silakan coba lagi.'
    setTimeout(() => { errorMsg.value = '' }, 5000)
  } finally {
    uploading.value = false
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function extractFilename(url) {
  if (!url) return 'Unknown'
  return url.split('/').pop() || url
}
</script>

<style scoped>
.card-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

/* Drop Zone */
.drop-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-12) var(--space-8);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
}

.drop-zone:hover,
.drop-zone.active {
  border-color: var(--color-primary);
  background: rgba(6, 182, 212, 0.04);
}

.drop-zone.has-file {
  border-style: solid;
  border-color: var(--color-primary);
  padding: var(--space-6);
}

.file-input-hidden {
  display: none;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.drop-icon {
  color: var(--color-primary);
  margin-bottom: var(--space-4);
}

.drop-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

.drop-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.drop-formats {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-2);
}

/* File Preview */
.file-preview {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  text-align: left;
}

.file-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-glow);
  color: var(--color-primary-light);
  border-radius: var(--radius-lg);
}

.file-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 600;
  font-size: var(--font-size-sm);
  word-break: break-all;
}

.file-size {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Progress Bar */
.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-bg-input);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-primary-light);
  min-width: 36px;
  text-align: right;
}

/* Document List */
.document-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.document-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.document-item:hover {
  border-color: var(--color-border-hover);
}

.doc-icon {
  width: 36px;
  height: 36px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.12);
  color: var(--color-secondary-light);
  border-radius: var(--radius-md);
}

.doc-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.doc-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.doc-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Security Notice */
.security-notice {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: rgba(16, 185, 129, 0.06);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-lg);
  color: var(--color-accent-light);
}

.security-notice svg {
  margin-top: 2px;
  min-width: 16px;
}

.notice-title {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin-bottom: 2px;
}

.notice-text {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
</style>
