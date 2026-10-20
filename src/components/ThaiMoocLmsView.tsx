import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, ViewState, CourseModule } from '../types';
import { getAllAvailableCourses, getCourseModules, getCourseQuestions, getCourseById } from '../utils/courseManager';
import { ThaiMOOCLogo } from './ThaiMOOCLogo';
import { PreTestView } from './PreTestView';
import { ModuleView } from './ModuleView';
import { MiniGameView } from './MiniGameView';
import { PostTestView } from './PostTestView';
import { EvaluationView } from './EvaluationView';
import { CertificateView } from './CertificateView';
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  Award, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft,
  ArrowRight, 
  ArrowLeft, 
  User, 
  ShieldCheck, 
  Layers, 
  HelpCircle, 
  Check, 
  Zap, 
  RotateCcw, 
  Users, 
  X, 
  QrCode, 
  Share2, 
  Building2, 
  Trophy, 
  GraduationCap, 
  BarChart3, 
  Bell, 
  Info, 
  Menu, 
  PanelLeftClose, 
  PanelLeft, 
  ExternalLink, 
  Activity,
  FileCheck2,
  Lock,
  Gamepad2,
  Calendar,
  FileText,
  Target
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

interface ThaiMoocLmsViewProps {
  user: UserProfile;
  currentUnitView: ViewState;
  onNavigate: (view: ViewState, extra?: { moduleId?: number }) => void;
  onSwitchCourse: (courseId: string) => void;
  onCompletePreTest: (score: number) => Promise<void>;
  onCompleteModule: (moduleId: number) => Promise<void>;
  onSaveMiniGameScore: (score: number) => Promise<void>;
  onCompletePostTest: (score: number) => Promise<void>;
  onSubmitEvaluation: (answers: any) => Promise<void>;
  onOpenRoadmap: () => void;
  onOpenGlossary: () => void;
  onOpenShare: (courseId?: string) => void;
  onResetProgress: (courseId?: string) => void;
  onOpenEditProfile: () => void;
  onOpenTrainingTracker?: (tab?: 'logs' | 'tracker' | 'my-record' | 'security') => void;
  onOpenCourseApprovalPdf?: (courseId?: string) => void;
  isAdminLoggedIn?: boolean;
}

export type ThaiMoocTab = 'courseware' | 'info' | 'progress' | 'announcements';

