import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizePreferences, DEFAULT_PREFERENCES } from '../lib/usePreferences';

test('User Preferences Sanitation & Defaults', async (t) => {
  await t.test('returns exact default preferences when raw input is null, undefined, or non-object', () => {
    assert.deepEqual(sanitizePreferences(null), DEFAULT_PREFERENCES);
    assert.deepEqual(sanitizePreferences(undefined), DEFAULT_PREFERENCES);
    assert.deepEqual(sanitizePreferences('invalid string'), DEFAULT_PREFERENCES);
    assert.deepEqual(sanitizePreferences(12345), DEFAULT_PREFERENCES);
  });

  await t.test('validates and preserves valid user preferences', () => {
    const valid = {
      theme: 'light' as const,
      lang: 'en' as const,
      selectedOs: 'linux' as const,
      selectedBuildings: ['B-huset', 'A-huset'],
      showOnlyAvailable: true,
    };

    const sanitized = sanitizePreferences(valid);
    assert.equal(sanitized.theme, 'light');
    assert.equal(sanitized.lang, 'en');
    assert.equal(sanitized.selectedOs, 'linux');
    assert.deepEqual(sanitized.selectedBuildings, ['B-huset', 'A-huset']);
    assert.equal(sanitized.showOnlyAvailable, true);
  });

  await t.test('gracefully repairs corrupted or invalid keys', () => {
    const corrupted = {
      theme: 'neon-pink', // invalid
      lang: 'fr', // invalid
      selectedOs: 'macOS', // invalid
      selectedBuildings: ['B-huset', 123, null, 'All'], // filters out non-strings and 'All'
      showOnlyAvailable: 'yes', // invalid boolean
    };

    const sanitized = sanitizePreferences(corrupted);
    assert.equal(sanitized.theme, 'light'); // fallback to default
    assert.equal(sanitized.lang, 'sv'); // fallback to default
    assert.equal(sanitized.selectedOs, 'all'); // fallback to default
    assert.deepEqual(sanitized.selectedBuildings, ['B-huset']); // filtered
    assert.equal(sanitized.showOnlyAvailable, false); // fallback to false
  });
});
