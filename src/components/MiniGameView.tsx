import React, { useState, useEffect } from 'react';
import { MiniGameScenario, UserProfile, ViewState } from '../types';
import { MINI_GAME_SCENARIOS } from '../data/courseData';
import { PREVENTIVE_MINI_GAME_SCENARIOS_1 } from '../data/preventiveCourseData';
import { PERSONALITY_MINI_GAME_SCENARIOS } from '../data/personalityCourseData';
import { AI_MINI_GAME_SCENARIOS } from '../data/aiCourseData';
import { KYT_MINI_GAME_SCENARIOS } from '../data/kytCourseData';
import { APPLIED_PSYCHOLOGY_MINI_GAME_SCENARIOS } from '../data/appliedPsychologyCourseData';
import { GOOD_EMPLOYEE_MINIGAME_SCENARIOS } from '../data/goodEmployeeSkillsData';
import { 
  Gamepad2, 
  Check, 
  X, 
  Flame, 
  Trophy, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Zap, 
  ShieldCheck, 
  AlertCircle,
  Home,
  ArrowLeft
} from 'lucide-react';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface MiniGameViewProps {
  user: UserProfile;
  onSaveMiniGameScore: (score: number) => void;
  onNavigate: (view: ViewState) => void;
}

export const MiniGameView: React.FC<MiniGameViewProps> = ({
  user,
  onSaveMiniGameScore,
  onNavigate
}) => {
  const { t, language } = useLanguage();
  const isGoodEmployee = user.selectedCourseId === 'good-employee-skills';
  const isAI = user.selectedCourseId === 'ai-for-tct';
  const isAppliedPsychology = user.selectedCourseId === 'applied-psychology';
  const isKYT = user.selectedCourseId === 'kyt-shisa-kanko';
  const isPersonality = user.selectedCourseId === 'personality-psychology' || user.selectedCourseId === 'conflict-management';
  const isPreventive = user.selectedCourseId === 'advanced-preventive-maintenance';
  const scenarios = isGoodEmployee
    ? GOOD_EMPLOYEE_MINIGAME_SCENARIOS
    : isAppliedPsychology
    ? APPLIED_PSYCHOLOGY_MINI_GAME_SCENARIOS
    : isKYT
    ? KYT_MINI_GAME_SCENARIOS
    : isAI
    ? AI_MINI_GAME_SCENARIOS
    : isPersonality 
    ? PERSONALITY_MINI_GAME_SCENARIOS 
    : (isPreventive ? PREVENTIVE_MINI_GAME_SCENARIOS_1 : MINI_GAME_SCENARIOS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'answered' | 'finished'>('idle');
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [answeredFeedback, setAnsweredFeedback] = useState<string>('');

  const currentScenario = scenarios[currentIndex];

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      // Timeout counts as wrong
      handleAnswer(null);
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  const handleStartGame = () => {
    playCyberClick();
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setTimeLeft(10);
    setGameState('playing');
  };

  const handleAnswer = (choice: boolean | null) => {
    if (gameState !== 'playing') return;

    const isCorrect = choice === currentScenario.isCorrectBehavior;
    setLastAnswerCorrect(isCorrect);
    setAnsweredFeedback(currentScenario.explanation);

    if (isCorrect) {
      playSuccessChime();
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setCorrectCount((prev) => prev + 1);

      // Score calculation: 100 base + (timeLeft * 10) * multiplier
      const multiplier = newStreak >= 5 ? 2.5 : newStreak >= 3 ? 1.8 : newStreak >= 2 ? 1.4 : 1.0;
      const points = Math.round((100 + timeLeft * 10) * multiplier);
      setScore((prev) => prev + points);
    } else {
      playErrorBuzz();
      setStreak(0);
    }

    setGameState('answered');
  };

  const handleNextQuestion = () => {
    playCyberClick();
    if (currentIndex + 1 < scenarios.length) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(10);
      setGameState('playing');
    } else {
      // Finished
      const finalScore = score;
      onSaveMiniGameScore(finalScore);
      setGameState('finished');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 cyber-grid space-y-4">
      {/* Game Header */}
      <div className="glass-panel-purple rounded-2xl p-4 sm:p-6 border border-purple-500/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <button
                id="minigame-home-btn"
                type="button"
                onClick={() => { playCyberClick(); onNavigate('courses'); }}
                className="h-8 px-3 rounded-lg bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title={language === 'th' ? "กลับสู่หน้าหลัก / พอร์ทัลระบบ" : "Back to Home / System Portal"}
              >
                <Home className="w-3.5 h-3.5 text-cyan-200" />
                <span>{t('nav.home', 'หน้าหลัก', 'Home')}</span>
              </button>
              <button
                id="minigame-dashboard-btn"
                type="button"
                onClick={() => { playCyberClick(); onNavigate('dashboard'); }}
                className="h-8 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('nav.dashboard', 'แดชบอร์ด', 'Dashboard')}</span>
              </button>
              <LanguageToggle variant="compact" />
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40">
                AI CYBER PATROL • FAST REFLEX MINI-GAME
              </span>
              <span className="text-xs text-amber-300 font-mono flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                High: {Math.max(user.miniGameScore, score)} pts
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {t('game.title', 'มินิเกมประเมินความว่องไวและแม่นยำ (True / False Risk Judgment)', 'Rapid Hazard Response Mini-Game (True / False Risk Judgment)')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {t('game.subtitle', 'วิเคราะห์สถานการณ์จำลองหน้างานและตัดสินใจว่าพฤติกรรมนี้ "ถูกต้อง" หรือ "ไม่ถูกต้อง" ภายในเวลาที่กำหนด', 'Analyze factory work floor scenarios and determine compliance within time limit.')}
            </p>
          </div>

          {gameState === 'playing' && (
            <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-purple-500/30 shrink-0">
              <div className="text-center">
                <div className="text-[10px] text-slate-400 font-mono">STREAK</div>
                <div className="flex items-center gap-1 text-sm font-bold text-amber-400 font-mono">
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                  {streak}x
                </div>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div className="text-center">
                <div className="text-[10px] text-slate-400 font-mono">SCORE</div>
                <div className="text-sm font-bold text-cyan-400 font-mono">{score}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Stage Area */}
      {gameState === 'idle' ? (
        /* Intro Card */
        <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
            <Gamepad2 className="w-10 h-10 text-purple-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">พร้อมรับภารกิจตัดสินใจแยกแยะความเสี่ยงหรือยัง?</h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              คุณจะได้เผชิญกับสถานการณ์จำลอง 10 ข้อ ตอบให้ไวและแม่นยำเพื่อเก็บโบนัสเวลาและคอมโบคูณคะแนนสูงสุด!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto text-xs text-slate-300">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div>เวลา 10 วิ / ข้อ</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <div>โบนัสความเร็ว</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <Flame className="w-4 h-4 text-rose-400 mx-auto mb-1" />
              <div>คอมโบคูณคะแนน</div>
            </div>
          </div>

          <button
            id="minigame-start-btn"
            onClick={handleStartGame}
            className="bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-bold text-sm py-3.5 px-10 rounded-xl shadow-lg shadow-purple-500/25 inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <Gamepad2 className="w-5 h-5" />
            <span>เริ่มเล่นเกมทันที (Start Game)</span>
          </button>
        </div>
      ) : gameState === 'finished' ? (
        /* Game Over Summary */
        <div className="glass-panel-cyan rounded-2xl p-8 border border-cyan-500/40 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          </div>

          <div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-500/30">
              GAME COMPLETED
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3 mb-1">
              ยอดเยี่ยมมาก! การลาดตระเวนเสร็จสมบูรณ์
            </h2>
            <p className="text-xs text-slate-300">
              บันทึกคะแนนมินิเกมของคุณลงในโปรไฟล์การฝึกอบรมเรียบร้อยแล้ว
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">คะแนนรวม</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">{score}</div>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">ตอบถูกต้อง</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                {correctCount} / {scenarios.length}
              </div>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">คอมโบสูงสุด</div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{maxStreak}x</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={handleStartGame}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              เล่นใหม่อีกครั้ง
            </button>

            <button
              id="minigame-proceed-posttest-btn"
              onClick={() => { playCyberClick(); onNavigate('posttest'); }}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black text-xs font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <span>ไปทำแบบทดสอบหลังเรียน (Post-test)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Active Game Card (Playing or Answered) */
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6 relative overflow-hidden">
          {/* Top Progress & Timer Gauge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400">
                SCENARIO {currentIndex + 1} / {scenarios.length} • หมวด: {currentScenario.category}
              </span>
              <span className={`font-bold ${timeLeft <= 3 ? 'text-red-400 animate-ping' : 'text-slate-300'}`}>
                ⏱ {timeLeft}s
              </span>
            </div>

            {/* Time Bar */}
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-1000 rounded-full ${
                  timeLeft <= 3
                    ? 'bg-red-500'
                    : timeLeft <= 6
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-cyan-400 to-purple-500'
                }`}
                style={{ width: `${(timeLeft / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Scenario Text Card */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 min-h-[160px] flex flex-col justify-center text-center">
            <div className="text-xs font-mono text-purple-300 mb-2">สถานการณ์หน้างาน (On-site Situation):</div>
            <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed max-w-2xl mx-auto">
              "{currentScenario.scenario}"
            </p>
          </div>

          {/* Answer Controls or Feedback */}
          {gameState === 'playing' ? (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                id="game-answer-true-btn"
                onClick={() => handleAnswer(true)}
                className="py-4 px-6 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900 border-2 border-emerald-500/50 hover:border-emerald-400 text-emerald-200 font-bold text-base flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <span>ถูกต้อง (TRUE)</span>
              </button>

              <button
                id="game-answer-false-btn"
                onClick={() => handleAnswer(false)}
                className="py-4 px-6 rounded-2xl bg-rose-950/70 hover:bg-rose-900 border-2 border-rose-500/50 hover:border-rose-400 text-rose-200 font-bold text-base flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg shadow-rose-500/10 group"
              >
                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <X className="w-5 h-5 text-rose-400" />
                </div>
                <span>ไม่ถูกต้อง (FALSE)</span>
              </button>
            </div>
          ) : (
            /* Answer Feedback Box */
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  lastAnswerCorrect
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {lastAnswerCorrect ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm mb-1">
                    {lastAnswerCorrect ? '🎉 ถูกต้อง! แม่นยำมาก' : '❌ ยังไม่ถูกต้อง'}
                  </div>
                  <div className="text-xs leading-relaxed text-slate-200">{answeredFeedback}</div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  id="game-next-btn"
                  onClick={handleNextQuestion}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer"
                >
                  <span>{currentIndex + 1 < scenarios.length ? 'ข้อต่อไป' : 'ดูสรุปผลคะแนน'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
