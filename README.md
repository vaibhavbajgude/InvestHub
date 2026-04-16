# 🚀 InvestHub – Fintech Investor Dashboard

A **modern, highly interactive fintech dashboard** built using **React + Vite + Redux Toolkit + Recharts**, designed for investors and corporates to analyze deals, track investments, and make data-driven decisions.

---

## 📌 Live Demo

🔗 *(Add your deployed link here – Vercel / Netlify)*

---

## 🧠 Project Overview

**InvestHub** is a frontend-only application that simulates a real-world investment platform.

* No backend APIs used
* All data handled via a mock service layer
* Focus on UI/UX, performance, and scalability

---

## ✨ Features

### 📊 Investor Dashboard

* Portfolio overview
* ROI & growth tracking
* Interactive charts (Line, Pie, Bar)

### 🔍 Deal Explorer

* Search with debouncing
* Multi-filter system (industry, risk, status)
* Sorting & pagination

### 🤖 Smart Recommendations

* AI-like scoring system
* Based on:

  * Risk tolerance
  * Budget
  * Industry preference
  * ROI target

### 💼 My Investments

* Track saved deals
* Active investments view
* Persistent data using localStorage

### 🏢 Corporate Dashboard

* Funding analytics
* Pipeline tracking
* Industry distribution

---

## 🛠️ Tech Stack

| Technology    | Purpose            |
| ------------- | ------------------ |
| React 18      | UI Development     |
| Vite          | Fast build tool    |
| Redux Toolkit | State Management   |
| React Router  | Routing            |
| Recharts      | Data Visualization |
| CSS Modules   | Styling            |

---

## ⚡ Performance Features

* useMemo & useCallback optimization
* Debounced search (300ms)
* Lazy rendering with pagination
* Efficient Redux state handling

---

## 📁 Folder Structure

```
src/
├── components/
├── pages/
├── store/
├── services/
├── data/
├── App.jsx
├── main.jsx
```

---

## 🚀 Getting Started

### 1️⃣ Clone Repository

```bash
git clone https://github.com/vaibhavbajgude/InvestHub.git
cd InvestHub
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Run Development Server

```bash
npm run dev
```

👉 Open: http://localhost:5173

---

## 📦 Build for Production

```bash
npm run build
npm run preview
```

---

## 📊 Data Handling

* Mock dataset (75+ deals)
* Simulated API delay (300–400ms)
* Local storage used for:

  * Preferences
  * Saved deals
  * Theme

---

## 🧮 Recommendation Logic

Score out of **100%** based on:

* Risk Matching → 30%
* Industry Match → 25%
* Budget Fit → 20%
* ROI Attractiveness → 25%

---

## 🎨 UI Features

* Fully responsive design 📱
* Dark/Light mode 🌙
* Clean fintech-style UI
* Reusable components

---

## 🔒 Notes

* No authentication (demo purpose)
* No backend required
* Safe for interview/demo usage

---

## 🐛 Troubleshooting

### If app not starting:

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 🎯 Learning Highlights

* Advanced React patterns
* Redux architecture
* Data visualization
* Scalable frontend design

---

## 📄 License

This project is for **educational & interview purposes only**.

---

## 🙌 Author

**Vaibhav Bajgude**

---

⭐ If you like this project, give it a star on GitHub!
