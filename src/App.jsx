import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store/store'

// Layout
import Layout from './components/Layout/Layout'

// Pages
import InvestorDashboard from './pages/InvestorDashboard'
import DealExplorer from './pages/DealExplorer'
import DealDetails from './pages/DealDetails'
import Recommendations from './pages/Recommendations'
import MyInvestments from './pages/MyInvestments'
import CorporateDashboard from './pages/CorporateDashboard'

import './App.css'

function App() {
  return (
    <Provider store={store}>
      <Router future={{ v7_relativeSplatPath: true }}>
        <Layout>
          <Routes>
            <Route path="/" element={<InvestorDashboard />} />
            <Route path="/dashboard/investor" element={<InvestorDashboard />} />
            <Route path="/deal-explorer" element={<DealExplorer />} />
            <Route path="/deals/:id" element={<DealDetails />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/my-investments" element={<MyInvestments />} />
            <Route path="/dashboard/corporate" element={<CorporateDashboard />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  )
}

export default App
