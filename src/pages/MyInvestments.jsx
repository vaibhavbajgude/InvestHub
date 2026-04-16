import React, { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { dealService } from '../services/dealService'
import { setDeals, setLoading } from '../store/slices/dealSlice'
import DealCard from '../components/DealCard'
import './MyInvestments.css'

export default function MyInvestments() {
  const dispatch = useDispatch()
  const deals = useSelector(state => state.deals.deals)
  const [interests, setInterests] = React.useState([])
  const [activeTab, setActiveTab] = React.useState('all')

  useEffect(() => {
    const fetchDeals = async () => {
      if (deals.length > 0) return
      dispatch(setLoading(true))
      try {
        const result = await dealService.getAllDeals()
        dispatch(setDeals(result.data))
      } finally {
        dispatch(setLoading(false))
      }
    }
    fetchDeals()
  }, [dispatch, deals.length])

  useEffect(() => {
    const saved = localStorage.getItem('interests')
    if (saved) setInterests(JSON.parse(saved))
  }, [])

  const interestedDeals = useMemo(() => deals.filter(deal => interests.includes(deal.id)), [deals, interests])
  const activeInvestments = useMemo(() => interestedDeals.filter(deal => deal.status === 'Active'), [interestedDeals])

  const totalValue = useMemo(() =>
    activeInvestments.reduce((sum, deal) => sum + deal.minInvestment, 0), [activeInvestments])

  const averageROI = useMemo(() => {
    if (activeInvestments.length === 0) return 0
    return (activeInvestments.reduce((sum, deal) => sum + deal.roi, 0) / activeInvestments.length).toFixed(1)
  }, [activeInvestments])

  const removeInterest = (dealId) => {
    const updated = interests.filter(id => id !== dealId)
    setInterests(updated)
    localStorage.setItem('interests', JSON.stringify(updated))
  }

  return (
    <div className="investments-container">
      <div className="investments-header">
        <h1>My Investments &amp; Interests</h1>
        <p className="investments-subtitle">Track your investment portfolio and watched deals</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Value (Active)</h3>
          <p className="stat-value">${(totalValue / 1000).toFixed(0)}K</p>
          <p className="stat-desc">{activeInvestments.length} active deals</p>
        </div>
        <div className="stat-card">
          <h3>Interested Deals</h3>
          <p className="stat-value">{interestedDeals.length}</p>
          <p className="stat-desc">Watching closely</p>
        </div>
        <div className="stat-card">
          <h3>Average ROI</h3>
          <p className="stat-value">{averageROI}%</p>
          <p className="stat-desc">Active portfolio avg</p>
        </div>
        <div className="stat-card">
          <h3>Projected Returns</h3>
          <p className="stat-value">
            ${activeInvestments.length > 0
              ? (activeInvestments.reduce((s, d) => s + (d.minInvestment * d.roi / 100), 0) / 1000).toFixed(0)
              : 0}K
          </p>
          <p className="stat-desc">Based on current ROI</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All Interests ({interestedDeals.length})
        </button>
        <button className={`tab ${activeTab === 'invested' ? 'active' : ''}`} onClick={() => setActiveTab('invested')}>
          Active Investments ({activeInvestments.length})
        </button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {activeTab === 'all' && (
          <>
            {interestedDeals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔖</div>
                <p>No deals saved yet</p>
                <p className="empty-sub">Browse deals and click ❤️ to add to your interests</p>
                <Link to="/deal-explorer" className="empty-state-link">Browse Deals →</Link>
              </div>
            ) : (
              <div className="deals-grid">
                {interestedDeals.map(deal => (
                  <div key={deal.id} className="deal-wrapper">
                    <DealCard deal={deal} />
                    <button className="remove-btn" onClick={() => removeInterest(deal.id)}>✕ Remove</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'invested' && (
          <>
            {activeInvestments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💼</div>
                <p>No active investments yet</p>
                <p className="empty-sub">Mark Active deals as interested to track them here</p>
                <Link to="/recommendations" className="empty-state-link">Get Recommendations →</Link>
              </div>
            ) : (
              <div className="investments-list">
                {activeInvestments.map(deal => (
                  <div key={deal.id} className="investment-item">
                    <div className="investment-info">
                      <h3>{deal.company}</h3>
                      <p className="investment-description">{deal.description.substring(0, 100)}...</p>
                      <div className="investment-tags">
                        <span className="tag">{deal.industry}</span>
                        <span className="tag">{deal.stage}</span>
                        <span className="tag risk-tag">{deal.risk} Risk</span>
                      </div>
                    </div>
                    <div className="investment-metrics">
                      <div className="metric">
                        <span>Min. Investment</span>
                        <strong>${(deal.minInvestment / 1000).toFixed(0)}K</strong>
                      </div>
                      <div className="metric">
                        <span>Expected ROI</span>
                        <strong className="roi">{deal.roi}%</strong>
                      </div>
                      <div className="metric">
                        <span>Projected Return</span>
                        <strong>${((deal.minInvestment * deal.roi) / 100 / 1000).toFixed(0)}K</strong>
                      </div>
                    </div>
                    <div className="investment-actions">
                      <Link to={`/deals/${deal.id}`} className="view-btn">View Details →</Link>
                      <button className="remove-btn" onClick={() => removeInterest(deal.id)}>✕ Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
