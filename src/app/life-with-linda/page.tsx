'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  category: string
  published_at: string
  view_count: number
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
      staggerChildren: 0.15,
    },
  },
}

export default function LifeWithLindaPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const categories = ['all', 'Meal Prep', 'Life', 'Tips', 'Faith', 'Home', 'Organizing']

  useEffect(() => {
    fetchPosts()
  }, [filterCategory])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const url =
        filterCategory === 'all'
          ? '/api/blog'
          : `/api/blog?category=${encodeURIComponent(filterCategory)}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream-100 via-cream-50 to-cream-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-50/95 backdrop-blur-md border-b border-cream-300/50">
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
              href="/reviews"
              className="text-brown/70 hover:text-brown transition-colors text-base sm:text-lg font-medium"
            >
              Reviews
            </Link>
            <Link
              href="/work"
              className="text-brown/70 hover:text-brown transition-colors text-base sm:text-lg font-medium"
            >
              Work
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
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeInUp}
              className="inline-block text-sage font-medium text-sm tracking-widest uppercase mb-4"
            >
              The Blog
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              className="font-serif text-5xl sm:text-6xl md:text-7xl text-brown mb-6 italic"
            >
              Life With Linda
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-brown/70 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed"
            >
              Stories, reflections, and inspiration from my journey of making
              homes feel loved — one meal, one moment, one family at a time.
            </motion.p>

            {/* Category Filter */}
            <motion.div
              variants={fadeInUp}
              className="flex gap-2 flex-wrap justify-center"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    filterCategory === cat
                      ? 'bg-sage text-cream-50 shadow-md'
                      : 'bg-cream-50 text-brown hover:bg-cream-200'
                  }`}
                >
                  {cat === 'all' ? 'All Posts' : cat}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brown/20 border-t-brown"></div>
              <p className="text-brown/60 mt-4">Loading posts...</p>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-brown/60 text-lg">
                No posts yet. Check back soon!
              </p>
            </div>
          )}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                variants={fadeInUp}
                className="group"
              >
                <Link href={`/life-with-linda/${post.slug}`}>
                  <div className="bg-cream-50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                    {/* Featured Image */}
                    {post.featured_image_url ? (
                      <div className="relative aspect-[16/10] overflow-hidden bg-cream-100">
                        <img
                          src={`/api${post.featured_image_url}`}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brown/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-gradient-to-br from-sage/20 to-honey/20 flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-brown/30"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-8 flex-1 flex flex-col">
                      {/* Category Badge */}
                      <span className="inline-block w-fit text-xs px-3 py-1 bg-sage/20 text-sage-dark rounded-full mb-3 font-medium">
                        {post.category}
                      </span>

                      {/* Title */}
                      <h2 className="font-serif text-2xl sm:text-3xl text-brown mb-3 group-hover:text-sage transition-colors leading-tight">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-brown/70 leading-relaxed mb-4 flex-1 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-sm text-brown/60 pt-4 border-t border-cream-200">
                        <time dateTime={post.published_at}>
                          {new Date(post.published_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </time>
                        {post.view_count > 0 && (
                          <>
                            <span>•</span>
                            <span>{post.view_count} reads</span>
                          </>
                        )}
                      </div>

                      {/* Read More */}
                      <div className="mt-4 text-sage font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                        Read more
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
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
                <p className="text-cream-200/60 text-sm italic">
                  Life With Linda
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


