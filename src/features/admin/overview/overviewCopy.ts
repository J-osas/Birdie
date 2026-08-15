import { AdminAuditLog } from '@/types';

const ACTION_LABELS: Record<string, string> = {
  'pro.verify': 'Verified professional',
  'pro.reject': 'Rejected professional',
  'pro.status': 'Updated professional status',
  'cert.approve': 'Approved certification',
  'cert.reject': 'Rejected certification',
  'hire.lock_price': 'Locked hire price',
  'payment.refund': 'Refunded a payment',
  'payout.reject': 'Rejected payout',
  'user.suspend': 'Suspended account',
  'user.restore': 'Restored account',
  'review.status': 'Updated review status',
};

export function humanizeAuditAction(action: string) {
  return ACTION_LABELS[action] || action.replace(/[._]/g, ' ');
}

export function auditEntityLink(row: AdminAuditLog): string | null {
  if (row.entityType === 'professional' && row.entityId) return `/professionals/${row.entityId}`;
  if (row.entityType === 'withdrawal') return '/app/payments';
  if (row.entityType === 'review') return '/app/admin/reviews';
  if (row.entityType === 'profile') return '/app/security';
  if ((row.entityType === 'hire' || row.entityType === 'hire_request') && row.entityId) {
    return `/app/hires/${row.entityId}`;
  }
  return null;
}
