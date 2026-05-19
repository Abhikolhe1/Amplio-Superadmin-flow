import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
// mock
import { PSP_STATUS_OPTIONS, PSP_RISK_OPTIONS } from 'src/_mock/_psp';
//
import PSPTableRow from '../psp-table-row';
import PSPTableToolbar from '../psp-table-toolbar';
import PSPTableFiltersResult from '../psp-table-filters-result';
import { useFilterPspData } from 'src/api/psp-master';
import { buildFilter } from 'src/utils/filters';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' },
{ value: '1', label: 'Active', color: 'success' },
{ value: '0', label: 'Inactive', color: 'error' },
];
const RISK_OPTIONS = [{ value: 'all', label: 'All' }, ...PSP_RISK_OPTIONS];

const TABLE_HEAD = [
  { id: 'name', label: 'PSP Name' },
  { id: 'status', label: 'Status' },
  // { id: 'riskLevel', label: 'Risk Level' },
  { id: 'merchantsCount', label: 'Merchants', align: 'center' },
  { id: 'totalSettlement', label: 'Total Settlement' },
  { id: 'transactionVolume', label: 'Volume' },
  { id: 'activeSettlements', label: 'Active Settlements', align: 'center' },
  // { id: 'avgSettlementTime', label: 'Avg Settlement Time', align: 'center' },
  { id: '', label: 'Actions' },
];

const defaultFilters = {
  name: '',
  status: 'all',
  riskLevel: 'all',
};

// ----------------------------------------------------------------------

export default function PSPListView() {
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();

  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  const filter = buildFilter({
    page: table.page,
    rowsPerPage: table.rowsPerPage,
    order: table.order,
    orderBy: table.orderBy,
    validSortFields: ['name'],
    searchTextValue: filters.name,
    
  });

  if (filters.status !== 'all') {
    filter.where = {
      ...(filter.where || {}),
      status: Number(filters.status),
    };
  }

  const filterJson = encodeURIComponent(JSON.stringify(filter));
  const params = { filter: filterJson };

  const { filteredPspData = [], totalCount = {} } = useFilterPspData(params);

  useEffect(() => {
    setTableData(filteredPspData);
  }, [filteredPspData]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prev) => ({ ...prev, [name]: value }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);
      table.onUpdatePageDeleteRow(dataFiltered.length);
    },
    [dataFiltered.length, table, tableData]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.psp.details(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="PSP List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'PSP', href: paths.dashboard.psp.root },
          { name: 'List' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <PSPTableToolbar
          filters={filters}
          onFilters={handleFilters}
          statusOptions={STATUS_OPTIONS}
          riskOptions={RISK_OPTIONS}
        />

        {canReset && (
          <PSPTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            results={dataFiltered.length}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                showCheckbox={false}
              />

              <TableBody>
                {dataFiltered.map((row) => (
                  <PSPTableRow
                    key={row.id}
                    row={row}
                    selected={table.selected.includes(row.id)}
                    onSelectRow={() => table.onSelectRow(row.id)}
                    onDeleteRow={() => handleDeleteRow(row.id)}
                    onViewRow={() => handleViewRow(row.id)}
                  />
                ))}

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={totalCount.totalCount || dataFiltered.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status, riskLevel } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (item) => item.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((item) => String(item.status) === String(status));
  }

  if (riskLevel !== 'all') {
    inputData = inputData.filter((item) => item.riskLevel === riskLevel);
  }

  return inputData;
}
