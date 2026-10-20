import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { sanitizeThaiName, THAI_PREFIXES } from '../utils/nameSanitizer';
import { 
  User, 
  Building, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  X, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  Save,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    empId?: string;
    fullName?: string;
    prefix?: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    position?: string;
    division?: string;
    notes?: string;
  } | null;
  initialData?: {
    empId?: string;
    fullName?: string;
    prefix?: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    position?: string;
    division?: string;
    notes?: string;
  } | null;
  isAdmin?: boolean;
  onSave: (updatedData: {
    empId: string;
    prefix: string;
    firstName: string;
    lastName: string;
    fullName: string;
    department: string;
    position: string;
    division?: string;
    notes?: string;
  }) => void;
}

export const DEPARTMENTS = [
  'P',
  'PP',
  'PS',
  'ESH',
  'ST',
  'SEC',
  'MN',
  'TC',
  'TR',
  'QA',
  'FI',
  'TW',
  'RW'
];

export const DEPARTMENT_OPTIONS = [
  { code: 'P', label: 'P - Production (ฝ่ายผลิต)' },
  { code: 'PP', label: 'PP - Production Plan (วางแผนการผลิต)' },
  { code: 'PS', label: 'PS - Personnel (บุคคล)' },
  { code: 'ESH', label: 'ESH - Environmental Safety and Health (ความปลอดภัย อาชีวอนามัย และสิ่งแวดล้อม)' },
  { code: 'ST', label: 'ST - Setter (เซ็ตเตอร์)' },
  { code: 'SEC', label: 'SEC - Single End Cord (เส้นคอร์ดเดี่ยว)' },
  { code: 'MN', label: 'MN - Maintenance (ซ่อมบำรุง)' },
  { code: 'TC', label: 'TC - Technical (ฝ่ายเทคนิค)' },
  { code: 'TR', label: 'TR - Test Room (ห้องทดสอบ)' },
  { code: 'QA', label: 'QA - Quality Assurance (ประกันคุณภาพ)' },
  { code: 'FI', label: 'FI - Final Inspection (ตรวจสอบขั้นสุดท้าย)' },
  { code: 'TW', label: 'TW - Twisting (ตีเกลียว)' },
  { code: 'RW', label: 'RW - Rewind (กรอเส้นด้าย / รีไวนด์)' }
];

