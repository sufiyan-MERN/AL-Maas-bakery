import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Menu from '../components/Menu'
import { ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import './MenuPage.css'

export default function MenuPage() {
  const { totalItems, subtotal, openCart } = useCart()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <main className="menu-page">
      <MenuHero />
      <Menu />
      <OrderCTASection />

      {totalItems > 0 && (
        <div className="floating-cart-bar">
          <div className="container floating-cart-bar__inner">
            <div className="floating-cart-bar__info" onClick={openCart} role="button" tabIndex={0}>
              <div className="floating-cart-bar__icon">
                <ShoppingBag size={20} />
                <span className="floating-cart-bar__badge">{totalItems}</span>
              </div>
              <div className="floating-cart-bar__text">
                <span className="floating-cart-bar__items">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
                </span>
                <span className="floating-cart-bar__total">₹{subtotal}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn btn--gold floating-cart-bar__btn">
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}
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
