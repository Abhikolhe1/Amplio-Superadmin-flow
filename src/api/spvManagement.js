import { useMemo } from 'react';
import useSWR from 'swr';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';

function getComplaintInvestorName(investorProfile) {
  if (!investorProfile) {
    return '-';
  }

  return (
    investorProfile.companyName ||
    investorProfile.fullName ||
    investorProfile.name ||
    investorProfile.email ||
    '-'
  );
}

function mapSpvManagementComplaint(item) {
  const order = item?.order || {};
  const investorProfile = item?.investorProfile || {};
  const issueType = item?.issueType || '-';
  const complaintDescription = item?.complaintDescription || '';

  return {
    ...item,
    investorName: getComplaintInvestorName(investorProfile),
    amount: Number(order.investmentAmount || 0),
    units: order.requestedUnits ?? 0,
    shortDescription: issueType,
    description: complaintDescription,
    orderId: item?.orderId || order?.id || '-',
    spvId: order?.spvId || null,
    spvName: order?.spvId || '-',
    attachmentName: item?.attachmentMedia?.fileOriginalName || item?.attachmentMedia?.fileName || '-',
    attachmentUrl: item?.attachmentMedia?.fileUrl || '',
    adminResponse: item?.adminResponse || '',
    superAdminId: item?.superAdminId || null,
  };
}

function mapSpvManagementRejectedOrder(item) {
  return {
    ...item,
    investorName: item?.investorName || '-',
    investorId: item?.investorId || item?.investorProfileId || '-',
    orderId: item?.orderId || item?.id || '-',
    transactionId: item?.transactionId || '-',
    amount: Number(item?.amount || item?.investmentAmount || 0),
    requestedUnits: item?.requestedUnits ?? 0,
    rejectedReason: item?.rejectedReason || item?.cancellationReason || '-',
    paymentValidation: 'Validated',
    paymentReference: item?.transactionId || '-',
    bankAccount: '-',
    rejectedAt: item?.rejectedAt || item?.resolvedAt || item?.updatedAt || item?.createdAt,
    status: item?.status || 'CANCELLED',
    recommendedAction: 'Approve Refund',
    replacementPool: '-',
    reallocationUnits: 0,
    notes: item?.rejectedReason || item?.cancellationReason || 'Cancelled order under review.',
    validationChecks: [
      { id: 'check-1', label: 'Order status marked as cancelled', completed: true },
      { id: 'check-2', label: 'Investment amount captured for review', completed: true },
    ],
    spvName: item?.spvName || '-',
  };
}

function mapSpvManagementOrder(item) {
  return {
    ...item,
    orderId: item?.id || '-',
    investorName: item?.investorName || '-',
    investorEmail: item?.investorEmail || '-',
    amount: Number(item?.investmentAmount || 0),
    requestedUnits: item?.requestedUnits ?? 0,
    allocatedUnits: item?.allocatedUnits ?? null,
    verificationId: item?.verificationId || null,
    paymentReference: item?.transactionId || '-',
    transactionId: item?.transactionId || '-',
    status: item?.status || '-',
    rejectedReason: item?.cancellationReason || '-',
    createdAt: item?.createdAt || null,
    allocatedAt: item?.allocatedAt || null,
  };
}

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

export function useGetSpvManagementComplaints(spvId) {
  const URL = spvId
    ? [endpoints.spvManagement.complaints, { params: { spvId, limit: 200 } }]
    : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const complaints = useMemo(
    () => (data?.data || []).map(mapSpvManagementComplaint),
    [data?.data]
  );

  return useMemo(
    () => ({
      complaints,
      complaintsLoading: isLoading,
      complaintsError: error,
      complaintsValidating: isValidating,
      refreshComplaints: mutate,
    }),
    [complaints, error, isLoading, isValidating, mutate]
  );
}

export function useGetSpvManagementRejectedOrders(spvId) {
  const URL = spvId
    ? [endpoints.spvManagement.rejectedOrders, { params: { spvId, limit: 200 } }]
    : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const rejectedOrders = useMemo(
    () => (data?.data || []).map(mapSpvManagementRejectedOrder),
    [data?.data]
  );

  return useMemo(
    () => ({
      rejectedOrders,
      rejectedOrdersLoading: isLoading,
      rejectedOrdersError: error,
      rejectedOrdersValidating: isValidating,
      refreshRejectedOrders: mutate,
    }),
    [rejectedOrders, error, isLoading, isValidating, mutate]
  );
}

export function useGetSpvManagementOrders(spvId) {
  const URL = spvId
    ? [endpoints.spvManagement.investmentOrders, { params: { spvId, limit: 200 } }]
    : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const orders = useMemo(() => (data?.data || []).map(mapSpvManagementOrder), [data?.data]);

  return useMemo(
    () => ({
      orders,
      ordersLoading: isLoading,
      ordersError: error,
      ordersValidating: isValidating,
      refreshOrders: mutate,
    }),
    [orders, error, isLoading, isValidating, mutate]
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

export async function updateSpvManagementComplaint(supportId, payload) {
  const URL = endpoints.spvManagement.complaintDetails(supportId);
  const res = await axiosInstance.patch(URL, payload);

  return mapSpvManagementComplaint(res?.data?.data || {});
}

export async function getSpvManagementPaymentVerificationDetails(verificationId) {
  const URL = endpoints.spvManagement.paymentVerificationDetails(verificationId);
  const res = await axiosInstance.get(URL);
  return res?.data?.data || null;
}

export async function approveSpvManagementPaymentVerification(verificationId, verifiedAmount) {
  const URL = endpoints.spvManagement.approvePaymentVerification(verificationId);
  const res = await axiosInstance.post(URL, { verifiedAmount });
  return res?.data?.data || null;
}
