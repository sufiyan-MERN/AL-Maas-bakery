'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import type { Product, Category } from '@/types'
import { ProductCard } from './ProductCard'
import { products as defaultProducts } from '@/data/products'
import './menu.css'

const categories: { key: Category | 'all'; label: string }[] = [
  { key: 'all', label: 'All Items' },
  { key: 'artisan-breads', label: 'Artisan Breads' },
  { key: 'bun', label: 'Buns & Rolls' },
  { key: 'puff', label: 'Puffs & Savouries' },
  { key: 'viennoiserie', label: 'Viennoiserie' },
  { key: 'cookie', label: 'Cookies' },
  { key: 'brownie', label: 'Brownies' },
  { key: 'cheese-cake', label: 'Cheesecakes' },
]

export default function Menu({ initialProducts }: { initialProducts?: Product[] }) {
  const allProducts = initialProducts && initialProducts.length > 0 ? initialProducts : defaultProducts
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [query, setQuery] = useState('')

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allProducts.length }
    allProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1
    })
    return counts
  }, [allProducts])

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory
      const q = query.toLowerCase()
      const matchQuery =
        !query ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      return matchCat && matchQuery
    })
  }, [allProducts, activeCategory, query])

  return (
    <section className="menu" id="menu">
      <div className="container">
        <span className="section-label">ARTISANAL SELECTION</span>
        <h2 className="section-title">OUR FULL MENU</h2>
        <p className="menu__subtitle">Handcrafted daily with organic flour and slow fermentation.</p>

        <div className="menu__layout">
          <div className="menu__content">
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <p>No products found matching your search.</p>
              </div>
            ) : (
              <div className="menu__grid">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          <aside className="menu__sidebar">
            <div className="menu__sidebar-box">
              <div className="menu__sidebar-search">
                <Search size={16} color="var(--gold)" />
                <input
                  type="text"
                  placeholder="Search treats..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div>
                <h4 className="menu__sidebar-title">Categories</h4>
                <div className="menu__category-list">
                  {categories.map((c) => (
                    <button
                      key={c.key}
                      className={`menu__category-btn ${
                        activeCategory === c.key ? 'menu__category-btn--active' : ''
                      }`}
                      onClick={() => setActiveCategory(c.key)}
                    >
                      <span>{c.label}</span>
                      <span className="menu__category-count">
                        ({categoryCounts[c.key] || 0})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

