import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { sidebarOpen } = useSelector(state => state.ui);
  const location = useLocation();
  const pathname = location.pathname;

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard/investor', icon: '📊' },
    { label: 'Deal Explorer', href: '/deal-explorer', icon: '🔍' },
    { label: 'My Investments', href: '/my-investments', icon: '💼' },
    { label: 'Recommendations', href: '/recommendations', icon: '⭐' },
    { label: 'Corporate', href: '/dashboard/corporate', icon: '🏢' },
  ];

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: '4rem',
      height: 'calc(100vh - 4rem)',
      width: sidebarOpen ? '256px' : '0',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      overflowY: 'auto',
      transition: 'width 0.3s ease',
      zIndex: 99,
      overflow: 'hidden'
    }}>
      <nav style={{ padding: '1rem 0', width: '256px' }}>
        {menuItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} to={item.href} style={{
              display: 'block',
              padding: '1rem 1.5rem',
              color: isActive ? 'var(--accent-color)' : 'var(--text-primary)',
              textDecoration: 'none',
              borderLeft: isActive ? '4px solid var(--accent-color)' : '4px solid transparent',
              transition: 'all 0.2s ease',
              fontWeight: isActive ? 600 : 400,
              backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            }}>
              <span style={{ marginRight: '1rem', fontSize: '1.2rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
