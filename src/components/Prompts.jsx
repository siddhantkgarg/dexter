import { useState, useEffect } from 'react'
import { getPrompts, updatePrompt } from '../services/api'

export default function Prompts() {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    try {
      const data = await getPrompts()
      setPrompts(data.prompts || [])
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt.key)
    setEditContent(prompt.content)
  }

  const handleSave = async () => {
    try {
      await updatePrompt(editingPrompt, editContent)
      await fetchPrompts()
      setEditingPrompt(null)
      setEditContent('')
    } catch (error) {
      console.error('Failed to update prompt:', error)
      alert('Failed to update prompt')
    }
  }

  const handleCancel = () => {
    setEditingPrompt(null)
    setEditContent('')
  }

  if (loading) {
    return <div className="animate-pulse">Loading prompts...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Prompt Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and edit system prompts stored in S3
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {prompts.map((prompt) => (
              <div key={prompt.key} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{prompt.key}</h3>
                    <p className="text-sm text-gray-500">Last modified: {prompt.lastModified}</p>
                  </div>
                  <button
                    onClick={() => handleEdit(prompt)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
                
                {editingPrompt === prompt.key ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm"
                      placeholder="Enter prompt content..."
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded border">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {prompt.content.length > 500 
                        ? prompt.content.substring(0, 500) + '...' 
                        : prompt.content
                      }
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}