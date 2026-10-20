import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ViewState } from '../types';
import { 
  ShieldCheck, 
  BookOpen, 
  Award, 
  Volume2, 
  VolumeX, 
  LogOut, 
  CheckCircle2, 
  Sparkles, 
  BookA, 
  Compass, 
  LayoutDashboard, 
  Layers, 
  Gamepad2, 
  FileCheck, 
  ChevronDown, 
  Lock, 
  FileText, 
  BarChart3, 
  Menu, 
  X, 
  UserPlus, 
  ArrowLeft,
  User,
  Wrench,
  RotateCcw,
  Home,
  QrCode,
  Share2,
  Search,
  Building2,
  FileSpreadsheet,
  Activity,
  History
} from 'lucide-react';
import { playCyberClick, toggleSound, isSoundEnabled } from '../utils/soundEffects';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { getAllAvailableCourses } from '../utils/courseManager';
import { ThaiMOOCLogo } from './ThaiMOOCLogo';

interface NavbarProps {
  user: UserProfile;
  currentView: ViewState;
  isAdminLoggedIn?: boolean;
  onNavigate: (view: ViewState) => void;
  onSwitchCourse?: (courseId: string) => void;
  onOpenGlossary: () => void;
  onOpenRoadmap: () => void;
  onOpenShare?: () => void;
  onLogout: () => void;
  onResetProgress?: () => void;
  onOpenEditProfile?: () => void;
  onOpenTrainingTracker?: (tab?: 'logs' | 'tracker' | 'my-record') => void;
  onOpenCourseApprovalPdf?: (courseId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  isAdminLoggedIn = false,
  onNavigate,
  onSwitchCourse,
  onOpenGlossary,
  onOpenRoadmap,
  onOpenShare,
  onLogout,
  onResetProgress,
  onOpenEditProfile,
  onOpenTrainingTracker,
  onOpenCourseApprovalPdf
}) => {
  const { t, tName, tDept, language } = useLanguage();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [isDocsDropdownOpen, setIsDocsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const docsDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target as Node)) {
        setIsMenuDropdownOpen(false);
      }
      if (docsDropdownRef.current && !docsDropdownRef.current.contains(event.target as Node)) {
        setIsDocsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    if (newState) playCyberClick();
  };

  const availableCourses = getAllAvailableCourses();
  const courseCount = availableCourses.length;
  const isPreventiveCourse = user.selectedCourseId === 'advanced-preventive-maintenance';

  // Module completion flags
  const hasDonePreTest = user.preTestScore !== null;
  const isMod1Done = user.completedModules.includes(1);
  const isMod2Done = user.completedModules.includes(2);
  const isMod3Done = user.completedModules.includes(3);
  const isMod4Done = isPreventiveCourse ? true : user.completedModules.includes(4);

  // Total Progress Calculation
  let progressPercentage = 0;
  if (user.preTestScore !== null) progressPercentage += 15;
  const totalModCount = isPreventiveCourse ? 3 : 4;
  progressPercentage += Math.round((user.completedModules.length / totalModCount) * 55);
  if (user.miniGameScore > 0) progressPercentage += 10;
  if (user.postTestScore !== null && user.postTestScore >= 8) progressPercentage += 15;
  if (user.evaluationSubmitted) progressPercentage += 5;
  progressPercentage = Math.min(100, progressPercentage);

  const passingScore = user.selectedCourseId === 'personality-psychology' ? 15 : 8;
  const isPassed = user.postTestScore !== null && user.postTestScore !== undefined && user.postTestScore >= passingScore;
  const displayName = tName(user.fullName);

  return (
    <>
      {/* TCT E-Training Top Utility Bar */}
      <div className="bg-[#002855] text-white text-[11px] py-1 px-3 sm:px-4 border-b border-[#003875] no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
            <span className="bg-[#005A9C] text-white font-extrabold px-1.5 sm:px-2 py-0.5 rounded text-[10px] shrink-0 shadow-xs border border-blue-400/30">
              TCT E-TRAINING
            </span>
            <span className="text-blue-100 text-[10px] sm:text-xs truncate">
              ศูนย์ฝึกอบรมและพัฒนา TCT Academy
            </span>
            <span className="text-blue-200 font-semibold text-[10px] sm:text-[11px] truncate hidden md:inline">
              • แผนกบุคคลและธุรการ Personnel • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1 hidden sm:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Real-time Firestore
            </span>
            <LanguageToggle variant="compact" />
          </div>
        </div>
      </div>

      {/* TCT Main Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-2 sm:px-6 py-2 transition-all no-print font-sarabun shadow-xs w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4 min-w-0">
          
          {/* 1. Brand Logo & Back Button (Never Shrinks / Never Overlapped) */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
            <div 
              className="cursor-pointer group flex items-center min-w-0 shrink" 
              onClick={() => { playCyberClick(); onNavigate('courses'); }}
              title="TCT E-Training - ศูนย์ฝึกอบรมและพัฒนา TCT Academy"
            >
              <ThaiMOOCLogo size="sm" showSubtitle={true} theme="light" />
            </div>

            {/* Back to Dashboard Button when deep in activities */}
            {currentView !== 'dashboard' && currentView !== 'courses' && currentView !== 'login' && currentView !== 'welcome' && (
              <button
                id="nav-quick-back-dashboard-btn"
                type="button"
                onClick={() => { playCyberClick(); onNavigate('dashboard'); }}
                className="h-8 px-2 sm:px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#005A9C] border border-blue-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                title="ย้อนกลับสู่แดชบอร์ดบทเรียน"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">แดชบอร์ด</span>
              </button>
            )}
          </div>

          {/* 2. Navigation Links & Tools (Desktop) - Clean & Streamlined */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            
            {/* 1. บทเรียน */}
            <button
              id="nav-lessons-btn"
              type="button"
              onClick={() => { playCyberClick(); onNavigate('dashboard'); }}
              className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                currentView === 'dashboard' || currentView.startsWith('module') || currentView === 'pretest' || currentView === 'posttest'
                  ? 'bg-[#005A9C] text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
              title="เข้าสู่เนื้อหาบทเรียนและทำแบบทดสอบ"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">บทเรียน</span>
            </button>

            {/* 2. ผลการเรียน */}
            {onOpenTrainingTracker ? (
              <button
                id="nav-my-history-btn"
                type="button"
                onClick={() => { playCyberClick(); onOpenTrainingTracker('my-record'); }}
                className="h-9 px-3 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-[#005A9C] border border-blue-200 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs whitespace-nowrap"
                title="ดูประวัติการเข้าเรียนและผลคะแนนสอบทั้งหมดของคุณ"
              >
                <History className="w-4 h-4 shrink-0 text-[#005A9C]" />
                <span className="whitespace-nowrap">ผลการเรียน</span>
              </button>
            ) : (
              <button
                id="nav-my-report-btn"
                type="button"
                onClick={() => { playCyberClick(); onNavigate('report'); }}
                className="h-9 px-3 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-[#005A9C] border border-blue-200 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs whitespace-nowrap"
                title="ดูผลคะแนนการฝึกอบรมของคุณ"
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0 text-[#005A9C]" />
                <span className="whitespace-nowrap">ผลการเรียน</span>
              </button>
            )}

            {/* 3. พิมพ์เกียรติบัตร (เมื่อสอบผ่านแล้ว) */}
            {isPassed && (
              <button
                id="nav-print-cert-direct-btn"
                type="button"
                onClick={() => { playCyberClick(); onNavigate('certificate'); }}
                className="h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-sm shadow-amber-500/20 ring-1 ring-amber-400/50 whitespace-nowrap"
                title="คลิกเพื่อเปิดและพิมพ์ใบประกาศนียบัตร A4"
              >
                <Award className="w-4 h-4 shrink-0 text-slate-950" />
                <span className="whitespace-nowrap">พิมพ์เกียรติบัตร</span>
              </button>
            )}

            {/* 4. ผู้ดูแลระบบ (Admin) */}
            <button
              id="nav-admin-portal-btn"
              type="button"
              onClick={() => { playCyberClick(); onNavigate('admin'); }}
              className={`h-9 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer hidden md:flex items-center gap-1.5 shrink-0 border whitespace-nowrap ${
                currentView === 'admin'
                  ? 'bg-purple-700 text-white border-purple-800 shadow-sm'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200'
              }`}
              title="สำหรับผู้ดูแลระบบ & แผนกบุคคล (Personnel Admin Backoffice)"
            >
              <Lock className={`w-3.5 h-3.5 ${isAdminLoggedIn ? 'text-amber-500' : 'text-purple-600'}`} />
              <span className="whitespace-nowrap">ผู้ดูแลระบบ</span>
            </button>

            {/* User Profile Pill & Dropdown */}
            <div className="relative shrink-0" ref={userDropdownRef}>
              <button
                id="nav-user-profile-btn"
                type="button"
                onClick={() => {
                  playCyberClick();
                  setIsUserDropdownOpen(!isUserDropdownOpen);
                  setIsMenuDropdownOpen(false);
                  setIsDocsDropdownOpen(false);
                }}
                className="h-9 px-2 sm:pl-2 sm:pr-2.5 rounded-lg border text-xs flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shrink-0 bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                title={`${displayName} (คลิกดูข้อมูลส่วนตัว/ออกจากระบบ)`}
              >
                <div className="w-6 h-6 rounded-full bg-[#005A9C] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user.fullName?.substring(0, 1) || 'U'}
                </div>

                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="font-bold max-w-[100px] md:max-w-[120px] truncate text-slate-900">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {user.department ? `แผนก ${user.department}` : `รหัส ${user.empId}`}
                  </span>
                </div>

                <span className="text-[10px] font-bold text-[#005A9C] bg-blue-100/70 px-1 sm:px-1.5 py-0.5 rounded">
                  {progressPercentage}%
                </span>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform hidden sm:inline ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-fadeIn divide-y divide-slate-100 font-sarabun text-xs text-slate-800">
                  {/* User Profile Header */}
                  <div className="p-3 bg-slate-50/80">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#005A9C] text-white flex items-center justify-center font-bold text-sm">
                        {user.fullName?.substring(0, 1) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{displayName}</div>
                        <div className="text-[11px] text-[#005A9C] font-semibold">
                          รหัส: {user.empId} • แผนก: {tDept(user.department)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>ความก้าวหน้าการเรียนรวม</span>
                        <span className="text-[#005A9C] font-bold">{progressPercentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#005A9C] to-emerald-500 rounded-full"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={handleToggleSound}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {soundOn ? <Volume2 className="w-4 h-4 text-[#0072BC]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                        <span>เสียงประกอบ (Sound)</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#0072BC]">{soundOn ? 'เปิด' : 'ปิด'}</span>
                    </button>

                    {onOpenEditProfile && (
                      <button
                        id="nav-edit-profile-btn"
                        type="button"
                        onClick={() => { playCyberClick(); setIsUserDropdownOpen(false); onOpenEditProfile(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-slate-50 cursor-pointer font-medium"
                      >
                        <Wrench className="w-4 h-4 text-[#0072BC]" />
                        <span>แก้ไขข้อมูลส่วนตัว / ชื่อ-สกุล</span>
                      </button>
                    )}

                    {onOpenTrainingTracker && (
                      <button
                        onClick={() => { playCyberClick(); setIsUserDropdownOpen(false); onOpenTrainingTracker('my-record'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-blue-50 text-[#005A9C] cursor-pointer font-medium"
                      >
                        <Activity className="w-4 h-4 text-[#005A9C]" />
                        <span>บันทึกประวัติการอบรมของฉัน (My Logs)</span>
                      </button>
                    )}




                    <button
                      onClick={() => { playCyberClick(); onNavigate('login'); setIsUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-slate-50 text-[#005A9C] cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-[#0072BC]" />
                      <span>สลับผู้เรียน / ลงทะเบียนใหม่</span>
                    </button>

                    {onResetProgress && (
                      <button
                        onClick={() => { playCyberClick(); setIsUserDropdownOpen(false); onResetProgress(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-amber-50 text-amber-700 cursor-pointer font-medium"
                      >
                        <RotateCcw className="w-4 h-4 text-amber-600" />
                        <span>ล้างประวัติเพื่อเรียนใหม่ (Reset)</span>
                      </button>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="p-1">
                    <button
                      onClick={() => { playCyberClick(); setIsUserDropdownOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>ออกจากระบบ (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Drawer Toggle (Phone / Tablet Hamburger Button) */}
            <button
              id="nav-mobile-drawer-btn"
              type="button"
              onClick={() => { playCyberClick(); setIsMobileDrawerOpen(true); }}
              className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="เปิดเมนูทั้งหมด"
              aria-label="เปิดเมนูทั้งหมด"
            >
              <Menu className="w-4 h-4 text-slate-800" />
            </button>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MOBILE SLIDE-OVER DRAWER (FULL MENU ON PHONE & TABLET) */}
      {/* ========================================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sarabun text-slate-800 no-print lg:hidden">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col animate-slideInRight divide-y divide-slate-100">
              
              {/* Drawer Header & Learner Card */}
              <div className="p-4 bg-gradient-to-br from-[#002855] via-[#003875] to-[#005A9C] text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#005A9C] text-white font-extrabold px-2 py-0.5 rounded text-[10px] shadow-xs border border-blue-400/30">
                      TCT E-TRAINING
                    </span>
                    <span className="text-[11px] text-blue-200">เมนูหลัก</span>
                  </div>
                  <button
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                    aria-label="ปิดเมนู"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md text-amber-300 font-extrabold flex items-center justify-center text-lg border border-white/20 shadow-inner shrink-0">
                    {user.fullName?.substring(0, 1) || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-sm truncate">{displayName}</div>
                    <div className="text-[11px] text-blue-200 truncate">
                      รหัส: <strong>{user.empId}</strong> • แผนก: <strong>{tDept(user.department)}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/15">
                  <div className="flex justify-between text-[11px] text-blue-200 mb-1">
                    <span>ความก้าวหน้าการเรียนรวม:</span>
                    <span className="text-amber-300 font-bold">{progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sarabun">
                
                {/* 1. Core Learning & Testing */}
                <div className="space-y-2">
                  <div className="px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    เมนูการเรียนและผลสอบ (Core Menu)
                  </div>

                  <button
                    onClick={() => {
                      playCyberClick();
                      onNavigate('dashboard');
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-colors cursor-pointer ${
                      currentView === 'dashboard' || currentView.startsWith('module') || currentView === 'pretest' || currentView === 'posttest'
                        ? 'bg-blue-50 text-[#005A9C] font-bold border border-blue-200' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <BookOpen className="w-5 h-5 text-[#005A9C] shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-sm">เข้าสู่บทเรียน / ข้อสอบ</div>
                      <div className="text-[11px] text-slate-500">ทำแบบทดสอบและศึกษาเนื้อหา</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      playCyberClick();
                      if (onOpenTrainingTracker) {
                        onOpenTrainingTracker('my-record');
                      } else {
                        onNavigate('report');
                      }
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-[#005A9C] cursor-pointer border border-transparent hover:border-blue-200"
                  >
                    <History className="w-5 h-5 text-[#005A9C] shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-sm">ผลการเรียนและประวัติทั้งหมด</div>
                      <div className="text-[11px] text-slate-500">ดูคะแนน Pre-Test, Post-Test และประวัติการสอบ</div>
                    </div>
                  </button>

                  {isPassed && (
                    <button
                      onClick={() => {
                        playCyberClick();
                        onNavigate('certificate');
                        setIsMobileDrawerOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-amber-500/20 border-2 border-amber-400 text-amber-950 font-bold"
                    >
                      <Award className="w-5 h-5 shrink-0 text-amber-600 animate-bounce" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">พิมพ์เกียรติบัตร (ใบรับรอง)</span>
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                            พร้อมพิมพ์
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          วุฒิบัตรรับรองมาตรฐาน A4 แนวนอน/แนวตั้ง
                        </div>
                      </div>
                    </button>
                  )}
                  {/* Quick Switch User Button in Mobile Drawer */}
                  <button
                    onClick={() => {
                      playCyberClick();
                      setIsMobileDrawerOpen(false);
                      onNavigate('login');
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left bg-blue-50/80 hover:bg-blue-100 text-[#005A9C] cursor-pointer border border-blue-200 font-bold transition-all"
                  >
                    <UserPlus className="w-5 h-5 text-[#005A9C] shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-sm">สลับโปรไฟล์ / สลับผู้เรียน</div>
                      <div className="text-[11px] text-blue-700">เปลี่ยนผู้เข้าเรียน หรือลงทะเบียนรหัสพนักงานใหม่</div>
                    </div>
                  </button>
                </div>

                {/* 2. Profile & Settings */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ข้อมูลส่วนตัวและการจัดการ (Profile & Admin)
                  </div>

                  {onOpenEditProfile && (
                    <button
                      onClick={() => {
                        playCyberClick();
                        onOpenEditProfile();
                        setIsMobileDrawerOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left hover:bg-slate-50 text-slate-700 cursor-pointer"
                    >
                      <Wrench className="w-4 h-4 text-[#005A9C] shrink-0" />
                      <div className="font-semibold">แก้ไขข้อมูลส่วนตัว / ชื่อ-สกุล</div>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      playCyberClick();
                      onNavigate('admin');
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left hover:bg-purple-50 text-purple-900 cursor-pointer font-bold"
                  >
                    <Lock className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div>ผู้ดูแลระบบ & แผนกบุคคล (Admin)</div>
                      <div className="text-[10px] text-slate-500 font-normal">ระบบค้นหาและแก้ไขข้อมูลพนักงาน</div>
                    </div>
                  </button>

                  <button
                    onClick={handleToggleSound}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="flex items-center gap-3 text-slate-700 font-medium">
                      {soundOn ? <Volume2 className="w-4 h-4 text-[#005A9C]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                      <span>เสียงประกอบ (Sound Effects)</span>
                    </span>
                    <span className="text-[11px] font-bold text-[#005A9C]">{soundOn ? 'เปิด' : 'ปิด'}</span>
                  </button>
                </div>

                {/* 3. Logout */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      playCyberClick();
                      setIsMobileDrawerOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer font-bold transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                    <span>ออกจากระบบ (Logout)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MOBILE BOTTOM APP BAR (CLEAN & NON-OVERLAPPING FOR PHONES) */}
      {/* ========================================================================= */}
      <nav 
        aria-label="Mobile Bottom Navigation" 
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-2xl px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] flex items-center justify-around md:hidden no-print"
      >
        {/* 1. Courses Catalog */}
        <button
          type="button"
          onClick={() => { playCyberClick(); onNavigate('courses'); }}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer min-w-[58px] active:scale-95 ${
            currentView === 'courses' ? 'text-[#005A9C] font-extrabold bg-blue-50/80 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${currentView === 'courses' ? 'text-[#005A9C]' : 'text-slate-500'}`} />
          <span className="text-[10px] mt-0.5 font-sarabun font-bold">รายวิชา</span>
        </button>

        {/* 2. Dashboard */}
        <button
          type="button"
          onClick={() => { playCyberClick(); onNavigate('dashboard'); }}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer min-w-[58px] active:scale-95 ${
            currentView === 'dashboard' ? 'text-[#005A9C] font-extrabold bg-blue-50/80 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${currentView === 'dashboard' ? 'text-[#005A9C]' : 'text-slate-500'}`} />
          <span className="text-[10px] mt-0.5 font-sarabun font-bold">แดชบอร์ด</span>
        </button>

        {/* 3. Current Module */}
        <button
          type="button"
          onClick={() => {
            playCyberClick();
            if (currentView.startsWith('module')) {
              // already in module
            } else {
              onNavigate(hasDonePreTest ? 'module1' : 'pretest');
            }
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer min-w-[58px] active:scale-95 ${
            currentView.startsWith('module') || currentView === 'pretest' || currentView === 'posttest' ? 'text-[#005A9C] font-extrabold bg-blue-50/80 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Layers className={`w-5 h-5 ${currentView.startsWith('module') || currentView === 'pretest' ? 'text-[#005A9C]' : 'text-slate-500'}`} />
            {isMod1Done && isMod2Done && isMod3Done && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-sarabun font-bold">บทเรียน</span>
        </button>

        {/* 4. Certificate (when passed) / Learning Report (when learning) */}
        <button
          type="button"
          onClick={() => {
            playCyberClick();
            if (isPassed) {
              onNavigate('certificate');
            } else {
              onNavigate('report');
            }
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer min-w-[58px] active:scale-95 ${
            (isPassed && currentView === 'certificate') || (!isPassed && currentView === 'report') ? 'text-[#005A9C] font-extrabold bg-blue-50/80 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {isPassed ? (
            <Award className="w-5 h-5 text-amber-500 animate-bounce" />
          ) : (
            <FileSpreadsheet className="w-5 h-5 text-slate-500" />
          )}
          <span className="text-[10px] mt-0.5 font-sarabun font-bold">{isPassed ? 'เกียรติบัตร' : 'ผลการเรียน'}</span>
        </button>

        {/* 5. Mobile Menu Trigger */}
        <button
          type="button"
          onClick={() => { playCyberClick(); setIsMobileDrawerOpen(true); }}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer min-w-[58px] text-slate-600 hover:text-slate-900 active:scale-95"
        >
          <Menu className="w-5 h-5 text-slate-700" />
          <span className="text-[10px] mt-0.5 font-sarabun font-bold">เมนู</span>
        </button>
      </nav>
    </>
  );
};

