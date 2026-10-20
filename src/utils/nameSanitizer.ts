/**
 * Name Sanitizer & Thai Prefix Utilities
 * Handles detection and removal of duplicate prefixes (e.g. "นาย นาย...", "น.ส. น.ส...")
 * and provides standardized formatting for certificates and official records.
 */

export interface ParsedThaiName {
  prefix: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export const THAI_PREFIXES = [
  'นาย',
  'น.ส.',
  'นางสาว',
  'นาง',
  'ด.ช.',
  'ด.ญ.',
  'ว่าที่ร้อยตรี',
  'ว่าที่ ร.ต.',
  'Mr.',
  'Ms.',
  'Mrs.',
  'Miss'
];

/**
 * Cleans multiple spaces and trims string
 */
export function cleanSpaces(str: string): string {
  return (str || '').replace(/\s+/g, ' ').trim();
}

/**
 * Sanitizes any Thai/English name by removing duplicated prefixes
 * e.g. "นาย นาย นัตติกรณ์ ทองประสานศรี" -> "นาย นัตติกรณ์ ทองประสานศรี"
 * e.g. "น.ส. น.ส. วนิดา" -> "น.ส. วนิดา"
 */
export function sanitizeThaiName(input: {
  prefix?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}): ParsedThaiName {
  let rawPrefix = cleanSpaces(input.prefix || '');
  let rawFirst = cleanSpaces(input.firstName || '');
  let rawLast = cleanSpaces(input.lastName || '');
  let rawFull = cleanSpaces(input.fullName || '');

  // If fullName is provided without first/last
  if (rawFull && (!rawFirst || !rawLast)) {
    // Check if fullName starts with known prefixes
    let extractedPrefix = '';
    let remaining = rawFull;

    // Detect and strip duplicate prefixes at beginning of fullName
    let prefixFound = true;
    while (prefixFound) {
      prefixFound = false;
      for (const p of THAI_PREFIXES) {
        if (remaining.startsWith(p + ' ') || remaining.startsWith(p)) {
          if (!extractedPrefix) {
            extractedPrefix = p;
          }
          remaining = cleanSpaces(remaining.slice(p.length));
          prefixFound = true;
          break;
        }
      }
    }

    if (extractedPrefix && !rawPrefix) {
      rawPrefix = extractedPrefix;
    }

    // Split remaining into first and last name
    const parts = remaining.split(' ');
    if (parts.length >= 2) {
      rawFirst = parts[0];
      rawLast = parts.slice(1).join(' ');
    } else if (parts.length === 1 && parts[0]) {
      rawFirst = parts[0];
    }
  }

  // Sanitize prefix
  if (!rawPrefix) {
    rawPrefix = 'นาย';
  }

  // Strip duplicate prefix from firstName if user typed prefix inside firstName
  for (const p of THAI_PREFIXES) {
    if (rawFirst.startsWith(p + ' ')) {
      rawFirst = cleanSpaces(rawFirst.slice(p.length));
    } else if (rawFirst.startsWith(p) && rawFirst.length > p.length && p === rawPrefix) {
      // e.g. prefix is "นาย", firstName is "นายสมชาย" -> change firstName to "สมชาย"
      // But avoid stripping if name naturally starts with letters e.g. "นาวา", "นัตติกรณ์" (not "นาย")
      if (p === 'นาย' && rawFirst.startsWith('นาย') && rawFirst.length > 3) {
        // If exact prefix "นาย", strip it
        rawFirst = cleanSpaces(rawFirst.slice(3));
      } else if (p === 'นาง' && rawFirst.startsWith('นาง') && rawFirst.length > 3) {
        rawFirst = cleanSpaces(rawFirst.slice(3));
      } else if (p === 'นางสาว' && rawFirst.startsWith('นางสาว') && rawFirst.length > 6) {
        rawFirst = cleanSpaces(rawFirst.slice(6));
      } else if (p === 'น.ส.' && rawFirst.startsWith('น.ส.') && rawFirst.length > 4) {
        rawFirst = cleanSpaces(rawFirst.slice(4));
      }
    }
  }

  // Strip duplicate prefix from lastName if any
  for (const p of THAI_PREFIXES) {
    if (rawLast.startsWith(p + ' ')) {
      rawLast = cleanSpaces(rawLast.slice(p.length));
    }
  }

  // Build clean single-prefix fullName
  const cleanFullName = `${rawPrefix} ${rawFirst} ${rawLast}`.replace(/\s+/g, ' ').trim();

  return {
    prefix: rawPrefix,
    firstName: rawFirst,
    lastName: rawLast,
    fullName: cleanFullName
  };
}

/**
 * Direct string sanitizer for an existing fullName string
 */
export function cleanDuplicatePrefixes(fullName: string): string {
  if (!fullName) return '';
  const parsed = sanitizeThaiName({ fullName });
  return parsed.fullName || fullName;
}
