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
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brown/20 border-t-brown"></div>
            <p className="text-brown/60 mt-4">Loading submissions...</p>
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
              <div className="flex flex-col sm:flex-row justify-between gap-4">
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
