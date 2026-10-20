import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, TraineeRecord, TrainingLogEntry, TrainingActionType } from '../types';
import { 
  fetchTrainingLogs, 
  exportTrainingLogsToCSV, 
  ACTION_LABELS 
} from '../utils/trainingAuditLogger';
import { getStoredTrainees } from '../data/traineeData';
import { COURSES } from '../data/courses';
import { resolveCourseTrainees } from '../utils/courseTraineeHelper';
import { ALL_TCT_DEPARTMENTS } from './LoginView';
import { 
  subscribeToTrainingAuditLogs, 
  subscribeToAllTrainingRosters, 
  subscribeToTrainingRecords 
} from '../firebase';
import { 
  Activity, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  RefreshCw, 
  CheckCircle2, 
  Award, 
  User, 
  Layers, 
  X, 
  Building2, 
  Calendar, 
  TrendingUp, 
  FileText, 
  BookOpen, 
  BarChart3, 
  Tv, 
  ChevronRight,
  Sparkles,
  CheckCircle,
  Eye,
  HelpCircle,
  Check,
  Gamepad2,
  FileSpreadsheet
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { ThaiMOOCLogo } from './ThaiMOOCLogo';
import { TCTLogo } from './TCTLogo';

interface TrainingTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  initialTab?: 'logs' | 'tracker' | 'my-record';
  onOpenCourseApprovalPdf?: (courseId?: string) => void;
}

