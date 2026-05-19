import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Label from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import { formatInrCurrency } from '../utils';

const STATUS_COLOR = {
  Open: 'error',
  'In Progress': 'warning',
  Resolved: 'success',
};

export default function RefundComplaintsTableRow({ row, onViewRow }) {
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

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {formatInrCurrency(row.amount)}
        </Typography>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2">{row.units}</Typography>
      </TableCell>

      <TableCell sx={{ minWidth: 320 }}>
        <Typography variant="body2">{row.shortDescription}</Typography>
      </TableCell>

      <TableCell>
        <Label variant="soft" color={STATUS_COLOR[row.status] || 'default'}>
          {row.status}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <ListItemText
          primary={fDateTime(row.updatedAt, 'dd MMM yyyy')}
          secondary={fDateTime(row.updatedAt, 'p')}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Button variant="outlined" onClick={() => onViewRow(row.id)}>
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}

RefundComplaintsTableRow.propTypes = {
  row: PropTypes.object,
  onViewRow: PropTypes.func,
};
