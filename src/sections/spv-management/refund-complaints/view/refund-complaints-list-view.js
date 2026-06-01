import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
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

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const defaultFilters = { name: '' };

export default function RefundComplaintsListView({
  complaints = [],
  loading = false,
  error = null,
  onUpdateComplaint,
}) {
  const table = useTable({ defaultOrderBy: 'updatedAt' });
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [adminRemark, setAdminRemark] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    setAdminRemark(selectedComplaint?.adminResponse || '');
    setSelectedStatus(selectedComplaint?.status || STATUS_OPTIONS[0]);
  }, [selectedComplaint]);

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({ ...prevState, [name]: value }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleClose = () => {
    setSelectedComplaintId(null);
    setAdminRemark('');
    setSelectedStatus(STATUS_OPTIONS[0]);
    setIsSubmitting(false);
  };

  const handleAssignRelationshipManager = async () => {
    if (!selectedComplaint) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdateComplaint?.(selectedComplaint.id, {
        status: selectedStatus,
        adminResponse: adminRemark,
        assignSuperAdmin: true,
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography variant="h6">Complaints</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Review investor complaints and update their resolution status.
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
              {error?.message || error?.error?.message || 'Unable to load complaints.'}
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

      <Dialog open={!!selectedComplaint} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Complaint Details</DialogTitle>

        {selectedComplaint && (
          <>
            <DialogContent dividers>
              <Stack spacing={2.5}>
                <Card variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Complaint Info
                  </Typography>
                  <Stack spacing={1.5}>
                    <DetailItem label="Investor" value={selectedComplaint.investorName} />
                    <DetailItem label="Order ID" value={selectedComplaint.orderId} />
                    <DetailItem
                      label="Amount / Units"
                      value={`${formatInrCurrency(selectedComplaint.amount)} / ${selectedComplaint.units}`}
                    />
                    <DetailItem label="Raised On" value={fDateTime(selectedComplaint.createdAt)} />
                    <DetailItem label="Updated On" value={fDateTime(selectedComplaint.updatedAt)} />
                  </Stack>
                </Card>

                <Card variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                    Issue
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedComplaint.shortDescription}
                  </Typography>
                </Card>

                <Card variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                    Status
                  </Typography>
                  {/* Future API: PATCH /complaints/:id { status } */}
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Update Status"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Card>

              </Stack>

              <Stack spacing={2} sx={{ mt: 2.5 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Admin remark"
                  placeholder="Add remark or internal follow-up note..."
                  value={adminRemark}
                  onChange={(event) => setAdminRemark(event.target.value)}
                />
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button
                onClick={handleAssignRelationshipManager}
                variant="outlined"
                disabled={isSubmitting}
              >
                Relationship Manager
              </Button>
              <Button onClick={handleClose} variant="outlined" color="inherit" disabled={isSubmitting}>
                Close
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
      <Typography variant="body2" sx={{ color: 'text.secondary', flexShrink: 0 }}>
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
        String(item.orderId || '').toLowerCase().includes(searchValue) ||
        String(item.shortDescription || '').toLowerCase().includes(searchValue) ||
        String(item.description || '').toLowerCase().includes(searchValue) ||
        String(item.status || '').toLowerCase().includes(searchValue)
    );
  }

  return filteredData;
}
