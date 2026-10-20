// Approver & Digital Signature Management for TCT E-Training
import { addStoredAuditLog } from '../data/traineeData';

export interface ApproverSignatory {
  id: string;
  order: number;
  name: string;
  position: string;
  department: string;
  roleTitle: string;
  authorityLevel: string;
  focusArea: string;
  responsibilities: string[];
  learningWorkflowRole: string;
  empId?: string;
  passcode?: string;
  avatarColor: string;
  isSigned: boolean;
  signedAt?: string;
  comments?: string;
}

const STORAGE_KEY_APPROVERS = 'tct_approver_signatures_v3';

export const OFFICIAL_APPROVERS: ApproverSignatory[] = [
  {
    id: 'approver-1',
    order: 1,
    name: 'นายณฐวัตร พงษ์สาริกิจ',
    position: 'หัวหน้าศูนย์ TCT Academy / หัวหน้าแผนกบุคคลและธุรการ',
    department: 'Personnel & Administration Department • TCT Academy',
    roleTitle: 'หัวหน้าศูนย์ TCT Academy & หัวหน้าแผนกบุคคลและธุรการ',
    authorityLevel: 'หัวหน้าศูนย์ TCT Academy & ผู้จัดทำและตรวจสอบผลการอบรม',
    focusArea: 'ความถูกต้องของหลักสูตร TCT Academy, การทำแบบทดสอบ Pre/Post-Test, เกณฑ์ผ่าน 100%, และค่าพัฒนาการ (Gain Score)',
    responsibilities: [
      'ออกแบบและพัฒนาหลักสูตรการเรียนรู้ทั้งหมดร่วมกับศูนย์ฝึกอบรม TCT Academy',
      'จัดทำและตรวจประเมินผลคะแนนก่อนเรียน (Pre-Test) และหลังเรียน (Post-Test) ของพนักงานทุกหลักสูตร',
      'วิเคราะห์ค่าเฉลี่ยพัฒนาการการเรียนรู้ (Average Gain Score) และคะแนนมินิเกมจำลองสถานการณ์หน้างาน',
      'รับรองความสมบูรณ์ในการผ่านบทเรียน และลงนามในฐานะหัวหน้าศูนย์ฝึกอบรมและพัฒนา TCT Academy'
    ],
    learningWorkflowRole: 'หัวหน้าศูนย์ TCT Academy ผู้จัดทำและตรวจทานผลสัมฤทธิ์ทางการศึกษา',
    empId: '25056',
    passcode: '25056',
    avatarColor: 'from-cyan-500 to-blue-600',
    isSigned: true,
    signedAt: '2026-08-28 16:30'
  },
  {
    id: 'approver-2',
    order: 2,
    name: 'นายกิตติศักดิ์ สร้อยจิตต์',
    position: 'ผู้จัดการศูนย์ TCT Academy / ผู้จัดการฝ่ายบุคคลและธุรการ',
    department: 'Personnel & Administration Department • TCT Academy',
    roleTitle: 'ผู้จัดการศูนย์ TCT Academy & ผู้จัดการฝ่ายบุคคลและธุรการ',
    authorityLevel: 'ผู้จัดการศูนย์ TCT Academy & ผู้จัดการฝ่ายบุคคลและธุรการ',
    focusArea: 'ความครบถ้วนของชั่วโมงอบรม, อัตราการเข้าเรียน 100%, และการรับรองสิทธิประโยชน์ทางภาษี พ.ร.บ. ส่งเสริมการพัฒนาฝีมือแรงงาน',
    responsibilities: [
      'กำกับดูแลและบริหารจัดการศูนย์ฝึกอบรมและพัฒนาบุคลากร TCT Academy',
      'ตรวจสอบบันทึกเวลาเรียนและการเข้าร่วมการฝึกอบรมครบ 100% ตามข้อบังคับ',
      'จัดทำและตรวจสอบแบบฟอร์มรายงานผลการฝึกอบรมภายในบริษัท (PS-TR-00-05) และ E-Training Roster',
      'รับรองสิทธิประโยชน์ทางภาษีตาม พ.ร.บ. ส่งเสริมการพัฒนาฝีมือแรงงาน พ.ศ. 2545 และอนุมัติการออกใบรับรอง'
    ],
    learningWorkflowRole: 'ผู้จัดการศูนย์ TCT Academy และผู้กำกับดูแลด้านการพัฒนาบุคลากร',
    empId: '25001',
    passcode: '25001',
    avatarColor: 'from-amber-500 to-orange-600',
    isSigned: true,
    signedAt: '2026-08-28 17:15'
  },
  {
    id: 'approver-3',
    order: 3,
    name: 'นายนพดล บำรุงเกียรติ',
    position: 'ผู้จัดการทั่วไปและผู้จัดการโรงงาน / ประธานที่ปรึกษาศูนย์ TCT Academy',
    department: 'Executive Management / Plant Operations • TCT Academy Advisory Board',
    roleTitle: 'ผู้จัดการทั่วไปและผู้จัดการโรงงาน & ประธานที่ปรึกษาศูนย์ TCT Academy',
    authorityLevel: 'ผู้จัดการทั่วไปและผู้จัดการโรงงาน / ประธานที่ปรึกษาศูนย์ TCT Academy',
    focusArea: 'ประสิทธิผลการปฏิบัติงานจริงในสายการผลิต, การลดความเสี่ยง (Risk Mitigation), และความคุ้มค่าการลงทุน (Training ROI)',
    responsibilities: [
      'ประธานที่ปรึกษาศูนย์ฝึกอบรมและพัฒนา TCT Academy กำกับนโยบายระดับบริหารสูงสุด',
      'รับรองและอนุมัติรายงานผลการฝึกอบรมและวุฒิบัตรอย่างเป็นทางการ',
      'ประเมินความสอดคล้องของการนำทักษะ Micro Learning ไปใช้ป้องกันความเสี่ยงและความผิดพลาดในโรงงาน',
      'รับรองผลสัมฤทธิ์อย่างเป็นทางการเพื่อปิดรอบการฝึกอบรมและอนุมัติการออกวุฒิบัตร'
    ],
    learningWorkflowRole: 'ประธานที่ปรึกษาศูนย์ TCT Academy ผู้จัดการทั่วไปและผู้จัดการโรงงาน',
    empId: '00001',
    passcode: 'GM2026',
    avatarColor: 'from-emerald-500 to-teal-600',
    isSigned: true,
    signedAt: '2026-08-28 17:45'
  }
];

