'use client';

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../Header';
import Sidebar from '../Sidebar';

export default function LayoutWrapper({ children }) {
  const { theme, sidebarOpen } = useSelector((state) => state.ui);

  useEffect(() => {
    // Apply theme to the root element
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out p-6 md:p-8 ${
            sidebarOpen ? 'md:ml-64' : 'ml-0'
          }`}
          style={{
             minHeight: 'calc(100vh - 64px)',
             backgroundColor: 'var(--bg-primary)'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
