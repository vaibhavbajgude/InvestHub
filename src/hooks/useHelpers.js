import { useCallback } from 'react';
import { debounce as debounceFunc } from './helpers';

export const useDebounce = (callback, delay = 500) => {
  return useCallback(debounceFunc(callback, delay), [callback, delay]);
};

export const usePagination = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  return {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
  };
};
