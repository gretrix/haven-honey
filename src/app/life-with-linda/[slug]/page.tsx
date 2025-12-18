'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  featured_image_url: string | null
  category: string
  published_at: string
  view_count: number
  meta_title: string | null
  meta_description: string | null
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params?.slug as string
  
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  const fetchPost = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/blog/${slug}`)
      const data = await response.json()

      if (data.success) {
        setPost(data.post)
        // Update page title
        document.title = data.post.meta_title || `${data.post.title} | Life With Linda`
      } else {
        setError(true)
      }
    } catch (error) {
      console.error('Failed to fetch blog post:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(post?.title || '')
    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brown/20 border-t-brown"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-brown mb-4">Post Not Found</h1>
          <p className="text-brown/70 mb-6">
            Sorry, we couldn't find the post you're looking for.
          </p>
          <Link href="/life-with-linda" className="btn-primary">
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-cream-100">
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
          <Link
            href="/life-with-linda"
            className="text-brown/70 hover:text-brown transition-colors text-base sm:text-lg font-medium"
          >
            ← Back to Blog
          </Link>
        </div>
      </nav>

      {/* Article */}
      <article className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            {/* Category */}
            <span className="inline-block text-sm px-4 py-1 bg-sage/20 text-sage-dark rounded-full mb-6 font-medium">
              {post.category}
            </span>

            {/* Title */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-brown mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center justify-center gap-4 text-brown/60">
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
          </motion.header>

          {/* Featured Image */}
          {post.featured_image_url && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12 rounded-3xl overflow-hidden shadow-2xl"
            >
              <img
                src={`/api${post.featured_image_url}`}
                alt={post.title}
                className="w-full h-auto"
              />
            </motion.div>
          )}

          {/* Social Share Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12 flex items-center justify-center gap-3"
          >
            <button
              onClick={shareOnFacebook}
              className="flex items-center gap-2 px-5 py-3 bg-[#1877F2] text-white rounded-full hover:bg-[#1570E6] transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="font-medium">Share</span>
            </button>

            <button
              onClick={shareOnTwitter}
              className="flex items-center gap-2 px-5 py-3 bg-[#1DA1F2] text-white rounded-full hover:bg-[#1A8CD8] transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              <span className="font-medium">Tweet</span>
            </button>

            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-5 py-3 bg-sage text-cream-50 rounded-full hover:bg-sage-dark transition-colors shadow-md"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">Copy Link</span>
            </button>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="prose prose-lg max-w-none"
          >
            <div
              className="text-brown/90 leading-relaxed space-y-6"
              style={{
                fontSize: '1.125rem',
                lineHeight: '1.875rem',
                fontFamily: 'Georgia, serif',
              }}
            >
              {post.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6 first-letter:text-6xl first-letter:font-serif first-letter:text-brown first-letter:mr-2 first-letter:float-left first-letter:leading-[1]">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Divider */}
          <div className="my-16 flex items-center justify-center">
            <Image
              src="/images/haven-honey-logo-circle-transparent.png"
              alt=""
              width={60}
              height={60}
              className="w-15 h-15 opacity-40"
            />
          </div>

          {/* Footer Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center bg-cream-50 rounded-3xl p-8 shadow-lg border border-cream-300/50"
          >
            <p className="text-brown/70 italic text-lg mb-4">
              &ldquo;Let all that you do be done in love.&rdquo;
            </p>
            <p className="text-brown/60 text-sm">— 1 Corinthians 16:14</p>
          </motion.div>

          {/* Social Share Again */}
          <div className="mt-12 text-center">
            <p className="text-brown/70 mb-4">Share this post with friends:</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={shareOnFacebook}
                className="p-3 bg-[#1877F2] text-white rounded-full hover:bg-[#1570E6] transition-colors shadow-md"
                aria-label="Share on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>

              <button
                onClick={shareOnTwitter}
                className="p-3 bg-[#1DA1F2] text-white rounded-full hover:bg-[#1A8CD8] transition-colors shadow-md"
                aria-label="Share on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </button>

              <button
                onClick={copyLink}
                className="p-3 bg-sage text-cream-50 rounded-full hover:bg-sage-dark transition-colors shadow-md"
                aria-label="Copy link"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Back to Blog */}
          <div className="mt-16 text-center">
            <Link
              href="/life-with-linda"
              className="inline-flex items-center gap-2 text-sage hover:text-sage-dark transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to all posts
            </Link>
          </div>
        </div>
      </article>

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

