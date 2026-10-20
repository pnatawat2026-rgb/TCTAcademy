import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  User, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  Lock, 
  Sparkles,
  FileCheck2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldAlert,
  GraduationCap,
  Users,
  Settings,
  X,
  Calendar,
  Layers,
  Award,
  Bot,
  Activity,
  Cpu,
  Zap
} from 'lucide-react';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';
import { getAllAvailableCourses } from '../utils/courseManager';
import { 
  findEmployeeByEmpId,
  getUserPersistentProgress,
  getAllRegisteredEmployees,
  normalizeStandardPosition,
  verifyEmployeePin,
  hasEmployeeRegisteredPin,
  setEmployeePin
} from '../data/traineeData';
import { sanitizeThaiName } from '../utils/nameSanitizer';
import { ThaiMOOCLogo } from './ThaiMOOCLogo';
import { TCTLogo } from './TCTLogo';

interface LoginViewProps {
  onLogin: (profile: Omit<UserProfile, 'preTestScore' | 'preTestTotal' | 'postTestScore' | 'postTestTotal' | 'postTestAttempts' | 'miniGameScore' | 'completedModules' | 'evaluationSubmitted'>) => void;
  onOpenAdmin: () => void;
  onOpenApprover?: () => void;
  onShowIntro?: () => void;
  onOpenShare?: () => void;
  onOpenTrainingTracker?: () => void;
}

export const PREFIXES = ['นาย', 'นาง', 'น.ส.', 'Mr.', 'Ms.', 'Mrs.'];

export const ALL_TCT_DEPARTMENTS = [
  { code: 'P', name: 'P - Production (ฝ่ายผลิต)', nameEn: 'Production' },
  { code: 'PP', name: 'PP - Production Plan (วางแผนการผลิต)', nameEn: 'Production Plan' },
  { code: 'PS', name: 'PS - Personnel (บุคคล)', nameEn: 'Personnel' },
  { code: 'ESH', name: 'ESH - Environmental Safety and Health (ความปลอดภัย อาชีวอนามัย และสิ่งแวดล้อม)', nameEn: 'Environmental Safety and Health' },
  { code: 'ST', name: 'ST - Setter (เซ็ตเตอร์)', nameEn: 'Setter' },
  { code: 'SEC', name: 'SEC - Single End Cord (เส้นคอร์ดเดี่ยว)', nameEn: 'Single End Cord' },
  { code: 'MN', name: 'MN - Maintenance (ซ่อมบำรุง)', nameEn: 'Maintenance' },
  { code: 'TC', name: 'TC - Technical (ฝ่ายเทคนิค)', nameEn: 'Technical' },
  { code: 'TR', name: 'TR - Test Room (ห้องทดสอบ)', nameEn: 'Test Room' },
  { code: 'QA', name: 'QA - Quality Assurance (ประกันคุณภาพ)', nameEn: 'Quality Assurance' },
  { code: 'FI', name: 'FI - Final Inspection (ตรวจสอบขั้นสุดท้าย)', nameEn: 'Final Inspection' },
  { code: 'TW', name: 'TW - Twisting (ตีเกลียว)', nameEn: 'Twisting' },
  { code: 'RW', name: 'RW - Rewind (กรอเส้นด้าย / รีไวนด์)', nameEn: 'Rewind' }
];

export const POSITIONS = [
  'Worker',
  'Leader',
  'Clerk',
  'Supervisor',
  'Chief',
  'Manager'
];

export const POSITION_OPTIONS_DISPLAY = [
  { id: 'Worker', label: '1. Worker (พนักงานฝ่ายปฏิบัติการ / ฝ่ายผลิต)' },
  { id: 'Leader', label: '2. Leader (หัวหน้ากลุ่ม / หัวหน้ากะ)' },
  { id: 'Clerk', label: '3. Clerk (เจ้าหน้าที่ธุรการ / พนักงานธุรการ)' },
  { id: 'Supervisor', label: '4. Supervisor (หัวหน้างาน)' },
  { id: 'Chief', label: '5. Chief (หัวหน้าแผนก)' },
  { id: 'Manager', label: '6. Manager (ผู้จัดการ)' }
];

