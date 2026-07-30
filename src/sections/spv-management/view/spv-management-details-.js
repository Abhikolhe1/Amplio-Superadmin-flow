import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useMemo, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
// routes
import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hook';
// components
import { SummaryDashboardGrid } from 'src/components/summary-card';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSnackbar } from 'src/components/snackbar';
//
import { ClosedTransactionsListView } from '../closed-transactions/view';
import SpvEscrowAccountView from '../escrow-account';
import SPVDetailsOverviewView from '../spv-details-overview';
import { PoolPtcListView } from '../pool-ptc/view';
import RefundComplaintsListView from '../refund-complaints/view/refund-complaints-list-view';
import RejectedOrdersListView from '../rejected-orders/view/rejected-orders-list-view';
import { TransactionHistoryListView } from '../transaction-history/view';
import { UnallocatedFundsListView } from '../unallocated-funds/view';
import {
  createNewPoolApplication,
  approveSpvManagementPaymentVerification,
  getSpvManagementPaymentVerificationDetails,
  useGetSpvManagementComplaints,
  useGetSpvManagementList,
  useGetSpvManagementOrders,
  useGetSpvManagementPools,
  useGetSpvUnallocatedFunds,
  updateSpvManagementComplaint,
  useGetSpvPoolTransactions,
} from 'src/api/spvManagement';
import { buildSpvDetails, buildSpvPoolRows } from '../utils';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'escrow_account', label: 'Escrow Account' },
  { value: 'pool_ptc', label: 'Pool & PTC' },
  { value: 'transaction_history', label: 'Transaction History' },
  { value: 'unallocated_funds', label: 'Unallocated Funds' },
  { value: 'complaints', label: 'Complaints' },
  { value: 'rejected_orders', label: 'Orders' },
  { value: 'closed_transactions', label: 'Closed Transactions' },
];

