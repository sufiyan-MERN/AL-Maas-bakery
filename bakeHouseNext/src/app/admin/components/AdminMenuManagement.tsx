'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Edit, Trash2, Check, X, AlertTriangle } from 'lucide-react'
import type { Product, Category } from '@/types'
import { useToast } from '@/context/ToastContext'

interface AdminMenuManagementProps {
  products: Product[]
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<Product | null>
  onDeleteProduct: (id: string) => Promise<boolean>
  onToggleAvailability: (id: string) => Promise<Product | null>
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'artisan-breads', label: 'Artisan Breads' },
  { key: 'bun', label: 'Bun' },
  { key: 'puff', label: 'Puff' },
  { key: 'viennoiserie', label: 'Viennoiserie' },
  { key: 'spreads', label: 'Spreads' },
  { key: 'muffin', label: 'Muffin' },
  { key: 'tea-cake', label: 'Tea Cake' },
  { key: 'cookie', label: 'Cookie' },
  { key: 'cupcake', label: 'Cupcake' },
  { key: 'macaron', label: 'Macaron' },
  { key: 'soaked-cake', label: 'Soaked Cake' },
  { key: 'pastry', label: 'Pastry' },
  { key: 'brownie', label: 'Brownie' },
  { key: 'fermented-drink', label: 'Fermented Drink' },
  { key: 'cheese-cake', label: 'Cheese Cake' },
  { key: 'celebration-cakes', label: 'Celebration Cakes' },
]

