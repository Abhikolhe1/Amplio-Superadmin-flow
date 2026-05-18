//
import axios from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/auth/me',
    login: '/auth/super-admin-login',
    register: '/register',
    forgotPassword: '/auth/forget-password/send-email-otp',
    newPassword: '/auth/forget-password/verify-email-otp',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  scheduler: {
    list: '/schedulers',
    filterList: (filter) => `/schedulers?filter=${filter}`,
    details: (id) => `/schedulers/${id}`,
  },

  companyInfo: {
    list: '/api/kyc/issuer_kyc/company-info/',
    filterList: (filter) => `/api/kyc/issuer_kyc/company-info/?filter=${filter}`,
    details: (id) => `/api/kyc/issuer_kyc/company-info/${id}`,
  },
  designation: {
    list: '/designations',
    filterList: (filter) => `/designations?filter=${filter}`,
    details: (id) => `/designations/${id}`,
  },
  roles: {
    list: '/roles',
    filterList: (filter) => `/roles?filter=${filter}`,
    details: (id) => `/roles/${id}`,
  },
  documentType: {
    list: '/document-types',
    filterList: (filter) => `/document-types?filter=${filter}`,
    details: (id) => `/document-types/${id}`,
  },
  pspMaster: {
    list: '/psp-masters',
    details: (id) => `/psp-masters/${id}`,
    dashboard: '/psp-masters/admin-dashboard',
    dashboardDetails: (id) => `/psp-masters/admin-dashboard/${id}`,
    bankDetails: (id) => `/psp-masters/${id}/bank-details`,
    bankDetailsById: (id, accountId) => `/psp-masters/${id}/bank-details/${accountId}`,
    transactions: (id) => `/psp-master/transactions/${id}`,
    filterList: (filter) => `/psp-masters/admin-dashboard?filter=${filter}`,
    statusList: (status) => `/psp-masters/admin-dashboard?status=${status}`,
    filterStatusList: (filter, status) =>
      `/psp-masters/admin-dashboard?filter=${filter}&status=${status}`,
  },
  companyProfiles: {
    list: '/company-profiles',
    filterList: (filter) => `/company-profiles?filter=${filter}`,
    statusList: (status) => `/company-profiles?status=${status}`,
    filterStatusList: (filter, status) => `/company-profiles?filter=${filter}&status=${status}`,
    details: (id) => `/company-profiles/${id}`,
  },
  merchantProfiles: {
    list: '/merchant-profiles',
    filterList: (filter) => `/merchant-profiles?filter=${filter}`,
    statusList: (status) => `/merchant-profiles?status=${status}`,
    filterStatusList: (filter, status) => `/merchant-profiles?filter=${filter}&status=${status}`,
    details: (id) => `/merchant-profiles/${id}`,
  },
  investorProfiles: {
    list: '/investor-profiles',
    filterList: (filter) => `/investor-profiles?filter=${filter}`,
    statusList: (status) => `/investor-profiles?status=${status}`,
    filterStatusList: (filter, status) => `/investor-profiles?filter=${filter}&status=${status}`,
    details: (id) => `/investor-profiles/${id}`,
  },
  CompanyKyc: {
    getDocuments: (companyId) => `/company-profiles/${companyId}/documents`,
    getBusinessAddressDetails: (companyId) =>
      `/company-profiles/${companyId}/business-address-details`,
    getBankDetails: (companyId) => `/company-profiles/${companyId}/bank-details`,
    // getFilteredBankDetails: (companyId) => `/company-profiles/${companyId}/bank-details?filter=${filter}`,
    getCompanySignatories: (companyId) => `/company-profiles/${companyId}/authorize-signatory`,
    getCompanySignatoriesWithFilter: (companyId, queryString) =>
      `/company-profiles/${companyId}/authorize-signatory?filter=${queryString}`,
    getBusinessProfile: (companyId) => `/company-profiles/${companyId}/business-profile`,
    getCollateralassets: (companyId) => `/company-profiles/${companyId}/collateral-details`,
    getGuarantorDetails: (companyId) => `/company-profiles/${companyId}/guarantor-details`,
    getAuditedFinancials: (companyId) => `/company-profiles/${companyId}/audited-financials`,
    getAgrrement: (companyId) => `/company-profiles/${companyId}/agreement-details`,
    getDpn: (companyId) => `/company-profiles/${companyId}/dpn-details`,
    getRoc: (companyId) => `/company-profiles/${companyId}/roc-details`,
    getFinancials: (companyId) => `/company-profiles/${companyId}/financials-details`,
  },
  MerchantKyc: {
    getDocuments: (merchantId) => `/merchant-profiles/${merchantId}/documents`,
    getBusinessAddressDetails: (merchantId) =>
      `/merchant-profiles/${merchantId}/address-details`,
    getBankDetails: (merchantId) => `/merchant-profiles/${merchantId}/bank-details`,
    getMerchantSignatories: (merchantId) => `/merchant-profiles/${merchantId}/authorize-signatory`,
    getMerchantSignatoriesWithFilter: (merchantId, queryString) =>
      `/merchant-profiles/${merchantId}/authorize-signatory?filter=${queryString}`,
    getBusinessProfile: (merchantId) => `/merchant-profiles/${merchantId}/business-profile`,
    getUboDetails: (merchantId) => `/merchant-profiles/${merchantId}/ubo-details`,

    getPspDetails: (merchantId) => `/merchant-profiles/${merchantId}/psp-details`,
    getSummary: (merchantId) => `/merchant-profiles/${merchantId}/summary`,
  },
  InvestorKyc: {
    getDocuments: (investorId) => `/investor-profiles/${investorId}/documents`,
    getBankDetails: (investorId) => `/investor-profiles/${investorId}/bank-details`,
    getAddressDetails: (investorId) => `/investor-profiles/${investorId}/address-details`,
    getComplianceDeclarations: (investorId) =>
      `/investor-profiles/${investorId}/compliance-declarations`,
    getInvestmentMandate: (investorId) => `/investor-profiles/${investorId}/investment-mandate`,
    getPlatformAgreement: (investorId) => `/investor-profiles/${investorId}/platform-agreement`,
    getUboDetails: (investorId) => `/investor-profiles/${investorId}/ubo-details`,
    // getFilteredBankDetails: (investorId) => `/investor-profiles/${investorId}/bank-details?filter=${filter}`,
    getInvestorSignatories: (investorId) => `/investor-profiles/${investorId}/authorize-signatory`,
    getInvestorSignatoriesWithFilter: (investorId, queryString) =>
      `/investor-profiles/${investorId}/authorize-signatory?filter=${queryString}`,
  },

  trusteeProfiles: {
    list: '/trustee-profiles',
    filterList: (filter) => `/trustee-profiles?filter=${filter}`,
    statusList: (status) => `/trustee-profiles?status=${status}`,
    filterStatusList: (filter, status) => `/trustee-profiles?filter=${filter}&status=${status}`,
    details: (id) => `/trustee-profiles/${id}`,
  },
  trusteeEntityType: {
    list: '/trustee-entity-types',
    filterList: (filter) => `/trustee-entity-types?filter=${filter}`,
    details: (id) => `/trustee-entity-types/${id}`,
  },
  trusteeKyc: {
    kycProgress: (userId, stepperId) =>
      `/trustee-profiles/kyc-progress/${userId}?step=${encodeURIComponent(stepperId)}`,
    getSection: (stepperId, userId, route = '') =>
      `/trustee-profiles/kyc-get-data/${stepperId}/${userId}?route=${encodeURIComponent(route)}`,
    getDocuments: (trusteeId) => `/trustee-profiles/${trusteeId}/documents`,
    getBankDetails: (trusteeId) => `/trustee-profiles/${trusteeId}/bank-details`,
    getTrusteeSignatories: (trusteeId) => `/trustee-profiles/${trusteeId}/authorize-signatory`,
    getTrusteeSignatoriesWithFilter: (trusteeId, queryString) =>
      `/trustee-profiles/${trusteeId}/authorize-signatory?filter=${queryString}`,
  },
};
