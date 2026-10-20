import React from 'react';
import { UserProfile, ViewState } from '../types';
import { 
  ShieldCheck, 
  Target, 
  Award, 
  PlayCircle, 
  CheckCircle2, 
  Lock, 
  Gamepad2, 
  FileSpreadsheet, 
  Clock, 
  Check, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  BookOpen,
  RotateCcw,
  Edit3,
  QrCode,
  Share2,
  GraduationCap,
  Activity
} from 'lucide-react';
import { playCyberClick } from '../utils/soundEffects';
import { getAllAvailableCourses, getCourseQuestions, getNextActionView } from '../utils/courseManager';
import { ThaiMOOCLogo } from './ThaiMOOCLogo';
import { DataSecurityBadge } from './DataSecurityBadge';

interface DashboardViewProps {
  user: UserProfile;
  modules?: any[]; // Make optional
  onNavigate: (view: ViewState) => void;
  onOpenRoadmap: () => void;
  onOpenGlossary: () => void;
  onOpenShare?: () => void;
  onResetProgress?: () => void;
  onOpenEditProfile?: () => void;
  onOpenTrainingTracker?: (tab?: 'logs' | 'tracker' | 'my-record' | 'security') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  modules = [], // Default to empty array
  onNavigate,
  onOpenRoadmap,
  onOpenGlossary,
  onOpenShare,
  onResetProgress,
  onOpenEditProfile,
  onOpenTrainingTracker
}) => {
  const allCourses = getAllAvailableCourses();
  const activeCourse = allCourses.find(c => c.id === user.selectedCourseId) || allCourses[0];
  const totalModules = modules.length > 0 ? modules.length : (activeCourse.moduleCount || 4);
  const questions = getCourseQuestions(activeCourse.id);
  const totalQuestions = questions.length || 10;
  const passingScore = activeCourse.passingScore || 8;
  const passingPercent = activeCourse.passingCriteria ? `${activeCourse.passingCriteria}%` : '80%';

  const hasDonePreTest = user.preTestScore !== null;
  const allModulesDone = modules.every((m) => user.completedModules.includes(m.id));
  const hasPassedPostTest = user.postTestScore !== null && user.postTestScore >= passingScore;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 font-sarabun text-slate-800">
      {/* Top Welcome Hero Banner - TCT Royal Navy Theme */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#002855] via-[#003875] to-[#005A9C] text-white p-5 sm:p-9 shadow-xl border border-blue-900/40">
        {/* Subtle decorative wave circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-400/15 via-blue-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 text-[11px] sm:text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="font-medium truncate">TCT E-TRAINING • ศูนย์ฝึกอบรมและพัฒนา TCT ACADEMY</span>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-amber-400 text-slate-900 shadow-xs">
                {activeCourse.code || 'COURSE'}
              </span>
              <span className="text-xs font-medium text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                กำลังศึกษาหลักสูตรนี้ (Active)
              </span>
              <span className="text-xs font-medium text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 hidden sm:inline-block">
                หลักสูตรพัฒนาบุคลากร TCT Academy
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {activeCourse.title}
            </h1>
            <p className="text-xs sm:text-base text-blue-100/90 leading-relaxed">
              {activeCourse.description} • ดำเนินการโดยแผนกบุคคลและธุรการ (Personnel & Admin Department) เทยิน คอร์ด (ประเทศไทย)
            </p>
            
            {/* Learning Schedule and Save Status Notice */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 shadow-xs font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-amber-300">ระบบบันทึกผลการเรียนและคะแนนอัตโนมัติ</div>
                  <div className="text-[11px] text-blue-100">พนักงานสามารถเข้าเรียนต่อจากเดิมได้ทุกอุปกรณ์จนถึงวันที่ <strong>3 กันยายน 2569</strong></div>
                </div>
              </div>
              
              {onOpenShare && (
                <button
                  type="button"
                  onClick={() => { playCyberClick(); onOpenShare(); }}
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                  title="แชร์ลิงก์หรือคิวอาร์โค้ดสำหรับเข้าสู่หลักสูตรนี้"
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-900" />
                  <span>แชร์ / QR Code หลักสูตรนี้</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-xs text-blue-100 pt-1">
              <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/15 text-[11px] sm:text-xs">
                <Clock className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                {activeCourse.duration || `ระยะเวลา: ~${totalModules * 10} นาที`}
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/15 text-[11px] sm:text-xs">
                <Target className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                เกณฑ์ผ่าน: {passingPercent} ({passingScore}/{totalQuestions} ข้อ)
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/15 text-amber-200 text-[11px] sm:text-xs">
                <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                ใบประกาศนียบัตร A4
              </span>
            </div>
          </div>

          {/* User Fast Action Widget (TCT White Card Style) */}
          <div className="bg-white text-slate-800 rounded-2xl p-5 w-full lg:w-76 flex flex-col justify-between shadow-xl border border-slate-150">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-600">สถานะผู้เรียน:</span>
                <div className="flex items-center gap-2">
                  {onOpenEditProfile && (
                    <button
                      id="dash-edit-profile-btn"
                      type="button"
                      onClick={() => { playCyberClick(); onOpenEditProfile(); }}
                      className="text-[11px] text-[#005A9C] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      title="แก้ไขข้อมูลส่วนตัว / ชื่อ-นามสกุล / แผนก"
                    >
                      <Edit3 className="w-3 h-3 text-[#005A9C]" />
                      <span>แก้ไขข้อมูล</span>
                    </button>
                  )}
                  <button
                    onClick={() => { playCyberClick(); onNavigate('login'); }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    title="ลงทะเบียนใหม่ หรือสลับผู้เรียน"
                  >
                    สลับผู้เรียน
                  </button>
                </div>
              </div>
              <div className="font-bold text-slate-900 text-base truncate">{user.fullName}</div>
              <div className="text-xs text-slate-500 font-mono mb-4">
                รหัส: <strong className="text-[#005A9C]">{user.empId}</strong> • แผนก: <strong className="text-slate-700">{user.department}</strong>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              {!hasDonePreTest ? (
                <button
                  id="dash-start-pretest-btn"
                  onClick={() => { playCyberClick(); onNavigate('pretest'); }}
                  className="w-full bg-[#005A9C] hover:bg-[#00487C] text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-900/10 cursor-pointer transition-all whitespace-nowrap"
                >
                  <PlayCircle className="w-4 h-4 text-white shrink-0" />
                  <span className="whitespace-nowrap">เริ่มทำแบบทดสอบก่อนเรียน (Pre-test)</span>
                </button>
              ) : !allModulesDone ? (
                <button
                  id="dash-continue-module-btn"
                  onClick={() => { 
                    playCyberClick(); 
                    const nextMod = modules.find(m => !user.completedModules.includes(m.id))?.id || 1;
                    onNavigate(`module${nextMod}` as ViewState);
                  }}
                  className="w-full bg-[#005A9C] hover:bg-[#00487C] text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-900/10 cursor-pointer transition-all whitespace-nowrap"
                >
                  <BookOpen className="w-4 h-4 text-white shrink-0" />
                  <span className="whitespace-nowrap">เรียนต่อบทที่ {user.completedModules.length + 1}</span>
                </button>
              ) : !hasPassedPostTest ? (
                <button
                  id="dash-start-posttest-btn"
                  onClick={() => { playCyberClick(); onNavigate('posttest'); }}
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-slate-900 text-xs sm:text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer animate-pulse transition-all whitespace-nowrap"
                >
                  <Target className="w-4 h-4 text-slate-900 shrink-0" />
                  <span className="whitespace-nowrap">ทำแบบทดสอบหลังเรียน (Post-test)</span>
                </button>
              ) : (
                <button
                  id="dash-view-cert-btn"
                  onClick={() => { playCyberClick(); onNavigate('certificate'); }}
                  className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs sm:text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer animate-pulse whitespace-nowrap"
                >
                  <Award className="w-4 h-4 text-slate-950 shrink-0" />
                  <span className="whitespace-nowrap">รับใบเกียรติบัตร (A4)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Clean Learning Roadmap */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#005A9C]" />
              <span>เส้นทางการเรียนรู้ 4 ขั้นตอน (TCT Learning Pathway)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบบลำดับขั้นตอน e-Learning เพื่อความเข้าใจสูงสุด: ทดสอบก่อนเรียน &rarr; บทเรียน &rarr; ทดสอบหลังเรียน &rarr; พิมพ์เกียรติบัตร
            </p>
          </div>
          <span className="text-xs font-medium text-[#005A9C] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            เกณฑ์สำเร็จการศึกษา: ผ่าน {passingPercent} ({passingScore}/{totalQuestions} ข้อ)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Step 1: Pre-test */}
          <div 
            onClick={() => { playCyberClick(); onNavigate('pretest'); }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              hasDonePreTest 
                ? 'bg-blue-50/70 border-blue-200 text-blue-950 shadow-xs' 
                : 'bg-white border-slate-200 text-slate-800 hover:border-[#005A9C] hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#005A9C] text-white">Step 01</span>
              {hasDonePreTest ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <PlayCircle className="w-4 h-4 text-[#005A9C] animate-pulse shrink-0" />
              )}
            </div>
            <div className="font-bold text-xs sm:text-sm mb-1 text-slate-900 whitespace-nowrap">Pre-test ({totalQuestions} ข้อ)</div>
            <div className="text-[11px] text-slate-500 whitespace-nowrap truncate">
              {hasDonePreTest ? `คะแนน: ${user.preTestScore}/${totalQuestions} ข้อ` : 'วัดพื้นฐานก่อนเรียน สุ่มช้อยส์'}
            </div>
          </div>

          {/* Step 2: Micro-Modules */}
          <div 
            onClick={() => { 
              if (hasDonePreTest) {
                playCyberClick();
                onNavigate('module1');
              }
            }}
            className={`p-4 rounded-2xl border transition-all ${
              !hasDonePreTest 
                ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed text-slate-400'
                : allModulesDone 
                  ? 'bg-blue-50/70 border-blue-200 text-blue-950 shadow-xs cursor-pointer' 
                  : 'bg-white border-slate-200 text-slate-800 hover:border-[#005A9C] hover:shadow-md cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white">Step 02</span>
              {allModulesDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <span className="text-[11px] font-mono font-bold text-[#005A9C]">{user.completedModules.length}/{totalModules}</span>
              )}
            </div>
            <div className="font-bold text-xs sm:text-sm mb-1 text-slate-900 whitespace-nowrap">บทเรียน ({totalModules} บท)</div>
            <div className="text-[11px] text-slate-500 whitespace-nowrap truncate">
              {allModulesDone ? 'เรียนครบทุกบทเรียนแล้ว' : 'วิดีโอ & สรุปเนื้อหาสำคัญ'}
            </div>
          </div>

          {/* Step 3: Post-test */}
          <div 
            onClick={() => { 
              if (allModulesDone) {
                playCyberClick();
                onNavigate('posttest');
              }
            }}
            className={`p-4 rounded-2xl border transition-all ${
              !allModulesDone 
                ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed text-slate-400'
                : hasPassedPostTest 
                  ? 'bg-blue-50/70 border-blue-200 text-blue-950 shadow-xs cursor-pointer' 
                  : 'bg-white border-slate-200 text-slate-800 hover:border-[#005A9C] hover:shadow-md cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-700 text-white">Step 03</span>
              {hasPassedPostTest ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Target className="w-4 h-4 text-[#005A9C] shrink-0" />
              )}
            </div>
            <div className="font-bold text-xs sm:text-sm mb-1 text-slate-900 whitespace-nowrap">Post-test & แบบประเมิน</div>
            <div className="text-[11px] text-slate-500 whitespace-nowrap truncate">
              {hasPassedPostTest ? `ผ่านเกณฑ์: ${user.postTestScore}/${totalQuestions}` : `เกณฑ์ ${passingPercent} (สุ่มช้อยส์ ก-ง)`}
            </div>
          </div>

          {/* Step 4: Certificate */}
          <div 
            onClick={() => { 
              if (hasPassedPostTest) {
                playCyberClick();
                onNavigate('certificate');
              }
            }}
            className={`p-4 rounded-2xl border transition-all ${
              !hasPassedPostTest 
                ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed text-slate-400'
                : 'bg-amber-50 border-amber-300 text-amber-950 hover:shadow-md cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">Step 04</span>
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
            </div>
            <div className="font-bold text-xs sm:text-sm mb-1 text-slate-900 whitespace-nowrap">พิมพ์เกียรติบัตร (A4)</div>
            <div className="text-[11px] text-slate-500 whitespace-nowrap truncate">
              {hasPassedPostTest ? 'พร้อมพิมพ์ / ดาวน์โหลด PDF A4' : `ปลดล็อคเมื่อผ่าน ${passingPercent}`}
            </div>
          </div>
        </div>
      </div>

      {/* Main Course Modules Grid */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#005A9C]" />
              <span>เนื้อหาบทเรียน e-Training ({totalModules} บทหลัก)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              วิดีโอบรรยายคุณภาพสูง สรุปประเด็นสำคัญ และแบบทดสอบท้ายบท (Quiz) ทันที
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((mod, index) => {
            const isCompleted = user.completedModules.includes(mod.id);
            const isPreviousCompleted = index === 0 ? hasDonePreTest : user.completedModules.includes(mod.id - 1);
            const isCurrentSuggested = !isCompleted && (index === 0 || isPreviousCompleted);

            return (
              <div
                key={mod.id}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                  isCompleted 
                    ? 'border-emerald-300 shadow-xs'
                    : isCurrentSuggested
                      ? 'border-[#005A9C] ring-2 ring-[#005A9C]/20 shadow-md'
                      : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {mod.badge} • ~{mod.durationMinutes} นาที
                    </span>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3.5 h-3.5" /> ผ่านแล้ว
                      </span>
                    ) : isCurrentSuggested ? (
                      <span className="text-xs font-bold text-[#005A9C] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 animate-pulse">
                        แนะนำเรียนตอนนี้
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        พร้อมเข้าเรียน
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-[#005A9C] mb-3 font-semibold">
                    {mod.thaiTitle}
                  </p>

                  <div className="space-y-1.5 mb-4 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                    {mod.summaryPoints.map((pt: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#005A9C] mt-1.5 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id={`open-module-${mod.id}-btn`}
                    onClick={() => {
                      playCyberClick();
                      if (!hasDonePreTest) {
                        onNavigate('pretest');
                      } else if (isCompleted || isPreviousCompleted) {
                        onNavigate(`module${mod.id}` as ViewState);
                      } else {
                        // Navigate to earliest incomplete module
                        const firstIncomplete = modules.find(m => !user.completedModules.includes(m.id))?.id || 1;
                        onNavigate(`module${firstIncomplete}` as ViewState);
                      }
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      isCompleted
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                        : isCurrentSuggested
                          ? 'bg-[#005A9C] hover:bg-[#00487C] text-white shadow-md shadow-blue-900/15'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <span className="whitespace-nowrap">
                      {!hasDonePreTest 
                        ? 'ทำ Pre-test ก่อนเข้าเรียน' 
                        : isCompleted 
                        ? `ทบทวนบทเรียนที่ ${mod.id}` 
                        : isPreviousCompleted
                        ? `เข้าสู่บทเรียนที่ ${mod.id}`
                        : `ยังไม่ปลดล็อค`}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post-Test & Certification Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              OFFICIAL ASSESSMENT & CERTIFICATE
            </span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            แบบทดสอบหลังเรียน (Post-test {totalQuestions} ข้อ) & พิมพ์ใบเกียรติบัตร
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            สุ่มสลับช้อยส์ ก, ข, ค, ง เกณฑ์ผ่าน {passingPercent} ({passingScore}/{totalQuestions} ข้อ) เมื่อสอบผ่านสามารถกดพิมพ์ใบประกาศนียบัตร A4 มาตรฐานได้ทันที
          </p>
          <div className="text-xs text-slate-500 pt-1">
            สถานะปัจจุบัน: <strong className={hasPassedPostTest ? 'text-emerald-600 font-bold' : 'text-slate-700'}>{hasPassedPostTest ? `ผ่านเกณฑ์แล้ว (${user.postTestScore}/${totalQuestions}) - พร้อมพิมพ์ใบรับรอง` : hasDonePreTest ? 'รอทำแบบทดสอบหลังเรียน' : 'ต้องทำ Pre-test และศึกษาบทเรียนก่อน'}</strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
          {hasPassedPostTest ? (
            <>
              <button
                onClick={() => { playCyberClick(); onNavigate('report'); }}
                className="flex-1 sm:flex-initial bg-blue-50 hover:bg-blue-100 text-[#005A9C] border border-blue-200 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>ดูผลการเรียน</span>
              </button>
              <button
                id="dash-view-certificate-btn"
                onClick={() => { playCyberClick(); onNavigate('certificate'); }}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>พิมพ์เกียรติบัตร (ใบรับรอง A4)</span>
              </button>
            </>
          ) : (
            <button
              id="dash-posttest-trigger-btn"
              disabled={!allModulesDone}
              onClick={() => { playCyberClick(); onNavigate('posttest'); }}
              className={`w-full sm:w-auto text-xs font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all ${
                allModulesDone 
                  ? 'bg-[#005A9C] hover:bg-[#00487C] text-white cursor-pointer shadow-md'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>{allModulesDone ? 'เริ่มทำ Post-test' : `ต้องเรียนให้ครบ ${totalModules} บทก่อน`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Employee Confidentiality and Data Protection Security Banner */}
      <div className="rounded-3xl p-5 bg-white border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#005A9C] shrink-0 shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900">นโยบายความลับและความปลอดภัยข้อมูลส่วนบุคคล (Data Privacy & Isolation)</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-blue-50 text-[#005A9C] border border-blue-200 font-bold">
                EMPLOYEE-RESTRICTED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ข้อมูลการเรียน คะแนนสอบ และประวัติทั้งหมดได้รับการแยกเก็บเป็นความลับเฉพาะตัวพนักงาน (รหัส {user.empId}) พนักงานท่านอื่นไม่สามารถดูหรือเข้าถึงข้อมูลของท่านได้
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono font-bold text-[#005A9C] bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 shrink-0">
          ID: {user.empId} • บัญชีส่วนตัวปลอดภัย
        </div>
      </div>

      {/* Official Management, Reports & Back-Office Hub Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold text-[#005A9C] uppercase tracking-wider">
              OFFICIAL REPORTS & MANAGEMENT BACKOFFICE
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              ศูนย์รวมเอกสารทางการและระบบบริหารจัดการ (TCT Management Hub)
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            สามารถพิมพ์และบันทึกเป็นเอกสาร PDF มาตรฐาน หรือส่งออกข้อมูลได้ทันที
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: TCT E-Training Report */}
          <div 
            onClick={() => { playCyberClick(); onNavigate('report'); }}
            className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-purple-300 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  A4 PORTRAIT (แนวตั้ง)
                </span>
                <FileSpreadsheet className="w-5 h-5 text-purple-600 transition-transform" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">รายงานผลการฝึกอบรม TCT E-Training</h3>
              <p className="text-xs text-slate-500 mt-1">
                รายงานผลประเมินสมรรถนะรายบุคคล พร้อมส่งออกเป็น PDF (A4 แนวตั้ง) และ Excel/CSV
              </p>
            </div>
            <div className="text-xs text-purple-700 font-bold flex items-center gap-1 pt-2 border-t border-slate-200">
              <span>เปิดดู / พิมพ์ A4 & ส่งออก Excel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Certificate */}
          <div 
            onClick={() => { 
              if (hasPassedPostTest) {
                playCyberClick(); 
                onNavigate('certificate'); 
              }
            }}
            className={`rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3 ${
              hasPassedPostTest 
                ? 'bg-slate-50 hover:bg-white border border-slate-200 hover:border-amber-300 cursor-pointer hover:scale-[1.01] hover:shadow-md group'
                : 'bg-slate-50/80 border border-slate-200 cursor-not-allowed opacity-75'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  hasPassedPostTest 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {hasPassedPostTest ? '✓ ผ่านเกณฑ์แล้ว พร้อมออกใบประกาศ' : '🔒 ยังไม่ผ่านเกณฑ์: ไม่อนุญาตให้เปิดหรือพิมพ์'}
                </span>
                <Award className={`w-5 h-5 ${hasPassedPostTest ? 'text-amber-500' : 'text-slate-400'} transition-transform`} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">ใบรับรอง TCT E-Training Certificate</h3>
              <p className="text-xs text-slate-500 mt-1">
                {hasPassedPostTest 
                  ? 'ใบประกาศนียบัตร A4 สัดส่วน 16:9, 4:3 หรือ A4 มาตรฐาน ไทย/อังกฤษ พร้อมส่งออก PDF/รูปภาพ' 
                  : 'ระบบควบคุมความปลอดภัย: จะเปิดให้พิมพ์หรือดาวน์โหลดได้เฉพาะผู้ที่สอบผ่านเกณฑ์ Post-Test แล้วเท่านั้น'}
              </p>
            </div>
            <div className={`text-xs font-bold flex items-center gap-1 pt-2 border-t border-slate-200 ${
              hasPassedPostTest ? 'text-amber-700' : 'text-slate-400'
            }`}>
              <span>{hasPassedPostTest ? 'เปิดดู / พิมพ์ใบรับรอง (A4)' : '🔒 ล็อกอยู่ (ต้องสอบผ่าน Post-test ก่อน)'}</span>
              {hasPassedPostTest && <ArrowRight className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Card 3: Executive Summary & Roadmap */}
          <div 
            onClick={() => { playCyberClick(); onNavigate('executive'); }}
            className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#005A9C] border border-blue-200">
                  EXECUTIVE A4 & EXCEL
                </span>
                <TrendingUp className="w-5 h-5 text-[#005A9C] transition-transform" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">รายงานสรุปผู้บริหาร & Roadmap</h3>
              <p className="text-xs text-slate-500 mt-1">
                สรุปผลตอบแทน ROI แผนงาน 4 ระยะ และความพร้อมรายแผนก ส่งออก PDF (A4) และ Excel ได้
              </p>
            </div>
            <div className="text-xs text-[#005A9C] font-bold flex items-center gap-1 pt-2 border-t border-slate-200">
              <span>เปิดดูรายงานผู้บริหาร</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Admin Backoffice */}
          <div 
            onClick={() => { playCyberClick(); onNavigate('admin'); }}
            className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ADMIN PORTAL
                </span>
                <ShieldCheck className="w-5 h-5 text-emerald-600 transition-transform" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">ระบบแอดมิน จัดการข้อมูลผู้เข้าเรียน</h3>
              <p className="text-xs text-slate-500 mt-1">
                ตรวจรายชื่อ ดูผลคะแนน ส่งออก Excel/CSV และพิมพ์รายงาน A4 Batch รวมทุกคน
              </p>
            </div>
            <div className="text-xs text-emerald-700 font-bold flex items-center gap-1 pt-2 border-t border-slate-200">
              <span>เข้าสู่ระบบแอดมิน (Admin Portal)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Enterprise Data Security Badge Banner */}
        <div className="pt-2 flex justify-center sm:justify-end">
          <DataSecurityBadge variant="pill" />
        </div>
      </div>
    </div>
  );
};
