import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
// components
import Label from 'src/components/label';
import { fIndianCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

function formatSettlementDestination(value) {
  if (!value || value === '-') return '-';

  return String(value)
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export default function PSPTransactionHistoryRow({ row }) {
  const { transactionId, amount, netVolume, haircut, status, mode, settlementDestination } = row;

  return (
    <TableRow hover>
      <TableCell>{transactionId}</TableCell>

      <TableCell>
        <Typography>
          {fIndianCurrency(amount)}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography>{fIndianCurrency(netVolume)}</Typography>
      </TableCell>

      <TableCell>
        <Typography>{haircut}%</Typography>
      </TableCell>
      <TableCell>
        <Label
          variant="soft"
        >
          {formatSettlementDestination(settlementDestination)}
        </Label>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (status === 'captured' && 'success') ||
            (status === 'settled' && 'success') ||
            (status === 'refunded' && 'warning') ||
            (status === 'failed' && 'error') ||
            'default'
          }
          sx={{ textTransform: 'capitalize' }}
        >
          {status}
        </Label>
      </TableCell>

      <TableCell>
        <Label>
          {mode}
        </Label>
      </TableCell>
    </TableRow>
  );
}

PSPTransactionHistoryRow.propTypes = {
  row: PropTypes.object,
};
