import { deals } from '../data/deals';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to apply filters
const applyFilters = (data, filters) => {
  return data.filter(deal => {
    if (filters.industry && deal.industry !== filters.industry) return false;
    if (filters.risk && deal.risk !== filters.risk) return false;
    if (filters.status && deal.status !== filters.status) return false;
    if (filters.stage && deal.stage !== filters.stage) return false;
    
    if (filters.minROI && deal.roi < filters.minROI) return false;
    if (filters.maxROI && deal.roi > filters.maxROI) return false;
    
    if (filters.minInvestment && deal.minInvestment < filters.minInvestment) return false;
    if (filters.maxInvestment && deal.maxInvestment > filters.maxInvestment) return false;
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return deal.company.toLowerCase().includes(searchTerm) ||
             deal.industry.toLowerCase().includes(searchTerm) ||
             deal.description.toLowerCase().includes(searchTerm);
    }
    
    return true;
  });
};

// Helper function to sort deals
const sortDeals = (data, sortBy) => {
  const sorted = [...data];
  switch (sortBy) {
    case 'roi-asc':
      return sorted.sort((a, b) => a.roi - b.roi);
    case 'roi-desc':
      return sorted.sort((a, b) => b.roi - a.roi);
    case 'investment-asc':
      return sorted.sort((a, b) => a.minInvestment - b.minInvestment);
    case 'investment-desc':
      return sorted.sort((a, b) => b.minInvestment - a.minInvestment);
    case 'match-desc':
      return sorted.sort((a, b) => b.matchScore - a.matchScore);
    case 'newest':
      return sorted.sort((a, b) => new Date(b.dealDate) - new Date(a.dealDate));
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.dealDate) - new Date(b.dealDate));
    default:
      return sorted;
  }
};

export const dealService = {
  // Get all deals
  getAllDeals: async (options = {}) => {
    await delay(400);
    
    let filtered = [...deals];
    
    if (options.filters) {
      filtered = applyFilters(filtered, options.filters);
    }
    
    if (options.sortBy) {
      filtered = sortDeals(filtered, options.sortBy);
    }
    
    // Pagination
    if (options.page && options.limit) {
      const start = (options.page - 1) * options.limit;
      return {
        data: filtered.slice(start, start + options.limit),
        total: filtered.length,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(filtered.length / options.limit),
      };
    }
    
    return {
      data: filtered,
      total: filtered.length,
    };
  },

  // Get single deal
  getDealById: async (id) => {
    await delay(300);
    const deal = deals.find(d => d.id === id);
    if (!deal) {
      throw new Error('Deal not found');
    }
    return deal;
  },

  // Search deals
  searchDeals: async (searchTerm, options = {}) => {
    await delay(350);
    const filters = { ...options.filters, search: searchTerm };
    
    let filtered = applyFilters(deals, filters);
    
    if (options.sortBy) {
      filtered = sortDeals(filtered, options.sortBy);
    }
    
    return {
      data: filtered,
      total: filtered.length,
    };
  },

  // Get deals by industry
  getDealsByIndustry: async (industry) => {
    await delay(300);
    const filtered = deals.filter(d => d.industry === industry);
    return {
      data: filtered,
      total: filtered.length,
    };
  },

  // Get deals with filters
  getFilteredDeals: async (filters) => {
    await delay(400);
    const filtered = applyFilters(deals, filters);
    return {
      data: filtered,
      total: filtered.length,
    };
  },

  // Get deal statistics
  getDealStats: async () => {
    await delay(300);
    
    const industries = {};
    const risks = { Low: 0, Medium: 0, High: 0 };
    const stages = {};
    let totalROI = 0;
    let totalRaised = 0;

    deals.forEach(deal => {
      industries[deal.industry] = (industries[deal.industry] || 0) + 1;
      risks[deal.risk]++;
      stages[deal.stage] = (stages[deal.stage] || 0) + 1;
      totalROI += deal.roi;
      totalRaised += deal.raised;
    });

    return {
      totalDeals: deals.length,
      activeDeals: deals.filter(d => d.status === 'Active').length,
      industries,
      risks,
      stages,
      averageROI: +(totalROI / deals.length).toFixed(2),
      totalRaised,
    };
  },

  // Get top deals
  getTopDeals: async (limit = 10) => {
    await delay(300);
    const sorted = [...deals].sort((a, b) => b.matchScore - a.matchScore);
    return {
      data: sorted.slice(0, limit),
      total: limit,
    };
  },

  // Get risk-vs-ROI data for charts
  getRiskVsROI: async () => {
    await delay(300);
    const groupedByRisk = {
      Low: [],
      Medium: [],
      High: [],
    };

    deals.forEach(deal => {
      groupedByRisk[deal.risk].push({
        roi: deal.roi,
        investment: deal.minInvestment,
        company: deal.company,
      });
    });

    return Object.entries(groupedByRisk).map(([risk, data]) => ({
      risk,
      avgROI: +(data.reduce((sum, d) => sum + d.roi, 0) / data.length).toFixed(1),
      avgInvestment: Math.round(data.reduce((sum, d) => sum + d.investment, 0) / data.length),
      count: data.length,
    }));
  },

  // Get industry distribution
  getIndustryDistribution: async () => {
    await delay(300);
    const distribution = {};
    deals.forEach(deal => {
      distribution[deal.industry] = (distribution[deal.industry] || 0) + 1;
    });

    return Object.entries(distribution).map(([industry, count]) => ({
      name: industry,
      value: count,
    }));
  },
};
