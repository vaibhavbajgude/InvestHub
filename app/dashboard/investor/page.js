'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { dealService, investorService } from '@/services';
import { setDeals, setLoading, setError } from '@/store/slices/dealSlice';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import styles from './InvestorDashboard.module.css';

export default function InvestorDashboard() {cd
  const dispatch = useDispatch();
  const { deals, loading, error } = useSelector(state => state.deals);
  const [investmentData, setInvestmentData] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [riskData, setRiskData] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, [dispatch]);

  // Calculate summary metrics (memoized)
  const metrics = useMemo(() => {
    if (!deals || deals.length === 0) {
      return {
        totalInvestment: 0,
        activeDeals: 0,
        averageROI: 0,
        totalROI: 0,
      };
    }

    const totalInvestment = deals.reduce((sum, deal) => sum + (deal.minInvestment || 0), 0);
    const activeDeals = deals.filter(deal => deal.status === 'Active').length;
    const averageROI = (deals.reduce((sum, deal) => sum + deal.roi, 0) / deals.length).toFixed(2);
    const totalROI = (totalInvestment * (averageROI / 100)).toFixed(2);

    return {
      totalInvestment: totalInvestment.toLocaleString(),
      activeDeals,
      averageROI,
      totalROI,
    };
  }, [deals]);

  // Generate investment growth chart data (memoized)
  useEffect(() => {
    if (!deals || deals.length === 0) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const growthArray = months.map((month, idx) => ({
      month,
      investment: Math.floor(Math.random() * 50000) + (idx * 10000),
      returns: Math.floor(Math.random() * 15000) + (idx * 3000),
    }));
    setGrowthData(growthArray);
  }, [deals]);

  // Generate industry distribution (memoized)
  useEffect(() => {
    if (!deals || deals.length === 0) return;

    const industries = {};
    deals.forEach(deal => {
      industries[deal.industry] = (industries[deal.industry] || 0) + (deal.minInvestment || 0);
    });

    const industryArray = Object.entries(industries).map(([name, value]) => ({
      name,
      value: parseInt(value),
    }));
    setIndustryData(industryArray);
  }, [deals]);

  // Generate risk vs ROI scatter data
  useEffect(() => {
    if (!deals || deals.length === 0) return;

    const riskRoiData = deals.slice(0, 10).map(deal => ({
      name: deal.company,
      risk: deal.risk === 'High' ? 80 : deal.risk === 'Medium' ? 50 : 20,
      roi: deal.roi,
    }));
    setRiskData(riskRoiData);
  }, [deals]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Investor Dashboard</h1>
        <p className={styles.subtitle}>Welcome back! Here's your investment overview</p>
      </div>

      {/* Summary Cards */}
      <div className={styles.cardsGrid}>
        <div className={styles.card + ' ' + styles.cardBlue}>
          <div className={styles.cardContent}>
            <h3>Total Investments</h3>
            <p className={styles.cardValue}>${metrics.totalInvestment}</p>
            <span className={styles.cardSubtext}>Across all active deals</span>
          </div>
          <div className={styles.cardIcon}>💼</div>
        </div>

        <div className={styles.card + ' ' + styles.cardGreen}>
          <div className={styles.cardContent}>
            <h3>Active Deals</h3>
            <p className={styles.cardValue}>{metrics.activeDeals}</p>
            <span className={styles.cardSubtext}>Currently invested</span>
          </div>
          <div className={styles.cardIcon}>📈</div>
        </div>

        <div className={styles.card + ' ' + styles.cardPurple}>
          <div className={styles.cardContent}>
            <h3>Average ROI</h3>
            <p className={styles.cardValue}>{metrics.averageROI}%</p>
            <span className={styles.cardSubtext}>Portfolio average</span>
          </div>
          <div className={styles.cardIcon}>🎯</div>
        </div>

        <div className={styles.card + ' ' + styles.cardOrange}>
          <div className={styles.cardContent}>
            <h3>Projected Returns</h3>
            <p className={styles.cardValue}>${metrics.totalROI}</p>
            <span className={styles.cardSubtext}>Based on current ROI</span>
          </div>
          <div className={styles.cardIcon}>💰</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Investment Growth Chart */}
        <div className={styles.chartCard}>
          <h2>Investment Growth Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="investment" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8', r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="returns" 
                stroke="#82ca9d" 
                strokeWidth={2}
                dot={{ fill: '#82ca9d', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Industry Distribution */}
        <div className={styles.chartCard}>
          <h2>Industry Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={industryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${(value / 1000).toFixed(0)}K`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {industryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Risk vs ROI Analysis */}
        <div className={styles.chartCard + ' ' + styles.chartCardFull}>
          <h2>Risk vs ROI Analysis (Top Deals)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="roi" fill="#82ca9d" name="ROI (%)" />
              <Bar dataKey="risk" fill="#ff7c7c" name="Risk Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Links */}
      <div className={styles.quickLinks}>
        <Link href="/deal-explorer" className={styles.link}>
          🔍 Explore Deals
        </Link>
        <Link href="/my-investments" className={styles.link}>
          💎 My Investments
        </Link>
        <Link href="/recommendations" className={styles.link}>
          ⭐ Get Recommendations
        </Link>
      </div>
    </div>
  );
}
