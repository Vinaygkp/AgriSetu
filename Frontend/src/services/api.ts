import axios from 'axios'
import * as mockImports from '../data/mockData'

export const API_BASE_URL = 'https://agrisetu1.onrender.com/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 40000, // 💡 Render cold start handle karne ke liye 40 seconds badha diya hai
  headers: {
    'Content-Type': 'application/json',
  },
})

// Automatically attach auth token if saved in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Helper function to extract exact backend error string with Detailed Logs
const getErrorMessage = (err: any, fallback: string) => {
  // Console logging taaki exact cause F12 console mein dikhe
  console.error('API Error Details:', {
    message: err.message,
    response: err.response?.data,
    status: err.response?.status,
  })

  if (err.code === 'ECONNABORTED') {
    return 'Server response time out. Render backend is waking up, please try again in 15 seconds.'
  }

  return err.response?.data?.error || err.response?.data?.message || err.message || fallback
}

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
    console.warn('Gemini AI/Backend limit reached, loading offline advisory fallback.')
    return {
      advice: 'Soil moisture levels are currently stable. Recommended irrigation cycle in 12 hours.',
    }
  }
}

// 🔹 User Auth APIs
export const registerUser = async (userData: { name: string; email: string; password: string; phone?: string; location?: string }) => {
  try {
    const response = await api.post('/user/register', {
      ...userData,
      email: userData.email.trim().toLowerCase(),
    })
    return response.data
  } catch (err: any) {
    throw new Error(getErrorMessage(err, 'Registration failed'))
  }
}

export const loginUser = async (credentials: object) => {
  try {
    const response = await api.post('/user/login', credentials)
    return response.data
  } catch (err: any) {
    throw new Error(getErrorMessage(err, 'Login failed'))
  }
}

// 🔹 OTP APIs
export const sendOtpEmail = async (email: string) => {
  try {
    const cleanEmail = email.trim().toLowerCase()
    const response = await api.post('/user/send-otp', { email: cleanEmail })
    return response.data
  } catch (err: any) {
    throw new Error(getErrorMessage(err, 'Failed to send OTP'))
  }
}

export const verifyOtpLogin = async (data: { email: string; otp: string }) => {
  try {
    const response = await api.post('/user/verify-otp', {
      email: data.email.trim().toLowerCase(),
      otp: data.otp.trim(),
    })
    return response.data
  } catch (err: any) {
    throw new Error(getErrorMessage(err, 'Invalid OTP'))
  }
}

export const registerSendOtp = async (email: string) => {
  try {
    const cleanEmail = email.trim().toLowerCase()
    const response = await api.post('/user/register-send-otp', { email: cleanEmail })
    return response.data
  } catch (err: any) {
    throw new Error(getErrorMessage(err, 'Failed to send registration OTP'))
  }
}

export const verifyAndRegister = async (userData: { name: string; email: string; password: string; phone?: string; location?: string; otp: string }) => {
  try {
    const response = await api.post('/user/verify-register', {
      ...userData,
      email: userData.email.trim().toLowerCase(),
      otp: userData.otp.trim(),
    })
    return response.data
  } catch (err: any) {
    throw new Error(getErrorMessage(err, 'Verification and registration failed'))
  }
}