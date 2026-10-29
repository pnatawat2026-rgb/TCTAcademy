import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  QrCode, 
  Sparkles, 
  Smartphone, 
  Star, 
  Building2, 
  Award,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { ThaiMOOCLogo } from './ThaiMOOCLogo';

interface EvaluationQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFastTrackLogin?: () => void;
  targetCourseId?: string;
}

export const EvaluationQrModal: React.FC<EvaluationQrModalProps> = ({
  isOpen,
  onClose,
  onOpenFastTrackLogin,
  targetCourseId = 'other'
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  // Construct real URL with ?mode=eval
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const evaluationUrl = `${origin}${pathname}?mode=eval&target=${targetCourseId}`;

  // Generate QR Code dynamically
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    QRCode.toDataURL(evaluationUrl, {
      width: 500,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#002855',
        light: '#ffffff'
      }
    })
      .then(url => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch(err => {
        console.error('Failed to generate evaluation QR', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, evaluationUrl]);

  const handleCopyLink = async () => {
    playCyberClick();
    try {
      await navigator.clipboard.writeText(evaluationUrl);
      setIsCopied(true);
      playSuccessChime();
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      // Fallback
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handlePrint = () => {
    playCyberClick();
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sarabun text-slate-800 animate-fadeIn">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#001f3f] via-[#003875] to-[#005a9c] text-white p-5 sm:p-6 relative no-print">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Star className="w-3 h-3 fill-slate-950" />
              <span>EVALUATION FAST-TRACK • ISO 9001 / IATF 16949</span>
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white tracking-normal leading-snug">
            คิวอาร์โค้ดสแกนเข้าประเมินผลการฝึกอบรม (Kirkpatrick Model)
          </h2>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed">
            สำหรับหลักสูตรในระบบ และหลักสูตรอื่นๆ ที่พนักงานไปอบรมนอกสถานที่ — พนักงานสแกนด้วยมือถือแล้วใส่รหัสพนักงาน จะเด้งเข้าสู่หน้าประเมินผลทันที
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Printable A4 Card Area */}
          <div id="printable-qr-sign" className="bg-gradient-to-b from-slate-50 to-blue-50/30 p-5 sm:p-6 rounded-2xl border-2 border-[#005A9C]/30 text-center space-y-4">
            
            {/* Sign Header */}
            <div className="flex items-center justify-center gap-3 border-b border-slate-200 pb-3">
              <ThaiMOOCLogo size="sm" showSubtitle={false} theme="light" />
              <div className="text-left">
                <div className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                  ศูนย์ฝึกอบรมและพัฒนา TCT Academy
                </div>
                <div className="text-[10px] text-slate-500">
                  แผนกบุคคลและธุรการ • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
                </div>
              </div>
            </div>

            {/* Title on the Sign */}
            <div className="space-y-1">
              <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-normal leading-snug">
                สแกนเพื่อประเมินความพึงพอใจและประสิทธิผลหลังการฝึกอบรม
              </h3>
              <p className="text-xs text-slate-600">
                (Kirkpatrick 4 Levels Evaluation System • Reaction, Learning, Behavior, Results)
              </p>
            </div>

            {/* QR Code Frame */}
            <div className="relative inline-block p-4 bg-white rounded-3xl shadow-lg border-2 border-[#005A9C] mx-auto">
              {isGenerating ? (
                <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <div className="w-8 h-8 border-3 border-[#005A9C] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">กำลังสร้างคิวอาร์โค้ด...</span>
                </div>
              ) : (
                <img
                  src={qrDataUrl}
                  alt="Evaluation QR Code"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
                />
              )}

              <div className="mt-2 text-[11px] font-bold text-[#005A9C] font-mono">
                TEIJIN CORD (THAILAND) • HRD EVALUATION
              </div>
            </div>

            {/* 2-Step Clear Guidance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-[#005A9C] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>สแกนด้วยกล้องมือถือ</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                  เปิดกล้องโทรศัพท์มือถือ หรือแอป LINE แล้วสแกนคิวอาร์โค้ดนี้
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">2</span>
                  <span>ใส่รหัสพนักงาน</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                  เพียงกรอกรหัส 5 หลัก ระบบจะเด้งเข้าสู่หน้าประเมินผลทันที
                </p>
              </div>
            </div>

            {/* Note about external courses */}
            <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-slate-800 text-xs text-left flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>รองรับทุกหลักสูตร:</strong> ใช้ได้ทั้งหลักสูตรในระบบ e-Learning และ <strong>หลักสูตรอื่นๆ ที่พนักงานไปอบรมภายนอก</strong> (เช่น อบรมขับฟอร์คลิฟท์, ปั้นจั่นเครน, สารเคมี, จป., สัมมนาภายนอก)
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="space-y-2 no-print">
            {/* Copy Link Field */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={evaluationUrl}
                className="flex-1 bg-transparent px-2.5 py-1 text-xs text-slate-600 font-mono truncate focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-[#005A9C] hover:bg-[#00487D] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอกลิงก์</span>
                  </>
                )}
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>พิมพ์ใบประกาศ QR Code (Print A4)</span>
              </button>

              {onOpenFastTrackLogin && (
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    onClose();
                    onOpenFastTrackLogin();
                  }}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Smartphone className="w-4 h-4 fill-slate-950" />
                  <span>ทดลองใส่รหัสเข้าประเมินทันที</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
