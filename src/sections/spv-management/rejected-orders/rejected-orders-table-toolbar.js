import PropTypes from 'prop-types';
import { useCallback } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Iconify from 'src/components/iconify';

export default function RejectedOrdersTableToolbar({ filters, onFilters }) {
  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'stretch', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5 }}
    >
      <TextField
        fullWidth
        value={filters.name}
        onChange={handleFilterName}
        placeholder="Search investor, email, order, verification, or status..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
}

RejectedOrdersTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
};
