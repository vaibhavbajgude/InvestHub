'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { dealService } from '@/services';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import styles from './DealDetails.module.css';

export default function DealDetails() {
  const params = useParams();
  const dealId = params.id;
  const deals = useSelector(state => state.deals.deals);
  
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedAccordion, setExpandedAccordion] = useState('financial');
  const [isInterested, setIsInterested] = useState(false);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        // Find deal from Redux store or fetch from service
        const foundDeal = deals.find(d => d.id === dealId);
        if (foundDeal) {
          setDeal(foundDeal);
        } else {
          const dealData = await dealService.getDealById(dealId);
          setDeal(dealData);
        }
        
        // Check if interested (from localStorage)
        const interests = JSON.parse(localStorage.getItem('interests') || '[]');
        setIsInterested(interests.includes(dealId));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (dealId) {
      fetchDeal();
    }
  }, [dealId, deals]);

  const handleToggleInterest = () => {
    const interests = JSON.parse(localStorage.getItem('interests') || '[]');
    if (isInterested) {
      const filtered = interests.filter(id => id !== dealId);
      localStorage.setItem('interests', JSON.stringify(filtered));
    } else {
      localStorage.setItem('interests', JSON.stringify([...interests, dealId]));
    }
    setIsInterested(!isInterested);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading Deal Details...</p>
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <p>Error: {error || 'Deal not found'}</p>
          <Link href="/deal-explorer" className={styles.backLink}>
            ← Back to Deals
          </Link>
        </div>
      </div>
    );
  }

  // Generate projection data
  const projectionData = Array.from({ length: 10 }, (_, i) => ({
    year: i + 1,
    projectedValue: deal.investmentRequired * Math.pow(1 + deal.roi / 100, i + 1),
    conservative: deal.investmentRequired * Math.pow(1 + (deal.roi * 0.7) / 100, i + 1),
    optimistic: deal.investmentRequired * Math.pow(1 + (deal.roi * 1.3) / 100, i + 1),
  }));

  // Risk analysis data
  const riskData = [
    { category: 'Market Risk', value: Math.floor(Math.random() * 100) },
    { category: 'Business Risk', value: Math.floor(Math.random() * 100) },
    { category: 'Operational Risk', value: Math.floor(Math.random() * 100) },
    { category: 'Financial Risk', value: Math.floor(Math.random() * 100) },
    { category: 'Regulatory Risk', value: Math.floor(Math.random() * 100) },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/deal-explorer" className={styles.backLink}>
            ← Back to Deals
          </Link>
          <button
            className={`${styles.interestBtn} ${isInterested ? styles.active : ''}`}
            onClick={handleToggleInterest}
          >
            {isInterested ? '❤️ Remove from Interests' : '🤍 Add to Interests'}
          </button>
        </div>

        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1>{deal.companyName}</h1>
            <p className={styles.description}>{deal.description}</p>
            <div className={styles.badges}>
              <span className={`${styles.badge} ${styles[deal.industry]}`}>
                {deal.industry}
              </span>
              <span className={`${styles.badge} ${styles[deal.status]}`}>
                {deal.status}
              </span>
              <span className={`${styles.badge} ${styles[deal.riskLevel]}`}>
                {deal.riskLevel} Risk
              </span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.metric}>
              <span className={styles.label}>Investment Required</span>
              <span className={styles.value}>${(deal.investmentRequired / 1000000).toFixed(1)}M</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>Expected ROI</span>
              <span className={`${styles.value} ${styles.roiHighlight}`}>{deal.roi}%</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.label}>Risk Score</span>
              <span className={styles.value}>{deal.riskScore}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'financial' ? styles.active : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          Financial Metrics
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'projections' ? styles.active : ''}`}
          onClick={() => setActiveTab('projections')}
        >
          ROI Projections
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'risk' ? styles.active : ''}`}
          onClick={() => setActiveTab('risk')}
        >
          Risk Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={styles.tabPanel}>
            <div className={styles.grid}>
              <div className={styles.section}>
                <h2>Company Information</h2>
                <div className={styles.infoGrid}>
                  <div className={styles.infoPair}>
                    <span className={styles.label}>Website</span>
                    <a href={`https://${deal.companyName.toLowerCase()}.com`} target="_blank" rel="noopener noreferrer">
                      {deal.companyName.toLowerCase()}.com
                    </a>
                  </div>
                  <div className={styles.infoPair}>
                    <span className={styles.label}>Founded</span>
                    <span>{new Date().getFullYear() - Math.floor(Math.random() * 20)}</span>
                  </div>
                  <div className={styles.infoPair}>
                    <span className={styles.label}>Employees</span>
                    <span>{Math.floor(Math.random() * 1000) + 50}+</span>
                  </div>
                  <div className={styles.infoPair}>
                    <span className={styles.label}>Location</span>
                    <span>Silicon Valley, CA</span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h2>Investment Details</h2>
                <div className={styles.infoGrid}>
                  <div className={styles.infoPair}>
                    <span className={styles.label}>Equity Offered</span>
                    <span>{(Math.random() * 10 + 2).toFixed(1)}%</span>
                  </div>
                  <div className={styles.infoPair}>
                    <span className={styles.label}>Minimum Investment</span>
                    <span>${(deal.investmentRequired / 10 / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className={styles.infoPair}>
                    <span className={styles.label}>Funding Round</span>
                    <span>Series {String.fromCharCode(65 + Math.floor(Math.random() * 3))}</span>
                  </div>
                  <div className={styles.infoPair}>
                    <span className={styles.label}>Timeline</span>
                    <span>{Math.floor(Math.random() * 5) + 3}-5 years</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion */}
            <div className={styles.accordion}>
              <div className={styles.accordionItem}>
                <button
                  className={styles.accordionHeader}
                  onClick={() => setExpandedAccordion(expandedAccordion === 'highlights' ? null : 'highlights')}
                >
                  <span>Key Highlights</span>
                  <span className={styles.icon}>
                    {expandedAccordion === 'highlights' ? '▼' : '▶'}
                  </span>
                </button>
                {expandedAccordion === 'highlights' && (
                  <div className={styles.accordionContent}>
                    <ul>
                      <li>Strong market position in {deal.industry} sector</li>
                      <li>Proven business model with consistent growth</li>
                      <li>Experienced management team with 15+ years in industry</li>
                      <li>Scalable technology infrastructure</li>
                      <li>Strategic partnerships with key industry leaders</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className={styles.accordionItem}>
                <button
                  className={styles.accordionHeader}
                  onClick={() => setExpandedAccordion(expandedAccordion === 'milestone' ? null : 'milestone')}
                >
                  <span>Growth Milestones</span>
                  <span className={styles.icon}>
                    {expandedAccordion === 'milestone' ? '▼' : '▶'}
                  </span>
                </button>
                {expandedAccordion === 'milestone' && (
                  <div className={styles.accordionContent}>
                    <ul>
                      <li>Year 1: Launch product v2.0 and expand to 3 new markets</li>
                      <li>Year 2: Achieve 100% YoY growth and break even</li>
                      <li>Year 3: Expand team to 200+ employees</li>
                      <li>Year 4: Path to profitability and Series C funding</li>
                      <li>Year 5: Potential exit or public offering</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className={styles.accordionItem}>
                <button
                  className={styles.accordionHeader}
                  onClick={() => setExpandedAccordion(expandedAccordion === 'use' ? null : 'use')}
                >
                  <span>Fund Usage</span>
                  <span className={styles.icon}>
                    {expandedAccordion === 'use' ? '▼' : '▶'}
                  </span>
                </button>
                {expandedAccordion === 'use' && (
                  <div className={styles.accordionContent}>
                    <ul>
                      <li>40% - Product Development & R&D</li>
                      <li>30% - Sales & Marketing</li>
                      <li>15% - Team Expansion</li>
                      <li>10% - Infrastructure & Operations</li>
                      <li>5% - Legal & Compliance</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Financial Metrics Tab */}
        {activeTab === 'financial' && (
          <div className={styles.tabPanel}>
            <div className={styles.grid}>
              <div className={styles.financialCard}>
                <h3>Revenue Growth</h3>
                <p className={styles.value}>$45.2M</p>
                <p className={styles.change}>↑ 32% YoY</p>
              </div>
              <div className={styles.financialCard}>
                <h3>Gross Margin</h3>
                <p className={styles.value}>68%</p>
                <p className={styles.change}>↑ 5% vs last year</p>
              </div>
              <div className={styles.financialCard}>
                <h3>Burn Rate</h3>
                <p className={styles.value}>$1.2M/month</p>
                <p className={styles.change}>↓ 15% optimized</p>
              </div>
              <div className={styles.financialCard}>
                <h3>Customer Base</h3>
                <p className={styles.value}>2,430</p>
                <p className={styles.change}>↑ 45% new customers</p>
              </div>
            </div>

            <div className={styles.chartContainer}>
              <h2>Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={Array.from({ length: 12 }, (_, i) => ({
                  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
                  revenue: 10 + i * 3 + Math.random() * 5,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(1)}M`} />
                  <Area type="monotone" dataKey="revenue" fill="#667eea" stroke="#667eea" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Projections Tab */}
        {activeTab === 'projections' && (
          <div className={styles.tabPanel}>
            <div className={styles.chartContainer}>
              <h2>10-Year ROI Projections</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="year" 
                    label={{ value: 'Years', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Investment Value ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value) => `$${(value / 1000000).toFixed(2)}M`}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="conservative" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Conservative (70% ROI)"
                    dot={{ fill: '#82ca9d' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projectedValue" 
                    stroke="#667eea" 
                    strokeWidth={2}
                    name="Projected (100% ROI)"
                    dot={{ fill: '#667eea' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="optimistic" 
                    stroke="#ffc658" 
                    strokeWidth={2}
                    name="Optimistic (130% ROI)"
                    dot={{ fill: '#ffc658' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.projectionSummary}>
              <div className={styles.projectionCard}>
                <h3>Year 5 Projection</h3>
                <p className={styles.projectionValue}>
                  ${Math.round(projectionData[4].projectedValue / 1000000)}M
                </p>
                <p className={styles.projectionGain}>
                  +{Math.round(((projectionData[4].projectedValue - deal.investmentRequired) / deal.investmentRequired) * 100)}% gain
                </p>
              </div>
              <div className={styles.projectionCard}>
                <h3>Year 10 Projection</h3>
                <p className={styles.projectionValue}>
                  ${Math.round(projectionData[9].projectedValue / 1000000)}M
                </p>
                <p className={styles.projectionGain}>
                  +{Math.round(((projectionData[9].projectedValue - deal.investmentRequired) / deal.investmentRequired) * 100)}% gain
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Risk Analysis Tab */}
        {activeTab === 'risk' && (
          <div className={styles.tabPanel}>
            <div className={styles.riskHeader}>
              <div className={styles.riskScore}>
                <div className={styles.scoreCircle}>
                  <span className={styles.scoreValue}>{deal.riskScore}</span>
                  <span className={styles.scoreLabel}>/ 100</span>
                </div>
                <p className={styles.scoreInterpretation}>
                  {deal.riskLevel} Risk Level
                </p>
              </div>
              <div className={styles.riskDescription}>
                <p>This deal has a {deal.riskLevel.toLowerCase()} risk profile. The company operates in the {deal.industry} sector with moderate market volatility.</p>
              </div>
            </div>

            <div className={styles.chartContainer}>
              <h2>Risk Factor Analysis</h2>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={riskData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Risk Level" dataKey="value" stroke="#ff7c7c" fill="#ff7c7c" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.riskFactors}>
              <h2>Risk Mitigation Strategies</h2>
              <div className={styles.factorsList}>
                {[
                  { title: 'Diversification', description: 'Spread investment across multiple portfolio companies to reduce concentration risk' },
                  { title: 'Due Diligence', description: 'Comprehensive background checks and financial audits conducted' },
                  { title: 'Board Representation', description: 'Direct involvement in company governance and strategic decisions' },
                  { title: 'Staged Investment', description: 'Milestone-based funding releases tied to performance metrics' },
                ].map((factor, idx) => (
                  <div key={idx} className={styles.factorItem}>
                    <h3>{factor.title}</h3>
                    <p>{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Investment CTA */}
      <div className={styles.cta}>
        <button className={styles.ctaButton}>
          💼 Express Interest in Investment
        </button>
        <button className={styles.ctaButtonSecondary}>
          📥 Download Deal Brochure
        </button>
      </div>
    </div>
  );
}
