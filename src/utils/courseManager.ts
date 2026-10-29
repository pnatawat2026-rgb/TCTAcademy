import { Course, CourseModule, Question } from '../types';
import { COURSES as INITIAL_COURSES } from '../data/courses';
import { COURSE_MODULES, COURSE_QUESTIONS } from '../data/courseData';
import { COURSE_MODULES_PREVENTIVE, PREVENTIVE_MAINTENANCE_QUESTIONS } from '../data/preventiveCourseData';
import { COURSE_MODULES_CONFLICT, CONFLICT_MANAGEMENT_QUESTIONS } from '../data/conflictCourseData';
import { COURSE_MODULES_PERSONALITY, PERSONALITY_PSYCHOLOGY_QUESTIONS } from '../data/personalityCourseData';
import { COURSE_MODULES_AI, AI_COURSE_QUESTIONS } from '../data/aiCourseData';
import { COURSE_MODULES_KYT, KYT_SHISA_KANKO_QUESTIONS } from '../data/kytCourseData';
import { COURSE_MODULES_APPLIED_PSYCHOLOGY, APPLIED_PSYCHOLOGY_QUESTIONS } from '../data/appliedPsychologyCourseData';
import { COURSE_MODULES_GOOD_EMPLOYEE_SKILLS, GOOD_EMPLOYEE_SKILLS_QUESTIONS } from '../data/goodEmployeeSkillsData';

export interface CustomCourseData {
  course: Course;
  modules: CourseModule[];
  questions: Question[];
  createdAt: string;
  createdBy: string;
  passingScore: number;
}

const STORAGE_CUSTOM_COURSES_KEY = 'tct_custom_courses_v4';
const STORAGE_COHORT_BACKUPS_KEY = 'tct_cohort_backups_v4';
export const STORAGE_COURSE_CUSTOMIZATIONS_KEY = 'tct_course_customizations_v5';

/**
 * Get all course customizations (overridden image URLs, titles, confidentiality)
 */
