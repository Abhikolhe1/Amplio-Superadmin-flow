import { _mock } from './_mock';

// ----------------------------------------------------------------------

export const PSP_STATUS_OPTIONS = [
  { value: '1', label: 'Active', color: 'success' },
  { value: '0', label: 'Inactive', color: 'error' },
];

export const PSP_RISK_OPTIONS = [
  { value: 'low', label: 'Low', color: 'success' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' },
];

export const _pspList = [
  {
    id: 'psp_1',
    name: 'Razorpay',
    status: 'active',
    riskLevel: 'low',
    merchantsCount: 1250,
    totalSettlement: 450.5,
    transactionVolume: 125000,
    activeSettlements: 45,
    avgSettlementTime: 'T+1',
    lastSync: '2 mins ago',
    integrationType: 'API v2',
    foundedYear: 2014,
    headquarters: 'Bangalore, India',
    description: 'Razorpay is the only payments solution in India that allows businesses to accept, process and disburse payments with its product suite.',
  },
  {
    id: 'psp_2',
    name: 'PhonePe',
    status: 'active',
    riskLevel: 'medium',
    merchantsCount: 850,
    totalSettlement: 320.8,
    transactionVolume: 95000,
    activeSettlements: 32,
    avgSettlementTime: 'T+1',
    lastSync: '15 mins ago',
    integrationType: 'SDK / Webhook',
    foundedYear: 2015,
    headquarters: 'Mumbai, India',
    description: 'PhonePe is a digital payments and financial services company that offers a UPI-based platform for merchants and customers.',
  },
  {
    id: 'psp_3',
    name: 'Paytm',
    status: 'inactive',
    riskLevel: 'high',
    merchantsCount: 2100,
    totalSettlement: 680.2,
    transactionVolume: 210000,
    activeSettlements: 12,
    avgSettlementTime: 'T+2',
    lastSync: '1 hour ago',
    integrationType: 'Direct Integration',
    foundedYear: 2010,
    headquarters: 'Noida, India',
    description: 'Paytm is an Indian multinational financial technology company specializing in digital payments and financial services.',
  },
  {
    id: 'psp_4',
    name: 'Cashfree',
    status: 'active',
    riskLevel: 'low',
    merchantsCount: 450,
    totalSettlement: 150.4,
    transactionVolume: 42000,
    activeSettlements: 18,
    avgSettlementTime: 'T+1',
    lastSync: '5 mins ago',
    integrationType: 'API v3',
    foundedYear: 2015,
    headquarters: 'Bangalore, India',
    description: 'Cashfree Payments is a leading payment and API banking solutions company in India.',
  },
  {
    id: 'psp_5',
    name: 'Instamojo',
    status: 'active',
    riskLevel: 'medium',
    merchantsCount: 320,
    totalSettlement: 85.6,
    transactionVolume: 28000,
    activeSettlements: 10,
    avgSettlementTime: 'T+2',
    lastSync: '30 mins ago',
    integrationType: 'Web Widget',
    foundedYear: 2012,
    headquarters: 'Bangalore, India',
    description: 'Instamojo is an Indian-based growth-on-demand platform for MSMEs to start, manage and grow their business online.',
  }
];

export const _pspDetails = (id) => {
  const psp = _pspList.find((item) => item.id === id) || _pspList[0];

  const multiplier = psp.id === 'psp_1' ? 1.5 : (psp.id === 'psp_3' ? 2 : 1);

  const summary = {
    totalPsps: _pspList.length,
    totalMerchants: 760,
    totalSettlement: 'INR 4.94 Cr',
    activeSettlements: 149,
  };

  return {
    ...psp,
    financialSummary: {
      monthlyVolume: 120 * multiplier,
      totalSettlements: 105 * multiplier,
      pendingAmount: 15 * multiplier,
      failedTransactions: Math.floor(10 * multiplier),
    },
    settlementTrend: {
      categories: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      series: [
        {
          name: 'Settlement',
          data: [100, 115, 122, 138, 130, 140].map((v) => v * multiplier)
        }
      ]
    },
    merchants: [
      { id: `m_${psp.id}_1`, name: 'Smilewave', volume: `${(12.5 * multiplier).toFixed(1)} Cr`, status: 'active' },
      { id: `m_${psp.id}_2`, name: 'Alpha Traders', volume: `${(8.2 * multiplier).toFixed(1)} Cr`, status: 'active' },
      { id: `m_${psp.id}_3`, name: 'Global Retail', volume: `${(15.1 * multiplier).toFixed(1)} Cr`, status: 'active' },
    ],
    activeSettlements: [
      { id: `SET-${psp.id}-001`, date: 'Mar 10, 2026', amount: `${(1.2 * multiplier).toFixed(1)} Cr`, status: 'Processing' },
      { id: `SET-${psp.id}-002`, date: 'Mar 11, 2026', amount: `${(0.8 * multiplier).toFixed(1)} Cr`, status: 'Pending' },
      { id: `SET-${psp.id}-003`, date: 'Mar 12, 2026', amount: `${(2.1 * multiplier).toFixed(1)} Cr`, status: 'Initiated' },
    ],
    repaymentHistory: [
      { id: `REP-${psp.id}-101`, date: 'Mar 1, 2026', amount: `${(15.5 * multiplier).toFixed(1)} Cr`, status: 'Completed' },
      { id: `REP-${psp.id}-102`, date: 'Feb 1, 2026', amount: `${(14.2 * multiplier).toFixed(1)} Cr`, status: 'Completed' },
      { id: `REP-${psp.id}-103`, date: 'Jan 1, 2026', amount: `${(16.8 * multiplier).toFixed(1)} Cr`, status: 'Completed' },
    ],
    transactionHistory: [
      { id: `TXN-${psp.id}-501`, date: 'Mar 10, 2026', count: Math.floor(4500 * multiplier), volume: `${(2.1 * multiplier).toFixed(1)} Cr` },
      { id: `TXN-${psp.id}-502`, date: 'Mar 09, 2026', count: Math.floor(4200 * multiplier), volume: `${(1.9 * multiplier).toFixed(1)} Cr` },
      { id: `TXN-${psp.id}-503`, date: 'Mar 08, 2026', count: Math.floor(4800 * multiplier), volume: `${(2.3 * multiplier).toFixed(1)} Cr` },
    ],
    riskAssessment: {
      score: 8.5,
      riskLevel: 'Low Risk',
      lastAssessed: '1 hour ago',
      factors: [
        { name: 'Settlement Success Rate', value: 99.2, status: 'Excellent' },
        { name: 'Payment Processing Time', value: 95.5, status: 'Good' },
        { name: 'Transaction Volume Stability', value: 88, status: 'Fair' },
        { name: 'API Uptime', value: 99.8, status: 'Excellent' }
      ],
      recentEvents: []
    },
    summary,
    summaryCards: [
      {
        title: 'Total PSPs',
        value: summary.totalPsps,
        icon: 'solar:card-bold',
      },
      {
        title: 'Total Merchants',
        value: summary.totalMerchants,
        icon: 'solar:buildings-3-bold',
      },
      {
        title: 'Total Settlement',
        value: summary.totalSettlement,
        icon: 'solar:graph-up-bold',
      },
      {
        title: 'Active Settlements',
        value: summary.activeSettlements,
        icon: 'solar:danger-circle-bold',
      },
    ],
  };
};
