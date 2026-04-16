import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || true // default dark
  })
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path)
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(prev => !prev)

  const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Deal Explorer', path: '/deal-explorer', icon: '🔍' },
    { label: 'Recommendations', path: '/recommendations', icon: '⭐' },
    { label: 'My Investments', path: '/my-investments', icon: '💎' },
    { label: 'Corporate', path: '/dashboard/corporate', icon: '🏢' },
  ]

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">💼</span>
            <span className="logo-text">InvestHub</span>
          </Link>

          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={toggleDarkMode}
              title="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <div className="layout-body">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav className="nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="avatar">👤</div>
              <div className="user-info">
                <p className="user-name">John Investor</p>
                <p className="user-email">john@example.com</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
