import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { dealService } from '../services/dealService'
import { setDeals, setLoading, setError } from '../store/slices/dealSlice'
import DealCard from '../components/DealCard'
import './DealExplorer.css'

const ITEMS_PER_PAGE = 12

export default function DealExplorer() {
  const dispatch = useDispatch()
  const { deals, loading, error } = useSelector(state => state.deals)

  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    industry: [],
    risk: [],
    status: [],
    roi: [0, 100],
  })
  const [sortBy, setSortBy] = useState('matchScore')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const debounceTimer = useRef(null)

  useEffect(() => {
    const fetchDeals = async () => {
      if (deals.length > 0) return
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
    fetchDeals()
  }, [dispatch, deals.length])

  // Debounced search
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value
    setSearchInput(value)
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setSearchQuery(value)
      setCurrentPage(1)
    }, 350)
  }, [])

  const handleFilterChange = useCallback((filterName, value) => {
    setSelectedFilters(prev => {
      const currentValues = prev[filterName]
      if (Array.isArray(currentValues) && !Array.isArray(value)) {
        return {
          ...prev,
          [filterName]: currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value]
        }
      }
      return { ...prev, [filterName]: value }
    })
    setCurrentPage(1)
  }, [])

  const uniqueIndustries = useMemo(() => [...new Set(deals.map(deal => deal.industry))].sort(), [deals])
  const uniqueRiskLevels = useMemo(() => ['Low', 'Medium', 'High'], [])
  const uniqueStatuses = useMemo(() => [...new Set(deals.map(deal => deal.status))].sort(), [deals])

  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals.filter(deal => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery ||
        deal.company.toLowerCase().includes(q) ||
        deal.industry.toLowerCase().includes(q) ||
        deal.description.toLowerCase().includes(q)

      const matchesIndustry = selectedFilters.industry.length === 0 ||
        selectedFilters.industry.includes(deal.industry)

      const matchesRisk = selectedFilters.risk.length === 0 ||
        selectedFilters.risk.includes(deal.risk)

      const matchesStatus = selectedFilters.status.length === 0 ||
        selectedFilters.status.includes(deal.status)

      const matchesROI = deal.roi >= selectedFilters.roi[0] && deal.roi <= selectedFilters.roi[1]

      return matchesSearch && matchesIndustry && matchesRisk && matchesStatus && matchesROI
    })

    filtered = [...filtered].sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase() }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [deals, searchQuery, selectedFilters, sortBy, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedDeals.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedDeals = filteredAndSortedDeals.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const resetFilters = useCallback(() => {
    setSelectedFilters({ industry: [], risk: [], status: [], roi: [0, 100] })
    setSearchQuery('')
    setSearchInput('')
    setCurrentPage(1)
  }, [])

  if (loading) {
    return (
      <div className="explorer-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Deals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="explorer-container">
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="explorer-container">
      <div className="explorer-header">
        <h1>Deal Explorer</h1>
        <p className="explorer-subtitle">
          Browse and filter {filteredAndSortedDeals.length} of {deals.length} investment opportunities
        </p>
      </div>

      <div className="explorer-layout">
        {/* Sidebar Filters */}
        <aside className="sidebar">
          <div className="filter-section">
            <h3>🔍 Search</h3>
            <input
              type="text"
              placeholder="Search deals, companies..."
              value={searchInput}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filter-section">
            <h3>🏭 Industry</h3>
            <div className="checkbox-group">
              {uniqueIndustries.map(industry => (
                <label key={industry} className="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedFilters.industry.includes(industry)}
                    onChange={() => handleFilterChange('industry', industry)}
                  />
                  <span>{industry}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>⚠️ Risk Level</h3>
            <div className="checkbox-group">
              {uniqueRiskLevels.map(risk => (
                <label key={risk} className="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedFilters.risk.includes(risk)}
                    onChange={() => handleFilterChange('risk', risk)}
                  />
                  <span>{risk}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>📋 Status</h3>
            <div className="checkbox-group">
              {uniqueStatuses.map(status => (
                <label key={status} className="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedFilters.status.includes(status)}
                    onChange={() => handleFilterChange('status', status)}
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>📈 ROI Range (%)</h3>
            <div className="range-inputs">
              <input
                type="number" min="0" max="100"
                value={selectedFilters.roi[0]}
                onChange={(e) => handleFilterChange('roi', [Number(e.target.value), selectedFilters.roi[1]])}
                placeholder="Min" className="range-input"
              />
              <span>to</span>
              <input
                type="number" min="0" max="100"
                value={selectedFilters.roi[1]}
                onChange={(e) => handleFilterChange('roi', [selectedFilters.roi[0], Number(e.target.value)])}
                placeholder="Max" className="range-input"
              />
            </div>
          </div>

          <button className="reset-btn" onClick={resetFilters}>✕ Reset Filters</button>
        </aside>

        {/* Main Content */}
        <div className="content">
          <div className="controls">
            <div className="sort-controls">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1) }} className="select">
                <option value="company">Company Name</option>
                <option value="roi">ROI</option>
                <option value="minInvestment">Min Investment</option>
                <option value="matchScore">Match Score</option>
                <option value="dealDate">Deal Date</option>
              </select>
              <button className="order-btn" onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>
            <div className="result-count">
              Showing {paginatedDeals.length} of {filteredAndSortedDeals.length} deals
            </div>
          </div>

          {filteredAndSortedDeals.length === 0 ? (
            <div className="empty-state">
              <p>🔍 No deals match your filters</p>
              <button onClick={resetFilters} className="reset-btn">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="deals-grid">
                {paginatedDeals.map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>

              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>

                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2
                    if (pageNum <= totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                        >
                          {pageNum}
                        </button>
                      )
                    }
                    return null
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