export function getCourseCustomizations(): Record<string, Partial<Course>> {
  try {
    const raw = localStorage.getItem(STORAGE_COURSE_CUSTOMIZATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Save course customization (e.g. background image URL, confidential status, etc.)
 */
export function saveCourseCustomization(courseId: string, overrides: Partial<Course>): void {
  try {
    const current = getCourseCustomizations();
    current[courseId] = {
      ...(current[courseId] || {}),
      ...overrides
    };
    localStorage.setItem(STORAGE_COURSE_CUSTOMIZATIONS_KEY, JSON.stringify(current));
  } catch (e) {
    console.debug('Failed to save course customization', e);
  }
}

/**
 * Reset course customizations to factory defaults
 */
export function resetCourseCustomizations(): void {
  try {
    localStorage.removeItem(STORAGE_COURSE_CUSTOMIZATIONS_KEY);
  } catch (e) {}
}

/**
 * Get all available courses (Initial built-in + Admin created + Customizations applied)
 */
export function getAllAvailableCourses(): Course[] {
  const customCourses = getStoredCustomCourses();
  const customList = customCourses.map(c => c.course);
  const combined = [...INITIAL_COURSES, ...customList];
  const customizations = getCourseCustomizations();

  return combined.map(course => {
    const custom = customizations[course.id];
    if (custom) {
      return {
        ...course,
        ...custom
      };
    }
    return course;
  });
}

/**
 * Get course details by ID
 */
export function getCourseById(courseId: string): Course | undefined {
  return getAllAvailableCourses().find(c => c.id === courseId);
}

/**
 * Get modules for any course (built-in or custom)
 */
export function getCourseModules(courseId: string): CourseModule[] {
  if (courseId === 'risk-management') {
    return COURSE_MODULES;
  }
  if (courseId === 'advanced-preventive-maintenance') {
    return COURSE_MODULES_PREVENTIVE;
  }
  if (courseId === 'conflict-management') {
    return COURSE_MODULES_CONFLICT;
  }
  if (courseId === 'ai-for-tct') {
    return COURSE_MODULES_AI;
  }
  if (courseId === 'personality-psychology') {
    return COURSE_MODULES_PERSONALITY;
  }
  if (courseId === 'kyt-shisa-kanko') {
    return COURSE_MODULES_KYT;
  }
  if (courseId === 'applied-psychology') {
    return COURSE_MODULES_APPLIED_PSYCHOLOGY;
  }
  if (courseId === 'good-employee-skills') {
    return COURSE_MODULES_GOOD_EMPLOYEE_SKILLS;
  }

  // Check custom courses
  const custom = getStoredCustomCourses().find(c => c.course.id === courseId);
  if (custom && custom.modules && custom.modules.length > 0) {
    return custom.modules;
  }

  return [];
}

/**
 * Get questions for any course (built-in or custom)
 */
export function getCourseQuestions(courseId: string): Question[] {
  if (courseId === 'risk-management') {
    return COURSE_QUESTIONS;
  }
  if (courseId === 'advanced-preventive-maintenance') {
    return PREVENTIVE_MAINTENANCE_QUESTIONS;
  }
  if (courseId === 'conflict-management') {
    return CONFLICT_MANAGEMENT_QUESTIONS;
  }
  if (courseId === 'ai-for-tct') {
    return AI_COURSE_QUESTIONS;
  }
  if (courseId === 'personality-psychology') {
    return PERSONALITY_PSYCHOLOGY_QUESTIONS;
  }
  if (courseId === 'kyt-shisa-kanko') {
    return KYT_SHISA_KANKO_QUESTIONS;
  }
  if (courseId === 'applied-psychology') {
    return APPLIED_PSYCHOLOGY_QUESTIONS;
  }
  if (courseId === 'good-employee-skills') {
    return GOOD_EMPLOYEE_SKILLS_QUESTIONS;
  }

  // Check custom courses
  const custom = getStoredCustomCourses().find(c => c.course.id === courseId);
  if (custom && custom.questions && custom.questions.length > 0) {
    return custom.questions;
  }

  return [];
}

/**
 * Read custom courses from storage
 */
export function getStoredCustomCourses(): CustomCourseData[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_COURSES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.debug('Failed to parse custom courses', e);
  }
  return [];
}

/**
 * Save new custom course
 */
export function saveCustomCourse(newCourseData: CustomCourseData): void {
  try {
    const existing = getStoredCustomCourses();
    const idx = existing.findIndex(c => c.course.id === newCourseData.course.id);
    if (idx >= 0) {
      existing[idx] = newCourseData;
    } else {
      existing.push(newCourseData);
    }
    localStorage.setItem(STORAGE_CUSTOM_COURSES_KEY, JSON.stringify(existing));
  } catch (e) {
    console.debug('Failed to save custom course', e);
  }
}

/**
 * Delete custom course (Admin only)
 */
export function deleteCustomCourse(courseId: string): boolean {
  try {
    const existing = getStoredCustomCourses();
    const filtered = existing.filter(c => c.course.id !== courseId);
    localStorage.setItem(STORAGE_CUSTOM_COURSES_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.debug('Failed to delete custom course', e);
    return false;
  }
}

export interface CohortBackup {
  id: string;
  courseId: string;
  courseTitle: string;
  cohortName: string;
  clearedAt: string;
  clearedBy: string;
  traineeCount: number;
  records: any[];
}

export function getStoredCohortBackups(): CohortBackup[] {
  try {
    const raw = localStorage.getItem(STORAGE_COHORT_BACKUPS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.debug('Failed to load cohort backups', e);
  }
  return [];
}

/**
 * Reset trainee learning records for a specific course (for a new cohort/batch of employees)
 */
export function resetCourseCohort(courseId: string, cohortName: string, adminName: string): { success: boolean; backupId?: string } {
  try {
    // 1. Gather all current trainees
    const adminTraineesKey = 'tct_admin_trainees_roster_v1';
    let currentRoster: any[] = [];
    const saved = localStorage.getItem(adminTraineesKey);
    if (saved) {
      currentRoster = JSON.parse(saved);
    }

    const courseObj = getCourseById(courseId);
    const courseTitle = courseObj?.title || courseId;

    // 2. Create backup before resetting
    const backupId = `cohort-backup-${courseId}-${Date.now()}`;
    const backup: CohortBackup = {
      id: backupId,
      courseId,
      courseTitle,
      cohortName: cohortName || `รุ่นวันที่ ${new Date().toLocaleDateString('th-TH')}`,
      clearedAt: new Date().toLocaleString('th-TH'),
      clearedBy: adminName || 'System Administrator',
      traineeCount: currentRoster.length,
      records: JSON.parse(JSON.stringify(currentRoster))
    };

    const backups = getStoredCohortBackups();
    backups.unshift(backup);
    localStorage.setItem(STORAGE_COHORT_BACKUPS_KEY, JSON.stringify(backups.slice(0, 50)));

    // 3. Clear progress for this course in individual user storage
    const userStatePrefix = 'tct_user_state_';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(userStatePrefix)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const u = JSON.parse(raw);
            if (u.selectedCourseId === courseId || !u.selectedCourseId) {
              // Reset scores for this user in this course
              u.preTestScore = null;
              u.postTestScore = null;
              u.postTestAttempts = 0;
              u.miniGameScore = 0;
              u.completedModules = [];
              u.evaluationSubmitted = false;
              u.certificateId = undefined;
              u.certificateDate = undefined;
              localStorage.setItem(key, JSON.stringify(u));
            }
          }
        } catch (err) {
          console.debug('Error clearing user state', err);
        }
      }
    }

    // 4. Reset admin roster for this course
    const resetRoster = currentRoster.map(t => {
      return {
        ...t,
        status: 'not_started',
        preTestScore: null,
        postTestScore: null,
        postTestAttempts: 0,
        miniGameScore: 0,
        completedModules: [],
        evaluationSubmitted: false,
        certificateId: undefined,
        certificateDate: undefined,
        cohortTag: cohortName || 'รุ่นปัจจุบัน'
      };
    });
    localStorage.setItem(adminTraineesKey, JSON.stringify(resetRoster));

    // Also clear active session if current course matches
    try {
      const activeSessionKey = 'tct_qsrm_learning_state_v1';
      const activeRaw = localStorage.getItem(activeSessionKey);
      if (activeRaw) {
        const active = JSON.parse(activeRaw);
        if (active.selectedCourseId === courseId) {
          active.preTestScore = null;
          active.postTestScore = null;
          active.postTestAttempts = 0;
          active.miniGameScore = 0;
          active.completedModules = [];
          active.evaluationSubmitted = false;
          active.certificateId = undefined;
          active.certificateDate = undefined;
          localStorage.setItem(activeSessionKey, JSON.stringify(active));
        }
      }
    } catch (e) {
      console.debug('Error updating active session', e);
    }

    return { success: true, backupId };
  } catch (e) {
    console.debug('Failed to reset course cohort', e);
    return { success: false };
  }
}

