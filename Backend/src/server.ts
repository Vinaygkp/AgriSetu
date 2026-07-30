import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import dns from 'dns'
import axios from 'axios'
import nodemailer from 'nodemailer'
import { Field, Sensor, Alert } from './models'

// Direct Google & Cloudflare DNS set kar rahe hain SRV query error bypass karne ke liye
dns.setServers(['8.8.8.8', '1.1.1.1'])

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/agrovision'

// 💡 Enable full CORS access for frontend apps
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

/* ── NODEMAILER TRANSPORTER SETUP (PORT 587 FOR RENDER) ── */
const EMAIL_USER = process.env.EMAIL_USER || 'vinay555ti@gmail.com'
const RAW_EMAIL_PASS = process.env.EMAIL_PASS || ''
const EMAIL_PASS = RAW_EMAIL_PASS.replace(/\s+/g, '') // Auto-remove spaces

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Port 587 uses STARTTLS
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
  tls: {
    rejectUnauthorized: false,
  },
})

// Startup Verification
transporter.verify((error) => {
  if (error) {
    console.error('❌ Nodemailer SMTP Verification Error:', error.message)
  } else {
    console.log('⚡ Nodemailer is ready on Port 587 to send OTP emails!')
  }
})

/* ── USER AUTH INTERFACE & SCHEMA ── */
interface IUser {
  name: string
  email: string
  password: string
  phone?: string
  location?: string
  farmName?: string
  otp?: string
  otpExpires?: Date
  isVerified?: boolean
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    farmName: { type: String, default: 'My Farm' },
    otp: { type: String, default: '' },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', userSchema)

// Base Route Test
app.get('/', (req, res) => {
  res.send({ status: 'AgriSetu Backend Running 🚀' })
})

/* ── AUTH & OTP API ROUTES ── */

// 1. REGISTER SEND OTP
app.post('/api/user/register-send-otp', async (req, res) => {
  try {
    let { email } = req.body
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }
    email = email.trim().toLowerCase()

    const existingUser = await User.findOne({ email, isVerified: true })
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

    let user = await User.findOne({ email })
    if (user) {
      user.otp = otp
      user.otpExpires = otpExpires
      await user.save()
    } else {
      user = new User({
        name: 'Pending',
        email,
        password: 'TEMP_PASSWORD',
        otp,
        otpExpires,
        isVerified: false,
      })
      await user.save()
    }

    await transporter.sendMail({
      from: `"AgriSetu Support" <${EMAIL_USER}>`,
      to: email,
      subject: 'Your AgriSetu Registration OTP',
      text: `Your Registration OTP is: ${otp}. It is valid for 10 minutes.`,
    })

    return res.json({ success: true, message: 'OTP sent to your email for registration!' })
  } catch (err: any) {
    console.error('Register OTP Error:', err)
    return res.status(500).json({ error: err.message || 'Failed to send registration OTP' })
  }
})

// 2. VERIFY REGISTER OTP & SAVE DETAILS
app.post('/api/user/verify-register', async (req, res) => {
  try {
    let { name, email, password, phone, location, otp } = req.body

    if (!email || !otp || !name || !password) {
      return res.status(400).json({ error: 'All fields including OTP are required' })
    }
    email = email.trim().toLowerCase()

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ error: 'Registration session not found. Please resend OTP.' })
    }

    if (user.otp !== otp.toString().trim() || (user.otpExpires && user.otpExpires < new Date())) {
      return res.status(400).json({ error: 'Invalid or expired OTP' })
    }

    user.name = name
    user.password = password
    user.phone = phone || ''
    user.location = location || ''
    user.otp = ''
    user.otpExpires = undefined
    user.isVerified = true
    await user.save()

    return res.status(201).json({
      success: true,
      message: 'Account registered and verified successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
      },
      token: `token_${user._id}`,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Registration verification failed' })
  }
})

// 3. LOGIN SEND OTP
app.post('/api/user/send-otp', async (req, res) => {
  try {
    let { email } = req.body
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }
    email = email.trim().toLowerCase()

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

    let user = await User.findOne({ email, isVerified: true })
    if (user) {
      user.otp = otp
      user.otpExpires = otpExpires
      await user.save()
    } else {
      return res.status(404).json({ error: 'User not found. Please register first.' })
    }

    await transporter.sendMail({
      from: `"AgriSetu Support" <${EMAIL_USER}>`,
      to: email,
      subject: 'Your AgriSetu Login OTP',
      text: `Your One-Time Password (OTP) for AgriSetu is: ${otp}. It is valid for 10 minutes.`,
    })

    return res.json({ success: true, message: 'OTP sent successfully to your email!' })
  } catch (err: any) {
    console.error('OTP Send Error:', err)
    return res.status(500).json({ error: err.message || 'Failed to send OTP email' })
  }
})

