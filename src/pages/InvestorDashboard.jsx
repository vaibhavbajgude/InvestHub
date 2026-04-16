import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { dealService } from '../services/dealService'
import { setDeals, setLoading, setError } from '../store/slices/dealSlice'
import { investmentGrowthData } from '../data/investors'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import './InvestorDashboard.css'

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ef4444', '#10b981', '#a78bfa', '#f97316', '#06b6d4', '#84cc16', '#ec4899']

export default function InvestorDashboard() {
  const dispatch = useDispatch()
  const { deals, loading, error } = useSelector(state => state.deals)
  const [industryData, setIndustryData] = useState([])
  const [riskData, setRiskData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true))
      try {
        const result = await dealService.getAllDeals()
        dispatch(setDeals(result.data))
      } catch (err) {
        dispatch(setError(err.message))
      } finally {
        dispatch(setLoading(false))
      }
    }
    fetchData()
  }, [dispatch])

  const metrics = useMemo(() => {
    if (!deals || deals.length === 0) {
      return { totalInvestment: '0', activeDeals: 0, averageROI: '0', riskDistribution: {} }
    }
    const totalInvestment = deals.reduce((sum, deal) => sum + deal.minInvestment, 0)
    const activeDeals = deals.filter(deal => deal.status === 'Active').length
    const averageROI = (deals.reduce((sum, deal) => sum + deal.roi, 0) / deals.length).toFixed(1)
    const riskDistribution = deals.reduce((acc, deal) => {
      acc[deal.risk] = (acc[deal.risk] || 0) + 1
      return acc
    }, {})
    return {
      totalInvestment: (totalInvestment / 1e6).toFixed(1) + 'M',
      activeDeals,
      averageROI,
      riskDistribution,
    }
  }, [deals])

  useEffect(() => {
    if (!deals || deals.length === 0) return
    const industries = {}
    deals.forEach(deal => {
      industries[deal.industry] = (industries[deal.industry] || 0) + 1
    })
    setIndustryData(Object.entries(industries).map(([name, value]) => ({ name, value })))
  }, [deals])

  useEffect(() => {
    if (!deals || deals.length === 0) return
    const riskRoiData = deals.slice(0, 10).map(deal => ({
      name: deal.company.split(' ')[0], // short name for axis readability
      roi: deal.roi,
      matchScore: deal.matchScore,
    }))
    setRiskData(riskRoiData)
  }, [deals])

  const riskPieData = useMemo(() => [
    { name: 'Low Risk', value: metrics.riskDistribution?.Low || 0 },
    { name: 'Medium Risk', value: metrics.riskDistribution?.Medium || 0 },
    { name: 'High Risk', value: metrics.riskDistribution?.High || 0 },
  ], [metrics.riskDistribution])

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Investor Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here&apos;s your investment portfolio overview</p>
      </div>

      {/* Summary Cards */}
      <div className="cards-grid">
        <div className="card card-blue">
          <div className="card-content">
            <h3>Total Deal Value</h3>
            <p className="card-value">${metrics.totalInvestment}</p>
            <span className="card-subtext">Across {deals.length} deals</span>
          </div>
          <div className="card-icon">💼</div>
        </div>
        <div className="card card-green">
          <div className="card-content">
            <h3>Active Deals</h3>
            <p className="card-value">{metrics.activeDeals}</p>
            <span className="card-subtext">Active right now</span>
          </div>
          <div className="card-icon">📈</div>
        </div>
        <div className="card card-purple">
          <div className="card-content">
            <h3>Average ROI</h3>
            <p className="card-value">{metrics.averageROI}%</p>
            <span className="card-subtext">Portfolio average</span>
          </div>
          <div className="card-icon">🎯</div>
        </div>
        <div className="card card-orange">
          <div className="card-content">
            <h3>Risk Distribution</h3>
            <p className="card-value">
              L:{metrics.riskDistribution?.Low || 0} M:{metrics.riskDistribution?.Medium || 0} H:{metrics.riskDistribution?.High || 0}
            </p>
            <span className="card-subtext">Low / Med / High deals</span>
          </div>
          <div className="card-icon">⚖️</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h2>Investment Growth (12 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={investmentGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
              <YAxis tickFormatter={v => `$${(v / 1e6).toFixed(0)}M`} tick={{ fill: '#94a3b8' }} />
              <Tooltip formatter={(value) => [`$${(value / 1e6).toFixed(1)}M`, 'Portfolio Value']} />
              <Legend />
              <Line type="monotone" dataKey="value" name="Portfolio Value" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Industry Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={industryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {industryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={riskPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                <Cell fill="#22d3ee" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-card-full">
          <h2>ROI vs Match Score (Top 10 Deals)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
              <YAxis tick={{ fill: '#94a3b8' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="roi" fill="#22d3ee" name="ROI (%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="matchScore" fill="#6366f1" name="Match Score" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        <Link to="/deal-explorer" className="quick-link">🔍 Explore Deals</Link>
        <Link to="/my-investments" className="quick-link">💎 My Investments</Link>
        <Link to="/recommendations" className="quick-link">⭐ Get Recommendations</Link>
        <Link to="/dashboard/corporate" className="quick-link">🏢 Corporate View</Link>
      </div>
    </div>
  )
}
