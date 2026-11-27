import { z } from 'zod';
import { BUSINESS_TYPES } from '@/schemas/audit';
import { HONEYPOT_FIELD } from '@/schemas/honeypot';
import { fullAddressSchema } from '@/schemas/address';
import { CONSENT_ERROR_MESSAGE } from '@/content/legal';

export const QUOTE_BUSINESS_TYPES = BUSINESS_TYPES;
export type QuoteBusinessType = (typeof QUOTE_BUSINESS_TYPES)[number];

export const QUOTE_HELP_OPTIONS = [
  'AI Visibility Optimization',
  'Website + AI Visibility',
  'Visibility Growth Management',
  'Not sure yet',
] as const;

export type QuoteHelpOption = (typeof QUOTE_HELP_OPTIONS)[number];

export const QUOTE_LOCATION_OPTIONS = ['Nigeria', 'Another country'] as const;
export type QuoteLocationOption = (typeof QUOTE_LOCATION_OPTIONS)[number];

export const quoteRequestSchema = z.object({
  businessType: z
    .string()
    .min(1, 'Please select your business type.')
    .refine(
      (val) => (QUOTE_BUSINESS_TYPES as readonly string[]).includes(val),
      { message: 'Please select your business type.' }
    ),
  helpNeeded: z
    .string()
    .min(1, 'Please select what you need help with.')
    .refine(
      (val) => (QUOTE_HELP_OPTIONS as readonly string[]).includes(val),
      { message: 'Please select what you need help with.' }
    ),
  mainChallenge: z
    .string()
    .trim()
    .max(1000, 'Please keep your note under 1,000 characters.')
    .optional(),
  contactName: z
    .string()
    .trim()
    .min(2, 'Please enter your name (at least 2 characters).')
    .max(100, 'Name must be 100 characters or fewer.'),
  businessName: z
    .string()
    .trim()
    .min(2, 'Please enter your business name (at least 2 characters).')
    .max(100, 'Business name must be 100 characters or fewer.'),
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your business email.')
    .email('Please enter a valid email address.'),
  phoneOrWhatsapp: z
    .string()
    .trim()
    .max(60, 'Phone number must be 60 characters or fewer.')
    .optional(),
  websiteOrInstagram: z
    .string()
    .trim()
    .max(200, 'Please keep this under 200 characters.')
    .optional(),
  countryRegion: z
    .string()
    .min(1, 'Please select where your business is based.')
    .refine(
      (val) => (QUOTE_LOCATION_OPTIONS as readonly string[]).includes(val),
      { message: 'Please select where your business is based.' }
    ),
  fullAddress: fullAddressSchema,
  consent: z
    .boolean({ error: CONSENT_ERROR_MESSAGE })
    .refine((value) => value === true, {
      message: CONSENT_ERROR_MESSAGE,
    }),
  [HONEYPOT_FIELD]: z.string().optional(),
});

export type QuoteRequestValues = z.infer<typeof quoteRequestSchema>;
