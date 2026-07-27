export const soilMoistureData = [
  { time: '00:00', north: 68, south: 54, east: 72, west: 38 },
  { time: '02:00', north: 66, south: 52, east: 70, west: 36 },
  { time: '04:00', north: 65, south: 51, east: 69, west: 35 },
  { time: '06:00', north: 70, south: 55, east: 74, west: 40 },
  { time: '08:00', north: 74, south: 59, east: 78, west: 42 },
  { time: '10:00', north: 79, south: 63, east: 82, west: 44 },
  { time: '12:00', north: 75, south: 61, east: 79, west: 43 },
  { time: '14:00', north: 72, south: 59, east: 76, west: 41 },
  { time: '16:00', north: 71, south: 57, east: 75, west: 40 },
  { time: '18:00', north: 73, south: 58, east: 77, west: 41 },
  { time: '20:00', north: 70, south: 56, east: 73, west: 39 },
  { time: 'Now',  north: 69, south: 57, east: 71, west: 37 },
]

export const temperatureData = [
  { time: '00:00', temp: 17, feels: 15 },
  { time: '02:00', temp: 16, feels: 14 },
  { time: '04:00', temp: 15, feels: 13 },
  { time: '06:00', temp: 18, feels: 17 },
  { time: '08:00', temp: 22, feels: 21 },
  { time: '10:00', temp: 27, feels: 29 },
  { time: '12:00', temp: 32, feels: 35 },
  { time: '14:00', temp: 33, feels: 36 },
  { time: '16:00', temp: 30, feels: 33 },
  { time: '18:00', temp: 26, feels: 28 },
  { time: '20:00', temp: 22, feels: 21 },
  { time: 'Now',  temp: 24, feels: 23 },
]

export const npkData = [
  { field: 'North',    N: 82, P: 67, K: 74 },
  { field: 'South',   N: 74, P: 71, K: 68 },
  { field: 'East',    N: 91, P: 84, K: 79 },
  { field: 'West',    N: 58, P: 62, K: 71 },
]

export const weeklyGrowthData = [
  { week: 'W1', yield: 72, target: 80 },
  { week: 'W2', yield: 78, target: 80 },
  { week: 'W3', yield: 75, target: 80 },
  { week: 'W4', yield: 83, target: 80 },
  { week: 'W5', yield: 88, target: 82 },
  { week: 'W6', yield: 91, target: 82 },
  { week: 'W7', yield: 94, target: 85 },
  { week: 'W8', yield: 97, target: 85 },
]

export const fields = [
  {
    id: 1,
    name: 'North Field',
    crop: 'Corn',
    area: '45 acres',
    status: 'excellent',
    color: '#18C964',
    moisture: 69,
    temp: 24,
    humidity: 68,
    nitrogen: 82,
    phosphorus: 67,
    potassium: 74,
    growth: 'Growing (V8)',
    harvest: 'Sept 15, 2025',
    sensors: 8,
    healthScore: 94,
  },
  {
    id: 2,
    name: 'South Field',
    crop: 'Soybeans',
    area: '38 acres',
    status: 'good',
    color: '#00D4FF',
    moisture: 57,
    temp: 26,
    humidity: 62,
    nitrogen: 74,
    phosphorus: 71,
    potassium: 68,
    growth: 'Flowering (R2)',
    harvest: 'Oct 2, 2025',
    sensors: 6,
    healthScore: 82,
  },
  {
    id: 3,
    name: 'East Greenhouse',
    crop: 'Tomatoes',
    area: '12 acres',
    status: 'excellent',
    color: '#36D399',
    moisture: 71,
    temp: 28,
    humidity: 75,
    nitrogen: 91,
    phosphorus: 84,
    potassium: 79,
    growth: 'Ripening (Breaker)',
    harvest: 'Aug 28, 2025',
    sensors: 12,
    healthScore: 96,
  },
  {
    id: 4,
    name: 'West Orchard',
    crop: 'Apple Trees',
    area: '29 acres',
    status: 'moderate',
    color: '#FBBF24',
    moisture: 43,
    temp: 23,
    humidity: 55,
    nitrogen: 58,
    phosphorus: 62,
    potassium: 71,
    growth: 'Fruiting (Stage 3)',
    harvest: 'Sept 30, 2025',
    sensors: 5,
    healthScore: 61,
  },
]

