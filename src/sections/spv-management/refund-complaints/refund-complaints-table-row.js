import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import { formatInrCurrency } from '../utils';

const STATUS_COLOR = {
  OPEN: 'error',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  CLOSED: 'default',
};

function formatStatus(status) {
  if (!status) return 'Unknown';
  return String(status)
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function RefundComplaintsTableRow({ row, onViewRow }) {
  return (
    <TableRow hover>
      <TableCell>
       {row.investorName}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
       {formatInrCurrency(row.amount)}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {row.units}
      </TableCell>

      <TableCell sx={{ minWidth: 320 }}>
       {row.shortDescription}
      </TableCell>

      <TableCell>
        <Label variant="soft" color={STATUS_COLOR[row.status] || 'default'}>
          {formatStatus(row.status)}
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
        <IconButton onClick={() => onViewRow(row.id)}>
          <Iconify icon="solar:eye-bold" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

RefundComplaintsTableRow.propTypes = {
  row: PropTypes.object,
  onViewRow: PropTypes.func,
};
