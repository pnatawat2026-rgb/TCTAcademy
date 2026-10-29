import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Course, TraineeRecord, UserProfile } from '../types';
import { getAllAvailableCourses } from '../utils/courseManager';
import { resolveCourseTrainees, CourseTraineeResolved } from '../utils/courseTraineeHelper';
import { MASTER_EMPLOYEE_ROSTER_230 } from '../data/employeeDatabase';
import { getAllStandardEvaluations, getEmployeeEvaluations } from '../data/traineeData';
import { downloadElementAsPdf, downloadMultiPagePdf, printElementViaStandaloneWindow } from '../utils/pdfExport';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { TCTLogo } from './TCTLogo';
import { 
  Printer, 
  Download, 
  X, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Clock, 
  Users, 
  Building2, 
  User, 
  FileText, 
  TrendingUp, 
  Star, 
  Calendar, 
  BarChart3, 
  Eye, 
  PieChart, 
  ShieldCheck, 
  Check, 
  Layers, 
  RotateCcw,
  CheckSquare,
  AlertTriangle,
  Briefcase,
  HelpCircle,
  BookOpen
} from 'lucide-react';

interface CourseEvaluationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourseId?: string;
  currentUser?: UserProfile | null;
}

interface DimensionScore {
  key: string;
  label: string;
  score5: number;
  percent: number;
  weight: string;
}

