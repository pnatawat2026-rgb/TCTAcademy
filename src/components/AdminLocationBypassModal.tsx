import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Users,
  BookOpen,
  Power,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Building2,
  ExternalLink,
  RotateCcw,
  Clock,
  Check,
  X,
  Radio,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import {
  AdminGeoBypassConfig,
  getAdminGeoBypassConfig,
  saveAdminGeoBypassConfig,
  TEIJIN_CORD_COORDS,
  MAX_ALLOWED_DISTANCE_KM,
  formatDistanceThai,
  getAreaDescription,
  fetchLocationCheckIns
} from '../utils/geolocationSecurity';
import { getAllAvailableCourses } from '../utils/courseManager';
import { MASTER_EMPLOYEE_ROSTER_230 } from '../data/employeeDatabase';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';
import { EmployeeLocationCheckIn } from '../types';

interface AdminLocationBypassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged?: (config: AdminGeoBypassConfig) => void;
}

export const AdminLocationBypassModal: React.FC<AdminLocationBypassModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged
}) => {
  const [config, setConfig] = useState<AdminGeoBypassConfig>(() => getAdminGeoBypassConfig());
  const [activeTab, setActiveTab] = useState<'system' | 'individual' | 'course' | 'logs'>('system');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Individual Bypass search & input
  const [empSearch, setEmpSearch] = useState<string>('');
  const [customEmpIdInput, setCustomEmpIdInput] = useState<string>('');
  const [empInputError, setEmpInputError] = useState<string>('');

  // Recent logs
  const [recentLogs, setRecentLogs] = useState<EmployeeLocationCheckIn[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);

  const courses = useMemo(() => getAllAvailableCourses(), []);

  // Sync latest config on open
  useEffect(() => {
    if (isOpen) {
      setConfig(getAdminGeoBypassConfig());
      loadLogs();
    }
  }, [isOpen]);

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await fetchLocationCheckIns();
      setRecentLogs(logs.slice(0, 15));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleUpdateConfig = (newConfig: AdminGeoBypassConfig, feedbackMsg?: string) => {
    setConfig(newConfig);
    saveAdminGeoBypassConfig(newConfig);
    onConfigChanged?.(newConfig);
    playSuccessChime();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // 1. Toggle System-wide bypass
  const handleToggleSystemWide = (enable: boolean) => {
    playCyberClick();
    handleUpdateConfig({
      ...config,
      isSystemWideBypass: enable,
      updatedBy: 'Admin'
    });
  };

  // 2. Add individual employee bypass
  const handleAddIndividual = (empIdToAdd: string) => {
    setEmpInputError('');
    const clean = empIdToAdd.trim().toUpperCase();
    if (!clean) {
      playErrorBuzz();
      setEmpInputError('กรุณากรอกรหัสพนักงาน');
      return;
    }

    if (config.bypassedEmpIds.map(x => x.toUpperCase()).includes(clean)) {
      playErrorBuzz();
      setEmpInputError(`รหัส ${clean} อยู่ในรายการยกเว้นอยู่แล้ว`);
      return;
    }

    const updated = Array.from(new Set([...config.bypassedEmpIds, clean]));
    handleUpdateConfig({
      ...config,
      bypassedEmpIds: updated,
      updatedBy: 'Admin'
    });
    setCustomEmpIdInput('');
  };

  // Remove individual employee bypass
  const handleRemoveIndividual = (empIdToRemove: string) => {
    playCyberClick();
    const clean = empIdToRemove.trim().toUpperCase();
    const updated = config.bypassedEmpIds.filter(id => id.toUpperCase() !== clean);
    handleUpdateConfig({
      ...config,
      bypassedEmpIds: updated,
      updatedBy: 'Admin'
    });
  };

  // 3. Toggle course bypass
  const handleToggleCourse = (courseId: string) => {
    playCyberClick();
    let updated: string[];
    if (config.bypassedCourseIds.includes(courseId)) {
      updated = config.bypassedCourseIds.filter(c => c !== courseId);
    } else {
      updated = [...config.bypassedCourseIds, courseId];
    }
    handleUpdateConfig({
      ...config,
      bypassedCourseIds: updated,
      updatedBy: 'Admin'
    });
  };

  // Filter roster for suggestions
  const filteredRoster = useMemo(() => {
    if (!empSearch.trim()) return MASTER_EMPLOYEE_ROSTER_230.slice(0, 8);
    const q = empSearch.toLowerCase().trim();
    return MASTER_EMPLOYEE_ROSTER_230.filter(
      e => e.empId.toLowerCase().includes(q) ||
           e.fullName.toLowerCase().includes(q) ||
           e.department.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [empSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sarabun text-slate-800">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-2 border-slate-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-[#002D5A] to-slate-900 text-white p-5 sm:p-6 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-xs">
                <MapPin className="w-3.5 h-3.5" />
                <span>GEOLOCATION GEOFENCE CONTROL • การจำกัดพิกัด 1.0 กม.</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-normal leading-snug">
                จัดการการจำกัดพิกัดโลเคชั่น (Geofence Bypass Manager)
              </h2>
              <p className="text-xs text-blue-200">
                บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • สวนอุตสาหกรรมโรจนะ เฟส 1 จ.พระนครศรีอยุธยา
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                playCyberClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Status Badge Bar */}
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">สถานะปัจจุบัน:</span>
              {config.isSystemWideBypass ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[11px] shadow-xs">
                  ✓ ยกเลิกการจำกัดทั้งระบบ (เปิดให้ทุกคนเข้าใช้งานได้)
                </span>
              ) : config.bypassedEmpIds.length > 0 || config.bypassedCourseIds.length > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-300 text-slate-950 font-bold text-[11px]">
                  จำกัด 1.0 กม. (ยกเว้น {config.bypassedEmpIds.length} คน • {config.bypassedCourseIds.length} หลักสูตร)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[11px]">
                  🔒 บังคับรัศมี 1.0 กม. เข้มงวด 100% (ไม่มีข้อยกเว้น)
                </span>
              )}
            </div>

            {saveSuccess && (
              <span className="text-emerald-300 font-bold text-xs animate-fadeIn flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> บันทึกการตั้งค่าเรียบร้อย
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              playCyberClick();
              setActiveTab('system');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'system'
                ? 'bg-[#002D5A] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>1. ยกเลิกทั้งระบบ (System-wide)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playCyberClick();
              setActiveTab('individual');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'individual'
                ? 'bg-[#002D5A] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2. ยกเลิกเป็นรายบุคคล ({config.bypassedEmpIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playCyberClick();
              setActiveTab('course');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'course'
                ? 'bg-[#002D5A] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>3. ยกเลิกตามหลักสูตร ({config.bypassedCourseIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playCyberClick();
              setActiveTab('logs');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-[#002D5A] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>ประวัติการเข้าใช้งาน GPS</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          
          {/* TAB 1: SYSTEM-WIDE BYPASS */}
          {activeTab === 'system' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <Power className="w-5 h-5 text-[#005A9C]" />
                      <span>ควบคุมการจำกัดพิกัดภาพรวมทั้งระบบ (Master Geofence Switch)</span>
                    </h3>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                      เมื่อเปิดใช้งาน <strong>"ยกเลิกการจำกัดทั้งระบบ"</strong> พนักงานทุกคนในบริษัท (ทั้งหมด 230 คน) จะสามารถเข้าฝึกอบรมและประเมินผลได้จากทุกสถานที่โดยไม่ต้องอยู่ในรัศมี 1.0 กม.
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSystemWide(!config.isSystemWideBypass)}
                      className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95 ${
                        config.isSystemWideBypass
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {config.isSystemWideBypass ? (
                        <>
                          <ShieldAlert className="w-4 h-4" />
                          <span>กลับมาเปิดการจำกัด 1.0 กม.</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>กดเพื่อยกเลิกการจำกัดทั้งระบบ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* State explanation card */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  config.isSystemWideBypass
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-blue-50 border-blue-200 text-blue-950'
                }`}>
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <strong className="block font-bold">
                      {config.isSystemWideBypass
                        ? 'ขณะนี้ระบบอยู่ในโหมด "ยกเลิกการจำกัดโลเคชั่นทั้งระบบ (System Bypass Active)"'
                        : 'ขณะนี้ระบบอยู่ในโหมด "เปิดการจำกัดโลเคชั่นตามปกติ (Enforced Radius 1.0 km)"'}
                    </strong>
                    <p className="text-slate-600">
                      พิกัดอ้างอิงโรงงาน: 14.3380539, 100.6279692 (บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด สวนอุตสาหกรรมโรจนะ)
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Verification Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">การตรวจจับพิกัดเมื่อพนักงานเข้าสู่ระบบ:</span>
                <p className="text-slate-600 leading-relaxed">
                  เมื่อพนักงานกดเข้าสู่ระบบ (ทั้งแบบปกติและแบบ Fast-Track ประเมินด่วน) ระบบจะเรียกอ่านพิกัด GPS อัตโนมัติในพื้นหลังเพื่อระบุพื้นที่การเข้าใช้งาน (เช่น "ภายในพื้นที่โรงงาน สวนอุตสาหกรรมโรจนะ" หรือ "ภายนอกโรงงาน") และบันทึกประวัติไว้ตรวจสอบ
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: INDIVIDUAL EMPLOYEE BYPASS */}
          {activeTab === 'individual' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      ยกเลิกการจำกัดโลเคชั่นเฉพาะรายบุคคล (Individual Employee Bypass)
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      สำหรับพนักงานที่ได้รับอนุญาตให้ฝึกอบรมหรือประเมินผลนอกสถานที่ (เช่น ปฏิบัติงานนอกพื้นที่, WFH, ฝึกงานภายนอก)
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-[#005A9C] font-bold text-xs">
                    ได้รับการยกเว้น: {config.bypassedEmpIds.length} คน
                  </span>
                </div>

                {/* Add Custom Employee ID Box */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customEmpIdInput}
                    onChange={(e) => {
                      setCustomEmpIdInput(e.target.value);
                      setEmpInputError('');
                    }}
                    placeholder="กรอกรหัสพนักงาน (5 หลัก เช่น 54013, 54020)..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddIndividual(customEmpIdInput)}
                    className="px-4 py-2 rounded-xl bg-[#002D5A] hover:bg-[#001f3f] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มข้อยกเว้น</span>
                  </button>
                </div>

                {empInputError && (
                  <p className="text-rose-600 text-xs font-semibold">{empInputError}</p>
                )}

                {/* Quick Add Search from Master Roster */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-bold text-[11px]">
                      หรือค้นหาและเลือกจากรายชื่อพนักงาน 230 คน:
                    </span>
                    <div className="relative w-48">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={empSearch}
                        onChange={(e) => setEmpSearch(e.target.value)}
                        placeholder="ค้นหาชื่อ/รหัส..."
                        className="w-full pl-8 pr-2 py-1 text-[11px] rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                    {filteredRoster.map((emp) => {
                      const isAlreadyBypassed = config.bypassedEmpIds.map(x => x.toUpperCase()).includes(emp.empId.toUpperCase());
                      return (
                        <div
                          key={emp.empId}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <strong className="block text-slate-800 truncate">
                              {emp.fullName}
                            </strong>
                            <span className="text-[10px] text-slate-500 font-mono">
                              รหัส: {emp.empId} • แผนก {emp.department}
                            </span>
                          </div>

                          {isAlreadyBypassed ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold shrink-0">
                              ยกเว้นแล้ว
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddIndividual(emp.empId)}
                              className="px-2.5 py-1 rounded bg-[#005A9C] hover:bg-[#003875] text-white text-[10px] font-bold shrink-0 cursor-pointer"
                            >
                              + ยกเว้น
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* List of currently bypassed employees */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 text-xs block">
                  รายชื่อพนักงานที่ได้รับสิทธิ์ยกเว้นพิกัดโลเคชั่น ({config.bypassedEmpIds.length} คน):
                </span>

                {config.bypassedEmpIds.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    ยังไม่มีพนักงานที่ได้รับสิทธิ์ยกเว้นรายบุคคล (ทุกคนต้องเข้าใช้งานในรัศมี 1.0 กม.)
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {config.bypassedEmpIds.map((id) => {
                      const match = MASTER_EMPLOYEE_ROSTER_230.find(e => e.empId.toUpperCase() === id.toUpperCase());
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-300 shadow-2xs text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-[#005A9C] text-sm block">
                              {id}
                            </span>
                            <span className="text-slate-700 font-medium">
                              {match?.fullName || 'พนักงานภายนอก / รหัสพิเศษ'} {match ? `(${match.department})` : ''}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveIndividual(id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                            title="ยกเลิกสิทธิ์ยกเว้น"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COURSE-SPECIFIC BYPASS */}
          {activeTab === 'course' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  ยกเลิกการจำกัดโลเคชั่นตามหลักสูตร (Per-Course Geofence Waiver)
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  เลือกหลักสูตรที่อนุญาตให้พนักงานเข้าเรียนและทำแบบประเมินได้จากทุกที่ (เช่น หลักสูตร AI, ทักษะพนักงานดี, หรือหลักสูตรที่อนุญาตให้ศึกษาต่อที่บ้าน)
                </p>
              </div>

              <div className="space-y-2.5">
                {courses.map((course) => {
                  const isBypassed = config.bypassedCourseIds.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isBypassed
                          ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/30'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {course.code ? `[${course.code}] ` : ''}{course.title}
                          </span>
                          {isBypassed && (
                            <span className="px-2 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shrink-0">
                              ยกเว้นพิกัด
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {course.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleCourse(course.id)}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors shrink-0 cursor-pointer ${
                          isBypassed
                            ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                            : 'bg-[#002D5A] hover:bg-[#001f3f] text-white'
                        }`}
                      >
                        {isBypassed ? 'เปิดจำกัดพิกัด' : 'ยกเลิกจำกัดพิกัด'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: INSPECTION LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    บันทึกการตรวจสอบพิกัด GPS ล่าสุด
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    บันทึกพิกัดและระยะห่างเมื่อพนักงานเข้าสู่ระบบ
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadLogs}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>รีเฟรช</span>
                </button>
              </div>

              {isLoadingLogs ? (
                <div className="p-8 text-center text-slate-400">กำลังโหลดบันทึก...</div>
              ) : recentLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  ยังไม่มีประวัติการเช็คอินพิกัดในระบบ
                </div>
              ) : (
                <div className="space-y-2">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900">{log.fullName}</strong>
                          <span className="font-mono text-slate-500">({log.empId})</span>
                          <span className="text-[10px] text-slate-400">• แผนก {log.department}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
                          <span>📍 {getAreaDescription(log.distanceKm)}</span>
                          <span>•</span>
                          <span className="font-mono">ระยะ: {formatDistanceThai(log.distanceKm)}</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.isWithinGeofence
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {log.statusLabelTh}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {log.displayTime}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 text-[11px]">
            * การยกเว้นจะมีผลทันทีต่อการ Login และการประเมินผลของพนักงาน
          </div>

          <button
            type="button"
            onClick={() => {
              playCyberClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold cursor-pointer transition-colors shadow-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
