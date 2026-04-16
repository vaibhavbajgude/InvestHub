import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dealService } from '../../services/dealService';

export const fetchDeals = createAsyncThunk(
  'deals/fetchDeals',
  async (options = {}) => {
    const response = await dealService.getAllDeals(options);
    return response;
  }
);

export const fetchDealById = createAsyncThunk(
  'deals/fetchDealById',
  async (id) => {
    const response = await dealService.getDealById(id);
    return response;
  }
);

export const searchDeals = createAsyncThunk(
  'deals/searchDeals',
  async ({ searchTerm, options }) => {
    const response = await dealService.searchDeals(searchTerm, options);
    return response;
  }
);

export const fetchDealStats = createAsyncThunk(
  'deals/fetchDealStats',
  async () => {
    const response = await dealService.getDealStats();
    return response;
  }
);

export const fetchIndustryDistribution = createAsyncThunk(
  'deals/fetchIndustryDistribution',
  async () => {
    const response = await dealService.getIndustryDistribution();
    return response;
  }
);

export const fetchRiskVsROI = createAsyncThunk(
  'deals/fetchRiskVsROI',
  async () => {
    const response = await dealService.getRiskVsROI();
    return response;
  }
);

const initialState = {
  deals: [],
  currentDeal: null,
  stats: null,
  industryDistribution: [],
  riskVsROI: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  loading: false,
  error: null,
  searchResults: [],
  filters: {
    search: '',
    industry: null,
    risk: null,
    stage: null,
    status: null,
    minROI: null,
    maxROI: null,
    minInvestment: null,
    maxInvestment: null,
  },
  sortBy: 'match-desc',
};

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.sortBy = 'match-desc';
      state.page = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSearchInput: (state, action) => {
      state.filters.search = action.payload;
    },
    setDeals: (state, action) => {
      state.deals = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch deals
    builder
      .addCase(fetchDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.deals = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch deal by ID
    builder
      .addCase(fetchDealById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDealById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDeal = action.payload;
      })
      .addCase(fetchDealById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Search deals
    builder
      .addCase(searchDeals.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(searchDeals.rejected, (state) => {
        state.loading = false;
      });

    // Fetch stats
    builder
      .addCase(fetchDealStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // Fetch industry distribution
    builder
      .addCase(fetchIndustryDistribution.fulfilled, (state, action) => {
        state.industryDistribution = action.payload;
      });

    // Fetch risk vs ROI
    builder
      .addCase(fetchRiskVsROI.fulfilled, (state, action) => {
        state.riskVsROI = action.payload;
      });
  },
});

export const { setPage, setFilters, clearFilters, setSortBy, setSearchInput, setDeals, setLoading, setError } = dealsSlice.actions;
export default dealsSlice.reducer;
