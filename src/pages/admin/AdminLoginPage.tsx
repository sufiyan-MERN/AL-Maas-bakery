import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { AuthService } from '../../services/db'
import { useToast } from '../../context/ToastContext'
import './adminLogin.css'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    try {
      const success = await AuthService.login(password)
      if (success) {
        showToast('Welcome back, Admin!', 'success')
        navigate('/admin')
      } else {
        setErrorMsg('Invalid admin credentials. Please try again.')
        showToast('Invalid credentials', 'error')
      }
    } catch {
      setErrorMsg('Login failed. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Logo & Header */}
        <div className="admin-login-header">
          <img
            src="https://ik.imagekit.io/sufiyanImages/almaas%20bakery.png"
            alt="Al Maas Bakery Logo"
            className="admin-login-logo"
          />
          <h2>AL MAAS BAKERY</h2>
          <span className="admin-login-badge">
            <ShieldCheck size={14} /> SECURE ADMIN PORTAL
          </span>
          <p>Enter your administrator password to manage orders, menu, delivery rates, and view audit history.</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="admin-login-error">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="adminPassword">Admin Password</label>
            <div className="password-input-wrap">
              <Lock size={18} className="password-icon" />
              <input
                id="adminPassword"
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <small className="form-hint">
              Protected by server-side credentials and permanent audit logging.
            </small>
          </div>

          <button
            type="submit"
            className="btn btn--primary admin-login-submit"
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Dashboard'}
          </button>
        </form>

        {/* Footer info */}
        <div className="admin-login-footer">
          <a href="/" className="admin-back-home">
            <ArrowLeft size={16} /> Return to Public Website
          </a>
        </div>
      </div>
    </div>
  )
}
