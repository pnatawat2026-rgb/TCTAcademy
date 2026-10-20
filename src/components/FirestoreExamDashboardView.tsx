import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Clock, 
  Users, 
  BookOpen, 
  Building2, 
  BarChart3, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  Layers, 
  ShieldCheck,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { subscribeToExamSubmissions, ExamSubmissionData, testFirestoreConnection } from '../firebase';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

interface FirestoreExamDashboardViewProps {
  onViewCertificate?: (submission: ExamSubmissionData) => void;
}

interface CourseStatItem {
  count: number;
  passed: number;
  avgPct: number;
  totalScore: number;
}

const DEPARTMENTS = [
  'ALL', 'P', 'PP', 'PS', 'ESH', 'ST', 'SEC', 'MN', 'TC', 'TR', 'QA', 'FI', 'TW', 'RW'
];

const COURSES = [
  { id: 'all', name: 'ทุกรายวิชา (All Courses)' },
  { id: 'applied-psychology', name: 'จิตวิทยาประยุกต์ (Applied Psychology)' },
  { id: 'risk-management', name: '1: บริหารความเสี่ยง (QSRM)' },
  { id: 'advanced-preventive-maintenance', name: '2: บำรุงรักษาเชิงป้องกัน (APM)' },
  { id: 'conflict-management', name: '3: การจัดการความขัดแย้ง (CFM)' },
  { id: 'ai-for-tct', name: '4: AI for TCT (AI-101)' },
  { id: 'personality-psychology', name: '5: จิตวิทยาบุคลิกภาพ (A001)' },
  { id: 'kyt-shisa-kanko', name: '6: KYT ชี้มือย้ำปาก' }
];