export const getStoredApprovers = (): ApproverSignatory[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_APPROVERS) || localStorage.getItem('tct_approver_signatures_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Guarantee standardized official names and titles are always respected
        return OFFICIAL_APPROVERS.map(official => {
          const found = parsed.find((p: ApproverSignatory) => p.id === official.id);
          return {
            ...official,
            isSigned: found ? found.isSigned : official.isSigned,
            signedAt: found ? found.signedAt : official.signedAt,
            comments: found && found.comments !== undefined ? found.comments : official.comments
          };
        });
      }
    }
  } catch (e) {
    console.debug('Error loading approvers', e);
  }
  return OFFICIAL_APPROVERS;
};

export const saveStoredApprovers = (approvers: ApproverSignatory[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_APPROVERS, JSON.stringify(approvers));
  } catch (e) {
    console.debug('Error saving approvers', e);
  }
};

export const toggleApproverSignature = (approverId: string, comments?: string): ApproverSignatory[] => {
  const current = getStoredApprovers();
  const updated = current.map(app => {
    if (app.id === approverId) {
      const newStatus = !app.isSigned;
      const now = new Date().toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      addStoredAuditLog({
        empId: app.empId || 'APPROVER',
        action: 'profile_updated',
        detail: `${newStatus ? 'ลงนามอนุมัติ' : 'ยกเลิกการลงนาม'} รายงานการฝึกอบรม โดย ${app.name} (${app.position})`
      });

      return {
        ...app,
        isSigned: newStatus,
        signedAt: newStatus ? now : undefined,
        comments: comments !== undefined ? comments : app.comments
      };
    }
    return app;
  });

  saveStoredApprovers(updated);
  return updated;
};

export const resetApproverSignaturesToDefault = (): ApproverSignatory[] => {
  saveStoredApprovers(OFFICIAL_APPROVERS);
  return OFFICIAL_APPROVERS;
};
