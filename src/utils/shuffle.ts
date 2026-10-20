/**
 * Fisher-Yates Shuffle Algorithm
 * Randomly shuffles an array without mutating the original
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate unique certificate serial code
 */
export function generateCertificateId(empId: string): string {
  const year = new Date().getFullYear();
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  const cleanId = empId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'EMP';
  return `TCA-QSRM-${year}-${cleanId}-${randomHex}`;
}