export default function AdminMenuManagement({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleAvailability,
}: AdminMenuManagementProps) {
  const { showToast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'outofstock'>('all')

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  // Form states
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState<Category>('artisan-breads')
  const [formPrice, setFormPrice] = useState<string>('')
  const [formDiscountPrice, setFormDiscountPrice] = useState<string>('')
  const [formWeight, setFormWeight] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formImage, setFormImage] = useState('')
  const [formIsAvailable, setFormIsAvailable] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory
      const matchesAvail =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && p.is_available !== false) ||
        (availabilityFilter === 'outofstock' && p.is_available === false)

      return matchesSearch && matchesCat && matchesAvail
    })
  }, [products, searchQuery, selectedCategory, availabilityFilter])

  const openAddModal = () => {
    setFormName('')
    setFormCategory('artisan-breads')
    setFormPrice('')
    setFormDiscountPrice('')
    setFormWeight('')
    setFormDescription('')
    setFormImage('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80')
    setFormIsAvailable(true)
    setIsAddModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormName(product.name)
    setFormCategory(product.category)
    setFormPrice(String(product.price))
    setFormDiscountPrice(product.discount_price ? String(product.discount_price) : '')
    setFormWeight(product.weight || '')
    setFormDescription(product.description || '')
    setFormImage(product.image || '')
    setFormIsAvailable(product.is_available)
  }

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formPrice) {
      showToast('Name and price are required', 'warning')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await onAddProduct({
        name: formName.trim(),
        category: formCategory,
        price: parseFloat(formPrice),
        discount_price: formDiscountPrice ? parseFloat(formDiscountPrice) : null,
        weight: formWeight.trim() || undefined,
        description: formDescription.trim(),
        image: formImage.trim() || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
        is_available: formIsAvailable,
      })
      if (res) {
        setIsAddModalOpen(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct || !formName.trim() || !formPrice) return

    setIsSubmitting(true)
    try {
      const res = await onUpdateProduct(editingProduct.id, {
        name: formName.trim(),
        category: formCategory,
        price: parseFloat(formPrice),
        discount_price: formDiscountPrice ? parseFloat(formDiscountPrice) : null,
        weight: formWeight.trim() || undefined,
        description: formDescription.trim(),
        image: formImage.trim(),
        is_available: formIsAvailable,
      })
      if (res) {
        setEditingProduct(null)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingProductId) return
    setIsSubmitting(true)
    try {
      await onDeleteProduct(deletingProductId)
      setDeletingProductId(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-menu-management">
      <div className="admin-page-header">
        <div>
          <h2>Menu & Products</h2>
          <p>Create, update, toggle stock availability, and manage bakery products.</p>
        </div>
        <button className="btn btn--primary" onClick={openAddModal}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={18} color="var(--gold)" />
          <input
            type="text"
            placeholder="Search by name, description, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-filter-selects">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories ({CATEGORIES.length})</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value as any)}
          >
            <option value="all">All Availability</option>
            <option value="available">In Stock Only</option>
            <option value="outofstock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="admin-card">
        <div className="admin-card__body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Weight</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-empty-state">
                      No products match your search or filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="admin-product-cell">
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&q=80'}
                            alt={p.name}
                            className="admin-product-thumb"
                          />
                          <div>
                            <strong className="admin-product-name">{p.name}</strong>
                            <p className="admin-product-sub">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-tag">
                          {CATEGORIES.find((c) => c.key === p.category)?.label || p.category}
                        </span>
                      </td>
                      <td>
                        <div className="admin-price-cell">
                          <strong>₹{p.price}</strong>
                          {p.discount_price && (
                            <span className="discount-tag">Sale: ₹{p.discount_price}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {p.weight || '—'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`availability-toggle-btn ${
                            p.is_available
                              ? 'availability-toggle-btn--in-stock'
                              : 'availability-toggle-btn--out-of-stock'
                          }`}
                          onClick={() => onToggleAvailability(p.id)}
                          title="Click to toggle availability"
                        >
                          {p.is_available ? <Check size={14} /> : <X size={14} />}
                          <span>{p.is_available ? 'In Stock' : 'Out of Stock'}</span>
                        </button>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            className="admin-icon-btn admin-icon-btn--edit"
                            title="Edit Product"
                            onClick={() => openEditModal(p)}
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            className="admin-icon-btn admin-icon-btn--delete"
                            title="Delete Product"
                            onClick={() => setDeletingProductId(p.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Add New Product</h3>
              <button className="admin-modal-close" onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAdd} className="admin-modal-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artisanal Sourdough"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="table-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Category)}
                    className="table-input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Weight / Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. 500g, 4 pcs"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="table-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Regular Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 180"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="table-input"
                  />
                </div>
                <div className="form-group">
                  <label>Discount Price (₹, optional)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 150"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                    className="table-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Short description of ingredients, flavor notes..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="table-input"
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <div className="image-input-row">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="table-input"
                  />
                  {formImage && <img src={formImage} alt="Preview" className="image-preview-thumb" />}
                </div>
              </div>

              <div className="delivery-toggle-box" style={{ marginTop: '8px' }}>
                <div>
                  <strong>Available in Stock</strong>
                  <p>When disabled, customers will see this product as Sold Out</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                  />
                  <span className="slider round" />
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="admin-modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Edit Product: {editingProduct.name}</h3>
              <button className="admin-modal-close" onClick={() => setEditingProduct(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="admin-modal-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="table-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Category)}
                    className="table-input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Weight / Unit</label>
                  <input
                    type="text"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="table-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Regular Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="table-input"
                  />
                </div>
                <div className="form-group">
                  <label>Discount Price (₹, optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                    className="table-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="table-input"
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <div className="image-input-row">
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="table-input"
                  />
                  {formImage && <img src={formImage} alt="Preview" className="image-preview-thumb" />}
                </div>
              </div>

              <div className="delivery-toggle-box" style={{ marginTop: '8px' }}>
                <div>
                  <strong>Available in Stock</strong>
                  <p>When disabled, customers cannot purchase this product</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                  />
                  <span className="slider round" />
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="admin-modal-overlay" onClick={() => setDeletingProductId(null)}>
          <div className="admin-modal-card admin-modal-card--danger" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon-danger">
              <AlertTriangle size={32} color="#c62828" />
            </div>
            <h3>Delete Product?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '8px 0 24px' }}>
              Are you sure you want to permanently delete this item from the bakery catalog?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                className="btn btn--outline"
                onClick={() => setDeletingProductId(null)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="btn btn--danger"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

