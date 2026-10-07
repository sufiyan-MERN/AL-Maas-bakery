import { useEffect } from 'react'
import Menu from '../components/Menu'
import { featuredProducts } from '../data/products'
import { useCart } from '../context/CartContext'
import { Plus, ChevronRight } from 'lucide-react'
import './MenuPage.css'

export default function MenuPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <main className="menu-page">
      <MenuHero />
      <FeaturedSection />
      <Menu />
      <OrderCTASection />
    </main>
  )
}

function MenuHero() {
  return (
    <section className="menu-page__hero">
      <div className="menu-page__hero-bg" />
      <div className="menu-page__hero-decor">
        <span className="menu-page__hero-float menu-page__hero-float--1">🥐</span>
        <span className="menu-page__hero-float menu-page__hero-float--2">🍞</span>
        <span className="menu-page__hero-float menu-page__hero-float--3">🍪</span>
        <span className="menu-page__hero-float menu-page__hero-float--4">🌾</span>
      </div>
      <div className="container menu-page__hero-inner">
        <span className="menu-page__label">OUR MENU</span>
        <h1 className="menu-page__title">Baked with Love</h1>
        <p className="menu-page__subtitle">
          Freshly baked breads, pastries, cakes and handcrafted treats made for every moment.
        </p>
      </div>
    </section>
  )
}

function FeaturedSection() {
  const { addToCart } = useCart()
  return (
    <section className="featured" id="featured">
      <div className="container">
        <div className="featured__header">
          <span className="section-label">CUSTOMER FAVOURITES</span>
          <h2 className="section-title">Our Signature Treats</h2>
          <p className="featured__sub">The most-loved creations, baked fresh every single day.</p>
        </div>
        <div className="featured__grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="featured__card">
              <div className="featured__badge">BEST SELLER</div>
              <div className="featured__img">
                <img src={product.image} alt={product.name} loading="lazy" />
              </div>
              <div className="featured__body">
                <h3 className="featured__name">{product.name}</h3>
                <p className="featured__desc">{product.description}</p>
                <div className="featured__footer">
                  <div className="featured__price-block">
                    <span className="featured__price">₹{product.price}</span>
                    <span className="featured__weight">{product.weight}</span>
                  </div>
                  <button
                    className="btn btn--sm btn--primary featured__btn"
                    onClick={() => addToCart(product)}
                  >
                    <Plus size={16} /> Order Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function OrderCTASection() {
  return (
    <section className="order-cta">
      <div className="container">
        <div className="order-cta__inner">
          <div className="order-cta__content">
            <span className="section-label">CUSTOM ORDERS</span>
            <h2 className="order-cta__title">
              Planning a <em>celebration</em>?
            </h2>
            <p className="order-cta__text">
              From custom celebration cakes to bulk orders for events — we bring your
              sweetest visions to life.
            </p>
          </div>
          <a
            href="https://wa.me/917022342282"
            target="_blank"
            rel="noreferrer"
            className="btn btn--gold order-cta__btn"
          >
            <ChevronRight size={18} /> Place a Custom Order
          </a>
        </div>
      </div>
    </section>
  )
}
