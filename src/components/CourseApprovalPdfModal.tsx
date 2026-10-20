import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Course, CourseModule } from '../types';
import { getAllAvailableCourses, getCourseModules, getCourseQuestions } from '../utils/courseManager';
import { COURSE_OFFICIAL_METADATA } from '../utils/courseTraineeHelper';
import { downloadElementAsPdf, downloadMultiPagePdf, printElementViaStandaloneWindow } from '../utils/pdfExport';
import { TCTLogo } from './TCTLogo';
import { 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  Award, 
  Building2, 
  Calendar, 
  FileText, 
  Check, 
  BookOpen, 
  Users, 
  Clock, 
  Layers, 
  Sparkles, 
  Tv, 
  FileSpreadsheet, 
  PenTool, 
  ChevronRight, 
  ShieldCheck, 
  GraduationCap, 
  SlidersHorizontal,
  ExternalLink,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

interface CourseApprovalPdfModalProps {
  initialCourseId?: string;
  onClose: () => void;
}

// Detailed Curriculum Syllabus Data for Official Course Proposal
interface CourseSyllabusDetail {
  objectives: string[];
  targetAudience: string;
  prerequisites: string;
  learningMethodology: string;
  evaluationCriteria: {
    preTest: string;
    learningRequirement: string;
    miniGame: string;
    postTest: string;
    certificate: string;
  };
  expectedOutcomes: string[];
  kpis: string[];
  equipmentAndPlatform: string;
  documentRefNo: string;
  approvalDate: string;
}

const COURSE_SYLLABUS_DETAILS: Record<string, CourseSyllabusDetail> = {
  'risk-management': {
    objectives: [
      'เพื่อให้ผู้เข้าอบรมเข้าใจหลักการบริหารความเสี่ยงด้านคุณภาพและความปลอดภัยตามมาตรฐานสากล ISO 31000',
      'เพื่อฝึกฝนการประเมินและวิเคราะห์ระดับความเสี่ยงด้วยเครื่องมือ 5x5 Matrix และ Root Cause Analysis (5 Whys)',
      'เพื่อนำลำดับขั้นการควบคุมความเสี่ยง (Hierarchy of Controls: 5 ขั้น) ไปประยุกต์ใช้ในการปฏิบัติงานจริงหน้างาน',
      'เพื่อปลูกฝังจิตสำนึกความปลอดภัยเชิงรุกและกิจกรรม KYT เตือนภัยหน้างานสู่เป้าหมายอุบัติเหตุเป็นศูนย์ (Zero Accident)'
    ],
    targetAudience: 'พนักงานฝ่ายผลิต, ช่างเทคนิค, เจ้าหน้าที่ตรวจสอบคุณภาพ (QC/QA), คลังสินค้า และธุรการ ทั้งหมด 230 ท่าน',
    prerequisites: 'ผ่านการอบรมปฐมนิเทศความปลอดภัยขั้นพื้นฐานของโรงงาน TCT',
    learningMethodology: 'Micro E-Learning 100% Online, วิดีโอบรรยายทางการ, แบบจำลองสถานการณ์ความเสี่ยง และ Mini-Game KYT Simulator',
    evaluationCriteria: {
      preTest: 'แบบทดสอบก่อนเรียน 10 ข้อ (เกณฑ์ประเมินวัดระดับความรู้พื้นฐาน)',
      learningRequirement: 'เรียนจบครบทั้ง 4 บทเรียน 100% ตามโครงสร้างเนื้อหา',
      miniGame: 'ทำแบบฝึกสถานการณ์จำลองความเสี่ยงผ่านเกณฑ์',
      postTest: 'แบบทดสอบหลังเรียน 10 ข้อ เกณฑ์ผ่านไม่น้อยกว่า 80% (≥ 8/10 ข้อ)',
      certificate: 'ออกใบประกาศนียบัตรอิเล็กทรอนิกส์มาตรฐาน TCT Academy (รหัส TCT-QSRM)'
    },
    expectedOutcomes: [
      'อัตราการเกิดอุบัติเหตุและการบาดเจ็บจากการทำงานลดลงสู่ระดับศูนย์ (Zero Lost Time Injury)',
      'ข้อร้องเรียนด้านคุณภาพชิ้นส่วนเส้นคอร์ดลดลงไม่น้อยกว่า 50%',
      'พนักงานสามารถจัดทำทะเบียนความเสี่ยง (Risk Register) และชี้บ่งจุดอันตรายได้ด้วยตนเอง'
    ],
    kpis: [
      'อัตราการผ่านการฝึกอบรมของพนักงานเป้าหมาย 100% (230 ท่าน)',
      'คะแนนประเมินผลสัมฤทธิ์ทางการเรียนหลังเรียน (Post-test) เฉลี่ย ≥ 85%',
      'ดัชนีความพึงพอใจต่อระบบการจัดการเรียนรู้อิเล็กทรอนิกส์ ≥ 4.80 จาก 5.00'
    ],
    equipmentAndPlatform: 'ระบบ TCT Micro E-Training Web Application, สมาร์ทโฟน/แท็บเล็ต/คอมพิวเตอร์ และระบบบันทึกเวลาเรียนดิจิทัล',
    documentRefNo: 'TCT-ACAD-QSRM-01/2569',
    approvalDate: '24 สิงหาคม 2569'
  },
  'advanced-preventive-maintenance': {
    objectives: [
      'เพื่อเปลี่ยนผ่านระบบการซ่อมบำรุงจากการแก้ไขเมื่อชำรุด (Breakdown) สู่การบำรุงรักษาตามสภาพ (Condition-Based Maintenance - CBM)',
      'เพื่อเข้าใจหลักการตรวจวัดสัญญาณเตือนล่วงหน้าด้วย P-F Curve, Ultrasound Inspection และ Vibration Analysis',
      'เพื่อประเมินความน่าเชื่อถือของเครื่องจักรด้วย RCM (Reliability-Centered Maintenance) และวิเคราะห์ข้อบกพร่อง FMEA',
      'เพื่อจัดทำแผน PM Kaizen ลด Unplanned Downtime และเพิ่มค่าประสิทธิผลโดยรวมของเครื่องจักร (OEE)'
    ],
    targetAudience: 'ช่างซ่อมบำรุง, วิศวกรโรงงาน, หัวหน้าสายการผลิต, ลีดเดอร์ และพนักงานเดินเครื่องจักร 230 ท่าน',
    prerequisites: 'มีความรู้พื้นฐานการใช้งานเครื่องจักรและระบบส่งกำลังในโรงงานอุตสาหกรรม',
    learningMethodology: 'Micro E-Learning ออนไลน์, วิดีโอตรวจวัดเครื่องจักรจริง, เครื่องมือวิเคราะห์ CBM จำลอง และกรณีศึกษาหน้างาน',
    evaluationCriteria: {
      preTest: 'แบบทดสอบก่อนเรียน 10 ข้อ วัดความเข้าใจด้าน PdM/CBM',
      learningRequirement: 'ศึกษาครบทั้ง 3 บทเรียนหลัก พร้อมศึกษาเอกสารเทคนิคประกอบ',
      miniGame: 'ทำกิจกรรมจำลองการวินิจฉัยจุดชำรุดของตลับลูกปืนและมอเตอร์',
      postTest: 'แบบทดสอบหลังเรียน 10 ข้อ เกณฑ์ผ่านไม่น้อยกว่า 80% (≥ 8/10 ข้อ)',
      certificate: 'ออกใบประกาศนียบัตรอิเล็กทรอนิกส์มาตรฐาน TCT Academy (รหัส TCT-APM)'
    },
    expectedOutcomes: [
      'อัตราการหยุดชะงักของเครื่องจักรนอกแผน (Unplanned Downtime) ลดลงมากกว่า 35%',
      'อายุการใช้งานของชิ้นส่วนเครื่องจักรสำคัญ (Mean Time Between Failures - MTBF) ยืดระยะเวลาออกไปได้ 40%',
      'ลดค่าใช้จ่ายในการเปลี่ยนอะไหล่ฉุกเฉินและเพิ่มความปลอดภัยต่อพนักงานผู้ปฏิบัติงาน'
    ],
    kpis: [
      'บุคลากรฝ่ายซ่อมบำรุงและฝ่ายผลิตผ่านเกณฑ์การประเมิน 100%',
      'แผนการตรวจเช็คสภาพเครื่องจักร CBM ประจำสัปดาห์ได้รับการปฏิบัติตามมาตรฐานครบถ้วน',
      'ความคุ้มค่าการลงทุนด้านการซ่อมบำรุงเชิงคาดการณ์ (Maintenance ROI) คุ้มค่าสูงสุด'
    ],
    equipmentAndPlatform: 'ระบบ TCT Micro E-Training Platform, สื่อวิดีโอเทคนิคการวัดความสั่นสะเทือน และแบบทดสอบดิจิทัล',
    documentRefNo: 'TCT-ACAD-APM-02/2569',
    approvalDate: '27 สิงหาคม 2569'
  },
  'conflict-management': {
    objectives: [
      'เพื่อให้ผู้เข้าอบรมเข้าใจจิตวิทยาและความแตกต่างระหว่างความขัดแย้งเชิงงาน (Task) กับความขัดแย้งเชิงความสัมพันธ์ (Relationship)',
      'เพื่อสามารถนำโมเดล Thomas-Kilmann (TKI 5 สไตล์) ไปปรับใช้ในการจัดการความขัดแย้งในแต่ละสถานการณ์ได้อย่างเหมาะสม',
      'เพื่อฝึกฝนทักษะการสื่อสารอย่างสันติ (NVC), การใช้ประโยค I-Message และการฟังอย่างลึกซึ้ง (Active Empathic Listening)',
      'เพื่อยกระดับทักษะการเจรจาต่อรองแบบชนะทั้งสองฝ่าย (Win-Win Harvard Negotiation) และการสร้างความปลอดภัยทางจิตวิทยาในทีม'
    ],
    targetAudience: 'ผู้จัดการ, หัวหน้างาน, ลีดเดอร์, เจ้าหน้าที่ฝ่ายบุคคล และพนักงานทุกสายงาน บริษัท เทยิน คอร์ด จำกัด (230 ท่าน)',
    prerequisites: 'ไม่มี (เหมาะสำหรับพนักงานทุกระดับ)',
    learningMethodology: 'Micro E-Learning, วิดีโอจำลองบทสนทนา, Interactive Conflict Iceberg & TKI Simulator และเวิร์กช็อปเสมือน',
    evaluationCriteria: {
      preTest: 'แบบทดสอบก่อนเรียน 10 ข้อ ประเมินความเข้าใจจิตวิทยาความขัดแย้ง',
      learningRequirement: 'เรียนจบครบทั้ง 4 บทเรียนตามลำดับ',
      miniGame: 'ทำแบบจำลองการเลือกใช้สไตล์ TKI และการสร้างประโยค I-Message',
      postTest: 'แบบทดสอบหลังเรียน 10 ข้อ เกณฑ์ผ่านไม่น้อยกว่า 80% (≥ 8/10 ข้อ)',
      certificate: 'ออกใบประกาศนียบัตรอิเล็กทรอนิกส์มาตรฐาน TCT Academy (รหัส TCT-CFM)'
    },
    expectedOutcomes: [
      'ข้อพิพาทและความขัดแย้งที่ส่งผลเสียต่อการทำงานระหว่างแผนกลดลงอย่างมีนัยสำคัญ',
      'การประสานงานและการส่งมอบกะงานเป็นไปด้วยความราบรื่นและให้เกียรติซึ่งกันและกัน',
      'บรรยากาศการทำงานเปี่ยมด้วยความไว้วางใจ ความร่วมมือ และความสุขในองค์กร'
    ],
    kpis: [
      'พนักงาน 100% ผ่านเกณฑ์การประเมินทักษะการสื่อสารเชิงบวก',
      'ดัชนีความปลอดภัยทางจิตวิทยา (Psychological Safety Score) เพิ่มขึ้นสู่ระดับ 92%',
      'อัตราการลาออกอันเนื่องมาจากปัญหาความสัมพันธ์ในที่ทำงานลดลงเป็นศูนย์'
    ],
    equipmentAndPlatform: 'ระบบ TCT Micro E-Training Web App, ระบบจำลองบทสนทนา TKI Matrix Interactive',
    documentRefNo: 'TCT-ACAD-CFM-03/2569',
    approvalDate: '30 สิงหาคม 2569'
  },
  'ai-for-tct': {
    objectives: [
      'เพื่อสร้างความรู้ความเข้าใจเรื่อง Artificial Intelligence และ Generative AI ในบริบทโรงงานอุตสาหกรรมผลิตเส้นคอร์ด TCT',
      'เพื่อสร้างวินัยการรักษาความลับข้อมูลองค์กร (Data Privacy, Corporate Information Security) และการใช้งาน TH AI Passport',
      'เพื่อฝึกฝนทักษะการเขียนคำสั่ง Prompt Engineering ด้วยโครงสร้างมาตรฐานสูตร C-T-F-T (Context, Task, Format, Tone)',
      'เพื่อประยุกต์ใช้ AI ในการเพิ่มประสิทธิภาพสายการผลิต งานจัดซื้อ ธุรการ และ QA พร้อมจัดทำแผนปฏิบัติการ 30-60-90 วัน'
    ],
    targetAudience: 'พนักงานตำแหน่ง Clerk, Leader, Supervisor, Engineer, Manager และพนักงานทุกคน 230 ท่าน',
    prerequisites: 'สามารถใช้งานคอมพิวเตอร์หรือสมาร์ทโฟนและอินเทอร์เน็ตได้',
    learningMethodology: 'E-Training Micro Learning 7 บทเรียน, ระบบจำลอง Prompt Builder Generator, เวิร์กช็อปกรณีศึกษา และคู่มือ aipass.go.th',
    evaluationCriteria: {
      preTest: 'แบบทดสอบวัดระดับความพร้อมด้าน AI (AI Readiness Pre-Test 20 ข้อ)',
      learningRequirement: 'ศึกษาครบทั้ง 7 บทเรียน และทำกิจกรรม Prompt Workshop ครบถ้วน',
      miniGame: 'ทดลองใช้เครื่องมือสร้าง Prompt จำลองในสถานการณ์โรงงาน',
      postTest: 'แบบทดสอบหลังเรียน 20 ข้อ เกณฑ์ผ่านไม่น้อยกว่า 75% (≥ 15/20 ข้อ)',
      certificate: 'ออกใบประกาศนียบัตรอิเล็กทรอนิกส์มาตรฐาน TCT Academy (รหัส TCT-AI-101)'
    },
    expectedOutcomes: [
      'บุคลากร TCT มีความรู้เท่าทันเทคโนโลยี AI และสามารถนำมาช่วยลดเวลาทำงานเอกสารได้มากกว่า 40%',
      'ความมั่นคงปลอดภัยของข้อมูลบริษัทไม่มีการรั่วไหลสู่ระบบสาธารณะ 100%',
      'องค์กรก้าวสู่การเป็น Smart Factory ที่ขับเคลื่อนด้วยข้อมูลและนวัตกรรมดิจิทัล'
    ],
    kpis: [
      'พนักงาน 230 คนผ่านการประเมินทักษะดิจิทัล AI Passport ครบ 100%',
      'มีโครงการปรับปรุงงานด้วย AI (AI Kaizen Project) เกิดขึ้นในแต่ละแผนกอย่างน้อย 1 โครงการ',
      'คะแนนเฉลี่ยการทดสอบ Post-Test สูงกว่า 85%'
    ],
    equipmentAndPlatform: 'ระบบ TCT Micro E-Learning, ระบบ TH AI Passport (aipass.go.th) และระบบแบบประเมินความพร้อม AI',
    documentRefNo: 'TCT-ACAD-AI-101/2569',
    approvalDate: '5 กันยายน 2569'
  },
  'personality-psychology': {
    objectives: [
      'เพื่อให้ผู้เข้าอบรมเข้าใจความหมายและธรรมชาติของจิตวิทยาบุคลิกภาพ (Personality Psychology) และการปรับตัวในการทำงาน',
      'เพื่อถอดรหัสพฤติกรรมมนุษย์ 4 สไตล์ตามโมเดล DISC (Dominance, Influence, Steadiness, Conscientiousness)',
      'เพื่อพัฒนาทักษะความเข้าอกเข้าใจผู้อื่น (Empathy) และหลีกเลี่ยงกับดักทางความคิดและอคติ (Cognitive Biases)',
      'เพื่อยกระดับทักษะการให้ฟีดแบ็กเชิงสร้างสรรค์ (SBI Model) และสร้างวัฒนธรรมการทำงานร่วมกันเป็นหนึ่งเดียว (One Team, One Goal)'
    ],
    targetAudience: 'พนักงานและหัวหน้างานทุกระดับ บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด ครบทั้ง 230 ท่าน',
    prerequisites: 'ไม่มี (ออกแบบสำหรับการพัฒนาบุคลากรทุกคนในองค์กร)',
    learningMethodology: 'Micro E-Learning 100% Online, วิดีโอบรรยาย 4 ตอน, แบบประเมิน DISC Simulator และกรณีศึกษาในโรงงาน',
    evaluationCriteria: {
      preTest: 'แบบทดสอบก่อนเรียน 10 ข้อ (ประเมินความเข้าใจจิตวิทยาพฤติกรรม)',
      learningRequirement: 'ศึกษาครบทั้ง 4 บทเรียนตามลำดับ',
      miniGame: 'ทำแบบจำลองสถานการณ์ปฏิสัมพันธ์กับคน 4 สไตล์ DISC',
      postTest: 'แบบทดสอบหลังเรียน 10 ข้อ เกณฑ์ผ่านไม่น้อยกว่า 80% (≥ 8/10 ข้อ)',
      certificate: 'ออกใบประกาศนียบัตรอิเล็กทรอนิกส์มาตรฐาน TCT Academy (รหัส TCT-A001)'
    },
    expectedOutcomes: [
      'พนักงานเข้าใจจุดแข็งและจุดที่ต้องปรับปรุงของตนเอง สามารถปรับตัวเข้าหาเพื่อนร่วมงานต่างสไตล์ได้อย่างราบรื่น',
      'ลดอคติและการตัดสินผู้อื่น บรรยากาศในการทำงานร่วมกันมีความเห็นอกเห็นใจและเกื้อกูลกัน',
      'ผลงานของทีมมีประสิทธิภาพสูงขึ้นด้วยการจัดวางคนให้ตรงกับบทบาทและจุดแข็ง'
    ],
    kpis: [
      'พนักงาน 230 คนผ่านเกณฑ์การประเมิน Post-Test 100%',
      'ดัชนีความสามัคคีและการทำงานร่วมกันเป็นทีม (Team Collaboration Index) เพิ่มขึ้นสู่ระดับ 95%',
      'ความพึงพอใจต่อหลักสูตรอยู่ในระดับ "ดีเยี่ยม" (≥ 4.85/5.00)'
    ],
    equipmentAndPlatform: 'ระบบ TCT Micro E-Training Platform, สื่อวิดีโอ YouTube บรรยายพิเศษ 4 บท และแบบทดสอบระบบอัตโนมัติ',
    documentRefNo: 'TCT-ACAD-A001/2569',
    approvalDate: '1 กันยายน 2569'
  },
  'kyt-shisa-kanko': {
    objectives: [
      'เพื่อให้ผู้เข้าอบรมเข้าใจจิตวิทยา Human Error และกลไกสรีรวิทยาการกระตุ้นประสาทสัมผัสทั้ง 4 (ตา-มือ-ปาก-สมอง)',
      'เพื่อฝึกฝน 4 ขั้นตอนมาตรฐานของ Shisa Kanko (1.เตรียมพร้อม -> 2.ชี้ -> 3.พูด -> 4.ยืนยัน) อย่างถูกต้องและมีสมาธิ',
      'เพื่อปรับปรุงสรีรศาสตร์ ท่ายืน การชี้ และขจัดพฤติกรรมชี้หลอกตาไร้สติ (Phantom Pointing) ให้หมดสิ้นไป',
      'เพื่อประยุกต์ใช้ใน 5 สถานการณ์จริงของโรงงาน TCT (เครื่องจักร, ติดตั้งแม่พิมพ์ Mold, LOTO, QC ตรวจเส้นคอร์ด และ 5S) สู่ Zero Accident'
    ],
    targetAudience: 'พนักงานสายการผลิตเส้นคอร์ด, ช่างเทคนิคซ่อมบำรุง, ลีดเดอร์, โฟร์แมน, จป.วิชาชีพ และพนักงานทุกคน 230 ท่าน',
    prerequisites: 'ผ่านการอบรมกฎความปลอดภัยโรงงาน TCT',
    learningMethodology: 'Micro E-Learning, วิดีโอ Google NotebookLM Deep Dive 6 ตอนเต็ม, Simulator ซ้อมมือชี้-ปากย้ำ และการฝึกปฏิบัติจริง',
    evaluationCriteria: {
      preTest: 'แบบทดสอบก่อนเรียน 20 ข้อ ประเมินหลักการ Shisa Kanko & KYT',
      learningRequirement: 'ดูวิดีโอ NotebookLM ครบทั้ง 6 ตอน และเรียนจบทุกเนื้อหา 100%',
      miniGame: 'ทำแบบจำลองสถานการณ์ KYT หน้างาน 10 สถานการณ์',
      postTest: 'แบบทดสอบหลังเรียน 20 ข้อ เกณฑ์ผ่านไม่น้อยกว่า 80% (≥ 16/20 ข้อ)',
      certificate: 'ออกใบประกาศนียบัตรอิเล็กทรอนิกส์มาตรฐาน TCT Academy (รหัส TCT-KYT-01)'
    },
    expectedOutcomes: [
      'ความผิดพลาดจากความพลั้งเผลอหรือความเคยชิน (Human Error) ลดลง 50% - 70% ตามมาตรฐานสากล',
      'พนักงานมีวินัยความปลอดภัยในการตรวจสอบเครื่องจักรและตัดแยกพลังงาน LOTO ครบ 100%',
      'วัฒนธรรมความปลอดภัยเชิงรุกฝังแน่นในระดับดีเอ็นเอของพนักงานทุกคน มุ่งสู่อุบัติเหตุเป็นศูนย์อย่างยั่งยืน'
    ],
    kpis: [
      'พนักงาน 230 คนผ่านเกณฑ์การฝึกอบรมและการทดสอบ Post-Test 100%',
      'สถิติอุบัติเหตุในโรงงานเป็นศูนย์ (0 Accidents, 0 Near Misses Unreported)',
      'การประเมินทักษะการชี้-ปากย้ำหน้างานจริงโดยหัวหน้างานผ่านเกณฑ์ระดับ "ดีเยี่ยม" 100%'
    ],
    equipmentAndPlatform: 'ระบบ TCT Micro E-Training, Google NotebookLM Video Artifacts (ครบ 6 ตอน) และระบบตรวจจับการดูวิดีโอ',
    documentRefNo: 'TCT-ACAD-KYT-01/2569',
    approvalDate: '10 กันยายน 2569'
  },
  'applied-psychology': {
    objectives: [
      'เพื่อให้ผู้เข้าอบรมเข้าใจจิตวิทยาเพื่อความสำเร็จ และปรับเปลี่ยนกรอบความคิดสู่ Growth Mindset และความเพียรพยายาม (Grit)',
      'เพื่อพัฒนาทักษะการบริหารอารมณ์หน้างาน (Emotional Agility) การจัดการความเครียดสะสม และเทคนิคการหยุดสติ 4 ขั้น S-T-O-P',
      'เพื่อสร้างพลังฟื้นคืนทางใจ (Resilience) สามารถลุกขึ้นใหม่จากความผิดพลาด และสร้างความปลอดภัยทางจิตวิทยา (Psychological Safety) ในทีม',
      'เพื่อประยุกต์ใช้โมเดลความสุข PERMA ในชีวิตการทำงานประจำวัน สร้างความผูกพัน และยกระดับความมั่นคงในอาชีพ (Job Security) ร่วมกับ TCT'
    ],
    targetAudience: 'พนักงานและหัวหน้างานทุกระดับ บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด ครบทั้ง 230 ท่าน (รอบที่ 1)',
    prerequisites: 'ไม่มี (มุ่งเน้นการสร้างสุขภาวะทางจิตวิทยาและความมั่นคงของบุคลากรทุกคน)',
    learningMethodology: 'Micro E-Learning 3 บทเรียน, วิดีโอ Google NotebookLM 3 บทเรียน, Simulator ฝึกสติ S-T-O-P และแบบทดสอบมาตรฐาน',
    evaluationCriteria: {
      preTest: 'แบบทดสอบก่อนเรียน 10 ข้อ (ประเมินความรู้ด้าน Growth Mindset & Resilience)',
      learningRequirement: 'ดูวิดีโอ Google NotebookLM ครบทั้ง 3 บทเรียน และศึกษาเนื้อหาครบถ้วน',
      miniGame: 'ทำแบบจำลองสถานการณ์ทางจิตวิทยา 10 ข้อ',
      postTest: 'แบบทดสอบหลังเรียน 10 ข้อ เกณฑ์ผ่านไม่น้อยกว่า 80% (≥ 8/10 ข้อ)',
      certificate: 'ออกใบประกาศนียบัตรอิเล็กทรอนิกส์มาตรฐาน TCT Academy (รหัส TCT-PSY-01)'
    },
    expectedOutcomes: [
      'พนักงานมีทัศนคติแบบ Growth Mindset พร้อมเรียนรู้สิ่งใหม่และมองปัญหาของเสียเป็นโอกาสในการพัฒนา',
      'ระดับความเครียดสะสมลดลง พนักงานมีเครื่องมือดึงสติหน้างาน ลดอารมณ์ฉุนเฉียวและความผิดพลาด',
      'สุขภาวะความสุขในที่ทำงาน (Well-being) สูงขึ้น มีความผูกพันและเชื่อมั่นในความมั่นคงทางอาชีพร่วมกับบริษัท TCT'
    ],
    kpis: [
      'พนักงานเข้าอบรมรอบที่ 1 ผ่านเกณฑ์การทดสอบ Post-Test 100% (≥ 8/10 คะแนน)',
      'ดัชนีความสุขในที่ทำงาน (Workplace Happiness & Well-being Index) เพิ่มขึ้นสู่ระดับ 96%',
      'อัตราการรายงานปัญหาเชิงรุกและข้อเสนอแนะ Kaizen เพิ่มขึ้นไม่น้อยกว่า 30%'
    ],
    equipmentAndPlatform: 'ระบบ TCT Micro E-Training Platform, วิดีโอ Google NotebookLM 3 บทเรียน และระบบบันทึกเวลาเรียนดิจิทัล',
    documentRefNo: 'TCT-ACAD-PSY-01/2569',
    approvalDate: '12 ตุลาคม 2569'
  }
};

export const CourseApprovalPdfModal: React.FC<CourseApprovalPdfModalProps> = ({
  initialCourseId = 'applied-psychology',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'exam' | 'summary'>('single');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>('');

  const printSingleRef = useRef<HTMLDivElement>(null);
  const printExamRef = useRef<HTMLDivElement>(null);
  const printSummaryRef = useRef<HTMLDivElement>(null);

  const [courses, setCourses] = useState<Course[]>(() => getAllAvailableCourses());
  useEffect(() => {
    const handleUpdate = () => setCourses(getAllAvailableCourses());
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('tct_courses_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('tct_courses_updated', handleUpdate);
    };
  }, []);
  const currentCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId) || courses[0];
  }, [courses, selectedCourseId]);

  const currentCourseMeta = useMemo(() => {
    const meta = COURSE_OFFICIAL_METADATA[currentCourse.id];
    if (meta) return meta;
    const dynamicModules = getCourseModules(currentCourse.id);
    return {
      title: currentCourse.thaiTitle || currentCourse.title,
      code: currentCourse.code || `TCT-${currentCourse.id.substring(0, 4).toUpperCase()}-01`,
      batch: 'รุ่นที่ 1 ประจำปี 2569',
      trainingDates: 'ประจำปี 2569',
      instructor: 'นายณฐวัตร พงษ์สาริกิจ & ทีมวิทยากร TCT Academy',
      institute: 'ศูนย์ฝึกอบรมและพัฒนา TCT Academy',
      totalModules: dynamicModules.length || currentCourse.moduleCount || 3,
      passingScorePercent: currentCourse.passingScore || 80
    };
  }, [currentCourse]);

  const currentSyllabus = useMemo((): CourseSyllabusDetail => {
    if (COURSE_SYLLABUS_DETAILS[currentCourse.id]) {
      return COURSE_SYLLABUS_DETAILS[currentCourse.id];
    }
    const modules = getCourseModules(currentCourse.id);
    const code = currentCourse.code || `TCT-${currentCourse.id.substring(0, 4).toUpperCase()}-01`;
    return {
      objectives: [
        `เพื่อให้ผู้เข้าอบรมเข้าใจหลักการและองค์ความรู้สำคัญของ${currentCourse.title}`,
        `เพื่อเสริมสร้างทักษะและสมรรถนะการปฏิบัติงานจริงตามมาตรฐาน TCT Academy`,
        `เพื่อปลูกฝังจิตสำนึกด้านคุณภาพ ความปลอดภัย และการพัฒนาอย่างต่อเนื่อง (Kaizen)`,
        `เพื่อนำความรู้และเทคนิคจากหลักสูตรไปประยุกต์ใช้เพื่อเพิ่มประสิทธิภาพการทำงานและลดความสูญเสีย`
      ],
      targetAudience: 'พนักงานฝ่ายผลิต, ช่างเทคนิค, ลีดเดอร์, เจ้าหน้าที่ และบุคลากรเป้าหมาย บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด (230 ท่าน)',
      prerequisites: 'ผ่านการอบรมปฐมนิเทศขั้นพื้นฐานขององค์กร',
      learningMethodology: 'Micro E-Learning 100% Online, วิดีโอบรรยายทางการ, สื่อการเรียนรู้เชิงโต้ตอบ และแบบทดสอบดิจิทัล',
      evaluationCriteria: {
        preTest: 'แบบทดสอบก่อนเรียน (Pre-test) วัดระดับความรู้พื้นฐาน',
        learningRequirement: `ศึกษาครบทุกบทเรียน (${modules.length} บทเรียน) 100% ตามโครงสร้างเนื้อหา`,
        miniGame: 'กิจกรรมจำลองสถานการณ์และแบบฝึกปฏิบัติผ่านเกณฑ์มาตรฐาน',
        postTest: `แบบทดสอบหลังเรียน (Post-test) เกณฑ์ผ่านไม่น้อยกว่า ${currentCourse.passingScore || 80}%`,
        certificate: `ออกใบประกาศนียบัตรอิเล็กทรอนิกส์มาตรฐาน TCT Academy (รหัส ${code})`
      },
      expectedOutcomes: [
        'ผู้เข้าอบรมสามารถนำความรู้และทักษะไปปฏิบัติงานจริงได้อย่างถูกต้อง แม่นยำ และปลอดภัย',
        'ยกระดับผลการปฏิบัติงานและมาตรฐานคุณภาพในกระบวนการทำงาน',
        'สร้างวัฒนธรรมการเรียนรู้และการพัฒนาตนเองอย่างต่อเนื่องในองค์กร'
      ],
      kpis: [
        'อัตราการผ่านการฝึกอบรมของบุคลากรเป้าหมาย 100% (230 ท่าน)',
        `คะแนนประเมินผลสัมฤทธิ์หลังเรียน (Post-test) เฉลี่ย ≥ ${currentCourse.passingScore || 80}%`,
        'ดัชนีความพึงพอใจต่อระบบการจัดการเรียนรู้อิเล็กทรอนิกส์ ≥ 4.80 จาก 5.00'
      ],
      equipmentAndPlatform: 'ระบบ TCT Micro E-Training Web Application, สมาร์ทโฟน/แท็บเล็ต/คอมพิวเตอร์ และระบบบันทึกเวลาเรียนดิจิทัล',
      documentRefNo: `${code}/2569`,
      approvalDate: 'ประจำปี 2569'
    };
  }, [currentCourse]);

  const currentModules = useMemo(() => {
    return getCourseModules(currentCourse.id);
  }, [currentCourse]);

  const currentQuestions = useMemo(() => {
    return getCourseQuestions(currentCourse.id);
  }, [currentCourse]);

  // Overall Academy Curriculum Statistics
  const academySummary = useMemo(() => {
    const totalCourses = courses.length;
    const totalModules = courses.reduce((acc, c) => acc + (getCourseModules(c.id).length || c.moduleCount || 1), 0);
    const totalHours = courses.reduce((acc, c) => acc + (c.estimatedHours || 1), 0);
    return {
      totalCourses,
      totalModules,
      totalHours,
      totalTrainees: 230,
      totalDepartments: 6, // P, E, Q, W, M, A
      systemMode: '100% Micro E-Learning & Interactive Simulator'
    };
  }, [courses]);

  // Handle Download Single PDF
  const handleDownloadSinglePdf = async () => {
    playCyberClick();
    if (!printSingleRef.current) return;
    setIsExporting(true);
    setExportMessage('กำลังสร้างไฟล์ PDF ขนาด A4 มาตรฐาน...');

    try {
      const filename = `TCT_Course_Approval_${currentCourse.code}_${new Date().toISOString().slice(0, 10)}.pdf`;
      const success = await downloadElementAsPdf(printSingleRef.current, {
        filename,
        orientation: 'portrait',
        format: 'a4',
        scale: 2.2,
        marginMm: 0,
        title: `แบบขออนุมัติหลักสูตร ${currentCourse.title}`
      });

      if (success) {
        playSuccessChime();
        setExportMessage('ดาวน์โหลดเอกสารขออนุมัติหลักสูตร (PDF) สำเร็จแล้ว!');
        setTimeout(() => setExportMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
      setExportMessage('เกิดข้อผิดพลาดในการสร้าง PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Download Exam Paper PDF
  const handleDownloadExamPdf = async () => {
    playCyberClick();
    if (!printExamRef.current) return;
    setIsExporting(true);
    setExportMessage('กำลังสร้างไฟล์ชุดข้อสอบและเฉลยขนาด A4 (PDF)...');

    try {
      const filename = `TCT_Exam_Paper_${currentCourse.code || currentCourse.id}_${new Date().toISOString().slice(0, 10)}.pdf`;
      const success = await downloadElementAsPdf(printExamRef.current, {
        filename,
        orientation: 'portrait',
        format: 'a4',
        scale: 2.2,
        marginMm: 0,
        title: `ชุดข้อสอบและเฉลย ${currentCourse.title}`
      });

      if (success) {
        playSuccessChime();
        setExportMessage('ดาวน์โหลดชุดข้อสอบและเฉลย (PDF) สำเร็จแล้ว!');
        setTimeout(() => setExportMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
      setExportMessage('เกิดข้อผิดพลาดในการสร้าง PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Download Summary PDF
  const handleDownloadSummaryPdf = async () => {
    playCyberClick();
    if (!printSummaryRef.current) return;
    setIsExporting(true);
    setExportMessage('กำลังสร้างเอกสารสรุปจำนวนและแผนผังหลักสูตรทั้งหมด (PDF)...');

    try {
      const filename = `TCT_Academy_Curriculum_Summary_All_Courses_${new Date().toISOString().slice(0, 10)}.pdf`;
      const success = await downloadElementAsPdf(printSummaryRef.current, {
        filename,
        orientation: 'portrait',
        format: 'a4',
        scale: 2.2,
        marginMm: 0,
        title: 'เอกสารสรุปหลักสูตรทั้งหมด TCT Academy'
      });

      if (success) {
        playSuccessChime();
        setExportMessage('ดาวน์โหลดเอกสารสรุปหลักสูตรทั้งหมด (PDF) สำเร็จแล้ว!');
        setTimeout(() => setExportMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
      setExportMessage('เกิดข้อผิดพลาดในการสร้าง PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Native Browser Print Dialog (Isolated Standalone Window for 100% WYSIWYG match)
  const handlePrint = () => {
    playCyberClick();
    const activeEl = activeTab === 'single'
      ? printSingleRef.current
      : activeTab === 'exam'
        ? printExamRef.current
        : printSummaryRef.current;
    if (activeEl) {
      const docTitle = activeTab === 'single'
        ? `แบบขออนุมัติหลักสูตร_${currentCourse.code}`
        : activeTab === 'exam'
          ? `ชุดข้อสอบและเฉลย_${currentCourse.code}`
          : `เอกสารสรุปหลักสูตรทั้งหมด_TCT_Academy`;
      printElementViaStandaloneWindow(activeEl, docTitle, 'portrait');
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fadeIn font-sarabun">
      <div className="bg-[#F8FAFC] border border-slate-300 w-full max-w-6xl max-h-[96vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800">
        
        {/* ========================================================= */}
        {/* TOP TOOLBAR (Hidden during print)                         */}
        {/* ========================================================= */}
        <div className="no-print bg-gradient-to-r from-[#002855] via-[#003875] to-[#005A9C] text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-400/30 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <FileText className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                  TCT ACADEMY OFFICIAL DOCUMENT SYSTEM
                </span>
                <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30 font-medium">
                  ขนาด A4 มาตรฐาน (210 × 297 mm)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide mt-0.5">
                ระบบดึงข้อมูลและพิมพ์เอกสารขออนุมัติหลักสูตร (PDF)
              </h2>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Zoom Controls */}
            <div className="hidden lg:flex items-center bg-black/20 rounded-xl p-1 border border-white/10 text-xs text-white">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
                className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer"
                title="ย่อขนาด"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px]">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
                className="p-1.5 hover:bg-white/20 rounded-lg cursor-pointer"
                title="ขยายขนาด"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
              title="พิมพ์เอกสารออกเครื่องพิมพ์ หรือบันทึกผ่านคำสั่งพิมพ์ของเบราว์เซอร์"
            >
              <Printer className="w-4 h-4 text-cyan-300" />
              <span>พิมพ์เอกสาร (Print)</span>
            </button>

            {/* Direct PDF Download Button */}
            <button
              type="button"
              onClick={activeTab === 'single' ? handleDownloadSinglePdf : activeTab === 'exam' ? handleDownloadExamPdf : handleDownloadSummaryPdf}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              title="ดาวน์โหลดเป็นไฟล์ PDF คุณภาพสูง A4"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>{isExporting ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF (A4)'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => { playCyberClick(); onClose(); }}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition-all cursor-pointer ml-1"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SUB-HEADER / TAB NAVIGATION & COURSE SELECTOR (No-Print)  */}
        {/* ========================================================= */}
        <div className="no-print bg-slate-100 border-b border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* View Mode Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => { playCyberClick(); setActiveTab('single'); }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'single'
                  ? 'bg-[#005A9C] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. โครงสร้างหลักสูตร (Course Proposal A4)</span>
            </button>

            <button
              type="button"
              onClick={() => { playCyberClick(); setActiveTab('exam'); }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'exam'
                  ? 'bg-[#005A9C] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>2. ชุดข้อสอบและเฉลย (Exam Paper & Key A4)</span>
            </button>

            <button
              type="button"
              onClick={() => { playCyberClick(); setActiveTab('summary'); }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'bg-[#005A9C] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>3. สรุปภาพรวมทุกหลักสูตร (All Courses Summary)</span>
            </button>
          </div>

          {/* Course Selector Dropdown (When in Single or Exam Mode) */}
          {(activeTab === 'single' || activeTab === 'exam') && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-600 font-bold whitespace-nowrap">เลือกหลักสูตร:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  playCyberClick();
                  setSelectedCourseId(e.target.value);
                }}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#005A9C] cursor-pointer shadow-xs max-w-[280px] sm:max-w-[340px]"
              >
                {courses.map((c, idx) => (
                  <option key={c.id} value={c.id}>
                    {idx + 1}. [{c.code}] {c.thaiTitle || c.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Export Notification Message */}
        {exportMessage && (
          <div className="no-print bg-emerald-600 text-white text-xs font-bold px-4 py-2 text-center shadow-md animate-fadeIn">
            {exportMessage}
          </div>
        )}

        {/* ========================================================= */}
        {/* DOCUMENT PREVIEW & PRINTABLE CANVAS CONTAINER              */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/70 flex justify-center">
          <div 
            style={{ 
              transform: `scale(${zoomLevel / 100})`, 
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="w-full max-w-[850px] shrink-0"
          >
            {/* ------------------------------------------------------------- */}
            {/* TAB 1: SINGLE COURSE CURRICULUM APPROVAL SPECIFICATION FORM   */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'single' && (
              <div
                ref={printSingleRef}
                id="printable-course-approval-sheet"
                className="bg-white text-slate-900 shadow-xl border border-slate-300 rounded-lg p-7 sm:p-10 space-y-6 font-sarabun text-[13px] leading-relaxed relative print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full"
                style={{ minHeight: '1120px' }}
              >
                {/* Official Corporate Header */}
                <div className="border-b-2 border-[#005A9C] pb-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <TCTLogo size="doc" showSubtitle={false} />
                    <div className="border-l-2 border-slate-300 pl-3.5 space-y-0.5">
                      <div className="text-sm font-black text-[#002855] tracking-wide">
                        บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
                      </div>
                      <div className="text-xs text-slate-600 font-semibold">
                        TEIJIN CORD (THAILAND) CO., LTD. • ศูนย์ฝึกอบรมและพัฒนาบุคลากร TCT Academy
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Personnel Development & Training Center • Corporate Learning Division
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono text-[11px] text-slate-600 space-y-1">
                    <div className="bg-slate-100 border border-slate-300 px-2.5 py-1 rounded font-bold text-[#005A9C]">
                      แบบฟอร์ม: {currentSyllabus.documentRefNo}
                    </div>
                    <div>วันที่เสนออนุมัติ: <strong>{currentSyllabus.approvalDate}</strong></div>
                    <div>สถานะ: <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">อนุมัติแล้ว (Approved)</span></div>
                  </div>
                </div>

                {/* Form Title Banner */}
                <div className="text-center py-2 bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 border-y border-blue-200">
                  <h1 className="text-base sm:text-lg font-black text-[#002855] uppercase tracking-wide">
                    แบบฟอร์มขออนุมัติโครงสร้างหลักสูตรและแผนการจัดการเรียนรู้อิเล็กทรอนิกส์
                  </h1>
                  <p className="text-xs text-slate-600 font-medium font-sans">
                    (TRAINING CURRICULUM SYLLABUS & OFFICIAL APPROVAL SPECIFICATION FORM)
                  </p>
                </div>

                {/* Section 1: General Course Information Table */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#005A9C] uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    <span>ส่วนที่ 1: ข้อมูลทั่วไปของหลักสูตร (Curriculum General Information)</span>
                  </div>

                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <tbody>
                      <tr>
                        <td className="w-1/4 bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                          รหัสหลักสูตร (Course Code):
                        </td>
                        <td className="w-1/4 p-2 font-mono font-bold text-[#005A9C] border border-slate-300">
                          {currentCourse.code}
                        </td>
                        <td className="w-1/4 bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                          หมวดหมู่วิชา (Category):
                        </td>
                        <td className="w-1/4 p-2 font-medium border border-slate-300">
                          {currentCourse.id === 'ai-for-tct' 
                            ? 'นวัตกรรมและเทคโนโลยีดิจิทัล (AI Transformation)' 
                            : currentCourse.id.includes('kyt') || currentCourse.id.includes('risk') 
                            ? 'ความปลอดภัยและมาตรฐานคุณภาพ (Quality & Safety)' 
                            : 'การบริหารและพัฒนาจิตวิทยาบุคลากร (HR & Psychology)'}
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                          ชื่อหลักสูตร (ภาษาไทย):
                        </td>
                        <td colSpan={3} className="p-2 font-bold text-slate-900 border border-slate-300 text-sm">
                          {currentCourse.thaiTitle || currentCourse.title}
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                          ชื่อหลักสูตร (ภาษาอังกฤษ):
                        </td>
                        <td colSpan={3} className="p-2 font-medium text-slate-700 italic border border-slate-300">
                          {currentCourseMeta.title}
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                          ระยะเวลาฝึกอบรม (Duration):
                        </td>
                        <td className="p-2 border border-slate-300">
                          <strong>{currentCourse.duration}</strong> ({currentCourse.estimatedHours} ชั่วโมงการเรียนรู้)
                        </td>
                        <td className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                          จำนวนบทเรียน (Modules):
                        </td>
                        <td className="p-2 border border-slate-300 font-bold">
                          {currentCourse.moduleCount} บทเรียน (Micro E-Learning)
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                          รอบและวันที่จัดอบรม:
                        </td>
                        <td className="p-2 border border-slate-300 font-semibold text-[#005A9C]">
                          {currentCourseMeta.trainingDates}
                        </td>
                        <td className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                          วิทยากรและคณะผู้สอน:
                        </td>
                        <td className="p-2 border border-slate-300 font-medium">
                          {currentCourseMeta.instructor}
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                          กลุ่มเป้าหมาย (Audience):
                        </td>
                        <td colSpan={3} className="p-2 border border-slate-300">
                          {currentSyllabus.targetAudience}
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 p-2 font-bold text-slate-700 border border-slate-300">
                          รูปแบบการจัดการเรียนรู้:
                        </td>
                        <td colSpan={3} className="p-2 border border-slate-300 font-medium text-slate-700">
                          {currentSyllabus.learningMethodology}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 2: Objectives & Expected Outcomes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Objectives */}
                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/60 space-y-2">
                    <div className="text-xs font-bold text-[#005A9C] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#005A9C]" />
                      <span>วัตถุประสงค์ของหลักสูตร (Course Objectives)</span>
                    </div>
                    <ul className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                      {currentSyllabus.objectives.map((obj, i) => (
                        <li key={i} className="leading-snug">{obj}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Expected Outcomes & KPIs */}
                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/60 space-y-2">
                    <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-700" />
                      <span>ผลลัพธ์ที่คาดหวังและตัวชี้วัด (Expected Outcomes & KPIs)</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
                      {currentSyllabus.expectedOutcomes.map((out, i) => (
                        <li key={i} className="leading-snug">{out}</li>
                      ))}
                    </ul>
                    <div className="pt-1 border-t border-slate-200 text-[11px] text-slate-600 font-medium">
                      <strong>เกณฑ์ผ่านการวัดผล (Passing Criteria):</strong> {currentCourse.passingCriteria}
                    </div>
                  </div>
                </div>

                {/* Section 3: Module Breakdown and Syllabus Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#005A9C] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      <span>ส่วนที่ 2: โครงสร้างสารบัญบทเรียนและสื่อการจัดการเรียนรู้ (Curriculum Structure)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono normal-case">
                      รวม {currentModules.length} บทเรียน ({currentQuestions.length} ข้อสอบประเมินผล)
                    </span>
                  </div>

                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-[#002855] text-white">
                        <th className="p-2 border border-slate-400 w-12 text-center">บทที่</th>
                        <th className="p-2 border border-slate-400 text-left">หัวข้อบทเรียนและสาระสำคัญ (Module Title & Content)</th>
                        <th className="p-2 border border-slate-400 w-36 text-center">สื่อและเครื่องมือเรียนรู้</th>
                        <th className="p-2 border border-slate-400 w-24 text-center">เวลา (นาที)</th>
                        <th className="p-2 border border-slate-400 w-28 text-center">การวัดผล</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentModules.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-2 border border-slate-300 text-center font-bold font-mono text-[#005A9C]">
                            0{m.id}
                          </td>
                          <td className="p-2 border border-slate-300 space-y-1">
                            <div className="font-bold text-slate-900">{m.title}</div>
                            {m.thaiTitle && (
                              <div className="text-[11px] text-slate-600">{m.thaiTitle}</div>
                            )}
                            {m.sections && m.sections.length > 0 && (
                              <div className="text-[11px] text-slate-500 space-y-0.5 pt-0.5">
                                {m.sections.map((s, idx) => (
                                  <div key={idx}>• {s.title}</div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-2 border border-slate-300 text-center text-[11px]">
                            {m.youtubeUrl && m.youtubeUrl.includes('notebook') ? (
                              <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                                <Tv className="w-3 h-3" /> NotebookLM Video
                              </span>
                            ) : m.youtubeUrl ? (
                              <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-medium">
                                <Tv className="w-3 h-3" /> Video Lecture
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                                <FileText className="w-3 h-3" /> เอกสาร & ปฏิบัติ
                              </span>
                            )}
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-mono font-medium">
                            {m.durationMinutes} นาที
                          </td>
                          <td className="p-2 border border-slate-300 text-center text-[11px]">
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                              Quiz / ข้อสอบ
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section 4: Evaluation and Certification Criteria */}
                <div className="border border-slate-300 rounded-lg p-3.5 bg-slate-50 space-y-2">
                  <div className="text-xs font-bold text-[#005A9C] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>ส่วนที่ 3: เกณฑ์การวัดและประเมินผลสัมฤทธิ์ทางการฝึกอบรม (Evaluation & Certification Criteria)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 pt-1">
                    <div className="bg-white p-2.5 rounded border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">1. แบบทดสอบ Pre-Test / Post-Test</span>
                      <span>วัดผลก่อนเรียนและหลังเรียน เกณฑ์ผ่าน <strong>{currentCourse.passingCriteria}</strong> (สามารถสอบแก้ตัวได้จนกว่าจะผ่าน)</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">2. อัตราการเรียนรู้ & กิจกรรม</span>
                      <span>เรียนจบครบ <strong>100%</strong> ของบทเรียน พร้อมทำกิจกรรม Mini-Game / KYT Simulator เสริมสร้างทักษะ</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">3. การออกใบประกาศนียบัตร</span>
                      <span>ออกวุฒิบัตรรับรองมาตรฐาน A4 อัตโนมัติ ลงนามโดยผู้บริหารและประธานที่ปรึกษาศูนย์ TCT Academy</span>
                    </div>
                  </div>
                </div>

                {/* Section 5: Official Approvals Sign-off Section (3 Signatories) */}
                <div className="border-t-2 border-[#005A9C] pt-5 space-y-3">
                  <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                    การลงนามอนุมัติหลักสูตรอย่างเป็นทางการ • ศูนย์ฝึกอบรมและพัฒนาบุคลากร TCT Academy
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center">
                    {/* Signatory 1: นาย ณฐวัตร พงษ์สาริกิจ */}
                    <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/80 flex flex-col justify-between h-44 shadow-2xs">
                      <div>
                        <div className="text-[11px] font-bold text-[#005A9C] uppercase">1. ผู้จัดทำและเสนอหลักสูตร</div>
                        <div className="text-[10px] text-slate-500">(Curriculum Proposer)</div>
                      </div>

                      <div className="my-auto py-1">
                        <div className="h-8 flex items-end justify-center">
                          {/* Blank for physical handwritten signature */}
                        </div>
                        <div className="w-36 h-px bg-slate-400 mx-auto mt-1" />
                        <div className="text-xs font-bold text-slate-900 mt-1">
                          ( นาย ณฐวัตร พงษ์สาริกิจ )
                        </div>
                        <div className="text-[10px] text-slate-600 font-medium">
                          หัวหน้าศูนย์ TCT Academy
                        </div>
                        <div className="text-[10px] text-slate-500">
                          หัวหน้าแผนกบุคคลและธุรการ Personnel
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1 font-mono">
                        วันที่: {currentSyllabus.approvalDate}
                      </div>
                    </div>

                    {/* Signatory 2: นายกิตติศักดิ์ สร้อยจิตต์ */}
                    <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/80 flex flex-col justify-between h-44 shadow-2xs">
                      <div>
                        <div className="text-[11px] font-bold text-amber-800 uppercase">2. ผู้ตรวจสอบและเห็นชอบ</div>
                        <div className="text-[10px] text-slate-500">(Curriculum Reviewer)</div>
                      </div>

                      <div className="my-auto py-1">
                        <div className="h-8 flex items-end justify-center">
                          {/* Blank for physical handwritten signature */}
                        </div>
                        <div className="w-36 h-px bg-slate-400 mx-auto mt-1" />
                        <div className="text-xs font-bold text-slate-900 mt-1">
                          ( นายกิตติศักดิ์ สร้อยจิตต์ )
                        </div>
                        <div className="text-[10px] text-slate-600 font-medium">
                          ผู้จัดการศูนย์ TCT Academy
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ผู้จัดการฝ่ายบุคคลและธุรการ
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1 font-mono">
                        วันที่: {currentSyllabus.approvalDate}
                      </div>
                    </div>

                    {/* Signatory 3: นายนพดล บำรุงเกียรติ */}
                    <div className="border-2 border-emerald-600 rounded-xl p-3 bg-emerald-50/40 flex flex-col justify-between h-44 shadow-xs">
                      <div>
                        <div className="text-[11px] font-bold text-emerald-900 uppercase">3. ผู้อนุมัติหลักสูตร</div>
                        <div className="text-[10px] text-emerald-700 font-medium">(Final Approver & Certificate Signatory)</div>
                      </div>

                      <div className="my-auto py-1">
                        <div className="h-8 flex items-end justify-center">
                          {/* Blank for physical handwritten signature */}
                        </div>
                        <div className="w-36 h-px bg-emerald-600 mx-auto mt-1" />
                        <div className="text-xs font-bold text-slate-900 mt-1">
                          ( นายนพดล บำรุงเกียรติ )
                        </div>
                        <div className="text-[10px] text-slate-800 font-bold">
                          ผู้จัดการทั่วไป และ ผู้จัดการโรงงาน
                        </div>
                        <div className="text-[10px] text-emerald-800 font-semibold">
                          ประธานที่ปรึกษาศูนย์ TCT Academy
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-600 border-t border-emerald-200 pt-1 font-mono">
                        วันที่: {currentSyllabus.approvalDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Stamp / Watermark */}
                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-200">
                  <div>TCT ACADEMY E-TRAINING CURRICULUM MANAGEMENT SYSTEM • FORM ID: {currentSyllabus.documentRefNo}</div>
                  <div>PAGE 1 OF 1 • A4 STANDARD (210 × 297 MM)</div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: EXAM PAPER & OFFICIAL ANSWER KEY (ชุดข้อสอบและเฉลย A4)  */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'exam' && (
              <div
                ref={printExamRef}
                id="printable-course-exam-sheet"
                className="bg-white text-slate-900 shadow-xl border border-slate-300 rounded-lg p-7 sm:p-10 space-y-6 font-sarabun text-[13px] leading-relaxed relative print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full"
                style={{ minHeight: '1120px' }}
              >
                {/* Official Corporate Header */}
                <div className="border-b-2 border-[#005A9C] pb-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <TCTLogo size="doc" showSubtitle={false} />
                    <div className="border-l-2 border-slate-300 pl-3.5 space-y-0.5">
                      <div className="text-sm font-black text-[#002855] tracking-wide">
                        บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
                      </div>
                      <div className="text-xs text-slate-600 font-semibold">
                        TEIJIN CORD (THAILAND) CO., LTD. • ศูนย์ฝึกอบรมและพัฒนาบุคลากร TCT Academy
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Examination Paper & Official Assessment Key • Form ID: {currentSyllabus.documentRefNo}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono text-[11px] text-slate-600 space-y-1">
                    <div className="bg-blue-50 border border-blue-300 px-2.5 py-1 rounded font-bold text-[#005A9C]">
                      รหัสหลักสูตร: {currentCourse.code || `TCT-${currentCourse.id.substring(0, 4).toUpperCase()}`}
                    </div>
                    <div>ข้อสอบทั้งหมด: <strong>{currentQuestions.length} ข้อ</strong> (เกณฑ์ผ่าน: {currentCourse.passingCriteria || '≥ 80%'})</div>
                    <div>ประเภท: <strong>แบบทดสอบวัดผล Pre-Test & Post-Test</strong></div>
                  </div>
                </div>

                {/* Form Title Banner */}
                <div className="text-center py-2.5 bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 border-y border-blue-200">
                  <h1 className="text-base sm:text-lg font-black text-[#002855] uppercase tracking-wide">
                    ชุดข้อสอบประเมินผลสัมฤทธิ์ทางการเรียนและเฉลยเกณฑ์การวัดผล (EXAM PAPER & KEY)
                  </h1>
                  <p className="text-xs text-slate-700 font-bold mt-0.5 font-sans">
                    หลักสูตร: {currentCourse.thaiTitle || currentCourse.title} ({currentCourse.code || currentCourse.id})
                  </p>
                </div>

                {/* Exam Guidelines & Passing Standards */}
                <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-2 text-xs">
                  <div className="font-bold text-[#005A9C] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>คำชี้แจงและระเบียบการทดสอบ:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 text-[11.5px]">
                    <div>• <strong>ลักษณะแบบทดสอบ:</strong> ปรนัย 4 ตัวเลือก (ก, ข, ค, ง) จำนวน {currentQuestions.length} ข้อ</div>
                    <div>• <strong>เกณฑ์ผ่านการประเมิน:</strong> {currentCourse.passingCriteria || '≥ 80%'} ({Math.ceil(currentQuestions.length * 0.8)}/{currentQuestions.length} ข้อขึ้นไป)</div>
                    <div>• <strong>การสอบแก้ตัว:</strong> สอบได้จนกว่าจะผ่านเกณฑ์มาตรฐาน โดยระบบบันทึกคะแนนสูงสุด</div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4 pt-1">
                  <div className="font-bold text-xs text-[#005A9C] uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>รายการข้อสอบจริงและเฉลยคำตอบทางการ (Official Question Bank & Answer Key):</span>
                  </div>

                  <div className="space-y-3">
                    {currentQuestions.map((q, idx) => {
                      const thaiLabels = ['ก', 'ข', 'ค', 'ง', 'จ'];
                      return (
                        <div 
                          key={q.id || idx} 
                          className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2 text-xs"
                          style={{ pageBreakInside: 'avoid' }}
                        >
                          <div className="font-bold text-slate-900 flex items-start gap-2">
                            <span className="w-6 h-6 rounded-lg bg-blue-100 text-[#005A9C] flex items-center justify-center font-mono font-bold shrink-0 text-xs">
                              {idx + 1}
                            </span>
                            <div className="pt-0.5 leading-snug">
                              {q.questionText}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 text-slate-700">
                            {q.choices.map((choice, cIdx) => {
                              const isCorrect = choice.isCorrect;
                              return (
                                <div 
                                  key={choice.id || cIdx}
                                  className={`p-2 rounded-lg border flex items-start gap-2 ${
                                    isCorrect 
                                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-semibold' 
                                      : 'bg-slate-50/60 border-slate-200'
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                    isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {thaiLabels[cIdx] || cIdx + 1}
                                  </span>
                                  <div className="pt-0.5 leading-tight flex-1">
                                    <span>{choice.text}</span>
                                    {isCorrect && (
                                      <span className="ml-1.5 text-[10px] text-emerald-700 font-bold font-mono">
                                        (เฉลยถูกต้อง ✓)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <div className="ml-8 p-2 rounded-lg bg-blue-50/60 border border-blue-200/60 text-[11px] text-blue-900 leading-relaxed">
                              <strong>💡 คำอธิบายและหลักคิด Kaizen:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Signatories at bottom of Exam Paper */}
                <div className="border-t-2 border-[#005A9C] pt-4 space-y-3" style={{ pageBreakInside: 'avoid' }}>
                  <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-700">
                    การรับรองความถูกต้องของชุดข้อสอบและเกณฑ์ประเมิน • TCT Academy
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                    <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                      <div className="text-[10px] text-slate-500">ผู้ออกและตรวจสอบข้อสอบ</div>
                      <div className="h-6" />
                      <div className="font-bold text-slate-900">( นาย ณฐวัตร พงษ์สาริกิจ )</div>
                      <div className="text-[10px] text-slate-500">หัวหน้าศูนย์ TCT Academy</div>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                      <div className="text-[10px] text-slate-500">ผู้ตรวจสอบมาตรฐาน</div>
                      <div className="h-6" />
                      <div className="font-bold text-slate-900">( นายกิตติศักดิ์ สร้อยจิตต์ )</div>
                      <div className="text-[10px] text-slate-500">ผู้จัดการศูนย์ TCT Academy</div>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                      <div className="text-[10px] text-slate-500">ผู้อนุมัติชุดข้อสอบ</div>
                      <div className="h-6" />
                      <div className="font-bold text-slate-900">( นายนพดล บำรุงเกียรติ )</div>
                      <div className="text-[10px] text-slate-500">ประธานที่ปรึกษาศูนย์ TCT Academy</div>
                    </div>
                  </div>
                </div>

                {/* Footer Stamp */}
                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-200">
                  <div>TCT ACADEMY EXAM SPECIFICATION DOSSIER • {currentSyllabus.documentRefNo}</div>
                  <div>PAGE 1 OF 1 • A4 STANDARD (210 × 297 MM)</div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 3: ALL COURSES COMPREHENSIVE SUMMARY & PORTFOLIO REPORT   */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'summary' && (
              <div
                ref={printSummaryRef}
                id="printable-courses-portfolio-sheet"
                className="bg-white text-slate-900 shadow-xl border border-slate-300 rounded-lg p-7 sm:p-10 space-y-6 font-sarabun text-[13px] leading-relaxed relative print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full"
                style={{ minHeight: '1120px' }}
              >
                {/* Official Corporate Header */}
                <div className="border-b-2 border-[#005A9C] pb-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <TCTLogo size="doc" showSubtitle={false} />
                    <div className="border-l-2 border-slate-300 pl-3.5 space-y-0.5">
                      <div className="text-sm font-black text-[#002855] tracking-wide">
                        บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
                      </div>
                      <div className="text-xs text-slate-600 font-semibold">
                        TEIJIN CORD (THAILAND) CO., LTD. • ศูนย์ฝึกอบรมและพัฒนาบุคลากร TCT Academy
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Personnel Development & Training Center • Annual Training Portfolio
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono text-[11px] text-slate-600 space-y-1">
                    <div className="bg-blue-50 border border-blue-300 px-2.5 py-1 rounded font-bold text-[#005A9C]">
                      รหัสแฟ้ม: TCT-ACAD-PORTFOLIO-2569
                    </div>
                    <div>ข้อมูล ณ วันที่: <strong>{new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></div>
                    <div>สถานะ: <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">อนุมัติหลักสูตรครบ 100%</span></div>
                  </div>
                </div>

                {/* Form Title Banner */}
                <div className="text-center py-2.5 bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 border-y border-blue-200">
                  <h1 className="text-base sm:text-lg font-black text-[#002855] uppercase tracking-wide">
                    เอกสารสรุปจำนวนและรายละเอียดหลักสูตรฝึกอบรมทั้งหมดของศูนย์ TCT Academy
                  </h1>
                  <p className="text-xs text-slate-600 font-medium font-sans">
                    (COMPREHENSIVE TRAINING CURRICULUM PORTFOLIO & SPECIFICATION SUMMARY REPORT)
                  </p>
                </div>

                {/* Executive KPI Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="border border-blue-200 bg-blue-50/70 rounded-xl p-3 shadow-2xs">
                    <div className="text-xs text-blue-800 font-bold">จำนวนหลักสูตรทั้งหมด</div>
                    <div className="text-2xl font-black text-[#002855] mt-0.5">{academySummary.totalCourses}</div>
                    <div className="text-[10px] text-slate-500">หลักสูตรมาตรฐานองค์กร</div>
                  </div>

                  <div className="border border-teal-200 bg-teal-50/70 rounded-xl p-3 shadow-2xs">
                    <div className="text-xs text-teal-800 font-bold">จำนวนบทเรียนรวม</div>
                    <div className="text-2xl font-black text-teal-900 mt-0.5">{academySummary.totalModules}</div>
                    <div className="text-[10px] text-slate-500">Micro Learning Modules</div>
                  </div>

                  <div className="border border-amber-200 bg-amber-50/70 rounded-xl p-3 shadow-2xs">
                    <div className="text-xs text-amber-800 font-bold">ชั่วโมงเรียนรู้รวม</div>
                    <div className="text-2xl font-black text-amber-900 mt-0.5">{academySummary.totalHours}</div>
                    <div className="text-[10px] text-slate-500">ชั่วโมงอบรม (Hours)</div>
                  </div>

                  <div className="border border-emerald-200 bg-emerald-50/70 rounded-xl p-3 shadow-2xs">
                    <div className="text-xs text-emerald-800 font-bold">บุคลากรเป้าหมาย</div>
                    <div className="text-2xl font-black text-emerald-900 mt-0.5">{academySummary.totalTrainees}</div>
                    <div className="text-[10px] text-slate-500">พนักงานทุกฝ่าย (100%)</div>
                  </div>
                </div>

                {/* All Courses Detailed Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#005A9C] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      <span>ตารางแสดงรายละเอียดโครงสร้างทั้ง {courses.length} หลักสูตรของศูนย์ TCT Academy</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono normal-case">
                      พ.ร.บ. ส่งเสริมการพัฒนาฝีมือแรงงาน พ.ศ. 2545
                    </span>
                  </div>

                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-[#002855] text-white">
                        <th className="p-2 border border-slate-400 w-10 text-center">ลำดับ</th>
                        <th className="p-2 border border-slate-400 w-24 text-center">รหัสหลักสูตร</th>
                        <th className="p-2 border border-slate-400 text-left">ชื่อหลักสูตร (ไทย - อังกฤษ)</th>
                        <th className="p-2 border border-slate-400 w-16 text-center">บทเรียน</th>
                        <th className="p-2 border border-slate-400 w-16 text-center">เวลา (ชม.)</th>
                        <th className="p-2 border border-slate-400 w-28 text-center">รอบ/วันที่จัดอบรม</th>
                        <th className="p-2 border border-slate-400 w-24 text-center">เกณฑ์ผ่าน</th>
                        <th className="p-2 border border-slate-400 w-32 text-left">วิทยากร/ผู้รับผิดชอบ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c, idx) => {
                        const meta = COURSE_OFFICIAL_METADATA[c.id];
                        return (
                          <tr key={c.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="p-2 border border-slate-300 text-center font-bold text-slate-700">
                              {idx + 1}
                            </td>
                            <td className="p-2 border border-slate-300 text-center font-mono font-bold text-[#005A9C]">
                              {c.code || `TCT-${c.id.substring(0, 4).toUpperCase()}`}
                            </td>
                            <td className="p-2 border border-slate-300 space-y-0.5">
                              <div className="font-bold text-slate-900">{c.thaiTitle || c.title}</div>
                              <div className="text-[10px] text-slate-500 italic line-clamp-1">{c.description || 'หลักสูตรพัฒนาศักยภาพบุคลากร TCT Academy'}</div>
                            </td>
                            <td className="p-2 border border-slate-300 text-center font-bold text-blue-900">
                              {c.moduleCount || getCourseModules(c.id).length || 1} บท
                            </td>
                            <td className="p-2 border border-slate-300 text-center font-mono">
                              {c.estimatedHours || 1}
                            </td>
                            <td className="p-2 border border-slate-300 text-center text-[11px] font-medium text-slate-700">
                              {meta?.trainingDates || 'ประจำปี 2569'}
                            </td>
                            <td className="p-2 border border-slate-300 text-center font-mono text-[11px] font-bold text-emerald-800">
                              {c.passingCriteria || `≥ ${c.passingScore || 80}%`}
                            </td>
                            <td className="p-2 border border-slate-300 text-[11px] text-slate-700">
                              {meta?.instructor ? meta.instructor.split('&')[0].trim() : 'ทีมวิทยากร TCT Academy'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Academy Curriculum Competency Roadmap */}
                <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-2">
                  <div className="text-xs font-bold text-[#002855] flex items-center gap-1.5 uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4 text-[#005A9C]" />
                    <span>แผนผังเส้นทางการพัฒนาบุคลากร TCT Academy (Competency Roadmap)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded border border-blue-200">
                      <span className="text-[10px] font-bold text-[#005A9C] block">LEVEL 1</span>
                      <strong className="text-slate-900 text-[11px] block">Quality & Safety</strong>
                      <span className="text-[10px] text-slate-500">QSRM & Shisa Kanko</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-purple-200">
                      <span className="text-[10px] font-bold text-purple-700 block">LEVEL 2</span>
                      <strong className="text-slate-900 text-[11px] block">CBM & Engineering</strong>
                      <span className="text-[10px] text-slate-500">Advanced Maintenance</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-amber-200">
                      <span className="text-[10px] font-bold text-amber-700 block">LEVEL 3</span>
                      <strong className="text-slate-900 text-[11px] block">Team & Collaboration</strong>
                      <span className="text-[10px] text-slate-500">Conflict & DISC Model</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-700 block">LEVEL 4</span>
                      <strong className="text-slate-900 text-[11px] block">Digital & AI Skills</strong>
                      <span className="text-[10px] text-slate-500">AI for TCT Organization</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-teal-200">
                      <span className="text-[10px] font-bold text-teal-700 block">LEVEL 5</span>
                      <strong className="text-slate-900 text-[11px] block">Wellbeing & Stability</strong>
                      <span className="text-[10px] text-slate-500">จิตวิทยาประยุกต์ในงาน</span>
                    </div>
                  </div>
                </div>

                {/* Sign-off Approval on Overall Curriculum Portfolio */}
                <div className="border-t-2 border-[#005A9C] pt-5 space-y-3">
                  <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                    การลงนามอนุมัติแฟ้มหลักสูตรทั้งหมดประจำปี 2569 • ศูนย์ฝึกอบรมและพัฒนาบุคลากร TCT Academy
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center">
                    {/* Signatory 1: นาย ณฐวัตร พงษ์สาริกิจ */}
                    <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/80 flex flex-col justify-between h-44 shadow-2xs">
                      <div>
                        <div className="text-[11px] font-bold text-[#005A9C] uppercase">1. ผู้จัดทำและเสนอแผนหลักสูตร</div>
                        <div className="text-[10px] text-slate-500">(Curriculum Portfolio Proposer)</div>
                      </div>

                      <div className="my-auto py-1">
                        <div className="h-8 flex items-end justify-center">
                          {/* Blank for physical handwritten signature */}
                        </div>
                        <div className="w-36 h-px bg-slate-400 mx-auto mt-1" />
                        <div className="text-xs font-bold text-slate-900 mt-1">
                          ( นาย ณฐวัตร พงษ์สาริกิจ )
                        </div>
                        <div className="text-[10px] text-slate-600 font-medium">
                          หัวหน้าศูนย์ TCT Academy
                        </div>
                        <div className="text-[10px] text-slate-500">
                          หัวหน้าแผนกบุคคลและธุรการ Personnel
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1 font-mono">
                        วันที่: {new Date().toLocaleDateString('th-TH')}
                      </div>
                    </div>

                    {/* Signatory 2: นายกิตติศักดิ์ สร้อยจิตต์ */}
                    <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/80 flex flex-col justify-between h-44 shadow-2xs">
                      <div>
                        <div className="text-[11px] font-bold text-amber-800 uppercase">2. ผู้ตรวจสอบและเห็นชอบ</div>
                        <div className="text-[10px] text-slate-500">(Curriculum Portfolio Reviewer)</div>
                      </div>

                      <div className="my-auto py-1">
                        <div className="h-8 flex items-end justify-center">
                          {/* Blank for physical handwritten signature */}
                        </div>
                        <div className="w-36 h-px bg-slate-400 mx-auto mt-1" />
                        <div className="text-xs font-bold text-slate-900 mt-1">
                          ( นายกิตติศักดิ์ สร้อยจิตต์ )
                        </div>
                        <div className="text-[10px] text-slate-600 font-medium">
                          ผู้จัดการศูนย์ TCT Academy
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ผู้จัดการฝ่ายบุคคลและธุรการ
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1 font-mono">
                        วันที่: {new Date().toLocaleDateString('th-TH')}
                      </div>
                    </div>

                    {/* Signatory 3: นายนพดล บำรุงเกียรติ */}
                    <div className="border-2 border-emerald-600 rounded-xl p-3 bg-emerald-50/40 flex flex-col justify-between h-44 shadow-xs">
                      <div>
                        <div className="text-[11px] font-bold text-emerald-900 uppercase">3. ผู้อนุมัติแผนหลักสูตร</div>
                        <div className="text-[10px] text-emerald-700 font-medium">(Final Approver & Certificate Signatory)</div>
                      </div>

                      <div className="my-auto py-1">
                        <div className="h-8 flex items-end justify-center">
                          {/* Blank for physical handwritten signature */}
                        </div>
                        <div className="w-36 h-px bg-emerald-600 mx-auto mt-1" />
                        <div className="text-xs font-bold text-slate-900 mt-1">
                          ( นายนพดล บำรุงเกียรติ )
                        </div>
                        <div className="text-[10px] text-slate-800 font-bold">
                          ผู้จัดการทั่วไป และ ผู้จัดการโรงงาน
                        </div>
                        <div className="text-[10px] text-emerald-800 font-semibold">
                          ประธานที่ปรึกษาศูนย์ TCT Academy
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-600 border-t border-emerald-200 pt-1 font-mono">
                        วันที่: {new Date().toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Stamp / Watermark */}
                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-200">
                  <div>TCT ACADEMY PORTFOLIO SUMMARY REPORT • TCT-ACAD-PORTFOLIO-2569</div>
                  <div>PAGE 1 OF 1 • A4 STANDARD (210 × 297 MM)</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM STATUS BAR (No-Print)                              */}
        {/* ========================================================= */}
        <div className="no-print bg-white border-t border-slate-200 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              หลักสูตรทั้งหมด ออกแบบและพัฒนาโดย <strong>ศูนย์ฝึกอบรมและพัฒนา TCT Academy</strong> ลงนามและอนุมัติโดย 3 ผู้บริหาร
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-400 hidden sm:inline">
              ISO 9001 / IATF 16949 / ISO 45001 COMPLIANT
            </span>
            <button
              type="button"
              onClick={() => { playCyberClick(); onClose(); }}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-all"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
