import React from 'react';
import { UserProfile, ViewState } from '../types';
import { 
  BookOpen, 
  CheckCircle2, 
  Target, 
  Clock, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  FileSpreadsheet, 
  HelpCircle,
  Sparkles,
  Smartphone,
  Layers,
  GraduationCap
} from 'lucide-react';
import { playCyberClick } from '../utils/soundEffects';
import { getAllAvailableCourses, getCourseModules, getCourseQuestions } from '../utils/courseManager';
import { ThaiMOOCLogo } from './ThaiMOOCLogo';
import { DataSecurityBadge } from './DataSecurityBadge';

interface CourseGuidanceViewProps {
  user: UserProfile;
  onNavigate: (view: ViewState) => void;
}

export const CourseGuidanceView: React.FC<CourseGuidanceViewProps> = ({
  user,
  onNavigate
}) => {
  const allCourses = getAllAvailableCourses();
  const activeCourse = allCourses.find(c => c.id === user.selectedCourseId) || allCourses[0];
  const modules = getCourseModules(activeCourse.id);
  const questions = getCourseQuestions(activeCourse.id);
  const totalModules = modules.length || activeCourse.moduleCount || 4;
  const totalQuestions = questions.length || 10;
  const passingScore = activeCourse.passingScore || 8;
  const passingPercent = activeCourse.passingCriteria ? `${activeCourse.passingCriteria}%` : '80%';

  const hasDonePreTest = user.preTestScore !== null;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 font-sarabun text-slate-800">
      
      {/* 9-Step Employee Flow Stepper */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <GraduationCap className="w-4 h-4 text-[#005A9C]" />
            <span>ลำดับขั้นตอนการเรียนรู้ของพนักงาน (Employee Learning Sequence)</span>
          </div>
          <span className="text-[11px] font-semibold text-[#005A9C] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            ขั้นตอนที่ 4 จาก 9
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 text-center text-[10px] font-semibold">
          {[
            { num: 1, title: 'หน้าแรก', view: 'welcome', active: false, done: true },
            { num: 2, title: 'เข้าสู่ระบบ', view: 'login', active: false, done: true },
            { num: 3, title: 'เลือกวิชา', view: 'courses', active: false, done: true },
            { num: 4, title: 'คำแนะนำ', view: 'guidance', active: true, done: false },
            { num: 5, title: 'เริ่มเรียน', view: 'dashboard', active: false, done: hasDonePreTest },
            { num: 6, title: 'ประเมิน', view: 'evaluation', active: false, done: user.evaluationSubmitted },
            { num: 7, title: 'ผลศักยภาพ', view: 'report', active: false, done: user.postTestScore !== null },
            { num: 8, title: 'ใบรับรอง', view: 'certificate', active: false, done: user.postTestScore !== null && user.postTestScore >= passingScore },
            { num: 9, title: 'ติดตาม 30 วัน', view: 'followup30', active: false, done: false }
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => {
                if (s.done || s.active) {
                  playCyberClick();
                  onNavigate(s.view as ViewState);
                }
              }}
              className={`p-1.5 rounded-xl border transition-all ${
                s.active
                  ? 'bg-[#002855] text-white border-[#002855] shadow-xs'
                  : s.done
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200 cursor-pointer hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-400 border-slate-200 opacity-80'
              }`}
            >
              <div className="text-[9px] font-mono">{s.done ? '✓' : `0${s.num}`}</div>
              <div className="truncate">{s.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Course Header */}
      <div className="rounded-3xl bg-gradient-to-br from-[#002855] via-[#003875] to-[#005A9C] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 text-[11px] sm:text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>คำแนะนำและแนวทางการเรียนรู้ • ศูนย์ฝึกอบรมและพัฒนา TCT Academy • แผนก Personnel</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-amber-400 text-slate-900">
              {activeCourse.code || 'COURSE'}
            </span>
            <span className="text-xs font-medium text-blue-100 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              หลักสูตรฝึกอบรมบุคลากรภายใน TCT
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            {activeCourse.title}
          </h1>

          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-3xl">
            {activeCourse.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-blue-100">
            <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/15">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              {activeCourse.duration || `ระยะเวลา: ~${totalModules * 10} นาที`}
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/15">
              <Layers className="w-3.5 h-3.5 text-cyan-300" />
              {totalModules} บทเรียน e-Training
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/15">
              <Target className="w-3.5 h-3.5 text-emerald-300" />
              เกณฑ์ผ่าน: {passingPercent} ({passingScore}/{totalQuestions} ข้อ)
            </span>
          </div>
        </div>
      </div>

      {/* 4 Essential Guidelines Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Card 1: วัตถุประสงค์ของหลักสูตร */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-[#005A9C]">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-bold">
                <Target className="w-5 h-5 text-[#005A9C]" />
              </div>
              <h2 className="text-base font-bold text-slate-900">1. วัตถุประสงค์ของหลักสูตร</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              เพื่อให้พนักงานมีความรู้ความเข้าใจที่ถูกต้อง สามารถนำหลักการไปประยุกต์ใช้ในการปฏิบัติงานจริงได้อย่างมีประสิทธิภาพ และลดความผิดพลาดหน้างาน:
            </p>
            <ul className="space-y-2 pt-1 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>เข้าใจหลักการและแนวทางปฏิบัติมาตรฐานตามข้อกำหนดของบริษัท</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>สามารถประเมินและตัดสินใจแก้ปัญหาหน้างานได้อย่างปลอดภัยและรวดเร็ว</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>ยกระดับคุณภาพและเพิ่มผลิตภาพในการทำงานร่วมกันในทีมงาน</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Card 2: เกณฑ์การผ่านและออกใบรับรอง */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-amber-700">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-bold">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-base font-bold text-slate-900">2. เกณฑ์การผ่านและการสำเร็จการศึกษา</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              การสำเร็จหลักสูตรและได้รับเอกสารรับรองมาตรฐาน มีเกณฑ์การวัดผลดังนี้:
            </p>
            <div className="space-y-2 pt-1 text-xs text-slate-700">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span>1. ทำแบบทดสอบก่อนเรียน (Pre-test)</span>
                <span className="font-bold text-slate-900">{totalQuestions} ข้อ</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span>2. ศึกษาเนื้อหาและทำ Quiz ให้ครบ</span>
                <span className="font-bold text-[#005A9C]">{totalModules} บทเรียน</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <span className="font-semibold text-amber-950">3. สอบ Post-test ผ่านเกณฑ์</span>
                <span className="font-black text-amber-900">{passingScore}/{totalQuestions} ข้อ ({passingPercent})</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span className="font-semibold text-emerald-950">4. รับใบรับรอง & ใบติดตามผล 30 วัน</span>
                <span className="font-black text-emerald-800">โหลด / พิมพ์ได้ทันที</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: โครงสร้างเนื้อหาบทเรียน */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-[#005A9C]">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5 text-[#005A9C]" />
            </div>
            <h2 className="text-base font-bold text-slate-900">3. โครงสร้างเนื้อหาบทเรียน ({totalModules} บท)</h2>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            {modules.map((m, idx) => (
              <div key={m.id || idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#005A9C] text-white font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 truncate">{m.title}</div>
                  <div className="text-[11px] text-slate-500 truncate">{m.thaiTitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: คำแนะนำและระบบความปลอดภัย */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-700">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">4. ข้อปฏิบัติและการบันทึกผล</h2>
          </div>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#005A9C]" />
                <span>รองรับทุกอุปกรณ์</span>
              </div>
              <p className="text-[11px] text-slate-500">
                สามารถเข้าเรียนได้ผ่านสมาร์ทโฟน แท็บเล็ต หรือคอมพิวเตอร์ประจำส่วนงานได้ตลอดเวลา
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>บันทึกผลอัตโนมัติ (Auto-Save)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                ความก้าวหน้าและคะแนนสอบจะถูกบันทึกอย่างปลอดภัย พนักงานสามารถออกจากระบบและกลับมาเรียนต่อได้เสมอ
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-[#002855]">
              <span className="font-bold">ผู้เรียน: </span>
              <span>{user.fullName} (รหัส {user.empId} • แผนก {user.department})</span>
            </div>
          </div>
        </div>

      </div>

      {/* Action Navigation Buttons (Mobile-Safe, Balanced, Symmetrical) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            playCyberClick();
            onNavigate('courses');
          }}
          className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>&larr; เปลี่ยน / เลือกหลักสูตรอื่น</span>
        </button>

        <button
          id="guidance-start-learning-btn"
          type="button"
          onClick={() => {
            playCyberClick();
            if (hasDonePreTest) {
              onNavigate('dashboard');
            } else {
              onNavigate('pretest');
            }
          }}
          className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-[#005A9C] hover:bg-[#004070] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{hasDonePreTest ? 'รับทราบ และเข้าสู่บทเรียน' : 'รับทราบ และเข้าทำแบบทดสอบก่อนเรียน (Pre-test)'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
