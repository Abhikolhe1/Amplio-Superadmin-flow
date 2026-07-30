import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
// @mui
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
// routes
import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// mock
import { _merchantDetailsList } from 'src/_mock/_merchantDetails';
//
import { useGetMerchantProfile, useGetMerchantSettlements } from 'src/api/merchant-profiles';
import MerchantDetailsBasicInfoView from '../basic-info/view/merchant-details-basic-info-view';
import MerchantDetailsDocumentsView from '../documents/view/merchant-details-documents-view';
import MerchantDetailsBankView from '../bank/view/merchant-details-bank-view';
import UbosListView from '../ubo/view/kyc-ubo-list-view';
import MerchantDetailsReceivableView from '../receivable/view/merchant-details-receivable-view';
import MerchantDetailsSettlementView from '../settlement/view/merchant-details-settlement-view';
import MerchantDetailsAuditTrailView from '../audit-trail/view/merchant-details-audit-trail-view';
import MerchantDetailsRiskView from '../risk/view/merchant-details-risk-view';
import MerchantDetailsFraudView from '../fraud/view/merchant-details-fraud-view';
import MerchantDetailsLiquidityView from '../liquidity/view/merchant-details-liquidity-view';
import { PSPListView } from '../psp/view';
import MerchantSummaryCards from '../summary/merchant-summary-cards';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'basic', label: 'Basic Info' },
  { value: 'documents', label: 'Documents' },
  { value: 'bank', label: 'Bank Details' },
  { value: 'ubo', label: 'UBO Details' },
  { value: 'psp', label: 'PSP Details' },
  { value: 'receivables', label: 'Receivables' },
  { value: 'settlement', label: 'Settlement' },
  { value: 'risk', label: 'Risk' },
  { value: 'fraud', label: 'Fraud/AML' },
  { value: 'liquidity', label: 'Liquidity' },
  { value: 'audit_trail', label: 'Audit Trail' },
];

export default function MerchantDetailsView() {
  const settings = useSettingsContext();
  const { id } = useParams();
  const router = useRouter();
  const [searchParams] = useSearchParams();

  const { merchantProfile, merchantProfileLoading, refreshProfilesDetails } =
    useGetMerchantProfile(id);
  const { settlements, settlementsLoading } = useGetMerchantSettlements(id);

  const merchantDetail = merchantProfile?.data;

  // Find mock data for this merchant or fallback to first one for demo purposes
  const mockMerchant = useMemo(() => 
    _merchantDetailsList.find((m) => m.id === id) || _merchantDetailsList[0],
  [id]);

  const merchantData = useMemo(() => ({
    ...merchantDetail,
    ...mockMerchant,
    // Ensure we don't override important API data if it exists
    ...merchantDetail?.liquidity && { liquidity: merchantDetail.liquidity },
    ...merchantDetail?.risk && { risk: merchantDetail.risk },
    ...merchantDetail?.fraudAML && { fraudAML: merchantDetail.fraudAML },
    ...merchantDetail?.receivablesSummary && { receivablesSummary: merchantDetail.receivablesSummary },
    ...merchantDetail?.receivables && { receivables: merchantDetail.receivables },
    ...merchantDetail?.auditTrail && { auditTrail: merchantDetail.auditTrail },
    settlements: (settlements && settlements.list && settlements.list.length > 0) ? settlements : mockMerchant.settlements,
    ...merchantDetail?.receivable && { receivable: merchantDetail.receivable },
  }), [merchantDetail, mockMerchant, settlements]);

  const tab = searchParams.get('tab');

  const [currentTab, setCurrentTab] = useState(tab || 'basic');

  const handleChangeTab = useCallback(
    (event, newValue) => {
      setCurrentTab(newValue);
      router.push({
        search: `?tab=${newValue}`,
      });
    },
    [router]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Merchant Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Merchant Details', href: paths.dashboard.merchantDetails.root },
          { name: merchantDetail?.companyName || 'Loading...' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <MerchantSummaryCards merchantId={id} />

      <Tabs 
        value={currentTab} 
        onChange={handleChangeTab} 
        sx={{ mb: { xs: 3, md: 5 } }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>

      {currentTab === 'basic' && (
        <MerchantDetailsBasicInfoView
          data={merchantProfile}
          refreshProfilesDetails={refreshProfilesDetails}
        />
      )}

      {currentTab === 'documents' && <MerchantDetailsDocumentsView merchant={merchantDetail} />}

      {currentTab === 'bank' && <MerchantDetailsBankView merchant={merchantDetail} />}

      {currentTab === 'ubo' && (
        <UbosListView 
          merchantProfile={merchantProfile} 
          percent={() => {}} 
          setActiveStepId={() => {}} 
        />
      )}

      {currentTab === 'psp' && <PSPListView merchantProfile={merchantProfile} />}

      {currentTab === 'receivables' && <MerchantDetailsReceivableView merchant={merchantData} />}

      {currentTab === 'settlement' && <MerchantDetailsSettlementView settlements={merchantData?.settlements} />}

      {currentTab === 'risk' && <MerchantDetailsRiskView merchant={merchantData} />}

      {currentTab === 'fraud' && <MerchantDetailsFraudView merchant={merchantData} />}

      {currentTab === 'liquidity' && <MerchantDetailsLiquidityView merchant={merchantData} />}

      {currentTab === 'audit_trail' && <MerchantDetailsAuditTrailView merchant={merchantData} />}
    </Container>
  );
}
