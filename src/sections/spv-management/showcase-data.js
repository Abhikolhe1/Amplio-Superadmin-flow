import { formatInrCurrency } from './utils';

function createComplaintMessages(investorName, adminName, description) {
  return [
    {
      id: 'msg-1',
      sender: investorName,
      senderType: 'investor',
      text: description,
      createdAt: '2026-05-17T09:15:00.000Z',
    },
    {
      id: 'msg-2',
      sender: adminName,
      senderType: 'admin',
      text: 'We are validating the order mapping and payment trail from our side.',
      createdAt: '2026-05-17T10:00:00.000Z',
    },
  ];
}

export function getRefundComplaintsShowcase(spv) {
  const spvName = spv?.name || 'Altiv Growth Trust SPV';

  return [
    {
      id: `${spv?.id || 'spv'}-cmp-1`,
      investorName: 'Aarav Mehta',
      investorId: 'INV-2041',
      orderId: 'ORD-88321',
      transactionId: 'TXN-448921',
      amount: 2500000,
      units: 2500,
      shortDescription: 'Units not credited even though the payment was debited successfully.',
      description:
        'I transferred the funds on May 16 and the amount has been debited from my account, but the units are still not reflected in my dashboard. Please confirm the allocation status and refund timeline if units cannot be allotted.',
      status: 'Open',
      createdAt: '2026-05-17T09:15:00.000Z',
      updatedAt: '2026-05-18T11:25:00.000Z',
      spvName,
      messages: createComplaintMessages(
        'Aarav Mehta',
        'SPV Ops',
        'My order amount was debited, but units are still pending. Please help.'
      ),
    },
    {
      id: `${spv?.id || 'spv'}-cmp-2`,
      investorName: 'Neha Kapoor',
      investorId: 'INV-1178',
      orderId: 'ORD-88274',
      transactionId: 'TXN-448515',
      amount: 1250000,
      units: 1250,
      shortDescription: 'Refund requested because allocation moved to another investor.',
      description:
        'The payment was successful, but the order now shows rejected because the allocation was made elsewhere. I need clarity on refund processing or an alternate allocation proposal.',
      status: 'In Progress',
      createdAt: '2026-05-16T12:40:00.000Z',
      updatedAt: '2026-05-18T09:45:00.000Z',
      spvName,
      messages: [
        {
          id: 'msg-1',
          sender: 'Neha Kapoor',
          senderType: 'investor',
          text: 'Why was my order rejected after I completed the transfer?',
          createdAt: '2026-05-16T12:40:00.000Z',
        },
        {
          id: 'msg-2',
          sender: 'SPV Ops',
          senderType: 'admin',
          text: 'The payment is validated. We are reviewing whether to refund or reallocate equivalent units.',
          createdAt: '2026-05-16T14:05:00.000Z',
        },
      ],
    },
    {
      id: `${spv?.id || 'spv'}-cmp-3`,
      investorName: 'Rohan Shah',
      investorId: 'INV-2220',
      orderId: 'ORD-88196',
      transactionId: 'TXN-447992',
      amount: 900000,
      units: 900,
      shortDescription: 'Investor asked for written confirmation on refund approval.',
      description:
        'The investor acknowledged the rejection but is waiting for the final confirmation and settlement timeline for the refund.',
      status: 'Resolved',
      createdAt: '2026-05-15T07:50:00.000Z',
      updatedAt: '2026-05-18T16:10:00.000Z',
      spvName,
      messages: [
        {
          id: 'msg-1',
          sender: 'Rohan Shah',
          senderType: 'investor',
          text: 'Please confirm whether the rejected order refund has been approved.',
          createdAt: '2026-05-15T07:50:00.000Z',
        },
        {
          id: 'msg-2',
          sender: 'SPV Ops',
          senderType: 'admin',
          text: 'Refund approval is complete and the settlement instruction has been released.',
          createdAt: '2026-05-18T16:10:00.000Z',
        },
      ],
    },
  ];
}

export function getRejectedOrdersShowcase(spv) {
  const spvName = spv?.name || 'Altiv Growth Trust SPV';

  return [
    {
      id: `${spv?.id || 'spv'}-rej-1`,
      investorName: 'Neha Kapoor',
      investorId: 'INV-1178',
      orderId: 'ORD-88274',
      transactionId: 'TXN-448515',
      amount: 1250000,
      requestedUnits: 1250,
      reallocationUnits: 1250,
      rejectedReason: 'Units were allocated to another confirmed investor during final closure.',
      paymentValidation: 'Validated',
      paymentReference: 'UTR92837465',
      bankAccount: 'HDFC Bank xxxx 4418',
      rejectedAt: '2026-05-16T10:55:00.000Z',
      status: 'Pending Decision',
      recommendedAction: 'Allocate New Units',
      replacementPool: 'Pool 4 - Series B',
      notes:
        'Payment is valid and reconciled. Equivalent units can be reassigned from the next available tranche.',
      validationChecks: [
        { id: 'check-1', label: 'Payment received in escrow', completed: true },
        { id: 'check-2', label: 'UTR matched with investor mandate', completed: true },
        { id: 'check-3', label: 'Duplicate allocation ruled out', completed: true },
        { id: 'check-4', label: 'Replacement unit inventory available', completed: true },
      ],
      spvName,
    },
    {
      id: `${spv?.id || 'spv'}-rej-2`,
      investorName: 'Ishita Rao',
      investorId: 'INV-1880',
      orderId: 'ORD-88211',
      transactionId: 'TXN-448201',
      amount: 600000,
      requestedUnits: 600,
      reallocationUnits: 0,
      rejectedReason: 'Merchant-side lock expired before final allotment confirmation.',
      paymentValidation: 'Validated',
      paymentReference: 'UTR91726351',
      bankAccount: 'ICICI Bank xxxx 0832',
      rejectedAt: '2026-05-15T15:30:00.000Z',
      status: 'Pending Decision',
      recommendedAction: 'Approve Refund',
      replacementPool: '-',
      notes:
        'No replacement inventory is available in the current issuance window, so refund approval is recommended.',
      validationChecks: [
        { id: 'check-1', label: 'Payment received in escrow', completed: true },
        { id: 'check-2', label: 'KYC and mandate still valid', completed: true },
        { id: 'check-3', label: 'No alternate units available', completed: true },
      ],
      spvName,
    },
  ];
}

export function buildRejectedOrdersSummary(orders = []) {
  const totalValue = orders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
  const refundCount = orders.filter((order) => order.recommendedAction === 'Approve Refund').length;
  const reallocateCount = orders.filter(
    (order) => order.recommendedAction === 'Allocate New Units'
  ).length;

  return [
    {
      title: 'Rejected Orders',
      value: orders.length || 0,
      helper: 'Orders awaiting action',
    },
    {
      title: 'At-Risk Value',
      value: formatInrCurrency(totalValue),
      helper: 'Investor value under review',
    },
    {
      title: 'Refund Recommendations',
      value: refundCount,
      helper: 'Suggested refund closures',
    },
    {
      title: 'Reallocation Opportunities',
      value: reallocateCount,
      helper: 'Suggested alternate allotments',
    },
  ];
}
