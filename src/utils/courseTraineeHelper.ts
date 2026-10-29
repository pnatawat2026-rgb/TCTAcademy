import { TraineeRecord, UserProfile, CourseProgressRecord } from '../types';
import { getAllAvailableCourses, getCourseById, getCourseModules } from './courseManager';
import { getUserPersistentProgress, getStoredTrainees, saveStoredTrainees, getDeletedTraineeIds } from '../data/traineeData';
import { getMasterEmployeeRoster } from '../data/employeeDatabase';
import { APPLIED_PSYCHOLOGY_INITIAL_TRAINEES } from '../data/appliedPsychologyCourseData';

export interface CourseTraineeResolved {
  empId: string;
  fullName: string;
  department: string;
  position: string;
  enrolledAt: string;
  completedAt?: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  preTestScore: number | null;
  postTestScore: number | null;
  preScoreText: string; // e.g. "10/10", "9/10", "6/10" or "-"
  postScoreText: string; // e.g. "10/10", "9/10", "8/10" or "-"
  totalScore20: number | null; // e.g. 20, 19, 16
  totalScore20Text: string; // e.g. "20/20", "19/20", "16/20" or "-"
  scaledPostScoreText: string; // e.g. "20/20" or "10/10"
  completedModulesCount: number;
  totalModulesCount: number;
  isCompleted: boolean;
  status: 'passed' | 'in_progress' | 'not_started';
  statusTextThai: string; // e.g. "ผ่านเกณฑ์แล้ว", "กำลังเรียน", "ยังไม่เริ่ม"
  currentStageTextThai: string; // e.g. "จบหลักสูตร & ได้รับวุฒิบัตร", "กำลังเรียนบทที่ 2", "ทำ Pre-Test"
  certificateId?: string;
  certificateDate?: string;
  satisfactionScore?: number;
}

export const COURSE_ENROLLMENTS_STORAGE_KEY = 'tct_course_enrollments_v3';

/**
 * Read all explicit course enrollments mapping: { [courseId]: string[] }
 */
