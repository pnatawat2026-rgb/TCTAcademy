import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  UserPlus, 
  Check, 
  CheckSquare, 
  Square, 
  Building2, 
  Filter, 
  BookOpen, 
  Users,
  ShieldCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { getMasterEmployeeRoster } from '../data/employeeDatabase';
import { PredefinedEmployee } from '../types';
import { enrollEmployeesInCourse, getCourseEnrolledEmpIds, COURSE_OFFICIAL_METADATA } from '../utils/courseTraineeHelper';
import { getAllAvailableCourses } from '../utils/courseManager';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

interface EnrollTraineesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCourseId?: string;
  initialCourseId?: string;
  onEnrollSuccess?: () => void;
  onEnrolled?: () => void;
}

const DEPARTMENTS = [
  { code: 'ALL', name: 'ทุกแผนก (All Departments)' },
  { code: 'P', name: 'P - Production' },
  { code: 'PP', name: 'PP - Production Plan' },
  { code: 'PS', name: 'PS - Personnel' },
  { code: 'ESH', name: 'ESH - Environmental, Safety and Health' },
  { code: 'ST', name: 'ST - Setter' },
  { code: 'SEC', name: 'SEC - Single End Cord' },
  { code: 'MN', name: 'MN - Maintenance' },
  { code: 'TC', name: 'TC - Technical' },
  { code: 'TR', name: 'TR - Test Room' },
  { code: 'QA', name: 'QA - Quality Assurance' },
  { code: 'FI', name: 'FI - Final Inspection' },
  { code: 'TW', name: 'TW - Twisting' },
  { code: 'RW', name: 'RW - Rewind' }
];