// 4. LOGIN WITH PASSWORD
app.post('/api/user/login', async (req, res) => {
  try {
    let { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password' })
    }
    email = email.trim().toLowerCase()

    const user = await User.findOne({ email, password, isVerified: true })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
      },
      token: `token_${user._id}`,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Login failed' })
  }
})

// 5. VERIFY OTP & LOGIN
app.post('/api/user/verify-otp', async (req, res) => {
  try {
    let { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' })
    }
    email = email.trim().toLowerCase()

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.otp !== otp.toString().trim() || (user.otpExpires && user.otpExpires < new Date())) {
      return res.status(400).json({ error: 'Invalid or expired OTP' })
    }

    user.otp = ''
    user.otpExpires = undefined
    await user.save()

    return res.json({
      success: true,
      message: 'OTP verified & Logged in successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
      },
      token: `token_${user._id}`,
    })
  } catch (err) {
    return res.status(500).json({ error: 'OTP verification failed' })
  }
})

/* ── FIELDS API ── */
app.get('/api/fields', async (req, res) => {
  try {
    const fields = await Field.find()
    res.json(fields)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fields' })
  }
})

app.post('/api/fields', async (req, res) => {
  try {
    const { name, crop, area } = req.body
    const newField = new Field({ name, crop, area })
    await newField.save()
    res.json(newField)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create field' })
  }
})

/* ── ALERTS API ── */
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find({ resolved: false }).populate('fieldId')
    res.json(alerts)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' })
  }
})

app.patch('/api/alerts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params
    const updated = await Alert.findByIdAndUpdate(id, { resolved: true }, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve alert' })
  }
})

/* ── WEATHER API ROUTE ── */
app.get('/api/weather', async (req, res) => {
  try {
    const city = (req.query.location as string) || 'New Delhi'
    const apiKey = process.env.OPENWEATHER_API_KEY

    if (!apiKey) {
      return res.json({
        city,
        temp: 31,
        condition: 'Partly Cloudy',
        humidity: 65,
      })
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    )
    res.json(response.data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather data' })
  }
})

/* ── LOCAL SMART AI ADVISOR ENGINE ── */
function getLocalSmartAdvice(crop: string, moisture: number, temp: number): string {
  const cropName = crop || 'Wheat'
  let advicePoints: string[] = []

  if (moisture < 45) {
    advicePoints.push(`• Low moisture detected (${moisture}%). Initiate a 45-min drip irrigation cycle for ${cropName}.`)
  } else if (moisture > 75) {
    advicePoints.push(`• High moisture content (${moisture}%). Pause automated irrigation to prevent root rot in ${cropName}.`)
  } else {
    advicePoints.push(`• Soil moisture (${moisture}%) is optimal for healthy ${cropName} growth. Maintain current schedule.`)
  }

  if (temp > 32) {
    advicePoints.push(`• High ambient temperature (${temp}°C). Apply shade netting and consider early morning micro-sprinkling.`)
  } else if (temp < 15) {
    advicePoints.push(`• Low temperature alert (${temp}°C). Monitor soil warmth and delay nitrogen fertilizer application.`)
  } else {
    advicePoints.push(`• Temperature (${temp}°C) is ideal. Nitrogen and Potassium absorption rates are optimal.`)
  }

  return advicePoints.join('\n')
}

/* ── AI ADVISOR ROUTE ── */
app.post('/api/ai/analyze', (req, res) => {
  try {
    const { crop, moisture, temp } = req.body

    const numMoisture = Number(moisture) || 43
    const numTemp = Number(temp) || 28

    const adviceText = getLocalSmartAdvice(crop, numMoisture, numTemp)

    res.json({ advice: adviceText })
  } catch (err) {
    res.json({
      advice: '• Increase soil irrigation by 15% during morning hours.\n• Monitor Nitrogen fertilizer levels to boost yield.',
    })
  }
})

// MongoDB Connection
mongoose.connect(MONGO_URI, {
  dbName: 'AgroVisionDB',
})
.then(() => console.log('🍃 Connected to MongoDB Databases via DNS Fix!'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err))

app.listen(PORT, () => {
  console.log(`✅ AgriSetu Server running on http://localhost:${PORT}`)
})