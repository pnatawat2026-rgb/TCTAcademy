import React, { useState } from 'react';
import { 
  RefreshCw, 
  Trash2, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  History, 
  Lock, 
  X, 
  Sparkles,
  ShieldAlert,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { getAllAvailableCourses, resetCourseCohort, getStoredCohortBackups, CohortBackup } from '../utils/courseManager';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

interface CohortResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CohortResetModal: React.FC<CohortResetModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const courses = getAllAvailableCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'risk-management');
  const [cohortName, setCohortName] = useState('');
  const [adminName, setAdminName] = useState('ผู้ดูแลระบบฝ่ายฝึกอบรม (TCT Admin)');
  const [confirmText, setConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [backups, setBackups] = useState<CohortBackup[]>(() => getStoredCohortBackups());

  if (!isOpen) return null;

  const handleDownloadBackup = (backup: CohortBackup) => {
    playCyberClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `TCT_Backup_${backup.courseId}_${backup.cohortName.replace(/\s+/g, '_')}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExecuteReset = () => {
    setError('');
    setSuccessMessage('');

    if (confirmText.trim().toUpperCase() !== 'CONFIRM') {
      setError('กรุณาพิมพ์คำว่า "CONFIRM" เพื่อยืนยันการล้างประวัติรุ่นเดิม');
      return;
    }

    if (!cohortName.trim()) {
      setError('กรุณาระบุชื่อรุ่น/กลุ่มพนักงานใหม่ที่ต้องการเริ่มอบรม');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const res = resetCourseCohort(selectedCourseId, cohortName, adminName);
      setIsProcessing(false);

      if (res.success) {
        playSuccessChime();
        setSuccessMessage(`ล้างประวัติหลักสูตรและสำรองข้อมูลสำหรับ "${cohortName}" สำเร็จเรียบร้อย`);
        setBackups(getStoredCohortBackups());
        setConfirmText('');
        onSuccess();
      } else {
        setError('เกิดข้อผิดพลาดในการล้างประวัติ กรุณาลองใหม่อีกครั้ง');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#090E1A] border-2 border-red-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden my-8">
        
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-950/80 rounded-2xl border border-red-500/40 text-red-400">
              <RefreshCw className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>ล้างประวัติสำหรับอัปเดตเป็นพนักงานรุ่นใหม่</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-500/30">
                  NEW COHORT RESET
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                รีเซ็ตผลคะแนนและการทำข้อสอบแยกรายหลักสูตร พร้อมระบบสำรองข้อมูลอัตโนมัติ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Box */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-amber-300">ข้อควรทราบก่อนดำเนินการ:</strong>
            <p className="text-slate-300 leading-relaxed">
              การล้างประวัติจะทำการรีเซ็ตคะแนน Pre-Test, Post-Test, เวลาดูวิดีโอ และสถานะการเรียนของพนักงานในหลักสูตรที่เลือก เพื่อให้พร้อมสำหรับการฝึกอบรมพนักงานรุ่นใหม่ ระบบจะทำการ <strong>สร้างจุดสำรองข้อมูล (Auto-Backup)</strong> ประวัติรุ่นเดิมเก็บไว้ให้สามารถดาวน์โหลดกลับคืนได้ตลอดเวลา
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/90 border border-red-500/50 rounded-2xl text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Controls */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>เลือกหลักสูตรที่ต้องการรีเซ็ตรุ่น (Select Course)</span>
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-3 text-white text-xs focus:border-cyan-400 focus:outline-none"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                ชื่อรุ่น / กลุ่มพนักงานใหม่ (Cohort Name)
              </label>
              <input
                type="text"
                value={cohortName}
                onChange={(e) => setCohortName(e.target.value)}
                placeholder="เช่น รุ่นที่ 2/2569, พนักงานกะเช้า 2026"
                className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                ชื่อผู้ดูแลระบบที่ดำเนินการ (Admin Name)
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-red-300 font-semibold mb-1 flex items-center justify-between">
              <span>พิมพ์คำว่า "CONFIRM" เพื่อยืนยันความปลอดภัย</span>
              <span className="text-[10px] font-mono text-slate-500">Security Requirement</span>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="พิมพ์ CONFIRM"
              className="w-full bg-[#050A14] border border-red-500/50 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono tracking-widest focus:border-red-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
          >
            ยกเลิก
          </button>
          
          <button
            type="button"
            onClick={handleExecuteReset}
            disabled={isProcessing || confirmText.trim().toUpperCase() !== 'CONFIRM' || !cohortName.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันล้างประวัติ & สำรองข้อมูลรุ่นเดิม'}</span>
          </button>
        </div>

        {/* Previous Cohort Backups Table */}
        {backups.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <History className="w-4 h-4" />
                <span>ประวัติจุดสำรองข้อมูลรุ่นก่อนหน้า (Backup Snapshots)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">{backups.length} รายการ</span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {backups.map((b) => (
                <div 
                  key={b.id}
                  className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="text-white font-medium">{b.cohortName} • <span className="text-cyan-400">{b.courseTitle}</span></div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      รีเซ็ตเมื่อ: {b.clearedAt} โดย {b.clearedBy} ({b.traineeCount} รายชื่อ)
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadBackup(b)}
                    className="p-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-slate-700 hover:border-cyan-500 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>ดาวน์โหลด JSON</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