export const EnrollTraineesModal: React.FC<EnrollTraineesModalProps> = ({
  isOpen,
  onClose,
  currentCourseId,
  initialCourseId = 'applied-psychology',
  onEnrollSuccess,
  onEnrolled
}) => {
  const activeInitialCourse = currentCourseId || initialCourseId;
  const [targetCourseId, setTargetCourseId] = useState<string>(
    activeInitialCourse === 'all' ? 'applied-psychology' : activeInitialCourse
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedEmpIds, setSelectedEmpIds] = useState<Set<string>>(new Set());
  const [hideAlreadyEnrolled, setHideAlreadyEnrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Keep target course in sync with active initial course
  React.useEffect(() => {
    if (activeInitialCourse && activeInitialCourse !== 'all') {
      setTargetCourseId(activeInitialCourse);
    }
  }, [activeInitialCourse, isOpen]);

  const masterEmployees = useMemo(() => getMasterEmployeeRoster(), []);
  const availableCourses = useMemo(() => getAllAvailableCourses(), []);

  // Currently enrolled employees in this selected course
  const currentlyEnrolledIds = useMemo(() => {
    return new Set(getCourseEnrolledEmpIds(targetCourseId).map(id => id.toUpperCase()));
  }, [targetCourseId, isOpen]);

  // Filtered master employee list
  const filteredEmployees = useMemo(() => {
    return masterEmployees.filter(emp => {
      const cleanId = emp.empId.trim().toUpperCase();
      const matchesSearch = 
        !searchQuery.trim() || 
        emp.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = selectedDept === 'ALL' || emp.department.trim().toUpperCase() === selectedDept.toUpperCase();
      const isAlreadyIn = currentlyEnrolledIds.has(cleanId);

      if (hideAlreadyEnrolled && isAlreadyIn) {
        return false;
      }

      return matchesSearch && matchesDept;
    });
  }, [masterEmployees, searchQuery, selectedDept, currentlyEnrolledIds, hideAlreadyEnrolled]);

  if (!isOpen) return null;

  const handleToggleSelect = (empId: string) => {
    playCyberClick();
    const cleanId = empId.trim().toUpperCase();
    setSelectedEmpIds(prev => {
      const next = new Set(prev);
      if (next.has(cleanId)) {
        next.delete(cleanId);
      } else {
        next.add(cleanId);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    playCyberClick();
    const notYetEnrolled = filteredEmployees
      .filter(e => !currentlyEnrolledIds.has(e.empId.trim().toUpperCase()))
      .map(e => e.empId.trim().toUpperCase());
    
    setSelectedEmpIds(prev => {
      const next = new Set(prev);
      notYetEnrolled.forEach(id => next.add(id));
      return next;
    });
  };

  const handleClearSelection = () => {
    playCyberClick();
    setSelectedEmpIds(new Set());
  };

  const handleSelectWholeDept = (deptCode: string) => {
    playCyberClick();
    setSelectedDept(deptCode);
    const inDept = masterEmployees
      .filter(e => e.department.trim().toUpperCase() === deptCode.toUpperCase())
      .map(e => e.empId.trim().toUpperCase());
    
    setSelectedEmpIds(prev => {
      const next = new Set(prev);
      inDept.forEach(id => next.add(id));
      return next;
    });
  };

  const handleConfirmEnrollment = () => {
    if (selectedEmpIds.size === 0) return;
    setIsSubmitting(true);
    playCyberClick();

    const empIdArray: string[] = Array.from(selectedEmpIds);
    const result = enrollEmployeesInCourse(targetCourseId, empIdArray);

    playSuccessChime();
    setStatusMessage(`ลงทะเบียนสำเร็จ ${result.addedCount} รายชื่อเข้าหลักสูตรเรียบร้อยแล้ว`);

    setTimeout(() => {
      setIsSubmitting(false);
      setSelectedEmpIds(new Set());
      setStatusMessage(null);
      if (onEnrollSuccess) onEnrollSuccess();
      if (onEnrolled) onEnrolled();
      onClose();
    }, 700);
  };

  const targetCourseMeta = COURSE_OFFICIAL_METADATA[targetCourseId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-50 border border-slate-300 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden font-sarabun text-slate-800">
        
        {/* Header - Official Corporate Royal Navy Gradient ONLY */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#001f3f] via-[#002D5A] to-[#005A9C] text-white flex items-center justify-between shrink-0 border-b border-blue-900/40">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-amber-300 shadow-xs">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>ดึงรายชื่อพนักงานเข้าอบรมในหลักสูตร (Admin Course Enrollment)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-900/90 text-amber-300 border border-blue-400/40 font-mono font-bold">
                  ADMIN ONLY
                </span>
              </h2>
              <p className="text-xs text-blue-100/90 mt-0.5">
                เลือกพนักงานรายคนหรือดึงทั้งแผนกจากฐานข้อมูล 224 ท่าน เข้าสู่หลักสูตรอบรม (สิทธิ์เฉพาะแอดมิน)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Selector & Settings - Soft White Theme */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white space-y-3 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Target Course Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#005A9C]" />
                <span>เลือกหลักสูตรเป้าหมายที่จะดึงพนักงานเข้าอบรม:</span>
              </label>
              <select
                value={targetCourseId}
                onChange={(e) => {
                  playCyberClick();
                  setTargetCourseId(e.target.value);
                  setSelectedEmpIds(new Set());
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-xs font-bold focus:border-[#005A9C] focus:bg-white focus:outline-none"
              >
                <option value="applied-psychology">🧠 หลักสูตรจิตวิทยาประยุกต์ในการทำงาน (Applied Psychology - TCT-PSY-01)</option>
                <option value="risk-management">หลักสูตร 1: การบริหารความเสี่ยง (QSRM) — TCT-QSRM-01</option>
                <option value="advanced-preventive-maintenance">หลักสูตร 2: การบำรุงรักษาเชิงป้องกันขั้นสูง (APM) — TCT-APM-02</option>
                <option value="conflict-management">หลักสูตร 3: การจัดการความขัดแย้งเชิงบวก (CFM) — TCT-CFM-03</option>
                <option value="ai-for-tct">หลักสูตร 4: AI for TCT เพื่อการผลิตและความปลอดภัย (TCT-AI-101)</option>
                <option value="personality-psychology">หลักสูตร 5: จิตวิทยาบุคลิกภาพและการปรับตัว (TCT-A001)</option>
                <option value="kyt-shisa-kanko">หลักสูตร 6: KYT & SHISA KANKO การคาดการณ์อันตราย (TCT-KYT-01)</option>
                {availableCourses
                  .filter(c => !['applied-psychology', 'risk-management', 'advanced-preventive-maintenance', 'conflict-management', 'ai-for-tct', 'personality-psychology', 'kyt-shisa-kanko'].includes(c.id))
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.id})</option>
                  ))
                }
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>กรองตามแผนก (13 แผนกมาตรฐาน):</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    playCyberClick();
                    setSelectedDept(e.target.value);
                  }}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-xs font-bold focus:border-[#005A9C] focus:bg-white focus:outline-none"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>

                {selectedDept !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => handleSelectWholeDept(selectedDept)}
                    className="px-3 py-2 rounded-xl bg-[#002D5A] hover:bg-[#001f3f] text-white text-xs font-bold whitespace-nowrap flex items-center gap-1 shadow-xs cursor-pointer"
                    title={`เลือกพนักงานทั้งหมดในแผนก ${selectedDept}`}
                  >
                    <Users className="w-3.5 h-3.5 text-amber-300" />
                    <span>แอดทั้งแผนก {selectedDept}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search & Bulk Select Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารหัสพนักงาน, ชื่อ-สกุล หรือตำแหน่ง..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:border-[#005A9C] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs flex-wrap">
              <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideAlreadyEnrolled}
                  onChange={(e) => setHideAlreadyEnrolled(e.target.checked)}
                  className="rounded border-slate-300 text-[#005A9C] focus:ring-blue-400 w-3.5 h-3.5 cursor-pointer"
                />
                <span>ซ่อนคนที่เข้าเรียนแล้ว</span>
              </label>

              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#005A9C] font-bold border border-blue-200 flex items-center gap-1 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>เลือกทั้งหมดที่แสดง ({filteredEmployees.filter(e => !currentlyEnrolledIds.has(e.empId.toUpperCase())).length})</span>
              </button>

              {selectedEmpIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>ล้างที่เลือก</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Selected Count Indicator Banner */}
        <div className="px-5 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">หลักสูตร:</span>
            <span className="font-bold text-[#002D5A]">
              {targetCourseMeta?.title || targetCourseId}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">ในหลักสูตรแล้ว:</span>
            <span className="font-mono font-bold text-[#005A9C]">{currentlyEnrolledIds.size} ท่าน</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">เลือกเพิ่มใหม่:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#002D5A] text-white font-mono font-bold">
              {selectedEmpIds.size} คน
            </span>
          </div>
        </div>

        {/* Employee Table Grid - Soft Clean Light Theme */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#f8fafc]">
          {filteredEmployees.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
              <Users className="w-12 h-12 mb-3 text-slate-400 opacity-50" />
              <p className="text-sm font-bold text-slate-700">ไม่พบรายชื่อพนักงานที่ตรงกับเงื่อนไข</p>
              <p className="text-xs text-slate-500 mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกแผนกอื่น</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredEmployees.map((emp) => {
                const cleanId = emp.empId.trim().toUpperCase();
                const isAlreadyEnrolled = currentlyEnrolledIds.has(cleanId);
                const isSelected = selectedEmpIds.has(cleanId);

                return (
                  <div
                    key={cleanId}
                    onClick={() => {
                      if (!isAlreadyEnrolled) {
                        handleToggleSelect(cleanId);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 select-none ${
                      isAlreadyEnrolled
                        ? 'bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed'
                        : isSelected
                          ? 'bg-blue-50 border-[#005A9C] ring-2 ring-blue-500/20 shadow-xs cursor-pointer'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">
                        {isAlreadyEnrolled ? (
                          <div className="w-5 h-5 rounded-md bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                            <Check className="w-3.5 h-3.5 font-bold" />
                          </div>
                        ) : (
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#002D5A] border-[#002D5A] text-white'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#005A9C]">
                            {cleanId}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                            แผนก {emp.department}
                          </span>
                          {isAlreadyEnrolled && (
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              (อยู่ในหลักสูตรแล้ว)
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                          {emp.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {emp.position || 'พนักงานฝ่ายปฏิบัติการ'}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 shrink-0 font-mono font-bold">
                      {emp.department}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600">
            {statusMessage ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>{statusMessage}</span>
              </span>
            ) : (
              <span>
                พร้อมดึงเข้าสู่หลักสูตร: <strong className="text-slate-900 font-mono">{selectedEmpIds.size} ท่าน</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              disabled={selectedEmpIds.size === 0 || isSubmitting}
              onClick={handleConfirmEnrollment}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                selectedEmpIds.size === 0 || isSubmitting
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  : 'bg-[#002D5A] hover:bg-[#001f3f] text-white active:scale-95 cursor-pointer'
              }`}
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>ยืนยันดึงเข้าสู่การอบรม ({selectedEmpIds.size} ท่าน)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
