import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
// components
import Label from 'src/components/label';
import { format } from 'date-fns';

const STATUS_COLOR = {
  processing: 'info',
  completed: 'success',
  pending: 'warning',
  failed: 'error',
  active: 'info',
  settled: 'success',
};

export default function TransactionHistoryTableRow({ row }) {
  const { id, title, subtitle, amount, pool, date, status } = row;

  return (
    <TableRow hover>
      <TableCell>
        <ListItemText
          primary={id}
          secondary={subtitle || title}
          primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      </TableCell>

      <TableCell> {amount}</TableCell>

      <TableCell>{pool}</TableCell>

      <TableCell>
         <ListItemText
                    primary={format(new Date(date), 'dd MMM yyyy')}
                    secondary={format(new Date(date), 'p')}
                    primaryTypographyProps={{ typography: 'body2', noWrap: true }}
                    secondaryTypographyProps={{
                      mt: 0.5,
                      component: 'span',
                      typography: 'caption',
                    }}
                  />
      </TableCell>
    </TableRow>
  );
}

TransactionHistoryTableRow.propTypes = {
  row: PropTypes.object,
};
