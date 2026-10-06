import { Users, Building2 } from 'lucide-react'
import './services.css'

const b2bItems = ['Cafés', 'Restaurants', 'Hotels', 'Corporate Events']
const b2cItems = ['Families', 'Friends', 'Everyday Moments']

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="container">
        <span className="section-label">SERVICES</span>
        <h2 className="section-title">WE SERVE B2B & B2C</h2>
        <p className="services__subtitle">WITH THE SAME PASSION</p>

        <div className="services__grid">
          <div className="services__col">
            <div className="services__col-header">
              <Building2 size={28} color="var(--gold)" />
              <h3>BULK ORDERS FOR</h3>
            </div>
            <ul className="services__list">
              {b2bItems.map((item) => (
                <li key={item}>
                  <span className="services__dot" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="services__divider" />

          <div className="services__col">
            <div className="services__col-header">
              <Users size={28} color="var(--gold)" />
              <h3>FRESHLY CRAFTED FOR</h3>
            </div>
            <ul className="services__list">
              {b2cItems.map((item) => (
                <li key={item}>
                  <span className="services__dot" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="services__cta">
          <a href="#contact" className="btn btn--gold">
            Partner With Us
          </a>
        </div>
      </div>
    </section>
  )
}
