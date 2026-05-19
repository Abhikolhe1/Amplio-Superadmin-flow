import { useState, useCallback, useMemo } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { SummaryDashboardGrid } from 'src/components/summary-card';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// mock
import { _pspDetails } from 'src/_mock/_psp';
//
import PSPDetailsOverviewView from '../overview/view/psp-details-overview-view';
import PSPMerchantsTab from '../merchants/psp-merchants-tab';
import PSPDetailsActiveSettlementsView from '../active-settlements/view/psp-details-active-settlements-view';
import PSPDetailsRepaymentHistoryView from '../repayment-history/view/psp-details-repayment-history-view';
import PSPDetailsTransactionHistoryView from '../transaction-history/view/psp-details-transaction-history-view';
import PSPDetailsRiskAssessmentView from '../risk-assessment/view/psp-details-risk-assessment-view';
import { useGetPspDashboardDetails } from 'src/api/psp-master';
import PSPBankManagementView from '../bank-management/view/psp-bank-management-view';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'merchants', label: 'Merchants' },
  { value: 'active_settlements', label: 'Active Settlements' },
  { value: 'repayment_history', label: 'Repayment History' },
  { value: 'transaction_history', label: 'Transaction History' },
  { value: 'risk_assessment', label: 'Risk Assessment' },
  { value: 'bank_management', label: 'Bank Management' },
];

const SETTLED_STATUS = 'SETTLED';
const FAILED_STATUS = 'FAILED';

function formatCurrencyShort(amount) {
  const value = Number(amount) || 0;
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (absoluteValue >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function parseSettlementDays(settlementMethod) {
  if (typeof settlementMethod !== 'string') return null;

  const match = settlementMethod.match(/T\+(\d+)/i);

  return match ? Number(match[1]) : null;
}

function buildLastSixMonths() {
  const now = new Date();
  const months = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);

    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleString('en-IN', { month: 'short' }),
    });
  }

  return months;
}

function buildComputedOverview(apiData) {
  const psps = apiData?.psps || [];
  const transactions = psps.flatMap((pspItem) => pspItem?.transactions || []);
  const now = new Date();

  const settlementDays = transactions
    .map((transaction) => parseSettlementDays(transaction?.settlementMethod))
    .filter((value) => value !== null);

  const averageSettlementTime = settlementDays.length
    ? `T+${Math.round(
        settlementDays.reduce((sum, value) => sum + value, 0) / settlementDays.length
      )}`
    : '-';

  const lastSyncCandidates = [
    apiData?.updatedAt,
    ...psps.map((pspItem) => pspItem?.updatedAt),
    ...transactions.map((transaction) => transaction?.updatedAt),
  ].filter(Boolean);

  const lastSync = lastSyncCandidates.length
    ? formatDateTime(
        lastSyncCandidates.reduce((latest, current) =>
          new Date(current) > new Date(latest) ? current : latest
        )
      )
    : '-';

  const monthlyVolume = transactions.reduce((sum, transaction) => {
    if (!transaction?.createdAt) return sum;

    const createdAt = new Date(transaction.createdAt);

    if (
      createdAt.getFullYear() === now.getFullYear() &&
      createdAt.getMonth() === now.getMonth()
    ) {
      return sum + (Number(transaction?.netAmount) || 0);
    }

    return sum;
  }, 0);

  const pendingAmount = transactions.reduce((sum, transaction) => {
    const settlementStatus = String(transaction?.pspSettlementStatus || '').toUpperCase();

    if (settlementStatus && settlementStatus !== SETTLED_STATUS && settlementStatus !== FAILED_STATUS) {
      return sum + (Number(transaction?.netAmount) || 0);
    }

    return sum;
  }, 0);

  const failedTransactions = transactions.filter(
    (transaction) => String(transaction?.pspSettlementStatus || '').toUpperCase() === FAILED_STATUS
  ).length;

  const settlementMonths = buildLastSixMonths();
  const settlementTrendMap = settlementMonths.reduce((acc, month) => {
    acc[month.key] = 0;
    return acc;
  }, {});

  transactions.forEach((transaction) => {
    if (!transaction?.settlementDate) return;

    const settlementDate = new Date(transaction.settlementDate);

    if (Number.isNaN(settlementDate.getTime())) return;

    const settlementStatus = String(transaction?.pspSettlementStatus || '').toUpperCase();

    if (settlementStatus === FAILED_STATUS) return;

    const key = `${settlementDate.getFullYear()}-${String(settlementDate.getMonth() + 1).padStart(2, '0')}`;

    if (!(key in settlementTrendMap)) return;

    settlementTrendMap[key] +=
      Number(transaction?.netAmount ?? transaction?.totalRecieved ?? transaction?.amount) || 0;
  });

  return {
    statusLabel: Number(apiData?.status) === 1 ? 'Active' : 'Inactive',
    statusColor: Number(apiData?.status) === 1 ? 'primary' : 'error',
    avgSettlementTime: averageSettlementTime,
    lastSync,
    financialSummary: {
      monthlyVolume,
      totalSettlements: Number(apiData?.totalSettlement) || 0,
      pendingAmount,
      failedTransactions,
    },
    settlementTrend: {
      categories: settlementMonths.map((month) => month.label),
      series: [
        {
          name: 'Settlement',
          data: settlementMonths.map((month) => settlementTrendMap[month.key] || 0),
        },
      ],
    },
  };
}

