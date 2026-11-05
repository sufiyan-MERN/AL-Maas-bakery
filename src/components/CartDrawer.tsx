import { Link } from 'react-router-dom'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import './cartDrawer.css'

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, updateQuantity, removeFromCart, totalItems, subtotal } = useCart()

  if (!isCartOpen) return null

  return (
    <div className="cart-drawer-overlay" onClick={closeCart}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__title-wrap">
            <ShoppingBag size={20} color="var(--gold)" />
            <h3>Your Cart</h3>
            <span className="cart-drawer__count">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
          </div>
          <button className="cart-drawer__close" onClick={closeCart} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <span className="cart-drawer__empty-icon">🥐</span>
              <h4>Your cart is empty</h4>
              <p>Looks like you haven't added any baked goods yet!</p>
              <Link to="/menu" className="btn btn--primary btn--sm" onClick={closeCart}>
                Explore Our Menu
              </Link>
            </div>
          ) : (
            <div className="cart-drawer__items">
              {items.map(({ product, quantity }) => {
                const effectivePrice = product.discountPrice ?? product.price
                return (
                  <div key={product.id} className="cart-drawer__item">
                    <img src={product.image} alt={product.name} className="cart-drawer__item-img" />
                    <div className="cart-drawer__item-info">
                      <div className="cart-drawer__item-top">
                        <h4 className="cart-drawer__item-name">{product.name}</h4>
                        <button
                          className="cart-drawer__item-remove"
                          onClick={() => removeFromCart(product.id)}
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <span className="cart-drawer__item-price">₹{effectivePrice}</span>
                      <div className="cart-drawer__item-qty">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span>{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="cart-drawer__item-total">
                          ₹{effectivePrice * quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__subtotal">
              <span>Subtotal</span>
              <span className="cart-drawer__subtotal-amount">₹{subtotal}</span>
            </div>
            <p className="cart-drawer__delivery-note">
              Delivery charges calculated at checkout based on distance.
            </p>
            <Link to="/checkout" className="btn btn--primary cart-drawer__checkout-btn" onClick={closeCart}>
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}

