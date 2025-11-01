import { useState, useEffect } from 'react'
import { getSystemStatus } from '../services/api'

export default function Status() {
  const [status, setStatus] = useState({
    overall: 'operational',
    services: [],
    incidents: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const data = await getSystemStatus()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch status:', error)
      setStatus(prev => ({ ...prev, overall: 'degraded' }))
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500'
      case 'outage': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'operational': return 'All Systems Operational'
      case 'degraded': return 'Degraded Performance'
      case 'outage': return 'Service Outage'
      default: return 'Unknown Status'
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading system status...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
        <p className="mt-1 text-sm text-gray-600">
          Current system health and past incidents
        </p>
      </div>

      {/* Overall Status */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded-full ${getStatusColor(status.overall)} mr-3`}></div>
          <h2 className="text-xl font-semibold text-gray-900">{getStatusText(status.overall)}</h2>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Services Status */}
      <div className="mb-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Services</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {status.services.map((service, index) => (
            <div key={index} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)} mr-3`}></div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                  <p className="text-xs text-gray-500">{service.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-900 capitalize">{service.status}</span>
                {service.responseTime && (
                  <p className="text-xs text-gray-500">{service.responseTime}ms</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Incidents */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Past Incidents</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {status.incidents.length > 0 ? (
            status.incidents.map((incident, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-start">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(incident.severity)} mr-3 mt-1`}></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{incident.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>{new Date(incident.startTime).toLocaleString()}</span>
                      {incident.endTime && (
                        <>
                          <span className="mx-2">→</span>
                          <span>{new Date(incident.endTime).toLocaleString()}</span>
                        </>
                      )}
                      <span className="ml-4 capitalize">{incident.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>No incidents in the past 30 days</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}