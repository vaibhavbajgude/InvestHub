import { investors, investmentGrowthData, corporateFundingData } from '../data/investors';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const investorService = {
  // Get all investors
  getAllInvestors: async (options = {}) => {
    await delay(350);
    
    let filtered = [...investors];
    
    // Filter by risk appetite
    if (options.riskAppetite) {
      filtered = filtered.filter(inv => inv.riskAppetite === options.riskAppetite);
    }
    
    // Filter by industry
    if (options.preferredIndustry) {
      filtered = filtered.filter(inv => 
        inv.preferredIndustries.includes(options.preferredIndustry)
      );
    }
    
    // Search
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.name.toLowerCase().includes(searchTerm) ||
        inv.firm.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sorting
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'roi-desc':
          filtered.sort((a, b) => b.portfolioROI - a.portfolioROI);
          break;
        case 'invested-desc':
          filtered.sort((a, b) => b.totalInvested - a.totalInvested);
          break;
        case 'deals-desc':
          filtered.sort((a, b) => b.activeDeals - a.activeDeals);
          break;
        default:
          break;
      }
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

  // Get single investor
  getInvestorById: async (id) => {
    await delay(300);
    const investor = investors.find(inv => inv.id === id);
    if (!investor) {
      throw new Error('Investor not found');
    }
    return investor;
  },

  // Get current investor profile (simulated)
  getCurrentInvestor: async () => {
    await delay(250);
    // Return first investor as current user
    return investors[0];
  },

  // Get investors for a specific deal
  getInvestorsForDeal: async (dealId) => {
    await delay(300);
    return {
      data: investors.filter(inv => 
        inv.investments && inv.investments.includes(dealId)
      ),
      total: investors.filter(inv => 
        inv.investments && inv.investments.includes(dealId)
      ).length,
    };
  },

  // Get investor statistics
  getInvestorStats: async () => {
    await delay(300);
    
    const totalInvested = investors.reduce((sum, inv) => sum + inv.totalInvested, 0);
    const totalActiveDeals = investors.reduce((sum, inv) => sum + inv.activeDeals, 0);
    const avgROI = +(investors.reduce((sum, inv) => sum + inv.portfolioROI, 0) / investors.length).toFixed(2);
    
    const riskAppetiteDistribution = {
      Low: investors.filter(inv => inv.riskAppetite === 'Low').length,
      Medium: investors.filter(inv => inv.riskAppetite === 'Medium').length,
      High: investors.filter(inv => inv.riskAppetite === 'High').length,
    };

    return {
      totalInvestors: investors.length,
      totalInvested,
      totalActiveDeals,
      averageROI: avgROI,
      riskAppetiteDistribution,
    };
  },

  // Get top investors
  getTopInvestors: async (limit = 5) => {
    await delay(300);
    const sorted = [...investors].sort((a, b) => b.portfolioROI - a.portfolioROI);
    return {
      data: sorted.slice(0, limit),
      total: limit,
    };
  },

  // Get investment growth data
  getInvestmentGrowth: async () => {
    await delay(300);
    return investmentGrowthData;
  },

  // Get corporate funding data
  getCorporateFundingData: async () => {
    await delay(300);
    return corporateFundingData;
  },

  // Match investors to deals
  matchInvestorsToDeal: async (deal) => {
    await delay(400);
    
    return investors.map(investor => {
      let score = 0;
      
      // Budget compatibility
      if (investor.budget.min <= deal.minInvestment && investor.budget.max >= deal.maxInvestment) {
        score += 25;
      } else if (investor.budget.max >= deal.minInvestment && investor.budget.min <= deal.maxInvestment) {
        score += 15;
      }
      
      // Industry match
      if (investor.preferredIndustries.includes(deal.industry)) {
        score += 25;
      }
      
      // Risk appetite match
      if (investor.riskAppetite === 'High' && deal.risk === 'High') score += 15;
      else if (investor.riskAppetite === 'Medium' && deal.risk === 'Medium') score += 15;
      else if (investor.riskAppetite === 'Low' && deal.risk === 'Low') score += 15;
      else if (investor.riskAppetite === 'High') score += 10;
      
      // ROI attractiveness
      if (deal.roi > 30) score += 15;
      else if (deal.roi > 20) score += 10;
      else if (deal.roi > 10) score += 5;
      
      // Active deal capacity
      if (investor.activeDeals < 12) score += 5;
      
      return {
        ...investor,
        matchScore: Math.min(100, score),
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  },
};
