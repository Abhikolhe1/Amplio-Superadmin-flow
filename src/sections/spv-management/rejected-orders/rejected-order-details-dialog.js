import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { fDateTime } from 'src/utils/format-time';
import { formatInrCurrency } from '../utils';

export default function RejectedOrderDetailsDialog({
  open,
  order,
  complaint,
  onClose,
  onDecision,
  onLoadVerificationDetails,
}) {
  const [resolutionNote, setResolutionNote] = useState('');
  const [verifiedAmount, setVerifiedAmount] = useState('');
  const [verificationDetail, setVerificationDetail] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const canApproveAllocation =
    !!order?.verificationId && ['UTR_SUBMITTED', 'PAYMENT_UNDER_REVIEW'].includes(order?.status);
  const canResolveRefund = !!complaint;

  useEffect(() => {
    if (!open) {
      setResolutionNote('');
      setVerifiedAmount('');
      setVerificationDetail(null);
      setVerificationLoading(false);
      setActionLoading(null);
    }
  }, [open]);

  useEffect(() => {
    let ignore = false;

    if (!order?.verificationId || !onLoadVerificationDetails || !open) {
      setVerificationLoading(false);
      setVerificationDetail(null);
      setVerifiedAmount(order?.amount ? String(order.amount) : '');
      return undefined;
    }

    setVerificationLoading(true);

    onLoadVerificationDetails(order.verificationId)
      .then((result) => {
        if (ignore) return;
        setVerificationDetail(result);
        setVerifiedAmount(
          result?.verification?.verifiedAmount != null
            ? String(result.verification.verifiedAmount)
            : order?.amount
              ? String(order.amount)
              : ''
        );
      })
      .catch(() => {
        if (ignore) return;
        setVerificationDetail(null);
      })
      .finally(() => {
        if (!ignore) setVerificationLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [onLoadVerificationDetails, open, order]);

  const handleDecision = useCallback(
    async (decision) => {
      if (!order || !onDecision) {
        return;
      }

      try {
        setActionLoading(decision);

        if (decision === 'allocate') {
          const parsedAmount = Number(verifiedAmount);

          if (!parsedAmount || parsedAmount <= 0) {
            throw new Error('Please enter a valid verified amount.');
          }

          await onDecision(order.id, {
            decidedAction: 'allocate',
            verificationId: order.verificationId,
            verifiedAmount: parsedAmount,
          });
        }

        if (decision === 'refund') {
          await onDecision(order.id, {
            decidedAction: 'refund',
            supportId: complaint?.id || null,
            resolutionNote,
            status: 'Refund Requested',
          });
        }

        onClose();
      } catch (decisionError) {
        setActionLoading(null);
      }
    },
    [complaint?.id, onClose, onDecision, order, resolutionNote, verifiedAmount]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Order Review Details</DialogTitle>

      {order && (
        <>
          <DialogContent dividers>
            <Stack spacing={3}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      Order Snapshot
                    </Typography>
                    <Stack spacing={1.5}>
                      <DetailItem
                        label="Investor"
                        value={order.investorProfile?.companyName || order.companyName}
                      />
                      <DetailItem label="Email" value={order.investorEmail} />
                      <DetailItem label="Order ID" value={order.orderId} />
                      <DetailItem label="Order Status" value={order.status} />
                      <DetailItem label="SPV" value={order.spvId} />
                      <DetailItem label="Amount" value={formatInrCurrency(order.amount)} />
                      <DetailItem label="Requested Units" value={String(order.requestedUnits)} />
                      <DetailItem label="Allocated Units" value={order.allocatedUnits ?? '-'} />
                      <DetailItem
                        label="Created"
                        value={order.createdAt ? fDateTime(order.createdAt) : '-'}
                      />
                      <DetailItem
                        label="Allocated"
                        value={order.allocatedAt ? fDateTime(order.allocatedAt) : '-'}
                      />
                    </Stack>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      Verification Snapshot
                    </Typography>

                    {verificationLoading ? (
                      <Typography variant="body2" color="text.secondary">
                        Loading verification details...
                      </Typography>
                    ) : (
                      <Stack spacing={1.5}>
                        <DetailItem label="Verification ID" value={order.verificationId || '-'} />
                        <DetailItem
                          label="Verification Status"
                          value={verificationDetail?.verification?.status || '-'}
                        />
                        <DetailItem
                          label="UTR Number"
                          value={verificationDetail?.verification?.utrNumber || '-'}
                        />
                        <DetailItem
                          label="Verified Amount"
                          value={
                            verificationDetail?.verification?.verifiedAmount != null
                              ? formatInrCurrency(verificationDetail.verification.verifiedAmount)
                              : '-'
                          }
                        />
                        <DetailItem
                          label="Verified At"
                          value={
                            verificationDetail?.verification?.verifiedAt
                              ? fDateTime(verificationDetail.verification.verifiedAt)
                              : '-'
                          }
                        />
                        <DetailItem
                          label="Reserved Until"
                          value={
                            verificationDetail?.verification?.reservationExpiresAt
                              ? fDateTime(verificationDetail.verification.reservationExpiresAt)
                              : '-'
                          }
                        />
                      </Stack>
                    )}
                  </Card>
                </Grid>
              </Grid>

              <Card variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                  Manual UTR Verification for PTC Allocation
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Use the verified amount below to approve the linked payment verification and
                  trigger PTC allocation.
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Verified Amount"
                    value={verifiedAmount}
                    onChange={(event) => setVerifiedAmount(event.target.value)}
                    disabled={!canApproveAllocation}
                  />
                </Stack>
              </Card>

              <Card variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                  Refund Resolution
                </Typography>
                {complaint ? (
                  <Stack spacing={1.5}>
                    <DetailItem label="Complaint ID" value={complaint.id} />
                    <DetailItem label="Complaint Status" value={complaint.status} />
                    <DetailItem label="Issue" value={complaint.shortDescription} />
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Refund note"
                      placeholder="Capture refund decision or settlement note..."
                      value={resolutionNote}
                      onChange={(event) => setResolutionNote(event.target.value)}
                    />
                  </Stack>
                ) : (
                  <Alert severity="info">
                    No linked customer-support complaint was found for this order, so there is no
                    refund workflow to update from this screen yet.
                  </Alert>
                )}
              </Card>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={onClose} color="inherit">
              Close
            </Button>
            <LoadingButton
              variant="outlined"
              color="success"
              onClick={() => handleDecision('refund')}
              loading={actionLoading === 'refund'}
              disabled={!canResolveRefund}
            >
              Resolve Refund
            </LoadingButton>
            <LoadingButton
              variant="contained"
              onClick={() => handleDecision('allocate')}
              loading={actionLoading === 'allocate'}
              disabled={!canApproveAllocation}
            >
              Submit Manual Allocation
            </LoadingButton>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

function DetailItem({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600 }}>
        {typeof value === 'string' || typeof value === 'number' ? value : '-'}
      </Typography>
    </Stack>
  );
}

DetailItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

RejectedOrderDetailsDialog.propTypes = {
  open: PropTypes.bool,
  order: PropTypes.object,
  complaint: PropTypes.object,
  onClose: PropTypes.func,
  onDecision: PropTypes.func,
  onLoadVerificationDetails: PropTypes.func,
};
