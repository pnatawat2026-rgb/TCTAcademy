import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CourseModule, ShuffledQuestion, UserProfile, ViewState } from '../types';
import { shuffleArray } from '../utils/shuffle';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  HelpCircle, 
  Lightbulb, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  Activity, 
  FileText,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  X,
  Clock,
  Lock,
  Unlock,
  Timer,
  Info,
  Tv,
  Zap,
  Gamepad2,
  FileCheck,
  ShieldCheck,
  Home,
  Bot,
  Cpu,
  Shield,
  Send,
  Copy,
  ExternalLink,
  Globe,
  Award,
  BookOpen
} from 'lucide-react';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';
import { ModuleVideoPlayer } from './ModuleVideoPlayer';
import { checkIsVideoWatched, markVideoAsWatched } from '../utils/videoManager';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { AI_GAME_1_PAIRS, AI_GAME_2_ITEMS } from '../data/aiCourseData';

interface ModuleViewProps {
  module: CourseModule;
  modules: CourseModule[];
  questions: any[];
  user: UserProfile;
  onCompleteModule: (moduleId: number) => void;
  onNavigate: (view: ViewState) => void;
}

export const ModuleView: React.FC<ModuleViewProps> = ({
  module,
  modules,
  questions,
  user,
  onCompleteModule,
  onNavigate
}) => {
  const { t, language } = useLanguage();
  const currentCourseId = module.courseId || user.selectedCourseId || 'advanced-preventive-maintenance';
  const isAlreadyCompleted = user.completedModules.includes(module.id);
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content');
  const [isVideoComplete, setIsVideoComplete] = useState<boolean>(() => {
    return isAlreadyCompleted || checkIsVideoWatched(user.empId, module.id, currentCourseId);
  });

  const [notification, setNotification] = useState<string | null>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount or module change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const isWatched = isAlreadyCompleted || checkIsVideoWatched(user.empId, module.id, currentCourseId);
    setIsVideoComplete(isWatched);
    if (isAlreadyCompleted) {
      setQuizSubmitted(true);
      setQuizScore(module.quizQuestionIds.length);
    }
  }, [module.id, currentCourseId, user.empId, isAlreadyCompleted, module.quizQuestionIds.length]);

  // Reading duration timer (<= 2 minutes as requested: "กำหนดระยะเวลาการอ่านตามข้อความไม่เกิน 2 นาที")
  const [readingSecondsRemaining, setReadingSecondsRemaining] = useState<number>(() => {
    return isAlreadyCompleted ? 0 : 120; // 2 minutes (120 seconds)
  });
  const [isReadingTimePassed, setIsReadingTimePassed] = useState<boolean>(isAlreadyCompleted);

  useEffect(() => {
    if (isAlreadyCompleted) {
      setReadingSecondsRemaining(0);
      setIsReadingTimePassed(true);
      return;
    }

    setReadingSecondsRemaining(120);
    setIsReadingTimePassed(false);

    const timer = setInterval(() => {
      setReadingSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsReadingTimePassed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [module.id, isAlreadyCompleted]);

  // Interactive Tools states
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<{ severity: number; likelihood: number } | null>({
    severity: 4,
    likelihood: 3
  });
  const [selectedHierarchyLevel, setSelectedHierarchyLevel] = useState<number>(1);
  const [activeWhyStep, setActiveWhyStep] = useState<number>(5);

  // New CBM/PdM/RCM Interactive States
  const [vibrationVal, setVibrationVal] = useState<number>(2.4);
  const [pfSliderVal, setPfSliderVal] = useState<number>(65);
  const [rcmSeverity, setRcmSeverity] = useState<number>(4);
  const [rcmProbability, setRcmProbability] = useState<number>(3);

  // AI for TCT Interactive States
  const [selectedAiToolTask, setSelectedAiToolTask] = useState<number>(1);
  const [privacyAnswerRevealed, setPrivacyAnswerRevealed] = useState<Record<number, boolean>>({});
  const [activePassportStep, setActivePassportStep] = useState<number>(1);
  const [promptContext, setPromptContext] = useState<string>('ฉันเป็นพนักงานธุรการ ฝ่ายจัดซื้อ บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด');
  const [promptTask, setPromptTask] = useState<string>('ช่วยร่างอีเมลติดตามสถานะการจัดส่งสารเคมีเคลือบเส้นคอร์ดที่ล่าช้ากว่ากำหนด 2 วัน');
  const [promptFormat, setPromptFormat] = useState<string>('จัดเป็น 3 ประเด็นหลัก พร้อมตารางแสดงรหัส PO และกำหนดวันใหม่');
  const [promptTone, setPromptTone] = useState<string>('สุภาพ เป็นทางการ และให้เกียรติคู่ค้าตามธรรมเนียมธุรกิจญี่ปุ่น');
  const [actionPlanChecks, setActionPlanChecks] = useState<Record<string, boolean>>({
    'p1': true,
    'p2': false,
    'p3': false
  });
  const [copiedPassportUrl, setCopiedPassportUrl] = useState<boolean>(false);
  const [passportChecklist, setPassportChecklist] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false
  });
  const [passportTraineeStatus, setPassportTraineeStatus] = useState<'pending' | 'registered' | 'certified'>('registered');

  // Module Quiz questions with shuffled choices
  const quizQuestions: ShuffledQuestion[] = useMemo(() => {
    if (!module || !Array.isArray(module.quizQuestionIds) || !Array.isArray(questions)) return [];
    return module.quizQuestionIds.reduce((acc, id) => {
      const q = questions.find((item) => item && item.id === id);
      if (q) {
        acc.push({
          id: q.id,
          moduleId: q.moduleId || module.id,
          questionText: q.questionText || '',
          shuffledChoices: shuffleArray(q.choices || []),
          explanation: q.explanation || ''
        });
      }
      return acc;
    }, [] as ShuffledQuestion[]);
  }, [module?.id, module?.quizQuestionIds, questions]);

  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(isAlreadyCompleted);
  const [quizScore, setQuizScore] = useState<number | null>(isAlreadyCompleted ? quizQuestions.length : null);

  const isQuizPassed = isAlreadyCompleted || (quizSubmitted && quizScore === quizQuestions.length);
  const isModuleFullyPassed = isAlreadyCompleted || (isVideoComplete && isQuizPassed);

  const handleSelectQuizAnswer = (qId: number, cId: string) => {
    if (quizSubmitted && isQuizPassed) return;
    playCyberClick();
    setQuizAnswers((prev) => ({ ...prev, [qId]: cId }));
  };

  const handleQuizSubmit = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      const selected = q.shuffledChoices.find((c) => c.id === quizAnswers[q.id]);
      if (selected && selected.isCorrect) score += 1;
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    if (score === quizQuestions.length) {
      playSuccessChime();
      onCompleteModule(module.id);
      setNotification('🎉 ยินดีด้วย! คุณตอบถูกครบทุกข้อและผ่านบทเรียนนี้แล้ว สามารถกดไปบทเรียนถัดไปได้ทันที');
      setTimeout(() => setNotification(null), 7000);
    } else {
      playErrorBuzz();
      setNotification(`⚠️ คุณได้คะแนน ${score}/${quizQuestions.length} คะแนน ต้องตอบถูกครบทุกข้อเพื่อผ่าน กรุณาทบทวนแล้วลองใหม่อีกครั้ง`);
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const handleRetryQuiz = () => {
    playCyberClick();
    setQuizSubmitted(false);
    setQuizAnswers({});
    setQuizScore(null);
  };

  const choiceLabels = ['ก', 'ข', 'ค', 'ง'];

  // Handle attempt to open Quiz tab
  const handleAttemptOpenQuiz = () => {
    if (!isVideoComplete && !isAlreadyCompleted) {
      playErrorBuzz();
      setNotification('🔒 กรุณากดลิงก์เพื่อไปดูวิดีโอในบทนี้จนจบก่อน จึงจะสามารถทำแบบทดสอบท้ายบทได้ (ระบบไม่อนุญาตให้กดข้าม)');
      setTimeout(() => setNotification(null), 6000);
      const vidEl = document.getElementById(`module-video-container-${module.id}`);
      if (vidEl) vidEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    playCyberClick();
    setActiveTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if a specific module is unlocked for navigation
  const isModuleUnlocked = (modId: number) => {
    // In all courses, allow employees to freely navigate between modules to study content and watch videos
    // The quiz in each module remains strictly locked until the video is watched completely without skipping
    return true;
  };

  const handleModuleTabClick = (targetModId: number) => {
    if (targetModId === module.id) return;
    playCyberClick();

    if (isModuleUnlocked(targetModId)) {
      if (isModuleFullyPassed) {
        onCompleteModule(module.id);
      }
      onNavigate(`module${targetModId}` as ViewState);
    } else {
      playErrorBuzz();
      setNotification(`🔒 บทเรียนที่ ${targetModId} ยังถูกล็อคอยู่! ท่านต้องดูวิดีโอและทำแบบทดสอบบทเรียนก่อนหน้าให้ผ่านครบถ้วนก่อน`);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Proceed to Next Step / Next Module
  const handleProceedNext = () => {
    playCyberClick();
    if (!isVideoComplete && !isAlreadyCompleted) {
      playErrorBuzz();
      setNotification('🔒 กรุณารับชมวิดีโอให้จบ และทำแบบทดสอบท้ายบทให้ผ่านก่อน จึงจะไปบทถัดไปได้');
      setTimeout(() => setNotification(null), 5000);
      const vidEl = document.getElementById(`module-video-container-${module.id}`);
      if (vidEl) vidEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!isQuizPassed) {
      playErrorBuzz();
      setNotification('🔒 กรุณาทำแบบทดสอบท้ายบท (Quiz) ให้ผ่านครบทุกข้อก่อน จึงจะไปบทถัดไปได้');
      setTimeout(() => setNotification(null), 5000);
      setActiveTab('quiz');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Ensure completion is saved permanently
    onCompleteModule(module.id);

    if (module.id < modules.length) {
      onNavigate(`module${module.id + 1}` as ViewState);
    } else {
      onNavigate('game');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8 cyber-grid space-y-4 font-sarabun">
      {/* Top Quick Switcher Tabs with Strict Locks */}
      <div className={`grid ${modules.length >= 7 ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7' : modules.length > 4 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-4'} gap-1.5 sm:gap-2`}>
        {modules.map((m) => {
          const isCurrent = m.id === module.id;
          const isDone = user.completedModules.includes(m.id) || (isCurrent && isQuizPassed);
          const isUnlocked = isModuleUnlocked(m.id);

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModuleTabClick(m.id)}
              className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 sm:gap-2 relative ${
                isCurrent
                  ? 'bg-gradient-to-r from-cyan-950 to-blue-950 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg'
                  : isDone
                  ? 'bg-slate-900/80 border-emerald-500/40 text-slate-300 hover:border-cyan-400'
                  : isUnlocked
                  ? 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-cyan-500/40'
                  : 'bg-slate-950/80 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
              title={!isUnlocked ? `บทเรียนที่ ${m.id} ถูกล็อค: ต้องผ่านบทเรียนก่อนหน้าก่อน` : `คลิกเพื่อเข้าสู่บทเรียนที่ ${m.id}`}
            >
              <div className="truncate min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isCurrent 
                      ? 'bg-cyan-400 text-black' 
                      : isDone 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : isUnlocked 
                      ? 'bg-slate-800 text-slate-300' 
                      : 'bg-slate-900 text-slate-600'
                  }`}>
                    {m.id}
                  </span>
                  <span className={isCurrent ? 'text-cyan-300 font-bold' : isDone ? 'text-emerald-400 font-medium' : isUnlocked ? 'text-slate-300' : 'text-slate-500'}>
                    บทเรียน 0{m.id}
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-slate-100 truncate mt-0.5">
                  {m.thaiTitle.split('(')[0].trim()}
                </div>
              </div>

              <div className="shrink-0 flex items-center">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                ) : !isUnlocked ? (
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Module Header Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-cyan-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <button
                id="module-home-btn"
                type="button"
                onClick={() => { playCyberClick(); onNavigate('courses'); }}
                className="h-8 px-2.5 sm:px-3 rounded-lg bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title={language === 'th' ? "กลับสู่หน้ารายวิชาทั้งหมด" : "Back to Course Catalog"}
              >
                <Home className="w-3.5 h-3.5 text-cyan-200" />
                <span>{t('nav.home', 'หน้าแรก', 'Home')}</span>
              </button>
              <button
                id="module-dashboard-btn"
                type="button"
                onClick={() => { playCyberClick(); onNavigate('dashboard'); }}
                className="h-8 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('nav.dashboard', 'แดชบอร์ด', 'Dashboard')}</span>
              </button>
              <LanguageToggle variant="compact" />
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                MODULE 0{module.id} • {module.durationMinutes} MIN
              </span>
              {isModuleFullyPassed ? (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5" /> {t('mod.passed', 'ผ่านบทเรียนนี้แล้ว (ดูวิดีโอ & สอบผ่าน)', 'Module Completed (Watched & Passed)')}
                </span>
              ) : isVideoComplete ? (
                <span className="flex items-center gap-1 text-xs text-purple-300 font-medium bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                  <HelpCircle className="w-3.5 h-3.5" /> {t('mod.readyQuiz', 'ดูวิดีโอจบแล้ว • รอตอบแบบทดสอบท้ายบท', 'Video Completed • Ready for Quiz')}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-amber-300 font-medium bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                  <Lock className="w-3.5 h-3.5" /> {t('mod.watchToUnlock', 'ต้องดูวิดีโอให้จบเพื่อปลดล็อคข้อสอบ', 'Watch video completely to unlock quiz')}
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-white">
              {module.title}
            </h1>
            <p className="text-xs sm:text-sm text-cyan-300/90 mt-1">
              {module.thaiTitle}
            </p>
          </div>

          {/* Tab Switcher with Video Lock Enforced */}
          <div className="w-full sm:w-auto flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              id={`tab-content-mod-${module.id}`}
              onClick={() => { playCyberClick(); setActiveTab('content'); }}
              className={`flex-1 sm:flex-none text-center px-3 sm:px-4 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              เนื้อหา & วิดีโอ
            </button>
            <button
              id={`tab-quiz-mod-${module.id}`}
              onClick={handleAttemptOpenQuiz}
              className={`flex-1 sm:flex-none text-center px-3 sm:px-4 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                  : isVideoComplete || isAlreadyCompleted
                  ? 'text-slate-300 hover:text-purple-300'
                  : 'text-slate-500 hover:text-amber-300'
              }`}
              title={isVideoComplete || isAlreadyCompleted ? 'ทำแบบทดสอบท้ายบท' : 'ต้องดูวิดีโอให้จบก่อนจึงจะเปิดแบบทดสอบได้'}
            >
              {isVideoComplete || isAlreadyCompleted ? (
                <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span>แบบทดสอบท้ายบท ({quizQuestions.length} ข้อ)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Status Notification Banner */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-cyan-950/90 border border-cyan-400/50 text-xs text-cyan-100 flex items-center gap-2.5 animate-fadeIn shadow-lg">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Main Content Tab */}
      {activeTab === 'content' ? (
        <div className="space-y-6">
          {/* 1. Official YouTube / Local Video Player (Excluded for AI Course per user directive) */}
          {currentCourseId !== 'ai-for-tct' && (
            <div ref={videoSectionRef}>
              <ModuleVideoPlayer 
                moduleId={module.id} 
                courseId={currentCourseId}
                empId={user.empId} 
                isAlreadyCompleted={isAlreadyCompleted}
                onSelectModule={(targetId) => {
                  onNavigate(`module${targetId}` as ViewState);
                }}
                onVideoComplete={() => {
                  setIsVideoComplete(true);
                  setNotification('🎉 คุณรับชมวิดีโอจบแล้ว! ปลดล็อคแบบทดสอบท้ายบท (Quiz) เรียบร้อย');
                  setTimeout(() => setNotification(null), 6000);
                }}
              />
            </div>
          )}

          {/* Video & Quiz Flow Guide Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isModuleFullyPassed 
              ? 'bg-emerald-50/70 border-emerald-200 shadow-sm' 
              : isVideoComplete 
              ? 'bg-blue-50/70 border-blue-200 shadow-sm' 
              : 'bg-amber-50/70 border-amber-200 shadow-sm'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isModuleFullyPassed 
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700' 
                    : isVideoComplete 
                    ? 'bg-blue-100 border-blue-300 text-[#002D5A]' 
                    : 'bg-amber-100 border-amber-300 text-amber-800'
                }`}>
                  {isModuleFullyPassed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isVideoComplete ? (
                    <HelpCircle className="w-5 h-5 text-blue-700" />
                  ) : (
                    <Lock className="w-5 h-5 text-amber-700" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-bold ${
                      isModuleFullyPassed ? 'text-emerald-800' : isVideoComplete ? 'text-[#002D5A]' : 'text-amber-800'
                    }`}>
                      {isModuleFullyPassed 
                        ? '✓ ผ่านบทเรียนที่ ' + module.id + ' สมบูรณ์แล้ว' 
                        : currentCourseId === 'ai-for-tct'
                        ? '📖 ศึกษาเนื้อหาเอกสารและกิจกรรมด้านล่าง แล้วทำแบบทดสอบท้ายบท (Quiz)'
                        : isVideoComplete 
                        ? '✓ ดูวิดีโอจบแล้ว: ขั้นตอนถัดไปคือทำแบบทดสอบท้ายบท (Quiz)' 
                        : '🔒 ขั้นตอนที่ 1: ต้องรับชมวิดีโอด้านบนให้จบเพื่อปลดล็อคข้อสอบ'}
                    </span>

                    <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                      {currentCourseId !== 'ai-for-tct' ? (
                        <span className={`px-2.5 py-0.5 rounded-full border flex items-center gap-1 font-sans font-semibold ${
                          isVideoComplete 
                            ? 'bg-emerald-100/80 border-emerald-300 text-emerald-800' 
                            : 'bg-amber-100/80 border-amber-300 text-amber-800'
                        }`}>
                          <Tv className="w-3 h-3" />
                          1. วิดีโอ: {isVideoComplete ? 'ดูจบแล้ว ✓' : 'กำลังรับชม (ต้องดูให้จบ)'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-100/70 text-[#002D5A] flex items-center gap-1 font-sans font-semibold">
                          <BookOpen className="w-3 h-3" />
                          1. เนื้อหาเอกสาร & กิจกรรม: ศึกษาครบถ้วน ✓
                        </span>
                      )}

                      <span className={`px-2.5 py-0.5 rounded-full border flex items-center gap-1 font-sans font-semibold ${
                        isQuizPassed 
                          ? 'bg-emerald-100/80 border-emerald-300 text-emerald-800' 
                          : isVideoComplete 
                          ? 'bg-blue-100 border-blue-300 text-[#002D5A]' 
                          : 'bg-slate-100 border-slate-300 text-slate-500'
                      }`}>
                        <HelpCircle className="w-3 h-3" />
                        2. แบบทดสอบ Quiz: {isQuizPassed ? 'ผ่านครบทุกข้อ ✓' : isVideoComplete ? 'พร้อมทำข้อสอบ' : 'ถูกล็อคอยู่'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {isModuleFullyPassed 
                      ? 'คุณผ่านเกณฑ์ครบถ้วนแล้ว สามารถกดไปบทเรียนถัดไปได้ทันที' 
                      : currentCourseId === 'ai-for-tct'
                      ? 'หลักสูตรนี้ไม่มีวิดีโอ ศึกษาเนื้อหาบทเรียนแล้วคลิกปุ่ม "เริ่มทำ Quiz ท้ายบท" ด้านล่าง'
                      : isVideoComplete 
                      ? 'คลิกปุ่ม "เริ่มทำ Quiz ท้ายบท" ด้านล่างเพื่อตอบคำถามให้ถูกต้องครบทุกข้อ' 
                      : 'เมื่อดูวิดีโอด้านบนจนจบ ระบบจะปลดล็อคแบบทดสอบท้ายบทให้อัตโนมัติ'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                {!isVideoComplete && !isAlreadyCompleted && (
                  <div className="h-8 px-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>กรุณาดูวิดีโอจนจบ (ห้ามกดข้าม)</span>
                  </div>
                )}

                {isVideoComplete && !isQuizPassed && (
                  <button
                    type="button"
                    onClick={handleAttemptOpenQuiz}
                    className="h-8 px-4 rounded-xl bg-[#002D5A] hover:bg-[#001D3D] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>เริ่มทำ Quiz ท้ายบท</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Key Summary Infographic Card */}
          <div className="bg-gradient-to-br from-slate-900/90 to-cyan-950/40 rounded-2xl p-5 border border-cyan-500/30">
            <div className="text-xs font-mono text-cyan-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>สรุปประเด็นสำคัญ (Key Takeaways - Module {module.id})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {module.summaryPoints.map((point, idx) => (
                <div key={idx} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2-Minute Reading Duration Timer Banner (ตามข้อกำหนด: กำหนดระยะเวลาการอ่านไม่เกิน 2 นาที) */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isReadingTimePassed
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isReadingTimePassed 
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' 
                    : 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                }`}>
                  <Timer className={`w-5 h-5 ${!isReadingTimePassed ? 'animate-pulse' : ''}`} />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white whitespace-nowrap">
                      ระยะเวลาอ่านเนื้อหาบทเรียน (ไม่เกิน 2 นาที)
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-xs border whitespace-nowrap ${
                      isReadingTimePassed
                        ? 'bg-emerald-900/80 border-emerald-400 text-emerald-300'
                        : 'bg-cyan-900/80 border-cyan-400 text-cyan-200'
                    }`}>
                      {Math.floor(readingSecondsRemaining / 60).toString().padStart(2, '0')}:{(readingSecondsRemaining % 60).toString().padStart(2, '0')} นาที
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {isReadingTimePassed 
                      ? '✓ ท่านศึกษาเนื้อหาครบตามกำหนดเวลาแล้ว สามารถทำแบบทดสอบระหว่างบทได้ทันที'
                      : 'กรุณาศึกษาเนื้อหาทีละหัวข้อด้านล่างให้ครบถ้วนก่อนทำแบบทดสอบระหว่างบท'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isReadingTimePassed ? (
                  <button
                    type="button"
                    onClick={() => {
                      playCyberClick();
                      setReadingSecondsRemaining(0);
                      setIsReadingTimePassed(true);
                    }}
                    className="h-9 px-3 rounded-xl bg-cyan-600/40 hover:bg-cyan-600/60 text-cyan-200 border border-cyan-400/50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>อ่านเข้าใจครบถ้วนแล้ว</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAttemptOpenQuiz}
                    className="h-9 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/25 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>ทำแบบทดสอบระหว่างบท (Quiz)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Reading Progress Track */}
            <div className="mt-3 w-full bg-slate-900/90 rounded-full h-1.5 overflow-hidden border border-slate-700/60">
              <div 
                className={`h-full transition-all duration-1000 ${
                  isReadingTimePassed ? 'bg-emerald-400' : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.min(100, Math.round(((120 - readingSecondsRemaining) / 120) * 100))}%` }}
              />
            </div>
          </div>

          {/* Lesson Sections */}
          <div className="space-y-6">
            {module.sections.map((section) => (
              <div key={section.id} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  {section.title}
                </h2>

                <div className="space-y-2.5 text-sm text-slate-300 leading-relaxed">
                  {section.content.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>

                {section.bulletPoints && (
                  <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800 space-y-2 text-xs text-slate-300">
                    {section.bulletPoints.map((bp, bpIdx) => (
                      <div key={bpIdx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                        <span>{bp}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Interactive Embedded Tool Widgets */}
                {section.interactiveType === 'risk_matrix' && (
                  <div className="bg-slate-950/90 rounded-xl p-5 border border-purple-500/30 mt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="text-xs font-mono text-purple-300 flex items-center gap-1.5">
                        <Activity className="w-4 h-4" />
                        <span>INTERACTIVE 5x5 RISK MATRIX SIMULATOR</span>
                      </div>
                      <span className="text-[11px] text-slate-400">คลิกช่องตารางเพื่อทดลองคำนวณระดับความเสี่ยง</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-center border-collapse text-xs">
                        <thead>
                          <tr>
                            <th className="p-2 border border-slate-800 text-slate-400 text-[11px]">ความรุนแรง \ โอกาส</th>
                            {[1, 2, 3, 4, 5].map((l) => (
                              <th key={l} className="p-2 border border-slate-800 text-cyan-300 font-mono">
                                ระดับ {l}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[5, 4, 3, 2, 1].map((s) => (
                            <tr key={s}>
                              <td className="p-2 border border-slate-800 text-cyan-300 font-mono font-semibold">
                                ระดับ {s}
                              </td>
                              {[1, 2, 3, 4, 5].map((l) => {
                                const score = s * l;
                                const isSelected = selectedMatrixCell?.severity === s && selectedMatrixCell?.likelihood === l;
                                let colorClass = 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60';
                                if (score >= 15) colorClass = 'bg-red-950/60 text-red-300 hover:bg-red-900/80';
                                else if (score >= 8) colorClass = 'bg-amber-950/50 text-amber-300 hover:bg-amber-900/70';

                                return (
                                  <td
                                    key={l}
                                    onClick={() => { playCyberClick(); setSelectedMatrixCell({ severity: s, likelihood: l }); }}
                                    className={`p-3 border border-slate-800 cursor-pointer font-mono font-bold transition-all ${colorClass} ${
                                      isSelected ? 'ring-2 ring-cyan-400 scale-105 z-10 shadow-lg' : ''
                                    }`}
                                  >
                                    {score}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {selectedMatrixCell && (
                      <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div>
                          <span className="text-slate-400">ผลการประเมิน: </span>
                          <span className="font-bold text-white">ความรุนแรง {selectedMatrixCell.severity} x โอกาส {selectedMatrixCell.likelihood} = </span>
                          <span className="font-mono text-base font-black text-cyan-300">
                            {selectedMatrixCell.severity * selectedMatrixCell.likelihood} คะแนน
                          </span>
                        </div>
                        <div className="font-semibold text-xs px-3 py-1 rounded-full border bg-slate-950">
                          {selectedMatrixCell.severity * selectedMatrixCell.likelihood >= 15 ? (
                            <span className="text-red-400">🚨 ความเสี่ยงสูงมาก (ต้องหยุดงานและแก้ไขทันที)</span>
                          ) : selectedMatrixCell.severity * selectedMatrixCell.likelihood >= 8 ? (
                            <span className="text-amber-300">⚠️ ความเสี่ยงปานกลาง (ต้องมีมาตรการควบคุมเฉพาะ)</span>
                          ) : (
                            <span className="text-emerald-400">✓ ความเสี่ยงต่ำ (ควบคุมตามมาตรฐานปกติ)</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hierarchy of Controls Interactive Simulator */}
                {section.interactiveType === 'hierarchy_controls' && (
                  <div className="bg-slate-950/90 rounded-xl p-5 border border-cyan-500/30 mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                        <Layers className="w-4 h-4" />
                        <span>HIERARCHY OF CONTROLS (ลำดับขั้นการควบคุมความเสี่ยง 5 ระดับ)</span>
                      </div>
                      <span className="text-[11px] text-slate-400">คลิกระดับเพื่อดูตัวอย่าง</span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { level: 1, name: '1. Elimination (กำจัดอันตราย)', desc: 'มีประสิทธิผลสูงสุด กำจัดแหล่งกำเนิดอันตรายออกไปอย่างถาวร เช่น ยกเลิกการใช้สารเคมีอันตราย', eff: 'มีประสิทธิผลสูงสุด (100%)', color: 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300' },
                        { level: 2, name: '2. Substitution (ทดแทน)', desc: 'เปลี่ยนไปใช้วัสดุหรือกระบวนการที่อันตรายน้อยกว่า เช่น ใช้น้ำยาทำความสะอาดไร้สารระเหยแทนทินเนอร์', eff: 'ประสิทธิผลสูง (75%)', color: 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300' },
                        { level: 3, name: '3. Engineering Controls (ควบคุมทางวิศวกรรม)', desc: 'ติดตั้งการ์ดป้องกันเครื่องจักร ระบบเซนเซอร์ตัดการทำงาน ระบบระบายอากาศเฉพาะที่ (LEV)', eff: 'ประสิทธิผลปานกลาง-สูง (50%)', color: 'border-blue-500/60 bg-blue-950/30 text-blue-300' },
                        { level: 4, name: '4. Administrative Controls (ควบคุมทางการบริหาร)', desc: 'จัดทำ WI/SOP อบรมพนักงาน ป้ายเตือนอันตราย ระบบขออนุญาตทำงาน (Work Permit)', eff: 'ประสิทธิผลต่ำ-ปานกลาง (25%)', color: 'border-amber-500/60 bg-amber-950/30 text-amber-300' },
                        { level: 5, name: '5. PPE (อุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคล)', desc: 'หมวก แว่นตา ถุงมือกันบาด รองเท้าหัวเหล็ก — เป็นปราการด่านสุดท้ายเมื่อควบคุมวิธีอื่นไม่ได้', eff: 'ประสิทธิผลต่ำสุด (ด่านสุดท้าย)', color: 'border-rose-500/60 bg-rose-950/30 text-rose-300' }
                      ].map((item) => (
                        <div
                          key={item.level}
                          onClick={() => { playCyberClick(); setSelectedHierarchyLevel(item.level); }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            selectedHierarchyLevel === item.level
                              ? `${item.color} ring-2 ring-cyan-400 shadow-lg`
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span>{item.name}</span>
                            <span className="font-mono text-[11px] opacity-80">{item.eff}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5 Whys Interactive Tool */}
                {section.interactiveType === '5_whys' && (
                  <div className="bg-slate-950/90 rounded-xl p-5 border border-emerald-500/30 mt-4 space-y-4">
                    <div className="text-xs font-mono text-emerald-300 flex items-center justify-between">
                      <span>5 WHYS ROOT CAUSE ANALYSIS SIMULATOR</span>
                      <span className="text-slate-400">กรณีศึกษา Teijin Cord</span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { step: 1, q: 'ทำไม 1: ฟิวส์มอเตอร์ขาด?', a: 'เพราะมอเตอร์ทำงานหนักเกินกำหนด (Overload)', type: 'อาการผิวเผิน (Symptom)' },
                        { step: 2, q: 'ทำไม 2: มอเตอร์ถึง Overload?', a: 'เพราะระบบหล่อลื่นไม่เพียงพอ แกนหมุนฝืด', type: 'ปัญหาทางกล (Mechanical)' },
                        { step: 3, q: 'ทำไม 3: ระบบหล่อลื่นไม่พอ?', a: 'เพราะไม่มีการตรวจสอบระดับน้ำมันหล่อลื่นตามรอบ', type: 'ปัญหาการปฏิบัติ (Operational)' },
                        { step: 4, q: 'ทำไม 4: ทำไมไม่ตรวจสอบตามรอบ?', a: 'เพราะช่างไม่ทราบว่าต้องตรวจจุดนี้ในกะทำงาน', type: 'ปัญหาการสื่อสาร (Communication)' },
                        { step: 5, q: 'ทำไม 5: ทำไมช่างถึงไม่ทราบ?', a: 'เพราะแผนบำรุงรักษาเชิงป้องกัน (PM Checklist) ขาดรายการนี้ — สาเหตุเชิงระบบที่แท้จริง!', type: 'สาเหตุรากเหง้าที่แท้จริง (Systemic Root Cause)' }
                      ].map((why) => (
                        <div
                          key={why.step}
                          onClick={() => { playCyberClick(); setActiveWhyStep(why.step); }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            why.step === 5
                              ? 'bg-emerald-950/60 border-emerald-500/50'
                              : 'bg-slate-900/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-medium text-slate-200">
                            <span className="font-semibold text-emerald-300">{why.q}</span>
                            <span className="text-[10px] font-mono text-slate-400">{why.type}</span>
                          </div>
                          <div className="text-xs text-slate-300 mt-1 pl-4 border-l border-emerald-500/40">
                            ➔ {why.a}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vibration Threshold Interactive Simulator */}
                {section.interactiveType === 'vibration_threshold' && (
                  <div className="bg-slate-950/90 rounded-xl p-5 border border-cyan-500/40 mt-4 space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-xs font-mono text-cyan-300 flex items-center gap-1.5 font-bold">
                        <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                        <span>VIBRATION THRESHOLD & CBM DECISION SIMULATOR (ISO 10816)</span>
                      </div>
                      <span className="text-[11px] text-slate-400">เลื่อนแถบสเกลหรือเลือกพรีเซ็ตเพื่อวิเคราะห์</span>
                    </div>

                    {/* Quick Presets */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: '🟢 สภาพปกติสมบูรณ์', val: 1.8, desc: 'Zone A/B' },
                        { label: '🟡 เริ่มมีอาการเยื้องศูนย์', val: 3.5, desc: 'Zone C (Warning)' },
                        { label: '🟠 ตลับลูกปืนเริ่มสึกหรอ', val: 6.2, desc: 'Zone C (High)' },
                        { label: '🔴 วิกฤต สั่นสะเทือนรุนแรง', val: 11.5, desc: 'Zone D (Alarm)' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            playCyberClick();
                            setVibrationVal(preset.val);
                          }}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            Math.abs(vibrationVal - preset.val) < 0.2
                              ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400 shadow-md'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-bold">{preset.label}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">{preset.val} mm/s RMS ({preset.desc})</div>
                        </button>
                      ))}
                    </div>

                    {/* Slider Control */}
                    <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold">ปรับค่าระดับความสั่นสะเทือน (Vibration Velocity):</span>
                        <span className="font-mono text-base font-black text-cyan-300 bg-slate-950 px-3 py-1 rounded-lg border border-cyan-500/30">
                          {vibrationVal.toFixed(1)} mm/s RMS
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0.5"
                        max="15.0"
                        step="0.1"
                        value={vibrationVal}
                        onChange={(e) => setVibrationVal(parseFloat(e.target.value))}
                        className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-slate-800"
                      />

                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>0.5 (ดีเยี่ยม)</span>
                        <span>2.8 (ขีดเตือน Warning)</span>
                        <span>7.1 (ขีดวิกฤต Alarm)</span>
                        <span>15.0 mm/s (อันตรายสูงสุด)</span>
                      </div>
                    </div>

                    {/* Live Decision Analysis */}
                    <div className={`p-4 rounded-xl border transition-all ${
                      vibrationVal >= 7.1
                        ? 'bg-red-950/70 border-red-500/60 text-red-200 shadow-lg shadow-red-950/50'
                        : vibrationVal >= 2.8
                        ? 'bg-amber-950/60 border-amber-500/50 text-amber-200 shadow-md shadow-amber-950/40'
                        : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          vibrationVal >= 7.1
                            ? 'bg-red-900/50 border-red-400 text-red-300'
                            : vibrationVal >= 2.8
                            ? 'bg-amber-900/50 border-amber-400 text-amber-300'
                            : 'bg-emerald-900/50 border-emerald-400 text-emerald-300'
                        }`}>
                          {vibrationVal >= 7.1 ? '🚨' : vibrationVal >= 2.8 ? '⚠️' : '✓'}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm">
                              {vibrationVal >= 7.1
                                ? 'ZONE D (ALARM) — วิกฤตระดับสูงสุด'
                                : vibrationVal >= 2.8
                                ? 'ZONE C (WARNING) — เริ่มมีสัญญาณผิดปกติ'
                                : 'ZONE A / B (NORMAL) — สภาพสมบูรณ์พร้อมใช้งาน'}
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 border border-current">
                              {vibrationVal >= 7.1 ? 'ต้องหยุดเดินเครื่องทันที' : vibrationVal >= 2.8 ? 'วางแผนซ่อมบำรุงตามรอบสภาพ' : 'เดินเครื่องต่อไปได้ปกติ'}
                            </span>
                          </div>
                          <p className="text-xs opacity-90 leading-relaxed">
                            {vibrationVal >= 7.1
                              ? 'คำสั่งปฏิบัติการ CBM: สั่งหยุดเครื่องจักรทันทีเพื่อป้องกัน Catastrophic Failure! ทำการ Lockout/Tagout และเปลี่ยนตลับลูกปืน/ตั้งศูนย์เพลาใหม่ก่อนสร้างความเสียหายต่อโครงสร้างหลัก'
                              : vibrationVal >= 2.8
                              ? 'คำสั่งปฏิบัติการ CBM: เครื่องจักรยังเดินต่อได้! ให้บันทึกแนวโน้ม (Trend Monitoring) ทุก 3 วัน และสั่งจัดเตรียมอะไหล่ตลับลูกปืนล่วงหน้า เพื่อนัดหยุดเครื่องซ่อมในรอบ Planned Downtime สัปดาห์หน้า'
                              : 'คำสั่งปฏิบัติการ CBM: ไม่ต้องถอดประกอบหรือเปลี่ยนอะไหล่ใดๆ (ป้องกัน Over-maintenance) ตรวจสอบความสั่นสะเทือนตามรอบปกติ'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* P-F Curve Interactive Simulator */}
                {section.interactiveType === 'pf_curve_sim' && (
                  <div className="bg-slate-950/90 rounded-xl p-5 border border-purple-500/40 mt-4 space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-xs font-mono text-purple-300 flex items-center gap-1.5 font-bold">
                        <Activity className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                        <span>INTERACTIVE P-F CURVE DEGRADATION & TECHNOLOGY DETECTOR</span>
                      </div>
                      <span className="text-[11px] text-slate-400">เลื่อนแถบเวลาเพื่อดูเทคโนโลยีที่ตรวจจับได้ในแต่ละช่วง</span>
                    </div>

                    {/* Timeline Slider */}
                    <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold">ขั้นตอนการเสื่อมสภาพตามเวลา (Point P ➔ Point F):</span>
                        <span className="font-mono text-xs font-bold text-purple-300 bg-slate-950 px-3 py-1 rounded-lg border border-purple-500/30">
                          {pfSliderVal > 80 ? 'ระยะที่ 1: ตรวจจับได้ด้วยคลื่นความถี่สูง' : pfSliderVal > 50 ? 'ระยะที่ 2: ตรวจจับได้ด้วยความสั่นสะเทือน' : pfSliderVal > 25 ? 'ระยะที่ 3: ตรวจจับได้ด้วยกล้องความร้อน' : 'ระยะที่ 4: ใกล้พังทลาย (มีเสียง/ควัน)'}
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={pfSliderVal}
                        onChange={(e) => setPfSliderVal(parseInt(e.target.value, 10))}
                        className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-400 border border-slate-800"
                      />

                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span className="text-red-400 font-bold">Point F (0% พังชำรุด)</span>
                        <span className="text-amber-400">ความร้อน/เสียงดัง (25%)</span>
                        <span className="text-cyan-400">Vibration (60%)</span>
                        <span className="text-emerald-400 font-bold">Point P (100% เริ่มเสื่อมสภาพ Ultrasound)</span>
                      </div>
                    </div>

                    {/* Dynamic P-F Detection Stage Card */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                      {[
                        { 
                          range: [75, 100], 
                          tech: 'Ultrasound (คลื่นเสียงความถี่สูง)', 
                          leadTime: 'เตือนล่วงหน้า 1-6 เดือน', 
                          cost: 'ค่าใช้จ่ายซ่อมแซมต่ำสุด (1x)',
                          color: 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300',
                          desc: 'ตรวจจับฟองอากาศ Micro-turbulence ในน้ำมันหล่อลื่นและการเสียดสีระดับไมครอน'
                        },
                        { 
                          range: [50, 74], 
                          tech: 'Vibration Analysis (วิเคราะห์ความสั่นสะเทือน)', 
                          leadTime: 'เตือนล่วงหน้า 1-3 เดือน', 
                          cost: 'ค่าใช้จ่ายซ่อมต่ำ (2x)',
                          color: 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300',
                          desc: 'วิเคราะห์ Harmonic Frequencies ของ Bearing Race และ Gear Mesh'
                        },
                        { 
                          range: [20, 49], 
                          tech: 'Thermography & Oil Analysis', 
                          leadTime: 'เตือนล่วงหน้า 1-3 สัปดาห์', 
                          cost: 'ค่าใช้จ่ายปานกลาง (5x)',
                          color: 'border-amber-500/60 bg-amber-950/30 text-amber-300',
                          desc: 'ตรวจจับจุด Hotspot ความร้อนสะสม และเศษโลหะเจือปนในน้ำมันหล่อลื่น'
                        },
                        { 
                          range: [0, 19], 
                          tech: 'Audible Noise / Heat / Smoke', 
                          leadTime: 'เตือนล่วงหน้า 1-24 ชั่วโมง', 
                          cost: 'ค่าใช้จ่ายสูงสุด (15-20x)',
                          color: 'border-red-500/60 bg-red-950/30 text-red-300',
                          desc: 'ได้ยินเสียงดังด้วยหูเปล่า หรือมีควันไหม้ — เครื่องจักรใกล้ติดขัดหยุดกะทันหัน'
                        }
                      ].map((st, sIdx) => {
                        const isActive = pfSliderVal >= st.range[0] && pfSliderVal <= st.range[1];
                        return (
                          <div 
                            key={sIdx}
                            className={`p-3 rounded-xl border transition-all ${
                              isActive ? `${st.color} ring-2 ring-purple-400 scale-[1.02] shadow-lg` : 'bg-slate-900/50 border-slate-800 text-slate-400 opacity-60'
                            }`}
                          >
                            <div className="font-bold text-xs">{st.tech}</div>
                            <div className="text-[10px] font-mono mt-1 opacity-90">⏱️ {st.leadTime}</div>
                            <div className="text-[10px] font-mono mt-0.5">💰 {st.cost}</div>
                            <p className="text-[11px] mt-2 opacity-90 leading-tight">{st.desc}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-500/30 text-xs text-purple-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                      <span><strong>P-F Interval Window:</strong> ยิ่งเราตรวจจับความผิดปกติได้ตั้งแต่ฝั่งขวา (Ultrasound / Vibration) หน้าต่างแห่งโอกาสในการวางแผนซ่อมบำรุงจะยาวนาน ทำให้สั่งอะไหล่ทันและไม่ต้องหยุดสายการผลิตฉุกเฉิน</span>
                    </div>
                  </div>
                )}

                {/* RCM & FMEA Interactive Matrix Simulator */}
                {section.interactiveType === 'rcm_fmea_matrix' && (
                  <div className="bg-slate-950/90 rounded-xl p-5 border border-indigo-500/40 mt-4 space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-xs font-mono text-indigo-300 flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span>RCM CRITICALITY RANKING & FMEA DECISION ENGINE</span>
                      </div>
                      <span className="text-[11px] text-slate-400">เลือกคะแนนความรุนแรงและโอกาสเกิดเพื่อดูแนวทางบำรุงรักษา</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Severity Selector */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                          <span>1. ความรุนแรงของผลกระทบ (Severity: S)</span>
                          <span className="font-mono text-indigo-300 font-black text-sm">ระดับ {rcmSeverity}</span>
                        </label>
                        <div className="space-y-1.5">
                          {[
                            { s: 5, label: 'ระดับ 5: วิกฤตร้ายแรง — กระทบความปลอดภัย/สิ่งแวดล้อม หรือหยุดสายผลิต 100%' },
                            { s: 4, label: 'ระดับ 4: สูงมาก — กระทบคุณภาพผลิตภัณฑ์หลักและสูญเสียผลผลิตปริมาณมาก' },
                            { s: 3, label: 'ระดับ 3: ปานกลาง — เครื่องจักรสำรองทำงานแทนได้แต่เพิ่มต้นทุน' },
                            { s: 2, label: 'ระดับ 2: ต่ำ — ซ่อมแซมได้รวดเร็ว ไม่กระทบเป้าหมายการส่งมอบ' },
                            { s: 1, label: 'ระดับ 1: ต่ำมาก — ไม่มีผลกระทบต่อกระบวนการผลิต' }
                          ].map((item) => (
                            <button
                              key={item.s}
                              type="button"
                              onClick={() => { playCyberClick(); setRcmSeverity(item.s); }}
                              className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                                rcmSeverity === item.s
                                  ? 'bg-indigo-950/80 border-indigo-400 text-indigo-200 font-bold ring-1 ring-indigo-400'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Probability Selector */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                          <span>2. โอกาสเกิดความล้มเหลว (Probability: P)</span>
                          <span className="font-mono text-indigo-300 font-black text-sm">ระดับ {rcmProbability}</span>
                        </label>
                        <div className="space-y-1.5">
                          {[
                            { p: 5, label: 'ระดับ 5: เกิดบ่อยมาก — มีประวัติชำรุดเกือบทุกสัปดาห์ / อุปกรณ์สึกหรอเร็ว' },
                            { p: 4, label: 'ระดับ 4: เกิดบ่อย — เกิดขึ้น 1-2 ครั้งต่อเดือน' },
                            { p: 3, label: 'ระดับ 3: ปานกลาง — เกิดขึ้น 1-2 ครั้งต่อไตรมาส' },
                            { p: 2, label: 'ระดับ 2: น้อย — เกิดขึ้นปีละ 1 ครั้ง' },
                            { p: 1, label: 'ระดับ 1: นานๆ ครั้ง — แทบไม่เคยเกิดขึ้นเลยตลอดอายุการใช้งาน' }
                          ].map((item) => (
                            <button
                              key={item.p}
                              type="button"
                              onClick={() => { playCyberClick(); setRcmProbability(item.p); }}
                              className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                                rcmProbability === item.p
                                  ? 'bg-indigo-950/80 border-indigo-400 text-indigo-200 font-bold ring-1 ring-indigo-400'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Calculated RCM Score & Strategy Assignment */}
                    {(() => {
                      const score = rcmSeverity * rcmProbability;
                      const isCritical = score >= 15 || rcmSeverity === 5;
                      const isEssential = !isCritical && score >= 8;
                      return (
                        <div className={`p-4 rounded-xl border transition-all ${
                          isCritical
                            ? 'bg-red-950/70 border-red-500/60 text-red-200'
                            : isEssential
                            ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                            : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
                            <div>
                              <span className="text-xs opacity-80">คะแนนความสำคัญ (Criticality Score = S x P): </span>
                              <span className="font-mono text-lg font-black text-white ml-1.5">
                                {rcmSeverity} x {rcmProbability} = {score} คะแนน
                              </span>
                            </div>
                            <div className="font-bold text-xs px-3 py-1 rounded-full bg-black/40 border border-current self-start sm:self-auto">
                              {isCritical ? '🔴 CRITICAL EQUIPMENT (เครื่องจักรวิกฤตสูง)' : isEssential ? '🟡 ESSENTIAL EQUIPMENT (เครื่องจักรสำคัญปานกลาง)' : '🟢 NON-CRITICAL (เครื่องจักรความสำคัญต่ำ)'}
                            </div>
                          </div>

                          <div className="text-xs space-y-1.5 leading-relaxed">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>🎯 กลยุทธ์การบำรุงรักษาที่ RCM แนะนำ:</span>
                              <span className="text-cyan-300 font-mono underline">
                                {isCritical ? 'CBM / PdM Online Sensor + Dual Redundancy' : isEssential ? 'Time-based PM Checklist + Monthly Condition Route' : 'Run-to-Failure (RTF) หรือใช้งานจนชำรุดอย่างคุ้มค่า'}
                              </span>
                            </div>
                            <p className="opacity-90">
                              {isCritical 
                                ? 'เหตุผล RCM: เครื่องจักรมีความสำคัญสูงสุด ห้ามปล่อยให้หยุดเดินเครื่องเด็ดขาด ต้องติดเซนเซอร์ Vibration/Temperature ตรวจวัด Real-time 24 ชม. พร้อมเตรียมอะไหล่สำรองและแผนสลับเครื่องทันที'
                                : isEssential
                                ? 'เหตุผล RCM: บำรุงรักษาด้วยการตรวจเช็คตามรอบสม่ำเสมอ และใช้เครื่องมือพกพาตรวจวัดสภาพเดือนละครั้ง เพื่อความคุ้มค่าและไม่สิ้นเปลืองงบประมาณเซนเซอร์'
                                : 'เหตุผล RCM: การติดเซนเซอร์ราคาแพงไม่คุ้มค่าทางเศรษฐศาสตร์ ให้สำรองอะไหล่ราคาถูกไว้และเปลี่ยนเมื่อชำรุดตามปกติ'}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 1. AI Tool Matcher Interactive Widget */}
                {section.interactiveType === 'ai_tool_matcher' && (
                  <div className="bg-slate-950/90 rounded-xl p-5 border border-cyan-500/30 mt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold">AI TOOL MATCHER — จับคู่งานโรงงาน TCT กับเครื่องมือ AI ที่ใช่</span>
                      </div>
                      <span className="text-[11px] text-slate-400">คลิกเลือกประเภทงานด้านล่างเพื่อดู AI แนะนำ</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {AI_GAME_1_PAIRS.map((pair) => {
                        const isSelected = selectedAiToolTask === pair.id;
                        return (
                          <button
                            key={pair.id}
                            type="button"
                            onClick={() => {
                              setSelectedAiToolTask(pair.id);
                              playCyberClick();
                            }}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/30 text-white'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                                {pair.department}
                              </span>
                              <span className="text-xs font-bold text-cyan-400">{pair.bestTool}</span>
                            </div>
                            <p className="text-xs font-semibold mt-2 line-clamp-2">{pair.taskTitle}</p>
                          </button>
                        );
                      })}
                    </div>

                    {(() => {
                      const activeItem = AI_GAME_1_PAIRS.find((p) => p.id === selectedAiToolTask) || AI_GAME_1_PAIRS[0];
                      return (
                        <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-950 p-4 rounded-xl border border-cyan-500/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">🎯 เครื่องมือที่เหมาะสมที่สุดสำหรับ TCT:</span>
                            <span className="text-sm font-bold text-cyan-300 font-mono bg-cyan-900/50 px-3 py-1 rounded-full border border-cyan-500/30">
                              {activeItem.bestTool}
                            </span>
                          </div>
                          <div className="text-xs text-slate-200">
                            <strong>ภารกิจ:</strong> {activeItem.taskDescription}
                          </div>
                          <div className="text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>ทำไมถึงเลือกเครื่องมือนี้:</strong> {activeItem.explanation}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 2. AI Privacy Guard Interactive Simulator */}
                {section.interactiveType === 'ai_privacy_guard' && (
                  <div className="bg-slate-950/90 rounded-xl p-5 border border-rose-500/30 mt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="text-xs font-mono text-rose-300 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span className="font-bold">TCT PRIVACY GUARD — จำลองสถานการณ์ ข้อมูลนี้ใส่ AI สาธารณะได้หรือไม่?</span>
                      </div>
                      <span className="text-[11px] text-slate-400">คลิกทดสอบเพื่อดูเฉลยและเกณฑ์ความปลอดภัย</span>
                    </div>

                    <div className="space-y-3">
                      {AI_GAME_2_ITEMS.slice(0, 4).map((item) => {
                        const isRevealed = privacyAnswerRevealed[item.id];
                        return (
                          <div 
                            key={item.id} 
                            className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                                {item.scenario}
                              </p>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                                {item.ruleCategory}
                              </span>
                            </div>

                            {!isRevealed ? (
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPrivacyAnswerRevealed(prev => ({ ...prev, [item.id]: true }));
                                    if (item.isSafe) playSuccessChime(); else playErrorBuzz();
                                  }}
                                  className="h-8 px-3 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>ปลอดภัย (Safe)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPrivacyAnswerRevealed(prev => ({ ...prev, [item.id]: true }));
                                    if (!item.isSafe) playSuccessChime(); else playErrorBuzz();
                                  }}
                                  className="h-8 px-3 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>อันตราย ห้ามใส่ (Breach)</span>
                                </button>
                              </div>
                            ) : (
                              <div className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                                item.isSafe 
                                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                              }`}>
                                {item.isSafe ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <span className="font-bold mr-1">
                                    {item.isSafe ? '✅ ปลอดภัย:' : '❌ อันตรายเด็ดขาด:'}
                                  </span>
                                  <span>{item.explanation}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. TH AI Passport Flow Simulator */}
                {section.interactiveType === 'th_ai_passport_flow' && (
                  <div className="bg-slate-950/90 rounded-xl p-5 border border-blue-500/30 mt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="text-xs font-mono text-blue-300 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-blue-400" />
                        <span className="font-bold">TH AI PASSPORT — ระบบจำลอง 4 ขั้นตอนการลงทะเบียนและการผูกบัญชี TCT</span>
                      </div>
                      <span className="text-[11px] text-slate-400">คลิกขั้นตอนเพื่อดูรายละเอียด</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { step: 1, title: '1. กรอกข้อมูลส่วนตัว', desc: 'ชื่อ-นามสกุล, รหัสพนักงาน, เบอร์โทร/อีเมล' },
                        { step: 2, title: '2. ยืนยันตัวตนดิจิทัล', desc: 'Digital Identity Verification ผ่าน OTP' },
                        { step: 3, title: '3. รับรหัส Passport ID', desc: 'ออกตราประทับ Digital Credential' },
                        { step: 4, title: '4. ผูกระบบ TCT e-Training', desc: 'เชื่อมประวัติการอบรมเข้า HR Portal' }
                      ].map((s) => (
                        <button
                          key={s.step}
                          type="button"
                          onClick={() => {
                            setActivePassportStep(s.step);
                            playCyberClick();
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            activePassportStep === s.step
                              ? 'bg-blue-950/60 border-blue-400 ring-2 ring-blue-400/30 text-white'
                              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold text-blue-300">{s.title}</div>
                          <div className="text-[11px] text-slate-400 mt-1">{s.desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* Virtual Passport Credential Card */}
                    <div className="bg-gradient-to-r from-blue-950/50 via-indigo-950/40 to-slate-950 border border-blue-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                          Digital Identity Credential (จำลอง)
                        </div>
                        <div className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>TH-AI-PASS-TCT-{user.empId || '88902'}</span>
                        </div>
                        <div className="text-xs text-slate-300">
                          ผู้ถือบัตร: <span className="text-cyan-300 font-semibold">{user.fullName || 'พนักงาน TCT'}</span> ({user.department || 'สายการผลิต/ธุรการ'})
                        </div>
                      </div>
                      <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>AI LITERACY VERIFIED</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3.1 TH AI Passport Portal Action & Registration Direct Link */}
                {section.interactiveType === 'th_ai_passport_portal_action' && (
                  <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/80 rounded-2xl p-5 sm:p-6 border border-blue-500/40 mt-4 space-y-5 shadow-xl shadow-blue-950/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-500/20 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/40 text-blue-400 flex items-center justify-center font-bold shadow-md shrink-0">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>OFFICIAL PORTAL ACCESS • aipass.go.th</span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                            เข้าใช้งานจริง TH AI Passport (โครงการรับรองทักษะ AI แห่งชาติ)
                          </h3>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-400/30 text-blue-300 text-xs font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>สำหรับบุคลากร TCT</span>
                      </div>
                    </div>

                    {/* Prominent Action Banner for aipass.go.th */}
                    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-inner">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                            URL ทางการ
                          </span>
                          <span className="text-xs font-mono text-slate-300">
                            แพลตฟอร์มมาตรฐานโดยหน่วยงานภาครัฐ
                          </span>
                        </div>
                        <div className="text-lg sm:text-xl font-mono font-black text-cyan-300 tracking-wide break-all">
                          https://aipass.go.th/
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          คลิกปุ่มด้านขวามือเพื่อเปิดเว็บไซต์ <span className="text-white font-medium">aipass.go.th</span> ในแท็บใหม่และเริ่มลงทะเบียนได้ทันที
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                        <button
                          type="button"
                          id="btn-open-aipass-portal"
                          onClick={() => {
                            playCyberClick();
                            window.open('https://aipass.go.th/', '_blank', 'noopener,noreferrer');
                            setNotification('🚀 กำลังเปิดเว็บไซต์ https://aipass.go.th/ ในแท็บใหม่');
                            setTimeout(() => setNotification(null), 4000);
                          }}
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>เข้าสู่เว็บไซต์ aipass.go.th</span>
                        </button>

                        <button
                          type="button"
                          id="btn-copy-aipass-portal"
                          onClick={() => {
                            playCyberClick();
                            navigator.clipboard?.writeText('https://aipass.go.th/');
                            setCopiedPassportUrl(true);
                            playSuccessChime();
                            setNotification('📋 คัดลอกลิงก์ https://aipass.go.th/ เรียบร้อยแล้ว!');
                            setTimeout(() => {
                              setCopiedPassportUrl(false);
                              setNotification(null);
                            }, 3500);
                          }}
                          className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                          title="คัดลอกลิงก์เว็บไซต์"
                        >
                          {copiedPassportUrl ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-300">คัดลอกแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>คัดลอกลิงก์</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Step-by-Step Checklist for Employees */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span className="flex items-center gap-1.5 font-mono text-cyan-300">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                          <span>ขั้นตอนที่ต้องปฏิบัติ (Checklist การลงทะเบียนและการใช้งานจริง)</span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          (คลิกเพื่อติ๊กบันทึกขั้นตอนที่ทำสำเร็จแล้ว)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {[
                          { id: 1, title: 'ขั้นตอนที่ 1: เข้าสู่เว็บไซต์ aipass.go.th', desc: 'คลิกปุ่ม "เข้าสู่เว็บไซต์ aipass.go.th" ด้านบน เพื่อเปิดหน้าเว็บหลัก' },
                          { id: 2, title: 'ขั้นตอนที่ 2: สมัครสมาชิก / ลงทะเบียน', desc: 'กรอกเลขประจำตัวประชาชน, ชื่อ-นามสกุล, และอีเมลเพื่อสร้างบัญชี' },
                          { id: 3, title: 'ขั้นตอนที่ 3: ยืนยันรหัส OTP และตั้งรหัสผ่าน', desc: 'นำรหัส OTP จากอีเมลมากรอกยืนยัน และตั้งรหัสผ่านความปลอดภัยสูง' },
                          { id: 4, title: 'ขั้นตอนที่ 4: ทำแบบทดสอบ AI Literacy', desc: 'เข้าสู่ระบบแล้วทำแบบทดสอบวัดระดับความรู้ด้าน AI ให้ผ่านตามเกณฑ์' },
                          { id: 5, title: 'ขั้นตอนที่ 5: รับ Digital Badge ส่งหลักฐาน HR', desc: 'บันทึกภาพ Digital Badge / Certificate แล้วส่งให้ฝ่ายบุคคล TCT' }
                        ].map((step) => {
                          const isDone = !!passportChecklist[step.id];
                          return (
                            <div
                              key={step.id}
                              onClick={() => {
                                playCyberClick();
                                setPassportChecklist(prev => ({ ...prev, [step.id]: !prev[step.id] }));
                              }}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                                isDone 
                                  ? 'bg-emerald-950/40 border-emerald-500/50 text-white' 
                                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                                isDone 
                                  ? 'bg-emerald-500 border-emerald-400 text-black font-bold' 
                                  : 'border-slate-700 bg-slate-950'
                              }`}>
                                {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <div className="space-y-0.5">
                                <div className={`text-xs font-bold ${isDone ? 'text-emerald-300' : 'text-slate-200'}`}>
                                  {step.title}
                                </div>
                                <div className="text-[11px] text-slate-400 leading-snug">
                                  {step.desc}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Employee Self-Status Declaration */}
                    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-cyan-400" />
                          <span>บันทึกสถานะการทำ TH AI Passport ของคุณ:</span>
                        </span>
                        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/30">
                          พนักงาน: {user.fullName || 'พนักงาน TCT'} ({user.empId || '88902'})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { key: 'pending', label: '1. กำลังเตรียมการลงทะเบียน', desc: 'ยังไม่ได้สมัครบัญชีบน aipass.go.th' },
                          { key: 'registered', label: '2. ลงทะเบียนสำเร็จแล้ว', desc: 'มีบัญชีแล้ว เตรียมเข้าทำแบบทดสอบ' },
                          { key: 'certified', label: '3. ได้รับ Digital Badge แล้ว', desc: 'สอบผ่านแล้ว มีใบรับรองพร้อมส่ง HR' }
                        ].map((stat) => (
                          <button
                            key={stat.key}
                            type="button"
                            onClick={() => {
                              playCyberClick();
                              setPassportTraineeStatus(stat.key as any);
                              playSuccessChime();
                              setNotification('✓ อัปเดตสถานะ TH AI Passport ของท่านเรียบร้อยแล้ว');
                              setTimeout(() => setNotification(null), 3000);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              passportTraineeStatus === stat.key
                                ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-400/40 text-white'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="text-xs font-bold text-cyan-300">{stat.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{stat.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Prompt C-T-F-T Interactive Builder */}
                {section.interactiveType === 'prompt_ctft_builder' && (
                  <div className="bg-slate-950/90 rounded-xl p-5 border border-amber-500/30 mt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="text-xs font-mono text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="font-bold">PROMPT C-T-F-T BUILDER — เครื่องมือจำลองสร้างคำสั่งงานจริงสำหรับ TCT</span>
                      </div>
                      <span className="text-[11px] text-slate-400">เลือก Template ตัวอย่างหรือปรับแต่งเอง</span>
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { 
                          name: '📧 ร่างอีเมลติดตามวัตถุดิบ (จัดซื้อ)',
                          c: 'ฉันเป็นเจ้าหน้าที่จัดซื้อ บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด',
                          t: 'ช่วยร่างอีเมลภาษาอังกฤษติดตามสถานะการส่งมอบสารเคมีเคลือบเส้นคอร์ดที่ล่าช้า 2 วัน',
                          f: 'แบ่งเป็น 3 ย่อหน้าสั้น มีตารางสรุปเลข PO และกำหนดส่งมอบใหม่ที่ต้องการ',
                          t_: 'สุภาพ สุขุม เป็นมืออาชีพตามธรรมเนียมธุรกิจญี่ปุ่น'
                        },
                        { 
                          name: '🔍 วิเคราะห์ของเสียไลน์ผลิต (QA/ผลิต)',
                          c: 'ฉันเป็นพนักงานควบคุมคุณภาพ (QA) โรงงานผลิตเส้นคอร์ดยางรถยนต์ TCT',
                          t: 'ช่วยระดมสมองคำถาม 5 Whys เพื่อค้นหาสาเหตุรากเหง้าของค่าความตึงด้าย (Tension) ตกสเปกในกะดึก',
                          f: 'เขียนเป็นข้อคำถาม 5 ระดับ พร้อมข้อสังเกตเรื่องการตั้งค่าเครื่องจักรและความชื้น',
                          t_: 'ตรงไปตรงมา เชิงเทคนิควิศวกรรม'
                        },
                        { 
                          name: '💡 เขียนใบข้อเสนอแนะไคเซ็น (Kaizen)',
                          c: 'ฉันเป็นพนักงานธุรการ ฝ่ายทรัพยากรบุคคล TCT',
                          t: 'ช่วยเขียนข้อเสนอแนะ Kaizen เสนอใช้ AI สรุปบันทึกการประชุมเพื่อลดเวลาทำงาน 2 ชั่วโมงต่อสัปดาห์',
                          f: 'ระบุ ปัญหาเดิม, วิธีการปรับปรุง, และผลประโยชน์ที่บริษัทจะได้รับเป็นตัวเลข',
                          t_: 'กระตือรือร้น เชิงบวก และน่าเชื่อถือ'
                        }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPromptContext(preset.c);
                            setPromptTask(preset.t);
                            setPromptFormat(preset.f);
                            setPromptTone(preset.t_);
                            playCyberClick();
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 text-xs font-semibold cursor-pointer transition-all"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>

                    {/* 4 Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-amber-300 font-bold block mb-1">
                          [C] CONTEXT (บริบท / เราคือใคร):
                        </label>
                        <input
                          type="text"
                          value={promptContext}
                          onChange={(e) => setPromptContext(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-amber-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-cyan-300 font-bold block mb-1">
                          [T] TASK (คำสั่งงานที่ชัดเจน):
                        </label>
                        <input
                          type="text"
                          value={promptTask}
                          onChange={(e) => setPromptTask(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-emerald-300 font-bold block mb-1">
                          [F] FORMAT (รูปแบบคำตอบที่ต้องการ):
                        </label>
                        <input
                          type="text"
                          value={promptFormat}
                          onChange={(e) => setPromptFormat(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-emerald-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-purple-300 font-bold block mb-1">
                          [T] TONE (น้ำเสียง / ระดับภาษา):
                        </label>
                        <input
                          type="text"
                          value={promptTone}
                          onChange={(e) => setPromptTone(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-purple-400 outline-none"
                        />
                      </div>
                    </div>

                    {/* Live Compiled Prompt */}
                    <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-amber-300 font-bold">
                          ✨ ผลลัพธ์ Prompt ฉบับสมบูรณ์ (พร้อมก๊อปปี้ไปวางใน ChatGPT/Claude):
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const fullPrompt = `${promptContext}\n\nภารกิจ: ${promptTask}\n\nรูปแบบผลลัพธ์: ${promptFormat}\n\nระดับภาษา: ${promptTone}`;
                            navigator.clipboard?.writeText(fullPrompt);
                            playSuccessChime();
                            setNotification('คัดลอก Prompt เรียบร้อยแล้ว!');
                            setTimeout(() => setNotification(null), 2500);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all border border-amber-500/40"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Prompt</span>
                        </button>
                      </div>
                      <div className="bg-black/50 p-3 rounded-lg text-xs font-mono text-slate-200 whitespace-pre-line leading-relaxed border border-slate-800">
                        {`[บริบท]: ${promptContext}
[ภารกิจ]: ${promptTask}
[รูปแบบ]: ${promptFormat}
[น้ำเสียง]: ${promptTone}`}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. AI Action Plan 30-60-90 Interactive Checklist */}
                {section.interactiveType === 'ai_action_plan_30_60_90' && (
                  <div className="bg-slate-950/90 rounded-xl p-5 border border-emerald-500/30 mt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="text-xs font-mono text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold">30-60-90 DAY BLUEPRINT — ติดตามแผนปฏิบัติการ AI ใน TCT</span>
                      </div>
                      <span className="text-[11px] text-slate-400">ติ๊กเลือกความคืบหน้าของท่าน</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          key: 'p1',
                          phase: 'ระยะที่ 1: 30 วันแรก (Quick Wins & Data Safety)',
                          desc: 'เริ่มทดลองใช้ AI ช่วยงานส่วนตัว 1-2 อย่าง (เช่น ร่างอีเมล/สรุปบันทึก) และรักษากฎเหล็กไม่ใส่ข้อมูลลับบริษัท 100%'
                        },
                        {
                          key: 'p2',
                          phase: 'ระยะที่ 2: 60 วัน (Team Collaboration & Prompt Bank)',
                          desc: 'แชร์สูตร Prompt C-T-F-T ที่ได้ผลดีกับเพื่อนร่วมแผนก และเริ่มจัดทำคลังคำสั่งงานประจำแผนก'
                        },
                        {
                          key: 'p3',
                          phase: 'ระยะที่ 3: 90 วัน (Value Creation & Kaizen Presentation)',
                          desc: 'บันทึกเวลาที่ประหยัดได้ต่อสัปดาห์ รวบรวมสถิติ และยื่นข้อเสนอแนะ Kaizen ต่อฝ่ายบริหาร'
                        }
                      ].map((item) => {
                        const checked = actionPlanChecks[item.key];
                        return (
                          <div
                            key={item.key}
                            onClick={() => {
                              setActionPlanChecks(prev => ({ ...prev, [item.key]: !prev[item.key] }));
                              playCyberClick();
                            }}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                              checked
                                ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                              checked ? 'bg-emerald-500 border-emerald-400 text-black font-bold' : 'border-slate-700 bg-slate-900'
                            }`}>
                              {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div className="space-y-0.5">
                              <div className={`text-xs font-bold ${checked ? 'text-emerald-300' : 'text-slate-300'}`}>
                                {item.phase}
                              </div>
                              <div className="text-[11px] leading-relaxed opacity-90">
                                {item.desc}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {section.keyHighlight && (
                  <div className="bg-cyan-950/40 border border-cyan-500/30 p-3 rounded-xl text-xs text-cyan-200 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{section.keyHighlight}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Dual Action & Previous/Next Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800 bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800">
            <div>
              {module.id > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    onNavigate(`module${module.id - 1}` as ViewState);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>บทเรียนก่อนหน้า: บทที่ {module.id - 1}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    onNavigate('pretest');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ทบทวน Pre-test</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {/* Button to Open Quiz */}
              <button
                id={`goto-quiz-mod-${module.id}-btn`}
                onClick={handleAttemptOpenQuiz}
                className={`w-full sm:w-auto h-11 px-5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isVideoComplete || isAlreadyCompleted
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02]'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-amber-500/40 hover:text-amber-300'
                }`}
              >
                {isVideoComplete || isAlreadyCompleted ? (
                  <HelpCircle className="w-4 h-4 text-white" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-400" />
                )}
                <span>ทำแบบทดสอบท้ายบท (Quiz {quizQuestions.length} ข้อ)</span>
              </button>

              {/* Proceed to Next Module Button - Strictly Enforces Video & Quiz Completion */}
              <button
                id={`proceed-next-mod-${module.id}-btn`}
                type="button"
                onClick={handleProceedNext}
                className={`w-full sm:w-auto h-11 px-5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                  isModuleFullyPassed
                    ? module.id < modules.length
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 cursor-pointer hover:scale-[1.02]'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold shadow-lg shadow-emerald-500/20 cursor-pointer hover:scale-[1.02]'
                    : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:border-slate-700 cursor-pointer'
                }`}
                title={!isModuleFullyPassed ? 'ต้องดูวิดีโอจบและทำ Quiz ให้ผ่านครบทุกข้อก่อน' : 'คลิกเพื่อไปขั้นตอนถัดไป'}
              >
                {!isModuleFullyPassed && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                <span>
                  {module.id < modules.length 
                    ? `ไปบทเรียนถัดไป: บทที่ ${module.id + 1}` 
                    : 'ไปเล่น AI Mini-Game & Post-test'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Quiz Tab */
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-purple-500/30 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">
                แบบทดสอบท้ายบทเรียนที่ {module.id} ({quizQuestions.length} ข้อ)
              </h2>
              <p className="text-xs text-slate-400">
                คุณต้องตอบถูกครบทุกข้อ ({quizQuestions.length}/{quizQuestions.length}) จึงจะปลดล็อคบทเรียนถัดไปได้
              </p>
            </div>
            <span className="text-xs font-mono text-purple-300 bg-purple-950 px-3 py-1 rounded-lg border border-purple-500/30">
              QUIZ ASSESSMENT
            </span>
          </div>

          <div className="space-y-6">
            {quizQuestions.map((q, qIndex) => {
              const selectedId = quizAnswers[q.id];
              return (
                <div key={q.id} className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-100 leading-relaxed">
                    {qIndex + 1}. {q?.questionText || ''}
                  </h3>

                  <div className="space-y-2">
                    {(q?.shuffledChoices || []).map((choice, cIndex) => {
                      const isSelected = selectedId === choice.id;
                      let choiceStyle = 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700';

                      if (quizSubmitted) {
                        if (choice.isCorrect) {
                          choiceStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-semibold';
                        } else if (isSelected && !choice.isCorrect) {
                          choiceStyle = 'bg-red-950/80 border-red-400 text-red-200';
                        }
                      } else if (isSelected) {
                        choiceStyle = 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-md shadow-purple-500/15';
                      }

                      return (
                        <div
                          key={choice.id}
                          onClick={() => handleSelectQuizAnswer(q.id, choice.id)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-3 text-xs ${choiceStyle}`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="w-5 h-5 rounded flex items-center justify-center font-bold bg-slate-800 text-slate-300 shrink-0 mt-0.5">
                              {choiceLabels[cIndex]}
                            </span>
                            <span className="leading-relaxed break-words">{choice.text}</span>
                          </div>

                          {quizSubmitted && choice.isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          {quizSubmitted && isSelected && !choice.isCorrect && (
                            <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400">
                      <span className="font-semibold text-cyan-400">คำอธิบาย: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quiz Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => { playCyberClick(); setActiveTab('content'); }}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">กลับไปทบทวนเนื้อหา</span>
            </button>

            {!quizSubmitted ? (
              <button
                id={`submit-quiz-mod-${module.id}-btn`}
                disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                onClick={handleQuizSubmit}
                className={`py-2.5 px-6 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  Object.keys(quizAnswers).length === quizQuestions.length
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25 cursor-pointer hover:scale-[1.02]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">ตรวจคำตอบท้ายบท ({Object.keys(quizAnswers).length}/{quizQuestions.length})</span>
              </button>
            ) : isQuizPassed ? (
              <div className="flex items-center gap-2.5 flex-wrap justify-end">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/30 flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="whitespace-nowrap">ผ่านครบทุกข้อ ({quizQuestions.length}/{quizQuestions.length})</span>
                </span>
                <button
                  id={`next-step-mod-${module.id}-btn`}
                  onClick={() => {
                    playCyberClick();
                    onCompleteModule(module.id);
                    if (module.id < modules.length) {
                      onNavigate(`module${module.id + 1}` as ViewState);
                    } else {
                      onNavigate('game');
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform whitespace-nowrap"
                >
                  <span className="whitespace-nowrap">{module.id < modules.length ? `ไปบทเรียนที่ ${module.id + 1}` : 'ไปกิจกรรมถัดไป'}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 flex-wrap justify-end">
                <span className="text-xs text-red-400 bg-red-950/80 px-3 py-1.5 rounded-lg border border-red-500/30 whitespace-nowrap">
                  คะแนน: {quizScore}/{quizQuestions.length} (ต้องผ่านทั้งหมด)
                </span>
                <button
                  onClick={handleRetryQuiz}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 border border-slate-700 cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">ลองทำอีกครั้ง</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

