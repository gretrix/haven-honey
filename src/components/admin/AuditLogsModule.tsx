'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface AuditLog {
  id: number
  action_type: 'create' | 'update' | 'delete' | 'email_sent'
  entity_type: string
  entity_id: number | null
  details: string | null
  ip_address: string | null
  created_at: string
}

export default function AuditLogsModule() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterEntity, setFilterEntity] = useState<string>('all')

  const actionTypes = ['all', 'create', 'update', 'delete', 'email_sent']
  const entityTypes = ['all', 'blog', 'review', 'work_photo', 'contact', 'email']

  const fetchLogs = async () => {
    setLoading(true)
    const savedPassword = localStorage.getItem('admin_password')

    try {
      let url = '/api/admin/audit-logs?limit=100'
      if (filterAction !== 'all') url += `&action_type=${filterAction}`
      if (filterEntity !== 'all') url += `&entity_type=${filterEntity}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setLogs(data.logs)
      } else {
        toast.error('Failed to fetch audit logs')
      }
    } catch (error) {
      toast.error('Error fetching audit logs')
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-sage/20 text-sage-dark'
      case 'update':
        return 'bg-honey/20 text-honey-dark'
      case 'delete':
        return 'bg-red-100 text-red-700'
      case 'email_sent':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-brown/20 text-brown'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return '✨'
      case 'update':
        return '✏️'
      case 'delete':
        return '🗑️'
      case 'email_sent':
        return '📧'
      default:
        return '📝'
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [filterAction, filterEntity])

  const exportToCSV = () => {
    const headers = ['ID', 'Action', 'Entity Type', 'Entity ID', 'Details', 'IP Address', 'Date']
    const rows = logs.map((log) => [
      log.id,
      log.action_type,
      log.entity_type,
      log.entity_id || '',
      (log.details || '').replace(/"/g, '""'),
      log.ip_address || '',
      new Date(log.created_at).toLocaleString(),
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div>
      {/* Controls */}
      <div className="bg-cream-50 rounded-3xl p-6 shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="font-serif text-2xl text-brown mb-2">Audit Logs</h2>
            <p className="text-brown/60">
              {logs.length} log{logs.length !== 1 ? 's' : ''} • Activity history
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="btn-secondary text-sm"
            disabled={logs.length === 0}
          >
            📥 Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-brown mb-2">Filter by Action:</p>
            <div className="flex gap-2 flex-wrap">
              {actionTypes.map((action) => (
                <button
                  key={action}
                  onClick={() => setFilterAction(action)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                    filterAction === action
                      ? 'bg-brown text-cream-50'
                      : 'bg-cream-100 text-brown hover:bg-cream-200'
                  }`}
                >
                  {action === 'all' ? 'All Actions' : action.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-brown mb-2">Filter by Entity:</p>
            <div className="flex gap-2 flex-wrap">
              {entityTypes.map((entity) => (
                <button
                  key={entity}
                  onClick={() => setFilterEntity(entity)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                    filterEntity === entity
                      ? 'bg-brown text-cream-50'
                      : 'bg-cream-100 text-brown hover:bg-cream-200'
                  }`}
                >
                  {entity === 'all' ? 'All Entities' : entity.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brown/20 border-t-brown"></div>
          <p className="text-brown/60 mt-4">Loading audit logs...</p>
        </div>
      )}

      {/* Logs List */}
      {!loading && logs.length === 0 && (
        <div className="bg-cream-50 rounded-3xl p-12 text-center">
          <p className="text-brown/60 text-lg">No audit logs found</p>
        </div>
      )}

      <div className="space-y-3">
        {logs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cream-50 rounded-2xl p-5 shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="text-2xl flex-shrink-0">
                {getActionIcon(log.action_type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getActionBadgeColor(
                      log.action_type
                    )}`}
                  >
                    {log.action_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs px-3 py-1 bg-cream-100 rounded-full text-brown/70 capitalize">
                    {log.entity_type.replace('_', ' ')}
                  </span>
                  {log.entity_id && (
                    <span className="text-xs text-brown/60">ID: {log.entity_id}</span>
                  )}
                </div>

                {log.details && (
                  <p className="text-brown/80 text-sm mb-2 break-words">
                    {log.details}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-brown/60">
                  <span>
                    📅 {new Date(log.created_at).toLocaleString()}
                  </span>
                  {log.ip_address && (
                    <>
                      <span>•</span>
                      <span>🌐 {log.ip_address}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

