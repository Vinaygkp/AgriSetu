import mongoose, { Schema, Document } from 'mongoose'

/* ── 1. Field Model ── */
export interface IField extends Document {
  name: string
  crop: string
  area: string
  status: string
  color: string
  healthScore: number
}

const FieldSchema = new Schema<IField>({
  name: { type: String, required: true },
  crop: { type: String, required: true },
  area: { type: String, required: true },
  status: { type: String, default: 'good' },
  color: { type: String, default: '#18C964' },
  healthScore: { type: Number, default: 85 },
}, { timestamps: true })

export const Field = mongoose.model<IField>('Field', FieldSchema)

/* ── 2. Sensor Model ── */
export interface ISensor extends Document {
  sensorId: string
  fieldId: mongoose.Types.ObjectId
  type: string
  value: string
  status: string
  battery: number
  signal: number
}

const SensorSchema = new Schema<ISensor>({
  sensorId: { type: String, required: true },
  fieldId: { type: Schema.Types.ObjectId, ref: 'Field', required: true },
  type: { type: String, required: true },
  value: { type: String, required: true },
  status: { type: String, default: 'online' },
  battery: { type: Number, default: 100 },
  signal: { type: Number, default: 90 },
}, { timestamps: true })

export const Sensor = mongoose.model<ISensor>('Sensor', SensorSchema)

/* ── 3. Alert Model ── */
export interface IAlert extends Document {
  title: string
  fieldId: mongoose.Types.ObjectId
  value: string
  type: string
  icon: string
  resolved: boolean
}

const AlertSchema = new Schema<IAlert>({
  title: { type: String, required: true },
  fieldId: { type: Schema.Types.ObjectId, ref: 'Field' },
  value: { type: String, required: true },
  type: { type: String, default: 'warning' },
  icon: { type: String, default: '⚠️' },
  resolved: { type: Boolean, default: false },
}, { timestamps: true })

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema)