import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react'
import type { Product, Category } from '../../data/types'
import { useToast } from '../../context/ToastContext'

interface AdminMenuManagementProps {
  products: Product[]
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product | null>
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

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'outofstock'>('all')

  // Modals
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

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory
      const matchesAvail =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && p.isAvailable !== false) ||
        (availabilityFilter === 'outofstock' && p.isAvailable === false)

      return matchesSearch && matchesCat && matchesAvail
    })
  }, [products, searchQuery, selectedCategory, availabilityFilter])

  // Open Add Modal
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

  // Open Edit Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormName(product.name)
    setFormCategory(product.category)
    setFormPrice(String(product.price))
    setFormDiscountPrice(product.discountPrice ? String(product.discountPrice) : '')
    setFormWeight(product.weight || '')
    setFormDescription(product.description || '')
    setFormImage(product.image || '')
    setFormIsAvailable(product.isAvailable !== false)
  }

  // Save Add
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formPrice) {
      showToast('Name and price are required', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      await onAddProduct({
        name: formName.trim(),
        category: formCategory,
        price: Number(formPrice),
        discountPrice: formDiscountPrice ? Number(formDiscountPrice) : undefined,
        weight: formWeight.trim() || undefined,
        description: formDescription.trim(),
        image: formImage.trim() || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
        isAvailable: formIsAvailable,
      })
      setIsAddModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    setIsSubmitting(true)
    try {
      await onUpdateProduct(editingProduct.id, {
        name: formName.trim(),
        category: formCategory,
        price: Number(formPrice),
        discountPrice: formDiscountPrice ? Number(formDiscountPrice) : undefined,
        weight: formWeight.trim() || undefined,
        description: formDescription.trim(),
        image: formImage.trim() || editingProduct.image,
        isAvailable: formIsAvailable,
      })
      setEditingProduct(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingProductId) return
    await onDeleteProduct(deletingProductId)
    setDeletingProductId(null)
  }

  const deletingProduct = products.find((p) => p.id === deletingProductId)

  return (
    <div className="admin-menu-management">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2>Menu & Catalog Management</h2>
          <p>Full control over Al Maas Bakery products, prices, images, and live stock availability.</p>
        </div>
        <button className="btn btn--gold" onClick={openAddModal}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by product name, category, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-filter-selects">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories ({products.length})</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label} ({products.filter((p) => p.category === c.key).length})
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value as any)}
          >
            <option value="all">All Availability</option>
            <option value="available">In Stock Only</option>
            <option value="outofstock">Out of Stock Only</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="admin-card">
        <div className="admin-card__header">
          <h3>
            Products List <span className="text-muted">({filteredProducts.length} items)</span>
          </h3>
        </div>

        <div className="admin-card__body">
          {filteredProducts.length === 0 ? (
            <div className="admin-empty-state">
              <p>No products match your current search or filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Weight</th>
                    <th>Availability</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const isAvailable = product.isAvailable !== false
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="admin-product-cell">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="admin-product-thumb"
                            />
                            <div>
                              <strong className="admin-product-name">{product.name}</strong>
                              <p className="admin-product-sub">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-tag">{product.category}</span>
                        </td>
                        <td>
                          <div className="admin-price-cell">
                            <strong>₹{product.price}</strong>
                            {product.discountPrice && (
                              <span className="discount-tag">Sale: ₹{product.discountPrice}</span>
                            )}
                          </div>
                        </td>
                        <td>{product.weight || '—'}</td>
                        <td>
                          <button
                            className={`availability-toggle-btn ${
                              isAvailable
                                ? 'availability-toggle-btn--in-stock'
                                : 'availability-toggle-btn--out-of-stock'
                            }`}
                            onClick={() => onToggleAvailability(product.id)}
                            title="Click to toggle availability"
                          >
                            {isAvailable ? (
                              <>
                                <Check size={14} /> In Stock
                              </>
                            ) : (
                              <>
                                <X size={14} /> Out of Stock
                              </>
                            )}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="admin-row-actions">
                            <button
                              className="admin-icon-btn admin-icon-btn--edit"
                              onClick={() => openEditModal(product)}
                              title="Edit Product"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="admin-icon-btn admin-icon-btn--delete"
                              onClick={() => setDeletingProductId(product.id)}
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div
          className="admin-modal-overlay"
          onClick={() => {
            setIsAddModalOpen(false)
            setEditingProduct(null)
          }}
        >
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Bakery Product'}</h3>
              <button
                className="admin-modal-close"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setEditingProduct(null)
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={editingProduct ? handleSaveEdit : handleSaveAdd} className="admin-modal-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourdough Olive Baguette"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Category)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Weight / Serving (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 500g, 250ml, 1 pc"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 180"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Discount Price (₹, optional)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave empty if none"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL * (ImageKit / Unsplash / Direct link)</label>
                <div className="image-input-row">
                  <input
                    type="url"
                    required
                    placeholder="https://ik.imagekit.io/... or https://images.unsplash.com/..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                  />
                  {formImage && (
                    <img
                      src={formImage}
                      alt="Preview"
                      className="image-preview-thumb"
                      onError={(e) => ((e.target as any).style.display = 'none')}
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed description of flavors, ingredients, and craftsmanship..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                  />
                  <span>Mark as Available in stock (uncheck for Out of Stock)</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setEditingProduct(null)
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Saving...'
                    : editingProduct
                    ? 'Save Product Changes'
                    : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && deletingProduct && (
        <div className="admin-modal-overlay" onClick={() => setDeletingProductId(null)}>
          <div className="admin-modal-card admin-modal-card--danger" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon-danger">
              <AlertTriangle size={36} color="#c62828" />
            </div>
            <h3>Delete Product?</h3>
            <p>
              Are you sure you want to permanently delete <strong>"{deletingProduct.name}"</strong>?
              This action cannot be undone and will be logged in the activity audit trail.
            </p>
            <div className="admin-modal-actions">
              <button
                className="btn btn--outline"
                onClick={() => setDeletingProductId(null)}
              >
                No, Keep It
              </button>
              <button
                className="btn btn--danger"
                onClick={handleConfirmDelete}
              >
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
