import React, { useRef, useState } from 'react';
import { UserProfile, ViewState } from '../types';
import { toPng } from 'html-to-image';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Building2, 
  ShieldCheck, 
  PieChart, 
  BarChart3, 
  FileText, 
  Compass, 
  Award, 
  Check, 
  Sparkles,
  Presentation,
  FileSpreadsheet,
  Calendar,
  Lock,
  Users,
  Clock,
  Sliders,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

interface ExecutiveSummaryViewProps {
  currentUser: UserProfile | null;
  onNavigate: (view: ViewState) => void;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  // Interactive Training Economics & Attendance Parameters (อิงข้อมูลจริง ไม่ใช้ตัวเลขสมมติความเสียหาย)
  const [totalEmployees, setTotalEmployees] = useState(230); // ฐานข้อมูลพนักงานจริง 230 คน
  const [inhouseBatches, setInhouseBatches] = useState(6); // แบ่งรุ่นจัดตามกะ 6 รุ่น (รุ่นละ ~38-40 คน)
  const [speakerFeePerBatch, setSpeakerFeePerBatch] = useState(25000); // ค่าจ้างวิทยากรภายนอก 25,000 บาท/รุ่น
  const [refreshmentAndMaterial, setRefreshmentAndMaterial] = useState(250); // ค่าอาหารว่าง/เอกสาร 250 บาท/คน
  const [publicFeePerPerson, setPublicFeePerPerson] = useState(3500); // ค่าลงทะเบียน Public Training 3,500 บาท/คน
  const [showConfig, setShowConfig] = useState(false); // Toggle simulator settings

  // Calculations for Training Cost Comparison
  const totalSpeakerFee = inhouseBatches * speakerFeePerBatch;
  const totalRefreshmentAndMaterial = totalEmployees * refreshmentAndMaterial;
  const inhouseTotalCost = totalSpeakerFee + totalRefreshmentAndMaterial; // รวมกรณีจ้างวิทยากรจัด In-house
  const publicTotalCost = totalEmployees * publicFeePerPerson; // รวมกรณีส่ง Public Training ทั้งหมด
  const etrainingCost = 0; // จัดอบรมผ่านระบบดิจิทัลภายในองค์กร วิทยากรภายใน & Paperless 100%
  const netSavings = inhouseTotalCost; // ผลประหยัดงบประมาณการจัดอบรมจริงต่อหลักสูตร

  const handleResetDefaults = () => {
    playCyberClick();
    setTotalEmployees(230);
    setInhouseBatches(6);
    setSpeakerFeePerBatch(25000);
    setRefreshmentAndMaterial(250);
    setPublicFeePerPerson(3500);
  };

