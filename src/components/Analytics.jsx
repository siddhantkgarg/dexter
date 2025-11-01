import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { getAnalytics } from '../services/api'
import { formatToIST, formatDateIST, formatTimeIST } from '../utils/dateUtils'

export default function Analytics() {
  const [searchParams] = useSearchParams()
  const childIdFromUrl = searchParams.get('child')
  
  const [analytics, setAnalytics] = useState({
    dailyUsage: [],
    hourlyUsage: [],
    avgConversationTime: 0,
    recentConversations: [],
    pagination: { total: 0, page: 1, totalPages: 1 }
  })
  const [loading, setLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState(childIdFromUrl || 'all')
  const [childName, setChildName] = useState('')
  const [currentAudio, setCurrentAudio] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTranscript, setShowTranscript] = useState(null)
  const [transcript, setTranscript] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [shareUrl, setShareUrl] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    setCurrentPage(1) // Reset to page 1 when child changes
  }, [selectedChild])

  useEffect(() => {
    fetchAnalytics()
  }, [selectedChild, currentPage])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const data = await getAnalytics(selectedChild, currentPage, itemsPerPage)
      setAnalytics(data)
      if (selectedChild !== 'all' && data.childName) {
        setChildName(data.childName)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const playAudio = async (childId, conversationId, childName) => {
    const apiUrl = `https://dexter-api.omli.in/api/admin/conversations/${conversationId}/audio`
    
    try {
      // Get audio URL from API
      const token = localStorage.getItem('adminToken')
      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      const audioUrl = data.audio_url
      
      // Stop current audio if playing
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause()
      }
      
      setCurrentAudio({ childId, conversationId, childName, url: audioUrl })
      setIsPlaying(false)
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.load()
        
        await new Promise(resolve => setTimeout(resolve, 100))
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Audio play failed:', error)
      alert('Failed to load audio. Please try again.')
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setCurrentAudio(null)
    }
  }

  const viewTranscript = async (childId, conversationId, childName) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`https://dexter-api.omli.in/api/admin/conversations/${conversationId}/transcript`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      console.log('Transcript data:', data)
      setTranscript(data)
      setShowTranscript({ childId, conversationId, childName })
    } catch (error) {
      console.error('Failed to fetch transcript:', error)
      alert('Failed to load transcript. Please try again.')
    }
  }

  const shareConversation = async (conversationId, childName) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`https://dexter-api.omli.in/api/admin/conversations/${conversationId}/share`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setShareUrl(data.shareUrl)
      setShowShareModal(true)
    } catch (error) {
      console.error('Failed to create share link:', error)
      alert('Failed to create share link. Please try again.')
    }
  }

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    alert('Share link copied to clipboard!')
  }

  if (loading) {
    return <div className="animate-pulse">Loading analytics...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics Dashboard {childName && `- ${childName}`}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {selectedChild === 'all' ? 'Overall conversation analytics and usage patterns' : `Individual analytics for ${childName}`}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Children</option>
          {/* Add child options dynamically */}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Avg Conversation Time</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {Math.round(analytics.avgConversationTime || 0)} min
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Conversations</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {analytics.recentConversations?.length || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Peak Usage Hour (IST)</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {analytics.hourlyUsage?.length > 0 
              ? analytics.hourlyUsage.reduce((max, hour) => 
                  hour.duration > max.duration ? hour : max
                ).hour + ':00 IST'
              : 'N/A'
            }
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Usage Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Conversation Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyUsage || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => formatDateIST(value)}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => `Date: ${formatDateIST(value)}`}
                formatter={(value) => [`${value} min`, 'Duration']}
              />
              <Line 
                type="monotone" 
                dataKey="totalMinutes" 
                stroke="#4f46e5" 
                strokeWidth={2}
                name="Minutes"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Usage Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hourly Usage Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.hourlyUsage || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(value) => `${value}:00`}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => `Hour: ${value}:00 IST`}
                formatter={(value) => [`${value} min`, 'Duration']}
              />
              <Bar dataKey="duration" fill="#10b981" name="Duration (min)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Conversations
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Child
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.recentConversations?.length > 0 ? (
                  analytics.recentConversations.map((conv, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {conv.childName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatToIST(conv.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {conv.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {conv.topics}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => playAudio(conv.childId, conv.conversationId, conv.childName)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ▶️ Play
                          </button>
                          <button
                            onClick={() => viewTranscript(conv.childId, conv.conversationId, conv.childName)}
                            className="text-green-600 hover:text-green-800"
                          >
                            💬 Transcript
                          </button>
                          <button
                            onClick={() => shareConversation(conv.conversationId, conv.childName)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            🔗 Share
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No recent conversations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {analytics.pagination?.total > itemsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, analytics.pagination.total)} of{' '}
                {analytics.pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {analytics.pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, analytics.pagination.totalPages))}
                  disabled={currentPage >= analytics.pagination.totalPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audio Player */}
      {currentAudio && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border">
          <div className="flex items-center space-x-3">
            <div className="text-sm font-medium text-gray-900">
              Playing: {currentAudio.childName}
            </div>
            <button
              onClick={togglePlayPause}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button
              onClick={stopAudio}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              ⏹️ Stop
            </button>
          </div>
          <audio
            ref={audioRef}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => { setIsPlaying(false); setCurrentAudio(null); }}
            onError={(e) => console.error('Audio error:', e)}
            onLoadStart={() => console.log('Audio loading started')}
            onCanPlay={() => console.log('Audio can play')}
            className="w-full mt-2"
            controls

          />
        </div>
      )}

      {/* Transcript Modal */}
      {showTranscript && transcript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Conversation Transcript - {showTranscript.childName}
              </h3>
              <button
                onClick={() => { setShowTranscript(null); setTranscript(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {Array.isArray(transcript) ? (
                  transcript.map((msg, index) => (
                    <div key={index} className={`flex ${msg.user_type === 'USER' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.user_type === 'USER' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        <div className="text-sm font-medium mb-1">
                          {msg.user_type === 'USER' ? showTranscript.childName : 'Doro'}
                        </div>
                        <div className="text-sm">{msg.text}</div>
                        {msg.timestamp && (
                          <div className="text-xs opacity-75 mt-1">
                            {formatTimeIST(msg.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">
                    <p>No transcript data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Share Conversation</h3>
              <button
                onClick={() => { setShowShareModal(false); setShareUrl(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Share this conversation with others. The link will expire in 24 hours.
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <button
                  onClick={copyShareUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}