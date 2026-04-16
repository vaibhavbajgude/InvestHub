import React, { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { dealService } from '../services/dealService'
import { setDeals, setLoading } from '../store/slices/dealSlice'
import { corporateFundingData } from '../data/investors'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import './CorporateDashboard.css'

const STATUS_COLORS = { Active: '#22d3ee', Pending: '#f59e0b', Closed: '#ef4444' }

export default function CorporateDashboard() {
  const dispatch = useDispatch()
  const { deals, loading } = useSelector(state => state.deals)

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

  const metrics = useMemo(() => {
    if (!deals || deals.length === 0) {
      return { totalFunded: '0', totalInvestors: 0, avgDealSize: '0', conversionRate: '0', activeDeals: 0 }
    }
    const totalFunded = deals.reduce((sum, deal) => sum + deal.raised, 0)
    const uniqueInvestorCount = deals.reduce((sum, deal) => sum + deal.investors, 0)
    const avgDealSize = totalFunded / deals.length
    const activeDealCount = deals.filter(d => d.status === 'Active').length
    const conversionRate = ((activeDealCount / deals.length) * 100).toFixed(1)
    return {
      totalFunded: (totalFunded / 1e6).toFixed(1),
      totalInvestors: uniqueInvestorCount,
      avgDealSize: (avgDealSize / 1000).toFixed(0),
      conversionRate,
      activeDeals: activeDealCount,
    }
  }, [deals])

  const industryData = useMemo(() => {
    const map = {}
    deals.forEach(deal => {
      map[deal.industry] = (map[deal.industry] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [deals])

  const statusData = useMemo(() => [
    { name: 'Active', value: deals.filter(d => d.status === 'Active').length },
    { name: 'Pending', value: deals.filter(d => d.status === 'Pending').length },
    { name: 'Closed', value: deals.filter(d => d.status === 'Closed').length },
  ], [deals])

  if (loading) {
    return (
      <div className="corp-container">
        <div className="loading-spinner"><div className="spinner"></div><p>Loading Corporate Dashboard...</p></div>
      </div>
    )
  }

  return (
    <div className="corp-container">
      <div className="corp-header">
        <h1>Corporate Dashboard</h1>
        <p className="corp-subtitle">Platform-wide funding analytics and deal intelligence</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <h3>Total Funding Raised</h3>
          <p className="metric-value">${metrics.totalFunded}M</p>
          <p className="metric-change positive">↑ 15% from last quarter</p>
        </div>
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <h3>Total Investor Participation</h3>
          <p className="metric-value">{metrics.totalInvestors}</p>
          <p className="metric-change positive">↑ 8 new this month</p>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <h3>Avg. Funding per Deal</h3>
          <p className="metric-value">${metrics.avgDealSize}K</p>
          <p className="metric-change">Across {deals.length} deals</p>
        </div>
        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <h3>Conversion Rate</h3>
          <p className="metric-value">{metrics.conversionRate}%</p>
          <p className="metric-change positive">↑ 2% improvement</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h2>Monthly Funding Trend (12 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={corporateFundingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
              <YAxis yAxisId="left" tickFormatter={v => `$${(v / 1e6).toFixed(0)}M`} tick={{ fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8' }} />
              <Tooltip formatter={(value, name) => name === 'funding' ? [`$${(value / 1e6).toFixed(1)}M`, 'Funding'] : [value, 'Investors']} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="funding" name="Funding" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="investors" name="Investors" stroke="#22d3ee" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Deal Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-card-full">
          <h2>Deals by Industry</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={industryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" tick={{ fill: '#94a3b8' }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8' }} width={100} />
              <Tooltip />
              <Bar dataKey="value" name="Deals" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Deals Table */}
      <div className="recent-deals">
        <div className="table-header">
          <h2>Recent Deals Overview</h2>
          <Link to="/deal-explorer" className="view-all-link">View All →</Link>
        </div>
        <div className="table-scroll">
          <table className="deals-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Industry</th>
                <th>Stage</th>
                <th>Raised</th>
                <th>Target</th>
                <th>Status</th>
                <th>ROI</th>
              </tr>
            </thead>
            <tbody>
              {deals.slice(0, 15).map(deal => (
                <tr key={deal.id}>
                  <td className="company-name">
                    <Link to={`/deals/${deal.id}`}>{deal.company}</Link>
                  </td>
                  <td>{deal.industry}</td>
                  <td>{deal.stage}</td>
                  <td>${(deal.raised / 1e6).toFixed(1)}M</td>
                  <td>${(deal.targetAmount / 1e6).toFixed(1)}M</td>
                  <td>
                    <span className={`status-badge status-${deal.status?.toLowerCase()}`}>{deal.status}</span>
                  </td>
                  <td className="roi">{deal.roi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
