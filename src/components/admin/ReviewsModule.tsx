'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface Review {
  id: number
  reviewer_name: string | null
  review_date: string | null
  star_rating: number | null
  review_text: string | null
  screenshot_url: string
  tag: string
  is_featured: boolean
  is_published: boolean
  display_order: number
  created_at: string
}

export default function ReviewsModule() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    reviewer_name: '',
    review_date: '',
    star_rating: 5,
    review_text: '',
    tag: 'Other',
    is_featured: false,
    is_published: false,
    display_order: 0,
  })
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchReviews = async () => {
    setLoading(true)
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch('/api/admin/reviews', {
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setReviews(data.reviews)
      } else {
        toast.error('Failed to fetch reviews')
      }
    } catch (error) {
      toast.error('Error fetching reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!screenshot && !editingReview) {
      toast.error('Screenshot is required')
      return
    }

    setUploading(true)
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const formDataToSend = new FormData()

      if (screenshot) {
        formDataToSend.append('screenshot', screenshot)
      }

      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString())
      })

      if (editingReview) {
        // Update existing review
        const response = await fetch('/api/admin/reviews', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${savedPassword}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingReview.id,
            ...formData,
          }),
        })

        const data = await response.json()

        if (data.success) {
          toast.success('Review updated!')
          setShowAddModal(false)
          setEditingReview(null)
          resetForm()
          fetchReviews()
        } else {
          toast.error('Failed to update review')
        }
      } else {
        // Create new review
        const response = await fetch('/api/admin/reviews', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${savedPassword}`,
          },
          body: formDataToSend,
        })

        const data = await response.json()

        if (data.success) {
          toast.success('Review added!')
          setShowAddModal(false)
          resetForm()
          fetchReviews()
        } else {
          toast.error(data.error || 'Failed to add review')
        }
      }
    } catch (error) {
      toast.error('Error saving review')
    } finally {
      setUploading(false)
    }
  }

  const deleteReview = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return
    }

    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Review deleted!')
        fetchReviews()
      } else {
        toast.error('Failed to delete review')
      }
    } catch (error) {
      toast.error('Error deleting review')
    }
  }

  const togglePublish = async (review: Review) => {
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${savedPassword}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: review.id,
          is_published: !review.is_published,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          review.is_published ? 'Review unpublished' : 'Review published!'
        )
        fetchReviews()
      } else {
        toast.error('Failed to update review')
      }
    } catch (error) {
      toast.error('Error updating review')
    }
  }

  const openEditModal = (review: Review) => {
    setEditingReview(review)
    setFormData({
      reviewer_name: review.reviewer_name || '',
      review_date: review.review_date || '',
      star_rating: review.star_rating || 5,
      review_text: review.review_text || '',
      tag: review.tag,
      is_featured: review.is_featured,
      is_published: review.is_published,
      display_order: review.display_order,
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      reviewer_name: '',
      review_date: '',
      star_rating: 5,
      review_text: '',
      tag: 'Other',
      is_featured: false,
      is_published: false,
      display_order: 0,
    })
    setScreenshot(null)
    setEditingReview(null)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  return (
    <div>
      {/* Controls */}
      <div className="bg-cream-50 rounded-3xl p-6 shadow-lg mb-6">
        <div className="flex justify-between items-center">
          <p className="text-brown/60">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} •{' '}
            {reviews.filter((r) => r.is_published).length} published
          </p>
          <button
            onClick={() => {
              resetForm()
              setShowAddModal(true)
            }}
            className="btn-primary text-sm"
          >
            ➕ Add Review
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cream-50 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-serif text-3xl text-brown">
                {editingReview ? 'Edit Review' : 'Add New Review'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="text-brown/60 hover:text-brown text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Screenshot {!editingReview && <span className="text-honey">*</span>}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setScreenshot(e.target.files ? e.target.files[0] : null)
                    }
                    className="hidden"
                    id="screenshot-upload"
                    required={!editingReview}
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-cream-100 border-2 border-dashed border-brown/30 rounded-2xl cursor-pointer hover:bg-cream-200 hover:border-brown/50 transition-colors"
                  >
                    <svg className="w-5 h-5 text-brown/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-brown/70">
                      {screenshot ? screenshot.name : 'Choose screenshot image'}
                    </span>
                  </label>
                </div>
                {editingReview && (
                  <p className="text-sm text-brown/60 mt-1">
                    Leave empty to keep existing screenshot
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Reviewer Name
                  </label>
                  <input
                    type="text"
                    value={formData.reviewer_name}
                    onChange={(e) =>
                      setFormData({ ...formData, reviewer_name: e.target.value })
                    }
                    placeholder="e.g., M.K."
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.review_date}
                    onChange={(e) =>
                      setFormData({ ...formData, review_date: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Star Rating
                  </label>
                  <select
                    value={formData.star_rating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        star_rating: parseInt(e.target.value),
                      })
                    }
                    className="form-input"
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {'⭐'.repeat(rating)} ({rating})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Category/Tag
                  </label>
                  <select
                    value={formData.tag}
                    onChange={(e) =>
                      setFormData({ ...formData, tag: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="Meal Prep">Meal Prep</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Organizing">Organizing</option>
                    <option value="Gift Wrapping">Gift Wrapping</option>
                    <option value="Matchmaking">Matchmaking</option>
                    <option value="Life Coaching">Life Coaching</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Review Text
                </label>
                <textarea
                  value={formData.review_text}
                  onChange={(e) =>
                    setFormData({ ...formData, review_text: e.target.value })
                  }
                  placeholder="Optional review text..."
                  className="form-textarea"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer mt-7 p-3 bg-honey/10 rounded-xl hover:bg-honey/20 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_featured: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-2 border-honey text-honey focus:ring-2 focus:ring-honey/50 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-medium text-brown block">⭐ Featured</span>
                      <span className="text-xs text-brown/60">Show prominently</span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer mt-7 p-3 bg-sage/10 rounded-xl hover:bg-sage/20 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_published: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-2 border-sage text-sage focus:ring-2 focus:ring-sage/50 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-medium text-brown block">✓ Published</span>
                      <span className="text-xs text-brown/60">Visible to public</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {uploading
                    ? 'Saving...'
                    : editingReview
                    ? 'Update Review'
                    : 'Add Review'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="btn-secondary flex-1"
                  disabled={uploading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brown/20 border-t-brown"></div>
          <p className="text-brown/60 mt-4">Loading reviews...</p>
        </div>
      )}

      {/* Reviews List */}
      {!loading && reviews.length === 0 && (
        <div className="bg-cream-50 rounded-3xl p-12 text-center">
          <p className="text-brown/60 text-lg">No reviews yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary mt-4"
          >
            Add Your First Review
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cream-50 rounded-3xl p-6 shadow-lg"
          >
            {/* Screenshot */}
            <div className="relative mb-4 rounded-2xl overflow-hidden bg-cream-100 aspect-[4/3]">
              <img
                src={`/api${review.screenshot_url}`}
                alt={`Review from ${review.reviewer_name || 'Anonymous'}`}
                className="w-full h-full object-contain"
              />
              {review.is_featured && (
                <div className="absolute top-2 left-2 bg-honey text-cream-50 px-2 py-1 rounded-full text-xs font-medium">
                  ⭐ Featured
                </div>
              )}
              <div
                className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  review.is_published
                    ? 'bg-sage/90 text-cream-50'
                    : 'bg-brown/90 text-cream-50'
                }`}
              >
                {review.is_published ? '✓ Published' : 'Draft'}
              </div>
            </div>

            {/* Info */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-serif text-lg text-brown">
                    {review.reviewer_name || 'Anonymous'}
                  </h3>
                  {review.review_date && (
                    <p className="text-sm text-brown/60">
                      {new Date(review.review_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {review.star_rating && (
                  <div className="text-honey">
                    {'⭐'.repeat(review.star_rating)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-1 bg-cream-100 rounded-full text-brown/70">
                  {review.tag}
                </span>
                <span className="text-xs text-brown/50">
                  Order: {review.display_order}
                </span>
              </div>

              {review.review_text && (
                <p className="text-sm text-brown/80 line-clamp-3">
                  {review.review_text}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => togglePublish(review)}
                className="btn-secondary text-xs flex-1"
              >
                {review.is_published ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={() => openEditModal(review)}
                className="btn-secondary text-xs flex-1"
              >
                Edit
              </button>
              <button
                onClick={() => deleteReview(review.id)}
                className="btn-secondary text-xs bg-red-100 hover:bg-red-200 text-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

