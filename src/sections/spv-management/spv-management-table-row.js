import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
// components
import Label from 'src/components/label';
import { IconButton, Tooltip } from '@mui/material';
import Iconify from 'src/components/iconify';
import {
  formatInrCurrency,
  formatSpvDate,
  getPendingPoolApplicationLabel,
  getSpvStatusColor,
} from './utils';

export default function SpvManagementTableRow({ row, onViewRow }) {
  const statusColor = getSpvStatusColor(row.status);
  const pendingLabel = getPendingPoolApplicationLabel(row.pendingPoolApplications);

  return (
    <TableRow hover>
      <TableCell>
        <Stack spacing={0.75}>
          <ListItemText
            primary={row.name}
            secondary={row.issuer}
            primaryTypographyProps={{ typography: 'body2', fontWeight: 700 }}
            secondaryTypographyProps={{
              component: 'span',
              typography: 'caption',
              sx: { color: 'text.secondary' },
            }}
          />
          {row.pendingPoolApplications > 0 && (
            <Label color="warning" variant="soft" sx={{ alignSelf: 'flex-start' }}>
              {pendingLabel}
            </Label>
          )}
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.registrationNumber || '-'}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.monitoringTrustee || '-'}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatSpvDate(row.incorporationDate)}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Label variant="soft" color={statusColor}>
          {row.status}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.activePTC}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.activeInvestors ?? '-'}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatInrCurrency(row.reserveFund)}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatInrCurrency(row.outstandingValue)}</TableCell>
      <TableCell >
        <Tooltip title="Details" placement="top" arrow>
          <IconButton onClick={onViewRow}>
            <Iconify icon="solar:eye-bold" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

SpvManagementTableRow.propTypes = {
  row: PropTypes.object,
  onViewRow: PropTypes.func,
};
