import React, { useState } from 'react';
import { 
  KeyRound, 
  User, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { authenticateEmployee, EmployeeRecord } from '../firebase';
import { playCyberClick, playSuccessChime, playErrorBuzz } from '../utils/soundEffects';

interface CleanStrictLoginViewProps {
  onLoginSuccess: (employee: EmployeeRecord) => void;
  onOpenAdminPortal?: () => void;
}

export const CleanStrictLoginView: React.FC<CleanStrictLoginViewProps> = ({
  onLoginSuccess,
  onOpenAdminPortal
}) => {
  const [empId, setEmpId] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = empId.trim().toUpperCase();
    const cleanPin = pin.trim();

    if (!cleanId) {
      setError('กรุณากรอกรหัสพนักงาน (Employee ID)');
      playErrorBuzz();
      return;
    }

    if (!cleanPin) {
      setError('กรุณากรอกรหัส PIN 4 หลัก');
      playErrorBuzz();
      return;
    }

    setIsLoading(true);
    playCyberClick();

    try {
      const employee = await authenticateEmployee(cleanId, cleanPin);
      if (employee) {
        playSuccessChime();
        onLoginSuccess(employee);
      } else {
        setError('รหัสพนักงานหรือ PIN ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
        playErrorBuzz();
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่อีกครั้ง');
      playErrorBuzz();
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (testEmpId: string, testPin: string) => {
    playCyberClick();
    setEmpId(testEmpId);
    setPin(testPin);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col justify-center items-center px-4 py-8">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-xl shadow-blue-500/25 border border-white/20 mb-2">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
              TCT Academy E-Training
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ระบบฝึกอบรมบุคลากร
          </h1>
          <p className="text-sm text-slate-300">
            บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/70 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-700/60 text-slate-300 text-xs sm:text-sm font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>เข้าสู่ระบบด้วยรหัสพนักงานจริง (ระบบยืนยันตัวตนอัตโนมัติ)</span>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs sm:text-sm animate-shake">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee ID Input */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                รหัสพนักงาน (Employee ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value.toUpperCase())}
                  placeholder="เช่น EMP001 หรือ 25056"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all"
                  autoComplete="username"
                  autoCapitalize="characters"
                />
              </div>
            </div>

            {/* PIN Input */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                รหัส PIN (4 หลัก)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="กรอกรหัส PIN"
                  maxLength={10}
                  className="w-full pl-11 pr-11 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base tracking-widest transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-base"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>เข้าสู่ระบบฝึกอบรม</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Quick-fill testing buttons */}
          <div className="pt-4 border-t border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>ทดสอบรวดเร็ว (1-Click Fill):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN01', '1234')}
                className="py-2 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 text-left text-xs text-blue-300 font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                <span className="truncate">แอดมิน (ADMIN01 / 1234)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('EMP001', '1111')}
                className="py-2 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 text-left text-xs text-emerald-300 font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate">พนักงาน (EMP001 / 1111)</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center pt-1">
              *พนักงานจริง 224 ท่านสามารถเข้าใช้งานด้วยรหัสพนักงานตนเอง (PIN เริ่มต้น: รหัสพนักงาน หรือ 1234)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400">
          ศูนย์ฝึกอบรมและพัฒนา TCT Academy • แผนกบุคคลและธุรการ
        </div>
      </div>
    </div>
  );
};
