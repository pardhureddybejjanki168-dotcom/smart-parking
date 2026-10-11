import { useState, useCallback } from 'react';

export function usePagination(defaultSize = 10, initialPage = 0) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(defaultSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const nextPage = useCallback(() => {
    setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const goToPage = useCallback(
    (targetPage: number) => {
      if (targetPage >= 0 && targetPage < totalPages) {
        setPage(targetPage);
      }
    },
    [totalPages]
  );

  const resetPage = useCallback(() => {
    setPage(0);
  }, []);

  return {
    page,
    setPage,
    size,
    setSize,
    totalPages,
    setTotalPages,
    totalElements,
    setTotalElements,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
  };
}
