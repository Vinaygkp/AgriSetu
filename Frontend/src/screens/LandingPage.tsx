import { useState, useEffect } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

// Fallback safety to prevent mockData crash
import * as mockImports from '../data/mockData'

const featuresList = mockImports.features || [
  { icon: '📡', title: 'Real-time Telemetry', desc: 'Instant telemetry data feeds from soil sensors.', color: '#18C964' },
  { icon: '🧠', title: 'AI Recommendation', desc: 'Smart algorithms predicting crop water needs.', color: '#00D4FF' },
  { icon: '⛅', title: 'Weather Alerts', desc: 'Automated weather warning systems.', color: '#FBBF24' }
]

const miniChartData = [
  { v: 68 }, { v: 72 }, { v: 69 }, { v: 78 }, { v: 82 }, { v: 79 }, { v: 85 }, { v: 88 }, { v: 84 }, { v: 91 }
]

const NAV_LINKS = [
  { id: 'hero', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'about', label: 'About' }
]

const STATS = [
  { value: '25K+', label: 'Active Farms', color: '#18C964' },
  { value: '150K+', label: 'Connected Sensors', color: '#00D4FF' },
  { value: '98%', label: 'Prediction Accuracy', color: '#36D399' },
  { value: '72+', label: 'Countries', color: '#FBBF24' }
]

interface Props {
  onLogin: () => void
  onDashboard?: () => void
}

