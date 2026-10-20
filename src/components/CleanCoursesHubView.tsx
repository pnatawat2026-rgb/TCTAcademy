import React, { useState, useEffect, useMemo } from 'react';
import { 
  EmployeeRecord, 
  FirestoreCourseData, 
  subscribeToCourses, 
  subscribeToTrainingRecords, 
  TrainingRecordData 
} from '../firebase';
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  LogOut, 
  ShieldCheck, 
  Sliders, 
  Sparkles, 
  Building2, 
  Search,
  Settings,
  GraduationCap
} from 'lucide-react';
import { playCyberClick } from '../utils/soundEffects';

interface CleanCoursesHubViewProps {
  employee: EmployeeRecord;
  onSelectCourse: (course: FirestoreCourseData) => void;
  onLogout: () => void;
  onOpenAdminConsole?: () => void;
}

export const CleanCoursesHubView: React.FC<CleanCoursesHubViewProps> = ({
  employee,
  onSelectCourse,
  onLogout,
  onOpenAdminConsole
}) => {
  const [courses, setCourses] = useState<FirestoreCourseData[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecordData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubCourses = subscribeToCourses(setCourses);
    const unsubRecords = subscribeToTrainingRecords(setTrainingRecords);
    return () => {
      unsubCourses();
      unsubRecords();
    };
  }, []);

  // Filter my completed records
  const myCompletedMap = new Map<string, TrainingRecordData>();
  trainingRecords
    .filter(r => r.empId === employee.empId && r.passed)
    .forEach(r => {
      myCompletedMap.set(r.courseId, r);
    });

  const filteredCourses = courses.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      (c.thaiTitle && c.thaiTitle.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q))
    );
  });

  // Deduplicate courses and ensure guaranteed unique key
  const uniqueCourses = useMemo(() => {
    const seen = new Set<string>();
    return filteredCourses.filter((c, idx) => {
      const key = c.id || c.code || `course-${idx}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredCourses]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sarabun">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">TCT Academy</span>
                {employee.role === 'admin' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900/80 text-blue-200 border border-blue-500/40">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {employee.fullName} • แผนก {employee.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {employee.role === 'admin' && onOpenAdminConsole && (
              <button
                onClick={() => {
                  playCyberClick();
                  onOpenAdminConsole();
                }}
                className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            )}

            <button
              onClick={() => {
                playCyberClick();
                onLogout();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Welcome Profile Banner */}
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/60 border border-blue-500/30 rounded-3xl p-5 sm:p-7 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  พนักงานยืนยันตัวตนสำเร็จ
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                ยินดีต้อนรับ, คุณ{employee.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                รหัสพนักงาน: <span className="font-bold text-white">{employee.empId}</span> • แผนก: <span className="font-bold text-white">{employee.department}</span> • ตำแหน่ง: <span className="font-bold text-white">{employee.position}</span>
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-3 px-5 text-center shrink-0 self-stretch sm:self-auto">
              <div className="text-xs text-slate-400">วิชาที่สำเร็จแล้ว</div>
              <div className="text-2xl font-black text-emerald-400">
                {myCompletedMap.size} / {courses.length}
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อหลักสูตร หรือรหัสวิชา..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Courses Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>รายการหลักสูตรทั้งหมด ({uniqueCourses.length})</span>
            <span>กดปุ่มเพื่อเริ่มเรียน</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uniqueCourses.map((course, idx) => {
              const uniqueKey = course.id ? `course-${course.id}` : `course-idx-${idx}`;
              const completedRecord = myCompletedMap.get(course.id);
              const isPassed = Boolean(completedRecord);

              return (
                <div
                  key={uniqueKey}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all hover:bg-slate-900"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-950/70 text-cyan-300 border border-blue-500/30">
                        {course.code || 'COURSE'}
                      </span>
                      {isPassed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ผ่านแล้ว ({completedRecord?.examScore}/{completedRecord?.examTotal})</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">
                          ยังไม่ได้เรียน
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-bold text-white leading-snug">
                      {course.title}
                    </h2>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{course.duration || '45 นาที'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>เกณฑ์ผ่าน: {course.passingScore || 8} คะแนน</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playCyberClick();
                        onSelectCourse(course);
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isPassed
                          ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-600/20 active:scale-[0.99]'
                      }`}
                    >
                      <span>{isPassed ? 'ดูใบเกียรติบัตร / เรียนซ้ำ' : 'เข้าเรียนหลักสูตรนี้'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
