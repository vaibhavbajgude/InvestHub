import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { dealService } from '../services/dealService'
import { setDeals, setLoading } from '../store/slices/dealSlice'
import './Recommendations.css'

export default function Recommendations() {
  const dispatch = useDispatch()
  const { deals, loading } = useSelector(state => state.deals)

  const [userData, setUserData] = useState({
    preferredIndustries: [],
    riskTolerance: 'Medium',
    budgetRange: [0, 10000000],
    targetROI: 15,
  })
  const [showSettings, setShowSettings] = useState(false)

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
    const saved = localStorage.getItem('userPreferences')
    if (saved) {
      setUserData(JSON.parse(saved))
    } else if (deals.length > 0) {
      setUserData(prev => ({
        ...prev,
        preferredIndustries: deals.slice(0, 3).map(d => d.industry),
      }))
    }
  }, [deals])

  const scoredDeals = useMemo(() => {
    if (!deals || deals.length === 0) return []

    return deals.map(deal => {
      let score = 100

      const riskMap = {
        'Low': 30,
        'Medium': 70,
        'High': 40,
      }
      const riskPreferenceScore = riskMap[userData.riskTolerance] || 70
      const riskValues = { 'Low': 20, 'Medium': 50, 'High': 80 }
      const dealRiskValue = riskValues[deal.risk] || 50
      const riskDiff = Math.abs(dealRiskValue - riskPreferenceScore)
      const riskScore = Math.max(0, 30 - (riskDiff / 2))
      score += riskScore

      const industryScore = userData.preferredIndustries.includes(deal.industry) ? 25 : 10
      score += industryScore

      const budgetScore = (
        deal.minInvestment >= userData.budgetRange[0] &&
        deal.minInvestment <= userData.budgetRange[1]
      ) ? 20 : 5
      score += budgetScore

      const roiDiff = Math.abs(deal.roi - userData.targetROI)
      const roiScore = Math.max(0, 25 - roiDiff)
      score += roiScore

      return {
        ...deal,
        recommendationScore: Math.min(100, score),
        scoreBreakdown: {
          risk: riskScore,
          industry: industryScore,
          budget: budgetScore,
          roi: roiScore,
        }
      }
    })
  }, [deals, userData])

  const sortedDeals = useMemo(() => {
    return [...scoredDeals].sort((a, b) => b.recommendationScore - a.recommendationScore)
  }, [scoredDeals])

  const handleSavePreferences = useCallback(() => {
    localStorage.setItem('userPreferences', JSON.stringify(userData))
    setShowSettings(false)
  }, [userData])

  const handleIndustryToggle = (industry) => {
    setUserData(prev => ({
      ...prev,
      preferredIndustries: prev.preferredIndustries.includes(industry)
        ? prev.preferredIndustries.filter(i => i !== industry)
        : [...prev.preferredIndustries, industry]
    }))
  }

  const uniqueIndustries = useMemo(() => {
    return [...new Set(deals.map(d => d.industry))]
  }, [deals])

  const topRecommendations = sortedDeals.slice(0, 5)
  const averageScore = sortedDeals.length > 0
    ? (sortedDeals.reduce((sum, d) => sum + d.recommendationScore, 0) / sortedDeals.length).toFixed(1)
    : 0

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Recommendations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <div className="header-top">
          <h1>Smart Deal Recommendations</h1>
          <button
            className="settings-btn"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️ Preferences
          </button>
        </div>
        <p className="recommendations-subtitle">
          Deals tailored to your investment profile and preferences
        </p>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <h2>Investment Preferences</h2>

          <div className="setting-group">
            <label>Risk Tolerance</label>
            <div className="risk-toggle">
              {['Low', 'Medium', 'High'].map(level => (
                <button
                  key={level}
                  className={`risk-btn ${userData.riskTolerance === level ? 'active' : ''}`}
                  onClick={() => setUserData(prev => ({ ...prev, riskTolerance: level }))}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <label>Target ROI (%)</label>
            <input
              type="range"
              min="5"
              max="100"
              value={userData.targetROI}
              onChange={(e) => setUserData(prev => ({ ...prev, targetROI: parseInt(e.target.value) }))}
              className="range-slider"
            />
            <span className="range-value">{userData.targetROI}%</span>
          </div>

          <div className="setting-group">
            <label>Budget Range (Millions)</label>
            <div className="budget-inputs">
              <input
                type="number"
                value={userData.budgetRange[0] / 1000000}
                onChange={(e) => setUserData(prev => ({
                  ...prev,
                  budgetRange: [parseInt(e.target.value) * 1000000, prev.budgetRange[1]]
                }))}
                placeholder="Min"
                className="input"
              />
              <span>-</span>
              <input
                type="number"
                value={userData.budgetRange[1] / 1000000}
                onChange={(e) => setUserData(prev => ({
                  ...prev,
                  budgetRange: [prev.budgetRange[0], parseInt(e.target.value) * 1000000]
                }))}
                placeholder="Max"
                className="input"
              />
            </div>
          </div>

          <div className="setting-group">
            <label>Preferred Industries</label>
            <div className="industry-grid">
              {uniqueIndustries.map(industry => (
                <button
                  key={industry}
                  className={`industry-btn ${userData.preferredIndustries.includes(industry) ? 'active' : ''}`}
                  onClick={() => handleIndustryToggle(industry)}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          <button className="save-btn" onClick={handleSavePreferences}>
            ✓ Save Preferences
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <span className="stat-label">Recommendations Found</span>
          <span className="stat-value">{sortedDeals.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average Match Score</span>
          <span className="stat-value">{averageScore}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Top Match</span>
          <span className="stat-value">
            {topRecommendations[0]?.recommendationScore.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Top 5 Recommendations */}
      <div className="section">
        <h2>🎯 Top Recommended for You</h2>
        <div className="top-grid">
          {topRecommendations.map((deal, idx) => (
            <Link key={deal.id} to={`/deals/${deal.id}`} className="top-card">
              <div className="rank-badge">#{idx + 1}</div>
              <div className="score-card">
                <div className="score-ring">
                  <div className="score-value-large">
                    {deal.recommendationScore.toFixed(0)}%
                  </div>
                </div>
                <div className="score-details">
                  <h3>{deal.company}</h3>
                  <p>{deal.description.substring(0, 50)}...</p>
                  <div className="score-breakdown">
                    <div className="breakdown-item">
                      <span>Risk</span>
                      <span>{deal.scoreBreakdown.risk.toFixed(0)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Industry</span>
                      <span>{deal.scoreBreakdown.industry.toFixed(0)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Budget</span>
                      <span>{deal.scoreBreakdown.budget.toFixed(0)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>ROI</span>
                      <span>{deal.scoreBreakdown.roi.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* All Recommendations */}
      <div className="section">
        <h2>All Recommendations (Sorted by Match Score)</h2>
        <div className="all-recommendations">
          {sortedDeals.map((deal) => (
            <Link
              key={deal.id}
              to={`/deals/${deal.id}`}
              className="recommendation-item"
            >
              <div className="deal-info">
                <h3>{deal.company}</h3>
                <p>{deal.description.substring(0, 60)}...</p>
                <div className="tags">
                  <span className="tag">{deal.industry}</span>
                  <span className="tag">{deal.risk} Risk</span>
                  <span className="tag">{deal.roi}% ROI</span>
                </div>
              </div>
              <div className="deal-score">
                <div className={`score-indicator ${
                  deal.recommendationScore >= 75 ? 'excellent' :
                  deal.recommendationScore >= 50 ? 'good' :
                  'fair'
                }`}>
                  {deal.recommendationScore.toFixed(0)}%
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="info-box">
        <h3>How are scores calculated?</h3>
        <ul>
          <li><strong>Risk Match (30%):</strong> How well the deal's risk profile matches your tolerance</li>
          <li><strong>Industry Match (25%):</strong> Alignment with your preferred industries</li>
          <li><strong>Budget Compatibility (20%):</strong> Whether the deal fits your investment range</li>
          <li><strong>ROI Attractiveness (25%):</strong> How close the ROI is to your target</li>
        </ul>
      </div>
    </div>
  )
}
