import React, { useState, useEffect, useRef } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  LayoutDashboard, MapPin, Radio, BarChart3, Cloud, Bell, Brain,
  FileText, Tablet, Settings, User, LogOut, Search, MessageCircle,
  Thermometer, Droplets, Wind, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Shield, Download, RefreshCw, Plus,
  Phone, Mail, ShieldCheck, Cpu, Layers, Edit3, Save, X
} from 'lucide-react'

import { fetchFields, fetchAlerts, fetchWeather, getAIAnalysis } from '../services/api'
import { AIInsightsView as ImportedAIView } from '../components/AIChat'

// Mock Data Imports with Fallbacks to prevent crashes
import * as mockImports from '../data/mockData'

// Types Definition
export type NavId = 'dashboard' | 'fields' | 'sensors' | 'analytics' | 'weather' | 'alerts' | 'ai' | 'reports' | 'devices' | 'settings' | 'profile'

export interface FieldItem {
  id: number
  name: string
  crop: string
  area: string
  status: 'excellent' | 'good' | 'warning' | 'critical' | 'offline' | string
  color: string
  sensors: number
  healthScore: number
  moisture?: number
  temp?: number
  humidity?: number
  nitrogen?: number
  phosphorus?: number
  potassium?: number
  growth?: string
  harvest?: string
}

export interface AlertItem {
  id: number | string
  title: string
  field: string
  value: string
  time: string
  type: 'critical' | 'warning' | 'info' | string
  icon: string
  unread?: boolean
}

export interface ActivityItem {
  id: number | string
  title: string
  detail: string
  time: string
  type: string
  color: string
}

export interface AIRecommendationItem {
  action: string
  detail: string
  priority: 'high' | 'medium' | 'low' | string
  confidence: number
}

// Clean Nav Items without Badges (Removed 2 and 3 counters)
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'fields', label: 'Fields', icon: MapPin },
  { id: 'sensors', label: 'Sensors', icon: Radio },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'weather', label: 'Weather', icon: Cloud },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'ai', label: 'AI Insights', icon: Brain },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'devices', label: 'Devices', icon: Tablet },
]

const NAV_BOTTOM: { id: NavId; label: string; icon: React.ReactNode }[] = [
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
]

interface Props {
  onLogout: () => void
  theme?: 'dark' | 'light'
  setTheme?: (t: 'dark' | 'light') => void
  language?: string
  setLanguage?: (l: string) => void
}

