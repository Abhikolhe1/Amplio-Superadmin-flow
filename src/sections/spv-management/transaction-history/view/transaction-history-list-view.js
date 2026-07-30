import PropTypes from 'prop-types';
import { useState, useCallback, useMemo } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Scrollbar from 'src/components/scrollbar';
import {
  useTable,
  getComparator,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import TransactionHistoryTableRow from '../transaction-history-table-row';
import TransactionHistoryTableToolbar from '../transaction-history-table-toolbar';
import TransactionHistoryTableFiltersResult from '../transaction-history-table-filters-result';

const TABLE_HEAD = [
  { id: 'id', label: 'Transaction' },
  { id: 'amount', label: 'Amount' },
  { id: 'pool', label: 'Pool' },
  { id: 'date', label: 'Date' },
];

const defaultFilters = {
  name: '',
};

export default function TransactionHistoryListView({ transactions = [] }) {
  const table = useTable({ defaultOrderBy: 'date' });
  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: transactions,
        comparator: getComparator(table.order, table.orderBy),
        filters,
      }),
    [filters, table.order, table.orderBy, transactions]
  );

  const canReset = !!filters.name;
  const notFound = !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <Card sx={{ borderRadius: 3 }}>
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography variant="h6">Active Transactions</Typography>
      </Box>

      <Divider />

      {/* <TransactionHistoryTableToolbar filters={filters} onFilters={handleFilters} />

      {canReset && (
        <TransactionHistoryTableFiltersResult
          filters={filters}
          onFilters={handleFilters}
          onResetFilters={handleResetFilters}
          results={dataFiltered.length}
          sx={{ p: 2.5, pt: 0 }}
        />
      )} */}

      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 900 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={dataFiltered.length}
              numSelected={0}
              onSort={table.onSort}
            />

            <TableBody>
              {dataFiltered
                .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                .map((row) => (
                  <TransactionHistoryTableRow key={row.id} row={row} />
                ))}

              <TableNoData notFound={notFound} />
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
  );
}

TransactionHistoryListView.propTypes = {
  transactions: PropTypes.array,
};

function applyFilter({ inputData, comparator, filters }) {
  const { name } = filters;

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
      (item) =>
        String(item.id || '').toLowerCase().includes(searchValue) ||
        String(item.title || '').toLowerCase().includes(searchValue) ||
        String(item.subtitle || '').toLowerCase().includes(searchValue) ||
        String(item.pool || '').toLowerCase().includes(searchValue) ||
        String(item.status || '').toLowerCase().includes(searchValue)
    );
  }

  return filteredData;
}
