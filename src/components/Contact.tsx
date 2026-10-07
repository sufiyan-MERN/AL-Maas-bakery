import { MapPin, MessageCircle, Camera } from 'lucide-react'
import './contact.css'

const address = 'No.92, S B Elegance, Manorayana Palya, Sultan Palya Main Road, Bengaluru - 560032'
const whatsappNumbers = ['+913212342282', '+914635311990', '+917488040309']
const instagram = '@avyanbakehouse'
// const website = 'www.avyanbakehouse.in'

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="container">
        <span className="section-label">VISIT US</span>
        <h2 className="section-title">VISIT AVYAN BAKEHOUSE</h2>

        <div className="contact__grid">
          <div className="contact__info">
            <div className="contact__item">
              <MapPin size={20} color="var(--gold)" />
              <div>
                <h4>Location</h4>
                <p>{address}</p>
              </div>
            </div>

            <div className="contact__item">
              <MessageCircle size={20} color="var(--gold)" />
              <div>
                <h4>WhatsApp</h4>
                {whatsappNumbers.map((num) => (
                  <p key={num}>
                    <a href={`https://wa.me/${num.replace('+', '')}`} target="_blank" rel="noreferrer">
                      {num}
                    </a>
                  </p>
                ))}
              </div>
            </div>

            <div className="contact__item">
              <Camera size={20} color="var(--gold)" />
              <div>
                <h4>Instagram</h4>
                <p>{instagram}</p>
              </div>
            </div>

            <div className="contact__item">
              {/* <span className="contact__web-icon">🌐</span>
              <div>
                <h4>Website</h4>
                <p>{website}</p>
              </div> */}
            </div>
          </div>

          <div className="contact__actions">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn--primary"
            >
              Get Directions
            </a>
            <a
              href={`https://wa.me/${whatsappNumbers[0].replace('+', '')}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn--outline"
            >
              <MessageCircle size={18} /> WhatsApp Us
            </a>
            <a
              href={`https://www.instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn--outline"
            >
              <Camera size={18} /> Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
