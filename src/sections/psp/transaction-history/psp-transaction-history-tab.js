import PropTypes from 'prop-types';
import { useState, useCallback, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// components
import Scrollbar from 'src/components/scrollbar';
import {
  useTable,
  getComparator,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import { useGetPspTransactions } from 'src/api/psp-master';
//
import PSPTransactionHistoryRow from './psp-transaction-history-row';
import PSPTransactionHistoryTableToolbar from './psp-transaction-history-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'transactionId', label: 'Transaction ID' },
  { id: 'amount', label: 'Amount' },
  { id: 'netVolume', label: 'Net Volume' },
  { id: 'haircut', label: 'Haircut' },
  { id: 'settlementDestination', label: 'Settlement Destination' },
  { id: 'status', label: 'Status' },
  { id: 'mode', label: 'Mode' },
];

const defaultFilters = {
  name: '',
};

// ----------------------------------------------------------------------

export default function PSPTransactionHistoryTab({ masterId, status }) {
  const table = useTable();

  const [filters, setFilters] = useState(defaultFilters);

  const params = useMemo(
    () => ({
      limit: table.rowsPerPage,
      skip: table.page * table.rowsPerPage,
      ...(status && { status }),
    }),
    [table.page, table.rowsPerPage, status]
  );

  const { transactions = [], totalCount = 0 } = useGetPspTransactions(masterId, params);

  const tableData = useMemo(
    () =>
      transactions.map((transaction) => ({
        id: transaction.id,
        transactionId: transaction.tnsId || transaction.id || '-',
        amount: transaction.amount ?? 0,
        netVolume: transaction.netAmount ?? 0,
        haircut: transaction.haircut ?? 0,
        settlementDestination: transaction.settlementDestination || '-',
        status: transaction.pspStatus || transaction.status || '-',
        mode: transaction.method || '-',
      })),
    [transactions]
  );

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prev) => ({ ...prev, [name]: value }));
    },
    [table]
  );

  const notFound = !dataFiltered.length;

  return (
    <Card>
      <PSPTransactionHistoryTableToolbar filters={filters} onFilters={handleFilters} />

      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1200 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              onSort={table.onSort}
            />

            <TableBody>
              {dataFiltered.map((row) => (
                <PSPTransactionHistoryRow key={row.id} row={row} />
              ))}

              <TableNoData notFound={notFound} />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <TablePaginationCustom
        count={filters.name ? dataFiltered.length : totalCount}
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

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (item) =>
        item.transactionId.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        item.status.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        item.mode.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  return inputData;
}

PSPTransactionHistoryTab.propTypes = {
  masterId: PropTypes.string,
  status: PropTypes.string,
};