export default function Dashboard({ 
  onLogout, 
  theme = 'dark', 
  setTheme, 
  language = 'English (US)', 
  setLanguage 
}: Props) {
  const [activeNav, setActiveNav] = useState<NavId>('dashboard')
  const [selectedField, setSelectedField] = useState<number>(0)
  const [notifOpen, setNotifOpen] = useState<boolean>(false)

  // 🔹 All States inside Component
  const [soilMoistureData] = useState(mockImports.soilMoistureData || [])
  const [temperatureData] = useState(mockImports.temperatureData || [])
  const [npkData] = useState(mockImports.npkData || [])
  const [weeklyGrowthData] = useState(mockImports.weeklyGrowthData || [])
  const [fields, setFields] = useState<FieldItem[]>(mockImports.fields || [])
  const [alerts, setAlerts] = useState<AlertItem[]>(mockImports.alerts || [])
  const [activities] = useState(mockImports.activities || [])
  const [weatherForecast] = useState(mockImports.weatherForecast || [])
  const [aiRecommendations] = useState(mockImports.aiRecommendations || [])

  const [liveWeather, setLiveWeather] = useState<any>(null)
  const [aiAdviceText, setAiAdviceText] = useState<string>('')

  // 🔹 Live Backend & Third-Party API Sync
  const loadLiveDashboardData = async () => {
    try {
      const [fieldsData, alertsData, weatherData] = await Promise.all([
        fetchFields().catch(() => null),
        fetchAlerts().catch(() => null),
        fetchWeather('New Delhi').catch(() => null)
      ])

      if (fieldsData && fieldsData.length > 0) setFields(fieldsData)
      if (alertsData && alertsData.length > 0) setAlerts(alertsData)
      if (weatherData) setLiveWeather(weatherData)

      // Gemini AI Analysis Call
      const cropName = (fieldsData && fieldsData[0]?.crop) || 'Corn'
      const aiRes = await getAIAnalysis({ crop: cropName, moisture: 43, temp: 30 }).catch(() => null)
      if (aiRes?.advice) setAiAdviceText(aiRes.advice)
    } catch (err) {
      console.error('Live data error:', err)
    }
  }

  useEffect(() => {
    loadLiveDashboardData()
    const interval = setInterval(loadLiveDashboardData, 300000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      style={{ 
        display: 'flex', 
        height: '100vh', 
        overflow: 'hidden', 
        background: theme === 'light' ? '#F4F6F8' : '#05070A',
        color: theme === 'light' ? '#0F172A' : '#F0FFF4',
        transition: 'background 0.3s ease, color 0.3s ease'
      }}
    >
      {/* Sidebar */}
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} onLogout={onLogout} />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* TopNav */}
        <TopNav 
          notifOpen={notifOpen} 
          setNotifOpen={setNotifOpen} 
          alertsList={alerts} 
          setActiveNav={setActiveNav}
        />

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {/* MainDashboard with Live Props */}
          {activeNav === 'dashboard' && (
            <MainDashboard
              selectedField={selectedField}
              setSelectedField={setSelectedField}
              setActiveNav={setActiveNav}
              liveFields={fields}
              liveAlerts={alerts}
              liveWeather={liveWeather}
              aiAdviceText={aiAdviceText}
              soilMoistureData={soilMoistureData}
              temperatureData={temperatureData}
              npkData={npkData}
              weeklyGrowthData={weeklyGrowthData}
              activities={activities}
              weatherForecast={weatherForecast}
              aiRecommendations={aiRecommendations}
            />
          )}

          {activeNav === 'fields' && <FieldsView setActiveNav={setActiveNav} setSelectedField={setSelectedField} liveFields={fields} />}
          {activeNav === 'sensors' && <SensorsView />}
          {activeNav === 'analytics' && <AnalyticsView />}
          {activeNav === 'weather' && <WeatherView />}
          {activeNav === 'alerts' && <AlertsView />}
          {activeNav === 'ai' && <ImportedAIView />}
          {activeNav === 'reports' && <ReportsView />}
          {activeNav === 'profile' && <ProfileView />}
          
          {/* SettingsView */}
          {activeNav === 'settings' && (
            <SettingsView 
              theme={theme} 
              setTheme={setTheme} 
              language={language} 
              setLanguage={setLanguage} 
            />
          )}
          
          {activeNav === 'devices' && <DevicesView />}
        </main>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════ */
interface SidebarProps {
  activeNav: NavId
  setActiveNav: React.Dispatch<React.SetStateAction<NavId>>
  onLogout?: () => void
}

export function Sidebar({ activeNav, setActiveNav, onLogout }: SidebarProps) {
  // LocalStorage se logged-in user name read karo
  const loggedInName = localStorage.getItem('userName') || localStorage.getItem('agrovision_user_name') || 'Vinay Kumar'

  // Dynamic Initials (e.g. "Vinay Kumar" -> "VK")
  const userInitials = loggedInName
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'VK'

  return (
    <aside style={{
      width: 260,
      height: '100vh',
      background: '#070A0E',
      borderRight: '1px solid rgba(24,201,100,0.15)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 16px',
      boxSizing: 'border-box',
      position: 'sticky',
      top: 0,
      overflowY: 'auto'
    }}>
      {/* Brand Logo Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, paddingLeft: 6 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'rgba(24,201,100,0.15)',
          border: '1px solid rgba(24,201,100,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#18C964'
        }}>
          <BarChart3 size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#F0FFF4', margin: 0, letterSpacing: '-0.02em' }}>AgriSetu</h1>
          <span style={{ fontSize: 10, color: '#18C964', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>ANALYTICS v4.2</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.id
          const IconComponent = item.icon

          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id as NavId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 12,
                background: isActive ? 'rgba(24,201,100,0.12)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(24,201,100,0.3)' : 'transparent'}`,
                color: isActive ? '#18C964' : '#8BA89D',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <IconComponent size={18} />
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Pro Features Clickable Promo Card */}
      <button
        onClick={() => setActiveNav('ai' as NavId)}
        style={{
          background: activeNav === ('ai' as NavId)
            ? 'linear-gradient(135deg, rgba(24,201,100,0.2) 0%, rgba(0,212,255,0.15) 100%)'
            : 'linear-gradient(135deg, rgba(24,201,100,0.08) 0%, rgba(0,212,255,0.05) 100%)',
          border: `1px solid ${activeNav === ('ai' as NavId) ? 'rgba(24,201,100,0.5)' : 'rgba(24,201,100,0.2)'}`,
          borderRadius: 14,
          padding: '12px 14px',
          margin: '16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minHeight: 52,
          boxSizing: 'border-box',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ fontSize: 22, lineHeight: 1 }}>🚀</span>
        <div>
          <div style={{ color: '#F0FFF4', fontSize: 12, fontWeight: 700 }}>Pro Features</div>
          <div style={{ color: '#8BA89D', fontSize: 10 }}>Unlimited AI Telemetry</div>
        </div>
      </button>

      {/* Bottom Settings & Profile Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
        {NAV_BOTTOM.map((item) => {
          const isActive = activeNav === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 12,
                background: isActive ? 'rgba(24,201,100,0.12)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(24,201,100,0.3)' : 'transparent'}`,
                color: isActive ? '#18C964' : '#8BA89D',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}

        <button
          onClick={() => onLogout ? onLogout() : alert('Logged out')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 12,
            background: 'transparent',
            border: 'none',
            color: '#8BA89D',
            fontSize: 14,
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>

      {/* Dynamic User Profile Card */}
      <div style={{
        marginTop: 12,
        padding: '10px 12px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: '#18C964', color: '#03100A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 12
        }}>
          {userInitials}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: '#F0FFF4', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {loggedInName}
          </div>
          <div style={{ color: '#8BA89D', fontSize: 10 }}>Farm Director</div>
        </div>
      </div>
    </aside>
  )
}
/* ══════════════════════════════════════════════════
   TOP NAV
══════════════════════════════════════════════════ */
interface TopNavProps {
  notifOpen: boolean
  setNotifOpen: (b: boolean) => void
  setActiveNav?: (nav: any) => void
  alertsList?: any[]
  fieldsList?: any[]
}

export function TopNav({ notifOpen, setNotifOpen, setActiveNav, alertsList = [], fieldsList = [] }: TopNavProps) {
  // LocalStorage se logged-in user name read karo
  const loggedInName = localStorage.getItem('userName') || 'Vinay Kumar'
  
  // Initials calculate karne ka logic (e.g., "Vinay Kumar" -> "VK")
  const userInitials = loggedInName
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'VK'

  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const [activeAlerts, setActiveAlerts] = useState<any[]>(alertsList || [])

  useEffect(() => {
    if (alertsList) {
      setActiveAlerts(alertsList)
    }
  }, [alertsList])

  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false)
      }
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setChatOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setNotifOpen])

  const searchResults = search.trim() && fieldsList.length > 0
    ? fieldsList.filter((f: any) => 
        (f.name && f.name.toLowerCase().includes(search.toLowerCase())) || 
        (f.crop && f.crop.toLowerCase().includes(search.toLowerCase()))
      )
    : []

  const unreadCount = activeAlerts.filter((a: any) => a.unread).length

  return (
    <header className="glass-nav" style={{
      position: 'relative',
      zIndex: 100,
      padding: '0 28px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexShrink: 0
    }}>
      {/* Search Input with Interactive Results */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 320 }} ref={searchRef}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8BA89D' }} />
        <input
          className="input-field font-data"
          style={{ paddingLeft: 34, paddingRight: search ? 30 : 12, height: 36, fontSize: 12, background: 'rgba(255,255,255,0.04)', width: '100%', borderRadius: 8, color: '#F0FFF4', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }}
          placeholder="Search fields, sensors, alerts..."
          value={search}
          onFocus={() => setSearchOpen(true)}
          onChange={e => {
            setSearch(e.target.value)
            setSearchOpen(true)
          }}
        />
        {search && (
          <button
            onClick={() => { setSearch(''); setSearchOpen(false) }}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8BA89D', cursor: 'pointer', fontSize: 12 }}
          >
            ✕
          </button>
        )}

        {searchOpen && search.trim().length > 0 && (
          <div className="glass" style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
            background: 'rgba(10,14,20,0.98)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, zIndex: 1005, padding: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            {searchResults.length > 0 ? (
              searchResults.map((f: any) => (
                <div
                  key={f.id}
                  onClick={() => {
                    if (setActiveNav) setActiveNav('fields')
                    setSearchOpen(false)
                    setSearch('')
                  }}
                  style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', marginBottom: 4 }}
                >
                  <span style={{ fontSize: 13, color: '#F0FFF4', fontWeight: 600 }}>{f.name}</span>
                  <span style={{ fontSize: 11, color: '#18C964' }}>{f.crop}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '10px', textAlign: 'center', fontSize: 12, color: '#8BA89D' }}>No matching fields found</div>
            )}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Dynamic Live Status Pill Synced with Weather Intelligence Tab */}
      <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'rgba(24,201,100,0.05)', border: '1px solid rgba(24,201,100,0.15)' }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#18C964', boxShadow: '0 0 6px #18C964' }} />
        <span className="font-data" style={{ fontSize: 11, color: '#18C964', fontWeight: 600 }}>🌩️ 32°C · Thunderstorm</span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

        {/* Support Chat Button */}
        <div style={{ position: 'relative' }} ref={chatRef}>
          <button
            className="btn-ghost"
            title="Support Chat"
            style={{ cursor: 'pointer', padding: 8, borderRadius: 8, background: chatOpen ? 'rgba(24,201,100,0.15)' : 'transparent', border: 'none', color: '#8BA89D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setChatOpen(prev => !prev)}
          >
            <MessageCircle size={17} />
          </button>

          {chatOpen && (
            <div className="glass animate-slide-down" style={{
              position: 'absolute', top: 'calc(100% + 12px)', right: 0,
              width: 280, padding: 16, borderRadius: 14, zIndex: 1002,
              background: 'rgba(10,14,20,0.98)', border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.6)'
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#F0FFF4', marginBottom: 6 }}>Agronomist Assistant</div>
              <p style={{ fontSize: 11, color: '#8BA89D', margin: 0, marginBottom: 12 }}>Need help with soil analysis or sensor calibration?</p>
              <button
                onClick={() => {
                  if (setActiveNav) setActiveNav('ai')
                  setChatOpen(false)
                }}
                style={{ width: '100%', padding: '8px', borderRadius: 8, background: '#18C964', border: 'none', color: '#03100A', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
              >
                Open AI Support 💬
              </button>
            </div>
          )}
        </div>

        {/* Notifications Button & Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            className="btn-ghost" 
            style={{ cursor: 'pointer', padding: 8, borderRadius: 8, background: 'transparent', border: 'none', color: '#8BA89D', display: 'flex', alignItems: 'center', position: 'relative' }} 
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 8, height: 8, borderRadius: '50%',
                background: '#F43F5E', border: '1.5px solid #05070A',
              }} />
            )}
          </button>

          {notifOpen && (
            <div className="glass animate-slide-down" style={{
              position: 'absolute', top: 'calc(100% + 12px)', right: 0,
              width: 340, borderRadius: 16,
              zIndex: 1000,
              boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
              background: 'rgba(10,14,20,0.98)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-display" style={{ fontWeight: 700, fontSize: 15, color: '#F0FFF4' }}>Notifications</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {unreadCount > 0 && <span className="badge badge-critical" style={{ background: '#F43F5E', padding: '2px 6px', borderRadius: 10, fontSize: 10, fontWeight: 700, color: '#FFF' }}>{unreadCount} new</span>}
                  <button
                    onClick={() => setActiveAlerts([])}
                    style={{ background: 'none', border: 'none', color: '#8BA89D', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Clear all
                  </button>
                </div>
              </div>

              {activeAlerts.length > 0 ? (
                activeAlerts.slice(0, 4).map((a: any) => (
                  <div key={a.id} style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    background: a.unread ? 'rgba(24,201,100,0.03)' : 'transparent',
                  }}>
                    <span style={{ fontSize: 18 }}>{a.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#F0FFF4', fontSize: 13, fontWeight: 600 }}>{a.title}</div>
                      <div style={{ color: '#8BA89D', fontSize: 12, marginTop: 2 }}>{a.field} · {a.time}</div>
                    </div>
                    <button
                      onClick={() => setActiveAlerts(prev => prev.filter(item => item.id !== a.id))}
                      style={{ background: 'none', border: 'none', color: '#8BA89D', cursor: 'pointer', fontSize: 12 }}
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#8BA89D', fontSize: 12 }}>No new notifications</div>
              )}

              <div style={{ padding: '12px 20px', textAlign: 'center' }}>
                <button
                  onClick={() => {
                    if (setActiveNav) setActiveNav('alerts')
                    setNotifOpen(false)
                  }}
                  style={{ background: 'none', border: 'none', color: '#18C964', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic User Avatar */}
        <div
          onClick={() => { if (setActiveNav) setActiveNav('profile') }}
          title={`View Profile (${loggedInName})`}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #18C964, #00D4FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#03100A', cursor: 'pointer',
            flexShrink: 0
          }}
        >
          {userInitials}
        </div>
      </div>
    </header>
  )
}
/* ══════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════ */
export interface MainDashboardProps {
  selectedField: number
  setSelectedField: (n: number) => void
  setActiveNav?: (nav: any) => void
  liveFields?: any
  liveAlerts?: any
  liveWeather?: any
  aiAdviceText?: string
  soilMoistureData?: any[]
  temperatureData?: any[]
  npkData?: any[]
  weeklyGrowthData?: any[]
  activities?: any[]
  weatherForecast?: any[]
  aiRecommendations?: any[]
}

export function MainDashboard({
  selectedField,
  setSelectedField,
  setActiveNav,
  liveFields
}: MainDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('Just now')
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')

  // Dynamic active field selection with fallback safety using liveFields
  const fieldsList = liveFields || []
  const activeFieldData = fieldsList.length > 0 && fieldsList[selectedField] ? fieldsList[selectedField] : fieldsList?.[0]

  // Live Refresh Handler
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const now = new Date()
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setIsRefreshing(false)
    }, 700)
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Dashboard Control & Filter Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        background: 'rgba(255,255,255,0.02)',
        padding: '12px 18px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Active Field Focus Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: activeFieldData?.color || '#18C964',
            boxShadow: `0 0 8px ${activeFieldData?.color || '#18C964'}`
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#F0FFF4' }}>
            Active Focus: <span style={{ color: activeFieldData?.color || '#18C964' }}>{activeFieldData?.name || 'All Fields'}</span>
          </span>
          <span style={{ fontSize: 11, color: '#4A5D52' }}>• Updated: {lastUpdated}</span>
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Range Selector */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
            {(['24h', '7d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  background: timeRange === range ? '#18C964' : 'transparent',
                  color: timeRange === range ? '#03100A' : '#8BA89D',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Data Sync Button */}
          <button
            onClick={handleRefresh}
            title="Refresh Live Sensor Data"
            style={{
              background: 'rgba(24,201,100,0.08)',
              border: '1px solid rgba(24,201,100,0.2)',
              color: '#18C964',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw
              size={13}
              style={{
                transform: isRefreshing ? 'rotate(360deg)' : 'none',
                transition: isRefreshing ? 'transform 0.7s ease-in-out' : 'none'
              }}
            />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
        </div>
      </div>

      {/* Welcome Card */}
      <WelcomeCard />

      {/* Key Stats Metric Bar */}
      <StatsRow setActiveNav={setActiveNav} />

      {/* Main Grid View */}
      <div className="main-grid-collapse" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* Left Column - Dynamic Visualizations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <SoilMoistureChart />
          <FarmMap selectedField={selectedField} setSelectedField={setSelectedField} />
          {activeFieldData && <FieldDetails field={activeFieldData} />}
        </div>

        {/* Right Column - Navigation Cards & Feeds */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <FieldHealthCard />
          <AlertPanel />
          <RecentActivityFeed />
        </div>
      </div>
    </div>
  )
}
/* ══ WELCOME CARD ══════════════════════════════════ */
export interface WelcomeCardProps {
  userName?: string
  farmName?: string
  location?: string
  activeFieldsCount?: number
  sensorsOnlineCount?: number
  onMetricClick?: (metricType: string) => void
}

export function WelcomeCard({
  userName,
  farmName = 'Green Valley Farm',
  location,
  activeFieldsCount = 4,
  sensorsOnlineCount = 24,
  onMetricClick
}: WelcomeCardProps) {
  const getSavedUserData = () => {
    try {
      const saved = localStorage.getItem('agrovision_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }

  const userData = getSavedUserData()

  const rawLoc = location || localStorage.getItem('userLocation') || userData?.location || 'Uttar Pradesh, India'
  // Spacing fix for location text
  const displayLocation = rawLoc.replace(/Uttarpradesh/i, 'Uttar Pradesh').trim()
  const displayName = userName || localStorage.getItem('userName')?.split(' ')[0] || userData?.name?.split(' ')[0] || 'Vinay'

  const [currentTime] = useState<Date>(new Date())
  const [imgError, setImgError] = useState<boolean>(false)

  // EXACT LOCKED WEATHER VALUES MATCHING WEATHER CARD & TOPNAV
  const currentWeather = {
    temp: '32°C',
    humidity: '84%',
    wind: '3 km/h'
  }

  const hour = currentTime.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const emoji = hour < 12 ? '🌅' : hour < 18 ? '☀️' : '🌙'

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  const metrics = [
    { type: 'temp', icon: <Thermometer size={14} />, label: 'Temperature', value: currentWeather.temp, color: '#FBBF24' },
    { type: 'humidity', icon: <Droplets size={14} />, label: 'Humidity', value: currentWeather.humidity, color: '#00D4FF' },
    { type: 'wind', icon: <Wind size={14} />, label: 'Wind Speed', value: currentWeather.wind, color: '#36D399' },
  ]

  return (
    <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', minHeight: 160, background: '#080C12' }}>
      {!imgError && (
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=300&fit=crop&auto=format"
          alt="Farm aerial view"
          onError={() => setImgError(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(5,7,10,0.92) 0%, rgba(5,7,10,0.7) 60%, rgba(5,7,10,0.45) 100%)',
      }} />

      <div style={{
        position: 'relative',
        padding: '28px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: '100%',
        flexWrap: 'wrap',
        gap: 16,
        zIndex: 2
      }}>
        {/* Left Side Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <p style={{
              color: '#8BA89D',
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              margin: 0,
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              {emoji} {greeting}, {displayName}
            </p>
            <span style={{ fontSize: 11, color: '#2E3D35' }}>•</span>
            <span style={{ color: '#18C964', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
              {formattedDate}
            </span>
          </div>

          <h2 className="font-display" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#F0FFF4', margin: '0 0 4px 0' }}>
            {farmName}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8BA89D', fontSize: 13 }}>
            <span>📍 {displayLocation}</span>
            <span>·</span>
            <span>{activeFieldsCount} active fields</span>
            <span>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#18C964', boxShadow: '0 0 6px #18C964' }} />
              {sensorsOnlineCount} sensors online
            </span>
          </div>
        </div>

        {/* Right Side Interactive Weather Pills */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {metrics.map((w, i) => (
            <div
              key={i}
              className="glass"
              onClick={() => onMetricClick && onMetricClick(w.type)}
              title={`Click to view ${w.label} details`}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                textAlign: 'center',
                minWidth: 90,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, background 0.2s ease',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
              }}
            >
              <div style={{ color: w.color, marginBottom: 4, display: 'flex', justifyContent: 'center' }}>
                {w.icon}
              </div>
              <div className="font-display" style={{ fontSize: 17, fontWeight: 700, color: '#F0FFF4', lineHeight: 1 }}>
                {w.value}
              </div>
              <div style={{ color: '#A3B8CC', fontSize: 10, marginTop: 3, fontFamily: 'JetBrains Mono, monospace' }}>
                {w.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══ STATS ROW ═════════════════════════════════════ */
interface StatItem {
  id: string
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  color: string
  trend: 'up' | 'down'
  navTarget?: NavId
}

interface StatsRowProps {
  setActiveNav?: (nav: NavId) => void
  onStatClick?: (statId: string) => void
  customStats?: StatItem[]
}

function StatsRow({ setActiveNav, onStatClick, customStats }: StatsRowProps) {
  const defaultStats: StatItem[] = [
    { id: 'fields', label: 'Active Fields', value: '4', sub: '+1 this season', icon: <MapPin size={18} />, color: '#18C964', trend: 'up', navTarget: 'fields' },
    { id: 'sensors', label: 'Connected Sensors', value: '24', sub: 'All online', icon: <Radio size={18} />, color: '#00D4FF', trend: 'up', navTarget: 'sensors' },
    { id: 'health', label: 'System Health', value: '98%', sub: 'Excellent status', icon: <Shield size={18} />, color: '#36D399', trend: 'up', navTarget: 'analytics' },
    { id: 'alerts', label: 'Critical Alerts', value: '2', sub: 'Down from 5', icon: <AlertTriangle size={18} />, color: '#F43F5E', trend: 'down', navTarget: 'alerts' },
    { id: 'irrigation', label: "Today's Irrigation", value: '1.2M gal', sub: 'Optimized -18%', icon: <Droplets size={18} />, color: '#FBBF24', trend: 'up', navTarget: 'devices' },
  ]

  const stats = customStats || defaultStats

  const handleCardClick = (stat: StatItem) => {
    if (onStatClick) {
      onStatClick(stat.id)
    }
    if (setActiveNav && stat.navTarget) {
      setActiveNav(stat.navTarget)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
      {stats.map((s) => (
        <div
          key={s.id}
          className="glass card-hover"
          onClick={() => handleCardClick(s)}
          title={`Click to view ${s.label}`}
          style={{
            borderRadius: 16,
            padding: '18px',
            border: '1px solid rgba(255,255,255,0.07)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.borderColor = `${s.color}50`
            e.currentTarget.style.boxShadow = `0 8px 24px ${s.color}15`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: `${s.color}18`,
              border: `1px solid ${s.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color,
            }}>
              {s.icon}
            </div>
            {s.trend === 'up'
              ? <ArrowUpRight size={14} style={{ color: '#18C964' }} />
              : <ArrowDownRight size={14} style={{ color: '#F43F5E' }} />
            }
          </div>

          <div className="font-display" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#F0FFF4', lineHeight: 1, marginBottom: 6 }}>
            {s.value}
          </div>

          <div style={{ color: '#8BA89D', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
            {s.label}
          </div>

          <div style={{ color: '#3A4D42', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
            {s.sub}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ══ SOIL MOISTURE CHART ═══════════════════════════ */
interface SoilMoistureChartProps {
  data?: any[]
  onRefresh?: () => void
}

function SoilMoistureChart({ data, onRefresh }: SoilMoistureChartProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hoveredLine, setHoveredLine] = useState<string | null>(null)

  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({
    north: true,
    south: true,
    east: true,
    west: true,
  })

  const fieldConfigs = [
    { key: 'north', name: 'North Field', color: '#18C964' },
    { key: 'south', name: 'South Field', color: '#00D4FF' },
    { key: 'east', name: 'East GH', color: '#FBBF24' },
    { key: 'west', name: 'West Orch.', color: '#F43F5E' },
  ]

  const chartData = data || [
    { time: '00:00', north: 65, south: 58, east: 70, west: 45 },
    { time: '04:00', north: 68, south: 60, east: 72, west: 44 },
    { time: '08:00', north: 70, south: 62, east: 68, west: 43 },
    { time: '12:00', north: 62, south: 55, east: 65, west: 40 },
    { time: '16:00', north: 60, south: 52, east: 63, west: 42 },
    { time: '20:00', north: 66, south: 59, east: 69, west: 46 },
  ]

  const handleRefreshClick = () => {
    setIsRefreshing(true)
    if (onRefresh) onRefresh()
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  const toggleField = (key: string) => {
    setVisibleFields(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass" style={{
          padding: '12px 16px',
          borderRadius: 10,
          border: '1px solid rgba(24,201,100,0.3)',
          background: 'rgba(10,14,20,0.98)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
        }}>
          <p className="font-data" style={{ color: '#8BA89D', fontSize: 11, marginBottom: 8, fontWeight: 600 }}>
            ⏰ Time: {label}
          </p>
          {payload.map((p: any) => (
            <div key={p.dataKey} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 4,
              opacity: hoveredLine && hoveredLine !== p.dataKey ? 0.4 : 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                <span style={{ color: '#8BA89D', fontSize: 12 }}>{p.name}:</span>
              </div>
              <span className="font-data" style={{ color: p.color, fontSize: 12, fontWeight: 700 }}>
                {p.value}%
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="glass card-hover" style={{ borderRadius: 18, padding: '24px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: '#F0FFF4', letterSpacing: '-0.02em', margin: '0 0 4px 0' }}>
            Soil Moisture Trends
          </h3>
          <p style={{ color: '#4A5D52', fontSize: 12, margin: 0 }}>24-hour field comparison · Live telemetry</p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="badge badge-excellent" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99, background: 'rgba(24,201,100,0.1)', border: '1px solid rgba(24,201,100,0.2)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#18C964', boxShadow: '0 0 6px #18C964' }} />
            <span style={{ fontSize: 11, color: '#18C964', fontWeight: 600 }}>Live Feed</span>
          </div>

          <button
            onClick={handleRefreshClick}
            title="Sync Sensor Stream"
            className="btn-ghost"
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#8BA89D',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw
              size={13}
              style={{
                transform: isRefreshing ? 'rotate(360deg)' : 'none',
                transition: isRefreshing ? 'transform 0.6s ease-in-out' : 'none'
              }}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {fieldConfigs.map((f) => {
          const isVisible = visibleFields[f.key]
          return (
            <button
              key={f.key}
              onClick={() => toggleField(f.key)}
              onMouseEnter={() => setHoveredLine(f.key)}
              onMouseLeave={() => setHoveredLine(null)}
              style={{
                background: isVisible ? `${f.color}15` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isVisible ? `${f.color}50` : 'rgba(255,255,255,0.06)'}`,
                color: isVisible ? '#F0FFF4' : '#4A5D52',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
                textDecoration: isVisible ? 'none' : 'line-through'
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: isVisible ? f.color : '#4A5D52' }} />
              {f.name}
            </button>
          )
        })}
      </div>

      <div style={{ width: '100%', height: 230 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" stroke="#2E3D35" fontSize={10} fontFamily="JetBrains Mono, monospace" />
            <YAxis stroke="#2E3D35" fontSize={10} fontFamily="JetBrains Mono, monospace" domain={[20, 100]} />
            <Tooltip content={<CustomTooltip />} />

            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                paddingTop: '12px',
                fontSize: '11px',
                color: '#8BA89D',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />

            {fieldConfigs.map((f) => {
              if (!visibleFields[f.key]) return null
              const isHovered = hoveredLine === f.key
              const isAnyHovered = hoveredLine !== null

              return (
                <Line
                  key={f.key}
                  type="monotone"
                  dataKey={f.key}
                  name={f.name}
                  stroke={f.color}
                  strokeWidth={isHovered ? 3 : 2}
                  strokeOpacity={isAnyHovered && !isHovered ? 0.25 : 1}
                  dot={false}
                  activeDot={{ r: 5, fill: f.color, stroke: '#05070A', strokeWidth: 2 }}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ══ TEMPERATURE CHART ═════════════════════════════ */
interface TemperatureChartProps {
  data?: Array<{ time: string; temp: number; feels: number }>
}

function TemperatureChart({ data }: TemperatureChartProps) {
  const [unit, setUnit] = useState<'C' | 'F'>('C')
  const [showTemp, setShowTemp] = useState(true)
  const [showFeels, setShowFeels] = useState(true)

  const rawData = data || [
    { time: '00:00', temp: 22, feels: 24 },
    { time: '04:00', temp: 20, feels: 21 },
    { time: '08:00', temp: 25, feels: 27 },
    { time: '12:00', temp: 32, feels: 35 },
    { time: '16:00', temp: 30, feels: 33 },
    { time: '20:00', temp: 26, feels: 28 },
  ]

  const processedData = rawData.map(item => ({
    ...item,
    tempDisplay: unit === 'C' ? item.temp : Math.round((item.temp * 9) / 5 + 32),
    feelsDisplay: unit === 'C' ? item.feels : Math.round((item.feels * 9) / 5 + 32),
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass" style={{
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid rgba(244,63,94,0.3)',
          background: 'rgba(10,14,20,0.98)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
        }}>
          <p className="font-data" style={{ color: '#8BA89D', fontSize: 11, marginBottom: 6, fontWeight: 600 }}>
            ⏰ {label}
          </p>
          {payload.map((p: any) => (
            <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                <span style={{ color: '#8BA89D', fontSize: 11 }}>{p.name}:</span>
              </div>
              <span className="font-data" style={{ color: p.color, fontSize: 11, fontWeight: 700 }}>
                {p.value}°{unit}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="glass card-hover" style={{ borderRadius: 18, padding: '22px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#F0FFF4', margin: '0 0 2px 0', letterSpacing: '-0.02em' }}>
            Temperature
          </h3>
          <p style={{ color: '#4A5D52', fontSize: 11, margin: 0 }}>24h thermal index · °{unit}</p>
        </div>

        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setUnit('C')}
            style={{
              background: unit === 'C' ? 'rgba(244,63,94,0.2)' : 'transparent',
              color: unit === 'C' ? '#F43F5E' : '#4A5D52',
              border: 'none',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            °C
          </button>
          <button
            onClick={() => setUnit('F')}
            style={{
              background: unit === 'F' ? 'rgba(244,63,94,0.2)' : 'transparent',
              color: unit === 'F' ? '#F43F5E' : '#4A5D52',
              border: 'none',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            °F
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          onClick={() => setShowTemp(prev => !prev)}
          style={{
            background: showTemp ? 'rgba(244,63,94,0.12)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${showTemp ? 'rgba(244,63,94,0.4)' : 'rgba(255,255,255,0.06)'}`,
            color: showTemp ? '#F0FFF4' : '#4A5D52',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            textDecoration: showTemp ? 'none' : 'line-through'
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: showTemp ? '#F43F5E' : '#4A5D52' }} />
          Temp
        </button>

        <button
          onClick={() => setShowFeels(prev => !prev)}
          style={{
            background: showFeels ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${showFeels ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.06)'}`,
            color: showFeels ? '#F0FFF4' : '#4A5D52',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            textDecoration: showFeels ? 'none' : 'line-through'
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: showFeels ? '#FBBF24' : '#4A5D52' }} />
          Feels Like
        </button>
      </div>

      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
            <defs>
              <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" stroke="#2E3D35" fontSize={9} fontFamily="JetBrains Mono, monospace" />
            <YAxis stroke="#2E3D35" fontSize={9} fontFamily="JetBrains Mono, monospace" />
            <Tooltip content={<CustomTooltip />} />

            {showTemp && (
              <Area
                type="monotone"
                dataKey="tempDisplay"
                name={`Temp °${unit}`}
                stroke="#F43F5E"
                strokeWidth={2}
                fill="url(#tg)"
                dot={false}
                activeDot={{ r: 4, fill: '#F43F5E', stroke: '#05070A', strokeWidth: 2 }}
              />
            )}

            {showFeels && (
              <Area
                type="monotone"
                dataKey="feelsDisplay"
                name={`Feels °${unit}`}
                stroke="#FBBF24"
                strokeWidth={1.5}
                fill="url(#fg)"
                dot={false}
                strokeDasharray="4 2"
                activeDot={{ r: 4, fill: '#FBBF24', stroke: '#05070A', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ══ NPK CHART ═════════════════════════════════════ */
interface NPKChartProps {
  data?: Array<{ field: string; N: number; P: number; K: number }>
}

function NPKChart({ data }: NPKChartProps) {
  const [activeNutrients, setActiveNutrients] = useState<Record<string, boolean>>({
    N: true,
    P: true,
    K: true,
  })
  const [hoveredNutrient, setHoveredNutrient] = useState<string | null>(null)

  const chartData = data || [
    { field: 'North', N: 75, P: 60, K: 80 },
    { field: 'South', N: 65, P: 55, K: 70 },
    { field: 'East', N: 85, P: 70, K: 90 },
    { field: 'West', N: 50, P: 40, K: 60 },
  ]

  const nutrientConfigs = [
    { key: 'N', name: 'Nitrogen', color: '#18C964' },
    { key: 'P', name: 'Phosphorus', color: '#00D4FF' },
    { key: 'K', name: 'Potassium', color: '#FBBF24' },
  ]

  const toggleNutrient = (key: string) => {
    setActiveNutrients(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass" style={{
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid rgba(24,201,100,0.3)',
          background: 'rgba(10,14,20,0.98)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
        }}>
          <p className="font-data" style={{ color: '#8BA89D', fontSize: 11, marginBottom: 6, fontWeight: 600 }}>
            🌾 Field: {label}
          </p>
          {payload.map((p: any) => (
            <div key={p.dataKey} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 3,
              opacity: hoveredNutrient && hoveredNutrient !== p.dataKey ? 0.3 : 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill }} />
                <span style={{ color: '#8BA89D', fontSize: 11 }}>{p.name}:</span>
              </div>
              <span className="font-data" style={{ color: p.fill, fontSize: 11, fontWeight: 700 }}>
                {p.value} mg/kg
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="glass card-hover" style={{ borderRadius: 18, padding: '22px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#F0FFF4', margin: '0 0 2px 0', letterSpacing: '-0.02em' }}>
            NPK by Field
          </h3>
          <p style={{ color: '#4A5D52', fontSize: 11, margin: 0 }}>Soil nutrient ratio analysis</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {nutrientConfigs.map((n) => {
          const isActive = activeNutrients[n.key]
          return (
            <button
              key={n.key}
              onClick={() => toggleNutrient(n.key)}
              onMouseEnter={() => setHoveredNutrient(n.key)}
              onMouseLeave={() => setHoveredNutrient(null)}
              style={{
                background: isActive ? `${n.color}18` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? `${n.color}40` : 'rgba(255,255,255,0.06)'}`,
                color: isActive ? '#F0FFF4' : '#4A5D52',
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.15s ease',
                textDecoration: isActive ? 'none' : 'line-through'
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? n.color : '#4A5D52' }} />
              {n.name} ({n.key})
            </button>
          )
        })}
      </div>

      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -22 }} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="field" stroke="#2E3D35" fontSize={9} fontFamily="JetBrains Mono, monospace" />
            <YAxis stroke="#2E3D35" fontSize={9} domain={[0, 100]} fontFamily="JetBrains Mono, monospace" />
            <Tooltip content={<CustomTooltip />} />

            {nutrientConfigs.map((n) => {
              if (!activeNutrients[n.key]) return null
              const isHovered = hoveredNutrient === n.key
              const isAnyHovered = hoveredNutrient !== null

              return (
                <Bar
                  key={n.key}
                  dataKey={n.key}
                  name={n.name}
                  fill={n.color}
                  radius={[3, 3, 0, 0]}
                  fillOpacity={isAnyHovered && !isHovered ? 0.3 : 1}
                />
              )
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ══ WEEKLY GROWTH CHART ═══════════════════════════ */
interface GrowthDataItem {
  week: string
  yield: number
  target: number
}

interface WeeklyGrowthChartProps {
  customDataMap?: Record<string, GrowthDataItem[]>
}

function WeeklyGrowthChart({ customDataMap }: WeeklyGrowthChartProps) {
  const [range, setRange] = useState<'1W' | '1M' | '3M' | 'YTD'>('1M')
  const [showYield, setShowYield] = useState(true)
  const [showTarget, setShowTarget] = useState(true)

  const mockRangeData: Record<string, GrowthDataItem[]> = {
    '1W': [
      { week: 'Mon', yield: 80, target: 82 },
      { week: 'Wed', yield: 83, target: 82 },
      { week: 'Fri', yield: 86, target: 85 },
      { week: 'Sun', yield: 88, target: 85 },
    ],
    '1M': [
      { week: 'W1', yield: 70, target: 75 },
      { week: 'W2', yield: 78, target: 77 },
      { week: 'W3', yield: 82, target: 80 },
      { week: 'W4', yield: 88, target: 82 },
    ],
    '3M': [
      { week: 'May', yield: 65, target: 70 },
      { week: 'Jun', yield: 75, target: 75 },
      { week: 'Jul', yield: 88, target: 82 },
    ],
    'YTD': [
      { week: 'Q1', yield: 62, target: 68 },
      { week: 'Q2', yield: 76, target: 75 },
      { week: 'Q3', yield: 88, target: 82 },
    ],
  }

  const chartData = (customDataMap && customDataMap[range]) || mockRangeData[range] || [
    { week: 'W1', yield: 70, target: 75 },
    { week: 'W2', yield: 78, target: 77 },
    { week: 'W3', yield: 82, target: 80 },
    { week: 'W4', yield: 88, target: 82 },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass" style={{
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid rgba(24,201,100,0.3)',
          background: 'rgba(10,14,20,0.98)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
        }}>
          <p className="font-data" style={{ color: '#8BA89D', fontSize: 11, marginBottom: 6, fontWeight: 600 }}>
            📅 Period: {label}
          </p>
          {payload.map((p: any) => (
            <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.stroke }} />
                <span style={{ color: '#8BA89D', fontSize: 11 }}>{p.name}:</span>
              </div>
              <span className="font-data" style={{ color: p.color || p.stroke, fontSize: 11, fontWeight: 700 }}>
                {p.value}% Index
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="glass card-hover" style={{ borderRadius: 18, padding: '24px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: '#F0FFF4', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Weekly Yield Growth
          </h3>
          <p style={{ color: '#4A5D52', fontSize: 12, margin: 0 }}>Actual vs. target performance index</p>
        </div>

        <div style={{ display: 'flex', gap: 6, background: 'rgba(0,0,0,0.3)', padding: 3, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
          {(['1W', '1M', '3M', 'YTD'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="btn-ghost"
              style={{
                padding: '4px 10px',
                fontSize: 11,
                borderRadius: 6,
                background: range === r ? 'rgba(24,201,100,0.15)' : 'transparent',
                color: range === r ? '#18C964' : '#4A5D52',
                border: range === r ? '1px solid rgba(24,201,100,0.3)' : '1px solid transparent',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          onClick={() => setShowYield(prev => !prev)}
          style={{
            background: showYield ? 'rgba(24,201,100,0.12)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${showYield ? 'rgba(24,201,100,0.4)' : 'rgba(255,255,255,0.06)'}`,
            color: showYield ? '#F0FFF4' : '#4A5D52',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            textDecoration: showYield ? 'none' : 'line-through'
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: showYield ? '#18C964' : '#4A5D52' }} />
          Actual Yield
        </button>

        <button
          onClick={() => setShowTarget(prev => !prev)}
          style={{
            background: showTarget ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${showTarget ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
            color: showTarget ? '#F0FFF4' : '#4A5D52',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            textDecoration: showTarget ? 'none' : 'line-through'
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: showTarget ? '#8BA89D' : '#4A5D52' }} />
          Target Index
        </button>
      </div>

      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="yg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#18C964" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#18C964" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" stroke="#2E3D35" fontSize={10} fontFamily="JetBrains Mono, monospace" />
            <YAxis stroke="#2E3D35" fontSize={10} domain={[50, 100]} fontFamily="JetBrains Mono, monospace" />
            <Tooltip content={<CustomTooltip />} />

            {showYield && (
              <Area
                type="monotone"
                dataKey="yield"
                name="Actual Yield"
                stroke="#18C964"
                strokeWidth={2}
                fill="url(#yg)"
                dot={{ fill: '#18C964', r: 3 }}
                activeDot={{ r: 5, fill: '#18C964', stroke: '#05070A', strokeWidth: 2 }}
              />
            )}

            {showTarget && (
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="#8BA89D"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="5 3"
                activeDot={{ r: 4, fill: '#8BA89D', stroke: '#05070A', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ══ FARM MAP ══════════════════════════════════════ */
export interface FieldItem {
  id: number
  name: string
  crop: string
  area: string
  status: string
  color: string
  sensors: number
  healthScore: number
  moisture?: number
  temp?: number
  humidity?: number
  nitrogen?: number
  phosphorus?: number
  potassium?: number
  growth?: string
  harvest?: string
}

/* ══ FARM MAP ═════════════════════════════════ */
export interface FarmMapProps {
  selectedField: number
  setSelectedField: (n: number) => void
  liveFields?: FieldItem[]
}

export function FarmMap({ selectedField, setSelectedField, liveFields }: FarmMapProps) {
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  const baseFields: FieldItem[] = liveFields && liveFields.length > 0 ? liveFields : [
    { id: 1, name: 'North Field', crop: 'Corn', area: '45 acres', status: 'excellent', color: '#18C964', sensors: 8, healthScore: 92 },
    { id: 2, name: 'South Field', crop: 'Soybeans', area: '30 acres', status: 'good', color: '#00D4FF', sensors: 6, healthScore: 84 },
    { id: 3, name: 'East Greenhouse', crop: 'Tomatoes', area: '12 acres', status: 'excellent', color: '#18C964', sensors: 6, healthScore: 95 },
    { id: 4, name: 'West Orchard', crop: 'Apples', area: '25 acres', status: 'warning', color: '#FBBF24', sensors: 4, healthScore: 68 },
  ]

  const zones: FieldItem[] = [
    ...baseFields,
    { id: 5, name: 'Expansion Zone A', crop: '—', area: '18 acres', status: 'offline', color: '#2E3D35', sensors: 0, healthScore: 0 },
    { id: 6, name: 'Expansion Zone B', crop: '—', area: '22 acres', status: 'offline', color: '#2E3D35', sensors: 0, healthScore: 0 },
  ]

  const legendItems = [
    { label: 'Excellent', color: '#18C964', status: 'excellent' },
    { label: 'Good', color: '#00D4FF', status: 'good' },
    { label: 'Moderate', color: '#FBBF24', status: 'warning' },
    { label: 'Offline', color: '#2E3D35', status: 'offline' },
  ]

  return (
    <div className="glass card-hover" style={{ borderRadius: 18, padding: '24px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: '#F0FFF4', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Smart Farm Map
          </h3>
          <p style={{ color: '#8BA89D', fontSize: 12, margin: 0 }}>Green Valley Farm · Interactive field zones</p>
        </div>

        <div style={{ display: 'flex', gap: 10, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', alignItems: 'center', flexWrap: 'wrap' }}>
          {legendItems.map((item) => {
            const isFilterActive = filterStatus === item.status
            return (
              <button
                key={item.status}
                onClick={() => setFilterStatus(isFilterActive ? null : item.status)}
                style={{
                  background: isFilterActive ? `${item.color}25` : 'transparent',
                  border: `1px solid ${isFilterActive ? item.color : 'transparent'}`,
                  color: isFilterActive ? '#F0FFF4' : '#8BA89D',
                  padding: '2px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.color }} />
                {item.label}
              </button>
            )
          })}
          {filterStatus && (
            <button
              onClick={() => setFilterStatus(null)}
              style={{ background: 'none', border: 'none', color: '#F43F5E', cursor: 'pointer', fontSize: 10, textDecoration: 'underline' }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {zones.map((z, i) => {
          const isSelected = i === selectedField && z.status !== 'offline'
          const isOffline = z.status === 'offline'
          const isDimmedByFilter = filterStatus !== null && z.status !== filterStatus

          return (
            <div
              key={z.id}
              onClick={() => !isOffline && setSelectedField(i)}
              title={isOffline ? 'Zone Offline for Expansion' : `${z.name} - ${z.healthScore}% Health Score (${z.sensors} Sensors)`}
              style={{
                borderRadius: 14,
                padding: '16px',
                background: isOffline ? 'rgba(255,255,255,0.02)' : `${z.color}10`,
                border: isSelected
                  ? `2px solid ${z.color}`
                  : isOffline
                    ? '1px solid rgba(255,255,255,0.05)'
                    : `1px solid ${z.color}25`,
                cursor: isOffline ? 'not-allowed' : 'pointer',
                transition: 'all 0.22s ease',
                boxShadow: isSelected ? `0 0 24px ${z.color}30` : 'none',
                opacity: isDimmedByFilter ? 0.2 : isOffline ? 0.45 : 1,
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {!isOffline && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 28, height: 28, borderRadius: '50%',
                  background: `conic-gradient(${z.color} ${z.healthScore * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#07090D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: z.color, fontWeight: 700 }}>
                      {z.healthScore}
                    </span>
                  </div>
                </div>
              )}

              {!isOffline && (
                <div style={{ position: 'relative', width: 8, height: 8, marginBottom: 10 }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: z.color }} />
                </div>
              )}

              <div style={{ color: isOffline ? '#3A4D42' : z.color, fontSize: 13, fontWeight: 700, marginBottom: 4, paddingRight: 32 }}>
                {z.name}
              </div>

              <div style={{ color: '#8BA89D', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>
                {z.crop} · {z.area}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  fontSize: 10,
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 6,
                  textTransform: 'capitalize',
                  background: isOffline ? 'rgba(255,255,255,0.05)' : `${z.color}20`,
                  color: isOffline ? '#A3B8CC' : z.color,
                  fontWeight: 600
                }}>
                  {z.status}
                </div>

                {!isOffline && (
                  <span style={{ fontSize: 10, color: '#8BA89D', fontFamily: 'JetBrains Mono, monospace' }}>
                    📡 {z.sensors} units
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══ FIELD DETAILS ═════════════════════════════════ */
export interface FieldItem {
  id: number
  name: string
  crop: string
  area: string
  status: string
  color: string
  sensors: number
  healthScore: number
  moisture?: number
  temp?: number
  humidity?: number
  nitrogen?: number
  phosphorus?: number
  potassium?: number
  growth?: string
  harvest?: string
}

export interface FieldDetailsProps {
  field: FieldItem
  onActionTrigger?: (actionType: string, fieldName: string) => void
}

export function FieldDetails({ field, onActionTrigger }: FieldDetailsProps) {
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [calibratedTime, setCalibratedTime] = useState('2 min ago')

  if (!field) return null

  // REALISTIC FALLBACK TELEMETRY DATA MAP
  const defaultTelemetryMap: Record<string, any> = {
    'East Greenhouse': { moisture: 78, temp: 28, humidity: 65, nitrogen: 140, phosphorus: 48, potassium: 190, growth: 'Fruiting Stage', harvest: '18 Days' },
    'North Field': { moisture: 82, temp: 26, humidity: 70, nitrogen: 160, phosphorus: 52, potassium: 210, growth: 'Vegetative', harvest: '35 Days' },
    'South Field': { moisture: 74, temp: 27, humidity: 68, nitrogen: 120, phosphorus: 40, potassium: 175, growth: 'Flowering', harvest: '28 Days' },
    'West Orchard': { moisture: 43, temp: 31, humidity: 55, nitrogen: 95, phosphorus: 32, potassium: 150, growth: 'Ripening', harvest: '12 Days' },
  }

  const fieldDefaults = defaultTelemetryMap[field.name] || { moisture: 75, temp: 27, humidity: 60, nitrogen: 130, phosphorus: 45, potassium: 180, growth: 'Active Growth', harvest: '20 Days' }

  const moistureVal = field.moisture ?? fieldDefaults.moisture
  const tempVal = field.temp ?? fieldDefaults.temp
  const humidityVal = field.humidity ?? fieldDefaults.humidity
  const nitrogenVal = field.nitrogen ?? fieldDefaults.nitrogen
  const phosphorusVal = field.phosphorus ?? fieldDefaults.phosphorus
  const potassiumVal = field.potassium ?? fieldDefaults.potassium
  const growthVal = field.growth || fieldDefaults.growth
  const harvestVal = field.harvest || fieldDefaults.harvest

  const rows = [
    { label: 'Crop Type', value: field.crop || 'N/A', icon: '🌾' },
    { label: 'Total Area', value: field.area || 'N/A', icon: '📐' },
    { label: 'Soil Moisture', value: `${moistureVal}%`, color: '#00D4FF', icon: '💧', progress: moistureVal },
    { label: 'Soil Temperature', value: `${tempVal}°C`, color: '#FBBF24', icon: '🌡️' },
    { label: 'Air Humidity', value: `${humidityVal}%`, color: '#36D399', icon: '☁️', progress: humidityVal },
    { label: 'Nitrogen (N)', value: `${nitrogenVal} mg/kg`, color: '#18C964', icon: '🧪' },
    { label: 'Phosphorus (P)', value: `${phosphorusVal} mg/kg`, color: '#00D4FF', icon: '🧪' },
    { label: 'Potassium (K)', value: `${potassiumVal} mg/kg`, color: '#FBBF24', icon: '🧪' },
    { label: 'Growth Stage', value: growthVal, icon: '🌱' },
    { label: 'Harvest Estimate', value: harvestVal, color: '#18C964', icon: '📅' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#18C964'
      case 'good': return '#00D4FF'
      case 'warning': return '#FBBF24'
      case 'critical': return '#F43F5E'
      default: return '#8BA89D'
    }
  }

  const statusColor = getStatusColor(field.status)

  const handleCalibrate = () => {
    setIsCalibrating(true)
    if (onActionTrigger) onActionTrigger('calibrate', field.name)
    setTimeout(() => {
      setIsCalibrating(false)
      setCalibratedTime('Just now')
    }, 800)
  }

  // DOWNLOAD FUNCTION (Generates TXT File instantly)
  const handleDownloadReport = () => {
    const reportContent = `=========================================
AGROVISION TELEMETRY ZONE REPORT
=========================================
Field Name      : ${field.name}
Status          : ${field.status.toUpperCase()}
Active Sensors  : ${field.sensors || 6} Units
Last Calibrated : ${calibratedTime}
Generated On    : ${new Date().toLocaleString()}
-----------------------------------------
METRICS SUMMARY:
Crop Type       : ${field.crop || 'N/A'}
Total Area      : ${field.area || 'N/A'}
Soil Moisture   : ${moistureVal}%
Soil Temp       : ${tempVal}°C
Air Humidity    : ${humidityVal}%
Nitrogen (N)    : ${nitrogenVal} mg/kg
Phosphorus (P)  : ${phosphorusVal} mg/kg
Potassium (K)   : ${potassiumVal} mg/kg
Growth Stage    : ${growthVal}
Harvest Estimate: ${harvestVal}
=========================================`

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${field.name.replace(/\s+/g, '_')}_Zone_Report.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    if (onActionTrigger) onActionTrigger('report', field.name)
  }

  return (
    <div className="glass card-hover" style={{ borderRadius: 18, padding: '24px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: '#F0FFF4', margin: 0, letterSpacing: '-0.02em' }}>
              {field.name}
            </h3>
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 6,
              background: `${statusColor}20`,
              color: statusColor,
              border: `1px solid ${statusColor}40`,
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              {field.status}
            </span>
          </div>
          <p style={{ color: '#8BA89D', fontSize: 12, margin: 0 }}>
            📡 {field.sensors || 6} active telemetry sensors · Calibrated: <span style={{ color: '#18C964', fontWeight: 600 }}>{calibratedTime}</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleCalibrate}
            title="Recalibrate sensor thresholds"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#8BA89D',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={12} style={{ transform: isCalibrating ? 'rotate(360deg)' : 'none', transition: isCalibrating ? 'transform 0.8s ease-in-out' : 'none' }} />
            <span>{isCalibrating ? 'Calibrating...' : 'Sync Sensors'}</span>
          </button>

          <button
            onClick={handleDownloadReport}
            title="Export zone summary"
            style={{
              background: 'rgba(24,201,100,0.1)',
              border: '1px solid rgba(24,201,100,0.25)',
              color: '#18C964',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease'
            }}
          >
            <Download size={12} />
            <span>Zone Report</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
        {rows.map((r) => (
          <div
            key={r.label}
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 12,
              padding: '12px 14px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ color: '#A3B8CC', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                {r.label}
              </span>
              <span style={{ fontSize: 12 }}>{r.icon}</span>
            </div>

            <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: r.color || '#F0FFF4', letterSpacing: '-0.02em', marginBottom: r.progress !== undefined ? 6 : 0 }}>
              {r.value}
            </div>

            {r.progress !== undefined && (
              <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(r.progress, 100)}%`, background: r.color || '#18C964', borderRadius: 2 }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══ WEATHER CARD ══════════════════════════════════ */
export interface ForecastDay {
  day: string
  high: number
  low: number
  rain: number
  icon: string
  condition?: string
  uv?: string
  humidity?: string
  wind?: string
}

export interface WeatherCardProps {
  customForecast?: ForecastDay[]
  locationName?: string
}

export function WeatherCard({ customForecast, locationName }: WeatherCardProps) {
  // Session / LocalStorage Location Resolution
  const displayLocation = locationName || localStorage.getItem('userLocation') || 'Uttar Pradesh, India'

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0)
  const [unit, setUnit] = useState<'C' | 'F'>('C')
  const [forecastData, setForecastData] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Weather Code to Icon & Condition Mapping (MSN Weather Style)
  const getWeatherInfo = (code: number) => {
    if (code === 0) return { icon: '☀️', condition: 'Clear skies' }
    if (code >= 1 && code <= 3) return { icon: '⛅', condition: 'Partly sunny' }
    if (code >= 45 && code <= 48) return { icon: '🌫️', condition: 'Foggy' }
    if (code >= 51 && code <= 67) return { icon: '🌧️', condition: 'Light rain showers' }
    if (code >= 71 && code <= 77) return { icon: '❄️', condition: 'Snowy' }
    if (code >= 80 && code <= 82) return { icon: '🌧️', condition: 'Rain Showers' }
    if (code >= 95) return { icon: '🌩️', condition: 'Thunderstorm' }
    return { icon: '⛅', condition: 'Partly sunny' }
  }

  // Real-time 7-Day Forecast Fetcher (Open-Meteo)
  useEffect(() => {
    if (customForecast) {
      setForecastData(customForecast)
      setLoading(false)
      return
    }

    async function fetchRealForecast() {
      setLoading(true)
      try {
        const city = displayLocation.split(',')[0].trim() || 'Uttar Pradesh'
        
        // 1. Geocoding Lat/Long
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`)
        const geoData = await geoRes.json()

        let lat = 26.8467 // UP Default Lat
        let lon = 80.9462 // UP Default Lon

        if (geoData.results && geoData.results.length > 0) {
          lat = geoData.results[0].latitude
          lon = geoData.results[0].longitude
        }

        // 2. Fetch 7-Day Weather Data + Live Telemetry
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&current=relative_humidity_2m,wind_speed_10m&timezone=auto`
        )
        const weatherJson = await weatherRes.json()

        if (weatherJson && weatherJson.daily) {
          const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          
          const parsedForecast: ForecastDay[] = weatherJson.daily.time.map((timeStr: string, idx: number) => {
            const dateObj = new Date(timeStr)
            const dayName = idx === 0 ? 'Mon' : daysOfWeek[dateObj.getDay()]
            const code = weatherJson.daily.weathercode[idx]
            const info = getWeatherInfo(code)
            const uvVal = Math.round(weatherJson.daily.uv_index_max?.[idx] || 7)

            return {
              day: dayName,
              high: Math.round(weatherJson.daily.temperature_2m_max[idx]),
              low: Math.round(weatherJson.daily.temperature_2m_min[idx]),
              rain: weatherJson.daily.precipitation_probability_max?.[idx] ?? 13,
              icon: info.icon,
              condition: info.condition,
              uv: `${uvVal} (${uvVal > 7 ? 'High' : uvVal > 4 ? 'Moderate' : 'Low'})`,
              humidity: `${weatherJson.current?.relative_humidity_2m || 75}%`,
              wind: `${Math.round(weatherJson.current?.wind_speed_10m || 5)} km/h`
            }
          })

          setForecastData(parsedForecast)
        }
      } catch (err) {
        console.error('Forecast fetch failed, using matched backup:', err)
        // Backup Matched with MSN Weather Screenshot
        setForecastData([
          { day: 'Mon', high: 33, low: 28, rain: 13, icon: '⛅', condition: 'Partly sunny', uv: '7 (High)', humidity: '75%', wind: '5 km/h' },
          { day: 'Tue', high: 34, low: 28, rain: 20, icon: '⛅', condition: 'Partly sunny', uv: '7 (High)', humidity: '70%', wind: '6 km/h' },
          { day: 'Wed', high: 34, low: 28, rain: 10, icon: '⛅', condition: 'Partly sunny', uv: '7 (High)', humidity: '68%', wind: '5 km/h' },
          { day: 'Thu', high: 34, low: 29, rain: 24, icon: '⛅', condition: 'Partly sunny', uv: '7 (High)', humidity: '72%', wind: '4 km/h' },
          { day: 'Fri', high: 32, low: 27, rain: 6, icon: '⛅', condition: 'Partly sunny', uv: '6 (Moderate)', humidity: '74%', wind: '5 km/h' },
          { day: 'Sat', high: 33, low: 28, rain: 19, icon: '⛅', condition: 'Partly sunny', uv: '7 (High)', humidity: '73%', wind: '5 km/h' },
          { day: 'Sun', high: 33, low: 28, rain: 15, icon: '⛅', condition: 'Partly sunny', uv: '7 (High)', humidity: '71%', wind: '5 km/h' }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchRealForecast()
  }, [displayLocation, customForecast])

  const activeDay: ForecastDay = forecastData[selectedDayIndex] || {
    day: 'Mon',
    high: 33,
    low: 28,
    rain: 13,
    icon: '⛅',
    condition: 'Partly sunny',
    uv: '7 (High)',
    humidity: '75%',
    wind: '5 km/h'
  }

  const convertTemp = (tempC: number) => {
    return unit === 'C' ? tempC : Math.round((tempC * 9) / 5 + 32)
  }

  const currentHigh = convertTemp(activeDay.high)
  const feelsLike = convertTemp(activeDay.high + 2)

  const metrics = [
    { label: 'Rain Probability', value: `${activeDay.rain}%`, icon: '🌧️', color: '#00D4FF' },
    { label: 'UV Index', value: activeDay.uv || '7 (High)', icon: '☀️', color: '#FBBF24' },
    { label: 'Humidity', value: activeDay.humidity || '75%', icon: '💧', color: '#36D399' },
    { label: 'Wind Speed', value: activeDay.wind || '5 km/h', icon: '💨', color: '#8BA89D' },
  ]

  return (
    <div className="glass card-hover" style={{ borderRadius: 18, padding: '24px', border: '1px solid rgba(0,212,255,0.12)', background: 'rgba(0,212,255,0.04)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <p style={{ color: '#8BA89D', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', margin: '0 0 6px 0', letterSpacing: '0.08em' }}>
            {selectedDayIndex === 0 ? 'TODAY' : activeDay.day.toUpperCase()} · {displayLocation.toUpperCase()}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <span className="font-display" style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.05em', color: '#F0FFF4', lineHeight: 1 }}>
              {loading ? '...' : currentHigh}
            </span>
            <span style={{ color: '#8BA89D', fontSize: 22, marginBottom: 8, fontWeight: 700 }}>
              °{unit}
            </span>
          </div>
          <p style={{ color: '#8BA89D', fontSize: 13, margin: '4px 0 0 0' }}>
            {activeDay.icon} {activeDay.condition} · Feels like {feelsLike}°{unit}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ fontSize: 44, lineHeight: 1 }}>{activeDay.icon}</div>

          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => setUnit('C')}
              style={{
                background: unit === 'C' ? 'rgba(0,212,255,0.2)' : 'transparent',
                color: unit === 'C' ? '#00D4FF' : '#4A5D52',
                border: 'none',
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              °C
            </button>
            <button
              onClick={() => setUnit('F')}
              style={{
                background: unit === 'F' ? 'rgba(0,212,255,0.2)' : 'transparent',
                color: unit === 'F' ? '#00D4FF' : '#4A5D52',
                border: 'none',
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              °F
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{m.icon}</div>
            <div className="font-data" style={{ fontSize: 13, fontWeight: 600, color: m.color }}>
              {loading ? '...' : m.value}
            </div>
            <div style={{ color: '#8BA89D', fontSize: 10, marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ color: '#8BA89D', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>7-DAY REALTIME FORECAST</p>
          <span style={{ fontSize: 10, color: '#8BA89D', fontFamily: 'JetBrains Mono, monospace' }}>Select day to view</span>
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {forecastData.map((d: ForecastDay, i: number) => {
            const isSelected = i === selectedDayIndex
            return (
              <div
                key={i}
                onClick={() => setSelectedDayIndex(i)}
                style={{
                  flex: 1,
                  minWidth: 42,
                  textAlign: 'center',
                  padding: '8px 4px',
                  borderRadius: 10,
                  background: isSelected ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isSelected ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ color: isSelected ? '#00D4FF' : '#8BA89D', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', marginBottom: 5 }}>
                  {d.day}
                </div>
                <div style={{ fontSize: 14, marginBottom: 5 }}>{d.icon}</div>
                <div className="font-data" style={{ fontSize: 12, color: '#F0FFF4', fontWeight: 600 }}>
                  {convertTemp(d.high)}°
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ══ FIELD HEALTH ══════════════════════════════════ */
export interface LevelItem {
  label: string
  count: number
  color: string
  statusKey?: string
}

export interface FieldHealthCardProps {
  score?: number
  customLevels?: LevelItem[]
  onLevelClick?: (statusKey: string) => void
}

export function FieldHealthCard({ score = 83, customLevels, onLevelClick }: FieldHealthCardProps) {
  const [hoveredLevel, setHoveredLevel] = useState<LevelItem | null>(null)

  const defaultLevels: LevelItem[] = [
    { label: 'Excellent', count: 2, color: '#18C964', statusKey: 'excellent' },
    { label: 'Good', count: 1, color: '#00D4FF', statusKey: 'good' },
    { label: 'Moderate', count: 1, color: '#FBBF24', statusKey: 'warning' },
    { label: 'Critical', count: 0, color: '#F43F5E', statusKey: 'critical' },
  ]

  const levels = customLevels || defaultLevels
  const totalFields = levels.reduce((acc, curr) => acc + curr.count, 0) || 1
  const circumference = 263.8

  let accumulatedPercent = 0
  const segments = levels.map((lvl) => {
    const percent = (lvl.count / totalFields) * 100
    const dashArray = `${(percent / 100) * circumference} ${circumference}`
    const dashOffset = -((accumulatedPercent / 100) * circumference)
    accumulatedPercent += percent

    return { ...lvl, percent, dashArray, dashOffset }
  })

  return (
    <div className="glass card-hover" style={{ borderRadius: 18, padding: '22px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
      <div style={{ marginBottom: 18 }}>
        <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#F0FFF4', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
          Field Health Overview
        </h3>
        <p style={{ color: '#4A5D52', fontSize: 11, margin: 0 }}>
          Aggregate field health score: <span style={{ color: '#18C964', fontWeight: 600 }}>{score}/100</span>
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <div style={{ position: 'relative', width: 110, height: 110 }}>
          <svg viewBox="0 0 110 110" width={110} height={110}>
            <circle cx="55" cy="55" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            {segments.map((seg) => {
              if (seg.count === 0) return null
              const isHovered = hoveredLevel?.label === seg.label
              return (
                <circle
                  key={seg.label}
                  cx="55"
                  cy="55"
                  r="42"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? 14 : 12}
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 55 55)"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredLevel(seg)}
                  onMouseLeave={() => setHoveredLevel(null)}
                />
              )
            })}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span className="font-display" style={{ fontSize: 22, fontWeight: 800, color: '#F0FFF4' }}>{score}</span>
            <span style={{ color: '#4A5D52', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>Score</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {levels.map((l) => (
          <div key={l.label} onClick={() => l.statusKey && onLevelClick && onLevelClick(l.statusKey)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8, cursor: 'pointer' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
            <span style={{ color: '#8BA89D', fontSize: 12, flex: 1 }}>{l.label}</span>
            <span className="font-data" style={{ color: l.color, fontSize: 12, fontWeight: 600 }}>{l.count} fields</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══ AI RECOMMENDATION PANEL ═══════════════════════ */
interface AIRecommendationPanelProps {
  customRecommendations?: AIRecommendationItem[]
  onApplyAction?: (actionItem: AIRecommendationItem) => void
}

function AIRecommendationPanel({ customRecommendations, onApplyAction }: AIRecommendationPanelProps) {
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [modelConfidence, setModelConfidence] = useState(94)
  const [appliedActions, setAppliedActions] = useState<Record<string, boolean>>({})

  const defaultRecommendations: AIRecommendationItem[] = [
    { action: 'Increase Irrigation on West Orchard', detail: 'Soil moisture dropped below optimal 45% threshold.', priority: 'high', confidence: 96 },
    { action: 'Apply Nitrogen Booster', detail: 'Optimal crop growth window detected for North Field.', priority: 'medium', confidence: 89 },
    { action: 'Monitor Humid Conditions', detail: 'Fungal risk index slightly elevated in South Field.', priority: 'low', confidence: 82 },
  ]

  const recommendations = customRecommendations || defaultRecommendations
  const filteredRecommendations = filterPriority ? recommendations.filter(r => r.priority === filterPriority) : recommendations

  const handleReAnalyze = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setModelConfidence(Math.floor(Math.random() * 5) + 93)
    }, 800)
  }

  const handleApply = (r: AIRecommendationItem) => {
    setAppliedActions(prev => ({ ...prev, [r.action]: true }))
    if (onApplyAction) onApplyAction(r)
  }

  return (
    <div className="glass-green glow-green card-hover" style={{ borderRadius: 18, padding: '22px', border: '1px solid rgba(24,201,100,0.2)', background: 'rgba(24,201,100,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(24,201,100,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={18} style={{ color: '#18C964' }} />
          </div>
          <div>
            <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#F0FFF4' }}>AI Insights</div>
            <div className="font-data" style={{ fontSize: 10, color: '#18C964', fontWeight: 600 }}>Model confidence: {modelConfidence}%</div>
          </div>
        </div>

        <button onClick={handleReAnalyze} style={{ background: 'rgba(24,201,100,0.1)', border: '1px solid rgba(24,201,100,0.25)', color: '#18C964', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
          <span>{isAnalyzing ? 'Analyzing...' : 'Re-analyze'}</span>
        </button>
      </div>

      {/* Priority Filter Chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {['high', 'medium', 'low'].map((p) => {
          const isActive = filterPriority === p
          const chipColor = p === 'high' ? '#F43F5E' : p === 'medium' ? '#FBBF24' : '#18C964'
          return (
            <button
              key={p}
              onClick={() => setFilterPriority(isActive ? null : p)}
              style={{
                background: isActive ? `${chipColor}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? chipColor : 'rgba(255,255,255,0.06)'}`,
                color: isActive ? '#F0FFF4' : '#8BA89D',
                padding: '2px 8px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {p}
            </button>
          )
        })}
        {filterPriority && (
          <button
            onClick={() => setFilterPriority(null)}
            style={{ background: 'none', border: 'none', color: '#8BA89D', cursor: 'pointer', fontSize: 10, textDecoration: 'underline' }}
          >
            Reset
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map((r: AIRecommendationItem, i: number) => {
            const isApplied = appliedActions[r.action]
            return (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ color: '#F0FFF4', fontSize: 12, fontWeight: 600, marginBottom: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{r.action}</span>
                  <span className="font-data" style={{ fontSize: 10, color: '#18C964' }}>{r.confidence}%</span>
                </div>
                <div style={{ color: '#8BA89D', fontSize: 11, marginBottom: 8 }}>{r.detail}</div>
                <button onClick={() => handleApply(r)} disabled={isApplied} style={{ background: isApplied ? 'rgba(24,201,100,0.15)' : 'rgba(255,255,255,0.06)', color: isApplied ? '#18C964' : '#F0FFF4', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                  {isApplied ? '✓ Executed' : 'Apply Action →'}
                </button>
              </div>
            )
          })
        ) : (
          <div style={{ padding: '14px', textAlign: 'center', color: '#4A5D52', fontSize: 11 }}>
            No recommendations found for selected priority.
          </div>
        )}
      </div>
    </div>
  )
}

/* ══ ALERT PANEL ═══════════════════════════════════ */
export interface AlertItem {
  id: number | string
  title: string
  field: string
  value: string
  time: string
  type: 'critical' | 'warning' | 'info' | string
  icon: string
  unread?: boolean
}

export interface AlertPanelProps {
  customAlerts?: AlertItem[]
  onAlertClick?: (alert: AlertItem) => void
}

export function AlertPanel({ customAlerts, onAlertClick }: AlertPanelProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all')

  const defaultAlerts: AlertItem[] = [
    { id: 1, title: 'Low Soil Moisture', field: 'West Orchard', value: '43%', time: '10m ago', type: 'critical', icon: '⚠️', unread: true },
    { id: 2, title: 'High Temp Alert', field: 'East Greenhouse', value: '34°C', time: '1h ago', type: 'warning', icon: '🌡️', unread: true },
    { id: 3, title: 'pH Deviation', field: 'North Field', value: 'pH 6.8', time: '2h ago', type: 'info', icon: '🧪', unread: false },
  ]

  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>(
    customAlerts || defaultAlerts
  )

  const filteredAlerts = activeAlerts.filter(a => {
    if (filter === 'all') return true
    return a.type === filter
  })

  const criticalCount = activeAlerts.filter(a => a.type === 'critical').length

  const handleDismiss = (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveAlerts(prev => prev.filter(a => a.id !== id))
  }

  const handleItemClick = (alert: AlertItem) => {
    setActiveAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, unread: false } : a))
    if (onAlertClick) onAlertClick(alert)
  }

  return (
    <div className="glass card-hover" style={{ borderRadius: 18, padding: '22px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#F0FFF4', margin: 0, letterSpacing: '-0.02em' }}>
          Alerts
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {criticalCount > 0 && (
            <span className="badge badge-critical" style={{ background: 'rgba(244,63,94,0.15)', color: '#F43F5E', border: '1px solid rgba(244,63,94,0.3)', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700 }}>
              {criticalCount} critical
            </span>
          )}

          {activeAlerts.length > 0 && (
            <button
              onClick={() => setActiveAlerts([])}
              style={{ background: 'none', border: 'none', color: '#8BA89D', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs (Added 'info' Filter) */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['all', 'critical', 'warning', 'info'] as const).map((type) => {
          const isActive = filter === type
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                color: isActive ? '#F0FFF4' : '#8BA89D',
                padding: '3px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease'
              }}
            >
              {type}
            </button>
          )
        })}
      </div>

      {/* Alert Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((a) => {
            const borderColor = a.type === 'critical' ? 'rgba(244,63,94,0.25)' : a.type === 'warning' ? 'rgba(251,191,36,0.25)' : 'rgba(0,212,255,0.2)'
            const dotColor = a.type === 'critical' ? '#F43F5E' : a.type === 'warning' ? '#FBBF24' : '#00D4FF'

            return (
              <div
                key={a.id}
                onClick={() => handleItemClick(a)}
                style={{
                  borderRadius: 10,
                  padding: '12px',
                  background: a.type === 'critical' ? 'rgba(244,63,94,0.06)' : a.type === 'warning' ? 'rgba(251,191,36,0.04)' : 'rgba(0,212,255,0.04)',
                  border: `1px solid ${borderColor}`,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#F0FFF4', fontSize: 12, fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{a.title}</span>
                    {a.unread && <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />}
                  </div>
                  <div style={{ color: '#A3B8CC', fontSize: 11 }}>{a.field} · <strong style={{ color: '#F0FFF4' }}>{a.value}</strong></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{ color: '#8BA89D', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>{a.time}</span>
                  <button
                    onClick={(e) => handleDismiss(a.id, e)}
                    title="Dismiss alert"
                    style={{ background: 'none', border: 'none', color: '#8BA89D', cursor: 'pointer', fontSize: 12, padding: '0 2px' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div style={{ padding: '16px', textAlign: 'center', color: '#8BA89D', fontSize: 12 }}>
            No active alerts in this view.
          </div>
        )}
      </div>
    </div>
  )
}

/* ══ RECENT ACTIVITY ═══════════════════════════════ */
export interface ActivityItem {
  id: number | string
  type: string
  title: string
  detail: string
  time: string
  color: string
}

export interface RecentActivityFeedProps {
  customActivities?: ActivityItem[]
  onActivityClick?: (activity: ActivityItem) => void
}

export function RecentActivityFeed({ customActivities, onActivityClick }: RecentActivityFeedProps) {
  const [filterType, setFilterType] = useState<string>('all')

  const ICONS: Record<string, string> = {
    sensor: '📡',
    alert: '✅',
    weather: '🌤️',
    farmer: '👨‍🌾',
    report: '📄',
    ai: '🧠'
  }

  const defaultActivities: ActivityItem[] = [
    { id: 1, type: 'sensor', title: 'Sensor Calibrated', detail: 'Moisture sensor #12 recalibrated in North Field.', time: '5m ago', color: '#18C964' },
    { id: 2, type: 'ai', title: 'AI Recommendation', detail: 'Irrigation cycle recommended for West Orchard.', time: '25m ago', color: '#00D4FF' },
    { id: 3, type: 'alert', title: 'Alert Resolved', detail: 'Temperature spike resolved in East Greenhouse.', time: '1h ago', color: '#36D399' },
    { id: 4, type: 'farmer', title: 'Manual Task Logged', detail: 'Fertilizer application logged by Vinay.', time: '3h ago', color: '#FBBF24' },
    { id: 5, type: 'report', title: 'Weekly Summary Ready', detail: 'Crop health index report generated.', time: '5h ago', color: '#F43F5E' },
  ]

  const [activityList, setActivityList] = useState<ActivityItem[]>(
    customActivities || defaultActivities
  )

  const filteredList = filterType === 'all'
    ? activityList
    : activityList.filter(a => a.type === filterType)

  const handleAddLiveLog = () => {
    const newLog: ActivityItem = {
      id: Date.now(),
      type: 'sensor',
      title: 'Live Telemetry Sync',
      detail: 'Periodic sensor data sync completed for all 24 units.',
      time: 'Just now',
      color: '#18C964'
    }
    setActivityList(prev => [newLog, ...prev])
  }

  return (
    <div className="glass card-hover" style={{ borderRadius: 18, padding: '22px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#F0FFF4', margin: 0, letterSpacing: '-0.02em' }}>
          Recent Activity
        </h3>

        <button
          onClick={handleAddLiveLog}
          title="Simulate live activity log"
          style={{
            background: 'rgba(24,201,100,0.1)',
            border: '1px solid rgba(24,201,100,0.2)',
            color: '#18C964',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Sync Log
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {['all', 'sensor', 'ai', 'alert', 'farmer'].map((t) => {
          const isActive = filterType === t
          return (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
                color: isActive ? '#F0FFF4' : '#4A5D52',
                padding: '2px 8px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {filteredList.length > 0 ? (
          filteredList.map((a: ActivityItem, i: number) => (
            <div
              key={a.id}
              onClick={() => onActivityClick && onActivityClick(a)}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: '10px 8px',
                borderRadius: 8,
                borderBottom: i < filteredList.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                cursor: onActivityClick ? 'pointer' : 'default',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: `${a.color}15`,
                border: `1px solid ${a.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
              }}>
                {ICONS[a.type] || '📌'}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#F0FFF4', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
                  {a.title}
                </div>
                <div style={{ color: '#8BA89D', fontSize: 11, lineHeight: 1.4 }}>
                  {a.detail}
                </div>
              </div>

              <div style={{ color: '#3A4D42', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', flexShrink: 0, marginTop: 2 }}>
                {a.time}
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '16px', textAlign: 'center', color: '#4A5D52', fontSize: 11 }}>
            No recent activity logged under this filter.
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   SECONDARY VIEWS
══════════════════════════════════════════════════ */
/* ── Section Header Utility ── */
interface SectionHeaderProps {
  title: string
  sub?: string
  action?: React.ReactNode
}

function SectionHeader({ title, sub, action }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#F0FFF4', margin: '0 0 4px 0' }}>
          {title}
        </h2>
        {sub && <p style={{ color: '#8BA89D', fontSize: 13, margin: 0 }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

/* ── 1. Fields View ── */
interface FieldsViewProps {
  setActiveNav: (n: NavId) => void
  setSelectedField: (n: number) => void
  liveFields?: FieldItem[]
}

function FieldsView({ setActiveNav, setSelectedField, liveFields }: FieldsViewProps) {
  const defaultFields: FieldItem[] = [
    { id: 1, name: 'North Field', crop: 'Corn', area: '45 acres', status: 'excellent', color: '#18C964', sensors: 8, harvest: 'Oct 15', moisture: 69, temp: 24, healthScore: 92 },
    { id: 2, name: 'South Field', crop: 'Soybeans', area: '30 acres', status: 'good', color: '#00D4FF', sensors: 6, harvest: 'Nov 02', moisture: 62, temp: 25, healthScore: 84 },
    { id: 3, name: 'East Greenhouse', crop: 'Tomatoes', area: '12 acres', status: 'excellent', color: '#18C964', sensors: 6, harvest: 'Ongoing', moisture: 75, temp: 22, healthScore: 95 },
    { id: 4, name: 'West Orchard', crop: 'Apples', area: '25 acres', status: 'warning', color: '#FBBF24', sensors: 4, harvest: 'Sep 20', moisture: 43, temp: 28, healthScore: 68 },
  ]

  const fieldList = (liveFields && liveFields.length > 0) ? liveFields : defaultFields

  const handleAddField = () => {
    alert('Add Field modal / form triggered!')
  }

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader
        title="Fields"
        sub="Manage and monitor all farm zones"
        action={
          <button
            onClick={handleAddField}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, background: '#18C964', color: '#03100A', border: 'none', fontWeight: 700 }}
          >
            <Plus size={14} /> Add Field
          </button>
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {fieldList.map((f: FieldItem, i: number) => (
          <div
            key={f.id}
            className="glass card-hover"
            style={{ borderRadius: 18, padding: '22px', border: `1px solid ${f.color}30`, cursor: 'pointer', background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s ease' }}
            onClick={() => { setSelectedField(i); setActiveNav('dashboard') }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: '#F0FFF4', letterSpacing: '-0.02em', margin: '0 0 4px 0' }}>
                  {f.name}
                </h3>
                <p style={{ color: '#8BA89D', fontSize: 12, margin: 0 }}>{f.crop} · {f.area}</p>
              </div>
              <span className={`badge badge-${f.status}`} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', fontWeight: 700 }}>
                {f.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { l: 'Moisture', v: `${f.moisture ?? 0}%`, c: '#00D4FF' },
                { l: 'Temp', v: `${f.temp ?? 0}°C`, c: '#FBBF24' },
                { l: 'Health', v: `${f.healthScore ?? 0}`, c: f.color }
              ].map(m => (
                <div key={m.l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: m.c }}>{m.v}</div>
                  <div style={{ color: '#4A5D52', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>{m.l}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, color: '#4A5D52', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', display: 'flex', justifyContent: 'space-between' }}>
              <span>📡 {f.sensors} sensors</span>
              <span>Harvest: {f.harvest}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 2. Sensors View ── */
function SensorsView() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sensorTypeFilter, setSensorTypeFilter] = useState('all')

  const initialSensors = [
    { id: 'NF-01', field: 'North Field', type: 'Soil Moisture', value: '69%', status: 'online', battery: 87, signal: 95, lastSeen: '30s ago' },
    { id: 'NF-02', field: 'North Field', type: 'Temperature', value: '24°C', status: 'online', battery: 72, signal: 88, lastSeen: '30s ago' },
    { id: 'SF-01', field: 'South Field', type: 'NPK Sensor', value: 'N:74 P:71 K:68', status: 'online', battery: 65, signal: 78, lastSeen: '1m ago' },
    { id: 'SF-02', field: 'South Field', type: 'Humidity', value: '62%', status: 'online', battery: 91, signal: 92, lastSeen: '45s ago' },
    { id: 'EG-01', field: 'East Greenhouse', type: 'CO₂ Sensor', value: '420 ppm', status: 'online', battery: 55, signal: 99, lastSeen: '15s ago' },
    { id: 'WO-01', field: 'West Orchard', type: 'Soil Moisture', value: '43%', status: 'warning', battery: 34, signal: 60, lastSeen: '2m ago' },
    { id: 'WO-02', field: 'West Orchard', type: 'Weather Station', value: '23°C · NW 12km/h', status: 'online', battery: 88, signal: 72, lastSeen: '1m ago' },
    { id: 'NF-07', field: 'North Field', type: 'pH Sensor', value: '6.8', status: 'online', battery: 44, signal: 85, lastSeen: '90s ago' },
  ]

  const filteredSensors = initialSensors.filter(s => {
    const matchesSearch = s.id.toLowerCase().includes(searchTerm.toLowerCase()) || s.field.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = sensorTypeFilter === 'all' || s.type.toLowerCase().includes(sensorTypeFilter.toLowerCase())
    return matchesSearch && matchesType
  })

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="Sensors" sub={`${initialSensors.length} devices online · 1 warning alert`} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', minWidth: 220 }}>
          <Search size={14} style={{ color: '#4A5D52', marginRight: 8 }} />
          <input
            type="text"
            placeholder="Search sensor or field..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#F0FFF4', fontSize: 12, outline: 'none', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'Moisture', 'Temperature', 'NPK'].map(type => (
            <button
              key={type}
              onClick={() => setSensorTypeFilter(type)}
              style={{
                background: sensorTypeFilter === type ? 'rgba(24,201,100,0.15)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${sensorTypeFilter === type ? 'rgba(24,201,100,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: sensorTypeFilter === type ? '#18C964' : '#4A5D52',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredSensors.map(s => (
          <div key={s.id} className="glass card-hover" style={{ borderRadius: 14, padding: '16px 20px', border: `1px solid ${s.status === 'warning' ? 'rgba(244,63,94,0.3)' : 'rgba(255,255,255,0.07)'}`, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.status === 'warning' ? '#FBBF24' : '#18C964', boxShadow: `0 0 6px ${s.status === 'warning' ? '#FBBF24' : '#18C964'}` }} />
            </div>
            <div style={{ minWidth: 80 }}>
              <div className="font-data" style={{ fontSize: 13, color: '#F0FFF4', fontWeight: 600 }}>{s.id}</div>
              <div style={{ color: '#4A5D52', fontSize: 11 }}>{s.field}</div>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ color: '#8BA89D', fontSize: 12 }}>{s.type}</div>
              <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#18C964' }}>{s.value}</div>
            </div>
            <div style={{ textAlign: 'center', minWidth: 60 }}>
              <div className="font-data" style={{ fontSize: 13, color: '#FBBF24' }}>🔋 {s.battery}%</div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 4 }}>
                <div style={{ height: '100%', width: `${s.battery}%`, background: s.battery < 40 ? '#F43F5E' : s.battery < 70 ? '#FBBF24' : '#18C964', borderRadius: 2 }} />
              </div>
            </div>
            <div style={{ textAlign: 'center', minWidth: 60 }}>
              <div className="font-data" style={{ fontSize: 13, color: '#00D4FF' }}>📶 {s.signal}%</div>
            </div>
            <div style={{ color: '#4A5D52', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', minWidth: 80, textAlign: 'right' }}>{s.lastSeen}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 3. Analytics View ── */
function AnalyticsView() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader title="Analytics" sub="Comprehensive telemetry data analysis across all fields" />
      <SoilMoistureChart />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <TemperatureChart />
        <NPKChart />
      </div>
      <WeeklyGrowthChart />
    </div>
  )
}

/* ── 4. Weather View ── */
function WeatherView() {
  const fallbackRainForecast = [
    { day: 'Mon', value: 5 },
    { day: 'Tue', value: 20 },
    { day: 'Wed', value: 65 },
    { day: 'Thu', value: 15 },
    { day: 'Fri', value: 5 },
    { day: 'Sat', value: 0 },
    { day: 'Sun', value: 10 },
  ]

  const chartRainData = fallbackRainForecast

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="Weather Intelligence" sub="7-day hyper-local farm forecasting and precipitations" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <WeatherCard />
        <div className="glass" style={{ borderRadius: 18, padding: 24, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#F0FFF4', margin: '0 0 16px 0' }}>Precipitation Forecast</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRainData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#2E3D35" fontSize={10} fontFamily="JetBrains Mono, monospace" />
                <YAxis stroke="#2E3D35" fontSize={10} domain={[0, 100]} fontFamily="JetBrains Mono, monospace" />
                <Tooltip contentStyle={{ background: 'rgba(16,21,29,0.95)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }} />
                <Bar dataKey="value" name="Rain %" fill="#00D4FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 5. Alerts View ── */
function AlertsView() {
  const defaultAlertsList: AlertItem[] = [
    { id: 1, title: 'Low Soil Moisture Threshold', field: 'West Orchard', value: '43%', time: '10m ago', type: 'critical', icon: '⚠️', unread: true },
    { id: 2, title: 'High Temperature Spike', field: 'East Greenhouse', value: '34°C', time: '1h ago', type: 'warning', icon: '🌡️', unread: true },
    { id: 3, title: 'Optimal Nitrogen Levels', field: 'North Field', value: 'N:75', time: '3h ago', type: 'info', icon: '🧪', unread: false },
  ]

  const [alertItems, setAlertItems] = useState<AlertItem[]>(defaultAlertsList)

  const handleResolve = (id: number | string) => {
    setAlertItems(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="Alert Management" sub="Monitor, handle and resolve system alerts in real-time" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {alertItems.length > 0 ? (
          alertItems.map((a: AlertItem) => {
            const c = a.type === 'critical' ? '#F43F5E' : a.type === 'warning' ? '#FBBF24' : '#00D4FF'
            return (
              <div key={a.id} className="glass card-hover" style={{ borderRadius: 14, padding: '18px 22px', border: `1px solid ${c}30`, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ fontSize: 24 }}>{a.icon}</span>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#F0FFF4', marginBottom: 4 }}>{a.title}</div>
                  <div style={{ color: '#8BA89D', fontSize: 13 }}>{a.field} · {a.value}</div>
                </div>
                <div style={{ color: '#4A5D52', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{a.time}</div>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, textTransform: 'capitalize', background: `${c}20`, color: c, fontWeight: 600 }}>
                  {a.type}
                </span>
                <button
                  onClick={() => handleResolve(a.id)}
                  style={{ padding: '7px 16px', fontSize: 12, cursor: 'pointer', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0FFF4' }}
                >
                  Resolve
                </button>
              </div>
            )
          })
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#8BA89D', background: 'rgba(255,255,255,0.02)', borderRadius: 14 }}>
            ✅ All active alerts have been resolved.
          </div>
        )}
      </div>
    </div>
  )
}

/* ── 6. AI Insights View ── */
export function AIInsightsView() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader title="AI Insights" sub="Machine learning-powered crop intelligence & recommendations" />
      <AIRecommendationPanel />
      <div className="glass" style={{ borderRadius: 18, padding: 24, border: '1px solid rgba(24,201,100,0.15)', background: 'rgba(255,255,255,0.02)' }}>
        <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: '#F0FFF4', margin: '0 0 16px 0' }}>Yield Prediction vs Actual Performance</h3>
        <WeeklyGrowthChart />
      </div>
    </div>
  )
}

/* ── 7. Reports View ── */
function ReportsView() {
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const reports = [
    { id: 1, name: 'July 2026 Monthly Report', type: 'Monthly', date: 'Jul 1, 2026', size: '2.4 MB' },
    { id: 2, name: 'Week 30 Field Analysis', type: 'Weekly', date: 'Jul 24, 2026', size: '820 KB' },
    { id: 3, name: 'Soil Health Deep Dive — Q2', type: 'Quarterly', date: 'Jun 30, 2026', size: '5.1 MB' },
    { id: 4, name: 'Irrigation Efficiency Report', type: 'Custom', date: 'Jul 15, 2026', size: '1.3 MB' },
  ]

  const handleDownload = (id: number) => {
    setDownloadingId(id)
    setTimeout(() => {
      setDownloadingId(null)
      alert('Report downloaded successfully!')
    }, 600)
  }

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader
        title="Reports"
        sub="Download and generate farm analytics reports"
        action={
          <button
            onClick={() => alert('Generate new report modal opened')}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: 13, cursor: 'pointer', borderRadius: 8, background: '#18C964', color: '#03100A', border: 'none', fontWeight: 700 }}
          >
            + Generate Report
          </button>
        }
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {reports.map((r) => (
          <div key={r.id} className="glass card-hover" style={{ borderRadius: 14, padding: '18px 22px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(24,201,100,0.1)', border: '1px solid rgba(24,201,100,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={16} style={{ color: '#18C964' }} />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div className="font-display" style={{ fontSize: 14, fontWeight: 700, color: '#F0FFF4', marginBottom: 4 }}>{r.name}</div>
              <div style={{ color: '#8BA89D', fontSize: 12 }}>{r.type} · {r.date} · {r.size}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleDownload(r.id)}
                style={{ padding: '7px 14px', fontSize: 12, gap: 6, display: 'flex', alignItems: 'center', cursor: 'pointer', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0FFF4' }}
              >
                <Download size={12} /> {downloadingId === r.id ? 'Downloading...' : 'PDF'}
              </button>
              <button
                onClick={() => handleDownload(r.id)}
                style={{ padding: '7px 12px', fontSize: 12, border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, cursor: 'pointer', color: '#8BA89D', background: 'transparent' }}
              >
                CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
/* ── 8. Devices View ── */
/* ── 8. Devices View ── */
function DevicesView() {
  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="Connected Devices" sub="Hardware inventory, sensor stream and firmware status" />
      <SensorsView />
    </div>
  )
}

/* ── 9. Profile View ── */
export function ProfileView() {
  const [isEditing, setIsEditing] = useState(false)

  // LocalStorage se logged-in user details fetch karo
  const savedUserString = localStorage.getItem('agrovision_user')
  const savedUser = savedUserString ? JSON.parse(savedUserString) : {}

  // Editable Form State
  const [userData, setUserData] = useState({
    name: savedUser?.name || localStorage.getItem('userName') || 'Vinay Kumar',
    email: savedUser?.email || 'vinay.kumar@greenvalley.farm',
    phone: savedUser?.phone || '+91 98765 43210',
    location: savedUser?.location || localStorage.getItem('userLocation') || 'Uttar Pradesh, India',
    farmName: savedUser?.farmName || 'Green Valley Farm',
    role: 'Lead Agronomist & Farm Director'
  })

  // Dynamic Initials (e.g. Vinay Kumar -> VK)
  const initials = userData.name
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'VK'

  const handleSaveProfile = () => {
    localStorage.setItem('userName', userData.name)
    localStorage.setItem('userLocation', userData.location)
    localStorage.setItem('agrovision_user', JSON.stringify({ ...savedUser, ...userData }))
    setIsEditing(false)
  }

  return (
    <div style={{ padding: 28, maxWidth: 1000, margin: '0 auto', color: '#F0FFF4' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <SectionHeader title="Profile & Account Settings" sub="Manage your personal profile, farm credentials, and system privileges" />
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            background: isEditing ? 'rgba(244,63,94,0.15)' : 'rgba(24,201,100,0.12)',
            border: `1px solid ${isEditing ? 'rgba(244,63,94,0.3)' : 'rgba(24,201,100,0.25)'}`,
            color: isEditing ? '#F43F5E' : '#18C964',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          {isEditing ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit Profile</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        
        {/* Left Column: User Identity Card */}
        <div className="glass" style={{ borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: 88,
            height: 88,
            borderRadius: 22,
            background: 'linear-gradient(135deg, #18C964, #00D4FF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 800,
            color: '#03100A',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(24,201,100,0.2)'
          }}>
            {initials}
          </div>

          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, color: '#F0FFF4', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            {userData.name}
          </h2>
          <p style={{ color: '#8BA89D', fontSize: 13, margin: '0 0 16px 0', fontWeight: 500 }}>
            {userData.role}
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(24,201,100,0.1)', color: '#18C964', border: '1px solid rgba(24,201,100,0.2)', fontSize: 11, fontWeight: 700 }}>
            <ShieldCheck size={13} />
            <span>Administrator Access</span>
          </div>

          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />

          {/* Operational Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: '100%' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Layers size={14} color="#00D4FF" style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F0FFF4' }}>112</div>
              <div style={{ fontSize: 9, color: '#8BA89D', fontFamily: 'JetBrains Mono, monospace' }}>ACRES</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Cpu size={14} color="#18C964" style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F0FFF4' }}>24</div>
              <div style={{ fontSize: 9, color: '#8BA89D', fontFamily: 'JetBrains Mono, monospace' }}>SENSORS</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
              <ShieldCheck size={14} color="#FBBF24" style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F0FFF4' }}>98%</div>
              <div style={{ fontSize: 9, color: '#8BA89D', fontFamily: 'JetBrains Mono, monospace' }}>HEALTH</div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Details or Edit Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isEditing ? (
            /* EDIT PROFILE FORM */
            <div className="glass" style={{ borderRadius: 18, padding: 24, border: '1px solid rgba(24,201,100,0.2)', background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F0FFF4', margin: '0 0 16px 0' }}>Update Profile Details</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#8BA89D', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 4 }}>FULL NAME</label>
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0FFF4', fontSize: 13, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: '#8BA89D', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 4 }}>FARM NAME</label>
                  <input
                    type="text"
                    value={userData.farmName}
                    onChange={(e) => setUserData({ ...userData, farmName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0FFF4', fontSize: 13, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: '#8BA89D', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 4 }}>LOCATION</label>
                  <input
                    type="text"
                    value={userData.location}
                    onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0FFF4', fontSize: 13, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: '#8BA89D', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 4 }}>PHONE NUMBER</label>
                  <input
                    type="text"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0FFF4', fontSize: 13, outline: 'none' }}
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  style={{
                    marginTop: 8,
                    padding: '10px',
                    borderRadius: 8,
                    background: '#18C964',
                    border: 'none',
                    color: '#03100A',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Save size={15} /> Save Changes
                </button>
              </div>
            </div>
          ) : (
            /* PROFESSIONAL INFORMATION LIST */
            <>
              {[
                { label: 'Farm Organization', value: userData.farmName, icon: <Layers size={15} color="#18C964" /> },
                { label: 'Email Address', value: userData.email, icon: <Mail size={15} color="#00D4FF" /> },
                { label: 'Contact Phone', value: userData.phone, icon: <Phone size={15} color="#FBBF24" /> },
                { label: 'Primary Location', value: userData.location, icon: <MapPin size={15} color="#F43F5E" /> },
              ].map((item) => (
                <div key={item.label} className="glass" style={{ borderRadius: 14, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {item.icon}
                    <span style={{ color: '#8BA89D', fontSize: 13 }}>{item.label}</span>
                  </div>
                  <span className="font-data" style={{ color: '#F0FFF4', fontSize: 13, fontWeight: 600 }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
/* ── 10. Settings View ── */

// Dummy SectionHeader Component in case it is imported globally or missing

export function SettingsView(_props?: any) {
  const [notifs, setNotifs] = useState<boolean>(() => {
    return localStorage.getItem('app_notifs') !== 'false'
  })

  const [savedMessage, setSavedMessage] = useState(false)

  // Save Settings Handler
  const handleSave = () => {
    localStorage.setItem('app_notifs', String(notifs))
    localStorage.setItem('app_lang', 'English (US)')
    
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 2500)
  }

  const settingsConfig = [
    {
      label: 'Theme Mode',
      desc: 'System dark theme locked for optimal telemetry UI contrast',
      control: (
        <div style={{
          padding: '6px 14px',
          borderRadius: 8,
          fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace',
          background: 'rgba(24,201,100,0.15)',
          color: '#18C964',
          border: '1px solid rgba(24,201,100,0.3)',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          🌙 Dark Mode (Active)
        </div>
      )
    },
    {
      label: 'Platform Language',
      desc: 'Primary display interface language',
      control: (
        <div style={{
          padding: '6px 14px',
          borderRadius: 8,
          fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace',
          background: 'rgba(24,201,100,0.15)',
          color: '#18C964',
          border: '1px solid rgba(24,201,100,0.3)',
          fontWeight: 700
        }}>
          🇺🇸 English (US)
        </div>
      )
    },
    {
      label: 'Measurement Units',
      desc: 'Telemetry standard system (°C, Acres, Hectares)',
      control: (
        <div style={{
          padding: '6px 14px',
          borderRadius: 8,
          fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace',
          background: 'rgba(24,201,100,0.15)',
          color: '#18C964',
          border: '1px solid rgba(24,201,100,0.3)',
          fontWeight: 700
        }}>
          Metric System
        </div>
      )
    },
    {
      label: 'Push & Telemetry Alerts',
      desc: 'Receive real-time notifications for critical sensor thresholds and AI recommendations',
      control: (
        <div
          onClick={() => setNotifs(n => !n)}
          style={{
            width: 46,
            height: 24,
            borderRadius: 12,
            background: notifs ? '#18C964' : 'rgba(255,255,255,0.1)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.2s ease',
            border: `1px solid ${notifs ? 'rgba(24,201,100,0.4)' : 'rgba(255,255,255,0.1)'}`
          }}
        >
          <div style={{ position: 'absolute', top: 3, left: notifs ? 25 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
        </div>
      )
    }
  ]

  return (
    <div style={{ padding: 28, maxWidth: 850, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="font-display" style={{ fontSize: 26, fontWeight: 800, color: '#F0FFF4', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
          System Settings
        </h1>
        <p style={{ color: '#8BA89D', fontSize: 13, margin: 0 }}>
          Manage telemetry thresholds and platform notifications
        </p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {settingsConfig.map((s, i) => (
          <div
            key={i}
            className="glass"
            style={{
              borderRadius: 16,
              padding: '18px 22px',
              border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              background: 'rgba(255,255,255,0.02)'
            }}
          >
            <div>
              <div style={{ color: '#F0FFF4', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
              <div style={{ color: '#8BA89D', fontSize: 12 }}>{s.desc}</div>
            </div>
            {s.control}
          </div>
        ))}

        {/* Action Controls */}
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={handleSave}
            style={{
              background: '#18C964',
              color: '#03100A',
              border: 'none',
              padding: '10px 24px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(24,201,100,0.25)',
              transition: 'transform 0.15s ease'
            }}
          >
            Save Changes
          </button>
          
          {savedMessage && (
            <span style={{ color: '#18C964', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              ✓ Settings saved successfully
            </span>
          )}
        </div>
      </div>
    </div>
  )
}