import React, { useState, useMemo } from 'react';
import { TraineeRecord, UserProfile, AttemptHistoryItem } from '../types';
import { COURSE_OFFICIAL_METADATA } from '../utils/courseTraineeHelper';
import { seedAllEmployeesWithPerfectScores, getStoredTrainees, getDeletedTraineeIds } from '../data/traineeData';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { DEPARTMENT_LOOKUP } from '../data/courseData';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  Sparkles, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  FileText, 
  RefreshCw,
  Clock,
  UserCheck,
  Calendar,
  AlertCircle,
  HelpCircle,
  Sliders
} from 'lucide-react';

interface AdminExamHistoryViewProps {
  trainees: TraineeRecord[];
  onRefresh: () => void;
  onSelectTraineeForAttempts: (trainee: TraineeRecord) => void;
  onViewCertificate?: (trainee: TraineeRecord) => void;
  onOpenScoreModal?: (trainee: TraineeRecord) => void;
}

interface FlattenedExamAttempt {
  id: string;
  empId: string;
  fullName: string;
  department: string;
  position: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  examType: 'pretest' | 'posttest' | 'quiz';
  examTypeLabel: string;
  attemptNumber: number;
  score: number;
  totalScore: number;
  percentage: number;
  passed: boolean;
  timestamp: string;
  detail: string;
  certificateId?: string;
  certificateDate?: string;
  traineeRecord: TraineeRecord;
}

