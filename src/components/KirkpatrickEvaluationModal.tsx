import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, KirkpatrickEvaluation, KirkpatrickEvaluationItem } from '../types';
import { 
  DEFAULT_KIRKPATRICK_QUESTIONS, 
  KIRKPATRICK_LEVELS_CONFIG, 
  RATING_SCALE_LABELS, 
  calculateGrade, 
  saveKirkpatrickEvaluation, 
  getEmployeeKirkpatrickEvaluation,
  generateEvaluationCode 
} from '../utils/kirkpatrickManager';
import { getAllAvailableCourses } from '../utils/courseManager';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { 
  Award, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Printer, 
  Download, 
  Share2, 
  Building2, 
  User, 
  Briefcase, 
  GraduationCap, 
  ThumbsUp, 
  Smile, 
  Clock, 
  Layers, 
  Check, 
  HelpCircle,
  FileCheck2,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Send
} from 'lucide-react';

interface KirkpatrickEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  initialCourseId?: string;
  onSaved?: (evaluation: KirkpatrickEvaluation) => void;
}

export const KirkpatrickEvaluationModal: React.FC<KirkpatrickEvaluationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialCourseId,
  onSaved
}) => {
  const allCourses = useMemo(() => getAllAvailableCourses(), []);
  
  // Active course being evaluated
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    return initialCourseId || currentUser?.selectedCourseId || 'applied-psychology';
  });

  const selectedCourse = useMemo(() => {
    return allCourses.find(c => c.id === selectedCourseId) || allCourses[0];
  }, [allCourses, selectedCourseId]);

  // Scores map: questionId -> score (1-5)
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    DEFAULT_KIRKPATRICK_QUESTIONS.forEach(q => {
      initial[q.id] = 5; // Default to 5
    });
    return initial;
  });

  // Active Level Tab: 'all' | 1 | 2 | 3 | 4 | 'result_slip'
  const [activeTab, setActiveTab] = useState<'all' | 1 | 2 | 3 | 4 | 'result_slip'>('all');

  // Qualitative fields - Blank by default so employees evaluate by themselves
  const [strengths, setStrengths] = useState<string>('');
  const [applicationPlan, setApplicationPlan] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string>('');
  const [recommendsCourse, setRecommendsCourse] = useState<boolean>(true);

  // Saved evaluation state
  const [savedEvaluation, setSavedEvaluation] = useState<KirkpatrickEvaluation | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  // Load existing evaluation if present
  useEffect(() => {
    if (currentUser?.empId) {
      const existing = getEmployeeKirkpatrickEvaluation(currentUser.empId, selectedCourseId);
      if (existing) {
        setSavedEvaluation(existing);
        const scMap: Record<string, number> = {};
        existing.items.forEach(it => {
          scMap[it.id] = it.score;
        });
        setScores(scMap);
        setStrengths(existing.strengths || '');
        setApplicationPlan(existing.applicationPlan || '');
        setSuggestions(existing.suggestions || '');
        setRecommendsCourse(existing.recommendsCourse !== undefined ? existing.recommendsCourse : true);
      } else {
        setSavedEvaluation(null);
        setIsSubmittedSuccess(false);
        setStrengths('');
        setApplicationPlan('');
        setSuggestions('');
      }
    }
  }, [currentUser?.empId, selectedCourseId]);

  // Calculate scores per level
  const levelScores = useMemo(() => {
    const calcLevel = (lvl: number) => {
      const questions = DEFAULT_KIRKPATRICK_QUESTIONS.filter(q => q.level === lvl);
      if (questions.length === 0) return 5;
      const total = questions.reduce((sum, q) => sum + (scores[q.id] || 5), 0);
      return Number((total / questions.length).toFixed(2));
    };

    const l1 = calcLevel(1);
    const l2 = calcLevel(2);
    const l3 = calcLevel(3);
    const l4 = calcLevel(4);

    const grandTotal = DEFAULT_KIRKPATRICK_QUESTIONS.reduce((sum, q) => sum + (scores[q.id] || 5), 0);
    const overall = Number((grandTotal / DEFAULT_KIRKPATRICK_QUESTIONS.length).toFixed(2));
    const percentage = Math.round((overall / 5) * 100);
    const grade = calculateGrade(overall);

    return {
      level1: l1,
      level2: l2,
      level3: l3,
      level4: l4,
      overall,
      percentage,
      grade
    };
  }, [scores]);

  if (!isOpen) return null;

  const handleScoreChange = (qId: string, val: number) => {
    playCyberClick();
    setScores(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    playSuccessChime();

    const evaluationItems: KirkpatrickEvaluationItem[] = DEFAULT_KIRKPATRICK_QUESTIONS.map(q => ({
      ...q,
      score: scores[q.id] || 5
    }));

    const evalRecord: KirkpatrickEvaluation = {
      id: savedEvaluation?.id || `kpk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      displayTime: new Date().toLocaleString('th-TH'),
      empId: currentUser.empId.trim().toUpperCase(),
      fullName: currentUser.fullName,
      department: currentUser.department || 'P',
      position: currentUser.position || 'พนักงาน',
      courseId: selectedCourseId,
      courseTitle: selectedCourse.title,
      reactionScore: levelScores.level1,
      learningScore: levelScores.level2,
      behaviorScore: levelScores.level3,
      resultsScore: levelScores.level4,
      overallScore: levelScores.overall,
      overallPercentage: levelScores.percentage,
      gradeLabelTh: levelScores.grade.labelTh,
      gradeBadgeColor: levelScores.grade.badgeColor,
      items: evaluationItems,
      strengths,
      applicationPlan,
      suggestions,
      recommendsCourse,
      evaluationCode: savedEvaluation?.evaluationCode || generateEvaluationCode(currentUser.empId, selectedCourseId)
    };

    saveKirkpatrickEvaluation(evalRecord);
    setSavedEvaluation(evalRecord);
    setIsSubmittedSuccess(true);
    setActiveTab('result_slip');

    if (onSaved) {
      onSaved(evalRecord);
    }
  };

  const handlePrintSlip = () => {
    playCyberClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sarabun text-slate-800">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#001f3f] via-[#002D5A] to-[#005A9C] text-white p-4 sm:p-5 relative shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <Award className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    KIRKPATRICK 4 LEVELS
                  </span>
                  <span className="text-xs text-blue-200 font-medium">
                    แบบประเมินความพึงพอใจการฝึกอบรมภายในองค์กร
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight mt-0.5">
                  ระบบประเมินผลการฝึกอบรมตามโมเดล เคิร์กแพทริก (Kirkpatrick Evaluation)
                </h2>
                <p className="text-[11px] sm:text-xs text-blue-100/90 line-clamp-1">
                  บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • ฝ่ายพัฒนาทรัพยากรบุคคล (HRD / TCT Academy)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer shrink-0"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Employee Info & Course Selector Strip */}
          <div className="mt-3.5 pt-3 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <User className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="text-slate-200">ผู้ประเมิน:</span>
              <strong className="text-white truncate font-medium">
                {currentUser?.fullName || 'พนักงาน TCT'} ({currentUser?.empId || '-'}) • แผนก {currentUser?.department || 'P'}
              </strong>
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span className="text-slate-200 shrink-0">หลักสูตร:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-slate-900/80 text-white rounded-lg px-2 py-0.5 text-xs font-semibold focus:outline-none border border-white/20 flex-1 truncate cursor-pointer"
              >
                {allCourses.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="no-print bg-slate-50 border-b border-slate-200 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => { playCyberClick(); setActiveTab('all'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#002D5A] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              ทั้งหมด 4 ระดับ (Full Form)
            </button>

            {KIRKPATRICK_LEVELS_CONFIG.map((lvl) => {
              const currentLvlScore = lvl.level === 1 ? levelScores.level1 
                : lvl.level === 2 ? levelScores.level2 
                : lvl.level === 3 ? levelScores.level3 
                : levelScores.level4;
              return (
                <button
                  key={lvl.level}
                  type="button"
                  onClick={() => { playCyberClick(); setActiveTab(lvl.level); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === lvl.level
                      ? 'bg-[#002D5A] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>ระดับ {lvl.level}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[#005A9C] font-mono text-[10px]">
                    {currentLvlScore.toFixed(1)}
                  </span>
                </button>
              );
            })}

            {savedEvaluation && (
              <button
                type="button"
                onClick={() => { playCyberClick(); setActiveTab('result_slip'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'result_slip'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>ใบสรุปผลประเมิน (Result Slip)</span>
              </button>
            )}
          </div>

          {/* Quick Score Badge */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-300">
            <span className="text-xs text-slate-500 font-medium">คะแนนรวม:</span>
            <span className="text-base font-black text-[#005A9C] font-mono">
              {levelScores.overall} / 5.0
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {levelScores.percentage}%
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* SUCCESS NOTIFICATION BANNER IF SUBMITTED */}
          {isSubmittedSuccess && activeTab !== 'result_slip' && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-emerald-950">
                    บันทึกผลการประเมินตามโมเดล Kirkpatrick สำเร็จเรียบร้อย!
                  </div>
                  <div className="text-xs text-emerald-800">
                    คะแนนเฉลี่ยรวม {savedEvaluation?.overallScore}/5.0 ({savedEvaluation?.overallPercentage}%) • {savedEvaluation?.gradeLabelTh}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('result_slip')}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                ดูใบสรุปผลประเมิน A4
              </button>
            </div>
          )}

          {/* VIEW 1: PRINTABLE OFFICIAL KIRKPATRICK ASSESSMENT SLIP */}
          {activeTab === 'result_slip' && savedEvaluation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between no-print pb-2 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="text-xs text-[#005A9C] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>← กลับไปยังแบบฟอร์มประเมิน</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintSlip}
                    className="px-3 py-1.5 rounded-xl bg-[#002D5A] hover:bg-[#001f3f] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-200" />
                    <span>พิมพ์ใบประเมิน (Print A4)</span>
                  </button>
                </div>
              </div>

              {/* Printable Slip Container (A4 Formal Quality) */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-300 shadow-sm space-y-6 text-slate-800 text-xs sm:text-sm">
                
                {/* Header with Official Logo */}
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/tct-academy-logo.svg" 
                      alt="TCT Academy" 
                      className="w-14 h-14 object-contain" 
                    />
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#002855] tracking-tight">
                        บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
                      </h3>
                      <p className="text-xs text-slate-600 font-bold">
                        TEIJIN CORD (THAILAND) CO., LTD. • สวนอุตสาหกรรมโรจนะ จ.อยุธยา
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ใบสรุปผลการประเมินความพึงพอใจและประสิทธิผลการฝึกอบรม (Kirkpatrick 4-Level Evaluation Record)
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-[#005A9C]">
                      {savedEvaluation.evaluationCode}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      วันที่บันทึก: {savedEvaluation.displayTime}
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                      ISO 9001 / IATF 16949 COMPLIANT
                    </span>
                  </div>
                </div>

                {/* Trainee & Course Meta */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">รหัสพนักงาน:</span>
                    <strong className="font-mono text-sm text-[#005A9C]">{savedEvaluation.empId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ชื่อ-นามสกุล:</span>
                    <strong className="text-slate-900">{savedEvaluation.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">แผนก / ตำแหน่ง:</span>
                    <strong className="text-slate-900">{savedEvaluation.department} • {savedEvaluation.position}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">หลักสูตรฝึกอบรม:</span>
                    <strong className="text-[#002855] truncate block" title={savedEvaluation.courseTitle}>
                      {savedEvaluation.courseTitle}
                    </strong>
                  </div>
                </div>

                {/* Summary Score 4 Levels Matrix */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#005A9C]" />
                    <span>สรุปผลคะแนนประเมิน 4 ระดับตามโมเดล Kirkpatrick</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center space-y-1">
                      <div className="text-[10px] font-bold text-blue-800 uppercase">ระดับที่ 1: REACTION</div>
                      <div className="text-xl sm:text-2xl font-black text-[#002D5A] font-mono">
                        {savedEvaluation.reactionScore} / 5.0
                      </div>
                      <div className="text-[10px] text-blue-700">ปฏิกิริยาและความพึงพอใจ</div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center space-y-1">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase">ระดับที่ 2: LEARNING</div>
                      <div className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">
                        {savedEvaluation.learningScore} / 5.0
                      </div>
                      <div className="text-[10px] text-emerald-700">การเรียนรู้และทักษะ</div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center space-y-1">
                      <div className="text-[10px] font-bold text-amber-800 uppercase">ระดับที่ 3: BEHAVIOR</div>
                      <div className="text-xl sm:text-2xl font-black text-amber-800 font-mono">
                        {savedEvaluation.behaviorScore} / 5.0
                      </div>
                      <div className="text-[10px] text-amber-700">การนำไปใช้ในงานจริง</div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center space-y-1">
                      <div className="text-[10px] font-bold text-purple-800 uppercase">ระดับที่ 4: RESULTS</div>
                      <div className="text-xl sm:text-2xl font-black text-purple-800 font-mono">
                        {savedEvaluation.resultsScore} / 5.0
                      </div>
                      <div className="text-[10px] text-purple-700">ผลลัพธ์ต่อองค์กร (QCDSM)</div>
                    </div>
                  </div>
                </div>

                {/* Overall Score Banner */}
                <div className="bg-gradient-to-r from-blue-900 to-[#002D5A] text-white p-4 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-blue-200 font-bold uppercase">ผลการประเมินภาพรวม (OVERALL RESULT)</div>
                    <div className="text-lg font-black mt-0.5">{savedEvaluation.gradeLabelTh}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                      {savedEvaluation.overallScore} / 5.0
                    </div>
                    <div className="text-xs text-blue-200 font-bold">
                      คิดเป็น {savedEvaluation.overallPercentage}%
                    </div>
                  </div>
                </div>

                {/* Qualitative Feedback Details */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <strong className="text-slate-800 block mb-0.5 font-bold">จุดเด่นของหลักสูตรที่ประทับใจ:</strong>
                    <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">{savedEvaluation.strengths || '-'}</p>
                  </div>
                  <div>
                    <strong className="text-slate-800 block mb-0.5 font-bold">แผนการนำความรู้ไปประยุกต์ใช้ในการปฏิบัติงาน:</strong>
                    <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">{savedEvaluation.applicationPlan || '-'}</p>
                  </div>
                  <div>
                    <strong className="text-slate-800 block mb-0.5 font-bold">ข้อเสนอแนะเพิ่มเติมเพื่อการปรับปรุงและพัฒนา (CQI):</strong>
                    <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">{savedEvaluation.suggestions || '-'}</p>
                  </div>
                </div>

                {/* Signatures Footer */}
                <div className="pt-6 border-t border-slate-300 grid grid-cols-2 text-center text-xs">
                  <div className="space-y-8">
                    <p className="text-slate-500">ลงชื่อ ผู้เข้ารับการฝึกอบรม (ผู้ประเมิน)</p>
                    <div>
                      <p className="font-bold text-slate-800">{savedEvaluation.fullName}</p>
                      <p className="text-[11px] text-slate-400">วันที่: {savedEvaluation.displayTime}</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <p className="text-slate-500">ลงชื่อ หัวหน้างาน / ผู้รับผิดชอบการฝึกอบรม (TCT Academy)</p>
                    <div>
                      <p className="font-bold text-slate-800">นายไชยา วรรณชัย / แผนกบุคคล (PS)</p>
                      <p className="text-[11px] text-slate-400">ผู้ตรวจสอบและรับรองผลการประเมิน</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* VIEW 2: FULL EVALUATION FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Introduction Banner */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs leading-relaxed text-blue-900">
                <ShieldCheck className="w-5 h-5 text-[#005A9C] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-[#002D5A] mb-0.5">
                    วัตถุประสงค์ของการประเมินแบบ 4 ระดับ (Kirkpatrick 4 Levels Evaluation)
                  </div>
                  <p className="text-slate-700">
                    แบบประเมินนี้ใช้สำหรับการประเมินผลการฝึกอบรมภายในองค์กรของ <strong>บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด</strong> ครอบคลุมทั้งความพึงพอใจ (Reaction), ความรู้ที่ได้รับ (Learning), การนำไปปรับใช้ในพฤติกรรมการทำงาน (Behavior), และผลสัมฤทธิ์ต่อเป้าหมายองค์กร (Results) เพื่อนำผลไปวิเคราะห์และพัฒนาหลักสูตรอย่างต่อเนื่อง (CQI)
                  </p>
                </div>
              </div>

              {/* SECTION: QUESTIONS ACCORDING TO SELECTED TAB */}
              {KIRKPATRICK_LEVELS_CONFIG.filter(cfg => activeTab === 'all' || activeTab === cfg.level).map(lvl => {
                const questionsInLevel = DEFAULT_KIRKPATRICK_QUESTIONS.filter(q => q.level === lvl.level);

                return (
                  <div key={lvl.level} className="space-y-3.5 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                    
                    {/* Level Section Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider text-white bg-gradient-to-r from-slate-800 to-[#003875] mb-1">
                          {lvl.badge}
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                          {lvl.nameTh}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {lvl.descriptionTh}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-slate-400 block font-medium">คะแนนเฉลี่ยระดับนี้</span>
                        <strong className="text-base sm:text-lg font-black text-[#005A9C] font-mono">
                          {lvl.level === 1 ? levelScores.level1 
                            : lvl.level === 2 ? levelScores.level2 
                            : lvl.level === 3 ? levelScores.level3 
                            : levelScores.level4} / 5.0
                        </strong>
                      </div>
                    </div>

                    {/* Questions in this level */}
                    <div className="space-y-4 pt-1">
                      {questionsInLevel.map((q, idx) => {
                        const currentScore = scores[q.id] || 5;

                        return (
                          <div key={q.id} className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 space-y-2.5 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div>
                                <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                                  {q.topic}
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {q.descriptionTh}
                                </p>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto font-mono text-xs">
                                <span className="font-bold text-[#005A9C] bg-white px-2 py-0.5 rounded border border-blue-200">
                                  {currentScore} / 5
                                </span>
                              </div>
                            </div>

                            {/* 5-Star / 1-5 Rating Scale Buttons */}
                            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
                              {RATING_SCALE_LABELS.map((opt) => (
                                <button
                                  key={opt.score}
                                  type="button"
                                  onClick={() => handleScoreChange(q.id, opt.score)}
                                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                    currentScore === opt.score
                                      ? 'bg-[#002D5A] text-white border-[#002D5A] shadow-md ring-2 ring-blue-400/40'
                                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-center gap-0.5">
                                    <Star className={`w-3.5 h-3.5 ${currentScore === opt.score ? 'text-amber-300 fill-amber-300' : 'text-slate-300'}`} />
                                    <span className="font-bold text-xs font-mono">{opt.score}</span>
                                  </div>
                                  <span className={`text-[10px] line-clamp-1 ${currentScore === opt.score ? 'text-blue-200 font-semibold' : 'text-slate-500'}`}>
                                    {opt.labelTh.split(' ')[0]}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}

              {/* QUALITATIVE FEEDBACK SECTION */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="font-black text-sm text-slate-900">
                    ข้อเสนอแนะและแผนการนำไปประยุกต์ใช้ในการปฏิบัติงาน (Qualitative Feedback)
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      1. จุดเด่นของหลักสูตรที่ท่านประทับใจมากที่สุด:
                    </label>
                    <textarea
                      rows={2}
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      placeholder="ระบุจุดเด่น เช่น วิทยากรอธิบายเข้าใจง่าย สื่อการสอนน่าสนใจ..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005A9C] text-slate-900 text-xs resize-none"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">ข้อความแนะนำ:</span>
                      {['เนื้อหาเข้าใจง่าย ตรงกับงาน', 'วิทยากรอธิบายชัดเจน', 'มินิเกมและตัวอย่างประกอบเห็นภาพ', 'สื่อทันสมัย สะดวกต่อการเรียน'].map(txt => (
                        <button
                          key={txt}
                          type="button"
                          onClick={() => setStrengths(prev => prev ? `${prev}, ${txt}` : txt)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                        >
                          + {txt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      2. สิ่งที่ท่านตั้งใจจะนำความรู้และทักษะไปประยุกต์ใช้ในการทำงานจริง (Action Plan):
                    </label>
                    <textarea
                      rows={2}
                      value={applicationPlan}
                      onChange={(e) => setApplicationPlan(e.target.value)}
                      placeholder="ระบุการนำไปใช้ เช่น การลดข้อผิดพลาดในกะงาน การสื่อสารที่มีประสิทธิภาพ..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005A9C] text-slate-900 text-xs resize-none"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">ข้อความแนะนำ:</span>
                      {['นำไปปรับใช้กับ SOP หน้างาน', 'เพิ่มการสื่อสารเชิงบวกในกะงาน', 'นำเทคนิคความปลอดภัยไปใช้ประจำวัน', 'แชร์ความรู้ให้เพื่อนร่วมงาน'].map(txt => (
                        <button
                          key={txt}
                          type="button"
                          onClick={() => setApplicationPlan(prev => prev ? `${prev}, ${txt}` : txt)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                        >
                          + {txt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      3. ข้อเสนอแนะเพิ่มเติมเพื่อการปรับปรุงและพัฒนาหลักสูตรอย่างต่อเนื่อง (CQI):
                    </label>
                    <textarea
                      rows={2}
                      value={suggestions}
                      onChange={(e) => setSuggestions(e.target.value)}
                      placeholder="ข้อเสนอแนะเกี่ยวกับเนื้อหา สื่อ อุปกรณ์ หรือหลักสูตรอื่นๆ ที่ต้องการเรียนรู้เพิ่มเติม..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005A9C] text-slate-900 text-xs resize-none"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">ข้อความแนะนำ:</span>
                      {['ควรจัดหลักสูตรต่อเนื่องทุกปี', 'ระบบใช้งานง่าย สะดวกมาก', 'เพิ่มกรณีศึกษาโรงงานผลิต', 'เนื้อหากระชับดีแล้ว'].map(txt => (
                        <button
                          key={txt}
                          type="button"
                          onClick={() => setSuggestions(prev => prev ? `${prev}, ${txt}` : txt)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                        >
                          + {txt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation check */}
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="kpk-recommend-chk"
                      checked={recommendsCourse}
                      onChange={(e) => setRecommendsCourse(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#005A9C] focus:ring-[#005A9C] cursor-pointer"
                    />
                    <label htmlFor="kpk-recommend-chk" className="font-bold text-slate-800 cursor-pointer">
                      ข้าพเจ้ายินดีและเห็นควรแนะนำหลักสูตรนี้ให้เพื่อนร่วมงานท่านอื่นในองค์กร
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-xs text-slate-600">
                  <span>คะแนนเฉลี่ยรวมทุกระดับ: </span>
                  <strong className="text-base text-[#005A9C] font-mono font-black">{levelScores.overall} / 5.0</strong>
                  <span className="ml-2 font-bold text-emerald-700">({levelScores.percentage}%) {levelScores.grade.labelTh}</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 cursor-pointer transition-colors"
                  >
                    ยกเลิก / ปิด
                  </button>

                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#002D5A] hover:bg-[#001f3f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>บันทึกและส่งผลการประเมิน Kirkpatrick</span>
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="no-print bg-slate-100 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div>
            © 2026 บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • ฝ่ายพัฒนาทรัพยากรบุคคล (TCT Academy)
          </div>
          <div className="font-mono text-slate-400">
            KIRKPATRICK-4LMS-V1
          </div>
        </div>

      </div>
    </div>
  );
};