export const POSITIONS = [
  'Worker',
  'Leader',
  'Clerk',
  'Supervisor',
  'Chief',
  'Manager'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  initialData,
  isAdmin = false,
  onSave
}) => {
  const effectiveData = user || initialData || {};
  const [empId, setEmpId] = useState(effectiveData.empId || '');
  const [prefix, setPrefix] = useState('นาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState(effectiveData.department || 'P');
  const [customDept, setCustomDept] = useState('');
  const [position, setPosition] = useState(effectiveData.position || 'SUPERVISOR');
  const [customPos, setCustomPos] = useState('');
  const [division, setDivision] = useState(effectiveData.division || 'ฝ่ายผลิต');
  const [notes, setNotes] = useState(effectiveData.notes || '');
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  const openedEmpIdRef = React.useRef<string | null>(null);

  // Initialize fields only when opening or when target employee ID actually changes
  useEffect(() => {
    if (!isOpen) {
      openedEmpIdRef.current = null;
      return;
    }

    const data = user || initialData || {};
    const targetId = (data.empId || '').trim().toUpperCase();

    // If modal is already open for this employee, DO NOT overwrite what the user is currently typing
    if (openedEmpIdRef.current === targetId && targetId !== '') {
      return;
    }

    openedEmpIdRef.current = targetId;
    setEmpId(data.empId || '');
    
    // Parse existing fullName
    const sanitized = sanitizeThaiName({
      prefix: data.prefix,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: data.fullName
    });

    setPrefix(sanitized.prefix || 'นาย');
    setFirstName(sanitized.firstName || '');
    setLastName(sanitized.lastName || '');
    
    const dept = data.department || 'P';
    if (DEPARTMENTS.includes(dept)) {
      setDepartment(dept);
      setCustomDept('');
    } else {
      setDepartment('OTHER');
      setCustomDept(dept);
    }

    const pos = data.position || 'SUPERVISOR';
    if (POSITIONS.includes(pos)) {
      setPosition(pos);
      setCustomPos('');
    } else {
      setPosition('OTHER');
      setCustomPos(pos);
    }

    setDivision(data.division || 'ฝ่ายผลิต');
    setNotes(data.notes || '');
    setError('');
    setSuccessNotice(false);
  }, [isOpen, user?.empId, initialData?.empId]);

  if (!isOpen) return null;

  // Real-time sanitized preview
  const currentSanitized = sanitizeThaiName({
    prefix,
    firstName: firstName.trim(),
    lastName: lastName.trim()
  });

  const finalDepartment = department === 'OTHER' ? customDept.trim() || 'P' : department;
  const finalPosition = position === 'OTHER' ? customPos.trim() || 'SUPERVISOR' : position;

  // Check if user accidentally typed duplicate prefix in first name
  const hasPrefixInFirstName = THAI_PREFIXES.some(p => firstName.trim().startsWith(p) && p !== prefix);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!empId.trim()) {
      setError('กรุณากรอกรหัสพนักงาน (Employee ID)');
      return;
    }

    let cleanFirst = firstName.trim();
    let cleanLast = lastName.trim();

    // If firstName contains spaces and lastName is empty, auto-split
    if (cleanFirst.includes(' ') && !cleanLast) {
      const parts = cleanFirst.split(/\s+/);
      cleanFirst = parts[0];
      cleanLast = parts.slice(1).join(' ');
    }

    if (!cleanFirst) {
      setError('กรุณากรอกชื่อจริง (First Name)');
      return;
    }

    if (department === 'OTHER' && !customDept.trim()) {
      setError('กรุณากรอกชื่อแผนก');
      return;
    }

    const sanitized = sanitizeThaiName({
      prefix,
      firstName: cleanFirst,
      lastName: cleanLast
    });

    onSave({
      empId: empId.trim().toUpperCase(),
      prefix: sanitized.prefix,
      firstName: sanitized.firstName,
      lastName: sanitized.lastName || cleanLast || '-',
      fullName: sanitized.fullName || `${sanitized.prefix} ${sanitized.firstName} ${sanitized.lastName}`.trim(),
      department: finalDepartment,
      position: finalPosition,
      division: division.trim() || 'ฝ่ายผลิต',
      notes: notes.trim() || undefined
    });

    playSuccessChime();
    setSuccessNotice(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sarabun">
      <div className="relative w-full max-w-2xl bg-[#0B0F19] border-2 border-cyan-500/50 rounded-3xl shadow-2xl shadow-cyan-500/20 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{isAdmin ? 'แก้ไขข้อมูลพนักงาน (Admin Editor)' : 'แก้ไขข้อมูลส่วนตัว (Edit Profile)'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  ID: {empId || effectiveData.empId || '-'}
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                แก้ไขชื่อ-นามสกุล และข้อมูล เพื่อให้ระบบและ <strong>ใบประกาศนียบัตร (Certificate)</strong> แสดงผลถูกต้อง
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { playCyberClick(); onClose(); }}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>บันทึกข้อมูลเรียบร้อยแล้ว! กำลังอัปเดตใบรับรองและระบบทั้งหมด...</span>
            </div>
          )}

          {/* Certificate Live Preview Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFFDF9] to-[#F8FAFC] border-2 border-amber-500/60 shadow-lg text-slate-900">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 border-b border-amber-200/80 pb-1.5 mb-2">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>ตัวอย่างการแสดงชื่อบนใบประกาศนียบัตร (Live Certificate Preview):</span>
              </span>
              <span className="px-2 py-0.2 rounded-full bg-amber-100 border border-amber-300 text-[10px] font-mono">
                TCT ACADEMY
              </span>
            </div>

            <div className="text-center py-2 space-y-1">
              <div className="text-[11px] text-slate-500 font-medium">ขอมอบใบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า</div>
              <div className="text-xl sm:text-2xl font-black text-[#0B2545] font-sarabun tracking-tight underline decoration-amber-500 decoration-2 underline-offset-4">
                {currentSanitized.fullName || '( กรุณาระบุชื่อ-นามสกุล )'}
              </div>
              <div className="text-xs text-slate-600 font-mono flex items-center justify-center gap-3 mt-2">
                <span className="bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-md">
                  รหัส: <strong>{empId || effectiveData.empId || '-'}</strong>
                </span>
                <span className="bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-md">
                  แผนก: <strong className="text-amber-800">{finalDepartment}</strong>
                </span>
                <span className="bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-md">
                  ตำแหน่ง: <strong>{finalPosition}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            
            {/* 1. Employee ID (Editable for Admin or Locked for Regular Trainee) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                รหัสพนักงาน (Employee ID) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={empId}
                disabled={!isAdmin}
                onChange={(e) => setEmpId(e.target.value.toUpperCase())}
                className={`w-full bg-[#070A12] border ${
                  isAdmin ? 'border-cyan-500/40 focus:border-cyan-400' : 'border-slate-800 text-slate-400 cursor-not-allowed'
                } rounded-xl px-3.5 py-2.5 text-sm font-mono text-cyan-300 focus:outline-none`}
                placeholder="เช่น 97033"
              />
              {!isAdmin && (
                <span className="text-[10px] text-slate-500 mt-1 block">
                  * รหัสพนักงานล็อคไว้เพื่อความถูกต้องของสถิติ หากต้องการเปลี่ยนรหัสโปรดแจ้งผู้ดูแลระบบ
                </span>
              )}
            </div>

            {/* 2. Prefix + First Name + Last Name (The Core Fix for Duplicate 'นาย') */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Prefix Selector */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  คำนำหน้า <span className="text-rose-400">*</span>
                </label>
                <select
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full bg-[#070A12] border border-cyan-500/40 rounded-xl px-3 py-2.5 text-sm text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {THAI_PREFIXES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* First Name */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ชื่อจริง (ไม่ต้องใส่คำนำหน้า) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#070A12] border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-semibold"
                  placeholder="เช่น นัตติกรณ์"
                />
              </div>

              {/* Last Name */}
              <div className="sm:col-span-5">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  นามสกุล <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#070A12] border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-semibold"
                  placeholder="เช่น ทองประสานศรี"
                />
              </div>
            </div>

            {hasPrefixInFirstName && (
              <div className="p-2 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-300 text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  ระบบจะตัดคำนำหน้าซ้ำในช่องชื่อจริงให้อัตโนมัติ เพื่อให้ในใบประกาศนียบัตรมีคำนำหน้าเพียงครั้งเดียว
                </span>
              </div>
            )}

            {/* 3. Department & Position */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ฝ่าย / แผนก (Department) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-[#070A12] border border-cyan-500/40 rounded-xl px-3 py-2.5 text-sm text-purple-300 font-bold focus:outline-none focus:border-cyan-400 cursor-pointer mb-1.5"
                >
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <option key={dept.code} value={dept.code}>
                      {dept.label}
                    </option>
                  ))}
                  <option value="OTHER">ระบุแผนกอื่นๆ...</option>
                </select>

                {department === 'OTHER' && (
                  <input
                    type="text"
                    value={customDept}
                    onChange={(e) => setCustomDept(e.target.value.toUpperCase())}
                    className="w-full bg-[#070A12] border border-purple-500/50 rounded-xl px-3.5 py-2 text-xs text-purple-200 focus:outline-none font-mono"
                    placeholder="พิมพ์ชื่อแผนก เช่น QSRM, LAB, LOG"
                  />
                )}
              </div>

              {/* Position */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ตำแหน่ง (Position)
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-[#070A12] border border-cyan-500/40 rounded-xl px-3 py-2.5 text-sm text-slate-200 font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer mb-1.5"
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                  <option value="OTHER">ระบุตำแหน่งอื่นๆ...</option>
                </select>

                {position === 'OTHER' && (
                  <input
                    type="text"
                    value={customPos}
                    onChange={(e) => setCustomPos(e.target.value)}
                    className="w-full bg-[#070A12] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    placeholder="พิมพ์ตำแหน่ง เช่น Assistant Manager"
                  />
                )}
              </div>
            </div>

            {/* 4. Optional Admin Notes */}
            {isAdmin && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  บันทึกเพิ่มเติมของแอดมิน (Admin Notes)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#070A12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                  placeholder="หมายเหตุ เช่น รุ่นที่ 1 / อบรมซ่อม"
                />
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900/90 border-t border-cyan-500/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => { playCyberClick(); onClose(); }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            ยกเลิก (Cancel)
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกข้อมูลและอัปเดตใบประกาศฯ</span>
          </button>
        </div>

      </div>
    </div>
  );
};
