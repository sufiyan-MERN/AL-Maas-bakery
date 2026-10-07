import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import './navbar.css'

interface NavLink {
  label: string
  href?: string    // hash link for same-page scroll
  to?: string      // route link for page navigation
}

const navLinks: NavLink[] = [
  { label: 'Home', to: '/' },
  { label: 'About', href: '#why' },
  { label: 'Menu', to: '/menu' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /**
   * Handle hash-based links (About, Services, Contact).
   * If we're already on the home page, scroll to the section.
   * If we're on another page (e.g. /menu), navigate home first,
   * then the browser will scroll to the hash target.
   */
  const handleHashClick = (hash: string) => {
    setOpen(false)
    if (location.pathname === '/') {
      const el = document.querySelector(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/' + hash)
    }
  }

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" onClick={() => setOpen(false)}>
          <img className='nav_logo' src="https://ik.imagekit.io/sufiyanImages/almaas%20bakery.png" alt="logo" />
        </Link>

        <nav className={`navbar__links${open ? ' navbar__links--open' : ''}`}>
          {navLinks.map((link) =>
            link.to ? (
              <Link
                key={link.label}
                to={link.to}
                className="navbar__link"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="navbar__link"
                onClick={(e) => {
                  e.preventDefault()
                  handleHashClick(link.href!)
                }}
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        <div className="navbar__actions">
          <Link to="/menu" className="btn btn--primary navbar__cta">
            Order Now
          </Link>
          <button
            className="navbar__hamburger"
            aria-label="Toggle menu"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && <div className="navbar__overlay" onClick={() => setOpen(false)} />}
    </header>
  )
}
