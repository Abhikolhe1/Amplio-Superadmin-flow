import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFCustomFileUploadBox,
} from 'src/components/hook-form';
import { enqueueSnackbar } from 'notistack';
import axiosInstance, { endpoints } from 'src/utils/axios';
import Iconify from 'src/components/iconify';

const DEFAULT_VALUES = {
  documentType: 'cheque',
  bankName: '',
  branchName: '',
  accountNumber: '',
  ifscCode: '',
  accountType: 'CURRENT',
  addressProof: null,
  accountHolderName: '',
  bankAddress: '',
  bankShortCode: '',
};

export default function PSPBankForm({ pspId, bank, onBack, refreshBankDetails }) {
  const isEditMode = Boolean(bank?.id);
  const isApproved = Number(bank?.status) === 1;

  const NewSchema = Yup.object().shape({
    documentType: Yup.string().required('Document Type is required'),
    addressProof: Yup.mixed().test(
      'address-proof-required',
      'Account proof is required',
      (value) => Boolean(value || bank?.bankAccountProof?.id)
    ),
    bankName: Yup.string().required('Bank Name is required'),
    branchName: Yup.string().required('Branch Name is required'),
    accountNumber: Yup.string().required('Account Number is required'),
    ifscCode: Yup.string().required('IFSC Code is required'),
    accountType: Yup.string().required('Account Type is required'),
    accountHolderName: Yup.string().required('Account Holder Name is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewSchema),
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });

  const {
    handleSubmit,
    getValues,
    setValue,
    reset,
    control,
    formState: { isSubmitting },
  } = methods;

  const documentType = useWatch({ control, name: 'documentType' });

  useEffect(() => {
    if (bank) {
      reset({
        documentType: bank.bankAccountProofType === 0 ? 'cheque' : 'bank_statement',
        bankName: bank.bankName || '',
        branchName: bank.branchName || '',
        accountNumber: bank.accountNumber || '',
        ifscCode: bank.ifscCode || '',
        accountType: Number(bank.accountType) === 0 ? 'CURRENT' : 'SAVINGS',
        addressProof: bank.bankAccountProof || null,
        accountHolderName: bank.accountHolderName || '',
        bankAddress: bank.bankAddress || '',
        bankShortCode: bank.bankShortCode || '',
      });
      return;
    }

    reset(DEFAULT_VALUES);
  }, [bank, reset]);

  const existingProof = bank?.bankAccountProof
    ? {
      id: bank.bankAccountProof.id,
      name: bank.bankAccountProof.fileOriginalName,
      url: bank.bankAccountProof.fileUrl,
      status: bank.status === 1 ? 'approved' : 'pending',
      isServerFile: true,
    }
    : null;

  const handleFetchIfscDetails = async () => {
    const ifsc = getValues('ifscCode');

    if (!ifsc) {
      enqueueSnackbar('Please enter IFSC Code first', { variant: 'warning' });
      return;
    }

    try {
      const res = await axiosInstance.get(`/bank-details/get-by-ifsc/${ifsc}`);
      const data = res?.data?.bankDetails;

      if (!data) {
        enqueueSnackbar('No bank details found', { variant: 'error' });
        return;
      }

      setValue('bankName', data.bankName || '');
      setValue('branchName', data.branchName || '');
      setValue('bankShortCode', data.bankShortCode || '');
      setValue('bankAddress', data.bankAddress || '');

      enqueueSnackbar('Bank details fetched successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error?.message || error?.error || error?.response?.data?.message || 'Invalid IFSC Code',
        { variant: 'error' }
      );
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      let bankAccountProofId = null;
      const proof = data.addressProof;

      if (proof) {
        if (proof.id) {
          bankAccountProofId = proof.id;
        } else if (proof.files && proof.files.length > 0 && proof.files[0].id) {
          bankAccountProofId = proof.files[0].id;
        }
      }

      if (!bankAccountProofId) {
        enqueueSnackbar('Account proof is required', { variant: 'error' });
        return;
      }

      const payload = {
        bankName: data.bankName,
        bankShortCode: data.bankShortCode,
        ifscCode: data.ifscCode,
        branchName: data.branchName,
        bankAddress: data.bankAddress,
        accountType: data.accountType === 'CURRENT' ? 0 : 1,
        accountHolderName: data.accountHolderName,
        accountNumber: String(data.accountNumber),
        bankAccountProofType: data.documentType === 'cheque' ? 0 : 1,
        bankAccountProofId,
      };

      if (isEditMode) {
        await axiosInstance.patch(endpoints.pspMaster.bankDetailsById(pspId, bank.id), payload);
        enqueueSnackbar('Bank details updated successfully!', { variant: 'success' });
      } else {
        await axiosInstance.post(endpoints.pspMaster.bankDetails(pspId), payload);
        enqueueSnackbar('Bank details created successfully!', { variant: 'success' });
      }

      refreshBankDetails?.();
      onBack?.();
    } catch (error) {
      enqueueSnackbar(
        error?.message || `Failed to ${isEditMode ? 'update' : 'create'} bank details`,
        { variant: 'error' }
      );
    }
  });

  return (
    <Box>
      {isEditMode && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Button
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            onClick={onBack}
            sx={{ fontWeight: 600 }}
          >
            Back to cards
          </Button>
        </Stack>
      )}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {isEditMode ? 'Bank Account' : 'Create Bank Account'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEditMode
                ? 'Update the PSP bank account details and save the changes.'
                : 'Add the PSP bank account details to start managing bank information here.'}
            </Typography>
          </Box>

          <Box sx={{ width: 220, mb: 3 }}>
            <RHFSelect
              name="documentType"
              label="Document Type"
              disabled={isApproved}
              SelectProps={{
                displayEmpty: true,
              }}
            >
              <MenuItem value="cheque">Cheque</MenuItem>
              <MenuItem value="bank_statement">Bank Statement</MenuItem>
            </RHFSelect>
          </Box>

          <Box sx={{ mb: 4 }}>
            <RHFCustomFileUploadBox
              name="addressProof"
              label={`Upload ${documentType === 'cheque' ? 'Cheque' : 'Bank Statement'}`}
              icon="mdi:file-document-outline"
              existing={existingProof}
              disabled={isApproved}
              accept={{
                'application/pdf': ['.pdf'],
                'image/png': ['.png'],
                'image/jpeg': ['.jpg', '.jpeg'],
              }}
            />
          </Box>

          <Box sx={{ py: 1 }}>
            <Grid container spacing={3}>
              <Grid xs={12} md={9}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ position: 'relative' }}>
                    <RHFTextField
                      name="ifscCode"
                      label="IFSC Code"
                      placeholder="Enter IFSC Code"
                      disabled={isApproved}
                      InputProps={{
                        endAdornment: (
                          <Button
                            variant="contained"
                            size="small"
                            disabled={isApproved}
                            sx={{
                              ml: 1,
                              bgcolor: '#00328A',
                              color: 'white',
                              textTransform: 'none',
                              fontWeight: 600,
                              borderRadius: '6px',
                              minHeight: '32px',
                              px: 2,
                              '&:hover': { bgcolor: '#002670' },
                            }}
                            onClick={handleFetchIfscDetails}
                          >
                            Fetch
                          </Button>
                        ),
                      }}
                    />
                  </Box>

                  <RHFTextField
                    name="bankName"
                    label="Bank Name"
                    placeholder="Enter Bank Name"
                    disabled={isApproved}
                  />
                  <RHFTextField
                    name="branchName"
                    label="Branch Name"
                    placeholder="Enter Branch Name"
                    disabled={isApproved}
                  />
                  <RHFTextField
                    name="accountHolderName"
                    label="Account Holder Name"
                    placeholder="Enter Account Holder Name"
                    disabled={isApproved}
                  />
                  <RHFTextField
                    name="accountNumber"
                    label="Account Number"
                    placeholder="Enter Account Number"
                    disabled={isApproved}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    }}
                    onInput={(event) => {
                      event.target.value = event.target.value.replace(/\D/g, '');
                    }}
                  />
                  <RHFTextField
                    name="bankAddress"
                    label="Bank Address"
                    placeholder="Bank Address"
                    disabled={isApproved}
                    InputLabelProps={{
                      shrink: Boolean(getValues('bankAddress')),
                    }}
                  />
                </Box>
              </Grid>

              <Grid xs={12} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <RHFSelect name="accountType" label="Account Type" disabled={isApproved}>
                    <MenuItem value="SAVINGS">Savings</MenuItem>
                    <MenuItem value="CURRENT">Current</MenuItem>
                  </RHFSelect>
                  <RHFTextField
                    name="bankShortCode"
                    label="Bank Short Code"
                    placeholder="Bank Short Code"
                    disabled={isApproved}
                    InputLabelProps={{
                      shrink: Boolean(getValues('bankShortCode')),
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            {isEditMode && (
              <Button variant="outlined" color="inherit" onClick={onBack}>
                Cancel
              </Button>
            )}

            {(!isEditMode || !isApproved) && (
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {isEditMode ? 'Update Bank Details' : 'Create Bank Details'}
              </Button>
            )}
          </Box>
        </Card>
      </FormProvider>
    </Box>
  );
}

PSPBankForm.propTypes = {
  pspId: PropTypes.string,
  bank: PropTypes.object,
  onBack: PropTypes.func,
  refreshBankDetails: PropTypes.func,
};
