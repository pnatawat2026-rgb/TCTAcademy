/**
 * Kirkpatrick 4 Levels Evaluation Manager
 * Model: Kirkpatrick Model for Corporate Training Evaluation
 * Level 1: Reaction (ความพึงพอใจต่อหลักสูตร/วิทยากร/ระบบ)
 * Level 2: Learning (การเรียนรู้และความรู้ที่ได้รับ)
 * Level 3: Behavior (การนำความรู้ไปประยุกต์ใช้ในพฤติกรรมการทำงานจริง)
 * Level 4: Results (ผลลัพธ์และผลกระทบต่อเป้าหมายองค์กร)
 * 
 * Company: บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด (Teijin Cord Thailand Co., Ltd.)
 */

import { KirkpatrickEvaluation, KirkpatrickEvaluationItem, UserProfile } from '../types';

export const KIRKPATRICK_STORAGE_KEY = 'tct_kirkpatrick_evaluations_v1';

export interface KirkpatrickLevelConfig {
  level: 1 | 2 | 3 | 4;
  nameTh: string;
  nameEn: string;
  badge: string;
  color: string;
  descriptionTh: string;
  iconName: string;
}

export const KIRKPATRICK_LEVELS_CONFIG: KirkpatrickLevelConfig[] = [
  {
    level: 1,
    nameTh: 'ระดับที่ 1: การประเมินปฏิกิริยาและความพึงพอใจ',
    nameEn: 'Level 1: Reaction & Satisfaction',
    badge: 'LEVEL 1 • REACTION',
    color: 'from-blue-600 to-indigo-700',
    descriptionTh: 'ความพึงพอใจต่อเนื้อหาหลักสูตร วิทยากร สื่อการสอน สภาพแวดล้อม และระบบดิจิทัล',
    iconName: 'Smile'
  },
  {
    level: 2,
    nameTh: 'ระดับที่ 2: การประเมินผลการเรียนรู้และทักษะ',
    nameEn: 'Level 2: Learning & Competency',
    badge: 'LEVEL 2 • LEARNING',
    color: 'from-emerald-600 to-teal-700',
    descriptionTh: 'ความรู้ ความเข้าใจ หลักการ และทักษะใหม่ที่ได้รับเพิ่มขึ้นหลังผ่านการฝึกอบรม',
    iconName: 'GraduationCap'
  },
  {
    level: 3,
    nameTh: 'ระดับที่ 3: การประเมินพฤติกรรมและการนำไปใช้',
    nameEn: 'Level 3: Behavior & Application',
    badge: 'LEVEL 3 • BEHAVIOR',
    color: 'from-amber-600 to-orange-700',
    descriptionTh: 'ความสามารถและความมุ่งมั่นในการนำความรู้ไปประยุกต์ใช้กับการปฏิบัติงานจริงตามมาตรฐาน SOP',
    iconName: 'Briefcase'
  },
  {
    level: 4,
    nameTh: 'ระดับที่ 4: การประเมินผลลัพธ์ต่อองค์กร',
    nameEn: 'Level 4: Results & Impact (QCDSM)',
    badge: 'LEVEL 4 • RESULTS',
    color: 'from-purple-600 to-pink-700',
    descriptionTh: 'ผลกระทบต่อการลดความเสี่ยง การเพิ่มคุณภาพ ความปลอดภัย และความคุ้มค่าต่อบริษัท เทยิน คอร์ด',
    iconName: 'Award'
  }
];

