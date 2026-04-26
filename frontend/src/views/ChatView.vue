<template>
  <div class="chat-page">
    <div class="chat-container glass-card-static" style="padding:0;overflow:hidden;">
      <!-- Chat Sidebar — Contact List -->
      <div class="chat-sidebar">
        <div class="chat-sidebar-header">
          <h3>💬 Chat</h3>
          <button class="btn btn-ghost btn-sm" @click="startNewChat" id="new-chat-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        <div class="contact-list">
          <div
            v-for="contact in contacts"
            :key="contact.id"
            class="contact-item"
            :class="{ active: activeContact?.id === contact.id }"
            @click="selectContact(contact)"
          >
            <div class="contact-avatar" :style="{ background: contact.color }">
              {{ contact.name.charAt(0) }}
            </div>
            <div class="contact-info">
              <span class="contact-name">{{ contact.name }}</span>
              <span class="contact-last-msg">{{ contact.lastMessage || 'Mulai percakapan...' }}</span>
            </div>
            <div class="contact-meta">
              <span class="contact-time">{{ contact.lastTime || '' }}</span>
              <span v-if="contact.unread" class="unread-count">{{ contact.unread }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Main Area -->
      <div class="chat-main">
        <template v-if="activeContact">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="chat-header-info">
              <div class="chat-header-avatar" :style="{ background: activeContact.color }">
                {{ activeContact.name.charAt(0) }}
              </div>
              <div>
                <span class="chat-header-name">{{ activeContact.name }}</span>
                <span class="chat-header-status" :class="{ online: wsConnected }">
                  {{ wsConnected ? 'Online' : 'Offline' }}
                </span>
              </div>
            </div>
            <div class="chat-header-actions">
              <button class="btn btn-ghost btn-sm" aria-label="Video call">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              </button>
              <button class="btn btn-ghost btn-sm" aria-label="Phone call">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </button>
            </div>
          </div>

          <!-- Messages Area -->
          <div class="chat-messages" ref="messagesContainer">
            <div class="chat-date-divider">
              <span>Hari Ini</span>
            </div>

            <div
              v-for="(msg, i) in messages"
              :key="i"
              class="message-row"
              :class="{ 'message-sent': msg.isSent, 'message-received': !msg.isSent }"
            >
              <div class="message-bubble">
                <p class="message-text">{{ msg.text }}</p>
                <span class="message-time">{{ msg.time }}</span>
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="isTyping" class="message-row message-received">
              <div class="message-bubble typing-indicator">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </div>

          <!-- Chat Input -->
          <div class="chat-input-area">
            <button class="btn btn-ghost btn-sm" aria-label="Attach file">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <input
              v-model="newMessage"
              type="text"
              class="chat-input"
              placeholder="Ketik pesan..."
              @keyup.enter="sendMessage"
              id="chat-input"
            />
            <button
              class="btn btn-primary btn-sm send-btn"
              @click="sendMessage"
              :disabled="!newMessage.trim()"
              id="send-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </template>

        <!-- No Chat Selected -->
        <div v-else class="chat-empty">
          <div class="chat-empty-icon animate-float">💬</div>
          <h3 class="chat-empty-title">Pilih Percakapan</h3>
          <p class="chat-empty-text">Pilih kontak di sebelah kiri untuk memulai chat dengan dokter.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import wsService from '../services/websocket'

const authStore = useAuthStore()

const activeContact = ref(null)
const newMessage = ref('')
const messages = ref([])
const isTyping = ref(false)
const wsConnected = ref(false)
const messagesContainer = ref(null)

const contacts = ref([
  { id: 1, name: 'Dr. Budi Santoso', color: 'linear-gradient(135deg, #06b6d4, #0891b2)', lastMessage: 'Halo, ada yang bisa saya bantu?', lastTime: '14:30', unread: 2 },
  { id: 2, name: 'Dr. Sari Dewi', color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', lastMessage: 'Hasil lab sudah keluar', lastTime: '12:15', unread: 0 },
  { id: 3, name: 'Dr. Andi Pratama', color: 'linear-gradient(135deg, #10b981, #059669)', lastMessage: '', lastTime: '', unread: 0 },
  { id: 4, name: 'Dr. Maya Putri', color: 'linear-gradient(135deg, #f59e0b, #d97706)', lastMessage: 'Jangan lupa minum obat ya', lastTime: 'Kemarin', unread: 0 },
])

function selectContact(contact) {
  activeContact.value = contact
  contact.unread = 0

  // Load sample messages for demo
  messages.value = [
    { text: 'Halo Dok, saya ingin berkonsultasi.', isSent: true, time: '14:20' },
    { text: 'Halo! Tentu, silahkan ceritakan keluhannya.', isSent: false, time: '14:21' },
    { text: 'Saya mengalami sakit kepala yang berulang selama seminggu terakhir.', isSent: true, time: '14:23' },
    { text: 'Baik, apakah sakit kepalanya terasa berdenyut atau seperti ditekan?', isSent: false, time: '14:25' },
    { text: 'Terasa berdenyut, terutama di bagian kanan.', isSent: true, time: '14:27' },
    { text: 'Apakah Anda mengalami gejala lain seperti mual atau sensitif terhadap cahaya?', isSent: false, time: '14:28' },
  ]

  nextTick(() => scrollToBottom())
}

function sendMessage() {
  if (!newMessage.value.trim()) return

  const now = new Date()
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  messages.value.push({
    text: newMessage.value,
    isSent: true,
    time,
  })

  // Send via WebSocket if connected
  if (wsConnected.value) {
    wsService.sendMessage({
      sessionId: `session-${authStore.user?.id}-${activeContact.value.id}`,
      senderId: authStore.user?.id?.toString(),
      recipientId: activeContact.value.id.toString(),
      message: newMessage.value,
    })
  }

  newMessage.value = ''
  nextTick(() => scrollToBottom())

  // Simulate doctor reply for demo
  simulateReply()
}

function simulateReply() {
  isTyping.value = true
  nextTick(() => scrollToBottom())

  setTimeout(() => {
    isTyping.value = false
    const replies = [
      'Baik, saya catat. Mari kita lakukan pemeriksaan lebih lanjut.',
      'Terima kasih informasinya. Saya sarankan untuk melakukan beberapa tes.',
      'Saya mengerti keluhannya. Untuk saat ini, coba istirahat yang cukup ya.',
      'Apakah Anda sudah mencoba minum paracetamol? Jika belum, coba dulu 500mg.',
      'Baik, saya akan buatkan resep untuk Anda. Nanti bisa diambil di apotek.',
    ]

    const now = new Date()
    messages.value.push({
      text: replies[Math.floor(Math.random() * replies.length)],
      isSent: false,
      time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    })

    nextTick(() => scrollToBottom())
  }, 1500 + Math.random() * 2000)
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function startNewChat() {
  activeContact.value = null
  messages.value = []
}

// WebSocket lifecycle
function onWsConnected() { wsConnected.value = true }
function onWsDisconnected() { wsConnected.value = false }
function onWsMessage(data) {
  if (data.action === 'message') {
    messages.value.push({
      text: data.message,
      isSent: false,
      time: new Date(data.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    })
    nextTick(() => scrollToBottom())
  }
}

onMounted(() => {
  wsService.on('connected', onWsConnected)
  wsService.on('disconnected', onWsDisconnected)
  wsService.on('message', onWsMessage)

  // Try to connect to WebSocket
  const wsUrl = import.meta.env.VITE_WS_URL
  if (wsUrl && authStore.user?.id) {
    wsService.connect(wsUrl, authStore.user.id.toString())
  }
})

onUnmounted(() => {
  wsService.off('connected', onWsConnected)
  wsService.off('disconnected', onWsDisconnected)
  wsService.off('message', onWsMessage)
})
</script>

<style scoped>
.chat-page {
  height: calc(100vh - var(--navbar-height) - var(--space-16));
}

.chat-container {
  display: flex;
  height: 100%;
  min-height: 600px;
}

/* Chat Sidebar */
.chat-sidebar {
  width: 320px;
  min-width: 320px;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.chat-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.chat-sidebar-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.contact-list {
  flex: 1;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-bottom: 1px solid var(--color-border);
}

.contact-item:hover {
  background: var(--color-bg-hover);
}

.contact-item.active {
  background: rgba(6, 182, 212, 0.08);
  border-left: 3px solid var(--color-primary);
}

.contact-avatar {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: var(--font-size-lg);
}

.contact-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.contact-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.contact-last-msg {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.contact-time {
  font-size: 10px;
  color: var(--color-text-muted);
}

.unread-count {
  width: 20px;
  height: 20px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Chat Main */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Chat Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-glass);
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.chat-header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
}

.chat-header-name {
  display: block;
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.chat-header-status {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.chat-header-status.online {
  color: var(--color-accent);
}

.chat-header-status.online::before {
  content: '●';
  margin-right: 4px;
  font-size: 8px;
}

.chat-header-actions {
  display: flex;
  gap: var(--space-2);
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.chat-date-divider {
  text-align: center;
  margin: var(--space-4) 0;
}

.chat-date-divider span {
  padding: var(--space-1) var(--space-4);
  background: var(--color-bg-input);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.message-row {
  display: flex;
}

.message-sent {
  justify-content: flex-end;
}

.message-received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 65%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-xl);
  position: relative;
  animation: messageIn 0.3s ease;
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.message-sent .message-bubble {
  background: var(--gradient-primary);
  color: white;
  border-bottom-right-radius: var(--radius-sm);
}

.message-received .message-bubble {
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-bottom-left-radius: var(--radius-sm);
}

.message-text {
  font-size: var(--font-size-sm);
  line-height: 1.5;
  margin-bottom: 4px;
}

.message-time {
  font-size: 10px;
  opacity: 0.7;
  float: right;
  margin-top: 2px;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: var(--space-3) var(--space-4) !important;
}

.typing-indicator .dot {
  width: 6px;
  height: 6px;
  background: var(--color-text-muted);
  border-radius: 50%;
  animation: typingDot 1.4s infinite;
}

.typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingDot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* Chat Input */
.chat-input-area {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-glass);
}

.chat-input {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  font-family: var(--font-family);
}

.chat-input::placeholder {
  color: var(--color-text-muted);
}

.chat-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
  outline: none;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50% !important;
  padding: 0 !important;
}

/* Empty State */
.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-8);
}

.chat-empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-6);
}

.chat-empty-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.chat-empty-text {
  color: var(--color-text-secondary);
  max-width: 300px;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-sidebar {
    width: 72px;
    min-width: 72px;
  }

  .contact-info,
  .contact-meta {
    display: none;
  }

  .chat-sidebar-header h3 {
    display: none;
  }
}
</style>
