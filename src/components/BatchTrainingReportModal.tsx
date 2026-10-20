import React, { useRef, useState } from 'react';
import { TraineeRecord } from '../types';
import { calculateLearningMetrics } from '../utils/scoreMetrics';
import { downloadElementAsPdf, downloadMultiPagePdf, printElementViaStandaloneWindow } from '../utils/pdfExport';
import { 
  Printer, 
  Download, 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  Award, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  Building, 
  Calendar, 
  FileText,
  Check,
  FileDown
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

interface BatchTrainingReportModalProps {
  trainees: TraineeRecord[];
  onClose: () => void;
}

export const BatchTrainingReportModal: React.FC<BatchTrainingReportModalProps> = ({
  trainees,
  onClose
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [exportNotice, setExportNotice] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  
  // Page View Scope ('all', 'page1', 'page2') for Front/Back A4 separation
  const [activePage, setActivePage] = useState<'all' | 'page1' | 'page2'>('all');
  const PAGE_SIZE = 8;
  const isMultiPage = trainees.length > PAGE_SIZE;
  const page1Trainees = trainees.slice(0, PAGE_SIZE);
  const page2Trainees = trainees.slice(PAGE_SIZE);

  const handlePrint = () => {
    playCyberClick();
    if (reportRef.current) {
      const title = `TCT_Batch_Training_Report_${new Date().toISOString().split('T')[0]}`;
      printElementViaStandaloneWindow(reportRef.current, title, 'portrait');
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
      const filename = `TCT_E-Training_Batch_Report_${new Date().toISOString().split('T')[0]}.pdf`;

      let success = false;
      if (isMultiPage && reportRef.current) {
        const pages = Array.from(reportRef.current.querySelectorAll('.batch-report-page')) as HTMLElement[];
        if (pages.length > 0) {
          success = await downloadMultiPagePdf(pages, {
            filename,
            orientation: 'portrait',
            format: 'a4',
            scale: 2.5
          });
        } else {
          success = await downloadElementAsPdf(reportRef.current, {
            filename,
            orientation: 'portrait',
            format: 'a4',
            scale: 2.5
          });
        }
      } else {
        success = await downloadElementAsPdf(reportRef.current, {
          filename,
          orientation: 'portrait',
          format: 'a4',
          scale: 2.5
        });
      }

      if (success) {
        playSuccessChime();
        setDownloadMessage('บันทึกและดาวน์โหลดรายงานรวม PDF (A4 แนวตั้ง) สำเร็จ!');
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }
    } catch (err) {
      console.error('PDF batch export error:', err);
      handlePrint();
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Export Batch Trainees to Excel/CSV
  const handleExportExcel = () => {
    playCyberClick();
    const headers = [
      'รหัสพนักงาน', 
      'ชื่อ-นามสกุล', 
      'ฝ่าย/แผนก', 
      'สถานะการอบรม', 
      'คะแนนก่อนเรียน (10)', 
      'คะแนนหลังเรียน (10)', 
      'คะแนนรวม (20)',
      'พัฒนา & ปิดช่องว่างความรู้', 
      'คะแนนมินิเกม', 
      'ความพึงพอใจ (5 ดาว)', 
      'รหัสใบประกาศนียบัตร', 
      'วันที่สำเร็จ/ลงทะเบียน'
    ];
    
    const rows = trainees.map(t => {
      const m = t.postTestScore !== null && t.preTestScore !== null ? calculateLearningMetrics(t.preTestScore, t.postTestScore) : null;
      const total20Text = t.preTestScore !== null && t.postTestScore !== null 
        ? `${t.preTestScore + t.postTestScore}/20` 
        : t.postTestScore !== null 
          ? `${Math.round(t.postTestScore * 2)}/20` 
          : '-';

      return [
        t.empId,
        `"${t.fullName}"`,
        `"${t.department}"`,
        t.status === 'passed' ? 'ผ่านเกณฑ์ (Passed)' : t.status === 'in_progress' ? 'กำลังเรียน' : 'ยังไม่เริ่ม',
        t.preTestScore !== null ? `${t.preTestScore}/10` : '-',
        t.postTestScore !== null ? `${t.postTestScore}/10` : '-',
        total20Text,
        m ? `"${m.growthPercentage === 100 ? '100%' : `+${m.scoreDelta}%`} (${m.badgeLabelTh})"` : '-',
        t.miniGameScore || 0,
        t.satisfactionScore || '-',
        t.certificateId || '-',
        t.completedAt || t.enrolledAt || '-'
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TCT_E-Training_Batch_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    playSuccessChime();
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 4500);
  };

  // Metrics calculation
  const totalCount = trainees.length;
  const passedCount = trainees.filter(t => t.status === 'passed').length;
  const inProgressCount = trainees.filter(t => t.status === 'in_progress').length;
  const notStartedCount = trainees.filter(t => t.status === 'not_started').length;
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  const traineesWithPre = trainees.filter(t => t.preTestScore !== null);
  const avgPre = traineesWithPre.length > 0 
    ? (traineesWithPre.reduce((acc, t) => acc + (t.preTestScore || 0), 0) / traineesWithPre.length).toFixed(1)
    : '0';

  const traineesWithPost = trainees.filter(t => t.postTestScore !== null);
  const avgPost = traineesWithPost.length > 0 
    ? (traineesWithPost.reduce((acc, t) => acc + (t.postTestScore || 0), 0) / traineesWithPost.length).toFixed(1)
    : '0';

  const traineesWithBoth = trainees.filter(t => t.preTestScore !== null && t.postTestScore !== null);
  const avgGrowth = (Number(avgPost) - Number(avgPre)) * 10;
  const avgGapClosed = traineesWithBoth.length > 0
    ? Math.round(
        traineesWithBoth.reduce((acc, t) => {
          const m = calculateLearningMetrics(t.preTestScore, t.postTestScore);
          return acc + m.gapClosureRate;
        }, 0) / traineesWithBoth.length
      )
    : 100;

  // Departmental breakdown
  const deptStats: Record<string, { total: number; passed: number }> = trainees.reduce((acc, t) => {
    const dept = t.department || 'ไม่ระบุ';
    if (!acc[dept]) {
      acc[dept] = { total: 0, passed: 0 };
    }
    acc[dept].total += 1;
    if (t.status === 'passed') acc[dept].passed += 1;
    return acc;
  }, {} as Record<string, { total: number; passed: number }>);

  const reportDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center animate-fadeIn font-sarabun">
      <div className="w-full max-w-5xl bg-[#0F172A] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Controls Bar (Hidden during Print) */}
        <div className="no-print p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                รายงานผลการฝึกอบรมรวมทุกคน (Official A4 Batch Training Report)
              </h2>
              <p className="text-xs text-slate-400">
                เอกสารทางการ A4 สรุปรายชื่อ คะแนน และผลประเมินของผู้เข้ารับการอบรมระบบ <strong>TCT E-Training</strong> ทั้งหมด
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {/* Multi-page Front/Back Switcher (shown when trainees > PAGE_SIZE) */}
            {isMultiPage && (
              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => { playCyberClick(); setActivePage('all'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activePage === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ทั้งหมด (2 หน้า)
                </button>
                <button
                  type="button"
                  onClick={() => { playCyberClick(); setActivePage('page1'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activePage === 'page1'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  หน้า 1 (ด้านหน้า)
                </button>
                <button
                  type="button"
                  onClick={() => { playCyberClick(); setActivePage('page2'); }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activePage === 'page2'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  หน้า 2 (ด้านหลัง)
                </button>
              </div>
            )}

            {/* Download PDF Button */}
            <button
              id="batch-modal-download-pdf-btn"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-500/30 cursor-pointer transition-all disabled:opacity-50 min-h-[38px]"
              title="บันทึกและดาวน์โหลดรายงานเป็นไฟล์ PDF ทันที"
            >
              {isPdfGenerating ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>{isPdfGenerating ? 'กำลังสร้าง PDF...' : 'บันทึกไฟล์ PDF'}</span>
            </button>

            {/* Export Excel / CSV Button */}
            <button
              id="batch-modal-export-excel-btn"
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all min-h-[38px]"
              title="ส่งออกรายชื่อและผลคะแนนทั้งหมดเป็นไฟล์ Excel/CSV (Export Excel)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>ส่งออก Excel / CSV</span>
            </button>

            {/* Print A4 PDF */}
            <button
              id="batch-modal-print-btn"
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 cursor-pointer transition-all min-h-[38px]"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ / บันทึก PDF</span>
            </button>

            <button
              id="batch-modal-close-btn"
              type="button"
              onClick={() => { playCyberClick(); onClose(); }}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="no-print p-3 bg-emerald-950 border-b border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadMessage}</span>
          </div>
        )}

        {exportNotice && (
          <div className="no-print p-3 bg-teal-950 border-b border-teal-500/50 text-teal-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-400 shrink-0" />
            <span><strong>ส่งออกสำเร็จ!</strong> สร้างไฟล์รายงาน Excel / CSV สำหรับผู้บริหารเรียบร้อยแล้ว</span>
          </div>
        )}

        {/* Dynamic @page print orientation for seamless full-page printing */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait !important;
              margin: 0 !important;
            }
          }
        `}</style>

        {/* Scrollable Printable A4 Area */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-950 flex justify-center">
          <div 
            id="batch-report-print-area"
            ref={reportRef}
            className="w-full flex flex-col items-center gap-8 max-w-full"
          >
            {/* Single-Page Mode (when trainees <= PAGE_SIZE) */}
            {!isMultiPage && (
              <div 
                style={{
                  fontFamily: "'TH Sarabun New', 'Sarabun', 'Prompt', sans-serif"
                }}
                className="w-full max-w-[794px] min-h-[1120px] max-h-[1122px] overflow-hidden bg-white text-slate-900 rounded-xl p-5 sm:p-7 shadow-2xl border border-slate-300 font-sarabun flex flex-col justify-between a4-page-portrait batch-report-page"
              >
                <div>
                  {/* 1. Prominent Institution Header */}
                  <div className="text-center space-y-1 pb-2.5 border-b-2 border-slate-800">
                    <div className="space-y-0.5">
                      <div className="text-sm sm:text-base font-bold text-[#0F2A4A]">
                        ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development &amp; Training Center
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide">
                        บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • TEIJIN CORD (THAILAND) CO., LTD.
                      </div>
                    </div>
                    
                    <div className="pt-1.5">
                      <h1 className="text-lg sm:text-xl font-bold text-black tracking-tight leading-snug">
                        แบบรายงานผลการฝึกอบรมรวมทุกคน (Batch Training Report)
                      </h1>
                      <div className="text-xs sm:text-sm font-bold text-blue-950 mt-0.5">
                        หลักสูตรการบริหารความเสี่ยงด้วยคุณภาพและความปลอดภัย (Quality &amp; Safety Risk Management - QSRM)
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium mt-1 flex items-center justify-center gap-3 flex-wrap">
                        <span>📅 วันที่ออกรายงาน: <strong>{reportDate}</strong></span>
                        <span>•</span>
                        <span>รหัสหลักสูตร: <strong>TCT-QSRM-2026</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Executive Summary Metrics */}
                  <div className="bg-[#F8FAFC] border border-slate-300 rounded-lg p-2.5 my-2.5">
                    <div className="text-[11.5px] font-bold text-[#0F2A4A] uppercase mb-1.5 flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-blue-900" />
                        1. สรุปผลสัมฤทธิ์ภาพรวมการฝึกอบรม (Batch Training Performance Overview)
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800">
                        อัตราผ่านเกณฑ์: {passRate}% (เป้าหมาย 100%)
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                      <div className="bg-white border border-slate-200 rounded p-1.5">
                        <div className="text-slate-500 text-[10px]">ผู้เข้าอบรมทั้งหมด</div>
                        <div className="text-base font-bold text-[#0F2A4A] font-mono mt-0.5">{totalCount} คน</div>
                        <div className="text-[9.5px] text-slate-500">ลงทะเบียนครบ</div>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-300 rounded p-1.5">
                        <div className="text-emerald-800 font-bold text-[10px]">ผ่านเกณฑ์ (Passed)</div>
                        <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">{passedCount} คน</div>
                        <div className="text-[9.5px] text-emerald-700 font-semibold">{passRate}% สำเร็จ</div>
                      </div>

                      <div className="bg-amber-50 border border-amber-300 rounded p-1.5">
                        <div className="text-amber-800 font-medium text-[10px]">กำลังศึกษา</div>
                        <div className="text-base font-bold text-amber-700 font-mono mt-0.5">{inProgressCount + notStartedCount} คน</div>
                        <div className="text-[9.5px] text-amber-600">ติดตามผล</div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded p-1.5">
                        <div className="text-slate-500 text-[10px]">เฉลี่ย ก่อน/หลังเรียน</div>
                        <div className="text-base font-bold text-[#0F2A4A] font-mono mt-0.5">{avgPre} ➔ {avgPost}</div>
                        <div className="text-[9.5px] text-slate-500">เต็ม 10 คะแนน</div>
                      </div>

                      <div className="bg-purple-50 border border-purple-300 rounded p-1.5">
                        <div className="text-purple-800 font-bold text-[10px]">พัฒนาการความรู้</div>
                        <div className="text-base font-bold text-purple-700 font-mono mt-0.5">+{avgGrowth.toFixed(0)}%</div>
                        <div className="text-[9.5px] text-purple-600 font-semibold">Knowledge Gain</div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Department Breakdown */}
                  <div className="bg-[#F8FAFC] border border-slate-300 rounded-lg p-2.5 my-2.5">
                    <div className="text-[11.5px] font-bold text-[#0F2A4A] uppercase flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-blue-900" />
                        2. สรุปความก้าวหน้าจำแนกตามฝ่าย/แผนก (Departmental Breakdown)
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
                      {Object.entries(deptStats).map(([dept, stat]) => {
                        const deptPassRate = stat.total > 0 ? Math.round((stat.passed / stat.total) * 100) : 0;
                        return (
                          <div key={dept} className="bg-white border border-slate-200 rounded p-1.5 space-y-0.5">
                            <div className="font-bold text-[#0F2A4A] flex justify-between text-[10.5px]">
                              <span className="truncate">{dept}</span>
                              <span className="text-emerald-700 font-mono">{deptPassRate}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full" 
                                style={{ width: `${deptPassRate}%` }} 
                              />
                            </div>
                            <div className="text-[9px] text-slate-500 flex justify-between">
                              <span>ผ่าน {stat.passed}</span>
                              <span>รวม {stat.total}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Complete Trainee Roster Table */}
                  <div className="space-y-1.5 my-2.5">
                    <div className="text-[11.5px] font-bold text-[#0F2A4A] uppercase flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-900" />
                        3. บัญชีรายชื่อและผลคะแนนรายบุคคลของผู้เข้ารับการอบรมทั้งหมด (Complete Trainee Roster)
                      </span>
                      <span className="text-[10.5px] font-mono text-slate-500">
                        ทั้งหมด {trainees.length} รายชื่อ
                      </span>
                    </div>

                    <div className="border border-slate-300 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#0F2A4A] text-white font-bold text-[10px]">
                            <th className="py-1 px-1.5 text-center w-7">ลำดับ</th>
                            <th className="py-1 px-2">รหัสพนักงาน</th>
                            <th className="py-1 px-2">ชื่อ-นามสกุล</th>
                            <th className="py-1 px-1.5 text-center">แผนก</th>
                            <th className="py-1 px-1 text-center">Pre-Test (10)</th>
                            <th className="py-1 px-1 text-center">Post-Test (10)</th>
                            <th className="py-1 px-1 text-center bg-[#153e6c]">รวม (20)</th>
                            <th className="py-1 px-1 text-center">มินิเกม</th>
                            <th className="py-1 px-1.5 text-center">สถานะ</th>
                            <th className="py-1 px-2 text-center">รหัสใบรับรอง</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700 text-[10px]">
                          {trainees.map((t, idx) => {
                            const total20 = t.preTestScore !== null && t.postTestScore !== null
                              ? `${t.preTestScore + t.postTestScore}/20`
                              : t.postTestScore !== null
                                ? `${Math.round(t.postTestScore * 2)}/20`
                                : '-';
                            return (
                              <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                                <td className="py-1 px-1.5 text-center font-mono text-slate-500">{idx + 1}</td>
                                <td className="py-1 px-2 font-mono font-bold text-[#0F2A4A]">{t.empId}</td>
                                <td className="py-1 px-2 font-medium text-slate-900">{t.fullName}</td>
                                <td className="py-1 px-1.5 text-center">
                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[9px] border border-slate-300">
                                    {t.department}
                                  </span>
                                </td>
                                <td className="py-1 px-1 text-center font-mono text-purple-900">
                                  {t.preTestScore !== null ? `${t.preTestScore}/10` : '-'}
                                </td>
                                <td className="py-1 px-1 text-center font-mono font-bold">
                                  {t.postTestScore !== null ? (
                                    <span className={t.postTestScore >= 8 ? 'text-emerald-700' : 'text-rose-600'}>
                                      {t.postTestScore}/10
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="py-1 px-1 text-center font-mono font-bold text-blue-900 bg-blue-50/40">
                                  {total20}
                                </td>
                                <td className="py-1 px-1 text-center font-mono text-amber-700">
                                  {t.miniGameScore || '-'}
                                </td>
                                <td className="py-1 px-1.5 text-center">
                                  {t.status === 'passed' ? (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-300">
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      ผ่านเกณฑ์
                                    </span>
                                  ) : t.status === 'in_progress' ? (
                                    <span className="inline-block text-[9px] font-semibold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded-full border border-blue-300">
                                      กำลังเรียน
                                    </span>
                                  ) : (
                                    <span className="inline-block text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full border border-slate-300">
                                      ยังไม่เริ่ม
                                    </span>
                                  )}
                                </td>
                                <td className="py-1 px-2 text-center font-mono text-[9px] text-slate-500">
                                  {t.certificateId || '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Bottom Signatures & Footer Area */}
                <div>
                  {/* 5. Official Signatures Block */}
                  <div className="pt-2 border-t-2 border-slate-300 mt-2">
                    <div className="grid grid-cols-2 gap-8 text-center text-xs">
                      {/* Signatory 1: Personnel & Admin Manager */}
                      <div className="space-y-1">
                        <div className="text-slate-600 text-[10.5px] font-semibold">ผู้รวบรวมและจัดทำรายงาน</div>
                        <div className="h-10 border-b border-slate-400 mx-auto w-48 sm:w-56"></div>
                        <div className="font-bold text-[#0F2A4A] text-[11px] mt-1">( นายณฐวัตร พงษ์สาริกิจ )</div>
                        <div className="text-[10px] font-bold text-slate-700">ผู้จัดการฝ่ายบุคคลและธุรการ</div>
                        <div className="text-[9px] text-slate-500 font-medium">ฝ่ายบุคคลและธุรการ (Personnel) • TCT Academy</div>
                      </div>

                      {/* Signatory 2: General Manager & Factory Manager */}
                      <div className="space-y-1">
                        <div className="text-slate-600 text-[10.5px] font-semibold">ผู้รับทราบและอนุมัติผลการฝึกอบรม</div>
                        <div className="h-10 border-b border-slate-400 mx-auto w-48 sm:w-56"></div>
                        <div className="font-bold text-[#0F2A4A] text-[11px] mt-1">( นายนพดล บำรุงเกียรติ )</div>
                        <div className="text-[10px] font-bold text-[#0F2A4A]">ผู้จัดการทั่วไปและผู้จัดการโรงงาน</div>
                        <div className="text-[9px] text-slate-500 font-medium">บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-2 text-[10px] text-slate-500 font-mono border-t border-slate-200 flex justify-between items-center mt-2">
                    <span>ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
                    <span>พิมพ์เมื่อ: {reportDate}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Multi-Page Mode (when trainees > PAGE_SIZE) */}
            {isMultiPage && (
              <>
                {/* Page 1 (Front Page: ด้านหน้า) */}
                {(activePage === 'all' || activePage === 'page1') && (
                  <div 
                    style={{
                      fontFamily: "'TH Sarabun New', 'Sarabun', 'Prompt', sans-serif"
                    }}
                    className="w-full max-w-[794px] min-h-[1120px] max-h-[1122px] overflow-hidden bg-white text-slate-900 rounded-xl p-5 sm:p-7 shadow-2xl border border-slate-300 font-sarabun flex flex-col justify-between a4-page-portrait batch-report-page"
                  >
                    <div>
                      {/* 1. Prominent Institution Header */}
                      <div className="text-center space-y-1 pb-2.5 border-b-2 border-slate-800">
                        <div className="space-y-0.5">
                          <div className="text-sm sm:text-base font-bold text-[#0F2A4A]">
                            ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development &amp; Training Center
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide">
                            บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • TEIJIN CORD (THAILAND) CO., LTD.
                          </div>
                        </div>
                        
                        <div className="pt-1.5">
                          <h1 className="text-lg sm:text-xl font-bold text-black tracking-tight leading-snug">
                            แบบรายงานผลการฝึกอบรมรวมทุกคน (Batch Training Report)
                          </h1>
                          <div className="text-xs sm:text-sm font-bold text-blue-950 mt-0.5">
                            หลักสูตรการบริหารความเสี่ยงด้วยคุณภาพและความปลอดภัย (Quality &amp; Safety Risk Management - QSRM)
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium mt-1 flex items-center justify-center gap-3 flex-wrap">
                            <span>📅 วันที่ออกรายงาน: <strong>{reportDate}</strong></span>
                            <span>•</span>
                            <span>รหัสหลักสูตร: <strong>TCT-QSRM-2026</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Executive Summary Metrics */}
                      <div className="bg-[#F8FAFC] border border-slate-300 rounded-lg p-2.5 my-2.5">
                        <div className="text-[11.5px] font-bold text-[#0F2A4A] uppercase mb-1.5 flex items-center justify-between border-b border-slate-200 pb-1">
                          <span className="flex items-center gap-1.5">
                            <BarChart3 className="w-3.5 h-3.5 text-blue-900" />
                            1. สรุปผลสัมฤทธิ์ภาพรวมการฝึกอบรม (Batch Training Performance Overview)
                          </span>
                          <span className="text-[11px] font-bold text-emerald-800">
                            อัตราผ่านเกณฑ์: {passRate}% (เป้าหมาย 100%)
                          </span>
                        </div>

                        <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                          <div className="bg-white border border-slate-200 rounded p-1.5">
                            <div className="text-slate-500 text-[10px]">ผู้เข้าอบรมทั้งหมด</div>
                            <div className="text-base font-bold text-[#0F2A4A] font-mono mt-0.5">{totalCount} คน</div>
                            <div className="text-[9.5px] text-slate-500">ลงทะเบียนครบ</div>
                          </div>

                          <div className="bg-emerald-50 border border-emerald-300 rounded p-1.5">
                            <div className="text-emerald-800 font-bold text-[10px]">ผ่านเกณฑ์ (Passed)</div>
                            <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">{passedCount} คน</div>
                            <div className="text-[9.5px] text-emerald-700 font-semibold">{passRate}% สำเร็จ</div>
                          </div>

                          <div className="bg-amber-50 border border-amber-300 rounded p-1.5">
                            <div className="text-amber-800 font-medium text-[10px]">กำลังศึกษา</div>
                            <div className="text-base font-bold text-amber-700 font-mono mt-0.5">{inProgressCount + notStartedCount} คน</div>
                            <div className="text-[9.5px] text-amber-600">ติดตามผล</div>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded p-1.5">
                            <div className="text-slate-500 text-[10px]">เฉลี่ย ก่อน/หลังเรียน</div>
                            <div className="text-base font-bold text-[#0F2A4A] font-mono mt-0.5">{avgPre} ➔ {avgPost}</div>
                            <div className="text-[9.5px] text-slate-500">เต็ม 10 คะแนน</div>
                          </div>

                          <div className="bg-purple-50 border border-purple-300 rounded p-1.5">
                            <div className="text-purple-800 font-bold text-[10px]">พัฒนาการความรู้</div>
                            <div className="text-base font-bold text-purple-700 font-mono mt-0.5">+{avgGrowth.toFixed(0)}%</div>
                            <div className="text-[9.5px] text-purple-600 font-semibold">Knowledge Gain</div>
                          </div>
                        </div>
                      </div>

                      {/* 3. Department Breakdown */}
                      <div className="bg-[#F8FAFC] border border-slate-300 rounded-lg p-2.5 my-2.5">
                        <div className="text-[11.5px] font-bold text-[#0F2A4A] uppercase flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                          <span className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-blue-900" />
                            2. สรุปความก้าวหน้าจำแนกตามฝ่าย/แผนก (Departmental Breakdown)
                          </span>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
                          {Object.entries(deptStats).map(([dept, stat]) => {
                            const deptPassRate = stat.total > 0 ? Math.round((stat.passed / stat.total) * 100) : 0;
                            return (
                              <div key={dept} className="bg-white border border-slate-200 rounded p-1.5 space-y-0.5">
                                <div className="font-bold text-[#0F2A4A] flex justify-between text-[10.5px]">
                                  <span className="truncate">{dept}</span>
                                  <span className="text-emerald-700 font-mono">{deptPassRate}%</span>
                                </div>
                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500 rounded-full" 
                                    style={{ width: `${deptPassRate}%` }} 
                                  />
                                </div>
                                <div className="text-[9px] text-slate-500 flex justify-between">
                                  <span>ผ่าน {stat.passed}</span>
                                  <span>รวม {stat.total}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 4. Trainee Roster Table Page 1 (Rows 1 to PAGE_SIZE) */}
                      <div className="space-y-1.5 my-2.5">
                        <div className="text-[11.5px] font-bold text-[#0F2A4A] uppercase flex items-center justify-between border-b border-slate-200 pb-1">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-900" />
                            3. บัญชีรายชื่อและผลคะแนนรายบุคคลของผู้เข้ารับการอบรม (หน้า 1)
                          </span>
                          <span className="text-[10.5px] font-mono text-slate-500">
                            ลำดับที่ 1 - {page1Trainees.length} จาก {trainees.length} คน
                          </span>
                        </div>

                        <div className="border border-slate-300 rounded-lg overflow-hidden">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-[#0F2A4A] text-white font-bold text-[10px]">
                                <th className="py-1 px-1.5 text-center w-7">ลำดับ</th>
                                <th className="py-1 px-2">รหัสพนักงาน</th>
                                <th className="py-1 px-2">ชื่อ-นามสกุล</th>
                                <th className="py-1 px-1.5 text-center">แผนก</th>
                                <th className="py-1 px-1 text-center">Pre-Test (10)</th>
                                <th className="py-1 px-1 text-center">Post-Test (10)</th>
                                <th className="py-1 px-1 text-center bg-[#153e6c]">รวม (20)</th>
                                <th className="py-1 px-1 text-center">มินิเกม</th>
                                <th className="py-1 px-1.5 text-center">สถานะ</th>
                                <th className="py-1 px-2 text-center">รหัสใบรับรอง</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-slate-700 text-[10px]">
                              {page1Trainees.map((t, idx) => {
                                const total20 = t.preTestScore !== null && t.postTestScore !== null
                                  ? `${t.preTestScore + t.postTestScore}/20`
                                  : t.postTestScore !== null
                                    ? `${Math.round(t.postTestScore * 2)}/20`
                                    : '-';
                                return (
                                  <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                                    <td className="py-1 px-1.5 text-center font-mono text-slate-500">{idx + 1}</td>
                                    <td className="py-1 px-2 font-mono font-bold text-[#0F2A4A]">{t.empId}</td>
                                    <td className="py-1 px-2 font-medium text-slate-900">{t.fullName}</td>
                                    <td className="py-1 px-1.5 text-center">
                                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[9px] border border-slate-300">
                                        {t.department}
                                      </span>
                                    </td>
                                    <td className="py-1 px-1 text-center font-mono text-purple-900">
                                      {t.preTestScore !== null ? `${t.preTestScore}/10` : '-'}
                                    </td>
                                    <td className="py-1 px-1 text-center font-mono font-bold">
                                      {t.postTestScore !== null ? (
                                        <span className={t.postTestScore >= 8 ? 'text-emerald-700' : 'text-rose-600'}>
                                          {t.postTestScore}/10
                                        </span>
                                      ) : '-'}
                                    </td>
                                    <td className="py-1 px-1 text-center font-mono font-bold text-blue-900 bg-blue-50/40">
                                      {total20}
                                    </td>
                                    <td className="py-1 px-1 text-center font-mono text-amber-700">
                                      {t.miniGameScore || '-'}
                                    </td>
                                    <td className="py-1 px-1.5 text-center">
                                      {t.status === 'passed' ? (
                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-300">
                                          <CheckCircle2 className="w-2.5 h-2.5" />
                                          ผ่านเกณฑ์
                                        </span>
                                      ) : t.status === 'in_progress' ? (
                                        <span className="inline-block text-[9px] font-semibold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded-full border border-blue-300">
                                          กำลังเรียน
                                        </span>
                                      ) : (
                                        <span className="inline-block text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full border border-slate-300">
                                          ยังไม่เริ่ม
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-1 px-2 text-center font-mono text-[9px] text-slate-500">
                                      {t.certificateId || '-'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Page 1 Bottom Overflow Notice & Page Indicator */}
                    <div className="pt-2 border-t-2 border-slate-300 flex items-center justify-between text-[11px] text-slate-700 mt-2">
                      <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                        <FileText className="w-4 h-4 text-blue-700" />
                        <span>* มีรายชื่อผู้เข้าอบรมลำดับที่ {PAGE_SIZE + 1} เป็นต้นไป และการลงนามรับรองผล จัดพิมพ์ต่อในหน้า 2 (ด้านหลัง)</span>
                      </div>
                      <div className="font-bold px-2.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800 font-mono">
                        หน้า 1 จาก 2 (ด้านหน้า)
                      </div>
                    </div>
                  </div>
                )}

                {/* Page 2 (Back Page: ด้านหลัง - Remaining Trainees + Sign-offs) */}
                {(activePage === 'all' || activePage === 'page2') && (
                  <div 
                    style={{
                      fontFamily: "'TH Sarabun New', 'Sarabun', 'Prompt', sans-serif"
                    }}
                    className="w-full max-w-[794px] min-h-[1120px] max-h-[1122px] overflow-hidden bg-white text-slate-900 rounded-xl p-5 sm:p-7 shadow-2xl border border-slate-300 font-sarabun flex flex-col justify-between a4-page-portrait batch-report-page"
                  >
                    <div>
                      {/* 1. Header (Continuation) */}
                      <div className="text-center space-y-1 pb-2.5 border-b-2 border-slate-800">
                        <div className="space-y-0.5">
                          <div className="text-sm sm:text-base font-bold text-[#0F2A4A]">
                            ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development &amp; Training Center
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide">
                            บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • TEIJIN CORD (THAILAND) CO., LTD.
                          </div>
                        </div>
                        
                        <div className="pt-1.5">
                          <h2 className="text-base sm:text-lg font-bold text-black tracking-tight leading-snug">
                            แบบรายงานผลการฝึกอบรมรวมทุกคน (ต่อจากหน้าแรก / ด้านหลัง)
                          </h2>
                          <div className="text-xs sm:text-sm font-bold text-blue-950 mt-0.5">
                            หลักสูตรการบริหารความเสี่ยงด้วยคุณภาพและความปลอดภัย (Quality &amp; Safety Risk Management - QSRM)
                          </div>
                        </div>
                      </div>

                      {/* 2. Trainee Table Page 2 (Rows PAGE_SIZE+1 to N) */}
                      <div className="space-y-1.5 my-4">
                        <div className="text-[11.5px] font-bold text-[#0F2A4A] uppercase flex items-center justify-between border-b border-slate-200 pb-1">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-900" />
                            3. บัญชีรายชื่อและผลคะแนนรายบุคคลของผู้เข้ารับการอบรม (หน้า 2 - ต่อเนื่อง)
                          </span>
                          <span className="text-[10.5px] font-mono text-slate-500">
                            ลำดับที่ {PAGE_SIZE + 1} - {trainees.length} จาก {trainees.length} คน
                          </span>
                        </div>

                        <div className="border border-slate-300 rounded-lg overflow-hidden">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-[#0F2A4A] text-white font-bold text-[10px]">
                                <th className="py-1 px-1.5 text-center w-7">ลำดับ</th>
                                <th className="py-1 px-2">รหัสพนักงาน</th>
                                <th className="py-1 px-2">ชื่อ-นามสกุล</th>
                                <th className="py-1 px-1.5 text-center">แผนก</th>
                                <th className="py-1 px-1 text-center">Pre-Test (10)</th>
                                <th className="py-1 px-1 text-center">Post-Test (10)</th>
                                <th className="py-1 px-1 text-center bg-[#153e6c]">รวม (20)</th>
                                <th className="py-1 px-1 text-center">มินิเกม</th>
                                <th className="py-1 px-1.5 text-center">สถานะ</th>
                                <th className="py-1 px-2 text-center">รหัสใบรับรอง</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-slate-700 text-[10px]">
                              {page2Trainees.map((t, idx) => {
                                const total20 = t.preTestScore !== null && t.postTestScore !== null
                                  ? `${t.preTestScore + t.postTestScore}/20`
                                  : t.postTestScore !== null
                                    ? `${Math.round(t.postTestScore * 2)}/20`
                                    : '-';
                                return (
                                  <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                                    <td className="py-1 px-1.5 text-center font-mono text-slate-500">{PAGE_SIZE + idx + 1}</td>
                                    <td className="py-1 px-2 font-mono font-bold text-[#0F2A4A]">{t.empId}</td>
                                    <td className="py-1 px-2 font-medium text-slate-900">{t.fullName}</td>
                                    <td className="py-1 px-1.5 text-center">
                                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[9px] border border-slate-300">
                                        {t.department}
                                      </span>
                                    </td>
                                    <td className="py-1 px-1 text-center font-mono text-purple-900">
                                      {t.preTestScore !== null ? `${t.preTestScore}/10` : '-'}
                                    </td>
                                    <td className="py-1 px-1 text-center font-mono font-bold">
                                      {t.postTestScore !== null ? (
                                        <span className={t.postTestScore >= 8 ? 'text-emerald-700' : 'text-rose-600'}>
                                          {t.postTestScore}/10
                                        </span>
                                      ) : '-'}
                                    </td>
                                    <td className="py-1 px-1 text-center font-mono font-bold text-blue-900 bg-blue-50/40">
                                      {total20}
                                    </td>
                                    <td className="py-1 px-1 text-center font-mono text-amber-700">
                                      {t.miniGameScore || '-'}
                                    </td>
                                    <td className="py-1 px-1.5 text-center">
                                      {t.status === 'passed' ? (
                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-300">
                                          <CheckCircle2 className="w-2.5 h-2.5" />
                                          ผ่านเกณฑ์
                                        </span>
                                      ) : t.status === 'in_progress' ? (
                                        <span className="inline-block text-[9px] font-semibold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded-full border border-blue-300">
                                          กำลังเรียน
                                        </span>
                                      ) : (
                                        <span className="inline-block text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full border border-slate-300">
                                          ยังไม่เริ่ม
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-1 px-2 text-center font-mono text-[9px] text-slate-500">
                                      {t.certificateId || '-'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Signatures & Footer Area for Page 2 */}
                    <div>
                      {/* Official Signatures Block */}
                      <div className="pt-3 border-t-2 border-slate-300 mt-2">
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-xs">
                          {/* Signatory 1: Personnel & Admin Section Head */}
                          <div className="space-y-1 p-2 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-slate-600 text-[10px] font-semibold">1. ผู้รวบรวมและจัดทำรายงาน</div>
                            <div className="font-bold text-[#0F2A4A] text-[11px] mt-1">( นายณฐวัตร พงษ์สาริกิจ )</div>
                            <div className="text-[9.5px] font-bold text-slate-700">หัวหน้าศูนย์ TCT Academy</div>
                            <div className="text-[8.5px] text-slate-500 font-medium">หัวหน้าแผนกบุคคลและธุรการ Personnel</div>
                          </div>

                          {/* Signatory 2: Personnel & Admin Manager */}
                          <div className="space-y-1 p-2 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-slate-600 text-[10px] font-semibold">2. ผู้ตรวจสอบและรับรอง</div>
                            <div className="font-bold text-[#0F2A4A] text-[11px] mt-1">( นายกิตติศักดิ์ สร้อยจิตต์ )</div>
                            <div className="text-[9.5px] font-bold text-slate-700">ผู้จัดการศูนย์ TCT Academy</div>
                            <div className="text-[8.5px] text-slate-500 font-medium">ผู้จัดการฝ่ายบุคคลและธุรการ</div>
                          </div>

                          {/* Signatory 3: General Manager & Factory Manager */}
                          <div className="space-y-1 p-2 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-slate-600 text-[10px] font-semibold">3. ผู้อนุมัติผลการฝึกอบรม</div>
                            <div className="font-bold text-[#0F2A4A] text-[11px] mt-1">( นายนพดล บำรุงเกียรติ )</div>
                            <div className="text-[9.5px] font-bold text-[#0F2A4A]">ผู้จัดการทั่วไปและผู้จัดการโรงงาน</div>
                            <div className="text-[8.5px] text-slate-500 font-medium">ประธานที่ปรึกษาศูนย์ TCT Academy</div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="text-center pt-2 text-[10px] text-slate-500 font-mono border-t border-slate-200 flex justify-between items-center mt-3">
                        <span>ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
                        <div className="flex items-center gap-3">
                          <span>พิมพ์เมื่อ: {reportDate}</span>
                          <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            หน้า 2 จาก 2 (ด้านหลัง)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
