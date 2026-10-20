import React from 'react';
import { UserProfile, Course } from '../types';
import { getAllAvailableCourses } from '../utils/courseManager';
import { isCourseOpenForTrainee, formatThaiDateStr, getCourseSchedule } from '../utils/courseScheduleManager';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  X, 
  GraduationCap,
  Award,
  Layers
} from 'lucide-react';
import { playCyberClick } from '../utils/soundEffects';

interface AssignedCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSelectCourse: (courseId: string) => void;
}

export const AssignedCoursesModal: React.FC<AssignedCoursesModalProps> = ({
  isOpen,
  onClose,
  user,
  onSelectCourse
}) => {
  if (!isOpen) return null;

  const allCourses = getAllAvailableCourses();

  // Evaluate open status for each course
  const coursesWithStatus = allCourses.map(course => {
    const status = isCourseOpenForTrainee(course.id, user.empId, user.department);
    const schedule = getCourseSchedule(course.id);
    const cp = user.coursesProgress?.[course.id];
    const isCompleted = cp?.postTestScore !== undefined && cp?.postTestScore !== null && cp.postTestScore >= (course.passingScore || 8);
    const inProgress = cp && (cp.preTestScore !== null || (cp.completedModules && cp.completedModules.length > 0));

    return {
      course,
      status,
      schedule,
      isCompleted,
      inProgress
    };
  });

  // Filter courses that are OPEN for training during this period
  const openCourses = coursesWithStatus.filter(c => c.status.isOpen);
  const closedCourses = coursesWithStatus.filter(c => !c.status.isOpen);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn font-sarabun">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002855] via-[#003875] to-[#005A9C] text-white p-5 sm:p-6 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-[11px] font-bold border border-white/20 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5" />
                <span>หลักสูตรฝึกอบรมที่ได้รับมอบหมาย • TCT ACADEMY</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                รายการหลักสูตรที่ต้องเข้าอบรม
              </h2>
              <p className="text-xs text-blue-100 flex items-center gap-2 flex-wrap">
                <span>พนักงาน: <strong className="text-white">{user.fullName}</strong></span>
                <span>•</span>
                <span>รหัส: <strong className="text-amber-300 font-mono">{user.empId}</strong></span>
                <span>•</span>
                <span>แผนก: <strong className="text-white">{user.department}</strong></span>
                <span>•</span>
                <span>ตำแหน่ง: <strong className="text-white">{user.position || 'พนักงาน'}</strong></span>
              </p>
            </div>
            
            <button
              onClick={() => {
                playCyberClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex items-center gap-2 text-xs text-[#002855]">
          <Calendar className="w-4 h-4 text-[#005A9C] shrink-0" />
          <span>
            ระบบแสดงเฉพาะหลักสูตรที่ <strong>เปิดให้อบรมตามช่วงเวลาที่ผู้ดูแลระบบกำหนด</strong> ในขณะนี้
          </span>
        </div>

        {/* Course List Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {openCourses.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">
                ขณะนี้ไม่มีหลักสูตรที่เปิดให้อบรมสำหรับท่าน
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                หลักสูตรอาจยังไม่ถึงช่วงวันที่เปิดอบรม หรือปิดการอบรมตามกำหนดการ กรุณาตรวจสอบกับผู้ดูแลระบบ แผนก Personnel
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {openCourses.map(({ course, schedule, isCompleted, inProgress }) => {
                const isCurrentActive = user.selectedCourseId === course.id;
                return (
                  <div
                    key={course.id}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrentActive
                        ? 'border-[#005A9C] bg-blue-50/50 shadow-sm'
                        : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#002855] text-white">
                          {course.code || 'TCT'}
                        </span>
                        {schedule.startDate && schedule.endDate && (
                          <span className="text-[11px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="w-3 h-3 text-blue-600" />
                            <span>เปิด: {formatThaiDateStr(schedule.startDate)} - {formatThaiDateStr(schedule.endDate)}</span>
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ผ่านการอบรมแล้ว</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                        {course.title}
                      </h3>
                      
                      <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.moduleCount || 3} บทเรียน</span>
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.duration || '45-60 นาที'}</span>
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>เกณฑ์ผ่าน {course.passingCriteria || '≥ 80%'}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playCyberClick();
                        onSelectCourse(course.id);
                        onClose();
                      }}
                      className={`h-11 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-xs whitespace-nowrap ${
                        isCompleted
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : inProgress
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-[#005A9C] hover:bg-[#004070] text-white'
                      }`}
                    >
                      <span>
                        {isCompleted
                          ? 'ดูผลและทบทวนบทเรียน'
                          : inProgress
                          ? 'เรียนต่อจากเดิม'
                          : 'เข้าสู่การอบรม'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Closed courses preview (if any) */}
          {closedCourses.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-500 mb-2">
                หลักสูตรอื่นๆ ที่ยังไม่เปิดให้เข้าอบรมในรอบนี้ ({closedCourses.length} หลักสูตร)
              </div>
              <div className="space-y-1.5 opacity-65">
                {closedCourses.map(({ course, status, schedule }) => (
                  <div
                    key={course.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-700 truncate">{course.title}</div>
                      <div className="text-[11px] text-slate-400">{status.message}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-200 px-2 py-0.5 rounded whitespace-nowrap">
                      ปิดรับ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            ระบบฝึกอบรมและพัฒนาออนไลน์ TCT E-Training
          </span>
          <button
            type="button"
            onClick={() => {
              playCyberClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition-all cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
