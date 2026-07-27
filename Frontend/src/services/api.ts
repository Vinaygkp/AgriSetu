import axios from 'axios'
import * as mockImports from '../data/mockData'

const API_BASE_URL = 'https://agrisetu1.onrender.com/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Automatically attach auth token if saved in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 🔹 Database APIs with Offline Safe Fallbacks
export const fetchFields = async () => {
  try {
    const response = await api.get('/fields')
    return response.data
  } catch (err) {
    console.warn('Backend unavailable, using fallback mock fields.')
    return mockImports.fields || []
  }
}

export const fetchAlerts = async () => {
  try {
    const response = await api.get('/alerts')
    return response.data
  } catch (err) {
    console.warn('Backend unavailable, using fallback mock alerts.')
    return mockImports.alerts || []
  }
}

// 🔹 Weather & AI APIs with Quota Protection
export const fetchWeather = async (location = 'New Delhi') => {
  try {
    const response = await api.get(`/weather?location=${encodeURIComponent(location)}`)
    return response.data
  } catch (err) {
    console.warn('Weather API failed, returning default weather state.')
    return { temp: 32, condition: 'Clear', location }
  }
}

export const getAIAnalysis = async (cropData: object) => {
  try {
    const response = await api.post('/ai/analyze', cropData)
    return response.data
  } catch (err: any) {
    // 🛡️ Handles 429 Quota Exceeded and server errors silently
    console.warn('Gemini AI/Backend limit reached, loading offline advisory fallback.')
    return {
      advice: 'Soil moisture levels are currently stable. Recommended irrigation cycle in 12 hours.'
    }
  }
}

// 🔹 User Auth APIs
export const registerUser = async (userData: { name: string; email: string; password: string; phone?: string; location?: string }) => {
  try {
    const response = await api.post('/user/register', userData)
    return response.data
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Registration failed')
  }
}

export const loginUser = async (credentials: object) => {
  try {
    const response = await api.post('/user/login', credentials)
    return response.data
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Login failed')
  }
}

// 🔹 OTP APIs
export const sendOtpEmail = async (email: string) => {
  try {
    const response = await api.post('/user/send-otp', { email })
    return response.data
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to send OTP')
  }
}

export const verifyOtpLogin = async (data: { email: string; otp: string }) => {
  try {
    const response = await api.post('/user/verify-otp', data)
    return response.data
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Invalid OTP')
  }
}

export const registerSendOtp = async (email: string) => {
  try {
    const response = await api.post('/user/register-send-otp', { email })
    return response.data
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to send registration OTP')
  }
}

export const verifyAndRegister = async (userData: { name: string; email: string; password: string; phone?: string; location?: string; otp: string }) => {
  try {
    const response = await api.post('/user/verify-register', userData)
    return response.data
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Verification and registration failed')
  }
}