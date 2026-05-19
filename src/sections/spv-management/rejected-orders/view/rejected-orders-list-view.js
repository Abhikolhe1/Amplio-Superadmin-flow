import PropTypes from 'prop-types';
import { useCallback, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TextField from '@mui/material/TextField';
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
import { fDateTime } from 'src/utils/format-time';
import { formatInrCurrency } from '../../utils';
import { buildRejectedOrdersSummary } from '../../showcase-data';
import RejectedOrdersTableFiltersResult from '../rejected-orders-table-filters-result';
import RejectedOrdersTableRow from '../rejected-orders-table-row';
import RejectedOrdersTableToolbar from '../rejected-orders-table-toolbar';

const TABLE_HEAD = [
  { id: 'investorName', label: 'Investor' },
  { id: 'transactionId', label: 'Transaction' },
  { id: 'amount', label: 'Amount' },
  { id: 'requestedUnits', label: 'Units' },
  { id: 'rejectedReason', label: 'Rejected Reason' },
  { id: 'paymentValidation', label: 'Payment Validation' },
  { id: 'status', label: 'Decision Status' },
  { id: '', label: 'Action' },
];

const defaultFilters = {
  name: '',
};

export default function RejectedOrdersListView({
  orders = [],
  loading = false,
  error = null,
  onDecision,
}) {
  const table = useTable({ defaultOrderBy: 'rejectedAt' });
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: orders,
        comparator: getComparator(table.order, table.orderBy),
        filters,
      }),
    [filters, orders, table.order, table.orderBy]
  );

  const selectedOrder = useMemo(
    () => orders.find((item) => item.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const summaryCards = useMemo(() => buildRejectedOrdersSummary(orders), [orders]);
  const canReset = !!filters.name;
  const notFound = !loading && !dataFiltered.length;

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

  const handleClose = () => {
    setSelectedOrderId(null);
    setResolutionNote('');
  };

  const handleDecision = (decision) => {
    if (!selectedOrder) {
      return;
    }

    onDecision?.(selectedOrder.id, {
      status: decision === 'refund' ? 'Refund Approved' : 'Units Reallocated',
      resolutionNote,
      decidedAction: decision,
    });
    handleClose();
  };

  return (
    <>
      <Stack spacing={3}>
        <Card sx={{ borderRadius: 3 }}>
          <Box sx={{ px: 3, py: 2.5 }}>
            <Typography variant="h6">Rejected Orders</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Validate payment, then choose whether to approve a refund or allocate new units.
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
                {error?.message || error?.error?.message || 'Unable to load rejected orders.'}
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

      <Dialog open={!!selectedOrder} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Rejected Order Details</DialogTitle>

        {selectedOrder && (
          <>
            <DialogContent dividers>
              <Stack spacing={3}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Transaction Snapshot
                      </Typography>
                      <Stack spacing={1.5}>
                        <DetailItem label="Investor" value={selectedOrder.investorName} />
                        <DetailItem label="SPV" value={selectedOrder.spvName} />
                        <DetailItem label="Order ID" value={selectedOrder.orderId} />
                        <DetailItem label="Transaction ID" value={selectedOrder.transactionId} />
                        <DetailItem label="UTR / Ref." value={selectedOrder.paymentReference} />
                        <DetailItem label="Amount" value={formatInrCurrency(selectedOrder.amount)} />
                        <DetailItem
                          label="Requested Units"
                          value={String(selectedOrder.requestedUnits)}
                        />
                        <DetailItem label="Bank Account" value={selectedOrder.bankAccount} />
                        <DetailItem
                          label="Rejected At"
                          value={fDateTime(selectedOrder.rejectedAt)}
                        />
                      </Stack>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Decision Guidance
                      </Typography>
                      <Stack spacing={1.5}>
                        <DetailItem label="Current Status" value={selectedOrder.status} />
                        <DetailItem
                          label="Recommended Action"
                          value={selectedOrder.recommendedAction}
                        />
                        <DetailItem
                          label="Replacement Pool"
                          value={selectedOrder.replacementPool}
                        />
                        <DetailItem
                          label="Reallocation Units"
                          value={String(selectedOrder.reallocationUnits)}
                        />
                      </Stack>

                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'background.neutral',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
                          Rejection Context
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {selectedOrder.rejectedReason}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>

                <Card variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                    Payment Validation Checklist
                  </Typography>
                  <Stack spacing={1}>
                    {selectedOrder.validationChecks.map((item) => (
                      <Stack direction="row" spacing={1.25} alignItems="center" key={item.id}>
                        <Checkbox checked={item.completed} disableRipple />
                        <Typography variant="body2">{item.label}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Card>

                <Card variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                    Operations Notes
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    {selectedOrder.notes}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Decision note"
                    placeholder="Capture refund instruction or alternate unit allocation notes..."
                    value={resolutionNote}
                    onChange={(event) => setResolutionNote(event.target.value)}
                  />
                </Card>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={handleClose} color="inherit">
                Close
              </Button>
              <Button variant="outlined" color="success" onClick={() => handleDecision('refund')}>
                Approve Refund
              </Button>
              <Button variant="contained" onClick={() => handleDecision('reallocate')}>
                Allocate New Units
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}

function DetailItem({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}

DetailItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

RejectedOrdersListView.propTypes = {
  orders: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.any,
  onDecision: PropTypes.func,
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
        String(item.investorId || '').toLowerCase().includes(searchValue) ||
        String(item.orderId || '').toLowerCase().includes(searchValue) ||
        String(item.transactionId || '').toLowerCase().includes(searchValue) ||
        String(item.paymentReference || '').toLowerCase().includes(searchValue) ||
        String(item.rejectedReason || '').toLowerCase().includes(searchValue) ||
        String(item.status || '').toLowerCase().includes(searchValue) ||
        String(item.recommendedAction || '').toLowerCase().includes(searchValue)
    );
  }

  return filteredData;
}
