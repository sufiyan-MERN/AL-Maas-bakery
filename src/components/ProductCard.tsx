import { useCart } from '../context/CartContext'
import type { Product } from '../data/types'
import { Plus } from 'lucide-react'
import './products.css'

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()

  return (
    <div className="product-card">
      <div className="product-card__image">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__desc">{product.description}</p>
        <div className="product-card__footer">
          <span className="product-card__price">₹{product.price}</span>
          <button
            className="btn btn--sm btn--primary"
            onClick={() => addToCart(product)}
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>
    </div>
  )
}
