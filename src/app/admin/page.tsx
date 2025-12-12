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

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'responded'>('all')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showMassEmail, setShowMassEmail] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password) {
      localStorage.setItem('admin_password', password)
      setIsAuthenticated(true)
      fetchSubmissions(password)
    }
  }

  const fetchSubmissions = async (pwd?: string) => {
    setLoading(true)
    const savedPassword = pwd || localStorage.getItem('admin_password')
    
    if (!savedPassword) {
      setIsAuthenticated(false)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/submissions?status=${filter}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${savedPassword}`,
        },
      })

      if (response.status === 401) {
        toast.error('Invalid password')
        localStorage.removeItem('admin_password')
        setIsAuthenticated(false)
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
          'Authorization': `Bearer ${savedPassword}`,
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

  const handleLogout = () => {
    localStorage.removeItem('admin_password')
    setIsAuthenticated(false)
    setSubmissions([])
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Message', 'Date', 'Status']
    const rows = submissions.map(s => [
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
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `haven-honey-submissions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === submissions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(submissions.map(s => s.id))
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
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
          'Authorization': `Bearer ${savedPassword}`,
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
    const savedPassword = localStorage.getItem('admin_password')
    if (savedPassword) {
      setIsAuthenticated(true)
      fetchSubmissions(savedPassword)
    }
  }, [filter])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cream-50 rounded-3xl p-8 sm:p-12 shadow-xl max-w-md w-full"
        >
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-brown mb-2">Admin Login</h1>
            <p className="text-brown/60">Haven & Honey Dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="form-input mb-4"
              autoFocus
            />
            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-cream-50 rounded-3xl p-6 sm:p-8 shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-brown mb-2">
                Admin Dashboard
              </h1>
              <p className="text-brown/60">
                {submissions.length} total submission{submissions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
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
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-6 flex-wrap">
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
                {f !== 'all' && ` (${submissions.filter(s => s.status === f).length})`}
              </button>
            ))}
          </div>

          {/* Selection Controls */}
          {submissions.length > 0 && (
            <div className="flex items-center gap-4 mt-4">
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
            <p className="text-brown/60 mt-4">Loading submissions...</p>
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
                  <h2 className="font-serif text-3xl text-brown mb-2">Send Mass Email</h2>
                  <p className="text-brown/60">
                    {selectedIds.length > 0
                      ? `Sending to ${selectedIds.length} selected contact${selectedIds.length !== 1 ? 's' : ''}`
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
                    placeholder="Write your message here... (Recipients will see: Hello [Name], [Your message])"
                    className="form-textarea"
                    rows={8}
                    disabled={sendingEmail}
                  />
                  <p className="text-brown/50 text-sm mt-2">
                    💡 Each email will be personalized with the recipient's name
                  </p>
                </div>

                <div className="bg-honey/10 border border-honey/30 rounded-2xl p-4">
                  <p className="text-brown/80 text-sm">
                    <strong>Preview:</strong> Emails will include your message, Linda's signature, and the Haven & Honey branding.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={sendMassEmail}
                    disabled={sendingEmail || !emailSubject || !emailMessage}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {sendingEmail ? (
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
                      'Send Emails'
                    )}
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

        {/* Submissions */}
        {!loading && submissions.length === 0 && (
          <div className="bg-cream-50 rounded-3xl p-12 text-center">
            <p className="text-brown/60 text-lg">No submissions found</p>
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
                      <a href={`mailto:${submission.email}`} className="text-sage hover:underline">
                        {submission.email}
                      </a>
                    </p>
                    {submission.phone && (
                      <p className="text-brown/80">
                        <span className="font-medium">Phone:</span>{' '}
                        <a href={`tel:${submission.phone}`} className="text-sage hover:underline">
                          {submission.phone}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="bg-cream-100 rounded-2xl p-4">
                    <p className="text-brown/80 whitespace-pre-wrap">{submission.message}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2">
                  <button
                    onClick={() => updateStatus(submission.id, 'read')}
                    className="btn-secondary text-sm whitespace-nowrap"
                    disabled={submission.status === 'read'}
                  >
                    Mark Read
                  </button>
                  <button
                    onClick={() => updateStatus(submission.id, 'responded')}
                    className="btn-primary text-sm whitespace-nowrap"
                    disabled={submission.status === 'responded'}
                  >
                    Mark Responded
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
