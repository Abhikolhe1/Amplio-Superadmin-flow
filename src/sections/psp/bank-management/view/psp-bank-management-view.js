import PropTypes from 'prop-types';
import { useState } from 'react';
import { Typography, Grid, Box, CircularProgress, Stack } from '@mui/material';
import { useGetPspBankDetails } from 'src/api/psp-master';
import PSPBankCard from '../psp-bank-card';
import PSPBankForm from '../psp-bank-form';

export default function PSPBankManagementView({ pspId }) {
  const { bankDetails = [], bankDetailsLoading, refreshBankDetails } = useGetPspBankDetails(pspId);
  const [selectedBank, setSelectedBank] = useState(null);

  if (bankDetailsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (selectedBank || bankDetails.length === 0) {
    return (
      <PSPBankForm
        pspId={pspId}
        bank={selectedBank}
        refreshBankDetails={refreshBankDetails}
        onBack={() => {
          setSelectedBank(null);
        }}
      />
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">Bank Accounts</Typography>
      </Stack>

      <Grid container spacing={3}>
        {bankDetails.map((bank) => (
          <Grid item xs={12} md={6} key={bank.id}>
            <PSPBankCard bank={bank} onOpenForm={(data) => setSelectedBank(data)} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

PSPBankManagementView.propTypes = {
  pspId: PropTypes.string,
};
