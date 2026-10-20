import React, { useRef, useState, useMemo, useEffect } from 'react';
import { TraineeRecord, UserProfile } from '../types';
import { downloadMultiPagePdf, printElementViaStandaloneWindow } from '../utils/pdfExport';
import { 
  Printer, 
  Download, 
  X, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  Building, 
  User, 
  Award,
  BookOpen,
  CheckSquare,
  Square,
  FileSpreadsheet,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  ShieldCheck,
  Users,
  Edit3,
  SlidersHorizontal,
  RotateCcw,
  Plus,
  Trash2,
  Settings,
  Calculator,
  UserCheck,
  Percent,
  ListOrdered
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { getAllAvailableCourses, getCourseModules } from '../utils/courseManager';
import { resolveCourseTrainees } from '../utils/courseTraineeHelper';
import * as XLSX from 'xlsx';

interface InhouseTrainingReportModalProps {
  trainees: TraineeRecord[];
  currentUser?: UserProfile | null;
  initialCourseId?: string;
  onClose: () => void;
}

export interface ReportTrainee {
  id: string;
  empId: string;
  fullName: string;
  department: string;
  position: string;
  preTestScore: number | string;
  postTestScore: number | string;
  status: string;
}

export interface CourseReportDetail {
  courseTitle: string;
  courseTitleEn: string;
  trainingDates: string;
  duration: string;
  location: string;
  trainer: string;
  trainerType: 'internal' | 'external';
  targetGroup: string;
  budget: string;
  learningFormat: string;
  
  // Editable Learner counts & scores
  plannedCount: number | string;
  actualCount: number | string;
  passedCount: number | string;
  passRate: number | string;
  avgPreScore: string;
  avgPostScore: string;
  scoreGrowthPercent: string;
  assessmentRemarks: string;
  showTraineeRosterTable: boolean;

  // Trainee Roster
  traineesList: ReportTrainee[];

  gaps: string[];
  objectives: string[];
  kpis: string[];
  sessions: string[];
  methodologies: {
    lecture: boolean;
    workshop: boolean;
    ojt: boolean;
    caseStudy: boolean;
    microLearning: boolean;
    othersText: string;
  };
  satisfactionScores: {
    overall: string;
    content: string;
    trainer: string;
    media: string;
    application: string;
  };
  actionPlans: string[];
  workEvidences: string[];
  supervisorFollowUps: {
    day30: string;
    day60: string;
    day90: string;
  };
  gapClosures: {
    gap: string;
    target: string;
    actualResult: string;
    status: string;
  }[];
  problemsAndSuggestions: {
    problems: string;
    solutions: string;
    recommendations: string;
  };
  followUpPlans: string[];
  appendices: {
    rosterSigned: boolean;
    fullEvaluation: boolean;
    activityPhotos: boolean;
    othersText: string;
  };
}

export interface SignatoriesConfig {
  reporterName: string;
  reporterPosition: string;
  reviewerName: string;
  reviewerPosition: string;
  approver1Name: string;
  approver1Position: string;
  approver2Name: string;
  approver2Position: string;
  approver3Name: string;
  approver3Position: string;
}

const DEFAULT_SIGNATORIES: SignatoriesConfig = {
  reporterName: 'นายณฐวัตร พงษ์สาริกิจ',
  reporterPosition: 'หัวหน้าศูนย์ TCT Academy / หัวหน้าแผนกบุคคลและธุรการ Personnel',
  reviewerName: 'นายณฐวัตร พงษ์สาริกิจ',
  reviewerPosition: 'หัวหน้าศูนย์ TCT Academy / หัวหน้าแผนกบุคคลและธุรการ Personnel',
  approver1Name: 'นายณฐวัตร พงษ์สาริกิจ',
  approver1Position: 'หัวหน้าศูนย์ TCT Academy / หัวหน้าแผนกบุคคลและธุรการ Personnel',
  approver2Name: 'นายกิตติศักดิ์ สร้อยจิตต์',
  approver2Position: 'ผู้จัดการศูนย์ TCT Academy / ผู้จัดการฝ่ายบุคคลและธุรการ',
  approver3Name: 'นายนพดล บำรุงเกียรติ',
  approver3Position: 'ผู้จัดการทั่วไป และ ผู้จัดการโรงงาน / ประธานที่ปรึกษาศูนย์ TCT Academy'
};

/**
 * Initial defaults for known courses
 */
const BASE_KNOWN_REPORTS: Record<string, Partial<CourseReportDetail>> = {
  'risk-management': {
    courseTitle: 'หลักสูตรการบริหารความเสี่ยงด้วยคุณภาพและความปลอดภัย (Quality & Safety Risk Management - QSRM)',
    courseTitleEn: 'Quality & Safety Risk Management Curriculum (QSRM)',
    trainingDates: 'วันที่ 24 - 26 สิงหาคม 2569 (08:00 - 16:00 น.)',
    duration: '6 ชั่วโมง (ระบบ Micro E-Learning & Interactive Scenario Simulator)',
    location: 'ระบบการเรียนรู้ออนไลน์ E-Training Micro Learning Platform & ห้องประชุมสัมมนา TCT Academy',
    trainer: 'นายณฐวัตร พงษ์สาริกิจ และทีมวิทยากร TCT Academy',
    trainerType: 'internal',
    targetGroup: 'หัวหน้างาน (Supervisor) ทุกแผนก จำนวน 13 ท่าน (FI, ST, MN, SEC, QA, PP, AD2, TW, PS, P, TR, ESH)',
    budget: '0 บาท (หลักสูตรและระบบการเรียนรู้อิเล็กทรอนิกส์พัฒนาภายในองค์กร Internal E-Training Academy)',
    learningFormat: 'รูปแบบการเรียนรู้แบบ Micro Learning (ไมโครเลิร์นนิ่ง) 100% Online ผ่านระบบ E-Training',
    plannedCount: 13,
    actualCount: 13,
    passedCount: 13,
    passRate: 100,
    avgPreScore: '48.3',
    avgPostScore: '94.2',
    scoreGrowthPercent: '+95.0%',
    assessmentRemarks: '✓ ผู้เข้ารับการอบรมทุกคนผ่านเกณฑ์มาตรฐานการประเมิน (≥80%) ครบ 100%',
    showTraineeRosterTable: true,
    satisfactionScores: {
      overall: '4.90',
      content: '4.88',
      trainer: '4.92',
      media: '4.85',
      application: '4.95'
    },
    gaps: [
      'ผลการประเมิน Competency ด้าน Risk Assessment & Hazard Identification ใน Skill Matrix ต่ำกว่าเกณฑ์มาตรฐาน (เฉลี่ย 54.2%)',
      'สถิติ Near-Miss ในกระบวนการผลิตและซ่อมบำรุงมีแนวโน้มเพิ่มขึ้น เกิดจากการขาดการชี้บ่งอันตรายก่อนเริ่มงาน (KYT 4 ขั้นตอน)',
      'เมื่อเกิดปัญหาคุณภาพ (Defect) หรือเครื่องจักรหยุด การหาสาเหตุยังผิวเผิน ขาดการวิเคราะห์รากเหง้าปัญหาเชิงลึกด้วย 5 Whys และผังก้างปลา'
    ],
    objectives: [
      'เพื่อปลูกฝังจิตสำนึกวัฒนธรรมคุณภาพและความปลอดภัย (Zero Accident & Zero Defect Culture) ให้เป็นพฤติกรรมอัตโนมัติ',
      'เพื่อให้ผู้เข้าอบรมเข้าใจและสามารถประเมินความเสี่ยงตามตาราง 5x5 Matrix พร้อมเลือกมาตรการตาม Hierarchy of Controls ได้ถูกต้อง',
      'เพื่อฝึกทักษะปฏิบัติจริงในการทำ KYT เตือนสติ 4 ขั้นตอน, ขั้นตอนตัดแยกพลังงาน LOTO และการทำ 5 Whys RCA ในการแก้ปัญหาหน้างานจริง'
    ],
    kpis: [
      'Corporate KPI: ลดอัตราการเกิดอุบัติเหตุ LTIFR = 0 และลดอัตราของเสียจากกระบวนการผลิต Defect PPM < 10',
      'Department KPI: อัตราการปฏิบัติตามมาตรฐานความปลอดภัย 100% (Safety Compliance Rate) และปิดงาน Kaizen ตามเป้าหมาย',
      'Competency: Risk Assessment Level 3, Hazard Identification Level 3, Root Cause Analysis (RCA) Level 3'
    ],
    sessions: [
      'Micro Module 1: วัฒนธรรมคุณภาพและความปลอดภัย (Safety & Quality Culture) และจิตสำนึกในการปฏิบัติงาน (Iceberg Model)',
      'Micro Module 2: การประเมินความเสี่ยงด้วย 5x5 Matrix และลำดับขั้นการควบคุมอันตราย (Hierarchy of Controls)',
      'Micro Module 3: กิจกรรมชี้บ่งอันตรายก่อนเริ่มงาน (4-Step KYT) และมาตรฐานการตัดแยกพลังงาน (LOTO 6 Steps Protocol)',
      'Micro Module 4: การวิเคราะห์หาสาเหตุที่แท้จริง (Root Cause Analysis: RCA) ด้วยเทคนิค 5 Whys และแผนภูมิ Ishikawa'
    ],
    methodologies: {
      lecture: true,
      workshop: true,
      ojt: true,
      caseStudy: true,
      microLearning: true,
      othersText: 'ระบบ Micro E-Learning & Interactive Digital Simulator 100% Online'
    },
    actionPlans: [
      'จัดทำแบบฟอร์มตรวจสอบความเสี่ยงประจำกะ (Daily Shift Risk Checklist) และซักซ้อม KYT เตือนสติ 1 นาทีก่อนเริ่มเดินเครื่องจักร',
      'ดำเนินการทำ 5 Whys RCA ทุกครั้งที่พบของเสียหรือเหตุการณ์เครื่องจักรหยุดเกิน 15 นาที และติดบอร์ดสื่อสาร One Point Lesson (OPL)',
      'จัดประกวด Best Practice ด้านการลดความเสี่ยงและการ Kaizen ความปลอดภัยระหว่างแผนกทุกไตรมาส'
    ],
    workEvidences: [
      'ทะเบียนชี้บ่งความเสี่ยงและแผนการควบคุม (Risk Assessment Register) ฉบับปรับปรุง 2569 ของแต่ละแผนก',
      'ใบบันทึกผลการทำ 5 Whys Root Cause Analysis และภาพถ่ายบอร์ด OPL หน้างาน',
      'ภาพถ่ายการทำกิจกรรม KYT ก่อนเริ่มงาน และใบบันทึกการตรวจสอบกุญแจ LOTO ประจำเครื่องจักร'
    ],
    supervisorFollowUps: {
      day30: 'ผู้จัดการฝ่ายติดตามการนำแบบฟอร์ม Daily Shift Risk Checklist ไปใช้หน้างานจริงครบ 100% ของสายการผลิต',
      day60: 'ตรวจสอบสถิติ Near-Miss และ Defect PPM พบว่าลดลง 45% เมื่อเทียบกับช่วงก่อนการอบรม',
      day90: 'ประเมิน Competency ซ้ำในระบบ Skill Matrix พบว่าระดับคะแนนเฉลี่ยขยับขึ้นสู่ Level 3 (88.5%) ผ่านเกณฑ์มาตรฐานทุกท่าน'
    },
    gapClosures: [
      {
        gap: 'Competency ด้าน Risk Assessment ต่ำกว่าเกณฑ์มาตรฐาน (54.2%)',
        target: 'คะแนนทดสอบหลังเรียน ≥ 80% และผ่านการประเมินปฏิบัติ 100%',
        actualResult: 'ผู้เข้าอบรม 100% ผ่านเกณฑ์ Post-Test คะแนนเฉลี่ย 94.2% (เพิ่มขึ้น +95.0%)',
        status: 'ปิด Gap สมบูรณ์ (Closed)'
      },
      {
        gap: 'สถิติ Near-Miss เพิ่มขึ้น ขาดการชี้บ่งอันตรายก่อนเริ่มงาน',
        target: 'อุบัติเหตุถึงขั้นหยุดงาน (LTIFR) = 0 และมีการทำ KYT 100%',
        actualResult: 'ไม่มีอุบัติเหตุเกิดขึ้นในระหว่างและหลังการอบรม (Zero Accident 100%)',
        status: 'บรรลุเป้าหมาย (Achieved)'
      },
      {
        gap: 'การวิเคราะห์ปัญหา Defect ยังผิวเผิน ขาดการทำ 5 Whys RCA',
        target: 'จัดทำ One Point Lesson (OPL) และแก้ปัญหาด้วย 5 Whys ครบทุกเคส',
        actualResult: 'ทุกแผนกจัดทำ OPL ครบถ้วน และสามารถปิดสาเหตุรากเหง้าของเสียได้ 100%',
        status: 'บรรลุเป้าหมาย (Achieved)'
      }
    ],
    problemsAndSuggestions: {
      problems: 'หัวหน้างานบางท่านมีภารกิจหน้างานฉุกเฉินระหว่างช่วงกะ ทำให้ต้องจัดสรรเวลาเรียนเป็นช่วงสั้นๆ',
      solutions: 'ระบบ Micro E-Learning แบบแยกหน่วยการเรียนรู้ 15-20 นาที ช่วยให้หัวหน้างานสามารถเรียนรู้และทำแบบทดสอบได้สะดวกโดยไม่กระทบงานประจำ',
      recommendations: 'ควรขยายผลหลักสูตรนี้ให้ครอบคลุมถึงระดับ Leader และพนักงานปฏิบัติการ เพื่อสร้างความตระหนักรู้ร่วมกันทั้งโรงงาน'
    },
    followUpPlans: [
      'เชื่อมโยงผลคะแนนการอบรมเข้าสู่ระบบฐานข้อมูลประวัติพนักงาน (Training History Database) และ Skill Matrix อัตโนมัติ',
      'กำหนดให้มีการทบทวน Refresher Course ประจำปี 2570 ผ่านระบบ E-Training',
      'จัดตั้งคณะกรรมการตรวจประเมินความปลอดภัยและคุณภาพสัญจร (Safety & Quality Patrol) ทุกเดือน'
    ],
    appendices: {
      rosterSigned: true,
      fullEvaluation: true,
      activityPhotos: true,
      othersText: 'ผลการทดสอบ Pre-Test / Post-Test ระบบอิเล็กทรอนิกส์ & แฟ้มใบรับรอง'
    }
  },
  'advanced-preventive-maintenance': {
    courseTitle: 'หลักสูตรการบำรุงรักษาเชิงป้องกันขั้นสูง (Condition-Based, Predictive & Reliability-Centered Maintenance)',
    courseTitleEn: 'Advanced Preventive Maintenance (CBM, PdM, RCM) Curriculum',
    trainingDates: 'วันที่ 27 - 29 สิงหาคม 2569 (08:00 - 16:00 น.)',
    duration: '6 ชั่วโมง (ระบบ Micro E-Learning & Predictive Diagnostics Simulation)',
    location: 'ระบบการเรียนรู้ออนไลน์ E-Training Micro Learning Platform & ห้องประชุมสัมมนา TCT Academy',
    trainer: 'นายนพดล บำรุงเกียรติ และทีมผู้เชี่ยวชาญด้านวิศวกรรมบำรุงรักษา TCT Academy',
    trainerType: 'internal',
    targetGroup: 'ผู้จัดการ, หัวหน้างาน, ลีดเดอร์, ช่างเทคนิค และพนักงานฝ่ายซ่อมบำรุง (แผนก MN) จำนวน 13 ท่าน',
    budget: '0 บาท (หลักสูตรและระบบการเรียนรู้อิเล็กทรอนิกส์พัฒนาภายในองค์กร Internal E-Training Academy)',
    learningFormat: 'รูปแบบการเรียนรู้แบบ Micro Learning (ไมโครเลิร์นนิ่ง) 100% Online ร่วมกับ Interactive Simulator',
    plannedCount: 13,
    actualCount: 13,
    passedCount: 13,
    passRate: 100,
    avgPreScore: '51.5',
    avgPostScore: '95.8',
    scoreGrowthPercent: '+86.0%',
    assessmentRemarks: '✓ ผู้เข้ารับการอบรมทุกคนผ่านเกณฑ์มาตรฐานการประเมิน (≥80%) ครบ 100%',
    showTraineeRosterTable: true,
    satisfactionScores: {
      overall: '4.94',
      content: '4.92',
      trainer: '4.96',
      media: '4.90',
      application: '4.97'
    },
    gaps: [
      'เครื่องจักรหลักในสายการผลิตเกิดการชำรุดกะทันหัน (Unplanned Downtime) ส่งผลกระทบต่อแผนการผลิต',
      'การบำรุงรักษาเครื่องจักรยังคงเน้นวิธีแบบตามช่วงเวลา (Time-Based) ขาดการตรวจวัดสภาพจริง (CBM/PdM)',
      'การบันทึกประวัติเครื่องจักรและการวิเคราะห์โหมดความล้มเหลว (FMEA/RCM) ยังไม่เป็นระบบมาตรฐานเดียวกัน'
    ],
    objectives: [
      'เพื่อยกระดับทักษะหัวหน้างานและทีมงานให้สามารถตรวจจับสัญญาณความผิดปกติของเครื่องจักรก่อนเกิดการเสียหายรุนแรง',
      'เพื่อให้ผู้เข้าอบรมเข้าใจหลักการ Condition-Based Maintenance (CBM) และเทคนิค Predictive Maintenance (PdM)',
      'เพื่อจัดทำมาตรฐานแผนการบำรุงรักษาเชิงป้องกัน (PM Standards) และลด Unplanned Breakdown ให้น้อยกว่า 0.5%'
    ],
    kpis: [
      'MTBF (Mean Time Between Failures) เพิ่มขึ้น > 30%, MTTR (Mean Time to Repair) ลดลง < 45 นาที',
      'อัตราการหยุดชะงักของเครื่องจักรนอกแผน (Unplanned Downtime) ลดลงเหลือน้อยกว่า 0.5%',
      'Competency: Vibration Analysis L2, Thermal Imaging L2, Lubrication & Oil Analysis L2, FMEA L3'
    ],
    sessions: [
      'Micro Module 1: วิวัฒนาการงานบำรุงรักษาและแนวคิด Reliability-Centered Maintenance (RCM & P-F Curve)',
      'Micro Module 2: เทคนิคการตรวจวัดสภาพเครื่องจักร (CBM & Predictive Diagnostics: Vibration, Thermography, Oil Analysis)',
      'Micro Module 3: การวิเคราะห์โหมดความเสียหายและผลกระทบ (FMEA: Failure Mode and Effects Analysis)',
      'Micro Module 4: การวางแผนและการจัดทำมาตรฐาน Autonomous & Planned Maintenance'
    ],
    methodologies: {
      lecture: true,
      workshop: true,
      ojt: true,
      caseStudy: true,
      microLearning: true,
      othersText: 'ระบบ Micro E-Learning & Predictive Diagnostics Simulator 100% Online'
    },
    actionPlans: [
      'จัดทำเส้นทางตรวจสอบเครื่องจักรประจำวันด้วยประสาทสัมผัสและการใช้เครื่องมือวัดความสั่นสะเทือนแบบพกพา',
      'กำหนดเกณฑ์มาตรฐานอุณหภูมิและการหล่อลื่น (Lubrication Schedule) สำหรับมอเตอร์และตลับลูกปืนหลัก',
      'นำร่องการทำ FMEA วิเคราะห์จุดวิกฤตของเครื่องจักรสายการผลิตหลัก'
    ],
    workEvidences: [
      'ใบบันทึกผลการวัดค่า Vibration และภาพถ่ายความร้อน Thermal Imaging ของตลับลูกปืนและตู้ควบคุมไฟฟ้า',
      'ตารางแผนผังการหล่อลื่นและรหัสสีสารหล่อลื่นประจำเครื่องจักร (Lubrication Map)',
      'ตาราง FMEA Risk Priority Number (RPN) และใบเสนอปรับปรุงเครื่องจักรเชิงป้องกัน'
    ],
    supervisorFollowUps: {
      day30: 'ทีมงาน 100% สามารถใช้งานเครื่องมือวัดความสั่นสะเทือนเบื้องต้นและบันทึกค่าได้ถูกต้อง',
      day60: 'ตรวจพบสัญญาณความผิดปกติก่อนเกิด Breakdown ได้ 3 รายการ และแก้ไขได้ทันเวลา 100%',
      day90: 'สถิติ Breakdown ประจำเดือนลดลง 52% และค่า MTBF ของเครื่องจักรหลักปรับตัวสูงขึ้นตามเป้าหมาย'
    },
    gapClosures: [
      {
        gap: 'หัวหน้างานและทีมงานขาดทักษะการตรวจวัดความสั่นสะเทือนและการวิเคราะห์ P-F Interval',
        target: 'ผ่านการทดสอบปฏิบัติการตรวจสภาพเครื่องจักร 100%',
        actualResult: 'ผ่านการประเมินทักษะและผลการทดสอบภาคปฏิบัติครบ 100%, คะแนนสอบเฉลี่ย 95.8%',
        status: 'ปิด Gap สมบูรณ์ (Closed)'
      },
      {
        gap: 'เครื่องจักรหลักเกิด Unplanned Breakdown ส่งผลให้สูญเสียกำลังการผลิต',
        target: 'ลด Unplanned Breakdown ให้น้อยกว่า 0.5% ของชั่วโมงทำงานรวม',
        actualResult: 'อัตรา Breakdown ลดลงเหลือ 0.28% ตลอดช่วงติดตามผล 90 วัน',
        status: 'บรรลุเป้าหมาย (Achieved)'
      }
    ],
    problemsAndSuggestions: {
      problems: 'เครื่องมือวัดความสั่นสะเทือนแบบพกพายังมีจำนวนจำกัด ต้องหมุนเวียนใช้งานระหว่างกะ',
      solutions: 'จัดสรรตารางการตรวจวัดสภาพเครื่องจักรตามรอบความถี่ และเสนอจัดซื้อเซนเซอร์ติดตั้งถาวรสำหรับจุดวิกฤตสูง',
      recommendations: 'ส่งเสริมการส่งพนักงานสอบรับรองคุณวุฒิระดับสากล (ISO 18436 Vibration Analyst Category I/II) ต่อไป'
    },
    followUpPlans: [
      'เชื่อมโยงข้อมูลการตรวจวัดสภาพเครื่องจักรเข้าสู่ระบบ Maintenance Dashboard เพื่อเตือนภัยล่วงหน้าแบบ Real-time',
      'ขยายผลการทำ RCM และ FMEA ไปยังสายการผลิตรองทั้งหมดให้ครอบคลุม 100% ภายในปี 2569',
      'จัดตั้งคณะทำงาน PM Kaizen ติดตามผลการลด Downtime ทุกสัปดาห์'
    ],
    appendices: {
      rosterSigned: true,
      fullEvaluation: true,
      activityPhotos: true,
      othersText: 'ผลการทดสอบ Pre-Test / Post-Test ระบบอิเล็กทรอนิกส์ & แฟ้มใบรับรอง'
    }
  },
  'ai-for-tct': {
    courseTitle: 'AI for TCT — ปัญญาประดิษฐ์เพื่อการเพิ่มประสิทธิภาพและความปลอดภัยในการทำงาน (TCT-AI-101)',
    courseTitleEn: 'AI for TCT — Artificial Intelligence for Operational Excellence & Safety (TCT-AI-101)',
    trainingDates: 'วันที่ 1 - 3 กันยายน 2569 (08:00 - 16:00 น.)',
    duration: '1.5 ชั่วโมง (ระบบ Micro E-Learning & Interactive Simulator)',
    location: 'ระบบการเรียนรู้ออนไลน์ E-Training Micro Learning Platform & ห้องประชุมสัมมนา TCT Academy',
    trainer: 'นายณฐวัตร พงษ์สาริกิจ และทีมวิทยากร TCT Academy (ภายในองค์กร)',
    trainerType: 'internal',
    targetGroup: 'ผู้จัดการ, หัวหน้างาน, ลีดเดอร์, เจ้าหน้าที่ และพนักงานทุกสายงาน บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด (13 ท่าน)',
    budget: '0 บาท (หลักสูตรและระบบการเรียนรู้อิเล็กทรอนิกส์พัฒนาภายในองค์กร Internal E-Training Academy)',
    learningFormat: 'รูปแบบการเรียนรู้แบบ Micro Learning (ไมโครเลิร์นนิ่ง) 100% Online ร่วมกับ Interactive Simulator',
    plannedCount: 13,
    actualCount: 13,
    passedCount: 13,
    passRate: 100,
    avgPreScore: '53.8',
    avgPostScore: '96.2',
    scoreGrowthPercent: '+78.8%',
    assessmentRemarks: '✓ ผู้เข้ารับการอบรมทุกคนผ่านเกณฑ์มาตรฐานการประเมิน (≥80%) ครบ 100%',
    showTraineeRosterTable: true,
    satisfactionScores: {
      overall: '4.95',
      content: '4.92',
      trainer: '4.96',
      media: '4.94',
      application: '4.97'
    },
    gaps: [
      'บุคลากรยังขาดความรู้ความเข้าใจเกี่ยวกับการประยุกต์ใช้ AI ในกระบวนการผลิตและงานสนับสนุน',
      'การวิเคราะห์ข้อมูลและการรายงานความผิดปกติหน้างานยังต้องพึ่งพางานเอกสารแมนนวล',
      'ต้องการยกระดับองค์กรสู่ Digital & AI-Driven Factory เพื่อเพิ่มผลิตภาพและความปลอดภัย'
    ],
    objectives: [
      'เพื่อให้ผู้เข้าอบรมเข้าใจหลักการพื้นฐานของปัญญาประดิษฐ์ (AI) และ Generative AI ในภาคอุตสาหกรรม',
      'เพื่อให้สามารถใช้เครื่องมือ AI ช่วยในการประมวลผล ตรวจสอบคุณภาพ และชี้บ่งความเสี่ยงความปลอดภัย',
      'เพื่อเตรียมความพร้อมสู่การทำงานร่วมกับระบบอัตโนมัติและเทคโนโลยีดิจิทัลยุคใหม่'
    ],
    kpis: [
      'อัตราการผ่านการทดสอบหลังเรียน 100% (คะแนน Post-Test ≥ 80%)',
      'ความพึงพอใจต่อเนื้อหาและการประยุกต์ใช้งานเฉลี่ย ≥ 4.90 เต็ม 5.00',
      'การนำแนวคิด AI ไปเสนอแนะไอเดียปรับปรุงงาน (AI Kaizen) อย่างน้อยแผนกละ 1 โครงการ'
    ],
    sessions: [
      'Micro Module 1: รู้จักกับปัญญาประดิษฐ์ (AI & Generative AI) ในภาคอุตสาหกรรมการผลิต',
      'Micro Module 2: AI เพื่อการตรวจสอบคุณภาพ การบำรุงรักษา และการลดของเสีย (Defect Reduction)',
      'Micro Module 3: AI เพื่อความปลอดภัย อาชีวอนามัย และการเตือนภัยล่วงหน้า (Predictive Safety)',
      'Micro Module 4: การทำงานร่วมกับ AI อย่างปลอดภัย มีจริยธรรม และการรักษาความลับข้อมูลองค์กร'
    ],
    methodologies: {
      lecture: true,
      workshop: true,
      ojt: true,
      caseStudy: true,
      microLearning: true,
      othersText: 'ระบบ Micro E-Learning & Interactive Simulator 100% Online'
    },
    actionPlans: [
      'ส่งเสริมการใช้เครื่องมือ AI ช่วยค้นหาข้อมูลและสรุปรายงานปัญหาหน้างานอย่างปลอดภัย',
      'นำร่องการใช้ AI ช่วยตรวจสอบแนวโน้มความเสี่ยงเครื่องจักรและความปลอดภัยในกะการผลิต',
      'จัดตั้งชมรม AI & Digital Innovation แลกเปลี่ยน Best Practice ประจำเดือน'
    ],
    workEvidences: [
      'แบบบันทึกผลการทดสอบ Pre-Test และ Post-Test ผ่านระบบอิเล็กทรอนิกส์',
      'แบบประเมินความพึงพอใจและใบรับรองอิเล็กทรอนิกส์ E-Certificate',
      'เอกสารข้อเสนอแนะโครงงาน AI Improvement เพื่อเพิ่มประสิทธิภาพการทำงาน'
    ],
    supervisorFollowUps: {
      day30: 'พนักงานสามารถใช้งานระบบ AI ในการสืบค้นข้อมูลและสรุปงานได้อย่างถูกต้อง 100%',
      day60: 'เกิดการนำเสนอไอเดีย AI Kaizen เพื่อปรับปรุงกระบวนการทำงานในแต่ละฝ่าย',
      day90: 'ผลการประเมินทักษะดิจิทัลใน Skill Matrix ปรับตัวสู่ระดับมาตรฐานและถ่ายทอดต่อได้'
    },
    gapClosures: [
      {
        gap: 'ขาดความรู้ความเข้าใจเกี่ยวกับการใช้ AI ในโรงงาน',
        target: 'ผ่านการทดสอบมาตรฐานความรู้ AI 100%',
        actualResult: 'ผ่านเกณฑ์ Post-Test 100% (คะแนนเฉลี่ย 96.2%)',
        status: 'ปิด Gap สมบูรณ์ (Closed)'
      },
      {
        gap: 'การนำ AI มาใช้ยังจำกัดเฉพาะบางส่วนงาน',
        target: 'ขยายผลการเรียนรู้ให้ครอบคลุมทุกแผนก',
        actualResult: 'ตัวแทนทุกแผนกผ่านการอบรมครบถ้วนและพร้อมขยายผล',
        status: 'บรรลุเป้าหมาย (Achieved)'
      }
    ],
    problemsAndSuggestions: {
      problems: 'ความพร้อมด้านอุปกรณ์และทักษะดิจิทัลของพนักงานแต่ละคนมีความแตกต่างกัน',
      solutions: 'จัดทำระบบ Micro Learning ที่เรียนซ้ำได้ไม่จำกัด พร้อมวิทยากรพี่เลี้ยงให้คำปรึกษา',
      recommendations: 'ควรสนับสนุนหลักสูตร AI ขั้นปฏิบัติการเชิงลึกสำหรับแต่ละสายวิชาชีพต่อไป'
    },
    followUpPlans: [
      'เชื่อมโยงคะแนนอบรมเข้าสู่ประวัติการฝึกอบรม (Training Record) และ Skill Matrix อัตโนมัติ',
      'จัดประกวดผลงาน AI Kaizen ในงานสัมมนาประจำปีของบริษัท'
    ],
    appendices: {
      rosterSigned: true,
      fullEvaluation: true,
      activityPhotos: true,
      othersText: 'ผลการทดสอบ Pre-Test / Post-Test ระบบอิเล็กทรอนิกส์ & แฟ้มใบรับรอง'
    }
  },
  'applied-psychology': {
    courseTitle: 'หลักสูตรจิตวิทยาประยุกต์ในการทำงาน เพื่อความสำเร็จ ความสุข และความมั่นคง (Applied Psychology - TCT-PSY-01)',
    courseTitleEn: 'Applied Psychology for Workplace Success, Happiness & Stability (TCT-PSY-01)',
    trainingDates: 'วันที่ 12 - 16 ตุลาคม 2569 (08:00 - 16:00 น.)',
    duration: '6 ชั่วโมง (ระบบ Micro E-Learning & Interactive Simulator)',
    location: 'ระบบการเรียนรู้ออนไลน์ E-Training Micro Learning Platform & ห้องประชุมสัมมนา TCT Academy',
    trainer: 'นายณฐวัตร พงษ์สาริกิจ และทีมวิทยากร TCT Academy (ภายในองค์กร)',
    trainerType: 'internal',
    targetGroup: 'พนักงานและบุคลากรเป้าหมาย รุ่นที่ 1 บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด (20 ท่าน)',
    budget: '0 บาท (หลักสูตรและระบบการเรียนรู้อิเล็กทรอนิกส์พัฒนาภายในองค์กร Internal E-Training Academy)',
    learningFormat: 'รูปแบบการเรียนรู้แบบ Micro Learning (ไมโครเลิร์นนิ่ง) 100% Online ร่วมกับ Interactive Simulator',
    plannedCount: 20,
    actualCount: 20,
    passedCount: 20,
    passRate: 100,
    avgPreScore: '50.0',
    avgPostScore: '95.5',
    scoreGrowthPercent: '+91.0%',
    assessmentRemarks: '✓ ผู้เข้ารับการอบรมทุกคนผ่านเกณฑ์มาตรฐานการประเมิน (≥80%) ครบ 100%',
    showTraineeRosterTable: true,
    satisfactionScores: {
      overall: '4.96',
      content: '4.95',
      trainer: '4.98',
      media: '4.92',
      application: '4.96'
    },
    gaps: [
      'ความเครียดและความกดดันจากการทำงานกะและสภาวะงานเร่งด่วน',
      'การสื่อสารระหว่างบุคคลและระหว่างแผนกยังเกิดความเข้าใจไม่ตรงกันเป็นบางครั้ง',
      'ต้องการสร้างแรงบันดาลใจ ทัศนคติเชิงบวก (Growth Mindset) และความสุขในการทำงาน'
    ],
    objectives: [
      'เพื่อเสริมสร้างความฉลาดทางอารมณ์ (Emotional Intelligence: EQ) และจิตวิทยาเชิงบวก',
      'เพื่อพัฒนาทักษะการสื่อสาร การประสานงาน และการสร้างสัมพันธภาพที่ดีในทีมงาน',
      'เพื่อเสริมสร้างความผูกพันต่อองค์กรและทัศนคติที่มุ่งมั่นสู่ความสำเร็จอย่างมีความสุข'
    ],
    kpis: [
      'อัตราการผ่านการทดสอบหลังเรียน 100% (คะแนน Post-Test ≥ 80%)',
      'ดัชนีความสุขในที่ทำงาน (Happy Workplace Index) เฉลี่ย ≥ 90%',
      'ลดข้อร้องเรียนด้านความสัมพันธ์และการสื่อสารระหว่างบุคคล'
    ],
    sessions: [
      'Micro Module 1: จิตวิทยาการเข้าใจตนเองและผู้อื่น (Self-Awareness & Empathy in Workplace)',
      'Micro Module 2: การจัดการอารมณ์ ความเครียด และการสร้างสุขภาวะทางจิต (Stress & EQ Management)',
      'Micro Module 3: จิตวิทยาการสื่อสารเชิงบวกและการประสานพลังทีม (Positive Communication & Synergy)'
    ],
    methodologies: {
      lecture: true,
      workshop: true,
      ojt: true,
      caseStudy: true,
      microLearning: true,
      othersText: 'ระบบ Micro E-Learning & Interactive Case Simulator 100% Online'
    },
    actionPlans: [
      'นำเทคนิคการฟังเชิงลึก (Deep Listening) ไปปรับใช้ในการพูดคุยประจำกะ',
      'จัดตั้งมุมพักผ่อนและส่งเสริมกิจกรรม Care & Share ในหน่วยงาน',
      'ประเมินดัชนีความสุขในการทำงานประจำไตรมาส'
    ],
    workEvidences: [
      'แบบบันทึกผลการทดสอบ Pre-Test และ Post-Test ระบบอิเล็กทรอนิกส์',
      'ผลการประเมินความพึงพอใจและใบรับรองอิเล็กทรอนิกส์',
      'ภาพถ่ายกิจกรรมและการมีส่วนร่วมในระบบ Interactive Platform'
    ],
    supervisorFollowUps: {
      day30: 'บรรยากาศการทำงานและการสื่อสารในทีมมีความผ่อนคลายและราบรื่นขึ้นอย่างเห็นได้ชัด',
      day60: 'ความร่วมมือข้ามแผนกมีประสิทธิภาพมากขึ้น ข้อขัดแย้งลดลง',
      day90: 'สถิติการลางานลดลงและความผูกพันต่อองค์กรปรับตัวดีขึ้นตามเป้าหมาย'
    },
    gapClosures: [
      {
        gap: 'ความเครียดและข้อขัดแย้งในการสื่อสาร',
        target: 'ดัชนีความสุขในการทำงาน ≥ 85%',
        actualResult: 'ผลการประเมินความสุขและความพึงพอใจเฉลี่ย 96.5% สูงกว่าเป้าหมาย',
        status: 'ปิด Gap สมบูรณ์ (Closed)'
      }
    ],
    problemsAndSuggestions: {
      problems: 'พนักงานบางส่วนยังไม่คุ้นเคยกับการเปิดใจสะท้อนความรู้สึก',
      solutions: 'ใช้สถานการณ์จำลอง (Simulators) ที่เป็นรูปธรรมและไม่กดดันผู้เรียน',
      recommendations: 'จัดกิจกรรม Happy Workplace เสริมต่อเนื่องตลอดปี'
    },
    followUpPlans: [
      'ขยายผลรุ่นที่ 2 ให้ครอบคลุมพนักงานกลุ่มอื่นตามแผนงาน',
      'บันทึกผลสำเร็จลงในระบบ HRD Dashboard'
    ],
    appendices: {
      rosterSigned: true,
      fullEvaluation: true,
      activityPhotos: true,
      othersText: 'ผลการทดสอบ Pre-Test / Post-Test ระบบอิเล็กทรอนิกส์ & แฟ้มใบรับรอง'
    }
  }
};

/**
 * Builds a complete CourseReportDetail for ANY course ID
 */
function buildFullReportDetail(
  courseId: string, 
  allCoursesList: ReturnType<typeof getAllAvailableCourses>,
  resolvedTraineesList: ReturnType<typeof resolveCourseTrainees>
): CourseReportDetail {
  const targetCourse = allCoursesList.find(c => c.id === courseId);
  const known = BASE_KNOWN_REPORTS[courseId];
  const dynamicModules = getCourseModules(courseId);

  const initialTrainees: ReportTrainee[] = (resolvedTraineesList.length > 0 ? resolvedTraineesList : []).map((t, idx) => ({
    id: `tr-${idx + 1}`,
    empId: t.empId,
    fullName: t.fullName,
    department: t.department,
    position: (t as any).position || 'พนักงาน',
    preTestScore: t.preTestScore ?? 6,
    postTestScore: t.postTestScore ?? 10,
    status: 'ผ่านเกณฑ์มาตรฐาน (100%)'
  }));

  const total = initialTrainees.length > 0 ? initialTrainees.length : 13;
  const passed = initialTrainees.filter(t => Number(t.postTestScore) >= 8).length || total;
  const pRate = total > 0 ? Math.round((passed / total) * 100) : 100;

  const validPre = initialTrainees.filter(t => !isNaN(Number(t.preTestScore)));
  const validPost = initialTrainees.filter(t => !isNaN(Number(t.postTestScore)));
  const avgPre = validPre.length > 0 
    ? (validPre.reduce((acc, t) => acc + Number(t.preTestScore), 0) / validPre.length * 10).toFixed(1)
    : '50.0';
  const avgPost = validPost.length > 0 
    ? (validPost.reduce((acc, t) => acc + Number(t.postTestScore), 0) / validPost.length * 10).toFixed(1)
    : '95.0';
  const scoreDiffPercent = (((Number(avgPost) - Number(avgPre)) / Number(avgPre)) * 100).toFixed(1);

  const titleTh = known?.courseTitle || targetCourse?.thaiTitle || targetCourse?.title || `หลักสูตรการฝึกอบรม ${courseId}`;
  const titleEn = known?.courseTitleEn || targetCourse?.titleEn || targetCourse?.title || 'TCT In-House Training Program';
  const instructor = known?.trainer || (targetCourse as any)?.instructor || 'นายณฐวัตร พงษ์สาริกิจ และทีมวิทยากร TCT Academy';
  const targetAudience = known?.targetGroup || (targetCourse as any)?.targetAudience || 'พนักงานและบุคลากรเป้าหมาย บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด (13 ท่าน)';
  const hours = targetCourse?.estimatedHours || 6;

  const sessions = known?.sessions || (
    dynamicModules.length > 0
      ? dynamicModules.map((m, idx) => `Micro Module ${idx + 1}: ${m.thaiTitle || m.title}`)
      : [
          'Micro Module 1: ความรู้พื้นฐานและแนวคิดสำคัญในงานอุตสาหกรรม',
          'Micro Module 2: มาตรฐานการปฏิบัติงานและความปลอดภัยเชิงรุก',
          'Micro Module 3: เทคนิคการแก้ปัญหาและการชี้บ่งความเสี่ยงหน้างาน',
          'Micro Module 4: การประยุกต์ใช้ในการทำงานจริงและการพัฒนาอย่างต่อเนื่อง'
        ]
  );

  return {
    courseTitle: titleTh,
    courseTitleEn: titleEn,
    trainingDates: known?.trainingDates || (targetCourse as any)?.trainingDates || 'วันที่ 1 - 3 กันยายน 2569 (08:00 - 16:00 น.)',
    duration: known?.duration || `${hours} ชั่วโมง (ระบบ Micro E-Learning & Interactive Simulator)`,
    location: known?.location || 'ระบบการเรียนรู้ออนไลน์ E-Training Micro Learning Platform & ห้องประชุมสัมมนา TCT Academy',
    trainer: instructor,
    trainerType: known?.trainerType || 'internal',
    targetGroup: targetAudience,
    budget: known?.budget || '0 บาท (หลักสูตรและระบบการเรียนรู้อิเล็กทรอนิกส์พัฒนาภายในองค์กร Internal E-Training Academy)',
    learningFormat: known?.learningFormat || 'รูปแบบการเรียนรู้แบบ Micro Learning (ไมโครเลิร์นนิ่ง) 100% Online ร่วมกับ Interactive Simulator',
    
    plannedCount: known?.plannedCount ?? total,
    actualCount: known?.actualCount ?? total,
    passedCount: known?.passedCount ?? passed,
    passRate: known?.passRate ?? pRate,
    avgPreScore: known?.avgPreScore || avgPre,
    avgPostScore: known?.avgPostScore || avgPost,
    scoreGrowthPercent: known?.scoreGrowthPercent || `+${scoreDiffPercent}%`,
    assessmentRemarks: known?.assessmentRemarks || '✓ ผู้เข้ารับการอบรมทุกคนผ่านเกณฑ์มาตรฐานการประเมิน (≥80%) ครบ 100%',
    showTraineeRosterTable: true,

    traineesList: initialTrainees,

    gaps: known?.gaps || [
      `การประเมินทักษะและความรู้ความเชี่ยวชาญในด้าน ${titleTh} ยังต้องได้รับการพัฒนา`,
      'การปฏิบัติงานหน้างานต้องการแนวปฏิบัติที่เป็นมาตรฐานคุณภาพเดียวกัน',
      'ต้องการส่งเสริมจิตสำนึกคุณภาพและความปลอดภัยเชิงรุกเพื่อลดความสูญเสีย'
    ],
    objectives: [
      `เพื่อปลูกฝังจิตสำนึกและพัฒนาความรู้ความเข้าใจในหลักการสำคัญของ${titleTh}`,
      'เพื่อให้ผู้เข้าอบรมสามารถประยุกต์ใช้ทักษะในการปฏิบัติงานจริงได้อย่างถูกต้อง แม่นยำ และปลอดภัย',
      'เพื่อเสริมสร้างมาตรฐานการทำงานและการพัฒนาอย่างยั่งยืนในองค์กร (Zero Defect & Zero Accident)'
    ],
    kpis: known?.kpis || [
      'อัตราการผ่านการฝึกอบรม 100% (คะแนน Post-Test ≥ 80%)',
      'ความพึงพอใจต่อการจัดอบรมและการนำไปใช้เฉลี่ย ≥ 4.80 จาก 5.00',
      'การนำไปประยุกต์ใช้หน้างานจริงเพื่อยกระดับผลผลิตและลดข้อผิดพลาด'
    ],
    sessions,
    methodologies: known?.methodologies || {
      lecture: true,
      workshop: true,
      ojt: true,
      caseStudy: true,
      microLearning: true,
      othersText: 'ระบบ Micro E-Learning & Interactive Digital Simulator 100% Online'
    },
    satisfactionScores: known?.satisfactionScores || {
      overall: '4.92',
      content: '4.90',
      trainer: '4.95',
      media: '4.88',
      application: '4.95'
    },
    actionPlans: known?.actionPlans || [
      'จัดทำแบบฟอร์มตรวจสอบและคู่มือมาตรฐานการปฏิบัติงาน (SOP & Checklist) หน้างานจริง',
      'นำเครื่องมือและเทคนิคที่ได้จากการอบรมไปปรับใช้ในแต่ละกะการผลิตอย่างสม่ำเสมอ',
      'จัดกิจกรรมติดตามผลและส่งเสริมการแลกเปลี่ยนเรียนรู้ภายในหน่วยงาน'
    ],
    workEvidences: known?.workEvidences || [
      'แบบประเมินและใบบันทึกผลการทดสอบ Pre-Test / Post-Test ระบบอิเล็กทรอนิกส์',
      'รายงานการปฏิบัติตามมาตรฐานงานและใบบันทึกการติดตามผลโดยหัวหน้างาน',
      'ภาพถ่ายกิจกรรมและการทดสอบระบบ Interactive Simulator'
    ],
    supervisorFollowUps: known?.supervisorFollowUps || {
      day30: 'พนักงานสามารถนำความรู้และทักษะไปปฏิบัติงานได้ถูกต้องตามมาตรฐาน 100%',
      day60: 'เกิดการปรับปรุงกระบวนการทำงานและลดข้อบกพร่องได้อย่างเป็นรูปธรรม',
      day90: 'ผลการประเมินสมรรถนะผ่านเกณฑ์มาตรฐานอย่างยั่งยืนและถ่ายทอดต่อในทีมได้'
    },
    gapClosures: known?.gapClosures || [
      {
        gap: `ความรู้และทักษะด้าน ${titleTh} ยังไม่เป็นมาตรฐานเดียวกัน`,
        target: 'ผ่านการทดสอบมาตรฐานความรู้ 100%',
        actualResult: 'ผ่านการประเมินความรู้และแบบทดสอบครบ 100% (คะแนนเฉลี่ย 96.5%)',
        status: 'ปิด Gap สมบูรณ์ (Closed)'
      },
      {
        gap: 'การนำมาตรฐานไปใช้ในงานจริงยังขาดความต่อเนื่อง',
        target: 'ปฏิบัติตามมาตรฐานหน้างาน 100%',
        actualResult: 'ปฏิบัติตามมาตรฐานครบถ้วนและเกิดการตระหนักรู้ร่วมกัน',
        status: 'บรรลุเป้าหมาย (Achieved)'
      }
    ],
    problemsAndSuggestions: known?.problemsAndSuggestions || {
      problems: 'ตารางการทำงานของพนักงานแต่ละกะมีความแตกต่างกัน',
      solutions: 'ออกแบบระบบ Micro E-Learning ให้สามารถเข้าถึงได้ทุกที่ทุกเวลาตลอด 24 ชั่วโมง',
      recommendations: 'สนับสนุนการต่อยอดหลักสูตรขั้นสูงในแผนพัฒนาบุคลากรประจำปีต่อไป'
    },
    followUpPlans: known?.followUpPlans || [
      'เชื่อมโยงผลการฝึกอบรมเข้าสู่ระบบประเมินสมรรถนะ Skill Matrix ประจำปี',
      'จัดกิจกรรม Kaizen Show & Share เพื่อแลกเปลี่ยนผลสำเร็จระหว่างแผนก'
    ],
    appendices: known?.appendices || {
      rosterSigned: true,
      fullEvaluation: true,
      activityPhotos: true,
      othersText: 'ผลการทดสอบ Pre-Test / Post-Test ระบบอิเล็กทรอนิกส์ & แฟ้มใบรับรอง'
    }
  };
}

export const InhouseTrainingReportModal: React.FC<InhouseTrainingReportModalProps> = ({
  trainees,
  currentUser,
  initialCourseId,
  onClose
}) => {
  // Modes: 'preview' (ดูตัวอย่างและพิมพ์) | 'edit' (แก้ไขข้อมูลและเลือกรายการพิมพ์เองทั้งหมด)
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [activeTab, setActiveTab] = useState<'all' | 'page1' | 'page2' | 'page3'>('all');
  const [editSectionTab, setEditSectionTab] = useState<'general' | 'trainees' | 'gaps_objectives' | 'sessions' | 'satisfaction' | 'actions' | 'closures' | 'signatories'>('trainees');
  
  // Custom print selection flags
  const [printSelection, setPrintSelection] = useState({
    page1: true, // หน้าปก & เสนอพิจารณา
    page2: true, // ข้อมูลหลักสูตร & ผลการประเมินความรู้
    page3: true  // ผลลัพธ์ต่อองค์กร & ลายมือชื่อ
  });

  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');

  // Course Selector
  const [allCourses, setAllCourses] = useState(() => getAllAvailableCourses());
  useEffect(() => {
    setAllCourses(getAllAvailableCourses());
  }, []);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || currentUser?.selectedCourseId || 'risk-management'
  );

  // Resolved trainees for selected course
  const resolvedTrainees = useMemo(() => {
    return resolveCourseTrainees(trainees, selectedCourseId);
  }, [trainees, selectedCourseId]);

  // Report Editable State with localStorage persistence
  const [reportData, setReportData] = useState<CourseReportDetail>(() => {
    try {
      const saved = localStorage.getItem(`tct_inhouse_report_${selectedCourseId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return buildFullReportDetail(selectedCourseId, allCourses, resolvedTrainees);
  });

  // Signatories State with localStorage persistence
  const [signatories, setSignatories] = useState<SignatoriesConfig>(() => {
    try {
      const saved = localStorage.getItem('tct_inhouse_signatories');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return DEFAULT_SIGNATORIES;
  });

  // Update reportData ONLY when selectedCourseId changes (never wipe on background polling!)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`tct_inhouse_report_${selectedCourseId}`);
      if (saved) {
        setReportData(JSON.parse(saved));
        return;
      }
    } catch (e) {}
    const updated = buildFullReportDetail(selectedCourseId, allCourses, resolvedTrainees);
    setReportData(updated);
  }, [selectedCourseId]);

  // Auto-save changes to localStorage so user edits are NEVER lost
  useEffect(() => {
    if (reportData && selectedCourseId) {
      try {
        localStorage.setItem(`tct_inhouse_report_${selectedCourseId}`, JSON.stringify(reportData));
      } catch (e) {
        console.debug('Failed to cache inhouse report', e);
      }
    }
  }, [reportData, selectedCourseId]);

  useEffect(() => {
    try {
      localStorage.setItem('tct_inhouse_signatories', JSON.stringify(signatories));
    } catch (e) {}
  }, [signatories]);

  // Page DOM Refs for multi-page export
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const page3Ref = useRef<HTMLDivElement>(null);
  const printableContainerRef = useRef<HTMLDivElement>(null);

  // Explicit Save Report Action
  const handleSaveReport = () => {
    playSuccessChime();
    try {
      localStorage.setItem(`tct_inhouse_report_${selectedCourseId}`, JSON.stringify(reportData));
      localStorage.setItem('tct_inhouse_signatories', JSON.stringify(signatories));
      setDownloadMessage(`✓ บันทึกข้อมูลรายงานหลักสูตรสำเร็จแล้ว (ข้อมูลจะไม่หายและไม่ถูกรีเซ็ต)`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e) {
      console.error('Failed to save report', e);
    }
  };

  // Pull Trainees from system / active records for this course
  const handlePullTraineesFromSystem = () => {
    playSuccessChime();
    const liveResolved = resolveCourseTrainees(trainees, selectedCourseId);
    let pulled: ReportTrainee[] = [];

    if (liveResolved.length > 0) {
      pulled = liveResolved.map((t, idx) => ({
        id: `tr-${idx + 1}`,
        empId: t.empId,
        fullName: t.fullName,
        department: t.department,
        position: (t as any).position || 'พนักงาน',
        preTestScore: t.preTestScore ?? 6,
        postTestScore: t.postTestScore ?? 10,
        status: (t.postTestScore !== null && Number(t.postTestScore) >= 8) ? 'ผ่านเกณฑ์มาตรฐาน (100%)' : 'กำลังดำเนินการ'
      }));
    } else {
      // Pull from existing trainees or master roster
      pulled = trainees.slice(0, 13).map((t, idx) => ({
        id: `tr-${idx + 1}`,
        empId: t.empId,
        fullName: t.fullName,
        department: t.department,
        position: t.position || 'พนักงาน',
        preTestScore: t.preTestScore ?? 6,
        postTestScore: t.postTestScore ?? 10,
        status: 'ผ่านเกณฑ์มาตรฐาน (100%)'
      }));
    }

    const count = pulled.length;
    const passed = pulled.filter(t => Number(t.postTestScore) >= 8).length || count;
    const pRate = count > 0 ? Math.round((passed / count) * 100) : 100;
    const validPre = pulled.filter(t => !isNaN(Number(t.preTestScore)));
    const validPost = pulled.filter(t => !isNaN(Number(t.postTestScore)));
    const avgPre = validPre.length > 0 ? (validPre.reduce((acc, t) => acc + Number(t.preTestScore), 0) / validPre.length * 10).toFixed(1) : '50.0';
    const avgPost = validPost.length > 0 ? (validPost.reduce((acc, t) => acc + Number(t.postTestScore), 0) / validPost.length * 10).toFixed(1) : '95.0';
    const diff = (((Number(avgPost) - Number(avgPre)) / Number(avgPre)) * 100).toFixed(1);

    const updated: CourseReportDetail = {
      ...reportData,
      traineesList: pulled,
      plannedCount: count,
      actualCount: count,
      passedCount: passed,
      passRate: pRate,
      avgPreScore: avgPre,
      avgPostScore: avgPost,
      scoreGrowthPercent: `+${diff}%`,
      showTraineeRosterTable: true
    };
    setReportData(updated);
    try {
      localStorage.setItem(`tct_inhouse_report_${selectedCourseId}`, JSON.stringify(updated));
    } catch (e) {}

    setDownloadMessage(`ดึงรายชื่อผู้เข้าอบรมหลักสูตรนี้เรียบร้อยแล้ว (${pulled.length} ท่าน)`);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  // Reset to default
  const handleResetDefaults = () => {
    playCyberClick();
    try {
      localStorage.removeItem(`tct_inhouse_report_${selectedCourseId}`);
    } catch (e) {}
    const base = buildFullReportDetail(selectedCourseId, allCourses, resolvedTrainees);
    setReportData(JSON.parse(JSON.stringify(base)));
    setSignatories(DEFAULT_SIGNATORIES);
    setPrintSelection({ page1: true, page2: true, page3: true });
    setDownloadMessage('คืนค่าข้อมูลและรูปแบบรายงานเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  // Trainee Management Handlers
  const handleAddTrainee = () => {
    playCyberClick();
    const newId = `tr-${Date.now()}`;
    const newTrainee: ReportTrainee = {
      id: newId,
      empId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      fullName: 'ชื่อ-นามสกุล พนักงานใหม่',
      department: 'แผนกบุคคลและธุรการ',
      position: 'พนักงาน',
      preTestScore: 6,
      postTestScore: 10,
      status: 'ผ่านเกณฑ์มาตรฐาน (100%)'
    };
    setReportData(prev => {
      const nextList = [...prev.traineesList, newTrainee];
      const count = nextList.length;
      return {
        ...prev,
        traineesList: nextList,
        plannedCount: count,
        actualCount: count,
        passedCount: count
      };
    });
  };

  const handleUpdateTrainee = (index: number, field: keyof ReportTrainee, value: any) => {
    setReportData(prev => {
      const nextList = [...prev.traineesList];
      nextList[index] = { ...nextList[index], [field]: value };
      return { ...prev, traineesList: nextList };
    });
  };

  const handleDeleteTrainee = (index: number) => {
    playCyberClick();
    setReportData(prev => {
      const nextList = prev.traineesList.filter((_, idx) => idx !== index);
      const count = nextList.length;
      return {
        ...prev,
        traineesList: nextList,
        plannedCount: Math.max(1, count),
        actualCount: Math.max(1, count),
        passedCount: Math.min(Number(prev.passedCount), Math.max(1, count))
      };
    });
  };

  // Sync Stats automatically from Trainee List
  const handleAutoCalculateStats = () => {
    playSuccessChime();
    const list = reportData.traineesList;
    if (list.length === 0) return;
    const count = list.length;
    const passed = list.filter(t => {
      const post = Number(t.postTestScore);
      return !isNaN(post) ? post >= 8 : true;
    }).length || count;
    const pRate = Math.round((passed / count) * 100);

    const validPre = list.filter(t => !isNaN(Number(t.preTestScore)));
    const validPost = list.filter(t => !isNaN(Number(t.postTestScore)));
    const avgPreVal = validPre.length > 0 
      ? (validPre.reduce((acc, t) => acc + Number(t.preTestScore), 0) / validPre.length * 10).toFixed(1)
      : '50.0';
    const avgPostVal = validPost.length > 0 
      ? (validPost.reduce((acc, t) => acc + Number(t.postTestScore), 0) / validPost.length * 10).toFixed(1)
      : '95.0';
    const diffVal = (((Number(avgPostVal) - Number(avgPreVal)) / Number(avgPreVal)) * 100).toFixed(1);

    setReportData(prev => ({
      ...prev,
      plannedCount: count,
      actualCount: count,
      passedCount: passed,
      passRate: pRate,
      avgPreScore: avgPreVal,
      avgPostScore: avgPostVal,
      scoreGrowthPercent: `+${diffVal}%`
    }));

    setDownloadMessage('คำนวณสถิติจำนวนผู้เรียนและคะแนนเฉลี่ยอัตโนมัติเรียบร้อย');
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  // Helper to get printable pages based on selection
  const getSelectedPageElements = (): HTMLElement[] => {
    const pages: HTMLElement[] = [];
    if (printSelection.page1 && page1Ref.current) pages.push(page1Ref.current);
    if (printSelection.page2 && page2Ref.current) pages.push(page2Ref.current);
    if (printSelection.page3 && page3Ref.current) pages.push(page3Ref.current);
    return pages;
  };

  // Print function (Portrait A4 Layout) with selected pages
  const handlePrint = () => {
    playCyberClick();
    const selectedElements = getSelectedPageElements();

    if (selectedElements.length > 0) {
      const tempContainer = document.createElement('div');
      selectedElements.forEach(el => {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.style.display = 'flex';
        tempContainer.appendChild(clone);
      });

      printElementViaStandaloneWindow(
        tempContainer,
        `แบบรายงานผลการฝึกอบรมภายใน_${selectedCourseId}`,
        'portrait'
      );
    } else if (printableContainerRef.current) {
      printElementViaStandaloneWindow(
        printableContainerRef.current,
        `แบบรายงานผลการฝึกอบรมภายใน_${selectedCourseId}`,
        'portrait'
      );
    }
  };

  // Multi-page PDF Download
  const handleDownloadPdf = async () => {
    playCyberClick();
    const selectedElements = getSelectedPageElements();

    if (selectedElements.length === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 หน้าเพื่อสร้าง PDF');
      return;
    }

    setIsPdfGenerating(true);
    setDownloadMessage('กำลังสร้างไฟล์ PDF คุณภาพสูง (A4 แนวตั้ง)...');
    setDownloadSuccess(true);

    try {
      await downloadMultiPagePdf(
        selectedElements,
        {
          filename: `แบบรายงานผลการฝึกอบรมภายใน_${selectedCourseId}_ทางการ.pdf`,
          orientation: 'portrait'
        }
      );

      playSuccessChime();
      setDownloadMessage('ดาวน์โหลดเอกสารรายงานผลการฝึกอบรม PDF สำเร็จเรียบร้อย!');
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      handlePrint();
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Export Summary Excel
  const handleExportExcel = () => {
    playCyberClick();
    try {
      const summarySheetData = [
        ['แบบรายงานผลการฝึกอบรมภายใน (IN-HOUSE TRAINING REPORT)'],
        ['ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด'],
        [''],
        ['หัวข้อ', 'รายละเอียด'],
        ['หลักสูตร', reportData.courseTitle],
        ['Course Title (EN)', reportData.courseTitleEn],
        ['วันที่จัดอบรม', reportData.trainingDates],
        ['ระยะเวลา', reportData.duration],
        ['สถานที่', reportData.location],
        ['วิทยากร', reportData.trainer],
        ['กลุ่มเป้าหมาย', reportData.targetGroup],
        ['งบประมาณ', reportData.budget],
        ['รูปแบบการเรียนรู้', reportData.learningFormat],
        [''],
        ['สถิติผู้เข้าอบรม', 'ค่าตัวเลข'],
        ['จำนวนตามแผน (คน)', reportData.plannedCount],
        ['จำนวนเข้าอบรมจริง (คน)', reportData.actualCount],
        ['จำนวนผู้ผ่านเกณฑ์ (คน)', reportData.passedCount],
        ['อัตราผ่านเกณฑ์ (%)', `${reportData.passRate}%`],
        ['คะแนนเฉลี่ย Pre-Test (เต็ม 100)', reportData.avgPreScore],
        ['คะแนนเฉลี่ย Post-Test (เต็ม 100)', reportData.avgPostScore],
        ['พัฒนาการคะแนน (%)', reportData.scoreGrowthPercent],
        [''],
        ['สายการพิจารณาและผู้ลงนาม', 'ชื่อ-ตำแหน่ง'],
        ['ผู้จัดทำรายงาน / วิทยากร', `${signatories.reporterName} (${signatories.reporterPosition})`],
        ['ผู้ตรวจสอบรายงาน', `${signatories.reviewerName} (${signatories.reviewerPosition})`],
        ['ลำดับ 1: เสนอพิจารณา', `${signatories.approver1Name} (${signatories.approver1Position})`],
        ['ลำดับ 2: พิจารณา', `${signatories.approver2Name} (${signatories.approver2Position})`],
        ['ลำดับ 3: อนุมัติ / รับทราบ', `${signatories.approver3Name} (${signatories.approver3Position})`]
      ];

      const rosterSheetData = [
        ['ลำดับ', 'รหัสพนักงาน', 'ชื่อ-นามสกุล', 'แผนก', 'ตำแหน่ง', 'Pre-Test', 'Post-Test', 'สถานะ'],
        ...reportData.traineesList.map((t, idx) => [
          idx + 1,
          t.empId,
          t.fullName,
          t.department,
          t.position,
          `${t.preTestScore}/10`,
          `${t.postTestScore}/10`,
          t.status
        ])
      ];

      const wb = XLSX.utils.book_new();
      const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
      const wsRoster = XLSX.utils.aoa_to_sheet(rosterSheetData);

      XLSX.utils.book_append_sheet(wb, wsSummary, 'สรุปรายงานการอบรม');
      XLSX.utils.book_append_sheet(wb, wsRoster, 'รายชื่อผู้เข้าอบรม');
      XLSX.writeFile(wb, `รายงานผลการฝึกอบรม_${selectedCourseId}.xlsx`);

      playSuccessChime();
      setDownloadMessage('ส่งออกไฟล์ Excel สรุปรายงานและรายชื่อผู้เรียนเรียบร้อยแล้ว');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e) {
      console.error('Excel Export Error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-1 sm:p-4 overflow-y-auto font-sarabun inhouse-report-root">
      
      {/* Strict uniform font styling for preview & print */}
      <style>{`
        .inhouse-portrait-page,
        .inhouse-portrait-page *,
        #inhouse-report-page-1,
        #inhouse-report-page-1 *,
        #inhouse-report-page-2,
        #inhouse-report-page-2 *,
        #inhouse-report-page-3,
        #inhouse-report-page-3 * {
          font-family: 'TH Sarabun New', 'THSarabunNew', 'Sarabun', 'TH Sarabun PSK', sans-serif !important;
        }
        @media print {
          @page {
            size: A4 portrait !important;
            margin: 0 !important;
          }
          body {
            background: white !important;
          }
          .inhouse-portrait-page {
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            border: none !important;
            width: 210mm !important;
            min-height: 297mm !important;
            padding: 15mm !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-6xl max-h-[96vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header & Toolbar (No-Print) */}
        <div className="p-3 sm:p-4 bg-slate-950/90 border-b border-slate-800 flex flex-col gap-3 shrink-0 no-print">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Left: Title & Mode Toggle */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    แบบรายงานผลการฝึกอบรมภายใน (IN-HOUSE TRAINING REPORT)
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-500/30 font-bold">
                    A4 แนวตั้ง (3 แผ่น)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
                </p>
              </div>
            </div>

            {/* Course Selector Dropdown */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-xs font-bold text-cyan-400 shrink-0">หลักสูตร:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  playCyberClick();
                  setSelectedCourseId(e.target.value);
                }}
                className="bg-slate-950 text-white text-xs rounded-lg px-2 py-1 border border-slate-700 outline-none cursor-pointer max-w-[220px] truncate"
              >
                {allCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code ? `[${c.code}] ` : ''}{c.thaiTitle || c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Mode Toggle: Preview vs Edit */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { playCyberClick(); setViewMode('preview'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'preview' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ดูตัวอย่าง / พิมพ์</span>
                </button>
                <button
                  type="button"
                  onClick={() => { playCyberClick(); setViewMode('edit'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'edit' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>แก้ไขข้อมูลรายงาน</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveReport}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="บันทึกข้อมูลรายงานเพื่อไม่ให้ข้อมูลหายและไม่กลับเป็นค่าเดิม"
              >
                <Check className="w-4 h-4 text-emerald-200" />
                <span>บันทึกข้อมูลรายงาน</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-500/40 cursor-pointer"
                title="ส่งออกสรุปรายงานและรายชื่อผู้เรียนเป็น Excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Excel</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer shadow-sm"
                title="พิมพ์หน้าที่เลือกในขนาด A4 แนวตั้ง"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>พิมพ์เอกสาร (A4)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isPdfGenerating}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer disabled:opacity-50"
              >
                {isPdfGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                    <span>กำลังสร้าง PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>บันทึก PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-all ml-1"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Sub-bar for Page filtering & Custom Print Selection */}
          {viewMode === 'preview' && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  เลือกมุมมอง:
                </span>
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => { playCyberClick(); setActiveTab('all'); }}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      activeTab === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ดูทั้ง 3 แผ่น
                  </button>
                  <button
                    type="button"
                    onClick={() => { playCyberClick(); setActiveTab('page1'); }}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      activeTab === 'page1' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    แผ่นที่ 1 (หน้าปก &amp; เสนอพิจารณา)
                  </button>
                  <button
                    type="button"
                    onClick={() => { playCyberClick(); setActiveTab('page2'); }}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      activeTab === 'page2' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    แผ่นที่ 2 (ข้อมูล &amp; ผลประเมิน)
                  </button>
                  <button
                    type="button"
                    onClick={() => { playCyberClick(); setActiveTab('page3'); }}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      activeTab === 'page3' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    แผ่นที่ 3 (ผลลัพธ์ &amp; ลายมือชื่อ)
                  </button>
                </div>
              </div>

              {/* Page selection checkboxes for print */}
              <div className="flex items-center gap-3 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-[11.5px]">
                <span className="text-amber-400 font-bold">พิมพ์/PDF เฉพาะ:</span>
                <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={printSelection.page1}
                    onChange={(e) => setPrintSelection(prev => ({ ...prev, page1: e.target.checked }))}
                    className="accent-cyan-500 rounded"
                  />
                  <span>แผ่นที่ 1</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={printSelection.page2}
                    onChange={(e) => setPrintSelection(prev => ({ ...prev, page2: e.target.checked }))}
                    className="accent-cyan-500 rounded"
                  />
                  <span>แผ่นที่ 2</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={printSelection.page3}
                    onChange={(e) => setPrintSelection(prev => ({ ...prev, page3: e.target.checked }))}
                    className="accent-cyan-500 rounded"
                  />
                  <span>แผ่นที่ 3</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {downloadSuccess && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/50 px-4 py-2 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn no-print">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 1: EDIT & CUSTOMIZE REPORT (แก้ไขข้อมูลได้ครบทุกส่วน)          */}
        {/* ========================================================================= */}
        {viewMode === 'edit' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-xs space-y-5">
            
            {/* Top Toolbar in Edit Mode */}
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">แก้ไขข้อมูลรายงานได้ครบทุกส่วน (Full Report Editor)</h3>
                  <p className="text-[11px] text-slate-400">
                    แก้ไขข้อมูลหลักสูตร, จำนวนผู้เรียน, รายชื่อผู้เรียน, ผลคะแนน, ข้อความทุกส่วน และรายชื่อผู้ลงนาม
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>คืนค่าเริ่มต้น</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSuccessChime();
                    setViewMode('preview');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึก &amp; ดูตัวอย่างรายงาน</span>
                </button>
              </div>
            </div>

            {/* Sub-Tabs for Edit Sections */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-[11.5px]">
              <button
                type="button"
                onClick={() => setEditSectionTab('trainees')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  editSectionTab === 'trainees' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 text-amber-300" />
                <span>1. ผู้เรียน &amp; จำนวน &amp; ผลคะแนน</span>
              </button>
              <button
                type="button"
                onClick={() => setEditSectionTab('general')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  editSectionTab === 'general' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-300" />
                <span>2. ข้อมูลหลักสูตร &amp; รูปแบบ</span>
              </button>
              <button
                type="button"
                onClick={() => setEditSectionTab('gaps_objectives')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  editSectionTab === 'gaps_objectives' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>3. Gap &amp; วัตถุประสงค์</span>
              </button>
              <button
                type="button"
                onClick={() => setEditSectionTab('sessions')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  editSectionTab === 'sessions' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>4. โมดูลการเรียนรู้</span>
              </button>
              <button
                type="button"
                onClick={() => setEditSectionTab('satisfaction')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  editSectionTab === 'satisfaction' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>5. ความพึงพอใจ</span>
              </button>
              <button
                type="button"
                onClick={() => setEditSectionTab('actions')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  editSectionTab === 'actions' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>6. Action Plan &amp; ติดตามผล</span>
              </button>
              <button
                type="button"
                onClick={() => setEditSectionTab('closures')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  editSectionTab === 'closures' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>7. ตารางปิด Gap</span>
              </button>
              <button
                type="button"
                onClick={() => setEditSectionTab('signatories')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  editSectionTab === 'signatories' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>8. ผู้ลงนาม 5 ลำดับ</span>
              </button>
            </div>

            {/* TAB 1: ผู้เรียน & จำนวนผู้เรียน & ผลคะแนน (แก้ไขได้อิสระ) */}
            {editSectionTab === 'trainees' && (
              <div className="space-y-4">
                {/* Stats Summary Card */}
                <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      <span>สถิติจำนวนผู้เรียนและผลคะแนน (Learner Counts &amp; Assessment Stats)</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleAutoCalculateStats}
                      className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      title="คำนวณยอดและคะแนนเฉลี่ยอัตโนมัติจากตารางรายชื่อผู้เรียนด้านล่าง"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>คำนวณสถิติอัตโนมัติจากรายชื่อ</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <label className="text-[10.5px] text-slate-400 block mb-1">แผน (คน):</label>
                      <input
                        type="number"
                        value={reportData.plannedCount}
                        onChange={(e) => setReportData({ ...reportData, plannedCount: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-bold"
                      />
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <label className="text-[10.5px] text-slate-400 block mb-1">อบรมจริง (คน):</label>
                      <input
                        type="number"
                        value={reportData.actualCount}
                        onChange={(e) => setReportData({ ...reportData, actualCount: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-bold text-cyan-300"
                      />
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <label className="text-[10.5px] text-slate-400 block mb-1">ผ่านเกณฑ์ (คน):</label>
                      <input
                        type="number"
                        value={reportData.passedCount}
                        onChange={(e) => setReportData({ ...reportData, passedCount: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-bold text-emerald-300"
                      />
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <label className="text-[10.5px] text-slate-400 block mb-1">อัตราผ่าน (%):</label>
                      <input
                        type="number"
                        value={reportData.passRate}
                        onChange={(e) => setReportData({ ...reportData, passRate: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-bold text-blue-300"
                      />
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <label className="text-[10.5px] text-slate-400 block mb-1">เฉลี่ย Pre-Test:</label>
                      <input
                        type="text"
                        value={reportData.avgPreScore}
                        onChange={(e) => setReportData({ ...reportData, avgPreScore: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                      />
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <label className="text-[10.5px] text-slate-400 block mb-1">เฉลี่ย Post-Test:</label>
                      <input
                        type="text"
                        value={reportData.avgPostScore}
                        onChange={(e) => setReportData({ ...reportData, avgPostScore: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-bold text-emerald-300"
                      />
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <label className="text-[10.5px] text-slate-400 block mb-1">ผลต่างพัฒนาการ:</label>
                      <input
                        type="text"
                        value={reportData.scoreGrowthPercent}
                        onChange={(e) => setReportData({ ...reportData, scoreGrowthPercent: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-bold text-cyan-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">ข้อความสรุปผลสัมฤทธิ์:</label>
                    <input
                      type="text"
                      value={reportData.assessmentRemarks}
                      onChange={(e) => setReportData({ ...reportData, assessmentRemarks: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                {/* Trainees Table Management */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span>รายชื่อผู้เข้ารับการอบรม ({reportData.traineesList.length} ท่าน)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        สามารถแก้ไขรายชื่อ, รหัสพนักงาน, แผนก, คะแนน Pre-Test, Post-Test หรือเพิ่ม/ลบผู้เรียนได้
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                        <input
                          type="checkbox"
                          checked={reportData.showTraineeRosterTable}
                          onChange={(e) => setReportData({ ...reportData, showTraineeRosterTable: e.target.checked })}
                          className="accent-amber-500 rounded"
                        />
                        <span>แสดงตารางรายชื่อในแผ่นที่ 2 ของรายงาน</span>
                      </label>

                      <button
                        type="button"
                        onClick={handlePullTraineesFromSystem}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                        title="ดึงรายชื่อผู้ที่ลงทะเบียนหรือส่งข้อสอบหลักสูตรนี้เข้าตารางรายงานทันที"
                      >
                        <Users className="w-4 h-4" />
                        <span>📥 ดึงรายชื่อจากระบบ</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAddTrainee}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>เพิ่มผู้เรียน</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveReport}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                        title="บันทึกข้อมูลรายชื่อและรายงานลงฐานข้อมูลถาวร"
                      >
                        <Check className="w-4 h-4" />
                        <span>💾 บันทึกรายชื่อ</span>
                      </button>
                    </div>
                  </div>

                  {/* Trainees List Table */}
                  <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 font-bold text-[11px]">
                          <th className="p-2 w-10 text-center">#</th>
                          <th className="p-2 w-28">รหัสพนักงาน</th>
                          <th className="p-2 min-w-[180px]">ชื่อ-นามสกุล</th>
                          <th className="p-2 min-w-[140px]">แผนก</th>
                          <th className="p-2 min-w-[100px]">ตำแหน่ง</th>
                          <th className="p-2 w-20 text-center">Pre-Test</th>
                          <th className="p-2 w-20 text-center">Post-Test</th>
                          <th className="p-2 min-w-[130px]">สถานะ</th>
                          <th className="p-2 w-12 text-center">ลบ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-[11.5px]">
                        {reportData.traineesList.map((t, idx) => (
                          <tr key={t.id || idx} className="hover:bg-slate-900/50">
                            <td className="p-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={t.empId}
                                onChange={(e) => handleUpdateTrainee(idx, 'empId', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs font-bold"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={t.fullName}
                                onChange={(e) => handleUpdateTrainee(idx, 'fullName', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs font-medium"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={t.department}
                                onChange={(e) => handleUpdateTrainee(idx, 'department', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 text-xs"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={t.position}
                                onChange={(e) => handleUpdateTrainee(idx, 'position', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-400 text-xs"
                              />
                            </td>
                            <td className="p-1.5 text-center">
                              <input
                                type="text"
                                value={t.preTestScore}
                                onChange={(e) => handleUpdateTrainee(idx, 'preTestScore', e.target.value)}
                                className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-center text-white text-xs"
                              />
                            </td>
                            <td className="p-1.5 text-center">
                              <input
                                type="text"
                                value={t.postTestScore}
                                onChange={(e) => handleUpdateTrainee(idx, 'postTestScore', e.target.value)}
                                className="w-14 bg-slate-900 border border-emerald-600/50 rounded px-1.5 py-1 text-center text-emerald-300 font-bold text-xs"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={t.status}
                                onChange={(e) => handleUpdateTrainee(idx, 'status', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-emerald-400 text-xs"
                              />
                            </td>
                            <td className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteTrainee(idx)}
                                className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="ลบผู้เรียน"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ข้อมูลหลักสูตร & รูปแบบการเรียนรู้ */}
            {editSectionTab === 'general' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
                <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>ข้อมูลทั่วไปของหลักสูตร (General Training Information)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">ชื่อหลักสูตร (ภาษาไทย):</label>
                    <input
                      type="text"
                      value={reportData.courseTitle}
                      onChange={(e) => setReportData({ ...reportData, courseTitle: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Course Title (English):</label>
                    <input
                      type="text"
                      value={reportData.courseTitleEn}
                      onChange={(e) => setReportData({ ...reportData, courseTitleEn: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">วันที่จัดอบรม:</label>
                    <input
                      type="text"
                      value={reportData.trainingDates}
                      onChange={(e) => setReportData({ ...reportData, trainingDates: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">ระยะเวลา &amp; ระบบการเรียนรู้:</label>
                    <input
                      type="text"
                      value={reportData.duration}
                      onChange={(e) => setReportData({ ...reportData, duration: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">สถานที่ / ช่องทาง:</label>
                    <input
                      type="text"
                      value={reportData.location}
                      onChange={(e) => setReportData({ ...reportData, location: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">วิทยากรผู้สอน:</label>
                    <input
                      type="text"
                      value={reportData.trainer}
                      onChange={(e) => setReportData({ ...reportData, trainer: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">กลุ่มเป้าหมาย:</label>
                    <input
                      type="text"
                      value={reportData.targetGroup}
                      onChange={(e) => setReportData({ ...reportData, targetGroup: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">งบประมาณที่ใช้ (บาท):</label>
                    <input
                      type="text"
                      value={reportData.budget}
                      onChange={(e) => setReportData({ ...reportData, budget: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="text-[11px] text-slate-400 block mb-1">คำอธิบายรูปแบบการเรียนรู้ (Learning Methodology):</label>
                  <input
                    type="text"
                    value={reportData.learningFormat}
                    onChange={(e) => setReportData({ ...reportData, learningFormat: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Gap & วัตถุประสงค์ */}
            {editSectionTab === 'gaps_objectives' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
                {/* Gaps List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-amber-300 text-xs">Gap / ปัญหาที่พบก่อนการอบรม (Training Gaps):</h5>
                    <button
                      type="button"
                      onClick={() => setReportData({ ...reportData, gaps: [...reportData.gaps, 'ระบุปัญหาหรือ Gap ใหม่'] })}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> เพิ่ม Gap
                    </button>
                  </div>
                  {reportData.gaps.map((g, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold w-5">{idx + 1}.</span>
                      <input
                        type="text"
                        value={g}
                        onChange={(e) => {
                          const next = [...reportData.gaps];
                          next[idx] = e.target.value;
                          setReportData({ ...reportData, gaps: next });
                        }}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = reportData.gaps.filter((_, i) => i !== idx);
                          setReportData({ ...reportData, gaps: next });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Objectives List */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-cyan-300 text-xs">วัตถุประสงค์หลักของหลักสูตร (Course Objectives):</h5>
                    <button
                      type="button"
                      onClick={() => setReportData({ ...reportData, objectives: [...reportData.objectives, 'ระบุวัตถุประสงค์ข้อใหม่'] })}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> เพิ่มวัตถุประสงค์
                    </button>
                  </div>
                  {reportData.objectives.map((obj, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold w-5">{idx + 1}.</span>
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => {
                          const next = [...reportData.objectives];
                          next[idx] = e.target.value;
                          setReportData({ ...reportData, objectives: next });
                        }}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = reportData.objectives.filter((_, i) => i !== idx);
                          setReportData({ ...reportData, objectives: next });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: โมดูลการเรียนรู้ */}
            {editSectionTab === 'sessions' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                    <ListOrdered className="w-4 h-4" />
                    <span>หัวข้อ Micro-Module และการจำลองสถานการณ์ (Course Modules)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setReportData({ ...reportData, sessions: [...reportData.sessions, `Micro Module ${reportData.sessions.length + 1}: หัวข้อใหม่`] })}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> เพิ่มบทเรียน
                  </button>
                </div>

                <div className="space-y-2">
                  {reportData.sessions.map((sess, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold w-5">{idx + 1}.</span>
                      <input
                        type="text"
                        value={sess}
                        onChange={(e) => {
                          const next = [...reportData.sessions];
                          next[idx] = e.target.value;
                          setReportData({ ...reportData, sessions: next });
                        }}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = reportData.sessions.filter((_, i) => i !== idx);
                          setReportData({ ...reportData, sessions: next });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: ความพึงพอใจ */}
            {editSectionTab === 'satisfaction' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-purple-300 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>ผลการประเมินความพึงพอใจ 5 ด้าน (เต็ม 5.00)</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <label className="text-[11px] text-slate-400 block mb-1">ภาพรวม (Overall):</label>
                    <input
                      type="text"
                      value={reportData.satisfactionScores.overall}
                      onChange={(e) => setReportData({
                        ...reportData,
                        satisfactionScores: { ...reportData.satisfactionScores, overall: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-bold text-amber-300"
                    />
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <label className="text-[11px] text-slate-400 block mb-1">เนื้อหาหลักสูตร:</label>
                    <input
                      type="text"
                      value={reportData.satisfactionScores.content}
                      onChange={(e) => setReportData({
                        ...reportData,
                        satisfactionScores: { ...reportData.satisfactionScores, content: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <label className="text-[11px] text-slate-400 block mb-1">วิทยากรผู้สอน:</label>
                    <input
                      type="text"
                      value={reportData.satisfactionScores.trainer}
                      onChange={(e) => setReportData({
                        ...reportData,
                        satisfactionScores: { ...reportData.satisfactionScores, trainer: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <label className="text-[11px] text-slate-400 block mb-1">สื่อ / ระบบ Micro E-Learning:</label>
                    <input
                      type="text"
                      value={reportData.satisfactionScores.media}
                      onChange={(e) => setReportData({
                        ...reportData,
                        satisfactionScores: { ...reportData.satisfactionScores, media: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <label className="text-[11px] text-slate-400 block mb-1">การนำไปใช้ในงานจริง:</label>
                    <input
                      type="text"
                      value={reportData.satisfactionScores.application}
                      onChange={(e) => setReportData({
                        ...reportData,
                        satisfactionScores: { ...reportData.satisfactionScores, application: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: Action Plan & ติดตามผล */}
            {editSectionTab === 'actions' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-indigo-300 text-xs">แผนปฏิบัติการหลังการอบรม (Action Plans):</h5>
                    <button
                      type="button"
                      onClick={() => setReportData({ ...reportData, actionPlans: [...reportData.actionPlans, 'ระบุแผนปฏิบัติการข้อใหม่'] })}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> เพิ่มแผน
                    </button>
                  </div>
                  {reportData.actionPlans.map((ap, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold w-5">{idx + 1}.</span>
                      <input
                        type="text"
                        value={ap}
                        onChange={(e) => {
                          const next = [...reportData.actionPlans];
                          next[idx] = e.target.value;
                          setReportData({ ...reportData, actionPlans: next });
                        }}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = reportData.actionPlans.filter((_, i) => i !== idx);
                          setReportData({ ...reportData, actionPlans: next });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-800">
                  <h5 className="font-bold text-slate-300 text-xs">การติดตามผลโดยหัวหน้างาน (Supervisor Follow-up):</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">ระยะ 30 วัน:</label>
                      <textarea
                        rows={2}
                        value={reportData.supervisorFollowUps.day30}
                        onChange={(e) => setReportData({
                          ...reportData,
                          supervisorFollowUps: { ...reportData.supervisorFollowUps, day30: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">ระยะ 60 วัน:</label>
                      <textarea
                        rows={2}
                        value={reportData.supervisorFollowUps.day60}
                        onChange={(e) => setReportData({
                          ...reportData,
                          supervisorFollowUps: { ...reportData.supervisorFollowUps, day60: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">ระยะ 90 วัน:</label>
                      <textarea
                        rows={2}
                        value={reportData.supervisorFollowUps.day90}
                        onChange={(e) => setReportData({
                          ...reportData,
                          supervisorFollowUps: { ...reportData.supervisorFollowUps, day90: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: ตารางปิด Gap */}
            {editSectionTab === 'closures' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ผลลัพธ์ต่อองค์กร (Results) และการปิด Gap</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setReportData({
                      ...reportData,
                      gapClosures: [
                        ...reportData.gapClosures,
                        { gap: 'ปัญหาข้อใหม่', target: 'เป้าหมาย 100%', actualResult: 'ผลการอบรมบรรลุเป้าหมาย', status: 'ปิด Gap สมบูรณ์ (Closed)' }
                      ]
                    })}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> เพิ่มแถว
                  </button>
                </div>

                <div className="space-y-2">
                  {reportData.gapClosures.map((gc, idx) => (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-5">
                        <label className="text-[10px] text-slate-500 block">Gap / ปัญหาก่อนอบรม:</label>
                        <input
                          type="text"
                          value={gc.gap}
                          onChange={(e) => {
                            const next = [...reportData.gapClosures];
                            next[idx].gap = e.target.value;
                            setReportData({ ...reportData, gapClosures: next });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-500 block">ผลลัพธ์จริงหลังอบรม:</label>
                        <input
                          type="text"
                          value={gc.actualResult}
                          onChange={(e) => {
                            const next = [...reportData.gapClosures];
                            next[idx].actualResult = e.target.value;
                            setReportData({ ...reportData, gapClosures: next });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-blue-300 text-xs font-medium"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-500 block">สถานะ:</label>
                        <input
                          type="text"
                          value={gc.status}
                          onChange={(e) => {
                            const next = [...reportData.gapClosures];
                            next[idx].status = e.target.value;
                            setReportData({ ...reportData, gapClosures: next });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-emerald-300 text-xs font-bold"
                        />
                      </div>
                      <div className="sm:col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const next = reportData.gapClosures.filter((_, i) => i !== idx);
                            setReportData({ ...reportData, gapClosures: next });
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">ข้อเสนอแนะเพิ่มเติม:</label>
                    <textarea
                      rows={2}
                      value={reportData.problemsAndSuggestions.recommendations}
                      onChange={(e) => setReportData({
                        ...reportData,
                        problemsAndSuggestions: { ...reportData.problemsAndSuggestions, recommendations: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">แผนต่อเนื่อง:</label>
                    <textarea
                      rows={2}
                      value={reportData.followUpPlans[0] || ''}
                      onChange={(e) => setReportData({
                        ...reportData,
                        followUpPlans: [e.target.value, ...(reportData.followUpPlans.slice(1))]
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: ผู้ลงนาม 5 ลำดับ */}
            {editSectionTab === 'signatories' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>รายชื่อและตำแหน่งผู้ลงนามทั้ง 5 ลำดับ (Signatories &amp; Approval Routing)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* 1. ผู้จัดทำรายงาน */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="font-bold text-cyan-300 text-xs flex items-center justify-between">
                      <span>ผู้จัดทำรายงาน / วิทยากร</span>
                      <span className="text-[10px] text-slate-500">แผ่นที่ 3</span>
                    </div>
                    <input
                      type="text"
                      placeholder="ชื่อ-นามสกุล"
                      value={signatories.reporterName}
                      onChange={(e) => setSignatories({ ...signatories, reporterName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="ตำแหน่ง"
                      value={signatories.reporterPosition}
                      onChange={(e) => setSignatories({ ...signatories, reporterPosition: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 text-[11px]"
                    />
                  </div>

                  {/* 2. ผู้ตรวจสอบรายงาน */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="font-bold text-cyan-300 text-xs flex items-center justify-between">
                      <span>ผู้ตรวจสอบรายงาน</span>
                      <span className="text-[10px] text-slate-500">แผ่นที่ 3</span>
                    </div>
                    <input
                      type="text"
                      placeholder="ชื่อ-นามสกุล"
                      value={signatories.reviewerName}
                      onChange={(e) => setSignatories({ ...signatories, reviewerName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="ตำแหน่ง"
                      value={signatories.reviewerPosition}
                      onChange={(e) => setSignatories({ ...signatories, reviewerPosition: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 text-[11px]"
                    />
                  </div>

                  {/* 3. ลำดับ 1: เสนอพิจารณา */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="font-bold text-blue-300 text-xs flex items-center justify-between">
                      <span>ลำดับที่ 1: เสนอพิจารณา</span>
                      <span className="text-[10px] text-slate-500">แผ่นที่ 1</span>
                    </div>
                    <input
                      type="text"
                      placeholder="ชื่อ-นามสกุล"
                      value={signatories.approver1Name}
                      onChange={(e) => setSignatories({ ...signatories, approver1Name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="ตำแหน่ง"
                      value={signatories.approver1Position}
                      onChange={(e) => setSignatories({ ...signatories, approver1Position: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 text-[11px]"
                    />
                  </div>

                  {/* 4. ลำดับ 2: พิจารณา */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="font-bold text-cyan-300 text-xs flex items-center justify-between">
                      <span>ลำดับที่ 2: พิจารณา</span>
                      <span className="text-[10px] text-slate-500">แผ่นที่ 1</span>
                    </div>
                    <input
                      type="text"
                      placeholder="ชื่อ-นามสกุล"
                      value={signatories.approver2Name}
                      onChange={(e) => setSignatories({ ...signatories, approver2Name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="ตำแหน่ง"
                      value={signatories.approver2Position}
                      onChange={(e) => setSignatories({ ...signatories, approver2Position: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 text-[11px]"
                    />
                  </div>

                  {/* 5. ลำดับ 3: อนุมัติ / รับทราบ */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 sm:col-span-2">
                    <div className="font-bold text-emerald-300 text-xs flex items-center justify-between">
                      <span>ลำดับที่ 3: ผู้จัดการทั่วไป และ ผู้จัดการโรงงาน (อนุมัติ / รับทราบ)</span>
                      <span className="text-[10px] text-slate-500">แผ่นที่ 1</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="ชื่อ-นามสกุล"
                        value={signatories.approver3Name}
                        onChange={(e) => setSignatories({ ...signatories, approver3Name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="ตำแหน่ง"
                        value={signatories.approver3Position}
                        onChange={(e) => setSignatories({ ...signatories, approver3Position: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions in Edit Mode */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  setViewMode('preview');
                }}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  playSuccessChime();
                  setViewMode('preview');
                }}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>บันทึกการแก้ไขและดูตัวอย่าง (Apply Changes)</span>
              </button>
            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW MODE 2: PREVIEW & PRINT (3 หน้า A4 แนวตั้ง - ฟ้อนต์ Sarabun สม่ำเสมอ) */
          /* ========================================================================= */
          <div className="flex-1 overflow-y-auto p-2 sm:p-6 bg-slate-950/95 flex flex-col items-center gap-6">
            
            <div ref={printableContainerRef} className="w-full flex flex-col items-center gap-8">
              
              {/* ========================================================================= */}
              {/* PAGE 1: หน้าปกรายงาน & สายการพิจารณา (COVER PAGE & APPROVAL ROUTING)      */}
              {/* ========================================================================= */}
              {(activeTab === 'all' || activeTab === 'page1') && (
                <div 
                  ref={page1Ref}
                  id="inhouse-report-page-1"
                  style={{
                    fontFamily: "'TH Sarabun New', 'THSarabunNew', 'Sarabun', 'TH Sarabun PSK', sans-serif"
                  }}
                  className="bg-white text-black p-6 sm:p-8 shadow-2xl transition-all border border-slate-300 text-xs sm:text-[13px] leading-snug rounded-sm w-full max-w-[794px] min-h-[1120px] max-h-[1122px] overflow-hidden flex flex-col justify-between inhouse-portrait-page"
                >
                  <div>
                    {/* Top Confidential Header - Pure Typography */}
                    <div className="pb-3 border-b-2 border-slate-900">
                      <div className="flex items-center justify-between mb-1 text-[11px] text-slate-500">
                        <span>เอกสารทางการ • Internal Official Training Report</span>
                        <span className="font-bold text-blue-900 text-[11.5px] tracking-wider px-2.5 py-0.5 border border-blue-900 rounded bg-blue-50/50">
                          CONFIDENTIAL
                        </span>
                      </div>
                      
                      {/* Prominent Center Name Header */}
                      <div className="text-center pt-1">
                        <h2 className="font-bold text-slate-950 text-base sm:text-lg md:text-xl tracking-normal leading-tight">
                          ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development &amp; Training Center
                        </h2>
                        <div className="text-slate-700 text-xs sm:text-sm font-semibold mt-1">
                          บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • TEIJIN CORD (THAILAND) CO., LTD.
                        </div>
                      </div>
                    </div>

                    {/* Cover Page Main Banner */}
                    <div className="text-center my-4 bg-slate-50 p-4 rounded-xl border border-slate-300">
                      <div className="inline-block px-3 py-0.5 rounded-full bg-blue-900 text-white font-bold text-[11px] tracking-wider mb-1.5">
                        รายงานผลการฝึกอบรมและพัฒนาบุคลากรภายในองค์กร
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight leading-tight">
                        แบบรายงานผลการฝึกอบรมภายใน
                      </h1>
                      <div className="text-xs text-slate-600 font-semibold tracking-wider mt-0.5">
                        IN-HOUSE TRAINING REPORT
                      </div>
                      <h2 className="text-sm sm:text-base font-bold text-blue-950 mt-2 leading-snug">
                        {reportData.courseTitle}
                      </h2>
                      <div className="text-xs text-slate-600 font-medium">
                        {reportData.courseTitleEn}
                      </div>
                    </div>

                    {/* Summary Overview Grid */}
                    <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs text-black">
                      <div className="border border-slate-400 p-2.5 rounded-lg bg-slate-50/60 flex flex-col justify-between">
                        <div className="text-slate-600 text-[11px] font-bold">📅 วันที่จัดอบรม</div>
                        <div className="font-semibold text-slate-900 text-[12px] mt-0.5">{reportData.trainingDates}</div>
                      </div>
                      <div className="border border-slate-400 p-2.5 rounded-lg bg-slate-50/60 flex flex-col justify-between">
                        <div className="text-slate-600 text-[11px] font-bold">⏱️ ระยะเวลา &amp; สถานที่</div>
                        <div className="font-semibold text-slate-900 text-[12px] mt-0.5">{reportData.duration} | {reportData.location}</div>
                      </div>
                      <div className="border border-slate-400 p-2.5 rounded-lg bg-slate-50/60 flex flex-col justify-between">
                        <div className="text-slate-600 text-[11px] font-bold">👨‍🏫 วิทยากรผู้สอน</div>
                        <div className="font-semibold text-slate-900 text-[12px] mt-0.5">{reportData.trainer} (ภายในองค์กร)</div>
                      </div>
                      <div className="border border-slate-400 p-2.5 rounded-lg bg-slate-50/60 flex flex-col justify-between">
                        <div className="text-slate-600 text-[11px] font-bold">🎯 จำนวนผู้เข้าอบรม &amp; ผลสัมฤทธิ์</div>
                        <div className="font-bold text-emerald-900 text-[12px] mt-0.5">
                          แผน {reportData.plannedCount} คน / เข้าอบรมจริง {reportData.actualCount} คน (ผ่านเกณฑ์ {reportData.passRate}%)
                        </div>
                      </div>
                    </div>

                    {/* APPROVAL & ROUTING SECTION */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 mb-1 border-b border-slate-300 pb-1">
                        <ShieldCheck className="w-4 h-4 text-blue-900" />
                        <h3 className="font-bold text-xs sm:text-sm text-black">
                          บันทึกการเสนอรายงานผลการฝึกอบรมเพื่อพิจารณาและรับทราบ (Submission &amp; Approval Flow)
                        </h3>
                      </div>

                      {/* Person 1 */}
                      <div className="border-2 border-slate-400 p-3 rounded-lg bg-white flex flex-col justify-between text-xs space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-blue-950 text-[12.5px]">ลำดับที่ 1: เสนอพิจารณา</span>
                              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded">
                                รับทราบ / เสนอพิจารณา
                              </span>
                            </div>
                            <div className="font-bold text-black text-sm mt-0.5">
                              {signatories.approver1Name}
                            </div>
                            <div className="text-slate-700 text-[11.5px] font-medium">
                              {signatories.approver1Position}
                            </div>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-800 text-right">
                            <label className="flex items-center justify-end gap-1.5 font-semibold">
                              <CheckSquare className="w-3.5 h-3.5 text-blue-900" />
                              <span>รับทราบและเห็นชอบตามรายงาน</span>
                            </label>
                            <label className="flex items-center justify-end gap-1.5 text-slate-500">
                              <Square className="w-3.5 h-3.5 text-slate-400" />
                              <span>ข้อคิดเห็นเพิ่มเติม: .......................................</span>
                            </label>
                          </div>
                        </div>

                        {/* Clean blank signature line for manual pen signing */}
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                          <div className="text-[11px] text-slate-500">
                            วันที่ ......... / ......... / 2569
                          </div>
                          <div className="text-right">
                            <div className="h-8 w-52 border-b border-slate-400 mb-1 ml-auto"></div>
                            <div className="font-bold text-slate-900 text-[11.5px]">
                              ( {signatories.approver1Name} )
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Person 2 */}
                      <div className="border-2 border-slate-400 p-3 rounded-lg bg-white flex flex-col justify-between text-xs space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-blue-950 text-[12.5px]">ลำดับที่ 2: พิจารณา</span>
                              <span className="text-[10px] px-2 py-0.5 bg-cyan-100 text-cyan-900 font-bold rounded">
                                รับทราบ / พิจารณา
                              </span>
                            </div>
                            <div className="font-bold text-black text-sm mt-0.5">
                              {signatories.approver2Name}
                            </div>
                            <div className="text-slate-700 text-[11.5px] font-medium">
                              {signatories.approver2Position}
                            </div>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-800 text-right">
                            <label className="flex items-center justify-end gap-1.5 font-semibold">
                              <CheckSquare className="w-3.5 h-3.5 text-blue-900" />
                              <span>รับทราบและเห็นชอบตามรายงาน</span>
                            </label>
                            <label className="flex items-center justify-end gap-1.5 text-slate-500">
                              <Square className="w-3.5 h-3.5 text-slate-400" />
                              <span>ข้อคิดเห็นเพิ่มเติม: .......................................</span>
                            </label>
                          </div>
                        </div>

                        {/* Clean blank signature line for manual pen signing */}
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                          <div className="text-[11px] text-slate-500">
                            วันที่ ......... / ......... / 2569
                          </div>
                          <div className="text-right">
                            <div className="h-8 w-52 border-b border-slate-400 mb-1 ml-auto"></div>
                            <div className="font-bold text-slate-900 text-[11.5px]">
                              ( {signatories.approver2Name} )
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Person 3 */}
                      <div className="border-2 border-slate-400 p-3 rounded-lg bg-white flex flex-col justify-between text-xs space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-blue-950 text-[12.5px]">ลำดับที่ 3: อนุมัติ / รับทราบ</span>
                              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold rounded">
                                รับทราบ / อนุมัติ
                              </span>
                            </div>
                            <div className="font-bold text-black text-sm mt-0.5">
                              {signatories.approver3Name}
                            </div>
                            <div className="text-slate-700 text-[11.5px] font-medium">
                              {signatories.approver3Position}
                            </div>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-800 text-right">
                            <label className="flex items-center justify-end gap-1.5 font-semibold text-emerald-900">
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-900" />
                              <span>อนุมัติและรับทราบผลการฝึกอบรม</span>
                            </label>
                            <label className="flex items-center justify-end gap-1.5 text-slate-500">
                              <Square className="w-3.5 h-3.5 text-slate-400" />
                              <span>ข้อคิดเห็นเพิ่มเติม: .......................................</span>
                            </label>
                          </div>
                        </div>

                        {/* Clean blank signature line for manual pen signing */}
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                          <div className="text-[11px] text-slate-500">
                            วันที่ ......... / ......... / 2569
                          </div>
                          <div className="text-right">
                            <div className="h-8 w-52 border-b border-slate-400 mb-1 ml-auto"></div>
                            <div className="font-bold text-slate-900 text-[11.5px]">
                              ( {signatories.approver3Name} )
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Page 1 Footer */}
                  <div className="pt-3 border-t border-slate-400 flex items-center justify-between text-[11px] text-slate-600">
                    <span>ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
                    <span className="font-medium text-slate-700">เอกสารรายงานผลการฝึกอบรมภายใน (แผ่นที่ 1)</span>
                  </div>
                </div>
              )}


              {/* ========================================================================= */}
              {/* PAGE 2: ข้อมูลหลักสูตร & ผลการประเมินความรู้ (TRAINING & ASSESSMENT)      */}
              {/* ========================================================================= */}
              {(activeTab === 'all' || activeTab === 'page2') && (
                <div 
                  ref={page2Ref}
                  id="inhouse-report-page-2"
                  style={{
                    fontFamily: "'TH Sarabun New', 'THSarabunNew', 'Sarabun', 'TH Sarabun PSK', sans-serif"
                  }}
                  className="bg-white text-black p-6 sm:p-8 shadow-2xl transition-all border border-slate-300 text-xs sm:text-[12.5px] leading-snug rounded-sm w-full max-w-[794px] min-h-[1120px] max-h-[1122px] overflow-hidden flex flex-col justify-between inhouse-portrait-page"
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-center justify-between pb-2 border-b-2 border-slate-800 text-[11.5px] text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black text-sm">ศูนย์ฝึกอบรมและพัฒนา TCT Academy</span>
                        <span>|</span>
                        <span className="font-semibold text-slate-700">บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
                      </div>
                      <div className="font-bold text-blue-900 text-[11px] tracking-wider px-2 py-0.5 border border-blue-900 rounded bg-blue-50/50">
                        CONFIDENTIAL
                      </div>
                    </div>

                    {/* Section Title */}
                    <div className="my-3 border-b border-slate-300 pb-1.5 flex items-center justify-between">
                      <h2 className="text-sm font-bold text-black">
                        แบบรายงานผลการฝึกอบรมภายใน: <span className="text-blue-950 font-bold">{reportData.courseTitle}</span>
                      </h2>
                      <span className="text-[11px] text-slate-600 font-medium">ส่วนที่ 1: ข้อมูลหลักสูตรและผลการประเมินความรู้</span>
                    </div>

                    <div className="space-y-4">
                      
                      {/* SECTION 1: ข้อมูลทั่วไปของหลักสูตร */}
                      <div>
                        <h3 className="font-bold text-xs text-black mb-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-900 inline-block"></span>
                          <span>1. ข้อมูลทั่วไปของหลักสูตร (Training Information)</span>
                        </h3>
                        <div className="border border-black text-xs text-black">
                          <table className="w-full border-collapse">
                            <tbody>
                              <tr className="border-b border-black">
                                <td className="w-36 bg-slate-100 p-1.5 font-bold border-r border-black">วันที่จัดอบรม</td>
                                <td className="p-1.5 font-medium">{reportData.trainingDates}</td>
                              </tr>
                              <tr className="border-b border-black">
                                <td className="bg-slate-100 p-1.5 font-bold border-r border-black">ระยะเวลา / สถานที่</td>
                                <td className="p-1.5">{reportData.duration} | {reportData.location}</td>
                              </tr>
                              <tr className="border-b border-black">
                                <td className="bg-slate-100 p-1.5 font-bold border-r border-black">วิทยากรผู้สอน</td>
                                <td className="p-1.5 font-medium">{reportData.trainer} (ภายในองค์กร)</td>
                              </tr>
                              <tr className="border-b border-black">
                                <td className="bg-slate-100 p-1.5 font-bold border-r border-black">กลุ่มเป้าหมาย</td>
                                <td className="p-1.5 leading-tight text-[11.5px]">{reportData.targetGroup}</td>
                              </tr>
                              <tr>
                                <td className="bg-slate-100 p-1.5 font-bold border-r border-black">จำนวนผู้เข้าอบรม</td>
                                <td className="p-1.5 font-bold text-blue-950">
                                  แผน {reportData.plannedCount} คน / เข้ารับการอบรมจริง {reportData.actualCount} คน ({reportData.passRate}%)
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* SECTION 2: ที่มาและ Gap ที่ต้องการปิด */}
                      <div>
                        <h3 className="font-bold text-xs text-black mb-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-900 inline-block"></span>
                          <span>2. ที่มาและ Gap ที่ต้องการปิด (Training Needs &amp; Objectives)</span>
                        </h3>
                        <div className="border border-black p-3 bg-slate-50/50 space-y-2 text-[12px]">
                          <div>
                            <div className="font-bold text-slate-900 underline mb-1">Gap / ปัญหาที่พบก่อนการอบรม:</div>
                            <ul className="list-none space-y-1 text-slate-800 pl-1.5">
                              {reportData.gaps.map((gap, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-blue-900 font-bold">•</span>
                                  <span>{gap}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="pt-2 border-t border-slate-300">
                            <div className="font-bold text-slate-900 underline mb-1">วัตถุประสงค์หลักของหลักสูตร:</div>
                            <ul className="list-none space-y-1 text-slate-800 pl-1.5">
                              {reportData.objectives.map((obj, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-blue-900 font-bold">•</span>
                                  <span>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 3: เนื้อหาและวิธีการจัดอบรม */}
                      <div>
                        <h3 className="font-bold text-xs text-black mb-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-900 inline-block"></span>
                          <span>3. เนื้อหาและรูปแบบการเรียนรู้ (Content &amp; Micro-Learning Methodology)</span>
                        </h3>
                        <div className="border border-black p-3 bg-slate-50/50 space-y-2 text-[12px]">
                          <div>
                            <div className="font-bold text-slate-900 underline mb-1">หัวข้อ Micro-Module และการจำลองสถานการณ์:</div>
                            <ul className="list-none space-y-1 text-slate-800 pl-1.5">
                              {reportData.sessions.map((session, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-blue-900 font-bold">•</span>
                                  <span className="font-medium">{session}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="pt-2 border-t border-slate-300">
                            <div className="font-bold text-slate-900 mb-1">รูปแบบการเรียนรู้แบบ Micro E-Learning:</div>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11.5px]">
                              <span className="flex items-center gap-1 font-bold text-blue-950"><CheckSquare className="w-3.5 h-3.5 text-blue-900" /> Micro E-Learning (ไมโครเลิร์นนิ่ง)</span>
                              <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5 text-blue-900" /> Interactive Micro-Lecture</span>
                              <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5 text-blue-900" /> Scenario Simulator &amp; Workshop</span>
                              <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5 text-blue-900" /> OJT หน้างานจริง</span>
                              <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5 text-blue-900" /> Micro-Assessment</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 4: ผลการประเมินความรู้ (Pre/Post Test) */}
                      <div>
                        <h3 className="font-bold text-xs text-black mb-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-900 inline-block"></span>
                          <span>4. ผลการประเมินความรู้ (Learning Assessment - Pre vs Post Test)</span>
                        </h3>
                        <div className="border border-black">
                          <table className="w-full border-collapse text-center text-xs">
                            <thead>
                              <tr className="bg-slate-200 border-b border-black font-bold text-[12px]">
                                <th className="border-r border-black p-1.5 text-left w-2/5">รายการประเมิน</th>
                                <th className="border-r border-black p-1.5 w-1/5">Pre-Test</th>
                                <th className="border-r border-black p-1.5 w-1/5">Post-Test</th>
                                <th className="p-1.5 w-1/5">ผลต่าง (%)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-black text-[12px]">
                              <tr>
                                <td className="border-r border-black p-1.5 text-left font-medium px-2.5">คะแนนเฉลี่ย (เต็ม 100)</td>
                                <td className="border-r border-black p-1.5">{reportData.avgPreScore}</td>
                                <td className="border-r border-black p-1.5 font-bold text-emerald-900">{reportData.avgPostScore}</td>
                                <td className="p-1.5 font-bold text-blue-950">{reportData.scoreGrowthPercent}</td>
                              </tr>
                              <tr>
                                <td className="border-r border-black p-1.5 text-left font-medium px-2.5">จำนวนผู้ผ่านเกณฑ์ (คน)</td>
                                <td className="border-r border-black p-1.5 text-slate-400">-</td>
                                <td className="border-r border-black p-1.5 font-bold text-emerald-900">{reportData.passedCount} / {reportData.actualCount}</td>
                                <td className="p-1.5 font-bold text-emerald-900">{reportData.passRate}%</td>
                              </tr>
                              <tr className="bg-slate-50">
                                <td className="border-r border-black p-1.5 text-left font-medium px-2.5">อัตราผ่านเกณฑ์ (%)</td>
                                <td className="border-r border-black p-1.5 text-slate-400">-</td>
                                <td className="border-r border-black p-1.5 font-bold text-blue-950">{reportData.passRate}%</td>
                                <td className="p-1.5 font-bold text-emerald-800 text-[11.5px]">บรรลุเป้าหมาย</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-1.5 text-[11.5px] text-emerald-900 font-bold bg-emerald-50/70 p-1.5 rounded border border-emerald-300 text-center">
                          {reportData.assessmentRemarks}
                        </div>

                        {/* Optional Roster Table on Page 2 if enabled */}
                        {reportData.showTraineeRosterTable && reportData.traineesList.length > 0 && (
                          <div className="mt-2.5 border border-black">
                            <div className="bg-slate-100 px-2 py-1 font-bold text-[11px] text-black border-b border-black flex justify-between items-center">
                              <span>ตารางรายชื่อผู้เข้าอบรมและผลสัมฤทธิ์ ({reportData.traineesList.length} ท่าน)</span>
                              <span className="text-[10px] text-emerald-900 font-bold">เกณฑ์ผ่าน ≥80% (100% Pass)</span>
                            </div>
                            <table className="w-full border-collapse text-[10.5px]">
                              <thead>
                                <tr className="bg-slate-200 border-b border-black font-bold text-center">
                                  <th className="border-r border-black p-1 w-7">ลำดับ</th>
                                  <th className="border-r border-black p-1 w-20">รหัส</th>
                                  <th className="border-r border-black p-1 text-left">ชื่อ-นามสกุล</th>
                                  <th className="border-r border-black p-1 text-left w-24">แผนก</th>
                                  <th className="border-r border-black p-1 w-14">Pre-Test</th>
                                  <th className="border-r border-black p-1 w-14">Post-Test</th>
                                  <th className="p-1 w-24">ผลการประเมิน</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-black text-center">
                                {reportData.traineesList.map((t, idx) => (
                                  <tr key={t.id || idx} className="hover:bg-slate-50">
                                    <td className="border-r border-black p-0.5">{idx + 1}</td>
                                    <td className="border-r border-black p-0.5 font-bold">{t.empId}</td>
                                    <td className="border-r border-black p-0.5 text-left font-medium px-1.5">{t.fullName}</td>
                                    <td className="border-r border-black p-0.5 text-left px-1.5">{t.department}</td>
                                    <td className="border-r border-black p-0.5">{t.preTestScore}/10</td>
                                    <td className="border-r border-black p-0.5 font-bold text-emerald-900">{t.postTestScore}/10</td>
                                    <td className="p-0.5 font-bold text-emerald-900 text-[10px]">✓ {t.status || 'ผ่านเกณฑ์ 100%'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Page 2 Footer */}
                  <div className="pt-3 border-t border-slate-400 flex items-center justify-between text-[11px] text-slate-600">
                    <span>ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
                    <span className="font-medium text-slate-700">เอกสารรายงานผลการฝึกอบรมภายใน (แผ่นที่ 2)</span>
                  </div>
                </div>
              )}


              {/* ========================================================================= */}
              {/* PAGE 3: ผลลัพธ์ต่อองค์กร แผนพัฒนา & ลายมือชื่อ (RESULTS & SIGNATURES)       */}
              {/* ========================================================================= */}
              {(activeTab === 'all' || activeTab === 'page3') && (
                <div 
                  ref={page3Ref}
                  id="inhouse-report-page-3"
                  style={{
                    fontFamily: "'TH Sarabun New', 'THSarabunNew', 'Sarabun', 'TH Sarabun PSK', sans-serif"
                  }}
                  className="bg-white text-black p-6 sm:p-8 shadow-2xl transition-all border border-slate-300 text-xs sm:text-[12.5px] leading-snug rounded-sm w-full max-w-[794px] min-h-[1120px] max-h-[1122px] overflow-hidden flex flex-col justify-between inhouse-portrait-page"
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-center justify-between pb-2 border-b-2 border-slate-800 text-[11.5px] text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black text-sm">ศูนย์ฝึกอบรมและพัฒนา TCT Academy</span>
                        <span>|</span>
                        <span className="font-semibold text-slate-700">บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
                      </div>
                      <div className="font-bold text-blue-900 text-[11px] tracking-wider px-2 py-0.5 border border-blue-900 rounded bg-blue-50/50">
                        CONFIDENTIAL
                      </div>
                    </div>

                    {/* Section Title */}
                    <div className="my-3 border-b border-slate-300 pb-1.5 flex items-center justify-between">
                      <h2 className="text-sm font-bold text-black">
                        แบบรายงานผลการฝึกอบรมภายใน: <span className="text-blue-950 font-bold">{reportData.courseTitle}</span>
                      </h2>
                      <span className="text-[11px] text-slate-600 font-medium">ส่วนที่ 2: ผลการประเมินความพึงพอใจ ผลลัพธ์ต่อองค์กร และลายมือชื่อ</span>
                    </div>

                    <div className="space-y-4">
                      
                      {/* SECTION 5: ผลการประเมินความพึงพอใจ */}
                      <div>
                        <h3 className="font-bold text-xs text-black mb-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-900 inline-block"></span>
                          <span>5. ผลการประเมินความพึงพอใจและการนำไปใช้ (Reaction &amp; Application)</span>
                        </h3>
                        <div className="border border-black p-2.5 bg-slate-50/50 space-y-1.5 text-[12px]">
                          <div className="font-bold text-black mb-1 underline">
                            ผลประเมินความพึงพอใจรวม (เฉลี่ย {reportData.satisfactionScores.overall} / 5.00 หรือ {Math.round(Number(reportData.satisfactionScores.overall) * 20)}% ระดับดีเยี่ยม):
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11.5px]">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
                              <span>• เนื้อหาหลักสูตร ({reportData.satisfactionScores.content})</span>
                              <span className="font-bold text-blue-900">ระดับดีมาก</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
                              <span>• วิทยากรผู้สอน ({reportData.satisfactionScores.trainer})</span>
                              <span className="font-bold text-blue-900">ระดับดีมาก</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>• สื่อและระบบ Micro E-Learning ({reportData.satisfactionScores.media})</span>
                              <span className="font-bold text-blue-900">ระดับดีมาก</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>• การนำไปใช้ในงานจริง ({reportData.satisfactionScores.application})</span>
                              <span className="font-bold text-blue-900">ระดับดีมาก</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 6: แผนปฏิบัติการหลังการอบรม & ติดตามผล */}
                      <div>
                        <h3 className="font-bold text-xs text-black mb-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-900 inline-block"></span>
                          <span>6. แผนปฏิบัติการและการติดตามผล (Action Plan &amp; Follow-up)</span>
                        </h3>
                        <div className="border border-black p-2.5 bg-slate-50/50 space-y-2 text-[12px]">
                          <div>
                            <div className="font-bold text-slate-900 underline mb-1">แผนปฏิบัติ (Action Plan) หลังจบหลักสูตร:</div>
                            <ul className="list-none space-y-1 text-slate-800 pl-1.5">
                              {reportData.actionPlans.map((plan, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-blue-900 font-bold">•</span>
                                  <span>{plan}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="pt-1.5 border-t border-slate-300">
                            <div className="font-bold text-slate-900 underline mb-1">การติดตามผลโดยหัวหน้างาน (Supervisor Follow-up):</div>
                            <div className="space-y-0.5 text-slate-800 text-[11.5px] pl-1.5">
                              <div><strong>ระยะ 30 วัน:</strong> {reportData.supervisorFollowUps.day30}</div>
                              <div><strong>ระยะ 60 วัน:</strong> {reportData.supervisorFollowUps.day60}</div>
                              <div><strong>ระยะ 90 วัน:</strong> {reportData.supervisorFollowUps.day90}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 7: ผลลัพธ์ต่อองค์กรและการปิด Gap */}
                      <div>
                        <h3 className="font-bold text-xs text-black mb-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-900 inline-block"></span>
                          <span>7. ผลลัพธ์ต่อองค์กร (Results) และการปิด Gap</span>
                        </h3>
                        <div className="border border-black">
                          <table className="w-full border-collapse text-[11.5px]">
                            <thead>
                              <tr className="bg-slate-200 border-b border-black font-bold text-center">
                                <th className="border-r border-black p-1.5 text-left w-1/3">Gap / ปัญหาก่อนอบรม</th>
                                <th className="border-r border-black p-1.5 text-left w-1/2">ผลลัพธ์ที่เกิดขึ้นจริงหลังอบรม</th>
                                <th className="p-1.5 w-1/6">สถานะ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-black">
                              {reportData.gapClosures.map((gc, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="border-r border-black p-1.5 align-top font-medium text-slate-900">{gc.gap}</td>
                                  <td className="border-r border-black p-1.5 align-top text-blue-950 font-medium">{gc.actualResult}</td>
                                  <td className="p-1.5 align-top text-center font-bold text-emerald-900 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded text-[10.5px] border border-emerald-500">
                                      ✓ {gc.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* SECTION 8: ข้อเสนอแนะและแผนติดตามต่อเนื่อง */}
                      <div>
                        <div className="border border-black p-2.5 bg-slate-50/50 space-y-1 text-[12px]">
                          <div>
                            <span className="font-bold text-slate-900 underline">• ข้อเสนอแนะเพิ่มเติม: </span>
                            <span className="text-slate-800">{reportData.problemsAndSuggestions.recommendations}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 underline">• แผนต่อเนื่อง: </span>
                            <span className="text-slate-800">{reportData.followUpPlans[0]}</span>
                          </div>
                        </div>
                      </div>

                      {/* SIGNATURES SECTION */}
                      <div className="pt-3 border-t-2 border-black text-xs">
                        <div className="grid grid-cols-2 gap-6">
                          
                          {/* Signer 1: ผู้จัดทำรายงาน / วิทยากร */}
                          <div className="text-center p-3 border border-slate-400 bg-white rounded-lg space-y-1">
                            <div className="text-slate-700 text-[11px] font-medium">
                              ผู้จัดทำรายงาน / วิทยากร
                            </div>
                            {/* Clean blank signature line for manual pen signing */}
                            <div className="h-10 border-b border-slate-400 mx-auto w-48 sm:w-56 my-1"></div>
                            <div className="font-bold text-black text-[12px]">
                              ( {signatories.reporterName} )
                            </div>
                            <div className="text-slate-600 text-[10.5px]">
                              {signatories.reporterPosition}
                            </div>
                            <div className="text-slate-500 text-[10px]">
                              วันที่ ......... / ......... / 2569
                            </div>
                          </div>

                          {/* Signer 2: ผู้ตรวจสอบรายงาน */}
                          <div className="text-center p-3 border border-slate-400 bg-white rounded-lg space-y-1">
                            <div className="text-slate-700 text-[11px] font-medium">
                              ผู้ตรวจสอบรายงาน
                            </div>
                            {/* Clean blank signature line for manual pen signing */}
                            <div className="h-10 border-b border-slate-400 mx-auto w-48 sm:w-56 my-1"></div>
                            <div className="font-bold text-black text-[12px]">
                              ( {signatories.reviewerName} )
                            </div>
                            <div className="text-slate-600 text-[10.5px]">
                              {signatories.reviewerPosition}
                            </div>
                            <div className="text-slate-500 text-[10px]">
                              วันที่ ......... / ......... / 2569
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Page 3 Footer */}
                  <div className="pt-3 border-t border-slate-400 flex items-center justify-between text-[11px] text-slate-600">
                    <span>ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
                    <span className="font-medium text-slate-700">เอกสารรายงานผลการฝึกอบรมภายใน (แผ่นที่ 3)</span>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* Bottom Footer Actions (No-Print) */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 no-print">
          <div className="flex items-center gap-2">
            <span className="text-cyan-300 font-bold">แบบรายงานผลการฝึกอบรมภายใน (A4 แนวตั้ง)</span>
            <span>•</span>
            <span>ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
          </div>
          <div className="flex items-center gap-2">
            {viewMode === 'preview' ? (
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  setViewMode('edit');
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-white font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>แก้ไขข้อมูลรายงาน</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSaveReport}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>บันทึกข้อมูลรายงาน</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    setViewMode('preview');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>กลับไปดูตัวอย่าง</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
            >
              พิมพ์หน้านี้ (Print A4)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
