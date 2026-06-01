import PropTypes from 'prop-types';
import { useCallback, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Scrollbar from 'src/components/scrollbar';
import {
  useTable,
  getComparator,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import RejectedOrderDetailsDialog from '../rejected-order-details-dialog';
import RejectedOrdersTableFiltersResult from '../rejected-orders-table-filters-result';
import RejectedOrdersTableRow from '../rejected-orders-table-row';
import RejectedOrdersTableToolbar from '../rejected-orders-table-toolbar';

const TABLE_HEAD = [
  { id: 'investorName', label: 'Investor' },
  { id: 'amount', label: 'Amount' },
  { id: 'requestedUnits', label: 'Units' },
  { id: 'status', label: 'Order Status' },
  // { id: 'verificationStatus', label: 'Verification' },
  { id: 'createdAt', label: 'Created' },
  { id: '', label: 'Action' },
];

const defaultFilters = {
  name: '',
};

export default function RejectedOrdersListView({
  orders = [],
  complaints = [],
  loading = false,
  error = null,
  onDecision,
  onLoadVerificationDetails,
}) {
  const table = useTable({ defaultOrderBy: 'createdAt' });
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const complaintsByOrderId = useMemo(
    () => new Map(complaints.map((item) => [item.orderId, item])),
    [complaints]
  );

  const ordersWithSupport = useMemo(
    () =>
      orders.map((item) => ({
        ...item,
        linkedComplaint: complaintsByOrderId.get(item.orderId) || null,
      })),
    [complaintsByOrderId, orders]
  );

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: ordersWithSupport,
        comparator: getComparator(table.order, table.orderBy),
        filters,
      }),
    [filters, ordersWithSupport, table.order, table.orderBy]
  );

  const selectedOrder = useMemo(
    () => ordersWithSupport.find((item) => item.id === selectedOrderId) || null,
    [ordersWithSupport, selectedOrderId]
  );

  const canReset = !!filters.name;
  const notFound = !loading && !dataFiltered.length;
  const selectedComplaint = selectedOrder?.linkedComplaint || null;

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

  const handleClose = useCallback(() => {
    setSelectedOrderId(null);
  }, []);

  return (
    <>
      <Stack spacing={3}>
        <Card sx={{ borderRadius: 3 }}>
          <Box sx={{ px: 3, py: 2.5 }}>
            <Typography variant="h6">Order Review</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Review all investment orders for this SPV, manually validate submitted UTRs, and
              resolve linked refund complaints where needed.
            </Typography>
          </Box>

          <Divider />

          <RejectedOrdersTableToolbar filters={filters} onFilters={handleFilters} />

          {canReset && (
            <RejectedOrdersTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          {error && (
            <Box sx={{ px: 2.5, pt: 2.5 }}>
              <Alert severity="error">
                {error?.message || error?.error?.message || 'Unable to load orders.'}
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
                  {loading
                    ? Array.from({ length: table.rowsPerPage }).map((_, index) => (
                        <TableSkeleton key={index} />
                      ))
                    : dataFiltered
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row) => (
                          <RejectedOrdersTableRow
                            key={row.id}
                            row={row}
                            onViewRow={setSelectedOrderId}
                          />
                        ))}

                  {!loading && <TableNoData notFound={notFound} />}
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
      </Stack>

      <RejectedOrderDetailsDialog
        open={!!selectedOrder}
        order={selectedOrder}
        complaint={selectedComplaint}
        onClose={handleClose}
        onDecision={onDecision}
        onLoadVerificationDetails={onLoadVerificationDetails}
      />
    </>
  );
}

RejectedOrdersListView.propTypes = {
  orders: PropTypes.array,
  complaints: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.any,
  onDecision: PropTypes.func,
  onLoadVerificationDetails: PropTypes.func,
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
        String(item.investorName || '').toLowerCase().includes(searchValue) ||
        String(item.investorEmail || '').toLowerCase().includes(searchValue) ||
        String(item.orderId || '').toLowerCase().includes(searchValue) ||
        String(item.transactionId || '').toLowerCase().includes(searchValue) ||
        String(item.status || '').toLowerCase().includes(searchValue) ||
        String(item.verificationId || '').toLowerCase().includes(searchValue) ||
        String(item.rejectedReason || '').toLowerCase().includes(searchValue)
    );
  }

  return filteredData;
}
