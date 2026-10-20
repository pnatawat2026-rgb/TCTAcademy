import type { TraineeRecord, UserProfile, CapaItem, SystemAuditLog, PredefinedEmployee } from '../types';
import { sanitizeThaiName, cleanDuplicatePrefixes } from '../utils/nameSanitizer';
import { MASTER_EMPLOYEE_ROSTER_230, getMasterEmployeeRoster } from './employeeDatabase';
import { APPLIED_PSYCHOLOGY_INITIAL_TRAINEES } from './appliedPsychologyCourseData';
import { saveUserProgressToFirestore, updateRosterTrainee } from '../firebase';

export type { PredefinedEmployee };

// -------------------------------------------------------------
// Official Registered Employee Roster (รายชื่อพนักงานที่มีสิทธิ์เข้าใช้งาน)
// -------------------------------------------------------------
export const QSRM_PREDEFINED_EMPLOYEES: PredefinedEmployee[] = [];
export const APM_PREDEFINED_EMPLOYEES: PredefinedEmployee[] = [];
export const PREDEFINED_EMPLOYEES: PredefinedEmployee[] = [];

export const CUSTOM_EMPLOYEES_STORAGE_KEY = 'tct_registered_custom_employees_v1';

export function getCustomRegisteredEmployees(): PredefinedEmployee[] {
  try {
    const saved = localStorage.getItem(CUSTOM_EMPLOYEES_STORAGE_KEY);
    if (saved) {
      const parsed: PredefinedEmployee[] = JSON.parse(saved);
      return parsed.map(emp => {
        const sanitized = sanitizeThaiName({
          prefix: emp.prefix,
          firstName: emp.firstName,
          lastName: emp.lastName,
          fullName: emp.fullName
        });
        return {
          ...emp,
          prefix: sanitized.prefix,
          firstName: sanitized.firstName,
          lastName: sanitized.lastName,
          fullName: sanitized.fullName,
          division: emp.division || 'ฝ่ายผลิต'
        };
      });
    }
  } catch (e) {
    console.debug('Error loading custom employees', e);
  }
  return [];
}

export function getDeletedTraineeIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_TRAINEES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]).map(id => (id || '').trim().toUpperCase()).filter(Boolean) : [];
  } catch (e) {
    return [];
  }
}

export function unDeleteTraineeId(empId: string): void {
  if (!empId) return;
  const cleanId = empId.trim().toUpperCase();
  const deletedIds = getDeletedTraineeIds().filter(id => id !== cleanId);
  try {
    localStorage.setItem(DELETED_TRAINEES_STORAGE_KEY, JSON.stringify(deletedIds));
  } catch (e) {}
}

export function getAllRegisteredEmployees(): PredefinedEmployee[] {
  const deletedIds = new Set(getDeletedTraineeIds());
  const custom = getCustomRegisteredEmployees().filter(e => !deletedIds.has(e.empId.trim().toUpperCase()));
  const map = new Map<string, PredefinedEmployee>();
  
  for (const emp of custom) {
    map.set(emp.empId.trim().toUpperCase(), emp);
  }

  // Include authentic participants who took exams starting 12 Oct
  for (const psyTr of APPLIED_PSYCHOLOGY_INITIAL_TRAINEES) {
    const cleanId = psyTr.empId.trim().toUpperCase();
    if (!map.has(cleanId) && !deletedIds.has(cleanId)) {
      const sanitized = sanitizeThaiName({ fullName: psyTr.fullName });
      map.set(cleanId, {
        empId: cleanId,
        prefix: psyTr.prefix || sanitized.prefix || 'นาย',
        firstName: sanitized.firstName,
        lastName: sanitized.lastName,
        fullName: psyTr.fullName,
        department: psyTr.department || 'P',
        position: psyTr.position || 'Worker',
        division: psyTr.division || 'ฝ่ายผลิต'
      });
    }
  }

  // Include official Master Employee Roster (224 employees from Teijin Cord Thailand)
  for (const emp of MASTER_EMPLOYEE_ROSTER_230) {
    const cleanId = emp.empId.trim().toUpperCase();
    if (!map.has(cleanId) && !deletedIds.has(cleanId)) {
      map.set(cleanId, emp);
    }
  }

  return Array.from(map.values());
}

export function registerNewEmployee(employee: PredefinedEmployee): boolean {
  try {
    const cleanId = employee.empId.trim().toUpperCase();
    unDeleteTraineeId(cleanId);

    const custom = getCustomRegisteredEmployees();
    const existingIndex = custom.findIndex(e => e.empId.trim().toUpperCase() === cleanId);
    
    const sanitized = sanitizeThaiName({
      prefix: employee.prefix,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: employee.fullName
    });

    const formatted: PredefinedEmployee = {
      ...employee,
      empId: cleanId,
      prefix: sanitized.prefix,
      firstName: sanitized.firstName,
      lastName: sanitized.lastName,
      fullName: sanitized.fullName,
      department: employee.department || 'P',
      position: employee.position || 'Worker',
      division: employee.division || 'ฝ่ายผลิต'
    };

    if (existingIndex >= 0) {
      custom[existingIndex] = formatted;
    } else {
      custom.unshift(formatted);
    }

    localStorage.setItem(CUSTOM_EMPLOYEES_STORAGE_KEY, JSON.stringify(custom));

    // Also ensure this employee is recorded in the admin trainee records
    const storedTrainees = getStoredTrainees();
    const existingTraineeIndex = storedTrainees.findIndex(t => t.empId.trim().toUpperCase() === cleanId);
    if (existingTraineeIndex < 0) {
      const newTrainee: TraineeRecord = {
        id: `reg-${cleanId}-${Date.now()}`,
        empId: cleanId,
        fullName: formatted.fullName,
        prefix: formatted.prefix,
        department: formatted.department,
        position: formatted.position || 'พนักงานเข้าอบรม',
        division: formatted.division,
        enrolledAt: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
        status: 'not_started',
        preTestScore: null,
        postTestScore: null,
        postTestAttempts: 0,
        miniGameScore: 0,
        completedModules: [],
        evaluationSubmitted: false,
        selectedCourseId: 'applied-psychology'
      };
      saveStoredTrainees([newTrainee, ...storedTrainees]);
    } else {
      // Update existing trainee's name and details
      storedTrainees[existingTraineeIndex] = {
        ...storedTrainees[existingTraineeIndex],
        fullName: formatted.fullName,
        prefix: formatted.prefix,
        department: formatted.department,
        position: formatted.position || storedTrainees[existingTraineeIndex].position,
        division: formatted.division || storedTrainees[existingTraineeIndex].division
      };
      saveStoredTrainees(storedTrainees);
    }

    return true;
  } catch (e) {
    console.debug('Error registering custom employee', e);
    return false;
  }
}

/**
 * Updates an employee's personal profile (Name, Department, Position, etc.)
 * across all system storage keys, user states, and admin rosters.
 */
