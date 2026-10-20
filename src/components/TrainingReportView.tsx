import React, { useRef, useState } from 'react';
import { UserProfile, ViewState } from '../types';
import { toPng } from 'html-to-image';
import { calculateLearningMetrics } from '../utils/scoreMetrics';
import { downloadElementAsPdf, downloadMultiPagePdf, printElementViaStandaloneWindow } from '../utils/pdfExport';
import { getCourseVideoWatchSummary, formatWatchTime } from '../utils/videoManager';
import { allCourses, COURSE_MODULES, formatDepartmentFull } from '../data/courseData';
import { PREVENTIVE_COURSE_MODULES } from '../data/preventiveCourseData';
import { getCourseModules, getAllAvailableCourses } from '../utils/courseManager';
import { COURSE_OFFICIAL_METADATA } from '../utils/courseTraineeHelper';
import { TCTLogo } from './TCTLogo';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  CheckCircle2, 
  Award, 
  User, 
  BookOpen, 
  BarChart3, 
  Layers, 
  Shield, 
  Sparkles, 
  FileSpreadsheet,
  Building,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  FileDown,
  FileCheck2,
  Video,
  PlayCircle,
  Edit3
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import * as XLSX from 'xlsx';

interface TrainingReportViewProps {
  user: UserProfile;
  onNavigate: (view: ViewState) => void;
  onOpenEditProfile?: () => void;
  onOpenInhouseReport?: () => void;
  onOpenETrainingRoster?: () => void;
}

