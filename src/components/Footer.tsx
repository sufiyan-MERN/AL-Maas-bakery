import { Link } from 'react-router-dom'
import { MessageCircle, Globe, Camera } from 'lucide-react'
import './footer.css'

/* Links that should use React Router navigation */
const routeLinks: Record<string, string> = {
  Home: '/',
  Menu: '/menu',
}

const footerLinks = ['Home', 'About', 'Menu', 'Services', 'Contact']

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <h3 className="footer__name">AL MAAS BAKERY</h3>
            <p className="footer__tag">Artisanal Bakery & Cafe</p>
          </div>

          <nav className="footer__nav">
            {footerLinks.map((link) =>
              routeLinks[link] ? (
                <Link
                  key={link}
                  to={routeLinks[link]}
                  className="footer__nav-link"
                >
                  {link}
                </Link>
              ) : (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="footer__nav-link"
                >
                  {link}
                </a>
              )
            )}
          </nav>

          <div className="footer__social">
            <a
              href="https://www.instagram.com/avyanbakehouse"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <Camera size={20} />
            </a>
            <a
              href="https://wa.me/917022342282"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
            <a
              href="https://www.avyanbakehouse.in"
              target="_blank"
              rel="noreferrer"
              aria-label="Website"
            >
              <Globe size={20} />
            </a>
          </div>
        </div>
        <div className='footer__img' >
          <img src="https://ik.imagekit.io/sufiyanImages/Al%20Maas%20Bakery_%20Warm%20Rustic%20Caf%C3%A9.png" alt="" />
        </div>
        <div className="footer__bottom">
          <p className="footer__tagline">
            FRESHLY BAKED · ARTISAN CRAFTED · PREMIUM INGREDIENTS
          </p>
          <p className="footer__copy">© 2026 Al Maas Bakery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
