import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { fetchCSRFToken } from './utils/api'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Guidelines from './pages/Guidelines'
import GuidelineDetail from './pages/GuidelineDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NewProject from './pages/NewProject'
import RequestAdmin from './pages/RequestAdmin'
import Admin from './pages/Admin'
import './App.css'

function App() {
  useEffect(() => {
    // Fetch CSRF token on app startup
    fetchCSRFToken().catch(error => {
      console.error('Failed to initialize CSRF token:', error);
    });
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="/guidelines/:slug" element={<GuidelineDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/request-admin" 
                element={
                  <ProtectedRoute>
                    <RequestAdmin />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/projects/new" 
                element={
                  <ProtectedRoute>
                    <NewProject />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireRegulator={true}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
