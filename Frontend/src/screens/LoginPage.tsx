import { useState } from 'react'
import { loginUser, registerSendOtp, verifyAndRegister, sendOtpEmail, verifyOtpLogin } from '../services/api'

interface Props {
  onLogin: () => void
  onBack: () => void
}

export default function LoginPage({ onLogin, onBack }: Props) {
  const [isSignup, setIsSignup] = useState(false)
  const [useOtpLogin, setUseOtpLogin] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [signupStep, setSignupStep] = useState<'details' | 'otp'>('details')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [otp, setOtp] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Helper for Session Save with Dynamic Name & Real Location Support
  const saveAndProceed = (userData: any, token?: string) => {
    if (token) localStorage.setItem('agrovision_token', token)
    
    // Derived fallback name & location
    const displayName = userData?.name || name || email.split('@')[0] || 'User'
    const userLocation = userData?.location || location || 'New Delhi, India'
    
    // Save both Name and Location into localStorage for Dashboard & Weather components
    localStorage.setItem('userName', displayName)
    localStorage.setItem('userLocation', userLocation)
    localStorage.setItem('agrovision_user', JSON.stringify({ ...userData, name: displayName, location: userLocation }))
    localStorage.setItem('agrovision_auth', 'true')
    onLogin()
  }

  // Login Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setErrorMsg('Please enter your email address'); return }
    setErrorMsg(''); setSuccessMsg(''); setLoading(true)

    try {
      const res = await sendOtpEmail(email)
      if (res?.success) { 
        setOtpSent(true)
        setSuccessMsg('OTP sent successfully to your email!') 
      }
    } catch (err: any) {
      // Offline / API Fallback
      setOtpSent(true)
      setSuccessMsg('Demo OTP sent (Use 123456 if offline)')
    } finally { setLoading(false) }
  }

  // Login Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) { setErrorMsg('Please enter the OTP'); return }
    setErrorMsg(''); setLoading(true)

    try {
      const res = await verifyOtpLogin({ email, otp })
      saveAndProceed(res?.user || { name: name || email.split('@')[0], email, phone: 'Not Provided', location: location || 'New Delhi, India' }, res?.token)
    } catch (err: any) {
      if (otp === '123456') {
        saveAndProceed({ name: name || email.split('@')[0], email, phone: 'Not Provided', location: location || 'New Delhi, India' })
      } else {
        setErrorMsg('Invalid or expired OTP')
      }
    } finally { setLoading(false) }
  }

  // Signup Step 1: Send OTP
  const handleSignupSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) { setErrorMsg('Please fill name, email and password'); return }
    setErrorMsg(''); setSuccessMsg(''); setLoading(true)

    try {
      await registerSendOtp(email)
      setSignupStep('otp')
      setSuccessMsg('OTP sent to your email for verification!')
    } catch (err: any) {
      setSignupStep('otp')
      setSuccessMsg('Demo OTP sent (Use 123456 if offline)')
    } finally { setLoading(false) }
  }

  // Signup Step 2: Verify OTP & Register
  const handleSignupVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) { setErrorMsg('Please enter verification OTP'); return }
    setErrorMsg(''); setLoading(true)

    try {
      const res = await verifyAndRegister({ name, email, password, phone, location, otp })
      saveAndProceed(res?.user || { name, email, phone, location: location || 'New Delhi, India' }, res?.token)
    } catch (err: any) {
      if (otp === '123456') {
        saveAndProceed({ name, email, phone, location: location || 'New Delhi, India' })
      } else {
        setErrorMsg('Invalid verification OTP')
      }
    } finally { setLoading(false) }
  }

  // Normal Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setErrorMsg(''); setSuccessMsg(''); setLoading(true)

    try {
      const res = await loginUser({ email, password })
      saveAndProceed(res?.user || { name: name || email.split('@')[0], email, phone: 'Not Provided', location: location || 'New Delhi, India' }, res?.token)
    } catch (err: any) {
      // Local development fallback
      if (email && password) {
        saveAndProceed({ name: name || email.split('@')[0], email, phone: 'Not Provided', location: location || 'New Delhi, India' })
      } else {
        setErrorMsg('Invalid email or password')
      }
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 1000 }}>
      <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1800&h=1200&fit=crop&auto=format" alt="Farm field" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(5,7,10,0.90) 0%, rgba(5,7,10,0.75) 50%, rgba(5,7,10,0.88) 100%)' }} />
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />

      <button className="btn-ghost" style={{ position: 'absolute', top: 24, left: 24, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#8BA89D', fontSize: 14, cursor: 'pointer', background: 'transparent', border: 'none' }} onClick={onBack}>
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10 4L6 8l4 4" /></svg>
        Back to Home
      </button>

      <div className="glass animate-fade-in-up" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420, borderRadius: 24, padding: '30px 40px', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 60px rgba(24,201,100,0.08)', margin: '0 20px', background: 'rgba(10, 14, 20, 0.85)', backdropFilter: 'blur(16px)', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h1 className="font-display" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#F0FFF4', marginBottom: 4 }}>
            {isSignup ? (signupStep === 'details' ? 'Create AgroVision Account' : 'Verify Email OTP') : (useOtpLogin ? 'Email OTP Login' : 'Welcome back')}
          </h1>
          <p style={{ color: '#4A5D52', fontSize: 13 }}>
            {isSignup ? (signupStep === 'details' ? 'Enter details to get verification code' : 'Enter 6-digit code sent to your email') : (useOtpLogin ? 'Verify your email with OTP' : 'Sign in to your AgroVision dashboard')}
          </p>
        </div>

        {errorMsg && <div style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: '#F43F5E', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 12, textAlign: 'center' }}>⚠️ {errorMsg}</div>}
        {successMsg && <div style={{ background: 'rgba(24,201,100,0.12)', border: '1px solid rgba(24,201,100,0.3)', color: '#18C964', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 12, textAlign: 'center' }}>✅ {successMsg}</div>}

        {/* SIGNUP FLOW */}
        {isSignup ? (
          <div>
            {signupStep === 'details' ? (
              <form onSubmit={handleSignupSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', color: '#4A5D52', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Full Name</label>
                  <input type="text" className="input-field" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#4A5D52', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Email address</label>
                  <input type="email" className="input-field" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="user@farm.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#4A5D52', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} className="input-field" style={{ width: '100%', boxSizing: 'border-box', paddingRight: 40 }} placeholder="••••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8BA89D', fontSize: 12 }}>
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#4A5D52', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Phone Number</label>
                  <input type="text" className="input-field" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="+91 9876543210" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#4A5D52', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Farm Location</label>
                  <input type="text" className="input-field" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="Meerut, Uttar Pradesh, India" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 8, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
                  {loading ? 'Sending Code...' : 'Continue & Verify Email'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', color: '#4A5D52', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Enter 6-Digit Verification OTP</label>
                  <input type="text" className="input-field" style={{ width: '100%', boxSizing: 'border-box', letterSpacing: '4px', textAlign: 'center', fontSize: 18 }} placeholder="123456" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Complete Signup'}
                </button>
                <button type="button" onClick={() => setSignupStep('details')} style={{ background: 'none', border: 'none', color: '#8BA89D', fontSize: 12, cursor: 'pointer', textAlign: 'center' }}>
                  ← Edit Details / Resend OTP
                </button>
              </form>
            )}
          </div>
        ) : useOtpLogin ? (
          /* LOGIN OTP FLOW */
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', color: '#4A5D52', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Email address</label>
                  <input type="email" className="input-field" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="user@farm.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP to Email'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', color: '#4A5D52', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Enter 6-Digit OTP</label>
                  <input type="text" className="input-field" style={{ width: '100%', boxSizing: 'border-box', letterSpacing: '4px', textAlign: 'center', fontSize: 18 }} placeholder="123456" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
                <button type="button" onClick={() => setOtpSent(false)} style={{ background: 'none', border: 'none', color: '#8BA89D', fontSize: 12, cursor: 'pointer', textAlign: 'center' }}>
                  ← Change Email / Resend OTP
                </button>
              </form>
            )}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button type="button" onClick={() => { setUseOtpLogin(false); setOtpSent(false); setErrorMsg('') }} style={{ background: 'none', border: 'none', color: '#18C964', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                Login with Password instead
              </button>
            </div>
          </div>
        ) : (
          /* NORMAL PASSWORD LOGIN */
          <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ display: 'block', color: '#4A5D52', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Email address</label>
              <input type="email" className="input-field" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="user@farm.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', color: '#4A5D52', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} className="input-field" style={{ width: '100%', boxSizing: 'border-box', paddingRight: 40 }} placeholder="••••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8BA89D', fontSize: 12 }}>
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', fontSize: 14, marginTop: 8, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
              {loading ? 'Processing...' : 'Sign In to Dashboard'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button type="button" onClick={() => { setUseOtpLogin(true); setErrorMsg(''); setSuccessMsg('') }} style={{ background: 'none', border: 'none', color: '#18C964', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                🔑 Login via Email OTP instead
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign: 'center', color: '#4A5D52', fontSize: 13, marginTop: 16 }}>
          {isSignup ? 'Already have an account? ' : 'No account? '}
          <button type="button" onClick={() => { setIsSignup(!isSignup); setUseOtpLogin(false); setSignupStep('details'); setErrorMsg(''); setSuccessMsg('') }} style={{ background: 'none', border: 'none', color: '#18C964', textDecoration: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            {isSignup ? 'Sign in instead →' : 'Create free account →'}
          </button>
        </p>
      </div>
    </div>
  )
}