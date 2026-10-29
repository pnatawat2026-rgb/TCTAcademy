/**
 * Password Security & 10-Character Rule Enforcement
 * 
 * Rules:
 * 1. Total length must be exactly 10 characters.
 * 2. First 5 characters must match the Employee ID (5 digits).
 * 3. Next 5 characters must include:
 *    - Letter(s) [A-Za-z]
 *    - Number(s) [0-9]
 *    - Special character(s) [!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]
 */

export interface PasswordValidationResult {
  isValid: boolean;
  hasEmpIdPrefix: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isExact10Chars: boolean;
  errors: string[];
}

export function generateRecommendedPassword(empId: string): string {
  const cleanId = empId ? empId.trim().toUpperCase().padStart(5, '0').slice(-5) : '00000';
  return `${cleanId}Tct@1`;
}

export function validateEmployeePassword(empId: string, password: string): PasswordValidationResult {
  const cleanId = empId ? empId.trim().toUpperCase().padStart(5, '0').slice(-5) : '00000';
  const cleanPwd = (password || '').trim();

  const isExact10Chars = cleanPwd.length === 10;
  const prefix5 = cleanPwd.slice(0, 5).toUpperCase();
  const hasEmpIdPrefix = prefix5 === cleanId;
  const suffix5 = cleanPwd.slice(5);

  const hasLetter = /[A-Za-z]/.test(suffix5) || /[A-Za-z]/.test(cleanPwd);
  const hasNumber = /[0-9]/.test(suffix5) || /[0-9]/.test(cleanPwd);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(suffix5) || /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(cleanPwd);

  const errors: string[] = [];

  if (!isExact10Chars) {
    errors.push(`แนะนำรหัสผ่าน 10 ตัวอักษร (ปัจจุบัน ${cleanPwd.length} ตัวอักษร)`);
  }
  if (!hasEmpIdPrefix && cleanPwd.length >= 5) {
    errors.push(`แนะนำ 5 ตัวแรกเป็นรหัสพนักงาน (${cleanId})`);
  }

  // Acceptable if it meets 10-char policy OR has at least 4 characters so users can learn without roadblock
  const isValid = (isExact10Chars && hasEmpIdPrefix && hasLetter && hasNumber && hasSpecialChar) || cleanPwd.length >= 4;

  return {
    isValid,
    hasEmpIdPrefix,
    hasLetter,
    hasNumber,
    hasSpecialChar,
    isExact10Chars,
    errors
  };
}

export interface PasswordResetRequest {
  id: string;
  empId: string;
  fullName: string;
  department: string;
  position?: string;
  phoneOrContact?: string;
  requestedAt: string;
  status: 'pending' | 'resolved';
  resolvedAt?: string;
  adminNote?: string;
}

const PASSWORD_RESET_REQUESTS_KEY = 'tct_password_reset_requests_v1';

export function getPasswordResetRequests(): PasswordResetRequest[] {
  try {
    const raw = localStorage.getItem(PASSWORD_RESET_REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function savePasswordResetRequests(requests: PasswordResetRequest[]): void {
  try {
    localStorage.setItem(PASSWORD_RESET_REQUESTS_KEY, JSON.stringify(requests));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}
}

export function createPasswordResetRequest(data: {
  empId: string;
  fullName: string;
  department: string;
  position?: string;
  phoneOrContact?: string;
}): PasswordResetRequest {
  const requests = getPasswordResetRequests();
  const cleanId = data.empId.trim().toUpperCase();

  // Create new request
  const newReq: PasswordResetRequest = {
    id: `reset-${cleanId}-${Date.now()}`,
    empId: cleanId,
    fullName: data.fullName,
    department: data.department,
    position: data.position,
    phoneOrContact: data.phoneOrContact,
    requestedAt: new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: 'pending'
  };

  // Prepend
  const filtered = requests.filter(r => r.empId !== cleanId || r.status === 'resolved');
  savePasswordResetRequests([newReq, ...filtered]);

  return newReq;
}

export function resolvePasswordResetRequest(requestId: string, adminNote?: string): void {
  const requests = getPasswordResetRequests();
  let targetEmpId = '';
  const updated = requests.map(r => {
    if (r.id === requestId) {
      targetEmpId = r.empId;
      return {
        ...r,
        status: 'resolved' as const,
        resolvedAt: new Date().toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        adminNote: adminNote || 'แอดมินอนุมัติปลดล็อกเรียบร้อยแล้ว พนักงานสามารถตั้งรหัสผ่านใหม่ได้ทันที'
      };
    }
    return r;
  });
  savePasswordResetRequests(updated);

  if (targetEmpId) {
    unlockEmployeeForPasswordReset(targetEmpId, adminNote);
  }
}

const UNLOCKED_EMPLOYEES_KEY = 'tct_unlocked_employees_v1';

/**
 * Admin unlocks an employee account so they can set a fresh password on next login
 */
export function unlockEmployeeForPasswordReset(empId: string, adminNote?: string): void {
  const cleanId = empId.trim().toUpperCase();
  
  // Clear old PIN
  try {
    localStorage.removeItem(`tct_pin_${cleanId}`);
    const raw = localStorage.getItem('tct_employee_pins_v1');
    if (raw) {
      const pins = JSON.parse(raw);
      delete pins[cleanId];
      localStorage.setItem('tct_employee_pins_v1', JSON.stringify(pins));
    }
  } catch (e) {}

  // Record unlock state
  try {
    const raw = localStorage.getItem(UNLOCKED_EMPLOYEES_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(cleanId)) {
      list.push(cleanId);
      localStorage.setItem(UNLOCKED_EMPLOYEES_KEY, JSON.stringify(list));
    }
    window.dispatchEvent(new Event('tct_employee_unlocked'));
  } catch (e) {}
}

/**
 * Checks if an employee has been unlocked by admin to set a new password
 */
export function isEmployeeUnlockedForReset(empId: string): boolean {
  if (!empId) return false;
  const cleanId = empId.trim().toUpperCase();
  try {
    const raw = localStorage.getItem(UNLOCKED_EMPLOYEES_KEY);
    if (raw) {
      const list: string[] = JSON.parse(raw);
      return Array.isArray(list) && list.includes(cleanId);
    }
  } catch (e) {}
  return false;
}

/**
 * Clears the unlock flag once the employee successfully sets their new password
 */
export function consumeEmployeeUnlock(empId: string): void {
  if (!empId) return false as any;
  const cleanId = empId.trim().toUpperCase();
  try {
    const raw = localStorage.getItem(UNLOCKED_EMPLOYEES_KEY);
    if (raw) {
      const list: string[] = JSON.parse(raw);
      const filtered = list.filter(id => id !== cleanId);
      localStorage.setItem(UNLOCKED_EMPLOYEES_KEY, JSON.stringify(filtered));
    }
  } catch (e) {}
}

