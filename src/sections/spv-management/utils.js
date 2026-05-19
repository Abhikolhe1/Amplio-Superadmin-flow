import { fDate, fDateTime } from 'src/utils/format-time';

export function formatInrCurrency(value, options = {}) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  });

  return formatter.format(Number(value) || 0);
}

export function formatPercentValue(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return `${Number(value)}%`;
}

export function formatMaturityDate(value) {
  return value ? fDate(value) : '-';
}

export function formatSpvDate(value) {
  return value ? fDate(value) : '-';
}

function formatEscrowEnum(value) {
  if (!value) {
    return '-';
  }

  return String(value)
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatSpvTime(value) {
  return value ? fDateTime(value, 'p') : '-';
}

export function formatInrNumber(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return Number(value).toLocaleString('en-IN');
}

export function getSpvStatusColor(status) {
  const normalizedStatus = String(status || '').toLowerCase();

  if (normalizedStatus === 'active') {
    return 'success';
  }

  if (normalizedStatus === 'pending') {
    return 'warning';
  }

  if (normalizedStatus === 'draft') {
    return 'info';
  }

  if (normalizedStatus === 'closed') {
    return 'default';
  }

  return 'default';
}

export function getPendingPoolApplicationLabel(count) {
  const totalPending = Number(count) || 0;

  if (!totalPending) {
    return 'No pending applications';
  }

  return `${totalPending} pending application${totalPending > 1 ? 's' : ''}`;
}

export function buildSpvDetails(apiSpv) {
  if (!apiSpv) {
    return null;
  }

  const escrowAccount = apiSpv.escrowAccount
    ? {
        ...apiSpv.escrowAccount,
        accountLabel: 'Escrow Account',
        accountNumber:
          apiSpv.escrowAccount.maskedAccountNumber || apiSpv.escrowAccount.accountNumber || '-',
        currentBalance: formatInrNumber(apiSpv.escrowAccount.currentBalance),
        branch: apiSpv.escrowAccount.branchDetails || '-',
        accountType: 'Operational',
        openedOn: '-',
        summary: [
          {
            label: 'Total Credits',
            value: formatInrCurrency(apiSpv.escrowAccount.totalCredits),
          },
          {
            label: 'Total Debits',
            value: formatInrCurrency(apiSpv.escrowAccount.totalDebits),
          },
          {
            label: 'Net Balance',
            value: formatInrCurrency(apiSpv.escrowAccount.currentBalance),
          },
        ],
        recentTransactions: (apiSpv.escrowAccount.recentTransactions || []).map(
          (transaction, index) => ({
            id:
              transaction.referenceMovementId ||
              `${transaction.transactionType || 'movement'}-${index + 1}`,
            counterparty: `${formatEscrowEnum(transaction.direction)} - ${formatEscrowEnum(
              transaction.transactionType
            )}`,
            amount: formatInrCurrency(transaction.amount),
            type:
              String(transaction.direction || '').toUpperCase() === 'DEBIT'
                ? 'Outflow'
                : 'Inflow',
            date: transaction.createdAt ? fDate(transaction.createdAt) : '-',
            time: formatSpvTime(transaction.createdAt),
            utr: transaction.referenceMovementId || '-',
          })
        ),
      }
    : null;

  return {
    ...apiSpv,
    id: apiSpv.spvId,
    incorporatedOn: formatSpvDate(apiSpv.incorporationDate),
    escrowAccount,
    summaryCards: [
      {
        title: 'Funds Under Management',
        value: formatInrCurrency(apiSpv.outstandingValue),
        icon: 'solar:chart-square-bold',
      },
      {
        title: 'Active PTCs',
        value: apiSpv.activePTC ?? '-',
        icon: 'solar:document-text-bold',
      },
      {
        title: 'Active Investors',
        value: apiSpv.activeInvestors ?? '-',
        icon: 'solar:users-group-rounded-bold',
      },
      {
        title: 'Reserve Fund',
        value: formatInrCurrency(apiSpv.reserveFund),
        icon: 'solar:shield-check-bold',
      },
    ],
    overviewFinancialSummary: {
      totalFum: formatInrNumber(apiSpv.outstandingValue),
      activeDeployment: formatInrNumber(apiSpv.currentPoolOutstanding),
      reserveFund: formatInrNumber(apiSpv.reserveFund),
      investors: apiSpv.activeInvestors ?? '-',
    },
  };
}

export function buildSpvPoolRows(apiPools = []) {
  return apiPools.map((pool, index) => {
    return {
      ...pool,
      id: pool.poolId,
      name: `Pool ${index + 1}`,
      subtitle: pool.applicationId || pool.poolId,
      poolValue: formatInrCurrency(pool.poolLimit),
      ptcsIssued: '-',
      merchants: '-',
    };
  });
}

