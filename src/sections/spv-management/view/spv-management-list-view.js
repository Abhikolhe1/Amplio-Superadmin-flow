import { useMemo, useState, useCallback } from 'react';
// @mui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
// components
import Scrollbar from 'src/components/scrollbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  getComparator,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import SpvManagementTableRow from '../spv-management-table-row';
import SpvPoolBuilder from '../spv-pool-builder';
import SpvRecentPtcIssuances from '../spv-recent-ptc-issuances';
import SpvTableToolbar from '../spv-table-toolbar';
import SpvTableFiltersResult from '../spv-table-filters-result';
import { SummaryDashboardGrid } from 'src/components/summary-card';
import { useRouter } from 'src/routes/hook';
import { useGetSpvManagementList, useGetSpvManagementSummary } from 'src/api/spvManagement';
import { formatInrCurrency } from '../utils';

const TABLE_HEAD = [
  { id: 'name', label: 'SPV Name' },
  { id: 'registrationNumber', label: 'Registration No.' },
  { id: 'monitoringTrustee', label: 'Monitoring Trustee' },
  { id: 'incorporationDate', label: 'Incorporation Date' },
  { id: 'status', label: 'Status' },
  { id: 'activePTC', label: 'Active PTC' },
  { id: 'activeInvestors', label: 'Active Investors' },
  { id: 'reserveFund', label: 'Reserve Fund' },
  { id: 'outstandingValue', label: 'PTC AUM' },
  { id: '', label: 'Action' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'draft', label: 'Draft' },
  { value: 'closed', label: 'Closed' },
];

const defaultFilters = {
  name: '',
  status: 'all',
};

const SUMMARY_CARD_CONFIG = [
  { title: 'Total SPVs', icon: 'solar:buildings-3-bold' },
  { title: 'Live Issuances', icon: 'solar:document-text-bold' },
  { title: 'AUM Managed', icon: 'solar:wallet-money-bold' },
  { title: 'Pool Eligible SPVs', icon: 'solar:layers-bold' },
];

export default function SpvManagementListView() {
  const settings = useSettingsContext();
  const table = useTable({ defaultOrderBy: 'name' });
  const router = useRouter();
  const [filters, setFilters] = useState(defaultFilters);
  const { summary, summaryLoading, summaryError } = useGetSpvManagementSummary();
  const { spvList, spvListLoading, spvListError } = useGetSpvManagementList();

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [table]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.spvManagement.details(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const summaryCards = useMemo(
    () =>
      SUMMARY_CARD_CONFIG.map((item) => {
        if (item.title === 'Total SPVs') {
          return {
            ...item,
            value: summaryLoading ? 'Loading...' : summary?.totalSpv ?? '-',
          };
        }

        if (item.title === 'Live Issuances') {
          return {
            ...item,
            value: summaryLoading ? 'Loading...' : summary?.liveIssuances ?? '-',
          };
        }

        if (item.title === 'AUM Managed') {
          return {
            ...item,
            value: summaryLoading ? 'Loading...' : formatInrCurrency(summary?.aumManaged),
          };
        }

        if (item.title === 'Pool Eligible SPVs') {
          return {
            ...item,
            value: summaryLoading ? 'Loading...' : summary?.spvsEligibleForNewPool ?? '-',
          };
        }

        return item;
      }),
    [summary, summaryLoading]
  );

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: spvList,
        comparator: getComparator(table.order, table.orderBy),
        filters,
      }),
    [filters, spvList, table.order, table.orderBy]
  );

  const canReset = !!filters.name || filters.status !== 'all';
  const notFound = !spvListLoading && !dataFiltered.length;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="SPV Management"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'SPV Management', href: paths.dashboard.spvManagement.root },
          { name: 'List' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <SummaryDashboardGrid title={item.title} value={item.value} icon={item.icon} />
          </Grid>
        ))}
      </Grid>

      {summaryError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {getErrorMessage(summaryError, 'Unable to load SPV management summary.')}
        </Alert>
      )}

      <Card>
        <SpvTableToolbar
          filters={filters}
          onFilters={handleFilters}
          statusOptions={STATUS_OPTIONS}
        />

        {canReset && (
          <SpvTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            results={dataFiltered.length}
            statusOptions={STATUS_OPTIONS}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        {spvListError && (
          <Box sx={{ px: 2.5, pb: 2.5 }}>
            <Alert severity="error">
              {getErrorMessage(spvListError, 'Unable to load SPV management list.')}
            </Alert>
          </Box>
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1200 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={dataFiltered.length}
                numSelected={0}
                onSort={table.onSort}
              />

              <TableBody>
                {spvListLoading
                  ? Array.from({ length: table.rowsPerPage }).map((_, index) => (
                      <TableSkeleton key={index} />
                    ))
                  : dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <SpvManagementTableRow
                          key={row.spvId}
                          row={row}
                          onViewRow={() => handleViewRow(row.spvId)}
                        />
                      ))}

                {!spvListLoading && <TableNoData notFound={notFound} />}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={dataFiltered.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>

      <SpvPoolBuilder />
      <SpvRecentPtcIssuances />
    </Container>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { name, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredData = stabilizedThis.map((el) => el[0]);

  if (name) {
    const searchValue = name.toLowerCase();

    filteredData = filteredData.filter(
      (row) =>
        String(row.name || '').toLowerCase().includes(searchValue) ||
        String(row.registrationNumber || '').toLowerCase().includes(searchValue) ||
        String(row.issuer || '').toLowerCase().includes(searchValue) ||
        String(row.monitoringTrustee || '').toLowerCase().includes(searchValue) ||
        String(row.status || '').toLowerCase().includes(searchValue) ||
        String(row.currentPoolId || '').toLowerCase().includes(searchValue)
    );
  }

  if (status !== 'all') {
    filteredData = filteredData.filter((row) => String(row.status || '').toLowerCase() === status);
  }

  return filteredData;
}

function getErrorMessage(error, fallback = 'Something went wrong') {
  if (typeof error === 'string') {
    return error;
  }

  return error?.message || error?.error?.message || fallback;
}

