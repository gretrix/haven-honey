'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

interface WorkPhoto {
  id: number
  category: string
  media_type: 'image' | 'video'
  caption: string | null
  description: string | null
  image_url: string | null
  video_url: string | null
  photo_date: string | null
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function WorkPage() {
  const [workPhotos, setWorkPhotos] = useState<WorkPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<WorkPhoto | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedPhoto])

  const categories = ['all', 'Meal Prep', 'Cleaning', 'Organizing', 'Gift Wrapping']

  useEffect(() => {
    fetchWorkPhotos()
  }, [filterCategory])

  const fetchWorkPhotos = async () => {
    setLoading(true)
    try {
      const url =
        filterCategory === 'all'
          ? '/api/work-photos'
          : `/api/work-photos?category=${encodeURIComponent(filterCategory)}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setWorkPhotos(data.work_photos)
      }
    } catch (error) {
      console.error('Failed to fetch work photos:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-cream-100 overflow-x-hidden">
      {/* Navigation */}
      <Navigation variant="page" />

      {/* Header */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeInUp}
              className="inline-block text-sage font-medium text-sm tracking-widest uppercase mb-4"
            >
              Portfolio
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              className="font-serif text-4xl sm:text-5xl md:text-6xl text-brown mb-6"
            >
              My Work
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-brown/70 text-lg max-w-2xl mx-auto mb-8"
            >
              A glimpse into the care and intention I bring to every home I serve
            </motion.p>

            {/* Filter Tabs */}
            <motion.div
              variants={fadeInUp}
              className="flex gap-2 flex-wrap justify-center"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterCategory === cat
                      ? 'bg-brown text-cream-50'
                      : 'bg-cream-50 text-brown hover:bg-cream-200'
                  }`}
                >
                  {cat === 'all' ? 'All Work' : cat}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Work Photos Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brown/20 border-t-brown"></div>
              <p className="text-brown/60 mt-4">Loading gallery...</p>
            </div>
          )}

          {!loading && workPhotos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-brown/60 text-lg">
                No photos found for this category
              </p>
            </div>
          )}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {workPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                variants={fadeInUp}
                className="group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="relative bg-cream-50 rounded-3xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Media - Photo or Video */}
                  <div className="relative bg-cream-100 rounded-2xl overflow-hidden mb-3">
                    <div className="aspect-square">
                      {photo.media_type === 'video' && photo.video_url ? (
                        <video
                          src={photo.video_url}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                          onError={(e) => {
                            console.error('🔥 Video load error:', photo.video_url, e)
                          }}
                        />
                      ) : photo.image_url ? (
                        <img
                          src={`/api${photo.image_url}`}
                          alt={photo.caption || photo.category}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : null}
                    </div>

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brown/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-cream-50 text-sm">
                        {photo.media_type === 'video' ? '🎥 Play video' : 'Click to view'}
                      </p>
                    </div>
                  </div>

                  {/* Caption */}
                  {(photo.caption || photo.category) && (
                    <div className="px-2">
                      {photo.caption && (
                        <h3 className="font-serif text-brown text-sm mb-1 line-clamp-1">
                          {photo.caption}
                        </h3>
                      )}
                      <span className="inline-block text-xs px-2 py-1 bg-sage/20 text-sage-dark rounded-full">
                        {photo.category}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[9999] overflow-y-auto"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full bg-cream-50 rounded-3xl overflow-hidden shadow-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-brown text-cream-50 rounded-full flex items-center justify-center hover:bg-brown/90 transition-colors text-2xl z-10"
              >
                ×
              </button>

              <div className="grid md:grid-cols-5">
                {/* Media Side - Image or Video */}
                <div className="md:col-span-3 bg-cream-100 flex items-center justify-center">
                  {selectedPhoto.media_type === 'video' && selectedPhoto.video_url ? (
                    <video
                      src={selectedPhoto.video_url}
                      className="w-full h-auto max-h-[70vh] md:max-h-screen"
                      controls
                      autoPlay
                      onError={(e) => {
                        console.error('🔥 Video load error in modal:', selectedPhoto.video_url, e)
                      }}
                    />
                  ) : selectedPhoto.image_url ? (
                    <img
                      src={`/api${selectedPhoto.image_url}`}
                      alt={selectedPhoto.caption || selectedPhoto.category}
                      className="w-full h-full object-cover max-h-[70vh] md:max-h-screen"
                    />
                  ) : null}
                </div>

                {/* Info Side */}
                <div className="md:col-span-2 p-8">
                  <span className="inline-block text-sm px-3 py-1 bg-sage/20 text-sage-dark rounded-full mb-4">
                    {selectedPhoto.category}
                  </span>

                  {selectedPhoto.caption && (
                    <h2 className="font-serif text-3xl text-brown mb-4">
                      {selectedPhoto.caption}
                    </h2>
                  )}

                  {selectedPhoto.photo_date && (
                    <p className="text-brown/60 mb-4">
                      {new Date(selectedPhoto.photo_date).toLocaleDateString(
                        'en-US',
                        { year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </p>
                  )}

                  {selectedPhoto.description && (
                    <p className="text-brown/80 leading-relaxed">
                      {selectedPhoto.description}
                    </p>
                  )}

                  <div className="mt-8 pt-8 border-t border-cream-200">
                    <p className="text-brown/60 text-sm italic">
                      &ldquo;Let all that you do be done in love.&rdquo;
                      <br />
                      <span className="not-italic">— 1 Corinthians 16:14</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="bg-brown py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-cream-50 mb-6">
            Want This Kind of Care for Your Home?
          </h2>
          <p className="text-cream-200/80 text-lg mb-8 max-w-2xl mx-auto">
            I&apos;d love to bring peace and intention into your space. Let&apos;s
            connect and see how I can serve you.
          </p>
          <Link
            href="/#contact"
            className="inline-block bg-honey text-brown font-medium px-8 py-4 rounded-full hover:bg-honey/90 transition-colors text-lg"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brown py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Image
                src="/images/haven-honey-logo-circle-transparent.png"
                alt="Haven & Honey"
                width={48}
                height={48}
                className="w-12 h-12 brightness-0 invert opacity-80"
              />
              <div>
                <p className="font-serif text-cream-100 text-lg">
                  Haven & Honey
                </p>
                <p className="text-cream-200/60 text-sm">
                  Making Homes Feel Loved
                </p>
              </div>
            </div>

            <p className="text-cream-200/40 text-sm italic text-center md:text-right">
              &ldquo;Let all that you do be done in love.&rdquo;
              <br />
              <span className="not-italic">— 1 Corinthians 16:14</span>
            </p>
          </div>

          <div className="border-t border-cream-200/10 mt-8 pt-8 text-center">
            <p className="text-cream-200/40 text-sm">
              © {new Date().getFullYear()} Haven & Honey. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}




