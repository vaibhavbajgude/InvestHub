# InvestHub - Fintech Dashboard

A comprehensive, highly interactive fintech web dashboard for investors and corporates built with **React**, **Vite**, **Redux**, and **Recharts**.

## 🎯 Features

### Core Features
- **📊 Investor Dashboard**: Real-time investment metrics, portfolio overview, and growth charts
- **🔍 Deal Explorer**: Advanced search, filtering, sorting, and pagination for deal discovery
- **⭐ Smart Recommendations**: AI-powered deal recommendations based on investment preferences
- **💎 My Investments**: Track interested and active investments with detailed metrics
- **🏢 Corporate Dashboard**: Analytics and fundraising pipeline for corporate investors
- **📄 Deal Details**: Comprehensive deal information with financial projections and risk analysis

### Technical Highlights
- ✅ **No Backend APIs Required**: All data simulated with mock service layer
- ✅ **Advanced Data Visualization**: Multiple chart types (Line, Bar, Pie, Radar)
- ✅ **Responsive Design**: Fully mobile-responsive with adaptive layouts
- ✅ **Dark Mode Support**: CSS variables enable seamless theme switching
- ✅ **Local Storage Persistence**: Save user preferences and interests
- ✅ **State Management**: Redux Toolkit for efficient state handling
- ✅ **Performance Optimized**: useMemo, useCallback for efficient rendering

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone or navigate to the project directory
cd "React.js interview task"

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Layout.jsx           # Main layout with sidebar & navigation
│   │   └── Layout.css
│   └── DealCard.jsx             # Reusable deal card component
│
├── pages/
│   ├── InvestorDashboard.jsx    # Investment overview & metrics
│   ├── DealExplorer.jsx         # Deal search, filter, sort, paginate
│   ├── DealDetails.jsx          # Detailed deal view with projections
│   ├── Recommendations.jsx      # Smart recommendations engine
│   ├── MyInvestments.jsx        # User investments tracker
│   ├── CorporateDashboard.jsx   # Corporate analytics view
│   └── [respective .css files]
│
├── store/
│   ├── store.js                 # Redux store configuration
│   └── slices/
│       └── dealSlice.js         # Deals state management
│
├── services/
│   ├── dealService.js           # Deal API service layer
│   └── investorService.js       # Investor API service layer
│
├── data/
│   ├── deals.js                 # Mock deals dataset (75 records)
│   └── investors.js             # Mock investors dataset
│
├── App.jsx                      # Main routing component
├── App.css
├── index.css                    # Global styles & CSS variables
└── main.jsx                     # React entry point
```

## 🎨 Key Components

### 1. **InvestorDashboard**
- Total investments, active deals, ROI metrics
- Growth trend chart (Line Chart)
- Industry distribution (Pie Chart)
- Risk vs ROI analysis (Bar Chart)

### 2. **DealExplorer**
- Real-time search with debouncing
- Multi-filter sidebar (industry, risk, status, etc.)
- Advanced sorting (ROI, investment, newest)
- Pagination (12 items per page)

### 3. **Recommendations Engine**
- Prefers industry matching
- Risk tolerance alignment
- Budget compatibility scoring
- Target ROI matching
- Scoring algorithm calculates overall recommendation score

### 4. **Deal Details**
- Overview tab with basic deal info
- Financial Metrics tab with KPIs
- ROI Projections tab with 10-year scenarios
- Risk Analysis tab with radar chart

### 5. **My Investments**
- All Interests tab (saved deals)
- Active Investments tab (in-progress)
- localStorage persistence
- Quick access to deal details

### 6. **Corporate Dashboard**
- Monthly funding trends
- Pipeline status visualization
- Deal distribution analysis
- Recent deals table
- Industry breakdown with progress bars

## 🔧 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.0.8 | Build tool & dev server |
| Redux Toolkit | 1.9.7 | State management |
| React Router | 6.20.0 | Client-side routing |
| Recharts | 2.10.3 | Data visualization |
| CSS Modules | Native | Component scoping |
| JavaScript ES6+ | - | Language |

## 📊 Data Structure

### Deal Object
```javascript
{
  id: "deal-001",
  company: "Nexus Capital",
  industry: "FinTech",
  risk: "Low",
  stage: "Series A",
  status: "Active",
  roi: 35.5,
  minInvestment: 100000,
  maxInvestment: 500000,
  raised: 250000,
  description: "...",
  revenueGrowth: 45.2,
  team: 42,
  arr: 5000000,
  runway: 18,
  // ... additional fields
}
```

## 🎯 How Recommendations Work

The recommendation scoring algorithm considers:

1. **Risk Matching (30 points max)**
   - Maps user risk tolerance to risk level scale
   - Penalizes significant deviations

2. **Industry Preference (25 points max)**
   - Awarded for matches with preferred industries
   - 25 points for match, 10 for non-match

3. **Budget Compatibility (20 points max)**
   - Checks if deal fits investment range
   - 20 points for fit, 5 for out of range

4. **ROI Attractiveness (25 points max)**
   - Compares deal ROI to user target
   - Scales based on deviation

**Total Score: 0-100%** with visual indicators (excellent/good/fair)

## 🎨 Styling System

### CSS Variables (Global)
```css
--primary-color: #6366f1        /* Indigo */
--secondary-color: #8b5cf6      /* Purple */
--bg-color: #f8fafc             /* Light slate */
--card-bg: #ffffff              /* White */
--text-primary: #1e293b          /* Dark slate */
--text-secondary: #64748b        /* Medium slate */
--border-color: #e2e8f0          /* Light border */
```

### Responsive Breakpoints
- **Desktop**: Full layout with sidebar
- **Tablet**: Collapsible sidebar (800px)
- **Mobile**: Bottom sheet sidebar, vertical layouts (480px)

## 💾 localStorage Integration

**Stored Data:**
- User preferences (risk tolerance, target ROI, budget, industries)
- Interests list (saved deals)
- Theme preference (dark/light mode)

**API:**
```javascript
// Save user preferences
localStorage.setItem('userPreferences', JSON.stringify(preferences))

