import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Label from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import { formatInrCurrency } from '../utils';
import { IconButton, Tooltip } from '@mui/material';
import Iconify from 'src/components/iconify';

export const ORDER_STATUS_CONFIG = {
  CREATED: {
    label: 'Created',
    color: 'default',
  },
  AGREEMENT_SIGNED: {
    label: 'Agreement Signed',
    color: 'info',
  },
  PAYMENT_PENDING: {
    label: 'Payment Pending',
    color: 'warning',
  },
  UTR_SUBMITTED: {
    label: 'UTR Submitted',
    color: 'info',
  },
  PAYMENT_UNDER_REVIEW: {
    label: 'Under Review',
    color: 'warning',
  },
  PAYMENT_SUCCESS: {
    label: 'Payment Success',
    color: 'success',
  },
  PAYMENT_FAILED: {
    label: 'Payment Failed',
    color: 'error',
  },
  PAYMENT_TIMEOUT: {
    label: 'Payment Timeout',
    color: 'warning',
  },
  PTC_FREEZE_EXPIRED: {
    label: 'Freeze Expired',
    color: 'error',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'default',
  },
};

export default function RejectedOrdersTableRow({ row, onViewRow }) {
  // const verificationLabel = row.verificationId
  //   ? ['UTR_SUBMITTED', 'PAYMENT_UNDER_REVIEW'].includes(row.status)
  //     ? 'Awaiting Review'
  //     : 'Linked'
  //   : 'Not Linked';
  // const verificationColor = row.verificationId
  //   ? ['UTR_SUBMITTED', 'PAYMENT_UNDER_REVIEW'].includes(row.status)
  //     ? 'warning'
  //     : 'info'
  //   : 'default';

  const statusConfig = ORDER_STATUS_CONFIG[row.status] || {
    label: row.status,
    color: 'default',
  };

  return (
    <TableRow hover>
      <TableCell>{row.investorProfile?.companyName || '-'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatInrCurrency(row.amount)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.requestedUnits}</TableCell>

      <TableCell>
        <Label variant="soft" color={statusConfig.color}>
          {statusConfig.label}
        </Label>
      </TableCell>

      {/* <TableCell>
        <Label variant="soft" color={verificationColor}>
          {verificationLabel}
        </Label>
      </TableCell> */}

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {row.createdAt ? fDateTime(row.createdAt) : '-'}
      </TableCell>
      <TableCell >
        <Tooltip title="Details" placement="top" arrow>
          <IconButton onClick={() => onViewRow(row.id)}>
            <Iconify icon="solar:eye-bold" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

RejectedOrdersTableRow.propTypes = {
  row: PropTypes.object,
  onViewRow: PropTypes.func,
};
