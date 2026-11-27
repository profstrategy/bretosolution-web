import { z } from 'zod';

/**
 * Full business address, shared by the audit and quote forms (client and
 * API). Free text, because address formats vary (Nigerian addresses often
 * use landmarks instead of house numbers), with checks that it is a real
 * address and not a stray word.
 *
 * Imports only zod, so `node --test` can load it directly.
 */
export const FULL_ADDRESS_MIN = 10;
export const FULL_ADDRESS_MAX = 300;

export const fullAddressMessages = {
  required: 'Please enter your full business address.',
  tooShort: `Please enter the full address, including the street and city (at least ${FULL_ADDRESS_MIN} characters).`,
  tooLong: `Please keep the address under ${FULL_ADDRESS_MAX} characters.`,
  incomplete: 'Please include the street or landmark and the city, e.g. "12 Admiralty Way, Lekki, Lagos".',
  invalidCharacters: 'Please remove the < and > characters from the address.',
} as const;

/** Letters in any script (Unicode), so names like "Ọ̀yọ́" are accepted. */
const LETTER = /\p{L}/u;
const ANGLE_BRACKETS = /[<>]/;

export const fullAddressSchema = z
  .string({ error: fullAddressMessages.required })
  // Collapse line breaks and repeated spaces into single spaces.
  .transform((value) => value.replace(/\s+/g, ' ').trim())
  .pipe(
    z
      .string()
      .min(1, fullAddressMessages.required)
      .min(FULL_ADDRESS_MIN, fullAddressMessages.tooShort)
      .max(FULL_ADDRESS_MAX, fullAddressMessages.tooLong)
      .refine((value) => !ANGLE_BRACKETS.test(value), fullAddressMessages.invalidCharacters)
      // At least two parts (street or landmark, and city) and some letters,
      // not just a number.
      .refine(
        (value) => LETTER.test(value) && value.split(/[\s,]+/).filter(Boolean).length >= 2,
        fullAddressMessages.incomplete
      )
  );
