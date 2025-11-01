import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import ParentManagement from './components/ParentManagement'
import Analytics from './components/Analytics'
import ContentManagement from './components/ContentManagement'
import LessonManagement from './components/LessonManagement'
import Prompts from './components/Prompts'
import Status from './components/Status'
import Releases from './components/Releases'
import SharedConversation from './components/SharedConversation'
import Layout from './components/Layout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <Router>
      <Routes>
        <Route path="/shared/:shareToken" element={<SharedConversation />} />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Layout setIsAuthenticated={setIsAuthenticated} /> : 
            <Navigate to="/login" replace />
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="parents" element={<ParentManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="lessons" element={<LessonManagement />} />
          <Route path="prompts" element={<Prompts />} />
          <Route path="status" element={<Status />} />
          <Route path="releases" element={<Releases />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App