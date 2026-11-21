import { z } from 'zod';
import { HONEYPOT_FIELD } from '@/schemas/honeypot';
import { CONSENT_ERROR_MESSAGE } from '@/content/legal';

export const BUSINESS_TYPES = [
  'Restaurant',
  'Lounge or bar',
  'Hotel',
  'Restaurant group',
  'Other',
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

const websiteOrHandleOrNoneRegex =
  /^(none yet|@[a-zA-Z0-9._]{1,198}|(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?)$/i;

export const auditRequestSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, 'Please enter your business name (2 to 100 characters).')
    .max(100, 'Business name must be 100 characters or fewer.'),
  websiteOrInstagram: z
    .string()
    .trim()
    .min(
      2,
      'Please enter a website URL, @handle, or "none yet" (2 to 200 characters).'
    )
    .max(200, 'Please keep this under 200 characters.')
    .refine((val) => websiteOrHandleOrNoneRegex.test(val.trim()), {
      message: 'Enter a website URL, an @handle, or the words "none yet".',
    }),
  city: z.string().trim().min(1, 'Please enter your city.'),
  businessType: z.enum(BUSINESS_TYPES, {
    message: 'Please select a business type.',
  }),
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your business email.')
    .email('Please enter a valid email address.'),
  consent: z
    .boolean({ error: CONSENT_ERROR_MESSAGE })
    .refine((value) => value === true, {
      message: CONSENT_ERROR_MESSAGE,
    }),
  [HONEYPOT_FIELD]: z.string().optional(),
});

export type AuditRequestValues = z.infer<typeof auditRequestSchema>;
