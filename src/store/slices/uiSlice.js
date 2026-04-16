import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  sidebarOpen: true,
  interests: JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('interests') || '[]' : '[]'),
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    addInterest: (state, action) => {
      const dealId = action.payload;
      if (!state.interests.includes(dealId)) {
        state.interests.push(dealId);
        if (typeof window !== 'undefined') {
          localStorage.setItem('interests', JSON.stringify(state.interests));
        }
      }
    },
    removeInterest: (state, action) => {
      const dealId = action.payload;
      state.interests = state.interests.filter(id => id !== dealId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('interests', JSON.stringify(state.interests));
      }
    },
    clearInterests: (state) => {
      state.interests = [];
      if (typeof window !== 'undefined') {
        localStorage.setItem('interests', JSON.stringify([]));
      }
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  addInterest,
  removeInterest,
  clearInterests,
  addNotification,
  removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
