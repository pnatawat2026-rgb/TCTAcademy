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
  Unlock,
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
  Check, 
  HelpCircle, 
  Bot, 
  RefreshCw,
  Phone,
  Send,
  Monitor,
  Save,
  Clock,
  Calendar
} from 'lucide-react';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';
import { getAllAvailableCourses } from '../utils/courseManager';
import { 
  findEmployeeByEmpId, 
  getUserPersistentProgress, 
  normalizeStandardPosition, 
  verifyEmployeePin, 
  hasEmployeeRegisteredPin, 
  setEmployeePin,
  registerNewEmployee,
  PredefinedEmployee
} from '../data/traineeData';
import { MASTER_EMPLOYEE_ROSTER_230, saveMasterEmployeeRecord } from '../data/employeeDatabase';
import { sanitizeThaiName } from '../utils/nameSanitizer';
import { 
  validateEmployeePassword, 
  createPasswordResetRequest,
  isEmployeeUnlockedForReset,
  consumeEmployeeUnlock
} from '../utils/passwordSecurity';
import { 
  checkUserLocationSecurity, 
  GeoLocationResult, 
  isAdminGeoBypassActive 
} from '../utils/geolocationSecurity';
import { GeofenceSecurityModal } from './GeofenceSecurityModal';
import { ThaiMOOCLogo } from './ThaiMOOCLogo';
import { TCTLogo } from './TCTLogo';