export default function SPVDetailsView() {
  const settings = useSettingsContext();
  const { id } = useParams();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const [currentTab, setCurrentTab] = useState(tab || 'overview');
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const { spvList, spvListLoading, spvListError } = useGetSpvManagementList();
  const { pools, poolsLoading, poolsError } = useGetSpvManagementPools(id);
  const { unallocatedFunds, unallocatedFundsLoading, unallocatedFundsError } =
    useGetSpvUnallocatedFunds(id);
  const { complaints, complaintsLoading, complaintsError } = useGetSpvManagementComplaints(id);
  const { orders, ordersLoading, ordersError, refreshOrders } = useGetSpvManagementOrders(id);
  const apiSpv = useMemo(() => spvList.find((item) => item.spvId === id), [id, spvList]);
  const spv = useMemo(() => buildSpvDetails(apiSpv), [apiSpv]);
  const { transactions, transactionsLoading } = useGetSpvPoolTransactions(id, spv?.name);
  const mappedPools = useMemo(() => buildSpvPoolRows(pools), [pools]);
  const [refundComplaints, setRefundComplaints] = useState([]);
  const [rejectedOrdersState, setRejectedOrdersState] = useState([]);
  const summaryCards = spv?.summaryCards || [];

  useEffect(() => {
    setRefundComplaints(complaints);
  }, [complaints]);

  useEffect(() => {
    setRejectedOrdersState(orders);
  }, [orders]);

  const handleChangeTab = useCallback(
    (_event, newValue) => {
      setCurrentTab(newValue);
      router.push({
        search: `?tab=${newValue}`,
      });
    },
    [router]
  );

  const handleCreatePool = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setIsCreatingPool(true);
      const response = await createNewPoolApplication(id);
      const applicationId = response?.application?.id;

      if (!applicationId) {
        throw new Error('New pool application was created but no application id was returned.');
      }

      enqueueSnackbar(response?.message || 'New Pool Application created', { variant: 'success' });
      router.push(paths.dashboard.spvkyc.details(applicationId));
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    } finally {
      setIsCreatingPool(false);
    }
  }, [enqueueSnackbar, id, router]);

  const handleViewPool = useCallback(
    (row) => {
      router.push(paths.dashboard.spvManagement.poolDetails(row.id));
    },
    [router]
  );

  const handleUpdateComplaint = useCallback(
    async (complaintId, updates) => {
      try {
        const updatedComplaint = await updateSpvManagementComplaint(complaintId, updates);

        setRefundComplaints((prev) =>
          prev.map((complaint) => (complaint.id === complaintId ? updatedComplaint : complaint))
        );

        enqueueSnackbar('Complaint updated successfully', { variant: 'success' });

        return updatedComplaint;
      } catch (error) {
        enqueueSnackbar(getErrorMessage(error, 'Unable to update complaint.'), {
          variant: 'error',
        });
        throw error;
      }
    },
    [enqueueSnackbar]
  );

  const handleRejectedOrderDecision = useCallback(
    async (orderId, updates) => {
      try {
        if (updates?.decidedAction === 'allocate') {
          const verificationId = updates?.verificationId;

          if (!verificationId) {
            throw new Error('This order has no linked verification to approve.');
          }

          await approveSpvManagementPaymentVerification(verificationId, updates.verifiedAmount);
          await refreshOrders?.();
          enqueueSnackbar('Manual allocation approved successfully.', { variant: 'success' });
          return;
        }

        if (updates?.decidedAction === 'refund') {
          const supportId = updates?.supportId;

          if (!supportId) {
            throw new Error('No linked refund complaint was found for this order.');
          }

          const responseText =
            updates?.resolutionNote?.trim() || 'Refund review completed by superadmin.';

          const updatedComplaint = await updateSpvManagementComplaint(supportId, {
            status: 'RESOLVED',
            adminResponse: responseText,
            assignSuperAdmin: true,
          });

          setRefundComplaints((prev) =>
            prev.map((complaint) => (complaint.id === supportId ? updatedComplaint : complaint))
          );
          enqueueSnackbar('Refund complaint resolved successfully.', { variant: 'success' });
        }

        setRejectedOrdersState((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  ...updates,
                }
              : order
          )
        );
      } catch (decisionError) {
        enqueueSnackbar(getErrorMessage(decisionError, 'Unable to process this order action.'), {
          variant: 'error',
        });
        throw decisionError;
      }
    },
    [enqueueSnackbar, refreshOrders]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'SPV Management', href: paths.dashboard.spvManagement.list },
          { name: spv?.name || 'SPV Details' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3} sx={{ mb: { xs: 3, md: 5 } }}>
        {summaryCards.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <SummaryDashboardGrid title={item.title} value={item.value} icon={item.icon} />
          </Grid>
        ))}
      </Grid>

      {spvListError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {getErrorMessage(spvListError, 'Unable to load SPV details.')}
        </Alert>
      )}

      {!spvListLoading && !spv && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          The selected SPV could not be found in the management list.
        </Alert>
      )}

      <Tabs value={currentTab} onChange={handleChangeTab} sx={{ mb: { xs: 3, md: 5 } }}>
        {TABS.map((item) => (
          <Tab key={item.value} value={item.value} label={item.label} />
        ))}
      </Tabs>

      {currentTab === 'overview' && <SPVDetailsOverviewView spvINR={spv} />}
      {currentTab === 'escrow_account' && <SpvEscrowAccountView escrow={spv?.escrowAccount} />}
      {currentTab === 'pool_ptc' && (
        <PoolPtcListView
          pools={mappedPools}
          canCreateNewPool={spv?.canCreateNewPool}
          pendingPoolApplications={spv?.pendingPoolApplications}
          poolsLoading={poolsLoading}
          poolsError={poolsError}
          onCreatePool={handleCreatePool}
          isCreatingPool={isCreatingPool}
          conversions={[]}
          onViewRow={handleViewPool}
        />
      )}
      {currentTab === 'transaction_history' && (
        <TransactionHistoryListView transactions={transactions} />
      )}
      {currentTab === 'unallocated_funds' && (
        <UnallocatedFundsListView
          transactions={unallocatedFunds}
          loading={unallocatedFundsLoading}
          error={unallocatedFundsError}
        />
      )}
      {currentTab === 'complaints' && (
        <RefundComplaintsListView
          complaints={refundComplaints}
          loading={complaintsLoading}
          error={complaintsError}
          onUpdateComplaint={handleUpdateComplaint}
        />
      )}
      {currentTab === 'rejected_orders' && (
        <RejectedOrdersListView
          orders={rejectedOrdersState}
          loading={ordersLoading}
          error={ordersError}
          onDecision={handleRejectedOrderDecision}
          complaints={refundComplaints}
          onLoadVerificationDetails={getSpvManagementPaymentVerificationDetails}
        />
      )}
      {currentTab === 'closed_transactions' && (
        <ClosedTransactionsListView transactions={[]} />
      )}
    </Container>
  );
}

function getErrorMessage(error, fallback = 'Something went wrong') {
  if (typeof error === 'string') {
    return error;
  }

  return error?.message || error?.error?.message || fallback;
}
