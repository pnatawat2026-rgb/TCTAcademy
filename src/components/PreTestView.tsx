import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShuffledQuestion, UserProfile, ViewState } from '../types';
import { shuffleArray } from '../utils/shuffle';
import { COURSE_QUESTIONS } from '../data/courseData';
import { 
  FileCheck2, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Shuffle, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  BookOpen,
  LayoutDashboard,
  Home
} from 'lucide-react';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface PreTestViewProps {
  user: UserProfile;
  questions?: any[];
  onCompletePreTest: (score: number) => void;
  onProceedToModule1: () => void;
  onNavigate?: (view: ViewState) => void;
}

export const PreTestView: React.FC<PreTestViewProps> = ({
  user,
  questions = [],
  onCompletePreTest,
  onProceedToModule1,
  onNavigate
}) => {
  const { t, language } = useLanguage();
  const questionCardRef = useRef<HTMLDivElement>(null);

  // Generate shuffled choices for each question
  const shuffledQuestions: ShuffledQuestion[] = useMemo(() => {
    const validQuestions = Array.isArray(questions) && questions.length > 0
      ? questions.filter(Boolean)
      : COURSE_QUESTIONS;
    return validQuestions.map((q) => ({
      id: q?.id ?? 1,
      moduleId: q?.moduleId ?? 1,
      questionText: q?.questionText ?? '',
      shuffledChoices: shuffleArray(q?.choices || []),
      explanation: q?.explanation ?? ''
    }));
  }, [questions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(user.preTestScore !== null);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(user.preTestScore);

  const totalQuestions = shuffledQuestions.length;
  const currentQ = shuffledQuestions[currentIndex] || shuffledQuestions[0] || {
    id: 1,
    moduleId: 1,
    questionText: '',
    shuffledChoices: [],
    explanation: ''
  };
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === totalQuestions;

  // Instant scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Smooth scroll to question card when switching questions
  useEffect(() => {
    if (questionCardRef.current) {
      questionCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIndex]);

  const handleSelectChoice = (questionId: number, choiceId: string) => {
    if (isSubmitted) return;
    playCyberClick();
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const handleSubmit = () => {
    if (!isAllAnswered) return;
    playCyberClick();

    // Calculate score
    let score = 0;
    shuffledQuestions.forEach((q) => {
      const selectedId = selectedAnswers[q.id];
      const selectedChoice = q.shuffledChoices.find((c) => c.id === selectedId);
      if (selectedChoice && selectedChoice.isCorrect) {
        score++;
      }
    });

    setCalculatedScore(score);
    setIsSubmitted(true);
    playSuccessChime();
    onCompletePreTest(score);
  };

  const choiceLabels = ['ก', 'ข', 'ค', 'ง'];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6 font-sarabun text-slate-800">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {onNavigate && (
            <div className="flex items-center gap-2">
              <button
                id="pretest-home-btn"
                type="button"
                onClick={() => { playCyberClick(); onNavigate('courses'); }}
                className="h-8 px-2.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
              >
                <Home className="w-3.5 h-3.5 text-[#005A9C]" />
                <span>{t('nav.home', 'หน้าแรก', 'Home')}</span>
              </button>
              <button
                id="pretest-dashboard-btn"
                type="button"
                onClick={() => { playCyberClick(); onNavigate('dashboard'); }}
                className="h-8 px-2.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#005A9C]" />
                <span>{t('nav.dashboard', 'แดชบอร์ด', 'Dashboard')}</span>
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <LanguageToggle variant="compact" />
            <span className="text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 text-[#005A9C] border border-blue-200">
              PRE-TEST EVALUATION
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1">
              <Shuffle className="w-3.5 h-3.5 text-[#005A9C]" />
              {language === 'th' ? 'สลับตัวเลือก ก-ง' : 'Auto-randomized'}
            </span>
          </div>
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 mt-2">
            {t('pretest.title', 'แบบทดสอบก่อนเรียน (Pre-test)', 'Pre-Training Assessment')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('pretest.subtitle', 'วัตถุประสงค์เพื่อประเมินความรู้พื้นฐานก่อนเข้าสู่เนื้อหาหลักสูตร (ไม่มีผลต่อการผ่านหลักสูตร)', 'Evaluates baseline knowledge before modules (does not affect certification pass).')}
          </p>
        </div>
      </div>

      {/* Dedicated Question Navigator Pill Bar */}
      {!isSubmitted && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0 text-xs">
            <span className="text-[#005A9C] font-bold flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#005A9C]" />
              <span>เลือกข้อสอบ:</span>
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-600">
              ตอบแล้ว {answeredCount}/{totalQuestions} ข้อ
            </span>
          </div>

          <div className="flex items-center gap-1.5 max-w-full overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            {shuffledQuestions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => { playCyberClick(); setCurrentIndex(idx); }}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'bg-[#005A9C] text-white shadow-md shadow-blue-900/20 ring-2 ring-blue-300 scale-105'
                      : isAnswered
                        ? 'bg-blue-50 text-[#005A9C] border border-blue-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  title={`ข้อ ${idx + 1}${isAnswered ? ' (ตอบแล้ว)' : ''}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Question Box */}
      {!isSubmitted ? (
        <div ref={questionCardRef} className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-sm relative">
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-xs font-bold text-[#005A9C] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 whitespace-nowrap">
              คำถามที่ {currentIndex + 1} จาก {totalQuestions}
            </span>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              ตอบแล้ว {answeredCount}/{totalQuestions} ข้อ
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-6 leading-relaxed">
            {currentIndex + 1}. {currentQ?.questionText || ''}
          </h2>

          {/* Choices list */}
          <div className="space-y-3 mb-8">
            {(currentQ?.shuffledChoices || []).map((choice, cIdx) => {
              const isSelected = selectedAnswers[currentQ?.id] === choice.id;
              return (
                <div
                  key={choice.id}
                  onClick={() => handleSelectChoice(currentQ.id, choice.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-blue-50 border-2 border-[#005A9C] text-blue-950 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-[#005A9C] text-white'
                        : 'bg-white text-slate-700 border border-slate-300'
                    }`}
                  >
                    {choiceLabels[cIdx]}
                  </div>
                  <div className="text-sm leading-relaxed font-normal">{choice.text}</div>
                </div>
              );
            })}
          </div>

          {/* Pagination Navigation & Submit */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              disabled={currentIndex === 0}
              onClick={() => { playCyberClick(); setCurrentIndex((prev) => Math.max(0, prev - 1)); }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                currentIndex === 0
                  ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">ข้อก่อนหน้า</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => { playCyberClick(); setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1)); }}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold bg-[#005A9C] hover:bg-[#00487C] text-white shadow-md shadow-blue-900/10 cursor-pointer transition-all whitespace-nowrap"
              >
                <span className="whitespace-nowrap">ข้อถัดไป</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            ) : (
              <button
                id="pretest-submit-btn"
                disabled={!isAllAnswered}
                onClick={handleSubmit}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md whitespace-nowrap ${
                  isAllAnswered
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-emerald-900/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">ส่งข้อสอบและดูผลคะแนน</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Result Summary Card */
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-[#005A9C]" />
          </div>
          
          <span className="text-xs font-bold text-[#005A9C] bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            PRE-TEST COMPLETED
          </span>

          <h2 className="text-2xl font-bold text-slate-900 mt-3 mb-2">
            บันทึกผลการทดสอบก่อนเรียนเรียบร้อยแล้ว
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            คะแนนนี้ถูกบันทึกเป็นค่าตั้งต้น (Baseline) เพื่อใช้เปรียบเทียบกับแบบทดสอบหลังเรียน (Post-test) ในการออกใบรับรองผล
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-sm mx-auto mb-8">
            <div className="text-xs text-slate-500 mb-1">คะแนนที่คุณทำได้ (Pre-test Score)</div>
            <div className="text-4xl font-extrabold text-[#005A9C] font-mono">
              {calculatedScore} <span className="text-lg text-slate-400 font-normal">/ {totalQuestions}</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              คิดเป็น {Math.round(((calculatedScore || 0) / totalQuestions) * 100)}% ของคะแนนเต็ม
            </div>
          </div>

          <button
            id="pretest-proceed-module1-btn"
            onClick={() => { playCyberClick(); onProceedToModule1(); }}
            className="inline-flex items-center gap-2 bg-[#005A9C] hover:bg-[#00487C] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-900/15 cursor-pointer text-sm transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>เข้าสู่บทเรียนที่ 1</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
