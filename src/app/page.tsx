'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import ContactForm from '@/components/ContactForm'

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
    title: 'Cleaning',
    description: 'Gentle, detailed care to make your home feel lighter.',
    icon: '✨',
    accent: 'sage',
    details: 'More than just cleaning, I bring detailed attention and care to every corner of your home. From deep cleaning to regular maintenance, I help create the peaceful space you deserve.',
  },
  {
    title: 'Home Resets',
    description: 'Decluttering, refreshing, and restoring your spaces.',
    icon: '🏡',
    accent: 'honey',
    details: 'Sometimes we all need a fresh start. I help declutter, organize, and refresh your spaces so you can breathe easier and enjoy your home again.',
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

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="https://www.instagram.com/lifewithlindaaaa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                    <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8z"/>
                    <circle cx="18.406" cy="5.594" r="1.44"/>
                  </svg>
                  Follow @lifewithlindaaaa
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          INSTAGRAM EMBED SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="section-padding bg-cream-100 relative">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="font-serif text-3xl sm:text-4xl text-brown mb-3">
              Follow My Journey
            </h2>
            <p className="text-brown/70">@lifewithlindaaaa on Instagram</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-cream-50 rounded-3xl p-6 shadow-lg shadow-brown/5"
            dangerouslySetInnerHTML={{
              __html: `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/lifewithlindaaaa/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/lifewithlindaaaa/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this profile on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #F4F4F4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/lifewithlindaaaa/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px;" target="_blank">Linda Tremblay</a> (@<a href="https://www.instagram.com/lifewithlindaaaa/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px;" target="_blank">lifewithlindaaaa</a>) • Instagram photos and videos</p></div></blockquote><script async src="//www.instagram.com/embed.js"></script>`
            }}
          />
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
            className="grid md:grid-cols-3 gap-8"
          >
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                variants={fadeInUp}
                className="group perspective-1000"
              >
                <div className="relative w-full h-[400px] transition-transform duration-700 transform-style-3d group-hover:rotate-y-180">
                  {/* Front of card */}
                  <div className="absolute inset-0 backface-hidden bg-cream-50 rounded-3xl p-10 text-center shadow-lg shadow-brown/5 border border-cream-300/50">
                    <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center text-5xl
                      ${service.accent === 'honey' ? 'bg-honey/20' : 'bg-sage/20'}`}
                    >
                      {service.icon}
                    </div>
                    <h3 className="font-serif text-3xl text-brown mb-4">{service.title}</h3>
                    <p className="text-brown/70 leading-relaxed text-lg mb-6">{service.description}</p>
                    
                    {/* Hover hint */}
                    <div className="absolute bottom-6 left-0 right-0">
                      <p className="text-sage/60 text-sm italic">Hover to learn more</p>
                    </div>
                  </div>
                  
                  {/* Back of card */}
                  <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-10 text-center shadow-lg border-2
                    ${service.accent === 'honey' ? 'bg-honey/10 border-honey/30' : 'bg-sage/10 border-sage/30'}`}
                  >
                    <h3 className="font-serif text-2xl text-brown mb-6">{service.title}</h3>
                    <p className="text-brown/80 leading-relaxed text-base">{service.details}</p>
                    
                    <div className={`w-12 h-1 mx-auto mt-8 rounded-full
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
            <ContactForm />
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