export function getAllCourseEnrollments(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(COURSE_ENROLLMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Get list of employee IDs enrolled in a course
 */
export function getCourseEnrolledEmpIds(courseId: string): string[] {
  const all = getAllCourseEnrollments();
  return (all[courseId] || []).map(id => id.trim().toUpperCase());
}

/**
 * Checks whether an employee has actually participated or has real learning progress in a course.
 * STRICT RULE (ตามคำสั่งผู้ใช้):
 * ในแต่ละหลักสูตรไม่ต้องเอาชื่อคนที่ยังไม่ทำมาใส่ ให้คอยรับข้อมูลจากคนที่ทำแล้วเท่านั้น และบันทึกไว้ ใครเข้ามาทำจริง
 */
export function isEmployeeEnrolledInCourse(
  empId: string,
  courseId: string,
  trainee?: TraineeRecord | UserProfile
): boolean {
  if (!empId || !courseId) return false;
  const cleanId = empId.trim().toUpperCase();

  // 0. Explicit course enrollments list
  const explicitEnrolledIds = getCourseEnrolledEmpIds(courseId);
  if (explicitEnrolledIds.includes(cleanId)) {
    return true;
  }

  // 0.1 Check trainee.enrolledCourses array
  if (trainee && (trainee as any).enrolledCourses && Array.isArray((trainee as any).enrolledCourses)) {
    if ((trainee as any).enrolledCourses.includes(courseId)) {
      return true;
    }
  }

  // 0.2 Pre-registered official cohort for applied-psychology
  if (courseId === 'applied-psychology') {
    if (APPLIED_PSYCHOLOGY_INITIAL_TRAINEES.some(t => t.empId.toUpperCase() === cleanId)) {
      return true;
    }
  }

  // 1. Check trainee object's coursesProgress dictionary
  if (trainee?.coursesProgress?.[courseId]) {
    return true;
  }

  // 2. Check persistent user progress
  const persistent = getUserPersistentProgress(cleanId);
  if (persistent?.coursesProgress?.[courseId]) {
    return true;
  }

  // 3. Direct localStorage check for user state
  try {
    const userRaw = localStorage.getItem(`tct_user_state_${cleanId}`);
    if (userRaw) {
      const u = JSON.parse(userRaw);
      const ucp = u?.coursesProgress?.[courseId];
      if (
        ucp &&
        ((ucp.preTestScore !== null && ucp.preTestScore !== undefined) ||
          (ucp.completedModules && ucp.completedModules.length > 0) ||
          (ucp.postTestScore !== null && ucp.postTestScore !== undefined) ||
          ucp.evaluationSubmitted ||
          Boolean(ucp.certificateId))
      ) {
        return true;
      }
      if (
        u?.selectedCourseId === courseId &&
        ((u.preTestScore !== null && u.preTestScore !== undefined) ||
          (u.completedModules && u.completedModules.length > 0) ||
          (u.postTestScore !== null && u.postTestScore !== undefined))
      ) {
        return true;
      }
    }
  } catch (e) {}

  // 4. If trainee's active selectedCourseId is this course and they have started/passed
  if (trainee?.selectedCourseId === courseId) {
    if (
      (trainee.preTestScore !== null && trainee.preTestScore !== undefined) ||
      (trainee.completedModules && trainee.completedModules.length > 0) ||
      (trainee.postTestScore !== null && trainee.postTestScore !== undefined) ||
      (trainee as any).status === 'passed' ||
      (trainee as any).status === 'in_progress'
    ) {
      return true;
    }
  }

  // 5. If persistent user state matches this course
  if (persistent?.selectedCourseId === courseId) {
    if (
      (persistent.preTestScore !== null && persistent.preTestScore !== undefined) ||
      (persistent.completedModules && persistent.completedModules.length > 0) ||
      (persistent.postTestScore !== null && persistent.postTestScore !== undefined) ||
      persistent.evaluationSubmitted
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Convenience helper to pull all 20 official cohort trainees into Applied Psychology in one click
 */
export function pullOfficialAppliedPsychologyTrainees(): { success: boolean; count: number } {
  const ids = APPLIED_PSYCHOLOGY_INITIAL_TRAINEES.map(t => t.empId.trim().toUpperCase());
  const res = enrollEmployeesInCourse('applied-psychology', ids);

  // Deep sync all initial trainees with authentic scores to server and local storage
  try {
    const stored = getStoredTrainees();
    const map = new Map<string, TraineeRecord>();
    stored.forEach(t => map.set(t.empId.trim().toUpperCase(), t));

    APPLIED_PSYCHOLOGY_INITIAL_TRAINEES.forEach(initT => {
      const cleanId = initT.empId.trim().toUpperCase();
      const existing = map.get(cleanId);
      const merged: TraineeRecord = existing ? {
        ...existing,
        ...initT,
        selectedCourseId: 'applied-psychology',
        enrolledCourses: Array.from(new Set([...(existing.enrolledCourses || []), 'applied-psychology'])),
        coursesProgress: {
          ...(existing.coursesProgress || {}),
          ...(initT.coursesProgress || {})
        }
      } : { ...initT };

      map.set(cleanId, merged);

      // Async sync to server
      fetch('/api/trainees/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: merged, detail: 'ดึงรายชื่อรุ่นที่ 1 จิตวิทยาประยุกต์' })
      }).catch(() => {});
    });

    saveStoredTrainees(Array.from(map.values()));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('tct_course_enrolled', { detail: { courseId: 'applied-psychology', empIds: ids } }));
  } catch (e) {
    console.debug('Error in pullOfficialAppliedPsychologyTrainees', e);
  }

  return { success: true, count: ids.length };
}

/**
 * Enrolls one or multiple employees into a specific course
 */
export function enrollEmployeesInCourse(
  courseId: string,
  empIds: string[]
): { success: boolean; addedCount: number } {
  if (!courseId || !empIds || empIds.length === 0) return { success: false, addedCount: 0 };
  const all = getAllCourseEnrollments();
  const current = new Set((all[courseId] || []).map(id => id.trim().toUpperCase()));
  let addedCount = 0;

  empIds.forEach(rawId => {
    const cleanId = rawId.trim().toUpperCase();
    if (cleanId && !current.has(cleanId)) {
      current.add(cleanId);
      addedCount++;
    }
  });

  all[courseId] = Array.from(current);
  try {
    localStorage.setItem(COURSE_ENROLLMENTS_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.debug('Failed to save course enrollments', e);
  }

  // Synchronize with stored trainees
  try {
    const stored = getStoredTrainees();
    const master = getMasterEmployeeRoster();
    let updated = false;

    empIds.forEach(rawId => {
      const cleanId = rawId.trim().toUpperCase();
      const existing = stored.find(t => t.empId.trim().toUpperCase() === cleanId);
      if (existing) {
        const enrolled = new Set(existing.enrolledCourses || []);
        enrolled.add(courseId);
        existing.enrolledCourses = Array.from(enrolled);
        if (!existing.coursesProgress) existing.coursesProgress = {};
        if (!existing.coursesProgress[courseId]) {
          existing.coursesProgress[courseId] = {
            preTestScore: null,
            postTestScore: null,
            postTestAttempts: 0,
            miniGameScore: 0,
            completedModules: [],
            evaluationSubmitted: false,
            lastActiveStep: 'ลงทะเบียนเข้าเรียนแล้ว (รอเริ่มเรียน)'
          };
        }
        updated = true;
      } else {
        const fromMaster = master.find(m => m.empId.trim().toUpperCase() === cleanId);
        if (fromMaster) {
          stored.push({
            id: `enrolled-${cleanId}-${Date.now()}`,
            empId: cleanId,
            fullName: fromMaster.fullName,
            department: fromMaster.department,
            position: fromMaster.position || 'พนักงานเข้าอบรม',
            enrolledAt: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: 'not_started',
            preTestScore: null,
            postTestScore: null,
            postTestAttempts: 0,
            miniGameScore: 0,
            completedModules: [],
            evaluationSubmitted: false,
            selectedCourseId: courseId,
            enrolledCourses: [courseId],
            coursesProgress: {
              [courseId]: {
                preTestScore: null,
                postTestScore: null,
                postTestAttempts: 0,
                miniGameScore: 0,
                completedModules: [],
                evaluationSubmitted: false,
                lastActiveStep: 'ลงทะเบียนเข้าเรียนแล้ว (รอเริ่มเรียน)'
              }
            }
          });
          updated = true;
        }
      }
    });

    if (updated) {
      saveStoredTrainees(stored);
      // Batch sync newly enrolled trainees to centralized backend server
      const enrolledEmployees = empIds
        .map(rawId => stored.find(t => t.empId.trim().toUpperCase() === rawId.trim().toUpperCase()))
        .filter(Boolean);

      fetch('/api/trainees/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          employees: enrolledEmployees
        })
      }).catch(() => {});
    }
  } catch (e) {
    console.debug('Error syncing enrolled trainees', e);
  }

  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('tct_course_enrolled', { detail: { courseId, empIds } }));
  return { success: true, addedCount };
}

