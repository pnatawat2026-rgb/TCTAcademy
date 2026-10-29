import React, { useState } from 'react';
import { getAllAvailableCourses } from '../utils/courseManager';
import { 
  getAllCourseSchedules, 
  saveCourseSchedule, 
  CourseScheduleConfig, 
  formatThaiDateStr 
} from '../utils/courseScheduleManager';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Power, 
  Save, 
  Sparkles, 
  Layers, 
  AlertCircle,
  Building2,
  RefreshCw,
  Info
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

interface AdminCourseScheduleSettingsProps {
  onScheduleUpdated?: () => void;
}

export const AdminCourseScheduleSettings: React.FC<AdminCourseScheduleSettingsProps> = ({
  onScheduleUpdated
}) => {
  const courses = getAllAvailableCourses();
  const [schedules, setSchedules] = useState<Record<string, CourseScheduleConfig>>(() => getAllCourseSchedules());
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleToggleOpen = (courseId: string) => {
    playCyberClick();
    const current = schedules[courseId] || {
      courseId,
      isOpen: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    };

    const updated = { ...current, isOpen: !current.isOpen };
    saveCourseSchedule(courseId, updated);
    setSchedules(prev => ({ ...prev, [courseId]: updated }));
    setSaveNotice(`อัปเดตสถานะหลักสูตร "${courseId}" เรียบร้อยแล้ว`);
    setTimeout(() => setSaveNotice(null), 3000);
    if (onScheduleUpdated) onScheduleUpdated();
  };

  const handleDateChange = (courseId: string, field: 'startDate' | 'endDate', value: string) => {
    const current = schedules[courseId] || {
      courseId,
      isOpen: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    };

    const updated = { ...current, [field]: value };
    saveCourseSchedule(courseId, updated);
    setSchedules(prev => ({ ...prev, [courseId]: updated }));
  };

  const handleQuickPreset = (courseId: string, preset: 'applied_week' | 'month' | 'closed') => {
    playCyberClick();
    let updated: Partial<CourseScheduleConfig> = {};
    if (preset === 'applied_week') {
      updated = {
        isOpen: true,
        startDate: '2026-10-12',
        endDate: '2026-10-16',
        note: 'รอบที่ 1: 12 ตุลาคม 2569 - 16 ตุลาคม 2569'
      };
    } else if (preset === 'month') {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      updated = {
        isOpen: true,
        startDate: firstDay,
        endDate: lastDay,
        note: 'เปิดให้อบรมตลอดทั้งเดือน'
      };
    } else if (preset === 'closed') {
      updated = {
        isOpen: false,
        note: 'ปิดรับการฝึกอบรมชั่วคราว'
      };
    }

    saveCourseSchedule(courseId, updated);
    setSchedules(getAllCourseSchedules());
    playSuccessChime();
    setSaveNotice(`กำหนดช่วงเวลาสำหรับหลักสูตรเรียบร้อยแล้ว`);
    setTimeout(() => setSaveNotice(null), 3000);
    if (onScheduleUpdated) onScheduleUpdated();
  };

  return (
    <div className="space-y-4 font-sarabun text-slate-800 w-full max-w-full">
      
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-[#002855] via-[#003875] to-[#005A9C] text-white p-4 sm:p-5 rounded-2xl shadow-md relative overflow-hidden w-full max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-[10px] sm:text-xs font-bold border border-white/20 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5" />
              <span>ระบบจัดการช่วงเวลาเปิด-ปิดหลักสูตร</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              กำหนดช่วงวันที่เปิดและปิดรับการอบรมรายหลักสูตร
            </h2>
            <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
              กำหนดวันเริ่มต้นและวันสิ้นสุดของแต่ละหลักสูตร พนักงานจะเข้าอบรมได้เฉพาะหลักสูตรที่เปิดอยู่ในช่วงเวลาที่กำหนด
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-blue-100 shrink-0 self-start sm:self-auto">
            <span className="font-bold text-amber-300">รวมทั้งหมด:</span> {courses.length} หลักสูตร
          </div>
        </div>
      </div>

      {/* Save Notification */}
      {saveNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{saveNotice}</span>
        </div>
      )}

      {/* Course Schedule Cards Grid */}
      <div className="space-y-3 w-full">
        {courses.map((course) => {
          const cfg = schedules[course.id] || {
            courseId: course.id,
            isOpen: true,
            startDate: '2026-10-12',
            endDate: '2026-10-16',
            note: ''
          };

          const isNowOpen = cfg.isOpen;
          const today = new Date().toISOString().split('T')[0];
          const isDateActive = cfg.startDate && cfg.endDate ? (today >= cfg.startDate && today <= cfg.endDate) : true;

          return (
            <div
              key={course.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all bg-white shadow-2xs w-full max-w-full ${
                isNowOpen && isDateActive
                  ? 'border-emerald-300 hover:shadow-xs'
                  : !isNowOpen
                  ? 'border-slate-300 bg-slate-50/60 opacity-85'
                  : 'border-amber-300 bg-amber-50/30'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Course Metadata */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#002855] text-white">
                      {course.code || 'TCT'}
                    </span>

                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 whitespace-nowrap ${
                      isNowOpen && isDateActive
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : !isNowOpen
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        isNowOpen && isDateActive ? 'bg-emerald-500 animate-ping' : !isNowOpen ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      <span>
                        {isNowOpen && isDateActive
                          ? 'กำลังเปิดให้อบรม (Active Now)'
                          : !isNowOpen
                          ? 'ปิดรับการอบรม (Manual OFF)'
                          : 'อยู่นอกช่วงเวลาเปิดรับ'}
                      </span>
                    </span>

                    {cfg.startDate && cfg.endDate && (
                      <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                        (ช่วงเวลา: {formatThaiDateStr(cfg.startDate)} - {formatThaiDateStr(cfg.endDate)})
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {course.description}
                  </p>
                </div>

                {/* Right Side: ON/OFF Switch & Date Range Pickers */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto shrink-0">
                  
                  {/* Master Switch */}
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200 justify-between sm:justify-start">
                    <button
                      type="button"
                      onClick={() => handleToggleOpen(course.id)}
                      className={`w-full sm:w-auto px-3 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        cfg.isOpen
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-rose-600 text-white shadow-xs'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{cfg.isOpen ? 'เปิดระบบ (ON)' : 'ปิดระบบ (OFF)'}</span>
                    </button>
                  </div>

                  {/* Date Inputs */}
                  <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 whitespace-nowrap">เปิด:</span>
                      <input
                        type="date"
                        value={cfg.startDate || ''}
                        onChange={(e) => handleDateChange(course.id, 'startDate', e.target.value)}
                        className="px-1.5 py-1 rounded-md bg-white border border-slate-300 font-mono text-[11px] sm:text-xs w-[115px] sm:w-auto focus:ring-1 focus:ring-[#005A9C]"
                      />
                    </div>
                    <span className="text-slate-400 font-bold">-</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 whitespace-nowrap">ปิด:</span>
                      <input
                        type="date"
                        value={cfg.endDate || ''}
                        onChange={(e) => handleDateChange(course.id, 'endDate', e.target.value)}
                        className="px-1.5 py-1 rounded-md bg-white border border-slate-300 font-mono text-[11px] sm:text-xs w-[115px] sm:w-auto focus:ring-1 focus:ring-[#005A9C]"
                      />
                    </div>
                  </div>

                  {/* Preset Shortcuts */}
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleQuickPreset(course.id, 'applied_week')}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#005A9C] border border-blue-200 font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer whitespace-nowrap"
                      title="ตั้งค่ารอบ 12-16 ต.ค. 2569"
                    >
                      12-16 ต.ค.
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPreset(course.id, 'month')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer whitespace-nowrap"
                      title="เปิดทั้งเดือน"
                    >
                      ทั้งเดือน
                    </button>
                  </div>

                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
