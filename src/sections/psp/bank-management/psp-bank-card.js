import PropTypes from 'prop-types';
import { Card, Box, Typography, Stack, Divider, Chip, Grid, IconButton } from '@mui/material';
import Iconify from 'src/components/iconify';

const STATUS = {
  0: { label: 'Under Review', color: '#f8a15a', icon: 'mdi:clock-time-eight-outline' },
  1: { label: 'Approved', color: '#2E7D32', icon: 'mdi:check-decagram' },
  2: { label: 'Rejected', color: '#C62828', icon: 'mdi:close-circle' },
};

const BANK_PROOF = {
  0: { label: 'Cheque' },
  1: { label: 'Bank Statement' },
};

function maskAccountNumber(num) {
  if (!num) return '-';
  const lastFour = String(num).slice(-4);
  return `**** **** **** ${lastFour}`;
}

export default function PSPBankCard({ bank, onOpenForm }) {
  if (!bank) return null;

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        cursor: 'pointer',
        transition: '0.2s',
        '&:hover': {
          transform: 'scale(1.01)',
          boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
        },
      }}
      onClick={() => onOpenForm(bank)}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Iconify icon="mdi:bank" width={30} />
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Bank Name
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6">{bank?.bankName || '-'}</Typography>

              {bank?.isPrimary && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#1d5ec7ff',
                    px: 1.2,
                    py: 0.4,
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    width: 'fit-content',
                  }}
                >
                  <Iconify icon="mdi:star" width={16} />
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>

        <Chip
          icon={<Iconify icon={STATUS[bank?.status]?.icon} />}
          label={STATUS[bank?.status]?.label || 'Unknown'}
          sx={{
            bgcolor: `${STATUS[bank?.status]?.color}1A`,
            color: STATUS[bank?.status]?.color,
            fontWeight: 600,
            px: 1.5,
            '&:hover': {
              bgcolor: `${STATUS[bank?.status]?.color}1A`,
            },
          }}
        />
      </Stack>

      <Divider />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Iconify icon="mdi:home-city-outline" width={22} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Branch Name
              </Typography>
              <Typography variant="subtitle1">{bank?.branchName || '-'}</Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Iconify icon="mdi:web" width={22} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                IFSC Code
              </Typography>
              <Typography variant="subtitle1">{bank?.ifscCode || '-'}</Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Iconify icon="mdi:card-account-details" width={22} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Account Number
              </Typography>
              <Typography variant="subtitle1">{maskAccountNumber(bank?.accountNumber)}</Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Iconify icon="mdi:file-document-outline" width={22} />
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Account Proof
              </Typography>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {BANK_PROOF[bank?.bankAccountProofType]?.label || 'Unknown'}
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (bank?.bankAccountProof?.fileUrl) {
                      window.open(bank.bankAccountProof.fileUrl, '_blank');
                    }
                  }}
                  sx={{ ml: 0.5 }}
                >
                  <Iconify icon="mdi:eye" width={20} />
                </IconButton>
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
}

PSPBankCard.propTypes = {
  bank: PropTypes.object,
  onOpenForm: PropTypes.func,
};