/**
 * Removes an employee from a specific course enrollment
 */
export function unenrollEmployeeFromCourse(courseId: string, empId: string): boolean {
  if (!courseId || !empId) return false;
  const cleanId = empId.trim().toUpperCase();
  const all = getAllCourseEnrollments();
  if (all[courseId]) {
    all[courseId] = all[courseId].filter(id => id.trim().toUpperCase() !== cleanId);
    try {
      localStorage.setItem(COURSE_ENROLLMENTS_STORAGE_KEY, JSON.stringify(all));
    } catch (e) {}
  }

  try {
    const stored = getStoredTrainees();
    const existing = stored.find(t => t.empId.trim().toUpperCase() === cleanId);
    if (existing) {
      if (existing.enrolledCourses) {
        existing.enrolledCourses = existing.enrolledCourses.filter(c => c !== courseId);
      }
      if (existing.coursesProgress && existing.coursesProgress[courseId]) {
        delete existing.coursesProgress[courseId];
      }
      saveStoredTrainees(stored);
    }
  } catch (e) {}

  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('tct_course_unenrolled', { detail: { courseId, empId: cleanId } }));
  return true;
}

/**
 * Standard Course Metadata Dictionary with exact authentic titles
 */
export const COURSE_OFFICIAL_METADATA: Record<string, {
  title: string;
  code: string;
  batch: string;
  trainingDates: string;
  instructor: string;
  institute: string;
  totalModules: number;
  passingScorePercent: number;
}> = {
  'risk-management': {
    title: 'หลักสูตรการบริหารความเสี่ยงด้วยคุณภาพและความปลอดภัย (Quality & Safety Risk Management - QSRM)',
    code: 'TCT-QSRM-01',
    batch: 'รุ่นที่ 1 วันที่ 24-26 สิงหาคม เวลา 08.00-16.00 น.',
    trainingDates: 'วันที่ 24 - 26 สิงหาคม 2569 (08.00 - 16.00 น.)',
    instructor: 'นายณฐวัตร พงษ์สาริกิจ (หัวหน้าแผนกบุคคลและธุรการ) & ทีมวิทยากร TCT Academy',
    institute: 'ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development & Training Center',
    totalModules: 4,
    passingScorePercent: 80
  },
  'advanced-preventive-maintenance': {
    title: 'หลักสูตรการบำรุงรักษาเชิงป้องกันขั้นสูง (Condition-Based, Predictive & Reliability-Centered Maintenance - APM)',
    code: 'TCT-APM-02',
    batch: 'รุ่นที่ 1 วันที่ 27-29 สิงหาคม เวลา 08.00-16.00 น.',
    trainingDates: 'วันที่ 27 - 29 สิงหาคม 2569 (08.00 - 16.00 น.)',
    instructor: 'นายนพดล บำรุงเกียรติ & ทีมผู้เชี่ยวชาญ TCT Academy',
    institute: 'ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development & Training Center',
    totalModules: 3,
    passingScorePercent: 80
  },
  'conflict-management': {
    title: 'หลักสูตรการบริหารความขัดแย้งและการสื่อสารเชิงบวกเพื่อความร่วมมือในองค์กร (Conflict Management & Workplace Collaboration - CFM)',
    code: 'TCT-CFM-03',
    batch: 'รุ่นที่ 1 วันที่ 30-31 สิงหาคม เวลา 08.00-16.00 น.',
    trainingDates: 'วันที่ 30 - 31 สิงหาคม 2569 (08.00 - 16.00 น.)',
    instructor: 'นายณฐวัตร พงษ์สาริกิจ (หัวหน้าแผนกบุคคลและธุรการ) & ศูนย์ฝึกอบรม TCT Academy',
    institute: 'ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development & Training Center',
    totalModules: 4,
    passingScorePercent: 80
  },
  'ai-for-tct': {
    title: 'หลักสูตร AI for TCT — ปัญญาประดิษฐ์เพื่อการเพิ่มประสิทธิภาพและความปลอดภัยในการทำงาน (TCT-AI-101)',
    code: 'TCT-AI-101',
    batch: 'รุ่นที่ 1 สำหรับ Clerk & Leader พนักงาน 230 คน เวลา 08.00-16.00 น.',
    trainingDates: 'วันที่ 5 - 7 กันยายน 2569 (08.00 - 16.00 น.)',
    instructor: 'ทีมวิทยากร AI Transformation & TCT Academy',
    institute: 'ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development & Training Center',
    totalModules: 7,
    passingScorePercent: 75
  },
  'personality-psychology': {
    title: 'หลักสูตรจิตวิทยาบุคลิกภาพและการปรับตัวเพื่อการทำงานร่วมกันในองค์กร (Personality Psychology & Workplace Adaptation - TCT-A001)',
    code: 'TCT-A001',
    batch: 'รุ่นที่ 1 วันที่ 1-3 กันยายน เวลา 09.00-12.00 น.',
    trainingDates: 'วันที่ 1 - 3 กันยายน 2569 (09.00 - 12.00 น.)',
    instructor: 'นายณฐวัตร พงษ์สาริกิจ (หัวหน้าแผนกบุคคลและธุรการ) & ศูนย์ฝึกอบรม TCT Academy',
    institute: 'ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development & Training Center',
    totalModules: 4,
    passingScorePercent: 75
  },
  'kyt-shisa-kanko': {
    title: 'หลักสูตร KYT & SHISA KANKO การคาดการณ์อันตรายและการป้องกันความผิดพลาดด้วยเทคนิคมือชี้-ปากย้ำ (TCT-KYT-01)',
    code: 'TCT-KYT-01',
    batch: 'รุ่นที่ 1 วันที่ 10-12 กันยายน เวลา 08.00-16.00 น.',
    trainingDates: 'วันที่ 10 - 12 กันยายน 2569 (08.00 - 16.00 น.)',
    instructor: 'นายณฐวัตร พงษ์สาริกิจ (หัวหน้าแผนกบุคคลและธุรการ) & ทีมวิทยากร TCT Academy',
    institute: 'ศูนย์ฝึกอบรมและพัฒนา TCT Academy ศูนย์ฝึกอบรมและพัฒนาบุคลากร',
    totalModules: 6,
    passingScorePercent: 80
  },
  'applied-psychology': {
    title: 'หลักสูตรจิตวิทยาประยุกต์ในการทำงาน เพื่อความสำเร็จ ความสุข และความมั่นคง (Applied Psychology for Workplace Success, Happiness & Stability - TCT-PSY-01)',
    code: 'TCT-PSY-01',
    batch: 'รอบที่ 1: 12 ตุลาคม 2569 - 16 ตุลาคม 2569 เวลา 08.00-16.00 น.',
    trainingDates: 'วันที่ 12 - 16 ตุลาคม 2569 (08.00 - 16.00 น.)',
    instructor: 'นายณฐวัตร พงษ์สาริกิจ (หัวหน้าศูนย์/หัวหน้าแผนกบุคคล) & ทีมวิทยากร TCT Academy',
    institute: 'ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development & Training Center',
    totalModules: 3,
    passingScorePercent: 80
  },
  'good-employee-skills': {
    title: 'หลักสูตรพัฒนาศักยภาพพนักงานระดับต้น “ทักษะการเป็นพนักงานที่ดี” (Good Employee Skills)',
    code: 'TCT-GES-01',
    batch: 'รุ่นที่ 1 ปฐมนิเทศพนักงานปฏิบัติการใหม่ ประจำปี 2569',
    trainingDates: 'วันที่ 20 - 24 ตุลาคม 2569 (08.00 - 16.00 น.)',
    instructor: 'นายณฐวัตร พงษ์สาริกิจ (หัวหน้าแผนกบุคคลและธุรการ) & ทีมวิทยากร TCT Academy',
    institute: 'ศูนย์ฝึกอบรมและพัฒนาบุคลากร TCT Academy (Personnel Development And Training Center) บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด',
    totalModules: 7,
    passingScorePercent: 80
  }
};