export const TrainingReportView: React.FC<TrainingReportViewProps> = ({
  user,
  onNavigate,
  onOpenEditProfile,
  onOpenInhouseReport,
  onOpenETrainingRoster
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState<'all' | 'page1' | 'page2'>('all');
  const [reportFormat, setReportFormat] = useState<'portrait' | 'landscape' | '16:9' | '4:3'>('portrait');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [exportNotice, setExportNotice] = useState(false);

  // Dynamic Course Data with course switcher
  const availableCoursesList = getAllAvailableCourses();
  const [activeCourseId, setActiveCourseId] = useState<string>(user.selectedCourseId || 'risk-management');
  const currentCourseId = activeCourseId;
  const currentCourse = availableCoursesList.find(c => c.id === currentCourseId) || availableCoursesList[0];
  const officialCourseMetadata = COURSE_OFFICIAL_METADATA[currentCourseId] || {
    title: currentCourse?.thaiTitle || currentCourse?.title || 'หลักสูตรการฝึกอบรม',
    code: currentCourse?.code || `TCT-${currentCourseId.toUpperCase().slice(0, 4)}-01`,
    batch: 'รุ่นที่ 1 / 2569',
    trainingDates: 'ประจำปี 2569',
    instructor: 'นายณฐวัตร พงษ์สาริกิจ & ทีมวิทยากร TCT Academy',
    institute: 'ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development & Training Center',
    totalModules: getCourseModules(currentCourseId).length || 4,
    passingScorePercent: currentCourse?.passingScore || 80
  };
  const officialCourseTitle = officialCourseMetadata.title;
  const isPersonality = currentCourseId === 'personality-psychology' || currentCourseId === 'conflict-management';
  const isPreventive = currentCourseId === 'advanced-preventive-maintenance';
  const courseModules = getCourseModules(currentCourseId);

  // Video watch time calculations
  const videoSummary = getCourseVideoWatchSummary(user.empId, currentCourseId, courseModules.length);

  // Per-course progress resolution
  const courseProgress = user.coursesProgress?.[currentCourseId];
  const preScore = courseProgress ? (courseProgress.preTestScore ?? null) : (user.preTestScore ?? null);
  const postScore = courseProgress ? (courseProgress.postTestScore ?? null) : (user.postTestScore ?? null);
  const completedModulesList = courseProgress ? (courseProgress.completedModules || []) : (user.completedModules || []);
  const hasPostTest = postScore !== null && postScore !== undefined;
  const hasPreTest = preScore !== null && preScore !== undefined;
  const isPassed = hasPostTest && (postScore ?? 0) >= 8;

  const metrics = calculateLearningMetrics(preScore, postScore);
  const miniGameScore = courseProgress ? (courseProgress.miniGameScore ?? 0) : (user.miniGameScore ?? 0);
  const growthDisplay = hasPostTest 
    ? (metrics.growthPercentage === 100 ? '100%' : `+${metrics.scoreDelta}%`)
    : 'รอการทดสอบ';
  const completionDate = (courseProgress?.certificateDate) || user.certificateDate || (hasPostTest ? (user.completedAt || new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })) : 'อยู่ระหว่างการฝึกอบรม');
  
  const certPrefix = isPersonality ? 'TCT-A001' : (isPreventive ? 'TCT-APM' : 'TCT-QSRM');
  const certificateCode = (courseProgress?.certificateId) || user.certificateId || (hasPostTest ? `${certPrefix}-${new Date().getFullYear()}-${user.empId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'EMP'}-8892` : 'PENDING-COMPLETION');

  const handlePrint = () => {
    playCyberClick();
    if (reportRef.current) {
      const title = `TCT_Training_Report_A4_${user.empId || 'EMP'}_${user.department || 'TCT'}`;
      printElementViaStandaloneWindow(
        reportRef.current,
        title,
        reportFormat === 'portrait' ? 'portrait' : 'landscape'
      );
    } else {
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    playCyberClick();
    setIsPdfGenerating(true);
    setDownloadSuccess(false);

    try {
      const filename = `TCT_E-Training_Report_A4_${user.empId || 'Employee'}_${user.department || 'TCT'}.pdf`;
      const isPortrait = reportFormat === 'portrait';
      const orientation = isPortrait ? 'portrait' : 'landscape';

      // Check if both page 1 and page 2 are present
      const page1 = document.getElementById('training-report-page-1');
      const page2 = document.getElementById('training-report-page-2');

      let success = false;
      if (activePage === 'all' && page1 && page2) {
        success = await downloadMultiPagePdf([page1, page2], {
          filename,
          orientation,
          format: 'a4',
          scale: 2.5
        });
      } else {
        const targetEl = (activePage === 'page2' && page2) ? page2 : (page1 || reportRef.current);
        success = await downloadElementAsPdf(targetEl, {
          filename,
          orientation,
          format: 'a4',
          scale: 2.5
        });
      }

      if (success) {
        playSuccessChime();
        setDownloadMessage('บันทึกและดาวน์โหลดรายงาน PDF ขนาด A4 สำเร็จ!');
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }
    } catch (err) {
      console.error('PDF download error:', err);
      handlePrint();
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!reportRef.current) return;
    playCyberClick();
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const dataUrl = await toPng(reportRef.current, {
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
        cacheBust: true,
        fontEmbedCSS: '',
        skipFonts: true,
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `TCT_E-Training_Report_A4_${user.empId || 'Employee'}_${user.department || 'TCT'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      playSuccessChime();
      setDownloadMessage('ดาวน์โหลดรูปภาพรายงานผล (PNG) สำเร็จ!');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4500);
    } catch (err) {
      console.warn('html-to-image error:', err);
      handlePrint();
    } finally {
      setIsDownloading(false);
    }
  };

  // Export Individual Report to Modern Excel
  const handleExportExcel = () => {
    playCyberClick();

    // Modern Excel Structure
    const wb = XLSX.utils.book_new();
    
    // Main Data
    const data = [
      ['ระบบฝึกอบรมออนไลน์ TCT ACADEMY'],
      ['รายงานผลการฝึกอบรมรายบุคคล'],
      ['วันที่ออกรายงาน', new Date().toLocaleDateString('th-TH')],
      [''],
      ['หัวข้อ', 'รายละเอียด'],
      ['รหัสพนักงาน', user.empId],
      ['ชื่อ-นามสกุล', user.fullName],
      ['แผนก', formatDepartmentFull(user.department)],
      ['สถานะผลการประเมิน', hasPostTest ? (postScore! >= 8 ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์') : 'อยู่ระหว่างการฝึกอบรม'],
      [''],
      ['โมดูล', 'สถานะการดูวิดีโอ', 'วันที่ทำสำเร็จ']
    ];

    // Add module data
    courseModules.forEach((m) => {
      const isDone = user.completedModules?.includes(m.id);
      const modStat = videoSummary.modules[m.id];
      data.push([
        `โมดูล ${m.id}: ${m.title}`,
        isDone ? 'สำเร็จ' : 'ยังไม่สำเร็จ',
        modStat?.completedAt || '-'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Add Styling (Basic colors)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = {c:C, r:R};
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!ws[cell_ref]) continue;
            ws[cell_ref].s = {
                font: { name: 'TH Sarabun New', sz: 14 },
                fill: { fgColor: { rgb: R < 4 ? "FFFF00" : (R % 2 === 0 ? "E2EFDA" : "FFFFFF") } } // Colorful background
            };
        }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'รายงานผล');
    XLSX.writeFile(wb, `TCT_Training_Report_${user.empId}.xlsx`);

    playSuccessChime();
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 4500);
  };


  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 font-sarabun">
      {/* Top Header & Actions Bar (Hidden during Print) */}
      <div className="no-print glass-panel-cyan rounded-3xl p-5 sm:p-6 border border-cyan-500/40 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-semibold">
                TCT E-TRAINING OFFICIAL A4 REPORT
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                เอกสารรายงานผลรายบุคคล A4 แนวตั้ง (Portrait Document)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              รายงานผลการฝึกอบรมรายบุคคล (Individual Training Report)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              เอกสารมาตรฐาน <strong>A4 แนวตั้ง</strong> แสดงผลสัมฤทธิ์ เวลาดูวิดีโอ คะแนน Pre/Post-Test รายละเอียดสมรรถนะ พร้อมระบบส่งออกเป็น <strong>PDF และ Excel/CSV</strong> สำหรับฝ่ายบุคคลและธุรการ (Personnel) และผู้บริหาร
            </p>
          </div>

          {/* Action Buttons with Bilingual Labels */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Course Selector */}
            <select
              value={activeCourseId}
              onChange={(e) => { playCyberClick(); setActiveCourseId(e.target.value); }}
              className="bg-slate-900 border-2 border-cyan-500/50 rounded-xl px-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-md max-w-[280px] truncate"
            >
              {availableCoursesList.map((c, idx) => (
                <option key={c.id} value={c.id}>
                  {c.code ? `[${c.code}] ` : `หลักสูตรที่ ${idx + 1}: `}{c.thaiTitle || c.title}
                </option>
              ))}
            </select>

            {/* Page View Selector (Front / Back / Both) */}
            <div className="flex items-center gap-1 bg-slate-900/90 border-2 border-purple-500/50 rounded-2xl p-1 shadow-lg shadow-purple-500/10">
              <button
                id="report-page-all-btn"
                type="button"
                onClick={() => { playCyberClick(); setActivePage('all'); }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activePage === 'all'
                    ? 'bg-purple-600 text-white shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="แสดงครบทั้ง 2 หน้า (หน้า 1 ด้านหน้า + หน้า 2 ด้านหลัง)"
              >
                <span>📄</span>
                <span>ทั้ง 2 หน้า (หน้า-หลัง)</span>
              </button>
              <button
                id="report-page-1-btn"
                type="button"
                onClick={() => { playCyberClick(); setActivePage('page1'); }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activePage === 'page1'
                    ? 'bg-purple-600 text-white shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="แสดงเฉพาะหน้า 1 (ด้านหน้า: สรุปผลสัมฤทธิ์และเวลาเรียน)"
              >
                <span>1️⃣</span>
                <span>หน้า 1 (ด้านหน้า)</span>
              </button>
              <button
                id="report-page-2-btn"
                type="button"
                onClick={() => { playCyberClick(); setActivePage('page2'); }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activePage === 'page2'
                    ? 'bg-purple-600 text-white shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="แสดงเฉพาะหน้า 2 (ด้านหลัง: รายละเอียดวิชา แผนปฏิบัติ และลายมือชื่ออนุมัติ)"
              >
                <span>2️⃣</span>
                <span>หน้า 2 (ด้านหลัง)</span>
              </button>
            </div>

            {/* Format / Aspect Ratio Selector */}
            <div className="flex items-center gap-1 bg-slate-900/90 border-2 border-cyan-500/50 rounded-2xl p-1 shadow-lg shadow-cyan-500/10">
              <button
                id="report-format-portrait-btn"
                type="button"
                onClick={() => { playCyberClick(); setReportFormat('portrait'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  reportFormat === 'portrait'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="A4 แนวตั้งมาตรฐาน 210 × 297 mm"
              >
                <span>📄</span>
                <span>A4 แนวตั้ง (Portrait)</span>
              </button>
              <button
                id="report-format-landscape-btn"
                type="button"
                onClick={() => { playCyberClick(); setReportFormat('landscape'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  reportFormat === 'landscape'
                    ? 'bg-emerald-400 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="A4 แนวนอนมาตรฐาน 297 × 210 mm"
              >
                <span>📃</span>
                <span>A4 แนวนอน (Landscape)</span>
              </button>
              <button
                id="report-format-16-9-btn"
                type="button"
                onClick={() => { playCyberClick(); setReportFormat('16:9'); }}
                className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  reportFormat === '16:9'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="สัดส่วน 16:9 Widescreen"
              >
                <span>16:9</span>
              </button>
            </div>

            {/* Download PDF Button */}
            <button
              id="report-download-pdf-btn"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="flex-1 sm:flex-none bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-lg shadow-red-500/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 min-h-[40px]"
              title="บันทึกและดาวน์โหลดรายงานเป็นไฟล์ PDF ทันที"
            >
              {isPdfGenerating ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>{isPdfGenerating ? 'กำลังสร้าง PDF...' : 'บันทึกไฟล์ PDF'}</span>
            </button>

            {/* Edit Profile Button */}
            {onOpenEditProfile && (
              <button
                id="report-edit-profile-btn"
                type="button"
                onClick={() => { playCyberClick(); onOpenEditProfile(); }}
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[40px]"
                title="แก้ไขข้อมูลส่วนตัว / ชื่อ-นามสกุล / แผนก"
              >
                <Edit3 className="w-4 h-4 text-cyan-200" />
                <span>แก้ไขข้อมูลพนักงาน</span>
              </button>
            )}

            {/* Official In-House Training Report 3-Page Modal Button */}
            {onOpenInhouseReport && (
              <button
                id="report-inhouse-3page-btn"
                type="button"
                onClick={() => { playCyberClick(); onOpenInhouseReport(); }}
                className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[40px]"
                title="เปิดแบบรายงานผลการฝึกอบรมภายใน 3 หน้า (IN-HOUSE TRAINING REPORT)"
              >
                <FileText className="w-4 h-4 text-indigo-200" />
                <span>แบบรายงานฝึกอบรมภายใน (3 หน้า)</span>
              </button>
            )}

            {/* Export Excel / CSV Button */}
            <button
              id="report-export-excel-btn"
              type="button"
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[40px]"
              title="ส่งออกรายงานเป็นไฟล์ Excel / CSV สำหรับผู้บริหาร (Export Excel)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>ส่งออก Excel / CSV</span>
            </button>

            {/* Direct A4 PDF Download Button */}
            <button
              id="report-direct-pdf-btn"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 hover:from-blue-600 hover:to-indigo-800 text-white font-extrabold text-xs py-2.5 px-3.5 rounded-xl shadow-lg shadow-blue-800/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 min-h-[40px]"
              title="ดาวน์โหลดเป็นไฟล์ PDF ขนาด A4 1 ต่อ 1 ทันที (Direct A4 PDF)"
            >
              {isPdfGenerating ? (
                <Sparkles className="w-4 h-4 animate-spin text-cyan-300" />
              ) : (
                <FileCheck2 className="w-4 h-4 text-cyan-300" />
              )}
              <span>{isPdfGenerating ? 'กำลังสร้าง A4 PDF...' : 'ดาวน์โหลด PDF (A4 1:1)'}</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              id="report-print-btn"
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[40px]"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ / บันทึก PDF</span>
            </button>

            {/* Download Image Button */}
            <button
              id="report-download-img-btn"
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 min-h-[40px]"
            >
              {isDownloading ? (
                <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              ) : (
                <Download className="w-4 h-4 text-slate-400" />
              )}
              <span>{isDownloading ? 'กำลังสร้าง...' : 'รูปภาพ (PNG)'}</span>
            </button>

            {/* Switch to Certificate - Shown only if passed */}
            {isPassed && (
              <button
                id="report-goto-cert-btn"
                type="button"
                onClick={() => { playCyberClick(); onNavigate('certificate'); }}
                className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-lg shadow-amber-600/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[40px]"
                title="เปิดใบประกาศนียบัตร (พิมพ์/ดาวน์โหลด)"
              >
                <Award className="w-4 h-4" />
                <span>ใบรับรอง A4 (Cert)</span>
              </button>
            )}

            {/* Back to Dashboard */}
            <button
              id="report-back-dashboard-btn"
              type="button"
              onClick={() => { playCyberClick(); onNavigate('dashboard'); }}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 border border-slate-700 cursor-pointer min-h-[40px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>แดชบอร์ด</span>
            </button>
          </div>
        </div>

        {/* Official A4 1:1 Standard Assurance Badge */}
        <div className="mt-3 py-2 px-3.5 rounded-xl bg-blue-900/40 border border-blue-400/30 text-blue-200 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">
              จัดหน้าเอกสาร A4 แบบ 1 ต่อ 1 (210 × 297 มม.) — รับประกันพิมพ์ 1 หน้าต่อ 1 แผ่นกระดาษพอดี ไม่ล้นหน้า
            </span>
          </div>
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            A4 1:1 Scale • Zero Overflow
          </span>
        </div>

        {downloadSuccess && (
          <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadMessage}</span>
          </div>
        )}

        {exportNotice && (
          <div className="mt-3 p-3 rounded-xl bg-teal-950/90 border border-teal-500/60 text-teal-200 text-xs flex items-center gap-2.5 animate-fadeIn">
            <FileSpreadsheet className="w-5 h-5 text-teal-400 shrink-0" />
            <span><strong>ส่งออกสำเร็จ!</strong> สร้างและดาวน์โหลดไฟล์ตาราง Excel / CSV สำหรับผู้บริหารเรียบร้อยแล้ว</span>
          </div>
        )}
      </div>

      {/* Dynamic @page print orientation for seamless full-page printing */}
      <style>{`
        @media print {
          @page {
            size: A4 ${reportFormat === 'portrait' ? 'portrait' : 'landscape'} !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Mobile-Friendly Hint */}
      <div className="md:hidden no-print w-full max-w-[794px] px-3.5 py-2 bg-blue-50/90 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-center justify-between mb-2">
        <span>📱 บนจอมือถือ: เลื่อนดูเอกสาร A4 เต็มแผ่น หรือกดปุ่ม "ดาวน์โหลด PDF (A4 1:1)"</span>
        <span className="font-bold text-[10px] bg-white px-2 py-0.5 rounded border border-blue-300">A4 1:1</span>
      </div>

      {/* ========================================================= */}
      {/* TRAINING REPORT DOCUMENT (PORTRAIT / 16:9 / 4:3) */}
      {/* ========================================================= */}
      <div className="flex flex-col items-center pb-8 gap-8 w-full overflow-x-auto">
        <div
          id="training-report-print-area"
          ref={reportRef}
          className="w-full flex flex-col items-center gap-8"
        >
          {/* ========================================================= */}
          {/* PAGE 1: ด้านหน้า (FRONT SHEET) - สรุปผลสัมฤทธิ์และเวลาเรียน  */}
          {/* ========================================================= */}
          {(activePage === 'all' || activePage === 'page1') && (
            <div className="w-full flex flex-col items-center">
              {/* On-screen A4 Sheet Indicator */}
              <div className="no-print mb-2 flex items-center justify-between w-full max-w-[794px] px-3.5 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                <span className="flex items-center gap-2 text-blue-900">
                  <FileText className="w-4 h-4 text-[#005A9C]" />
                  <span>แบบรายงาน A4 แผ่นที่ 1 (ด้านหน้า: ข้อมูลพนักงานและผลสัมฤทธิ์)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  ขนาด A4 {reportFormat === 'landscape' ? '297 × 210 mm' : '210 × 297 mm'} (1:1)
                </span>
              </div>

              <div
                id="training-report-page-1"
                style={{ fontFamily: "'Sarabun', 'TH Sarabun New', 'Prompt', sans-serif" }}
                className={`w-full ${
                  reportFormat === 'landscape'
                    ? 'max-w-[1122px] min-h-[794px]'
                    : reportFormat === '16:9'
                    ? 'max-w-[1050px]'
                    : reportFormat === '4:3'
                    ? 'max-w-[920px]'
                    : 'max-w-[794px] min-h-[1120px] max-h-[1122px] overflow-hidden'
                } bg-white text-slate-800 rounded-2xl p-5 sm:p-7 border-2 border-slate-300 shadow-2xl relative font-sarabun flex flex-col justify-between transition-all training-report-page ${reportFormat === 'landscape' ? 'a4-page-landscape' : 'a4-page-portrait'}`}
              >
              <div>
                {/* 1. Prominent Institution Header */}
                <div className="text-center space-y-1 pb-2.5 border-b-2 border-slate-800 flex flex-col items-center">
                  <div className="mb-1 flex justify-center">
                    <TCTLogo size="doc" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-bold text-[#B45309]">
                      ศูนย์ฝึกอบรมและพัฒนา TCT Academy • Personnel Development & Training Center
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-[#0F2A4A] font-mono tracking-wider uppercase">
                      บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • TEIJIN CORD (THAILAND) CO., LTD.
                    </div>
                  </div>

                  <div className="pt-1.5">
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A4A] tracking-tight font-sarabun">
                        รายงานผลการฝึกอบรมและประเมินผลสัมฤทธิ์
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                        หน้า 1/2: ด้านหน้า
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-[#475569] tracking-wider uppercase mt-0.5 font-sarabun">
                      INDIVIDUAL TRAINING ACHIEVEMENT & COMPETENCY EVALUATION REPORT
                    </div>
                  </div>
                </div>

                {/* Section 1: Trainee Profile */}
                <div className="bg-[#F8FAFC] border border-slate-300 rounded-xl p-3 my-2.5">
                  <div className="text-xs font-bold text-[#0F2A4A] uppercase mb-1.5 flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#B45309]" />
                      1. ข้อมูลผู้เข้ารับการฝึกอบรม (Trainee Profile)
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      รหัสอ้างอิง: {certificateCode}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10.5px]">ชื่อ-นามสกุล:</span>
                      <strong className="text-xs sm:text-sm text-[#0F2A4A] font-bold block">{user.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10.5px]">รหัสพนักงาน:</span>
                      <strong className="text-xs sm:text-sm text-[#0F2A4A] font-mono font-bold block">{user.empId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10.5px]">ฝ่าย / แผนก:</span>
                      <strong className="text-xs sm:text-sm text-[#B45309] font-bold block">{formatDepartmentFull(user.department)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10.5px]">วันที่สำเร็จการอบรม:</span>
                      <strong className="text-xs sm:text-sm text-slate-700 font-bold block">{completionDate}</strong>
                    </div>
                  </div>
                </div>

                {/* Section 2: Course Information */}
                <div className="bg-[#F8FAFC] border border-slate-300 rounded-xl p-3 my-2.5">
                  <div className="text-xs font-bold text-[#0F2A4A] uppercase mb-1 flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#B45309]" />
                      2. ข้อมูลหลักสูตรที่ได้รับการฝึกอบรม (Course Specification)
                    </span>
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                      isPassed 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : hasPostTest
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {isPassed 
                        ? 'สถานะ: ผ่านเกณฑ์การประเมิน (Passed)'
                        : hasPostTest
                        ? 'สถานะ: ไม่ผ่านเกณฑ์ (Needs Retest)'
                        : 'สถานะ: อยู่ระหว่างการฝึกอบรม (In Progress)'}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <div className="text-xs sm:text-sm font-bold text-[#0F2A4A] font-sarabun">
                      ระบบฝึกอบรมและพัฒนาออนไลน์ ศูนย์ฝึกอบรมและพัฒนา TCT Academy
                    </div>
                    <div className="text-[11px] text-slate-700 font-sarabun">
                      หลักสูตร: <strong className="text-[#0F2A4A]">{officialCourseTitle}</strong> ({officialCourseMetadata.code})
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-slate-600 pt-0.5 text-[10.5px] font-sarabun">
                      <span>⏱️ ระยะเวลาหลักสูตร: <strong>~{courseModules.length * 10} นาที</strong></span>
                      <span>🎯 เกณฑ์การประเมิน: <strong>80% (8/10 ข้อ)</strong></span>
                      <span>📹 เงื่อนไขการสอบ: <strong>ดูวิดีโอบทเรียนครบ 100%</strong></span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Visual Analytics Dashboard / Scorecard */}
                <div className="bg-white border-2 border-slate-300 rounded-xl p-3 my-2.5 space-y-2">
                  <div className="text-xs font-bold text-[#0F2A4A] uppercase flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-[#B45309]" />
                      3. สรุปผลคะแนนและสมรรถนะการเรียนรู้ (Scorecard & Analytics)
                    </span>
                    <span className={`text-[11px] font-bold ${
                      isPassed 
                        ? 'text-emerald-700' 
                        : hasPostTest 
                        ? 'text-rose-600' 
                        : 'text-amber-600'
                    }`}>
                      ผลการเรียน: {
                        !hasPostTest
                          ? 'รอการทดสอบหลังเรียน'
                          : postScore! >= 9
                          ? 'ดีเยี่ยม (Excellent)'
                          : postScore! >= 8
                          ? 'ผ่านเกณฑ์มาตรฐาน (Passed)'
                          : 'ไม่ผ่านเกณฑ์ (Needs Retest)'
                      }
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    {/* Pre-test */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
                      <div className="text-[9.5px] text-slate-500 font-semibold">ก่อนเรียน (Pre-test)</div>
                      <div className="text-lg font-bold text-slate-700 font-mono mt-0.5">
                        {hasPreTest ? `${preScore}/10` : '-'}
                      </div>
                      <div className="text-[9.5px] text-slate-500 font-mono">
                        {hasPreTest ? `(${preScore! * 10}%)` : '(ยังไม่ทำ)'}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        {hasPreTest ? 'พื้นฐานความรู้เดิม' : 'รอการทำข้อสอบ'}
                      </div>
                    </div>

                    {/* Post-test */}
                    <div className={`border rounded-xl p-2 ${
                      hasPostTest
                        ? isPassed
                          ? 'bg-emerald-50 border-emerald-300'
                          : 'bg-rose-50 border-rose-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className={`text-[9.5px] font-bold ${
                        hasPostTest 
                          ? isPassed ? 'text-emerald-800' : 'text-rose-800'
                          : 'text-slate-500'
                      }`}>
                        หลังเรียน (Post-test)
                      </div>
                      <div className={`text-lg font-bold font-mono mt-0.5 ${
                        hasPostTest 
                          ? isPassed ? 'text-emerald-700' : 'text-rose-600'
                          : 'text-slate-400'
                      }`}>
                        {hasPostTest ? `${postScore}/10` : '-'}
                      </div>
                      <div className={`text-[9.5px] font-mono ${
                        hasPostTest 
                          ? isPassed ? 'text-emerald-600' : 'text-rose-500'
                          : 'text-slate-400'
                      }`}>
                        {hasPostTest ? `(${postScore! * 10}%)` : '(ยังไม่ทำ)'}
                      </div>
                      <div className={`text-[9px] font-semibold mt-0.5 ${
                        hasPostTest 
                          ? isPassed ? 'text-emerald-700' : 'text-rose-600'
                          : 'text-slate-400'
                      }`}>
                        {hasPostTest ? (isPassed ? 'ผ่านเกณฑ์สมบูรณ์' : 'ไม่ผ่านเกณฑ์') : 'รอการทดสอบ'}
                      </div>
                    </div>

                    {/* Growth & Gap Closure */}
                    <div className="bg-purple-50 border border-purple-300 rounded-xl p-2">
                      <div className="text-[9.5px] text-purple-800 font-bold">พัฒนา & ปิดช่องว่าง</div>
                      <div className="text-lg font-bold text-purple-700 font-mono mt-0.5">
                        {growthDisplay}
                      </div>
                      <div className="text-[9px] text-purple-600 font-medium truncate" title={metrics.badgeLabelEn}>
                        {metrics.badgeLabelEn}
                      </div>
                      <div className="text-[9px] text-purple-700 font-semibold mt-0.5">
                        {metrics.badgeLabelTh}
                      </div>
                    </div>

                    {/* Mini Game */}
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-2">
                      <div className="text-[9.5px] text-amber-800 font-bold">ทักษะเกม (Game Score)</div>
                      <div className="text-lg font-bold text-amber-700 font-mono mt-0.5">
                        {miniGameScore > 0 ? miniGameScore : '-'}
                      </div>
                      <div className="text-[9.5px] text-amber-600 font-mono">
                        {miniGameScore > 0 ? 'คะแนนทักษะ' : 'ยังไม่เล่น'}
                      </div>
                      <div className="text-[9px] text-amber-700 font-semibold mt-0.5">
                        {isPreventive ? 'RCM & CBM Simulation' : 'ค้นหาจุดเสี่ยง'}
                      </div>
                    </div>
                  </div>

                  {/* Performance Progress Bar */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-700 font-semibold">
                      <span>การเปรียบเทียบระดับความรู้ & การปิดช่องว่าง (Knowledge Mastery & Gap Closure)</span>
                      <span className="font-mono text-emerald-700 font-bold">
                        {hasPostTest ? `สัมฤทธิ์ผล: ${postScore! * 10}%` : 'อยู่ระหว่างการประเมิน'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-slate-400 h-full transition-all" 
                        style={{ width: `${(preScore || 0) * 10}%` }}
                        title="คะแนนเดิม"
                      />
                      <div 
                        className="bg-emerald-500 h-full transition-all" 
                        style={{ width: `${Math.max(0, ((postScore || 0) - (preScore || 0)) * 10)}%` }}
                        title="ความรู้ที่เพิ่มขึ้น"
                      />
                    </div>
                    <div className="flex flex-wrap justify-between text-[9.5px] text-slate-500 gap-1">
                      <span>⬛ ก่อนเรียน: {hasPreTest ? `${preScore! * 10}%` : '-'}</span>
                      <span>🟩 พัฒนาขึ้น: {growthDisplay} ({metrics.badgeLabelTh})</span>
                      <span>🏁 รวมหลังเรียน: {hasPostTest ? `${postScore! * 10}%` : '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Video Watch Time Record (Mandatory Requirement) */}
                <div className="bg-white border-2 border-indigo-200 rounded-xl p-3 my-2.5 space-y-2">
                  <div className="text-xs font-bold text-[#0F2A4A] uppercase flex items-center justify-between border-b border-indigo-100 pb-1">
                    <span className="flex items-center gap-1.5 text-indigo-900">
                      <Video className="w-4 h-4 text-indigo-600" />
                      4. บันทึกเวลาการรับชมวิดีโอบทเรียนตามเกณฑ์บังคับ (Video Watch Time Record)
                    </span>
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                      videoSummary.allCompleted
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {videoSummary.allCompleted ? '✓ ดูครบตามเกณฑ์บังคับ 100%' : 'กำลังรับชมวิดีโอ'}
                    </span>
                  </div>

                  {/* Total Video Watch Time Banner */}
                  <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-2 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10.5px] text-slate-600">เวลารับชมวิดีโอรวมทุกโมดูล (Total Video Watch Time):</div>
                        <div className="text-xs sm:text-sm font-extrabold text-indigo-950">
                          {videoSummary.totalWatchMinutes} นาที {videoSummary.totalWatchSeconds % 60 > 0 ? `${videoSummary.totalWatchSeconds % 60} วินาที` : ''} 
                          <span className="text-[9.5px] text-indigo-600 font-normal font-mono ml-1.5">
                            ({videoSummary.totalWatchSeconds} วินาทีสะสม)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-[10.5px]">
                      <span className="text-slate-500 block">เกณฑ์การปลดล็อกข้อสอบ:</span>
                      <span className="font-bold text-emerald-700">ดูวิดีโอจบครบ 100%</span>
                    </div>
                  </div>

                  {/* Per-Module Video Watch Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
                    {courseModules.slice(0, 3).map((m) => {
                      const modStat = videoSummary.modules[m.id];
                      const isDone = modStat?.isCompleted || user.completedModules?.includes(m.id);
                      const minutes = modStat?.watchMinutes || (isDone ? Math.floor((m.videoDurationSec || 240) / 60) : 0);
                      const seconds = modStat?.watchSeconds || (isDone ? (m.videoDurationSec || 240) : 0);

                      return (
                        <div key={m.id} className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[10.5px] font-bold text-[#0F2A4A] mb-0.5">
                              <span>โมดูลที่ {m.id}</span>
                              <span className={`text-[8.5px] px-1 py-0.2 rounded font-bold ${
                                isDone 
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {isDone ? '100%' : 'กำลังดู'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-600 line-clamp-1" title={m.title}>
                              {m.title}
                            </div>
                          </div>
                          <div className="pt-1 border-t border-slate-200/80 mt-1 flex items-center justify-between text-[9.5px]">
                            <span className="text-slate-500 font-mono flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-indigo-500" />
                              เวลา:
                            </span>
                            <strong className="text-indigo-900 font-mono">
                              {minutes}m {seconds % 60 > 0 ? `${seconds % 60}s` : ''}
                            </strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Page 1 Bottom Reference & Footnote */}
              <div className="pt-2 border-t-2 border-slate-300 mt-2">
                <div className="bg-blue-50/70 border border-blue-200 rounded p-1.5 text-center text-[10.5px] text-blue-950 font-bold mb-1">
                  * โปรดดูรายละเอียดผลสัมฤทธิ์รายวิชา แผนปฏิบัติการ OJT และลายมือชื่อรับรองผลอนุมัติ ที่หน้า 2 (ด้านหลัง)
                </div>
                <div className="text-[10px] text-slate-500 font-sarabun flex justify-between items-center">
                  <span>ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
                  <span className="font-bold text-slate-700">Ref: {certificateCode} • หน้า 1 จาก 2 (ด้านหน้า)</span>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGE 2: ด้านหลัง (BACK SHEET) - รายละเอียดวิชา แผนปฏิบัติ & ลายมือชื่อ */}
          {/* ========================================================= */}
          {(activePage === 'all' || activePage === 'page2') && (
            <div className="w-full flex flex-col items-center">
              {/* On-screen A4 Sheet Indicator */}
              <div className="no-print mb-2 flex items-center justify-between w-full max-w-[794px] px-3.5 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                <span className="flex items-center gap-2 text-blue-900">
                  <FileText className="w-4 h-4 text-[#005A9C]" />
                  <span>แบบรายงาน A4 แผ่นที่ 2 (ด้านหลัง: เนื้อหาหลักสูตร OJT & ลายมือชื่ออนุมัติ)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  ขนาด A4 {reportFormat === 'landscape' ? '297 × 210 mm' : '210 × 297 mm'} (1:1)
                </span>
              </div>

              <div
                id="training-report-page-2"
                style={{ fontFamily: "'Sarabun', 'TH Sarabun New', 'Prompt', sans-serif" }}
                className={`w-full ${
                  reportFormat === 'landscape'
                    ? 'max-w-[1122px] min-h-[794px]'
                    : reportFormat === '16:9'
                    ? 'max-w-[1050px]'
                    : reportFormat === '4:3'
                    ? 'max-w-[920px]'
                    : 'max-w-[794px] min-h-[1120px] max-h-[1122px] overflow-hidden'
                } bg-white text-slate-800 rounded-2xl p-5 sm:p-7 border-2 border-slate-300 shadow-2xl relative font-sarabun flex flex-col justify-between transition-all training-report-page ${reportFormat === 'landscape' ? 'a4-page-landscape' : 'a4-page-portrait'}`}
              >
              <div>
                {/* Page 2 Top Header */}
                <div className="pb-2.5 border-b-2 border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <TCTLogo size="sm" />
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-[#0F2A4A]">
                        ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development & Training Center
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-600 font-semibold">
                        บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • TEIJIN CORD (THAILAND) CO., LTD.
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                      หน้า 2/2: ด้านหลัง
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Ref: {certificateCode}
                    </div>
                  </div>
                </div>

                {/* Trainee Summary Banner for Document Integrity */}
                <div className="my-2.5 bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span>ผู้รับการอบรม: <strong className="text-[#0F2A4A]">{user.fullName}</strong></span>
                    <span>รหัส: <strong className="font-mono text-[#0F2A4A]">{user.empId}</strong></span>
                    <span>แผนก: <strong className="text-[#B45309]">{formatDepartmentFull(user.department)}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    หลักสูตร: <strong className="text-blue-950">{officialCourseMetadata.code}</strong>
                  </div>
                </div>

                {/* Section 5: Course Modules Breakdown */}
                <div className="bg-[#F8FAFC] border border-slate-300 rounded-xl p-3 my-2.5 space-y-2">
                  <div className="text-xs font-bold text-[#0F2A4A] uppercase flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#B45309]" />
                      5. รายละเอียดผลสัมฤทธิ์รายหมวดวิชา ({courseModules.length} Micro-Training Modules Breakdown)
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 font-mono">
                      ผ่านแล้ว {user.completedModules?.length || 0}/{courseModules.length} บท
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {courseModules.map((m) => {
                      const isModDone = user.completedModules?.includes(m.id);
                      return (
                        <div key={m.id} className="bg-white border border-slate-200 rounded-lg p-2 flex items-start gap-2">
                          <div className={`w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 ${
                            isModDone ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}>
                            {m.id}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="font-bold text-[#0F2A4A] text-[11px] flex items-center justify-between">
                              <span>{m.title}</span>
                              <span className={`text-[9px] px-1 py-0.2 rounded border font-semibold ${
                                isModDone 
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                  : 'text-slate-500 bg-slate-100 border-slate-200'
                              }`}>
                                {isModDone ? 'ผ่านแล้ว 100%' : 'ยังไม่สำเร็จ'}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-slate-600 leading-snug">{m.description || m.thaiTitle || ''}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 6: Practical Action Plan */}
                <div className="bg-[#F8FAFC] border border-slate-300 rounded-xl p-3 my-2.5 space-y-1.5 text-xs">
                  <div className="font-bold text-[#0F2A4A] uppercase flex items-center gap-1.5 border-b border-slate-200 pb-1">
                    <Shield className="w-3.5 h-3.5 text-[#B45309]" />
                    6. ข้อเสนอแนะและแผนการนำไปปฏิบัติจริงในสถานที่ปฏิบัติงาน (Practical Action Plan)
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px] leading-relaxed">
                    {isPreventive ? (
                      <>
                        <li>นำเกณฑ์การสั่นสะเทือน <strong>Vibration Thresholds (ISO 10816)</strong> ไปตรวจวัดและเฝ้าระวังเครื่องจักรหมุนตามสภาพจริง (CBM)</li>
                        <li>ติดตามจุดเริ่มเสื่อมสภาพบนเส้นโค้ง <strong>P-F Curve</strong> โดยใช้เทคโนโลยี Ultrasound และ Thermography เพื่อป้องกัน Unplanned Breakdown</li>
                        <li>จัดทำ <strong>Criticality & FMEA Matrix</strong> ของเครื่องจักรในสายการผลิต เพื่อกำหนดกลยุทธ์บำรุงรักษาแบบ RCM ได้อย่างคุ้มค่าสูงสุด</li>
                      </>
                    ) : (
                      <>
                        <li>นำแบบฟอร์ม <strong>Risk Register & Checklist</strong> ไปใช้ตรวจสอบจุดเสี่ยงประจำวันในพื้นที่รับผิดชอบ</li>
                        <li>ส่งเสริมการรายงานเหตุการณ์เกือบเกิดอุบัติเหตุ (<strong>Near Miss</strong>) เพื่อตัดวงจรอุบัติเหตุร้ายแรง</li>
                        <li>ปฏิบัติการหยั่งรู้ระวังอันตราย (<strong>KYT</strong>) ก่อนเริ่มงานและทบทวนข้อบกพร่องตามหลัก <strong>5 Whys</strong></li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Section 7: Official Endorsement Block */}
              <div>
                <div className="pt-2 border-t-2 border-slate-300 my-2">
                  <div className="text-[10.5px] font-bold text-[#0F2A4A] uppercase mb-2 text-center">
                    การรับรองผลสัมฤทธิ์และอนุมัติการฝึกอบรม (Official Certification & Endorsement)
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-3 text-center text-xs font-sarabun">
                    {/* Trainee */}
                    <div className="space-y-0.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[9.5px] font-semibold">1. ผู้เข้ารับการอบรม</div>
                      <div className="font-bold text-[#0F2A4A] text-[10.5px] mt-1 truncate">({user.fullName})</div>
                      <div className="text-[9px] text-[#005A9C] font-mono font-bold">ID: {user.empId}</div>
                      <div className="text-[8.5px] text-slate-500">ผู้เข้ารับการฝึกอบรมครบถ้วน</div>
                    </div>

                    {/* Signatory 1: Center Head & Personnel Head */}
                    <div className="space-y-0.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[9.5px] font-semibold">2. หัวหน้าศูนย์ & หน.บุคคล</div>
                      <div className="font-bold text-[#0F2A4A] text-[10.5px] mt-1">( นายณฐวัตร พงษ์สาริกิจ )</div>
                      <div className="text-[9.5px] font-bold text-[#B45309]">หัวหน้าศูนย์ TCT Academy</div>
                      <div className="text-[8.5px] text-slate-500">หัวหน้าแผนกบุคคลและธุรการ Personnel</div>
                    </div>

                    {/* Signatory 2: Center Manager */}
                    <div className="space-y-0.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[9.5px] font-semibold">3. ผู้จัดการศูนย์</div>
                      <div className="font-bold text-[#0F2A4A] text-[10.5px] mt-1">( นายกิตติศักดิ์ สร้อยจิตต์ )</div>
                      <div className="text-[9.5px] font-bold text-[#B45309]">ผู้จัดการศูนย์ TCT Academy</div>
                      <div className="text-[8.5px] text-slate-500">ผู้จัดการฝ่ายบุคคลและธุรการ</div>
                    </div>

                    {/* Signatory 3: General Manager & Factory Manager / Advisor */}
                    <div className="space-y-0.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[9.5px] font-semibold">4. ประธานที่ปรึกษาศูนย์</div>
                      <div className="font-bold text-[#0F2A4A] text-[10.5px] mt-1">( นายนพดล บำรุงเกียรติ )</div>
                      <div className="text-[9.5px] font-bold text-[#0F2A4A]">ผู้จัดการทั่วไปและผู้จัดการโรงงาน</div>
                      <div className="text-[8.5px] text-slate-500 font-medium">ประธานที่ปรึกษาศูนย์ TCT Academy</div>
                    </div>
                  </div>
                </div>

                {/* Page 2 Footer verification */}
                <div className="text-center pt-2 text-[10px] text-slate-400 font-sarabun border-t border-slate-200 flex justify-between items-center">
                  <span>เอกสารรายงานผลการฝึกอบรม (ด้านหลัง) • ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
                  <span className="font-bold text-slate-600">Ref: {certificateCode} • หน้า 2 จาก 2 (ด้านหลัง)</span>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

