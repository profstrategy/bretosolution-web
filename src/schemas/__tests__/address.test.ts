import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FULL_ADDRESS_MAX,
  fullAddressMessages,
  fullAddressSchema,
} from '../address.ts';

const errorOf = (value: unknown): string | undefined => {
  const result = fullAddressSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
};

describe('fullAddressSchema', () => {
  test('accepts real addresses, including landmark-style and non-ASCII ones', () => {
    for (const address of [
      '12 Admiralty Way, Lekki Phase 1, Lagos',
      'Plot 5, Opposite Shoprite, Wuse 2, Abuja',
      'Behind First Bank, Ring Road, Ibadan',
      'Jakana Plaza, Lagos Street, Maiduguri, Borno State',
      'Ọja Ọba, Ìbàdàn, Ọ̀yọ́ State',
      '221B Baker Street, London NW1 6XE, United Kingdom',
    ]) {
      assert.equal(fullAddressSchema.safeParse(address).success, true, address);
    }
  });

  test('trims and collapses line breaks and repeated spaces', () => {
    assert.equal(
      fullAddressSchema.parse('  12 Admiralty Way,\n  Lekki   Phase 1,\r\nLagos  '),
      '12 Admiralty Way, Lekki Phase 1, Lagos'
    );
  });

  test('requires a value', () => {
    assert.equal(errorOf(''), fullAddressMessages.required);
    assert.equal(errorOf('   \n  '), fullAddressMessages.required);
    assert.equal(errorOf(undefined), fullAddressMessages.required);
    assert.equal(errorOf(null), fullAddressMessages.required);
  });

  test('rejects addresses that are too short or too long', () => {
    assert.equal(errorOf('Lagos'), fullAddressMessages.tooShort);
    assert.equal(errorOf('12 Lekki'), fullAddressMessages.tooShort);
    assert.equal(errorOf(`12 Admiralty Way, ${'a'.repeat(FULL_ADDRESS_MAX)}`), fullAddressMessages.tooLong);
    assert.equal(fullAddressSchema.safeParse(`12 Way, ${'a'.repeat(FULL_ADDRESS_MAX - 8)}`).success, true);
  });

  test('rejects a single word or digits only', () => {
    assert.equal(errorOf('Lekkiphaseone'), fullAddressMessages.incomplete);
    assert.equal(errorOf('1234567890 12'), fullAddressMessages.incomplete);
  });

  test('rejects angle brackets (markup)', () => {
    assert.equal(errorOf('<b>12 Admiralty Way</b>, Lagos'), fullAddressMessages.invalidCharacters);
  });
});
