'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface Review {
  id: number
  reviewer_name: string | null
  review_date: string | null
  star_rating: number | null
  review_text: string | null
  screenshot_url: string
  tag: string
  is_featured: boolean
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
    <main className="min-h-screen bg-cream-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-100/90 backdrop-blur-md border-b border-cream-300/50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="/images/haven-honey-logo-circle-transparent.png"
              alt="Haven & Honey"
              width={56}
              height={56}
              className="w-14 h-14"
            />
            <span className="font-serif text-xl text-brown hidden sm:block">
              Haven & Honey
            </span>
          </Link>
          <div className="flex items-center gap-6 sm:gap-10">
            <Link
              href="/"
              className="text-brown/70 hover:text-brown transition-colors text-base sm:text-lg font-medium"
            >
              Home
            </Link>
            <Link
              href="/work"
              className="text-brown/70 hover:text-brown transition-colors text-base sm:text-lg font-medium"
            >
              My Work
            </Link>
            <Link
              href="/submit-review"
              className="text-brown/70 hover:text-brown transition-colors text-base sm:text-lg font-medium"
            >
              Submit Review
            </Link>
            <Link
              href="/#contact"
              className="btn-primary text-base py-3 px-6 sm:py-4 sm:px-8"
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>

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

      {/* Reviews Grid */}
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

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                variants={fadeInUp}
                className="group cursor-pointer"
                onClick={() => setSelectedReview(review)}
              >
                {/* Frame Container */}
                <div className="relative bg-cream-50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  {/* Featured Badge */}
                  {review.is_featured && (
                    <div className="absolute -top-3 -right-3 bg-honey text-cream-50 px-3 py-1 rounded-full text-xs font-medium shadow-lg z-10">
                      ⭐ Featured
                    </div>
                  )}

                  {/* Screenshot in "Frame" */}
                  <div className="relative bg-cream-100 rounded-2xl overflow-hidden mb-4 border-4 border-cream-200 shadow-inner">
                    <div className="aspect-[4/3]">
                      <img
                        src={`/api${review.screenshot_url}`}
                        alt={`Review from ${review.reviewer_name || 'Client'}`}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Review Info */}
                  <div className="text-center">
                    {review.star_rating && (
                      <div className="text-honey mb-2">
                        {'⭐'.repeat(review.star_rating)}
                      </div>
                    )}

                    <h3 className="font-serif text-lg text-brown mb-1">
                      {review.reviewer_name || 'Anonymous'}
                    </h3>

                    {review.review_date && (
                      <p className="text-sm text-brown/60 mb-2">
                        {new Date(review.review_date).toLocaleDateString()}
                      </p>
                    )}

                    <span className="inline-block text-xs px-3 py-1 bg-sage/20 text-sage-dark rounded-full">
                      {review.tag}
                    </span>

                    {review.review_text && (
                      <p className="text-sm text-brown/80 mt-3 line-clamp-2">
                        {review.review_text}
                      </p>
                    )}

                    <p className="text-xs text-sage mt-2">Click to enlarge</p>
                  </div>
                </div>
              </motion.div>
            ))}
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
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedReview(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-3xl w-full bg-cream-50 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
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
                <img
                  src={`/api${selectedReview.screenshot_url}`}
                  alt={`Review from ${selectedReview.reviewer_name || 'Client'}`}
                  className="w-full h-auto max-h-[50vh] object-contain"
                />
              </div>

              {/* Review Details */}
              <div className="text-center">
                {selectedReview.star_rating && (
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




