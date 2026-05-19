import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// components
import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function PSPMerchantsTableRow({ row }) {
  const { merchantName, cin, gstin, status } = row;

  return (
    <TableRow hover>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>    
         {merchantName}   

      </TableCell>

      <TableCell>
        <Typography>
          {cin}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography>
          {gstin}
        </Typography>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={(status === 'Active' && 'success') || 'default'}
        >
          {status}
        </Label>
      </TableCell>
    </TableRow>
  );
}

PSPMerchantsTableRow.propTypes = {
  row: PropTypes.object,
};
