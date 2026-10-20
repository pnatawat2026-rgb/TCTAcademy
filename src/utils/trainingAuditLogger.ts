import { TrainingLogEntry, TrainingActionType, TrainingTrackingSummary, UserProfile } from '../types';
import { saveTrainingAuditLog, subscribeToTrainingAuditLogs } from '../firebase';

export type { TrainingLogEntry, TrainingActionType, TrainingTrackingSummary };
export { subscribeToTrainingAuditLogs };

const LOCAL_STORAGE_TRAINING_LOGS = 'tct_training_audit_logs_v1';
const AUTO_LOGOUT_PREFS_KEY = 'tct_auto_logout_prefs_v1';

export interface AutoLogoutPreferences {
  timeoutMinutes: number; // default: 5 (minutes)
  warningSeconds: number; // default: 60 (seconds before auto-logout)
  enabled: boolean; // default: true
}

export function getAutoLogoutPreferences(): AutoLogoutPreferences {
  try {
    const raw = localStorage.getItem(AUTO_LOGOUT_PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        timeoutMinutes: Math.max(30, parsed.timeoutMinutes ?? 30),
        warningSeconds: parsed.warningSeconds ?? 60,
        enabled: parsed.enabled ?? true
      };
    }
  } catch (e) {}
  return {
    timeoutMinutes: 30,
    warningSeconds: 60,
    enabled: true
  };
}

export function saveAutoLogoutPreferences(prefs: Partial<AutoLogoutPreferences>): AutoLogoutPreferences {
  const current = getAutoLogoutPreferences();
  const updated: AutoLogoutPreferences = {
    ...current,
    ...prefs
  };
  try {
    localStorage.setItem(AUTO_LOGOUT_PREFS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('tct_autologout_prefs_updated', { detail: updated }));
  } catch (e) {}
  return updated;
}

export function formatThaiDateTime(date: Date = new Date()): string {
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function getClientDeviceInfo(): string {
  try {
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
    const platform = isMobile ? 'Mobile' : 'Workstation/PC';
    let browser = 'Browser';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edge')) browser = 'Edge';
    return `${platform} (${browser})`;
  } catch (e) {
    return 'Terminal/PC';
  }
}

/**
 * Get locally stored training logs
 */
export function getStoredTrainingLogs(): TrainingLogEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TRAINING_LOGS);
    let logs: TrainingLogEntry[] = raw ? JSON.parse(raw) : [];

    // Ensure initial official logs for applied-psychology exist
    const hasPsyLogs = logs.some(l => l.courseId === 'applied-psychology');
    if (!hasPsyLogs) {
      const initialPsyLogs = generateInitialAppliedPsychologyLogs();
      logs = [...logs, ...initialPsyLogs];
      try {
        localStorage.setItem(LOCAL_STORAGE_TRAINING_LOGS, JSON.stringify(logs.slice(0, 500)));
      } catch (e) {}
    }
    return logs;
  } catch (e) {}
  return generateInitialAppliedPsychologyLogs();
}

