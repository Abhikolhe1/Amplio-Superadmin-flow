import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import Label from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import { formatInrCurrency } from '../utils';

const STATUS_COLOR = {
  VERIFIED: 'warning',
  AUTO_VERIFIED: 'info',
};

export default function UnallocatedFundsTableRow({ row }) {
  return (
    <TableRow hover>
      <TableCell>
        <ListItemText
          primary={row.referenceId || row.id}
          secondary={row.id}
          primaryTypographyProps={{ typography: 'body2', fontWeight: 700 }}
          secondaryTypographyProps={{ typography: 'caption' }}
        />
      </TableCell>

      <TableCell>
        <ListItemText
          primary={row.investorProfile?.fullName || '-'}
          secondary={row.spv?.spvName || '-'}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{ typography: 'caption' }}
        />
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {formatInrCurrency(row.verifiedAmount || row.amount)}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.units || '-'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.utrNumber || '-'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.verifiedAt ? fDateTime(row.verifiedAt) : '-'}</TableCell>

      <TableCell>
        <Label variant="soft" color={STATUS_COLOR[row.status] || 'default'}>
          {row.status}
        </Label>
      </TableCell>
    </TableRow>
  );
}

UnallocatedFundsTableRow.propTypes = {
  row: PropTypes.object,
};

