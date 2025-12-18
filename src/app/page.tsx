'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import ContactForm from '@/components/ContactForm'
import ReCaptchaProvider from '@/components/ReCaptchaProvider'

// Animation variants
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

// Service data with detailed info
const services = [
  {
    title: 'Meal Prep',
    description: 'Comforting, homemade meals for busy families.',
    icon: '🍲',
    accent: 'honey',
    details: 'I prepare fresh, homemade meals tailored to your family\'s needs and preferences. From weekly meal prep to special dietary requirements, I bring nourishment and care to your table.',
  },
  {
    title: 'Heart-Aligned Matchmaking & Modern Dating Guidance',
    description: 'Finding love shouldn\'t feel overwhelming.',
    icon: '💕',
    accent: 'sage',
    details: 'I offer intentional support that blends curated introductions, dating strategy, and honest guidance — helping you choose partners who match your values, your lifestyle, and the future you\'re building. Whether you\'re starting fresh or ready to date with more clarity, I help you move with confidence, purpose, and real alignment.',
  },
  {
    title: 'Home Resets',
    description: 'Decluttering, refreshing, and restoring your spaces.',
    icon: '🏡',
    accent: 'honey',
    details: 'Sometimes we all need a fresh start. I help declutter, organize, and refresh your spaces so you can breathe easier and enjoy your home again.',
  },
  {
    title: 'Life Coaching',
    description: 'Change doesn\'t have to come from punishment or pressure.',
    icon: '🌟',
    accent: 'sage',
    details: 'I guide clients through the kind of inner shifts that create real, lasting transformation — the same approach that helped me lose nearly 180 pounds across two years without fad diets or intense workout plans.',
  },
]

