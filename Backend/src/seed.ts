import mongoose from 'mongoose'
import dotenv from 'dotenv'
import dns from 'dns'
import { Field, Alert } from './models'

dns.setServers(['8.8.8.8', '1.1.1.1'])

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/agrovision'

async function seed() {
  await mongoose.connect(MONGO_URI, { dbName: 'AgroVisionDB' })
  console.log('🍃 Connected to MongoDB for seeding...')

  await Field.deleteMany({})
  await Alert.deleteMany({})

  const fields = await Field.insertMany([
    { name: 'North Field', crop: 'Corn', area: '45 acres', status: 'excellent', color: '#18C964', healthScore: 92 },
    { name: 'South Field', crop: 'Soybeans', area: '30 acres', status: 'good', color: '#00D4FF', healthScore: 84 },
    { name: 'East Greenhouse', crop: 'Tomatoes', area: '12 acres', status: 'excellent', color: '#18C964', healthScore: 95 },
    { name: 'West Orchard', crop: 'Apples', area: '25 acres', status: 'warning', color: '#FBBF24', healthScore: 68 },
  ])

  await Alert.insertMany([
    { title: 'Low Soil Moisture', fieldId: fields[3]._id, value: '43%', type: 'critical', icon: '⚠️' },
    { title: 'High Temp Alert', fieldId: fields[2]._id, value: '34°C', type: 'warning', icon: '🌡️' },
  ])

  console.log('✅ Seed Data Inserted Successfully!')
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seeding Error:', err)
  process.exit(1)
})