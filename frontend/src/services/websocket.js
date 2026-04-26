/**
 * WebSocket Service for Real-Time Chat
 * Manages WebSocket connection lifecycle and message handling.
 */

class WebSocketService {
  constructor() {
    this.ws = null
    this.url = null
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 2000
    this.isConnected = false
  }

  /**
   * Connect to the WebSocket server.
   * @param {string} url - WebSocket URL
   * @param {string} userId - User ID for identification
   */
  connect(url, userId) {
    this.url = `${url}?userId=${userId}`
    this._createConnection()
  }

  _createConnection() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        this._emit('connected')
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this._emit('message', data)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        this.isConnected = false
        this._emit('disconnected')

        // Auto-reconnect if not intentionally closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          const delay = this.reconnectDelay * this.reconnectAttempts
          console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`)
          setTimeout(() => this._createConnection(), delay)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this._emit('error', error)
      }
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
    }
  }

  /**
   * Send a chat message via WebSocket.
   * @param {Object} payload - Message payload
   */
  sendMessage(payload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected')
      return false
    }

    this.ws.send(JSON.stringify({
      action: 'sendMessage',
      ...payload,
    }))
    return true
  }

  /**
   * Register an event listener.
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * Remove an event listener.
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      this.listeners.set(event, callbacks.filter(cb => cb !== callback))
    }
  }

  /**
   * Emit an event to all listeners.
   */
  _emit(event, data) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(cb => cb(data))
    }
  }

  /**
   * Gracefully disconnect from WebSocket.
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected')
      this.ws = null
      this.isConnected = false
    }
  }
}

// Singleton instance
const wsService = new WebSocketService()
export default wsService
