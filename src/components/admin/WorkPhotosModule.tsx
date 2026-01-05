'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface WorkPhoto {
  id: number
  category: string
  media_type: 'image' | 'video'
  caption: string | null
  description: string | null
  image_url: string | null
  video_url: string | null
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
    media_type: 'image' as 'image' | 'video',
    caption: '',
    description: '',
    photo_date: '',
    is_published: false,
    display_order: 0,
  })
  const [image, setImage] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
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

    // Validate file based on media type
    if (formData.media_type === 'image' && !image && !editingPhoto) {
      toast.error('Image is required')
      return
    }
    
    if (formData.media_type === 'video' && !video && !editingPhoto) {
      toast.error('Video is required')
      return
    }

    setUploading(true)
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const formDataToSend = new FormData()

      if (image) {
        formDataToSend.append('image', image)
      }
      
      if (video) {
        formDataToSend.append('video', video)
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
      media_type: photo.media_type || 'image',
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
      media_type: 'image',
      caption: '',
      description: '',
      photo_date: '',
      is_published: false,
      display_order: 0,
    })
    setImage(null)
    setVideo(null)
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
              {/* Media Upload - Image or Video */}
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  {formData.media_type === 'image' ? '📷 Image' : '🎥 Video'} {!editingPhoto && <span className="text-honey">*</span>}
                </label>
                
                {formData.media_type === 'image' ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setImage(e.target.files ? e.target.files[0] : null)
                      }
                      className="hidden"
                      id="photo-upload"
                      required={!editingPhoto}
                    />
                    <label
                      htmlFor="photo-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-cream-100 border-2 border-dashed border-brown/30 rounded-2xl cursor-pointer hover:bg-cream-200 hover:border-brown/50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-brown/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-brown/70">
                        {image ? image.name : 'Choose image'}
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        setVideo(e.target.files ? e.target.files[0] : null)
                      }
                      className="hidden"
                      id="video-upload"
                      required={!editingPhoto}
                    />
                    <label
                      htmlFor="video-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-cream-100 border-2 border-dashed border-brown/30 rounded-2xl cursor-pointer hover:bg-cream-200 hover:border-brown/50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-brown/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-brown/70">
                        {video ? video.name : 'Choose video (MP4, MOV, etc.)'}
                      </span>
                    </label>
                  </div>
                )}
                
                {editingPhoto && (
                  <p className="text-sm text-brown/60 mt-1">
                    Leave empty to keep existing {formData.media_type}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Media Type <span className="text-honey">*</span>
                  </label>
                  <select
                    value={formData.media_type}
                    onChange={(e) =>
                      setFormData({ ...formData, media_type: e.target.value as 'image' | 'video' })
                    }
                    className="form-input"
                    required
                  >
                    <option value="image">📷 Image</option>
                    <option value="video">🎥 Video</option>
                  </select>
                </div>
                
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
                    Date
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
            {/* Photo or Video */}
            <div className="relative mb-4 rounded-2xl overflow-hidden bg-cream-100 aspect-[4/3]">
              {photo.media_type === 'video' && photo.video_url ? (
                <video
                  src={`/api${photo.video_url}`}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
              ) : photo.image_url ? (
                <img
                  src={`/api${photo.image_url}`}
                  alt={photo.caption || photo.category}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brown/40">
                  No media
                </div>
              )}
              <div
                className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  photo.is_published
                    ? 'bg-sage/90 text-cream-50'
                    : 'bg-brown/90 text-cream-50'
                }`}
              >
                {photo.is_published ? '✓ Published' : 'Draft'}
              </div>
              {photo.media_type === 'video' && (
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-honey/90 text-cream-50">
                  🎥 Video
                </div>
              )}
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

