'use client'

import { MapPin, MessageCircle, Camera } from 'lucide-react'
import './contact.css'

const address = 'No.92, S B Elegance, Manorayana Palya, Sultan Palya Main Road, Bengaluru - 560032'
const whatsappNumbers = ['+913212342282', '+914635311990', '+917488040309']
const instagram = '@alMaasBakery'

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="container">
        <span className="section-label">VISIT US</span>
        <h2 className="section-title">AL MAAS BAKERY</h2>

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
          </div>

          <div className="contact__actions">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d62193.946447341725!2d77.5282725!3d13.0279242!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae173710d3430f%3A0x94fa4d9a4e4237e2!2sAvyan%20Bakehouse!5e0!3m2!1sen!2sin!4v1793880487926!5m2!1sen!2sin"
              title="Bakery location"
              loading="lazy"
            />
            <a
              href={`https://wa.me/${whatsappNumbers[0].replace('+', '')}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn--outline"
            >
              <MessageCircle size={18} /> WhatsApp Us
            </a>
            <a
              href={`https://www.instagram.com/avyanbakehouse`}
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