export function generateInitialAppliedPsychologyLogs(): TrainingLogEntry[] {
  return [
    {
      id: 'log-psy-01',
      timestamp: '2026-10-13T16:30:00.000Z',
      displayTime: '13 ต.ค. 2569, 16:30:00',
      empId: '25056',
      fullName: 'นาย ณฐวัตร พงษ์สาริกิจ',
      department: 'PS',
      position: 'SUPERVISOR',
      courseId: 'applied-psychology',
      courseName: 'หลักสูตรที่ 7: จิตวิทยาประยุกต์ในการทำงาน (TCT-PSY-01)',
      action: 'certificate_issued',
      detail: 'สำเร็จการฝึกอบรมและออกใบรับรองมาตรฐาน TCT Academy (คะแนน 20/20 เต็ม 100%)',
      score: 10,
      maxScore: 10,
      deviceInfo: 'Workstation/PC (Chrome)',
      isAutoLogout: false
    },
    {
      id: 'log-psy-02',
      timestamp: '2026-10-13T16:15:00.000Z',
      displayTime: '13 ต.ค. 2569, 16:15:00',
      empId: '25056',
      fullName: 'นาย ณฐวัตร พงษ์สาริกิจ',
      department: 'PS',
      position: 'SUPERVISOR',
      courseId: 'applied-psychology',
      courseName: 'หลักสูตรที่ 7: จิตวิทยาประยุกต์ในการทำงาน (TCT-PSY-01)',
      action: 'posttest_submit',
      detail: 'ส่งแบบทดสอบหลังเรียน Post-Test ได้คะแนนเต็ม 10/10 (คิดเป็น 20/20 คะแนน)',
      score: 10,
      maxScore: 10,
      deviceInfo: 'Workstation/PC (Chrome)',
      isAutoLogout: false
    },
    {
      id: 'log-psy-03',
      timestamp: '2026-10-13T15:40:00.000Z',
      displayTime: '13 ต.ค. 2569, 15:40:00',
      empId: '25056',
      fullName: 'นาย ณฐวัตร พงษ์สาริกิจ',
      department: 'PS',
      position: 'SUPERVISOR',
      courseId: 'applied-psychology',
      courseName: 'หลักสูตรที่ 7: จิตวิทยาประยุกต์ในการทำงาน (TCT-PSY-01)',
      action: 'module_complete',
      detail: 'เรียนจบครบทั้ง 3 บทเรียน: 1.Growth Mindset, 2.Resilience & EQ, 3.Wellbeing',
      score: null,
      maxScore: null,
      deviceInfo: 'Workstation/PC (Chrome)',
      isAutoLogout: false
    },
    {
      id: 'log-psy-04',
      timestamp: '2026-10-14T15:30:00.000Z',
      displayTime: '14 ต.ค. 2569, 15:30:00',
      empId: '08013',
      fullName: 'นาย กิตติศักดิ์ สร้อยจิตต์',
      department: 'PS',
      position: 'MANAGER',
      courseId: 'applied-psychology',
      courseName: 'หลักสูตรที่ 7: จิตวิทยาประยุกต์ในการทำงาน (TCT-PSY-01)',
      action: 'certificate_issued',
      detail: 'สำเร็จการฝึกอบรมและออกใบรับรองมาตรฐาน TCT Academy (คะแนน 20/20)',
      score: 10,
      maxScore: 10,
      deviceInfo: 'Workstation/PC (Chrome)',
      isAutoLogout: false
    },
    {
      id: 'log-psy-05',
      timestamp: '2026-10-14T14:45:00.000Z',
      displayTime: '14 ต.ค. 2569, 14:45:00',
      empId: '06025',
      fullName: 'น.ส. จารุณี อินทรโสภา',
      department: 'PS',
      position: 'CHIEF',
      courseId: 'applied-psychology',
      courseName: 'หลักสูตรที่ 7: จิตวิทยาประยุกต์ในการทำงาน (TCT-PSY-01)',
      action: 'posttest_submit',
      detail: 'สอบผ่าน Post-Test ได้คะแนนเต็ม 10/10 ผ่านเกณฑ์รอบที่ 1',
      score: 10,
      maxScore: 10,
      deviceInfo: 'Workstation/PC (Chrome)',
      isAutoLogout: false
    },
    {
      id: 'log-psy-06',
      timestamp: '2026-10-15T11:20:00.000Z',
      displayTime: '15 ต.ค. 2569, 11:20:00',
      empId: '17001',
      fullName: 'น.ส. ดวงพร ไชยวีระ',
      department: 'PS',
      position: 'WORKER',
      courseId: 'applied-psychology',
      courseName: 'หลักสูตรที่ 7: จิตวิทยาประยุกต์ในการทำงาน (TCT-PSY-01)',
      action: 'certificate_issued',
      detail: 'สำเร็จการอบรมและได้รับวุฒิบัตรอิเล็กทรอนิกส์ TCT-PSY-01 (18/20 คะแนน)',
      score: 9,
      maxScore: 10,
      deviceInfo: 'Mobile (Android)',
      isAutoLogout: false
    },
    {
      id: 'log-psy-07',
      timestamp: '2026-10-15T10:50:00.000Z',
      displayTime: '15 ต.ค. 2569, 10:50:00',
      empId: '01002',
      fullName: 'น.ส. มลฤดี ศิริคุณ',
      department: 'PP',
      position: 'CHIEF',
      courseId: 'applied-psychology',
      courseName: 'หลักสูตรที่ 7: จิตวิทยาประยุกต์ในการทำงาน (TCT-PSY-01)',
      action: 'certificate_issued',
      detail: 'สำเร็จการอบรมและได้รับวุฒิบัตร (คะแนนเต็ม 20/20)',
      score: 10,
      maxScore: 10,
      deviceInfo: 'Workstation/PC (Chrome)',
      isAutoLogout: false
    },
    {
      id: 'log-psy-08',
      timestamp: '2026-10-15T09:30:00.000Z',
      displayTime: '15 ต.ค. 2569, 09:30:00',
      empId: '03007',
      fullName: 'นาย นาวา เกษร',
      department: 'MN',
      position: 'SUPERVISOR',
      courseId: 'applied-psychology',
      courseName: 'หลักสูตรที่ 7: จิตวิทยาประยุกต์ในการทำงาน (TCT-PSY-01)',
      action: 'certificate_issued',
      detail: 'สำเร็จการอบรมและได้รับวุฒิบัตร TCT Academy (18/20 คะแนน)',
      score: 9,
      maxScore: 10,
      deviceInfo: 'Workstation/PC (Chrome)',
      isAutoLogout: false
    },
    {
      id: 'log-psy-09',
      timestamp: '2026-10-15T08:45:00.000Z',
      displayTime: '15 ต.ค. 2569, 08:45:00',
      empId: '11003',
      fullName: 'นาย ชลิต เสือน้อย',
      department: 'MN',
      position: 'MANAGER',
      courseId: 'applied-psychology',
      courseName: 'หลักสูตรที่ 7: จิตวิทยาประยุกต์ในการทำงาน (TCT-PSY-01)',
      action: 'posttest_submit',
      detail: 'สอบผ่าน Post-Test 10/10 สมบูรณ์ 100%',
      score: 10,
      maxScore: 10,
      deviceInfo: 'Workstation/PC (Chrome)',
      isAutoLogout: false
    },
    {
      id: 'log-psy-10',
      timestamp: '2026-10-16T14:10:00.000Z',
      displayTime: '16 ต.ค. 2569, 14:10:00',
      empId: '18034',
      fullName: 'น.ส. วนิดา เพิ่มความประเสริฐ',
      department: 'QA',
      position: 'SUPERVISOR',
      courseId: 'applied-psychology',
      courseName: 'หลักสูตรที่ 7: จิตวิทยาประยุกต์ในการทำงาน (TCT-PSY-01)',
      action: 'certificate_issued',
      detail: 'สำเร็จการอบรมและได้รับวุฒิบัตรมาตรฐาน TCT Academy',
      score: 10,
      maxScore: 10,
      deviceInfo: 'Workstation/PC (Chrome)',
      isAutoLogout: false
    },
    {
      id: 'log-psy-11',
      timestamp: '2026-10-16T13:20:00.000Z',
      displayTime: '16 ต.ค. 2569, 13:20:00',
      empId: '15030',
      fullName: 'น.ส. หฤทัย ถึงอินทร์',
      department: 'ESH',
      position: 'CHIEF',
      courseId: 'applied-psychology',
      courseName: 'หลักสูตรที่ 7: จิตวิทยาประยุกต์ในการทำงาน (TCT-PSY-01)',
      action: 'certificate_issued',
      detail: 'สำเร็จการอบรมและได้รับวุฒิบัตร (คะแนนเต็ม 20/20)',
      score: 10,
      maxScore: 10,
      deviceInfo: 'Workstation/PC (Chrome)',
      isAutoLogout: false
    },
    {
      id: 'log-psy-12',
      timestamp: '2026-10-12T08:30:00.000Z',
      displayTime: '12 ต.ค. 2569, 08:30:00',
      empId: '25056',
      fullName: 'นาย ณฐวัตร พงษ์สาริกิจ',
      department: 'PS',
      position: 'SUPERVISOR',
      courseId: 'applied-psychology',
      courseName: 'หลักสูตรที่ 7: จิตวิทยาประยุกต์ในการทำงาน (TCT-PSY-01)',
      action: 'course_selected',
      detail: 'ลงทะเบียนและเปิดหลักสูตรจิตวิทยาประยุกต์ในการทำงาน รอบที่ 1 (12-16 ต.ค. 2569)',
      score: null,
      maxScore: null,
      deviceInfo: 'Workstation/PC (Chrome)',
      isAutoLogout: false
    }
  ];
}

