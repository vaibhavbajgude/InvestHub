'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { dealService } from '@/services';
import { setDeals, setLoading, setError } from '@/store/slices/dealSlice';
import DealCard from '@/components/DealCard';
import styles from './DealExplorer.module.css';

const ITEMS_PER_PAGE = 12;

export default function DealExplorer() {
  const dispatch = useDispatch();
  const { deals, loading, error } = useSelector(state => state.deals);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    industry: [],
    risk: [],
    roi: [0, 100],
    investmentRange: [0, 10000000],
    status: [],
  });
  const [sortBy, setSortBy] = useState('company');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch deals on mount
  useEffect(() => {
    const fetchDeals = async () => {
      if (deals.length > 0) return; // Avoid refetching
      dispatch(setLoading(true));
      try {
        const result = await dealService.getAllDeals();
        dispatch(setDeals(result.data));
      } catch (err) {
        dispatch(setError(err.message));
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchDeals();
  }, [dispatch, deals.length]);

  // Debounced search handler
  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  // Filter handler
  const handleFilterChange = useCallback((filterName, value, isCheckbox = false) => {
    setSelectedFilters(prev => {
      if (isCheckbox) {
        const currentValues = prev[filterName] || [];
        return {
          ...prev,
          [filterName]: currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value]
        };
      }
      return { ...prev, [filterName]: value };
    });
    setCurrentPage(1);
  }, []);

  // Get unique values for filters
  const uniqueIndustries = useMemo(() => {
    return [...new Set(deals.map(deal => deal.industry))];
  }, [deals]);

  const uniqueRiskLevels = useMemo(() => {
    return [...new Set(deals.map(deal => deal.risk))];
  }, [deals]);

  const uniqueStatuses = useMemo(() => {
    return [...new Set(deals.map(deal => deal.status))];
  }, [deals]);

  // Filter and sort deals
  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals.filter(deal => {
      const matchesSearch = searchQuery === '' || 
        (deal.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesIndustry = selectedFilters.industry.length === 0 || 
        selectedFilters.industry.includes(deal.industry);

      const matchesRisk = selectedFilters.risk.length === 0 || 
        selectedFilters.risk.includes(deal.risk);

      const matchesROI = (deal.roi || 0) >= selectedFilters.roi[0] && 
        (deal.roi || 0) <= selectedFilters.roi[1];

      const matchesInvestment = (deal.minInvestment || 0) >= selectedFilters.investmentRange[0] && 
        (deal.minInvestment || 0) <= selectedFilters.investmentRange[1];

      const matchesStatus = selectedFilters.status.length === 0 || 
        selectedFilters.status.includes(deal.status);

      return matchesSearch && matchesIndustry && matchesRisk && 
             matchesROI && matchesInvestment && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [deals, searchQuery, selectedFilters, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedDeals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDeals = filteredAndSortedDeals.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading Deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Deal Explorer</h1>
        <p className={styles.subtitle}>
          Browse and analyze {filteredAndSortedDeals.length} investment opportunities
        </p>
      </div>

      <div className={styles.layout}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div className={styles.filterSection}>
            <h3>Search</h3>
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>

          {/* Industry Filter */}
          <div className={styles.filterSection}>
            <h3>Industry</h3>
            <div className={styles.checkboxGroup}>
              {uniqueIndustries.map(industry => (
                <label key={industry} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.industry.includes(industry)}
                    onChange={() => handleFilterChange('industry', industry, true)}
                  />
                  <span>{industry}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Risk Level Filter */}
          <div className={styles.filterSection}>
            <h3>Risk Level</h3>
            <div className={styles.checkboxGroup}>
              {uniqueRiskLevels.map(risk => (
                <label key={risk} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.risk.includes(risk)}
                    onChange={() => handleFilterChange('risk', risk, true)}
                  />
                  <span>{risk}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className={styles.filterSection}>
            <h3>Status</h3>
            <div className={styles.checkboxGroup}>
              {uniqueStatuses.map(status => (
                <label key={status} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.status.includes(status)}
                    onChange={() => handleFilterChange('status', status, true)}
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ROI Range */}
          <div className={styles.filterSection}>
            <h3>ROI Range</h3>
            <div className={styles.rangeInputs}>
              <input
                type="number"
                min="0"
                max="100"
                value={selectedFilters.roi[0]}
                onChange={(e) => handleFilterChange('roi', [parseInt(e.target.value), selectedFilters.roi[1]])}
                placeholder="Min"
                className={styles.rangeInput}
              />
              <span>to</span>
              <input
                type="number"
                min="0"
                max="100"
                value={selectedFilters.roi[1]}
                onChange={(e) => handleFilterChange('roi', [selectedFilters.roi[0], parseInt(e.target.value)])}
                placeholder="Max"
                className={styles.rangeInput}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedFilters.roi[1]}
              onChange={(e) => handleFilterChange('roi', [selectedFilters.roi[0], parseInt(e.target.value)])}
              className={styles.rangeSlider}
            />
          </div>

          {/* Investment Range */}
          <div className={styles.filterSection}>
            <h3>Investment Size</h3>
            <div className={styles.rangeInputs}>
              <input
                type="number"
                value={selectedFilters.investmentRange[0]}
                onChange={(e) => handleFilterChange('investmentRange', [parseInt(e.target.value), selectedFilters.investmentRange[1]])}
                placeholder="Min"
                className={styles.rangeInput}
              />
              <span>to</span>
              <input
                type="number"
                value={selectedFilters.investmentRange[1]}
                onChange={(e) => handleFilterChange('investmentRange', [selectedFilters.investmentRange[0], parseInt(e.target.value)])}
                placeholder="Max"
                className={styles.rangeInput}
              />
            </div>
          </div>

          <button
            className={styles.resetBtn}
            onClick={() => {
              setSelectedFilters({
                industry: [],
                risk: [],
                roi: [0, 100],
                investmentRange: [0, 10000000],
                status: [],
              });
              setSearchQuery('');
              setCurrentPage(1);
            }}
          >
            Reset Filters
          </button>
        </aside>

        {/* Main Content */}
        <div className={styles.content}>
          {/* Sort Controls */}
          <div className={styles.controls}>
            <div className={styles.sortControls}>
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.select}
              >
                <option value="companyName">Company Name</option>
                <option value="roi">ROI</option>
                <option value="investmentRequired">Investment Size</option>
                <option value="riskScore">Risk Score</option>
              </select>

              <button
                className={styles.orderBtn}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>

            <div className={styles.resultCount}>
              Showing {paginatedDeals.length} of {filteredAndSortedDeals.length} deals
            </div>
          </div>

          {/* Deals Grid */}
          {filteredAndSortedDeals.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No deals found matching your filters</p>
            </div>
          ) : (
            <>
              <div className={styles.dealsGrid}>
                {paginatedDeals.map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>

              {/* Pagination */}
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={styles.paginationBtn}
                >
                  ← Previous
                </button>

                <div className={styles.pageNumbers}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                    if (pageNum <= totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`${styles.pageBtn} ${currentPage === pageNum ? styles.active : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={styles.paginationBtn}
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