export const TCT_DIVISIONS = [
  { id: 'ฝ่ายผลิต', label: 'ฝ่ายผลิต (Production Division)' },
  { id: 'ฝ่ายซ่อมบำรุงและวิศวกรรม', label: 'ฝ่ายซ่อมบำรุงและวิศวกรรม (Maintenance & Engineering Division)' },
  { id: 'ฝ่ายเทคนิคและพัฒนาผลิตภัณฑ์', label: 'ฝ่ายเทคนิคและพัฒนาผลิตภัณฑ์ (Technical & R&D Division)' },
  { id: 'ฝ่ายบุคคลและธุรการ', label: 'ฝ่ายบุคคลและธุรการ (Personnel & Administration Division)' },
  { id: 'ฝ่ายความปลอดภัย อาชีวอนามัย และสิ่งแวดล้อม', label: 'ฝ่ายความปลอดภัยและสิ่งแวดล้อม (ESH Division)' },
  { id: 'ฝ่ายประกันและควบคุมคุณภาพ', label: 'ฝ่ายประกันและควบคุมคุณภาพ (QA & QC Division)' },
  { id: 'ฝ่ายวางแผนและควบคุมการผลิต', label: 'ฝ่ายวางแผนและควบคุมการผลิต (Production Planning Division)' },
  { id: 'ฝ่ายคลังสินค้าและโลจิสติกส์', label: 'ฝ่ายคลังสินค้าและโลจิสติกส์ (Warehouse & Logistics Division)' }
];

const VALID_ADMIN_PINS = [
  '25056', 'TCTADMIN', 'ADMIN2026', 'TCTDEV', 'DEV2026', 
  'DEVELOPER999', 'ADMIN', 'TCT', '1234', '123456', 
  'SECRET', 'SUPERADMIN', 'TEIJIN', 'TCTA001', 'QSRM', 'APM', 'CFM', 'PASSWORD', 'ADMIN1234', 'MASTER'
];

