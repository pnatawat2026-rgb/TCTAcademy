import React, { useState } from 'react';
import { UserProfile, ViewState } from '../types';
import { Star, MessageSquare, Award, ArrowRight, CheckCircle2, ThumbsUp, Home, ArrowLeft } from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface EvaluationViewProps {
  user: UserProfile;
  onSubmitEvaluation: (answers: {
    contentQuality: number;
    understanding: number;
    platformEase: number;
    practicalUsage: number;
    overallSatisfaction: number;
    feedback: string;
  }) => void;
  onNavigate: (view: ViewState) => void;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  user,
  onSubmitEvaluation,
  onNavigate
}) => {
  const { t, language } = useLanguage();
  const [contentQuality, setContentQuality] = useState<number>(5);
  const [understanding, setUnderstanding] = useState<number>(5);
  const [platformEase, setPlatformEase] = useState<number>(5);
  const [practicalUsage, setPracticalUsage] = useState<number>(5);
  const [overallSatisfaction, setOverallSatisfaction] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>(
    language === 'th' 
      ? 'เนื้อหากระชับ เข้าใจง่าย และสื่อภาพ Infographic นำไปใช้ในงานจริงได้ดีมากครับ'
      : 'Concise and practical training materials, very easy to apply in daily plant operations.'
  );

  const ratingItems = [
    { 
      id: 'item1', 
      title: t('eval.item1', '1. ความชัดเจน กระชับ และความน่าสนใจของเนื้อหาบทเรียน Micro-Training', '1. Clarity, conciseness and visual quality of Micro-Training modules'), 
      value: contentQuality, 
      setter: setContentQuality 
    },
    { 
      id: 'item2', 
      title: t('eval.item2', '2. ความรู้และความเข้าใจที่เพิ่มขึ้นเกี่ยวกับการบริหารความเสี่ยง (คุณภาพ & ความปลอดภัย)', '2. Increased knowledge and comprehension regarding risk management'), 
      value: understanding, 
      setter: setUnderstanding 
    },
    { 
      id: 'item3', 
      title: t('eval.item3', '3. ความสะดวก ทันสมัย และความเสถียรของระบบการเรียนรู้ดิจิทัล', '3. Digital platform usability, speed and modern interactive experience'), 
      value: platformEase, 
      setter: setPlatformEase 
    },
    { 
      id: 'item4', 
      title: t('eval.item4', '4. ความสามารถในการนำเครื่องมือ (Risk Matrix, RCA 5 Whys, Near Miss) ไปประยุกต์ใช้ในงานประจำวัน', '4. Practical application of tools (Risk Matrix, RCA 5 Whys, Near Miss) in daily tasks'), 
      value: practicalUsage, 
      setter: setPracticalUsage 
    },
    { 
      id: 'item5', 
      title: t('eval.item5', '5. ความพึงพอใจในภาพรวมต่อหลักสูตรการฝึกอบรม', '5. Overall satisfaction with this training curriculum'), 
      value: overallSatisfaction, 
      setter: setOverallSatisfaction 
    }
  ];

  const likertLabels = [
    { score: 1, labelTh: 'น้อยที่สุด', labelEn: 'Very Low' },
    { score: 2, labelTh: 'น้อย', labelEn: 'Low' },
    { score: 3, labelTh: 'ปานกลาง', labelEn: 'Moderate' },
    { score: 4, labelTh: 'มาก', labelEn: 'High' },
    { score: 5, labelTh: 'มากที่สุด', labelEn: 'Very High' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSuccessChime();
    onSubmitEvaluation({
      contentQuality,
      understanding,
      platformEase,
      practicalUsage,
      overallSatisfaction,
      feedback: feedback.trim()
    });
    onNavigate('certificate');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 cyber-grid space-y-6">
      {/* Top Quick Navigation Bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <button
            id="eval-back-to-home-btn"
            type="button"
            onClick={() => { playCyberClick(); onNavigate('login'); }}
            className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title={language === 'th' ? "กลับสู่หน้าหลัก / พอร์ทัลระบบ" : "Back to Home / System Portal"}
          >
            <Home className="w-4 h-4 text-cyan-200" />
            <span>{t('nav.home', 'หน้าหลัก', 'Home')}</span>
          </button>
          <button
            id="eval-back-dashboard-btn"
            type="button"
            onClick={() => { playCyberClick(); onNavigate('dashboard'); }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>{t('nav.dashboard', 'แดชบอร์ด', 'Dashboard')}</span>
          </button>
        </div>
        <LanguageToggle variant="compact" />
      </div>

      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <ThumbsUp className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-xs font-mono text-purple-300 bg-purple-950 px-2.5 py-0.5 rounded border border-purple-500/30">
              COURSE SATISFACTION EVALUATION
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {t('eval.title', 'แบบประเมินความพึงพอใจหลักสูตร (5 ระดับ)', 'Course Satisfaction Evaluation (5-Point Likert Scale)')}
            </h1>
            <p className="text-xs text-slate-400">
              {t('eval.subtitle', 'ความคิดเห็นของท่านมีคุณค่ายิ่งต่อการพัฒนาคุณภาพหลักสูตรและการฝึกอบรมในอนาคต', 'Your valuable feedback helps continuously improve our training quality.')}
            </p>
          </div>
        </div>
      </div>

      {/* Survey Form */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="space-y-6">
          {ratingItems.map((item) => (
            <div key={item.id} className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
              <div className="text-sm font-medium text-slate-200 leading-relaxed">
                {item.title}
              </div>

              {/* 5-scale Likert Radio Buttons */}
              <div className="grid grid-cols-5 gap-2">
                {likertLabels.map((scale) => {
                  const isSelected = item.value === scale.score;
                  return (
                    <button
                      key={scale.score}
                      type="button"
                      onClick={() => {
                        playCyberClick();
                        item.setter(scale.score);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-purple-950/80 border-purple-400 text-purple-200 ring-1 ring-purple-400 shadow-md shadow-purple-500/20'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-0.5">
                        <span className="text-sm font-bold font-mono">{scale.score}</span>
                        <Star className={`w-3 h-3 ${isSelected ? 'fill-purple-400 text-purple-400' : 'text-slate-600'}`} />
                      </div>
                      <span className="text-[10px] hidden sm:inline">
                        {language === 'th' ? scale.labelTh : scale.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Feedback Textarea */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
            <label className="block text-sm font-medium text-slate-200 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              {t('eval.feedbackLabel', 'ข้อเสนอแนะเพิ่มเติมเพื่อการปรับปรุงพัฒนาหลักสูตร (ถ้ามี)', 'Additional Suggestions / Feedback for Course Improvement (Optional)')}
            </label>
            <textarea
              id="eval-feedback-text"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={language === 'th' ? "ระบุข้อคิดเห็นหรือข้อเสนอแนะเพิ่มเติม..." : "Enter your feedback or comments here..."}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none"
            />
          </div>
        </div>

        <button
          id="eval-submit-btn"
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all whitespace-nowrap"
        >
          <Award className="w-5 h-5 shrink-0" />
          <span className="whitespace-nowrap">{t('eval.submitCert', 'บันทึกแบบประเมินและรับใบเกียรติบัตร', 'Submit Evaluation & View Certificate')}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </form>
    </div>
  );
};
