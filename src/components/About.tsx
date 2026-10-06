import { Flame, Sparkles, Wheat } from 'lucide-react'
import './about.css'

const highlights = [
  {
    icon: Flame,
    title: 'FRESHLY BAKED',
    text: 'Fresh products prepared with care every single day.',
  },
  {
    icon: Sparkles,
    title: 'ARTISAN CRAFTED',
    text: 'Handcrafted bakery products with meticulous attention to detail.',
  },
  {
    icon: Wheat,
    title: 'PREMIUM INGREDIENTS',
    text: 'Quality ingredients selected for an exceptional taste experience.',
  },
]

export default function About() {
  return (
    <section className="about" id="about">
      <div className="container">
        <span className="section-label">OUR STORY</span>
        <h2 className="section-title">CRAFTED WITH PASSION</h2>
        <p className="about__lead">
          At Avyan Bakehouse, we believe great baking starts with great
          ingredients. Every loaf, pastry and treat is made by hand using
          time-honoured artisan techniques — because you deserve nothing but
          the best.
        </p>

        <div className="about__highlights">
          {highlights.map((item) => (
            <div key={item.title} className="about__card">
              <div className="about__icon">
                <item.icon size={28} color="var(--gold)" />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
