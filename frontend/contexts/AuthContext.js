import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true })
      setIsLoggedIn(true)
      setUsername(response.data.username)
    } catch (error) {
      setIsLoggedIn(false)
      setUsername('')
    } finally {
      setLoading(false)
    }
  }

  const login = async (loginUsername) => {
    setIsLoggedIn(true)
    setUsername(loginUsername)
  }

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggedIn(false)
      setUsername('')
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const value = {
    isLoggedIn,
    username,
    loading,
    checkAuthStatus,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 