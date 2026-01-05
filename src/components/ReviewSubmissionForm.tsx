'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

// Service categories matching the database enum
const SERVICE_CATEGORIES = [
  'Meal Prep',
  'Cleaning',
  'Organizing',
  'Gift Wrapping',
  'Matchmaking',
  'Life Coaching',
  'Other',
] as const

// Validation schema - use any for FileList to avoid SSR issues
const reviewSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  star_rating: z.string().min(1, 'Please select a rating'),
  service_category: z.string().min(1, 'Please select a service category'),
  review_text: z.string().optional(),
  screenshots: z.any().optional(), // Will validate using selectedFiles state instead
})

type ReviewFormData = z.infer<typeof reviewSchema>

export default function ReviewSubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { executeRecaptcha } = useGoogleReCaptcha()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Filter out non-image files (only accept images)
      const fileArray = Array.from(files).filter(file => {
        const isImage = file.type.startsWith('image/')
        if (!isImage) {
          console.log('🔥 Skipping non-image file:', file.name, file.type)
          toast.error(`${file.name} is not an image file. Only images are allowed.`)
        }
        return isImage
      }).slice(0, 10) // Limit to 10 images
      
      if (fileArray.length === 0) {
        toast.error('Please select image files only (JPG, PNG, WebP, etc.)')
        return
      }
      
      // Store files in state
      setSelectedFiles(fileArray)
      
      // Update form value
      setValue('screenshots', files, { shouldValidate: true })
      
      // Create previews for all images
      const newPreviewUrls: string[] = []
      let loadedCount = 0
      
      fileArray.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviewUrls.push(reader.result as string)
          loadedCount++
          
          if (loadedCount === fileArray.length) {
            setPreviewUrls(newPreviewUrls)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removePreview = (index: number) => {
    // Remove from both preview URLs and selected files
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ReviewFormData) => {
    // Validate that at least one image is selected
    console.log('🔥 Form submit - selectedFiles:', selectedFiles.length, selectedFiles)
    
    if (selectedFiles.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    if (selectedFiles.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }

    setIsSubmitting(true)

    try {
      // Execute reCAPTCHA
      if (!executeRecaptcha) {
        toast.error('reCAPTCHA not loaded. Please refresh the page.')
        setIsSubmitting(false)
        return
      }

      const recaptchaToken = await executeRecaptcha('submit_review')

      // Prepare form data
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('email', data.email)
      formData.append('star_rating', data.star_rating)
      formData.append('service_category', data.service_category)
      if (data.review_text) {
        formData.append('review_text', data.review_text)
      }
      
      // Append all images from selectedFiles array (respects removed images)
      console.log('🔥 Appending', selectedFiles.length, 'files to FormData')
      for (let i = 0; i < selectedFiles.length; i++) {
        const fieldName = i === 0 ? 'screenshot' : `screenshot_${i}`
        console.log(`🔥 Appending file ${i}:`, fieldName, selectedFiles[i].name)
        formData.append(fieldName, selectedFiles[i])
      }
      
      formData.append('recaptchaToken', recaptchaToken)

      console.log('🔥 Sending request with FormData')
      const response = await fetch('/api/submit-review', {
        method: 'POST',
        body: formData,
      })

      console.log('🔥 Response status:', response.status)

      const result = await response.json()

      if (result.success) {
        toast.success('Review submitted successfully! Thank you for your feedback.', {
          duration: 6000,
          icon: '⭐',
        })
        setIsSuccess(true)
        reset()
        setSelectedRating(0)
        setPreviewUrls([])
        setSelectedFiles([])

        // Reset success state after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000)
      } else {
        toast.error(result.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto space-y-6"
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
          <div className="text-4xl mb-3">🌟</div>
          <h4 className="font-serif text-xl text-brown mb-2">Thank You!</h4>
          <p className="text-brown/70">
            Your review has been submitted and will be reviewed shortly. We appreciate your feedback!
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
          placeholder="Enter your name"
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
        <p className="mt-1 text-xs text-brown/50">We'll never share your email</p>
      </div>

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-brown mb-2">
          Rating <span className="text-honey">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} className="cursor-pointer">
              <input
                {...register('star_rating')}
                type="radio"
                value={star}
                className="sr-only"
                onChange={() => setSelectedRating(star)}
                disabled={isSubmitting}
              />
              <svg
                className={`w-10 h-10 transition-colors ${
                  selectedRating >= star
                    ? 'text-honey fill-honey'
                    : 'text-brown/20 hover:text-honey/50'
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </label>
          ))}
        </div>
        {errors.star_rating && (
          <p className="mt-2 text-sm text-red-500">{errors.star_rating.message}</p>
        )}
      </div>

      {/* Service Category */}
      <div>
        <label htmlFor="service_category" className="block text-sm font-medium text-brown mb-2">
          Service Type <span className="text-honey">*</span>
        </label>
        <select
          {...register('service_category')}
          id="service_category"
          className={`form-input ${errors.service_category ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
          disabled={isSubmitting}
        >
          <option value="">Select a service...</option>
          {SERVICE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.service_category && (
          <p className="mt-2 text-sm text-red-500">{errors.service_category.message}</p>
        )}
      </div>

      {/* Review Text (Optional) */}
      <div>
        <label htmlFor="review_text" className="block text-sm font-medium text-brown mb-2">
          Additional Comments <span className="text-brown/40">(optional)</span>
        </label>
        <textarea
          {...register('review_text')}
          id="review_text"
          placeholder="Share more details about your experience..."
          rows={4}
          className="form-textarea"
          disabled={isSubmitting}
        />
      </div>

      {/* Screenshot Upload - Multiple Images */}
      <div>
        <label htmlFor="screenshots" className="block text-sm font-medium text-brown mb-2">
          Review Images <span className="text-honey">*</span>
        </label>
        <div className="space-y-3">
          <input
            type="file"
            id="screenshots"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={isSubmitting}
          />
          <label
            htmlFor="screenshots"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
              errors.screenshots
                ? 'border-red-400 bg-red-50'
                : 'border-brown/30 bg-cream-100 hover:bg-cream-200 hover:border-brown/50'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg
              className="w-8 h-8 text-brown/50 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm text-brown/70">
              {previewUrls.length > 0 ? `${previewUrls.length} image(s) selected` : 'Click to upload images'}
            </span>
            <span className="text-xs text-brown/50 mt-1">PNG, JPG, WebP • Up to 10 images (Max 15MB each)</span>
          </label>

          {/* Previews Grid */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative rounded-xl overflow-hidden border-2 border-sage/30 group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover bg-cream-50"
                  />
                  <button
                    type="button"
                    onClick={() => removePreview(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-2 left-2 bg-brown/80 text-cream-50 text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {errors.screenshots && (
          <p className="mt-2 text-sm text-red-500">{String(errors.screenshots.message)}</p>
        )}
        <p className="mt-2 text-xs text-brown/50">
          Upload screenshots of your review from Google, Facebook, or any platform
        </p>
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
            Submitting...
          </span>
        ) : (
          'Submit Review'
        )}
      </motion.button>

      {/* Privacy Note */}
      <p className="text-center text-sm text-brown/50">
        Your information is safe with us and will only be used to display your review.
      </p>
    </motion.form>
  )
}

