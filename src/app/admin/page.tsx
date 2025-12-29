'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import CRMModule from '@/components/admin/CRMModule'
import ReviewsModule from '@/components/admin/ReviewsModule'
import ReviewSubmissionsModule from '@/components/admin/ReviewSubmissionsModule'
import WorkPhotosModule from '@/components/admin/WorkPhotosModule'
import BlogModule from '@/components/admin/BlogModule'
import AuditLogsModule from '@/components/admin/AuditLogsModule'

type TabType = 'crm' | 'reviews' | 'review-submissions' | 'work-photos' | 'blog' | 'audit-logs'

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('crm')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password) {
      localStorage.setItem('admin_password', password)
      setIsAuthenticated(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_password')
    setIsAuthenticated(false)
  }

  useEffect(() => {
    const savedPassword = localStorage.getItem('admin_password')
    if (savedPassword) {
      setIsAuthenticated(true)
    }
  }, [])

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-brown mb-2">
                Admin Dashboard
              </h1>
              <p className="text-brown/60">Manage your Haven & Honey content</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary text-sm">
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('crm')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'crm'
                  ? 'bg-brown text-cream-50'
                  : 'bg-cream-100 text-brown hover:bg-cream-200'
              }`}
            >
              📇 CRM / Contacts
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'blog'
                  ? 'bg-brown text-cream-50'
                  : 'bg-cream-100 text-brown hover:bg-cream-200'
              }`}
            >
              ✏️ Blog
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-brown text-cream-50'
                  : 'bg-cream-100 text-brown hover:bg-cream-200'
              }`}
            >
              ⭐ Reviews
            </button>
            <button
              onClick={() => setActiveTab('review-submissions')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'review-submissions'
                  ? 'bg-brown text-cream-50'
                  : 'bg-cream-100 text-brown hover:bg-cream-200'
              }`}
            >
              📝 Review Submissions
            </button>
            <button
              onClick={() => setActiveTab('work-photos')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'work-photos'
                  ? 'bg-brown text-cream-50'
                  : 'bg-cream-100 text-brown hover:bg-cream-200'
              }`}
            >
              📸 Work Photos
            </button>
            <button
              onClick={() => setActiveTab('audit-logs')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'audit-logs'
                  ? 'bg-brown text-cream-50'
                  : 'bg-cream-100 text-brown hover:bg-cream-200'
              }`}
            >
              📋 Audit Logs
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'crm' && <CRMModule />}
          {activeTab === 'blog' && <BlogModule />}
          {activeTab === 'reviews' && <ReviewsModule />}
          {activeTab === 'review-submissions' && <ReviewSubmissionsModule />}
          {activeTab === 'work-photos' && <WorkPhotosModule />}
          {activeTab === 'audit-logs' && <AuditLogsModule />}
        </motion.div>
      </div>
    </div>
  )
}
