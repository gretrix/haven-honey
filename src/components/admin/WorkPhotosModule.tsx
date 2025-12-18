'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface WorkPhoto {
  id: number
  category: string
  caption: string | null
  description: string | null
  image_url: string
  photo_date: string | null
  is_published: boolean
  display_order: number
  created_at: string
}

export default function WorkPhotosModule() {
  const [workPhotos, setWorkPhotos] = useState<WorkPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState<WorkPhoto | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Form state
  const [formData, setFormData] = useState({
    category: 'Meal Prep',
    caption: '',
    description: '',
    photo_date: '',
    is_published: false,
    display_order: 0,
  })
  const [image, setImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const categories = ['Meal Prep', 'Cleaning', 'Organizing', 'Gift Wrapping', 'Other']

  const fetchWorkPhotos = async () => {
    setLoading(true)
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const url =
        filterCategory === 'all'
          ? '/api/admin/work-photos'
          : `/api/admin/work-photos?category=${encodeURIComponent(filterCategory)}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setWorkPhotos(data.work_photos)
      } else {
        toast.error('Failed to fetch work photos')
      }
    } catch (error) {
      toast.error('Error fetching work photos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!image && !editingPhoto) {
      toast.error('Image is required')
      return
    }

    setUploading(true)
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const formDataToSend = new FormData()

      if (image) {
        formDataToSend.append('image', image)
      }

      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString())
      })

      if (editingPhoto) {
        // Update existing photo
        const response = await fetch('/api/admin/work-photos', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${savedPassword}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingPhoto.id,
            ...formData,
          }),
        })

        const data = await response.json()

        if (data.success) {
          toast.success('Work photo updated!')
          setShowAddModal(false)
          setEditingPhoto(null)
          resetForm()
          fetchWorkPhotos()
        } else {
          toast.error('Failed to update work photo')
        }
      } else {
        // Create new photo
        const response = await fetch('/api/admin/work-photos', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${savedPassword}`,
          },
          body: formDataToSend,
        })

        const data = await response.json()

        if (data.success) {
          toast.success('Work photo added!')
          setShowAddModal(false)
          resetForm()
          fetchWorkPhotos()
        } else {
          toast.error(data.error || 'Failed to add work photo')
        }
      }
    } catch (error) {
      toast.error('Error saving work photo')
    } finally {
      setUploading(false)
    }
  }

  const deleteWorkPhoto = async (id: number) => {
    if (!confirm('Are you sure you want to delete this work photo?')) {
      return
    }

    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch(`/api/admin/work-photos?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Work photo deleted!')
        fetchWorkPhotos()
      } else {
        toast.error('Failed to delete work photo')
      }
    } catch (error) {
      toast.error('Error deleting work photo')
    }
  }

  const togglePublish = async (photo: WorkPhoto) => {
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch('/api/admin/work-photos', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${savedPassword}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: photo.id,
          is_published: !photo.is_published,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          photo.is_published ? 'Photo unpublished' : 'Photo published!'
        )
        fetchWorkPhotos()
      } else {
        toast.error('Failed to update photo')
      }
    } catch (error) {
      toast.error('Error updating photo')
    }
  }

  const openEditModal = (photo: WorkPhoto) => {
    setEditingPhoto(photo)
    setFormData({
      category: photo.category,
      caption: photo.caption || '',
      description: photo.description || '',
      photo_date: photo.photo_date || '',
      is_published: photo.is_published,
      display_order: photo.display_order,
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      category: 'Meal Prep',
      caption: '',
      description: '',
      photo_date: '',
      is_published: false,
      display_order: 0,
    })
    setImage(null)
    setEditingPhoto(null)
  }

  useEffect(() => {
    fetchWorkPhotos()
  }, [filterCategory])

  return (
    <div>
      {/* Controls */}
      <div className="bg-cream-50 rounded-3xl p-6 shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <p className="text-brown/60">
            {workPhotos.length} photo{workPhotos.length !== 1 ? 's' : ''} •{' '}
            {workPhotos.filter((p) => p.is_published).length} published
          </p>
          <button
            onClick={() => {
              resetForm()
              setShowAddModal(true)
            }}
            className="btn-primary text-sm"
          >
            ➕ Add Photo
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterCategory === 'all'
                ? 'bg-brown text-cream-50'
                : 'bg-cream-100 text-brown hover:bg-cream-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-brown text-cream-50'
                  : 'bg-cream-100 text-brown hover:bg-cream-200'
              }`}
            >
              {cat}
            </button>
          ))}
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
                {editingPhoto ? 'Edit Work Photo' : 'Add New Work Photo'}
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
                  Photo {!editingPhoto && <span className="text-honey">*</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImage(e.target.files ? e.target.files[0] : null)
                  }
                  className="form-input"
                  required={!editingPhoto}
                />
                {editingPhoto && (
                  <p className="text-sm text-brown/60 mt-1">
                    Leave empty to keep existing photo
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Category <span className="text-honey">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="form-input"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Photo Date
                  </label>
                  <input
                    type="date"
                    value={formData.photo_date}
                    onChange={(e) =>
                      setFormData({ ...formData, photo_date: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Caption
                </label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) =>
                    setFormData({ ...formData, caption: e.target.value })
                  }
                  placeholder="Short caption for the photo..."
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detailed description..."
                  className="form-textarea"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="flex items-center gap-2 cursor-pointer mt-7">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_published: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-brown">Published</span>
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
                    : editingPhoto
                    ? 'Update Photo'
                    : 'Add Photo'}
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
          <p className="text-brown/60 mt-4">Loading work photos...</p>
        </div>
      )}

      {/* Work Photos List */}
      {!loading && workPhotos.length === 0 && (
        <div className="bg-cream-50 rounded-3xl p-12 text-center">
          <p className="text-brown/60 text-lg">No work photos yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary mt-4"
          >
            Add Your First Photo
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workPhotos.map((photo) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cream-50 rounded-3xl p-6 shadow-lg"
          >
            {/* Photo */}
            <div className="relative mb-4 rounded-2xl overflow-hidden bg-cream-100 aspect-[4/3]">
              <img
                src={photo.image_url}
                alt={photo.caption || photo.category}
                className="w-full h-full object-cover"
              />
              <div
                className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  photo.is_published
                    ? 'bg-sage/90 text-cream-50'
                    : 'bg-brown/90 text-cream-50'
                }`}
              >
                {photo.is_published ? '✓ Published' : 'Draft'}
              </div>
            </div>

            {/* Info */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-1 bg-cream-100 rounded-full text-brown/70">
                  {photo.category}
                </span>
                <span className="text-xs text-brown/50">
                  Order: {photo.display_order}
                </span>
              </div>

              {photo.caption && (
                <h3 className="font-serif text-lg text-brown mb-1">
                  {photo.caption}
                </h3>
              )}

              {photo.photo_date && (
                <p className="text-sm text-brown/60 mb-2">
                  {new Date(photo.photo_date).toLocaleDateString()}
                </p>
              )}

              {photo.description && (
                <p className="text-sm text-brown/80 line-clamp-2">
                  {photo.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => togglePublish(photo)}
                className="btn-secondary text-xs flex-1"
              >
                {photo.is_published ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={() => openEditModal(photo)}
                className="btn-secondary text-xs flex-1"
              >
                Edit
              </button>
              <button
                onClick={() => deleteWorkPhoto(photo.id)}
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

