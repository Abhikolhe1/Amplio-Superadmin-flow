import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Scrollbar from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import UnallocatedFundsTableRow from '../unallocated-funds-table-row';

const TABLE_HEAD = [
  { id: 'referenceId', label: 'Reference' },
  { id: 'investor', label: 'Investor / SPV' },
  { id: 'amount', label: 'Amount' },
  { id: 'units', label: 'Units' },
  { id: 'utrNumber', label: 'UTR' },
  { id: 'verifiedAt', label: 'Verified At' },
  { id: 'status', label: 'Status' },
];

export default function UnallocatedFundsListView({
  transactions = [],
  loading = false,
  error = null,
}) {
  const table = useTable({ defaultOrderBy: 'verifiedAt' });
  const notFound = !loading && !transactions.length;

  return (
    <Card sx={{ borderRadius: 3 }}>
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography variant="h6">Unallocated Funds</Typography>
      </Box>

      <Divider />

      {error && (
        <Box sx={{ px: 2.5, pt: 2.5 }}>
          <Alert severity="error">
            {error?.message || error?.error?.message || 'Unable to load unallocated funds.'}
          </Alert>
        </Box>
      )}

      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1100 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={transactions.length}
              numSelected={0}
            />

            <TableBody>
              {loading
                ? Array.from({ length: table.rowsPerPage }).map((_, index) => (
                    <TableSkeleton key={index} />
                  ))
                : transactions
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => <UnallocatedFundsTableRow key={row.id} row={row} />)}

              {!loading && <TableNoData notFound={notFound} />}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <TablePaginationCustom
        count={transactions.length}
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

UnallocatedFundsListView.propTypes = {
  transactions: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.any,
};

