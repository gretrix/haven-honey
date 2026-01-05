'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import ReviewSubmissionForm from '@/components/ReviewSubmissionForm'
import ReCaptchaProvider from '@/components/ReCaptchaProvider'
import Navigation from '@/components/Navigation'

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

export default function SubmitReviewPage() {
  return (
    <main className="min-h-screen bg-cream-100">
      {/* Navigation */}
      <Navigation variant="page" />

      {/* Header Section */}
      <section className="pt-32 pb-16 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cream-100 via-cream-50 to-cream-100" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-honey/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sage/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeInUp}
              className="inline-block text-sage font-medium text-sm tracking-widest uppercase mb-4"
            >
              Share Your Experience
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              className="font-serif text-4xl sm:text-5xl md:text-6xl text-brown mb-6"
            >
              Submit Your Review
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-brown/70 text-lg max-w-2xl mx-auto mb-8"
            >
              Have you worked with Haven & Honey? We&apos;d love to hear about your experience! Upload a screenshot of your review from Google, Facebook, or any platform, and share it with others.
            </motion.p>

            {/* Instructions */}
            <motion.div
              variants={fadeInUp}
              className="bg-sage/10 border border-sage/30 rounded-2xl p-6 text-left"
            >
              <h3 className="font-serif text-lg text-brown mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How to submit your review:
              </h3>
              <ol className="space-y-2 text-brown/70">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-honey text-cream-50 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Take a screenshot of your review from Google, Facebook, or any platform</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-honey text-cream-50 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Fill out the form below with your details</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-honey text-cream-50 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Upload your screenshot and submit!</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-honey text-cream-50 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>Linda will review and publish it shortly</span>
                </li>
              </ol>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="px-6 pb-24 relative">
        <div className="max-w-3xl mx-auto">
          <div className="bg-cream-50 rounded-3xl p-8 sm:p-12 shadow-xl shadow-brown/5 border border-cream-300/50">
            <ReCaptchaProvider>
              <ReviewSubmissionForm />
            </ReCaptchaProvider>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-brown/60 text-sm">
              Already left a review elsewhere?{' '}
              <Link href="/reviews" className="text-sage hover:text-sage-dark underline">
                View all reviews
              </Link>
            </p>
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

