import React, { useRef, useState, useMemo, useEffect } from 'react';
import { TraineeRecord, UserProfile } from '../types';
import { downloadElementAsPdf, downloadMultiPagePdf, printElementViaStandaloneWindow } from '../utils/pdfExport';
import { TCTLogo } from './TCTLogo';
import { 
  Printer, 
  Download, 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  Award, 
  Users, 
  Sparkles, 
  Building, 
  Calendar, 
  FileText,
  Check,
  FileDown,
  Maximize2,
  Filter,
  Search,
  BookOpen,
  Lock,
  Unlock,
  AlertTriangle,
  Layers,
  GraduationCap,
  Plus,
  Trash2,
  Edit3,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { getAllAvailableCourses } from '../utils/courseManager';
import { resolveCourseTrainees, COURSE_OFFICIAL_METADATA, CourseTraineeResolved } from '../utils/courseTraineeHelper';
import { MASTER_EMPLOYEE_ROSTER_230 } from '../data/employeeDatabase';
import * as XLSX from 'xlsx';

interface ETrainingRosterReportModalProps {
  trainees: TraineeRecord[];
  currentUser?: UserProfile | null;
  initialCourseId?: string;
  onClose: () => void;
}

export const ETrainingRosterReportModal: React.FC<ETrainingRosterReportModalProps> = ({
  trainees,
  currentUser,
  initialCourseId,
  onClose
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState<string>('all');
  const [reportFormat, setReportFormat] = useState<'a4-portrait' | 'a4-landscape' | '16:9'>('a4-portrait');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  
  // Active course selection
  const allCourses = getAllAvailableCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || currentUser?.selectedCourseId || 'risk-management'
  );

  // Filters
  const [filterCompletion, setFilterCompletion] = useState<'all' | 'completed_only' | 'in_progress'>('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Course Metadata derived dynamically
  const courseMeta = COURSE_OFFICIAL_METADATA[selectedCourseId] || {
    title: allCourses.find(c => c.id === selectedCourseId)?.title || 'หลักสูตรการฝึกอบรม',
    code: `TCT-${selectedCourseId.toUpperCase().slice(0, 4)}-01`,
    batch: 'รุ่นที่ 1 / 2569',
    trainingDates: 'วันที่ 15 - 17 กรกฎาคม 2569 (08.00 - 17.00 น.)',
    instructor: 'ทีมวิทยากร TCT Academy',
    institute: 'ศูนย์ฝึกอบรมและพัฒนา TCT ACADEMY',
    totalModules: 4,
    passingScorePercent: 80
  };

  // Editable header state (synchronized with selected course by default)
  const [companyName, setCompanyName] = useState('TEIJIN CORD (THAILAND) CO.,LTD.');
  const [divisionName, setDivisionName] = useState('ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development & Training Center');
  
  // Signatories: TCT Academy Center Head, Center Manager, General Manager / Plant Manager (Center Advisory Chairman)
  const [trainerSignerName, setTrainerSignerName] = useState('นายณฐวัตร พงษ์สาริกิจ');
  const [trainerSignerPosition, setTrainerSignerPosition] = useState('หัวหน้าศูนย์ TCT Academy / หัวหน้าแผนกบุคคลและธุรการ Personnel');
  
  const [certifierSignerName, setCertifierSignerName] = useState('นายกิตติศักดิ์ สร้อยจิตต์');
  const [certifierSignerPosition, setCertifierSignerPosition] = useState('ผู้จัดการศูนย์ TCT Academy / ผู้จัดการฝ่ายบุคคลและธุรการ');

  const [approverSignerName, setApproverSignerName] = useState('นายนพดล บำรุงเกียรติ');
  const [approverSignerPosition, setApproverSignerPosition] = useState('ผู้จัดการทั่วไปและผู้จัดการโรงงาน / ประธานที่ปรึกษาศูนย์ TCT Academy');
  const [showSignerEditor, setShowSignerEditor] = useState(false);

  // Editable Trainees List with LocalStorage Persistence
  const [editableTrainees, setEditableTrainees] = useState<CourseTraineeResolved[]>(() => {
    try {
      const saved = localStorage.getItem(`tct_roster_report_${selectedCourseId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return resolveCourseTrainees(trainees, selectedCourseId);
  });

  // Pull Controls State
  const [selectedEmpToPull, setSelectedEmpToPull] = useState(MASTER_EMPLOYEE_ROSTER_230[0]?.empId || '00021');
  const [pullDeptFilter, setPullDeptFilter] = useState('all');
  const [isEditTableMode, setIsEditTableMode] = useState(false);

  // Sync when course changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`tct_roster_report_${selectedCourseId}`);
      if (saved) {
        setEditableTrainees(JSON.parse(saved));
        return;
      }
    } catch (e) {}
    setEditableTrainees(resolveCourseTrainees(trainees, selectedCourseId));
  }, [selectedCourseId]);

  // Auto-save to localStorage
  useEffect(() => {
    if (editableTrainees && selectedCourseId) {
      try {
        localStorage.setItem(`tct_roster_report_${selectedCourseId}`, JSON.stringify(editableTrainees));
      } catch (e) {}
    }
  }, [editableTrainees, selectedCourseId]);

  // Helper to build full CourseTraineeResolved object
  const buildCourseTraineeObject = (
    emp: { empId: string; fullName: string; department: string; position?: string },
    pre: number = 7,
    post: number = 10
  ): CourseTraineeResolved => ({
    empId: emp.empId,
    fullName: emp.fullName,
    department: emp.department,
    position: emp.position || 'พนักงาน',
    enrolledAt: '12 ต.ค. 2569',
    completedAt: '12 ต.ค. 2569',
    courseId: selectedCourseId,
    courseTitle: courseMeta.title,
    courseCode: courseMeta.code,
    preTestScore: pre,
    postTestScore: post,
    preScoreText: `${pre}/10`,
    postScoreText: `${post}/10`,
    totalScore20: pre + post,
    totalScore20Text: `${pre + post}/20`,
    scaledPostScoreText: `${post * 2}/20`,
    completedModulesCount: 6,
    totalModulesCount: 6,
    isCompleted: true,
    status: 'passed',
    statusTextThai: 'ผ่านเกณฑ์แล้ว',
    currentStageTextThai: 'ผ่านเกณฑ์สมบูรณ์ (Passed)',
    certificateId: `TCT-CERT-${emp.empId || 'GEN'}-${selectedCourseId.slice(0, 4).toUpperCase()}`,
    certificateDate: '12 ต.ค. 2569',
    satisfactionScore: 5
  });

  // Pull employee - duplicates explicitly allowed!
  const handlePullSelectedEmployee = () => {
    const emp = MASTER_EMPLOYEE_ROSTER_230.find(e => e.empId === selectedEmpToPull);
    if (!emp) return;
    playCyberClick();
    const newTrainee = buildCourseTraineeObject(emp, 7, 10);
    setEditableTrainees(prev => [...prev, newTrainee]);
  };

  // Add blank custom row
  const handleAddBlankRow = () => {
    playCyberClick();
    const newTrainee = buildCourseTraineeObject({
      empId: '',
      fullName: '',
      department: 'P',
      position: 'Worker'
    }, 6, 9);
    setEditableTrainees(prev => [...prev, newTrainee]);
  };

  // Delete row
  const handleDeleteRow = (index: number) => {
    playCyberClick();
    setEditableTrainees(prev => prev.filter((_, idx) => idx !== index));
  };

  // Update cell
  const handleUpdateCell = (index: number, field: keyof CourseTraineeResolved, value: any) => {
    setEditableTrainees(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Pull All 224
  const handlePullAll224 = () => {
    playSuccessChime();
    const allTrainees: CourseTraineeResolved[] = MASTER_EMPLOYEE_ROSTER_230.map((emp) =>
      buildCourseTraineeObject(emp, 7, 10)
    );
    setEditableTrainees(allTrainees);
  };

  // Pull Department
  const handlePullDepartment = (dept: string) => {
    playSuccessChime();
    const deptEmployees = MASTER_EMPLOYEE_ROSTER_230.filter(e => e.department === dept);
    const newItems: CourseTraineeResolved[] = deptEmployees.map((emp) =>
      buildCourseTraineeObject(emp, 7, 10)
    );
    setEditableTrainees(prev => [...prev, ...newItems]);
  };

  // Reset to original
  const handleResetToOriginal = () => {
    playCyberClick();
    try {
      localStorage.removeItem(`tct_roster_report_${selectedCourseId}`);
    } catch (e) {}
    setEditableTrainees(resolveCourseTrainees(trainees, selectedCourseId));
  };

  // Filter trainees by search, department, and completion status
  const filteredTrainees = useMemo(() => {
    return editableTrainees.filter(t => {
      const matchDept = selectedDept === 'all' || t.department === selectedDept;
      const matchSearch = searchTerm === '' || 
        t.empId.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCompletion = 
        filterCompletion === 'all' ? true :
        filterCompletion === 'completed_only' ? t.isCompleted :
        !t.isCompleted;

      return matchDept && matchSearch && matchCompletion;
    });
  }, [editableTrainees, selectedDept, searchTerm, filterCompletion]);

  const departments = ['all', ...Array.from(new Set(MASTER_EMPLOYEE_ROSTER_230.map(t => t.department))).sort()];

  const totalCourseTrainees = editableTrainees.length;
  const completedCourseTrainees = editableTrainees.filter(t => t.isCompleted).length;
  const inProgressCourseTrainees = totalCourseTrainees - completedCourseTrainees;

  // Dynamic chunking so that NO trainees are cut off or omitted
  const chunkedPages = useMemo(() => {
    const isLandscape = reportFormat === 'a4-landscape' || reportFormat === '16:9';
    const singleMax = isLandscape ? 8 : 10;
    const page1Size = isLandscape ? 8 : 12;
    const middleSize = isLandscape ? 12 : 18;
    const lastPageMax = isLandscape ? 7 : 10;

    if (filteredTrainees.length <= singleMax) {
      return [{
        pageNumber: 1,
        totalPages: 1,
        isFirst: true,
        isLast: true,
        pageTrainees: filteredTrainees,
        startIndex: 0
      }];
    }

    const pages = [];
    pages.push({
      pageNumber: 1,
      totalPages: 1,
      isFirst: true,
      isLast: false,
      pageTrainees: filteredTrainees.slice(0, page1Size),
      startIndex: 0
    });

    let remaining = filteredTrainees.slice(page1Size);
    let currentIndex = page1Size;

    while (remaining.length > 0) {
      if (remaining.length <= lastPageMax) {
        pages.push({
          pageNumber: pages.length + 1,
          totalPages: 1,
          isFirst: false,
          isLast: true,
          pageTrainees: remaining,
          startIndex: currentIndex
        });
        break;
      } else if (remaining.length <= lastPageMax + 4) {
        const midCount = Math.ceil(remaining.length / 2);
        pages.push({
          pageNumber: pages.length + 1,
          totalPages: 1,
          isFirst: false,
          isLast: false,
          pageTrainees: remaining.slice(0, midCount),
          startIndex: currentIndex
        });
        currentIndex += midCount;
        remaining = remaining.slice(midCount);
        pages.push({
          pageNumber: pages.length + 1,
          totalPages: 1,
          isFirst: false,
          isLast: true,
          pageTrainees: remaining,
          startIndex: currentIndex
        });
        break;
      } else {
        pages.push({
          pageNumber: pages.length + 1,
          totalPages: 1,
          isFirst: false,
          isLast: false,
          pageTrainees: remaining.slice(0, middleSize),
          startIndex: currentIndex
        });
        currentIndex += middleSize;
        remaining = remaining.slice(middleSize);
      }
    }

    const total = pages.length;
    pages.forEach(p => { p.totalPages = total; });
    return pages;
  }, [filteredTrainees, reportFormat]);

  const displayedPages = useMemo(() => {
    if (activePage === 'all') return chunkedPages;
    const match = chunkedPages.find(p => `page-${p.pageNumber}` === activePage);
    return match ? [match] : chunkedPages;
  }, [activePage, chunkedPages]);

  // Print handler
  const handlePrint = () => {
    playCyberClick();
    if (reportRef.current) {
      const orientation = reportFormat === 'a4-portrait' ? 'portrait' : 'landscape';
      printElementViaStandaloneWindow(
        reportRef.current, 
        `TCT_E-Training_Roster_${courseMeta.code}_${new Date().toISOString().split('T')[0]}`, 
        orientation
      );
    } else {
      window.print();
    }
  };

  // PDF download handler
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    playCyberClick();
    setIsPdfGenerating(true);
    setDownloadSuccess(false);

    try {
      const orientation = reportFormat === 'a4-portrait' ? 'portrait' : 'landscape';
      const filename = `TCT_ETraining_Roster_${courseMeta.code}_${new Date().toISOString().split('T')[0]}.pdf`;

      let success = false;
      const pages = Array.from(reportRef.current.querySelectorAll('.roster-report-page-portrait, .roster-report-page-landscape')) as HTMLElement[];
      if (pages.length > 1) {
        success = await downloadMultiPagePdf(pages, {
          filename,
          orientation,
          format: 'a4',
          scale: 2.5
        });
      } else if (pages.length === 1) {
        success = await downloadElementAsPdf(pages[0], {
          filename,
          orientation,
          format: 'a4',
          scale: 2.5
        });
      } else {
        success = await downloadElementAsPdf(reportRef.current, {
          filename,
          orientation,
          format: 'a4',
          scale: 2.5
        });
      }

      if (success) {
        playSuccessChime();
        setDownloadMessage(`ดาวน์โหลดใบรายชื่อและคะแนนสอบ (${courseMeta.title}) สำเร็จ!`);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }
    } catch (e) {
      console.error(e);
      handlePrint();
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    playCyberClick();
    try {
      const excelData = filteredTrainees.map((t, idx) => {
        return {
          'ลำดับที่': idx + 1,
          'รหัสประจำตัวพนักงาน': t.empId,
          'ชื่อ - สกุล': t.fullName,
          'แผนก': t.department,
          'ตำแหน่ง': t.position || 'SUPERVISOR',
          'หลักสูตร': t.courseTitle,
          'คะแนนก่อนเรียน (Pre-Test)': t.preScoreText,
          'คะแนนหลังเรียน (Post-Test)': t.postScoreText,
          'คะแนนรวม (เต็ม 20)': t.totalScore20Text,
          'ขั้นตอน / สถานะการเรียน': t.currentStageTextThai,
          'ผลการอบรม': t.isCompleted ? 'ผ่านเกณฑ์ (Passed)' : 'ยังไม่จบการอบรม',
          'เลขที่วุฒิบัตร': t.certificateId || '-',
          'การรับรองผล': t.isCompleted ? 'รับรองผลสมบูรณ์' : 'อยู่ระหว่างอบรม'
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'รายชื่อผู้เข้าอบรม');
      XLSX.writeFile(workbook, `TCT_ETraining_Roster_${courseMeta.code}_${new Date().toISOString().split('T')[0]}.xlsx`);

      playSuccessChime();
      setDownloadMessage('ส่งออกไฟล์ Excel (.xlsx) สำเร็จ!');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sarabun">
      <div className="bg-[#0B101E] border border-slate-700 rounded-3xl w-full max-w-[95vw] sm:max-w-6xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden my-auto animate-fadeIn text-slate-100">
        
        {/* Top Control Header (No-Print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900/95 border-b border-slate-800 flex flex-col gap-3 no-print">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Title & Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-xs shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm sm:text-base text-white">
                    แบบฟอร์มใบรายชื่อผู้เข้าอบรมและผลสอบ E-Training ตามหลักสูตรจริง
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    {courseMeta.code}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  แสดงรายชื่อพนักงาน คะแนนสอบ และขั้นตอนการเรียนของแต่ละหลักสูตรจริง (16:9 / Print Ready)
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls Bar: Course Selector, Filter by Completion, Search, and Export Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
            
            {/* Left: Course Selection Dropdown */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-cyan-500/40">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400 font-medium">หลักสูตร:</span>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    playCyberClick();
                    setSelectedCourseId(e.target.value);
                  }}
                  className="bg-transparent text-xs text-cyan-200 font-bold outline-none cursor-pointer max-w-[280px] sm:max-w-none"
                >
                  <option value="risk-management" className="bg-slate-900 text-white">
                    หลักสูตรที่ 1: การบริหารความเสี่ยงด้วยคุณภาพและความปลอดภัย (QSRM)
                  </option>
                  <option value="advanced-preventive-maintenance" className="bg-slate-900 text-white">
                    หลักสูตรที่ 2: การยกระดับการบำรุงรักษาเชิงป้องกัน (CBM, PdM, RCM)
                  </option>
                  {allCourses
                    .filter(c => c.id !== 'risk-management' && c.id !== 'advanced-preventive-maintenance')
                    .map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.title}
                      </option>
                    ))}
                </select>
              </div>

              {/* Completion Filter Toggle */}
              <div className="bg-slate-950 p-0.5 rounded-xl border border-slate-800 flex items-center text-xs">
                <button
                  onClick={() => { playCyberClick(); setFilterCompletion('all'); }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterCompletion === 'all'
                      ? 'bg-slate-800 text-white font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="แสดงพนักงานทั้งหมดที่ลงทะเบียนในหลักสูตรนี้"
                >
                  ทั้งหมด ({totalCourseTrainees})
                </button>
                <button
                  onClick={() => { playCyberClick(); setFilterCompletion('completed_only'); }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    filterCompletion === 'completed_only'
                      ? 'bg-slate-800 text-white font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="พิมพ์เฉพาะผู้ที่จบการอบรมและผ่านเกณฑ์แล้วเท่านั้น"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
                  <span>จบการอบรมแล้ว ({completedCourseTrainees})</span>
                </button>
                <button
                  onClick={() => { playCyberClick(); setFilterCompletion('in_progress'); }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterCompletion === 'in_progress'
                      ? 'bg-slate-800 text-white font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="แสดงผู้ที่กำลังอยู่ระหว่างการฝึกอบรม"
                >
                  กำลังเรียน ({inProgressCourseTrainees})
                </button>
              </div>

              {/* Department Filter */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
              >
                {departments.map(d => (
                  <option key={d} value={d}>
                    {d === 'all' ? 'ทุกแผนก' : `แผนก ${d}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Right: Layout Toggle, Excel, Print & PDF */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Edit Signatories Toggle */}
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  setShowSignerEditor(!showSignerEditor);
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showSignerEditor 
                    ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="แก้ไขชื่อและตำแหน่งผู้รับรองรายชื่อ/ผู้จัดการฝึกอบรม"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>กำหนดผู้ลงนาม</span>
              </button>

              {/* Toggle Employee Pull & Edit Toolbar */}
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  setIsEditTableMode(!isEditTableMode);
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isEditTableMode 
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="เปิด/ปิด แถบจัดการและดึงรายชื่อพนักงาน"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>{isEditTableMode ? 'ปิดแถบดึงรายชื่อ' : 'ดึง & แก้ไขรายชื่อ'}</span>
              </button>

              {/* Format Toggle */}
              <div className="bg-slate-950 p-0.5 rounded-xl border border-slate-800 flex items-center text-xs">
                <button
                  onClick={() => { playCyberClick(); setReportFormat('a4-portrait'); }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1 ${
                    reportFormat === 'a4-portrait' 
                      ? 'bg-slate-800 text-white shadow-xs border border-slate-700' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="เอกสารเต็มแผ่น A4 แนวตั้ง (สัดส่วน 9:16 เต็มหน้า)"
                >
                  <span>📄</span>
                  <span>A4 แนวตั้ง (9:16)</span>
                </button>
                <button
                  onClick={() => { playCyberClick(); setReportFormat('a4-landscape'); }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                    reportFormat === 'a4-landscape' 
                      ? 'bg-slate-800 text-white font-bold shadow-xs border border-slate-700' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="เอกสารเต็มแผ่น A4 แนวนอน"
                >
                  <span>A4 แนวนอน</span>
                </button>
                <button
                  onClick={() => { playCyberClick(); setReportFormat('16:9'); }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 font-medium ${
                    reportFormat === '16:9' 
                      ? 'bg-slate-800 text-white font-bold shadow-xs border border-slate-700' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="มุมมองแบบจอกว้าง 16:9"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>16:9</span>
                </button>
              </div>

              {/* Dynamic Multi-page Switcher */}
              {chunkedPages.length > 1 && (
                <div className="bg-slate-950 p-0.5 rounded-xl border border-purple-500/50 flex items-center text-xs shadow-md max-w-full overflow-x-auto gap-1">
                  <button
                    onClick={() => { playCyberClick(); setActivePage('all'); }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold whitespace-nowrap flex items-center gap-1 ${
                      activePage === 'all' 
                        ? 'bg-purple-600 text-white shadow' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>📄 ทุกหน้า ({chunkedPages.length})</span>
                  </button>
                  {chunkedPages.map(p => (
                    <button
                      key={p.pageNumber}
                      onClick={() => { playCyberClick(); setActivePage(`page-${p.pageNumber}`); }}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-bold whitespace-nowrap flex items-center gap-1 ${
                        activePage === `page-${p.pageNumber}` 
                          ? 'bg-purple-600 text-white shadow' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>หน้า {p.pageNumber}{p.isLast ? ' (ท้าย)' : ''}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Export Excel */}
              <button
                onClick={handleExportExcel}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Excel</span>
              </button>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4 text-slate-300" />
                <span>พิมพ์เอกสาร</span>
              </button>

              {/* PDF Download Button */}
              <button
                onClick={handleDownloadPdf}
                disabled={isPdfGenerating}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-slate-700" />
                <span>{isPdfGenerating ? 'กำลังสร้าง...' : 'PDF'}</span>
              </button>
            </div>

          </div>

          {/* Signer Customizer Drawer */}
          {showSignerEditor && (
            <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-3 text-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fadeIn">
              <div>
                <label className="text-[10px] text-amber-400 font-bold block mb-1">
                  ฝ่าย / ส่วนงาน (Division):
                </label>
                <input
                  type="text"
                  value={divisionName}
                  onChange={(e) => setDivisionName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-cyan-400 font-bold block mb-1">
                  1. หัวหน้าศูนย์ TCT Academy / ผู้รวบรวม:
                </label>
                <input
                  type="text"
                  value={trainerSignerName}
                  onChange={(e) => setTrainerSignerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  value={trainerSignerPosition}
                  onChange={(e) => setTrainerSignerPosition(e.target.value)}
                  placeholder="ตำแหน่งหัวหน้าศูนย์ / หัวหน้าแผนกบุคคล"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 text-[11px] outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-emerald-400 font-bold block mb-1">
                  2. ผู้จัดการศูนย์ TCT Academy / ผู้ตรวจสอบ:
                </label>
                <input
                  type="text"
                  value={certifierSignerName}
                  onChange={(e) => setCertifierSignerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs outline-none focus:border-emerald-400"
                />
                <input
                  type="text"
                  value={certifierSignerPosition}
                  onChange={(e) => setCertifierSignerPosition(e.target.value)}
                  placeholder="ตำแหน่งผู้จัดการศูนย์ TCT Academy"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 text-[11px] outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-amber-400 font-bold block mb-1">
                  3. ผู้จัดการทั่วไป/โรงงาน • ประธานที่ปรึกษาศูนย์:
                </label>
                <input
                  type="text"
                  value={approverSignerName}
                  onChange={(e) => setApproverSignerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  value={approverSignerPosition}
                  onChange={(e) => setApproverSignerPosition(e.target.value)}
                  placeholder="ตำแหน่งประธานที่ปรึกษาศูนย์ / GM"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 text-[11px] outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setDivisionName('ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development & Training Center');
                    setTrainerSignerName('นายณฐวัตร พงษ์สาริกิจ');
                    setTrainerSignerPosition('หัวหน้าศูนย์ TCT Academy / หัวหน้าแผนกบุคคลและธุรการ Personnel');
                    setCertifierSignerName('นายกิตติศักดิ์ สร้อยจิตต์');
                    setCertifierSignerPosition('ผู้จัดการศูนย์ TCT Academy / ผู้จัดการฝ่ายบุคคลและธุรการ');
                    setApproverSignerName('นายนพดล บำรุงเกียรติ');
                    setApproverSignerPosition('ผู้จัดการทั่วไปและผู้จัดการโรงงาน / ประธานที่ปรึกษาศูนย์ TCT Academy');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold text-center cursor-pointer transition-colors"
                >
                  รีเซ็ตเป็นค่ามาตรฐาน
                </button>
              </div>
            </div>
          )}

          {/* Employee Puller Toolbar Drawer */}
          {isEditTableMode && (
            <div className="bg-slate-950/95 border border-amber-500/50 rounded-2xl p-3 text-xs space-y-2.5 animate-fadeIn no-print mt-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs">
                    เครื่องมือดึงและแก้ไขรายชื่อพนักงาน (Master Roster 224 ท่าน)
                  </span>
                  <span className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    ดึงได้ไม่จำกัด • ดึงซ้ำได้ • ลบได้ • แก้ไขได้ทุกช่อง
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetToOriginal}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>คืนค่าเริ่มต้น</span>
                </button>
              </div>

              {/* Selector & Pull Action */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-slate-400 block mb-0.5">กรองตามแผนก:</label>
                  <select
                    value={pullDeptFilter}
                    onChange={(e) => setPullDeptFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-400"
                  >
                    <option value="all">ทุกแผนกในบริษัท</option>
                    {Array.from(new Set(MASTER_EMPLOYEE_ROSTER_230.map(e => e.department))).sort().map(d => (
                      <option key={d} value={d}>แผนก {d}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label className="text-[10px] text-slate-400 block mb-0.5">เลือกพนักงานจากทะเบียน (224 ท่าน):</label>
                  <select
                    value={selectedEmpToPull}
                    onChange={(e) => setSelectedEmpToPull(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-400 font-mono"
                  >
                    {MASTER_EMPLOYEE_ROSTER_230
                      .filter(e => pullDeptFilter === 'all' || e.department === pullDeptFilter)
                      .map(e => (
                        <option key={e.empId} value={e.empId}>
                          [{e.empId}] {e.fullName} • แผนก {e.department} ({e.position})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="sm:col-span-3 flex items-end">
                  <button
                    type="button"
                    onClick={handlePullSelectedEmployee}
                    className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>ดึงพนักงานท่านนี้ (+ซ้ำได้)</span>
                  </button>
                </div>
              </div>

              {/* Quick Batch Pulls */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">ดึงแบบกลุ่ม:</span>
                <button
                  type="button"
                  onClick={handleAddBlankRow}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-1 border border-slate-700 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-emerald-400" />
                  <span>เพิ่มแถวเปล่า</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePullDepartment(pullDeptFilter === 'all' ? 'P' : pullDeptFilter)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-1 border border-slate-700 cursor-pointer"
                >
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>ดึงพนักงานแผนก {pullDeptFilter === 'all' ? 'P' : pullDeptFilter} ทั้งหมด</span>
                </button>
                <button
                  type="button"
                  onClick={handlePullAll224}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-1 border border-slate-700 cursor-pointer"
                >
                  <Users className="w-3 h-3 text-amber-400" />
                  <span>ดึงพนักงานทั้งบริษัท (224 ท่าน)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditableTrainees([])}
                  className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-medium flex items-center gap-1 border border-rose-800/50 cursor-pointer ml-auto"
                >
                  <Trash2 className="w-3 h-3 text-rose-400" />
                  <span>ล้างตารางทั้งหมด</span>
                </button>
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

        {/* Dynamic @page print orientation for seamless full-page printing */}
        <style>{`
          @media print {
            @page {
              size: A4 ${reportFormat === 'a4-portrait' ? 'portrait' : 'landscape'} !important;
              margin: 0 !important;
            }
          }
        `}</style>

        {/* Scrollable Printable Document Container */}
        <div className="flex-1 overflow-y-auto overflow-x-auto w-full max-w-full p-2 sm:p-6 bg-slate-950/90 flex justify-center items-start">
          
          <div ref={reportRef} id="etraining-roster-print-area" className="flex flex-col items-center gap-8 w-full max-w-full">
            {displayedPages.map(page => (
              <div 
                key={page.pageNumber}
                id={"etraining-roster-page-" + page.pageNumber}
                style={{
                  fontFamily: "'TH Sarabun New', 'Sarabun', 'Prompt', sans-serif"
                }}
                className={"bg-white text-black shadow-2xl transition-all border border-slate-300 text-xs sm:text-sm leading-tight rounded-sm " + (
                  reportFormat === "a4-portrait"
                    ? "w-full max-w-[794px] min-h-[1120px] p-5 sm:p-7 flex flex-col justify-between a4-page-portrait roster-report-page-portrait"
                    : reportFormat === "a4-landscape"
                    ? "w-full max-w-[1120px] min-h-[790px] p-4 sm:p-6 flex flex-col justify-between a4-page-landscape roster-report-page-landscape"
                    : "w-full max-w-[1120px] min-h-[630px] aspect-[16/9] p-4 sm:p-6 flex flex-col justify-between roster-landscape-box"
                )}
              >
                <div>
                  {page.isFirst ? (
                    <>
                      {/* Header: Company Name & Official TCT Logo */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-black">
                        <div>
                          <h3 className="font-bold text-sm sm:text-base tracking-wider text-black">
                            {companyName}
                          </h3>
                          <div className="text-[11px] sm:text-xs text-slate-800 font-bold">
                            {divisionName}
                          </div>
                        </div>
                        <div className="w-28 flex justify-end">
                          <TCTLogo size="xs" theme="light" showSubtitle={false} />
                        </div>
                      </div>

                      {/* Document Title Block */}
                      <div className="text-center my-2">
                        <h1 className="text-base sm:text-lg font-bold text-black tracking-tight leading-snug">
                          แบบรายงานรายชื่อผู้เข้ารับการอบรมและผลสัมฤทธิ์รายบุคคล
                        </h1>
                        <div className="mt-1 flex flex-col items-center justify-center gap-0.5">
                          <span className="text-xs sm:text-sm text-black font-bold">
                            ชื่อหลักสูตร/Course Title: <span className="text-blue-900 underline decoration-blue-900/40">{courseMeta.title}</span>
                          </span>
                          <div className="flex items-center justify-center gap-3 text-[11px] sm:text-xs text-slate-800 font-semibold flex-wrap">
                            <span>รหัสหลักสูตร: <strong className="text-black">{courseMeta.code}</strong></span>
                            <span>|</span>
                            <span>{courseMeta.batch}</span>
                            <span>|</span>
                            <span>{courseMeta.trainingDates}</span>
                            <span>|</span>
                            <span>แผนก: <strong className="text-blue-950 font-bold">{selectedDept === "all" ? "ทุกแผนก" : "แผนก " + selectedDept}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Status & Scope Banner */}
                      <div className="mb-2 bg-slate-50 border border-slate-300 rounded px-3 py-1 flex items-center justify-between text-[11px] text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black">สถานะรายงาน:</span>
                          {filterCompletion === "completed_only" ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> รายชื่อเฉพาะผู้ผ่านการอบรมและได้รับวุฒิบัตร (Official Certified Roster)
                            </span>
                          ) : (
                            <span>แสดงรายชื่อและผลคะแนนตามจริงในระบบ TCT E-Training Platform</span>
                          )}
                        </div>
                        <div className="text-slate-700 font-mono text-[10.5px]">
                          เกณฑ์ผ่าน: ≥ {courseMeta.passingScorePercent}% (8/10 หรือ 16/20)
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Compact Continuation Header for Pages 2+ */
                    <div className="pb-2 mb-2 border-b-2 border-black">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-black">
                            {companyName} • {divisionName}
                          </div>
                          <div className="text-xs font-bold text-blue-950 mt-0.5">
                            รายงานรายชื่อผู้เข้าอบรม: {courseMeta.title} ({courseMeta.code}) — {courseMeta.batch}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            หน้า {page.pageNumber} จาก {page.totalPages}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Trainee Roster Table */}
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-700 font-bold">
                      <span className="flex items-center gap-1 text-black">
                        <Users className="w-3.5 h-3.5 text-blue-900" />
                        บัญชีรายชื่อและผลการทดสอบ {page.totalPages > 1 ? "(ชุดที่ " + page.pageNumber + ")" : ""}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        ลำดับที่ {page.startIndex + 1} - {page.startIndex + page.pageTrainees.length} จาก {filteredTrainees.length} ท่าน
                      </span>
                    </div>

                    <div className="border-2 border-black overflow-x-auto w-full max-w-full">
                      <table className="w-full border-collapse text-center text-[10px] sm:text-xs">
                        <thead>
                          <tr className="bg-slate-200 border-b-2 border-black font-bold text-black">
                            <th rowSpan={2} className="border-r border-black p-1 w-8 sm:w-10">ลำดับ</th>
                            <th rowSpan={2} className="border-r border-black p-1 w-16 sm:w-20">รหัสพนักงาน</th>
                            <th rowSpan={2} className="border-r border-black p-1 text-left min-w-[120px] px-1.5">ชื่อ - สกุล</th>
                            <th rowSpan={2} className="border-r border-black p-1 w-12 sm:w-14">แผนก</th>
                            <th rowSpan={2} className="border-r border-black p-1 w-14 sm:w-16">ตำแหน่ง</th>
                            <th rowSpan={2} className="border-r border-black p-1 w-24 sm:w-28">ขั้นตอน / สถานะ</th>
                            <th colSpan={3} className="border-r border-black p-0.5 bg-slate-300">ผลการประเมินความรู้</th>
                            <th rowSpan={2} className="border-r border-black p-1 w-14 sm:w-16">ผลประเมิน</th>
                            <th rowSpan={2} className="p-1 w-20 sm:w-24 border-r border-black">การรับรองผล</th>
                            {isEditTableMode && (
                              <th rowSpan={2} className="p-1 w-8 no-print bg-rose-100 text-rose-900">ลบ</th>
                            )}
                          </tr>
                          <tr className="bg-slate-100 border-b-2 border-black font-bold text-[9px] sm:text-[10px] text-black">
                            <th className="border-r border-black p-0.5 w-12 sm:w-14">ก่อนอบรม<br/>(เต็ม 10)</th>
                            <th className="border-r border-black p-0.5 w-12 sm:w-14">หลังอบรม<br/>(เต็ม 10)</th>
                            <th className="border-r border-black p-0.5 w-14 sm:w-16">รวม<br/>(เต็ม 20)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black">
                          {page.pageTrainees.length > 0 ? (
                            page.pageTrainees.map((trainee, idx) => {
                              const globalIndex = page.startIndex + idx + 1;
                              const traineeActualIndex = editableTrainees.indexOf(trainee);
                              return (
                                <tr key={`${trainee.empId || 't'}-${globalIndex}`} className="hover:bg-slate-50">
                                  <td className="border-r border-black p-1 font-mono font-bold text-center">
                                    {globalIndex}
                                  </td>
                                  <td className="border-r border-black p-1 font-mono text-center font-semibold text-[#0F2A4A]">
                                    {isEditTableMode ? (
                                      <input
                                        type="text"
                                        value={trainee.empId}
                                        onChange={(e) => handleUpdateCell(traineeActualIndex, 'empId', e.target.value)}
                                        className="w-full text-center bg-transparent border-b border-slate-300 font-mono text-[10px] outline-none focus:border-blue-600"
                                      />
                                    ) : (
                                      trainee.empId
                                    )}
                                  </td>
                                  <td className="border-r border-black p-1 text-left font-semibold text-black px-1.5">
                                    {isEditTableMode ? (
                                      <input
                                        type="text"
                                        value={trainee.fullName}
                                        onChange={(e) => handleUpdateCell(traineeActualIndex, 'fullName', e.target.value)}
                                        className="w-full bg-transparent border-b border-slate-300 text-[10px] outline-none focus:border-blue-600 font-semibold"
                                      />
                                    ) : (
                                      trainee.fullName
                                    )}
                                  </td>
                                  <td className="border-r border-black p-1 font-bold text-center">
                                    {isEditTableMode ? (
                                      <input
                                        type="text"
                                        value={trainee.department}
                                        onChange={(e) => handleUpdateCell(traineeActualIndex, 'department', e.target.value)}
                                        className="w-full text-center bg-transparent border-b border-slate-300 text-[10px] outline-none focus:border-blue-600 font-bold"
                                      />
                                    ) : (
                                      trainee.department
                                    )}
                                  </td>
                                  <td className="border-r border-black p-1 text-center text-slate-700">
                                    {isEditTableMode ? (
                                      <input
                                        type="text"
                                        value={trainee.position || 'พนักงาน'}
                                        onChange={(e) => handleUpdateCell(traineeActualIndex, 'position', e.target.value)}
                                        className="w-full text-center bg-transparent border-b border-slate-300 text-[10px] outline-none focus:border-blue-600"
                                      />
                                    ) : (
                                      trainee.position || "พนักงาน"
                                    )}
                                  </td>
                                  <td className="border-r border-black p-1 text-left px-1.5 font-medium text-[9.5px] sm:text-[10.5px]">
                                    {trainee.isCompleted ? (
                                      <span className="text-emerald-800 font-bold flex items-center gap-1">
                                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span>{trainee.currentStageTextThai}</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-800">
                                        {trainee.currentStageTextThai}
                                      </span>
                                    )}
                                  </td>
                                  <td className="border-r border-black p-1 font-mono font-bold text-center text-purple-950">
                                    {isEditTableMode ? (
                                      <input
                                        type="text"
                                        value={trainee.preScoreText}
                                        onChange={(e) => handleUpdateCell(traineeActualIndex, 'preScoreText', e.target.value)}
                                        className="w-full text-center bg-transparent border-b border-slate-300 text-[10px] outline-none focus:border-blue-600 font-mono"
                                      />
                                    ) : (
                                      trainee.preScoreText
                                    )}
                                  </td>
                                  <td className="border-r border-black p-1 font-mono font-bold text-center">
                                    {isEditTableMode ? (
                                      <input
                                        type="text"
                                        value={trainee.postScoreText}
                                        onChange={(e) => handleUpdateCell(traineeActualIndex, 'postScoreText', e.target.value)}
                                        className="w-full text-center bg-transparent border-b border-slate-300 text-[10px] outline-none focus:border-blue-600 font-mono font-bold"
                                      />
                                    ) : (
                                      trainee.postTestScore !== null ? (
                                        <span className={trainee.postTestScore >= 8 ? "text-black font-extrabold" : "text-red-700"}>
                                          {trainee.postScoreText}
                                        </span>
                                      ) : "-"
                                    )}
                                  </td>
                                  <td className="border-r border-black p-1 font-mono font-extrabold text-center text-blue-950">
                                    {trainee.totalScore20Text}
                                  </td>
                                  <td className="border-r border-black p-1 font-bold text-center">
                                    {trainee.isCompleted ? (
                                      <span className="text-emerald-900 font-extrabold">ผ่านเกณฑ์</span>
                                    ) : trainee.postTestScore !== null ? (
                                      <span className="text-red-700">ไม่ผ่าน</span>
                                    ) : (
                                      <span className="text-slate-500">รอทดสอบ</span>
                                    )}
                                  </td>
                                  <td className="border-r border-black p-1 text-center text-[10px] text-slate-800 font-medium">
                                    {trainee.isCompleted ? (
                                      <span className="text-emerald-900 font-bold">
                                        ✓ E-Cert ออกแล้ว
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">
                                        (อยู่ระหว่างเรียน)
                                      </span>
                                    )}
                                  </td>
                                  {isEditTableMode && (
                                    <td className="p-1 text-center no-print">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteRow(traineeActualIndex)}
                                        className="p-1 text-rose-600 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                                        title="ลบแถวนี้"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={10} className="p-6 text-center text-slate-500 italic">
                                ไม่พบข้อมูลผู้เข้าอบรมตามเงื่อนไขที่เลือก
                              </td>
                            </tr>
                          )}

                          {/* Summary Row on the final page */}
                          {page.isLast && (
                            <tr className="bg-slate-100 font-bold border-t-2 border-black text-black text-[10px]">
                              <td colSpan={5} className="border-r border-black p-1.5 text-center font-bold">
                                รวมผู้เข้าอบรม: {filteredTrainees.length} คน (จากทั้งหลักสูตร {totalCourseTrainees} คน)
                              </td>
                              <td className="border-r border-black p-1.5 text-center font-bold text-emerald-900">
                                ผ่านเกณฑ์ครบ: {filteredTrainees.filter(t => t.isCompleted).length} คน
                              </td>
                              <td colSpan={3} className="border-r border-black p-1.5 text-center font-bold text-black font-mono">
                                เกณฑ์ผ่าน: ≥ 80% (8/10 หรือ 16/20)
                              </td>
                              <td className="border-r border-black p-1.5 text-center font-bold text-blue-950">
                                ผ่าน {filteredTrainees.length > 0 ? Math.round((filteredTrainees.filter(t => t.isCompleted).length / filteredTrainees.length) * 100) : 0}%
                              </td>
                              <td className="p-1.5 text-center text-[9.5px] text-slate-800 font-bold">
                                TCT Academy
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Signatures on Final Page OR Continuation Notice on Non-Final Pages */}
                <div>
                  {page.isLast ? (
                    <div className="pt-2 border-t-2 border-slate-300">
                      <div className="text-[10px] text-slate-600 space-y-0.5 mb-1.5">
                        <div className="italic font-medium">* ใช้เป็นหลักฐานการฝึกอบรมภายในและบันทึกประวัติการพัฒนาบุคลากรประจำปี บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</div>
                        <div>* ผู้ผ่านเกณฑ์จะได้รับใบรับรองอิเล็กทรอนิกส์ (E-Certificate) พร้อมรหัสตรวจสอบความถูกต้องในระบบ</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-center text-xs">
                        {/* Signatory 1: Center Head */}
                        <div className="bg-slate-50/80 p-2 border border-slate-300 rounded space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-800">
                            1. ผู้รวบรวมและจัดทำบัญชีรายชื่อ
                          </div>
                          <div className="font-mono text-slate-400 text-[10px] pt-1">
                            ............................................................
                          </div>
                          <div className="font-bold text-black text-[11px]">
                            ({trainerSignerName})
                          </div>
                          <div className="text-slate-800 font-semibold text-[9.5px]">
                            {trainerSignerPosition}
                          </div>
                          <div className="text-slate-500 text-[8.5px]">
                            {companyName}
                          </div>
                        </div>

                        {/* Signatory 2: Center Manager */}
                        <div className="bg-slate-50/80 p-2 border border-slate-300 rounded space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-800">
                            2. ผู้ตรวจสอบและรับรองผลการทดสอบ
                          </div>
                          <div className="font-mono text-slate-400 text-[10px] pt-1">
                            ............................................................
                          </div>
                          <div className="font-bold text-black text-[11px]">
                            ({certifierSignerName})
                          </div>
                          <div className="text-slate-800 font-semibold text-[9.5px]">
                            {certifierSignerPosition}
                          </div>
                          <div className="text-slate-500 text-[8.5px]">
                            {companyName}
                          </div>
                        </div>

                        {/* Signatory 3: General Manager */}
                        <div className="bg-slate-50/80 p-2 border border-slate-300 rounded space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-800">
                            3. ผู้อนุมัติรายงานการฝึกอบรม
                          </div>
                          <div className="font-mono text-slate-400 text-[10px] pt-1">
                            ............................................................
                          </div>
                          <div className="font-bold text-black text-[11px]">
                            ({approverSignerName})
                          </div>
                          <div className="text-slate-800 font-semibold text-[9.5px]">
                            {approverSignerPosition}
                          </div>
                          <div className="text-slate-500 text-[8.5px]">
                            {companyName}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-2 pt-1 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                        <span>ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
                        <div className="flex items-center gap-3">
                          <span>วันที่ออกเอกสาร: {new Date().toLocaleDateString("th-TH")}</span>
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            หน้า {page.pageNumber} จาก {page.totalPages} (แผ่นสุดท้าย / ลายมือชื่ออนุมัติ)
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Non-last Page Footer Notice */
                    <div className="pt-2 border-t-2 border-slate-300 flex items-center justify-between text-[11px] text-slate-700">
                      <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                        <FileText className="w-4 h-4 text-blue-700" />
                        <span>* มีรายชื่อผู้เข้าอบรมลำดับที่ {page.startIndex + page.pageTrainees.length + 1} เป็นต้นไป จัดพิมพ์ต่อในหน้า {page.pageNumber + 1}</span>
                      </div>
                      <div className="font-bold px-2.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800 font-mono">
                        หน้า {page.pageNumber} จาก {page.totalPages} (ต่อเนื่อง)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 no-print">
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">{courseMeta.code}</span>
            <span>• {courseMeta.title}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