export const DEFAULT_KIRKPATRICK_QUESTIONS: Omit<KirkpatrickEvaluationItem, 'score'>[] = [
  // --- Level 1: Reaction (4 criteria) ---
  {
    id: 'l1_content',
    level: 1,
    levelNameTh: 'ระดับที่ 1: ปฏิกิริยาและความพึงพอใจ',
    levelNameEn: 'Reaction',
    topic: '1.1 ความสมบูรณ์และความน่าสนใจของเนื้อหาหลักสูตร',
    descriptionTh: 'เนื้อหาหลักสูตรมีความสอดคล้องกับวัตถุประสงค์ ทันสมัย ชัดเจน และตรงกับความต้องการในงานจริง'
  },
  {
    id: 'l1_instructor',
    level: 1,
    levelNameTh: 'ระดับที่ 1: ปฏิกิริยาและความพึงพอใจ',
    levelNameEn: 'Reaction',
    topic: '1.2 ความเชี่ยวชาญและการถ่ายทอดของวิทยากร / สื่อบทเรียน',
    descriptionTh: 'วิทยากรหรือสื่อวิดีโอบรรยายถ่ายทอดได้เข้าใจง่าย มีการยกตัวอย่างเคสจริง และน่าติดตาม'
  },
  {
    id: 'l1_platform',
    level: 1,
    levelNameTh: 'ระดับที่ 1: ปฏิกิริยาและความพึงพอใจ',
    levelNameEn: 'Reaction',
    topic: '1.3 ความสะดวกและความพร้อมของระบบการเรียนรู้ดิจิทัล E-Learning',
    descriptionTh: 'ระบบใช้งานง่าย เสถียร เข้าถึงได้จากคอมพิวเตอร์และมือถือ มีแบบฝึกหัดและมินิเกมที่ช่วยให้เข้าใจง่าย'
  },
  {
    id: 'l1_timing',
    level: 1,
    levelNameTh: 'ระดับที่ 1: ปฏิกิริยาและความพึงพอใจ',
    levelNameEn: 'Reaction',
    topic: '1.4 ความเหมาะสมของระยะเวลาและการบริหารเวลา',
    descriptionTh: 'ระยะเวลาของแต่ละบทเรียนมีความกระชับพอเหมาะ ไม่รบกวนเวลาการทำงานปกติจนเกินไป'
  },

  // --- Level 2: Learning (3 criteria) ---
  {
    id: 'l2_knowledge',
    level: 2,
    levelNameTh: 'ระดับที่ 2: การเรียนรู้และทักษะ',
    levelNameEn: 'Learning',
    topic: '2.1 องค์ความรู้และทักษะที่เพิ่มขึ้นจากการฝึกอบรม',
    descriptionTh: 'ผู้เรียนมีความรู้ ความเข้าใจในหลักการ กฎระเบียบ หรือเทคนิคใหม่ๆ เพิ่มขึ้นอย่างมีนัยสำคัญ'
  },
  {
    id: 'l2_competency',
    level: 2,
    levelNameTh: 'ระดับที่ 2: การเรียนรู้และทักษะ',
    levelNameEn: 'Learning',
    topic: '2.2 ความสามารถในการทำแบบทดสอบและผลสัมฤทธิ์',
    descriptionTh: 'สามารถตอบคำถาม วิเคราะห์สถานการณ์ และทำคะแนน Post-Test ได้ตามเกณฑ์มาตรฐานที่บริษัทกำหนด'
  },
  {
    id: 'l2_confidence',
    level: 2,
    levelNameTh: 'ระดับที่ 2: การเรียนรู้และทักษะ',
    levelNameEn: 'Learning',
    topic: '2.3 ความมั่นใจในหลักการและสาระสำคัญของหลักสูตร',
    descriptionTh: 'มีความมั่นใจในการอธิบายและนำหลักการที่เรียนรู้ไปสื่อสารกับทีมงานได้อย่างถูกต้อง'
  },

  // --- Level 3: Behavior (3 criteria) ---
  {
    id: 'l3_application',
    level: 3,
    levelNameTh: 'ระดับที่ 3: พฤติกรรมและการนำไปใช้',
    levelNameEn: 'Behavior',
    topic: '3.1 ความสามารถในการนำความรู้ไปประยุกต์ใช้กับหน้างานจริง',
    descriptionTh: 'สามารถนำแนวทางและเครื่องมือจากหลักสูตรไปปรับใช้กับการปฏิบัติงานประจำวันและคู่มือ SOP ได้จริง'
  },
  {
    id: 'l3_safety_quality',
    level: 3,
    levelNameTh: 'ระดับที่ 3: พฤติกรรมและการนำไปใช้',
    levelNameEn: 'Behavior',
    topic: '3.2 การปรับปรุงพฤติกรรมการทำงานด้านคุณภาพและความปลอดภัย',
    descriptionTh: 'มุ่งมั่นปรับปรุงพฤติกรรมตนเองเพื่อลดความผิดพลาด เสริมสร้างวินัย ความปลอดภัย และการทำงานร่วมกัน'
  },
  {
    id: 'l3_sharing',
    level: 3,
    levelNameTh: 'ระดับที่ 3: พฤติกรรมและการนำไปใช้',
    levelNameEn: 'Behavior',
    topic: '3.3 ความพร้อมในการถ่ายทอดและแบ่งปันความรู้แก่เพื่อนร่วมงาน',
    descriptionTh: 'ตั้งใจแบ่งปันความรู้ แนะนำเพื่อนร่วมงาน และเป็นแบบอย่างที่ดีในการปฏิบัติงานตามมาตรฐาน'
  },

  // --- Level 4: Results (3 criteria) ---
  {
    id: 'l4_qcdsm',
    level: 4,
    levelNameTh: 'ระดับที่ 4: ผลลัพธ์ต่อองค์กร',
    levelNameEn: 'Results',
    topic: '4.1 การช่วยลดข้อผิดพลาด ลดความเสี่ยง และยกระดับคุณภาพ (QCDSM)',
    descriptionTh: 'การฝึกอบรมมีส่วนช่วยลดอัตราการเกิดของเสีย ป้องกันอุบัติเหตุ และเพิ่มประสิทธิภาพสายการผลิต'
  },
  {
    id: 'l4_roi',
    level: 4,
    levelNameTh: 'ระดับที่ 4: ผลลัพธ์ต่อองค์กร',
    levelNameEn: 'Results',
    topic: '4.2 ความคุ้มค่าและผลสัมฤทธิ์ต่อเป้าหมายขององค์กร TCT',
    descriptionTh: 'การจัดฝึกอบรมหลักสูตรนี้มีความคุ้มค่าต่อการลงทุนพัฒนาบุคลากร และสนับสนุนเป้าหมายของบริษัท'
  },
  {
    id: 'l4_recommend',
    level: 4,
    levelNameTh: 'ระดับที่ 4: ผลลัพธ์ต่อองค์กร',
    levelNameEn: 'Results',
    topic: '4.3 ความยินดีและเห็นควรแนะนำหลักสูตรนี้ให้แก่เพื่อนร่วมงานท่านอื่น',
    descriptionTh: 'ยินดีแนะนำให้พนักงานในหน่วยงานอื่นหรือรุ่นถัดไปเข้ารับการฝึกอบรมหลักสูตรนี้อย่างต่อเนื่อง'
  }
];

