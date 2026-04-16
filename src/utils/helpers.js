// Format currency
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

// Format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Get risk color
export const getRiskColor = (risk) => {
  switch (risk) {
    case 'Low':
      return '#10b981';
    case 'Medium':
      return '#f59e0b';
    case 'High':
      return '#ef4444';
    default:
      return '#6366f1';
  }
};

// Get risk badge class
export const getRiskBadgeClass = (risk) => {
  switch (risk) {
    case 'Low':
      return 'badge-success';
    case 'Medium':
      return 'badge-warning';
    case 'High':
      return 'badge-error';
    default:
      return 'badge-info';
  }
};

// Calculate percentage change
export const getPercentageChange = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Debounce function
export const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Generate initials from name
export const getInitials = (name) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

// Truncate text
export const truncateText = (text, length = 50) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Sort array by key
export const sortByKey = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Group array by key
export const groupByKey = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

// Get statistics
export const getStats = (data, key) => {
  const values = data.map((item) => item[key]);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { sum, avg, min, max };
};

// Convert to CSV
export const convertToCSV = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((field) => {
          const value = row[field];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        })
        .join(',')
    ),
  ].join('\n');

  return csv;
};

// Download file
export const downloadFile = (content, filename, type = 'text/csv') => {
  const element = document.createElement('a');
  element.setAttribute('href', `data:${type};charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Check if device is mobile
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
};

// Get color palette
export const colorPalette = {
  primary: '#3b82f6',
  secondary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0ea5e9',
  light: '#f3f4f6',
  dark: '#1f2937',
};
