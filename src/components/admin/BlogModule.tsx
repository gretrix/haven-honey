'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image_url: string | null
  category: string
  meta_title: string | null
  meta_description: string | null
  status: 'draft' | 'scheduled' | 'published'
  scheduled_for: string | null
  published_at: string | null
  view_count: number
  created_at: string
  updated_at: string
}

export default function BlogModule() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Life',
    meta_title: '',
    meta_description: '',
    status: 'draft',
    scheduled_for: '',
  })
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const categories = ['Meal Prep', 'Life', 'Tips', 'Faith', 'Home', 'Organizing', 'Other']

  const fetchPosts = async () => {
    setLoading(true)
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const url =
        filterStatus === 'all'
          ? '/api/admin/blog'
          : `/api/admin/blog?status=${filterStatus}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setPosts(data.posts)
      } else {
        toast.error('Failed to fetch blog posts')
      }
    } catch (error) {
      toast.error('Error fetching blog posts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      toast.error('Title and content are required')
      return
    }

    // Validate featured image if provided
    if (featuredImage) {
      const maxSize = 15 * 1024 * 1024 // 15MB
      if (featuredImage.size > maxSize) {
        toast.error(`Image is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`)
        return
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(featuredImage.type)) {
        toast.error('Invalid image type. Please use JPG, PNG, WebP, or GIF')
        return
      }
    }

    setUploading(true)
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const formDataToSend = new FormData()

      // Add all fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value)
      })

      if (featuredImage) {
        formDataToSend.append('featured_image', featuredImage)
      }

      if (editingPost) {
        // Update existing post
        const response = await fetch('/api/admin/blog', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${savedPassword}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingPost.id,
            ...formData,
          }),
        })

        const data = await response.json()

        if (data.success) {
          toast.success('Blog post updated!')
          setShowAddModal(false)
          setEditingPost(null)
          resetForm()
          fetchPosts()
        } else {
          toast.error('Failed to update blog post')
        }
      } else {
        // Create new post
        const response = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${savedPassword}`,
          },
          body: formDataToSend,
        })

        const data = await response.json()

        if (data.success) {
          toast.success('✅ Blog post created!')
          setShowAddModal(false)
          resetForm()
          fetchPosts()
        } else {
          // Show detailed error message
          const errorMsg = data.error || 'Failed to create blog post'
          toast.error(errorMsg, { duration: 5000 })
          console.error('Blog creation error:', data)
        }
      }
    } catch (error) {
      toast.error('Error saving blog post')
    } finally {
      setUploading(false)
    }
  }

  const deletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return
    }

    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch(`/api/admin/blog?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Blog post deleted!')
        fetchPosts()
      } else {
        toast.error('Failed to delete blog post')
      }
    } catch (error) {
      toast.error('Error deleting blog post')
    }
  }

  const togglePublish = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch('/api/admin/blog', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${savedPassword}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: post.id,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          newStatus === 'published' ? 'Blog post published!' : 'Blog post unpublished'
        )
        fetchPosts()
      } else {
        toast.error('Failed to update blog post')
      }
    } catch (error) {
      toast.error('Error updating blog post')
    }
  }

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      category: post.category,
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      status: post.status,
      scheduled_for: post.scheduled_for || '',
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'Life',
      meta_title: '',
      meta_description: '',
      status: 'draft',
      scheduled_for: '',
    })
    setFeaturedImage(null)
    setEditingPost(null)
  }

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    })
  }

  useEffect(() => {
    fetchPosts()
  }, [filterStatus])

  return (
    <div>
      {/* Controls */}
      <div className="bg-cream-50 rounded-3xl p-6 shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <p className="text-brown/60">
            {posts.length} post{posts.length !== 1 ? 's' : ''} •{' '}
            {posts.filter((p) => p.status === 'published').length} published
          </p>
          <button
            onClick={() => {
              resetForm()
              setShowAddModal(true)
            }}
            className="btn-primary text-sm"
          >
            ✏️ New Blog Post
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-brown text-cream-50'
                : 'bg-cream-100 text-brown hover:bg-cream-200'
            }`}
          >
            All
          </button>
          {['draft', 'scheduled', 'published'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                filterStatus === status
                  ? 'bg-brown text-cream-50'
                  : 'bg-cream-100 text-brown hover:bg-cream-200'
              }`}
            >
              {status} ({posts.filter((p) => p.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cream-50 rounded-3xl p-8 max-w-4xl w-full my-8"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-serif text-3xl text-brown">
                {editingPost ? 'Edit Blog Post' : 'New Blog Post'}
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

            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Title <span className="text-honey">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., How I Plan My Week"
                  className="form-input text-lg"
                  required
                />
              </div>

              {/* Slug (URL) */}
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="how-i-plan-my-week"
                  className="form-input font-mono text-sm"
                />
                <p className="text-xs text-brown/60 mt-1">
                  Will be: /life-with-linda/{formData.slug || 'your-slug-here'}
                </p>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Featured Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFeaturedImage(e.target.files ? e.target.files[0] : null)
                    }
                    className="hidden"
                    id="blog-featured-image"
                  />
                  <label
                    htmlFor="blog-featured-image"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-cream-100 border-2 border-dashed border-brown/30 rounded-2xl cursor-pointer hover:bg-cream-200 hover:border-brown/50 transition-colors"
                  >
                    <svg className="w-5 h-5 text-brown/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-brown/70">
                      {featuredImage ? featuredImage.name : 'Choose featured image'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="form-input"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Excerpt (Short Preview)
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="A brief summary of your post..."
                  className="form-textarea"
                  rows={3}
                  maxLength={300}
                />
                <p className="text-xs text-brown/60 mt-1">
                  {formData.excerpt.length}/300 characters
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Content <span className="text-honey">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Write your blog post here... Share your thoughts, stories, and inspiration."
                  className="form-textarea font-serif"
                  rows={12}
                  required
                />
                <p className="text-xs text-brown/60 mt-1">
                  {formData.content.length} characters
                </p>
              </div>

              {/* SEO Fields */}
              <div className="border-t border-brown/10 pt-6">
                <h3 className="text-lg font-serif text-brown mb-4">
                  SEO Settings (Optional)
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brown mb-2">
                      Meta Title (for Google)
                    </label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) =>
                        setFormData({ ...formData, meta_title: e.target.value })
                      }
                      placeholder={formData.title || 'Leave empty to use post title'}
                      className="form-input"
                      maxLength={60}
                    />
                    <p className="text-xs text-brown/60 mt-1">
                      {formData.meta_title.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brown mb-2">
                      Meta Description (for Google)
                    </label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meta_description: e.target.value,
                        })
                      }
                      placeholder="Brief description for search engines..."
                      className="form-textarea"
                      rows={2}
                      maxLength={160}
                    />
                    <p className="text-xs text-brown/60 mt-1">
                      {formData.meta_description.length}/160 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Publishing Options */}
              <div className="border-t border-brown/10 pt-6">
                <h3 className="text-lg font-serif text-brown mb-4">
                  Publishing Options
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brown mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="form-input"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  {formData.status === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-medium text-brown mb-2">
                        Schedule For
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduled_for}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scheduled_for: e.target.value,
                          })
                        }
                        className="form-input"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-brown/10">
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {uploading
                    ? 'Saving...'
                    : editingPost
                    ? 'Update Post'
                    : 'Create Post'}
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
          <p className="text-brown/60 mt-4">Loading blog posts...</p>
        </div>
      )}

      {/* Blog Posts List */}
      {!loading && posts.length === 0 && (
        <div className="bg-cream-50 rounded-3xl p-12 text-center">
          <p className="text-brown/60 text-lg">No blog posts yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary mt-4"
          >
            Write Your First Post
          </button>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cream-50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex gap-6">
              {/* Featured Image Thumbnail */}
              {post.featured_image_url && (
                <div className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden bg-cream-100">
                  <img
                    src={`/api${post.featured_image_url}`}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-serif text-2xl text-brown font-medium">
                      {post.title}
                    </h3>
                    <p className="text-sm text-brown/60">
                      /life-with-linda/{post.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        post.status === 'published'
                          ? 'bg-sage/20 text-sage-dark'
                          : post.status === 'scheduled'
                          ? 'bg-honey/20 text-honey-dark'
                          : 'bg-brown/20 text-brown'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-brown/60 mb-3">
                  <span>{post.category}</span>
                  <span>•</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  {post.published_at && (
                    <>
                      <span>•</span>
                      <span>{post.view_count} views</span>
                    </>
                  )}
                </div>

                {post.excerpt && (
                  <p className="text-brown/80 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex gap-2">
                  {post.status === 'published' && (
                    <a
                      href={`/life-with-linda/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs"
                    >
                      👁️ View
                    </a>
                  )}
                  <button
                    onClick={() => togglePublish(post)}
                    className="btn-secondary text-xs"
                  >
                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => openEditModal(post)}
                    className="btn-secondary text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="btn-secondary text-xs bg-red-100 hover:bg-red-200 text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


