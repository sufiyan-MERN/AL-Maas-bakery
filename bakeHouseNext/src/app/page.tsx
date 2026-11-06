import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Hero from '@/components/Hero'
import FeaturedProducts from '@/components/FeaturedProducts'
import WhyChooseUs from '@/components/WhyChooseUs'
import Services from '@/components/Services'
import Contact from '@/components/Contact'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeaturedProducts />

      {/* Menu CTA Section */}
      <section className="menu-cta" id="menu-cta" style={{
        padding: '80px 0',
        background: 'var(--navy)',
        textAlign: 'center',
        color: 'var(--white)',
      }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <span className="section-label" style={{ color: 'var(--gold)', marginBottom: '12px' }}>
            EXPLORE
          </span>
          <h2 className="section-title" style={{ color: 'var(--white)', marginBottom: '16px' }}>
            Explore Our Full Menu
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.75)', marginBottom: '32px', fontSize: '1.05rem' }}>
            Discover our complete artisanal collection of handcrafted breads, cookies, buns, brownies, cupcakes, and viennoiserie — all freshly baked.
          </p>
          <Link href="/menu" className="btn btn--gold">
            <span>View Full Menu</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <WhyChooseUs />
      <Services />
      <Contact />
    </main>
  )
}

