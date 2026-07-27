import { useEffect, useState, useRef } from 'react'

const LOADING_TEXTS = [
  'Connecting Farm Sensors...',
  'Reading Soil Data...',
  'Checking Weather Systems...',
  'Loading Analytics Engine...',
  'Preparing Dashboard...',
]

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 5.5) % 90}%`,
  size: `${3 + (i * 1.7) % 8}px`,
  duration: `${9 + (i * 1.3) % 10}s`,
  delay: `${(i * 0.4) % 6}s`,
  opacity: 0.25 + (i * 0.04) % 0.45,
}))

interface Props { 
  onComplete: () => void 
}

export default function LoadingScreen({ onComplete }: Props) {
  const [textIndex, setTextIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [textFade, setTextFade] = useState(true)
  
  // Ref to hold the latest onComplete callback without triggering effect re-runs
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const TOTAL = 4400

    // Text cycler with subtle fade effect
    const textInterval = setInterval(() => {
      setTextFade(false)
      setTimeout(() => {
        setTextIndex(i => (i + 1) % LOADING_TEXTS.length)
        setTextFade(true)
      }, 150)
    }, 880)

    // Progress bar updater
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 100 / (TOTAL / 40), 100))
    }, 40)

    // Completion Timer
    const timer = setTimeout(() => {
      onCompleteRef.current()
    }, TOTAL)

    return () => {
      clearInterval(textInterval)
      clearInterval(progressInterval)
      clearTimeout(timer)
    }
  }, []) // Empty dependency array ensures exact execution timing

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: '#05070A', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      overflow: 'hidden',
      zIndex: 9999 
    }}>
      {/* Grid background */}
      <div className="grid-bg" style={{ position: 'absolute', inset: 0 }} />

      {/* Aurora blobs */}
      <div className="animate-aurora" style={{
        position: 'absolute', top: '-15%', left: '-15%',
        width: '55%', height: '55%',
        background: 'radial-gradient(ellipse, rgba(24,201,100,0.09) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />
      <div className="animate-aurora" style={{
        position: 'absolute', bottom: '-20%', right: '-15%',
        width: '60%', height: '60%',
        background: 'radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 70%)',
        borderRadius: '50%',
        animationDelay: '4s',
        animationDirection: 'reverse',
      }} />
      <div style={{
        position: 'absolute', top: '40%', left: '40%',
        width: '40%', height: '40%',
        background: 'radial-gradient(ellipse, rgba(54,211,153,0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'aurora 12s ease-in-out infinite 2s',
      }} />

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          bottom: '-30px',
          left: p.left,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: `rgba(24,201,100,${p.opacity})`,
          boxShadow: `0 0 8px rgba(24,201,100,0.7)`,
          animation: `particle-rise ${p.duration} linear ${p.delay} infinite`,
        }} />
      ))}

      {/* Floating data points */}
      {[
        { x: '15%', y: '30%', label: 'NPK: 82%', color: '#18C964' },
        { x: '80%', y: '25%', label: 'H₂O: 69%', color: '#00D4FF' },
        { x: '10%', y: '65%', label: '24°C', color: '#FBBF24' },
        { x: '82%', y: '60%', label: 'pH 6.8', color: '#36D399' },
      ].map((d, i) => (
        <div key={i} className="animate-float glass-light" style={{
          position: 'absolute',
          left: d.x,
          top: d.y,
          padding: '6px 12px',
          borderRadius: 8,
          animationDelay: `${i * 1.2}s`,
          opacity: 0.6,
        }}>
          <span className="font-data" style={{ fontSize: 11, color: d.color }}>{d.label}</span>
        </div>
      ))}

      {/* Sensor pulse points */}
      {[
        { x: '22%', y: '70%', color: '#18C964', delay: '0s' },
        { x: '74%', y: '38%', color: '#00D4FF', delay: '1s' },
        { x: '55%', y: '20%', color: '#36D399', delay: '2s' },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: s.x, top: s.y }}>
          <div style={{ position: 'relative', width: 10, height: 10 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
            <div style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', border: `1px solid ${s.color}`, opacity: 0.5, animation: `pulse-ring 2.5s ease-out ${s.delay} infinite` }} />
            <div style={{ position: 'absolute', inset: '-14px', borderRadius: '50%', border: `1px solid ${s.color}`, opacity: 0.25, animation: `pulse-ring 2.5s ease-out calc(${s.delay} + 0.5s) infinite` }} />
          </div>
        </div>
      ))}

      {/* Main Content */}
      <div className="animate-fade-in-up" style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '40px 24px', maxWidth: 480, width: '100%' }}>
        {/* Logo Card */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <div className="animate-float glow-green" style={{
            width: 108,
            height: 108,
            borderRadius: 28,
            background: 'linear-gradient(135deg, rgba(24,201,100,0.15), rgba(0,212,255,0.08))',
            border: '1px solid rgba(24,201,100,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <LogoSVG />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="font-display gradient-text" style={{
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          marginBottom: 8,
          lineHeight: 1,
        }}>
          AgroVision Analytics
        </h1>
        <p style={{
          color: '#4A5D52',
          fontSize: 12,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: 48,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          Smart Agriculture Intelligence Platform
        </p>

        {/* Progress Bar */}
        <div style={{ width: '100%', marginBottom: 16 }}>
          <div style={{
            height: 2,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 14,
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #18C964, #00D4FF)',
              borderRadius: 4,
              transition: 'width 0.08s linear',
              boxShadow: '0 0 10px rgba(24,201,100,0.7)',
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-data" style={{
              color: '#18C964',
              fontSize: 12,
              opacity: textFade ? 1 : 0,
              transition: 'opacity 0.15s ease',
            }}>
              {LOADING_TEXTS[textIndex]}
            </span>
            <span className="font-data" style={{ color: '#3A4D42', fontSize: 12 }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Bottom Hint */}
        <p style={{ color: '#2E3D35', fontSize: 11, letterSpacing: '0.05em', marginTop: 32 }}>
          Powered by AgroVision AI · v4.2.1
        </p>
      </div>
    </div>
  )
}

function LogoSVG() {
  return (
    <svg viewBox="0 0 64 64" width={62} height={62} fill="none">
      <path
        d="M32 7 C50 7 59 20 57 36 C55 52 42 61 27 59 C12 57 5 44 7 29 C9 14 18 7 32 7Z"
        fill="rgba(24,201,100,0.12)"
        stroke="rgba(24,201,100,0.4)"
        strokeWidth="0.8"
      />
      <path d="M32 9 Q37 28 29 57" stroke="rgba(24,201,100,0.25)" strokeWidth="0.8" fill="none" />
      <path d="M32 9 Q22 24 18 44" stroke="rgba(24,201,100,0.15)" strokeWidth="0.6" fill="none" />
      
      {/* Bars */}
      <rect x="14" y="43" width="7" height="10" rx="2" fill="#18C964"
        style={{ transformOrigin: '17.5px 53px', animation: 'bar-grow 0.8s ease 0.3s both' }} />
      <rect x="23" y="35" width="7" height="18" rx="2" fill="#18C964"
        style={{ transformOrigin: '26.5px 53px', animation: 'bar-grow 0.8s ease 0.5s both' }} />
      <rect x="32" y="27" width="7" height="26" rx="2" fill="#00D4FF"
        style={{ transformOrigin: '35.5px 53px', animation: 'bar-grow 0.8s ease 0.7s both' }} />
      <rect x="41" y="32" width="7" height="21" rx="2" fill="#36D399"
        style={{ transformOrigin: '44.5px 53px', animation: 'bar-grow 0.8s ease 0.9s both' }} />
      
      {/* Trend line */}
      <polyline points="17,43 26,35 35,27 44,32" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="17" cy="43" r="2" fill="white" opacity="0.6" />
      <circle cx="26" cy="35" r="2" fill="white" opacity="0.6" />
      <circle cx="35" cy="27" r="2.5" fill="white" opacity="0.9" />
      <circle cx="44" cy="32" r="2" fill="white" opacity="0.6" />
    </svg>
  )
}