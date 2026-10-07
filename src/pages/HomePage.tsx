import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Hero from '../components/Hero'
// import About from '../components/About'
import FeaturedProducts from '../components/FeaturedProducts'
import Services from '../components/Services'
import WhyChooseUs from '../components/WhyChooseUs'
import Contact from '../components/Contact'
import './HomePage.css'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeaturedProducts />

      {/* Menu CTA – replaces the inline menu section */}
      <section className="menu-cta" id="menu">
        <div className="container menu-cta__inner">
          <span className="section-label">MENU</span>
          <h2 className="section-title menu-cta__title">Explore Our Full Menu</h2>
          <p className="menu-cta__desc">
            Discover our complete collection of handcrafted cookies, buns, brownies, cupcakes, and puffs — all made with premium ingredients.
          </p>
          <Link to="/menu" className="btn btn--primary menu-cta__btn">
            View Full Menu <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <WhyChooseUs />
      <Services />
      {/* <About /> */}
      <Contact />
    </main>
  )
}
