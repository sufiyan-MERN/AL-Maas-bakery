import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import { products } from '../data/products'
import type { Product, Category } from '../data/types'
import { useCart } from '../context/CartContext'
import './menu.css'

type Sort = 'default' | 'price-asc' | 'price-desc'

const categories: { key: Category | 'all'; label: string; sub: string }[] = [
  { key: 'all', label: 'All', sub: '' },
  { key: 'artisan-breads', label: 'Artisan Breads', sub: 'Freshly baked every day' },
  { key: 'bun', label: 'Bun', sub: 'Soft, fluffy and freshly baked' },
  { key: 'puff', label: 'Puff', sub: 'Flaky golden pastries' },
  { key: 'viennoiserie', label: 'Viennoiserie', sub: 'Buttery French-inspired favourites' },
  { key: 'spreads', label: 'Spreads', sub: 'Handcrafted spreads & condiments' },
  { key: 'muffin', label: 'Muffin', sub: 'Moist and flavour-packed' },
  { key: 'tea-cake', label: 'Tea Cake', sub: 'Perfect companions for your tea' },
  { key: 'cookie', label: 'Cookie', sub: 'Crunchy, chewy and irresistible' },
  { key: 'cupcake', label: 'Cupcake', sub: 'Mini celebration in every bite' },
  { key: 'macaron', label: 'Macaron', sub: 'Delicate French sandwich cookies' },
  { key: 'soaked-cake', label: 'Soaked Cake', sub: 'Milk-soaked, moist and dreamy' },
  { key: 'pastry', label: 'Pastry', sub: 'Elegant French patisserie-style treats' },
  { key: 'brownie', label: 'Brownie', sub: 'Fudgy, nutty and chocolatey' },
  { key: 'fermented-drink', label: 'Fermented Drink', sub: 'Probiotic wellness in a bottle' },
  { key: 'cheese-cake', label: 'Cheese Cake', sub: 'Creamy, rich and indulgent' },
  { key: 'celebration-cakes', label: 'Celebration Cakes', sub: 'For every special moment' },
]

const categoryOrder: Category[] = [
  'artisan-breads',
  'bun',
  'puff',
  'viennoiserie',
  'spreads',
  'muffin',
  'tea-cake',
  'cookie',
  'cupcake',
  'macaron',
  'soaked-cake',
  'pastry',
  'brownie',
  'fermented-drink',
  'cheese-cake',
  'celebration-cakes',
]

export default function Menu() {
  const [active, setActive] = useState<Category | 'all'>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('default')
  const { addToCart } = useCart()

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length }
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1
    })
    return counts
  }, [])

  const filtered = useMemo(() => {
    let list: Product[] = products

    if (active !== 'all') {
      list = list.filter((p) => p.category === active)
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim()
      list = list.filter((p) => p.name.toLowerCase().includes(q))
    }

    if (sort === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price)
    } else if (sort === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price)
    }

    return list
  }, [active, query, sort])

  const sections = useMemo(() => {
    if (active !== 'all' || query.trim()) return null
    return categoryOrder
      .map((cat) => ({
        category: cat,
        label: categories.find((c) => c.key === cat)!.label,
        sub: categories.find((c) => c.key === cat)!.sub,
        items: products.filter((p) => p.category === cat),
      }))
      .filter((s) => s.items.length > 0)
  }, [active, query])

  return (
    <section className="menu">
      <div className="container">
        <span className="section-label">MENU</span>
        <h2 className="section-title">OUR FULL MENU</h2>
        <p className="menu__subtitle">
          Explore our handcrafted selection of breads, pastries, cakes, cookies and more.
        </p>

        <div className="menu__layout">
          <div className="menu__content">
            {filtered.length === 0 ? (
              <div className="menu__empty">
                <p>No items found. Try adjusting your search or filters.</p>
              </div>
            ) : sections ? (
              <div className="menu__sections">
                {sections.map((section) => (
                  <div key={section.category} className="menu__section" id={`section-${section.category}`}>
                    <div className="menu__section-header">
                      <h3 className="menu__section-title">{section.label.toUpperCase()}</h3>
                      <span className="menu__section-sub">{section.sub}</span>
                    </div>
                    <div className="menu__grid">
                      {section.items.map((product) => (
                        <MenuCard key={product.id} product={product} onAdd={addToCart} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="menu__grid">
                {filtered.map((product) => (
                  <MenuCard key={product.id} product={product} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>

          <aside className="menu__sidebar">
            <div className="menu__sidebar-box">
              <div className="menu__sidebar-search">
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="menu__sidebar-section">
                <h4 className="menu__sidebar-title">Categories</h4>
                <div className="menu__category-list">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      className={`menu__category-btn ${active === cat.key ? 'active' : ''}`}
                      onClick={() => setActive(cat.key)}
                    >
                      <span className="menu__category-name">{cat.label}</span>
                      <span className="menu__category-count">
                        {categoryCounts[cat.key] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="menu__sidebar-section">
                <h4 className="menu__sidebar-title">Sort By</h4>
                <div className="menu__sort-list">
                  <button
                    className={`menu__sort-option ${sort === 'default' ? 'active' : ''}`}
                    onClick={() => setSort('default')}
                  >
                    Featured
                  </button>
                  <button
                    className={`menu__sort-option ${sort === 'price-asc' ? 'active' : ''}`}
                    onClick={() => setSort('price-asc')}
                  >
                    Price: Low to High
                  </button>
                  <button
                    className={`menu__sort-option ${sort === 'price-desc' ? 'active' : ''}`}
                    onClick={() => setSort('price-desc')}
                  >
                    Price: High to Low
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function MenuCard({
  product,
  onAdd,
}: {
  product: Product
  onAdd: (p: Product) => void
}) {
  return (
    <div className="menu__product">
      <div className="menu__product-img">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="menu__product-body">
        <div className="menu__product-top">
          <h3>{product.name}</h3>
          <span className="menu__product-weight">{product.weight}</span>
        </div>
        <p className="menu__product-desc">{product.description}</p>
        <div className="menu__product-footer">
          <span className="menu__product-price">₹{product.price}</span>
          <button className="btn btn--sm btn--primary" onClick={() => onAdd(product)}>
            <Plus size={16} /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
