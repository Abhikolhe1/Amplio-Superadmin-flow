import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function PSPTableToolbar({ filters, onFilters, statusOptions, riskOptions }) {
  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStatus = useCallback(
    (event) => {
      onFilters('status', event.target.value);
    },
    [onFilters]
  );

  const handleFilterRisk = useCallback(
    (event) => {
      onFilters('riskLevel', event.target.value);
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        p: 2.5,
        pr: { xs: 2.5, md: 1 },
      }}
    >
      <TextField
        fullWidth
        select
        label="Status"
        value={filters.status}
        onChange={handleFilterStatus}
        sx={{
          maxWidth: { md: 160 },
        }}
      >
        {statusOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      {/* <TextField
        fullWidth
        select
        label="Risk Level"
        value={filters.riskLevel}
        onChange={handleFilterRisk}
        sx={{
          maxWidth: { md: 160 },
        }}
      >
        {riskOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField> */}

      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.name}
          onChange={handleFilterName}
          placeholder="Search PSP name..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Stack>
  );
}

PSPTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  statusOptions: PropTypes.array,
  riskOptions: PropTypes.array,
};