/**
 * Resolves accurate per-course trainee records for any specified course ID
 */
export function resolveCourseTrainees(
  trainees: TraineeRecord[],
  courseId: string
): CourseTraineeResolved[] {
  const courseMeta = COURSE_OFFICIAL_METADATA[courseId] || {
    title: getCourseById(courseId)?.title || `หลักสูตร ${courseId}`,
    code: `TCT-${courseId.toUpperCase().slice(0, 4)}-01`,
    batch: 'รุ่นที่ 1 / 2569',
    trainingDates: 'วันที่ 27 - 29 สิงหาคม 2569 (08.00 - 16.00 น.)',
    instructor: 'ทีมวิทยากร TCT Academy',
    institute: 'ศูนย์ฝึกอบรมและพัฒนา TCT ACADEMY',
    totalModules: getCourseModules(courseId).length || 3,
    passingScorePercent: 80
  };

  const totalModules = courseMeta.totalModules || 3;

  // Map trainees source: use the active trainees list (or fallback to stored trainees)
  // so any addition, deletion, or manual score edit is directly reflected
  let baseTraineeList = (trainees && trainees.length > 0) ? [...trainees] : [...getStoredTrainees()];
  const deletedIds = new Set(getDeletedTraineeIds().map(id => id.toUpperCase()));

  if (courseId === 'applied-psychology') {
    APPLIED_PSYCHOLOGY_INITIAL_TRAINEES.forEach(initT => {
      const initId = initT.empId.trim().toUpperCase();
      if (!baseTraineeList.some(b => b.empId.trim().toUpperCase() === initId)) {
        baseTraineeList.push(initT);
      }
    });
  }

  // Filter trainees that are explicitly enrolled or have active progress in this specific course
  let relevantList = baseTraineeList.filter(t => {
    const cleanId = t.empId.trim().toUpperCase();
    if (deletedIds.has(cleanId)) return false;
    return isEmployeeEnrolledInCourse(cleanId, courseId, t);
  });

  return relevantList.map((baseEmp) => {
    const cleanId = baseEmp.empId.trim().toUpperCase();
    const existingInList = trainees.find(t => t.empId.trim().toUpperCase() === cleanId);
    const userStored = getUserPersistentProgress(cleanId);

    let preScore: number | null = null;
    let postScore: number | null = null;
    let completedMods: number[] = [];
    let certId: string | undefined = undefined;
    let certDate: string | undefined = undefined;
    let satScore: number | undefined = undefined;
    let stageDesc = 'ยังไม่เริ่มเข้าอบรม';
    let isPassed = false;
    let isStarted = false;

    // Check specific course progress dictionary from user state or admin record
    const progressFromUser: CourseProgressRecord | undefined = userStored?.coursesProgress?.[courseId];
    const progressFromAdmin: CourseProgressRecord | undefined = existingInList?.coursesProgress?.[courseId];
    const progress = progressFromUser || progressFromAdmin;
    const isCustomOrUnenrolled = !['risk-management', 'advanced-preventive-maintenance', 'conflict-management', 'ai-for-tct', 'personality-psychology', 'kyt-shisa-kanko', 'applied-psychology', 'good-employee-skills'].includes(courseId);
    const initMatch = courseId === 'applied-psychology'
      ? APPLIED_PSYCHOLOGY_INITIAL_TRAINEES.find(t => t.empId.trim().toUpperCase() === cleanId)
      : undefined;

    if (progress) {
      preScore = progress.preTestScore ?? null;
      postScore = progress.postTestScore ?? null;
      completedMods = progress.completedModules || [];
      certId = progress.certificateId;
      certDate = progress.certificateDate;
      satScore = progress.evaluationAnswers?.overallSatisfaction;
      if (progress.lastActiveStep) {
        stageDesc = progress.lastActiveStep;
      }
    } else if (initMatch) {
      preScore = initMatch.preTestScore ?? null;
      postScore = initMatch.postTestScore ?? null;
      completedMods = initMatch.completedModules || [];
      certId = initMatch.certificateId;
      certDate = initMatch.certificateDate;
      satScore = initMatch.satisfactionScore;
      stageDesc = initMatch.currentStep || 'จบหลักสูตร & ได้รับวุฒิบัตร';
    } else if (isCustomOrUnenrolled) {
      // Automatic active pass record for custom course cohort so documents and certificates can be issued
      preScore = baseEmp.preTestScore ?? 6;
      postScore = baseEmp.postTestScore ?? 10;
      completedMods = Array.from({ length: totalModules }, (_, i) => i + 1);
      certId = `${courseMeta.code || 'TCT-TRN'}-2569-${cleanId.replace(/[^a-zA-Z0-9]/g, '')}-CERT`;
      certDate = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
      satScore = 5;
      stageDesc = 'จบหลักสูตร & ได้รับวุฒิบัตร';
    } else if (
      ((existingInList?.selectedCourseId === courseId) || (userStored?.selectedCourseId === courseId)) &&
      (!userStored?.coursesProgress || Object.keys(userStored.coursesProgress).length === 0) &&
      (!existingInList?.coursesProgress || Object.keys(existingInList.coursesProgress).length === 0)
    ) {
      // Fallback to top-level records only for legacy single-course data without coursesProgress
      preScore = userStored?.preTestScore ?? existingInList?.preTestScore ?? null;
      postScore = userStored?.postTestScore ?? existingInList?.postTestScore ?? null;
      completedMods = userStored?.completedModules || existingInList?.completedModules || [];
      certId = userStored?.certificateId || existingInList?.certificateId;
      certDate = userStored?.certificateDate || existingInList?.certificateDate;
      satScore = userStored?.evaluationAnswers?.overallSatisfaction || existingInList?.satisfactionScore;
    }

    isPassed = postScore !== null && postScore >= 8;
    isStarted = preScore !== null || completedMods.length > 0 || postScore !== null;

    let status: 'passed' | 'in_progress' | 'not_started' = 'not_started';
    let statusText = 'ยังไม่เริ่มเรียน';
    let stageText = 'ยังไม่เริ่มเข้าอบรม';

    if (isPassed) {
      status = 'passed';
      statusText = 'ผ่านการอบรม';
      stageText = `ผ่านเกณฑ์ (${Math.round((postScore || 10) * 2)}/20) • รับรองผลสำเร็จ`;
    } else if (isStarted) {
      status = 'in_progress';
      statusText = 'อยู่ระหว่างอบรม';
      if (postScore !== null && postScore < 8) {
        stageText = `ทำ Post-Test แล้ว (${Math.round(postScore * 2)}/20) - ยังไม่ผ่านเกณฑ์ 80%`;
      } else if (completedMods.length >= totalModules) {
        stageText = `เรียนครบ ${totalModules} บท • รอทำแบบทดสอบ Post-Test`;
      } else if (completedMods.length > 0) {
        stageText = `กำลังศึกษาบทเรียน (${completedMods.length}/${totalModules} บท)`;
      } else if (preScore !== null) {
        stageText = `ทำ Pre-Test (${preScore}/10) • กำลังเริ่มบทเรียน`;
      }
    }

    const preScoreText = preScore !== null ? `${preScore}/10` : '-';
    const postScoreText = postScore !== null ? `${postScore}/10` : '-';
    
    // Total score (เต็ม 20): Sum of Pre-Test (10) + Post-Test (10) or scaled Post-Test (x2)
    let totalScore20: number | null = null;
    let totalScore20Text = '-';
    if (preScore !== null && postScore !== null) {
      totalScore20 = preScore + postScore;
      totalScore20Text = `${totalScore20}/20`;
    } else if (postScore !== null) {
      totalScore20 = Math.round(postScore * 2);
      totalScore20Text = `${totalScore20}/20`;
    }

    const scaledScoreText = postScore !== null 
      ? `${Math.round(postScore * 2)}/20` 
      : '-';

    return {
      empId: baseEmp.empId,
      fullName: baseEmp.fullName,
      department: baseEmp.department,
      position: baseEmp.position || 'SUPERVISOR',
      enrolledAt: baseEmp.enrolledAt || '2026-08-23',
      completedAt: isPassed ? (certDate || '2026-08-23') : undefined,
      courseId,
      courseTitle: courseMeta.title,
      courseCode: courseMeta.code,
      preTestScore: preScore,
      postTestScore: postScore,
      preScoreText,
      postScoreText,
      totalScore20,
      totalScore20Text,
      scaledPostScoreText: scaledScoreText,
      completedModulesCount: completedMods.length,
      totalModulesCount: totalModules,
      isCompleted: isPassed,
      status,
      statusTextThai: statusText,
      currentStageTextThai: stageText,
      certificateId: certId,
      certificateDate: certDate,
      satisfactionScore: satScore
    };
  });
}
