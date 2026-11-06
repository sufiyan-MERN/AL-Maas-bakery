import { useState, useEffect, useRef, useMemo } from 'react'
import { X, Filter, ChevronDown, Check, Star } from 'lucide-react'
import type { Category } from '../data/types'
import './FilterPanel.css'

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating-desc'
export type AvailabilityOption = 'all' | 'available' | 'out-of-stock'

interface FilterState {
  categories: Category[]
  sort: SortOption
  availability: AvailabilityOption
  rating: boolean
}

interface FilterPanelProps {
  products: Array<{ category: Category; isAvailable?: boolean; price: number; rating?: number }>
  onFilterChange: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

const FILTER_CATEGORIES: { key: Category; label: string }[] = [
  { key: 'cookie', label: 'Cookies' },
  { key: 'bun', label: 'Buns' },
  { key: 'brownie', label: 'Brownies' },
  { key: 'cupcake', label: 'Cupcakes' },
  { key: 'puff', label: 'Puffs' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Highest Rated' },
]

const AVAILABILITY_OPTIONS: { value: AvailabilityOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'out-of-stock', label: 'Out of Stock' },
]

function getCategoryCounts(products: FilterPanelProps['products']) {
  const counts: Record<string, number> = {}
  FILTER_CATEGORIES.forEach((cat) => {
    counts[cat.key] = products.filter((p) => p.category === cat.key).length
  })
  return counts
}

function computeRating(product: { category: Category; price: number; discountPrice?: number }): number {
  let rating = 3.5
  if (product.category === 'celebration-cakes' || product.category === 'cheese-cake') rating += 1
  if (product.category === 'macaron' || product.category === 'pastry') rating += 0.5
  if (product.discountPrice && product.discountPrice < product.price) rating += 0.3
  if (product.price > 500) rating += 0.2
  return Math.min(5, Math.max(1, rating + (Math.sin(product.price * 0.01) * 0.5)))
}

export default function FilterPanel({
  products,
  onFilterChange,
  initialFilters = {},
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    sort: 'default',
    availability: 'all',
    rating: false,
    ...initialFilters,
  })
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const justOpened = useRef(false)

  const categoryCounts = getCategoryCounts(products)

  const activeFilterCount = useMemo(() => {
    let count = filters.categories.length
    if (filters.sort !== 'default') count++
    if (filters.availability !== 'all') count++
    if (filters.rating) count++
    return count
  }, [filters])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (justOpened.current) return
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  const toggleCategory = (category: Category) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const handleTriggerClick = () => {
    justOpened.current = true
    setIsOpen((prev) => !prev)
    setTimeout(() => {
      justOpened.current = false
    }, 0)
  }

  const handleSortChange = (sort: SortOption) => {
    setFilters((prev) => ({ ...prev, sort }))
  }

  const handleAvailabilityChange = (availability: AvailabilityOption) => {
    setFilters((prev) => ({ ...prev, availability }))
  }

  const toggleRating = () => {
    setFilters((prev) => ({ ...prev, rating: !prev.rating }))
  }

  const clearAll = () => {
    setFilters({
      categories: [],
      sort: 'default',
      availability: 'all',
      rating: false,
    })
  }

  const hasActiveFilters = activeFilterCount > 0

  return (
    <div className="filter-panel-wrapper">
      <button
        ref={buttonRef}
        className={`filter-trigger-btn ${hasActiveFilters ? 'has-filters' : ''}`}
        onClick={handleTriggerClick}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Open filters"
      >
        <Filter size={18} />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="filter-badge" aria-label={`${activeFilterCount} active filters`}>
            {activeFilterCount}
          </span>
        )}
        <ChevronDown size={16} className={`filter-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      <div
        ref={panelRef}
        className={`filter-panel ${isOpen ? 'visible' : ''}`}
        role="dialog"
        aria-label="Product filters"
        aria-hidden={!isOpen}
      >
          <div className="filter-panel__header">
            <h3 className="filter-panel__title">Filters</h3>
            {hasActiveFilters && (
              <button
                className="filter-panel__clear"
                onClick={clearAll}
                aria-label="Clear all filters"
              >
                <X size={16} />
                Clear All
              </button>
            )}
          </div>

          <div className="filter-panel__content">
            <div className="filter-section">
              <h4 className="filter-section__title">Category</h4>
              <div className="filter-section__options">
                {FILTER_CATEGORIES.map((cat) => (
                  <label
                    key={cat.key}
                    className={`filter-checkbox ${filters.categories.includes(cat.key) ? 'active' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(cat.key)}
                      onChange={() => toggleCategory(cat.key)}
                    />
                    <span className="filter-checkbox__label">{cat.label}</span>
                    <span className="filter-checkbox__count">
                      {categoryCounts[cat.key] || 0}
                    </span>
                    <span className="filter-checkbox__check">
                      <Check size={14} />
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4 className="filter-section__title">Sort By</h4>
              <div className="filter-section__options filter-section__options--radio">
                {SORT_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`filter-radio ${filters.sort === opt.value ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="sort"
                      checked={filters.sort === opt.value}
                      onChange={() => handleSortChange(opt.value)}
                    />
                    <span className="filter-radio__label">{opt.label}</span>
                    <span className="filter-radio__dot" />
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4 className="filter-section__title">Availability</h4>
              <div className="filter-section__options filter-section__options--radio">
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`filter-radio ${filters.availability === opt.value ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="availability"
                      checked={filters.availability === opt.value}
                      onChange={() => handleAvailabilityChange(opt.value)}
                    />
                    <span className="filter-radio__label">{opt.label}</span>
                    <span className="filter-radio__dot" />
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4 className="filter-section__title">Rating</h4>
              <label className="filter-toggle">
                <input
                  type="checkbox"
                  checked={filters.rating}
                  onChange={toggleRating}
                />
                <span className="filter-toggle__label">
                  <Star size={16} className="filter-toggle__star" fill="currentColor" />
                  Highest Rated (4★+)
                </span>
                <span className="filter-toggle__track">
                  <span className="filter-toggle__thumb" />
                </span>
              </label>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="filter-panel__footer">
              <button
                className="btn btn--primary filter-panel__apply"
                onClick={() => setIsOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>

      <div
        className={`filter-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
    </div>
  )
}