export const FirestoreExamDashboardView: React.FC<FirestoreExamDashboardViewProps> = ({
  onViewCertificate
}) => {
  const [submissions, setSubmissions] = useState<ExamSubmissionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [newArrivalAlert, setNewArrivalAlert] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'passed' | 'failed'>('all');
  const [selectedExamType, setSelectedExamType] = useState<'all' | 'posttest' | 'pretest'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'score' | 'empId' | 'name'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Real-time Firestore onSnapshot Subscription
  useEffect(() => {
    setLoading(true);
    let previousCount = 0;

    const unsubscribe = subscribeToExamSubmissions(
      (data) => {
        setSubmissions(data);
        setLoading(false);
        setLastUpdated(new Date().toLocaleTimeString('th-TH'));

        // Play chime and show toast if a new submission arrives while open
        if (previousCount > 0 && data.length > previousCount) {
          const newest = data[0];
          playSuccessChime();
          setNewArrivalAlert(`⚡ ผลสอบใหม่: ${newest.fullName} (${newest.empId}) แผนก ${newest.department} ได้คะแนน ${newest.score}/${newest.totalScore}`);
          setTimeout(() => setNewArrivalAlert(null), 5000);
        }
        previousCount = data.length;
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setError(err.message || 'ไม่สามารถเชื่อมต่อ Firestore ได้');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        sub.empId.toLowerCase().includes(q) ||
        sub.fullName.toLowerCase().includes(q) ||
        sub.department.toLowerCase().includes(q) ||
        sub.courseTitle.toLowerCase().includes(q) ||
        sub.courseId.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'ALL' || sub.department.toUpperCase() === selectedDept.toUpperCase();
      const matchesCourse = selectedCourse === 'all' || sub.courseId === selectedCourse;
      const matchesStatus = selectedStatus === 'all' || 
        (selectedStatus === 'passed' && sub.passed) || 
        (selectedStatus === 'failed' && !sub.passed);
      const matchesExamType = selectedExamType === 'all' || sub.examType === selectedExamType;

      return matchesSearch && matchesDept && matchesCourse && matchesStatus && matchesExamType;
    }).sort((a, b) => {
      if (sortBy === 'time') {
        const timeA = new Date(a.createdAt || a.submittedAt).getTime();
        const timeB = new Date(b.createdAt || b.submittedAt).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      }
      if (sortBy === 'score') {
        return sortOrder === 'desc' ? b.percentage - a.percentage : a.percentage - b.percentage;
      }
      if (sortBy === 'empId') {
        return sortOrder === 'desc' ? b.empId.localeCompare(a.empId) : a.empId.localeCompare(b.empId);
      }
      if (sortBy === 'name') {
        return sortOrder === 'desc' ? b.fullName.localeCompare(a.fullName) : a.fullName.localeCompare(b.fullName);
      }
      return 0;
    });
  }, [submissions, searchQuery, selectedDept, selectedCourse, selectedStatus, selectedExamType, sortBy, sortOrder]);

  // High-level statistics
  const stats = useMemo(() => {
    const total = submissions.length;
    const passedCount = submissions.filter(s => s.passed).length;
    const failedCount = total - passedCount;
    const passRate = total > 0 ? Math.round((passedCount / total) * 100) : 0;
    
    const uniqueEmployees = new Set(submissions.map(s => s.empId.trim().toUpperCase())).size;
    const avgScore = total > 0 
      ? (submissions.reduce((acc, s) => acc + (s.score / s.totalScore) * 100, 0) / total).toFixed(1) 
      : '0.0';

    // Grouping by course
    const courseStats: Record<string, { count: number; passed: number; avgPct: number; totalScore: number }> = {};
    submissions.forEach(s => {
      const cId = s.courseId || 'other';
      if (!courseStats[cId]) {
        courseStats[cId] = { count: 0, passed: 0, avgPct: 0, totalScore: 0 };
      }
      courseStats[cId].count++;
      if (s.passed) courseStats[cId].passed++;
      courseStats[cId].totalScore += s.percentage;
    });
    Object.keys(courseStats).forEach(cId => {
      courseStats[cId].avgPct = Math.round(courseStats[cId].totalScore / courseStats[cId].count);
    });

    // Grouping by department
    const deptStats: Record<string, number> = {};
    submissions.forEach(s => {
      const d = s.department.toUpperCase() || 'OTHER';
      deptStats[d] = (deptStats[d] || 0) + 1;
    });

    return {
      total,
      passedCount,
      failedCount,
      passRate,
      uniqueEmployees,
      avgScore,
      courseStats,
      deptStats
    };
  }, [submissions]);

  // Export to CSV
  const handleExportCSV = () => {
    playCyberClick();
    if (filteredSubmissions.length === 0) return;

    const headers = ['ลำดับ', 'วันเวลาที่สอบ', 'รหัสพนักงาน', 'ชื่อ-นามสกุล', 'แผนก', 'รหัสวิชา', 'ชื่อวิชา', 'ประเภทการสอบ', 'คะแนนที่ได้', 'คะแนนเต็ม', 'ร้อยละ (%)', 'ผลการประเมิน', 'เลขที่ใบรับรอง'];
    const rows = filteredSubmissions.map((s, idx) => [
      idx + 1,
      `"${s.submittedAt}"`,
      `"${s.empId}"`,
      `"${s.fullName}"`,
      `"${s.department}"`,
      `"${s.courseId}"`,
      `"${s.courseTitle.replace(/"/g, '""')}"`,
      s.examType === 'posttest' ? 'Post-test' : 'Pre-test',
      s.score,
      s.totalScore,
      `${s.percentage}%`,
      s.passed ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์',
      `"${s.certificateId || '-'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TCT_Exam_Submissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sarabun text-slate-800 animate-fadeIn">
      
      {/* Real-time Alert Banner */}
      {newArrivalAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
              ⚡
            </div>
            <span className="font-bold text-sm">{newArrivalAlert}</span>
          </div>
          <button 
            onClick={() => setNewArrivalAlert(null)}
            className="text-white/80 hover:text-white px-2 py-1 text-xs bg-black/20 rounded-lg cursor-pointer"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Header with Live Status Indicator */}
      <div className="bg-gradient-to-r from-[#002D5A] via-[#003B73] to-[#004B93] p-5 sm:p-6 rounded-3xl text-white shadow-lg border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  ระบบผลสอบ Real-time (Firebase Firestore)
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Live onSnapshot</span>
                </span>
              </div>
              <p className="text-xs text-cyan-100/80 mt-0.5">
                Collection: <code className="bg-white/10 px-1.5 py-0.5 rounded text-amber-300 font-mono">exam_submissions</code> • ข้อมูลเด้งขึ้นทันทีที่พนักงานกดส่งข้อสอบโดยไม่ต้องรีเฟรชหน้าจอ
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end flex-wrap">
          <div className="text-right text-xs text-cyan-200/90 font-mono hidden md:block">
            <div>อัปเดตล่าสุด: {lastUpdated || 'กำลังเชื่อมต่อ...'}</div>
            <div className="text-[10px] text-cyan-300/70">รวม {submissions.length} รายการ</div>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={filteredSubmissions.length === 0}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer disabled:opacity-50"
            title="ส่งออกผลสอบทั้งหมดเป็นไฟล์ CSV / Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Submissions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">ส่งข้อสอบทั้งหมด</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#005A9C] flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {stats.total} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            พนักงาน {stats.uniqueEmployees} ท่าน
          </div>
        </div>

        {/* Passed Count */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between bg-emerald-50/20">
          <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
            <span className="font-semibold">สอบผ่านเกณฑ์</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
            {stats.passedCount} <span className="text-xs font-normal text-emerald-600">คน</span>
          </div>
          <div className="text-[11px] font-bold text-emerald-700 mt-1">
            ผ่านเกณฑ์ {stats.passRate}%
          </div>
        </div>

        {/* Failed Count */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs flex flex-col justify-between bg-rose-50/20">
          <div className="flex items-center justify-between text-xs text-rose-800 mb-1">
            <span className="font-semibold">ยังไม่ผ่านเกณฑ์</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 font-mono">
            {stats.failedCount} <span className="text-xs font-normal text-rose-600">คน</span>
          </div>
          <div className="text-[11px] text-rose-600 mt-1">
            รอทำแบบทดสอบใหม่
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">คะแนนเฉลี่ยรวม</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {stats.avgScore}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ค่าเฉลี่ยทุกรายวิชา
          </div>
        </div>

        {/* Course Coverage */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">รายวิชาที่มีผลสอบ</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {Object.keys(stats.courseStats).length} <span className="text-xs font-normal text-slate-500">วิชา</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ครอบคลุมทุกหมวดหมู่
          </div>
        </div>
      </div>

      {/* Visual Summary Graphs: Pass/Fail and Course Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pass/Fail Ratio Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>สัดส่วนการสอบผ่านเกณฑ์ (Pass Ratio)</span>
          </h3>
          <div className="space-y-1.5">
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div 
                className="bg-emerald-500 transition-all duration-500" 
                style={{ width: `${stats.passRate}%` }} 
                title={`ผ่านเกณฑ์ ${stats.passRate}%`}
              />
              <div 
                className="bg-rose-400 transition-all duration-500" 
                style={{ width: `${100 - stats.passRate}%` }} 
                title={`ไม่ผ่านเกณฑ์ ${100 - stats.passRate}%`}
              />
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>ผ่าน: {stats.passedCount} ({stats.passRate}%)</span>
              </span>
              <span className="text-rose-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>ไม่ผ่าน: {stats.failedCount} ({100 - stats.passRate}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Course Performance Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#005A9C]" />
            <span>ผลการสอบแยกตามรายวิชาใน Firestore</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {Object.keys(stats.courseStats).length === 0 ? (
              <div className="text-slate-400 text-xs py-2">ยังไม่มีข้อมูลผลสอบในระบบ</div>
            ) : (
              (Object.entries(stats.courseStats) as [string, CourseStatItem][]).map(([cId, cStat]) => {
                const courseName = COURSES.find(c => c.id === cId)?.name || cId;
                return (
                  <div key={cId} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="truncate pr-2">
                      <div className="font-bold text-slate-800 truncate">{courseName}</div>
                      <div className="text-[11px] text-slate-500">ส่งสอบ {cStat.count} ครั้ง • ผ่าน {cStat.passed} คน</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-xs">
                        เฉลี่ย {cStat.avgPct}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3. ระบบกรองข้อมูล (Filter) ในหน้าแอดมิน: ค้นหาตามชื่อพนักงาน แผนก หรือรายวิชา */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อพนักงาน, รหัสพนักงาน, แผนก หรือวิชาที่สอบ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Department Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-slate-600">แผนก:</span>
              <select
                value={selectedDept}
                onChange={(e) => {
                  playCyberClick();
                  setSelectedDept(e.target.value);
                }}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>
                    {d === 'ALL' ? 'ทุกแผนก (All)' : d}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-slate-600">รายวิชา:</span>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  playCyberClick();
                  setSelectedCourse(e.target.value);
                }}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer max-w-[180px] truncate"
              >
                {COURSES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-slate-600">ผลสอบ:</span>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  playCyberClick();
                  setSelectedStatus(e.target.value as any);
                }}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="all">ทั้งหมด</option>
                <option value="passed">ผ่านเกณฑ์ (Passed)</option>
                <option value="failed">ไม่ผ่านเกณฑ์ (Failed)</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {(searchQuery || selectedDept !== 'ALL' || selectedCourse !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={() => {
                  playCyberClick();
                  setSearchQuery('');
                  setSelectedDept('ALL');
                  setSelectedCourse('all');
                  setSelectedStatus('all');
                }}
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {/* Submissions Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-3.5">ลำดับ</th>
                  <th className="py-3 px-3.5">วันเวลาที่สอบ</th>
                  <th className="py-3 px-3.5">รหัสพนักงาน</th>
                  <th className="py-3 px-3.5">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-3.5">แผนก</th>
                  <th className="py-3 px-3.5">วิชาที่สอบ</th>
                  <th className="py-3 px-3.5 text-center">ประเภท</th>
                  <th className="py-3 px-3.5 text-center">คะแนนที่ได้</th>
                  <th className="py-3 px-3.5 text-center">สถานะ</th>
                  <th className="py-3 px-3.5 text-right">ใบรับรอง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#005A9C]" />
                        <span>กำลังเชื่อมต่อและดึงข้อมูลจาก Firestore onSnapshot...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <InboxIcon className="w-8 h-8 text-slate-300" />
                        <span className="font-bold text-sm text-slate-600">ไม่พบข้อมูลผลสอบตามเงื่อนไขที่เลือก</span>
                        <span className="text-xs text-slate-400">
                          เมื่อพนักงานทำข้อสอบและกดส่ง ผลสอบจะปรากฏบนตารางนี้ทันทีแบบ Real-time
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub, idx) => (
                    <tr 
                      key={sub.id || idx}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="py-3 px-3.5 text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sub.submittedAt}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                        {sub.empId}
                      </td>
                      <td className="py-3 px-3.5 font-bold text-slate-900">
                        {sub.fullName}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {sub.department}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 max-w-[200px] truncate" title={sub.courseTitle}>
                        <div className="font-semibold text-slate-800 truncate">{sub.courseTitle}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{sub.courseId}</div>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.examType === 'posttest' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {sub.examType === 'posttest' ? 'Post-test' : 'Pre-test'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span className="font-mono font-black text-sm text-slate-900">
                          {sub.score}
                        </span>
                        <span className="text-[10px] text-slate-400">/{sub.totalScore}</span>
                        <div className="text-[10px] text-slate-500 font-mono">({sub.percentage}%)</div>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {sub.passed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ผ่านเกณฑ์</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>ไม่ผ่าน</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        {sub.certificateId ? (
                          <span className="font-mono text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {sub.certificateId}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              แสดงผล <strong>{filteredSubmissions.length}</strong> จากทั้งหมด <strong>{submissions.length}</strong> รายการ
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Firestore onSnapshot Active</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

function InboxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}
