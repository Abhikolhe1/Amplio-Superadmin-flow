import PropTypes from 'prop-types';
// components
import PSPTransactionHistoryTab from '../psp-transaction-history-tab';

// ----------------------------------------------------------------------

export default function PSPDetailsTransactionHistoryView({ masterId, status }) {
  return (
    <PSPTransactionHistoryTab masterId={masterId} status={status} />
  );
}

PSPDetailsTransactionHistoryView.propTypes = {
  masterId: PropTypes.string,
  status: PropTypes.string,
};
