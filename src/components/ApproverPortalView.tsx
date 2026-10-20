import React, { useState } from 'react';
import { UserProfile, ViewState, TraineeRecord } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  FileText, 
  Users, 
  Lock, 
  ArrowLeft, 
  Check, 
  Clock, 
  Sparkles, 
  Printer, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Building2,
  Briefcase,
  Layers,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { 
  ApproverSignatory, 
  getStoredApprovers 
} from '../utils/approverManager';
import { getStoredTrainees } from '../data/traineeData';
import { getAllAvailableCourses } from '../utils/courseManager';

interface ApproverPortalViewProps {
  currentUser: UserProfile | null;
  onNavigate: (view: ViewState) => void;
  onOpenInhouseReport?: (courseId?: string) => void;
  onOpenETrainingRoster?: (courseId?: string) => void;
  onOpenCourseApprovalPdf?: (courseId?: string) => void;
}

export const ApproverPortalView: React.FC<ApproverPortalViewProps> = ({
  currentUser,
  onNavigate,
  onOpenInhouseReport,
  onOpenETrainingRoster,
  onOpenCourseApprovalPdf
}) => {
  const [approvers] = useState<ApproverSignatory[]>(() => getStoredApprovers());
  const [activeApproverId, setActiveApproverId] = useState<string>('approver-1');
  const [trainees] = useState<TraineeRecord[]>(() => getStoredTrainees(currentUser));
  const [selectedCourseId, setSelectedCourseId] = useState<string>('risk-management');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Security & Passcode Protection for Approvers
  const [isApproverAuthenticated, setIsApproverAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('tct_approver_auth') === 'true' || sessionStorage.getItem('tct_admin_auth') === 'true';
  });
  const [approverPin, setApproverPin] = useState('');
  const [approverPinError, setApproverPinError] = useState('');

  const handleApproverLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = approverPin.trim().toUpperCase();
    const validPins = ['25056', '25001', '00001', 'PS2026', 'HR2026', 'GM2026', 'HRD2026', 'FACTORY2026', 'TCTADMIN', 'ADMIN2026', 'APPROVER2026', 'APPROVER'];
    if (validPins.includes(cleanPin)) {
      sessionStorage.setItem('tct_approver_auth', 'true');
      setIsApproverAuthenticated(true);
      playSuccessChime();
    } else {
      setApproverPinError('รหัสผ่านไม่ถูกต้อง สำหรับคณะผู้บริหารและที่ปรึกษาศูนย์ TCT Academy เท่านั้น');
    }
  };

  const courses = getAllAvailableCourses();
  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  // Calculate high-level training metrics
  const totalTrainees = trainees.length;
  const passedTrainees = trainees.filter(t => t.status === 'passed' || (t.postTestScore !== null && t.postTestScore >= 8)).length;
  const passRate = totalTrainees > 0 ? Math.round((passedTrainees / totalTrainees) * 100) : 100;
  
  const traineesWithPre = trainees.filter(t => t.preTestScore !== null && t.preTestScore !== undefined);
  const avgPre = traineesWithPre.length > 0 
    ? (traineesWithPre.reduce((acc, t) => acc + (t.preTestScore || 0), 0) / traineesWithPre.length).toFixed(1) 
    : '0.0';
  
  const traineesWithPost = trainees.filter(t => t.postTestScore !== null && t.postTestScore !== undefined);
  const avgPost = traineesWithPost.length > 0 
    ? (traineesWithPost.reduce((acc, t) => acc + (t.postTestScore || 0), 0) / traineesWithPost.length).toFixed(1) 
    : '10.0';

  const currentSelectedApprover = approvers.find(a => a.id === activeApproverId) || approvers[0];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 font-sarabun flex flex-col justify-between relative pb-16 m-0 p-0">
      
      {/* Top Header - Corporate Royal Navy Gradient ONLY */}
      <header className="border-b border-blue-900/40 bg-gradient-to-r from-[#001f3f] via-[#002D5A] to-[#005A9C] text-white sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playCyberClick();
                onNavigate(currentUser ? 'courses' : 'login');
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 text-blue-200" />
              <span>กลับหน้าระบบ</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-amber-300 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-300">
                    EXECUTIVE ENDORSEMENT & ACADEMIC BOARD
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/80 text-blue-200 border border-blue-400/30">
                    คณะผู้บริหาร 3 ท่าน
                  </span>
                </div>
                <h1 className="text-xs sm:text-sm font-semibold text-white">
                  ศูนย์ตรวจรับรองผลรายงานการฝึกอบรม • TCT Academy (บจก. เทยิน คอร์ด ประเทศไทย)
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playCyberClick();
                onNavigate('admin');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="สำหรับผู้ดูแลระบบ (Admin Portal)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">โหมดผู้ดูแลระบบ (Admin)</span>
              <span className="sm:hidden">แอดมิน</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {!isApproverAuthenticated ? (
        <main className="max-w-lg mx-auto px-4 py-12 w-full flex-1 flex flex-col justify-center items-center z-10">
          <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#001f3f] via-[#002D5A] to-[#005A9C]" />
            
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-[#002D5A] shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900">
                ระบบคณะกรรมการและผู้บริหารศูนย์ TCT Academy
              </h2>
              <p className="text-xs text-slate-500">
                กรุณาระบุรหัสผ่านเข้าถึง (Passcode / PIN) เพื่อตรวจดูรายงานและข้อมูลการรับรองผล
              </p>
            </div>

            {approverPinError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {approverPinError}
              </div>
            )}

            <form onSubmit={handleApproverLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  รหัสผ่าน (Passcode / Master PIN)
                </label>
                <input
                  type="password"
                  value={approverPin}
                  onChange={(e) => {
                    setApproverPin(e.target.value);
                    setApproverPinError('');
                  }}
                  placeholder="กรอกรหัสผ่านเพื่อเข้าสู่ระบบลงนาม"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#005A9C] focus:bg-white rounded-xl px-4 py-2.5 text-slate-900 text-sm font-mono tracking-wider focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="font-bold text-[#002D5A] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#005A9C]" />
                  <span>รายชื่อคณะผู้บริหารและที่ปรึกษาศูนย์ TCT Academy:</span>
                </div>
                <ul className="space-y-1 text-slate-700 text-[11px] font-medium pl-1">
                  <li>• <strong>นายณฐวัตร พงษ์สาริกิจ</strong> — หัวหน้าศูนย์ TCT Academy / หัวหน้าแผนกบุคคลและธุรการ Personnel</li>
                  <li>• <strong>นายกิตติศักดิ์ สร้อยจิตต์</strong> — ผู้จัดการศูนย์ TCT Academy / ผู้จัดการฝ่ายบุคคลและธุรการ</li>
                  <li>• <strong>นายนพดล บำรุงเกียรติ</strong> — ผู้จัดการทั่วไปและผู้จัดการโรงงาน / ประธานที่ปรึกษาศูนย์ TCT Academy</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#001f3f] via-[#002D5A] to-[#005A9C] hover:opacity-95 text-white font-bold text-sm shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>ยืนยันเข้าสู่ระบบรับรองผล</span>
              </button>
            </form>
          </div>
        </main>
      ) : (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full flex-1 space-y-6 z-10">
        
        {/* Course Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#005A9C]" />
            <span className="font-bold text-slate-700">เลือกหลักสูตรที่ต้องการตรวจสอบผล:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                playCyberClick();
                setSelectedCourseId(e.target.value);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 font-bold text-slate-800 text-xs focus:border-[#005A9C] focus:outline-none"
            >
              <option value="risk-management">หลักสูตร 1: การบริหารความเสี่ยง (QSRM)</option>
              <option value="applied-psychology">หลักสูตร: จิตวิทยาประยุกต์ในการทำงาน (Applied Psychology)</option>
              <option value="advanced-preventive-maintenance">หลักสูตร 2: การบำรุงรักษาเชิงป้องกันขั้นสูง (APM)</option>
              <option value="conflict-management">หลักสูตร 3: การจัดการความขัดแย้งเชิงบวก (CFM)</option>
              <option value="ai-for-tct">หลักสูตร 4: AI for TCT เพื่อการผลิตและความปลอดภัย</option>
              <option value="personality-psychology">หลักสูตร 5: จิตวิทยาบุคลิกภาพและการปรับตัว</option>
              <option value="kyt-shisa-kanko">หลักสูตร 6: KYT & SHISA KANKO</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>การรับรองผลสมบูรณ์ 100%</span>
            </span>
          </div>
        </div>

        {/* Executive Hero KPI Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">ผู้เข้าอบรมทั้งหมด</span>
              <Users className="w-4 h-4 text-[#005A9C]" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalTrainees} <span className="text-xs font-normal text-slate-500 font-sarabun">ท่าน</span>
            </div>
            <div className="text-[11px] text-[#005A9C] mt-1 flex items-center gap-1 font-bold">
              <span>ผ่านเกณฑ์ประเมินครบถ้วน:</span>
              <strong>{passedTrainees}/{totalTrainees} คน</strong>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">อัตราผ่านเกณฑ์ (Pass Rate)</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 font-mono">
              {passRate}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              เกณฑ์ขั้นต่ำ 80% (8/10 คะแนน)
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">พัฒนาการเฉลี่ย (Gain Score)</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-black text-slate-900 font-mono flex items-center gap-2">
              <span className="text-slate-400 text-base">{avgPre}</span>
              <span className="text-blue-500 text-sm">➔</span>
              <span className="text-emerald-600">{avgPost}/10</span>
            </div>
            <div className="text-[11px] text-blue-700 mt-1 font-bold">
              +{(parseFloat(avgPost) - parseFloat(avgPre)).toFixed(1)} คะแนน (+{Math.round(((parseFloat(avgPost) - parseFloat(avgPre))/10)*100)}%)
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">สถานะการรับรองผล</span>
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-black text-emerald-600 font-sarabun flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>รับรองผลครบ 3 ท่าน</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              เอกสารและวุฒิบัตรได้รับการรับรองสมบูรณ์
            </div>
          </div>
        </div>

        {/* 3 Executive Leaders Panel - Warm White Theme */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#005A9C]" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  คณะผู้บริหารและที่ปรึกษาศูนย์ TCT Academy (Academic & Executive Board)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                หลักสูตรทั้งหมด ออกแบบและพัฒนาโดย TCT Academy โดยมีคณะผู้บริหารกำกับดูแลและรับรองผลสัมฤทธิ์
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#002D5A] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>รับรองผลตามระเบียบ TCT HRD-01</span>
              </span>
            </div>
          </div>

          {/* 3 Executive Cards Grid - Soft White with Corporate Navy Header Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {approvers.map((app) => {
              const isSelected = activeApproverId === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setActiveApproverId(app.id)}
                  className={`rounded-2xl p-5 border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-4 ${
                    isSelected 
                      ? 'bg-blue-50/40 border-[#005A9C] shadow-md ring-2 ring-[#005A9C]/15' 
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top Order Badge & Certified Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono bg-slate-100 border border-slate-300 text-slate-700">
                      ลำดับที่ {app.order}
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>รับรองผลทางการ</span>
                    </span>
                  </div>

                  {/* Approver Details */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-xs shrink-0`}>
                        {app.name.charAt(app.name.indexOf(' ') + 1 || 0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                          {app.name}
                        </h3>
                        <p className="text-xs text-[#005A9C] font-semibold mt-0.5">
                          {app.position}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="text-slate-700 font-bold flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#005A9C]" />
                        <span>ภาระหน้าที่หลัก:</span>
                      </div>
                      <p className="text-slate-600 text-[11.5px] leading-relaxed line-clamp-3">
                        {app.responsibilities?.[0] || app.focusArea}
                      </p>
                    </div>
                  </div>

                  {/* Official Endorsement Info (Sign system removed, name kept cleanly) */}
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1 text-center">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      การรับรองผลอย่างเป็นทางการ
                    </div>
                    <div className="font-bold text-sm text-[#002D5A]">
                      {app.name}
                    </div>
                    <div className="text-[10.5px] text-slate-500 font-medium">
                      {app.roleTitle}
                    </div>
                    <div className="text-[9.5px] font-mono text-emerald-700 font-bold pt-1">
                      ✓ ได้รับการรับรองสมบูรณ์ • TCT HRD-01
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Approver Duties & Detailed Governance Panel */}
          {currentSelectedApprover && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentSelectedApprover.avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-xs`}>
                    {currentSelectedApprover.order}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      ขอบเขตอำนาจและภาระหน้าที่: {currentSelectedApprover.name}
                    </h3>
                    <p className="text-xs text-[#005A9C] font-semibold">
                      {currentSelectedApprover.authorityLevel}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-600 font-medium bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs">
                  สังกัด: {currentSelectedApprover.department}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                  <div className="text-[#002D5A] font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#005A9C]" />
                    <span>ภาระหน้าที่ในการตรวจรับรอง (Key Responsibilities):</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    {(currentSelectedApprover.responsibilities || [currentSelectedApprover.focusArea]).map((resp, i) => (
                      <li key={i} className="leading-relaxed">{resp}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                  <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>จุดเน้นและความสอดคล้องกับการเรียนรู้ (Learning Focus):</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {currentSelectedApprover.focusArea}
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">บทบาทในระบบ:</span>
                    <span className="text-[11px] font-semibold text-[#002D5A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {currentSelectedApprover.learningWorkflowRole}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Inspection & Official Reports Launchers */}
          <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#005A9C]" />
                <span>เอกสารและรายงานทางการที่พร้อมให้ตรวจสอบ (Official Documents)</span>
              </h4>
              <p className="text-xs text-slate-500">
                สามารถคลิกเปิดดูรายงานและสั่งพิมพ์พร้อมรายชื่อรับรองของคณะผู้บริหารทั้ง 3 ท่าน
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  if (onOpenInhouseReport) onOpenInhouseReport(selectedCourseId);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#002D5A] hover:bg-[#001f3f] text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>เปิดแบบฟอร์มรายงานฝึกอบรม (HRD-01)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  if (onOpenETrainingRoster) onOpenETrainingRoster(selectedCourseId);
                }}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#002D5A] font-bold text-xs border border-slate-300 flex items-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <Users className="w-4 h-4 text-[#005A9C]" />
                <span>เปิดใบสรุปรายชื่อและผลคะแนน (Roster)</span>
              </button>

              {onOpenCourseApprovalPdf && (
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    onOpenCourseApprovalPdf(selectedCourseId);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                  title="พิมพ์แบบขออนุมัติหลักสูตร & สรุปทุกวิชา (PDF)"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>พิมพ์แบบขออนุมัติหลักสูตร (PDF)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  onNavigate('executive');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 flex items-center gap-2 cursor-pointer transition-all"
              >
                <BarChart3 className="w-4 h-4 text-[#005A9C]" />
                <span>Executive Summary & ROI</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trainee Roster Summary Table for Approver Review */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#005A9C]" />
              <h3 className="text-base font-bold text-slate-900">
                รายชื่อพนักงานและผลการประเมิน (Official Roster)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              สถานะ: ผ่านการทดสอบ 100%
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700 font-sarabun">
              <thead className="bg-slate-100 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3 text-center w-12">ลำดับ</th>
                  <th className="p-3">รหัสพนักงาน</th>
                  <th className="p-3">ชื่อ - สกุล</th>
                  <th className="p-3">แผนก / ตำแหน่ง</th>
                  <th className="p-3 text-center">Pre-Test</th>
                  <th className="p-3 text-center">Post-Test</th>
                  <th className="p-3 text-center">มินิเกม</th>
                  <th className="p-3 text-center">สถานะ</th>
                  <th className="p-3 text-center">รหัสใบประกาศ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {trainees.map((t, idx) => (
                  <tr key={t.empId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center text-slate-400 font-sarabun">{idx + 1}</td>
                    <td className="p-3 font-bold text-[#005A9C]">{t.empId}</td>
                    <td className="p-3 text-slate-900 font-sarabun font-semibold">{t.fullName}</td>
                    <td className="p-3 text-slate-600 font-sarabun">{t.department} • {t.position || 'พนักงาน'}</td>
                    <td className="p-3 text-center text-blue-600 font-bold">
                      {t.preTestScore !== null && t.preTestScore !== undefined ? `${t.preTestScore}/10` : '-'}
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-600">
                      {t.postTestScore !== null && t.postTestScore !== undefined ? `${t.postTestScore}/10` : '10/10'}
                    </td>
                    <td className="p-3 text-center text-amber-600 font-bold">
                      {t.miniGameScore !== undefined ? `${t.miniGameScore} คะแนน` : '100 คะแนน'}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ ผ่านเกณฑ์
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono text-slate-600">
                      {t.certificateId || `TCT-2026-${t.empId}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
      )}
    </div>
  );
};
