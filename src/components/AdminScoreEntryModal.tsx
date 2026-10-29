import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TraineeRecord, UserProfile } from '../types';
import { 
  updateTraineeScoresByAdmin, 
  AdminScoreUpdatePayload 
} from '../data/traineeData';
import { getAllAvailableCourses, getCourseModules } from '../utils/courseManager';
import { 
  Award, 
  CheckCircle2, 
  X, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  Save, 
  ShieldCheck, 
  RotateCcw,
  Sliders,
  HelpCircle,
  Clock,
  BookOpen,
  Gamepad2,
  Calendar,
  Layers,
  Edit3,
  Printer,
  Check
} from 'lucide-react';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';

export interface AdminScoreEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainee: TraineeRecord | null;
  initialCourseId?: string;
  onScoreSaved?: (updatedTrainee: TraineeRecord) => void;
  onOpenReport?: (trainee: TraineeRecord) => void;
  onOpenCertificate?: (trainee: TraineeRecord) => void;
}

export const AdminScoreEntryModal: React.FC<AdminScoreEntryModalProps> = ({
  isOpen,
  onClose,
  trainee,
  initialCourseId = 'applied-psychology',
  onScoreSaved,
  onOpenReport,
  onOpenCertificate
}) => {
  const allCourses = useMemo(() => getAllAvailableCourses(), []);
  const [selectedCourse, setSelectedCourse] = useState<string>(initialCourseId || 'applied-psychology');
  
  // Update selected course if initialCourseId changes on open
  useEffect(() => {
    if (isOpen) {
      if (initialCourseId && initialCourseId !== 'all') {
        setSelectedCourse(initialCourseId);
      } else if (trainee?.selectedCourseId) {
        setSelectedCourse(trainee.selectedCourseId);
      }
    }
  }, [isOpen, initialCourseId, trainee]);

  // Scores & Progress states
  const [preTestScore, setPreTestScore] = useState<number | null>(null);
  const [hasPreTest, setHasPreTest] = useState<boolean>(false);
  const [postTestScore, setPostTestScore] = useState<number | null>(null);
  const [hasPostTest, setHasPostTest] = useState<boolean>(false);
  const [miniGameScore, setMiniGameScore] = useState<number>(100);
  const [completedModules, setCompletedModules] = useState<number[]>([1, 2, 3]);
  const [postTestAttempts, setPostTestAttempts] = useState<number>(1);
  const [certificateId, setCertificateId] = useState<string>('');
  const [certificateDate, setCertificateDate] = useState<string>('13 ตุลาคม 2569');
  const [adminNote, setAdminNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const currentCourseObj = allCourses.find(c => c.id === selectedCourse) || allCourses[0];
  const dynamicModules = useMemo(() => getCourseModules(selectedCourse), [selectedCourse]);
  const totalModuleCount = dynamicModules.length || currentCourseObj?.moduleCount || 3;
  const maxModules = totalModuleCount;
  const moduleList = dynamicModules;
  const passingScore = currentCourseObj?.passingScore || (selectedCourse === 'personality-psychology' ? 15 : (selectedCourse === 'kyt-shisa-kanko' ? 16 : 8));
  const maxPossibleScore = selectedCourse === 'personality-psychology' || selectedCourse === 'kyt-shisa-kanko' ? 20 : 10;

  const openedSessionRef = useRef<string | null>(null);

  // Initialize values only when modal opens or trainee / course actually changes
  useEffect(() => {
    if (!isOpen || !trainee) {
      openedSessionRef.current = null;
      return;
    }

    const sessionKey = `${trainee.empId.trim().toUpperCase()}_${selectedCourse}`;
    if (openedSessionRef.current === sessionKey) {
      return;
    }

    openedSessionRef.current = sessionKey;
    const courseProgress = trainee.coursesProgress?.[selectedCourse];
    
    const pre = courseProgress?.preTestScore !== undefined 
      ? courseProgress.preTestScore 
      : (trainee.selectedCourseId === selectedCourse ? trainee.preTestScore : null);
    
    const post = courseProgress?.postTestScore !== undefined 
      ? courseProgress.postTestScore 
      : (trainee.selectedCourseId === selectedCourse ? trainee.postTestScore : null);
    
    setPreTestScore(pre);
    setHasPreTest(pre !== null);
    
    setPostTestScore(post);
    setHasPostTest(post !== null);

    setMiniGameScore(courseProgress?.miniGameScore ?? trainee.miniGameScore ?? 100);
    
    const allModIds = Array.from({ length: totalModuleCount }, (_, i) => i + 1);
    setCompletedModules(courseProgress?.completedModules ?? (post !== null && post >= passingScore ? allModIds : (trainee.completedModules || [])));
    
    setPostTestAttempts(courseProgress?.postTestAttempts ?? trainee.postTestAttempts ?? 1);
    
    const prefixLookup: Record<string, string> = {
      'applied-psychology': 'PSY',
      'kyt-shisa-kanko': 'KYT',
      'personality-psychology': 'DISC',
      'ai-for-tct': 'AI',
      'conflict-management': 'CFM',
      'advanced-preventive-maintenance': 'APM',
      'risk-management': 'QSRM'
    };
    const defaultCertPrefix = prefixLookup[selectedCourse] || 'TCT';
    const defaultDate = selectedCourse === 'applied-psychology' ? '13 ตุลาคม 2569' : '23 สิงหาคม 2569';

    setCertificateId(
      courseProgress?.certificateId || 
      (trainee.selectedCourseId === selectedCourse ? trainee.certificateId : undefined) || 
      `TCT-${defaultCertPrefix}-2026-${trainee.empId}-${Math.floor(1000 + Math.random() * 9000)}`
    );
    setCertificateDate(courseProgress?.certificateDate || (trainee.selectedCourseId === selectedCourse ? trainee.certificateDate : undefined) || defaultDate);
    setAdminNote('');
    setSaveSuccess(false);
  }, [isOpen, trainee?.empId, selectedCourse, totalModuleCount, passingScore]);

  if (!isOpen || !trainee) return null;

  const calculatedPass = hasPostTest && postTestScore !== null && postTestScore >= passingScore;
  const passPercent = postTestScore !== null ? Math.round((postTestScore / maxPossibleScore) * 100) : 0;

  // Preset Handlers
  const handleApplyPresetMax = () => {
    playCyberClick();
    setHasPreTest(true);
    setPreTestScore(maxPossibleScore);
    setHasPostTest(true);
    setPostTestScore(maxPossibleScore);
    setMiniGameScore(100);
    setCompletedModules(Array.from({ length: totalModuleCount }, (_, i) => i + 1));
    setPostTestAttempts(1);
    const prefixLookup: Record<string, string> = {
      'applied-psychology': 'PSY',
      'kyt-shisa-kanko': 'KYT',
      'personality-psychology': 'DISC',
      'ai-for-tct': 'AI',
      'conflict-management': 'CFM',
      'advanced-preventive-maintenance': 'APM',
      'risk-management': 'QSRM'
    };
    const prefix = prefixLookup[selectedCourse] || 'TCT';
    setCertificateId(`TCT-${prefix}-2026-${trainee.empId}-99${Math.floor(10 + Math.random() * 89)}`);
    setAdminNote(`บันทึกผลสอบคะแนนเต็ม ${maxPossibleScore}/${maxPossibleScore} ผ่านเกณฑ์ระดับยอดเยี่ยม`);
  };

  const handleApplyPresetPass = () => {
    playCyberClick();
    setHasPreTest(true);
    setPreTestScore(Math.floor(passingScore * 0.7));
    setHasPostTest(true);
    setPostTestScore(passingScore);
    setMiniGameScore(100);
    setCompletedModules(Array.from({ length: totalModuleCount }, (_, i) => i + 1));
    setPostTestAttempts(1);
    const prefixLookup: Record<string, string> = {
      'applied-psychology': 'PSY',
      'kyt-shisa-kanko': 'KYT',
      'personality-psychology': 'DISC',
      'ai-for-tct': 'AI',
      'conflict-management': 'CFM',
      'advanced-preventive-maintenance': 'APM',
      'risk-management': 'QSRM'
    };
    const prefix = prefixLookup[selectedCourse] || 'TCT';
    setCertificateId(`TCT-${prefix}-2026-${trainee.empId}-88${Math.floor(10 + Math.random() * 89)}`);
    setAdminNote(`บันทึกผลสอบผ่านเกณฑ์มาตรฐาน ${passingScore}/${maxPossibleScore} (≥80%)`);
  };

  const handleApplyResetNotStarted = () => {
    playCyberClick();
    setHasPreTest(false);
    setPreTestScore(null);
    setHasPostTest(false);
    setPostTestScore(null);
    setMiniGameScore(0);
    setCompletedModules([]);
    setPostTestAttempts(0);
    setAdminNote('รีเซ็ตเป็นสถานะยังไม่ได้ทำแบบทดสอบ');
  };

  const handleToggleModule = (modId: number) => {
    playCyberClick();
    if (completedModules.includes(modId)) {
      setCompletedModules(completedModules.filter(id => id !== modId));
    } else {
      setCompletedModules([...completedModules, modId].sort((a, b) => a - b));
    }
  };

  const handleSelectAllModules = () => {
    playCyberClick();
    setCompletedModules(Array.from({ length: totalModuleCount }, (_, i) => i + 1));
  };

  const handleSave = () => {
    playCyberClick();
    setIsSaving(true);

    const finalPreScore = hasPreTest ? (preTestScore !== null ? Number(preTestScore) : 0) : null;
    const finalPostScore = hasPostTest ? (postTestScore !== null ? Number(postTestScore) : 0) : null;
    const isPassing = finalPostScore !== null && finalPostScore >= passingScore;

    const payload: AdminScoreUpdatePayload = {
      empId: trainee.empId,
      fullName: trainee.fullName,
      courseId: selectedCourse,
      preTestScore: finalPreScore,
      postTestScore: finalPostScore,
      miniGameScore: Number(miniGameScore) || 0,
      completedModules: completedModules,
      postTestAttempts: Number(postTestAttempts) || 1,
      certificateId: isPassing ? certificateId : undefined,
      certificateDate: isPassing ? certificateDate : undefined,
      adminNote: adminNote.trim() || undefined
    };

    const updated = updateTraineeScoresByAdmin(payload);
    
    // Push to server directly
    try {
      fetch(`/api/trainees/${encodeURIComponent(trainee.empId.trim().toUpperCase())}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          fullName: trainee.fullName,
          department: trainee.department,
          position: trainee.position
        })
      }).catch(() => {});
    } catch (e) {}

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      playSuccessChime();

      if (onScoreSaved && updated) {
        onScoreSaved(updated);
      }

      setTimeout(() => {
        onClose();
      }, 700);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-50 border border-slate-300 rounded-3xl w-full max-w-[95vw] sm:max-w-3xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200 font-sarabun text-slate-800">
        
        {/* Header - Official Corporate Royal Navy Gradient ONLY */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#001f3f] via-[#002D5A] to-[#005A9C] text-white flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 border border-white/25 text-amber-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>กรอกและแก้ไขคะแนนผลการทดสอบ (Admin Scoring Console)</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-900/90 border border-blue-400/40 text-amber-300 text-[10px] font-mono font-bold">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-blue-100/90">
                ระบบจัดการคะแนน Pre-Test / Post-Test วุฒิบัตร และบทเรียน (เฉพาะแอดมินเท่านั้น)
              </p>
            </div>
          </div>
          
          <button
            onClick={() => { playCyberClick(); onClose(); }}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trainee Profile Bar - Soft Light Corporate Tint */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#002D5A] to-[#005A9C] flex items-center justify-center font-bold text-white text-xs shadow-xs border border-blue-800">
              {trainee.department}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>{trainee.fullName}</span>
                <span className="text-[#005A9C] font-mono font-bold">({trainee.empId})</span>
              </div>
              <div className="text-slate-600 text-[11px] flex items-center gap-2">
                <span className="text-[#005A9C] font-bold">แผนก {trainee.department}</span>
                <span>•</span>
                <span>{trainee.position || 'พนักงานเข้าอบรม'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border shadow-xs ${
              calculatedPass 
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800' 
                : hasPostTest 
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-slate-200 border-slate-300 text-slate-600'
            }`}>
              {calculatedPass ? '🏆 สถานะ: สอบผ่านเกณฑ์ (Passed)' : hasPostTest ? '🟡 สถานะ: รอสอบแก้ตัว' : '⚪ สถานะ: ยังไม่เริ่ม'}
            </span>
          </div>
        </div>

        {/* Course Switcher Tabs - Soft Clean Light Theme */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-white border-b border-slate-200">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#005A9C]" />
            <span>เลือกหลักสูตรที่ต้องการจัดการคะแนน:</span>
          </label>
          <div className="flex gap-2 pb-2 overflow-x-auto custom-scrollbar">
            {allCourses.map((c) => {
              const isSelected = selectedCourse === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => { playCyberClick(); setSelectedCourse(c.id); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    isSelected
                      ? 'bg-[#002D5A] text-white border-[#002D5A] shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span>{c.title.split('(')[0].trim()}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-4 sm:px-6 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="text-slate-600 flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ปุ่มลัดตั้งค่าด่วน:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleApplyPresetMax}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
            >
              <span>⚡ สอบผ่านเต็ม 10/10</span>
            </button>
            <button
              type="button"
              onClick={handleApplyPresetPass}
              className="px-2.5 py-1 rounded-lg bg-[#005A9C] hover:bg-[#004070] text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
            >
              <span>🎯 ผ่านเกณฑ์ {passingScore}/{maxPossibleScore}</span>
            </button>
            <button
              type="button"
              onClick={handleApplyResetNotStarted}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 text-[11px] font-bold transition-all cursor-pointer"
            >
              <span>🔄 รีเซ็ตเป็นยังไม่สอบ</span>
            </button>
          </div>
        </div>

        {/* Form Body - Soft White Background */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[58vh] overflow-y-auto custom-scrollbar bg-[#f8fafc]">
          
          {/* Main Scores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Pre-Test Section */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <label className="font-bold text-slate-800 text-xs">
                    คะแนนทดสอบก่อนเรียน (Pre-Test)
                  </label>
                </div>
                
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPreTest}
                    onChange={(e) => {
                      setHasPreTest(e.target.checked);
                      if (e.target.checked && preTestScore === null) setPreTestScore(5);
                      if (!e.target.checked) setPreTestScore(null);
                    }}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-400 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-600">มีผลสอบ Pre-Test</span>
                </label>
              </div>

              {hasPreTest ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between bg-purple-50/60 p-2.5 rounded-xl border border-purple-200">
                    <span className="text-xs text-slate-700 font-medium">คะแนนที่ได้ (เต็ม {maxPossibleScore}):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={maxPossibleScore}
                        value={preTestScore ?? 0}
                        onChange={(e) => setPreTestScore(Math.max(0, Math.min(maxPossibleScore, Number(e.target.value))))}
                        className="w-16 bg-white border-2 border-purple-300 focus:border-purple-600 rounded-lg px-2 py-1 text-center font-mono font-bold text-purple-900 text-base focus:outline-none"
                      />
                      <span className="text-slate-500 font-mono text-xs font-bold">/ {maxPossibleScore}</span>
                    </div>
                  </div>

                  {/* Pre-test score buttons */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {[0, 2, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={`pre-${score}`}
                        type="button"
                        onClick={() => { playCyberClick(); setPreTestScore(score); }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                          preTestScore === score
                            ? 'bg-purple-600 border-purple-700 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                  ยังไม่ได้ทำแบบทดสอบก่อนเรียน (สถานะ: - / {maxPossibleScore})
                </div>
              )}
            </div>

            {/* 2. Post-Test Section */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs ${
                    calculatedPass ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    2
                  </div>
                  <label className="font-bold text-slate-800 text-xs">
                    คะแนนทดสอบหลังเรียน (Post-Test)
                  </label>
                </div>
                
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPostTest}
                    onChange={(e) => {
                      setHasPostTest(e.target.checked);
                      if (e.target.checked && postTestScore === null) setPostTestScore(passingScore);
                      if (!e.target.checked) setPostTestScore(null);
                    }}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-400 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-600">มีผลสอบ Post-Test</span>
                </label>
              </div>

              {hasPostTest ? (
                <div className="space-y-2.5">
                  <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    calculatedPass ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-700 font-medium">คะแนนที่ได้:</span>
                      {calculatedPass ? (
                        <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300">
                          ผ่านเกณฑ์ ≥{passingScore}
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-700 font-bold px-2 py-0.5 rounded-full bg-rose-100 border border-rose-300">
                          ไม่ผ่านเกณฑ์ (&lt;{passingScore})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={maxPossibleScore}
                        value={postTestScore ?? 0}
                        onChange={(e) => setPostTestScore(Math.max(0, Math.min(maxPossibleScore, Number(e.target.value))))}
                        className={`w-16 bg-white border-2 rounded-lg px-2 py-1 text-center font-mono font-bold text-base focus:outline-none ${
                          calculatedPass 
                            ? 'border-emerald-400 text-emerald-900 focus:border-emerald-600' 
                            : 'border-amber-400 text-amber-900 focus:border-amber-600'
                        }`}
                      />
                      <span className="text-slate-500 font-mono text-xs font-bold">/ {maxPossibleScore}</span>
                    </div>
                  </div>

                  {/* Post-test score buttons */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {[0, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={`post-${score}`}
                        type="button"
                        onClick={() => { 
                          playCyberClick(); 
                          setPostTestScore(score); 
                          if (score >= passingScore && completedModules.length === 0) {
                            setCompletedModules(Array.from({ length: totalModuleCount }, (_, i) => i + 1));
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                          postTestScore === score
                            ? score >= passingScore
                              ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                              : 'bg-amber-600 border-amber-700 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {score} {score >= passingScore ? '✓' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                  ยังไม่ได้ทำแบบทดสอบหลังเรียน (สถานะ: - / {maxPossibleScore})
                </div>
              )}
            </div>

          </div>

          {/* Module Completion & Attempts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Completed Modules Checkbox Group */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#005A9C]" />
                  <label className="font-bold text-slate-800 text-xs">
                    บทเรียนที่สำเร็จแล้ว ({completedModules.length}/{maxModules} บท)
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSelectAllModules}
                  className="text-[11px] text-[#005A9C] hover:underline font-bold cursor-pointer"
                >
                  เลือกทุกบท
                </button>
              </div>

              <div className="space-y-1.5">
                {moduleList.map((mod) => {
                  const isChecked = completedModules.includes(mod.id);
                  return (
                    <label
                      key={`mod-${mod.id}`}
                      onClick={() => handleToggleModule(mod.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-semibold' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-[#005A9C] focus:ring-blue-400 w-4 h-4 cursor-pointer"
                      />
                      <span className="truncate">{mod.name || `บทเรียนที่ ${mod.id}`}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Additional Parameters: Attempts & Mini-Game */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-amber-600" />
                <label className="font-bold text-slate-800 text-xs">
                  พารามิเตอร์เพิ่มเติม (Attempts & Certification)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Number of Post-Test Attempts */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-600 block font-medium">จำนวนครั้งที่สอบ:</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={postTestAttempts}
                      onChange={(e) => setPostTestAttempts(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-900 text-xs focus:outline-none focus:border-[#005A9C]"
                    />
                    <span className="text-[10px] text-slate-500">ครั้ง</span>
                  </div>
                </div>

                {/* Mini-Game Score */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-600 block font-medium">คะแนนมินิเกม:</span>
                  <div className="flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-amber-500" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={miniGameScore}
                      onChange={(e) => setMiniGameScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-slate-500">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Certificate Information (If passed) */}
              {calculatedPass && (
                <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>ข้อมูลวุฒิบัตรรับรองดิจิทัล:</span>
                  </div>
                  
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-600 font-medium">เลขที่วุฒิบัตร (Certificate ID):</span>
                      <input
                        type="text"
                        value={certificateId}
                        onChange={(e) => setCertificateId(e.target.value)}
                        placeholder="เช่น TCT-PSY-2026-10019-8821"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#005A9C]"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-600 font-medium">วันที่อนุมัติวุฒิบัตร:</span>
                      <input
                        type="text"
                        value={certificateDate}
                        onChange={(e) => setCertificateDate(e.target.value)}
                        placeholder="13 ตุลาคม 2569"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 text-xs focus:outline-none focus:border-[#005A9C]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Admin Note / Audit Reason */}
          <div className="space-y-1.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[#005A9C]" />
              <span>หมายเหตุการกรอก/แก้ไขคะแนน (Admin Note / Audit Log):</span>
            </label>
            <input
              type="text"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="ระบุเหตุผล เช่น 'บันทึกคะแนนสอบ On-site กระดาษ', 'ปรับปรุงคะแนนตามมติคณะกรรมการ', 'เทียบโอนผลสัมฤทธิ์'"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-[#005A9C]"
            />
          </div>

          {/* Outcome Summary Box */}
          <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                calculatedPass ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
              }`}>
                {hasPostTest ? `${postTestScore}/${maxPossibleScore}` : '-'}
              </div>
              <div>
                <div className="font-bold text-slate-900">
                  ผลการบันทึก: {calculatedPass ? '🏆 ผ่านเกณฑ์และอนุมัติรับใบประกาศนียบัตร' : hasPostTest ? '🟡 ไม่ผ่านเกณฑ์ (ต้องได้ ≥ 80%)' : '⚪ ยังไม่เริ่มสอบ'}
                </div>
                <div className="text-slate-600 text-[11px] mt-0.5">
                  Pre-Test: {hasPreTest ? `${preTestScore}/${maxPossibleScore}` : '-'} • Post-Test: {hasPostTest ? `${postTestScore}/${maxPossibleScore} (${passPercent}%)` : '-'} • บทเรียน: {completedModules.length}/{maxModules} บท
                </div>
              </div>
            </div>

            {calculatedPass && (
              <div className="shrink-0 hidden sm:block">
                <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[11px] flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>สิทธิ์รับใบประกาศ A4</span>
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenReport && (
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  onOpenReport(trainee);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="เปิดและพิมพ์ใบรายงานผลการฝึกอบรมรายบุคคล A4 (TH Sarabun)"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>พิมพ์รายงานผลรายบุคคล A4</span>
              </button>
            )}

            {calculatedPass && onOpenCertificate && (
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  onOpenCertificate(trainee);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="เปิดดูและพิมพ์ใบประกาศนียบัตร E-Certificate"
              >
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>พิมพ์ใบประกาศ A4</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { playCyberClick(); onClose(); }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#002D5A] hover:bg-[#001f3f] text-white active:scale-95'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังบันทึกคะแนน...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึกคะแนนสำเร็จ!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>บันทึกคะแนนทันที (Save Scores)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