  const handlePrint = () => {
    playCyberClick();
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!reportRef.current) return;
    playCyberClick();
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const element = reportRef.current;
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
        cacheBust: true,
        fontEmbedCSS: '',
        skipFonts: true
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `TCT_E-Training_Executive_Roadmap_Report_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      playSuccessChime();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4500);
    } catch (err) {
      console.warn('html-to-image notice:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  // Export Executive Summary & Training Economics Model to Excel / CSV
  const handleExportExcel = () => {
    playCyberClick();
    const rows = [
      ['TCT ACADEMY • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด'],
      ['รายงานสรุปผลการบริหารความเสี่ยงและแผนงาน Roadmap เพื่อผู้บริหาร (Executive Training & Cost Savings Report)'],
      ['วันที่จัดทำเอกสาร', new Date().toLocaleDateString('th-TH'), 'รหัสเอกสาร', 'TCT-EXEC-2026-QSRM'],
      [''],
      ['--- 1. ดัชนีชี้วัดผลสัมฤทธิ์หลัก (Executive Key Performance Indicators) ---'],
      ['ดัชนีชี้วัด (KPI)', 'เป้าหมาย/ค่าที่ได้', 'หน่วยนับ', 'คำอธิบายเชิงกลยุทธ์'],
      ['อัตราการเข้ารับการอบรมครบถ้วน (Attendance Rate)', '100%', 'ร้อยละ', `พนักงาน ${totalEmployees} คน เข้ารับการอบรมได้ครบถ้วนทุกกะงาน`],
      ['การพัฒนาองค์ความรู้เฉลี่ย (Knowledge Growth)', '+48%', 'ร้อยละ', 'อัตราเพิ่มขึ้นเปรียบเทียบ Pre-Test vs Post-Test'],
      ['ลดงบประมาณการจัดอบรม/จ้างวิทยากร (Cost Saved)', inhouseTotalCost.toLocaleString(), 'บาท/หลักสูตร', 'ประหยัดงบจ้างวิทยากรภายนอกและค่าจัดอบรมได้ 100%'],
      ['ผลิตภาพสายการผลิต (Zero Production Downtime)', '0', 'ชั่วโมง', 'ไม่ต้องหยุดเครื่องจักร พนักงานเรียนรู้ผ่านระบบ 24/7'],
      [''],
      ['--- 2. แผนงานการขับเคลื่อนระบบบริหารความเสี่ยง 4 ระยะ (4-Phase Implementation Roadmap) ---'],
      ['ระยะที่', 'ชื่อระยะและช่วงเวลา', 'สถานะความคืบหน้า', 'กิจกรรมสำคัญและผลลัพธ์'],
      ['ระยะที่ 1', 'ประเมิน (Assess) - เดือนที่ 1-2', '100% สำเร็จ', 'ประเมินจุดเสี่ยงตาม ISO 31000, จัดทำ Risk Matrix, อบรมพนักงานครบถ้วนผ่าน TCT ACADEMY'],
      ['ระยะที่ 2', 'นำร่อง (Pilot) - เดือนที่ 3-4', '85% สำเร็จ', 'นำร่อง Risk Register ในฝ่ายผลิต, เริ่มรายงาน Near Miss, Hierarchy of Controls โดยสายการผลิตดำเนินงานตามปกติ'],
      ['ระยะที่ 3', 'ขยายผล (Scale) - เดือนที่ 5-8', '40% กำลังดำเนินการ', 'ขยายผลครบทุกแผนก 100%, กิจกรรม KYT ทุกเช้า, วิเคราะห์รากเหง้า 5 Whys'],
      ['ระยะที่ 4', 'ปรับปรุง (Optimize) - เดือนที่ 9+', 'เป้าหมายต่อเนื่อง', 'ทบทวนและ Kaizen มาตรการ, รักษาเป้าหมาย Zero Accident, Audit ไตรมาส'],
      [''],
      ['--- 3. การประเมินความคุ้มค่าด้านงบประมาณการจัดอบรม (Training Budget & Cost Savings Breakdown) ---'],
      ['รูปแบบการจัดอบรม', 'จำนวนผู้เข้าอบรม', 'ประมาณการค่าใช้จ่าย (บาท)', 'ผลประหยัดเมื่อใช้ E-Training TCT'],
      ['กรณีจ้างวิทยากรภายนอกจัด In-house (6 รุ่น)', `${totalEmployees} คน`, inhouseTotalCost.toLocaleString(), `ประหยัดงบได้ ${inhouseTotalCost.toLocaleString()} บาท (100%)`],
      ['กรณีส่งอบรมภายนอก Public Training', `${totalEmployees} คน`, publicTotalCost.toLocaleString(), `ประหยัดงบได้ ${publicTotalCost.toLocaleString()} บาท (100%)`],
      ['กรณีใช้ระบบ E-Training ภายใน (TCT Academy)', `${totalEmployees} คน`, '0', 'พนักงานอบรมได้ครบถ้วน 100% ไร้ค่าใช้จ่ายส่วนเกิน'],
      [''],
      ['--- 4. สรุปความพร้อมรายแผนก (Department Readiness) ---'],
      ['แผนก/ฝ่าย', 'ความพร้อม (%)', 'จุดควบคุมความเสี่ยงสำคัญ', 'ระดับความพร้อม'],
      ['ฝ่ายผลิต (Production)', '95%', 'ความเสี่ยงเครื่องจักร/จุดหนีบ/มาตรฐานการทำงาน', 'พร้อมระดับสูง'],
      ['ฝ่ายควบคุมคุณภาพ (QA/QC)', '100%', 'ของเสียหลุดรอดสู่ลูกค้า/ข้อกำหนดสเปก', 'พร้อมสมบูรณ์'],
      ['ฝ่ายวิศวกรรม/ซ่อมบำรุง (ENG)', '90%', 'งานพื้นที่อับอากาศ/ไฟฟ้า/ระบบ LOTO', 'พร้อมระดับสูง'],
      ['ฝ่ายความปลอดภัย (EHS)', '100%', 'มาตรฐานกฎหมายและ ISO 45001/14001', 'พร้อมสมบูรณ์'],
      ['ฝ่ายคลังสินค้า/โลจิสติกส์ (WH)', '85%', 'การขับขี่รถโฟล์คลิฟต์/การจัดเก็บ', 'กำลังขยายผล'],
      ['ฝ่ายบุคคลและธุรการ (Personnel)', '100%', 'การฝึกอบรมบุคลากรใหม่ & Onboarding', 'พร้อมสมบูรณ์'],
      [''],
      ['ผู้จัดทำรายงาน:', 'นายณฐวัตร พงษ์สาริกิจ • ผู้จัดการฝ่ายบุคคลและธุรการ • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด']
    ];

    const csvContent = '\uFEFF' + rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TCT_E-Training_Executive_ROI_Roadmap_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    playSuccessChime();
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 4500);
  };

  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 font-sarabun">
      {/* Top Controls (Hidden during Print) */}
      <div className="no-print glass-panel-cyan rounded-3xl p-5 sm:p-6 border border-cyan-500/40 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-semibold">
                TCT E-TRAINING EXECUTIVE PRESENTATION & ROADMAP
              </span>
              <span className="text-xs text-purple-300 font-semibold flex items-center gap-1">
                <Presentation className="w-4 h-4" />
                เอกสารสรุปผลและแผนงานสำหรับนำเสนอผู้บริหาร (A4 Portrait)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              รายงานสรุปภาพรวมและแผนงาน Roadmap เพื่อนำเสนอผู้บริหาร
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              ข้อมูลสรุปผลสัมฤทธิ์ แผนงาน 4 ระยะ และผลตอบแทนความคุ้มค่าการลงทุน (ROI) สำหรับคณะกรรมการบริหาร สามารถส่งออกเป็น <strong>PDF และ Excel/CSV</strong> ได้
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Export Excel / CSV */}
            <button
              id="exec-export-excel-btn"
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[40px]"
              title="ส่งออกรายงานและข้อมูล ROI เป็นไฟล์ Excel/CSV สำหรับผู้บริหาร (Export Excel)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>ส่งออก Excel / CSV</span>
            </button>

            {/* Print A4 PDF */}
            <button
              id="exec-print-pdf-btn"
              onClick={handlePrint}
              className="flex-1 sm:flex-none bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[40px]"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ PDF (A4 แนวตั้ง)</span>
            </button>

            {/* Download PNG */}
            <button
              id="exec-download-png-btn"
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 min-h-[40px]"
            >
              {isDownloading ? <Sparkles className="w-4 h-4 animate-spin text-cyan-400" /> : <Download className="w-4 h-4 text-slate-400" />}
              <span>{isDownloading ? 'กำลังสร้าง...' : 'รูปภาพ (PNG)'}</span>
            </button>

            {/* Admin Backoffice */}
            <button
              id="exec-admin-btn"
              onClick={() => { playCyberClick(); onNavigate('admin'); }}
              className="bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center gap-1 cursor-pointer min-h-[40px]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ระบบแอดมิน</span>
            </button>

            {/* Back to Dashboard */}
            <button
              id="exec-back-dashboard-btn"
              onClick={() => { playCyberClick(); onNavigate('dashboard'); }}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 border border-slate-700 cursor-pointer min-h-[40px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>หน้าหลัก</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>สำเร็จ!</strong> บันทึกภาพรายงานผู้บริหารเรียบร้อยแล้ว</span>
          </div>
        )}

        {exportNotice && (
          <div className="mt-3 p-3 rounded-xl bg-teal-950/90 border border-teal-500/60 text-teal-200 text-xs flex items-center gap-2 animate-fadeIn">
            <FileSpreadsheet className="w-5 h-5 text-teal-400 shrink-0" />
            <span><strong>ส่งออกสำเร็จ!</strong> สร้างและดาวน์โหลดไฟล์ตาราง Excel / CSV สำหรับผู้บริหารเรียบร้อยแล้ว</span>
          </div>
        )}
        {/* Interactive Parameter Simulator Bar (Optional / Collapsible) */}
        <div className="mt-4 pt-3 border-t border-slate-700/60">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={() => { playCyberClick(); setShowConfig(!showConfig); }}
              className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showConfig ? 'ซ่อนแผงจำลองงบประมาณการจัดอบรม' : 'ปรับเปลี่ยนตัวเลขเพื่อจำลองความคุ้มค่างบประมาณ (Training Cost Simulator)'}</span>
            </button>
            {showConfig && (
              <button
                onClick={handleResetDefaults}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>คืนค่ามาตรฐาน (Reset Defaults)</span>
              </button>
            )}
          </div>

          {showConfig && (
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs animate-fadeIn">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">จำนวนพนักงานเข้าอบรม (คน):</label>
                <input
                  type="number"
                  value={totalEmployees}
                  onChange={(e) => setTotalEmployees(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">ฐานข้อมูลปัจจุบัน: 230 คน</span>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ค่าจ้างวิทยากรภายนอก (บาท/รุ่น):</label>
                <input
                  type="number"
                  value={speakerFeePerBatch}
                  onChange={(e) => setSpeakerFeePerBatch(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono focus:border-amber-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">เฉลี่ย 20,000 - 35,000 ฿/รุ่น</span>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">จำนวนรุ่นจัดแบ่งตามกะ (รุ่น):</label>
                <input
                  type="number"
                  value={inhouseBatches}
                  onChange={(e) => setInhouseBatches(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">จัด 6-8 รุ่นเพื่อไม่ให้กระทบงาน</span>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ค่าอาหารว่าง/เอกสาร (บาท/คน):</label>
                <input
                  type="number"
                  value={refreshmentAndMaterial}
                  onChange={(e) => setRefreshmentAndMaterial(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-purple-300 font-mono focus:border-purple-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Coffee break & เอกสารประกอบ</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* EXECUTIVE PRESENTATION DOCUMENT CANVAS (A4 PORTRAIT) */}
      {/* ========================================================= */}
      <div className="flex justify-center pb-8">
        <div
          id="executive-summary-print-area"
          ref={reportRef}
          className="w-full max-w-[760px] bg-white text-slate-800 rounded-2xl p-6 sm:p-9 border-2 border-slate-300 shadow-2xl relative font-sarabun space-y-4 printable-document"
        >
          {/* 1. Prominent Institution Header */}
          <div className="text-center space-y-1.5 pb-3.5 border-b-2 border-slate-800">
            <div className="space-y-0.5">
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F2A4A] tracking-tight uppercase leading-tight font-sarabun">
                TCT ACADEMY
              </h1>
              <div className="text-sm sm:text-base font-bold text-[#B45309]">
                TCT Academy ศูนย์ฝึกอบรมและพัฒนา
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[#0F2A4A] font-mono tracking-wider uppercase">
                บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • TEIJIN CORD (THAILAND) CO., LTD.
              </div>
            </div>

            <div className="pt-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F2A4A] tracking-tight">
                รายงานสรุปผลการบริหารความเสี่ยงและแผนงาน Roadmap เพื่อผู้บริหาร
              </h2>
              <div className="text-xs font-bold text-[#475569] tracking-wider uppercase mt-0.5">
                EXECUTIVE RISK MANAGEMENT IMPLEMENTATION & TRAINING COST SAVINGS REPORT (A4 PORTRAIT)
              </div>
            </div>
          </div>

          {/* Section 1: Executive KPI Scoreboard */}
          <div>
            <div className="text-xs font-bold text-[#0F2A4A] uppercase mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <BarChart3 className="w-4 h-4 text-[#B45309]" />
              1. สรุปดัชนีชี้วัดผลสัมฤทธิ์หลัก (Executive Key Performance Indicators)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-[#F8FAFC] border border-slate-300 rounded-xl p-2.5">
                <div className="text-slate-500 font-medium text-[11px]">อัตราเข้ารับการอบรม</div>
                <div className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5">100%</div>
                <div className="text-[10px] text-slate-500">ครบถ้วน {totalEmployees} คน ทุกกะงาน</div>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-300 rounded-xl p-2.5">
                <div className="text-slate-500 font-medium text-[11px]">การพัฒนาความรู้เฉลี่ย</div>
                <div className="text-xl font-extrabold text-blue-700 font-mono mt-0.5">+48%</div>
                <div className="text-[10px] text-slate-500">Pre vs Post Growth</div>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-300 rounded-xl p-2.5">
                <div className="text-slate-500 font-medium text-[11px]">ลดงบจัดอบรม/จ้างวิทยากร</div>
                <div className="text-xl font-extrabold text-purple-700 font-mono mt-0.5">{inhouseTotalCost.toLocaleString()} ฿</div>
                <div className="text-[10px] text-slate-500">ประหยัดงบได้ 100% ต่อหลักสูตร</div>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-300 rounded-xl p-2.5">
                <div className="text-slate-500 font-medium text-[11px]">สายการผลิตหยุดชะงัก</div>
                <div className="text-xl font-extrabold text-amber-700 font-mono mt-0.5">0 ชม.</div>
                <div className="text-[10px] text-slate-500">เรียนรู้ 24/7 ไม่กระทบงาน</div>
              </div>
            </div>
          </div>

          {/* Section 2: 4-Phase Implementation Roadmap */}
          <div>
            <div className="text-xs font-bold text-[#0F2A4A] uppercase mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Compass className="w-4 h-4 text-[#B45309]" />
              2. แผนงานการขับเคลื่อนระบบบริหารความเสี่ยง 4 ระยะ (4-Phase Operational Roadmap)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              {[
                {
                  phase: 'ระยะที่ 1: ประเมิน (Assess)',
                  time: 'เดือนที่ 1 - 2',
                  status: 'ดำเนินการแล้ว 100%',
                  color: 'bg-cyan-50 border-cyan-300 text-cyan-900',
                  badge: 'bg-cyan-200 text-cyan-900',
                  items: [
                    'ประเมินจุดเสี่ยงตาม ISO 31000',
                    'จัดทำ Risk Matrix ประจำแผนก',
                    'อบรมพนักงานครบ 100% ทางออนไลน์'
                  ]
                },
                {
                  phase: 'ระยะที่ 2: นำร่อง (Pilot)',
                  time: 'เดือนที่ 3 - 4',
                  status: 'ดำเนินการแล้ว 85%',
                  color: 'bg-purple-50 border-purple-300 text-purple-900',
                  badge: 'bg-purple-200 text-purple-900',
                  items: [
                    'นำร่อง Risk Register ฝ่ายผลิต',
                    'เริ่มระบบรายงาน Near Miss',
                    'สายการผลิตทำงานปกติ ไม่หยุดเครื่อง'
                  ]
                },
                {
                  phase: 'ระยะที่ 3: ขยายผล (Scale)',
                  time: 'เดือนที่ 5 - 8',
                  status: 'กำลังดำเนินการ 40%',
                  color: 'bg-blue-50 border-blue-300 text-blue-900',
                  badge: 'bg-blue-200 text-blue-900',
                  items: [
                    'ขยายผลครอบคลุมทุกฝ่าย 100%',
                    'กิจกรรม KYT ก่อนเริ่มงานทุกวัน',
                    'การวิเคราะห์รากเหง้า 5 Whys'
                  ]
                },
                {
                  phase: 'ระยะที่ 4: ปรับปรุง (Optimize)',
                  time: 'เดือนที่ 9 เป็นต้นไป',
                  status: 'เป้าหมายต่อเนื่อง',
                  color: 'bg-emerald-50 border-emerald-300 text-emerald-900',
                  badge: 'bg-emerald-200 text-emerald-900',
                  items: [
                    'ทบทวนและ Kaizen มาตรการ',
                    'รักษามาตรฐาน Zero Accident',
                    'ตรวจประเมินผลประจำไตรมาส'
                  ]
                }
              ].map((item, i) => (
                <div key={i} className={`p-2.5 rounded-xl border ${item.color} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px]">{item.phase}</span>
                  </div>
                  <div className="text-[9.5px] text-slate-500 font-mono">{item.time}</div>
                  <span className={`inline-block text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${item.badge}`}>
                    {item.status}
                  </span>
                  <ul className="space-y-0.5 text-[10.5px] pt-0.5 text-slate-700">
                    {item.items.map((it, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-slate-400">•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Training Economics & Budget Savings Breakdown */}
          <div className="bg-[#F8FAFC] border border-slate-300 rounded-xl p-3.5 space-y-2.5">
            <div className="text-xs font-bold text-[#0F2A4A] uppercase flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#B45309]" />
                3. การประเมินความคุ้มค่าด้านงบประมาณการจัดอบรมและการเข้าถึงของพนักงาน (Training Budget & Coverage)
              </span>
              <span className="text-xs font-bold text-emerald-700">
                ประหยัดงบประมาณสุทธิ: {netSavings.toLocaleString()} บาท/หลักสูตร
              </span>
            </div>

            <div className="text-[10.5px] text-slate-700 bg-amber-50/80 border border-amber-200/90 rounded-lg p-2 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>หลักเกณฑ์การคำนวณตามข้อเท็จจริง (Actual Basis):</strong> ไม่นำตัวเลขสมมติความเสียหายที่ไม่มีข้อมูลจริงมาคิด 
                โดยมุ่งเน้น 2 ปัจจัยหลัก: <strong>(1) พนักงานสามารถเข้ารับการอบรมได้ครบถ้วน 100%</strong> ทุกกะงานโดยไม่กระทบสายการผลิต และ <strong>(2) การลดค่าใช้จ่ายจริง</strong> เปรียบเทียบระหว่างการจ้างวิทยากรภายนอกจัดอบรมในโรงงาน หรือส่งอบรมภายนอก กับการใช้ระบบ E-Training พัฒนาภายใน
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold text-[11px]">แบบที่ 1: จ้างวิทยากรจัด In-house</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold border border-rose-300">ภายนอก</span>
                  </div>
                  <div className="text-sm font-bold text-rose-700 font-mono mt-0.5">
                    {inhouseTotalCost.toLocaleString()} บาท
                  </div>
                </div>
                <div className="text-[10px] text-slate-600 space-y-0.5 border-t border-slate-100 pt-1.5 leading-snug">
                  <div>• ค่าวิทยากร {inhouseBatches} รุ่น ({speakerFeePerBatch.toLocaleString()} ฿/รุ่น) = {totalSpeakerFee.toLocaleString()} ฿</div>
                  <div>• ค่าอาหารว่าง/เอกสาร {totalEmployees} คน = {totalRefreshmentAndMaterial.toLocaleString()} ฿</div>
                  <div className="text-rose-600 font-medium pt-0.5">⚠️ เสี่ยงกระทบตารางเข้ากะของสายการผลิต</div>
                </div>
              </div>

              <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold text-[11px]">แบบที่ 2: ส่ง Public Training</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">ภายนอก</span>
                  </div>
                  <div className="text-sm font-bold text-amber-700 font-mono mt-0.5">
                    {publicTotalCost.toLocaleString()} บาท
                  </div>
                </div>
                <div className="text-[10px] text-slate-600 space-y-0.5 border-t border-slate-100 pt-1.5 leading-snug">
                  <div>• ค่าลงทะเบียนเฉลี่ย {publicFeePerPerson.toLocaleString()} ฿/คน x {totalEmployees} คน</div>
                  <div>• (หากส่งเฉพาะหัวหน้างาน 13 คน = {(13 * publicFeePerPerson).toLocaleString()} ฿)</div>
                  <div className="text-amber-700 font-medium pt-0.5">⚠️ มีค่าเดินทาง/พนักงานเข้าถึงได้ไม่ครบ</div>
                </div>
              </div>

              <div className="space-y-1.5 bg-emerald-50/90 p-2.5 rounded-lg border border-emerald-300 text-emerald-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-emerald-800">แบบที่ 3: ระบบ E-Training ภายใน</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-bold">TCT Academy</span>
                  </div>
                  <div className="text-sm font-extrabold text-emerald-700 font-mono mt-0.5">
                    0 บาท (ประหยัด 100%)
                  </div>
                </div>
                <div className="text-[10px] text-emerald-800 space-y-0.5 border-t border-emerald-200 pt-1.5 leading-snug">
                  <div>• อบรมครบถ้วน 100% ({totalEmployees} คน) ยืดหยุ่น 24/7</div>
                  <div>• วิทยากรภายใน & เอกสารดิจิทัล 100% Paperless</div>
                  <div className="font-bold text-emerald-700 pt-0.5">✓ ผลประหยัดงบประมาณสุทธิ {netSavings.toLocaleString()} บาท</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Department Readiness Summary */}
          <div>
            <div className="text-xs font-bold text-[#0F2A4A] uppercase mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Building2 className="w-4 h-4 text-[#B45309]" />
              4. สรุปความพร้อมรายแผนกในการขับเคลื่อนวัฒนธรรมความปลอดภัยและคุณภาพ
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { dept: 'ฝ่ายผลิต (Production)', rate: '95%', risk: 'ความเสี่ยงเครื่องจักร/จุดหนีบ', status: 'พร้อมระดับสูง' },
                { dept: 'ฝ่ายควบคุมคุณภาพ (QA/QC)', rate: '100%', risk: 'ของเสียหลุดรอดสู่ลูกค้า', status: 'พร้อมสมบูรณ์' },
                { dept: 'ฝ่ายวิศวกรรม/ซ่อมบำรุง', rate: '90%', risk: 'งานพื้นที่อับอากาศ/ไฟฟ้า', status: 'พร้อมระดับสูง' },
                { dept: 'ฝ่ายความปลอดภัย (EHS)', rate: '100%', risk: 'มาตรฐานกฎหมายและ ISO', status: 'พร้อมสมบูรณ์' },
                { dept: 'ฝ่ายคลังสินค้า/โลจิสติกส์', rate: '85%', risk: 'รถโฟล์คลิฟต์/การจัดเก็บ', status: 'กำลังขยายผล' },
                { dept: 'ฝ่ายบุคคลและธุรการ (Personnel)', rate: '100%', risk: 'การฝึกอบรมบุคลากรใหม่', status: 'พร้อมสมบูรณ์' }
              ].map((d, i) => (
                <div key={i} className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-2 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#0F2A4A] text-[11px]">{d.dept}</div>
                    <div className="text-[10px] text-slate-500">{d.risk}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 font-mono">{d.rate}</span>
                    <span className="block text-[9px] text-slate-400">{d.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Official Signatures */}
          <div className="pt-3 border-t-2 border-slate-300">
            <div className="grid grid-cols-2 gap-6 text-center text-xs">
              {/* Signatory 1: Personnel & Admin Manager (Authorized Approver) */}
              <div className="space-y-0.5">
                <div className="text-slate-500 text-[10px] font-semibold">ผู้จัดทำและผู้มีอำนาจอนุมัติ</div>
                <div className="h-9 border-b-2 border-slate-400 mx-auto w-48 sm:w-56 flex items-end justify-center pb-0.5">
                </div>
                <div className="font-bold text-[#0F2A4A] text-[11px] mt-1">( นายณฐวัตร พงษ์สาริกิจ )</div>
                <div className="text-[10px] font-bold text-[#B45309]">ผู้จัดการฝ่ายบุคคลและธุรการ (ผู้มีอำนาจอนุมัติ)</div>
                <div className="text-[9.5px] text-slate-500 font-medium">ฝ่ายบุคคลและธุรการ (Personnel) • TCT Academy</div>
              </div>

              {/* Signatory 2: General Manager & Factory Manager */}
              <div className="space-y-0.5">
                <div className="text-slate-500 text-[10px] font-semibold">ผู้รับทราบและอนุมัติแผนงานโรงงาน</div>
                <div className="h-9 border-b-2 border-slate-400 mx-auto w-48 sm:w-56 flex items-end justify-center pb-0.5">
                </div>
                <div className="font-bold text-[#0F2A4A] text-[11px] mt-1">( นายนพดล บำรุงเกียรติ )</div>
                <div className="text-[10px] font-bold text-[#0F2A4A]">ผู้จัดการทั่วไปและผู้จัดการโรงงาน</div>
                <div className="text-[9.5px] text-slate-500 font-medium">บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</div>
              </div>
            </div>
          </div>

          {/* Footer watermark */}
          <div className="text-center pt-2 text-[10px] text-slate-400 font-mono border-t border-slate-200 flex justify-between items-center">
            <span>เอกสารนำเสนอฝ่ายบริหาร TCT Academy ศูนย์ฝึกอบรมและพัฒนา • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
            <span>วันที่ออกเอกสาร: {currentDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