export const ThaiMoocLmsView: React.FC<ThaiMoocLmsViewProps> = ({
  user,
  currentUnitView,
  onNavigate,
  onSwitchCourse,
  onCompletePreTest,
  onCompleteModule,
  onSaveMiniGameScore,
  onCompletePostTest,
  onSubmitEvaluation,
  onOpenRoadmap,
  onOpenGlossary,
  onOpenShare,
  onResetProgress,
  onOpenEditProfile,
  onOpenTrainingTracker,
  onOpenCourseApprovalPdf,
  isAdminLoggedIn = false
}) => {
  const [activeTab, setActiveTab] = useState<ThaiMoocTab>('courseware');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  const activeCourseId = user.selectedCourseId || 'applied-psychology';
  const allCourses = getAllAvailableCourses();
  const activeCourse = allCourses.find(c => c.id === activeCourseId) || allCourses[0];
  const modules = useMemo(() => getCourseModules(activeCourseId), [activeCourseId]);
  const questions = useMemo(() => getCourseQuestions(activeCourseId), [activeCourseId]);

  const passingScore = activeCourse.passingScore || (activeCourseId === 'personality-psychology' ? 15 : 8);
  const totalQuestions = questions.length || 10;
  const passingPercent = activeCourse.passingCriteria || '80%';

  // Status flags
  const hasDonePreTest = user.preTestScore !== null && user.preTestScore !== undefined;
  const completedModules = user.completedModules || [];
  const allModulesDone = modules.every(m => completedModules.includes(m.id));
  const hasMiniGameScore = (user.miniGameScore || 0) > 0;
  const hasPassedPostTest = user.postTestScore !== null && user.postTestScore !== undefined && user.postTestScore >= passingScore;
  const hasSubmittedEvaluation = Boolean(user.evaluationSubmitted);
  const hasCertificate = Boolean(user.certificateId);

  // Close course dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(e.target as Node)) {
        setIsCourseDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute overall progress percentage in Thai MOOC standard
  const progressPercent = useMemo(() => {
    let score = 0;
    if (hasDonePreTest) score += 15;
    if (modules.length > 0) {
      score += Math.round((completedModules.length / modules.length) * 50);
    }
    if (hasMiniGameScore) score += 5;
    if (hasPassedPostTest) score += 20;
    if (hasSubmittedEvaluation) score += 10;
    return Math.min(100, score);
  }, [hasDonePreTest, completedModules.length, modules.length, hasMiniGameScore, hasPassedPostTest, hasSubmittedEvaluation]);

  // Determine current unit index and next / prev units for linear LMS navigation
  const unitList = useMemo(() => {
    const list: { id: ViewState; title: string; subtitle: string; icon: string; isCompleted: boolean; isActive: boolean; moduleId?: number }[] = [];

    // 1. Pre-test
    list.push({
      id: 'pretest',
      title: 'แบบทดสอบก่อนเรียน (Pre-test)',
      subtitle: hasDonePreTest ? `ได้คะแนน ${user.preTestScore}/${totalQuestions} ข้อ` : 'วัดความรู้พื้นฐานก่อนเรียน',
      icon: 'pretest',
      isCompleted: hasDonePreTest,
      isActive: currentUnitView === 'pretest'
    });

    // 2. Modules
    modules.forEach((mod) => {
      const isDone = completedModules.includes(mod.id);
      list.push({
        id: `module${mod.id}` as ViewState,
        moduleId: mod.id,
        title: `บทที่ ${mod.id}: ${mod.thaiTitle.split('(')[0].trim()}`,
        subtitle: isDone ? 'ผ่านวิดีโอ & Quiz ท้ายบทแล้ว' : 'วิดีโอบรรยาย & แบบฝึกหัดท้ายบท',
        icon: 'module',
        isCompleted: isDone,
        isActive: currentUnitView === `module${mod.id}`
      });
    });

    // 3. Mini-game simulation
    list.push({
      id: 'game',
      title: 'กิจกรรมจำลองสถานการณ์ (Mini-Game)',
      subtitle: hasMiniGameScore ? `คะแนนสูงสุด ${user.miniGameScore} แต้ม` : 'ฝึกวิเคราะห์และตัดสินใจหน้างาน',
      icon: 'game',
      isCompleted: hasMiniGameScore,
      isActive: currentUnitView === 'game'
    });

    // 4. Post-test
    list.push({
      id: 'posttest',
      title: 'แบบทดสอบหลังเรียน (Post-test / Final Exam)',
      subtitle: hasPassedPostTest 
        ? `สอบผ่านแล้ว ${user.postTestScore}/${totalQuestions} ข้อ (${Math.round(((user.postTestScore || 0) / totalQuestions) * 100)}%)` 
        : `เกณฑ์ผ่าน ${passingPercent}`,
      icon: 'posttest',
      isCompleted: hasPassedPostTest,
      isActive: currentUnitView === 'posttest'
    });

    // 5. Evaluation
    list.push({
      id: 'evaluation',
      title: 'แบบประเมินความพึงพอใจ (Evaluation)',
      subtitle: hasSubmittedEvaluation ? 'ส่งแบบประเมินเรียบร้อยแล้ว' : 'ประเมินเพื่อพัฒนาหลักสูตร',
      icon: 'evaluation',
      isCompleted: hasSubmittedEvaluation,
      isActive: currentUnitView === 'evaluation'
    });

    // 6. Certificate
    list.push({
      id: 'certificate',
      title: 'วุฒิบัตรดิจิทัล A4 (Digital Certificate)',
      subtitle: hasCertificate ? `รหัส ${user.certificateId}` : (hasPassedPostTest ? 'พร้อมพิมพ์วุฒิบัตรทางการ' : 'ต้องสอบผ่าน Post-test ก่อน'),
      icon: 'certificate',
      isCompleted: hasCertificate || hasPassedPostTest,
      isActive: currentUnitView === 'certificate'
    });

    return list;
  }, [currentUnitView, hasDonePreTest, user.preTestScore, totalQuestions, modules, completedModules, hasMiniGameScore, user.miniGameScore, hasPassedPostTest, user.postTestScore, passingPercent, hasSubmittedEvaluation, hasCertificate, user.certificateId]);

  const currentUnitIdx = unitList.findIndex(u => u.isActive);
  const prevUnit = currentUnitIdx > 0 ? unitList[currentUnitIdx - 1] : null;
  const nextUnit = currentUnitIdx >= 0 && currentUnitIdx < unitList.length - 1 ? unitList[currentUnitIdx + 1] : null;

  const currentActiveUnit = unitList[currentUnitIdx] || unitList[0];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sarabun m-0 p-0">
      
      {/* 1. Thai MOOC Top Bar & Breadcrumb Navigation */}
      <div className="w-full bg-[#002855] text-white border-b border-[#003875] sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          
          {/* Breadcrumb & Course Selector */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={() => { playCyberClick(); onNavigate('courses'); }}
              className="text-[11px] sm:text-xs text-blue-200 hover:text-white flex items-center gap-1 font-medium transition-colors shrink-0 cursor-pointer"
              title="กลับหน้ารายการหลักสูตรทั้งหมด"
            >
              <ThaiMOOCLogo size="xs" showSubtitle={false} theme="dark" />
              <span className="hidden sm:inline">• คลังรายวิชา</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            
            {/* Course Switcher Dropdown */}
            <div className="relative min-w-0" ref={courseDropdownRef}>
              <button
                type="button"
                onClick={() => { playCyberClick(); setIsCourseDropdownOpen(prev => !prev); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-900/60 hover:bg-blue-800 border border-blue-400/30 text-white text-xs font-bold transition-all truncate cursor-pointer max-w-[220px] sm:max-w-xs md:max-w-sm"
              >
                <span className="bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded text-[10px] font-mono shrink-0">
                  {activeCourse.code || 'COURSE'}
                </span>
                <span className="truncate">{activeCourse.title}</span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              </button>

              {isCourseDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-scaleUp">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase font-mono">
                    สลับหลักสูตรเรียน (TCT Courses)
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {allCourses.map((c) => {
                      const isCur = c.id === activeCourseId;
                      const cProgress = user.coursesProgress?.[c.id];
                      const isPassed = cProgress?.postTestScore && cProgress.postTestScore >= 8;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            playCyberClick();
                            setIsCourseDropdownOpen(false);
                            onSwitchCourse(c.id);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 hover:bg-blue-50 transition-colors cursor-pointer ${
                            isCur ? 'bg-blue-50/80 font-bold text-[#005A9C]' : 'text-slate-700'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-mono text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded mr-1.5 text-slate-600">
                              {c.code}
                            </span>
                            <span>{c.title}</span>
                          </div>
                          {isPassed ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">ผ่านแล้ว</span>
                          ) : isCur ? (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded shrink-0">กำลังเรียน</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-blue-300 shrink-0 hidden sm:inline" />
            <span className="text-xs text-amber-300 font-medium truncate hidden sm:inline">
              {currentActiveUnit?.title || 'บทเรียนออนไลน์'}
            </span>
          </div>

          {/* User & Progress Badge */}
          <div className="flex items-center justify-between md:justify-end gap-3 text-xs shrink-0">
            {/* Progress Gauge */}
            <div className="flex items-center gap-2 bg-blue-950/80 px-3 py-1 rounded-xl border border-blue-400/20">
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-blue-200">ความก้าวหน้าหลักสูตร</span>
                <span className="font-mono font-bold text-emerald-300 text-xs">{progressPercent}% เสร็จสิ้น</span>
              </div>
              <div className="w-16 h-2 bg-blue-900 rounded-full overflow-hidden shrink-0 border border-blue-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Share / Info */}
            <button
              onClick={() => { playCyberClick(); onOpenShare(activeCourseId); }}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              title="แชร์ลิงก์หรือคิวอาร์โค้ดหลักสูตรนี้"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">แชร์ / QR</span>
            </button>
          </div>

        </div>

        {/* 2. Thai MOOC 4 Standard Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1 border-t border-blue-900/60 overflow-x-auto scrollbar-none">
          <button
            onClick={() => { playCyberClick(); setActiveTab('courseware'); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'courseware'
                ? 'border-amber-400 text-amber-300 bg-white/5'
                : 'border-transparent text-blue-100 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>เนื้อหาบทเรียน (Courseware)</span>
          </button>

          <button
            onClick={() => { playCyberClick(); setActiveTab('info'); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-amber-400 text-amber-300 bg-white/5'
                : 'border-transparent text-blue-100 hover:text-white hover:bg-white/5'
            }`}
          >
            <Info className="w-4 h-4 text-cyan-300" />
            <span>ข้อมูลรายวิชา (Course Info)</span>
          </button>

          <button
            onClick={() => { playCyberClick(); setActiveTab('progress'); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'progress'
                ? 'border-amber-400 text-amber-300 bg-white/5'
                : 'border-transparent text-blue-100 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>ความก้าวหน้า & ผลคะแนน (Progress & Grades)</span>
          </button>

          <button
            onClick={() => { playCyberClick(); setActiveTab('announcements'); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'border-amber-400 text-amber-300 bg-white/5'
                : 'border-transparent text-blue-100 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bell className="w-4 h-4 text-yellow-300" />
            <span>ประกาศรายวิชา (Announcements)</span>
          </button>
        </div>
      </div>

      {/* 3. Main Workspace Area */}
      <div className="w-full flex-1 max-w-7xl mx-auto px-2 sm:px-6 py-4 flex flex-col">
        
        {/* ========================================================= */}
        {/* TAB 1: COURSEWARE (The Core Thai MOOC LMS Classroom) */}
        {/* ========================================================= */}
        {activeTab === 'courseware' && (
          <div className="flex flex-col lg:flex-row items-start gap-5 w-full flex-1">
            
            {/* Sidebar Toggle Button for Mobile / Small Screens */}
            <div className="lg:hidden w-full flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => { playCyberClick(); setIsSidebarOpen(prev => !prev); }}
                className="flex items-center gap-2 text-xs font-bold text-[#005A9C] cursor-pointer"
              >
                <Menu className="w-4 h-4" />
                <span>{isSidebarOpen ? 'ซ่อนสารบัญบทเรียน' : 'เปิดดูสารบัญบทเรียน (Syllabus)'}</span>
              </button>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                {currentActiveUnit?.title || ''}
              </span>
            </div>

            {/* Left Sidebar: Thai MOOC Syllabus Outline Tree */}
            <aside className={`w-full lg:w-80 shrink-0 transition-all duration-300 ${
              isSidebarOpen ? 'block' : 'hidden lg:block'
            }`}>
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-28">
                
                {/* Syllabus Header */}
                <div className="bg-[#002855] text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-300" />
                    <div>
                      <h3 className="font-bold text-xs">สารบัญบทเรียน Thai MOOC</h3>
                      <p className="text-[10px] text-blue-200">{activeCourse.code} • {modules.length} บทเรียน</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { playCyberClick(); setIsSidebarOpen(false); }}
                    className="hidden lg:flex p-1 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white cursor-pointer"
                    title="ยุบแถบสารบัญ"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Mini Strip */}
                <div className="bg-blue-50/60 p-3 border-b border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">ความก้าวหน้า:</span>
                  <span className="font-bold text-[#005A9C] font-mono">{progressPercent}% สำเร็จ</span>
                </div>

                {/* Unit List Items */}
                <div className="divide-y divide-slate-100 max-h-[calc(100vh-220px)] overflow-y-auto">
                  {unitList.map((unit, idx) => {
                    const isPassed = unit.isCompleted;
                    const isActive = unit.isActive;

                    return (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => {
                          playCyberClick();
                          onNavigate(unit.id, { moduleId: unit.moduleId });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer group ${
                          isActive 
                            ? 'bg-blue-50/90 border-l-4 border-[#005A9C]' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Status Icon */}
                        <div className="mt-0.5 shrink-0">
                          {isPassed ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : isActive ? (
                            <div className="w-5 h-5 rounded-full bg-[#005A9C] text-white flex items-center justify-center animate-pulse">
                              <PlayCircle className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-mono text-[10px] font-bold">
                              {idx + 1}
                            </div>
                          )}
                        </div>

                        {/* Title & Subtitle */}
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-bold leading-snug ${
                            isActive ? 'text-[#005A9C]' : 'text-slate-800 group-hover:text-[#005A9C]'
                          }`}>
                            {unit.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {unit.subtitle}
                          </div>
                        </div>

                        {/* Chevron Indicator */}
                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-[#005A9C] shrink-0 self-center" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sidebar Footer Support */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>เกณฑ์การสำเร็จ:</span>
                    <strong className="text-emerald-700">{passingPercent}</strong>
                  </div>
                  {onResetProgress && (
                    <button
                      type="button"
                      onClick={() => { playCyberClick(); onResetProgress(activeCourseId); }}
                      className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 flex items-center justify-center gap-1 font-semibold transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>รีเซ็ตประวัติเรียนใหม่</span>
                    </button>
                  )}
                </div>

              </div>
            </aside>

            {/* Main Learning Stage */}
            <main className="flex-1 w-full min-w-0 space-y-4">
              
              {/* Unit Header Banner with Breadcrumbs & Step Indicator */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#002855] text-white">
                      UNIT {currentUnitIdx + 1}/{unitList.length}
                    </span>
                    <span className="text-xs font-semibold text-[#005A9C]">
                      {activeCourse.title}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-extrabold text-slate-900 leading-snug">
                    {currentActiveUnit?.title || 'บทเรียนออนไลน์'}
                  </h2>
                </div>

                {/* Quick Next/Prev Navigation Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {prevUnit && (
                    <button
                      type="button"
                      onClick={() => {
                        playCyberClick();
                        onNavigate(prevUnit.id, { moduleId: prevUnit.moduleId });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title={`ย้อนกลับไป: ${prevUnit.title}`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">บทก่อนหน้า</span>
                    </button>
                  )}

                  {nextUnit && (
                    <button
                      type="button"
                      onClick={() => {
                        playCyberClick();
                        onNavigate(nextUnit.id, { moduleId: nextUnit.moduleId });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#005A9C] hover:bg-[#004070] text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm shadow-blue-900/10"
                      title={`ไปที่: ${nextUnit.title}`}
                    >
                      <span className="hidden sm:inline">บทถัดไป</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* RENDER THE ACTIVE UNIT SEAMLESSLY (No searching or scrolling required!) */}
              <div className="w-full">
                {currentUnitView === 'pretest' && (
                  <PreTestView
                    user={user}
                    questions={questions}
                    onCompletePreTest={onCompletePreTest}
                    onProceedToModule1={() => {
                      playSuccessChime();
                      onNavigate('module1', { moduleId: 1 });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onNavigate={onNavigate}
                  />
                )}

                {currentUnitView.startsWith('module') && (
                  (() => {
                    const modId = parseInt(currentUnitView.replace('module', ''), 10) || 1;
                    const moduleData = modules.find(m => m.id === modId) || modules[0];
                    return (
                      <ModuleView
                        key={`lms-module-${modId}`}
                        module={moduleData}
                        modules={modules}
                        questions={questions}
                        user={user}
                        onCompleteModule={onCompleteModule}
                        onNavigate={(v) => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          onNavigate(v, { moduleId: v.startsWith('module') ? parseInt(v.replace('module', ''), 10) : undefined });
                        }}
                      />
                    );
                  })()
                )}

                {currentUnitView === 'game' && (
                  <MiniGameView
                    user={user}
                    onSaveMiniGameScore={onSaveMiniGameScore}
                    onNavigate={onNavigate}
                  />
                )}

                {currentUnitView === 'posttest' && (
                  <PostTestView
                    user={user}
                    questions={questions}
                    onCompletePostTest={onCompletePostTest}
                    onNavigate={onNavigate}
                  />
                )}

                {currentUnitView === 'evaluation' && (
                  <EvaluationView
                    user={user}
                    onSubmitEvaluation={onSubmitEvaluation}
                    onNavigate={onNavigate}
                  />
                )}

                {currentUnitView === 'certificate' && (
                  <CertificateView
                    user={user}
                    isAdminLoggedIn={isAdminLoggedIn}
                    onNavigate={onNavigate}
                    onOpenEditProfile={onOpenEditProfile}
                  />
                )}
              </div>

              {/* Bottom Sticky Unit Transition Bar */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between gap-3 mt-6">
                <div>
                  {prevUnit ? (
                    <button
                      type="button"
                      onClick={() => {
                        playCyberClick();
                        onNavigate(prevUnit.id, { moduleId: prevUnit.moduleId });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#005A9C] cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{prevUnit.title}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">จุดเริ่มต้นของหลักสูตร</span>
                  )}
                </div>

                <div>
                  {nextUnit ? (
                    <button
                      type="button"
                      onClick={() => {
                        playCyberClick();
                        onNavigate(nextUnit.id, { moduleId: nextUnit.moduleId });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#005A9C] hover:text-[#004070] cursor-pointer"
                    >
                      <span>{nextUnit.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        playCyberClick();
                        onNavigate('courses');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>สำเร็จหลักสูตรทั้งหมดแล้ว</span>
                    </button>
                  )}
                </div>
              </div>

            </main>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: COURSE INFO (Thai MOOC Course Details & Syllabus) */}
        {/* ========================================================= */}
        {activeTab === 'info' && (
          <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-[#002855] via-[#003875] to-[#005A9C] text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-amber-400 text-slate-900 font-mono font-bold text-xs">
                  {activeCourse.code || 'COURSE'}
                </span>
                <span className="text-xs text-blue-200">
                  รายวิชาออนไลน์ TCT Academy x Thai MOOC
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{activeCourse.title}</h1>
              <p className="text-sm text-blue-100/90 leading-relaxed max-w-3xl">
                {activeCourse.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="bg-white/10 p-3 rounded-2xl border border-white/15">
                  <div className="text-blue-200 text-[11px]">ระยะเวลาศึกษา</div>
                  <div className="font-bold text-white text-sm mt-0.5">{activeCourse.duration || '45-60 นาที'}</div>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl border border-white/15">
                  <div className="text-blue-200 text-[11px]">เกณฑ์การสอบผ่าน</div>
                  <div className="font-bold text-emerald-300 text-sm mt-0.5">{passingPercent} ({passingScore}/{totalQuestions} ข้อ)</div>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl border border-white/15">
                  <div className="text-blue-200 text-[11px]">รูปแบบการเรียน</div>
                  <div className="font-bold text-white text-sm mt-0.5">Online Self-Paced 24/7</div>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl border border-white/15">
                  <div className="text-blue-200 text-[11px]">วุฒิบัตร</div>
                  <div className="font-bold text-amber-300 text-sm mt-0.5">Digital E-Certificate</div>
                </div>
              </div>
            </div>

            {/* Course Objectives & Target Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#005A9C]" />
                  <span>วัตถุประสงค์การเรียนรู้ (Course Objectives)</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>เข้าใจและสามารถประยุกต์ใช้หลักการมาตรฐานในงานจริง</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>สามารถวิเคราะห์ แก้ไขปัญหา และป้องกันข้อผิดพลาดหน้างานได้อย่างเป็นระบบ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>ส่งเสริมวัฒนธรรมความปลอดภัย คุณภาพ และความร่วมมือในองค์กร</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#005A9C]" />
                  <span>ผู้รับผิดชอบและทีมผู้สอน (Instructors)</span>
                </h3>
                <div className="text-xs sm:text-sm text-slate-600 space-y-2">
                  <p><strong>หน่วยงานกำกับดูแล:</strong> แผนกบุคคลและธุรการ (Personnel & Administration Department)</p>
                  <p><strong>บริษัท:</strong> บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด (Teijin Cord Thailand Co., Ltd.)</p>
                  <p><strong>หัวหน้าแผนกบุคคลและธุรการ:</strong> นายณฐวัตร พงษ์สาริกิจ (รหัส 25056)</p>
                  <p><strong>มาตรฐาน:</strong> สอดคล้องตามเกณฑ์มาตรฐาน Thai MOOC Platform</p>
                </div>
              </div>
            </div>

            {/* Unit Outline Syllabus */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#005A9C]" />
                <span>โครงสร้างเนื้อหารายวิชา (Course Outline)</span>
              </h3>
              <div className="space-y-3">
                {modules.map((m, i) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-[#005A9C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{m.thaiTitle}</div>
                      <div className="text-xs text-slate-500 mt-1">{m.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PROGRESS & GRADES (Thai MOOC Gradebook) */}
        {/* ========================================================= */}
        {activeTab === 'progress' && (
          <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn">
            {/* Top Grade Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-[#005A9C]" />
                    <span>บันทึกความก้าวหน้าและผลการเรียน (Gradebook)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    ผู้เรียน: <strong>{user.fullName}</strong> (รหัส {user.empId}) • แผนก {user.department}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {hasPassedPostTest ? (
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>ผ่านเกณฑ์การศึกษา (Completed)</span>
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center gap-1.5 border border-blue-300">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>กำลังศึกษา (In Progress)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar Gauge */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">ความก้าวหน้ารวม:</span>
                  <span className="text-[#005A9C] font-mono">{progressPercent}% / 100%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-700 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Detailed Grading Components Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-4">องค์ประกอบการประเมิน (Assessment Item)</th>
                      <th className="py-3 px-4 text-center">สัดส่วน</th>
                      <th className="py-3 px-4 text-center">คะแนนเต็ม</th>
                      <th className="py-3 px-4 text-center">คะแนนที่ได้</th>
                      <th className="py-3 px-4 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sarabun">
                    
                    {/* Pre-test */}
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#005A9C]" />
                        <span>แบบทดสอบก่อนเรียน (Pre-test)</span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500">0% (วัดพื้นฐาน)</td>
                      <td className="py-3 px-4 text-center font-mono">{totalQuestions}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#005A9C]">
                        {hasDonePreTest ? `${user.preTestScore}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {hasDonePreTest ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">เสร็จสิ้น</span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">รอทำ</span>
                        )}
                      </td>
                    </tr>

                    {/* Modules Quizzes */}
                    {modules.map((m) => {
                      const isModDone = completedModules.includes(m.id);
                      return (
                        <tr key={m.id}>
                          <td className="py-3 px-4 text-slate-700 flex items-center gap-2 pl-6">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            <span>บทที่ {m.id}: {m.thaiTitle.split('(')[0].trim()}</span>
                          </td>
                          <td className="py-3 px-4 text-center text-slate-500">ผ่านบทเรียน</td>
                          <td className="py-3 px-4 text-center font-mono">100%</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                            {isModDone ? 'ผ่าน' : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isModDone ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">ผ่านแล้ว</span>
                            ) : (
                              <span className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded">ยังไม่เริ่ม</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Simulation Mini-Game */}
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-purple-600" />
                        <span>กิจกรรมสถานการณ์จำลอง (Mini-Game)</span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500">ทักษะหน้างาน</td>
                      <td className="py-3 px-4 text-center font-mono">1000 แต้ม</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-purple-600">
                        {hasMiniGameScore ? `${user.miniGameScore}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {hasMiniGameScore ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">เสร็จสิ้น</span>
                        ) : (
                          <span className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded">ยังไม่เริ่ม</span>
                        )}
                      </td>
                    </tr>

                    {/* Post-test */}
                    <tr className="bg-blue-50/50 font-bold">
                      <td className="py-3.5 px-4 text-slate-900 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>แบบทดสอบหลังเรียน (Post-test / Final Exam)</span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600">เกณฑ์ 80%</td>
                      <td className="py-3.5 px-4 text-center font-mono">{totalQuestions}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-sm text-[#005A9C]">
                        {user.postTestScore !== null ? `${user.postTestScore} (${Math.round((user.postTestScore / totalQuestions) * 100)}%)` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {hasPassedPostTest ? (
                          <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-bold">ผ่านเกณฑ์</span>
                        ) : user.postTestScore !== null ? (
                          <span className="text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full font-bold">ไม่ผ่านเกณฑ์</span>
                        ) : (
                          <span className="text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full font-bold">รอสอบ</span>
                        )}
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                {hasPassedPostTest ? (
                  <button
                    type="button"
                    onClick={() => { playCyberClick(); onNavigate('certificate'); }}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-105"
                  >
                    <Award className="w-4 h-4" />
                    <span>พิมพ์ใบประกาศนียบัตร A4 (Certificate)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      playCyberClick();
                      setActiveTab('courseware');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#005A9C] hover:bg-[#004070] text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>เข้าสู่บทเรียนต่อ (Continue Learning)</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ANNOUNCEMENTS (Official Course Announcements) */}
        {/* ========================================================= */}
        {activeTab === 'announcements' && (
          <div className="w-full max-w-4xl mx-auto space-y-5 animate-fadeIn">
            
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">ประกาศและข่าวสารจากแผนกบุคคลและธุรการ</h3>
                  <p className="text-xs text-slate-500">ศูนย์ฝึกอบรมและพัฒนา TCT Academy x Thai MOOC</p>
                </div>
              </div>

              {/* Announcement 1 */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#005A9C] bg-blue-100 px-2.5 py-0.5 rounded-full">
                    กำหนดการรอบอบรม
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">12 ตุลาคม 2569</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">
                  เปิดให้เข้าเรียนและทดสอบออนไลน์รอบที่ 1 ถึงวันที่ 3 กันยายน 2569
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  พนักงานบริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด ทุกท่านสามารถเข้าเรียนและทำแบบทดสอบวัดผลผ่านระบบ e-Learning ได้ตลอด 24 ชั่วโมง โดยระบบจะทำการบันทึกผลการเรียนและคะแนนสอบแบบอัตโนมัติลงในฐานข้อมูลกลางของแผนกบุคคล
                </p>
              </div>

              {/* Announcement 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    คำแนะนำการรับวุฒิบัตร
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">12 ตุลาคม 2569</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">
                  เกณฑ์การสำเร็จหลักสูตรและออกใบประกาศนียบัตร A4
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  เมื่อพนักงานทำแบบทดสอบหลังเรียน (Post-test) ผ่านเกณฑ์อย่างน้อย {passingPercent} (หรือ {passingScore}/{totalQuestions} ข้อ) และส่งแบบประเมินความพึงพอใจ จะสามารถดาวน์โหลดและสั่งพิมพ์ใบประกาศนียบัตรทางการ A4 พร้อมลายมือชื่อผู้บริหารและรหัสรับรองได้ทันที
                </p>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
