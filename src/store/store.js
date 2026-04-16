import { configureStore } from '@reduxjs/toolkit'
import dealReducer from './slices/dealSlice'
import investorReducer from './slices/investorSlice'
import uiReducer from './slices/uiSlice'

const store = configureStore({
  reducer: {
    deals: dealReducer,
    investors: investorReducer,
    ui: uiReducer
  }
})

export default store