interface LoginViewProps {
  onLogin: (profile: Omit<UserProfile, 'preTestScore' | 'preTestTotal' | 'postTestScore' | 'postTestTotal' | 'postTestAttempts' | 'miniGameScore' | 'completedModules' | 'evaluationSubmitted'>) => void;
  onOpenAdmin: () => void;
  onOpenApprover?: () => void;
  onShowIntro?: () => void;
  onOpenShare?: () => void;
  onOpenTrainingTracker?: () => void;
  onOpenCourseApprovalPdf?: (courseId?: string) => void;
  onOpenDesktopIcon?: () => void;
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
  onOpenApprover,
  onOpenCourseApprovalPdf,
  onOpenDesktopIcon
}) => {
  // Geolocation Security States (1 km restriction)
  const [isGeofenceChecking, setIsGeofenceChecking] = useState(false);
  const [geofenceResult, setGeofenceResult] = useState<GeoLocationResult | null>(null);
  const [isGeofenceModalOpen, setIsGeofenceModalOpen] = useState(false);

  // Modal states for the 2 buttons
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [resetSubmittedNotice, setResetSubmittedNotice] = useState(false);

  // Employee Login Multi-Step States:
  // Step 1: Enter Employee ID -> Auto-detect Name & Dept -> Confirm
  // Step 2: Password entry (First time setup with 10-char rule OR returning user password entry)
  // Step 3: First-time profile details entry (Full Name, Position, Department, Division, Years of Service)
  const [loginStep, setLoginStep] = useState<'id_check' | 'password_entry' | 'first_time_profile'>('id_check');
  const [empId, setEmpId] = useState('');
  const [matchedEmployee, setMatchedEmployee] = useState<PredefinedEmployee | null>(null);
  const [employeeError, setEmployeeError] = useState('');

  // Password States
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotContact, setForgotContact] = useState('');

  // First-Time Profile States (ชื่อนามสกุล ตำแหน่ง แผนก ฝ่าย อายุงาน)
  const [profileFullName, setProfileFullName] = useState('');
  const [profilePosition, setProfilePosition] = useState('Worker');
  const [profileDepartment, setProfileDepartment] = useState('P');
  const [profileDivision, setProfileDivision] = useState('ฝ่ายผลิต');
  const [profileTenure, setProfileTenure] = useState('1 ปี');
  const [isUnlockedNotice, setIsUnlockedNotice] = useState(false);

  // Admin PIN State
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');

  // Auto-detect previous session if exists
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('tct_qsrm_learning_state_v1') || sessionStorage.getItem('tct_auth_employee_v2');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u && u.empId) {
          const clean = u.empId.trim().toUpperCase();
          setEmpId(clean);
          const found = findEmployeeByEmpId(clean);
          if (found) {
            setMatchedEmployee(found);
            setIsFirstTimeUser(!hasEmployeeRegisteredPin(clean));
          }
        }
      }
    } catch (e) {}
  }, []);

  // 1. Employee clicks "สำหรับพนักงาน" -> Direct entry to login modal (GPS is applied to confidential courses)
  const handleStartEmployeePortal = () => {
    playCyberClick();
    setIsEmployeeModalOpen(true);
  };

  const handleRecheckLocation = async () => {
    setIsGeofenceChecking(true);
    try {
      const result = await checkUserLocationSecurity();
      setGeofenceResult(result);
      if (result.isAllowed) {
        playSuccessChime();
        setIsGeofenceModalOpen(false);
        setIsEmployeeModalOpen(true);
      } else {
        playErrorBuzz();
      }
    } finally {
      setIsGeofenceChecking(false);
    }
  };

  const handleBypassApproved = () => {
    setIsGeofenceModalOpen(false);
    setIsEmployeeModalOpen(true);
  };

  // 2. Employee ID Change Handler: Instant auto-lookup
  const handleEmpIdChange = (val: string) => {
    const clean = val.trim().toUpperCase();
    setEmpId(clean);
    setEmployeeError('');

    if (clean.length >= 3) {
      const found = findEmployeeByEmpId(clean);
      if (found) {
        setMatchedEmployee(found);
        setIsFirstTimeUser(!hasEmployeeRegisteredPin(found.empId));
        return;
      }
    }
    setMatchedEmployee(null);
  };

  // Step 1: Confirm Employee ID & Name
  const handleConfirmIdentityAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setEmployeeError('');

    const clean = empId.trim().toUpperCase();
    if (!clean) {
      playErrorBuzz();
      setEmployeeError('กรุณากรอกรหัสพนักงาน (5 หลัก)');
      return;
    }

    const found = findEmployeeByEmpId(clean);
    if (!found) {
      playErrorBuzz();
      setEmployeeError(`ไม่พบรหัสพนักงาน "${clean}" ในฐานข้อมูลบริษัท กรุณาตรวจสอบรหัสพนักงานของท่าน`);
      return;
    }

    playSuccessChime();
    setMatchedEmployee(found);
    const hasPin = hasEmployeeRegisteredPin(found.empId);
    const isUnlocked = isEmployeeUnlockedForReset(found.empId);
    setIsUnlockedNotice(isUnlocked);
    setIsFirstTimeUser(!hasPin || isUnlocked);
    setPassword('');
    setConfirmPassword('');

    // Pre-populate profile values for first-time onboarding
    const finalFullName = found.fullName || `${found.prefix || 'นาย'} ${found.firstName || ''} ${found.lastName || ''}`.trim();
    setProfileFullName(finalFullName);
    setProfilePosition(found.position ? normalizeStandardPosition(found.position) : 'Worker');
    setProfileDepartment(found.department || 'P');
    setProfileDivision(found.division || 'ฝ่ายผลิต');
    setProfileTenure(found.yearsOfService || found.tenure || '1 ปี');

    setLoginStep('password_entry');
  };

  // Real-time password validation evaluation for first-time user
  const passwordRules = validateEmployeePassword(matchedEmployee?.empId || empId, password);

  // Step 2: Submit Password
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmployeeError('');

    if (!matchedEmployee) {
      setLoginStep('id_check');
      return;
    }

    const cleanId = matchedEmployee.empId.trim().toUpperCase();

    // Case A: First Time Setup (Enforce 10-char policy: 5 digits empId + 5 chars with letter, number, special char)
    if (isFirstTimeUser) {
      if (!passwordRules.isValid) {
        playErrorBuzz();
        setEmployeeError(passwordRules.errors[0] || 'รหัสผ่านไม่ถูกต้องตามเกณฑ์ความปลอดภัย');
        return;
      }
      if (password !== confirmPassword) {
        playErrorBuzz();
        setEmployeeError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบ');
        return;
      }

      // Save new PIN/Password
      setEmployeePin(cleanId, password);
      consumeEmployeeUnlock(cleanId);
      setIsUnlockedNotice(false);
      playSuccessChime();

      // Immediately transition to profile information record step (ชื่อนามสกุล ตำแหน่ง แผนก ฝ่าย อายุงาน)
      setLoginStep('first_time_profile');
      return;
    } else {
      // Case B: Returning User Login
      const isValid = verifyEmployeePin(cleanId, password);
      if (!isValid) {
        playErrorBuzz();
        setEmployeeError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง หรือกด "ลืมรหัสผ่าน" เพื่อแจ้งแอดมิน');
        return;
      }
      playSuccessChime();
    }

    // Returning user logs in directly
    const finalFullName = matchedEmployee.fullName || `${matchedEmployee.prefix || 'นาย'} ${matchedEmployee.firstName || ''} ${matchedEmployee.lastName || ''}`.trim();

    onLogin({
      empId: cleanId,
      fullName: finalFullName,
      prefix: matchedEmployee.prefix || 'นาย',
      department: matchedEmployee.department || 'P',
      position: matchedEmployee.position ? normalizeStandardPosition(matchedEmployee.position) : 'Worker',
      division: matchedEmployee.division || 'ฝ่ายผลิต',
      yearsOfService: matchedEmployee.yearsOfService || matchedEmployee.tenure || '1 ปี',
      tenure: matchedEmployee.yearsOfService || matchedEmployee.tenure || '1 ปี',
      enrolledAt: new Date().toISOString().split('T')[0],
      selectedCourseId: 'applied-psychology'
    });

    setIsEmployeeModalOpen(false);
  };

  // Step 3: First-time User Profile Submit (ชื่อนามสกุล ตำแหน่ง แผนก ฝ่าย อายุงาน)
  const handleFirstTimeProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmployeeError('');

    if (!matchedEmployee) {
      setLoginStep('id_check');
      return;
    }

    const cleanId = matchedEmployee.empId.trim().toUpperCase();
    const cleanName = profileFullName.trim();
    if (!cleanName) {
      playErrorBuzz();
      setEmployeeError('กรุณากรอกชื่อและนามสกุลพนักงาน');
      return;
    }

    const cleanTenure = profileTenure.trim() || '1 ปี';
    const normPosition = normalizeStandardPosition(profilePosition);
    const sanitized = sanitizeThaiName({
      prefix: matchedEmployee.prefix || 'นาย',
      fullName: cleanName
    });

    // Save permanently into protected Master Employee Registry
    saveMasterEmployeeRecord({
      empId: cleanId,
      fullName: sanitized.fullName,
      prefix: sanitized.prefix,
      firstName: sanitized.firstName,
      lastName: sanitized.lastName,
      department: profileDepartment,
      division: profileDivision,
      position: normPosition,
      yearsOfService: cleanTenure,
      tenure: cleanTenure,
      isMasterRecord: true
    });

    // Also register in trainees roster
    registerNewEmployee({
      empId: cleanId,
      fullName: sanitized.fullName,
      prefix: sanitized.prefix,
      firstName: sanitized.firstName,
      lastName: sanitized.lastName,
      department: profileDepartment,
      division: profileDivision,
      position: normPosition,
      yearsOfService: cleanTenure,
      tenure: cleanTenure
    });

    playSuccessChime();

    onLogin({
      empId: cleanId,
      fullName: cleanName,
      prefix: matchedEmployee.prefix || 'นาย',
      department: profileDepartment,
      position: normPosition,
      division: profileDivision,
      yearsOfService: cleanTenure,
      tenure: cleanTenure,
      enrolledAt: new Date().toISOString().split('T')[0],
      selectedCourseId: 'applied-psychology'
    });

    setIsEmployeeModalOpen(false);
  };

  // Submit Forgot Password Request to Admin
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedEmployee && !empId) return;

    const cleanId = (matchedEmployee?.empId || empId).trim().toUpperCase();
    const name = matchedEmployee?.fullName || cleanId;
    const dept = matchedEmployee?.department || 'P';

    createPasswordResetRequest({
      empId: cleanId,
      fullName: name,
      department: dept,
      position: matchedEmployee?.position,
      phoneOrContact: forgotContact.trim() || undefined
    });

    playSuccessChime();
    setResetSubmittedNotice(true);
    setTimeout(() => {
      setResetSubmittedNotice(false);
      setIsForgotPasswordModalOpen(false);
    }, 4000);
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
      setAdminError('รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง');
      return;
    }

    playSuccessChime();
    setIsAdminModalOpen(false);
    sessionStorage.setItem('tct_admin_auth', 'true');
    onOpenAdmin();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sarabun text-slate-800 antialiased relative overflow-hidden select-none">
      
      {/* Geofence Security Restriction Modal */}
      <GeofenceSecurityModal
        isOpen={isGeofenceModalOpen}
        locationResult={geofenceResult}
        isChecking={isGeofenceChecking}
        onRecheck={handleRecheckLocation}
        onBypassApproved={handleBypassApproved}
        onClose={() => setIsGeofenceModalOpen(false)}
      />

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-100/60 via-blue-50/40 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-1/4 -left-28 w-[450px] h-[450px] bg-indigo-50/60 blur-3xl rounded-full" />
        <div className="absolute top-1/3 -right-28 w-[500px] h-[500px] bg-cyan-50/60 blur-3xl rounded-full" />
        
        <div 
          className="w-full h-full opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(14, 165, 233, 0.14) 1.2px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-center md:justify-between gap-3 sm:gap-6">
          
          {/* Centered Large Logo on Mobile; Standard lockup on Desktop */}
          <div className="flex items-center justify-center w-full md:w-auto">
            <TCTLogo size="md" theme="light" showSubtitle={true} variant="lockup" />
          </div>

          {/* Right: Organization & HRD Titles (Desktop Only) */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <div className="text-right">
              <div className="text-xs font-extrabold text-slate-800">
                ศูนย์ฝึกอบรมและพัฒนา TCT Academy
              </div>
              <div className="text-[10px] text-slate-500">
                แผนกบุคคลและธุรการ • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-8 text-center max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">
        
        <div className="space-y-2 sm:space-y-3 animate-fadeIn w-full max-w-2xl mx-auto">
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            TCT E-Training
          </h1>

          <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            ระบบฝึกอบรมและพัฒนา ออนไลน์
          </div>

          <div className="space-y-0.5 text-slate-700 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed pt-1">
            <p className="font-bold text-slate-800">
              ศูนย์ฝึกอบรมและพัฒนา TCT Academy
            </p>
            <p className="text-xs text-slate-500 font-mono">
              (Human Resource Development & Training Center) • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
            </p>
          </div>

          {/* Security & System Highlights (Clean & Quiet) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 px-3 py-1 rounded-lg bg-white border border-slate-300 shadow-2xs">
              TEIJIN CORD (THAILAND) CO., LTD.
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 px-3 py-1 rounded-lg bg-white border border-slate-300 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>ความปลอดภัยพื้นที่บริษัท & รหัสผ่าน 10 หลัก</span>
            </span>
          </div>

        </div>

        {/* Action Buttons: Clean White Cards with Slate/Dark Gray CTA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl pt-2">
          
          {/* Button 1: สำหรับพนักงาน */}
          <button
            id="btn-portal-employee"
            type="button"
            onClick={handleStartEmployeePortal}
            disabled={isGeofenceChecking}
            className="group relative p-5 sm:p-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-between text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs">
              {isGeofenceChecking ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Users className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1 w-full">
              <span className="inline-block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                EMPLOYEE PORTAL • พนักงาน
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                สำหรับพนักงาน
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                ใช้รหัสพนักงานเพื่อตรวจชื่อตนเอง และใส่รหัสผ่านเข้าฝึกอบรม
              </p>
            </div>

            <div className="w-full h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors">
              <span>{isGeofenceChecking ? 'กำลังตรวจสอบพิกัด GPS...' : 'เข้าสู่ระบบพนักงาน'}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Button 2: สำหรับผู้ดูแลระบบ */}
          <button
            id="btn-portal-admin"
            type="button"
            onClick={() => {
              playCyberClick();
              setIsAdminModalOpen(true);
            }}
            className="group relative p-5 sm:p-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-between text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-7 h-7 text-amber-300" />
            </div>

            <div className="space-y-1 w-full">
              <span className="inline-block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                ADMIN CONSOLE • ผู้ดูแลระบบ
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                สำหรับผู้ดูแลระบบ
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                จัดการรหัสผ่านพนักงาน คำขอรีเซ็ตรหัส และผลการอบรม
              </p>
            </div>

            <div className="w-full h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors">
              <span>เข้าสู่ระบบผู้ดูแล</span>
              <Lock className="w-4 h-4" />
            </div>
          </button>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-200/90 bg-white/95 backdrop-blur-md px-4 py-3.5 text-center text-xs text-slate-600 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-medium">
              © 2026 TEIJIN CORD (THAILAND) CO., LTD. • ศูนย์ฝึกอบรมและพัฒนา TCT Academy
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              • Internal Training Platform
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-force-refresh-cache"
              type="button"
              onClick={async () => {
                const { forceHardRefreshAndPurgeCache } = await import('../utils/appVersionManager');
                forceHardRefreshAndPurgeCache();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-[#005A9C] border border-blue-200 hover:border-blue-300 text-[11px] font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
              title="กดเพื่อล้างแคชเบราว์เซอร์และโหลดข้อมูลล่าสุดจากระบบทันที"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#005A9C]" />
              <span>หากหน้าจอไม่อัปเดต คลิก [รีเฟรชเวอร์ชันล่าสุด]</span>
            </button>
          </div>
        </div>
      </footer>

      {/* =================================================================== */}
      {/* EMPLOYEE MULTI-STEP LOGIN MODAL                                    */}
      {/* Step 1: รหัสพนักงาน 5 ตัว -> ตรวจพบชื่อพนักงาน -> ยืนยัน               */}
      {/* Step 2: ใส่รหัสผ่าน / ตั้งรหัสผ่านครั้งแรก (10 หลัก = 5 ตัว + 5 ตัวผสม)  */}
      {/* =================================================================== */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn text-slate-800 font-sarabun">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#002855] via-[#003875] to-[#005A9C] text-white p-5 sm:p-6 relative">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-[11px] font-bold border border-white/20 whitespace-nowrap">
                    <Users className="w-3.5 h-3.5" />
                    <span>เข้าสู่ระบบพนักงาน • TCT E-TRAINING</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {loginStep === 'id_check' 
                      ? 'ระบุรหัสพนักงานเพื่อตรวจสอบข้อมูล' 
                      : loginStep === 'first_time_profile'
                      ? 'บันทึกข้อมูลประวัติพนักงานเข้าใช้งานครั้งแรก'
                      : 'ระบบความปลอดภัย & รหัสผ่าน'}
                  </h3>
                  <p className="text-xs text-blue-100">
                    {loginStep === 'id_check' 
                      ? 'กรอกรหัสพนักงานเพื่อตรวจพบชื่อ-นามสกุลของตนเอง' 
                      : loginStep === 'first_time_profile'
                      ? 'ตรวจสอบและบันทึกชื่อนามสกุล ตำแหน่ง แผนก ฝ่าย และอายุงาน'
                      : (isFirstTimeUser ? 'ตั้งรหัสผ่านสำหรับเข้าใช้งานครั้งแรก (ความยาว 10 ตัวอักษร)' : 'กรอกรหัสผ่าน 10 ตัวอักษรเพื่อเข้าใช้งาน')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    setIsEmployeeModalOpen(false);
                    setEmployeeError('');
                    setLoginStep('id_check');
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
              <div className="mx-5 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-medium leading-relaxed">{employeeError}</span>
              </div>
            )}

            {/* STEP 1: Enter Employee ID & Verify Name */}
            {loginStep === 'id_check' && (
              <form onSubmit={handleConfirmIdentityAndProceed} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>1. รหัสพนักงาน (Employee ID 5 หลัก) <span className="text-red-500">*</span></span>
                    <span className="text-[11px] text-slate-400">เช่น 18078, 00021, 01002</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={empId}
                      onChange={(e) => handleEmpIdChange(e.target.value)}
                      placeholder="กรอกรหัสพนักงาน 5 ตัว เช่น 18078"
                      className="w-full h-12 px-3.5 pl-10 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white transition-all uppercase"
                      autoFocus
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                  </div>
                </div>

                {/* Auto-detected Employee Card */}
                {matchedEmployee ? (
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>ตรวจพบชื่อพนักงานในระบบเรียบร้อย (กรุณาตรวจทาน):</span>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-emerald-200 space-y-1.5">
                      <div className="text-base font-bold text-slate-900">
                        {matchedEmployee.fullName}
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#003875] font-semibold border border-blue-200">
                          แผนก: {matchedEmployee.department}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          ตำแหน่ง: {matchedEmployee.position || 'พนักงาน'}
                        </span>
                        <span className="font-mono text-slate-400">
                          ID: {matchedEmployee.empId}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      หากข้อมูลถูกต้อง กรุณากดปุ่ม <strong>"ยืนยันข้อมูลและใส่รหัสผ่าน"</strong> ด้านล่าง
                    </p>
                  </div>
                ) : empId.length >= 3 ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>กำลังค้นหารายชื่อจากทะเบียนพนักงาน 224 ท่านของบริษัท...</span>
                  </div>
                ) : null}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!empId.trim()}
                    className="w-full h-12 rounded-2xl bg-[#005A9C] hover:bg-[#004070] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-40"
                  >
                    <span>ยืนยันข้อมูลและใส่รหัสผ่าน</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Password Entry & 10-Character Rule Enforcement */}
            {loginStep === 'password_entry' && matchedEmployee && (
              <form onSubmit={handlePasswordSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
                {/* Employee badge preview */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{matchedEmployee.fullName}</div>
                    <div className="text-slate-500 text-[11px]">แผนก {matchedEmployee.department} • รหัส: <strong className="font-mono">{matchedEmployee.empId}</strong></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playCyberClick();
                      setLoginStep('id_check');
                      setEmployeeError('');
                    }}
                    className="text-[11px] text-[#005A9C] hover:underline font-semibold cursor-pointer"
                  >
                    เปลี่ยนรหัส
                  </button>
                </div>

                {/* Admin Unlock Banner if unlocked */}
                {isUnlockedNotice && (
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 space-y-1 text-xs text-emerald-950 animate-fadeIn">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <Unlock className="w-4 h-4 text-emerald-600" />
                      <span>ผู้ดูแลระบบได้อนุมัติปลดล็อกบัญชีของท่านเรียบร้อยแล้ว!</span>
                    </div>
                    <p className="text-emerald-800 leading-relaxed text-[11.5px]">
                      ท่านสามารถสร้างรหัสผ่านใหม่ (10 ตัวอักษร) และตรวจสอบข้อมูลประวัติการทำงานเพื่อเข้าสู่ระบบได้ทันที
                    </p>
                  </div>
                )}

                {/* CASE A: First-Time User Setup Notice */}
                {isFirstTimeUser ? (
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 space-y-2 text-xs text-amber-950">
                      <div className="font-bold flex items-center gap-1.5 text-amber-900">
                        <Lock className="w-4 h-4 text-amber-600" />
                        <span>{isUnlockedNotice ? 'ตั้งรหัสผ่านใหม่หลังการปลดล็อก (Set New Password)' : 'ตั้งรหัสผ่านเข้าใช้งานครั้งแรก (First-Time Password)'}</span>
                      </div>
                      <p className="leading-relaxed text-amber-800">
                        รหัสผ่านต้องมีความยาว <strong>10 ตัวอักษรพอดี</strong> ประกอบด้วย:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-amber-900">
                        <li><strong>รหัสพนักงาน 5 ตัว</strong> ({matchedEmployee.empId.padStart(5, '0').slice(-5)})</li>
                        <li><strong>ตัวอักษร, ตัวเลข และอักษรพิเศษ อีก 5 ตัว</strong></li>
                      </ul>
                      <div className="p-2 bg-white/80 rounded-lg text-slate-700 font-mono text-[11px] border border-amber-200">
                        ตัวอย่างเช่น: <strong className="text-[#005A9C]">{matchedEmployee.empId.padStart(5, '0').slice(-5)}</strong> + <strong>Abc@1</strong> = <strong className="text-emerald-700">{matchedEmployee.empId.padStart(5, '0').slice(-5)}Abc@1</strong>
                      </div>
                    </div>

                    {/* Input: Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        สร้างรหัสผ่าน 10 ตัวอักษร <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={`เช่น ${matchedEmployee.empId.padStart(5, '0').slice(-5)}Abc@1`}
                          className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Input: Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        ยืนยันรหัสผ่านอีกครั้ง <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="พิมพ์รหัสผ่านเดิมซ้ำอีกครั้ง"
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white"
                      />
                    </div>

                    {/* Real-time Checklist */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <div className="font-semibold text-slate-700 mb-1">เกณฑ์ความปลอดภัยรหัสผ่าน:</div>
                      <div className={`flex items-center gap-2 ${passwordRules.hasEmpIdPrefix ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                        {passwordRules.hasEmpIdPrefix ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 inline-block text-center">•</span>}
                        <span>5 ตัวแรกคือรหัสพนักงานของคุณ ({matchedEmployee.empId.padStart(5, '0').slice(-5)})</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordRules.hasLetter ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                        {passwordRules.hasLetter ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 inline-block text-center">•</span>}
                        <span>มีตัวอักษรภาษาอังกฤษ (A-Z, a-z)</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordRules.hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                        {passwordRules.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 inline-block text-center">•</span>}
                        <span>มีตัวเลข (0-9)</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordRules.hasSpecialChar ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                        {passwordRules.hasSpecialChar ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 inline-block text-center">•</span>}
                        <span>มีอักขระพิเศษ (เช่น @, #, $, %, !, &, *)</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordRules.isExact10Chars ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                        {passwordRules.isExact10Chars ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 inline-block text-center">•</span>}
                        <span>ความยาวครบ 10 ตัวอักษรพอดี (ปัจจุบัน {password.length}/10)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CASE B: Returning User */
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>กรอกรหัสผ่านของคุณ (10 ตัวอักษร) <span className="text-red-500">*</span></span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="กรอกรหัสผ่าน 10 ตัวอักษร"
                          className="w-full h-12 px-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-base focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Forgot Password Button */}
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          playCyberClick();
                          setIsForgotPasswordModalOpen(true);
                        }}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                      >
                        ลืมรหัสผ่าน? (ส่งเรื่องแจ้งแอดมินเพื่อรีเซ็ต)
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-[#005A9C] hover:bg-[#004070] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isFirstTimeUser ? 'บันทึกรหัสผ่านและถัดไป: ตรวจสอบข้อมูลประวัติ' : 'เข้าสู่ระบบการฝึกอบรม'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: First-Time Profile Record (ชื่อนามสกุล ตำแหน่ง แผนก ฝ่าย อายุงาน) */}
            {loginStep === 'first_time_profile' && matchedEmployee && (
              <form onSubmit={handleFirstTimeProfileSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
                <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 space-y-1.5 text-xs text-[#003875]">
                  <div className="font-bold flex items-center gap-1.5 text-[#002855]">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>บันทึกข้อมูลประวัติพนักงานเข้าใช้งานครั้งแรก</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11.5px]">
                    กรุณาตรวจทานและบันทึกข้อมูลของท่านให้ถูกต้อง ข้อมูลนี้จะใช้ในการออก <strong>ใบประกาศนียบัตรดิจิทัล</strong> และรายงานผลการฝึกอบรมประจำปีของศูนย์ฝึกอบรม TCT Academy
                  </p>
                </div>

                {/* Field 1: รหัสพนักงาน (ID) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>รหัสพนักงาน (Employee ID)</span>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ตรวจสอบเรียบร้อย
                    </span>
                  </label>
                  <div className="h-11 px-3.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 font-mono font-bold text-sm flex items-center justify-between">
                    <span>{matchedEmployee.empId}</span>
                    <span className="text-[11px] font-sans font-medium text-slate-400">ระบบเชื่อมโยงอัตโนมัติ</span>
                  </div>
                </div>

                {/* Field 2: ชื่อนามสกุล (Full Name) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>ชื่อ - นามสกุล (Full Name) <span className="text-red-500">*</span></span>
                    <span className="text-[11px] text-slate-400">ระบุคำนำหน้าและชื่อ-นามสกุล</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={profileFullName}
                      onChange={(e) => setProfileFullName(e.target.value)}
                      placeholder="เช่น นาย สมศักดิ์ ใจมั่นคง"
                      className="w-full h-11 px-3.5 pl-10 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                {/* Field 3: ตำแหน่ง (Position) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    ตำแหน่ง (Position) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={profilePosition}
                    onChange={(e) => setProfilePosition(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white cursor-pointer"
                  >
                    {POSITION_OPTIONS_DISPLAY.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Field 4 & 5: แผนก & ฝ่าย */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      แผนก (Department) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={profileDepartment}
                      onChange={(e) => setProfileDepartment(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white cursor-pointer"
                    >
                      {ALL_TCT_DEPARTMENTS.map(d => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      ฝ่าย (Division) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={profileDivision}
                      onChange={(e) => setProfileDivision(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white cursor-pointer"
                    >
                      {TCT_DIVISIONS.map(div => (
                        <option key={div.id} value={div.id}>{div.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Field 6: อายุงาน (Tenure / Years of Service) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>อายุงานในบริษัท (Years of Service) <span className="text-red-500">*</span></span>
                    <span className="text-[11px] text-slate-400">ระบุปีหรือเดือน</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={profileTenure}
                      onChange={(e) => setProfileTenure(e.target.value)}
                      placeholder="เช่น 2 ปี 6 เดือน หรือ 1 ปี"
                      className="w-full h-11 px-3.5 pl-10 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>

                  {/* Quick selection tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-500 font-medium mr-1">เลือกด่วน:</span>
                    {['ไม่เกิน 1 ปี', '1-2 ปี', '2-3 ปี', '3-5 ปี', '5-10 ปี', 'มากกว่า 10 ปี'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => { playCyberClick(); setProfileTenure(tag); }}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border transition-all cursor-pointer ${
                          profileTenure === tag
                            ? 'bg-[#005A9C] text-white border-[#004070]'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#005A9C] to-[#003875] hover:from-[#004070] hover:to-[#002855] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-98"
                  >
                    <Save className="w-4 h-4 text-emerald-300" />
                    <span>บันทึกข้อมูลและเข้าสู่ระบบ e-Training</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playCyberClick();
                      setLoginStep('password_entry');
                    }}
                    className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 text-center font-medium hover:underline cursor-pointer"
                  >
                    ย้อนกลับไปแก้ไขรหัสผ่าน
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* FORGOT PASSWORD MODAL ("หากจำไม่ได้ ให้ลืมรหัสแล้วเด้งไปแอดมิน")     */}
      {/* =================================================================== */}
      {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn font-sarabun text-slate-800">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 text-white p-5 relative">
              <button
                onClick={() => setIsForgotPasswordModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-semibold mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>คำขอรีเซ็ตรหัสผ่านพนักงาน</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                ลืมรหัสผ่าน / ขอความช่วยเหลือจากแอดมิน
              </h3>
              <p className="text-xs text-rose-100 mt-0.5">
                ส่งเรื่องไปยังผู้ดูแลระบบศูนย์ฝึกอบรม TCT Academy
              </p>
            </div>

            {resetSubmittedNotice ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">ส่งคำขอไปยังแอดมินเรียบร้อยแล้ว</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ผู้ดูแลระบบได้รับข้อมูลแล้ว และสามารถตรวจสอบพร้อมรีเซ็ตรหัสผ่านให้ท่านได้ทันทีในหน้า Admin Console
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="p-5 space-y-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500">ข้อมูลพนักงานผู้ขอรีเซ็ต:</div>
                  <div className="font-bold text-slate-900 text-sm">{matchedEmployee?.fullName || empId}</div>
                  <div className="text-slate-600">รหัส: {matchedEmployee?.empId || empId} • แผนก {matchedEmployee?.department || '-'}</div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">เบอร์โทรศัพท์ / Line ID สำหรับติดต่อ (ถ้ามี):</label>
                  <input
                    type="text"
                    value={forgotContact}
                    onChange={(e) => setForgotContact(e.target.value)}
                    placeholder="เช่น 081-xxx-xxxx หรือ แผนก P กะ A"
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-[#005A9C]"
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  เมื่อกดส่งคำขอ แอดมินสามารถเปิดดูรายการคำขอ และรีเซ็ตรหัสผ่านให้ท่านเป็นรหัสชั่วคราว หรืออนุญาตให้ท่านตั้งรหัสใหม่ได้ทันที
                </p>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>ส่งคำขอรีเซ็ตรหัสผ่านไปยังแอดมิน</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ADMIN LOGIN POPUP MODAL                                             */}
      {/* =================================================================== */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn text-slate-800 font-sarabun">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            <div className="bg-gradient-to-r from-slate-900 to-purple-950 text-white p-5 sm:p-6 relative">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-purple-300 text-[11px] font-bold border border-white/20 whitespace-nowrap">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ADMINISTRATOR PORTAL</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    เข้าสู่ระบบสำหรับผู้ดูแลระบบ
                  </h3>
                  <p className="text-xs text-slate-300">
                    แผนก Personnel & ศูนย์ฝึกอบรม TCT Academy
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    setIsAdminModalOpen(false);
                    setAdminError('');
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {adminError && (
              <div className="mx-5 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-medium">{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="p-5 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">รหัสผ่านผู้ดูแลระบบ (Admin PIN / Password)</label>
                <input
                  type="password"
                  required
                  value={adminPin}
                  onChange={(e) => {
                    setAdminPin(e.target.value);
                    setAdminError('');
                  }}
                  placeholder="กรอกรหัสผ่าน Admin..."
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  autoFocus
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-purple-950 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>เข้าสู่ระบบผู้ดูแลระบบ (Enter Admin)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
