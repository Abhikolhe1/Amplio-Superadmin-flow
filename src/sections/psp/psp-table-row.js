import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// utils
import { fNumber } from 'src/utils/format-number';
function getPspStatusLabel(status) {
  return status === 1 || status === true || String(status).toLowerCase() === 'active'
    ? 'Active'
    : 'Inactive';
}

// ----------------------------------------------------------------------

export default function PSPTableRow({
  row,
  selected,
  onViewRow,
  onSelectRow,
  onDeleteRow,
}) {
  const {
    name,
    status,
    riskLevel,
    merchantCount,
    totalSettlement,
    totalVolume,
    activeSettlements,
    avgSettlementTime,
  } = row;

  const confirm = useBoolean();
  const popover = usePopover();

  // Backend Status Mapping
  const statusMap = {
    1: {
      label: 'Active',
      color: 'success',
    },
    0: {
      label: 'Inactive',
      color: 'error',
    },
    active: {
      label: 'Active',
      color: 'success',
    },
    inactive: {
      label: 'Inactive',
      color: 'error',
    },
  };

  const currentStatus = statusMap[status] || {
    label: getPspStatusLabel(status),
    color: 'default',
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={name} sx={{ mr: 2 }}>
            {name?.charAt(0)}
          </Avatar>

          <ListItemText
            primary={name}
            primaryTypographyProps={{ typography: 'body2' }}
          />
        </TableCell>

        {/* STATUS */}
        <TableCell>
          <Label variant="soft" color={currentStatus.color}>
            {currentStatus.label}
          </Label>
        </TableCell>

        {/* RISK LEVEL */}
        {/* <TableCell>
          <Label
            variant="soft"
            color={
              (riskLevel === 'low' && 'success') ||
              (riskLevel === 'medium' && 'warning') ||
              'error'
            }
          >
            {riskLevel}
          </Label>
        </TableCell> */}

        <TableCell align="center">
          {fNumber(merchantCount)}
        </TableCell>

        <TableCell>
          {fNumber(totalSettlement)}
        </TableCell>

        <TableCell>
          {fNumber(totalVolume)}
        </TableCell>

         <TableCell align="center">
          {fNumber(activeSettlements)}
        </TableCell>

        {/* <TableCell align="center">
          {avgSettlementTime}
        </TableCell>  */}

        <TableCell
          // align="right"
          sx={{ px: 1, whiteSpace: 'nowrap' }}
        >
          <Tooltip title="View" placement="top" arrow>
            <IconButton color="default" onClick={onViewRow}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={onDeleteRow}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

PSPTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
