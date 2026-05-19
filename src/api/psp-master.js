import { useMemo, useCallback } from 'react';
import { endpoints, fetcher } from 'src/utils/axios';
import useSWR from 'swr';

function normalizePspListResponse(response) {
  const data = response?.data?.profiles || response?.data || response || [];
  const count = response?.data?.count || response?.count || {};

  return {
    rows: Array.isArray(data) ? data : [],
    count,
  };
}

export function useGetPsp() {
  const URL = endpoints.pspMaster.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      psp: data || [],
      pspLoading: isLoading,
      pspError: error,
      pspValidating: isValidating,
      pspEmpty: !isLoading && !data?.length,
    }),
    [data, isLoading, error, isValidating]
  );

  return memoizedValue;
}

export function useGetPspData() {
  const URL = endpoints.pspMaster.dashboard;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  const { rows, count } = normalizePspListResponse(data);

  const memoizedValue = useMemo(
    () => ({
      pspData: rows,
      totalCount: count,
      pspDataLoading: isLoading,
      pspDataError: error,
      pspDataValidating: isValidating,
      pspDataEmpty: !isLoading && !rows.length,
    }),
    [rows, count, isLoading, error, isValidating]
  );

  return memoizedValue;
}

export function useFilterPspData(params) {
  let URL = endpoints.pspMaster.dashboard;

  if (params.filter) {
    URL = endpoints.pspMaster.filterList(params.filter);
  }

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });
  const { rows, count } = normalizePspListResponse(data);

  return useMemo(
    () => ({
      filteredPspData: rows,
      totalCount: count,
      filterLoading: isLoading,
      filterError: error,
      filterValidating: isValidating,
      filterEmpty: !isLoading && !rows.length,
    }),
    [rows, count, error, isLoading, isValidating]
  );
}

export function useGetPspDashboardDetails(pspId) {
  const URL = pspId ? endpoints.pspMaster.dashboardDetails(pspId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  return useMemo(
    () => ({
      psp: data || null,
      pspLoading: isLoading,
      pspError: error,
      pspValidating: isValidating,
    }),
    [data, isLoading, error, isValidating]
  );
}

// ----------------------------------------------------------------------

export function useGetPspDetails(pspId) {
  const URL = pspId ? endpoints.pspMaster.details(pspId) : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      psp: data,
      pspLoading: isLoading,
      pspError: error,
      pspValidating: isValidating,
    }),
    [data, isLoading, error, isValidating]
  );

  return memoizedValue;
}

export function useGetPspTransactions(masterId, params = {}) {
  const URL = masterId ? [endpoints.pspMaster.transactions(masterId), { params }] : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  return useMemo(
    () => ({
      transactions: data?.rows || [],
      totalCount: data?.count || 0,
      transactionsLoading: isLoading,
      transactionsError: error,
      transactionsValidating: isValidating,
    }),
    [data, isLoading, error, isValidating]
  );
}

export function useGetPspBankDetails(pspId) {
  const URL = pspId ? endpoints.pspMaster.bankDetails(String(pspId)) : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const refreshBankDetails = useCallback(() => {
    mutate();
  }, [mutate]);

  return useMemo(
    () => ({
      bankDetails: data?.bankDetails || [],
      bankDetailsLoading: isLoading,
      bankDetailsError: error,
      bankDetailsValidating: isValidating,
      bankDetailsEmpty: !isLoading && (!data?.bankDetails || data.bankDetails.length === 0),
      refreshBankDetails,
    }),
    [data, isLoading, error, isValidating]
  );
}
