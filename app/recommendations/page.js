'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { dealService } from '@/services';
import { setDeals, setLoading } from '@/store/slices/dealSlice';
import DealCard from '@/components/DealCard';
import styles from './Recommendations.module.css';

export default function Recommendations() {
  const dispatch = useDispatch();
  const { deals, loading } = useSelector(state => state.deals);
  
  const [userData, setUserData] = useState({
    preferredIndustries: [],
    riskTolerance: 'Medium',
    budgetRange: [0, 10000000],
    targetROI: 15,
  });
  const [showSettings, setShowSettings] = useState(false);

  // Fetch deals
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

  // Load user preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      setUserData(JSON.parse(saved));
    } else if (deals.length > 0) {
      // Set default industries if not set
      setUserData(prev => ({
        ...prev,
        preferredIndustries: deals.slice(0, 3).map(d => d.industry),
      }));
    }
  }, [deals]);

  // Calculate recommendation score for each deal (memoized)
  const scoredDeals = useMemo(() => {
    if (!deals || deals.length === 0) return [];

    return deals.map(deal => {
      let score = 100;

      // Risk match scoring (30%)
      const dealRiskValue = deal.risk === 'High' ? 100 : deal.risk === 'Medium' ? 50 : 0;
      const userRiskValue = userData.riskTolerance === 'High' ? 100 : userData.riskTolerance === 'Medium' ? 50 : 0;
      const riskScore = Math.max(0, 30 - Math.abs(dealRiskValue - userRiskValue) / 3.33);
      score = riskScore; // Start with base score

      // Industry match scoring (25%)
      const industryScore = userData.preferredIndustries.includes(deal.industry) ? 25 : 10;
      score += industryScore;

      // Budget compatibility (20%)
      const budgetScore = (
        (deal.minInvestment || 0) >= userData.budgetRange[0] &&
        (deal.minInvestment || 0) <= userData.budgetRange[1]
      ) ? 20 : 5;
      score += budgetScore;

      // ROI attractiveness (25%)
      const roiDiff = Math.abs(deal.roi - userData.targetROI);
      const roiScore = Math.max(0, 25 - roiDiff);
      score += roiScore;

      return {
        ...deal,
        recommendationScore: Math.min(100, score),
        scoreBreakdown: {
          risk: riskScore,
          industry: industryScore,
          budget: budgetScore,
          roi: roiScore,
        }
      };
    });
  }, [deals, userData]);

  // Sort by recommendation score
  const sortedDeals = useMemo(() => {
    return [...scoredDeals].sort((a, b) => b.recommendationScore - a.recommendationScore);
  }, [scoredDeals]);

  const handleSavePreferences = useCallback(() => {
    localStorage.setItem('userPreferences', JSON.stringify(userData));
    setShowSettings(false);
  }, [userData]);

  const handleIndustryToggle = (industry) => {
    setUserData(prev => ({
      ...prev,
      preferredIndustries: prev.preferredIndustries.includes(industry)
        ? prev.preferredIndustries.filter(i => i !== industry)
        : [...prev.preferredIndustries, industry]
    }));
  };

  const uniqueIndustries = useMemo(() => {
    return [...new Set(deals.map(d => d.industry))];
  }, [deals]);

  const topRecommendations = sortedDeals.slice(0, 5);
  const averageScore = sortedDeals.length > 0
    ? (sortedDeals.reduce((sum, d) => sum + d.recommendationScore, 0) / sortedDeals.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading Recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1>Smart Deal Recommendations</h1>
          <button
            className={styles.settingsBtn}
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️ Preferences
          </button>
        </div>
        <p className={styles.subtitle}>
          Deals tailored to your investment profile and preferences
        </p>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={styles.settingsPanel}>
          <h2>Investment Preferences</h2>
          
          <div className={styles.settingGroup}>
            <label>Risk Tolerance</label>
            <div className={styles.riskToggle}>
              {['Low', 'Medium', 'High'].map(level => (
                <button
                  key={level}
                  className={`${styles.riskBtn} ${userData.riskTolerance === level ? styles.active : ''}`}
                  onClick={() => setUserData(prev => ({ ...prev, riskTolerance: level }))}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.settingGroup}>
            <label>Target ROI (%)</label>
            <input
              type="range"
              min="5"
              max="100"
              value={userData.targetROI}
              onChange={(e) => setUserData(prev => ({ ...prev, targetROI: parseInt(e.target.value) }))}
              className={styles.rangeSlider}
            />
            <span className={styles.rangeValue}>{userData.targetROI}%</span>
          </div>

          <div className={styles.settingGroup}>
            <label>Budget Range (Millions)</label>
            <div className={styles.budgetInputs}>
              <input
                type="number"
                value={userData.budgetRange[0] / 1000000}
                onChange={(e) => setUserData(prev => ({
                  ...prev,
                  budgetRange: [parseInt(e.target.value) * 1000000, prev.budgetRange[1]]
                }))}
                placeholder="Min"
                className={styles.input}
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
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.settingGroup}>
            <label>Preferred Industries</label>
            <div className={styles.industryGrid}>
              {uniqueIndustries.map(industry => (
                <button
                  key={industry}
                  className={`${styles.industryBtn} ${userData.preferredIndustries.includes(industry) ? styles.active : ''}`}
                  onClick={() => handleIndustryToggle(industry)}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          <button className={styles.saveBtn} onClick={handleSavePreferences}>
            ✓ Save Preferences
          </button>
        </div>
      )}

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Recommendations Found</span>
          <span className={styles.statValue}>{sortedDeals.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Average Match Score</span>
          <span className={styles.statValue}>{averageScore}%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Top Match</span>
          <span className={styles.statValue}>
            {topRecommendations[0]?.recommendationScore.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Top 5 Recommendations */}
      <div className={styles.section}>
        <h2>🎯 Top Recommended for You</h2>
        <div className={styles.topGrid}>
          {topRecommendations.map((deal, idx) => (
            <Link key={deal.id} href={`/deals/${deal.id}`} className={styles.topCard}>
              <div className={styles.rankBadge}>#{idx + 1}</div>
              <div className={styles.scoreCard}>
                <div className={styles.scoreRing}>
                  <div className={styles.scoreValue}>
                    {deal.recommendationScore.toFixed(0)}%
                  </div>
                </div>
                <div className={styles.scoreDetails}>
                  <h3>{deal.companyName}</h3>
                  <p>{deal.description.substring(0, 50)}...</p>
                  <div className={styles.scoreBreakdown}>
                    <div className={styles.breakdownItem}>
                      <span>Risk</span>
                      <span>{deal.scoreBreakdown.risk.toFixed(0)}</span>
                    </div>
                    <div className={styles.breakdownItem}>
                      <span>Industry</span>
                      <span>{deal.scoreBreakdown.industry.toFixed(0)}</span>
                    </div>
                    <div className={styles.breakdownItem}>
                      <span>Budget</span>
                      <span>{deal.scoreBreakdown.budget.toFixed(0)}</span>
                    </div>
                    <div className={styles.breakdownItem}>
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
      <div className={styles.section}>
        <h2>All Recommendations (Sorted by Match Score)</h2>
        <div className={styles.allRecommendations}>
          {sortedDeals.map((deal) => (
            <Link
              key={deal.id}
              href={`/deals/${deal.id}`}
              className={styles.recommendationItem}
            >
              <div className={styles.dealInfo}>
                <h3>{deal.companyName}</h3>
                <p>{deal.description.substring(0, 60)}...</p>
                <div className={styles.tags}>
                  <span className={styles.tag}>{deal.industry}</span>
                  <span className={styles.tag}>{deal.riskLevel} Risk</span>
                  <span className={styles.tag}>{deal.roi}% ROI</span>
                </div>
              </div>
              <div className={styles.dealScore}>
                <div className={`${styles.scoreIndicator} ${
                  deal.recommendationScore >= 75 ? styles.excellent :
                  deal.recommendationScore >= 50 ? styles.good :
                  styles.fair
                }`}>
                  {deal.recommendationScore.toFixed(0)}%
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className={styles.infoBox}>
        <h3>How are scores calculated?</h3>
        <ul>
          <li><strong>Risk Match (30%):</strong> How well the deal's risk profile matches your tolerance</li>
          <li><strong>Industry Match (25%):</strong> Alignment with your preferred industries</li>
          <li><strong>Budget Compatibility (20%):</strong> Whether the deal fits your investment range</li>
          <li><strong>ROI Attractiveness (25%):</strong> How close the ROI is to your target</li>
        </ul>
      </div>
    </div>
  );
}