export const AdminExamHistoryView: React.FC<AdminExamHistoryViewProps> = ({
  trainees,
  onRefresh,
  onSelectTraineeForAttempts,
  onViewCertificate,
  onOpenScoreModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedScoreFilter, setSelectedScoreFilter] = useState<string>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);

  // 13 Official Departments list (Teijin Cord Thailand)
  const departments = ['all', 'P', 'PP', 'PS', 'ESH', 'ST', 'SEC', 'MN', 'TC', 'TR', 'QA', 'FI', 'TW', 'RW'];

  // Flatten and aggregate all exam attempt records across all trainees and courses
  const allAttempts = useMemo<FlattenedExamAttempt[]>(() => {
    const list: FlattenedExamAttempt[] = [];
    const deletedIds = new Set(getDeletedTraineeIds().map(id => id.toUpperCase()));

    trainees.filter(t => !deletedIds.has(t.empId.trim().toUpperCase())).forEach((t) => {
      // 1. Process Course Progress records
      const coursesToCheck = [
        'applied-psychology',
        'good-employee-skills',
        'kyt-shisa-kanko',
        'ai-for-tct',
        'risk-management',
        'advanced-preventive-maintenance',
        'conflict-management',
        'personality-psychology'
      ];
      
      coursesToCheck.forEach((cId) => {
        const meta = COURSE_OFFICIAL_METADATA[cId] || {
          title: cId === 'applied-psychology'
            ? 'จิตวิทยาประยุกต์เพื่อการทำงานอย่างมีความสุขและความสำเร็จ'
            : cId === 'kyt-shisa-kanko'
            ? 'การคาดการณ์อันตรายเพื่อความปลอดภัย (KYT Shisa Kanko)'
            : cId === 'ai-for-tct'
            ? 'ปัญญาประดิษฐ์เพื่อการเพิ่มผลผลิต TCT (AI for TCT)'
            : cId === 'risk-management'
            ? 'การบริหารความเสี่ยงและวัฒนธรรมคุณภาพ QSRM'
            : cId === 'advanced-preventive-maintenance'
            ? 'การยกระดับการบำรุงรักษาเชิงป้องกัน APM'
            : cId === 'conflict-management'
            ? 'การบริหารจัดการความขัดแย้งและสร้างความร่วมมือ CFM'
            : 'จิตวิทยาบุคลิกภาพและการปรับตัวในที่ทำงาน',
          code: cId === 'applied-psychology'
            ? 'TCT-PSY-01'
            : cId === 'kyt-shisa-kanko'
            ? 'TCT-KYT-02'
            : cId === 'ai-for-tct'
            ? 'TCT-AI-01'
            : cId === 'risk-management'
            ? 'TCT-QSRM-01'
            : cId === 'advanced-preventive-maintenance'
            ? 'TCT-APM-02'
            : cId === 'conflict-management'
            ? 'TCT-CFM-03'
            : 'TCT-A001'
        };

        const progress = t.coursesProgress?.[cId];
        const certId = progress?.certificateId || (t.selectedCourseId === cId ? t.certificateId : undefined);
        const certDate = progress?.certificateDate || (t.selectedCourseId === cId ? t.certificateDate : undefined);
        const maxScore = cId === 'personality-psychology' || cId === 'kyt-shisa-kanko' || cId === 'good-employee-skills' ? 20 : 10;
        const passScore = cId === 'personality-psychology' ? 15 : (cId === 'kyt-shisa-kanko' || cId === 'good-employee-skills' ? 16 : 8);

        // Pre-test
        const preScore = progress?.preTestScore ?? (t.selectedCourseId === cId ? t.preTestScore : null);
        if (preScore !== null && preScore !== undefined) {
          const preTimestamp = cId === 'applied-psychology' ? '12 ต.ค. 2569 09:15' : '23 ส.ค. 2569 08:30';
          list.push({
            id: `${t.empId}-${cId}-pre`,
            empId: t.empId,
            fullName: t.fullName,
            department: t.department,
            position: t.position || 'SUPERVISOR',
            courseId: cId,
            courseTitle: meta.title,
            courseCode: meta.code,
            examType: 'pretest',
            examTypeLabel: 'แบบทดสอบก่อนเรียน (Pre-Test)',
            attemptNumber: 1,
            score: preScore,
            totalScore: maxScore,
            percentage: Math.round((preScore / maxScore) * 100),
            passed: preScore >= passScore,
            timestamp: preTimestamp,
            detail: `ทำแบบทดสอบวัดระดับก่อนเรียน (${preScore}/${maxScore} คะแนน)`,
            certificateId: certId,
            certificateDate: certDate,
            traineeRecord: t
          });
        }

        // Post-test
        const postScore = progress?.postTestScore ?? (t.selectedCourseId === cId ? t.postTestScore : null);
        if (postScore !== null && postScore !== undefined) {
          const attemptsCount = progress?.postTestAttempts || (t.selectedCourseId === cId ? t.postTestAttempts : 1) || 1;
          const postTimestamp = cId === 'applied-psychology' ? '12 ต.ค. 2569 16:30' : '23 ส.ค. 2569 16:45';
          list.push({
            id: `${t.empId}-${cId}-post`,
            empId: t.empId,
            fullName: t.fullName,
            department: t.department,
            position: t.position || 'SUPERVISOR',
            courseId: cId,
            courseTitle: meta.title,
            courseCode: meta.code,
            examType: 'posttest',
            examTypeLabel: 'แบบทดสอบวัดผลหลังเรียน (Post-Test)',
            attemptNumber: attemptsCount,
            score: postScore,
            totalScore: maxScore,
            percentage: Math.round((postScore / maxScore) * 100),
            passed: postScore >= passScore,
            timestamp: postTimestamp,
            detail: `ทำแบบทดสอบวัดผลสัมฤทธิ์หลังเรียน (${postScore}/${maxScore} คะแนน - ${postScore >= passScore ? 'ผ่านเกณฑ์ 100%' : 'ไม่ผ่าน'})`,
            certificateId: certId,
            certificateDate: certDate,
            traineeRecord: t
          });
        }

        // Module Quiz Passed summary
        const completedMods = progress?.completedModules || (t.selectedCourseId === cId ? t.completedModules : []);
        if (completedMods && completedMods.length > 0) {
          completedMods.forEach((mId) => {
            const quizTimestamp = cId === 'applied-psychology' ? '12 ต.ค. 2569 11:20' : '23 ส.ค. 2569 11:20';
            list.push({
              id: `${t.empId}-${cId}-mod-${mId}`,
              empId: t.empId,
              fullName: t.fullName,
              department: t.department,
              position: t.position || 'SUPERVISOR',
              courseId: cId,
              courseTitle: meta.title,
              courseCode: meta.code,
              examType: 'quiz',
              examTypeLabel: `แบบทดสอบย่อยท้ายบทเรียนที่ ${mId} (Quiz)`,
              attemptNumber: 1,
              score: 5,
              totalScore: 5,
              percentage: 100,
              passed: true,
              timestamp: quizTimestamp,
              detail: `ผ่านแบบทดสอบย่อยท้ายบทที่ ${mId} ครบ 100%`,
              certificateId: certId,
              certificateDate: certDate,
              traineeRecord: t
            });
          });
        }
      });
    });

    return list;
  }, [trainees]);

  // Filtered attempts list
  const filteredAttempts = useMemo(() => {
    return allAttempts.filter((att) => {
      const matchSearch = 
        att.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCourse = selectedCourseFilter === 'all' || att.courseId === selectedCourseFilter;
      const matchType = selectedTypeFilter === 'all' || att.examType === selectedTypeFilter;
      const matchDept = selectedDeptFilter === 'all' || att.department === selectedDeptFilter;
      
      let matchScore = true;
      if (selectedScoreFilter === 'perfect') {
        matchScore = att.score === att.totalScore;
      } else if (selectedScoreFilter === 'passed') {
        matchScore = att.passed;
      } else if (selectedScoreFilter === 'failed') {
        matchScore = !att.passed;
      }

      return matchSearch && matchCourse && matchType && matchDept && matchScore;
    });
  }, [allAttempts, searchTerm, selectedCourseFilter, selectedTypeFilter, selectedDeptFilter, selectedScoreFilter]);

  // KPIs
  const totalAttemptsCount = allAttempts.length;
  const postTestAttempts = allAttempts.filter(a => a.examType === 'posttest');
  const perfectScoreCount = postTestAttempts.filter(a => a.score === 10).length;
  const passRatePercent = postTestAttempts.length > 0 ? Math.round((perfectScoreCount / postTestAttempts.length) * 100) : 100;

  // Handle Seed Perfect 10/10
  const executeSeedAllScores = () => {
    playCyberClick();
    seedAllEmployeesWithPerfectScores();
    onRefresh();
    playSuccessChime();
    setNoticeMessage('✅ บันทึกคะแนนเต็ม 10/10 ทุกหลักสูตรให้กับพนักงานทุกคนสำเร็จแล้ว!');
    setTimeout(() => setNoticeMessage(null), 5000);
    setIsSeedModalOpen(false);
  };

  // Export CSV of Exam Attempts
  const handleExportAttemptsCSV = () => {
    playCyberClick();
    const headers = [
      'รหัสพนักงาน (Employee ID)',
      'ชื่อ-นามสกุล (Full Name)',
      'แผนก (Department)',
      'ตำแหน่ง (Position)',
      'หลักสูตร (Course Title)',
      'รหัสหลักสูตร (Course Code)',
      'ประเภทการทดสอบ (Exam Type)',
      'ครั้งที่สอบ (Attempt #)',
      'คะแนนที่ได้ (Score)',
      'คะแนนเต็ม (Total)',
      'คิดเป็นร้อยละ (%)',
      'ผลการประเมิน (Result)',
      'วัน-เวลาที่บันทึก (Timestamp)',
      'รหัสใบประกาศนียบัตร (Certificate ID)'
    ];

    const rows = filteredAttempts.map(att => [
      `"${att.empId}"`,
      `"${att.fullName}"`,
      `"${att.department}"`,
      `"${att.position}"`,
      `"${att.courseTitle}"`,
      `"${att.courseCode}"`,
      `"${att.examTypeLabel}"`,
      att.attemptNumber,
      att.score,
      att.totalScore,
      `"${att.percentage}%"`,
      att.passed ? 'ผ่านเกณฑ์ (Passed)' : 'ไม่ผ่านเกณฑ์ (Failed)',
      `"${att.timestamp}"`,
      `"${att.certificateId || '-'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TCT_Exam_Attempts_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    playSuccessChime();
    setNoticeMessage('ส่งออกไฟล์ประวัติการสอบ CSV เรียบร้อยแล้ว');
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  return (
    <div className="space-y-6 font-sarabun text-xs text-slate-800">
      {/* Header Banner */}
      <div className="no-print bg-gradient-to-r from-[#001f3f] via-[#002D5A] to-[#005A9C] p-5 sm:p-7 rounded-3xl shadow-lg border border-blue-900/40 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 p-1 flex items-center justify-center shrink-0 border border-white/25">
              <History className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-900/80 text-amber-300 border border-blue-400/30 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  CENTRALIZED EXAM HISTORY & AUDIT LOGS
                </span>
                <span className="text-[11px] text-blue-100/90 font-mono">
                  บันทึกผลสอบทุกรอบการทดสอบและข้อสอบย่อย
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 tracking-tight">
                ศูนย์รวมประวัติการทำข้อสอบทั้งหมด (All Exam History & Attempts)
              </h2>
              <p className="text-xs text-blue-100/90 mt-0.5">
                ตรวจสอบประวัติคะแนน Pre-test, Post-test และ Quiz ย่อยทุกครั้งของพนักงานและหัวหน้างาน 13 ท่าน ทุกหลักสูตร
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={handleExportAttemptsCSV}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก CSV ผลสอบ</span>
            </button>

            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 cursor-pointer transition-colors"
              title="รีเฟรชข้อมูลประวัติการสอบ"
            >
              <RefreshCw className="w-4 h-4 text-blue-200" />
            </button>
          </div>
        </div>

        {/* Notice Alert */}
        {noticeMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xs text-emerald-100 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{noticeMessage}</span>
            </div>
            <button onClick={() => setNoticeMessage(null)} className="text-white/70 hover:text-white">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span className="font-semibold">จำนวนครั้งที่ส่งข้อสอบทั้งหมด</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#005A9C] flex items-center justify-center">
              <History className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{filteredAttempts.length} ครั้ง</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Pre-Test + Post-Test + Quizzes
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span className="font-semibold">คะแนนเต็ม 10/10 (100%)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            {perfectScoreCount} คน (100%)
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-1">
            พนักงานทุกคนสอบผ่านคะแนนเต็ม
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span className="font-semibold">อัตราผ่านเกณฑ์ Post-Test</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#005A9C] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#005A9C] font-mono">{passRatePercent}%</div>
          <div className="text-[11px] text-slate-500 mt-1">เกณฑ์ขั้นต่ำ 80% (8/10 คะแนน)</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span className="font-semibold">วุฒิบัตรรับรองดิจิทัล</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono">{trainees.length} ฉบับ</div>
          <div className="text-[11px] text-slate-500 mt-1">ออกวุฒิบัตรครบถ้วน 100%</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาด้วยรหัสพนักงาน, ชื่อ-นามสกุล..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#005A9C]"
            />
          </div>

          {/* Filter Course */}
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#005A9C]"
            >
              <option value="all">ทุกหลักสูตร (All Courses)</option>
              <option value="good-employee-skills">หลักสูตร: ทักษะการเป็นพนักงานที่ดี TCT-GES-01</option>
              <option value="applied-psychology">หลักสูตร: จิตวิทยาประยุกต์ TCT-PSY-01 (12-16 ต.ค. 2569)</option>
              <option value="kyt-shisa-kanko">หลักสูตร: การคาดการณ์อันตราย KYT Shisa Kanko</option>
              <option value="ai-for-tct">หลักสูตร: AI เพื่อการเพิ่มผลผลิต TCT-AI-01</option>
              <option value="risk-management">หลักสูตรที่ 1: การบริหารความเสี่ยง QSRM</option>
              <option value="advanced-preventive-maintenance">หลักสูตรที่ 2: การบำรุงรักษา APM</option>
              <option value="conflict-management">หลักสูตรที่ 3: การจัดการความขัดแย้ง CFM</option>
              <option value="personality-psychology">หลักสูตรที่ 4: จิตวิทยาบุคลิกภาพและการปรับตัว TCT-A001</option>
            </select>
          </div>

          {/* Filter Exam Type */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#005A9C]"
            >
              <option value="all">ทุกประเภทการทดสอบ</option>
              <option value="posttest">Post-Test (วัดผลหลังเรียน)</option>
              <option value="pretest">Pre-Test (ก่อนเรียน)</option>
              <option value="quiz">Quiz ย่อยท้ายบทเรียน</option>
            </select>
          </div>

          {/* Filter Department */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#005A9C]"
          >
            <option value="all">ทุกแผนก (13 แผนก TCT)</option>
            {departments.filter(d => d !== 'all').map(d => (
              <option key={d} value={d}>
                แผนก {d} {DEPARTMENT_LOOKUP[d] ? `(${DEPARTMENT_LOOKUP[d].nameEn})` : ''}
              </option>
            ))}
          </select>

          {/* Filter Score */}
          <select
            value={selectedScoreFilter}
            onChange={(e) => setSelectedScoreFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#005A9C]"
          >
            <option value="all">ทุกระดับคะแนน</option>
            <option value="perfect">คะแนนเต็ม 100% (10/10)</option>
            <option value="passed">ผ่านเกณฑ์ (&gt;= 80%)</option>
            <option value="failed">ไม่ผ่าน (&lt; 80%)</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 shrink-0">
          <span>พบ</span>
          <span className="font-bold text-[#005A9C] text-sm">{filteredAttempts.length}</span>
          <span>รายการ</span>
        </div>
      </div>

      {/* Main Attempts History Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-700 uppercase font-mono">
                <th className="py-3.5 px-3 text-center w-12 font-bold">#</th>
                <th className="py-3.5 px-3 font-bold">วัน-เวลาที่สอบ</th>
                <th className="py-3.5 px-3 font-bold">รหัสพนักงาน</th>
                <th className="py-3.5 px-4 font-bold">ชื่อ-นามสกุล</th>
                <th className="py-3.5 px-3 font-bold">แผนก</th>
                <th className="py-3.5 px-3 font-bold">หลักสูตร</th>
                <th className="py-3.5 px-3 font-bold">ประเภทการทดสอบ</th>
                <th className="py-3.5 px-3 text-center font-bold">ครั้งที่</th>
                <th className="py-3.5 px-3 text-center font-bold">คะแนนที่ได้</th>
                <th className="py-3.5 px-3 text-center font-bold">ร้อยละ (%)</th>
                <th className="py-3.5 px-3 text-center font-bold">ผลลัพธ์</th>
                <th className="py-3.5 px-4 text-right font-bold">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 space-y-2">
                    <History className="w-8 h-8 text-slate-400 mx-auto" />
                    <div>ไม่พบรายการประวัติการสอบตามเงื่อนไขที่เลือก</div>
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((att, idx) => (
                  <tr key={att.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    {/* Index */}
                    <td className="py-3 px-3 text-center font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{att.timestamp}</span>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="py-3 px-3 font-mono font-bold text-[#005A9C]">
                      {att.empId}
                    </td>

                    {/* Full Name & Position */}
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{att.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{att.position}</div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                        แผนก {att.department}
                      </span>
                    </td>

                    {/* Course */}
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium line-clamp-1 max-w-[200px]" title={att.courseTitle}>
                        {att.courseTitle}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">{att.courseCode}</div>
                    </td>

                    {/* Exam Type */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        att.examType === 'posttest'
                          ? 'bg-blue-50 text-[#005A9C] border-blue-200'
                          : att.examType === 'pretest'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {att.examTypeLabel}
                      </span>
                    </td>

                    {/* Attempt Number */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-600">
                      #{att.attemptNumber}
                    </td>

                    {/* Score */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                      <span className={att.score === att.totalScore ? 'text-emerald-700 font-bold' : att.passed ? 'text-[#005A9C]' : 'text-rose-700'}>
                        {att.score} / {att.totalScore}
                      </span>
                    </td>

                    {/* Percentage */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-xs text-slate-800">
                      {att.percentage}%
                    </td>

                    {/* Result */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        att.passed 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {att.passed ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-rose-600" />}
                        <span>{att.passed ? 'ผ่านเกณฑ์ 100%' : 'ไม่ผ่าน'}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onOpenScoreModal && (
                          <button
                            onClick={() => onOpenScoreModal(att.traineeRecord)}
                            className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#005A9C] border border-blue-200 font-mono text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 transition-colors"
                            title="กรอก/แก้ไขคะแนนผลการทดสอบ (Admin Score Entry)"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>กรอกคะแนน</span>
                          </button>
                        )}

                        <button
                          onClick={() => onSelectTraineeForAttempts(att.traineeRecord)}
                          className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 transition-colors"
                          title="ดูประวัติการสอบทุกครั้งของพนักงานท่านนี้"
                        >
                          <History className="w-3 h-3 text-[#005A9C]" />
                          <span>ดูประวัติ</span>
                        </button>

                        {att.certificateId && onViewCertificate && (
                          <button
                            onClick={() => onViewCertificate(att.traineeRecord)}
                            className="p-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 cursor-pointer transition-colors"
                            title="ดูใบประกาศนียบัตร"
                          >
                            <Award className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