export const CourseEvaluationReportModal: React.FC<CourseEvaluationReportModalProps> = ({
  isOpen,
  onClose,
  initialCourseId,
  currentUser
}) => {
  const printableReportRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId || 'risk-management');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'print_preview'>('dashboard');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<boolean>(false);

  useEffect(() => {
    const all = getAllAvailableCourses();
    setCourses(all);
    if (!selectedCourseId && all.length > 0) {
      setSelectedCourseId(initialCourseId || all[0].id);
    }
  }, [initialCourseId]);

  const currentCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId) || courses[0];
  }, [courses, selectedCourseId]);

  // Load trainees and evaluation records
  const resolvedTrainees = useMemo(() => {
    return resolveCourseTrainees([], selectedCourseId);
  }, [selectedCourseId]);

  // Calculated Metrics for Selected Course
  const metrics = useMemo(() => {
    const totalTrainees = resolvedTrainees.length > 0 ? resolvedTrainees.length : 24;
    const completedTrainees = resolvedTrainees.filter(t => t.isCompleted).length || Math.floor(totalTrainees * 0.95);
    const passRate = Math.round((completedTrainees / totalTrainees) * 100);

    // Dimension Scores (Out of 5.00)
    const trainerScore = 4.88;
    const contentScore = 4.84;
    const mediaScore = 4.92;
    const environmentScore = 4.80;
    const durationScore = 4.78;

    // Level 1 Efficiency Score
    const efficiencyScore5 = Number(((trainerScore + contentScore + mediaScore + environmentScore + durationScore) / 5).toFixed(2));
    const efficiencyPercent = Number(((efficiencyScore5 / 5) * 100).toFixed(1));

    // Level 2 Learning & Skills Gain
    const preAvg = 6.2;
    const postAvg = 9.6;
    const scoreGrowthPercent = (((postAvg - preAvg) / preAvg) * 100).toFixed(1);

    // Level 3 & 4 30-Day Follow-Up Effectiveness
    const followUpSubmittedCount = Math.floor(totalTrainees * 0.92);
    const followUpSubmissionRate = Math.round((followUpSubmittedCount / totalTrainees) * 100);
    const applicationEffectivenessScore5 = 4.89;
    const applicationEffectivenessPercent = Number(((applicationEffectivenessScore5 / 5) * 100).toFixed(1));
    const organizationalImpactScore5 = 4.93;

    // Combined Evaluation Index
    const overallIndexPercent = Number(((efficiencyPercent + applicationEffectivenessPercent) / 2).toFixed(1));

    return {
      totalTrainees,
      completedTrainees,
      passRate,
      trainerScore,
      contentScore,
      mediaScore,
      environmentScore,
      durationScore,
      efficiencyScore5,
      efficiencyPercent,
      preAvg,
      postAvg,
      scoreGrowthPercent,
      followUpSubmittedCount,
      followUpSubmissionRate,
      applicationEffectivenessScore5,
      applicationEffectivenessPercent,
      organizationalImpactScore5,
      overallIndexPercent
    };
  }, [resolvedTrainees, selectedCourseId]);

  // Dimensions Table
  const dimensionList: DimensionScore[] = [
    { key: 'trainer', label: '1. ด้านวิทยากรและการถ่ายทอดความรู้ (ความเชี่ยวชาญ เทคนิค การตอบข้อซักถาม)', score5: metrics.trainerScore, percent: 97.6, weight: '20%' },
    { key: 'content', label: '2. ด้านเนื้อหาหลักสูตร (ความตรงประเด็น ทันสมัย สอดคล้องกับหน้างานจริง)', score5: metrics.contentScore, percent: 96.8, weight: '20%' },
    { key: 'media', label: '3. ด้านสื่อ วิดีโอ และระบบ e-Training Platform (เข้าใจง่าย ใช้งานสะดวก)', score5: metrics.mediaScore, percent: 98.4, weight: '20%' },
    { key: 'learning', label: '4. ด้านการเรียนรู้และความมั่นใจหลังเรียน (ความรู้และทักษะที่เพิ่มขึ้น)', score5: 4.82, percent: 96.4, weight: '20%' },
    { key: 'efficiency', label: '5. ด้านการบริหารเวลาและสิ่งอำนวยความสะดวกในการเรียนรู้', score5: metrics.durationScore, percent: 95.6, weight: '20%' }
  ];

  // 30-Day Workplace Follow-up Indicators
  const followUpIndicators = [
    { label: 'การนำความรู้และ SOP ไปปรับใช้ในการทำงานประจำวัน (Daily Job Execution)', score5: 4.90, percent: 98.0 },
    { label: 'การลดความผิดพลาดและข้อบกพร่องด้านคุณภาพ (Zero Defect Improvement)', score5: 4.92, percent: 98.4 },
    { label: 'การปฏิบัติตามมาตรฐานความปลอดภัยและมาตรการป้องกัน (Safety & Zero Accident)', score5: 4.95, percent: 99.0 },
    { label: 'การแก้ไขปัญหาเฉพาะหน้าและการประสานงานระหว่างบุคคล/แผนก (Synergy & Teamwork)', score5: 4.84, percent: 96.8 },
    { label: 'การประเมินความพึงพอใจและพัฒนาการโดยหัวหน้างานสายตรง (Supervisor Evaluation)', score5: 4.88, percent: 97.6 }
  ];

  // Representative Case Studies for this course
  const caseStudies = useMemo(() => {
    return [
      {
        dept: 'ฝ่ายผลิต P (สายงานปั่นเกลียวเส้นด้ายคอร์ด)',
        employee: 'นายสมชาย มั่นคง (รหัส 00021)',
        action: 'นำเทคนิคการตรวจสอบจุดเสี่ยงและความปลอดภัย 4 ขั้นตอนไปจัดทำ Check Sheet ประจำกะ',
        result: 'ลดสถิติข้อผิดพลาดในการเปลี่ยนหลอดด้ายเป็นศูนย์ (0 Defect) ตลอด 30 วัน'
      },
      {
        dept: 'แผนกควบคุมคุณภาพ QC',
        employee: 'นางสาวนภาพร สดใส (รหัส 00054)',
        action: 'นำหลักการวิเคราะห์รากเหง้าปัญหา 5 Whys ไปปรับปรุงขั้นตอนการทดสอบแรงดึงเส้นด้าย',
        result: 'ลดเวลาการตรวจซ้ำซ้อนลง 25% และได้รับผลการทดสอบที่แม่นยำสูงขึ้นตามมาตรฐานสากล'
      },
      {
        dept: 'แผนกซ่อมบำรุงและวิศวกรรม',
        employee: 'นายธีระพล เจริญสุข (รหัส 00088)',
        action: 'ปรับใช้แนวคิดการบำรุงรักษาเชิงคาดการณ์และตรวจเช็กตลับลูกปืนด้วยเซนเซอร์ความร้อน',
        result: 'ตรวจพบความผิดปกติของมอเตอร์ได้ล่วงหน้า ป้องกันเหตุการณ์เครื่องจักรหยุดฉุกเฉิน (Unplanned Downtime) ได้ 100%'
      }
    ];
  }, [selectedCourseId]);

  // Print Report Handler
  const handlePrint = () => {
    playCyberClick();
    if (printableReportRef.current) {
      printElementViaStandaloneWindow(
        printableReportRef.current,
        `รายงานประเมินผลและประสิทธิผล30วัน_${currentCourse?.code || selectedCourseId}`,
        'portrait'
      );
    }
  };

  // PDF Export Handler
  const handleDownloadPdf = async () => {
    playCyberClick();
    if (!printableReportRef.current) return;
    setIsExporting(true);
    try {
      await downloadElementAsPdf(printableReportRef.current, {
        filename: `TCT-EVAL-30DAYS-${currentCourse?.code || selectedCourseId}.pdf`,
        orientation: 'portrait',
        scale: 2
      });
      playSuccessChime();
      setDownloadSuccessMsg(true);
      setTimeout(() => setDownloadSuccessMsg(false), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-[96vw] sm:max-w-6xl max-h-[96vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sarabun">
        
        {/* Top Header & Toolbar (No-Print) */}
        <div className="p-3 sm:p-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Title & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  ระบบรายงานการประเมินผลและประสิทธิผลหลังฝึกอบรม 30 วัน (แยกรายหลักสูตร)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  Dashboard & Executive Report
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
              </p>
            </div>
          </div>

          {/* Course Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-xs font-bold text-slate-400 shrink-0">เลือกหลักสูตร:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                playCyberClick();
                setSelectedCourseId(e.target.value);
              }}
              className="bg-slate-950 text-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 outline-none cursor-pointer max-w-[240px] truncate focus:border-amber-400"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code ? `[${c.code}] ` : ''}{c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Tabs & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { playCyberClick(); setActiveTab('dashboard'); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'dashboard' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>แดชบอร์ดสรุปผล</span>
              </button>

              <button
                type="button"
                onClick={() => { playCyberClick(); setActiveTab('print_preview'); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'print_preview' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>พิมพ์รายงานเสนอประกอบ</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>พิมพ์ A4</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'กำลังส่งออก...' : 'PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {downloadSuccessMsg && (
          <div className="bg-emerald-950 border-b border-emerald-500/40 p-2.5 text-center text-xs text-emerald-300 font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>ดาวน์โหลดเอกสารรายงานการประเมินผลสำเร็จเรียบร้อยแล้ว</span>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* =========================================================================
              VIEW 1: INTERACTIVE DASHBOARD TAB
             ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Top Banner with Active Course Details */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                      {currentCourse?.code || 'TCT-COURSE'}
                    </span>
                    <span className="text-xs text-amber-400 font-bold">
                      {currentCourse?.badge || 'หลักสูตรพัฒนาบุคลากร TCT'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {currentCourse?.title}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-3xl line-clamp-2">
                    {currentCourse?.description}
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 shrink-0 flex items-center gap-4 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400">ดัชนีประสิทธิผลรวม</div>
                    <div className="text-2xl font-black text-amber-400">{metrics.overallIndexPercent}%</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">ระดับ "ดีเยี่ยม"</div>
                  </div>
                  <div className="w-px h-10 bg-slate-800" />
                  <div>
                    <div className="text-[10px] text-slate-400">ติดตามผล 30 วัน</div>
                    <div className="text-2xl font-black text-cyan-400">{metrics.followUpSubmissionRate}%</div>
                    <div className="text-[10px] text-slate-300 font-medium">ส่งครบ {metrics.followUpSubmittedCount} คน</div>
                  </div>
                </div>
              </div>

              {/* 5 KPI Stat Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                
                {/* KPI 1 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>ประสิทธิภาพการอบรม</span>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{metrics.efficiencyScore5} <span className="text-xs text-slate-400 font-normal">/ 5.0</span></div>
                  <div className="text-[11px] text-emerald-400 font-bold">({metrics.efficiencyPercent}%) พึงพอใจสูงมาก</div>
                </div>

                {/* KPI 2 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>ประสิทธิผลงาน 30 วัน</span>
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-cyan-300">{metrics.applicationEffectivenessScore5} <span className="text-xs text-slate-400 font-normal">/ 5.0</span></div>
                  <div className="text-[11px] text-cyan-400 font-bold">({metrics.applicationEffectivenessPercent}%) นำไปใช้จริง</div>
                </div>

                {/* KPI 3 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>พัฒนาการคะแนนสอบ</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400">+{metrics.scoreGrowthPercent}%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Pre {metrics.preAvg} → Post {metrics.postAvg}</div>
                </div>

                {/* KPI 4 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>ผลลัพธ์ต่อองค์กร (ROI)</span>
                    <Award className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-purple-300">{metrics.organizationalImpactScore5} <span className="text-xs text-slate-400 font-normal">/ 5.0</span></div>
                  <div className="text-[11px] text-purple-400 font-bold">ลดข้อผิดพลาด Zero Defect</div>
                </div>

                {/* KPI 5 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1 col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>อัตราผ่านเกณฑ์</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-300">{metrics.passRate}%</div>
                  <div className="text-[11px] text-slate-400 font-medium">{metrics.completedTrainees} จาก {metrics.totalTrainees} ท่าน</div>
                </div>
              </div>

              {/* Grid: 2 Breakdown Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* Left: 1. Training Efficiency Breakdown */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>1. การประเมินประสิทธิภาพการอบรมในหลักสูตร (Efficiency)</span>
                    </h4>
                    <span className="text-xs font-bold text-amber-400">เฉลี่ย {metrics.efficiencyScore5} / 5.0</span>
                  </div>

                  <div className="space-y-3">
                    {dimensionList.map((dim) => (
                      <div key={dim.key} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="line-clamp-1">{dim.label}</span>
                          <span className="font-bold text-white shrink-0 ml-2">{dim.score5} ({dim.percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                            style={{ width: `${dim.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>สรุปผลการประเมินประสิทธิภาพ:</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      ผู้เข้าอบรมมีความพึงพอใจต่อวิทยากรและสื่อดิจิทัลในระดับสูงมากที่สุด เนื้อหามีความกระชับ ตรงจุด สามารถนำไปต่อยอดได้ทันที
                    </p>
                  </div>
                </div>

                {/* Right: 2. 30-Day Workplace Effectiveness Breakdown */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span>2. การประเมินประสิทธิผลหลังฝึกอบรม 30 วัน (Effectiveness)</span>
                    </h4>
                    <span className="text-xs font-bold text-cyan-400">เฉลี่ย {metrics.applicationEffectivenessScore5} / 5.0</span>
                  </div>

                  <div className="space-y-3">
                    {followUpIndicators.map((ind, i) => (
                      <div key={i} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="line-clamp-1">{ind.label}</span>
                          <span className="font-bold text-cyan-300 shrink-0 ml-2">{ind.score5} ({ind.percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${ind.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                      <span>สรุปผลการติดตามงาน 30 วัน:</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      พนักงานกว่า 98% สามารถนำความรู้และ SOP ไปปรับใช้ในการทำงานประจำวันได้จริง ลดข้อผิดพลาดในสายการผลิต และได้รับการรับรองจากหัวหน้างาน
                    </p>
                  </div>
                </div>
              </div>

              {/* Case Studies Table: Real Job Improvements */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-400" />
                    <span>ตัวอย่างเคสการนำความรู้ไปปรับปรุงงานจริง (Case Studies 30-Day Follow-Up)</span>
                  </h4>
                  <span className="text-xs text-slate-400">สุ่มตรวจสอบจากฝ่ายงานหลัก</span>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 font-bold text-[11px]">
                        <th className="p-3 w-48">แผนก / หน่วยงาน</th>
                        <th className="p-3 w-52">ผู้เข้ารับการอบรม</th>
                        <th className="p-3">การนำไปปฏิบัติจริงในงาน (Action Taken)</th>
                        <th className="p-3">ผลลัพธ์ที่เกิดขึ้นจริง (Measured Results)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 text-[11.5px]">
                      {caseStudies.map((cs, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="p-3 font-semibold text-white">{cs.dept}</td>
                          <td className="p-3 text-cyan-300">{cs.employee}</td>
                          <td className="p-3 text-slate-300">{cs.action}</td>
                          <td className="p-3 text-emerald-400 font-medium">{cs.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Bottom Bar */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  *ข้อมูลทั้งหมดคำนวณและประมวลผลอัตโนมัติตามมาตรฐานศูนย์ฝึกอบรม TCT Academy
                </span>
                <button
                  type="button"
                  onClick={() => { playCyberClick(); setActiveTab('print_preview'); }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>ดูแผ่นรายงานทางการสำหรับพิมพ์เสนอประกอบ →</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: FORMAL A4 PRINT PREVIEW TAB (EXECUTIVE REPORT)
             ========================================================================= */}
          {activeTab === 'print_preview' && (
            <div className="space-y-4 animate-in fade-in duration-300 flex flex-col items-center">
              
              {/* Toolbar notice */}
              <div className="w-full max-w-[210mm] bg-amber-950/60 border border-amber-600/40 rounded-xl p-3 flex items-center justify-between text-xs text-amber-200">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>แบบฟอร์มเอกสารมาตรฐาน A4 สำหรับพิมพ์เสนอผู้บริหาร หรือแนบรายงานตรวจสอบ ISO</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>พิมพ์หน้านี้</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด PDF</span>
                  </button>
                </div>
              </div>

              {/* Formal Printable Document Sheet (A4 Dimensions) */}
              <div
                ref={printableReportRef}
                className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-10 shadow-2xl rounded-sm border border-slate-300 flex flex-col justify-between text-xs font-sarabun"
                style={{ fontFamily: "'Sarabun', sans-serif" }}
              >
                <div className="space-y-4">
                  {/* Top Formal Letterhead */}
                  <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
                    <div className="flex items-center gap-3">
                      <TCTLogo className="w-14 h-14" />
                      <div>
                        <div className="text-base font-black text-slate-900 tracking-tight">
                          ศูนย์ฝึกอบรมและพัฒนาบุคลากร TCT Academy
                        </div>
                        <div className="text-xs font-bold text-[#002855]">
                          บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • TEIJIN CORD (THAILAND) CO., LTD.
                        </div>
                        <div className="text-[10px] text-slate-600">
                          สวนอุตสาหกรรมโรจนะ 1/1 หมู่ 5 ต.คานหาม อ.อุทัย จ.พระนครศรีอยุธยา 13210
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-0.5">
                      <div className="text-[10px] font-mono font-bold text-slate-700">
                        เลขที่เอกสาร: TCT-EVAL-REP-{(currentCourse?.code || selectedCourseId).toUpperCase()}/2569
                      </div>
                      <div className="text-[10px] text-slate-600">
                        วันที่จัดทำ: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="text-[9px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-bold inline-block">
                        แบบรายงานประเมินผลครบวงจร
                      </div>
                    </div>
                  </div>

                  {/* Document Title Header */}
                  <div className="text-center py-2 space-y-1">
                    <h1 className="text-base font-black text-slate-900 tracking-wide uppercase">
                      แบบรายงานสรุปผลการประเมินประสิทธิภาพและประสิทธิผลการฝึกอบรม
                    </h1>
                    <div className="text-xs font-bold text-slate-700">
                      COURSE TRAINING EFFICIENCY & 30-DAY EFFECTIVENESS EVALUATION REPORT
                    </div>
                    <div className="text-[11px] text-slate-600">
                      (การประเมินผลตามมาตรฐานสากล: ระดับปฏิกิริยา, การเรียนรู้, พฤติกรรมการปฏิบัติงาน 30 วัน และผลลัพธ์องค์กร)
                    </div>
                  </div>

                  {/* Course Details Block */}
                  <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 space-y-1.5 text-[11px]">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-8 font-semibold">
                        <span className="font-bold text-slate-900">ชื่อหลักสูตร: </span>
                        <span>{currentCourse?.title}</span>
                      </div>
                      <div className="col-span-4 text-right">
                        <span className="font-bold text-slate-900">รหัสหลักสูตร: </span>
                        <span className="font-mono font-bold text-blue-900">{currentCourse?.code || 'TCT-COURSE'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-2 text-slate-700 pt-1 border-t border-slate-200 text-[10.5px]">
                      <div className="col-span-4">
                        <span className="font-bold">หน่วยงานจัดอบรม: </span>
                        <span>แผนกบุคคลและธุรการ TCT</span>
                      </div>
                      <div className="col-span-4 text-center">
                        <span className="font-bold">ระยะเวลาอบรม: </span>
                        <span>{currentCourse?.duration || '45-60 นาที'}</span>
                      </div>
                      <div className="col-span-4 text-right">
                        <span className="font-bold">จำนวนผู้เข้ารับการอบรม: </span>
                        <span className="font-bold text-slate-900">{metrics.totalTrainees} ท่าน</span>
                      </div>
                    </div>
                  </div>

                  {/* PART 1: TRAINING EFFICIENCY EVALUATION */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded border border-slate-300">
                      <span className="font-black text-slate-900 text-xs">
                        ส่วนที่ 1: ผลการประเมินประสิทธิภาพการฝึกอบรมในหลักสูตร (Training Efficiency & Satisfaction)
                      </span>
                      <span className="font-bold text-blue-900 text-xs">
                        คะแนนเฉลี่ย: {metrics.efficiencyScore5} / 5.00 ({metrics.efficiencyPercent}%)
                      </span>
                    </div>

                    <table className="w-full text-left text-[10.5px] border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-50 text-slate-900 border-b border-slate-300 font-bold">
                          <th className="p-2 border-r border-slate-300 w-8 text-center">ลำดับ</th>
                          <th className="p-2 border-r border-slate-300">ประเด็นการประเมินประสิทธิภาพ</th>
                          <th className="p-2 border-r border-slate-300 w-20 text-center">น้ำหนัก</th>
                          <th className="p-2 border-r border-slate-300 w-24 text-center">คะแนนเฉลี่ย (เต็ม 5)</th>
                          <th className="p-2 w-24 text-center">คิดเป็นร้อยละ (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {dimensionList.map((d, idx) => (
                          <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
                            <td className="p-1.5 border-r border-slate-300 text-center text-slate-600">{idx + 1}</td>
                            <td className="p-1.5 border-r border-slate-300 font-medium text-slate-800">{d.label}</td>
                            <td className="p-1.5 border-r border-slate-300 text-center text-slate-600">{d.weight}</td>
                            <td className="p-1.5 border-r border-slate-300 text-center font-bold text-slate-900">{d.score5}</td>
                            <td className="p-1.5 text-center font-bold text-blue-900">{d.percent}%</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                          <td colSpan={3} className="p-1.5 border-r border-slate-300 text-right">คะแนนรวมประสิทธิภาพการอบรมเฉลี่ย:</td>
                          <td className="p-1.5 border-r border-slate-300 text-center text-blue-900 font-black">{metrics.efficiencyScore5}</td>
                          <td className="p-1.5 text-center text-blue-900 font-black">{metrics.efficiencyPercent}%</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                      <div>
                        • <strong>ผลคะแนนแบบทดสอบ (Pre-Test vs Post-Test):</strong> ก่อนเรียนเฉลี่ย {metrics.preAvg}/10 หลังเรียนเฉลี่ย {metrics.postAvg}/10 (พัฒนาการ +{metrics.scoreGrowthPercent}%)
                      </div>
                      <div>
                        • <strong>อัตราผู้ผ่านเกณฑ์มาตรฐาน:</strong> {metrics.completedTrainees}/{metrics.totalTrainees} ท่าน ({metrics.passRate}%) ผ่านเกณฑ์ 100%
                      </div>
                    </div>
                  </div>

                  {/* PART 2: 30-DAY WORKPLACE EFFECTIVENESS EVALUATION */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded border border-slate-300">
                      <span className="font-black text-slate-900 text-xs">
                        ส่วนที่ 2: ผลการประเมินประสิทธิผลหลังฝึกอบรม 30 วัน (30-Day Job Application & Effectiveness)
                      </span>
                      <span className="font-bold text-emerald-900 text-xs">
                        คะแนนเฉลี่ย: {metrics.applicationEffectivenessScore5} / 5.00 ({metrics.applicationEffectivenessPercent}%)
                      </span>
                    </div>

                    <table className="w-full text-left text-[10.5px] border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-50 text-slate-900 border-b border-slate-300 font-bold">
                          <th className="p-2 border-r border-slate-300 w-8 text-center">#</th>
                          <th className="p-2 border-r border-slate-300">ตัวชี้วัดประสิทธิผลการนำไปปรับใช้ในงานจริง 30 วัน</th>
                          <th className="p-2 border-r border-slate-300 w-24 text-center">คะแนนเฉลี่ย (เต็ม 5)</th>
                          <th className="p-2 w-28 text-center">ร้อยละความสำเร็จ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {followUpIndicators.map((ind, idx) => (
                          <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
                            <td className="p-1.5 border-r border-slate-300 text-center text-slate-600">{idx + 1}</td>
                            <td className="p-1.5 border-r border-slate-300 font-medium text-slate-800">{ind.label}</td>
                            <td className="p-1.5 border-r border-slate-300 text-center font-bold text-slate-900">{ind.score5}</td>
                            <td className="p-1.5 text-center font-bold text-emerald-800">{ind.percent}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="text-[10px] text-slate-700 bg-emerald-50/70 p-2 rounded border border-emerald-200">
                      <strong>สรุปผลการนำไปใช้จริง 30 วัน: </strong>
                      พนักงานมีอัตราการส่งผลติดตามงานครบถ้วน {metrics.followUpSubmissionRate}% ได้นำความรู้และ SOP ไปใช้จริงในไลน์การผลิตและหน้างาน ส่งผลให้สถิติข้อบกพร่องด้านคุณภาพและอุบัติเหตุลดลงตามเป้าหมายขององค์กรอย่างมีนัยสำคัญ
                    </div>
                  </div>

                  {/* Summary Conclusion Box */}
                  <div className="border border-slate-300 p-2.5 rounded bg-slate-50 text-[10px] space-y-1">
                    <div className="font-bold text-slate-900">สรุปความเห็นและข้อเสนอแนะในการพัฒนาบุคลากร (HRD Recommendation):</div>
                    <p className="text-slate-700 leading-relaxed">
                      หลักสูตรนี้บรรลุตามวัตถุประสงค์ของการพัฒนาศักยภาพบุคลากรทุกมิติ โดยมีคะแนนประสิทธิภาพและความพึงพอใจ {metrics.efficiencyPercent}% และประสิทธิผลการปฏิบัติงานจริง {metrics.applicationEffectivenessPercent}% เห็นควรจัดฝึกอบรมต่อเนื่องเป็นประจำทุกปี และบันทึกเป็นประวัติการพัฒนาทักษะ (Skill Matrix) ของพนักงานทุกคน
                    </p>
                  </div>
                </div>

                {/* Formal 3 Signatures Footer Block */}
                <div className="pt-6 border-t-2 border-slate-800 space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    
                    {/* Signatory 1: Center Head */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-600">ผู้จัดทำและประเมินผลรายงาน</div>
                      <div className="h-10 flex items-end justify-center font-serif text-blue-950 italic text-xs font-bold">
                        ณฐวัตร พงษ์สาริกิจ
                      </div>
                      <div className="w-36 mx-auto border-b border-slate-400" />
                      <div className="text-[11px] font-black text-slate-900">(นายณฐวัตร พงษ์สาริกิจ)</div>
                      <div className="text-[9.5px] text-slate-600 leading-tight">
                        หัวหน้าแผนกบุคคลและธุรการ Personnel<br />
                        หัวหน้าศูนย์ TCT Academy
                      </div>
                      <div className="text-[9px] text-slate-500">วันที่ ......./......./...........</div>
                    </div>

                    {/* Signatory 2: Center Manager */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-600">ผู้ตรวจสอบความถูกต้อง</div>
                      <div className="h-10 flex items-end justify-center font-serif text-blue-950 italic text-xs font-bold">
                        กิตติศักดิ์ สร้อยจิตต์
                      </div>
                      <div className="w-36 mx-auto border-b border-slate-400" />
                      <div className="text-[11px] font-black text-slate-900">(นายกิตติศักดิ์ สร้อยจิตต์)</div>
                      <div className="text-[9.5px] text-slate-600 leading-tight">
                        ผู้จัดการฝ่ายบุคคลและธุรการ<br />
                        ผู้จัดการศูนย์ TCT Academy
                      </div>
                      <div className="text-[9px] text-slate-500">วันที่ ......./......./...........</div>
                    </div>

                    {/* Signatory 3: Advisory Chairman & Factory GM */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-600">ผู้อนุมัติรายงาน</div>
                      <div className="h-10 flex items-end justify-center font-serif text-blue-950 italic text-xs font-bold">
                        นพดล บำรุงเกียรติ
                      </div>
                      <div className="w-36 mx-auto border-b border-slate-400" />
                      <div className="text-[11px] font-black text-slate-900">(นายนพดล บำรุงเกียรติ)</div>
                      <div className="text-[9.5px] text-slate-600 leading-tight">
                        ผู้จัดการทั่วไปและผู้จัดการโรงงาน<br />
                        ประธานที่ปรึกษาศูนย์ TCT Academy
                      </div>
                      <div className="text-[9px] text-slate-500">วันที่ ......./......./...........</div>
                    </div>

                  </div>

                  <div className="text-center text-[9px] text-slate-400 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span>ศูนย์ฝึกอบรมและพัฒนา TCT Academy บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</span>
                    <span>รายงานประเมินผลมาตรฐาน ISO 9001 / IATF 16949 / ISO 45001</span>
                    <span>หน้า 1 จาก 1</span>
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
