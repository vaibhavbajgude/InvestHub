import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { investorService } from '../../services/investorService';

export const fetchInvestors = createAsyncThunk(
  'investors/fetchInvestors',
  async (options = {}) => {
    const response = await investorService.getAllInvestors(options);
    return response;
  }
);

export const fetchInvestorById = createAsyncThunk(
  'investors/fetchInvestorById',
  async (id) => {
    const response = await investorService.getInvestorById(id);
    return response;
  }
);

export const fetchCurrentInvestor = createAsyncThunk(
  'investors/fetchCurrentInvestor',
  async () => {
    const response = await investorService.getCurrentInvestor();
    return response;
  }
);

export const fetchInvestorStats = createAsyncThunk(
  'investors/fetchInvestorStats',
  async () => {
    const response = await investorService.getInvestorStats();
    return response;
  }
);

export const fetchInvestmentGrowth = createAsyncThunk(
  'investors/fetchInvestmentGrowth',
  async () => {
    const response = await investorService.getInvestmentGrowth();
    return response;
  }
);

export const fetchCorporateFundingData = createAsyncThunk(
  'investors/fetchCorporateFundingData',
  async () => {
    const response = await investorService.getCorporateFundingData();
    return response;
  }
);

export const matchInvestorsToDeal = createAsyncThunk(
  'investors/matchInvestorsToDeal',
  async (deal) => {
    const response = await investorService.matchInvestorsToDeal(deal);
    return response;
  }
);

const initialState = {
  investors: [],
  currentInvestor: null,
  matchedInvestors: [],
  stats: null,
  investmentGrowth: [],
  corporateFundingData: [],
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  totalPages: 0,
  total: 0,
};

const investorSlice = createSlice({
  name: 'investors',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    clearMatchedInvestors: (state) => {
      state.matchedInvestors = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch investors
    builder
      .addCase(fetchInvestors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestors.fulfilled, (state, action) => {
        state.loading = false;
        state.investors = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchInvestors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch investor by ID
    builder
      .addCase(fetchInvestorById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvestorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvestor = action.payload;
      })
      .addCase(fetchInvestorById.rejected, (state) => {
        state.loading = false;
      });

    // Fetch current investor
    builder
      .addCase(fetchCurrentInvestor.fulfilled, (state, action) => {
        state.currentInvestor = action.payload;
      });

    // Fetch investor stats
    builder
      .addCase(fetchInvestorStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // Fetch investment growth
    builder
      .addCase(fetchInvestmentGrowth.fulfilled, (state, action) => {
        state.investmentGrowth = action.payload;
      });

    // Fetch corporate funding data
    builder
      .addCase(fetchCorporateFundingData.fulfilled, (state, action) => {
        state.corporateFundingData = action.payload;
      });

    // Match investors
    builder
      .addCase(matchInvestorsToDeal.pending, (state) => {
        state.loading = true;
      })
      .addCase(matchInvestorsToDeal.fulfilled, (state, action) => {
        state.loading = false;
        state.matchedInvestors = action.payload;
      })
      .addCase(matchInvestorsToDeal.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setPage, clearMatchedInvestors } = investorSlice.actions;
export default investorSlice.reducer;
