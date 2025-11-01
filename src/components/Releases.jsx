import { useState, useEffect } from 'react'
import { getReleases } from '../services/api'

export default function Releases() {
  const [releases, setReleases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReleases()
  }, [])

  const fetchReleases = async () => {
    try {
      const data = await getReleases()
      setReleases(data.releases || [])
    } catch (error) {
      console.error('Failed to fetch releases:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatBody = (body) => {
    if (!body) return ''
    
    // Convert markdown-style formatting to HTML
    return body
      .replace(/### (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/## (.*)/g, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/- (.*)/g, '<li class="ml-4">• $1</li>')
      .replace(/\n/g, '<br>')
  }

  if (loading) {
    return <div className="animate-pulse">Loading releases...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Release Notes</h1>
        <p className="mt-1 text-sm text-gray-600">
          Latest updates and changes to the Omli platform
        </p>
      </div>

      <div className="space-y-6">
        {releases.length > 0 ? (
          releases.map((release) => (
            <div key={release.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {release.name || release.tag_name}
                  </h2>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-3">
                      {release.tag_name}
                    </span>
                    <span>{formatDate(release.published_at)}</span>
                    {release.prerelease && (
                      <span className="ml-3 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                        Pre-release
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={release.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View on GitHub →
                </a>
              </div>
              
              {release.body && (
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: formatBody(release.body) }}
                />
              )}
              
              {release.assets && release.assets.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Downloads:</h4>
                  <div className="flex flex-wrap gap-2">
                    {release.assets.map((asset) => (
                      <a
                        key={asset.id}
                        href={asset.browser_download_url}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        {asset.name} ({(asset.size / 1024 / 1024).toFixed(1)} MB)
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>No releases found</p>
          </div>
        )}
      </div>
    </div>
  )
}