import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Label from 'src/components/label';
import { formatInrCurrency } from '../utils';

const STATUS_COLOR = {
  'Pending Decision': 'warning',
  'Refund Approved': 'success',
  'Units Reallocated': 'info',
};

export default function RejectedOrdersTableRow({ row, onViewRow }) {
  return (
    <TableRow hover>
      <TableCell>
        <ListItemText
          primary={row.investorName}
          secondary={`${row.investorId} | ${row.orderId}`}
          primaryTypographyProps={{ typography: 'body2', fontWeight: 700 }}
          secondaryTypographyProps={{ typography: 'caption' }}
        />
      </TableCell>

      <TableCell>
        <ListItemText
          primary={row.transactionId}
          secondary={row.paymentReference}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{ typography: 'caption' }}
        />
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {formatInrCurrency(row.amount)}
        </Typography>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2">{row.requestedUnits}</Typography>
      </TableCell>

      <TableCell sx={{ minWidth: 320 }}>
        <Typography variant="body2">{row.rejectedReason}</Typography>
      </TableCell>

      <TableCell>
        <Label variant="soft" color="success">
          {row.paymentValidation}
        </Label>
      </TableCell>

      <TableCell>
        <Label variant="soft" color={STATUS_COLOR[row.status] || 'default'}>
          {row.status}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Button variant="outlined" onClick={() => onViewRow(row.id)}>
          Review
        </Button>
      </TableCell>
    </TableRow>
  );
}

RejectedOrdersTableRow.propTypes = {
  row: PropTypes.object,
  onViewRow: PropTypes.func,
};
