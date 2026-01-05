'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface NavigationProps {
  variant?: 'home' | 'page'
}

export default function Navigation({ variant = 'page' }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  // Navigation links for home page (with hash links)
  const homeLinks = [
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '/life-with-linda', label: 'Blog' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/work', label: 'Work' },
  ]

  // Navigation links for other pages
  const pageLinks = [
    { href: '/', label: 'Home' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/work', label: 'My Work' },
    { href: '/life-with-linda', label: 'Blog' },
  ]

  const links = variant === 'home' ? homeLinks : pageLinks

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-100/90 backdrop-blur-md border-b border-cream-300/50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 z-50">
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

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-10">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-brown/70 hover:text-brown transition-colors text-base font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={variant === 'home' ? '#contact' : '/#contact'}
            className="btn-primary text-base py-3 px-6"
          >
            Contact
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="w-6 h-0.5 bg-brown transition-all"
          />
          <motion.span
            animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="w-6 h-0.5 bg-brown transition-all"
          />
          <motion.span
            animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="w-6 h-0.5 bg-brown transition-all"
          />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/50 lg:hidden"
              style={{ top: '88px' }}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-[88px] bottom-0 w-full max-w-sm bg-cream-50 shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="p-8 space-y-6">
                {/* Navigation Links */}
                <div className="space-y-4">
                  {links.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMobileMenu}
                        className="block text-brown hover:text-sage text-xl font-medium py-3 px-4 rounded-xl hover:bg-cream-100 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Contact Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: links.length * 0.1 }}
                  className="pt-6 border-t border-cream-200"
                >
                  <Link
                    href={variant === 'home' ? '#contact' : '/#contact'}
                    onClick={closeMobileMenu}
                    className="btn-primary w-full text-center block text-lg py-4"
                  >
                    Get in Touch
                  </Link>
                </motion.div>

                {/* Tagline */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (links.length + 1) * 0.1 }}
                  className="pt-8 text-center"
                >
                  <p className="text-brown/60 italic text-sm">
                    &ldquo;Let all that you do be done in love.&rdquo;
                  </p>
                  <p className="text-sage text-xs mt-1">— 1 Corinthians 16:14</p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}