// Save interests
localStorage.setItem('interests', JSON.stringify(dealIds))

// Retrieve
const saved = JSON.parse(localStorage.getItem('userPreferences'))
```

## ⚡ Performance Optimizations

1. **Memoization**
   - `useMemo` for expensive calculations (scoring, filtering, sorting)
   - `useCallback` for event handlers

2. **Component Splitting**
   - DealCard component reused across pages
   - Layout component isolated from page logic

3. **Debouncing**
   - Search input debounced (300ms)
   - Prevents excessive re-renders

4. **Lazy Rendering**
   - Pagination limits rendered items (12 per page)
   - Only loads data on demand

## 🚧 Development

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Directory Guidelines

- **Components**: Reusable UI elements with .jsx and .css
- **Pages**: Full-page components with routing
- **Store**: Redux slices and configuration
- **Services**: API/data layer with artificial delays
- **Data**: Mock datasets (75 deals, investors)

## 🎓 Learning Path

### For Understanding the Code:

1. Start with `App.jsx` - See routing structure
2. Visit `Layout.jsx` - Understand main layout
3. Check `store/dealSlice.js` - State management pattern
4. Explore `pages/InvestorDashboard.jsx` - Component pattern
5. Study `services/dealService.js` - Data service layer
6. Review `pages/DealExplorer.jsx` - Advanced filtering/sorting
7. Examine `pages/Recommendations.jsx` - Recommendation algorithm

### Key Concepts Used:

- **React Hooks**: useState, useEffect, useMemo, useCallback, useSelector, useDispatch
- **Redux Patterns**: createSlice, configureStore, async thunks
- **React Router**: BrowserRouter, Routes, Route, useLocation, Link
- **CSS Modules**: Scoped styling, CSS variables, responsive design

## 🔒 Security Notes

- No authentication implemented (mock data only)
- All data stored locally in localStorage
- No sensitive information transmitted
- Safe for demo/interview purposes

## 📱 Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 14+, Chrome Mobile

## 🐛 Troubleshooting

### Dev Server Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Lost Data After Refresh
- Check browser's localStorage is enabled
- Some private browsing modes don't persist localStorage
- Use browser DevTools → Application → Local Storage to debug

### Chart Not Rendering
- Ensure Recharts is installed: `npm install recharts`
- Check responsive container has valid dimensions
- Verify data structure matches chart component expectations

## 📝 Notes

- **Mock Data**: All 75 deals generated with seeded random for consistency
- **No Backend**: Service layer simulates API delays (300-400ms)
- **Learning Focus**: Demonstrates Redux, routing, data visualization, responsive design
- **Production Ready**: Styling, performance, and UX considerations applied

## 📄 License

This project is created for educational and interview purposes.

## 🤝 Contributing

This is an interview/learning project. Feel free to:
- Add new pages or features
- Improve performance
- Enhance styling
- Add more chart types
- Implement authentication patterns

---

**Built with ❤️ using React + Vite**

For support or questions, refer to the component documentation in each file.
#   I n v e s t H u b -  
 