// Testimonials data
const testimonials = [
  {
    quote: 'Linda brings so much peace to our home. Her presence is like a breath of fresh air.',
    author: 'M.K.',
  },
  {
    quote: 'Her meals and home resets have changed our weeks. We finally have time to enjoy our family.',
    author: 'A.S.',
  },
  {
    quote: 'Working with Linda feels like having a sister come help. She truly cares.',
    author: 'J.T.',
  },
]

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])
  
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  return (
    <main className="overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-100/90 backdrop-blur-md border-b border-cream-300/50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="#" className="flex items-center gap-4">
            <Image
              src="/images/haven-honey-logo-circle-transparent.png"
              alt="Haven & Honey"
              width={56}
              height={56}
              className="w-14 h-14"
            />
            <span className="font-serif text-xl text-brown hidden sm:block">Haven & Honey</span>
          </a>
          <div className="flex items-center gap-6 sm:gap-10">
            <a href="#about" className="text-brown/70 hover:text-brown transition-colors text-base sm:text-lg font-medium">About</a>
            <a href="#services" className="text-brown/70 hover:text-brown transition-colors text-base sm:text-lg font-medium">Services</a>
            <a href="/reviews" className="text-brown/70 hover:text-brown transition-colors text-base sm:text-lg font-medium">Reviews</a>
            <a href="/work" className="text-brown/70 hover:text-brown transition-colors text-base sm:text-lg font-medium">Work</a>
            <a href="#contact" className="btn-primary text-base py-3 px-6 sm:py-4 sm:px-8">Contact</a>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: HERO HEADER
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 pattern-lines opacity-50" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-honey/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-sage/10 rounded-full blur-3xl" />
        
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-6"
          >
            <Image
              src="/images/haven-honey-logo-horizontal-transparent.png"
              alt="Haven & Honey - Meal Prep, Cleaning, Home Resets - Making Homes Feel Loved"
              width={700}
              height={300}
              priority
              className="mx-auto w-full max-w-2xl"
            />
          </motion.div>

          {/* Verse - BIGGER */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="font-sans text-brown/70 italic text-xl sm:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            &ldquo;Let all that you do be done in love.&rdquo;
            <span className="block mt-2 not-italic text-sage text-lg sm:text-xl">— 1 Corinthians 16:14</span>
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <a href="#contact" className="btn-primary text-lg px-10 py-4">
              Get in Touch
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-6 h-10 border-2 border-brown/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-3 bg-brown/40 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: ABOUT LINDA
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="about" className="section-padding bg-cream-50 relative">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cream-100 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          >
            {/* Photo */}
            <motion.div variants={fadeInUp} className="relative">
              <div className="relative aspect-[3/4] max-w-md mx-auto lg:max-w-none">
                {/* Decorative frame */}
                <div className="absolute -inset-4 bg-gradient-to-br from-honey/20 to-sage/20 rounded-3xl -rotate-3" />
                <div className="absolute -inset-4 bg-gradient-to-tr from-sage/20 to-honey/20 rounded-3xl rotate-3" />
                
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-brown/20">
                  <Image
                    src="/images/Linda.jpg"
                    alt="Linda - Founder of Haven & Honey"
                    width={500}
                    height={667}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brown/20 to-transparent" />
                </div>

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -right-6 bg-cream-50 rounded-2xl shadow-xl shadow-brown/10 p-4"
                >
                  <Image
                    src="/images/haven-honey-logo-circle-transparent.png"
                    alt=""
                    width={80}
                    height={80}
                    className="w-20 h-20"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div variants={fadeInUp}>
              <span className="inline-block text-sage font-medium text-sm tracking-widest uppercase mb-4">
                The Heart Behind Haven & Honey
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl text-brown mb-6">
                Meet Linda
              </h2>
              <div className="space-y-5 text-brown/80 leading-relaxed text-lg">
                <p>
                  I&apos;m Linda — mom of three, creator of <em className="text-brown font-medium">Life With Linda</em>, and the heart behind Haven & Honey.
                </p>
                <p>
                  For years I&apos;ve poured myself into making homes feel peaceful, nourished, and cared for. After walking through my own seasons of rebuilding, I realized something simple but powerful: <strong className="text-brown">every home deserves to feel like a haven.</strong>
                </p>
                <p>
                  Haven & Honey was born from that calling — a place where warmth, intention, faith, and care all come together to serve busy families and overwhelmed hearts.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          INSTAGRAM SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-padding bg-cream-100 relative">
        <div className="max-w-xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-cream-50 rounded-3xl p-8 shadow-lg shadow-brown/5 border border-cream-300/50 text-center"
          >
            <h2 className="font-serif text-3xl text-brown mb-3">
              Follow My Journey
            </h2>
            <p className="text-brown/70 mb-2">@lifewithlindaaaa</p>
            <p className="text-brown/60 text-sm mb-6">Daily inspiration and home tips</p>
            
            <a
              href="https://www.instagram.com/lifewithlindaaaa/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brown text-cream-50 font-medium px-6 py-3 rounded-full hover:bg-brown/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8z"/>
                <circle cx="18.406" cy="5.594" r="1.44"/>
              </svg>
              Follow on Instagram
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: THE HEART OF HAVEN & HONEY
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cream-50 via-cream-100 to-cream-100" />
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeInUp}
              className="inline-block text-honey font-medium text-sm tracking-widest uppercase mb-4"
            >
              Our Purpose
            </motion.span>
            
            <motion.h2
              variants={fadeInUp}
              className="font-serif text-4xl sm:text-5xl text-brown mb-8"
            >
              Why Haven & Honey Exists
            </motion.h2>

            {/* Decorative divider */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center justify-center gap-4 mb-12"
            >
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-sage" />
              <Image
                src="/images/haven-honey-logo-circle-transparent.png"
                alt=""
                width={48}
                height={48}
                className="w-12 h-12 opacity-60"
              />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-sage" />
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="space-y-8 text-lg sm:text-xl text-brown/80 leading-relaxed"
            >
              <p className="font-serif text-2xl sm:text-3xl text-brown italic">
                &ldquo;Haven&rdquo; is the peace we all crave.
              </p>
              <p className="font-serif text-2xl sm:text-3xl text-brown italic">
                &ldquo;Honey&rdquo; is the sweetness we add into everyday life — through meals, comfort, order, beauty, and love.
              </p>
              
              <div className="pt-4">
                <p>
                  Haven & Honey is my way of bringing that into the homes and lives of others.
                </p>
                <p className="mt-4">
                  Whether it&apos;s preparing meals, refreshing a space, encouraging someone online, or simply offering love where it&apos;s needed — this brand is meant to uplift.
                </p>
              </div>

              <div className="pt-8 pb-4">
                <p className="font-serif text-2xl text-brown">
                  Haven & Honey is more than a service.
                </p>
                <p className="font-serif text-3xl text-sage font-medium mt-2">
                  It&apos;s a way of caring for people.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: WHAT I OFFER
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="services" className="section-padding bg-cream-200/50 relative">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-cream-100 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.span
              variants={fadeInUp}
              className="inline-block text-sage font-medium text-sm tracking-widest uppercase mb-4"
            >
              Services
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="font-serif text-5xl sm:text-6xl text-brown"
            >
              What I Offer
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                variants={fadeInUp}
                className="group perspective-1000"
              >
                <div className="relative w-full h-[450px] transition-transform duration-700 transform-style-3d group-hover:rotate-y-180">
                  {/* Front of card */}
                  <div className="absolute inset-0 backface-hidden bg-cream-50 rounded-3xl p-8 text-center shadow-lg shadow-brown/5 border border-cream-300/50 overflow-hidden">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl
                      ${service.accent === 'honey' ? 'bg-honey/20' : 'bg-sage/20'}`}
                    >
                      {service.icon}
                    </div>
                    <h3 className="font-serif text-2xl text-brown mb-3 leading-tight">{service.title}</h3>
                    <p className="text-brown/70 leading-relaxed text-base mb-6">{service.description}</p>
                    
                    {/* Hover hint */}
                    <div className="absolute bottom-6 left-0 right-0">
                      <p className="text-sage/60 text-sm italic">Hover to learn more</p>
                    </div>
                  </div>
                  
                  {/* Back of card */}
                  <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-8 text-center shadow-lg border-2 overflow-hidden
                    ${service.accent === 'honey' ? 'bg-honey/10 border-honey/30' : 'bg-sage/10 border-sage/30'}`}
                  >
                    <h3 className="font-serif text-xl text-brown mb-4 leading-tight">{service.title}</h3>
                    <p className="text-brown/80 leading-relaxed text-sm">{service.details}</p>
                    
                    <div className={`w-12 h-1 mx-auto mt-6 rounded-full
                      ${service.accent === 'honey' ? 'bg-honey' : 'bg-sage'}`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <a href="#contact" className="btn-sage text-lg">
              Request More Info
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: TESTIMONIALS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-padding bg-brown relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-honey/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-sage/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.span
              variants={fadeInUp}
              className="inline-block text-honey font-medium text-sm tracking-widest uppercase mb-4"
            >
              Kind Words
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="font-serif text-4xl sm:text-5xl text-cream-50 mb-16"
            >
              What Others Say
            </motion.h2>

            {/* Testimonial Cards */}
            <motion.div variants={fadeInUp} className="relative">
              <div className="text-6xl text-honey/30 absolute -top-8 left-1/2 -translate-x-1/2">
                &ldquo;
              </div>
              
              <div className="bg-cream-50/5 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-cream-50/10">
                <p className="font-serif text-2xl sm:text-3xl text-cream-100 mb-8 italic leading-relaxed">
                  {testimonials[activeTestimonial].quote}
                </p>
                <p className="text-honey font-medium">
                  — {testimonials[activeTestimonial].author}
                </p>
              </div>

              {/* Dots navigation */}
              <div className="flex justify-center gap-3 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === activeTestimonial
                        ? 'bg-honey w-8'
                        : 'bg-cream-50/30 hover:bg-cream-50/50'
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6: CONTACT / CALL TO ACTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="contact" className="section-padding relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cream-100 via-cream-50 to-cream-100" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-honey/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sage/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-3xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.span
              variants={fadeInUp}
              className="inline-block text-sage font-medium text-sm tracking-widest uppercase mb-4"
            >
              Let&apos;s Connect
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="font-serif text-4xl sm:text-5xl text-brown mb-6"
            >
              Ready to make your home feel loved?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-brown/70 text-lg max-w-xl mx-auto"
            >
              I&apos;d love to hear from you. Whether you have questions about my services or just want to say hello, drop me a message below.
            </motion.p>
          </motion.div>

          {/* Contact Form */}
          <div className="bg-cream-100 rounded-3xl p-8 sm:p-12 shadow-xl shadow-brown/5 border border-cream-300/50">
            <ReCaptchaProvider>
              <ContactForm />
            </ReCaptchaProvider>
          </div>

          {/* Additional contact info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12"
          >
            <p className="text-brown/60">
              Or email me directly at{' '}
              <a href="mailto:linda@havenhoney.co" className="text-sage hover:text-sage-dark underline underline-offset-4">
                linda@havenhoney.co
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
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
                <p className="font-serif text-cream-100 text-lg">Haven & Honey</p>
                <p className="text-cream-200/60 text-sm">Making Homes Feel Loved</p>
              </div>
            </div>

            <p className="text-cream-200/40 text-sm italic text-center md:text-right">
              &ldquo;Let all that you do be done in love.&rdquo;<br />
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

