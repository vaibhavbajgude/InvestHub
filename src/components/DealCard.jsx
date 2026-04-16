import React from 'react';
import { Link } from 'react-router-dom';
import './DealCard.css';

const RISK_COLORS = { Low: '#22d3ee', Medium: '#f59e0b', High: '#ef4444' };

const DealCard = ({ deal }) => {
  const fundingPercent = Math.min(100, ((deal.raised / (deal.targetAmount || deal.maxInvestment)) * 100).toFixed(1));
  const companyName = deal.companyName || deal.company;

  return (
    <Link to={`/deals/${deal.id}`} className="deal-card" style={{ textDecoration: 'none' }}>
      <div className="card-header">
        <div className="card-title">
          <h3>{companyName}</h3>
          <p className="card-description">{deal.description?.substring(0, 70)}...</p>
        </div>
        <div className={`card-status status-${deal.status?.toLowerCase()}`}>
          {deal.status}
        </div>
      </div>

      <div className="card-badges">
        <span className="badge badge-industry">{deal.industry}</span>
        <span className="badge badge-stage">{deal.stage}</span>
        <span
          className="badge badge-risk"
          style={{ 
            background: (RISK_COLORS[deal.riskLevel] || RISK_COLORS[deal.risk] || '#94a3b8') + '22', 
            color: (RISK_COLORS[deal.riskLevel] || RISK_COLORS[deal.risk] || '#94a3b8'), 
            border: `1px solid ${(RISK_COLORS[deal.riskLevel] || RISK_COLORS[deal.risk] || '#94a3b8')}55` 
          }}
        >
          {deal.riskLevel || deal.risk} Risk
        </span>
      </div>

      <div className="card-metrics">
        <div className="metric">
          <span className="label">Min. Investment</span>
          <span className="value">${(deal.investmentRequired / 1000).toFixed(0)}K</span>
        </div>
        <div className="metric">
          <span className="label">ROI</span>
          <span className="value roi">{deal.roi}%</span>
        </div>
        <div className="metric">
          <span className="label">Match Score</span>
          <span className="value">{deal.matchScore}/10</span>
        </div>
      </div>

      <div className="card-footer">
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${fundingPercent}%` }}></div>
          </div>
          <p className="progress-label">{fundingPercent}% funded</p>
        </div>
      </div>
    </Link>
  );
};

export default DealCard;