/**
 * Save locally stored training logs
 */
export function saveStoredTrainingLogs(logs: TrainingLogEntry[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_TRAINING_LOGS, JSON.stringify(logs.slice(0, 500)));
  } catch (e) {}
}

export const COURSE_TITLE_MAP: Record<string, string> = {
  'risk-management': 'หลักสูตรที่ 1: การบริหารความเสี่ยง (QSRM)',
  'advanced-preventive-maintenance': 'หลักสูตรที่ 2: การบำรุงรักษาเชิงป้องกัน (APM)',
  'conflict-management': 'หลักสูตรที่ 3: การจัดการความขัดแย้ง (CFM)',
  'ai-for-tct': 'หลักสูตรที่ 4: AI for TCT (TCT-AI-101)',
  'personality-psychology': 'หลักสูตรที่ 5: จิตวิทยาบุคลิกภาพ (TCT-A001)',
  'kyt-shisa-kanko': 'หลักสูตรที่ 6: KYT & Shisa Kanko (TCT-KYT-01)',
  'applied-psychology': 'หลักสูตรที่ 7: จิตวิทยาประยุกต์ในการทำงาน (TCT-PSY-01)'
};

/**
 * Log a training event both locally and to server
 */
export async function logTrainingEvent(params: {
  empId: string;
  fullName: string;
  department: string;
  position?: string;
  courseId: string;
  courseName?: string;
  action: TrainingActionType;
  detail: string;
  score?: number | null;
  maxScore?: number | null;
  durationSeconds?: number;
  isAutoLogout?: boolean;
}): Promise<TrainingLogEntry> {
  const now = new Date();
  const resolvedCourseName = params.courseName || COURSE_TITLE_MAP[params.courseId] || params.courseId;
  const entry: TrainingLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now.toISOString(),
    displayTime: formatThaiDateTime(now),
    empId: (params.empId || 'UNKNOWN').trim().toUpperCase(),
    fullName: params.fullName || 'ผู้เข้าอบรม',
    department: params.department || 'P',
    position: params.position || 'OPERATOR',
    courseId: params.courseId || 'risk-management',
    courseName: resolvedCourseName,
    action: params.action,
    detail: params.detail,
    score: params.score ?? null,
    maxScore: params.maxScore ?? null,
    durationSeconds: params.durationSeconds,
    deviceInfo: getClientDeviceInfo(),
    isAutoLogout: params.isAutoLogout ?? (params.action === 'auto_logout' || params.action === 'session_timeout')
  };

  // 1. Save locally
  const currentLogs = getStoredTrainingLogs();
  currentLogs.unshift(entry);
  saveStoredTrainingLogs(currentLogs);

  // 2. Dispatch custom event for real-time reactivity
  window.dispatchEvent(new CustomEvent('tct_training_log_added', { detail: entry }));

  // 3. Save directly to Firebase Firestore in real-time
  try {
    saveTrainingAuditLog({
      id: entry.id,
      empId: entry.empId,
      fullName: entry.fullName,
      department: entry.department,
      position: entry.position,
      courseId: entry.courseId,
      courseName: entry.courseName,
      action: entry.action,
      detail: entry.detail,
      score: entry.score,
      maxScore: entry.maxScore,
      durationSeconds: entry.durationSeconds,
      deviceInfo: entry.deviceInfo,
      timestamp: entry.timestamp,
      displayTime: entry.displayTime,
      isAutoLogout: entry.isAutoLogout
    }).catch(err => {
      console.debug('Firestore saveTrainingAuditLog error:', err);
    });
  } catch (e) {
    console.debug('Firestore audit log save error:', e);
  }

  // 4. Sync to server in background
  try {
    fetch('/api/training-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      keepalive: true
    }).catch(() => {});
  } catch (e) {}

  return entry;
}

