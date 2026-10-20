import React, { useRef, useState, useMemo } from 'react';
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
  GraduationCap
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { getAllAvailableCourses } from '../utils/courseManager';
import { resolveCourseTrainees, COURSE_OFFICIAL_METADATA, CourseTraineeResolved } from '../utils/courseTraineeHelper';
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
  const [activePage, setActivePage] = useState<'all' | 'page1' | 'page2'>('all');
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

  // Resolve all trainees specifically for the chosen course
  const resolvedTrainees = useMemo(() => {
    return resolveCourseTrainees(trainees, selectedCourseId);
  }, [trainees, selectedCourseId]);

  // Filter trainees by search, department, and completion status
  const filteredTrainees = useMemo(() => {
    return resolvedTrainees.filter(t => {
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
  }, [resolvedTrainees, selectedDept, searchTerm, filterCompletion]);

  const departments = ['all', ...Array.from(new Set(trainees.map(t => t.department)))];

  const totalCourseTrainees = resolvedTrainees.length;
  const completedCourseTrainees = resolvedTrainees.filter(t => t.isCompleted).length;
  const inProgressCourseTrainees = totalCourseTrainees - completedCourseTrainees;

  // Pagination for A4 multi-page overflow
  const pageSize = reportFormat === 'a4-landscape' ? 8 : 12;
  const isMultiPage = filteredTrainees.length > pageSize;
  const page1Trainees = isMultiPage ? filteredTrainees.slice(0, pageSize) : filteredTrainees;
  const page2Trainees = isMultiPage ? filteredTrainees.slice(pageSize) : [];

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
      if (isMultiPage && reportRef.current) {
        const pages = Array.from(reportRef.current.querySelectorAll('.roster-report-page-portrait, .roster-report-page-landscape')) as HTMLElement[];
        if (pages.length > 0) {
          success = await downloadMultiPagePdf(pages, {
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
      <div className="bg-[#0B101E] border border-cyan-500/40 rounded-3xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden my-auto animate-fadeIn text-slate-100">
        
        {/* Top Control Header (No-Print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900/95 border-b border-cyan-500/30 flex flex-col gap-3 no-print">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Title & Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
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
                      ? 'bg-cyan-600 text-white font-bold'
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
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-emerald-400 hover:text-emerald-200'
                  }`}
                  title="พิมพ์เฉพาะผู้ที่จบการอบรมและผ่านเกณฑ์แล้วเท่านั้น"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>จบการอบรมแล้ว ({completedCourseTrainees})</span>
                </button>
                <button
                  onClick={() => { playCyberClick(); setFilterCompletion('in_progress'); }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterCompletion === 'in_progress'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'text-amber-400 hover:text-amber-200'
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

              {/* Format Toggle */}
              <div className="bg-slate-950 p-0.5 rounded-xl border border-slate-800 flex items-center text-xs">
                <button
                  onClick={() => { playCyberClick(); setReportFormat('a4-portrait'); }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1 ${
                    reportFormat === 'a4-portrait' 
                      ? 'bg-cyan-600 text-white shadow' 
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
                      ? 'bg-cyan-600 text-white font-bold shadow' 
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
                      ? 'bg-purple-600 text-white font-bold shadow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="มุมมองแบบจอกว้าง 16:9"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>16:9</span>
                </button>
              </div>

              {/* Multi-page Front/Back Switcher when exceeding A4 capacity */}
              {isMultiPage && (
                <div className="bg-slate-950 p-0.5 rounded-xl border border-purple-500/50 flex items-center text-xs shadow-md">
                  <button
                    onClick={() => { playCyberClick(); setActivePage('all'); }}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1 ${
                      activePage === 'all' 
                        ? 'bg-purple-600 text-white shadow' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="พิมพ์หรือแสดงทั้ง 2 หน้า (หน้า 1 ด้านหน้า + หน้า 2 ด้านหลัง)"
                  >
                    <span>📄 ทั้ง 2 หน้า</span>
                  </button>
                  <button
                    onClick={() => { playCyberClick(); setActivePage('page1'); }}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1 ${
                      activePage === 'page1' 
                        ? 'bg-purple-600 text-white shadow' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="แสดงเฉพาะหน้า 1 (ด้านหน้า: ลำดับ 1 ถึง 12)"
                  >
                    <span>1️⃣ หน้า 1</span>
                  </button>
                  <button
                    onClick={() => { playCyberClick(); setActivePage('page2'); }}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1 ${
                      activePage === 'page2' 
                        ? 'bg-purple-600 text-white shadow' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="แสดงเฉพาะหน้า 2 (ด้านหลัง: ลำดับที่เหลือ + ลายมือชื่อ)"
                  >
                    <span>2️⃣ หน้า 2</span>
                  </button>
                </div>
              )}

              {/* Export Excel */}
              <button
                onClick={handleExportExcel}
                className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Excel</span>
              </button>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>พิมพ์เอกสาร</span>
              </button>

              {/* PDF Download Button */}
              <button
                onClick={handleDownloadPdf}
                disabled={isPdfGenerating}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
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
        <div className="flex-1 overflow-y-auto p-2 sm:p-6 bg-slate-950/90 flex justify-center items-start">
          
          <div ref={reportRef} id="etraining-roster-print-area" className="flex flex-col items-center gap-8 w-full max-w-full">
            
            {/* Single Page Mode (when trainees <= pageSize) */}
            {!isMultiPage && (
              <div 
                style={{
                  fontFamily: "'TH Sarabun New', 'Sarabun', 'Prompt', sans-serif"
                }}
                className={`bg-white text-black p-4 sm:p-7 shadow-2xl transition-all border border-slate-300 text-xs sm:text-sm leading-tight rounded-sm ${
                  reportFormat === 'a4-portrait'
                    ? 'w-full max-w-[850px] min-h-[1050px] flex flex-col justify-between a4-page-portrait roster-report-page-portrait'
                    : reportFormat === 'a4-landscape'
                    ? 'w-full max-w-[1120px] min-h-[760px] flex flex-col justify-between a4-page-landscape roster-report-page-landscape'
                    : 'w-full max-w-[1150px] min-h-[640px] aspect-[16/9] flex flex-col justify-between roster-landscape-box'
                }`}
              >
                <div>
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
                  <div className="text-center my-2.5">
                    <h1 className="text-base sm:text-lg font-bold text-black tracking-tight leading-snug">
                      รายชื่อผู้เข้าอบรมในระบบ TCT ACADEMY E-TRAINING ONLINE
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
                        <span>แผนกที่เข้าอบรม: <strong className="text-blue-950 font-bold">{selectedDept === 'all' ? 'ทุกแผนก (All Departments)' : `แผนก ${selectedDept}`}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Scope Banner */}
                  <div className="mb-2 bg-slate-50 border border-slate-300 rounded px-3 py-1 flex items-center justify-between text-[11px] text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black">สถานะรายงาน:</span>
                      {filterCompletion === 'completed_only' ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> รายชื่อเฉพาะผู้ผ่านการอบรมและได้รับวุฒิบัตร (Official Certified Roster)
                        </span>
                      ) : (
                        <span>แสดงรายชื่อและขั้นตอนการเรียนของผู้เข้าอบรมตามจริงในระบบ E-Training</span>
                      )}
                    </div>
                    <div className="text-slate-600 font-mono">
                      เกณฑ์ผ่าน: ≥ {courseMeta.passingScorePercent}% (16/20 หรือ 8/10)
                    </div>
                  </div>

                  {/* Main Trainee Roster Table with Summary */}
                  <div className="border-2 border-black mb-3 overflow-hidden">
                    <table className="w-full border-collapse text-center text-[10px] sm:text-xs">
                      <thead>
                        <tr className="bg-slate-200 border-b-2 border-black font-bold text-black">
                          <th rowSpan={2} className="border-r border-black p-1.5 w-10">ลำดับที่</th>
                          <th rowSpan={2} className="border-r border-black p-1.5 w-20">รหัสประจำตัว<br/>พนักงาน</th>
                          <th rowSpan={2} className="border-r border-black p-1.5 text-left min-w-[130px]">ชื่อ - สกุล</th>
                          <th rowSpan={2} className="border-r border-black p-1.5 w-12">แผนก</th>
                          <th rowSpan={2} className="border-r border-black p-1.5 w-14">ตำแหน่ง</th>
                          <th rowSpan={2} className="border-r border-black p-1.5 w-28">ขั้นตอน / สถานะการอบรม<br/>ในหลักสูตร</th>
                          <th colSpan={3} className="border-r border-black p-1 bg-slate-300">ผลการประเมินความรู้ (คะแนนสอบ)</th>
                          <th rowSpan={2} className="border-r border-black p-1.5 w-16">ผลประเมิน</th>
                          <th rowSpan={2} className="p-1.5 w-24">ลายมือชื่อ /<br/>การรับรองผล</th>
                        </tr>
                        <tr className="bg-slate-100 border-b-2 border-black font-bold text-[9px] sm:text-[10px] text-black">
                          <th className="border-r border-black p-1 w-14">ก่อนอบรม<br/>(เต็ม 10)</th>
                          <th className="border-r border-black p-1 w-14">หลังอบรม<br/>(เต็ม 10)</th>
                          <th className="border-r border-black p-1 w-16">คะแนนรวม<br/>(เต็ม 20)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black">
                        {filteredTrainees.length > 0 ? (
                          filteredTrainees.map((trainee, idx) => (
                            <tr key={trainee.empId} className="hover:bg-slate-50">
                              <td className="border-r border-black p-1 font-mono font-bold text-center">
                                {idx + 1}
                              </td>
                              <td className="border-r border-black p-1 font-mono text-center font-semibold">
                                {trainee.empId}
                              </td>
                              <td className="border-r border-black p-1 text-left font-semibold text-black">
                                {trainee.fullName}
                              </td>
                              <td className="border-r border-black p-1 font-bold text-center">
                                {trainee.department}
                              </td>
                              <td className="border-r border-black p-1 text-center text-slate-700">
                                {trainee.position || 'SUPERVISOR'}
                              </td>
                              <td className="border-r border-black p-1 text-left px-2 font-medium text-[10px] sm:text-[11px]">
                                {trainee.isCompleted ? (
                                  <span className="text-emerald-800 font-bold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>{trainee.currentStageTextThai}</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-800">
                                    {trainee.currentStageTextThai}
                                  </span>
                                )}
                              </td>
                              <td className="border-r border-black p-1 font-mono font-bold text-center text-purple-950">
                                {trainee.preScoreText}
                              </td>
                              <td className="border-r border-black p-1 font-mono font-bold text-center">
                                {trainee.postTestScore !== null ? (
                                  <span className={trainee.postTestScore >= 8 ? 'text-black font-extrabold' : 'text-red-700'}>
                                    {trainee.postScoreText}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="border-r border-black p-1 font-mono font-extrabold text-center text-blue-950">
                                {trainee.totalScore20Text}
                              </td>
                              <td className="border-r border-black p-1 font-bold text-center">
                                {trainee.isCompleted ? (
                                  <span className="text-black font-extrabold">ผ่านเกณฑ์</span>
                                ) : trainee.postTestScore !== null ? (
                                  <span className="text-red-700">ไม่ผ่าน</span>
                                ) : (
                                  <span className="text-slate-500">รอทดสอบ</span>
                                )}
                              </td>
                              <td className="p-1 text-center font-script text-[11px] text-slate-800 font-medium">
                                {trainee.isCompleted ? (
                                  <span className="text-black font-bold">
                                    ✓ รับรองผล (E-Cert)
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">
                                    (ยังไม่จบการอบรม)
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={10} className="p-6 text-center text-slate-500 italic">
                              ไม่พบข้อมูลผู้เข้าอบรมตามเงื่อนไขที่เลือก
                            </td>
                          </tr>
                        )}

                        {/* Summary Row */}
                        <tr className="bg-slate-100 font-bold border-t-2 border-black text-black">
                          <td colSpan={5} className="border-r border-black p-1.5 text-center font-bold">
                            ผู้เข้าอบรมในรายงาน: {filteredTrainees.length} คน (จากทั้งหมด {totalCourseTrainees} คน)
                          </td>
                          <td className="border-r border-black p-1.5 text-center font-bold">
                            ผ่านการอบรมครบถ้วน: {filteredTrainees.filter(t => t.isCompleted).length} คน
                          </td>
                          <td colSpan={3} className="border-r border-black p-1.5 text-center font-bold text-black font-mono">
                            เกณฑ์ผ่านสอบ: ≥ 8/10 (≥ 16/20)
                          </td>
                          <td className="border-r border-black p-1.5 text-center font-bold text-black">
                            อัตราผ่าน {filteredTrainees.length > 0 ? Math.round((filteredTrainees.filter(t => t.isCompleted).length / filteredTrainees.length) * 100) : 0}%
                          </td>
                          <td className="p-1.5 text-center text-[10px] text-slate-800 font-bold">
                            ระบบ TCT E-Training
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sign-off Dual Boxes */}
                <div className="pt-2 border-t border-slate-300">
                  <div className="text-[10px] sm:text-[11px] text-slate-700 space-y-0.5 mb-2">
                    <div className="italic font-medium">* ใช้สำหรับเป็นหลักฐานการฝึกอบรมภายในและออกรายงานสรุปผล E-Training ประจำหลักสูตร</div>
                    <div className="text-slate-600">
                      * จะออกวุฒิบัตรและพิมพ์รายงานผลฉบับสมบูรณ์เมื่อผู้เข้าอบรมศึกษาครบทุกบทเรียนและทำแบบทดสอบผ่านเกณฑ์ ≥80% เท่านั้น
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-1 font-sarabun text-xs">
                    <div className="text-center bg-slate-50/70 p-2.5 border border-slate-300 rounded">
                      <div className="mb-6 font-bold text-slate-900 text-xs">
                        ผู้จัดการฝึกอบรมในหลักสูตร
                      </div>
                      <div className="mb-1 font-mono text-slate-500 text-xs">
                        .................................................................................
                      </div>
                      <div className="font-bold text-black text-sm">
                        ({trainerSignerName})
                      </div>
                      <div className="text-slate-900 font-semibold text-xs mt-0.5">
                        ตำแหน่ง: {trainerSignerPosition}
                      </div>
                      <div className="text-slate-700 text-[11px] font-medium">
                        {divisionName}
                      </div>
                      <div className="text-slate-600 text-[10px]">
                        {companyName}
                      </div>
                    </div>

                    <div className="text-center bg-slate-50/70 p-2.5 border border-slate-300 rounded">
                      <div className="mb-6 font-bold text-slate-900 text-xs">
                        ผู้รับรองรายชื่อและผลการทดสอบ
                      </div>
                      <div className="mb-1 font-mono text-slate-500 text-xs">
                        .................................................................................
                      </div>
                      <div className="font-bold text-black text-sm">
                        ({certifierSignerName})
                      </div>
                      <div className="text-slate-900 font-semibold text-xs mt-0.5">
                        ตำแหน่ง: {certifierSignerPosition}
                      </div>
                      <div className="text-slate-700 text-[11px] font-medium">
                        {divisionName}
                      </div>
                      <div className="text-slate-600 text-[10px]">
                        {companyName}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Multi-Page Mode (when trainees > pageSize) */}
            {isMultiPage && (
              <>
                {/* Page 1 (Front Page: ด้านหน้า) */}
                {(activePage === 'all' || activePage === 'page1') && (
                  <div 
                    style={{
                      fontFamily: "'TH Sarabun New', 'Sarabun', 'Prompt', sans-serif"
                    }}
                    className={`bg-white text-black p-4 sm:p-7 shadow-2xl transition-all border border-slate-300 text-xs sm:text-sm leading-tight rounded-sm a4-page-portrait roster-report-page-portrait ${
                      reportFormat === 'a4-portrait'
                        ? 'w-full max-w-[850px] min-h-[1050px] flex flex-col justify-between'
                        : reportFormat === 'a4-landscape'
                        ? 'w-full max-w-[1120px] min-h-[760px] flex flex-col justify-between a4-page-landscape roster-report-page-landscape'
                        : 'w-full max-w-[1150px] min-h-[640px] aspect-[16/9] flex flex-col justify-between roster-landscape-box'
                    }`}
                  >
                    <div>
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
                      <div className="text-center my-2.5">
                        <h1 className="text-base sm:text-lg font-bold text-black tracking-tight leading-snug">
                          รายชื่อผู้เข้าอบรมในระบบ TCT ACADEMY E-TRAINING ONLINE
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
                            <span>แผนกที่เข้าอบรม: <strong className="text-blue-950 font-bold">{selectedDept === 'all' ? 'ทุกแผนก (All Departments)' : `แผนก ${selectedDept}`}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Status & Scope Banner */}
                      <div className="mb-2 bg-slate-50 border border-slate-300 rounded px-3 py-1 flex items-center justify-between text-[11px] text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black">สถานะรายงาน:</span>
                          {filterCompletion === 'completed_only' ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> รายชื่อเฉพาะผู้ผ่านการอบรมและได้รับวุฒิบัตร (Official Certified Roster)
                            </span>
                          ) : (
                            <span>แสดงรายชื่อและขั้นตอนการเรียนของผู้เข้าอบรมตามจริงในระบบ E-Training</span>
                          )}
                        </div>
                        <div className="text-slate-600 font-mono">
                          เกณฑ์ผ่าน: ≥ {courseMeta.passingScorePercent}% (16/20 หรือ 8/10)
                        </div>
                      </div>

                      {/* Trainee Table Page 1 (Rows 1 to pageSize) */}
                      <div className="border-2 border-black mb-3 overflow-hidden">
                        <table className="w-full border-collapse text-center text-[10px] sm:text-xs">
                          <thead>
                            <tr className="bg-slate-200 border-b-2 border-black font-bold text-black">
                              <th rowSpan={2} className="border-r border-black p-1.5 w-10">ลำดับที่</th>
                              <th rowSpan={2} className="border-r border-black p-1.5 w-20">รหัสประจำตัว<br/>พนักงาน</th>
                              <th rowSpan={2} className="border-r border-black p-1.5 text-left min-w-[130px]">ชื่อ - สกุล</th>
                              <th rowSpan={2} className="border-r border-black p-1.5 w-12">แผนก</th>
                              <th rowSpan={2} className="border-r border-black p-1.5 w-14">ตำแหน่ง</th>
                              <th rowSpan={2} className="border-r border-black p-1.5 w-28">ขั้นตอน / สถานะการอบรม<br/>ในหลักสูตร</th>
                              <th colSpan={3} className="border-r border-black p-1 bg-slate-300">ผลการประเมินความรู้ (คะแนนสอบ)</th>
                              <th rowSpan={2} className="border-r border-black p-1.5 w-16">ผลประเมิน</th>
                              <th rowSpan={2} className="p-1.5 w-24">ลายมือชื่อ /<br/>การรับรองผล</th>
                            </tr>
                            <tr className="bg-slate-100 border-b-2 border-black font-bold text-[9px] sm:text-[10px] text-black">
                              <th className="border-r border-black p-1 w-14">ก่อนอบรม<br/>(เต็ม 10)</th>
                              <th className="border-r border-black p-1 w-14">หลังอบรม<br/>(เต็ม 10)</th>
                              <th className="border-r border-black p-1 w-16">คะแนนรวม<br/>(เต็ม 20)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black">
                            {page1Trainees.map((trainee, idx) => (
                              <tr key={trainee.empId} className="hover:bg-slate-50">
                                <td className="border-r border-black p-1 font-mono font-bold text-center">
                                  {idx + 1}
                                </td>
                                <td className="border-r border-black p-1 font-mono text-center font-semibold">
                                  {trainee.empId}
                                </td>
                                <td className="border-r border-black p-1 text-left font-semibold text-black">
                                  {trainee.fullName}
                                </td>
                                <td className="border-r border-black p-1 font-bold text-center">
                                  {trainee.department}
                                </td>
                                <td className="border-r border-black p-1 text-center text-slate-700">
                                  {trainee.position || 'SUPERVISOR'}
                                </td>
                                <td className="border-r border-black p-1 text-left px-2 font-medium text-[10px] sm:text-[11px]">
                                  {trainee.isCompleted ? (
                                    <span className="text-emerald-800 font-bold flex items-center gap-1">
                                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>{trainee.currentStageTextThai}</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-800">
                                      {trainee.currentStageTextThai}
                                    </span>
                                  )}
                                </td>
                                <td className="border-r border-black p-1 font-mono font-bold text-center text-purple-950">
                                  {trainee.preScoreText}
                                </td>
                                <td className="border-r border-black p-1 font-mono font-bold text-center">
                                  {trainee.postTestScore !== null ? (
                                    <span className={trainee.postTestScore >= 8 ? 'text-black font-extrabold' : 'text-red-700'}>
                                      {trainee.postScoreText}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="border-r border-black p-1 font-mono font-extrabold text-center text-blue-950">
                                  {trainee.totalScore20Text}
                                </td>
                                <td className="border-r border-black p-1 font-bold text-center">
                                  {trainee.isCompleted ? (
                                    <span className="text-black font-extrabold">ผ่านเกณฑ์</span>
                                  ) : trainee.postTestScore !== null ? (
                                    <span className="text-red-700">ไม่ผ่าน</span>
                                  ) : (
                                    <span className="text-slate-500">รอทดสอบ</span>
                                  )}
                                </td>
                                <td className="p-1 text-center font-script text-[11px] text-slate-800 font-medium">
                                  {trainee.isCompleted ? (
                                    <span className="text-black font-bold">
                                      ✓ รับรองผล (E-Cert)
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">
                                      (ยังไม่จบการอบรม)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Page 1 Bottom Overflow Notice & Page Indicator */}
                    <div className="pt-2 border-t-2 border-slate-300 flex items-center justify-between text-[11px] text-slate-700">
                      <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                        <FileText className="w-4 h-4 text-blue-700" />
                        <span>* มีรายชื่อผู้เข้าอบรมลำดับที่ {pageSize + 1} เป็นต้นไป และการลงนามรับรองผล จัดพิมพ์ต่อในหน้า 2 (ด้านหลัง)</span>
                      </div>
                      <div className="font-bold px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800">
                        หน้า 1 จาก 2 (ด้านหน้า)
                      </div>
                    </div>
                  </div>
                )}

                {/* Page 2 (Back Page: ด้านหลัง - Overflow trainees + Sign-off) */}
                {(activePage === 'all' || activePage === 'page2') && (
                  <div 
                    style={{
                      fontFamily: "'TH Sarabun New', 'Sarabun', 'Prompt', sans-serif"
                    }}
                    className={`bg-white text-black p-4 sm:p-7 shadow-2xl transition-all border border-slate-300 text-xs sm:text-sm leading-tight rounded-sm a4-page-portrait roster-report-page-portrait ${
                      reportFormat === 'a4-portrait'
                        ? 'w-full max-w-[850px] min-h-[1050px] flex flex-col justify-between'
                        : reportFormat === 'a4-landscape'
                        ? 'w-full max-w-[1120px] min-h-[760px] flex flex-col justify-between a4-page-landscape roster-report-page-landscape'
                        : 'w-full max-w-[1150px] min-h-[640px] aspect-[16/9] flex flex-col justify-between roster-landscape-box'
                    }`}
                  >
                    <div>
                      {/* Header Continuation */}
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

                      <div className="text-center my-2">
                        <h2 className="text-sm sm:text-base font-bold text-black tracking-tight">
                          รายชื่อผู้เข้าอบรมในระบบ TCT ACADEMY E-TRAINING ONLINE (ต่อจากหน้าแรก / ด้านหลัง)
                        </h2>
                        <div className="text-xs text-slate-800 font-medium">
                          หลักสูตร: <span className="font-bold text-black">{courseMeta.title}</span> ({courseMeta.code}) | {courseMeta.batch}
                        </div>
                      </div>

                      {/* Trainee Table Page 2 (Rows pageSize+1 to N) + Summary Row */}
                      <div className="border-2 border-black mb-3 overflow-hidden">
                        <table className="w-full border-collapse text-center text-[10px] sm:text-xs">
                          <thead>
                            <tr className="bg-slate-200 border-b-2 border-black font-bold text-black">
                              <th rowSpan={2} className="border-r border-black p-1.5 w-10">ลำดับที่</th>
                              <th rowSpan={2} className="border-r border-black p-1.5 w-20">รหัสประจำตัว<br/>พนักงาน</th>
                              <th rowSpan={2} className="border-r border-black p-1.5 text-left min-w-[130px]">ชื่อ - สกุล</th>
                              <th rowSpan={2} className="border-r border-black p-1.5 w-12">แผนก</th>
                              <th rowSpan={2} className="border-r border-black p-1.5 w-14">ตำแหน่ง</th>
                              <th rowSpan={2} className="border-r border-black p-1.5 w-28">ขั้นตอน / สถานะการอบรม<br/>ในหลักสูตร</th>
                              <th colSpan={3} className="border-r border-black p-1 bg-slate-300">ผลการประเมินความรู้ (คะแนนสอบ)</th>
                              <th rowSpan={2} className="border-r border-black p-1.5 w-16">ผลประเมิน</th>
                              <th rowSpan={2} className="p-1.5 w-24">ลายมือชื่อ /<br/>การรับรองผล</th>
                            </tr>
                            <tr className="bg-slate-100 border-b-2 border-black font-bold text-[9px] sm:text-[10px] text-black">
                              <th className="border-r border-black p-1 w-14">ก่อนอบรม<br/>(เต็ม 10)</th>
                              <th className="border-r border-black p-1 w-14">หลังอบรม<br/>(เต็ม 10)</th>
                              <th className="border-r border-black p-1 w-16">คะแนนรวม<br/>(เต็ม 20)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black">
                            {page2Trainees.map((trainee, idx) => (
                              <tr key={trainee.empId} className="hover:bg-slate-50">
                                <td className="border-r border-black p-1 font-mono font-bold text-center">
                                  {pageSize + idx + 1}
                                </td>
                                <td className="border-r border-black p-1 font-mono text-center font-semibold">
                                  {trainee.empId}
                                </td>
                                <td className="border-r border-black p-1 text-left font-semibold text-black">
                                  {trainee.fullName}
                                </td>
                                <td className="border-r border-black p-1 font-bold text-center">
                                  {trainee.department}
                                </td>
                                <td className="border-r border-black p-1 text-center text-slate-700">
                                  {trainee.position || 'SUPERVISOR'}
                                </td>
                                <td className="border-r border-black p-1 text-left px-2 font-medium text-[10px] sm:text-[11px]">
                                  {trainee.isCompleted ? (
                                    <span className="text-emerald-800 font-bold flex items-center gap-1">
                                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>{trainee.currentStageTextThai}</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-800">
                                      {trainee.currentStageTextThai}
                                    </span>
                                  )}
                                </td>
                                <td className="border-r border-black p-1 font-mono font-bold text-center text-purple-950">
                                  {trainee.preScoreText}
                                </td>
                                <td className="border-r border-black p-1 font-mono font-bold text-center">
                                  {trainee.postTestScore !== null ? (
                                    <span className={trainee.postTestScore >= 8 ? 'text-black font-extrabold' : 'text-red-700'}>
                                      {trainee.postScoreText}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="border-r border-black p-1 font-mono font-extrabold text-center text-blue-950">
                                  {trainee.totalScore20Text}
                                </td>
                                <td className="border-r border-black p-1 font-bold text-center">
                                  {trainee.isCompleted ? (
                                    <span className="text-black font-extrabold">ผ่านเกณฑ์</span>
                                  ) : trainee.postTestScore !== null ? (
                                    <span className="text-red-700">ไม่ผ่าน</span>
                                  ) : (
                                    <span className="text-slate-500">รอทดสอบ</span>
                                  )}
                                </td>
                                <td className="p-1 text-center font-script text-[11px] text-slate-800 font-medium">
                                  {trainee.isCompleted ? (
                                    <span className="text-black font-bold">
                                      ✓ รับรองผล (E-Cert)
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">
                                      (ยังไม่จบการอบรม)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}

                            {/* Summary Row */}
                            <tr className="bg-slate-100 font-bold border-t-2 border-black text-black">
                              <td colSpan={5} className="border-r border-black p-1.5 text-center font-bold">
                                รวมผู้เข้าอบรมทั้งหมด: {filteredTrainees.length} คน (จากทั้งหมด {totalCourseTrainees} คน)
                              </td>
                              <td className="border-r border-black p-1.5 text-center font-bold">
                                ผ่านการอบรมครบถ้วน: {filteredTrainees.filter(t => t.isCompleted).length} คน
                              </td>
                              <td colSpan={3} className="border-r border-black p-1.5 text-center font-bold text-black font-mono">
                                เกณฑ์ผ่านสอบ: ≥ 8/10 (≥ 16/20)
                              </td>
                              <td className="border-r border-black p-1.5 text-center font-bold text-black">
                                อัตราผ่าน {filteredTrainees.length > 0 ? Math.round((filteredTrainees.filter(t => t.isCompleted).length / filteredTrainees.length) * 100) : 0}%
                              </td>
                              <td className="p-1.5 text-center text-[10px] text-slate-800 font-bold">
                                ระบบ TCT E-Training
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Official Sign-off Dual Boxes */}
                    <div className="pt-2 border-t border-slate-300">
                      <div className="text-[10px] sm:text-[11px] text-slate-700 space-y-0.5 mb-2">
                        <div className="italic font-medium">* ใช้สำหรับเป็นหลักฐานการฝึกอบรมภายในและออกรายงานสรุปผล E-Training ประจำหลักสูตร</div>
                        <div className="text-slate-600">
                          * จะออกวุฒิบัตรและพิมพ์รายงานผลฉบับสมบูรณ์เมื่อผู้เข้าอบรมศึกษาครบทุกบทเรียนและทำแบบทดสอบผ่านเกณฑ์ ≥80% เท่านั้น
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 font-sarabun text-xs">
                        <div className="text-center bg-slate-50/70 p-2 border border-slate-300 rounded space-y-1">
                          <div className="text-[11px] font-bold text-slate-900">
                            1. หัวหน้าศูนย์ TCT Academy
                          </div>
                          <div className="h-7 border-b border-slate-400 mx-auto w-full max-w-[140px]"></div>
                          <div className="font-bold text-black text-xs mt-1">
                            ({trainerSignerName})
                          </div>
                          <div className="text-slate-800 font-semibold text-[10px]">
                            {trainerSignerPosition}
                          </div>
                          <div className="text-slate-600 text-[9px]">
                            {companyName}
                          </div>
                        </div>

                        <div className="text-center bg-slate-50/70 p-2 border border-slate-300 rounded space-y-1">
                          <div className="text-[11px] font-bold text-slate-900">
                            2. ผู้จัดการศูนย์ TCT Academy
                          </div>
                          <div className="h-7 border-b border-slate-400 mx-auto w-full max-w-[140px]"></div>
                          <div className="font-bold text-black text-xs mt-1">
                            ({certifierSignerName})
                          </div>
                          <div className="text-slate-800 font-semibold text-[10px]">
                            {certifierSignerPosition}
                          </div>
                          <div className="text-slate-600 text-[9px]">
                            {companyName}
                          </div>
                        </div>

                        <div className="text-center bg-slate-50/70 p-2 border border-slate-300 rounded space-y-1">
                          <div className="text-[11px] font-bold text-slate-900">
                            3. ผู้จัดการทั่วไป/โรงงาน (ประธานที่ปรึกษา)
                          </div>
                          <div className="h-7 border-b border-slate-400 mx-auto w-full max-w-[140px]"></div>
                          <div className="font-bold text-black text-xs mt-1">
                            ({approverSignerName})
                          </div>
                          <div className="text-slate-800 font-semibold text-[10px]">
                            {approverSignerPosition}
                          </div>
                          <div className="text-slate-600 text-[9px]">
                            {companyName}
                          </div>
                        </div>
                      </div>

                      {/* Page 2 Bottom Indicator */}
                      <div className="mt-3 pt-1 border-t border-slate-200 flex justify-end text-[10px] text-slate-600 font-bold">
                        <span>หน้า 2 จาก 2 (ด้านหลัง)</span>
                      </div>
                    </div>

                  </div>
                )}
              </>
            )}

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
