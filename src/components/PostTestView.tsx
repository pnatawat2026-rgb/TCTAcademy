import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ShuffledQuestion, UserProfile, ViewState } from '../types';
import { shuffleArray } from '../utils/shuffle';
import { calculateLearningMetrics } from '../utils/scoreMetrics';
import { 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft, 
  Award, 
  Shuffle, 
  Check, 
  X,
  Sparkles,
  HelpCircle,
  Home,
  FileCheck2
} from 'lucide-react';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface PostTestViewProps {
  user: UserProfile;
  questions: any[];
  onCompletePostTest: (score: number) => void;
  onNavigate: (view: ViewState) => void;
  onResetProgress?: () => void;
}

export const PostTestView: React.FC<PostTestViewProps> = ({
  user,
  questions,
  onCompletePostTest,
  onNavigate,
  onResetProgress
}) => {
  const { t, language } = useLanguage();
  const questionCardRef = useRef<HTMLDivElement>(null);
  // Generate freshly shuffled choices for all 10 questions
  const [shuffleKey, setShuffleKey] = useState<number>(0);

  const shuffledQuestions: ShuffledQuestion[] = useMemo(() => {
    return questions.map((q) => ({
      id: q.id,
      moduleId: q.moduleId,
      questionText: q.questionText,
      shuffledChoices: shuffleArray(q.choices),
      explanation: q.explanation
    }));
  }, [shuffleKey, questions]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => user.postTestScore !== null && user.postTestScore !== undefined);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(user.postTestScore);
  const [showReview, setShowReview] = useState<boolean>(false);

  // Sync state if user's postTestScore or selectedCourseId changes
  useEffect(() => {
    if (user.postTestScore !== null && user.postTestScore !== undefined) {
      setCalculatedScore(user.postTestScore);
      setIsSubmitted(true);
    }
  }, [user.postTestScore, user.selectedCourseId]);

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

  const totalQuestions = shuffledQuestions.length;
  const currentQ = shuffledQuestions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === totalQuestions;

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

    const minPass = questions.length >= 20 ? 16 : 8;
    if (score >= minPass) {
      playSuccessChime();
    } else {
      playErrorBuzz();
    }

    onCompletePostTest(score);
  };

  const handleRetake = () => {
    playCyberClick();
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCalculatedScore(null);
    setCurrentIndex(0);
    setShowReview(false);
    // Trigger reshuffle
    setShuffleKey((prev) => prev + 1);
  };

  const choiceLabels = ['ก', 'ข', 'ค', 'ง'];
  const passingScore = questions.length >= 20 ? 16 : 8;
  const isPassed = calculatedScore !== null && calculatedScore >= passingScore;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6 font-sarabun text-slate-800">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              id="posttest-home-btn"
              type="button"
              onClick={() => { playCyberClick(); onNavigate('courses'); }}
              className="h-8 px-2.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
            >
              <Home className="w-3.5 h-3.5 text-[#005A9C]" />
              <span>{t('nav.home', 'หน้าแรก', 'Home')}</span>
            </button>
            <button
              id="posttest-dashboard-btn"
              type="button"
              onClick={() => { playCyberClick(); onNavigate('dashboard'); }}
              className="h-8 px-2.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#005A9C]" />
              <span>{t('nav.dashboard', 'แดชบอร์ด', 'Dashboard')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <LanguageToggle variant="compact" />
            <span className="text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 text-[#005A9C] border border-blue-200">
              OFFICIAL POST-TEST
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1">
              <Shuffle className="w-3.5 h-3.5 text-[#005A9C]" />
              {language === 'th' ? 'สลับช้อยส์ ก-ง' : 'Randomized'}
            </span>
          </div>
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 mt-2">
            {t('posttest.title', 'แบบทดสอบหลังเรียน (Post-test)', 'Post-Training Assessment')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('posttest.subtitle', `เกณฑ์ผ่าน 80% (${passingScore} ใน ${questions.length} ข้อ) เพื่อรับใบเกียรติบัตรรับรองจากศูนย์พัฒนาบุคลากร TCT Academy`, `Passing score is 80% (${passingScore}/${questions.length}) to obtain the official digital certificate.`)}
          </p>
        </div>
      </div>

      {/* Dedicated Question Navigator Grid - Wraps cleanly into 10 columns without horizontal overflow */}
      {!isSubmitted && (
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-800 font-bold flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-slate-700" />
              <span>เลือกข้อสอบ (1 - {totalQuestions}):</span>
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700 border border-slate-200">
              ตอบแล้ว {answeredCount}/{totalQuestions} ข้อ
            </span>
          </div>

          <div className="grid grid-cols-10 sm:grid-cols-20 gap-1 sm:gap-1.5 w-full">
            {shuffledQuestions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => { playCyberClick(); setCurrentIndex(idx); }}
                  className={`h-8 w-full rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'bg-slate-800 text-white shadow-xs ring-2 ring-slate-400'
                      : isAnswered
                        ? 'bg-slate-200 text-slate-900 font-bold border border-slate-300'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
        <div ref={questionCardRef} className="w-full max-w-full bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-2xs relative overflow-hidden break-words">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              คำถามที่ {currentIndex + 1} จาก {totalQuestions}
            </span>
            <span className="text-xs text-slate-500">
              ตอบแล้ว {answeredCount}/{totalQuestions} ข้อ
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-5 leading-relaxed break-words whitespace-normal">
            {currentIndex + 1}. {currentQ?.questionText}
          </h2>

          {/* Choices list */}
          <div className="space-y-2.5 mb-6 w-full">
            {(currentQ?.shuffledChoices || []).map((choice, cIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === choice.id;
              return (
                <div
                  key={choice.id}
                  onClick={() => handleSelectChoice(currentQ.id, choice.id)}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 w-full break-words ${
                    isSelected
                      ? 'bg-slate-100 border-2 border-slate-800 text-slate-950 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {choiceLabels[cIdx]}
                  </div>
                  <div className="text-sm leading-relaxed font-normal flex-1 min-w-0 break-words whitespace-normal">
                    {choice.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Navigation & Submit */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 pt-4 border-t border-slate-100 w-full">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => { playCyberClick(); setCurrentIndex((prev) => Math.max(0, prev - 1)); }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                currentIndex === 0
                  ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 cursor-pointer shadow-2xs'
              }`}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>ข้อก่อนหน้า</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => { playCyberClick(); setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1)); }}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-xs cursor-pointer transition-all"
              >
                <span>ข้อถัดไป</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            ) : (
              <button
                id="posttest-submit-btn"
                type="button"
                disabled={!isAllAnswered}
                onClick={handleSubmit}
                className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isAllAnswered
                    ? 'bg-slate-800 hover:bg-slate-900 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>ส่งข้อสอบ</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results Card */
        <div className="space-y-6">
          <div
            className={`bg-white rounded-3xl p-6 sm:p-9 border text-center space-y-6 shadow-sm ${
              isPassed ? 'border-emerald-300' : 'border-rose-200'
            }`}
          >
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                isPassed
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-600'
                  : 'bg-rose-50 border border-rose-300 text-rose-600'
              }`}
            >
              {isPassed ? <Award className="w-10 h-10 animate-bounce" /> : <AlertTriangle className="w-10 h-10" />}
            </div>

            <div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  isPassed
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {isPassed ? 'ผ่านเกณฑ์ 80% (PASSED)' : 'ยังไม่ผ่านเกณฑ์ (< 80%)'}
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 mb-1">
                {isPassed ? 'ยินดีด้วย! คุณผ่านเกณฑ์การฝึกอบรม' : 'ยังไม่ผ่านเกณฑ์ 80%'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {isPassed
                  ? 'คุณทำคะแนนผ่านเกณฑ์ที่กำหนด สามารถทำแบบประเมินและรับใบเกียรติบัตรดิจิทัลได้ทันที'
                  : `เกณฑ์การผ่านคือ 80% (${passingScore} จาก ${questions.length} ข้อ) กรุณาทบทวนคำเฉลยด้านล่างและทำแบบทดสอบใหม่อีกครั้ง`}
              </p>
            </div>

            {/* Score Stats */}
            {(() => {
              const testMetrics = calculateLearningMetrics(user.preTestScore, calculatedScore);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-lg mx-auto">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">คะแนน Pre-test</div>
                    <div className="text-2xl font-bold text-[#005A9C] font-mono mt-1">
                      {user.preTestScore ?? 0} / {questions.length}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">({Math.round(((user.preTestScore ?? 0) / questions.length) * 100)}%)</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">คะแนน Post-test</div>
                    <div className={`text-2xl font-bold font-mono mt-1 ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {calculatedScore} / {questions.length}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">({Math.round(((calculatedScore || 0) / questions.length) * 100)}%)</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">พัฒนาการเรียนรู้</div>
                    <div className="text-2xl font-bold text-indigo-600 font-mono mt-1">
                      {testMetrics.growthPercentage === 100 ? '100%' : `+${testMetrics.scoreDelta}%`}
                    </div>
                    <div className="text-[10px] text-slate-600 font-medium truncate" title={testMetrics.badgeLabelEn}>
                      {testMetrics.badgeLabelTh}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowReview(!showReview)}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 border border-slate-200 cursor-pointer transition-all"
              >
                <HelpCircle className="w-4 h-4 text-[#005A9C]" />
                <span>{showReview ? 'ซ่อนคำเฉลย' : 'ดูเฉลยและคำอธิบายทุกข้อ'}</span>
              </button>

              {!isPassed ? (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    id="posttest-retake-btn"
                    onClick={handleRetake}
                    className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>ทำแบบทดสอบอีกครั้ง (Retake)</span>
                  </button>

                  {onResetProgress && (
                    <button
                      id="posttest-reset-btn"
                      onClick={() => { playCyberClick(); onResetProgress(); }}
                      className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
                      title="ล้างประวัติการเรียนเพื่อทำ Pre-test และเรียนใหม่ทั้งหมด"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      <span>ล้างประวัติเพื่อเรียนใหม่</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    id="posttest-direct-cert-btn"
                    type="button"
                    onClick={() => { playCyberClick(); onNavigate('certificate'); }}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>รับใบเกียรติบัตร A4 แนวนอนทันที</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id="posttest-proceed-eval-btn"
                    type="button"
                    onClick={() => { playCyberClick(); onNavigate('evaluation'); }}
                    className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-300 shadow-2xs cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-slate-600" />
                    <span>ทำแบบประเมินความพึงพอใจ</span>
                  </button>

                  {onResetProgress && (
                    <button
                      id="posttest-passed-reset-btn"
                      type="button"
                      onClick={() => { playCyberClick(); onResetProgress(); }}
                      className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-300 shadow-2xs cursor-pointer"
                      title="ล้างประวัติการเรียนเพื่อเริ่มเรียนใหม่"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      <span>ล้างประวัติ</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Question Review Accordion */}
          {showReview && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                เฉลยและคำอธิบายรายข้อ (Detailed Explanations)
              </h3>

              <div className="space-y-4">
                {shuffledQuestions.map((q, idx) => {
                  const userChoiceId = selectedAnswers[q.id];
                  const userChoice = q.shuffledChoices.find((c) => c.id === userChoiceId);
                  const isUserCorrect = userChoice?.isCorrect || false;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border ${
                        isUserCorrect
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="text-xs font-bold text-slate-900">
                          {idx + 1}. {q?.questionText || ''}
                        </div>
                        {isUserCorrect ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" /> ตอบถูก
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <X className="w-3 h-3" /> ตอบผิด
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs">
                        {(q?.shuffledChoices || []).map((c, cIdx) => (
                          <div
                            key={c.id}
                            className={`p-2 rounded-xl flex items-center justify-between ${
                              c.isCorrect
                                ? 'bg-emerald-100/70 text-emerald-900 font-bold'
                                : userChoiceId === c.id
                                  ? 'bg-rose-100/70 text-rose-900 line-through'
                                  : 'text-slate-600'
                            }`}
                          >
                            <span>
                              {choiceLabels[cIdx]}. {c.text}
                            </span>
                            {c.isCorrect && <span className="text-[10px] font-bold text-emerald-700">✓ คำตอบที่ถูกต้อง</span>}
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 p-3 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-200">
                        <span className="font-bold text-[#005A9C]">คำอธิบายเชิงลึก: </span>
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
