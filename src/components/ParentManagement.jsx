import { useState, useEffect } from 'react'
import { getParents, getChildren, renewSubscription } from '../services/api'
import { formatToIST } from '../utils/dateUtils'

export default function ParentManagement() {
  const [parents, setParents] = useState([])
  const [selectedParent, setSelectedParent] = useState(null)
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })

  useEffect(() => {
    fetchParents()
  }, [])

  const fetchParents = async (page = 1, search = '') => {
    try {
      const data = await getParents(page, 10, search)
      console.log('API Response:', data) // Debug log
      setParents(data.data || [])
      setPagination({ 
        page: data.page || 1, 
        limit: data.limit || 10, 
        total: data.total || 0, 
        pages: data.pages || 0 
      })
    } catch (error) {
      console.error('Failed to fetch parents:', error)
      setParents([])
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 })
    } finally {
      setLoading(false)
    }
  }

  const handleParentSelect = async (parent) => {
    setSelectedParent(parent)
    try {
      const childrenData = await getChildren(parent.id)
      setChildren(childrenData)
    } catch (error) {
      console.error('Failed to fetch children:', error)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    fetchParents(1, term)
  }

  const handlePageChange = (newPage) => {
    fetchParents(newPage, searchTerm)
  }

  const handleRenewSubscription = async (parentId) => {
    try {
      await renewSubscription(parentId)
      fetchParents(pagination.page, searchTerm) // Refresh current page
      alert('Subscription renewed successfully!')
    } catch (error) {
      alert('Failed to renew subscription: ' + error.message)
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading parents...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Parent & Child Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage parent accounts and their children
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search by parent name, email, or child name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Parents List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Parents ({pagination.total})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {parents.map((parent) => (
                <div
                  key={parent.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedParent?.id === parent.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleParentSelect(parent)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {parent.first_name} {parent.last_name}
                      </h4>
                      <p className="text-sm text-gray-500">{parent.email}</p>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>Minutes: {parent.minutes_remaining || 0}</p>
                        {parent.created_at && (
                          <p>Joined: {formatToIST(parent.created_at)}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRenewSubscription(parent.id)
                      }}
                      className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-full hover:bg-indigo-200"
                    >
                      Renew
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || pagination.total === 0}
                className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                {pagination.page} of {Math.max(pagination.pages, 1)}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages || pagination.total === 0}
                className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Children Details */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Children {selectedParent ? `for ${selectedParent.first_name}` : ''}
            </h3>
            {selectedParent ? (
              <div className="space-y-3">
                {children.length > 0 ? (
                  children.map((child) => (
                    <div key={child.id} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900">
                        {child.first_name} {child.last_name}
                      </h4>
                      <div className="mt-2 text-sm text-gray-600 space-y-1">
                        <p>Age: {child.age || 'N/A'}</p>
                        <p>Gender: {child.gender || 'N/A'}</p>
                        <p>Focus Area: {child.focus_area || 'N/A'}</p>
                        {child.created_at && (
                          <p className="text-xs text-gray-400">Added: {formatToIST(child.created_at)}</p>
                        )}
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                        <button
                          onClick={() => window.open(`/analytics?child=${child.id}`, '_blank')}
                          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200"
                        >
                          View Analytics
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No children found for this parent.</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Select a parent to view their children.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}