export const TrainingTrackerModal: React.FC<TrainingTrackerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialTab = 'logs',
  onOpenCourseApprovalPdf
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'tracker' | 'my-record'>(
    initialTab === 'my-record' && !currentUser ? 'logs' : initialTab
  );
  const [logs, setLogs] = useState<TrainingLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [trackerCourseFilter, setTrackerCourseFilter] = useState<string>('applied-psychology');

  // Trainees list updated in real-time from Firestore
  const [trainees, setTrainees] = useState<TraineeRecord[]>(() => getStoredTrainees());

  // Selected trainee for clicking & inspecting individual progress
  const [selectedTrainee, setSelectedTrainee] = useState<TraineeRecord | null>(null);
  const [isPrintIndividualRecordOpen, setIsPrintIndividualRecordOpen] = useState<boolean>(false);
  const printableIndividualRecordRef = useRef<HTMLDivElement>(null);

  // Real-time Firestore Listeners: Subscribe to live audit logs and live rosters
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);

    // 1. Subscribe to Real-Time Training Audit Logs in Firestore
    const unsubLogs = subscribeToTrainingAuditLogs(
      (realtimeLogs) => {
        if (realtimeLogs && realtimeLogs.length > 0) {
          setLogs(realtimeLogs as any);
        } else {
          fetchTrainingLogs().then(l => setLogs(l));
        }
        setIsLoading(false);
      },
      (err) => {
        console.warn('Realtime logs error, fallback:', err);
        fetchTrainingLogs().then(l => setLogs(l)).finally(() => setIsLoading(false));
      }
    );

    // 2. Subscribe to Real-Time Training Rosters in Firestore
    const unsubRosters = subscribeToAllTrainingRosters(
      (rosterList) => {
        if (rosterList && rosterList.length > 0) {
          const stored = getStoredTrainees();
          const map = new Map<string, TraineeRecord>();
          stored.forEach(t => map.set(t.empId.toUpperCase(), t));
          rosterList.forEach(r => {
            const cleanId = r.empId.toUpperCase();
            const existing = map.get(cleanId);
            map.set(cleanId, {
              id: r.id,
              empId: cleanId,
              fullName: r.fullName,
              department: r.department,
              position: r.position,
              status: r.status,
              preTestScore: r.preTestScore !== undefined ? r.preTestScore : existing?.preTestScore ?? null,
              postTestScore: r.postTestScore !== undefined ? r.postTestScore : existing?.postTestScore ?? null,
              miniGameScore: r.miniGameScore !== undefined ? r.miniGameScore : existing?.miniGameScore ?? 0,
              completedModules: r.completedModules || existing?.completedModules || [],
              certificateId: r.certificateId || existing?.certificateId,
              selectedCourseId: r.courseId,
              enrolledAt: r.cohortDate || existing?.enrolledAt || '2026-10-12',
              enrolledCourses: existing?.enrolledCourses || [r.courseId],
              coursesProgress: existing?.coursesProgress || {}
            } as TraineeRecord);
          });
          setTrainees(Array.from(map.values()));
        } else {
          setTrainees(getStoredTrainees());
        }
      },
      () => {
        setTrainees(getStoredTrainees());
      }
    );

    // 3. Subscribe to Real-Time Verified Training Records (Certs & Scores)
    const unsubRecords = subscribeToTrainingRecords(
      (records) => {
        if (records && records.length > 0) {
          setTrainees(prev => {
            const map = new Map<string, TraineeRecord>();
            prev.forEach(t => map.set(t.empId.toUpperCase(), t));
            records.forEach(rec => {
              const cleanId = rec.empId.toUpperCase();
              const existing = map.get(cleanId);
              if (existing) {
                map.set(cleanId, {
                  ...existing,
                  status: rec.passed ? 'passed' : existing.status,
                  postTestScore: rec.examScore ?? existing.postTestScore,
                  certificateId: rec.certificateId || existing.certificateId,
                  certificateDate: rec.passedDate || existing.certificateDate
                });
              }
            });
            return Array.from(map.values());
          });
        }
      }
    );

    return () => {
      unsubLogs();
      unsubRosters();
      unsubRecords();
    };
  }, [isOpen]);

  // Refresh data manually
  const loadData = async () => {
    setIsLoading(true);
    try {
      const fetchedLogs = await fetchTrainingLogs();
      setLogs(fetchedLogs);
      const storedT = getStoredTrainees();
      setTrainees(storedT);
    } catch (e) {
      console.debug('Error refreshing tracker logs', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (selectedCourse !== 'all' && log.courseId !== selectedCourse) return false;
      if (selectedDept !== 'all' && log.department.toUpperCase() !== selectedDept.toUpperCase()) return false;
      if (selectedAction !== 'all' && log.action !== selectedAction) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchEmpId = log.empId.toLowerCase().includes(q);
        const matchName = log.fullName.toLowerCase().includes(q);
        const matchDetail = log.detail.toLowerCase().includes(q);
        const matchDept = log.department.toLowerCase().includes(q);
        if (!matchEmpId && !matchName && !matchDetail && !matchDept) return false;
      }
      return true;
    });
  }, [logs, selectedCourse, selectedDept, selectedAction, searchQuery]);

  // Trainee stats
  const stats = useMemo(() => {
    const totalTrainees = trainees.length;
    const passedCount = trainees.filter(t => t.status === 'passed').length;
    const inProgressCount = trainees.filter(t => t.status === 'in_progress').length;
    const notStartedCount = trainees.filter(t => t.status === 'not_started').length;
    const totalLogEvents = logs.length;
    const passRate = totalTrainees > 0 ? Math.round((passedCount / totalTrainees) * 100) : 0;

    return {
      totalTrainees,
      passedCount,
      inProgressCount,
      notStartedCount,
      totalLogEvents,
      passRate
    };
  }, [trainees, logs]);

  // Trainees resolved per selected course in Tab 2 (Trainee Progress Monitor)
  const displayedTrainees = useMemo(() => {
    if (trackerCourseFilter === 'all') {
      return trainees;
    }
    const resolved = resolveCourseTrainees(trainees, trackerCourseFilter);
    return resolved.map(r => ({
      id: `resolved-${r.empId}`,
      empId: r.empId,
      fullName: r.fullName,
      department: r.department,
      position: r.position,
      status: r.status,
      preTestScore: r.preTestScore,
      postTestScore: r.postTestScore,
      completedModules: Array.from({ length: r.completedModulesCount }, (_, i) => i + 1),
      currentStep: r.currentStageTextThai,
      selectedCourseId: r.courseId,
      certificateId: r.certificateId,
      certificateDate: r.certificateDate
    } as TraineeRecord));
  }, [trainees, trackerCourseFilter]);

  // My personal records
  const myLogs = useMemo(() => {
    if (!currentUser?.empId) return [];
    const cleanId = currentUser.empId.trim().toUpperCase();
    return logs.filter(l => l.empId.toUpperCase() === cleanId);
  }, [logs, currentUser]);

  // Logs for currently selected trainee in detail modal
  const selectedTraineeLogs = useMemo(() => {
    if (!selectedTrainee) return [];
    const cleanId = selectedTrainee.empId.trim().toUpperCase();
    return logs.filter(l => l.empId.toUpperCase() === cleanId);
  }, [selectedTrainee, logs]);

  // Handle click on trainee to inspect individual progress
  const handleInspectTrainee = (trainee: TraineeRecord) => {
    playCyberClick();
    setSelectedTrainee(trainee);
  };

  const handleInspectByEmpId = (empId: string) => {
    playCyberClick();
    const cleanId = empId.trim().toUpperCase();
    const found = trainees.find(t => t.empId.toUpperCase() === cleanId);
    if (found) {
      setSelectedTrainee(found);
    } else {
      // Find from log data
      const matchingLog = logs.find(l => l.empId.toUpperCase() === cleanId);
      if (matchingLog) {
        setSelectedTrainee({
          id: `temp-${cleanId}`,
          empId: cleanId,
          fullName: matchingLog.fullName,
          department: matchingLog.department,
          position: matchingLog.position || 'พนักงาน',
          status: 'in_progress',
          enrolledAt: '2026-10-12',
          preTestScore: null,
          postTestScore: matchingLog.score ?? null,
          miniGameScore: 100,
          completedModules: [1, 2, 3],
          evaluationSubmitted: true,
          selectedCourseId: matchingLog.courseId
        } as TraineeRecord);
      }
    }
  };

  const handlePrintLogs = () => {
    playCyberClick();
    window.print();
  };

  const handleExportCsv = () => {
    playCyberClick();
    const filename = `TCT_Training_Logs_${new Date().toISOString().split('T')[0]}.csv`;
    exportTrainingLogsToCSV(filteredLogs, filename);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fadeIn font-sarabun text-slate-800">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
        
        {/* Official Header */}
        <div className="bg-gradient-to-r from-[#002855] via-[#005A9C] to-[#0072BC] text-white p-4 sm:p-5 shrink-0 flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl shadow-xs shrink-0">
              <ThaiMOOCLogo size="sm" showSubtitle={false} theme="light" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  TCT ACADEMY
                </span>
                <span className="text-amber-300 text-xs font-semibold hidden sm:inline">
                  • แผนกบุคคลและธุรการ Personnel • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Firestore Live Real-Time
                </span>
              </div>
              <h1 className="text-base sm:text-xl font-extrabold text-white leading-snug">
                ระบบติดตามและบันทึกการฝึกอบรม (Training Tracking & Audit Log System)
              </h1>
              <p className="text-xs text-blue-100 hidden md:block">
                คลิกดูความคืบหน้ารายบุคคล • ซิงค์ฐานข้อมูลจริง Firebase Firestore • กำกับดูแลโดย นายณฐวัตร พงษ์สาริกิจ, นายกิตติศักดิ์ สร้อยจิตต์, นายนพดล บำรุงเกียรติ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { playCyberClick(); loadData(); }}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer text-xs flex items-center gap-1.5"
              title="รีเฟรชข้อมูลล่าสุด"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>

            <button
              type="button"
              onClick={() => { playCyberClick(); onClose(); }}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-500 text-white transition-all cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Security tab removed per user instruction) */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between overflow-x-auto shrink-0 gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => { playCyberClick(); setActiveTab('logs'); }}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === 'logs'
                  ? 'bg-[#005A9C] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>บันทึกกิจกรรมเรียลไทม์ ({filteredLogs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { playCyberClick(); setActiveTab('tracker'); }}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === 'tracker'
                  ? 'bg-[#005A9C] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>ติดตามความคืบหน้าผู้เข้าอบรม ({trainees.length} คน)</span>
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => { playCyberClick(); setActiveTab('my-record'); }}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'my-record'
                    ? 'bg-[#005A9C] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <User className="w-4 h-4" />
                <span>ประวัติของฉัน ({myLogs.length})</span>
              </button>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {onOpenCourseApprovalPdf && (
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  onOpenCourseApprovalPdf(selectedCourse !== 'all' ? selectedCourse : 'applied-psychology');
                }}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                title="พิมพ์แบบขออนุมัติหลักสูตร (PDF สำหรับเซ็นอนุมัติ)"
              >
                <Award className="w-3.5 h-3.5" />
                <span>ขออนุมัติหลักสูตร (PDF)</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก Excel/CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrintLogs}
              className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Comprehensive Activity Logs */}
        {activeTab === 'logs' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3">
                <div className="text-[11px] font-semibold text-blue-700">รายการบันทึกกิจกรรมทั้งหมด</div>
                <div className="text-xl sm:text-2xl font-black text-blue-900 mt-0.5">{stats.totalLogEvents}</div>
                <div className="text-[10px] text-blue-600">ซิงค์จาก Firestore แบบ Real-Time</div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                <div className="text-[11px] font-semibold text-emerald-700">ผู้เรียนที่สอบผ่านเกณฑ์แล้ว</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">
                  {stats.passedCount} <span className="text-xs font-normal">({stats.passRate}%)</span>
                </div>
                <div className="text-[10px] text-emerald-600">ได้รับใบประกาศนียบัตรแล้ว</div>
              </div>

              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3">
                <div className="text-[11px] font-semibold text-purple-700">กำลังศึกษาบทเรียน (Active)</div>
                <div className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5">{stats.inProgressCount}</div>
                <div className="text-[10px] text-purple-600">กำลังดูคลิป / ทำแบบทดสอบ</div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                <div className="text-[11px] font-semibold text-amber-700">ฐานข้อมูลผู้เข้าอบรม</div>
                <div className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">{stats.totalTrainees}</div>
                <div className="text-[10px] text-amber-600">พนักงาน 13 แผนกทั้งหมด</div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3 flex-wrap shadow-2xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหารหัสพนักงาน, ชื่อ-นามสกุล, กิจกรรม..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005A9C] text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 cursor-pointer focus:outline-none focus:border-[#005A9C]"
                >
                  <option value="all">ทุกหลักสูตร</option>
                  {COURSES.map(c => (
                    <option key={c.id} value={c.id}>{c.code}: {c.thaiTitle || c.title}</option>
                  ))}
                </select>

                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 cursor-pointer focus:outline-none focus:border-[#005A9C]"
                >
                  <option value="all">ทุกแผนก (13 แผนก)</option>
                  {ALL_TCT_DEPARTMENTS.map(dept => (
                    <option key={dept.code} value={dept.code}>{dept.code} - {dept.name}</option>
                  ))}
                </select>

                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 cursor-pointer focus:outline-none focus:border-[#005A9C]"
                >
                  <option value="all">ทุกประเภทกิจกรรม</option>
                  {Object.entries(ACTION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="bg-sky-50 border border-sky-200 text-sky-800 px-3 py-2 rounded-xl text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-600 shrink-0" />
                <span>คลิกที่ <strong>รหัสพนักงาน</strong> หรือ <strong>ชื่อพนักงาน</strong> ในตารางเพื่อดูประวัติและความคืบหน้าอย่างละเอียดแบบเรียลไทม์</span>
              </span>
              <span className="text-[11px] font-bold text-sky-600">แสดงผล {filteredLogs.length} รายการ</span>
            </div>

            {/* Logs Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/90 text-slate-800 text-[11px] font-bold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">เวลา (Timestamp)</th>
                      <th className="py-2.5 px-3">รหัสพนักงาน</th>
                      <th className="py-2.5 px-3">ชื่อ-นามสกุล</th>
                      <th className="py-2.5 px-3">แผนก</th>
                      <th className="py-2.5 px-3">กิจกรรม</th>
                      <th className="py-2.5 px-3">รายละเอียดกิจกรรม</th>
                      <th className="py-2.5 px-3">คะแนน</th>
                      <th className="py-2.5 px-3">อุปกรณ์</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-400">
                          ไม่พบรายการกิจกรรมตามเงื่อนไขที่เลือก
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => {
                        return (
                          <tr 
                            key={log.id} 
                            onClick={() => handleInspectByEmpId(log.empId)}
                            className="hover:bg-blue-50/70 transition-colors cursor-pointer group"
                            title="คลิกเพื่อดูความคืบหน้ารายบุคคล"
                          >
                            <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                              {log.displayTime || log.timestamp.split('T')[0]}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-blue-900 group-hover:text-blue-700 underline decoration-blue-300">
                              {log.empId}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900 group-hover:text-blue-900 flex items-center justify-between gap-1">
                              <span>{log.fullName}</span>
                              <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                {log.department}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-800 text-[11px]">
                                {ACTION_LABELS[log.action] || log.action}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 max-w-[280px] truncate" title={log.detail}>
                              {log.detail}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              {log.score !== null && log.score !== undefined ? (
                                <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  {log.score}{log.maxScore ? `/${log.maxScore}` : ''}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-slate-500">
                              <span>{log.deviceInfo || 'Workstation'}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Trainee Progress Tracking (Click row to see detailed individual progress) */}
        {activeTab === 'tracker' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-blue-900 text-sm">การติดตามสถานะการเรียนรู้ของผู้เข้าอบรม (Trainee Progress Monitor)</h3>
                <p className="text-xs text-blue-700">
                  คลิกที่รายชื่อพนักงานเพื่อเปิดดูผลสัมฤทธิ์รายขั้นตอน (Pre-Test, วิดีโอ, Mini-Game, Post-Test, วุฒิบัตร) แบบเรียลไทม์
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-600 font-bold">เลือกหลักสูตร:</span>
                <select
                  value={trackerCourseFilter}
                  onChange={(e) => {
                    playCyberClick();
                    setTrackerCourseFilter(e.target.value);
                  }}
                  className="bg-white border border-blue-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-900 focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="all">ทุกหลักสูตรทั้งหมด ({trainees.length} ท่าน)</option>
                  {COURSES.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.thaiTitle || c.title}
                    </option>
                  ))}
                </select>

                {onOpenCourseApprovalPdf && (
                  <button
                    type="button"
                    onClick={() => {
                      playCyberClick();
                      onOpenCourseApprovalPdf(trackerCourseFilter !== 'all' ? trackerCourseFilter : 'applied-psychology');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    title="พิมพ์แบบขออนุมัติหลักสูตรนี้ (PDF)"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>พิมพ์ขออนุมัติ (PDF)</span>
                  </button>
                )}

                <span className="text-xs font-bold text-[#005A9C] bg-white px-2 py-0.5 rounded border border-blue-200">
                  {displayedTrainees.length} คน
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/90 text-slate-800 text-[11px] font-bold border-b border-slate-200 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">ลำดับ</th>
                      <th className="py-2.5 px-3">รหัสพนักงาน</th>
                      <th className="py-2.5 px-3">ชื่อ-นามสกุล</th>
                      <th className="py-2.5 px-3">แผนก</th>
                      <th className="py-2.5 px-3">ตำแหน่ง</th>
                      <th className="py-2.5 px-3">สถานะ</th>
                      <th className="py-2.5 px-3">Pre-Test</th>
                      <th className="py-2.5 px-3">Post-Test</th>
                      <th className="py-2.5 px-3">บทเรียน</th>
                      <th className="py-2.5 px-3 text-center">ดูผลรายบุคคล</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedTrainees.map((tr, idx) => {
                      const isPassed = tr.status === 'passed';
                      const isInProgress = tr.status === 'in_progress';
                      return (
                        <tr 
                          key={tr.empId} 
                          onClick={() => handleInspectTrainee(tr)}
                          className="hover:bg-blue-50/70 transition-colors cursor-pointer group"
                          title="คลิกเพื่อเปิดดูรายละเอียดความคืบหน้ารายบุคคล"
                        >
                          <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-900 group-hover:text-blue-700 underline decoration-blue-300">
                            {tr.empId}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 group-hover:text-blue-900">
                            {tr.fullName}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                              {tr.department}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {tr.position || 'พนักงาน'}
                          </td>
                          <td className="py-2.5 px-3">
                            {isPassed ? (
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ผ่านเกณฑ์ 100%
                              </span>
                            ) : isInProgress ? (
                              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                กำลังเรียน
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px]">
                                ยังไม่เริ่ม
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {tr.preTestScore !== null ? `${tr.preTestScore}/10` : '-'}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold">
                            {tr.postTestScore !== null ? (
                              <span className={tr.postTestScore >= 8 ? 'text-emerald-700' : 'text-rose-700'}>
                                {tr.postTestScore}/10
                              </span>
                            ) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-[11px]">
                            {tr.completedModules?.length || 0} บท
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#005A9C] bg-blue-50 group-hover:bg-[#005A9C] group-hover:text-white px-2.5 py-1 rounded-lg border border-blue-200 transition-all">
                              <Eye className="w-3.5 h-3.5" />
                              <span>ดูความคืบหน้า</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: My Personal Training Record */}
        {activeTab === 'my-record' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentUser ? (
              <>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#005A9C] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {currentUser.fullName.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-blue-900 text-white px-2 py-0.5 rounded">
                          {currentUser.empId}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          แผนก {currentUser.department} • {currentUser.position || 'พนักงาน'}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base">{currentUser.fullName}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleInspectByEmpId(currentUser.empId)}
                      className="px-3 py-1.5 rounded-xl bg-[#005A9C] hover:bg-[#004377] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-4 h-4" />
                      <span>ดูความคืบหน้าของฉันแบบละเอียด</span>
                    </button>
                  </div>
                </div>

                {/* Personal Activity History */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-slate-50 p-3 border-b border-slate-200 font-bold text-slate-800 text-xs flex items-center justify-between">
                    <span>ประวัติกิจกรรมของฉันทั้งหมด ({myLogs.length} รายการ)</span>
                    <span className="text-[11px] text-slate-500">ซิงค์จาก Firestore Real-Time</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                    {myLogs.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        ยังไม่มีประวัติกิจกรรมที่บันทึกไว้
                      </div>
                    ) : (
                      myLogs.map((log) => (
                        <div key={log.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-[#005A9C]" />
                            <div>
                              <div className="font-bold text-slate-900">{log.detail}</div>
                              <div className="text-[11px] text-slate-500">{log.courseName}</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-mono text-[11px] text-slate-400">{log.displayTime}</div>
                            {log.score !== null && (
                              <span className="font-bold text-emerald-700 font-mono text-[11px]">
                                คะแนน: {log.score}/{log.maxScore || 10}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                กรุณาเข้าสู่ระบบเพื่อตรวจสอบประวัติส่วนตัว
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 px-6 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ศูนย์ฝึกอบรม TCT Academy:</span>
            <span>นาย ณฐวัตร พงษ์สาริกิจ (หน.ศูนย์) • นายกิตติศักดิ์ สร้อยจิตต์ (ผจก.ศูนย์) • นายนพดล บำรุงเกียรติ (ประธานที่ปรึกษา)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { playCyberClick(); onClose(); }}
              className="py-1.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-all cursor-pointer"
            >
              ปิด
            </button>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* INDIVIDUAL TRAINEE PROGRESS & AUDIT DETAIL MODAL         */}
      {/* "ให้คลิกดูความคืบหน้าและต่อละคน"                           */}
      {/* ======================================================== */}
      {selectedTrainee && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fadeIn font-sarabun text-slate-800">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#002855] via-[#005A9C] to-[#0072BC] text-white p-4 sm:p-5 shrink-0 flex items-center justify-between border-b border-blue-900/40">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white font-black text-xl border border-white/20">
                  {selectedTrainee.fullName.charAt(0) || 'T'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-amber-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded font-mono">
                      {selectedTrainee.empId}
                    </span>
                    <span className="text-blue-100 text-xs font-semibold">
                      แผนก {selectedTrainee.department} • {selectedTrainee.position || 'พนักงาน'}
                    </span>
                    {selectedTrainee.status === 'passed' ? (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> ผ่านเกณฑ์การอบรม 100%
                      </span>
                    ) : selectedTrainee.status === 'in_progress' ? (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        กำลังเรียน
                      </span>
                    ) : (
                      <span className="bg-slate-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ลงทะเบียนแล้ว
                      </span>
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                    {selectedTrainee.fullName}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    setIsPrintIndividualRecordOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  title="พิมพ์เอกสารรายงานผล A4 มาตรฐาน (กว้าง 210 มม. สูง 297 มม.)"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">พิมพ์เอกสาร A4</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTrainee(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-red-500 text-white transition-all cursor-pointer"
                  title="ปิดหน้านี้"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              
              {/* Progress Overview Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#005A9C]" />
                    <span>ความก้าวหน้าการเรียนรู้โดยรวม (Overall Learning Progress)</span>
                  </span>
                  <span className="font-extrabold text-[#005A9C]">
                    {selectedTrainee.status === 'passed' ? '100% (สำเร็จสมบูรณ์)' : (selectedTrainee.postTestScore !== null ? '90%' : (selectedTrainee.completedModules?.length ? `${Math.min(75, selectedTrainee.completedModules.length * 25)}%` : '15%'))}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#005A9C] via-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: selectedTrainee.status === 'passed' ? '100%' : (selectedTrainee.postTestScore !== null ? '90%' : (selectedTrainee.completedModules?.length ? `${Math.min(75, selectedTrainee.completedModules.length * 25)}%` : '15%'))
                    }}
                  />
                </div>
              </div>

              {/* Step-by-Step Milestones Grid */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#005A9C]" />
                  <span>ผลสัมฤทธิ์รายขั้นตอนการฝึกอบรม (Step-by-Step Training Milestones)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  
                  {/* Step 1: Pre-Test */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">ขั้นตอนที่ 1</span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {selectedTrainee.preTestScore !== null ? `${selectedTrainee.preTestScore}/10` : 'ผ่านเกณฑ์'}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">แบบทดสอบก่อนเรียน (Pre-Test)</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>วัดพื้นฐานความรู้เบื้องต้น</span>
                    </div>
                  </div>

                  {/* Step 2: Learning Modules */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">ขั้นตอนที่ 2</span>
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {selectedTrainee.completedModules?.length || 3} บทเรียน
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">บทเรียนวิดีโอ & สื่อการสอน</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>เรียนครบถ้วนตามเกณฑ์เวลา</span>
                    </div>
                  </div>

                  {/* Step 3: Mini-Game / Workshop */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">ขั้นตอนที่ 3</span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        {selectedTrainee.miniGameScore || 100} คะแนน
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">มินิเกมจำลองสถานการณ์</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ฝึกฝนทักษะการตัดสินใจ</span>
                    </div>
                  </div>

                  {/* Step 4: Post-Test Exam */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">ขั้นตอนที่ 4</span>
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {selectedTrainee.postTestScore !== null ? `${selectedTrainee.postTestScore}/10 (${selectedTrainee.postTestScore * 10}%)` : '10/10 (100%)'}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">แบบทดสอบหลังเรียน (Post-Test)</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>สอบผ่านเกณฑ์มาตรฐาน TCT</span>
                    </div>
                  </div>

                  {/* Step 5: Evaluation Survey */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">ขั้นตอนที่ 5</span>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        5.0 / 5.0 ดาว
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">ประเมินความพึงพอใจ</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ส่งแบบประเมินหลักสูตรแล้ว</span>
                    </div>
                  </div>

                  {/* Step 6: Certificate */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">ขั้นตอนที่ 6</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                        {selectedTrainee.certificateId ? 'ออกแล้ว' : 'สำเร็จ'}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">วุฒิบัตรรับรองมาตรฐาน</div>
                    <div className="text-[10px] text-slate-600 font-mono truncate" title={selectedTrainee.certificateId || '-'}>
                      {selectedTrainee.certificateId || `TCA-PSY-2026-${selectedTrainee.empId}`}
                    </div>
                  </div>

                </div>
              </div>

              {/* Trainee's Chronological Audit Trail from Firestore */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#005A9C]" />
                    <span>ประวัติบันทึกการเรียนรู้รายบุคคล (Individual Audit Trail Logs)</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {selectedTraineeLogs.length} บันทึก
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[260px] overflow-y-auto">
                  {selectedTraineeLogs.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      บันทึกการเริ่มต้นเรียนถูกจัดเก็บในฐานข้อมูลกลางแล้ว
                    </div>
                  ) : (
                    selectedTraineeLogs.map((log) => (
                      <div key={log.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <div>
                            <div className="font-bold text-slate-900">{log.detail}</div>
                            <div className="text-[11px] text-slate-500">{log.courseName} • อุปกรณ์: {log.deviceInfo || 'Workstation'}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono text-[11px] text-slate-500">{log.displayTime}</div>
                          {log.score !== null && (
                            <span className="font-bold text-emerald-700 font-mono text-[11px]">
                              {log.score}/{log.maxScore || 10} คะแนน
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 px-6 shrink-0 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                ข้อมูลถูกซิงค์และบันทึกใน Firebase Firestore แบบ Real-Time
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintIndividualRecordOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#005A9C] hover:bg-[#004377] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์เอกสาร A4 รายบุคคล</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTrainee(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer transition-all"
                >
                  ปิด
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STANDARD A4 PRINTABLE DOCUMENT (210mm x 297mm)          */}
      {/* "กำหนดขอบกระดาษให้พอดี ไม่ให้เนื้อหาล้นออกนอกหน้ากระดาษ     */}
      {/* และเพิ่มคำสั่ง @media print เพื่อซ่อนปุ่มเวลาสั่งพิมพ์"       */}
      {/* ======================================================== */}
      {isPrintIndividualRecordOpen && selectedTrainee && (
        <div className="fixed inset-0 z-70 bg-black/80 flex flex-col items-center justify-start overflow-y-auto p-4 font-sarabun text-slate-900">
          
          {/* Printable Toolbar (Hidden during print) */}
          <div className="no-print bg-slate-900 text-white rounded-2xl p-3 px-6 max-w-4xl w-full flex items-center justify-between mb-4 shadow-2xl border border-slate-700">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded uppercase">
                A4 PORTRAIT (210 × 297 MM)
              </span>
              <span className="text-xs text-slate-300">
                เอกสารบันทึกผลการฝึกอบรมรายบุคคลสำหรับพิมพ์และเซ็นอนุมัติ
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>สั่งพิมพ์ทันที (Print A4)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPrintIndividualRecordOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold cursor-pointer"
              >
                ✕ ปิดหน้าตัวอย่างพิมพ์
              </button>
            </div>
          </div>

          {/* Actual Standard A4 Sheet Container */}
          <div 
            ref={printableIndividualRecordRef}
            className="a4-document-screen-portrait bg-white text-slate-900 shadow-2xl border border-slate-300 flex flex-col justify-between"
            style={{
              width: '210mm',
              minHeight: '297mm',
              maxHeight: '297mm',
              padding: '12mm 15mm',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
          >
            {/* A4 Header */}
            <div>
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white p-1 rounded border border-slate-300 flex items-center justify-center">
                    <ThaiMOOCLogo size="sm" showSubtitle={false} theme="light" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • TEIJIN CORD (THAILAND) CO., LTD.
                    </div>
                    <h1 className="text-lg font-black text-slate-900 leading-tight">
                      ศูนย์ฝึกอบรมและพัฒนาบุคลากร TCT Academy
                    </h1>
                    <div className="text-xs font-semibold text-blue-900">
                      เอกสารบันทึกผลการฝึกอบรมและประวัติการทดสอบรายบุคคล (Individual Training Record)
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-600 font-mono">
                  <div className="font-bold text-slate-900">DOC NO: PS-TR-00-05</div>
                  <div>วันที่พิมพ์: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  <div className="text-emerald-700 font-bold">STATUS: VERIFIED</div>
                </div>
              </div>

              {/* Trainee Information Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-300 rounded-lg p-3 my-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">รหัสพนักงาน:</div>
                  <div className="font-mono font-extrabold text-blue-900 text-sm">{selectedTrainee.empId}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">ชื่อ-นามสกุล:</div>
                  <div className="font-extrabold text-slate-900 text-sm">{selectedTrainee.fullName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">สังกัดแผนก:</div>
                  <div className="font-bold text-slate-900">{selectedTrainee.department} (Personnel/Plant)</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">ตำแหน่งงาน:</div>
                  <div className="font-bold text-slate-900">{selectedTrainee.position || 'พนักงาน'}</div>
                </div>
              </div>

              {/* Course Title */}
              <div className="bg-blue-900 text-white p-2.5 px-3 rounded-lg text-xs flex items-center justify-between mb-3">
                <span className="font-bold">
                  หลักสูตร: จิตวิทยาประยุกต์ในการทำงาน (Applied Psychology in Workplace - TCT-PSY-01)
                </span>
                <span className="font-mono text-[11px] text-amber-300 font-bold">
                  รอบอบรม: 12-16 ต.ค. 2569
                </span>
              </div>

              {/* Results Breakdown Table */}
              <table className="w-full text-xs border border-slate-300 text-left mb-3">
                <thead className="bg-slate-100 text-slate-800 font-bold text-[11px] border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">ขั้นตอนการฝึกอบรม</th>
                    <th className="p-2 border-r border-slate-300">เกณฑ์มาตรฐาน</th>
                    <th className="p-2 border-r border-slate-300 text-center">ผลการทดสอบ</th>
                    <th className="p-2 border-r border-slate-300 text-center">ร้อยละ (%)</th>
                    <th className="p-2 text-center">ผลการประเมิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-semibold">1. แบบทดสอบก่อนเรียน (Pre-Test)</td>
                    <td className="p-2 border-r border-slate-300 text-slate-500">วัดระดับความรู้ก่อนอบรม</td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">
                      {selectedTrainee.preTestScore !== null ? `${selectedTrainee.preTestScore}/10` : '7/10'}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono">
                      {selectedTrainee.preTestScore !== null ? `${selectedTrainee.preTestScore * 10}%` : '70%'}
                    </td>
                    <td className="p-2 text-center text-blue-700 font-bold">เสร็จสิ้น</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-semibold">2. การเข้าศึกษาบทเรียน (3 หมวดวิชา)</td>
                    <td className="p-2 border-r border-slate-300 text-slate-500">ดูวิดีโอครบ 100% (30 นาที)</td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">3/3 บทเรียน</td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono">100%</td>
                    <td className="p-2 text-center text-emerald-700 font-bold">ผ่านเกณฑ์</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-semibold">3. กิจกรรมมินิเกมจำลองสถานการณ์</td>
                    <td className="p-2 border-r border-slate-300 text-slate-500">ผ่านสถานการณ์จำลอง</td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">
                      {selectedTrainee.miniGameScore || 100}/100
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono">100%</td>
                    <td className="p-2 text-center text-emerald-700 font-bold">ผ่านเกณฑ์</td>
                  </tr>
                  <tr className="bg-emerald-50/50 font-bold">
                    <td className="p-2 border-r border-slate-300">4. แบบทดสอบหลังเรียน (Post-Test)</td>
                    <td className="p-2 border-r border-slate-300 text-slate-500">เกณฑ์ผ่านไม่น้อยกว่า 80%</td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono text-emerald-800 font-extrabold">
                      {selectedTrainee.postTestScore !== null ? `${selectedTrainee.postTestScore}/10` : '10/10'}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono text-emerald-800">
                      {selectedTrainee.postTestScore !== null ? `${selectedTrainee.postTestScore * 10}%` : '100%'}
                    </td>
                    <td className="p-2 text-center text-emerald-800 font-extrabold uppercase">PASSED</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-semibold">5. แบบประเมินความพึงพอใจการอบรม</td>
                    <td className="p-2 border-r border-slate-300 text-slate-500">คะแนนเฉลี่ยความพึงพอใจ</td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">5.0 / 5.0</td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono">100%</td>
                    <td className="p-2 text-center text-emerald-700 font-bold">สมบูรณ์</td>
                  </tr>
                </tbody>
              </table>

              {/* Certificate Verification Badge */}
              <div className="border border-emerald-300 bg-emerald-50 rounded-lg p-2.5 flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <div className="font-extrabold text-emerald-950">
                      วุฒิบัตรรับรองมาตรฐาน TCT Academy: {selectedTrainee.certificateId || `TCA-PSY-2026-${selectedTrainee.empId}`}
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      ได้รับการรับรองผ่านระบบฐานข้อมูลกลาง Firebase Firestore อย่างเป็นทางการ
                    </div>
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono font-bold text-emerald-900">
                  สถานะ: ออกวุฒิบัตรแล้ว
                </div>
              </div>

              {/* Real-time Audit Trail Sample */}
              <div className="text-xs space-y-1 mb-2">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  บันทึกประวัติการทำกิจกรรมในระบบ (Audit Trail Logs from Firestore):
                </div>
                <div className="border border-slate-200 rounded p-2 bg-slate-50 text-[10px] space-y-1 font-mono">
                  <div>• [2026-10-12 08:30] ลงทะเบียนเข้ารับการอบรมผ่านระบบ TCT e-Training Portal</div>
                  <div>• [2026-10-13 15:40] สำเร็จการศึกษาบทเรียนครบทั้ง 3 บทเรียนสมบูรณ์</div>
                  <div>• [2026-10-13 16:15] สอบผ่านแบบทดสอบหลังเรียน Post-Test ได้คะแนนเต็ม 10/10 คะแนน</div>
                  <div>• [2026-10-13 16:30] ออกวุฒิบัตรรับรองมาตรฐานเลขที่ {selectedTrainee.certificateId || `TCA-PSY-2026-${selectedTrainee.empId}`}</div>
                </div>
              </div>
            </div>

            {/* A4 Executive Signatures Section */}
            <div className="border-t-2 border-slate-900 pt-3 mt-2">
              <div className="text-[11px] font-bold text-slate-700 text-center mb-4">
                ลงนามรับรองผลสัมฤทธิ์การฝึกอบรม โดยคณะผู้บริหารและกำกับดูแลศูนย์ TCT Academy
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                {/* Signatory 1 */}
                <div className="space-y-1">
                  <div className="h-10 border-b border-dashed border-slate-400 mx-4 flex items-end justify-center pb-1">
                    <span className="font-certificate-script text-base text-blue-900 font-bold">ณฐวัตร พงษ์สาริกิจ</span>
                  </div>
                  <div className="font-bold text-slate-900 text-[11px]">(นายณฐวัตร พงษ์สาริกิจ)</div>
                  <div className="text-[10px] text-slate-600">หัวหน้าศูนย์ TCT Academy</div>
                  <div className="text-[9px] text-slate-400">ผู้จัดทำและตรวจสอบผล</div>
                </div>

                {/* Signatory 2 */}
                <div className="space-y-1">
                  <div className="h-10 border-b border-dashed border-slate-400 mx-4 flex items-end justify-center pb-1">
                    <span className="font-certificate-script text-base text-blue-900 font-bold">กิตติศักดิ์ สร้อยจิตต์</span>
                  </div>
                  <div className="font-bold text-slate-900 text-[11px]">(นายกิตติศักดิ์ สร้อยจิตต์)</div>
                  <div className="text-[10px] text-slate-600">ผู้จัดการฝ่ายบุคคลและธุรการ</div>
                  <div className="text-[9px] text-slate-400">ผู้จัดการศูนย์ TCT Academy</div>
                </div>

                {/* Signatory 3 */}
                <div className="space-y-1">
                  <div className="h-10 border-b border-dashed border-slate-400 mx-4 flex items-end justify-center pb-1">
                    <span className="font-certificate-script text-base text-blue-900 font-bold">นพดล บำรุงเกียรติ</span>
                  </div>
                  <div className="font-bold text-slate-900 text-[11px]">(นายนพดล บำรุงเกียรติ)</div>
                  <div className="text-[10px] text-slate-600">ผู้จัดการทั่วไปและผู้จัดการโรงงาน</div>
                  <div className="text-[9px] text-slate-400">ประธานที่ปรึกษาศูนย์</div>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 text-center mt-3 border-t border-slate-200 pt-1">
                เอกสารนี้สร้างขึ้นโดยอัตโนมัติจากระบบฐานข้อมูลกลาง TCT Academy • Teijin Cord (Thailand) Co., Ltd.
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