export const LoginView: React.FC<LoginViewProps> = ({ 
  onLogin, 
  onOpenAdmin, 
  onOpenApprover
}) => {
  // Modal states for the 2 buttons
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Employee Form States
  const [empId, setEmpId] = useState('');
  const [prefix, setPrefix] = useState('นาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('P');
  const [position, setPosition] = useState('Worker');
  const [division, setDivision] = useState('ฝ่ายผลิต');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('applied-psychology');
  
  // Security PIN States for Employee
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [hasAccountPin, setHasAccountPin] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [employeeError, setEmployeeError] = useState('');

  // Admin PIN State
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');

  // Auto-detect previous session or stored employee on mount
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('tct_qsrm_learning_state_v1') || sessionStorage.getItem('tct_auth_employee_v2');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u && u.empId) {
          setEmpId(u.empId);
          if (u.fullName) {
            const parts = u.fullName.trim().split(' ');
            if (parts.length >= 2) {
              setFirstName(parts[0]);
              setLastName(parts.slice(1).join(' '));
            } else {
              setFirstName(u.fullName);
            }
          }
          if (u.prefix) setPrefix(u.prefix);
          if (u.department) setDepartment(u.department);
          if (u.position) setPosition(u.position);
          if (u.division) setDivision(u.division);
          setIsExistingUser(true);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // When Employee ID changes, auto-fill recognized info ("ในครั้งแรก ครั้งต่อไปมีข้อมูล")
  const handleEmpIdChange = (val: string) => {
    const clean = val.trim().toUpperCase();
    setEmpId(clean);
    setEmployeeError('');

    if (clean.length >= 3) {
      // 1. Look up in employee database
      const found = findEmployeeByEmpId(clean);
      if (found) {
        if (found.fullName) {
          const parts = found.fullName.trim().split(' ');
          if (parts.length >= 2) {
            setFirstName(parts[0]);
            setLastName(parts.slice(1).join(' '));
          } else {
            setFirstName(found.fullName);
          }
        }
        if (found.prefix) setPrefix(found.prefix);
        if (found.department) setDepartment(found.department);
        if (found.position) setPosition(normalizeStandardPosition(found.position));
        if (found.division) setDivision(found.division);
        setIsExistingUser(true);
        const hasPin = hasEmployeeRegisteredPin(clean);
        setHasAccountPin(hasPin);
        return;
      }

      // 2. Look up in stored user state
      const saved = getUserPersistentProgress(clean);
      if (saved && saved.fullName) {
        const parts = saved.fullName.trim().split(' ');
        if (parts.length >= 2) {
          setFirstName(parts[0]);
          setLastName(parts.slice(1).join(' '));
        } else {
          setFirstName(saved.fullName);
        }
        if (saved.prefix) setPrefix(saved.prefix);
        if (saved.department) setDepartment(saved.department);
        if (saved.position) setPosition(normalizeStandardPosition(saved.position));
        if (saved.division) setDivision(saved.division);
        setIsExistingUser(true);
        const hasPin = hasEmployeeRegisteredPin(clean);
        setHasAccountPin(hasPin);
        return;
      }
    }

    // New employee
    setIsExistingUser(false);
    setHasAccountPin(false);
  };

  // Submit Employee Login
  const handleEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setEmployeeError('');

    const cleanId = empId.trim().toUpperCase();
    const cleanFirst = sanitizeThaiName(firstName.trim());
    const cleanLast = sanitizeThaiName(lastName.trim());

    if (!cleanId) {
      playErrorBuzz();
      setEmployeeError('กรุณากรอกรหัสพนักงาน (Employee ID)');
      return;
    }
    if (!cleanFirst) {
      playErrorBuzz();
      setEmployeeError('กรุณากรอกชื่อพนักงาน (First Name)');
      return;
    }
    if (!cleanLast) {
      playErrorBuzz();
      setEmployeeError('กรุณากรอกนามสกุลพนักงาน (Last Name)');
      return;
    }

    // Check PIN if account has registered PIN
    if (hasAccountPin && pin) {
      const isPinOk = verifyEmployeePin(cleanId, pin);
      if (!isPinOk) {
        playErrorBuzz();
        setEmployeeError('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        return;
      }
    } else if (!hasAccountPin && pin) {
      // First time setting PIN
      if (pin.length >= 4) {
        if (confirmPin && pin !== confirmPin) {
          playErrorBuzz();
          setEmployeeError('รหัส PIN ยืนยันไม่ตรงกัน กรุณาตรวจสอบ');
          return;
        }
        setEmployeePin(cleanId, pin);
      }
    }

    const fullFullName = `${prefix} ${cleanFirst} ${cleanLast}`.trim();
    playSuccessChime();

    onLogin({
      empId: cleanId,
      fullName: fullFullName,
      prefix,
      department,
      position,
      division,
      enrolledAt: new Date().toISOString().split('T')[0],
      selectedCourseId
    });

    setIsEmployeeModalOpen(false);
  };

  // Submit Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const clean = adminPin.trim().toUpperCase();
    if (!clean) {
      playErrorBuzz();
      setAdminError('กรุณากรอกรหัสผ่านสำหรับผู้ดูแลระบบ');
      return;
    }

    const isValid = VALID_ADMIN_PINS.includes(clean);
    if (!isValid) {
      playErrorBuzz();
      setAdminError('รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง กรุณาติดต่อแผนก Personnel');
      return;
    }

    sessionStorage.setItem('tct_admin_auth', 'true');
    sessionStorage.setItem('tct_admin_role', 'admin');
    playSuccessChime();
    setIsAdminModalOpen(false);
    onOpenAdmin();
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-white via-[#FAFBFD] to-[#F1F5F9] text-slate-800 font-sarabun flex flex-col justify-between overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Background AI-Era Subtle Neural Accents & Pure White Holographic Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Ambient Light Cones & Neural AI Halos */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-100/60 via-blue-50/40 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-1/4 -left-28 w-[450px] h-[450px] bg-indigo-50/60 blur-3xl rounded-full" />
        <div className="absolute top-1/3 -right-28 w-[500px] h-[500px] bg-cyan-50/60 blur-3xl rounded-full" />
        
        {/* Clean AI Neural Dot Grid */}
        <div 
          className="w-full h-full opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(14, 165, 233, 0.14) 1.2px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Top Header Bar - Clean AI White Glassmorphism (Larger Logo & Extended Center Name) */}
      <header className="relative z-10 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-3.5 sm:px-8 py-3.5 sm:py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Prominent Large Logo (โลโก้ใหญ่ขึ้น) */}
          <div className="flex items-center min-w-0 shrink">
            <TCTLogo size="lg" theme="light" showSubtitle={true} />
          </div>
          
          {/* Right: AI Badge + Big Long Center Name (อีกด้านชื่อศูนย์ตัวใหญ่ยาว) */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50/90 border border-cyan-200 text-xs font-bold text-cyan-950 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI Learning System Online</span>
            </div>
            <TCTLogo size="lg" variant="lockup" theme="light" showSubtitle={true} />
          </div>
        </div>
      </header>

      {/* Main Fullscreen Hero Section - Optimized for Mobile App & Desktop */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10 text-center max-w-5xl mx-auto w-full space-y-5 sm:space-y-7">
        
        {/* Brand Lockup - AI-Era Luminous White Theme */}
        <div className="space-y-3 sm:space-y-4 animate-fadeIn w-full max-w-3xl mx-auto">
          
          {/* Top AI Sparkle Pill Slogan: เรียนได้ทุกที่ ทุกเวลา เพื่อพัฒนาที่ไม่มีหยุด */}
          <div className="inline-flex items-center gap-2.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white/95 border-2 border-cyan-400/70 shadow-lg shadow-cyan-500/10 backdrop-blur-xl text-blue-950 text-xs sm:text-sm font-extrabold tracking-wide hover:border-cyan-600 transition-all">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-600" />
            </span>
            <Sparkles className="w-4 h-4 text-cyan-600 shrink-0 animate-pulse" />
            <span className="break-words font-sarabun font-black">
              เรียนได้ทุกที่ ทุกเวลา เพื่อพัฒนาที่ไม่มีหยุด
            </span>
          </div>

          {/* 1. Large Bold Title: TCT E-Training (Responsive & AI Styling) */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#002855] tracking-tight leading-tight">
            TCT E-Training
          </h1>

          {/* 2. Subtitle: ระบบฝึกอบรมและพัฒนา ออนไลน์ */}
          <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#004B87] tracking-tight leading-snug">
            ระบบฝึกอบรมและพัฒนา ออนไลน์
          </div>

          {/* 3. Subtitle: ศูนย์ฝึกอบรมและพัฒนา TCT Academy */}
          <div className="space-y-0.5 text-slate-700 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            <p className="font-bold text-slate-900">
              ศูนย์ฝึกอบรมและพัฒนา TCT Academy
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 font-mono tracking-wider">
              (Human Resource Development & Training Center)
            </p>
          </div>

          {/* 4. Company & AI Feature Badges */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold tracking-wider text-[#9A1B1E] uppercase px-3 py-1 rounded-xl bg-red-50 border border-red-200/90 shadow-2xs">
              TEIJIN CORD (THAILAND) CO., LTD.
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-cyan-900 px-3 py-1 rounded-xl bg-cyan-50/80 border border-cyan-200 shadow-2xs">
              <Bot className="w-3.5 h-3.5 text-cyan-600" />
              <span>Next-Gen AI Learning</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-emerald-800 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>เอกสารมาตรฐาน A4 1 ต่อ 1</span>
            </span>
          </div>

        </div>

        {/* 🌟 EXACTLY TWO DISTINCT BUTTONS - MOBILE APP SIZING & DESKTOP BEAUTY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6 w-full max-w-2xl pt-1">
          
          {/* Button 1: สำหรับพนักงาน (Mobile-First Touch Card) */}
          <button
            id="btn-portal-employee"
            type="button"
            onClick={() => {
              playCyberClick();
              setIsEmployeeModalOpen(true);
            }}
            className="group relative p-5 sm:p-7 rounded-3xl bg-white hover:bg-blue-50/40 text-slate-800 border-2 border-blue-300 hover:border-blue-600 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer flex flex-col items-center justify-between text-center space-y-4 hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-[#004B87] to-cyan-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>

            <div className="space-y-1.5 w-full">
              <span className="inline-block text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                EMPLOYEE PORTAL • พนักงาน
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#002855] tracking-tight">
                สำหรับพนักงาน
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                เข้าสู่ระบบเพื่อฝึกอบรม ทำแบบทดสอบ และบันทึกวุฒิบัตร A4 1:1
              </p>
            </div>

            <div className="w-full h-12 sm:h-14 px-4 rounded-2xl bg-[#003366] group-hover:bg-[#002244] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors active:scale-[0.99]">
              <span>แตะเพื่อเข้าสู่ระบบพนักงาน</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Button 2: สำหรับผู้ดูแลระบบ (Mobile-First Touch Card) */}
          <button
            id="btn-portal-admin"
            type="button"
            onClick={() => {
              playCyberClick();
              setIsAdminModalOpen(true);
            }}
            className="group relative p-5 sm:p-7 rounded-3xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-slate-800 shadow-lg hover:shadow-2xl hover:shadow-slate-500/10 transition-all duration-300 cursor-pointer flex flex-col items-center justify-between text-center space-y-4 hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-indigo-950 text-white flex items-center justify-center shadow-md shadow-slate-700/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300" />
            </div>

            <div className="space-y-1.5 w-full">
              <span className="inline-block text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
                ADMIN CONSOLE • ผู้ดูแลระบบ
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                สำหรับผู้ดูแลระบบ
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                จัดการข้อมูลพนักงาน กำหนดช่วงเวลาหลักสูตร และรายงาน A4 1:1
              </p>
            </div>

            <div className="w-full h-12 sm:h-14 px-4 rounded-2xl bg-slate-800 group-hover:bg-slate-950 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors active:scale-[0.99]">
              <span>แตะเพื่อเข้าสู่ระบบผู้ดูแล</span>
              <Lock className="w-4 h-4" />
            </div>
          </button>

        </div>

      </main>

      {/* Footer - Clean AI White Corporate */}
      <footer className="relative z-10 w-full border-t border-slate-200/90 bg-white/95 backdrop-blur-md px-4 py-3.5 text-center text-xs text-slate-600 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2">
          <span className="font-medium">
            © 2026 TEIJIN CORD (THAILAND) CO., LTD. • ศูนย์ฝึกอบรมและพัฒนา TCT Academy
          </span>
          <span className="text-blue-900 font-mono text-[11px] font-semibold">
            Human Resource Development & Training Center
          </span>
        </div>
      </footer>

      {/* =================================================================== */}
      {/* 2. EMPLOYEE LOGIN POPUP MODAL                                       */}
      {/* "จะเด้งเป็นป๊อบอัพให้กรอกรหัสพนักงาน ชื่อ นามสกุล เลือกแผนก/ฝ่าย ตำแหน่ง (ในครั้งแรก ครั้งต่อไปมีข้อมูล)" */}
      {/* =================================================================== */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn text-slate-800">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#002855] via-[#003875] to-[#005A9C] text-white p-5 sm:p-6 relative">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-[11px] font-bold border border-white/20 whitespace-nowrap">
                    <Users className="w-3.5 h-3.5" />
                    <span>เข้าสู่ระบบพนักงาน • TCT E-TRAINING</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight whitespace-nowrap">
                    กรอกข้อมูลพนักงานเพื่อเข้าสู่ระบบ
                  </h3>
                  <p className="text-xs text-blue-100">
                    กรอกครั้งแรกเพื่อลงทะเบียน หรือใส่รหัสพนักงานเดิมเพื่อดึงข้อมูลอัตโนมัติ
                  </p>
                </div>

                <button
                  onClick={() => {
                    playCyberClick();
                    setIsEmployeeModalOpen(false);
                    setEmployeeError('');
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
                  title="ปิด"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {employeeError && (
              <div className="mx-5 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-medium">{employeeError}</span>
              </div>
            )}

            {/* Recognized Badge */}
            {isExistingUser && (
              <div className="mx-5 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold whitespace-nowrap">
                  พบข้อมูลพนักงานในระบบ (ดึงข้อมูลให้ท่านอัตโนมัติเรียบร้อย)
                </span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleEmployeeLogin} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Field 1: Employee ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between whitespace-nowrap">
                  <span>1. รหัสพนักงาน (Employee ID) <span className="text-red-500">*</span></span>
                  <span className="text-[11px] font-normal text-slate-400">ระบุรหัสพนักงาน 4-6 หลัก</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={empId}
                    onChange={(e) => handleEmpIdChange(e.target.value)}
                    placeholder="เช่น 25056 หรือ 1234"
                    className="w-full h-11 px-3.5 pl-10 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white transition-all uppercase"
                    autoFocus
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Field 2 & 3: Prefix, First Name, Last Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                  2. คำนำหน้า, ชื่อ และ นามสกุล <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4 sm:col-span-3">
                    <select
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      className="w-full h-11 px-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white transition-all"
                    >
                      {PREFIXES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-8 sm:col-span-4">
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setEmployeeError('');
                      }}
                      placeholder="ชื่อจริง (ภาษาไทย)"
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white transition-all"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-5">
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setEmployeeError('');
                      }}
                      placeholder="นามสกุล (ภาษาไทย)"
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Field 4: Department & Division */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1 whitespace-nowrap">
                    <Building2 className="w-3.5 h-3.5 text-[#005A9C]" />
                    <span>3. แผนก (Department) <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white transition-all"
                  >
                    {ALL_TCT_DEPARTMENTS.map(d => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1 whitespace-nowrap">
                    <Briefcase className="w-3.5 h-3.5 text-[#005A9C]" />
                    <span>4. ตำแหน่ง (Position) <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white transition-all"
                  >
                    {POSITION_OPTIONS_DISPLAY.map(pos => (
                      <option key={pos.id} value={pos.id}>{pos.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 5: Security PIN (Optional for quick entry, or required if existing) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
                    <KeyRound className="w-3.5 h-3.5 text-[#005A9C]" />
                    <span>รหัส PIN ประจำตัว (4-6 หลัก)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {hasAccountPin ? 'มีรหัสในระบบแล้ว' : 'ตั้งค่ารหัส PIN (ไม่บังคับ)'}
                  </span>
                </div>
                
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder={hasAccountPin ? 'กรอกรหัส PIN ของท่าน' : 'ตั้งรหัส PIN 4 หลัก (เพื่อความปลอดภัย)'}
                    className="w-full h-10 px-3 pr-10 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-[#005A9C] hover:bg-[#004070] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>เข้าสู่ระบบการฝึกอบรม (Enter Learning)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. ADMIN LOGIN POPUP MODAL                                          */}
      {/* =================================================================== */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn text-slate-800">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-purple-950 text-white p-5 sm:p-6 relative">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-purple-300 text-[11px] font-bold border border-white/20 whitespace-nowrap">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ADMINISTRATOR PORTAL</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight whitespace-nowrap">
                    เข้าสู่ระบบสำหรับผู้ดูแลระบบ
                  </h3>
                  <p className="text-xs text-slate-300">
                    แผนก Personnel & ศูนย์ฝึกอบรม TCT Academy
                  </p>
                </div>

                <button
                  onClick={() => {
                    playCyberClick();
                    setIsAdminModalOpen(false);
                    setAdminError('');
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
                  title="ปิด"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Admin Error */}
            {adminError && (
              <div className="mx-5 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-medium">{adminError}</span>
              </div>
            )}

            {/* Admin Form */}
            <form onSubmit={handleAdminLogin} className="p-5 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between whitespace-nowrap">
                  <span>รหัสผ่านความปลอดภัยผู้ดูแลระบบ (Admin Password / PIN) <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={adminPin}
                    onChange={(e) => {
                      setAdminPin(e.target.value);
                      setAdminError('');
                    }}
                    placeholder="กรอกรหัสผ่านผู้ดูแลระบบ"
                    className="w-full h-11 px-3.5 pl-10 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                    autoFocus
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer whitespace-nowrap"
                >
                  <Lock className="w-4 h-4" />
                  <span>เข้าสู่ระบบแอดมิน (Admin Access)</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
