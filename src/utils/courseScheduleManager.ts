import { Course } from '../types';
import { getAllAvailableCourses } from './courseManager';

export interface CourseScheduleConfig {
  courseId: string;
  isOpen: boolean;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  assignedDepartments?: string[]; // empty or undefined means all departments
  assignedEmpIds?: string[];      // empty or undefined means all employees
  note?: string;
}

const STORAGE_SCHEDULE_KEY = 'tct_course_schedules_v1';

// Default schedules initialized with official TCT dates
export const DEFAULT_SCHEDULES: Record<string, CourseScheduleConfig> = {
  'applied-psychology': {
    courseId: 'applied-psychology',
    isOpen: true,
    startDate: '2026-10-12',
    endDate: '2026-10-16',
    note: 'รอบที่ 1: 12 ตุลาคม 2569 - 16 ตุลาคม 2569 (หลักสูตรบังคับปัจจุบัน)'
  },
  'kyt-shisa-kanko': {
    courseId: 'kyt-shisa-kanko',
    isOpen: true,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    note: 'หลักสูตรมาตรฐานความปลอดภัยประจำเดือน'
  },
  'ai-for-tct': {
    courseId: 'ai-for-tct',
    isOpen: true,
    startDate: '2026-10-01',
    endDate: '2026-11-30',
    note: 'หลักสูตรปัญญาประดิษฐ์เพื่อการเพิ่มผลผลิต (Future Skill)'
  },
  'advanced-preventive-maintenance': {
    courseId: 'advanced-preventive-maintenance',
    isOpen: true,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    note: 'หลักสูตรการบำรุงรักษาเชิงป้องกัน'
  },
  'risk-management': {
    courseId: 'risk-management',
    isOpen: true,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    note: 'หลักสูตรการบริหารความเสี่ยงด้านคุณภาพและความปลอดภัย'
  },
  'conflict-management': {
    courseId: 'conflict-management',
    isOpen: true,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    note: 'หลักสูตรการบริหารความขัดแย้ง'
  },
  'personality-psychology': {
    courseId: 'personality-psychology',
    isOpen: true,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    note: 'หลักสูตรจิตวิทยาบุคลิกภาพ'
  }
};

/**
 * Retrieve all course schedules
 */
export function getAllCourseSchedules(): Record<string, CourseScheduleConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_SCHEDULE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SCHEDULES, ...parsed };
    }
  } catch (e) {
    console.debug('Error reading course schedules', e);
  }
  return { ...DEFAULT_SCHEDULES };
}

/**
 * Get schedule for a specific course
 */
export function getCourseSchedule(courseId: string): CourseScheduleConfig {
  const all = getAllCourseSchedules();
  if (all[courseId]) {
    return all[courseId];
  }
  // Default fallback for custom course
  return {
    courseId,
    isOpen: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    note: 'หลักสูตรอบรม'
  };
}

/**
 * Save schedule configuration for a course (Admin only)
 */
export function saveCourseSchedule(courseId: string, update: Partial<CourseScheduleConfig>): void {
  try {
    const all = getAllCourseSchedules();
    const existing = all[courseId] || {
      courseId,
      isOpen: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    };
    all[courseId] = { ...existing, ...update, courseId };
    localStorage.setItem(STORAGE_SCHEDULE_KEY, JSON.stringify(all));
  } catch (e) {
    console.debug('Error saving course schedule', e);
  }
}

/**
 * Checks if a course is currently open for the given employee.
 * Criteria:
 * 1. Admin manual isOpen toggle must be true
 * 2. Today's date must be within [startDate, endDate] (if specified)
 * 3. Department matching (if specified)
 * 4. Employee assignment (if specified)
 */
export function isCourseOpenForTrainee(
  courseId: string,
  empId?: string,
  department?: string
): {
  isOpen: boolean;
  reason: 'open' | 'closed_manual' | 'outside_date_window' | 'not_assigned';
  message: string;
  startDate?: string;
  endDate?: string;
} {
  const schedule = getCourseSchedule(courseId);

  // 1. Manual switch
  if (!schedule.isOpen) {
    return {
      isOpen: false,
      reason: 'closed_manual',
      message: 'หลักสูตรนี้ถูกปิดรับการอบรมชั่วคราวโดยผู้ดูแลระบบ'
    };
  }

  // 2. Date window check
  if (schedule.startDate && schedule.endDate) {
    // Current date format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    if (today < schedule.startDate) {
      return {
        isOpen: false,
        reason: 'outside_date_window',
        message: `หลักสูตรจะเปิดให้อบรมในวันที่ ${formatThaiDateStr(schedule.startDate)} ถึง ${formatThaiDateStr(schedule.endDate)}`,
        startDate: schedule.startDate,
        endDate: schedule.endDate
      };
    }
    if (today > schedule.endDate) {
      return {
        isOpen: false,
        reason: 'outside_date_window',
        message: `หลักสูตรนี้สิ้นสุดระยะเวลาการอบรมแล้ว (สิ้นสุดวันที่ ${formatThaiDateStr(schedule.endDate)})`,
        startDate: schedule.startDate,
        endDate: schedule.endDate
      };
    }
  }

  // 3. Department check
  if (schedule.assignedDepartments && schedule.assignedDepartments.length > 0 && department) {
    const cleanDept = department.trim().toUpperCase();
    const matched = schedule.assignedDepartments.some(d => d.trim().toUpperCase() === cleanDept);
    if (!matched) {
      return {
        isOpen: false,
        reason: 'not_assigned',
        message: 'หลักสูตรนี้จัดสำหรับแผนกอื่นตามที่แอดมินกำหนด'
      };
    }
  }

  // 4. Employee specific check
  if (schedule.assignedEmpIds && schedule.assignedEmpIds.length > 0 && empId) {
    const cleanId = empId.trim().toUpperCase();
    const matched = schedule.assignedEmpIds.some(id => id.trim().toUpperCase() === cleanId);
    if (!matched) {
      return {
        isOpen: false,
        reason: 'not_assigned',
        message: 'รายชื่อของท่านยังไม่ได้ถูกกำหนดให้เข้าอบรมในหลักสูตรนี้'
      };
    }
  }

  return {
    isOpen: true,
    reason: 'open',
    message: 'เปิดให้อบรมตามกำหนดการ',
    startDate: schedule.startDate,
    endDate: schedule.endDate
  };
}

/**
 * Format YYYY-MM-DD to readable Thai date
 */
export function formatThaiDateStr(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10) + 543;
      const mNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const m = mNames[parseInt(parts[1], 10) - 1] || parts[1];
      const d = parseInt(parts[2], 10);
      return `${d} ${m} ${y}`;
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

/**
 * Filter all available courses to only those open and assigned to the trainee
 */
export function getAvailableCoursesForTrainee(
  empId?: string,
  department?: string
): Course[] {
  const allCourses = getAllAvailableCourses();
  return allCourses.filter(course => {
    const status = isCourseOpenForTrainee(course.id, empId, department);
    return status.isOpen;
  });
}