export const RATING_SCALE_LABELS = [
  { score: 5, labelTh: 'ดีเยี่ยม (มากที่สุด)', labelEn: 'Excellent', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
  { score: 4, labelTh: 'ดีมาก (มาก)', labelEn: 'Very Good', color: 'text-blue-700 bg-blue-50 border-blue-300' },
  { score: 3, labelTh: 'ปานกลาง (พอใช้)', labelEn: 'Moderate', color: 'text-amber-700 bg-amber-50 border-amber-300' },
  { score: 2, labelTh: 'น้อย (ควรปรับปรุง)', labelEn: 'Needs Improvement', color: 'text-orange-700 bg-orange-50 border-orange-300' },
  { score: 1, labelTh: 'น้อยที่สุด (ต้องแก้ไข)', labelEn: 'Poor', color: 'text-rose-700 bg-rose-50 border-rose-300' }
];

export function calculateGrade(scoreOutOf5: number): { labelTh: string; labelEn: string; badgeColor: string } {
  if (scoreOutOf5 >= 4.5) {
    return { labelTh: 'ระดับดีเยี่ยม (Excellent)', labelEn: 'Excellent', badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
  }
  if (scoreOutOf5 >= 4.0) {
    return { labelTh: 'ระดับดีมาก (Very Good)', labelEn: 'Very Good', badgeColor: 'bg-blue-100 text-blue-900 border-blue-300' };
  }
  if (scoreOutOf5 >= 3.5) {
    return { labelTh: 'ระดับดี (Good)', labelEn: 'Good', badgeColor: 'bg-teal-100 text-teal-900 border-teal-300' };
  }
  if (scoreOutOf5 >= 3.0) {
    return { labelTh: 'ระดับปานกลาง (Fair)', labelEn: 'Fair', badgeColor: 'bg-amber-100 text-amber-900 border-amber-300' };
  }
  return { labelTh: 'ควรปรับปรุง (Needs Action)', labelEn: 'Needs Action', badgeColor: 'bg-rose-100 text-rose-900 border-rose-300' };
}

/**
 * Baseline seeded evaluations (Empty by default so each employee evaluates themselves)
 */
export const BASELINE_KIRKPATRICK_EVALUATIONS: KirkpatrickEvaluation[] = [];

/**
 * Retrieve all evaluations stored in local storage
 */
export function getStoredKirkpatrickEvaluations(): KirkpatrickEvaluation[] {
  try {
    const raw = localStorage.getItem(KIRKPATRICK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out legacy dummy seeded records for 54013 and 25056 if they were seeded with fake IDs
        const filtered = parsed.filter(e => e.id !== 'kpk-eval-001' && e.id !== 'kpk-eval-002');
        return filtered;
      }
    }
  } catch (e) {
    console.error('Error reading kirkpatrick evaluations from storage', e);
  }
  return [];
}

/**
 * Save evaluation to local storage and sync to server
 */
export function saveKirkpatrickEvaluation(evaluation: KirkpatrickEvaluation): KirkpatrickEvaluation {
  try {
    const existing = getStoredKirkpatrickEvaluations();
    const updated = [
      evaluation,
      ...existing.filter(e => !(e.empId === evaluation.empId && e.courseId === evaluation.courseId))
    ];
    localStorage.setItem(KIRKPATRICK_STORAGE_KEY, JSON.stringify(updated));

    // Async server sync
    fetch('/api/evaluations/kirkpatrick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluation)
    }).catch(() => {});

    // Broadcast storage event for real-time reactivity
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Error saving kirkpatrick evaluation', e);
  }
  return evaluation;
}

/**
 * Check if employee has evaluated a course
 */
export function getEmployeeKirkpatrickEvaluation(empId: string, courseId?: string): KirkpatrickEvaluation | null {
  if (!empId) return null;
  const cleanId = empId.trim().toUpperCase();
  const all = getStoredKirkpatrickEvaluations();
  
  if (courseId) {
    return all.find(e => e.empId.toUpperCase() === cleanId && e.courseId === courseId) || null;
  }
  return all.find(e => e.empId.toUpperCase() === cleanId) || null;
}

/**
 * Generate a unique verification code for the evaluation slip
 */
export function generateEvaluationCode(empId: string, courseId: string): string {
  const cleanId = empId ? empId.trim().toUpperCase().padStart(5, '0').slice(-5) : '00000';
  const prefix = courseId ? courseId.slice(0, 3).toUpperCase() : 'TCT';
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `KPK-${prefix}-${cleanId}-${dateStr}`;
}
