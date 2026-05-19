import { useMemo } from 'react';
import useSWR from 'swr';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';

export function useGetSpvManagementSummary() {
  const URL = endpoints.spvManagement.summary;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  return useMemo(
    () => ({
      summary: data?.data || null,
      summaryLoading: isLoading,
      summaryError: error,
      summaryValidating: isValidating,
      refreshSummary: mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );
}

export function useGetSpvManagementList() {
  const URL = endpoints.spvManagement.list;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  return useMemo(
    () => ({
      spvList: data?.data || [],
      spvListLoading: isLoading,
      spvListError: error,
      spvListValidating: isValidating,
      spvListEmpty: !isLoading && !(data?.data || []).length,
      refreshSpvList: mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );
}

export function useGetSpvManagementPools(spvId) {
  const URL = spvId ? endpoints.spvManagement.pools(spvId) : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  return useMemo(
    () => ({
      pools: data?.data || [],
      poolsLoading: isLoading,
      poolsError: error,
      poolsValidating: isValidating,
      poolsEmpty: !isLoading && !(data?.data || []).length,
      refreshPools: mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );
}

export function useGetSpvUnallocatedFunds(spvId) {
  const URL = spvId
    ? [endpoints.spvManagement.unallocatedFunds, { params: { spvId, limit: 200 } }]
    : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const rows = (data?.data || []).filter(
    (item) => item.status === 'VERIFIED' || item.status === 'AUTO_VERIFIED'
  );

  return useMemo(
    () => ({
      unallocatedFunds: rows,
      unallocatedFundsLoading: isLoading,
      unallocatedFundsError: error,
      unallocatedFundsValidating: isValidating,
      unallocatedFundsEmpty: !isLoading && !rows.length,
      refreshUnallocatedFunds: mutate,
    }),
    [rows, error, isLoading, isValidating, mutate]
  );
}

async function fetchSpvManagementPoolDetails(poolId) {
  if (!poolId) {
    return { pool: null, spv: null };
  }

  const listResponse = await axiosInstance.get(endpoints.spvManagement.list);
  const spvList = listResponse?.data?.data || [];

  if (!spvList.length) {
    return { pool: null, spv: null };
  }

  const poolCollections = await Promise.all(
    spvList.map(async (spv) => {
      const poolResponse = await axiosInstance.get(endpoints.spvManagement.pools(spv.spvId));

      return {
        spv,
        pools: poolResponse?.data?.data || [],
      };
    })
  );

  for (const collection of poolCollections) {
    const matchedPool = collection.pools.find((item) => item.poolId === poolId);

    if (matchedPool) {
      return {
        pool: matchedPool,
        spv: collection.spv,
      };
    }
  }

  return { pool: null, spv: null };
}

export function useGetSpvManagementPoolDetails(poolId) {
  const { data, isLoading, error, isValidating, mutate } = useSWR(
    poolId ? ['spv-management-pool-details', poolId] : null,
    () => fetchSpvManagementPoolDetails(poolId),
    {
      keepPreviousData: true,
    }
  );

  return useMemo(
    () => ({
      pool: data?.pool || null,
      spv: data?.spv || null,
      poolDetailsLoading: isLoading,
      poolDetailsError: error,
      poolDetailsValidating: isValidating,
      refreshPoolDetails: mutate,
    }),
    [data?.pool, data?.spv, error, isLoading, isValidating, mutate]
  );
}

export async function createNewPoolApplication(spvId) {
  const URL = endpoints.spvManagement.newPoolApplication(spvId);
  const res = await axiosInstance.post(URL);
  return res.data;
}
