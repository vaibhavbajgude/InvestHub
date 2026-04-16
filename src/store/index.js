import { configureStore } from '@reduxjs/toolkit';
import dealsReducer from './slices/dealSlice';
import investorsReducer from './slices/investorSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    deals: dealsReducer,
    investors: investorsReducer,
    ui: uiReducer,
  },
});

export default store;
