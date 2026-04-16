import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toggleTheme, toggleSidebar } from '../store/slices/uiSlice';

export const Header = () => {
  const dispatch = useDispatch();
  const { theme, sidebarOpen } = useSelector(state => state.ui);

  return (
    <header style={{ 
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '4rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => dispatch(toggleSidebar())}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            padding: '0.5rem',
            color: 'var(--text-primary)',
          }}
        >
          ☰
        </button>
        <Link to="/dashboard/investor" style={{ textDecoration: 'none' }}>
          <h1 style={{ 
            color: 'var(--accent-color)',
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}>
            💰 InvestHub
          </h1>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button
          onClick={() => dispatch(toggleTheme())}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0.5rem',
            color: 'var(--text-primary)',
          }}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <div style={{
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-color), var(--secondary-color))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          cursor: 'pointer',
        }}>
          RM
        </div>
      </div>
    </header>
  );
};

export default Header;