export function updateEmployeeProfile(data: {
  empId: string;
  prefix?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  department?: string;
  position?: string;
  notes?: string;
}): { success: boolean; updatedFullName: string } {
  try {
    const cleanId = data.empId.trim().toUpperCase();
    const sanitized = sanitizeThaiName({
      prefix: data.prefix,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: data.fullName
    });

    const cleanFullName = sanitized.fullName;

    // 1. Update custom registered employees
    const custom = getCustomRegisteredEmployees();
    const customIdx = custom.findIndex(e => e.empId.trim().toUpperCase() === cleanId);
    const updatedEmployee: PredefinedEmployee = {
      empId: cleanId,
      prefix: sanitized.prefix,
      firstName: sanitized.firstName,
      lastName: sanitized.lastName,
      fullName: cleanFullName,
      department: data.department || 'P',
      position: data.position || 'SUPERVISOR'
    };

    if (customIdx >= 0) {
      custom[customIdx] = updatedEmployee;
    } else {
      custom.unshift(updatedEmployee);
    }
    localStorage.setItem(CUSTOM_EMPLOYEES_STORAGE_KEY, JSON.stringify(custom));

    // 2. Update admin trainees roster
    const trainees = getStoredTrainees();
    const traineeIdx = trainees.findIndex(t => t.empId.trim().toUpperCase() === cleanId);
    if (traineeIdx >= 0) {
      trainees[traineeIdx] = {
        ...trainees[traineeIdx],
        fullName: cleanFullName,
        department: data.department || trainees[traineeIdx].department,
        position: data.position || trainees[traineeIdx].position,
        notes: data.notes !== undefined ? data.notes : trainees[traineeIdx].notes
      };
      saveStoredTrainees(trainees);
    } else {
      const newTrainee: TraineeRecord = {
        id: `trainee-${cleanId}-${Date.now()}`,
        empId: cleanId,
        fullName: cleanFullName,
        department: data.department || 'P',
        position: data.position || 'SUPERVISOR',
        notes: data.notes,
        enrolledAt: new Date().toLocaleDateString('th-TH'),
        status: 'not_started',
        preTestScore: null,
        postTestScore: null,
        postTestAttempts: 0,
        miniGameScore: 0,
        completedModules: [],
        evaluationSubmitted: false
      };
      saveStoredTrainees([newTrainee, ...trainees]);
    }

    // 3. Update dedicated per-user storage key
    try {
      const userKey = `${USER_STATE_PREFIX}${cleanId}`;
      const savedUser = localStorage.getItem(userKey);
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const updatedU = {
          ...u,
          prefix: sanitized.prefix,
          fullName: cleanFullName,
          department: data.department || u.department,
          position: data.position || u.position
        };
        localStorage.setItem(userKey, JSON.stringify(updatedU));
      }
    } catch (e) {
      console.debug('Error updating user state key', e);
    }

    // 4. Update active session if matching
    try {
      const sessionRaw = localStorage.getItem('tct_qsrm_learning_state_v1');
      if (sessionRaw) {
        const sessionUser = JSON.parse(sessionRaw);
        if (sessionUser.empId && sessionUser.empId.trim().toUpperCase() === cleanId) {
          const updatedSession = {
            ...sessionUser,
            prefix: sanitized.prefix,
            fullName: cleanFullName,
            department: data.department || sessionUser.department,
            position: data.position || sessionUser.position
          };
          localStorage.setItem('tct_qsrm_learning_state_v1', JSON.stringify(updatedSession));
        }
      }
    } catch (e) {
      console.debug('Error updating active session', e);
    }

    // 5. Add audit log
    addStoredAuditLog({
      empId: cleanId,
      action: 'profile_updated',
      detail: `อัปเดตข้อมูลส่วนตัว: ${cleanFullName} (แผนก ${data.department || 'P'})`
    });

    // 6. Sync profile updates directly to centralized server
    try {
      fetch(`/api/trainees/${encodeURIComponent(cleanId)}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empId: cleanId,
          prefix: sanitized.prefix,
          fullName: cleanFullName,
          department: data.department,
          position: data.position,
          notes: data.notes
        })
      }).catch(() => {});

      fetch('/api/trainees/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            empId: cleanId,
            fullName: cleanFullName,
            prefix: sanitized.prefix,
            department: data.department || 'P',
            position: data.position || 'SUPERVISOR',
            notes: data.notes
          },
          activityType: 'profile_updated',
          detail: `แก้ไขข้อมูลพนักงาน: ${cleanFullName} (${data.department || 'P'})`
        })
      }).catch(() => {});
    } catch (e) {
      // Ignore offline server sync
    }

    return { success: true, updatedFullName: cleanFullName };
  } catch (e) {
    console.debug('Error updating employee profile', e);
    return { success: false, updatedFullName: '' };
  }
}

/**
 * Searches for an employee in the predefined roster or registered employees by employee ID or query.
 */
export function findEmployeeByEmpId(query: string): PredefinedEmployee | undefined {
  if (!query || !query.trim()) return undefined;
  const clean = query.trim().toLowerCase();
  const cleanPadded = clean.length < 5 && /^\d+$/.test(clean) ? clean.padStart(5, '0') : clean;
  const allList = getAllRegisteredEmployees();
  
  // 1. Try exact match, zero-padded match, or unpadded match in registered employees
  const foundInRegistered = allList.find(emp => {
    const empIdClean = emp.empId.toLowerCase();
    if (empIdClean === clean || empIdClean === cleanPadded) return true;
    // Also handle cases without leading zero, e.g. "3007" matching "03007"
    if (clean.replace(/^0+/, '') === empIdClean.replace(/^0+/, '')) return true;
    return false;
  });

  if (foundInRegistered) return foundInRegistered;

  // 2. Fallback: check stored admin trainees
  try {
    const stored = getStoredTrainees();
    const foundInStored = stored.find(t => {
      const tId = t.empId.toLowerCase();
      return tId === clean || tId === cleanPadded || (clean.replace(/^0+/, '') === tId.replace(/^0+/, ''));
    });
    if (foundInStored && foundInStored.fullName) {
      const parsed = sanitizeThaiName({ fullName: foundInStored.fullName });
      return {
        empId: foundInStored.empId,
        prefix: parsed.prefix || 'นาย',
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        fullName: foundInStored.fullName,
        department: foundInStored.department || 'P',
        position: foundInStored.position || 'SUPERVISOR'
      };
    }
  } catch (e) {}

  // 3. Fallback: check user persistent progress
  try {
    const persistent = getUserPersistentProgress(query);
    if (persistent && persistent.fullName) {
      const parsed = sanitizeThaiName({ fullName: persistent.fullName });
      return {
        empId: persistent.empId || query.trim().toUpperCase(),
        prefix: parsed.prefix || 'นาย',
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        fullName: persistent.fullName,
        department: persistent.department || 'P',
        position: persistent.position || 'SUPERVISOR'
      };
    }
  } catch (e) {}

  return undefined;
}

// -------------------------------------------------------------
// Standard Positions (1. Worker, 2. Leader, 3. Clerk, 4. Supervisor, 5. Chief, 6. Manager)
// -------------------------------------------------------------
export const STANDARD_POSITIONS = [
  'Worker',
  'Leader',
  'Clerk',
  'Supervisor',
  'Chief',
  'Manager'
] as const;

export type StandardPosition = typeof STANDARD_POSITIONS[number];

export const POSITION_OPTIONS: { id: StandardPosition; label: string; number: number }[] = [
  { id: 'Worker', label: '1. Worker (พนักงานฝ่ายปฏิบัติการ / ฝ่ายผลิต)', number: 1 },
  { id: 'Leader', label: '2. Leader (หัวหน้ากลุ่ม / หัวหน้ากะ)', number: 2 },
  { id: 'Clerk', label: '3. Clerk (เจ้าหน้าที่ธุรการ / พนักงานธุรการ)', number: 3 },
  { id: 'Supervisor', label: '4. Supervisor (หัวหน้างาน)', number: 4 },
  { id: 'Chief', label: '5. Chief (หัวหน้าแผนก)', number: 5 },
  { id: 'Manager', label: '6. Manager (ผู้จัดการ)', number: 6 }
];

export function normalizeStandardPosition(rawPos?: string): StandardPosition {
  if (!rawPos) return 'Worker';
  const clean = rawPos.trim().toLowerCase();
  if (clean.includes('worker') || clean.includes('operator') || clean.includes('technician') || clean.includes('ช่าง') || clean.includes('ปฏิบัติการ') || clean.includes('ผลิต')) {
    return 'Worker';
  }
  if (clean.includes('leader') || clean.includes('กะ') || clean.includes('กลุ่ม')) {
    return 'Leader';
  }
  if (clean.includes('clerk') || clean.includes('ธุรการ') || clean.includes('officer') || clean.includes('accountant') || clean.includes('staff')) {
    return 'Clerk';
  }
  if (clean.includes('supervisor') || clean.includes('หัวหน้างาน') || clean.includes('engineer') || clean.includes('วิศวกร')) {
    return 'Supervisor';
  }
  if (clean.includes('chief') || clean.includes('หัวหน้าแผนก') || clean.includes('assistant manager')) {
    return 'Chief';
  }
  if (clean.includes('manager') || clean.includes('ผู้จัดการ')) {
    return 'Manager';
  }
  return 'Worker';
}

// -------------------------------------------------------------
// Security PIN & Account Protection Management
// -------------------------------------------------------------
const EMPLOYEE_PINS_STORAGE_KEY = 'tct_employee_pins_v1';

export function getAllEmployeePins(): Record<string, string> {
  try {
    const raw = localStorage.getItem(EMPLOYEE_PINS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function getEmployeePin(empId: string): string | null {
  if (!empId) return null;
  const clean = empId.trim().toUpperCase();
  const pins = getAllEmployeePins();
  return pins[clean] || null;
}

export function setEmployeePin(empId: string, pin: string): void {
  if (!empId || !pin) return;
  const clean = empId.trim().toUpperCase();
  const pins = getAllEmployeePins();
  pins[clean] = pin.trim();
  localStorage.setItem(EMPLOYEE_PINS_STORAGE_KEY, JSON.stringify(pins));
}

export function verifyEmployeePin(empId: string, pinInput: string): boolean {
  if (!empId || !pinInput) return false;
  const storedPin = getEmployeePin(empId);
  if (!storedPin) return false;
  return storedPin === pinInput.trim();
}

export function hasEmployeeRegisteredPin(empId: string): boolean {
  return getEmployeePin(empId) !== null;
}

export function resetEmployeePinByAdmin(empId: string, newPin: string): boolean {
  if (!empId || !newPin) return false;
  setEmployeePin(empId, newPin);
  return true;
}

export function hasEmployeePriorHistory(empId: string): boolean {
  if (!empId) return false;
  const clean = empId.trim().toUpperCase();
  
  // 1. Check persistent learning progress
  const progress = getUserPersistentProgress(clean);
  if (progress) {
    if (
      progress.preTestScore !== null ||
      progress.postTestScore !== null ||
      (progress.completedModules && progress.completedModules.length > 0) ||
      progress.evaluationSubmitted ||
      progress.lastActiveTimestamp
    ) {
      return true;
    }
  }
  
  // 2. Check admin trainees record
  const trainees = getStoredTrainees();
  const t = trainees.find(tr => tr.empId.trim().toUpperCase() === clean);
  if (t) {
    if (
      t.preTestScore !== null ||
      t.postTestScore !== null ||
      (t.completedModules && t.completedModules.length > 0) ||
      t.status === 'passed' ||
      t.status === 'in_progress'
    ) {
      return true;
    }
  }
  
  // 3. Check if user already set a PIN
  if (hasEmployeeRegisteredPin(clean)) {
    return true;
  }

  return false;
}

// -------------------------------------------------------------
// Official Registered Employee Roster (รายชื่อพนักงานที่เข้าใช้งานจริง)
// หลักสูตรการบำรุงรักษาเชิงป้องกันขั้นสูง (APM) ที่มีคนเข้าใช้งานจริงและสอบผ่านแล้ว 13 ท่าน
// -------------------------------------------------------------
export const APM_ACTIVE_COMPLETED_EMPLOYEES: TraineeRecord[] = [];

export const AI_ACTIVE_COMPLETED_EMPLOYEES: TraineeRecord[] = [];

function buildInitialTrainees(): TraineeRecord[] {
  const map = new Map<string, TraineeRecord>();

  // 1. Populate all official employees in the company roster (224 employees)
  for (const emp of MASTER_EMPLOYEE_ROSTER_230) {
    const cleanId = emp.empId.trim().toUpperCase();
    map.set(cleanId, {
      id: `emp-${cleanId}`,
      empId: cleanId,
      prefix: emp.prefix,
      fullName: emp.fullName,
      department: emp.department,
      position: emp.position,
      enrolledAt: '2026-10-12',
      status: 'not_started',
      preTestScore: null,
      postTestScore: null,
      postTestAttempts: 0,
      miniGameScore: 0,
      completedModules: [],
      evaluationSubmitted: false,
      selectedCourseId: 'applied-psychology',
      enrolledCourses: ['applied-psychology'],
      currentStep: 'ลงทะเบียนเข้าเรียนรอบที่ 1 แล้ว (รอเริ่มเรียน 12-16 ต.ค. 2569)',
      coursesProgress: {
        'applied-psychology': {
          preTestScore: null,
          postTestScore: null,
          postTestAttempts: 0,
          miniGameScore: 0,
          completedModules: [],
          evaluationSubmitted: false,
          lastActiveStep: 'ลงทะเบียนเข้าเรียนรอบที่ 1 แล้ว (รอเริ่มเรียน 12-16 ต.ค. 2569)'
        }
      }
    });
  }

  // 2. Overlay authentic trainees who took the exam starting 12 Oct 2569
  for (const psyTr of APPLIED_PSYCHOLOGY_INITIAL_TRAINEES) {
    const cleanId = psyTr.empId.trim().toUpperCase();
    const existing = map.get(cleanId);
    map.set(cleanId, {
      ...(existing || {}),
      ...psyTr,
      empId: cleanId
    });
  }

  return Array.from(map.values());
}

export const INITIAL_TRAINEES: TraineeRecord[] = buildInitialTrainees();

const ADMIN_TRAINEES_STORAGE_KEY = 'tct_qsrm_admin_trainees_v6';
const ADMIN_CAPA_STORAGE_KEY = 'tct_qsrm_admin_capa_v6';
const ADMIN_AUDIT_LOGS_STORAGE_KEY = 'tct_qsrm_audit_logs_v6';
const DELETED_TRAINEES_STORAGE_KEY = 'tct_deleted_trainees_v6';
export const USER_STATE_PREFIX = 'tct_user_state_';

export const APM_COMPLETED_EMP_IDS = new Set<string>();
export const AI_COMPLETED_EMP_IDS = new Set<string>(['25056']);

/**
 * Purges mock/un-started trainees for all courses so that:
 * "ในแต่ละหลักสูตรไม่ต้องเอาชื่อคนที่ยังไม่ทำมาใส่ ให้คอยรับข้อมูลจากคนที่ทำแล้วเท่านั้น และบันทึกไว้ ใครเข้ามาทำจริง ให้เป็นแบบนี้ทุกหลักสูตร"
 */
export function purgeUnusedCourseRosters(): void {
  try {
    const PURGE_FLAG = 'tct_roster_purged_v11';
    if (localStorage.getItem(PURGE_FLAG) === 'true') {
      return;
    }

    const raw = localStorage.getItem(ADMIN_TRAINEES_STORAGE_KEY);
    let list: TraineeRecord[] = raw ? JSON.parse(raw) : [];

    // Filter trainees: keep only those with genuine user state and real progress
    const realUsers = list.filter(t => {
      const cleanId = t.empId.trim().toUpperCase();
      if (cleanId === '25056') return true;

      // Must have actual local user state AND actual course scores/modules
      const hasUserState = Boolean(localStorage.getItem(`${USER_STATE_PREFIX}${cleanId}`));
      if (!hasUserState) return false;

      let hasCourseScore = false;
      if (t.coursesProgress) {
        for (const cKey of Object.keys(t.coursesProgress)) {
          const cp = t.coursesProgress[cKey];
          if (
            cp &&
            ((cp.preTestScore !== null && cp.preTestScore !== undefined) ||
              (cp.completedModules && cp.completedModules.length > 0) ||
              (cp.postTestScore !== null && cp.postTestScore !== undefined) ||
              cp.evaluationSubmitted ||
              Boolean(cp.certificateId))
          ) {
            hasCourseScore = true;
            break;
          }
        }
      }

      const hasScores =
        (t.preTestScore !== null && t.preTestScore !== undefined) ||
        (t.completedModules && t.completedModules.length > 0) ||
        (t.postTestScore !== null && t.postTestScore !== undefined);

      return hasCourseScore || hasScores;
    });

    const mergedMap = new Map<string, TraineeRecord>();
    INITIAL_TRAINEES.forEach(t => mergedMap.set(t.empId.toUpperCase(), t));
    realUsers.forEach(t => {
      const id = t.empId.toUpperCase();
      if (!mergedMap.has(id)) {
        mergedMap.set(id, t);
      } else {
        const existing = mergedMap.get(id)!;
        mergedMap.set(id, {
          ...existing,
          ...t,
          enrolledCourses: Array.from(new Set([...(existing.enrolledCourses || []), ...(t.enrolledCourses || [])])),
          coursesProgress: { ...(existing.coursesProgress || {}), ...(t.coursesProgress || {}) }
        });
      }
    });

    localStorage.setItem(ADMIN_TRAINEES_STORAGE_KEY, JSON.stringify(Array.from(mergedMap.values())));

    // Clean enrollments store so courses don't show mock trainees
    const cleanEnrollments: Record<string, string[]> = {};
    const enrollmentsRaw = localStorage.getItem('tct_course_enrollments_v3');
    if (enrollmentsRaw) {
      const enrollments = JSON.parse(enrollmentsRaw);
      Object.keys(enrollments).forEach(courseId => {
        const ids = enrollments[courseId] || [];
        cleanEnrollments[courseId] = ids.filter((id: string) => {
          const clean = id.trim().toUpperCase();
          const persistent = getUserPersistentProgress(clean);
          return (
            persistent?.coursesProgress?.[courseId] &&
            (persistent.coursesProgress[courseId].preTestScore !== null ||
              (persistent.coursesProgress[courseId].completedModules &&
                persistent.coursesProgress[courseId].completedModules.length > 0) ||
              persistent.coursesProgress[courseId].postTestScore !== null)
          );
        });
      });
    }

    localStorage.setItem('tct_course_enrollments_v3', JSON.stringify(cleanEnrollments));
    localStorage.setItem(PURGE_FLAG, 'true');
  } catch (err) {
    console.debug('Error in purgeUnusedCourseRosters', err);
  }
}

// Do not automatically purge rosters on initialization to prevent wiping genuine users
// purgeUnusedCourseRosters();

export function deleteTraineeRecord(empId: string): boolean {
  if (!empId) return false;
  const cleanId = empId.trim().toUpperCase();

  try {
    // 1. Add to deleted tracking list so it is never re-added
    const deletedIds = getDeletedTraineeIds();
    if (!deletedIds.includes(cleanId)) {
      deletedIds.push(cleanId);
      localStorage.setItem(DELETED_TRAINEES_STORAGE_KEY, JSON.stringify(deletedIds));
    }

    // 2. Remove from admin stored trainees
    const list = getStoredTrainees();
    const updatedList = list.filter(t => t.empId.trim().toUpperCase() !== cleanId);
    saveStoredTrainees(updatedList);

    // 3. Remove from custom registered employees
    const custom = getCustomRegisteredEmployees();
    const updatedCustom = custom.filter(e => e.empId.trim().toUpperCase() !== cleanId);
    localStorage.setItem(CUSTOM_EMPLOYEES_STORAGE_KEY, JSON.stringify(updatedCustom));

    // 4. Remove user state
    localStorage.removeItem(`${USER_STATE_PREFIX}${cleanId}`);

    // 5. If active session is this employee, clear active session
    const sessionRaw = localStorage.getItem('tct_qsrm_learning_state_v1');
    if (sessionRaw) {
      try {
        const u = JSON.parse(sessionRaw);
        if (u.empId && u.empId.trim().toUpperCase() === cleanId) {
          localStorage.removeItem('tct_qsrm_learning_state_v1');
        }
      } catch (e) {}
    }

    // 6. Delete on server backend
    fetch(`/api/trainees/${encodeURIComponent(cleanId)}`, { method: 'DELETE' }).catch(() => {});

    // 7. Add audit log
    addStoredAuditLog({
      empId: cleanId,
      action: 'profile_updated',
      detail: `ลบรายชื่อพนักงานรหัส ${cleanId} ออกจากระบบเรียบร้อยแล้ว`
    });

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('tct_trainee_deleted', { detail: { empId: cleanId } }));
    return true;
  } catch (e) {
    console.error('Error deleting trainee record', e);
    return false;
  }
}

export async function deleteTraineeRecordAsync(empId: string): Promise<boolean> {
  if (!empId) return false;
  const cleanId = empId.trim().toUpperCase();

  try {
    // 1. Delete on server backend first
    try {
      await fetch(`/api/trainees/${encodeURIComponent(cleanId)}`, { method: 'DELETE' });
    } catch (err) {
      console.debug('Server delete failed or offline', err);
    }

    // 2. Perform local delete & blacklist
    return deleteTraineeRecord(cleanId);
  } catch (e) {
    console.error('Error in async delete trainee', e);
    return false;
  }
}

export function addTraineeRecord(record: Partial<TraineeRecord>): TraineeRecord {
  const cleanId = (record.empId || '').trim().toUpperCase();
  const cleanFullName = (record.fullName || cleanId).trim();
  const dept = record.department || 'MN';
  const pos = record.position || 'พนักงานฝ่ายซ่อมบำรุง';

  // 1. Remove from deleted set if was previously deleted
  const deletedIds = getDeletedTraineeIds().filter(id => id !== cleanId);
  localStorage.setItem(DELETED_TRAINEES_STORAGE_KEY, JSON.stringify(deletedIds));

  // 2. Register in custom employees
  const custom = getCustomRegisteredEmployees().filter(e => e.empId.trim().toUpperCase() !== cleanId);
  custom.unshift({
    empId: cleanId,
    prefix: '',
    firstName: cleanFullName,
    lastName: '',
    fullName: cleanFullName,
    department: dept,
    position: pos
  });
  localStorage.setItem(CUSTOM_EMPLOYEES_STORAGE_KEY, JSON.stringify(custom));

  const isPassed = record.postTestScore !== null && record.postTestScore !== undefined && record.postTestScore >= 8;
  const newTrainee: TraineeRecord = {
    id: record.id || `trainee-${cleanId}-${Date.now()}`,
    empId: cleanId,
    fullName: cleanFullName,
    department: dept,
    position: pos,
    notes: record.notes,
    enrolledAt: record.enrolledAt || new Date().toISOString().split('T')[0],
    completedAt: isPassed ? (record.completedAt || new Date().toISOString().split('T')[0]) : undefined,
    status: isPassed ? 'passed' : ((record.preTestScore !== null && record.preTestScore !== undefined) ? 'in_progress' : 'not_started'),
    preTestScore: record.preTestScore ?? null,
    postTestScore: record.postTestScore ?? null,
    postTestAttempts: record.postTestAttempts || (isPassed ? 1 : 0),
    miniGameScore: record.miniGameScore || (isPassed ? 100 : 0),
    completedModules: record.completedModules || (isPassed ? [1, 2, 3] : []),
    evaluationSubmitted: record.evaluationSubmitted || isPassed,
    satisfactionScore: record.satisfactionScore || (isPassed ? 5 : undefined),
    certificateId: record.certificateId || (isPassed ? `TCA-APM-2026-${cleanId}-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
    certificateDate: record.certificateDate || (isPassed ? '29 สิงหาคม 2569' : undefined),
    selectedCourseId: record.selectedCourseId || 'advanced-preventive-maintenance',
    coursesProgress: record.coursesProgress || {
      'advanced-preventive-maintenance': {
        preTestScore: record.preTestScore ?? null,
        postTestScore: record.postTestScore ?? null,
        postTestAttempts: record.postTestAttempts || (isPassed ? 1 : 0),
        miniGameScore: record.miniGameScore || (isPassed ? 100 : 0),
        completedModules: record.completedModules || (isPassed ? [1, 2, 3] : []),
        evaluationSubmitted: record.evaluationSubmitted || isPassed,
        certificateId: record.certificateId || (isPassed ? `TCA-APM-2026-${cleanId}-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
        certificateDate: record.certificateDate || (isPassed ? '29 สิงหาคม 2569' : undefined),
        lastActiveStep: isPassed ? `สอบผ่านแล้ว (${record.postTestScore}/10 คะแนน)` : 'เพิ่งลงทะเบียนเข้าสู่ระบบ'
      }
    }
  };

  // 3. Save into admin roster
  const list = getStoredTrainees().filter(t => t.empId.trim().toUpperCase() !== cleanId);
  list.unshift(newTrainee);
  saveStoredTrainees(list);

  // 4. Sync to server
  fetch('/api/trainees/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: newTrainee,
      activityType: 'admin_added',
      detail: `แอดมินเพิ่มรายชื่อพนักงาน ${cleanFullName} (${cleanId})`
    })
  }).catch(() => {});

  // 5. Add audit log
  addStoredAuditLog({
    empId: cleanId,
    action: 'profile_updated',
    detail: `เพิ่มพนักงานใหม่เข้าสู่ระบบ: ${cleanFullName} (${dept})`
  });

  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('tct_trainee_added', { detail: { empId: cleanId } }));
  return newTrainee;
}

/**
 * Gets a user's persistent progress by employee ID from all available storage sources.
 * Guarantees that past test results, scores, and certificates are NEVER lost when code is updated.
 */
export function getUserPersistentProgress(empId: string): Partial<UserProfile> | null {
  if (!empId) return null;
  const cleanId = empId.trim().toUpperCase();

  let progress: Partial<UserProfile> = {};
  let found = false;

  // 1. Check dedicated per-user persistent key first (Authoritative)
  try {
    const userKeyData = localStorage.getItem(`${USER_STATE_PREFIX}${cleanId}`);
    if (userKeyData) {
      const parsed = JSON.parse(userKeyData);
      if (parsed && typeof parsed === 'object') {
        progress = { ...parsed };
        found = true;
      }
    }
  } catch (e) {
    console.debug('Error reading user state key', e);
  }

  // 2. Check admin trainees storage roster
  try {
    const adminData = localStorage.getItem(ADMIN_TRAINEES_STORAGE_KEY);
    if (adminData) {
      const list: TraineeRecord[] = JSON.parse(adminData);
      const match = list.find(t => t.empId.trim().toUpperCase() === cleanId);
      if (match) {
        found = true;
        if (match.preTestScore !== null && match.preTestScore !== undefined) {
          progress.preTestScore = progress.preTestScore ?? match.preTestScore;
        }
        if (match.postTestScore !== null && match.postTestScore !== undefined) {
          progress.postTestScore = progress.postTestScore ?? match.postTestScore;
        }
        if (match.completedModules && match.completedModules.length > 0) {
          progress.completedModules = Array.from(new Set([...(progress.completedModules || []), ...match.completedModules]));
        }
        if (match.miniGameScore) {
          progress.miniGameScore = Math.max(progress.miniGameScore || 0, match.miniGameScore);
        }
        if (match.postTestAttempts) {
          progress.postTestAttempts = Math.max(progress.postTestAttempts || 0, match.postTestAttempts);
        }
        if (match.certificateId) {
          progress.certificateId = progress.certificateId || match.certificateId;
        }
        if (match.certificateDate) {
          progress.certificateDate = progress.certificateDate || match.certificateDate;
        }
        if (match.evaluationSubmitted) {
          progress.evaluationSubmitted = true;
        }
        if (match.selectedCourseId) {
          progress.selectedCourseId = progress.selectedCourseId || match.selectedCourseId;
        }
        if (match.coursesProgress) {
          progress.coursesProgress = { ...(match.coursesProgress || {}), ...(progress.coursesProgress || {}) };
        }
        if (match.lastActiveView) {
          progress.lastActiveView = progress.lastActiveView || match.lastActiveView;
        }
        if (match.lastActiveStep) {
          progress.lastActiveStep = progress.lastActiveStep || match.lastActiveStep;
        }
        if (match.lastActiveModuleId) {
          progress.lastActiveModuleId = progress.lastActiveModuleId || match.lastActiveModuleId;
        }
      }
    }
  } catch (e) {
    console.debug('Error reading admin roster for user', e);
  }

  // 3. Check active session storage if matching
  try {
    const sessionData = localStorage.getItem('tct_qsrm_learning_state_v1');
    if (sessionData) {
      const activeUser: UserProfile = JSON.parse(sessionData);
      if (activeUser.empId && activeUser.empId.trim().toUpperCase() === cleanId) {
        found = true;
        progress = { ...activeUser, ...progress };
      }
    }
  } catch (e) {
    console.debug('Error reading legacy storage for user', e);
  }

  return found ? progress : null;
}

/**
 * Saves a user's persistent progress across multiple storage layers so tests are permanently retained.
 */
export function saveUserPersistentProgress(user: UserProfile) {
  if (!user || !user.empId) return;
  const cleanId = user.empId.trim().toUpperCase();

  try {
    // 1. Save to dedicated per-user persistent key
    localStorage.setItem(`${USER_STATE_PREFIX}${cleanId}`, JSON.stringify(user));

    // 2. Also keep ADMIN_TRAINEES_STORAGE_KEY in sync so admin and reports immediately reflect the latest exam results and attempts
    const saved = localStorage.getItem(ADMIN_TRAINEES_STORAGE_KEY);
    const list: TraineeRecord[] = saved ? JSON.parse(saved) : [...INITIAL_TRAINEES];
    const idx = list.findIndex(t => t.empId.trim().toUpperCase() === cleanId);

    const isPassed = (user.postTestScore !== null && user.postTestScore !== undefined && user.postTestScore >= 8);
    const hasStarted = (user.preTestScore !== null || (user.completedModules && user.completedModules.length > 0));

    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        preTestScore: user.preTestScore,
        postTestScore: user.postTestScore,
        postTestAttempts: user.postTestAttempts,
        miniGameScore: user.miniGameScore,
        completedModules: user.completedModules,
        evaluationSubmitted: user.evaluationSubmitted,
        certificateId: user.certificateId || list[idx].certificateId,
        certificateDate: user.certificateDate || list[idx].certificateDate,
        selectedCourseId: user.selectedCourseId || list[idx].selectedCourseId,
        coursesProgress: {
          ...(list[idx].coursesProgress || {}),
          ...(user.coursesProgress || {})
        },
        lastActiveStep: user.lastActiveStep,
        lastActiveView: user.lastActiveView,
        status: isPassed ? 'passed' : (hasStarted ? 'in_progress' : list[idx].status)
      };
      localStorage.setItem(ADMIN_TRAINEES_STORAGE_KEY, JSON.stringify(list));
    }

    // 3. Save directly to Firebase Firestore for real-time synchronization
    saveUserProgressToFirestore(cleanId, user).catch(err => {
      console.debug('Firestore saveUserProgressToFirestore error:', err);
    });

    const activeCourseId = user.selectedCourseId || 'applied-psychology';
    updateRosterTrainee(activeCourseId, cleanId, {
      preTestScore: user.preTestScore,
      postTestScore: user.postTestScore,
      miniGameScore: user.miniGameScore,
      completedModules: user.completedModules,
      certificateId: user.certificateId,
      status: isPassed ? 'passed' : (hasStarted ? 'in_progress' : 'enrolled')
    }).catch(() => {});
  } catch (e) {
    console.debug('Failed to save user persistent progress', e);
  }
}

export function getStoredTrainees(currentUser?: UserProfile | null): TraineeRecord[] {
  let list: TraineeRecord[] = [];
  const deletedIds = new Set(getDeletedTraineeIds().map(id => id.toUpperCase()));

  try {
    const saved = localStorage.getItem(ADMIN_TRAINEES_STORAGE_KEY);
    if (saved) {
      list = JSON.parse(saved);
    } else {
      list = [...INITIAL_TRAINEES];
    }
  } catch (e) {
    console.debug('Failed to load admin trainees', e);
    list = [...INITIAL_TRAINEES];
  }

  // Filter out any explicitly deleted trainees
  list = list.filter(t => !deletedIds.has(t.empId.trim().toUpperCase()));

  // Filter out any simulated mock unstarted trainees from legacy 230 list
  const authenticIds = new Set(APPLIED_PSYCHOLOGY_INITIAL_TRAINEES.map(t => t.empId.trim().toUpperCase()));
  list = list.filter(t => {
    const cleanId = t.empId.trim().toUpperCase();
    if (authenticIds.has(cleanId)) return true;
    const hasActivity = (t.preTestScore !== null && t.preTestScore !== undefined) ||
      (t.postTestScore !== null && t.postTestScore !== undefined) ||
      (Array.isArray(t.completedModules) && t.completedModules.length > 0) ||
      Boolean(t.certificateId) ||
      t.status === 'passed' ||
      t.status === 'in_progress' ||
      t.id.startsWith('reg-') ||
      t.id.startsWith('custom-') ||
      t.id.startsWith('enrolled-') ||
      t.id.startsWith('official-') ||
      (Array.isArray(t.enrolledCourses) && t.enrolledCourses.length > 0) ||
      Boolean(t.coursesProgress && Object.keys(t.coursesProgress).length > 0);
    return hasActivity;
  });

  // Merge or update with current active user session if exists and not deleted
  if (currentUser && currentUser.empId && !deletedIds.has(currentUser.empId.trim().toUpperCase())) {
    const cleanId = currentUser.empId.trim().toUpperCase();
    const isPassed = currentUser.postTestScore !== null && currentUser.postTestScore !== undefined && currentUser.postTestScore >= 8;
    const isStarted = (currentUser.preTestScore !== null && currentUser.preTestScore !== undefined) || (currentUser.completedModules && currentUser.completedModules.length > 0);
    
    const userRecord: TraineeRecord = {
      id: `current-${cleanId}`,
      empId: cleanId,
      fullName: currentUser.fullName || 'ผู้เรียนปัจจุบัน',
      department: currentUser.department || 'MN',
      position: currentUser.position || 'พนักงานฝ่ายซ่อมบำรุง',
      enrolledAt: currentUser.enrolledAt || new Date().toISOString().split('T')[0],
      completedAt: isPassed ? (currentUser.certificateDate || new Date().toLocaleDateString('th-TH')) : undefined,
      status: isPassed ? 'passed' : isStarted ? 'in_progress' : 'not_started',
      preTestScore: currentUser.preTestScore ?? null,
      postTestScore: currentUser.postTestScore ?? null,
      postTestAttempts: currentUser.postTestAttempts || 0,
      miniGameScore: currentUser.miniGameScore || 0,
      completedModules: currentUser.completedModules || [],
      evaluationSubmitted: currentUser.evaluationSubmitted || false,
      satisfactionScore: currentUser.evaluationAnswers?.overallSatisfaction || (isPassed ? 5 : undefined),
      certificateId: currentUser.certificateId,
      certificateDate: currentUser.certificateDate,
      selectedCourseId: currentUser.selectedCourseId,
      coursesProgress: currentUser.coursesProgress
    };

    const existingIndex = list.findIndex(
      (t) => t.empId.trim().toUpperCase() === cleanId
    );

    if (existingIndex >= 0) {
      list[existingIndex] = { 
        ...list[existingIndex], 
        ...userRecord,
        coursesProgress: { ...(list[existingIndex].coursesProgress || {}), ...(currentUser.coursesProgress || {}) }
      };
    } else {
      list.unshift(userRecord);
    }
  }

  return list;
}

export function saveStoredTrainees(trainees: TraineeRecord[]) {
  try {
    const deletedIds = new Set(getDeletedTraineeIds().map(id => id.toUpperCase()));
    const filtered = (trainees || []).filter(t => !deletedIds.has(t.empId.trim().toUpperCase()));
    localStorage.setItem(ADMIN_TRAINEES_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.debug('Failed to save admin trainees', e);
  }
}

export function clearAllStoredTrainees() {
  try {
    localStorage.removeItem(ADMIN_TRAINEES_STORAGE_KEY);
  } catch (e) {
    console.debug('Failed to clear admin trainees', e);
  }
}

export function purgeSimulatedMockTrainees(): number {
  try {
    const raw = localStorage.getItem(ADMIN_TRAINEES_STORAGE_KEY);
    if (!raw) return 0;
    const list: TraineeRecord[] = JSON.parse(raw);
    const authenticIds = new Set(APPLIED_PSYCHOLOGY_INITIAL_TRAINEES.map(t => t.empId.trim().toUpperCase()));
    
    const cleaned = list.filter(t => {
      const cleanId = t.empId.trim().toUpperCase();
      if (authenticIds.has(cleanId)) return true;
      const hasActivity = (t.preTestScore !== null && t.preTestScore !== undefined) ||
        (t.postTestScore !== null && t.postTestScore !== undefined) ||
        (Array.isArray(t.completedModules) && t.completedModules.length > 0) ||
        Boolean(t.certificateId) ||
        t.status === 'passed' ||
        t.status === 'in_progress' ||
        t.id.startsWith('reg-') ||
        t.id.startsWith('custom-');
      return hasActivity;
    });

    const purged = list.length - cleaned.length;
    localStorage.setItem(ADMIN_TRAINEES_STORAGE_KEY, JSON.stringify(cleaned));
    return purged;
  } catch (e) {
    return 0;
  }
}

// -------------------------------------------------------------
// Continuous Improvement & CAPA (Corrective and Preventive Action)
// -------------------------------------------------------------
export const INITIAL_CAPA_ITEMS: CapaItem[] = [
  {
    id: 'capa-001',
    code: 'CAPA-2026-001',
    title: 'เสริมเนื้อหาการคำนวณและประเมิน Risk Matrix 5x5 ในกระบวนการผลิต',
    category: 'Curriculum',
    problemStatement: 'พนักงานจากแผนก P และ MN มีอัตราตอบผิดในข้อสอบเกี่ยวกับ Hierarchy of Controls และ Risk Score สูงกว่าค่าเฉลี่ย 18%',
    rootCause: 'ตัวอย่างในบทเรียนเดิมเป็นตัวอย่างทางทฤษฎีทั่วไป ยังไม่เชื่อมโยงกับจุดตัดชิ้นงานจริงในสายการผลิต',
    correctiveAction: 'ปรับปรุงบทเรียนโมดูล 2 เพิ่มกรณีศึกษาหน้างานตัดเส้นใยจริง และจัดทำ One Point Lesson (OPL) เสริมที่หน้าไลน์',
    preventiveAction: 'เพิ่มหัวข้อประเมินความเสี่ยงหน้างานในการประชุม Toolbox Talk ประจำกะเช้าทุกวัน',
    responsiblePerson: 'นายกิตติคุณ สถิตย์ (วิศวกรความปลอดภัย & QA Specialist)',
    department: 'QA & Safety',
    targetDate: '2026-09-15',
    status: 'in_progress',
    effectivenessResult: 'เตรียมวัดผลในข้อสอบรุ่นถัดไป (กำหนดเป้าหมายคะแนนเฉลี่ยเพิ่มขึ้น > 85%)',
    createdAt: '2026-08-20',
    updatedAt: '2026-08-22'
  },
  {
    id: 'capa-002',
    code: 'CAPA-2026-002',
    title: 'ทบทวนขั้นตอน Lockout / Tagout (LOTO) และซักซ้อมเหตุฉุกเฉินก๊าซรั่ว',
    category: 'Safety',
    problemStatement: 'ข้อสอบโมดูล 4 เรื่องขั้นตอนการตัดแยกลังพลังงาน พนักงานจำสับสนระหว่าง Isolation และ Lockout',
    rootCause: 'ยังไม่มีป้ายเตือนและกล่องกุญแจ LOTO ประจำเครื่องจักรในบางพื้นที่บำรุงรักษา',
    correctiveAction: 'จัดทำป้าย Standard Operating Procedure (SOP) แผ่นพับ 3 ภาษา และติดกุญแจ Master Lock ประจำตู้ไฟ',
    preventiveAction: 'ซักซ้อม Walk-through LOTO ในพื้นที่จริงร่วมกับแผนก Maintenance ทุก 3 เดือน',
    responsiblePerson: 'นางสาวนริศรา มีสุข (หัวหน้างานฝ่ายความปลอดภัยอาชีวอนามัย)',
    department: 'Safety & EHS',
    targetDate: '2026-09-30',
    status: 'open',
    createdAt: '2026-08-21',
    updatedAt: '2026-08-21'
  }
];

export function getStoredCapaItems(): CapaItem[] {
  try {
    const saved = localStorage.getItem(ADMIN_CAPA_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.debug('Failed to load capa items', e);
  }
  return [...INITIAL_CAPA_ITEMS];
}

export function saveStoredCapaItems(items: CapaItem[]) {
  try {
    localStorage.setItem(ADMIN_CAPA_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.debug('Failed to save capa items', e);
  }
}

// -------------------------------------------------------------
// System Audit Logs & Activity Tracker
// -------------------------------------------------------------
export function getStoredAuditLogs(): SystemAuditLog[] {
  try {
    const saved = localStorage.getItem(ADMIN_AUDIT_LOGS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.debug('Failed to load audit logs', e);
  }
  return [];
}

export function addStoredAuditLog(log: Omit<SystemAuditLog, 'id' | 'timestamp'>) {
  try {
    const current = getStoredAuditLogs();
    const newEntry: SystemAuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toLocaleString('th-TH')
    };
    const updated = [newEntry, ...current.slice(0, 199)]; // Keep latest 200 logs
    localStorage.setItem(ADMIN_AUDIT_LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.debug('Failed to add audit log', e);
  }
}

export function clearStoredAuditLogs() {
  try {
    localStorage.removeItem(ADMIN_AUDIT_LOGS_STORAGE_KEY);
  } catch (e) {
    console.debug('Failed to clear audit logs', e);
  }
}

// -------------------------------------------------------------
// Official Registered Supervisors Roster Function
// -------------------------------------------------------------
export function getRealSupervisorsRoster(): TraineeRecord[] {
  return [...INITIAL_TRAINEES];
}

/**
 * Seeds or forces all official employees across all courses to have perfect scores (10/10)
 * and full completed progress, certificates, and attempts history.
 */
export function seedAllEmployeesWithPerfectScores(): TraineeRecord[] {
  const seeded = [...INITIAL_TRAINEES];
  saveStoredTrainees(seeded);

  // Also seed dedicated per-user storage records
  try {
    seeded.forEach(t => {
      const userProfile: UserProfile = {
        empId: t.empId,
        fullName: t.fullName,
        department: t.department,
        position: t.position,
        enrolledAt: t.enrolledAt,
        preTestScore: 10,
        preTestTotal: 10,
        postTestScore: 10,
        postTestTotal: 10,
        postTestAttempts: 1,
        miniGameScore: 100,
        completedModules: [1, 2, 3, 4],
        evaluationSubmitted: true,
        evaluationAnswers: {
          contentQuality: 5,
          understanding: 5,
          platformEase: 5,
          practicalUsage: 5,
          overallSatisfaction: 5,
          feedback: 'เนื้อหาหลักสูตรยอดเยี่ยม ได้รับความรู้เต็มเปี่ยม 10/10'
        },
        certificateId: t.certificateId,
        certificateDate: t.certificateDate,
        selectedCourseId: 'risk-management',
        coursesProgress: t.coursesProgress,
        lastActiveStep: 'ผ่านเกณฑ์ 100% (10/10)'
      };
      localStorage.setItem(`${USER_STATE_PREFIX}${t.empId}`, JSON.stringify(userProfile));
    });
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.debug('Error seeding per-user profiles', e);
  }

  return seeded;
}

/**
 * Resets all employees to the official roster for both courses:
 * - Course 1 (Risk Management): 13 Supervisors with pilot 97016 completed and passed (Pre 6, Post 10)
 * - Course 2 (Advanced Preventive Maintenance): 13 MN Employees completed and passed (Pre 6, Post 10)
 * - Restores complete course progress, certificates, and clears any deleted records.
 */
export function resetAllToOriginalRealBaseline(): TraineeRecord[] {
  try {
    // 1. Clear deleted employees set
    localStorage.removeItem(DELETED_TRAINEES_STORAGE_KEY);

    // 2. Reset admin roster to match INITIAL_TRAINEES
    localStorage.setItem(ADMIN_TRAINEES_STORAGE_KEY, JSON.stringify(INITIAL_TRAINEES));

    // 3. Set persistent user states for all employees
    INITIAL_TRAINEES.forEach((trainee) => {
      const cleanId = trainee.empId.trim().toUpperCase();
      const userProfile: UserProfile = {
        empId: trainee.empId,
        fullName: trainee.fullName,
        department: trainee.department,
        position: trainee.position,
        enrolledAt: trainee.enrolledAt,
        preTestScore: trainee.preTestScore,
        preTestTotal: 10,
        postTestScore: trainee.postTestScore,
        postTestTotal: 10,
        postTestAttempts: trainee.postTestAttempts || (trainee.postTestScore !== null ? 1 : 0),
        miniGameScore: trainee.miniGameScore || 0,
        completedModules: trainee.completedModules || [],
        evaluationSubmitted: trainee.evaluationSubmitted || false,
        evaluationAnswers: trainee.status === 'passed' ? {
          contentQuality: 5,
          understanding: 5,
          platformEase: 5,
          practicalUsage: 5,
          overallSatisfaction: 5,
          feedback: trainee.selectedCourseId === 'risk-management' 
            ? 'เนื้อหาหลักสูตรการบริหารความเสี่ยงและภาวะวิกฤตดีเยี่ยม ได้รับความรู้เต็มเปี่ยม 10/10'
            : 'เนื้อหาหลักสูตรการบำรุงรักษาเชิงป้องกันขั้นสูงและ RCM Matrix ดีมาก สามารถนำไปปฏิบัติหน้างานได้ทันที'
        } : undefined,
        certificateId: trainee.certificateId,
        certificateDate: trainee.certificateDate,
        selectedCourseId: trainee.selectedCourseId,
        coursesProgress: trainee.coursesProgress,
        lastActiveStep: trainee.currentStep || 'พร้อมเข้าอบรม'
      };
      localStorage.setItem(`${USER_STATE_PREFIX}${cleanId}`, JSON.stringify(userProfile));
    });

    // 4. Request server to reset to real baseline
    fetch('/api/reset-real-baseline', { method: 'POST' }).catch(() => {});

    // 5. Mark baseline version
    localStorage.setItem('tct_baseline_version', 'real_baseline_v6_clean');

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('tct_trainee_reset', { detail: { all: true } }));
  } catch (e) {
    console.debug('Error resetting to real baseline', e);
  }

  return [...INITIAL_TRAINEES];
}

// Auto-run baseline reset disabled to guarantee test results and active employees are never wiped
// Real employee records are preserved across all courses

export interface AdminScoreUpdatePayload {
  empId: string;
  fullName?: string;
  courseId?: string; // 'risk-management' | 'advanced-preventive-maintenance'
  preTestScore: number | null;
  postTestScore: number | null;
  miniGameScore?: number;
  completedModules?: number[];
  postTestAttempts?: number;
  evaluationSubmitted?: boolean;
  certificateId?: string;
  certificateDate?: string;
  adminNote?: string;
}

/**
 * Allows Admin to directly input or update scores for any trainee in any course.
 * Automatically handles status (passed if >= 8), certificate generation, course progress,
 * per-user storage, server syncing, and audit logs.
 */
export function updateTraineeScoresByAdmin(payload: AdminScoreUpdatePayload): TraineeRecord | null {
  const {
    empId,
    courseId = 'applied-psychology',
    preTestScore,
    postTestScore,
    miniGameScore = 100,
    completedModules = [1, 2, 3],
    postTestAttempts = 1,
    certificateId,
    certificateDate,
    adminNote
  } = payload;

  const cleanId = empId.trim().toUpperCase();
  const passingThreshold = courseId === 'personality-psychology' ? 15 : (courseId === 'kyt-shisa-kanko' ? 16 : 8);
  const isPassed = postTestScore !== null && postTestScore >= passingThreshold;

  const prefixLookup: Record<string, string> = {
    'applied-psychology': 'PSY',
    'kyt-shisa-kanko': 'KYT',
    'personality-psychology': 'DISC',
    'ai-for-tct': 'AI',
    'conflict-management': 'CFM',
    'advanced-preventive-maintenance': 'APM',
    'risk-management': 'QSRM'
  };
  const prefix = prefixLookup[courseId] || 'TCT';
  const generatedCertId = certificateId || (isPassed ? `TCT-${prefix}-2026-${cleanId}-${Math.floor(1000 + Math.random() * 9000)}` : undefined);
  const defaultDate = courseId === 'applied-psychology' ? '13 ตุลาคม 2569' : '23 สิงหาคม 2569';
  const finalCertDate = certificateDate || (isPassed ? defaultDate : undefined);

  let updatedRecord: TraineeRecord | null = null;

  // 1. Update in admin stored trainees
  try {
    const list = getStoredTrainees();
    const idx = list.findIndex(t => t.empId.trim().toUpperCase() === cleanId);
    
    if (idx >= 0) {
      const existing = list[idx];
      const coursesProgress = { ...(existing.coursesProgress || {}) };
      coursesProgress[courseId] = {
        ...(coursesProgress[courseId] || {}),
        preTestScore,
        postTestScore,
        postTestAttempts: postTestAttempts || 1,
        miniGameScore,
        completedModules: completedModules || [1, 2, 3],
        evaluationSubmitted: isPassed,
        certificateId: isPassed ? generatedCertId : undefined,
        certificateDate: isPassed ? finalCertDate : undefined,
        lastActiveStep: isPassed ? `สอบผ่านแล้ว (${postTestScore} คะแนน)` : `คะแนน (${postTestScore ?? 0})`
      };

      const attemptsHistory = [...(existing.attemptsHistory || [])];
      if (preTestScore !== null) {
        attemptsHistory.push({
          attemptNumber: 1,
          type: 'pretest',
          score: preTestScore,
          passed: preTestScore >= passingThreshold,
          timestamp: new Date().toLocaleString('th-TH'),
          detail: `แอดมินกรอกคะแนน Pre-Test (${preTestScore} คะแนน)${adminNote ? ` [${adminNote}]` : ''}`
        });
      }
      if (postTestScore !== null) {
        attemptsHistory.push({
          attemptNumber: postTestAttempts || 1,
          type: 'posttest',
          score: postTestScore,
          passed: isPassed,
          timestamp: new Date().toLocaleString('th-TH'),
          detail: `แอดมินกรอกคะแนน Post-Test (${postTestScore} คะแนน - ${isPassed ? 'ผ่านเกณฑ์' : 'ไม่ผ่าน'})${adminNote ? ` [${adminNote}]` : ''}`
        });
      }

      const newStatus = isPassed ? 'passed' : (postTestScore !== null || preTestScore !== null ? 'in_progress' : 'not_started');

      updatedRecord = {
        ...existing,
        preTestScore,
        postTestScore,
        postTestAttempts: postTestAttempts || existing.postTestAttempts || 1,
        miniGameScore,
        completedModules: completedModules || existing.completedModules,
        status: newStatus,
        evaluationSubmitted: isPassed,
        certificateId: isPassed ? generatedCertId : existing.certificateId,
        certificateDate: isPassed ? finalCertDate : existing.certificateDate,
        completedAt: isPassed ? (existing.completedAt || new Date().toISOString().split('T')[0]) : undefined,
        currentStep: isPassed ? `ผ่านเกณฑ์ (${postTestScore}) • วุฒิบัตรสมบูรณ์` : `คะแนนสอบ (${postTestScore ?? 0})`,
        coursesProgress,
        attemptsHistory,
        lastActivityAt: new Date().toISOString()
      };

      list[idx] = updatedRecord;
      saveStoredTrainees(list);
    } else {
      // Trainee exists in master roster but not yet in local stored trainees list
      const emp = findEmployeeByEmpId(cleanId);
      const fullName = payload.fullName || emp?.fullName || cleanId;
      const dept = emp?.department || 'P';
      const pos = emp?.position || 'WORKER';

      const coursesProgress: Record<string, any> = {
        [courseId]: {
          preTestScore,
          postTestScore,
          postTestAttempts: postTestAttempts || 1,
          miniGameScore,
          completedModules: completedModules || [1, 2, 3],
          evaluationSubmitted: isPassed,
          certificateId: isPassed ? generatedCertId : undefined,
          certificateDate: isPassed ? finalCertDate : undefined,
          lastActiveStep: isPassed ? `สอบผ่านแล้ว (${postTestScore} คะแนน)` : `คะแนน (${postTestScore ?? 0})`
        }
      };

      const attemptsHistory = [];
      if (preTestScore !== null) {
        attemptsHistory.push({
          attemptNumber: 1,
          type: 'pretest' as const,
          score: preTestScore,
          passed: preTestScore >= passingThreshold,
          timestamp: new Date().toLocaleString('th-TH'),
          detail: `แอดมินกรอกคะแนน Pre-Test (${preTestScore} คะแนน)${adminNote ? ` [${adminNote}]` : ''}`
        });
      }
      if (postTestScore !== null) {
        attemptsHistory.push({
          attemptNumber: postTestAttempts || 1,
          type: 'posttest' as const,
          score: postTestScore,
          passed: isPassed,
          timestamp: new Date().toLocaleString('th-TH'),
          detail: `แอดมินกรอกคะแนน Post-Test (${postTestScore} คะแนน - ${isPassed ? 'ผ่านเกณฑ์' : 'ไม่ผ่าน'})${adminNote ? ` [${adminNote}]` : ''}`
        });
      }

      updatedRecord = {
        id: `tr-${cleanId}-${Date.now()}`,
        empId: cleanId,
        fullName,
        prefix: emp?.prefix || 'นาย',
        department: dept,
        position: pos,
        enrolledAt: new Date().toISOString().split('T')[0],
        completedAt: isPassed ? (finalCertDate || new Date().toISOString().split('T')[0]) : undefined,
        status: isPassed ? 'passed' : (postTestScore !== null || preTestScore !== null ? 'in_progress' : 'not_started'),
        preTestScore,
        postTestScore,
        postTestAttempts: postTestAttempts || 1,
        miniGameScore,
        completedModules: completedModules || [1, 2, 3],
        evaluationSubmitted: isPassed,
        certificateId: isPassed ? generatedCertId : undefined,
        certificateDate: isPassed ? finalCertDate : undefined,
        selectedCourseId: courseId,
        enrolledCourses: [courseId],
        currentStep: isPassed ? `ผ่านเกณฑ์ (${postTestScore}) • วุฒิบัตรสมบูรณ์` : `คะแนนสอบ (${postTestScore ?? 0})`,
        coursesProgress,
        attemptsHistory,
        lastActivityAt: new Date().toISOString()
      };

      list.unshift(updatedRecord);
      saveStoredTrainees(list);
    }
  } catch (e) {
    console.debug('Error updating admin trainee scores', e);
  }

  // 2. Update user state prefix
  try {
    const rawUser = localStorage.getItem(`${USER_STATE_PREFIX}${cleanId}`);
    if (rawUser) {
      const userObj: UserProfile = JSON.parse(rawUser);
      const isAPM = courseId === 'advanced-preventive-maintenance';
      const coursesProgress = { ...(userObj.coursesProgress || {}) };
      coursesProgress[courseId] = {
        ...(coursesProgress[courseId] || {}),
        preTestScore,
        postTestScore,
        postTestAttempts: postTestAttempts || 1,
        miniGameScore,
        completedModules: completedModules || (isAPM ? [1, 2, 3] : [1, 2, 3, 4]),
        evaluationSubmitted: isPassed,
        certificateId: isPassed ? generatedCertId : undefined,
        certificateDate: isPassed ? finalCertDate : undefined,
        lastActiveStep: isPassed ? `สอบผ่านแล้ว (${postTestScore}/10 คะแนน)` : `คะแนน (${postTestScore ?? 0}/10)`
      };

      const updatedUser: UserProfile = {
        ...userObj,
        preTestScore,
        postTestScore,
        postTestAttempts: postTestAttempts || userObj.postTestAttempts || 1,
        miniGameScore,
        completedModules: completedModules || userObj.completedModules,
        evaluationSubmitted: isPassed,
        certificateId: isPassed ? generatedCertId : userObj.certificateId,
        certificateDate: isPassed ? finalCertDate : userObj.certificateDate,
        coursesProgress,
        lastActiveStep: isPassed ? `ผ่านเกณฑ์ (${postTestScore}/10)` : `คะแนนสอบ (${postTestScore ?? 0}/10)`
      };
      localStorage.setItem(`${USER_STATE_PREFIX}${cleanId}`, JSON.stringify(updatedUser));
    }
  } catch (e) {
    console.debug('Error updating per-user score record', e);
  }

  // 3. Update active session storage if logged in as this user
  try {
    const sessionData = localStorage.getItem('tct_qsrm_learning_state_v1');
    if (sessionData) {
      const activeUser: UserProfile = JSON.parse(sessionData);
      if (activeUser.empId && activeUser.empId.trim().toUpperCase() === cleanId) {
        const updatedActiveUser: UserProfile = {
          ...activeUser,
          preTestScore,
          postTestScore,
          postTestAttempts: postTestAttempts || activeUser.postTestAttempts || 1,
          miniGameScore,
          completedModules: completedModules || activeUser.completedModules,
          evaluationSubmitted: isPassed,
          certificateId: isPassed ? generatedCertId : activeUser.certificateId,
          certificateDate: isPassed ? finalCertDate : activeUser.certificateDate,
          lastActiveStep: isPassed ? `ผ่านเกณฑ์ (${postTestScore}/10)` : `คะแนนสอบ (${postTestScore ?? 0}/10)`
        };
        localStorage.setItem('tct_qsrm_learning_state_v1', JSON.stringify(updatedActiveUser));
      }
    }
  } catch (e) {
    console.debug('Error updating active session score', e);
  }

  // 4. Record audit log
  try {
    addStoredAuditLog({
      empId: cleanId,
      action: 'profile_updated',
      detail: `แอดมินกรอก/แก้ไขคะแนน [${courseId}]: Pre-Test=${preTestScore ?? '-'}, Post-Test=${postTestScore ?? '-'}/10 (${isPassed ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'})${adminNote ? ` หมายเหตุ: ${adminNote}` : ''}`
    });
  } catch (e) {
    // Ignore audit log error
  }

  // 5. Sync to server backend
  try {
    fetch(`/api/trainees/${cleanId}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preTestScore,
        postTestScore,
        miniGameScore,
        completedModules,
        postTestAttempts,
        courseId,
        certificateId: generatedCertId,
        certificateDate: finalCertDate,
        adminNote
      })
    }).catch(() => {});
  } catch (e) {
    // Ignore fetch error
  }

  // 6. Broadcast storage and custom event
  try {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('tct_trainee_score_updated', { detail: { empId: cleanId, courseId } }));
  } catch (e) {
    // Ignore event error
  }

  return updatedRecord;
}

/**
 * Resets learning progress and test history for a specific employee locally across all browser stores
 */
export function resetTraineeLearningHistory(empId: string): void {
  if (!empId) return;
  const cleanId = empId.trim().toUpperCase();

  // 1. Explicitly reset dedicated per-user storage key with clean blank slate
  try {
    const employee = findEmployeeByEmpId(cleanId);
    const cleanUserRecord: Partial<UserProfile> = {
      empId: cleanId,
      fullName: employee?.fullName || cleanId,
      department: employee?.department || 'P',
      position: employee?.position || 'SUPERVISOR',
      enrolledAt: new Date().toISOString().split('T')[0],
      preTestScore: null,
      preTestTotal: 10,
      postTestScore: null,
      postTestTotal: 10,
      postTestAttempts: 0,
      miniGameScore: 0,
      completedModules: [],
      evaluationSubmitted: false,
      evaluationAnswers: undefined,
      certificateId: undefined,
      certificateDate: undefined,
      coursesProgress: {}
    };
    localStorage.setItem(`${USER_STATE_PREFIX}${cleanId}`, JSON.stringify(cleanUserRecord));
  } catch (e) {
    console.debug('Error clearing user state prefix', e);
  }

  // 2. Clear all video watch progress keys for this user
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith(`tct_video_completed_${cleanId}`) ||
        key.startsWith(`tct_video_progress_sec_${cleanId}`) ||
        key.startsWith(`tct_video_completed_${empId}`) ||
        key.startsWith(`tct_video_progress_sec_${empId}`)
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.debug('Error clearing video keys', e);
  }

  // 3. Clear from admin trainees list
  try {
    const list = getStoredTrainees();
    const idx = list.findIndex(t => t.empId.trim().toUpperCase() === cleanId);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        status: 'not_started',
        preTestScore: null,
        postTestScore: null,
        postTestAttempts: 0,
        miniGameScore: 0,
        completedModules: [],
        evaluationSubmitted: false,
        satisfactionScore: undefined,
        certificateId: undefined,
        certificateDate: undefined,
        currentStep: 'ยังไม่เริ่มเรียน (รีเซ็ตเพื่อเรียนใหม่)',
        attemptsHistory: []
      };
      saveStoredTrainees(list);
    }
  } catch (e) {
    console.debug('Error resetting trainee in admin store', e);
  }

  // 4. Update active session storage if current user is this employee
  try {
    const sessionData = localStorage.getItem('tct_qsrm_learning_state_v1');
    if (sessionData) {
      const activeUser: UserProfile = JSON.parse(sessionData);
      if (activeUser.empId && activeUser.empId.trim().toUpperCase() === cleanId) {
        const resetActiveUser: UserProfile = {
          ...activeUser,
          preTestScore: null,
          preTestTotal: 10,
          postTestScore: null,
          postTestTotal: 10,
          postTestAttempts: 0,
          miniGameScore: 0,
          completedModules: [],
          evaluationSubmitted: false,
          evaluationAnswers: undefined,
          certificateId: undefined,
          certificateDate: undefined,
          coursesProgress: {}
        };
        localStorage.setItem('tct_qsrm_learning_state_v1', JSON.stringify(resetActiveUser));
      }
    }
  } catch (e) {
    console.debug('Error resetting active session', e);
  }

  // 5. Notify all listeners and tabs
  try {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('tct_trainee_reset', { detail: { empId: cleanId } }));
  } catch (e) {
    // Ignore event error
  }
}