export default function PSPDetailsView() {
  const settings = useSettingsContext();
  const { id } = useParams();
  const [currentTab, setCurrentTab] = useState('overview');
  const { psp } = useGetPspDashboardDetails(id);

  const pspData = useMemo(() => {
    const fallbackData = _pspDetails(id);
    const apiData = psp?.data || psp;

    if (!apiData) {
      return fallbackData;
    }

    const computedOverview = buildComputedOverview(apiData);
    const overviewData = {
      statusLabel: apiData?.statusLabel ?? computedOverview.statusLabel,
      avgSettlementTime: apiData?.avgSettlementTime ?? computedOverview.avgSettlementTime,
      lastSync: apiData?.lastSync ?? computedOverview.lastSync,
      financialSummary: apiData?.financialSummary ?? computedOverview.financialSummary,
      settlementTrend: apiData?.settlementTrend ?? computedOverview.settlementTrend,
    };

    const summaryCards = [
      {
        title: 'Merchant Count',
        value: apiData?.merchantCount ?? 0,
        icon: 'solar:buildings-3-bold',
      },
      {
        title: 'Total Settlement',
        value: formatCurrencyShort(apiData?.totalSettlement ?? 0),
        icon: 'solar:card-transfer-bold',
      },
      {
        title: 'Total Volume',
        value: formatCurrencyShort(apiData?.totalVolume ?? 0),
        icon: 'solar:wallet-money-bold',
      },
      {
        title: 'Active Settlements',
        value: apiData?.activeSettlements ?? 0,
        icon: 'solar:check-circle-bold',
      },
    ];

    const merchants = (apiData?.psps || [])
      .map((pspItem) => {
        const merchantProfile = pspItem?.merchantProfiles;

        if (!merchantProfile) {
          return null;
        }

        return {
          id: merchantProfile.id || pspItem.id,
          merchantName: merchantProfile.companyName || '-',
          companyName: merchantProfile.companyName || '-',
          cin: merchantProfile.CIN || '-',
          gstin: merchantProfile.GSTIN || '-',
          status: merchantProfile.isActive ? 'Active' : 'Inactive',
        };
      })
      .filter(Boolean);

    return {
      ...fallbackData,
      ...apiData,
      status: overviewData.statusLabel,
      statusColor: Number(apiData?.status) === 1 ? 'primary' : 'error',
      avgSettlementTime: overviewData.avgSettlementTime,
      lastSync: overviewData.lastSync,
      summaryCards,
      merchants,
      activeSettlements: apiData?.activeSettlements || fallbackData.activeSettlements || [],
      repaymentHistory: apiData?.repaymentHistory || fallbackData.repaymentHistory || [],
      riskAssessment: apiData?.riskAssessment || fallbackData.riskAssessment,
      financialSummary: overviewData.financialSummary,
      settlementTrend: overviewData.settlementTrend,
    };
  }, [id, psp]);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <CustomBreadcrumbs
          heading={pspData.name}
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'PSP', href: paths.dashboard.psp.root },
            { name: pspData.name },
          ]}
          sx={{ mb: 0 }}
        />

      </Stack>

      <Grid container spacing={3} sx={{ mb: { xs: 3, md: 5 } }}>
        {(pspData.summaryCards || []).map((item) => (
          <Grid xs={12} sm={6} md={3} key={item.title}>
            <SummaryDashboardGrid title={item.title} value={item.value} icon={item.icon} />
          </Grid>
        ))}
      </Grid>

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{ mb: { xs: 3, md: 5 } }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>

      {currentTab === 'overview' && <PSPDetailsOverviewView psp={pspData} />}
      {currentTab === 'merchants' && <PSPMerchantsTab merchants={pspData.merchants || []} />}
      {currentTab === 'active_settlements' && (
        <PSPDetailsActiveSettlementsView settlements={pspData.activeSettlements || []} />
      )}
      {currentTab === 'repayment_history' && (
        <PSPDetailsRepaymentHistoryView history={pspData.repaymentHistory || []} />
      )}
      {currentTab === 'transaction_history' && (
        <PSPDetailsTransactionHistoryView masterId={id} />
      )}
      {currentTab === 'risk_assessment' && (
        <PSPDetailsRiskAssessmentView assessment={pspData.riskAssessment} />
      )}
      {currentTab === 'bank_management' && <PSPBankManagementView pspId={id} />}
    </Container>
  );
}
