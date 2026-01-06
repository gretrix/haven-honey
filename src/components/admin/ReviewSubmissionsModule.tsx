'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface ReviewSubmission {
  id: number
  reviewer_name: string
  reviewer_email: string
  star_rating: number
  service_category: string
  review_text: string | null
  screenshot_url: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
  reviewed_at: string | null
  images?: Array<{ image_url: string; display_order: number }>
}

export default function ReviewSubmissionsModule() {
  const [submissions, setSubmissions] = useState<ReviewSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<ReviewSubmission | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('pending')
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [filterStatus])

  const fetchSubmissions = async () => {
    setLoading(true)
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const url =
        filterStatus === 'all'
          ? '/api/admin/review-submissions'
          : `/api/admin/review-submissions?status=${filterStatus}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setSubmissions(data.submissions)
      } else {
        toast.error('Failed to fetch submissions')
      }
    } catch (error) {
      toast.error('Error fetching submissions')
    } finally {
      setLoading(false)
    }
  }

  const viewDetails = (submission: ReviewSubmission) => {
    setSelectedSubmission(submission)
    setAdminNotes(submission.admin_notes || '')
    setShowDetailModal(true)
  }

  const handleApprove = async () => {
    if (!selectedSubmission) return

    setProcessing(true)
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch('/api/admin/review-submissions', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${savedPassword}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedSubmission.id,
          action: 'approve',
          admin_notes: adminNotes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Review approved and published!')
        setShowDetailModal(false)
        setSelectedSubmission(null)
        fetchSubmissions()
      } else {
        toast.error(data.error || 'Failed to approve review')
      }
    } catch (error) {
      toast.error('Error approving review')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedSubmission) return

    if (!confirm('Are you sure you want to reject this review submission?')) {
      return
    }

    setProcessing(true)
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch('/api/admin/review-submissions', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${savedPassword}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedSubmission.id,
          action: 'reject',
          admin_notes: adminNotes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Review submission rejected')
        setShowDetailModal(false)
        setSelectedSubmission(null)
        fetchSubmissions()
      } else {
        toast.error(data.error || 'Failed to reject review')
      }
    } catch (error) {
      toast.error('Error rejecting review')
    } finally {
      setProcessing(false)
    }
  }

  const handleUndoRejection = async (submissionId: number) => {
    if (!confirm('Undo rejection and move this back to pending?')) {
      return
    }

    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch('/api/admin/review-submissions', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${savedPassword}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: submissionId,
          action: 'undo_rejection',
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Review moved back to pending!')
        fetchSubmissions()
      } else {
        toast.error(data.error || 'Failed to undo rejection')
      }
    } catch (error) {
      toast.error('Error undoing rejection')
    }
  }

  const deleteSubmission = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this submission?')) {
      return
    }

    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch(`/api/admin/review-submissions?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Submission deleted')
        fetchSubmissions()
      } else {
        toast.error('Failed to delete submission')
      }
    } catch (error) {
      toast.error('Error deleting submission')
    }
  }

  return (
    <div>
      {/* Controls */}
      <div className="bg-cream-50 rounded-3xl p-6 shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <p className="text-brown/60">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} •{' '}
            {submissions.filter((s) => s.status === 'pending').length} pending
          </p>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-brown/70">
              Client-submitted reviews waiting for your approval
            </span>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-brown text-cream-50'
                : 'bg-cream-100 text-brown hover:bg-cream-200'
            }`}
          >
            All
          </button>
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                filterStatus === status
                  ? 'bg-brown text-cream-50'
                  : 'bg-cream-100 text-brown hover:bg-cream-200'
              }`}
            >
              {status} ({submissions.filter((s) => s.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brown/20 border-t-brown"></div>
          <p className="text-brown/60 mt-4">Loading submissions...</p>
        </div>
      )}

      {/* Submissions List */}
      {!loading && submissions.length === 0 && (
        <div className="bg-cream-50 rounded-3xl p-12 text-center">
          <p className="text-brown/60 text-lg">No review submissions yet</p>
          <p className="text-brown/50 text-sm mt-2">
            When clients submit reviews, they&apos;ll appear here for approval
          </p>
        </div>
      )}

      <div className="space-y-4">
        {submissions.map((submission) => (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cream-50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex gap-6">
              {/* Screenshot Thumbnail */}
              <div className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden bg-cream-100 border-2 border-cream-200">
                {submission.screenshot_url ? (
                  <img
                    src={`/api${submission.screenshot_url}`}
                    alt="Review screenshot"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brown/40 text-xs">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-serif text-xl text-brown font-medium flex items-center gap-2">
                      {submission.reviewer_name}
                      <span className="text-honey">
                        {'⭐'.repeat(submission.star_rating)}
                      </span>
                    </h3>
                    <p className="text-sm text-brown/60">{submission.reviewer_email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        submission.status === 'approved'
                          ? 'bg-sage/20 text-sage-dark'
                          : submission.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-honey/20 text-honey-dark'
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-brown/60 mb-3">
                  <span className="px-2 py-1 bg-sage/10 text-sage-dark rounded-full text-xs">
                    {submission.service_category}
                  </span>
                  <span>•</span>
                  <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                </div>

                {submission.review_text && (
                  <p className="text-brown/80 text-sm mb-4 line-clamp-2">
                    {submission.review_text}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => viewDetails(submission)}
                    className="btn-secondary text-xs"
                  >
                    👁️ View Details
                  </button>
                  {submission.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setAdminNotes('')
                          handleApprove()
                        }}
                        className="btn-secondary text-xs bg-sage/20 hover:bg-sage/30 text-sage-dark"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setAdminNotes('')
                          handleReject()
                        }}
                        className="btn-secondary text-xs bg-red-100 hover:bg-red-200 text-red-700"
                      >
                        ✗ Reject
                      </button>
                    </>
                  )}
                  {submission.status === 'rejected' && (
                    <button
                      onClick={() => handleUndoRejection(submission.id)}
                      className="btn-secondary text-xs bg-honey/20 hover:bg-honey/30 text-honey-dark"
                    >
                      ↺ Undo Rejection
                    </button>
                  )}
                  <button
                    onClick={() => deleteSubmission(submission.id)}
                    className="btn-secondary text-xs bg-red-100 hover:bg-red-200 text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cream-50 rounded-3xl p-8 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-serif text-3xl text-brown">Review Submission Details</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedSubmission(null)
                }}
                className="text-brown/60 hover:text-brown text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Badge */}
              <div>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    selectedSubmission.status === 'approved'
                      ? 'bg-sage/20 text-sage-dark'
                      : selectedSubmission.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-honey/20 text-honey-dark'
                  }`}
                >
                  Status: {selectedSubmission.status}
                </span>
              </div>

              {/* Screenshot */}
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  {selectedSubmission.images && selectedSubmission.images.length > 1 
                    ? `Screenshots (${selectedSubmission.images.length})` 
                    : 'Screenshot'}
                </label>
                {selectedSubmission.images && selectedSubmission.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedSubmission.images.map((img, idx) => (
                      <div key={idx} className="bg-cream-100 rounded-2xl overflow-hidden border-2 border-cream-200">
                        {img.image_url ? (
                          <img
                            src={`/api${img.image_url}`}
                            alt={`Review screenshot ${idx + 1}`}
                            className="w-full h-auto"
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center text-brown/40">
                            No image
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-cream-100 rounded-2xl overflow-hidden border-2 border-cream-200">
                    {selectedSubmission.screenshot_url ? (
                      <img
                        src={`/api${selectedSubmission.screenshot_url}`}
                        alt="Review screenshot"
                        className="w-full h-auto"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center text-brown/40">
                        No image
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reviewer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown mb-1">
                    Name
                  </label>
                  <p className="text-brown/80">{selectedSubmission.reviewer_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown mb-1">
                    Email
                  </label>
                  <p className="text-brown/80">{selectedSubmission.reviewer_email}</p>
                </div>
              </div>

              {/* Rating & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown mb-1">
                    Rating
                  </label>
                  <p className="text-honey text-xl">
                    {'⭐'.repeat(selectedSubmission.star_rating)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown mb-1">
                    Service Category
                  </label>
                  <p className="text-brown/80">{selectedSubmission.service_category}</p>
                </div>
              </div>

              {/* Review Text */}
              {selectedSubmission.review_text && (
                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Review Text
                  </label>
                  <p className="text-brown/80 bg-cream-100 rounded-2xl p-4">
                    {selectedSubmission.review_text}
                  </p>
                </div>
              )}

              {/* Submission Date */}
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Submitted On
                </label>
                <p className="text-brown/80">
                  {new Date(selectedSubmission.created_at).toLocaleString()}
                </p>
              </div>

              {/* Admin Notes */}
              {selectedSubmission.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Admin Notes (optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any internal notes..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              )}

              {/* Existing Admin Notes (if any) */}
              {selectedSubmission.admin_notes && (
                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Previous Admin Notes
                  </label>
                  <p className="text-brown/80 bg-cream-100 rounded-2xl p-4">
                    {selectedSubmission.admin_notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedSubmission.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-brown/10">
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="btn-primary flex-1 bg-sage hover:bg-sage-dark disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : '✓ Approve & Publish'}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="btn-secondary flex-1 bg-red-100 hover:bg-red-200 text-red-700"
                  >
                    {processing ? 'Processing...' : '✗ Reject'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

