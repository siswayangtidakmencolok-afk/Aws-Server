import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.email?.split('@')[0] || 'User')

  // Actions
  async function login(email, password) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/login', { email, password })
      const data = response.data

      token.value = data.token
      user.value = data.user

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Set default auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Login failed. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(email, password, role = 'patient') {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/register', { email, password, role })
      const data = response.data

      token.value = data.token
      user.value = data.user

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Registration failed. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    error.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    delete api.defaults.headers.common['Authorization']
  }

  function clearError() {
    error.value = null
  }

  // Initialize auth header if token exists
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    userRole,
    userName,
    login,
    register,
    logout,
    clearError,
  }
})