export const alerts = [
  { id: 1, type: 'critical', icon: '💧', title: 'Low Moisture Detected', field: 'West Orchard', value: '43% (Min: 50%)', time: '2 min ago', unread: true },
  { id: 2, type: 'warning',  icon: '🌡️', title: 'High Temperature Alert', field: 'South Field', value: '33°C (Max: 30°C)', time: '18 min ago', unread: true },
  { id: 3, type: 'warning',  icon: '🧪', title: 'Low Nitrogen Level', field: 'West Orchard', value: 'N: 58 (Optimal: 80)', time: '1 hr ago', unread: false },
  { id: 4, type: 'info',     icon: '📡', title: 'Sensor Back Online', field: 'North Field', value: 'Sensor NF-07 restored', time: '2 hrs ago', unread: false },
  { id: 5, type: 'critical', icon: '🚿', title: 'Irrigation Required', field: 'West Orchard', value: 'Schedule overdue', time: '3 hrs ago', unread: false },
]

export const activities = [
  { id: 1, type: 'sensor',  title: 'Sensor Calibrated', detail: 'North Field — Moisture sensor NF-03 calibrated', time: '5 min ago', color: '#18C964' },
  { id: 2, type: 'alert',   title: 'Alert Resolved', detail: 'South Field — Temperature normalized to 26°C', time: '23 min ago', color: '#36D399' },
  { id: 3, type: 'weather', title: 'Weather Updated', detail: 'Rain forecast tomorrow at 78% probability', time: '1 hr ago', color: '#00D4FF' },
  { id: 4, type: 'farmer',  title: 'Farmer Added', detail: 'John Smith joined Green Valley Farm workspace', time: '3 hrs ago', color: '#FBBF24' },
  { id: 5, type: 'report',  title: 'Report Generated', detail: 'Monthly analytics report for July 2025 ready', time: '5 hrs ago', color: '#8BA89D' },
  { id: 6, type: 'ai',      title: 'AI Recommendation', detail: 'New irrigation schedule generated for West Orchard', time: '6 hrs ago', color: '#18C964' },
]

export const weatherForecast = [
  { day: 'Mon', high: 32, low: 20, icon: '☀️', rain: 5 },
  { day: 'Tue', high: 29, low: 18, icon: '⛅', rain: 22 },
  { day: 'Wed', high: 23, low: 15, icon: '🌧️', rain: 78 },
  { day: 'Thu', high: 20, low: 14, icon: '⛈️', rain: 85 },
  { day: 'Fri', high: 25, low: 16, icon: '🌤️', rain: 30 },
  { day: 'Sat', high: 28, low: 17, icon: '☀️', rain: 8 },
  { day: 'Sun', high: 31, low: 19, icon: '☀️', rain: 4 },
]

export const aiRecommendations = [
  { priority: 'high',   action: 'Irrigate West Orchard', detail: 'Apply 2.4mm water immediately — moisture critically low', confidence: 97 },
  { priority: 'medium', action: 'Fertilize South Field', detail: 'Apply 22 kg/ha Nitrogen before next rainfall', confidence: 89 },
  { priority: 'low',    action: 'Pest Monitoring', detail: 'Aphid risk detected in North Field — scout recommended', confidence: 73 },
  { priority: 'low',    action: 'Optimize Irrigation', detail: 'Shift irrigation window to 6–7 AM to reduce evaporation', confidence: 91 },
]

export const features = [
  { icon: '📡', title: 'Real-Time Monitoring', desc: 'Live sensor feeds with sub-second latency from every corner of your farm.', color: '#18C964' },
  { icon: '🧠', title: 'AI Crop Insights', desc: 'Machine learning models trained on 50M+ data points predict yield and risk.', color: '#00D4FF' },
  { icon: '🌦️', title: 'Weather Intelligence', desc: '7-day hyper-local forecasting integrated directly with your field data.', color: '#36D399' },
  { icon: '📊', title: 'Sensor Analytics', desc: 'Visualize NPK, pH, moisture and temperature trends across all zones.', color: '#FBBF24' },
  { icon: '🔬', title: 'Disease Detection', desc: 'Early warning system for 200+ plant diseases with 94% accuracy.', color: '#F43F5E' },
  { icon: '☁️', title: 'Cloud Synchronization', desc: 'All farm data synced in real time with 99.9% uptime guarantee.', color: '#8B5CF6' },
  { icon: '📈', title: 'Interactive Charts', desc: 'Drill down into any metric with beautiful, exportable chart dashboards.', color: '#00D4FF' },
  { icon: '🔔', title: 'Smart Alerts', desc: 'Threshold-based alerts delivered via app, SMS, or email instantly.', color: '#18C964' },
]
