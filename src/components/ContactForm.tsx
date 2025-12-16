'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { executeRecaptcha } = useGoogleReCaptcha()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)

    try {
      // Execute reCAPTCHA
      if (!executeRecaptcha) {
        toast.error('reCAPTCHA not loaded. Please refresh the page.')
        setIsSubmitting(false)
        return
      }

      const recaptchaToken = await executeRecaptcha('contact_form')

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, recaptchaToken }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Message sent! Check your email for confirmation.', {
          duration: 6000,
          icon: '🌿',
        })
        setIsSuccess(true)
        reset()
        
        // Reset success state after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000)
      } else {
        toast.error(result.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Success Message */}
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-sage/10 border border-sage/30 rounded-2xl p-6 text-center"
        >
          <div className="text-4xl mb-3">💌</div>
          <h4 className="font-serif text-xl text-brown mb-2">Message Sent!</h4>
          <p className="text-brown/70">
            Thank you for reaching out. Check your inbox for a confirmation email.
          </p>
        </motion.div>
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-brown mb-2">
          Your Name <span className="text-honey">*</span>
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          placeholder="Enter your full name"
          className={`form-input ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brown mb-2">
          Email Address <span className="text-honey">*</span>
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          placeholder="you@example.com"
          className={`form-input ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-brown mb-2">
          Phone Number <span className="text-brown/40">(optional)</span>
        </label>
        <input
          {...register('phone')}
          type="tel"
          id="phone"
          placeholder="(555) 123-4567"
          className="form-input"
          disabled={isSubmitting}
        />
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-brown mb-2">
          Your Message <span className="text-honey">*</span>
        </label>
        <textarea
          {...register('message')}
          id="message"
          placeholder="Tell me how I can help you..."
          rows={5}
          className={`form-textarea ${errors.message ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
          disabled={isSubmitting}
        />
        {errors.message && (
          <p className="mt-2 text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Sending...
          </span>
        ) : (
          'Send Message'
        )}
      </motion.button>

      {/* Privacy Note */}
      <p className="text-center text-sm text-brown/50">
        Your information is safe with us and will never be shared.
      </p>
    </motion.form>
  )
}




