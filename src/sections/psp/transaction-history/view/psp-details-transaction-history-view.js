import PropTypes from 'prop-types';
// components
import PSPTransactionHistoryTab from '../psp-transaction-history-tab';

// ----------------------------------------------------------------------

export default function PSPDetailsTransactionHistoryView({ masterId }) {
  return (
    <PSPTransactionHistoryTab masterId={masterId} />
  );
}

PSPDetailsTransactionHistoryView.propTypes = {
  masterId: PropTypes.string,
};
