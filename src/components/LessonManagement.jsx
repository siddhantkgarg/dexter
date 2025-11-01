import { useState, useEffect } from 'react'
import { getSubjects, getChapters, createLesson } from '../services/api'

export default function LessonManagement() {
  const [subjects, setSubjects] = useState([])
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    topic: '',
    description: '',
    prompt: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [subjectsData, chaptersData] = await Promise.all([
        getSubjects(),
        getChapters()
      ])
      setSubjects(subjectsData.subjects || [])
      setChapters(chaptersData.chapters || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setError('Failed to load subjects and chapters')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      await createLesson(formData)
      setSuccess('Lesson created successfully!')
      setFormData({
        title: '',
        subject: '',
        topic: '',
        description: '',
        prompt: ''
      })
    } catch (error) {
      console.error('Failed to create lesson:', error)
      setError(error.response?.data?.detail || 'Failed to create lesson')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Lesson Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create new lessons for the platform
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter lesson title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Topic</label>
                <input
                  type="text"
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter topic/chapter name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Brief description of what the lesson should cover"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Custom Prompt (Optional)</label>
              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                rows={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Leave empty for AI-generated content"
              />
              <p className="mt-1 text-xs text-gray-500">
                If left empty, AI will generate comprehensive lesson content based on the title, subject, topic, and description.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Lesson'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}