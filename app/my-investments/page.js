'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { dealService } from '@/services';
import { setDeals, setLoading } from '@/store/slices/dealSlice';
import DealCard from '@/components/DealCard';
import styles from './MyInvestments.module.css';

export default function MyInvestments() {
  const dispatch = useDispatch();
  const deals = useSelector(state => state.deals.deals);
  const [interests, setInterests] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchDeals = async () => {
      if (deals.length > 0) return;
      dispatch(setLoading(true));
      try {
        const result = await dealService.getAllDeals();
        dispatch(setDeals(result.data));
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchDeals();
  }, [dispatch, deals.length]);

  useEffect(() => {
    const saved = localStorage.getItem('interests');
    if (saved) setInterests(JSON.parse(saved));
  }, []);

  const interestedDeals = useMemo(() => 
    deals.filter(deal => interests.includes(deal.id)), 
    [deals, interests]
  );
  
  const activeInvestments = useMemo(() => 
    interestedDeals.filter(deal => deal.status === 'Active'), 
    [interestedDeals]
  );

  const totalValue = useMemo(() =>
    activeInvestments.reduce((sum, deal) => sum + (deal.minInvestment || 0), 0), 
    [activeInvestments]
  );

  const averageROI = useMemo(() => {
    if (activeInvestments.length === 0) return 0;
    return (activeInvestments.reduce((sum, deal) => sum + deal.roi, 0) / activeInvestments.length).toFixed(1);
  }, [activeInvestments]);

  const removeInterest = (dealId) => {
    const updated = interests.filter(id => id !== dealId);
    setInterests(updated);
    localStorage.setItem('interests', JSON.stringify(updated));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Investments & Interests</h1>
        <p className={styles.subtitle}>Track your investment portfolio and watched deals</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Value (Active)</h3>
          <p className={styles.statValue}>${(totalValue / 1000).toFixed(0)}K</p>
          <p className={styles.statDesc}>{activeInvestments.length} active deals</p>
        </div>
        <div className={styles.statCard}>
          <h3>Interested Deals</h3>
          <p className={styles.statValue}>{interestedDeals.length}</p>
          <p className={styles.statDesc}>Watching closely</p>
        </div>
        <div className={styles.statCard}>
          <h3>Average ROI</h3>
          <p className={styles.statValue}>{averageROI}%</p>
          <p className={styles.statDesc}>Active portfolio avg</p>
        </div>
        <div className={styles.statCard}>
          <h3>Projected Returns</h3>
          <p className={styles.statValue}>
            ${activeInvestments.length > 0
              ? (activeInvestments.reduce((s, d) => s + ((d.minInvestment || 0) * d.roi / 100), 0) / 1000).toFixed(0)
              : 0}K
          </p>
          <p className={styles.statDesc}>Based on current ROI</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`} 
          onClick={() => setActiveTab('all')}
        >
          All Interests ({interestedDeals.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'invested' ? styles.active : ''}`} 
          onClick={() => setActiveTab('invested')}
        >
          Active Investments ({activeInvestments.length})
        </button>
      </div>

      {/* Content */}
      <div className={styles.tabContent}>
        {activeTab === 'all' && (
          <div className={styles.panel}>
            {interestedDeals.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔖</div>
                <p>No deals saved yet</p>
                <p className={styles.emptySub}>Browse deals and click ❤️ to add to your interests</p>
                <Link href="/deal-explorer" className={styles.emptyStateLink}>Browse Deals →</Link>
              </div>
            ) : (
              <div className={styles.dealsGrid}>
                {interestedDeals.map(deal => (
                  <div key={deal.id} className={styles.dealWrapper}>
                    <DealCard deal={deal} />
                    <button className={styles.removeBtn} onClick={() => removeInterest(deal.id)}>✕ Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'invested' && (
          <div className={styles.panel}>
            {activeInvestments.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>💼</div>
                <p>No active investments yet</p>
                <p className={styles.emptySub}>Mark Active deals as interested to track them here</p>
                <Link href="/recommendations" className={styles.emptyStateLink}>Get Recommendations →</Link>
              </div>
            ) : (
              <div className={styles.investmentsList}>
                {activeInvestments.map(deal => (
                  <div key={deal.id} className={styles.investmentItem}>
                    <div className={styles.investmentInfo}>
                      <h3>{deal.company}</h3>
                      <p className={styles.investmentDescription}>
                        {deal.description.substring(0, 100)}...
                      </p>
                      <div className={styles.investmentTags}>
                        <span className={styles.tag}>{deal.industry}</span>
                        <span className={styles.tag}>{deal.stage}</span>
                        <span className={`${styles.tag} ${styles.riskTag}`}>{deal.risk} Risk</span>
                      </div>
                    </div>
                    <div className={styles.investmentMetrics}>
                      <div className={styles.metric}>
                        <span>Investment</span>
                        <strong>${((deal.minInvestment || 0) / 1000).toFixed(0)}K</strong>
                      </div>
                      <div className={styles.metric}>
                        <span>Expected ROI</span>
                        <strong className={styles.roi}>{deal.roi}%</strong>
                      </div>
                      <div className={styles.metric}>
                        <span>Projected Return</span>
                        <strong>${(((deal.minInvestment || 0) * deal.roi) / 100 / 1000).toFixed(0)}K</strong>
                      </div>
                    </div>
                    <div className={styles.investmentActions}>
                      <Link href={`/deals/${deal.id}`} className={styles.viewBtn}>View Details →</Link>
                      <button className={styles.removeBtn} onClick={() => removeInterest(deal.id)}>✕ Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
