import { Flame, Hand, Wheat, Heart } from 'lucide-react'
import './why.css'

const features = [
  { icon: Flame, title: 'FRESHLY BAKED', text: 'Products prepared fresh every day.', img: 'https://ik.imagekit.io/sufiyanImages/images_q=tbn:ANd9GcQxzgictl2vR2IjBMWrgM3pVHU4_hUNOzBAk2H0Ta09MQ&s', imgAlt: 'Freshly baked bread' },
  { icon: Hand, title: 'ARTISAN CRAFTED', text: 'Handcrafted with care and skill.', img:'https://ik.imagekit.io/sufiyanImages/images_q=tbn:ANd9GcQCklQ2Rbpt-L3n2SiFMAT3cnl5yZoZSh7xEXPYhjdpAA&s=10', imgAlt: 'Artisan crafting bread' },
  { icon: Wheat, title: 'PREMIUM INGREDIENTS', text: 'Only the finest ingredients.', img:'https://ik.imagekit.io/sufiyanImages/bakeHouse%20img.png', imgAlt: 'Premium wheat ingredients' },
  { icon: Heart, title: 'MADE WITH LOVE', text: 'Every product made with passion.', img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT15FNoWP69wBEXFwk5rYApM_eNVe98nVu-xUvaYEK1aA&s=10', imgAlt: 'Made with love' },
]

export default function WhyChooseUs() {
  return (
    <section className="why" id="why">
      <div className="container">
        <span className="section-label">WHY US</span>
        <h2 className="section-title">WHY CHOOSE AVYAN</h2>
        <div className="why__grid">
          {features.map((f, index) => (
            <div key={f.title} className={`why__card why__card--${index + 1}`}>
              {/* <div className="why__icon">
                <f.icon size={26} color="var(--gold)" />
              </div> */}
              <div className="why__content">
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
              <div className="why__img">
                <img src={f.img} alt={f.imgAlt} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
