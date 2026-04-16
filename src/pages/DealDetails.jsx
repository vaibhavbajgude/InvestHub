import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { dealService } from '../services/dealService'
import {
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import './DealDetails.css'

const RISK_COLOR = { Low: '#22d3ee', Medium: '#f59e0b', High: '#ef4444' }

export default function DealDetails() {
  const { id } = useParams()
  const deals = useSelector(state => state.deals.deals)

  const [deal, setDeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedAccordion, setExpandedAccordion] = useState('highlights')
  const [isInterested, setIsInterested] = useState(false)

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const foundDeal = deals.find(d => d.id === id)
        if (foundDeal) {
          setDeal(foundDeal)
        } else {
          const dealData = await dealService.getDealById(id)
          setDeal(dealData)
        }
        const interests = JSON.parse(localStorage.getItem('interests') || '[]')
        setIsInterested(interests.includes(id))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchDeal()
  }, [id, deals])

  const handleToggleInterest = () => {
    const interests = JSON.parse(localStorage.getItem('interests') || '[]')
    if (isInterested) {
      localStorage.setItem('interests', JSON.stringify(interests.filter(did => did !== id)))
    } else {
      localStorage.setItem('interests', JSON.stringify([...interests, id]))
    }
    setIsInterested(!isInterested)
  }

  if (loading) {
    return (
      <div className="details-container">
        <div className="loading-spinner"><div className="spinner"></div><p>Loading Deal Details...</p></div>
      </div>
    )
  }

  if (error || !deal) {
    return (
      <div className="details-container">
        <div className="error-message">
          <p>Error: {error || 'Deal not found'}</p>
          <Link to="/deal-explorer" className="back-link">← Back to Deals</Link>
        </div>
      </div>
    )
  }

  // Projection chart data using actual deal fields
  const projectionData = Array.from({ length: 10 }, (_, i) => ({
    year: `Y${i + 1}`,
    conservative: Math.round(deal.minInvestment * Math.pow(1 + (deal.roi * 0.7) / 100, i + 1)),
    projected: Math.round(deal.minInvestment * Math.pow(1 + deal.roi / 100, i + 1)),
    optimistic: Math.round(deal.minInvestment * Math.pow(1 + (deal.roi * 1.3) / 100, i + 1)),
  }))

  // Seeded risk breakdown to avoid rerenders from Math.random()
  const riskData = [
    { category: 'Market', value: 45 + (deal.id.charCodeAt(5) % 40) },
    { category: 'Business', value: 30 + (deal.id.charCodeAt(6) % 50) },
    { category: 'Operational', value: 25 + (deal.id.charCodeAt(7) % 45) },
    { category: 'Financial', value: 35 + (deal.id.charCodeAt(8) % 40) },
    { category: 'Regulatory', value: 20 + (deal.id.charCodeAt(9) % 35) },
  ]

  const fundingPercent = Math.min(100, ((deal.raised / deal.targetAmount) * 100).toFixed(1))
  const riskColor = RISK_COLOR[deal.risk] || '#94a3b8'

  return (
    <div className="details-container">
      {/* Header */}
      <div className="details-header">
        <div className="header-top">
          <Link to="/deal-explorer" className="back-link">← Back to Deals</Link>
          <button
            className={`interest-btn ${isInterested ? 'active' : ''}`}
            onClick={handleToggleInterest}
          >
            {isInterested ? '❤️ Remove Interest' : '🤍 Add to Interests'}
          </button>
        </div>

        <div className="header-content">
          <div className="header-left">
            <div className="company-avatar">{deal.company.charAt(0)}</div>
            <div>
              <h1>{deal.company}</h1>
              <p className="deal-description">{deal.description}</p>
              <div className="badges">
                <span className="badge">{deal.industry}</span>
                <span className="badge">{deal.stage}</span>
                <span className={`badge status-badge status-${deal.status?.toLowerCase()}`}>{deal.status}</span>
                <span className="badge risk-badge" style={{ color: riskColor, borderColor: riskColor }}>{deal.risk} Risk</span>
              </div>
            </div>
          </div>

          <div className="header-right">
            <div className="metric-box">
              <span className="label">Min. Investment</span>
              <span className="value">${(deal.minInvestment / 1000).toFixed(0)}K</span>
            </div>
            <div className="metric-box">
              <span className="label">Max Investment</span>
              <span className="value">${(deal.maxInvestment / 1e6).toFixed(1)}M</span>
            </div>
            <div className="metric-box">
              <span className="label">Expected ROI</span>
              <span className="value roi">{deal.roi}%</span>
            </div>
            <div className="metric-box">
              <span className="label">Match Score</span>
              <span className="value">{deal.matchScore}/10</span>
            </div>
          </div>
        </div>

        {/* Funding Progress */}
        <div className="funding-progress">
          <div className="funding-bar">
            <div className="funding-fill" style={{ width: `${fundingPercent}%` }}></div>
          </div>
          <div className="funding-labels">
            <span>Raised: ${(deal.raised / 1e6).toFixed(1)}M</span>
            <span>{fundingPercent}% funded</span>
            <span>Target: ${(deal.targetAmount / 1e6).toFixed(1)}M</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'financial', 'projections', 'risk'].map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'overview' ? '📋 Overview' : tab === 'financial' ? '💹 Financial Metrics' : tab === 'projections' ? '📈 ROI Projections' : '⚠️ Risk Analysis'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="tab-panel">
            <div className="grid">
              <div className="section">
                <h2>Company Information</h2>
                <div className="info-grid">
                  <div className="info-pair"><span className="label">Founded</span><span>{deal.foundedYear}</span></div>
                  <div className="info-pair"><span className="label">Team Size</span><span>{deal.team}+</span></div>
                  <div className="info-pair"><span className="label">Deal Date</span><span>{deal.dealDate}</span></div>
                  <div className="info-pair"><span className="label">Investors</span><span>{deal.investors}</span></div>
                </div>
              </div>
              <div className="section">
                <h2>Key Metrics</h2>
                <div className="info-grid">
                  <div className="info-pair"><span className="label">ARR</span><span>${(deal.arr / 1e6).toFixed(1)}M</span></div>
                  <div className="info-pair"><span className="label">Revenue Growth</span><span>{deal.revenueGrowth}%</span></div>
                  <div className="info-pair"><span className="label">Burn Rate</span><span>${(deal.burnRate / 1000).toFixed(0)}K/mo</span></div>
                  <div className="info-pair"><span className="label">Runway</span><span>{deal.runway} months</span></div>
                </div>
              </div>
            </div>

            <div className="accordion">
              {[
                { key: 'highlights', label: '🏆 Key Highlights', content: [
                  `Strong market position in ${deal.industry} sector`,
                  'Proven business model with consistent growth trajectory',
                  `Team of ${deal.team}+ experienced professionals`,
                  `${deal.revenueGrowth}% revenue growth demonstrating scalability`,
                  `${deal.runway} months cash runway providing operational stability`,
                ] },
                { key: 'risks', label: '⚠️ Risk Factors', content: [
                  `Market: ${deal.risk} competitive pressure in the ${deal.industry} space`,
                  `Churn rate of ${deal.churnRate}% requires monitoring`,
                  'Regulatory changes may impact operating model',
                  'Scaling challenges as team grows beyond current size',
                ] },
              ].map(({ key, label, content }) => (
                <div key={key} className="accordion-item">
                  <button
                    className="accordion-header"
                    onClick={() => setExpandedAccordion(expandedAccordion === key ? null : key)}
                  >
                    <span>{label}</span>
                    <span className="icon">{expandedAccordion === key ? '▼' : '▶'}</span>
                  </button>
                  {expandedAccordion === key && (
                    <div className="accordion-content">
                      <ul>{content.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="tab-panel">
            <div className="financial-grid">
              <div className="financial-card">
                <h3>ARR</h3>
                <p className="value">${(deal.arr / 1e6).toFixed(1)}M</p>
                <p className="change positive">↑ {deal.revenueGrowth}% YoY Growth</p>
              </div>
              <div className="financial-card">
                <h3>Burn Rate</h3>
                <p className="value">${(deal.burnRate / 1000).toFixed(0)}K/mo</p>
                <p className="change">Monthly operational cost</p>
              </div>
              <div className="financial-card">
                <h3>Runway</h3>
                <p className="value">{deal.runway} months</p>
                <p className="change">Cash runway remaining</p>
              </div>
              <div className="financial-card">
                <h3>Churn Rate</h3>
                <p className={`value ${deal.churnRate > 5 ? 'negative' : 'positive'}`}>{deal.churnRate}%</p>
                <p className="change">{deal.churnRate < 3 ? 'Excellent retention' : deal.churnRate < 6 ? 'Good retention' : 'Needs improvement'}</p>
              </div>
              <div className="financial-card">
                <h3>Min. Investment</h3>
                <p className="value">${(deal.minInvestment / 1000).toFixed(0)}K</p>
                <p className="change">Entry threshold</p>
              </div>
              <div className="financial-card">
                <h3>Expected ROI</h3>
                <p className="value roi">{deal.roi}%</p>
                <p className="change positive">Projected annual return</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projections' && (
          <div className="tab-panel">
            <div className="chart-container">
              <h2>10-Year ROI Projections (from ${(deal.minInvestment / 1000).toFixed(0)}K)</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="year" tick={{ fill: '#94a3b8' }} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fill: '#94a3b8' }} />
                  <Tooltip formatter={(value) => [`$${(value / 1000).toFixed(1)}K`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="conservative" stroke="#22d3ee" strokeWidth={2} name="Conservative (70%)" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="projected" stroke="#6366f1" strokeWidth={3} name="Projected (100%)" />
                  <Line type="monotone" dataKey="optimistic" stroke="#f59e0b" strokeWidth={2} name="Optimistic (130%)" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="tab-panel">
            <div className="risk-overview">
              <div className="risk-badge-large" style={{ borderColor: riskColor, color: riskColor }}>
                <span className="risk-label-text">{deal.risk}</span>
                <span>Risk Profile</span>
              </div>
              <div className="risk-stats">
                <div className="risk-stat"><span>Churn Rate</span><strong>{deal.churnRate}%</strong></div>
                <div className="risk-stat"><span>Match Score</span><strong>{deal.matchScore}/10</strong></div>
                <div className="risk-stat"><span>Stage</span><strong>{deal.stage}</strong></div>
              </div>
            </div>
            <div className="chart-container">
              <h2>Risk Factor Analysis</h2>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={riskData}>
                  <PolarGrid stroke="rgba(255,255,255,0.15)" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                  <Radar name="Risk Level" dataKey="value" stroke={riskColor} fill={riskColor} fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Investment CTA */}
      <div className="cta">
        <button className="cta-button" onClick={handleToggleInterest}>
          {isInterested ? '❤️ Remove from Interests' : '💼 Express Investment Interest'}
        </button>
        <Link to="/recommendations" className="cta-button-secondary">
          ⭐ See Similar Deals
        </Link>
      </div>
    </div>
  )
}
