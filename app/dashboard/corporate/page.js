'use client';

import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { dealService } from '@/services';
import { setDeals, setLoading } from '@/store/slices/dealSlice';
import { corporateFundingData } from '@/data/investors';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import styles from './CorporateDashboard.module.css';

const STATUS_COLORS = { Active: '#6366f1', Pending: '#f59e0b', Closed: '#ef4444' };

export default function CorporateDashboard() {
  const dispatch = useDispatch();
  const { deals, loading } = useSelector(state => state.deals);

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

  const metrics = useMemo(() => {
    if (!deals || deals.length === 0) {
      return { totalFunded: '0', totalInvestors: 0, avgDealSize: '0', conversionRate: '0', activeDeals: 0 };
    }
    const totalFunded = deals.reduce((sum, deal) => sum + (deal.raised || 0), 0);
    const uniqueInvestorCount = deals.reduce((sum, deal) => sum + (deal.investors || 0), 0);
    const avgDealSize = totalFunded / deals.length;
    const activeDealCount = deals.filter(d => d.status === 'Active').length;
    const conversionRate = ((activeDealCount / deals.length) * 100).toFixed(1);
    
    return {
      totalFunded: (totalFunded / 1e6).toFixed(1),
      totalInvestors: uniqueInvestorCount,
      avgDealSize: (avgDealSize / 1000).toFixed(0),
      conversionRate,
      activeDeals: activeDealCount,
    };
  }, [deals]);

  const industryData = useMemo(() => {
    const map = {};
    deals.forEach(deal => {
      map[deal.industry] = (map[deal.industry] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [deals]);

  const statusData = useMemo(() => [
    { name: 'Active', value: deals.filter(d => d.status === 'Active').length },
    { name: 'Pending', value: deals.filter(d => d.status === 'Pending').length },
    { name: 'Closed', value: deals.filter(d => d.status === 'Closed').length },
  ], [deals]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading Corporate Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Corporate Dashboard</h1>
        <p className={styles.subtitle}>Platform-wide funding analytics and deal intelligence</p>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>💰</div>
          <div className={styles.metricContent}>
            <h3>Total Funding Raised</h3>
            <p className={styles.metricValue}>${metrics.totalFunded}M</p>
            <p className={`${styles.metricChange} ${styles.positive}`}>↑ 15% from last quarter</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>👥</div>
          <div className={styles.metricContent}>
            <h3>Investor Participation</h3>
            <p className={styles.metricValue}>{metrics.totalInvestors}</p>
            <p className={`${styles.metricChange} ${styles.positive}`}>↑ 8 new this month</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>📊</div>
          <div className={styles.metricContent}>
            <h3>Avg. Funding per Deal</h3>
            <p className={styles.metricValue}>${metrics.avgDealSize}K</p>
            <p className={styles.metricChange}>Across {deals.length} deals</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>✅</div>
          <div className={styles.metricContent}>
            <h3>Conversion Rate</h3>
            <p className={styles.metricValue}>{metrics.conversionRate}%</p>
            <p className={`${styles.metricChange} ${styles.positive}`}>↑ 2.4% improvement</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2>Monthly Funding Trend (12 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={corporateFundingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
              <YAxis yAxisId="left" tickFormatter={v => `$${(v / 1e6).toFixed(0)}M`} tick={{ fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                formatter={(value, name) => name === 'funding' ? [`$${(value / 1e6).toFixed(1)}M`, 'Funding'] : [value, 'Investors']} 
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="funding" name="Funding" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="investors" name="Investors" stroke="#22d3ee" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
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
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={`${styles.chartCard} ${styles.chartCardFull}`}>
          <h2>Deals by Industry</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={industryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#94a3b8' }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8' }} width={120} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} />
              <Bar dataKey="value" name="Deals" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Deals Table */}
      <div className={styles.recentDeals}>
        <div className={styles.tableHeader}>
          <h2>Recent Deals Activity</h2>
          <Link href="/deal-explorer" className={styles.viewAllLink}>Explore All Deals →</Link>
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.dealsTable}>
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
                  <td className={styles.companyName}>
                    <Link href={`/deals/${deal.id}`}>{deal.company}</Link>
                  </td>
                  <td>{deal.industry}</td>
                  <td>{deal.stage}</td>
                  <td>${(deal.raised / 1e6).toFixed(1)}M</td>
                  <td>${(deal.targetAmount / 1e6).toFixed(1)}M</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[deal.status.toLowerCase()]}`}>{deal.status}</span>
                  </td>
                  <td className={styles.roi}>{deal.roi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