export default function LandingPage({ onLogin }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    const timer = setTimeout(() => setStatsVisible(true), 400)
    
    return () => { 
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timer) 
    }
  }, [])

  const scrollToSection = (id: string) => {
    setMobileMenu(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div style={{ background: '#05070A', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle grid */}
      <div className="grid-bg" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* Aurora bg */}
      <div className="animate-aurora" style={{
        position: 'fixed', top: '-20%', right: '-10%',
        width: '70%', height: '70%',
        background: 'radial-gradient(ellipse, rgba(24,201,100,0.07) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
      }} />
      <div className="animate-aurora" style={{
        position: 'fixed', bottom: '-30%', left: '-15%',
        width: '65%', height: '65%',
        background: 'radial-gradient(ellipse, rgba(0,212,255,0.05) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0, animationDelay: '5s',
      }} />

      {/* Navbar */}
      <nav className={scrolled ? 'glass-nav' : ''} style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'all 0.3s ease',
        padding: '0 40px',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        background: scrolled ? 'rgba(5, 7, 10, 0.85)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => scrollToSection('hero')}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(24,201,100,0.25), rgba(0,212,255,0.15))',
              border: '1px solid rgba(24,201,100,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
                <path d="M12 2C18 2 22 7 21 13C20 19 15 23 9 22C3 21 1 16 2 10C3 4 7 2 12 2Z" fill="rgba(24,201,100,0.2)" stroke="#18C964" strokeWidth="0.8" />
                <rect x="5" y="16" width="2.5" height="4" rx="1" fill="#18C964" />
                <rect x="9" y="13" width="2.5" height="7" rx="1" fill="#18C964" />
                <rect x="13" y="10" width="2.5" height="10" rx="1" fill="#00D4FF" />
                <rect x="17" y="12" width="2.5" height="8" rx="1" fill="#36D399" />
              </svg>
            </div>
            <span className="font-display" style={{ fontSize: 18, fontWeight: 700, color: '#F0FFF4', letterSpacing: '-0.02em' }}>
              AgroVision<span style={{ color: '#18C964' }}>.</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="hide-mobile" style={{ display: 'flex', gap: 4 }}>
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8BA89D',
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '8px 16px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F0FFF4')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8BA89D')}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-secondary" style={{ padding: '8px 20px', fontSize: 14, cursor: 'pointer' }} onClick={onLogin}>
              Log In
            </button>
            <button className="btn-primary" style={{ padding: '8px 20px', fontSize: 14, cursor: 'pointer' }} onClick={onLogin}>
              Get Started →
            </button>
          </div>

          {/* Mobile menu toggle button */}
          <button className="btn-ghost mobile-only" style={{ background: 'transparent', border: 'none', color: '#F0FFF4', cursor: 'pointer' }} onClick={() => setMobileMenu(m => !m)}>
            <svg width={22} height={22} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="3" y1="6" x2="19" y2="6" /><line x1="3" y1="11" x2="19" y2="11" /><line x1="3" y1="16" x2="19" y2="16" />
            </svg>
          </button>
        </div>

        {mobileMenu && (
          <div className="glass animate-slide-down" style={{
            padding: '16px 24px', 
            borderRadius: 12, 
            margin: '0 16px 16px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 8,
            background: 'rgba(10, 14, 20, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8BA89D',
                  fontSize: 15,
                  padding: '10px 0',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                {link.label}
              </button>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn-secondary" style={{ flex: 1, cursor: 'pointer' }} onClick={onLogin}>Log In</button>
              <button className="btn-primary" style={{ flex: 1, cursor: 'pointer' }} onClick={onLogin}>Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '140px 40px 80px' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 60, alignItems: 'center' }}>
          {/* Left */}
          <div className="animate-fade-in-up">
            <div className="badge badge-excellent animate-fade-in" style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#18C964', display: 'inline-block' }} />
              AI-Powered Agriculture · Now in 72 Countries
            </div>

            <h1 className="font-display" style={{
              fontSize: 'clamp(36px, 5vw, 68px)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              marginBottom: 24,
              color: '#F0FFF4',
            }}>
              Transform{' '}
              <span className="gradient-text">Agricultural Data</span>{' '}
              Into Intelligent Decisions
            </h1>

            <p style={{ color: '#8BA89D', fontSize: 18, lineHeight: 1.65, marginBottom: 40, maxWidth: 440 }}>
              Monitor soil moisture, temperature, weather and NPK values using powerful analytics dashboards that help farmers increase productivity by up to{' '}
              <span style={{ color: '#18C964', fontWeight: 600 }}>38%</span>.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <button className="btn-primary" style={{ fontSize: 16, padding: '14px 32px', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={onLogin}>
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" />
                </svg>
                Start Monitoring
              </button>
              <button className="btn-secondary" style={{ fontSize: 16, padding: '14px 28px', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => scrollToSection('analytics')}>
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polygon points="6,4 12,8 6,12" />
                </svg>
                Watch Demo
              </button>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 40 }}>
              <div style={{ display: 'flex' }}>
                {['#18C964', '#00D4FF', '#FBBF24', '#F43F5E', '#8B5CF6'].map((c, i) => (
                  <div key={i} style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${c}44, ${c}22)`,
                    border: `2px solid #05070A`,
                    marginLeft: i > 0 ? -10 : 0,
                  }} />
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width={14} height={14} viewBox="0 0 14 14" fill="#FBBF24"><path d="M7 1l1.5 4.5H14l-4 3 1.5 4.5L7 10.5 2.5 13 4 8.5 0 5.5h5.5z" /></svg>
                  ))}
                </div>
                <p style={{ color: '#8BA89D', fontSize: 12, marginTop: 2 }}>Trusted by 25,000+ farms worldwide</p>
              </div>
            </div>
          </div>

          {/* Right — Dashboard Mockup */}
          <div className="animate-fade-in-up animate-float" style={{ animationDelay: '0.3s', position: 'relative' }}>
            <DashboardMockup onLogin={onLogin} />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="glass" style={{ borderRadius: 24, padding: '40px 60px' }}>
            <p style={{ textAlign: 'center', color: '#8BA89D', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 30, fontFamily: 'JetBrains Mono, monospace' }}>
              Trusted by farmers across the globe
            </p>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
              {STATS.map((s, i) => (
                <div key={i} style={{ textAlign: 'center', animation: statsVisible ? `counter 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.12}s both` : 'none' }}>
                  <div className="font-display" style={{
                    fontSize: 'clamp(36px,4vw,58px)',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    color: s.color,
                    textShadow: `0 0 30px ${s.color}44`,
                    lineHeight: 1,
                    marginBottom: 8,
                  }}>{s.value}</div>
                  <div style={{ color: '#8BA89D', fontSize: 14 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '100px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="badge badge-good" style={{ marginBottom: 16 }}>Platform Features</div>
            <h2 className="font-display" style={{ fontSize: 'clamp(28px,3vw,48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, color: '#F0FFF4' }}>
              Everything your farm needs
            </h2>
            <p style={{ color: '#8BA89D', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
              From sensor telemetry to AI-generated crop recommendations — all in one platform.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {featuresList.map((f: any, i: number) => (
              <FeatureCard key={i} {...f} delay={i * 0.06} />
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="badge badge-excellent" style={{ marginBottom: 16 }}>Smart Solutions</div>
            <h2 className="font-display" style={{ fontSize: 'clamp(28px,3vw,48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, color: '#F0FFF4' }}>
              Tailored for Farms of All Sizes
            </h2>
            <p style={{ color: '#8BA89D', fontSize: 17, maxWidth: 540, margin: '0 auto' }}>
              Optimized telemetry pipelines designed for orchards, greenhouses, and large scale agricultural fields.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              { title: 'Precision Irrigation', icon: '💧', desc: 'Automated water distribution schedules based on real-time soil moisture & weather feeds.' },
              { title: 'Soil & NPK Optimization', icon: '🧪', desc: 'Custom fertilizer maps and deficiency warnings powered by IoT soil sensors.' },
              { title: 'Crop Health Protection', icon: '🛡️', desc: 'Early pest and fungal detection algorithms to protect high-yield harvests.' },
            ].map((sol, idx) => (
              <div key={idx} className="glass card-hover" style={{ padding: 32, borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{sol.icon}</div>
                <h3 className="font-display" style={{ fontSize: 20, color: '#F0FFF4', marginBottom: 12 }}>{sol.title}</h3>
                <p style={{ color: '#8BA89D', fontSize: 14, lineHeight: 1.6 }}>{sol.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" style={{ position: 'relative', zIndex: 1, padding: '100px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="glass-green" style={{ borderRadius: 28, padding: '60px 40px', border: '1px solid rgba(24,201,100,0.2)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'center' }}>
              <div>
                <span className="badge badge-good" style={{ marginBottom: 16 }}>AI Predictive Engine</span>
                <h2 className="font-display" style={{ fontSize: 'clamp(28px,3vw,42px)', fontWeight: 800, color: '#F0FFF4', marginBottom: 20, lineHeight: 1.15 }}>
                  Real-time Data Processing & Yield Forecasting
                </h2>
                <p style={{ color: '#8BA89D', fontSize: 16, lineHeight: 1.65, marginBottom: 28 }}>
                  Our platform aggregates data across all connected sensors to predict future soil degradation, optimal harvesting dates, and water efficiency metrics.
                </p>
                <button className="btn-primary" style={{ fontSize: 15 }} onClick={onLogin}>
                  Try Analytics Live →
                </button>
              </div>

              {/* Analytics Preview Card */}
              <div className="glass" style={{ borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ color: '#18C964', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>SOIL MOISTURE FORECAST</span>
                  <span style={{ color: '#00D4FF', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>98.4% ACCURACY</span>
                </div>
                <div style={{ width: '100%', height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={miniChartData}>
                      <Area type="monotone" dataKey="v" stroke="#18C964" strokeWidth={2} fill="rgba(24,201,100,0.2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{ position: 'relative', zIndex: 1, padding: '100px 40px 140px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="badge badge-good" style={{ marginBottom: 16 }}>About AgroVision</div>
            <h2 className="font-display" style={{ fontSize: 'clamp(28px,3vw,48px)', fontWeight: 800, color: '#F0FFF4', marginBottom: 16 }}>
              Empowering Agricultural Intelligence Globally
            </h2>
            <p style={{ color: '#8BA89D', fontSize: 17, maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
              Founded with the mission to bring space-grade IoT sensors and artificial intelligence directly into the hands of farmers to ensure maximum crop sustainability.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 40px 100px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="glass-green glow-green" style={{ borderRadius: 24, padding: '64px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(24,201,100,0.08) 0%, transparent 50%, rgba(0,212,255,0.06) 100%)',
            }} />
            <div style={{ position: 'relative' }}>
              <h2 className="font-display" style={{ fontSize: 'clamp(28px,3vw,48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, color: '#F0FFF4' }}>
                Ready to grow smarter?
              </h2>
              <p style={{ color: '#8BA89D', fontSize: 17, marginBottom: 36, maxWidth: 460, margin: '0 auto 36px' }}>
                Join 25,000+ farms already using AgroVision Analytics to maximize yield and reduce waste.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
                <button className="btn-primary" style={{ fontSize: 16, padding: '14px 36px', cursor: 'pointer' }} onClick={onLogin}>
                  Get Started Free
                </button>
                <button className="btn-secondary" style={{ fontSize: 16, cursor: 'pointer' }} onClick={onLogin}>
                  View Live Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px', color: '#8BA89D' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <span className="font-display" style={{ color: '#F0FFF4', fontSize: 16, fontWeight: 600 }}>AgroVision Analytics</span>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => scrollToSection(l.id)} style={{ background: 'transparent', border: 'none', color: '#8BA89D', fontSize: 13, cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F0FFF4')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8BA89D')}
              >{l.label}</button>
            ))}
          </div>
          <span style={{ fontSize: 12 }}>© 2026 AgroVision Inc.</span>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc, color, delay }: { icon: string; title: string; desc: string; color: string; delay: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="glass card-hover"
      style={{
        borderRadius: 16,
        padding: '28px 24px',
        cursor: 'pointer',
        borderColor: hovered ? `${color}30` : 'rgba(255,255,255,0.07)',
        animation: `fade-in-up 0.7s ease ${delay}s both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        marginBottom: 18,
        transition: 'all 0.28s ease',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
        boxShadow: hovered ? `0 0 20px ${color}30` : 'none',
      }}>
        {icon}
      </div>
      <h3 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: '#F0FFF4', marginBottom: 10, letterSpacing: '-0.02em' }}>
        {title}
      </h3>
      <p style={{ color: '#8BA89D', fontSize: 13.5, lineHeight: 1.65 }}>{desc}</p>
    </div>
  )
}

function DashboardMockup({ onLogin }: { onLogin: () => void }) {
  const sensorPings = [
    { style: { top: '20%', left: '-8%' }, color: '#18C964', label: 'N-07' },
    { style: { top: '60%', right: '-6%' }, color: '#00D4FF', label: 'S-03' },
    { style: { bottom: '15%', left: '10%' }, color: '#FBBF24', label: 'W-12' },
  ]

  return (
    <div
      onClick={onLogin}
      style={{
        cursor: 'pointer',
        position: 'relative',
        maxWidth: 560,
        margin: '0 auto',
      }}
    >
      {/* Browser frame */}
      <div className="glass glow-green" style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(24,201,100,0.2)' }}>
        <div style={{ background: 'rgba(10,14,20,0.9)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F43F5E' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FBBF24' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#18C964' }} />
          <div className="font-data" style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '4px 12px', fontSize: 10, color: '#8BA89D', marginLeft: 8 }}>
            app.agrovision.io/dashboard
          </div>
        </div>

        <div style={{ padding: 20, background: '#07090D' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Soil Moisture', value: '69%', color: '#00D4FF', icon: '💧' },
              { label: 'Temperature', value: '24°C', color: '#FBBF24', icon: '🌡️' },
              { label: 'NPK Level', value: '82%', color: '#18C964', icon: '🧪' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 14, marginBottom: 4 }}>{s.icon}</div>
                <div className="font-display" style={{ fontSize: 17, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: '#8BA89D', fontSize: 10, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: '14px 12px', marginBottom: 14, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: '#8BA89D', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>Soil Moisture Trend</span>
              <span style={{ color: '#18C964', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>Live ●</span>
            </div>
            <div style={{ width: '100%', height: 70 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={miniChartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18C964" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#18C964" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#18C964" strokeWidth={1.5} fill="url(#mg)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="glass-green" style={{ borderRadius: 10, padding: '12px', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(24,201,100,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🧠</div>
                <div>
                  <div style={{ color: '#18C964', fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>AI RECOMMENDATION · 97% confidence</div>
                  <div style={{ color: '#8BA89D', fontSize: 12, marginTop: 2 }}>Irrigate West Orchard — moisture critically low</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 10, padding: '12px' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>☀️</div>
              <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: '#F0FFF4', lineHeight: 1 }}>32°C</div>
              <div style={{ color: '#8BA89D', fontSize: 10, marginTop: 2 }}>Clear · Iowa</div>
            </div>

            <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, padding: '12px' }}>
              <div style={{ color: '#F43F5E', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'JetBrains Mono, monospace' }}>⚠ ALERT</div>
              <div style={{ color: '#8BA89D', fontSize: 12 }}>Low moisture — West Orchard</div>
            </div>
          </div>
        </div>
      </div>

      {sensorPings.map((s, i) => (
        <div key={i} className="animate-float" style={{ position: 'absolute', ...s.style, animationDelay: `${i * 1.5}s` }}>
          <div className="glass" style={{ borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${s.color}30` }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
              <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', border: `1px solid ${s.color}`, opacity: 0.5, animation: 'pulse-ring 2s ease-out infinite' }} />
            </div>
            <span className="font-data" style={{ fontSize: 10, color: s.color }}>{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}