'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

interface ReviewImage {
  image_url: string
  display_order: number
}

interface Review {
  id: number
  reviewer_name: string | null
  review_date: string | null
  star_rating: number | null
  review_text: string | null
  screenshot_url: string
  tag: string
  is_featured: boolean
  owner_reply: string | null
  owner_reply_date: string | null
  images: ReviewImage[]
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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [filterTag, setFilterTag] = useState<string>('all')
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({})
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set())

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedReview) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedReview])

  const tags = ['all', 'Meal Prep', 'Cleaning', 'Organizing', 'Gift Wrapping', 'Matchmaking', 'Life Coaching']

  useEffect(() => {
    fetchReviews()
  }, [filterTag])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const url =
        filterTag === 'all'
          ? '/api/reviews'
          : `/api/reviews?tag=${encodeURIComponent(filterTag)}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
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
              Kind Words
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              className="font-serif text-4xl sm:text-5xl md:text-6xl text-brown mb-6"
            >
              What Others Say
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-brown/70 text-lg max-w-2xl mx-auto mb-8"
            >
              Real testimonials from clients who have experienced the peace and
              care of Haven & Honey
            </motion.p>

            {/* Filter Tabs */}
            <motion.div
              variants={fadeInUp}
              className="flex gap-2 flex-wrap justify-center"
            >
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterTag === tag
                      ? 'bg-brown text-cream-50'
                      : 'bg-cream-50 text-brown hover:bg-cream-200'
                  }`}
                >
                  {tag === 'all' ? 'All Reviews' : tag}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Submit Your Review */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-sage/10 to-honey/10 rounded-3xl p-8 sm:p-12 border border-sage/20 text-center"
          >
            <h3 className="font-serif text-3xl text-brown mb-4">
              Have You Worked With Us?
            </h3>
            <p className="text-brown/70 text-lg mb-6 max-w-2xl mx-auto">
              Share your experience! Upload a screenshot of your review and help others discover the Haven & Honey difference.
            </p>
            <Link
              href="/submit-review"
              className="btn-primary inline-block"
            >
              ⭐ Submit Your Review
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Reviews Carousel - Mobile First */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brown/20 border-t-brown"></div>
              <p className="text-brown/60 mt-4">Loading reviews...</p>
            </div>
          )}

          {!loading && reviews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-brown/60 text-lg">
                No reviews found for this category
              </p>
            </div>
          )}

          {/* Mobile: Horizontal Scroll Carousel */}
          <div className="lg:hidden w-full">
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 max-w-[100vw]">
              {reviews.map((review) => {
                const images = review.images && review.images.length > 0 ? review.images : [{ image_url: review.screenshot_url, display_order: 0 }]
                const currentIdx = currentImageIndex[review.id] || 0
                const isExpanded = expandedReviews.has(review.id)
                
                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-shrink-0 w-[85vw] max-w-sm snap-center"
                  >
                    <div className="bg-cream-50 rounded-3xl p-6 shadow-xl h-full flex flex-col">
                      {/* Featured Badge */}
                      {review.is_featured && (
                        <div className="inline-flex items-center gap-1 bg-honey text-cream-50 px-3 py-1 rounded-full text-xs font-medium shadow-md mb-3 self-start">
                          ⭐ Featured
                        </div>
                      )}

                      {/* Image Carousel */}
                      <div className="relative bg-cream-100 rounded-2xl overflow-hidden mb-4">
                        <div className="aspect-square relative">
                          {images[currentIdx]?.image_url ? (
                            <img
                              src={`/api${images[currentIdx].image_url}`}
                              alt={`Review from ${review.reviewer_name || 'Client'}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-cream-200 flex items-center justify-center">
                              <span className="text-brown/40">No image</span>
                            </div>
                          )}
                          
                          {/* Image Navigation */}
                          {images.length > 1 && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCurrentImageIndex(prev => ({
                                    ...prev,
                                    [review.id]: currentIdx > 0 ? currentIdx - 1 : images.length - 1
                                  }))
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-brown/80 text-cream-50 rounded-full flex items-center justify-center hover:bg-brown transition-colors"
                              >
                                ‹
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCurrentImageIndex(prev => ({
                                    ...prev,
                                    [review.id]: currentIdx < images.length - 1 ? currentIdx + 1 : 0
                                  }))
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-brown/80 text-cream-50 rounded-full flex items-center justify-center hover:bg-brown transition-colors"
                              >
                                ›
                              </button>
                              
                              {/* Dots Indicator */}
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {images.map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setCurrentImageIndex(prev => ({ ...prev, [review.id]: idx }))
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                      idx === currentIdx ? 'bg-honey w-4' : 'bg-cream-50/60'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="flex-1 flex flex-col">
                        {/* Star Rating */}
                        {review.star_rating && review.star_rating > 0 && (
                          <div className="text-honey text-xl mb-2">
                            {'⭐'.repeat(review.star_rating)}
                          </div>
                        )}

                        {/* Reviewer Info */}
                        <h3 className="font-serif text-xl text-brown mb-1">
                          {review.reviewer_name || 'Anonymous'}
                        </h3>

                        {review.review_date && (
                          <p className="text-sm text-brown/60 mb-2">
                            {new Date(review.review_date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        )}

                        <span className="inline-block text-xs px-3 py-1 bg-sage/20 text-sage-dark rounded-full mb-3 self-start">
                          {review.tag}
                        </span>

                        {/* Review Text */}
                        {review.review_text && (
                          <div className="mb-3">
                            <p className={`text-sm text-brown/80 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
                              {review.review_text}
                            </p>
                            {review.review_text.length > 150 && (
                              <button
                                onClick={() => {
                                  setExpandedReviews(prev => {
                                    const newSet = new Set(prev)
                                    if (newSet.has(review.id)) {
                                      newSet.delete(review.id)
                                    } else {
                                      newSet.add(review.id)
                                    }
                                    return newSet
                                  })
                                }}
                                className="text-sage text-xs mt-1 hover:underline"
                              >
                                {isExpanded ? 'Show less' : 'Read more'}
                              </button>
                            )}
                          </div>
                        )}

                        {/* Owner Reply */}
                        {review.owner_reply && (
                          <div className="mt-auto pt-3 border-t border-cream-200">
                            <div className="flex items-start gap-2">
                              <div className="flex-shrink-0 w-6 h-6 bg-honey/20 rounded-full flex items-center justify-center text-xs">
                                👋
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-brown mb-1">Linda replied:</p>
                                <p className="text-xs text-brown/70 leading-relaxed">{review.owner_reply}</p>
                                {review.owner_reply_date && (
                                  <p className="text-xs text-brown/50 mt-1">
                                    {new Date(review.owner_reply_date).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {reviews.map((review) => {
              const images = review.images && review.images.length > 0 ? review.images : [{ image_url: review.screenshot_url, display_order: 0 }]
              const currentIdx = currentImageIndex[review.id] || 0
              const isExpanded = expandedReviews.has(review.id)
              
              return (
                <motion.div
                  key={review.id}
                  variants={fadeInUp}
                  className="group"
                >
                  <div className="bg-cream-50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    {/* Featured Badge */}
                    {review.is_featured && (
                      <div className="inline-flex items-center gap-1 bg-honey text-cream-50 px-3 py-1 rounded-full text-xs font-medium shadow-md mb-3 self-start">
                        ⭐ Featured
                      </div>
                    )}

                    {/* Image Carousel */}
                    <div className="relative bg-cream-100 rounded-2xl overflow-hidden mb-4 cursor-pointer" onClick={() => setSelectedReview(review)}>
                      <div className="aspect-square relative">
                        {images[currentIdx]?.image_url ? (
                          <img
                            src={`/api${images[currentIdx].image_url}`}
                            alt={`Review from ${review.reviewer_name || 'Client'}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-cream-200 flex items-center justify-center">
                            <span className="text-brown/40">No image</span>
                          </div>
                        )}
                        
                        {/* Image Navigation */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setCurrentImageIndex(prev => ({
                                  ...prev,
                                  [review.id]: currentIdx > 0 ? currentIdx - 1 : images.length - 1
                                }))
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-brown/80 text-cream-50 rounded-full flex items-center justify-center hover:bg-brown transition-colors opacity-0 group-hover:opacity-100"
                            >
                              ‹
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setCurrentImageIndex(prev => ({
                                  ...prev,
                                  [review.id]: currentIdx < images.length - 1 ? currentIdx + 1 : 0
                                }))
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-brown/80 text-cream-50 rounded-full flex items-center justify-center hover:bg-brown transition-colors opacity-0 group-hover:opacity-100"
                            >
                              ›
                            </button>
                            
                            {/* Dots Indicator */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {images.map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    idx === currentIdx ? 'bg-honey w-4' : 'bg-cream-50/60'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="flex-1 flex flex-col">
                      {/* Star Rating */}
                      {review.star_rating && review.star_rating > 0 && (
                        <div className="text-honey text-lg mb-2">
                          {'⭐'.repeat(review.star_rating)}
                        </div>
                      )}

                      {/* Reviewer Info */}
                      <h3 className="font-serif text-lg text-brown mb-1">
                        {review.reviewer_name || 'Anonymous'}
                      </h3>

                      {review.review_date && (
                        <p className="text-sm text-brown/60 mb-2">
                          {new Date(review.review_date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      )}

                      <span className="inline-block text-xs px-3 py-1 bg-sage/20 text-sage-dark rounded-full mb-3 self-start">
                        {review.tag}
                      </span>

                      {/* Review Text */}
                      {review.review_text && (
                        <div className="mb-3">
                          <p className={`text-sm text-brown/80 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                            {review.review_text}
                          </p>
                          {review.review_text.length > 100 && (
                            <button
                              onClick={() => {
                                setExpandedReviews(prev => {
                                  const newSet = new Set(prev)
                                  if (newSet.has(review.id)) {
                                    newSet.delete(review.id)
                                  } else {
                                    newSet.add(review.id)
                                  }
                                  return newSet
                                })
                              }}
                              className="text-sage text-xs mt-1 hover:underline"
                            >
                              {isExpanded ? 'Show less' : 'Read more'}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Owner Reply */}
                      {review.owner_reply && (
                        <div className="mt-auto pt-3 border-t border-cream-200">
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-6 h-6 bg-honey/20 rounded-full flex items-center justify-center text-xs">
                              👋
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-brown mb-1">Linda replied:</p>
                              <p className="text-xs text-brown/70 leading-relaxed">{review.owner_reply}</p>
                              {review.owner_reply_date && (
                                <p className="text-xs text-brown/50 mt-1">
                                  {new Date(review.owner_reply_date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] overflow-y-auto"
            onClick={() => setSelectedReview(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-3xl w-full bg-cream-50 rounded-3xl p-6 sm:p-8 shadow-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedReview(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-brown text-cream-50 rounded-full flex items-center justify-center hover:bg-brown/90 transition-colors text-2xl z-10"
              >
                ×
              </button>

              {/* Featured Badge */}
              {selectedReview.is_featured && (
                <div className="inline-block bg-honey text-cream-50 px-3 py-1 rounded-full text-xs font-medium shadow-md mb-4">
                  ⭐ Featured Review
                </div>
              )}

              {/* Screenshot */}
              <div className="relative bg-cream-100 rounded-2xl overflow-hidden mb-6 border-4 border-cream-200">
                {selectedReview.screenshot_url ? (
                  <img
                    src={`/api${selectedReview.screenshot_url}`}
                    alt={`Review from ${selectedReview.reviewer_name || 'Client'}`}
                    className="w-full h-auto max-h-[50vh] object-contain"
                  />
                ) : (
                  <div className="w-full h-64 bg-cream-200 flex items-center justify-center">
                    <span className="text-brown/40">No image available</span>
                  </div>
                )}
              </div>

              {/* Review Details */}
              <div className="text-center">
                {selectedReview.star_rating && selectedReview.star_rating > 0 && (
                  <div className="text-honey text-xl sm:text-2xl mb-3">
                    {'⭐'.repeat(selectedReview.star_rating)}
                  </div>
                )}

                <h2 className="font-serif text-2xl sm:text-3xl text-brown mb-2">
                  {selectedReview.reviewer_name || 'Anonymous'}
                </h2>

                {selectedReview.review_date && (
                  <p className="text-brown/60 mb-3 text-sm sm:text-base">
                    {new Date(selectedReview.review_date).toLocaleDateString(
                      'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </p>
                )}

                <span className="inline-block text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 bg-sage/20 text-sage-dark rounded-full mb-4">
                  {selectedReview.tag}
                </span>

                {selectedReview.review_text && (
                  <p className="text-brown/80 text-base sm:text-lg leading-relaxed mt-4">
                    {selectedReview.review_text}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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




