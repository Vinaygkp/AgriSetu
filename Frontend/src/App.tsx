import { useState, useEffect } from 'react'
import LoadingScreen from './screens/LoadingScreen'
import LandingPage from './screens/LandingPage'
import LoginPage from './screens/LoginPage'
import Dashboard from './screens/Dashboard'

type Screen = 'loading' | 'landing' | 'login' | 'dashboard'

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading')

  // Check active session on initial load
  useEffect(() => {
    const isAuth = localStorage.getItem('agrovision_auth') === 'true'
    if (isAuth) {
      sessionStorage.setItem('next_screen', 'dashboard')
    } else {
      sessionStorage.setItem('next_screen', 'landing')
    }
  }, [])

  const handleLoadingComplete = () => {
    const next = (sessionStorage.getItem('next_screen') as Screen) || 'landing'
    setScreen(next)
  }

  const handleLoginSuccess = () => {
    localStorage.setItem('agrovision_auth', 'true')
    setScreen('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('agrovision_auth')
    sessionStorage.removeItem('next_screen')
    setScreen('landing')
  }

  return (
    <div style={{ background: '#05070A', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      {screen === 'loading' && (
        <LoadingScreen onComplete={handleLoadingComplete} />
      )}

      {screen === 'landing' && (
        <LandingPage
          onLogin={() => setScreen('login')}
          onDashboard={() => setScreen('dashboard')}
        />
      )}

      {screen === 'login' && (
        <LoginPage
          onLogin={handleLoginSuccess}
          onBack={() => setScreen('landing')}
        />
      )}

      {screen === 'dashboard' && (
        <Dashboard onLogout={handleLogout} />
      )}
    </div>
  )
}