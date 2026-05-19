import PropTypes from 'prop-types';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
// components
import Chart, { useChart } from 'src/components/chart';
import SummaryCard from 'src/components/summary-card';

// ----------------------------------------------------------------------

function formatCurrencyShort(amount) {
  const value = Number(amount) || 0;
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (absoluteValue >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PSPDetailsOverviewView({ psp }) {
  const theme = useTheme();
  const { name, status, statusColor, avgSettlementTime, lastSync, financialSummary, settlementTrend } = psp;

  const infoData = [
    { label: 'PSP Name', value: name || '-' },
    { label: 'Status', value: status || '-', useLabel: true, color: statusColor || 'default' },
    { label: 'Avg Settlement Time', value: avgSettlementTime || '-' },
    { label: 'Last Data Sync', value: lastSync || '-' },
    // { label: 'Integration Type', value: integrationType },
  ];

  const chartOptions = useChart({
    colors: [theme.palette.primary.main],
    xaxis: {
      categories: settlementTrend?.categories || [],
    },
    tooltip: {
      y: {
        formatter: (value) => formatCurrencyShort(value),
      },
    },
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <SummaryCard title="PSP Information" data={infoData} />
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, height: 1 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Financial Summary
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack
                spacing={1}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: (currentTheme) => alpha(currentTheme.palette.info.main, 0.08),
                  border: (currentTheme) => `1px solid ${alpha(currentTheme.palette.info.main, 0.12)}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: 'info.main', fontWeight: 'bold', textTransform: 'uppercase' }}
                >
                  Monthly Processing Volume
                </Typography>
                <Typography variant="h4" sx={{ color: 'info.darker' }}>
                  {formatCurrencyShort(financialSummary?.monthlyVolume)}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack
                spacing={1}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: (currentTheme) => alpha(currentTheme.palette.success.main, 0.08),
                  border: (currentTheme) =>
                    `1px solid ${alpha(currentTheme.palette.success.main, 0.12)}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: 'success.main', fontWeight: 'bold', textTransform: 'uppercase' }}
                >
                  Total Settlement
                </Typography>
                <Typography variant="h4" sx={{ color: 'success.darker' }}>
                  {formatCurrencyShort(financialSummary?.totalSettlements)}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: (currentTheme) => alpha(currentTheme.palette.warning.main, 0.04),
                  border: (currentTheme) =>
                    `1px solid ${alpha(currentTheme.palette.warning.main, 0.1)}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Pending Amount
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'warning.main', fontWeight: 700 }}>
                  {formatCurrencyShort(financialSummary?.pendingAmount)}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: (currentTheme) => alpha(currentTheme.palette.error.main, 0.04),
                  border: (currentTheme) => `1px solid ${alpha(currentTheme.palette.error.main, 0.1)}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Failed Transactions
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'error.main', fontWeight: 700 }}>
                  {financialSummary?.failedTransactions ?? 0}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Settlement Trend (Last 6 Months)
          </Typography>
          <Chart
            type="line"
            series={settlementTrend?.series || []}
            options={chartOptions}
            height={364}
          />
        </Card>
      </Grid>
    </Grid>
  );
}

PSPDetailsOverviewView.propTypes = {
  psp: PropTypes.object,
};
