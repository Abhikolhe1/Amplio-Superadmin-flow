import PropTypes from 'prop-types';
import { useCallback, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
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
import RefundComplaintsTableFiltersResult from '../refund-complaints-table-filters-result';
import RefundComplaintsTableRow from '../refund-complaints-table-row';
import RefundComplaintsTableToolbar from '../refund-complaints-table-toolbar';
import { formatInrCurrency } from '../../utils';

const TABLE_HEAD = [
  { id: 'investorName', label: 'Investor' },
  { id: 'amount', label: 'Amount' },
  { id: 'units', label: 'Units' },
  { id: 'shortDescription', label: 'Complaint' },
  { id: 'status', label: 'Status' },
  { id: 'updatedAt', label: 'Updated' },
  { id: '', label: 'Action' },
];

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved'];

const defaultFilters = {
  name: '',
};

export default function RefundComplaintsListView({
  complaints = [],
  loading = false,
  error = null,
  onSendReply,
  onUpdateComplaint,
}) {
  const table = useTable({ defaultOrderBy: 'updatedAt' });
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: complaints,
        comparator: getComparator(table.order, table.orderBy),
        filters,
      }),
    [complaints, filters, table.order, table.orderBy]
  );

  const selectedComplaint = useMemo(
    () => complaints.find((item) => item.id === selectedComplaintId) || null,
    [complaints, selectedComplaintId]
  );

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
    setSelectedComplaintId(null);
    setReplyText('');
  };

  const handleSendReply = () => {
    const trimmedReply = replyText.trim();

    if (!selectedComplaint || !trimmedReply) {
      return;
    }

    onSendReply?.(selectedComplaint.id, trimmedReply);
    setReplyText('');
  };

  return (
    <>
      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography variant="h6">Refund Complaints</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Review investor refund concerns and reply directly from the complaint thread.
          </Typography>
        </Box>

        <Divider />

        <RefundComplaintsTableToolbar filters={filters} onFilters={handleFilters} />

        {canReset && (
          <RefundComplaintsTableFiltersResult
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
              {error?.message || error?.error?.message || 'Unable to load refund complaints.'}
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
                        <RefundComplaintsTableRow
                          key={row.id}
                          row={row}
                          onViewRow={setSelectedComplaintId}
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

      <Dialog open={!!selectedComplaint} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>Refund Complaint Conversation</DialogTitle>

        {selectedComplaint && (
          <>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Stack spacing={2.5}>
                    <Box
                      sx={{
                        borderRadius: 2,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        p: 2,
                        maxHeight: 420,
                        overflowY: 'auto',
                        bgcolor: 'background.neutral',
                      }}
                    >
                      <Stack spacing={2}>
                        {selectedComplaint.messages.map((message) => {
                          const isInvestor = message.senderType === 'investor';

                          return (
                            <Stack
                              key={message.id}
                              direction="row"
                              spacing={1.5}
                              justifyContent={isInvestor ? 'flex-start' : 'flex-end'}
                            >
                              {isInvestor && <Avatar>{message.sender.charAt(0)}</Avatar>}

                              <Box
                                sx={{
                                  maxWidth: '78%',
                                  px: 2,
                                  py: 1.5,
                                  borderRadius: 2,
                                  bgcolor: isInvestor ? 'common.white' : 'primary.main',
                                  color: isInvestor ? 'text.primary' : 'primary.contrastText',
                                  boxShadow: (theme) => theme.customShadows.z8,
                                }}
                              >
                                <Typography variant="subtitle2">{message.sender}</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {message.text}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    mt: 1,
                                    display: 'block',
                                    opacity: 0.72,
                                  }}
                                >
                                  {fDateTime(message.createdAt)}
                                </Typography>
                              </Box>

                              {!isInvestor && <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>}
                            </Stack>
                          );
                        })}
                      </Stack>
                    </Box>

                    <TextField
                      label="Reply to investor"
                      multiline
                      minRows={4}
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      placeholder="Type your update, refund timeline, or next action..."
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Stack spacing={2}>
                    <Card variant="outlined" sx={{ p: 2.5 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Complaint Details
                      </Typography>
                      <Stack spacing={1.5}>
                        <DetailItem label="Investor" value={selectedComplaint.investorName} />
                        <DetailItem label="Order ID" value={selectedComplaint.orderId} />
                        <DetailItem label="Transaction ID" value={selectedComplaint.transactionId} />
                        <DetailItem
                          label="Amount / Units"
                          value={`${formatInrCurrency(selectedComplaint.amount)} / ${selectedComplaint.units}`}
                        />
                        <DetailItem label="SPV" value={selectedComplaint.spvName} />
                        <DetailItem label="Raised On" value={fDateTime(selectedComplaint.createdAt)} />
                      </Stack>
                    </Card>

                    {/* <Card variant="outlined" sx={{ p: 2.5 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Complaint Status
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        label="Status"
                        value={selectedComplaint.status}
                        onChange={(event) =>
                          onUpdateComplaint?.(selectedComplaint.id, { status: event.target.value })
                        }
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Card> */}

                    <Card variant="outlined" sx={{ p: 2.5 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                        Investor Complaint
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {selectedComplaint.description}
                      </Typography>
                    </Card>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={handleClose} color="inherit">
                Close
              </Button>
              <Button
                variant="outlined"
                color="success"
                onClick={() => onUpdateComplaint?.(selectedComplaint.id, { status: 'Resolved' })}
              >
                Mark Resolved
              </Button>
              <Button variant="contained" onClick={handleSendReply} disabled={!replyText.trim()}>
                Send Reply
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

RefundComplaintsListView.propTypes = {
  complaints: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.any,
  onSendReply: PropTypes.func,
  onUpdateComplaint: PropTypes.func,
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
        String(item.shortDescription || '').toLowerCase().includes(searchValue) ||
        String(item.status || '').toLowerCase().includes(searchValue)
    );
  }

  return filteredData;
}
