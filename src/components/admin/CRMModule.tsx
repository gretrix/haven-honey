'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface Submission {
  id: number
  name: string
  email: string
  phone: string | null
  message: string
  created_at: string
  status: 'new' | 'read' | 'responded'
}

interface EmailHistory {
  id: number
  subject: string
  message_body: string
  status: 'sent' | 'failed'
  sent_at: string
}

export default function CRMModule() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'responded'>('all')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showMassEmail, setShowMassEmail] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  
  // Individual email modal
  const [showIndividualEmail, setShowIndividualEmail] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Submission | null>(null)
  const [individualSubject, setIndividualSubject] = useState('')
  const [individualMessage, setIndividualMessage] = useState('')
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const fetchSubmissions = async () => {
    setLoading(true)
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch(`/api/admin/submissions?status=${filter}&limit=100`, {
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      })

      if (response.status === 401) {
        toast.error('Invalid password')
        setLoading(false)
        return
      }

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

  const updateStatus = async (id: number, status: string) => {
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${savedPassword}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Status updated!')
        fetchSubmissions()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      toast.error('Error updating status')
    }
  }

  const deleteContact = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contact? Type DELETE to confirm.')) {
      return
    }

    const confirmation = prompt('Type DELETE to confirm:')
    if (confirmation !== 'DELETE') {
      toast.error('Deletion cancelled')
      return
    }

    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch(`/api/admin/submissions?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Contact deleted!')
        fetchSubmissions()
      } else {
        toast.error('Failed to delete contact')
      }
    } catch (error) {
      toast.error('Error deleting contact')
    }
  }

  const openIndividualEmailModal = async (contact: Submission) => {
    setSelectedContact(contact)
    setIndividualSubject('')
    setIndividualMessage('')
    setShowIndividualEmail(true)
    
    // Fetch email history
    setLoadingHistory(true)
    const savedPassword = localStorage.getItem('admin_password')
    
    try {
      const response = await fetch(`/api/admin/send-email?contact_id=${contact.id}`, {
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      })
      
      const data = await response.json()
      if (data.success) {
        setEmailHistory(data.emails)
      }
    } catch (error) {
      console.error('Failed to fetch email history')
    } finally {
      setLoadingHistory(false)
    }
  }

  const sendIndividualEmail = async () => {
    if (!selectedContact || !individualSubject || !individualMessage) {
      toast.error('Please fill in subject and message')
      return
    }

    setSendingEmail(true)
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${savedPassword}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: selectedContact.id,
          to_email: selectedContact.email,
          to_name: selectedContact.name,
          subject: individualSubject,
          message: individualMessage,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('✅ Email sent successfully!')
        setShowIndividualEmail(false)
        setIndividualSubject('')
        setIndividualMessage('')
      } else {
        toast.error(data.error || 'Failed to send email')
      }
    } catch (error) {
      toast.error('Error sending email')
    } finally {
      setSendingEmail(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Message', 'Date', 'Status']
    const rows = submissions.map((s) => [
      s.id,
      s.name,
      s.email,
      s.phone || '',
      s.message.replace(/"/g, '""'),
      new Date(s.created_at).toLocaleString(),
      s.status,
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `haven-honey-contacts-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === submissions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(submissions.map((s) => s.id))
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const sendMassEmail = async () => {
    if (!emailSubject || !emailMessage) {
      toast.error('Please enter subject and message')
      return
    }

    setSendingEmail(true)
    const savedPassword = localStorage.getItem('admin_password')

    try {
      const response = await fetch('/api/admin/mass-email', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${savedPassword}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
          recipientIds: selectedIds.length > 0 ? selectedIds : undefined,
          sendToAll: selectedIds.length === 0,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`✅ Sent ${data.sent} emails successfully!`)
        setShowMassEmail(false)
        setEmailSubject('')
        setEmailMessage('')
        setSelectedIds([])
      } else {
        toast.error(data.error || 'Failed to send emails')
      }
    } catch (error) {
      toast.error('Error sending emails')
    } finally {
      setSendingEmail(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [filter])

  return (
    <div>
      {/* Controls */}
      <div className="bg-cream-50 rounded-3xl p-6 shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <p className="text-brown/60">
            {submissions.length} contact{submissions.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowMassEmail(true)}
              className="btn-primary text-sm"
              disabled={submissions.length === 0}
            >
              📧 Mass Email
            </button>
            <button
              onClick={exportToCSV}
              className="btn-secondary text-sm"
              disabled={submissions.length === 0}
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-4">
          {['all', 'new', 'read', 'responded'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-brown text-cream-50'
                  : 'bg-cream-100 text-brown hover:bg-cream-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' &&
                ` (${submissions.filter((s) => s.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Selection Controls */}
        {submissions.length > 0 && (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.length === submissions.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-brown/30"
              />
              <span className="text-sm text-brown/80">
                Select All ({submissions.length})
              </span>
            </label>
            {selectedIds.length > 0 && (
              <span className="text-sm text-sage font-medium">
                {selectedIds.length} selected
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brown/20 border-t-brown"></div>
          <p className="text-brown/60 mt-4">Loading contacts...</p>
        </div>
      )}

      {/* Mass Email Modal */}
      {showMassEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cream-50 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-serif text-3xl text-brown mb-2">
                  Send Mass Email
                </h2>
                <p className="text-brown/60">
                  {selectedIds.length > 0
                    ? `Sending to ${selectedIds.length} selected contact${
                        selectedIds.length !== 1 ? 's' : ''
                      }`
                    : `Sending to all ${submissions.length} contacts`}
                </p>
              </div>
              <button
                onClick={() => setShowMassEmail(false)}
                className="text-brown/60 hover:text-brown text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Subject <span className="text-honey">*</span>
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g., Special Offer from Haven & Honey"
                  className="form-input"
                  disabled={sendingEmail}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Message <span className="text-honey">*</span>
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="form-textarea"
                  rows={8}
                  disabled={sendingEmail}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={sendMassEmail}
                  disabled={sendingEmail || !emailSubject || !emailMessage}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {sendingEmail ? 'Sending...' : 'Send Emails'}
                </button>
                <button
                  onClick={() => setShowMassEmail(false)}
                  className="btn-secondary flex-1"
                  disabled={sendingEmail}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Individual Email Modal */}
      {showIndividualEmail && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cream-50 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-serif text-3xl text-brown mb-2">
                  Email {selectedContact.name}
                </h2>
                <p className="text-brown/60">{selectedContact.email}</p>
              </div>
              <button
                onClick={() => setShowIndividualEmail(false)}
                className="text-brown/60 hover:text-brown text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Subject <span className="text-honey">*</span>
                </label>
                <input
                  type="text"
                  value={individualSubject}
                  onChange={(e) => setIndividualSubject(e.target.value)}
                  placeholder="Email subject"
                  className="form-input"
                  disabled={sendingEmail}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Message <span className="text-honey">*</span>
                </label>
                <textarea
                  value={individualMessage}
                  onChange={(e) => setIndividualMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="form-textarea"
                  rows={8}
                  disabled={sendingEmail}
                />
              </div>

              {/* Email History */}
              {emailHistory.length > 0 && (
                <div className="bg-cream-100 rounded-2xl p-4">
                  <h3 className="font-medium text-brown mb-2">Email History</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {emailHistory.map((email) => (
                      <div
                        key={email.id}
                        className="text-sm text-brown/70 border-b border-brown/10 pb-2"
                      >
                        <p className="font-medium">{email.subject}</p>
                        <p className="text-xs">
                          {new Date(email.sent_at).toLocaleString()} -{' '}
                          <span
                            className={
                              email.status === 'sent'
                                ? 'text-sage'
                                : 'text-red-600'
                            }
                          >
                            {email.status}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={sendIndividualEmail}
                  disabled={
                    sendingEmail || !individualSubject || !individualMessage
                  }
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
                <button
                  onClick={() => setShowIndividualEmail(false)}
                  className="btn-secondary flex-1"
                  disabled={sendingEmail}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Submissions List */}
      {!loading && submissions.length === 0 && (
        <div className="bg-cream-50 rounded-3xl p-12 text-center">
          <p className="text-brown/60 text-lg">No contacts found</p>
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
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Checkbox */}
              <div className="flex items-start pt-1">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(submission.id)}
                  onChange={() => toggleSelect(submission.id)}
                  className="w-5 h-5 rounded border-brown/30 cursor-pointer"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-xl text-brown font-medium">
                      {submission.name}
                    </h3>
                    <p className="text-brown/60 text-sm">
                      {new Date(submission.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      submission.status === 'new'
                        ? 'bg-honey/20 text-honey-dark'
                        : submission.status === 'read'
                        ? 'bg-sage/20 text-sage-dark'
                        : 'bg-brown/20 text-brown'
                    }`}
                  >
                    {submission.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-brown/80">
                    <span className="font-medium">Email:</span>{' '}
                    <a
                      href={`mailto:${submission.email}`}
                      className="text-sage hover:underline"
                    >
                      {submission.email}
                    </a>
                  </p>
                  {submission.phone && (
                    <p className="text-brown/80">
                      <span className="font-medium">Phone:</span>{' '}
                      <a
                        href={`tel:${submission.phone}`}
                        className="text-sage hover:underline"
                      >
                        {submission.phone}
                      </a>
                    </p>
                  )}
                </div>

                <div className="bg-cream-100 rounded-2xl p-4 mb-4">
                  <p className="text-brown/80 whitespace-pre-wrap">
                    {submission.message}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2">
                <button
                  onClick={() => openIndividualEmailModal(submission)}
                  className="btn-primary text-sm whitespace-nowrap"
                >
                  📧 Email
                </button>
                <button
                  onClick={() => updateStatus(submission.id, 'read')}
                  className="btn-secondary text-sm whitespace-nowrap"
                  disabled={submission.status === 'read'}
                >
                  Mark Read
                </button>
                <button
                  onClick={() => updateStatus(submission.id, 'responded')}
                  className="btn-secondary text-sm whitespace-nowrap"
                  disabled={submission.status === 'responded'}
                >
                  Responded
                </button>
                <button
                  onClick={() => deleteContact(submission.id)}
                  className="btn-secondary text-sm whitespace-nowrap bg-red-100 hover:bg-red-200 text-red-700"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

