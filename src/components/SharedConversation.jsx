import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function SharedConversation() {
  const { shareToken } = useParams()
  const [conversation, setConversation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSharedConversation()
  }, [shareToken])

  const fetchSharedConversation = async () => {
    try {
      const response = await fetch(`https://dexter-api.omli.in/api/admin/shared/${shareToken}`)
      if (!response.ok) {
        throw new Error('Share link expired or not found')
      }
      const data = await response.json()
      setConversation(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse">Loading shared conversation...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Shared Conversation</h1>
            <p className="text-sm text-gray-500 mt-1">
              Shared on {new Date(conversation.sharedAt).toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-4">
            {Array.isArray(conversation.transcript) ? (
              conversation.transcript.map((msg, index) => (
                <div key={index} className={`flex ${msg.user_type === 'USER' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.user_type === 'USER' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-900'
                  }`}>
                    <div className="text-sm font-medium mb-1">
                      {msg.user_type === 'USER' ? 'Child' : 'Doro'}
                    </div>
                    <div className="text-sm">{msg.text}</div>
                    {msg.timestamp && (
                      <div className="text-xs opacity-75 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                <p>No conversation data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}