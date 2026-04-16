import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, title = 'InvestHub' }) => {
  const { theme } = useSelector(state => state.ui);
  const dispatch = useDispatch();

  useEffect(() => {
    // Apply theme
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          
          <main style={{
            flex: 1,
            marginLeft: useSelector(state => state.ui.sidebarOpen) ? '250px' : '0',
            transition: 'margin-left 0.3s ease',
            padding: '2rem',
            backgroundColor: 'var(--bg-primary)',
            overflowY: 'auto',
          }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
