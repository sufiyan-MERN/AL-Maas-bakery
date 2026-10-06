import { ProductCard } from './ProductCard'
import { featuredProducts } from '../data/products'
import './products.css'

export default function FeaturedProducts() {
  return (
    <section className="featured" id="featured">
      <div className="container">
        <div className="section-header">
          <span className="section-label">SIGNATURE</span>
          <h2 className="section-title">OUR SIGNATURE TREATS</h2>
        </div>
        <div className="featured__grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
