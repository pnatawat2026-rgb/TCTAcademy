import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Printer, 
  QrCode, 
  Sparkles, 
  Smartphone, 
  BookOpen, 
  CheckCircle2, 
  ChevronDown,
  Layers,
  Award,
  Image as ImageIcon
} from 'lucide-react';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { getAllAvailableCourses, getCourseById } from '../utils/courseManager';
import { COURSE_OFFICIAL_METADATA } from '../utils/courseTraineeHelper';
import { Course } from '../types';

interface CourseShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
  onSelectCourseToNavigate?: (courseId: string) => void;
}

export const CourseShareModal: React.FC<CourseShareModalProps> = ({
  isOpen,
  onClose,
  courseId = 'risk-management',
  onSelectCourseToNavigate
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);

  const availableCourses = getAllAvailableCourses();
  const currentCourse: Course | undefined = getCourseById(selectedCourseId) || availableCourses[0];
  const meta = COURSE_OFFICIAL_METADATA[selectedCourseId];

  // Update selected course when prop changes
  useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
    }
  }, [courseId, isOpen]);

  // Construct absolute URL for external sharing
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const shareUrl = `${origin}${pathname}?course=${selectedCourseId}`;

  // Generate QR Code dynamically in real time
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    QRCode.toDataURL(shareUrl, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#050c18',
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
        console.error('Failed to generate QR code', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [shareUrl, isOpen, selectedCourseId]);

  if (!isOpen) return null;

  // Safe Copy Helper with multi-layer fallback (handles iframe permissions policy and insecure contexts)
  const copyToClipboardSafely = async (text: string): Promise<boolean> => {
    // 1. Try modern navigator.clipboard
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        console.warn('navigator.clipboard blocked or failed, using fallback', e);
      }
    }

    // 2. Fallback: temporary textarea + execCommand('copy')
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, 99999);
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch (e) {
      console.error('Fallback execCommand failed', e);
      return false;
    }
  };

  const handleCopyLink = async () => {
    try {
      playCyberClick();
      const success = await copyToClipboardSafely(shareUrl);
      if (success) {
        setIsCopied(true);
        playSuccessChime();
        setShareSuccessMessage('✓ คัดลอกลิงก์สำเร็จแล้ว! สามารถนำไปวางส่งให้พนักงานใน LINE หรือแชทได้ทันที');
        setTimeout(() => {
          setIsCopied(false);
          setShareSuccessMessage(null);
        }, 4000);
      } else {
        setIsCopied(true);
        setShareSuccessMessage('กรุณากดคลิกที่ช่องลิงก์ด้านล่าง แล้วกด Ctrl+C เพื่อคัดลอก');
        setTimeout(() => {
          setIsCopied(false);
          setShareSuccessMessage(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    playCyberClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TCT e-Learning: ${currentCourse?.title || 'หลักสูตรอบรม'}`,
          text: `ขอเชิญเข้าอบรมหลักสูตร "${currentCourse?.title}" (${currentCourse?.code || meta?.code || currentCourse?.id}) บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด คลิกเพื่อเข้าเรียนทันที:`,
          url: shareUrl
        });
        setShareSuccessMessage('✓ เปิดหน้าจอแชร์เรียบร้อยแล้ว!');
        setTimeout(() => setShareSuccessMessage(null), 3000);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return;
        }
        console.warn('Native share blocked or unavailable in this environment, falling back to copy', err);
      }
    }
    
    // Automatic seamless fallback to copying link
    await handleCopyLink();
  };

  const handleDownloadQr = () => {
    playCyberClick();
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `TCT-Course-QR-${currentCourse?.code || meta?.code || selectedCourseId}.png`;
    link.href = qrDataUrl;
    link.click();
    playSuccessChime();
    setShareSuccessMessage('ดาวน์โหลด QR Code สำเร็จแล้ว!');
    setTimeout(() => setShareSuccessMessage(null), 3000);
  };

  // Generate and download full graphic poster image in PNG format
  const handleDownloadPosterImage = async () => {
    playCyberClick();
    if (!qrDataUrl) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 800;
      const height = 1120;
      canvas.width = width;
      canvas.height = height;

      // Draw background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#040d21');
      bgGrad.addColorStop(0.4, '#0a192f');
      bgGrad.addColorStop(1, '#020914');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Outer border frame
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Inner subtle border
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(28, 28, width - 56, height - 56);

      // Header company
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Sarabun", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด (TEIJIN CORD THAILAND CO., LTD.)', width / 2, 62);

      // System badge pill
      ctx.fillStyle = '#0284c7';
      const badgeText = `TCT E-LEARNING 4.0 • รหัส: ${currentCourse?.code || meta?.code || selectedCourseId}`;
      ctx.beginPath();
      const badgeW = 380;
      const badgeH = 34;
      const badgeX = (width - badgeW) / 2;
      const badgeY = 78;
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 17);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Sarabun", sans-serif';
      ctx.fillText(badgeText, width / 2, 100);

      // Course Title
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Sarabun", sans-serif';
      const title = currentCourse?.title || 'หลักสูตรการฝึกอบรม';
      ctx.fillText(title, width / 2, 148);

      // Thai Title / Subtitle
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '15px -apple-system, BlinkMacSystemFont, "Sarabun", sans-serif';
      const subtitle = currentCourse?.thaiTitle || currentCourse?.description || '';
      
      const maxTextWidth = 700;
      const words = subtitle.split(' ');
      let line = '';
      let currentY = 180;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && n > 0) {
          ctx.fillText(line, width / 2, currentY);
          line = words[n] + ' ';
          currentY += 22;
          if (currentY > 205) break;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, width / 2, currentY);

      // QR Code Box (white card)
      const qrBoxSize = 330;
      const qrBoxX = (width - qrBoxSize) / 2;
      const qrBoxY = 240;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw QR image onto canvas
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        qrImg.onload = () => {
          ctx.drawImage(qrImg, qrBoxX + 20, qrBoxY + 20, qrBoxSize - 40, qrBoxSize - 40);
          resolve();
        };
        qrImg.src = qrDataUrl;
      });

      // QR Prompt text below QR box
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 19px -apple-system, BlinkMacSystemFont, "Sarabun", sans-serif';
      ctx.fillText('📱 สแกนด้วยกล้องมือถือ เพื่อเข้าเรียนทันที', width / 2, qrBoxY + qrBoxSize + 36);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px -apple-system, BlinkMacSystemFont, "Sarabun", sans-serif';
      ctx.fillText('เชื่อมโยงเข้าสู่หลักสูตรโดยตรง • บันทึกผลและออกเกียรติบัตรแบบเรียลไทม์', width / 2, qrBoxY + qrBoxSize + 60);

      // Metadata Table Card
      const tableBoxY = 670;
      const tableBoxH = 265;
      const tableBoxW = 720;
      const tableBoxX = (width - tableBoxW) / 2;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(tableBoxX, tableBoxY, tableBoxW, tableBoxH, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Info rows
      const infoItems = [
        { label: 'รหัสหลักสูตร:', val: currentCourse?.code || meta?.code || selectedCourseId, color: '#38bdf8' },
        { label: 'จำนวนบทเรียน:', val: `${currentCourse?.moduleCount || 4} บทเรียน (โมดูล) พร้อมแบบทดสอบและใบประกาศ`, color: '#facc15' },
        { label: 'ระยะเวลาอบรม:', val: `${currentCourse?.duration || `${currentCourse?.estimatedHours || 1} ชม.`} (Micro-Learning บันทึกผลอัตโนมัติ)`, color: '#a78bfa' },
        { label: 'เกณฑ์การสอบผ่าน:', val: currentCourse?.passingCriteria || '≥ 80% (8/10 ข้อ)', color: '#4ade80' },
        { label: 'กลุ่มเป้าหมาย:', val: 'พนักงานและบุคลากร TCT ทุกท่าน', color: '#cbd5e1' },
      ];

      let rowY = tableBoxY + 38;
      infoItems.forEach((item) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Sarabun", sans-serif';
        ctx.fillText(item.label, tableBoxX + 24, rowY);

        ctx.fillStyle = item.color;
        ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Sarabun", sans-serif';
        ctx.fillText(item.val, tableBoxX + 175, rowY);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(tableBoxX + 24, rowY + 12);
        ctx.lineTo(tableBoxX + tableBoxW - 24, rowY + 12);
        ctx.stroke();

        rowY += 44;
      });

      // Direct Link bar
      const linkBarY = 960;
      ctx.fillStyle = 'rgba(3, 105, 161, 0.25)';
      ctx.beginPath();
      ctx.roundRect(tableBoxX, linkBarY, tableBoxW, 44, 10);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#7dd3fc';
      ctx.font = '13px monospace';
      ctx.fillText(shareUrl, width / 2, linkBarY + 27);

      // Footer
      ctx.fillStyle = '#64748b';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Sarabun", sans-serif';
      const printDate = new Date().toLocaleString('th-TH');
      ctx.fillText(`อัปเดตข้อมูลแบบเรียลไทม์: ${printDate} • ฝ่ายบริหารทรัพยากรมนุษย์และฝึกอบรม (HRD-TCT)`, width / 2, 1060);

      // Export canvas to download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `TCT-Course-Flyer-${currentCourse?.code || meta?.code || selectedCourseId}.png`;
      link.href = dataUrl;
      link.click();
      playSuccessChime();
      setShareSuccessMessage('ดาวน์โหลดภาพโปสเตอร์ประชาสัมพันธ์ (PNG) สำเร็จแล้ว!');
      setTimeout(() => setShareSuccessMessage(null), 3500);
    } catch (e) {
      console.error('Error creating poster image:', e);
    }
  };

  const handlePrintFlyer = () => {
    playCyberClick();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TCT Training Course QR Flyer - ${currentCourse?.code || meta?.code || selectedCourseId}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, sans-serif; color: #0f172a; margin: 0; padding: 20px; }
          .flyer-box { border: 4px solid #0284c7; border-radius: 20px; padding: 30px; text-align: center; max-width: 680px; margin: 0 auto; box-sizing: border-box; }
          .header-badge { display: inline-block; background: #0369a1; color: white; padding: 6px 18px; border-radius: 999px; font-weight: bold; font-size: 14px; letter-spacing: 1px; margin-bottom: 12px; }
          .company-name { font-size: 15px; color: #475569; font-weight: 600; margin-bottom: 6px; }
          .course-title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 8px 0; line-height: 1.3; }
          .course-desc { font-size: 14px; color: #334155; margin-bottom: 24px; line-height: 1.5; }
          .qr-container { background: white; border: 2px solid #e2e8f0; border-radius: 16px; padding: 20px; display: inline-block; margin: 10px 0 20px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
          .qr-img { width: 260px; height: 260px; display: block; }
          .scan-prompt { font-size: 18px; font-weight: 700; color: #0284c7; margin-top: 10px; }
          .scan-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
          .info-table { margin: 24px auto 16px auto; width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
          .info-table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
          .info-table td:first-child { font-weight: bold; color: #475569; width: 35%; }
          .url-box { background: #f1f5f9; padding: 8px 12px; border-radius: 8px; font-family: monospace; font-size: 11px; word-break: break-all; color: #0369a1; margin-top: 15px; }
          .footer { font-size: 11px; color: #94a3b8; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="flyer-box">
          <div class="company-name">บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด (Teijin Cord Thailand Co., Ltd.)</div>
          <div class="header-badge">TCT E-LEARNING 4.0 • รหัส: ${currentCourse?.code || meta?.code || selectedCourseId}</div>
          <h1 class="course-title">${currentCourse?.title}</h1>
          <p class="course-desc">${currentCourse?.thaiTitle || currentCourse?.description || 'หลักสูตรการเรียนรู้ออนไลน์พร้อมแบบทดสอบและใบประกาศนียบัตร'}</p>
          
          <div class="qr-container">
            <img src="${qrDataUrl}" alt="Course QR" class="qr-img" />
            <div class="scan-prompt">📱 สแกนด้วยกล้องมือถือ เพื่อเข้าเรียนทันที</div>
            <div class="scan-sub">รองรับสมาร์ตโฟน แท็บเล็ต และคอมพิวเตอร์ทุกระบบ</div>
          </div>

          <table class="info-table">
            <tr>
              <td>รหัสหลักสูตร:</td>
              <td><strong>${currentCourse?.code || meta?.code || selectedCourseId}</strong></td>
            </tr>
            <tr>
              <td>จำนวนบทเรียน:</td>
              <td><strong>${currentCourse?.moduleCount || 4} บทเรียน (โมดูล) พร้อมแบบทดสอบและใบประกาศ</strong></td>
            </tr>
            <tr>
              <td>ระยะเวลาอบรม:</td>
              <td>${currentCourse?.duration || `${currentCourse?.estimatedHours || 1} ชั่วโมง`} (Micro-Learning บันทึกผลอัตโนมัติ)</td>
            </tr>
            <tr>
              <td>เกณฑ์การผ่านหลักสูตร:</td>
              <td>${currentCourse?.passingCriteria || 'ผ่าน Pre-test, เรียนครบทุกบทเรียน, และทำ Post-test ได้ตั้งแต่ 8/10 ข้อขึ้นไป'}</td>
            </tr>
            <tr>
              <td>กลุ่มเป้าหมาย:</td>
              <td>พนักงานและบุคลากรบริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด ทุกท่าน</td>
            </tr>
            <tr>
              <td>ลิงก์เข้าอบรมโดยตรง:</td>
              <td><div class="url-box">${shareUrl}</div></td>
            </tr>
          </table>

          <div class="footer">
            พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')} • ฝ่ายบริหารทรัพยากรมนุษย์และฝึกอบรม (HRD-TCT)
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn no-print overflow-y-auto font-sarabun">
      <div className="relative w-full max-w-2xl bg-[#090E1A] border-2 border-cyan-500/50 rounded-3xl shadow-2xl shadow-cyan-950/80 flex flex-col overflow-hidden animate-scaleUp max-h-[92vh]">
        
        {/* Header with Course Selector */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/10">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 font-bold">
                  LIVE REAL-TIME QR & LINK
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  ● อัปเดตแบบเรียลไทม์
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                แชร์หลักสูตรและคิวอาร์โค้ด (Share Course)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { playCyberClick(); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          
          {/* Course Switcher Selector in Real Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>เลือกหลักสูตรที่ต้องการแชร์ (สลับได้ทันทีแบบเรียลไทม์):</span>
            </label>
            <div className="relative">
              <select
                id="select-share-target-course"
                value={selectedCourseId}
                onChange={(e) => {
                  playCyberClick();
                  setSelectedCourseId(e.target.value);
                  try {
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('course', e.target.value);
                    window.history.replaceState(null, '', newUrl.toString());
                  } catch {}
                }}
                className="w-full bg-[#050B14] border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-cyan-200 font-semibold focus:outline-none focus:border-cyan-400 pr-10 cursor-pointer shadow-inner appearance-none"
              >
                {availableCourses.map((c, i) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    วิชาที่ {i + 1}: {c.title} ({c.code || c.id})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* QR Code & Course Card Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center bg-[#070D18] p-4 sm:p-5 rounded-2xl border border-slate-800">
            
            {/* Left: High-Definition QR Code Card */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xl shadow-cyan-950/50 border-4 border-cyan-500/40 text-center relative group">
              {isGenerating ? (
                <div className="w-52 h-52 flex flex-col items-center justify-center text-slate-700">
                  <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-xs font-mono">กำลังสร้าง QR Code...</span>
                </div>
              ) : qrDataUrl ? (
                <>
                  <div className="w-full bg-slate-900 text-cyan-300 font-mono text-[10px] font-bold py-1 px-2 rounded-md mb-2 flex items-center justify-between">
                    <span>{currentCourse?.code || meta?.code || selectedCourseId}</span>
                    <span className="text-emerald-400">● LIVE READY</span>
                  </div>
                  <img 
                    src={qrDataUrl} 
                    alt={`QR Code for ${currentCourse?.title}`} 
                    className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                  />
                  <div className="mt-2 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-600" />
                    <span>สแกนด้วยกล้องมือถือ เพื่อเข้าเรียน</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono truncate max-w-[200px] mt-0.5">
                    {currentCourse?.title}
                  </div>
                </>
              ) : (
                <div className="text-rose-500 text-xs">ไม่สามารถสร้าง QR Code ได้</div>
              )}
            </div>

            {/* Right: Course Details & Highlights (100% Dynamic & Real-time) */}
            <div className="space-y-3 text-slate-300">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-bold">
                    {currentCourse?.code || meta?.code || selectedCourseId}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    อัปเดตเรียลไทม์
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                  {currentCourse?.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {currentCourse?.thaiTitle || currentCourse?.description}
                </p>
              </div>

              <div className="space-y-1.5 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800 font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>จำนวนบทเรียน:</span>
                  <strong className="text-amber-300">{currentCourse?.moduleCount || 4} บทเรียน (โมดูล)</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>ระยะเวลาเนื้อหา:</span>
                  <strong className="text-cyan-300">{currentCourse?.duration || `${currentCourse?.estimatedHours || 1} ชม.`}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>เกณฑ์สอบผ่าน:</span>
                  <strong className="text-emerald-300">{currentCourse?.passingCriteria || '≥ 80% (8/10 ข้อ)'}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>กลุ่มเป้าหมาย:</span>
                  <strong className="text-purple-300">พนักงาน TCT ทุกท่าน</strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-start gap-1.5 bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-500/20">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  เมื่อพนักงานสแกน QR Code หรือคลิกลิงก์ ระบบจะเปิดเข้าสู่หน้าหลักสูตรนี้โดยอัตโนมัติ ไม่ต้องค้นหาเอง
                </span>
              </div>
            </div>
          </div>

          {/* Real-time status notification banner */}
          {shareSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 text-xs font-bold flex items-center gap-2.5 animate-fadeIn shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
              <span>{shareSuccessMessage}</span>
            </div>
          )}

          {/* Shareable Link Input Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>ลิงก์ตรงสำหรับส่งต่อ (Direct Access URL):</span>
              </label>
              {isCopied && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-fadeIn">
                  <Check className="w-3.5 h-3.5" /> คัดลอกสำเร็จแล้ว!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="input-course-share-url"
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-[#050B14] border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                id="btn-copy-course-share-link"
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md ${
                  isCopied
                    ? 'bg-emerald-600 text-white border border-emerald-400'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-300 font-extrabold'
                }`}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
            
            {/* 1. Share via App / Native */}
            <button
              id="btn-modal-native-share"
              type="button"
              onClick={handleNativeShare}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all cursor-pointer border border-emerald-400/40"
              title="แชร์ลิงก์หรือคัดลอกส่งต่อในอุปกรณ์"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>แชร์ลิงก์</span>
            </button>

            {/* 2. Direct LINE Share */}
            <a
              id="link-modal-line-share"
              href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                playCyberClick();
                setShareSuccessMessage('เปิดส่งต่อผ่านแอปพลิเคชัน LINE เรียบร้อยแล้ว');
              }}
              className="p-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all cursor-pointer border border-emerald-300/40 text-center no-underline"
              title="แชร์เข้าห้องแชท LINE หรือ LINE Group บริษัททันที"
            >
              <span className="font-black text-[13px] leading-none">LINE</span>
              <span>แชร์ LINE</span>
            </a>

            {/* 3. Download Graphic Poster Image (PNG) */}
            <button
              id="btn-modal-download-poster"
              type="button"
              onClick={handleDownloadPosterImage}
              disabled={!qrDataUrl}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer border border-cyan-400/40"
              title="บันทึกภาพโปสเตอร์ประชาสัมพันธ์ (PNG) พร้อมรายละเอียดครบถ้วนเพื่อส่งใน LINE/บอร์ด"
            >
              <ImageIcon className="w-3.5 h-3.5 text-white" />
              <span>โหลดภาพโปสเตอร์</span>
            </button>

            {/* 4. Download QR Image */}
            <button
              id="btn-modal-download-qr"
              type="button"
              onClick={handleDownloadQr}
              disabled={!qrDataUrl}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer"
              title="บันทึกเฉพาะรูปภาพ QR Code เป็นไฟล์ PNG"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>ดาวน์โหลด QR</span>
            </button>

            {/* 5. Print Poster Flyer */}
            <button
              id="btn-modal-print-flyer"
              type="button"
              onClick={handlePrintFlyer}
              className="p-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-500/40 transition-all cursor-pointer"
              title="พิมพ์ใบประกาศขนาด A4 พร้อม QR Code เพื่อติดบอร์ดประชาสัมพันธ์"
            >
              <Printer className="w-3.5 h-3.5 text-purple-400" />
              <span>พิมพ์ใบปิด A4</span>
            </button>

            {/* 6. Open in New Tab / Navigate directly */}
            <button
              id="btn-modal-open-course"
              type="button"
              onClick={() => {
                playCyberClick();
                if (onSelectCourseToNavigate) {
                  onSelectCourseToNavigate(selectedCourseId);
                  onClose();
                } else {
                  window.open(shareUrl, '_blank');
                }
              }}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer col-span-2 sm:col-span-1"
              title="เปิดหน้าหลักสูตรนี้ทันที"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>เปิดหลักสูตร</span>
            </button>
          </div>

          {shareSuccessMessage && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-center text-xs text-emerald-300 font-bold animate-fadeIn">
              {shareSuccessMessage}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-slate-500 text-[11px]">
          <span>บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • ระบบ e-Learning 4.0</span>
          <button
            type="button"
            onClick={() => { playCyberClick(); onClose(); }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold cursor-pointer"
          >
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
};
