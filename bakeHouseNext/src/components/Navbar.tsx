'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import styles from './Navbar.module.css'

interface NavLink {
  label: string
  href?: string
  to?: string
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
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems } = useCart()

  // Don't render the public navbar on admin pages
  if (pathname && pathname.startsWith('/admin')) return null

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleHashClick = (hash: string) => {
    setOpen(false)
    if (pathname === '/') {
      const el = document.querySelector(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push('/' + hash)
    }
  }

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
      <div className={styles.navbarInner}>
        <Link href="/" className={styles.navbarLogo} onClick={() => setOpen(false)}>
          <img className={styles.navLogo} src="https://ik.imagekit.io/sufiyanImages/almaas%20bakery.png" alt="Al Maas Bakery logo" />
        </Link>

        <nav className={`${styles.navbarLinks} ${open ? styles.navbarLinksOpen : ''}`}>
          {navLinks.map((link) =>
            link.to ? (
              <Link
                key={link.label}
                href={link.to}
                className={styles.navbarLink}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className={styles.navbarLink}
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

        <div className={styles.navbarActions}>
          <Link href="/checkout" className={styles.cartBtn} aria-label={`Cart (${totalItems} items)`}>
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </Link>
          <Link href="/menu" className="btn btn--primary navbar__cta">
            Order Now
          </Link>
          <button
            className={styles.navbarHamburger}
            aria-label="Toggle menu"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && <div className={styles.navbarOverlay} onClick={() => setOpen(false)} />}
    </header>
  )
}