/**
 * Computes the exact view a trainee must take next in a course (Thai MOOC LMS logic).
 * Resolves the issue where user entered and had to scroll or search for the next unit.
 */
export function getNextActionView(
  user: {
    selectedCourseId?: string;
    preTestScore?: number | null;
    postTestScore?: number | null;
    completedModules?: number[];
    evaluationSubmitted?: boolean;
    coursesProgress?: Record<string, any>;
  },
  courseId: string
): 'pretest' | 'module1' | 'module2' | 'module3' | 'module4' | 'module5' | 'module6' | 'module7' | 'game' | 'posttest' | 'evaluation' | 'certificate' {
  const cp = user.coursesProgress?.[courseId];
  const preScore = cp ? cp.preTestScore : user.preTestScore;
  const postScore = cp ? cp.postTestScore : user.postTestScore;
  const completedMods: number[] = cp?.completedModules || user.completedModules || [];
  const evalSubmitted = cp ? cp.evaluationSubmitted : user.evaluationSubmitted;
  const modules = getCourseModules(courseId);
  const passingScore = courseId === 'good-employee-skills' ? 16 : (courseId === 'personality-psychology' ? 15 : (courseId === 'kyt-shisa-kanko' || courseId === 'ai-for-tct' ? 16 : 8));

  // 1. If Pre-test not done -> Pre-test
  if (preScore === null || preScore === undefined) {
    return 'pretest';
  }

  // 2. If any module is not yet completed -> Next uncompleted module
  const nextIncomplete = modules.find(m => !completedMods.includes(m.id));
  if (nextIncomplete) {
    return `module${nextIncomplete.id}` as any;
  }

  // 3. If Post-test not passed -> Post-test
  if (postScore === null || postScore === undefined || postScore < passingScore) {
    return 'posttest';
  }

  // 4. If Post-test passed, but evaluation not submitted -> Evaluation
  if (!evalSubmitted) {
    return 'evaluation';
  }

  // 5. If all steps completed -> Certificate
  return 'certificate';
}