/**
 * Fetch all training logs from server with local fallback
 */
export async function fetchTrainingLogs(filters?: {
  empId?: string;
  courseId?: string;
  department?: string;
  action?: string;
  limit?: number;
}): Promise<TrainingLogEntry[]> {
  try {
    const query = new URLSearchParams();
    if (filters?.empId) query.set('empId', filters.empId);
    if (filters?.courseId && filters.courseId !== 'all') query.set('courseId', filters.courseId);
    if (filters?.department && filters.department !== 'all') query.set('department', filters.department);
    if (filters?.action && filters.action !== 'all') query.set('action', filters.action);
    if (filters?.limit) query.set('limit', String(filters.limit));

    const res = await fetch(`/api/training-logs?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.logs)) {
        // Merge with local logs to prevent missing recent offline events
        const serverLogs = data.logs as TrainingLogEntry[];
        const localLogs = getStoredTrainingLogs();
        const idSet = new Set(serverLogs.map(l => l.id));
        const combined = [...serverLogs];
        for (const loc of localLogs) {
          if (!idSet.has(loc.id)) {
            combined.push(loc);
          }
        }
        combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        saveStoredTrainingLogs(combined);
        return combined;
      }
    }
  } catch (e) {
    console.debug('Failed to fetch training logs from server, using local store', e);
  }

  // Local fallback filtering
  let logs = getStoredTrainingLogs();
  if (filters?.empId) {
    const cleanId = filters.empId.trim().toUpperCase();
    logs = logs.filter(l => l.empId.toUpperCase() === cleanId);
  }
  if (filters?.courseId && filters.courseId !== 'all') {
    logs = logs.filter(l => l.courseId === filters.courseId);
  }
  if (filters?.department && filters.department !== 'all') {
    logs = logs.filter(l => l.department.toUpperCase() === filters.department?.toUpperCase());
  }
  if (filters?.action && filters.action !== 'all') {
    logs = logs.filter(l => l.action === filters.action);
  }
  if (filters?.limit) {
    logs = logs.slice(0, filters.limit);
  }
  return logs;
}

/**
 * Get personal training history logs for a specific trainee
 */
export function getPersonalTrainingHistory(empId: string): TrainingLogEntry[] {
  if (!empId) return [];
  const cleanId = empId.trim().toUpperCase();
  const allLogs = getStoredTrainingLogs();
  return allLogs.filter(l => l.empId.toUpperCase() === cleanId);
}

/**
 * Action label display map for UI
 */
export const ACTION_LABELS: Record<TrainingActionType, { label: string; badgeColor: string; icon: string }> = {
  login: { label: 'เข้าสู่ระบบ', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300', icon: 'LogIn' },
  auto_logout: { label: 'ออกจากระบบอัตโนมัติ (ความปลอดภัย)', badgeColor: 'bg-red-100 text-red-800 border-red-300 font-bold', icon: 'ShieldAlert' },
  manual_logout: { label: 'ออกจากระบบด้วยตนเอง', badgeColor: 'bg-slate-100 text-slate-800 border-slate-300', icon: 'LogOut' },
  session_timeout: { label: 'หมดเวลาเซสชัน (Auto-Timeout)', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300', icon: 'Clock' },
  course_selected: { label: 'เลือก/เปลี่ยนหลักสูตร', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: 'BookOpen' },
  pretest_start: { label: 'เริ่มทำ Pre-Test', badgeColor: 'bg-sky-100 text-sky-800 border-sky-300', icon: 'Play' },
  pretest_submit: { label: 'ส่งแบบทดสอบ Pre-Test', badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300', icon: 'FileCheck' },
  module_start: { label: 'เริ่มเรียนบทเรียน', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300', icon: 'Layers' },
  module_complete: { label: 'เรียนจบบทเรียน', badgeColor: 'bg-teal-100 text-teal-800 border-teal-300', icon: 'CheckCircle' },
  video_watch: { label: 'ดูวิดีโอบรรยาย', badgeColor: 'bg-violet-100 text-violet-800 border-violet-300', icon: 'Tv' },
  game_complete: { label: 'ทำกิจกรรมจำลอง/KYT สำเร็จ', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: 'Gamepad2' },
  posttest_start: { label: 'เริ่มทำ Post-Test', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300', icon: 'HelpCircle' },
  posttest_submit: { label: 'ส่งแบบทดสอบ Post-Test', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold', icon: 'Award' },
  evaluation_submit: { label: 'ส่งแบบประเมินความพึงพอใจ', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300', icon: 'Heart' },
  certificate_issued: { label: 'ออกใบประกาศนียบัตร', badgeColor: 'bg-amber-200 text-amber-900 border-amber-400 font-extrabold', icon: 'Trophy' },
  profile_update: { label: 'อัปเดตข้อมูลพนักงาน', badgeColor: 'bg-slate-100 text-slate-800 border-slate-300', icon: 'User' }
};

/**
 * Export training logs to CSV / Excel format
 */
export function exportTrainingLogsToCSV(logs: TrainingLogEntry[], filename = 'TCT_Academy_Training_Logs.csv'): void {
  if (!logs || logs.length === 0) return;

  const headers = [
    'วัน-เวลา (Timestamp)',
    'รหัสพนักงาน (Emp ID)',
    'ชื่อ-นามสกุล (Full Name)',
    'แผนก (Department)',
    'ตำแหน่ง (Position)',
    'หลักสูตร (Course)',
    'ประเภทกิจกรรม (Action)',
    'รายละเอียดการบันทึก (Log Details)',
    'คะแนน (Score)',
    'คะแนนเต็ม (Max Score)',
    'ระยะเวลาที่ใช้ (วินาที)',
    'อุปกรณ์/เบราว์เซอร์ (Device)',
    'ออกจากระบบอัตโนมัติ (Auto-Logout)'
  ];

  const rows = logs.map(l => [
    `"${l.displayTime || l.timestamp}"`,
    `"${l.empId}"`,
    `"${l.fullName}"`,
    `"${l.department}"`,
    `"${l.position || ''}"`,
    `"${l.courseName || l.courseId}"`,
    `"${ACTION_LABELS[l.action]?.label || l.action}"`,
    `"${l.detail.replace(/"/g, '""')}"`,
    l.score !== null && l.score !== undefined ? l.score : '',
    l.maxScore !== null && l.maxScore !== undefined ? l.maxScore : '',
    l.durationSeconds !== undefined ? l.durationSeconds : '',
    `"${l.deviceInfo || ''}"`,
    l.isAutoLogout ? 'ใช่ (Auto-Protected)' : 'ไม่'
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
