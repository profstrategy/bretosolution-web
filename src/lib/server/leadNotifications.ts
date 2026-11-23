import { canSendConfirmation } from '@/lib/server/confirmationLimit';
import type { NotificationResult } from '@/lib/server/notify';

interface LeadNotificationOptions {
  label: string;
  recipientEmail: string;
  notifyOwner: () => Promise<NotificationResult>;
  sendConfirmation: () => Promise<NotificationResult>;
  updateNotifiedAt: () => Promise<void>;
}

export async function sendLeadNotifications({
  label,
  recipientEmail,
  notifyOwner,
  sendConfirmation,
  updateNotifiedAt,
}: LeadNotificationOptions): Promise<void> {
  const ownerPromise = Promise.resolve().then(notifyOwner);
  const ownerResultPromise = Promise.allSettled([ownerPromise]);

  let confirmationAllowed = false;
  let confirmationLimitChecked = false;
  try {
    confirmationAllowed = await canSendConfirmation(recipientEmail);
    confirmationLimitChecked = true;
  } catch (error) {
    console.error(`${label} confirmation recipient limit check failed.`, error);
  }

  if (confirmationLimitChecked && !confirmationAllowed) {
    console.warn('Confirmation skipped: recipient limit');
  }

  if (!confirmationAllowed) {
    const [ownerResult] = await ownerResultPromise;
    await logOwnerNotification(ownerResult, label, updateNotifiedAt);
    return;
  }

  const confirmationResultPromise = Promise.allSettled([
    Promise.resolve().then(sendConfirmation),
  ]);
  const [[ownerResult], [confirmationResult]] = await Promise.all([
    ownerResultPromise,
    confirmationResultPromise,
  ]);

  await logOwnerNotification(ownerResult, label, updateNotifiedAt);
  if (confirmationResult.status === 'rejected') {
    console.error(`${label} confirmation failed.`, confirmationResult.reason);
  } else if (!confirmationResult.value.ok) {
    console.error(
      `${label} confirmation failed.`,
      confirmationResult.value.error
    );
  }
}

async function logOwnerNotification(
  result: PromiseSettledResult<NotificationResult>,
  label: string,
  updateNotifiedAt: () => Promise<void>
): Promise<void> {
  if (result.status === 'rejected') {
    console.error(`${label} notification failed.`, result.reason);
    return;
  }

  if (!result.value.ok) {
    console.error(`${label} notification failed.`, result.value.error);
    return;
  }

  try {
    await updateNotifiedAt();
  } catch (error) {
    console.error(`${label} notification status update failed.`, error);
  }
}
