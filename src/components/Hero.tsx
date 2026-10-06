import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import './hero.css'

const heroImages = [
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
  'https://ik.imagekit.io/sufiyanImages/images_q=tbn:ANd9GcQBSk2guGFa-F_EgLRWHm41-jB9fUEDfdKASMlldV7UPw&s=10',
  'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
  'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&q=80',
]

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="container hero__grid">
        <div className="hero__content">
          <span className="hero__label">ARTISANAL BAKERY & CAFE</span>
          <h1 className="hero__title">
            Baked with <em>love</em>,<br />
            made for <em>you</em>.
          </h1>
          <p className="hero__subtitle">
            Freshly baked artisan breads, pastries and handcrafted treats made
            with premium ingredients.
          </p>
          <div className="hero__actions">
            <Link to="/menu" className="btn btn--primary">
              Explore Menu <ArrowRight size={18} />
            </Link>
            <a href="#contact" className="btn btn--outline">
              <ShoppingBag size={18} /> Order Now
            </a>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__grid-images">
            {heroImages.map((src, i) => (
              <div
                key={i}
                className="hero__img-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <img src={src} alt="" loading="lazy" />
              </div>
            ))}
          </div>
          {/* <div className="hero__decor" /> */}
        </div>
      </div>
    </section>
  )
}
