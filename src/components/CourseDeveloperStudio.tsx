import React, { useState, useRef } from 'react';
import { 
  Course, 
  CourseModule, 
  Question, 
  Choice, 
  CourseFormatType, 
  CourseAttachment, 
  SopStep, 
  AdultLearningPlan,
  TraineeRecord
} from '../types';
import { 
  getStoredCustomCourses, 
  saveCustomCourse, 
  deleteCustomCourse, 
  CustomCourseData 
} from '../utils/courseManager';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  Tv, 
  FileQuestion, 
  Sparkles, 
  CheckCircle2, 
  Layers,
  Award,
  Video,
  Upload,
  FileSpreadsheet,
  Download,
  FileText,
  Play,
  Pause,
  RotateCcw,
  Eye,
  ListOrdered,
  BrainCircuit,
  GraduationCap,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  FileDown,
  UserCheck,
  Users,
  Search,
  ExternalLink,
  ChevronRight,
  MonitorPlay,
  Film
} from 'lucide-react';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';
import * as XLSX from 'xlsx';
import { enrollEmployeesInCourse } from '../utils/courseTraineeHelper';
import { addStoredAuditLog, getStoredTrainees } from '../data/traineeData';

interface CourseDeveloperStudioProps {
  onCourseCreatedOrUpdated?: () => void;
  onSelectCourse?: (courseId: string) => void;
}

interface EditableModule {
  id: number;
  thaiTitle: string;
  description: string;
  youtubeUrl: string;
  videoFilename?: string;
  durationMinutes: number;
  checkpoints?: { timeSec: number; question: string }[];
}

interface EditableQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctChoiceIndex: number;
  explanation: string;
  points?: number;
}

interface ParsedEmployeeRow {
  empId: string;
  fullName: string;
  department: string;
  position: string;
  division?: string;
  yearsOfService?: string;
}

export const CourseDeveloperStudio: React.FC<CourseDeveloperStudioProps> = ({
  onCourseCreatedOrUpdated,
  onSelectCourse
}) => {
  const [customCourses, setCustomCourses] = useState<CustomCourseData[]>(() => getStoredCustomCourses());
  const [isCreating, setIsCreating] = useState(false);
  const [lastSavedCourseId, setLastSavedCourseId] = useState<string>('');
  const [deletingCourse, setDeletingCourse] = useState<{ id: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'format_info' | 'modules' | 'questions' | 'videos' | 'files' | 'roster' | 'transfer'>('format_info');

  // 1. Course Basic Information & Pedagogical Format
  const [courseFormat, setCourseFormat] = useState<CourseFormatType>('standard_elearning');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSlug, setCourseSlug] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseBadge, setCourseBadge] = useState('หลักสูตรพัฒนาบุคลากร');
  const [passingScore, setPassingScore] = useState<number>(8);
  const [developerName, setDeveloperName] = useState('ฝ่ายพัฒนาหลักสูตร TCT');
  const [courseImageUrl, setCourseImageUrl] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80');
  const [isConfidential, setIsConfidential] = useState(false);

  // 2. Video Media States
  const [mainVideoUrl, setMainVideoUrl] = useState('');
  const [uploadedVideoBlobUrl, setUploadedVideoBlobUrl] = useState<string | null>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState<string>('');
  const videoInputRef = useRef<HTMLInputElement>(null);

  // 3. Modules List (for E-Learning and Active VDO)
  const [modules, setModules] = useState<EditableModule[]>([
    {
      id: 1,
      thaiTitle: 'บทที่ 1: หลักการและแนวทางปฏิบัติเบื้องต้น',
      description: 'เรียนรู้แนวคิดและมาตรฐานการปฏิบัติงานที่ถูกต้องสำหรับพนักงาน TCT',
      youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      durationMinutes: 10,
      checkpoints: [{ timeSec: 120, question: 'คุณเข้าใจหลักการพื้นฐานข้อใดมากที่สุด?' }]
    }
  ]);

  // 4. Questions List (Pre-test / Post-test)
  const [questions, setQuestions] = useState<EditableQuestion[]>([
    {
      id: 1,
      questionText: 'ข้อใดเป็นเป้าหมายสำคัญที่สุดในการควบคุมคุณภาพและความปลอดภัยในการทำงานของ TCT?',
      options: [
        'การส่งมอบสินค้าตรงเวลาและไร้อุบัติเหตุ (Zero Defect & Zero Accident)',
        'การเพิ่มต้นทุนการผลิตให้สูงสุด',
        'การลดขั้นตอนการตรวจสอบเพื่อประหยัดเวลา',
        'การทำงานโดยไม่ต้องสวมใส่อุปกรณ์ PPE'
      ],
      correctChoiceIndex: 0,
      explanation: 'เป้าหมายสูงสุดคือคุณภาพสินค้าเส้นด้ายคอร์ดที่สมบูรณ์และพนักงานปลอดภัย 100%'
    },
    {
      id: 2,
      questionText: 'เมื่อพบจุดผิดปกติหรือความเสี่ยงในสายการผลิต ควรดำเนินการอย่างไรเป็นอันดับแรก?',
      options: [
        'หยุด แจ้ง ปรึกษาหัวหน้างานทันที (Stop, Call, Wait)',
        'ปล่อยผ่านไปก่อนจนกว่างานจะเสร็จสิ้น',
        'พยายามแก้ไขเองโดยไม่แจ้งใคร',
        'บันทึกไว้ในใจแล้วกลับบ้าน'
      ],
      correctChoiceIndex: 0,
      explanation: 'หลักการ Stop Call Wait ช่วยระงับความเสียหายและป้องกันอุบัติเหตุรุนแรงได้อย่างทันท่วงที'
    }
  ]);

  // 5. SOP Teachme Biz Steps List
  const [sopSteps, setSopSteps] = useState<SopStep[]>([
    {
      id: 1,
      stepNumber: 1,
      title: 'ขั้นตอนที่ 1: ตรวจสอบอุปกรณ์ PPE และพื้นที่ปฏิบัติงาน (Pre-operation Check)',
      actionDetails: 'สวมหมวกนิรภัย แว่นตานิรภัย ถุงมือกันบาด และรองเท้าหัวเหล็ก ตรวจสอบไฟเตือนเครื่องจักรและสิ่งกีดขวาง',
      keySafetyPoint: 'ต้องตรวจสอบระบบ LOTO และสวิตช์ Emergency Stop ก่อนเข้าใกล้เครื่องจักร',
      qualityStandard: 'พื้นที่ต้องสะอาดตามมาตรฐาน 5ส ปราศจากเศษด้ายและคราบน้ำมัน',
      imageUrl: '',
      videoUrl: ''
    },
    {
      id: 2,
      stepNumber: 2,
      title: 'ขั้นตอนที่ 2: การป้อนเส้นด้ายเข้าชุดเกลียว (Threading & Twisting Setup)',
      actionDetails: 'ร้อยเส้นด้ายตามแผนผัง Guideline ตรวจสอบความตึงของเส้นด้ายและระดับแรงดึง Tension ตาม Spec',
      keySafetyPoint: 'ห้ามใช้นิ้วมือสัมผัสลูกกลิ้งหมุนเร็วขณะเปิดเครื่องเด็ดขาด',
      qualityStandard: 'ค่าความตึงต้องอยู่ในเกณฑ์มาตรฐาน ± 2% ตามสเปกของโรงงาน',
      imageUrl: '',
      videoUrl: ''
    }
  ]);

  // 6. Adult Learning Plan
  const [adultLearningPlan, setAdultLearningPlan] = useState<AdultLearningPlan>({
    caseStudyTitle: 'กรณีศึกษา: การแก้ปัญหาเครื่องจักรหยุดฉุกเฉินและการลดของเสียในกะผลิต',
    scenarioDescription: 'พบเครื่องปั่นเกลียวเส้นด้ายมีความร้อนสะสมที่ตลับลูกปืนเกินเกณฑ์มาตรฐาน ทำให้เกิดเส้นด้ายขาดซ้ำซาก',
    problemPrompt: 'ในฐานะพนักงานหน้างาน ท่านจะใช้ประสบการณ์และเครื่องมือใดในการวิเคราะห์หาสาเหตุที่แท้จริง (Root Cause)?',
    reflectionQuestions: [
      '1. ปัญหาดังกล่าวเกิดขึ้นจาก Human Error หรือ Machine Condition?',
      '2. หากท่านเป็นหัวหน้างาน จะสื่อสารและวางแผนแก้ไขร่วมกับทีมงานอย่างไร?',
      '3. บทเรียนที่ได้นำไปประยุกต์ใช้เพื่อป้องกันปัญหาซ้ำใน 30 วันข้างหน้าคืออะไร?'
    ],
    actionPlan30DaysGuidelines: 'จัดทำแผนปฏิบัติการ 30 วัน: ติดตามอุณหภูมิตลับลูกปืนทุกกะ, บันทึก Logbook และนำเสนอในที่ประชุมย่อย (Morning Talk)'
  });

  // 7. Course Attachments / Handouts (PDF, Work Instructions, SOP Manuals)
  const [attachments, setAttachments] = useState<CourseAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 8. Roster Upload States
  const [parsedEmployees, setParsedEmployees] = useState<ParsedEmployeeRow[]>([]);
  const [rosterImportSuccessMsg, setRosterImportSuccessMsg] = useState('');
  const rosterFileInputRef = useRef<HTMLInputElement>(null);

  // 9. Notifications
  const [notification, setNotification] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Course Formats Metadata
  const COURSE_FORMATS: {
    id: CourseFormatType;
    titleTh: string;
    titleEn: string;
    descriptionTh: string;
    badgeColor: string;
    icon: any;
    features: string[];
  }[] = [
    {
      id: 'active_vdo_learning',
      titleTh: 'Active VDO Learning Machine',
      titleEn: 'Interactive Video-First Training',
      descriptionTh: 'ระบบการเรียนรู้ผ่านวิดีโอเชิงรุก ตรวจจับการรับชม มีคำถามเช็กพ้อยท์แทรกหยุดวิดีโอเพื่อทดสอบความเข้าใจทันที',
      badgeColor: 'bg-rose-50 border-rose-300 text-rose-800',
      icon: Film,
      features: ['อัปโหลดไฟล์คลิป/ลิงก์วิดีโอ', 'Checkpoint แทรกตามเวลา', 'เครื่องเล่นวิดีโอในตัว', 'วัดเวลาดูจริง']
    },
    {
      id: 'adult_learning',
      titleTh: 'Adult Learning (Andragogy)',
      titleEn: 'Experiential & Problem-Based Learning',
      descriptionTh: 'การเรียนรู้สำหรับผู้ใหญ่ เน้นกรณีศึกษาจริงในโรงงาน การสะท้อนความคิด และแผนการนำไปปฏิบัติงานจริง 30 วัน',
      badgeColor: 'bg-amber-50 border-amber-300 text-amber-900',
      icon: BrainCircuit,
      features: ['กรณีศึกษาหน้างาน (Case Study)', 'แบบสอบถามสะท้อนคิด', 'แผนปฏิบัตินำไปใช้ 30 วัน', 'แลกเปลี่ยนความรู้']
    },
    {
      id: 'standard_elearning',
      titleTh: 'Course E-Learning',
      titleEn: 'Standard Corporate E-Learning',
      descriptionTh: 'หลักสูตรอีเลิร์นนิงมาตรฐาน บทเรียนมัลติมีเดีย แบบทดสอบก่อนเรียน/หลังเรียน และเกณฑ์ออกใบประกาศนียบัตรดิจิทัล',
      badgeColor: 'bg-blue-50 border-blue-300 text-[#003875]',
      icon: GraduationCap,
      features: ['โครงสร้างบทเรียนมาตรฐาน', 'Pre-test & Post-test (80%)', 'เกียรติบัตรดิจิทัล A4', 'รายงานผลประเมิน']
    },
    {
      id: 'sop_teachme_biz',
      titleTh: 'SOP Teachme biz Training',
      titleEn: 'Visual Standard Operating Procedure',
      descriptionTh: 'การฝึกอบรมคู่มือปฏิบัติการมาตรฐานแบบเห็นภาพ (Visual SOP) มีภาพ/คลิปประกอบจุดวิกฤตความปลอดภัยและคุณภาพ',
      badgeColor: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      icon: ListOrdered,
      features: ['ขั้นตอนปฏิบัติทีละสเต็ป', 'จุดวิกฤตความปลอดภัย (Safety)', 'มาตรฐานคุณภาพ (Quality)', 'เช็กลิสต์ตรวจหน้างาน']
    }
  ];

  // =========================================================================
  // HANDLERS: VIDEO FILE UPLOAD
  // =========================================================================
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playSuccessChime();
    const url = URL.createObjectURL(file);
    setUploadedVideoBlobUrl(url);
    setUploadedVideoName(file.name);
    setMainVideoUrl(url);
    setSuccessNotice(`อัปโหลดไฟล์วิดีโอ "${file.name}" เรียบร้อยแล้ว (ขนาด: ${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  // =========================================================================
  // HANDLERS: ATTACHMENTS (PDF, Work Instructions, SOP Manuals)
  // =========================================================================
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    playSuccessChime();
    const fileList = Array.from(files) as File[];
    const newItems: CourseAttachment[] = fileList.map((file, idx) => ({
      id: `att-${Date.now()}-${idx}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type || 'application/octet-stream',
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toLocaleDateString('th-TH')
    }));

    setAttachments([...attachments, ...newItems]);
    setSuccessNotice(`เพิ่มไฟล์แนบ ${newItems.length} รายการเรียบร้อยแล้ว`);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  const handleRemoveAttachment = (id: string) => {
    playCyberClick();
    setAttachments(attachments.filter(a => a.id !== id));
  };

  // =========================================================================
  // HANDLERS: ROSTER UPLOAD (EXCEL .xlsx / CSV / JSON)
  // =========================================================================
  const handleRosterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.name.endsWith('.json')) {
      reader.onload = (evt) => {
        try {
          const json = JSON.parse(evt.target?.result as string);
          if (Array.isArray(json)) {
            const mapped: ParsedEmployeeRow[] = json.map(item => ({
              empId: String(item.empId || item['รหัสพนักงาน'] || '').trim().toUpperCase(),
              fullName: String(item.fullName || item['ชื่อนามสกุล'] || item['ชื่อ-นามสกุล'] || item.name || '').trim(),
              department: String(item.department || item['แผนก'] || 'P').trim(),
              position: String(item.position || item['ตำแหน่ง'] || 'Worker').trim(),
              division: String(item.division || item['ฝ่าย'] || 'ฝ่ายผลิต').trim(),
              yearsOfService: String(item.yearsOfService || item.tenure || item['อายุงาน'] || '1 ปี').trim()
            })).filter(r => r.empId);

            setParsedEmployees(mapped);
            playSuccessChime();
            setRosterImportSuccessMsg(`พบรายชื่อพนักงาน ${mapped.length} คน จากไฟล์ JSON`);
          }
        } catch (err) {
          playErrorBuzz();
          alert('ไม่สามารถอ่านไฟล์ JSON ได้ กรุณาตรวจสอบรูปแบบ');
        }
      };
      reader.readAsText(file);
    } else {
      // Excel (.xlsx, .xls) or CSV
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet);

          const mapped: ParsedEmployeeRow[] = rawRows.map(row => {
            const empId = String(row['รหัสพนักงาน'] || row['EmpID'] || row['empId'] || row['ID'] || row['รหัส'] || '').trim().toUpperCase();
            const fullName = String(row['ชื่อ-นามสกุล'] || row['ชื่อนามสกุล'] || row['ชื่อ นามสกุล'] || row['FullName'] || row['Name'] || row['ชื่อ'] || '').trim();
            const department = String(row['แผนก'] || row['Department'] || row['Dept'] || 'P').trim();
            const position = String(row['ตำแหน่ง'] || row['Position'] || 'Worker').trim();
            const division = String(row['ฝ่าย'] || row['Division'] || 'ฝ่ายผลิต').trim();
            const yearsOfService = String(row['อายุงาน'] || row['YearsOfService'] || row['Tenure'] || '1 ปี').trim();

            return { empId, fullName, department, position, division, yearsOfService };
          }).filter(r => r.empId);

          setParsedEmployees(mapped);
          playSuccessChime();
          setRosterImportSuccessMsg(`อ่านไฟล์ Excel/CSV สำเร็จ! พบรายชื่อที่ถูกต้อง ${mapped.length} ท่าน`);
        } catch (err) {
          playErrorBuzz();
          alert('ไม่สามารถอ่านไฟล์ Excel ได้ กรุณาตรวจสอบไฟล์');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleApplyImportedRosterToCourse = () => {
    if (parsedEmployees.length === 0) return;
    playSuccessChime();

    const targetCourseId = courseSlug.trim() || 'custom-course';
    const empIds = parsedEmployees.map(p => p.empId);

    enrollEmployeesInCourse(targetCourseId, empIds);
    addStoredAuditLog({
      empId: 'ADMIN',
      action: 'admin_imported',
      detail: `อัปโหลดรายชื่อพนักงานเข้าหลักสูตร ${courseTitle || targetCourseId} จำนวน ${empIds.length} คน`
    });

    setSuccessNotice(`✅ แอดรายชื่อพนักงาน ${empIds.length} ท่านเข้าสู่หลักสูตรเรียบร้อยแล้ว!`);
    setTimeout(() => setSuccessNotice(''), 5000);
  };

  const handleExportRosterTemplate = () => {
    playCyberClick();
    const templateData = [
      { 'รหัสพนักงาน': '18078', 'ชื่อ-นามสกุล': 'นาย สุรศักดิ์ ใจดี', 'แผนก': 'P', 'ตำแหน่ง': 'Leader', 'ฝ่าย': 'ฝ่ายผลิต', 'อายุงาน': '3 ปี 6 เดือน' },
      { 'รหัสพนักงาน': '97016', 'ชื่อ-นามสกุล': 'นาง ประไพ คงเพียรธรรม', 'แผนก': 'QA', 'ตำแหน่ง': 'Supervisor', 'ฝ่าย': 'ฝ่ายประกันและควบคุมคุณภาพ', 'อายุงาน': '5 ปี' },
      { 'รหัสพนักงาน': '00021', 'ชื่อ-นามสกุล': 'นาย กิตติศักดิ์ สร้อยจิตต์', 'แผนก': 'PS', 'ตำแหน่ง': 'Manager', 'ฝ่าย': 'ฝ่ายบุคคลและธุรการ', 'อายุงาน': '10 ปี' }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'รายชื่อพนักงาน');
    XLSX.writeFile(wb, 'TCT_Employee_Roster_Template.xlsx');
  };

  // =========================================================================
  // HANDLERS: COURSE MODULES & QUESTIONS & SOP STEPS
  // =========================================================================
  const handleAddModule = () => {
    playCyberClick();
    const newId = modules.length + 1;
    setModules([
      ...modules,
      {
        id: newId,
        thaiTitle: `บทที่ ${newId}: หัวข้อการเรียนรู้ใหม่`,
        description: 'สาระสำคัญ แนวทางปฏิบัติ และมาตรฐานความปลอดภัย',
        youtubeUrl: mainVideoUrl || 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        durationMinutes: 10,
        checkpoints: []
      }
    ]);
  };

  const handleAddQuestion = () => {
    playCyberClick();
    const newId = questions.length + 1;
    setQuestions([
      ...questions,
      {
        id: newId,
        questionText: `ข้อที่ ${newId}: ระบุคำถามแบบทดสอบวัดผลที่นี่...`,
        options: [
          'ตัวเลือกที่ 1 (คำตอบที่ถูกต้อง)',
          'ตัวเลือกที่ 2',
          'ตัวเลือกที่ 3',
          'ตัวเลือกที่ 4'
        ],
        correctChoiceIndex: 0,
        explanation: 'ระบุคำอธิบายเหตุผลของข้อที่ถูกต้องสำหรับผู้เรียน'
      }
    ]);
  };

  const handleAddSopStep = () => {
    playCyberClick();
    const newStepNum = sopSteps.length + 1;
    setSopSteps([
      ...sopSteps,
      {
        id: newStepNum,
        stepNumber: newStepNum,
        title: `ขั้นตอนที่ ${newStepNum}: ระบุหัวข้อขั้นตอนการปฏิบัติงาน`,
        actionDetails: 'อธิบายรายละเอียดการปฏิบัติงานตามมาตรฐานอย่างเป็นลำดับ',
        keySafetyPoint: 'ระบุจุดวิกฤตความปลอดภัยและข้อควรระวังสำคัญ',
        qualityStandard: 'ระบุเกณฑ์การตรวจวัดคุณภาพและค่าความคลาดเคลื่อนที่ยอมรับได้'
      }
    ]);
  };

  // =========================================================================
  // HANDLERS: SAVE COURSE TO SYSTEM
  // =========================================================================
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) {
      setNotification('กรุณาระบุชื่อหลักสูตร');
      return;
    }

    const finalSlug = (courseSlug.trim() || courseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')).toLowerCase();

    // 1. Standard Course Object
    const standardCourse: Course = {
      id: finalSlug,
      title: courseTitle.trim(),
      thaiTitle: courseTitle.trim(),
      titleEn: courseTitle.trim(),
      code: `TCT-${finalSlug.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'MOD'}-01`,
      description: courseDescription.trim() || 'หลักสูตรพัฒนาศักยภาพและความรู้เฉพาะทางสำหรับพนักงาน',
      moduleCount: courseFormat === 'sop_teachme_biz' ? sopSteps.length : modules.length,
      estimatedHours: Math.max(1, Math.round(modules.reduce((acc, m) => acc + (m.durationMinutes || 30), 0) / 60)),
      passingScore: passingScore || 8,
      passingCriteria: `≥ ${passingScore || 8}/10 ข้อ (80%)`,
      badge: courseBadge || 'หลักสูตรฝึกอบรม',
      color: 'from-emerald-500 via-teal-600 to-cyan-600',
      imageUrl: courseImageUrl.trim() || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      imageAlt: courseTitle.trim(),
      isConfidential,
      courseFormat,
      videoUrl: mainVideoUrl,
      videoFilename: uploadedVideoName,
      attachments,
      sopSteps: courseFormat === 'sop_teachme_biz' ? sopSteps : undefined,
      adultLearningPlan: courseFormat === 'adult_learning' ? adultLearningPlan : undefined
    };

    // 2. Standard Modules
    const standardModules: CourseModule[] = modules.map((m) => ({
      id: m.id,
      courseId: finalSlug,
      title: m.thaiTitle,
      thaiTitle: m.thaiTitle,
      description: m.description,
      durationMinutes: m.durationMinutes,
      badge: `บทที่ ${m.id}`,
      color: 'from-cyan-500 to-blue-600',
      summaryPoints: [m.description],
      sections: [
        {
          id: `sec-${m.id}-1`,
          title: m.thaiTitle,
          content: [m.description],
          keyHighlight: 'ความปลอดภัยและคุณภาพต้องมาเป็นอันดับหนึ่ง'
        }
      ],
      quizQuestionIds: [m.id],
      youtubeUrl: m.youtubeUrl || mainVideoUrl,
      videoTitle: m.thaiTitle,
      videoDurationSec: m.durationMinutes * 60
    }));

    // 3. Standard Questions
    const choiceIds = ['a', 'b', 'c', 'd'];
    const standardQuestions: Question[] = questions.map((q) => {
      const choices: Choice[] = q.options.map((opt, optIdx) => ({
        id: choiceIds[optIdx] || `opt-${optIdx}`,
        text: opt,
        isCorrect: optIdx === q.correctChoiceIndex
      }));
      return {
        id: q.id,
        courseId: finalSlug,
        question: q.questionText,
        choices,
        explanation: q.explanation || 'ศึกษาทำความเข้าใจเพิ่มเติมในบทเรียน',
        points: q.points || 1
      };
    });

    const newCourseData: CustomCourseData = {
      course: standardCourse,
      modules: standardModules,
      questions: standardQuestions,
      createdAt: new Date().toISOString(),
      createdBy: developerName.trim() || 'ฝ่ายพัฒนาหลักสูตร TCT',
      passingScore: passingScore || 8
    };

    saveCustomCourse(newCourseData);
    setCustomCourses(getStoredCustomCourses());
    setLastSavedCourseId(finalSlug);
    playSuccessChime();

    setSuccessNotice(`✅ บันทึกหลักสูตร "${standardCourse.title}" รูปแบบ "${COURSE_FORMATS.find(f => f.id === courseFormat)?.titleTh}" เรียบร้อยแล้ว!`);
    setIsCreating(false);

    if (onCourseCreatedOrUpdated) {
      onCourseCreatedOrUpdated();
    }
  };

  // =========================================================================
  // HANDLERS: EXPORT & IMPORT COURSE PACKAGE (JSON TRANSFER)
  // =========================================================================
  const handleExportCoursePackage = () => {
    playCyberClick();
    const packageData = {
      courseFormat,
      courseTitle,
      courseSlug,
      courseDescription,
      courseBadge,
      passingScore,
      developerName,
      courseImageUrl,
      isConfidential,
      mainVideoUrl,
      modules,
      questions,
      sopSteps,
      adultLearningPlan,
      attachments,
      exportedAt: new Date().toISOString(),
      system: 'TCT E-TRAINING ACADEMY'
    };

    const blob = new Blob([JSON.stringify(packageData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TCT_Course_Package_${courseSlug || 'course'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCoursePackage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const pkg = JSON.parse(evt.target?.result as string);
        if (pkg.courseTitle) setCourseTitle(pkg.courseTitle);
        if (pkg.courseSlug) setCourseSlug(pkg.courseSlug);
        if (pkg.courseDescription) setCourseDescription(pkg.courseDescription);
        if (pkg.courseFormat) setCourseFormat(pkg.courseFormat);
        if (pkg.passingScore) setPassingScore(pkg.passingScore);
        if (pkg.mainVideoUrl) setMainVideoUrl(pkg.mainVideoUrl);
        if (Array.isArray(pkg.modules)) setModules(pkg.modules);
        if (Array.isArray(pkg.questions)) setQuestions(pkg.questions);
        if (Array.isArray(pkg.sopSteps)) setSopSteps(pkg.sopSteps);
        if (pkg.adultLearningPlan) setAdultLearningPlan(pkg.adultLearningPlan);
        if (Array.isArray(pkg.attachments)) setAttachments(pkg.attachments);

        playSuccessChime();
        setSuccessNotice(`นำเข้าแพ็กเกจหลักสูตร "${pkg.courseTitle}" สำเร็จ!`);
      } catch (err) {
        playErrorBuzz();
        alert('ไฟล์แพ็กเกจหลักสูตรไม่ถูกต้อง');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 font-sarabun text-slate-800">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#002D5A] to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-blue-900/50 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>TCT COURSE DEVELOPER STUDIO • 4 รูปแบบการเรียนรู้</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            สตูดิโอจัดการและพัฒนาหลักสูตรฝึกอบรม
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl leading-relaxed">
            รองรับ 4 รูปแบบการเรียนรู้: <strong>Active VDO Learning Machine</strong>, <strong>Adult Learning</strong>, <strong>Course E-Learning</strong> และ <strong>SOP Teachme biz Training</strong> พร้อมระบบอัปโหลดวิดีโอ ข้อสอบ เอกสาร และรายชื่อพนักงาน
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0 relative z-10">
          {!isCreating ? (
            <button
              id="btn-create-new-course"
              type="button"
              onClick={() => {
                playCyberClick();
                setIsCreating(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ สร้างหลักสูตรใหม่ (4 รูปแบบ)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                playCyberClick();
                setIsCreating(false);
              }}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
            >
              ปิดหน้าต่างสร้าง
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          {lastSavedCourseId && onSelectCourse && (
            <button
              type="button"
              onClick={() => {
                playSuccessChime();
                onSelectCourse(lastSavedCourseId);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>🚀 เข้าสู่บทเรียนหลักสูตรนี้ทันที &rarr;</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* COURSE CREATION & EDITING STUDIO                                          */}
      {/* ========================================================================= */}
      {isCreating && (
        <form onSubmit={handleSaveCourse} className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-md space-y-6 animate-scaleUp">
          
          {/* Navigation Tabs for Developer Studio */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-thin">
            {[
              { id: 'format_info', label: '1. ข้อมูลหลักสูตร & 4 รูปแบบ', icon: Layers },
              { id: 'modules', label: '2. เนื้อหา & ขั้นตอนการเรียนรู้', icon: BookOpen },
              { id: 'questions', label: '3. สร้างชุดข้อสอบวัดผล', icon: FileQuestion },
              { id: 'videos', label: '4. วิดีโอเนื้อหา & เครื่องเล่น', icon: Video },
              { id: 'files', label: '5. ไฟล์ประกอบ & เอกสาร SOP', icon: FileText },
              { id: 'roster', label: '6. อัปโหลดรายชื่อพนักงาน (Excel)', icon: FileSpreadsheet },
              { id: 'transfer', label: '7. รับส่ง & สำรองข้อมูล (JSON)', icon: Download }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { playCyberClick(); setActiveTab(tab.id as any); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#002D5A] text-white shadow-xs' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ===================================================================== */}
          {/* TAB 1: 4 COURSE FORMATS & BASIC INFO                                  */}
          {/* ===================================================================== */}
          {activeTab === 'format_info' && (
            <div className="space-y-6">
              
              {/* 4 FORMAT SELECTION CARDS */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>เลือกรูปแบบหลักสูตรการเรียนรู้ (4 Pedagogical Formats) <span className="text-red-500">*</span></span>
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COURSE_FORMATS.map(fmt => {
                    const Icon = fmt.icon;
                    const isSelected = courseFormat === fmt.id;
                    return (
                      <div
                        key={fmt.id}
                        onClick={() => { playCyberClick(); setCourseFormat(fmt.id); }}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'border-[#005A9C] bg-blue-50/50 shadow-md ring-2 ring-blue-400/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#005A9C] text-white' : 'bg-slate-100 text-slate-700'}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-xs sm:text-sm font-bold text-slate-900">{fmt.titleTh}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{fmt.titleEn}</div>
                              </div>
                            </div>
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#005A9C] bg-[#005A9C]' : 'border-slate-300'}`}>
                              {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {fmt.descriptionTh}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
                          {fmt.features.map(f => (
                            <span key={f} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                              • {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">ชื่อหลักสูตร (Course Title) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="เช่น การปฏิบัติงานเครื่องจักรปั่นเกลียว หรือ การสร้างจิตสำนึกความปลอดภัย"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">รหัสหลักสูตร / Slug (ID)</label>
                  <input
                    type="text"
                    value={courseSlug}
                    onChange={(e) => setCourseSlug(e.target.value)}
                    placeholder="เช่น twisting-sop-101 หรือ adult-leadership"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">คำอธิบายหลักสูตร (Description)</label>
                <textarea
                  rows={3}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="ระบุวัตถุประสงค์และสาระสำคัญของหลักสูตร..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                />
              </div>

              {/* Image URL & Confidential Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">ภาพหน้าปกหลักสูตร (Image URL)</label>
                  <input
                    type="text"
                    value={courseImageUrl}
                    onChange={(e) => setCourseImageUrl(e.target.value)}
                    placeholder="URL ภาพหน้าปกหลักสูตร"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-800">ข้อมูลความลับองค์กร (Confidential)</div>
                    <div className="text-[11px] text-slate-500">ต้องแชร์พิกัด GPS เฉพาะในพื้นที่บริษัท เทยิน คอร์ด</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isConfidential}
                    onChange={(e) => setIsConfidential(e.target.checked)}
                    className="w-5 h-5 rounded text-[#005A9C] cursor-pointer"
                  />
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: MODULES / SOP STEPS / ADULT LEARNING CONTENT                   */}
          {/* ===================================================================== */}
          {activeTab === 'modules' && (
            <div className="space-y-5">
              
              {/* CASE 1: SOP TEACHME BIZ TRAINING */}
              {courseFormat === 'sop_teachme_biz' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <ListOrdered className="w-4 h-4 text-emerald-600" />
                        <span>ขั้นตอนการปฏิบัติงานมาตรฐาน SOP Teachme Biz</span>
                      </h4>
                      <p className="text-xs text-slate-500">สร้างขั้นตอนการปฏิบัติงานทีละสเต็ป พร้อมจุดระวังความปลอดภัยและเกณฑ์คุณภาพ</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSopStep}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ เพิ่มขั้นตอน SOP</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {sopSteps.map((step, idx) => (
                      <div key={step.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-xs text-[#003875] flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span>ขั้นตอนที่ {idx + 1}</span>
                          </span>
                          {sopSteps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setSopSteps(sopSteps.filter((_, sIdx) => sIdx !== idx))}
                              className="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                            >
                              ลบขั้นตอนนี้
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => {
                              const updated = [...sopSteps];
                              updated[idx].title = e.target.value;
                              setSopSteps(updated);
                            }}
                            placeholder="ระบุหัวข้อขั้นตอนการทำงาน..."
                            className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                          />
                          <textarea
                            rows={2}
                            value={step.actionDetails}
                            onChange={(e) => {
                              const updated = [...sopSteps];
                              updated[idx].actionDetails = e.target.value;
                              setSopSteps(updated);
                            }}
                            placeholder="รายละเอียดการปฏิบัติงานตามลำดับ..."
                            className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={step.keySafetyPoint || ''}
                              onChange={(e) => {
                                const updated = [...sopSteps];
                                updated[idx].keySafetyPoint = e.target.value;
                                setSopSteps(updated);
                              }}
                              placeholder="จุดวิกฤตความปลอดภัย (Safety Key Point)..."
                              className="w-full h-9 px-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs"
                            />
                            <input
                              type="text"
                              value={step.qualityStandard || ''}
                              onChange={(e) => {
                                const updated = [...sopSteps];
                                updated[idx].qualityStandard = e.target.value;
                                setSopSteps(updated);
                              }}
                              placeholder="มาตรฐานคุณภาพ (Quality Standard)..."
                              className="w-full h-9 px-3 rounded-lg bg-blue-50 border border-blue-200 text-[#003875] text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : courseFormat === 'adult_learning' ? (
                /* CASE 2: ADULT LEARNING ANDRAGOGY */
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                      <BrainCircuit className="w-5 h-5 text-amber-600" />
                      <span>กระบวนการเรียนรู้สำหรับผู้ใหญ่ (Case Study & Workplace Application)</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-amber-900">หัวข้อกรณีศึกษา (Case Study Title)</label>
                      <input
                        type="text"
                        value={adultLearningPlan.caseStudyTitle}
                        onChange={(e) => setAdultLearningPlan({ ...adultLearningPlan, caseStudyTitle: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl bg-white border border-amber-300 text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-amber-900">สถานการณ์จำลองในโรงงาน (Scenario Description)</label>
                      <textarea
                        rows={3}
                        value={adultLearningPlan.scenarioDescription}
                        onChange={(e) => setAdultLearningPlan({ ...adultLearningPlan, scenarioDescription: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white border border-amber-300 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-amber-900">แนวทางการจัดทำแผนปฏิบัติ 30 วัน (30-Day Action Plan)</label>
                      <textarea
                        rows={2}
                        value={adultLearningPlan.actionPlan30DaysGuidelines}
                        onChange={(e) => setAdultLearningPlan({ ...adultLearningPlan, actionPlan30DaysGuidelines: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white border border-amber-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* CASE 3 & 4: STANDARD E-LEARNING / ACTIVE VDO */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#005A9C]" />
                        <span>สารบัญบทเรียน (Course Modules & Chapters)</span>
                      </h4>
                      <p className="text-xs text-slate-500">สร้างบทเรียน วิดีโอประจำบท และคำถามจุดตรวจความเข้าใจ</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddModule}
                      className="px-3.5 py-1.5 rounded-xl bg-[#005A9C] hover:bg-[#004070] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ เพิ่มบทเรียน</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {modules.map((mod, idx) => (
                      <div key={mod.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-xs text-[#003875]">บทที่ {idx + 1}</span>
                          {modules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setModules(modules.filter((_, mIdx) => mIdx !== idx))}
                              className="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                            >
                              ลบบทนี้
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">ชื่อบทเรียน</label>
                            <input
                              type="text"
                              value={mod.thaiTitle}
                              onChange={(e) => {
                                const updated = [...modules];
                                updated[idx].thaiTitle = e.target.value;
                                setModules(updated);
                              }}
                              className="w-full h-9 px-3 rounded-lg bg-white border border-slate-300 text-xs font-semibold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">ความยาว (นาที)</label>
                            <input
                              type="number"
                              min={1}
                              value={mod.durationMinutes}
                              onChange={(e) => {
                                const updated = [...modules];
                                updated[idx].durationMinutes = Number(e.target.value) || 10;
                                setModules(updated);
                              }}
                              className="w-full h-9 px-3 rounded-lg bg-white border border-slate-300 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">ลิงก์วิดีโอประจำบท (YouTube / MP4 / Teachme biz)</label>
                          <input
                            type="text"
                            value={mod.youtubeUrl}
                            onChange={(e) => {
                              const updated = [...modules];
                              updated[idx].youtubeUrl = e.target.value;
                              setModules(updated);
                            }}
                            className="w-full h-9 px-3 rounded-lg bg-white border border-slate-300 text-xs font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: QUIZ & EXAM BUILDER                                            */}
          {/* ===================================================================== */}
          {activeTab === 'questions' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileQuestion className="w-4 h-4 text-purple-600" />
                    <span>ชุดข้อสอบวัดผลก่อนเรียน-หลังเรียน (Pre-test & Post-test)</span>
                  </h4>
                  <p className="text-xs text-slate-500">สร้างข้อสอบ 4 ตัวเลือก พร้อมเฉลยและคำอธิบายเหตุผล</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ เพิ่มข้อสอบ</span>
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-xs text-purple-900">ข้อที่ {qIdx + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setQuestions(questions.filter((_, idx) => idx !== qIdx))}
                          className="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                        >
                          ลบข้อนี้
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">คำถาม (Question Text)</label>
                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[qIdx].questionText = e.target.value;
                          setQuestions(updated);
                        }}
                        className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-xs font-bold"
                      />
                    </div>

                    {/* Choices (4 Options) */}
                    <div className="space-y-2 pt-1">
                      <label className="text-[11px] font-bold text-slate-600">ตัวเลือกคำตอบ (คลิกวงกลมเพื่อเลือกข้อที่ถูกต้อง):</label>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-choice-${qIdx}`}
                            checked={q.correctChoiceIndex === optIdx}
                            onChange={() => {
                              const updated = [...questions];
                              updated[qIdx].correctChoiceIndex = optIdx;
                              setQuestions(updated);
                            }}
                            className="w-4 h-4 text-emerald-600 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIdx].options[optIdx] = e.target.value;
                              setQuestions(updated);
                            }}
                            className={`flex-1 h-8 px-2.5 rounded-lg border text-xs ${
                              q.correctChoiceIndex === optIdx 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' 
                                : 'bg-white border-slate-300'
                            }`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-bold text-slate-600">คำอธิบายเฉลย (Explanation)</label>
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[qIdx].explanation = e.target.value;
                          setQuestions(updated);
                        }}
                        className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: VIDEO UPLOAD & MEDIA CMS & IN-STUDIO PLAYER                    */}
          {/* ===================================================================== */}
          {activeTab === 'videos' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-rose-600" />
                    <span>ระบบอัปโหลดวิดีโอ & เครื่องเล่นวิดีโอ (Video Player CMS)</span>
                  </h4>
                  <p className="text-xs text-slate-500">อัปโหลดไฟล์วิดีโอโดยตรง หรือระบุลิงก์สตรีมมิ่งเพื่อเล่นและตรวจสอบเนื้อหา</p>
                </div>
              </div>

              {/* Upload Box & Streaming URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method 1: Local File Upload */}
                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-[#005A9C] space-y-3 flex flex-col items-center justify-center text-center transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">อัปโหลดไฟล์วิดีโอจากคอมพิวเตอร์</div>
                    <div className="text-[11px] text-slate-500">รองรับไฟล์ MP4, WebM, MOV</div>
                  </div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    เลือกไฟล์วิดีโอ
                  </button>
                  {uploadedVideoName && (
                    <div className="text-[11px] font-mono text-emerald-700 font-bold">
                      ✓ {uploadedVideoName}
                    </div>
                  )}
                </div>

                {/* Method 2: Streaming URL */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-[#005A9C]" />
                    <span>หรือใส่ลิงก์วิดีโอสตรีมมิ่ง (Streaming URL)</span>
                  </div>
                  <input
                    type="text"
                    value={mainVideoUrl}
                    onChange={(e) => setMainVideoUrl(e.target.value)}
                    placeholder="เช่น https://www.youtube.com/watch?v=... หรือ MP4 URL"
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    รองรับ YouTube, Teachme biz, Google Drive Embed, Vimeo หรือลิงก์ MP4 ภายในโรงงาน TCT
                  </p>
                </div>
              </div>

              {/* In-Studio Video Player Preview */}
              {mainVideoUrl && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-slate-800">
                    <span className="font-bold flex items-center gap-1.5 text-cyan-300">
                      <MonitorPlay className="w-4 h-4" />
                      <span>เครื่องเล่นวิดีโอตัวอย่าง (Live Video Player Preview)</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs">{mainVideoUrl}</span>
                  </div>

                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    {mainVideoUrl.includes('youtube.com') || mainVideoUrl.includes('youtu.be') ? (
                      <iframe
                        src={mainVideoUrl.replace('watch?v=', 'embed/')}
                        title="Course Video"
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={mainVideoUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 5: FILES & SOP HANDOUTS                                           */}
          {/* ===================================================================== */}
          {activeTab === 'files' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>ระบบจัดเก็บไฟล์ประกอบการฝึกอบรม (Training Handouts & Files)</span>
                  </h4>
                  <p className="text-xs text-slate-500">อัปโหลดเอกสารคู่มือ SOP, สไลด์ PowerPoint, และไฟล์ PDF ประกอบการเรียน</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.xlsx,.pptx,image/*"
                  onChange={handleAttachmentUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#002D5A] hover:bg-[#001D3D] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ อัปโหลดไฟล์เอกสาร</span>
                </button>
              </div>

              {attachments.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
                  ยังไม่มีไฟล์เอกสารแนบในหลักสูตรนี้ สามารถกดปุ่ม "+ อัปโหลดไฟล์เอกสาร" ด้านบนเพื่อเพิ่มไฟล์
                </div>
              ) : (
                <div className="space-y-2">
                  {attachments.map(att => (
                    <div key={att.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{att.name}</div>
                          <div className="text-[10px] text-slate-400">ขนาด: {att.size} • วันที่: {att.uploadedAt}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={att.url}
                          download={att.name}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#003875] hover:bg-blue-100 font-bold text-[11px] flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>ดาวน์โหลด</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 6: ROSTER IMPORT & UPLOAD (EXCEL .xlsx / CSV)                      */}
          {/* ===================================================================== */}
          {activeTab === 'roster' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>ระบบอัปโหลดและรับส่งข้อมูลรายชื่อผู้เรียน (Roster Import & Sync)</span>
                  </h4>
                  <p className="text-xs text-slate-500">นำเข้ารายชื่อพนักงานจากไฟล์ Excel (.xlsx) หรือ CSV พร้อมระบุแผนก ตำแหน่ง และอายุงาน</p>
                </div>

                <button
                  type="button"
                  onClick={handleExportRosterTemplate}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-300 cursor-pointer shrink-0"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดไฟล์ตัวอย่าง (Template)</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border-2 border-dashed border-emerald-300 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950">เลือกไฟล์ Excel (.xlsx, .xls) หรือ CSV รายชื่อพนักงาน</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">ระบบจะดึงรหัสพนักงาน ชื่อนามสกุล แผนก ฝ่าย และอายุงานอัตโนมัติ</div>
                </div>

                <input
                  ref={rosterFileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.json"
                  onChange={handleRosterFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => rosterFileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>เลือกไฟล์ Excel / CSV รายชื่อ</span>
                </button>
              </div>

              {/* Parsed Employees Table Preview */}
              {parsedEmployees.length > 0 && (
                <div className="space-y-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#005A9C]" />
                      <span>รายชื่อพนักงานที่พบในไฟล์ ({parsedEmployees.length} คน)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyImportedRosterToCourse}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>+ ยืนยันแอดรายชื่อเข้าหลักสูตร</span>
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-mono text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="p-2 text-center">#</th>
                          <th className="p-2">รหัสพนักงาน</th>
                          <th className="p-2">ชื่อ - นามสกุล</th>
                          <th className="p-2">แผนก</th>
                          <th className="p-2">ตำแหน่ง</th>
                          <th className="p-2">อายุงาน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {parsedEmployees.slice(0, 20).map((emp, i) => (
                          <tr key={emp.empId || i} className="hover:bg-slate-50">
                            <td className="p-2 text-center text-slate-400 font-mono">{i + 1}</td>
                            <td className="p-2 font-mono font-bold text-[#005A9C]">{emp.empId}</td>
                            <td className="p-2 font-semibold text-slate-900">{emp.fullName}</td>
                            <td className="p-2">{emp.department}</td>
                            <td className="p-2">{emp.position}</td>
                            <td className="p-2">{emp.yearsOfService || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedEmployees.length > 20 && (
                    <div className="text-[11px] text-slate-400 text-center">...และอีก {parsedEmployees.length - 20} รายชื่อ</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 7: DATA TRANSFER & BACKUP (JSON EXPORT/IMPORT)                    */}
          {/* ===================================================================== */}
          {activeTab === 'transfer' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>ระบบรับส่งและจัดเก็บข้อมูลแพ็กเกจหลักสูตร (Data Transfer & Backup)</span>
                </h4>
                <p className="text-xs text-slate-500">ส่งออกข้อมูลหลักสูตรทั้งหมดเพื่อสำรองข้อมูล หรือนำเข้าข้อมูลแพ็กเกจหลักสูตรข้ามเซิร์ฟเวอร์</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>1. ส่งออกแพ็กเกจหลักสูตร (Export JSON)</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ดาวน์โหลดข้อมูลหลักสูตร รวมเนื้อหาบทเรียน ชุดข้อสอบ ลิงก์วิดีโอ และรายชื่อไฟล์แนบเป็นไฟล์ JSON
                  </p>
                  <button
                    type="button"
                    onClick={handleExportCoursePackage}
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>ดาวน์โหลดแพ็กเกจหลักสูตร (JSON)</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>2. นำเข้าแพ็กเกจหลักสูตร (Import JSON)</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    อัปโหลดไฟล์ JSON แพ็กเกจหลักสูตรเพื่อโหลดข้อมูลทั้งหมดเข้าสู่ฟอร์มและบันทึกอัตโนมัติ
                  </p>
                  <label className="w-full py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>เลือกไฟล์แพ็กเกจ JSON เพื่อนำเข้า</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportCoursePackage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              รูปแบบ: <strong className="text-slate-800">{COURSE_FORMATS.find(f => f.id === courseFormat)?.titleTh}</strong> • บทเรียน/ขั้นตอน: <strong>{courseFormat === 'sop_teachme_biz' ? sopSteps.length : modules.length}</strong> • ข้อสอบ: <strong>{questions.length} ข้อ</strong>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>💾 บันทึกและเปิดใช้งานหลักสูตรทันที</span>
              </button>
            </div>
          </div>

        </form>
      )}

      {/* ========================================================================= */}
      {/* EXISTING CUSTOM COURSES LIST                                              */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#005A9C]" />
            <span>หลักสูตรที่สร้างและจัดการในระบบ ({customCourses.length} หลักสูตร)</span>
          </h3>
        </div>

        {customCourses.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#005A9C] flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800">ยังไม่มีหลักสูตรที่สร้างเพิ่มเติม</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              ท่านสามารถกดปุ่ม <strong>"+ สร้างหลักสูตรใหม่ (4 รูปแบบ)"</strong> ด้านบนเพื่อสร้างหลักสูตร Active VDO, Adult Learning, E-Learning หรือ SOP Teachme biz
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customCourses.map(item => {
              const fmtInfo = COURSE_FORMATS.find(f => f.id === item.course.courseFormat) || COURSE_FORMATS[2];
              const FmtIcon = fmtInfo.icon;
              return (
                <div key={item.course.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${fmtInfo.badgeColor}`}>
                        <FmtIcon className="w-3 h-3" />
                        <span>{fmtInfo.titleTh}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{item.course.code}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{item.course.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.course.description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-slate-100 text-[11px] text-center">
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <div className="text-slate-400 text-[10px]">บทเรียน/สเต็ป</div>
                        <div className="font-bold text-slate-800">{item.modules?.length || item.course.sopSteps?.length || 0}</div>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <div className="text-slate-400 text-[10px]">ข้อสอบ</div>
                        <div className="font-bold text-purple-700">{item.questions?.length || 0} ข้อ</div>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <div className="text-slate-400 text-[10px]">เกณฑ์ผ่าน</div>
                        <div className="font-bold text-emerald-700">80%</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <span className="text-[10px] text-slate-400 truncate">สร้างโดย: {item.createdBy}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSelectCourse && (
                        <button
                          type="button"
                          onClick={() => {
                            playSuccessChime();
                            onSelectCourse(item.course.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#002855] hover:bg-[#001D40] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                          title={`เปิดเรียนหลักสูตร ${item.course.title}`}
                        >
                          <Play className="w-3 h-3 fill-white text-white" />
                          <span>เปิดเรียนหลักสูตร &rarr;</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeletingCourse({ id: item.course.id, title: item.course.title })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="ลบหลักสูตรนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">ยืนยันการลบหลักสูตร</h4>
                <p className="text-xs text-slate-500">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              ต้องการลบหลักสูตร <strong>"{deletingCourse.title}"</strong> ออกจากระบบใช่หรือไม่?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCourse(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCustomCourse(deletingCourse.id);
                  setCustomCourses(getStoredCustomCourses());
                  setDeletingCourse(null);
                  playSuccessChime();
                  if (onCourseCreatedOrUpdated) onCourseCreatedOrUpdated();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                ยืนยันลบหลักสูตร
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
