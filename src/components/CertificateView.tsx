import React, { useEffect, useRef, useState, useMemo } from 'react';
import { UserProfile, ViewState } from '../types';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import { calculateLearningMetrics } from '../utils/scoreMetrics';
import { downloadElementAsPdf, downloadMultiPagePdf, printElementViaStandaloneWindow } from '../utils/pdfExport';
import { 
  Award, 
  Printer, 
  Download, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  Shield, 
  QrCode, 
  Calendar, 
  Building, 
  User, 
  BookOpen,
  Gamepad2,
  BarChart3, 
  Image as ImageIcon,
  CheckCircle, 
  FileText, 
  Lock, 
  Compass, 
  Languages, 
  Check,
  Maximize2,
  RotateCw,
  FileSpreadsheet,
  FileDown,
  ExternalLink,
  RotateCcw,
  Edit3,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { playFanfare, playCyberClick, playSuccessChime } from '../utils/soundEffects';
import { ASSETS } from '../assets';
import { TCTLogo } from './TCTLogo';
import { formatDepartmentFull } from '../data/courseData';
import { getAllAvailableCourses, getCourseModules } from '../utils/courseManager';

interface CertificateViewProps {
  user: UserProfile;
  isAdminLoggedIn?: boolean;
  onNavigate: (view: ViewState) => void;
  onResetProgress?: () => void;
  onOpenEditProfile?: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  user,
  isAdminLoggedIn = false,
  onNavigate,
  onResetProgress,
  onOpenEditProfile
}) => {
  const allAvailableCourses = useMemo(() => getAllAvailableCourses(), []);
  const [activeCourseId, setActiveCourseId] = useState<string>(
    user.selectedCourseId || (allAvailableCourses[0]?.id ?? 'risk-management')
  );
  const certificateRef = useRef<HTMLDivElement>(null);
  const frontPageRef = useRef<HTMLDivElement>(null);
  const backPageRef = useRef<HTMLDivElement>(null);
  const [certPage, setCertPage] = useState<'all' | 'front' | 'back'>('all');
  const [certLanguage, setCertLanguage] = useState<'th' | 'en'>('th');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | 'a4'>('a4');
  const [templateTheme, setTemplateTheme] = useState<'tct-official' | 'classic'>('tct-official');
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [adminBypass, setAdminBypass] = useState(false);

  const currentCourse = allAvailableCourses.find(c => c.id === activeCourseId) || allAvailableCourses[0] || {
    id: activeCourseId,
    title: 'หลักสูตรการฝึกอบรม',
    titleEn: 'TCT Training Curriculum',
    code: 'TCT-TRN'
  };
  const currentCourseId = currentCourse.id;

  // Resolve per-course progress
  const courseProgress = user.coursesProgress?.[currentCourseId];
  const rawPreScore = courseProgress ? (courseProgress.preTestScore ?? user.preTestScore) : user.preTestScore;
  const rawPostScore = courseProgress ? (courseProgress.postTestScore ?? user.postTestScore) : user.postTestScore;

  const passingScore = currentCourseId === 'personality-psychology' ? 15 : 8;
  const totalScore = currentCourseId === 'personality-psychology' ? 20 : 10;
  const hasPostTest = rawPostScore !== null && rawPostScore !== undefined;
  const isPassed = hasPostTest && rawPostScore >= passingScore;
  const canShowCertificate = isPassed || (Boolean(isAdminLoggedIn) && adminBypass);

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomBgImage(event.target.result as string);
          setTemplateTheme('tct-official');
          setOrientation('landscape');
          playSuccessChime();
          setDownloadMessage('นำเข้าไฟล์แม่แบบเกียรติบัตรสำเร็จ! ข้อมูลถูกจัดวางลงตำแหน่งโดยไม่ทับซ้อน');
          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 4000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetTemplate = () => {
    playCyberClick();
    setCustomBgImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger fanfare and confetti only when certificate is legitimately passed or permitted
  useEffect(() => {
    if (!canShowCertificate) return;
    playFanfare();

    try {
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#D97706', '#0284C7', '#059669', '#7C3AED', '#DC2626'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch (e) {
      console.debug('Confetti error', e);
    }
  }, [canShowCertificate]);

  const handlePrint = () => {
    playCyberClick();
    if (!canShowCertificate) {
      setDownloadMessage('❌ ระบบไม่อนุญาตให้ออกหรือพิมพ์ใบประกาศนียบัตร: พนักงานยังไม่ผ่านเกณฑ์การประเมิน Post-Test');
      setDownloadSuccess(false);
      return;
    }
    const title = `TCT_Certificate_${orientation}_${certLanguage.toUpperCase()}_${user.empId || 'EMP'}`;

    if (certPage === 'all') {
      const pages: HTMLElement[] = [];
      if (frontPageRef.current) pages.push(frontPageRef.current);
      if (backPageRef.current) pages.push(backPageRef.current);

      if (pages.length > 0) {
        const wrapper = document.createElement('div');
        wrapper.id = 'certificate-print-area';
        pages.forEach((p) => {
          const clone = p.cloneNode(true) as HTMLElement;
          clone.style.display = 'flex';
          wrapper.appendChild(clone);
        });
        printElementViaStandaloneWindow(wrapper, title, orientation);
        return;
      }
    } else if (certPage === 'front' && frontPageRef.current) {
      printElementViaStandaloneWindow(frontPageRef.current, title, orientation);
      return;
    } else if (certPage === 'back' && backPageRef.current) {
      printElementViaStandaloneWindow(backPageRef.current, title, orientation);
      return;
    }

    if (certificateRef.current) {
      printElementViaStandaloneWindow(certificateRef.current, title, orientation);
    } else {
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    playCyberClick();
    if (!canShowCertificate) {
      setDownloadMessage('❌ ระบบไม่อนุญาตให้ออกหรือดาวน์โหลดใบประกาศนียบัตร: พนักงานยังไม่ผ่านเกณฑ์การประเมิน Post-Test');
      setDownloadSuccess(false);
      return;
    }
    setIsPdfGenerating(true);
    setDownloadSuccess(false);

    try {
      const langSuffix = certLanguage === 'th' ? 'TH' : 'EN';
      const orientSuffix = orientation === 'portrait' ? 'Portrait_210x297mm' : 'Landscape_297x210mm';

      if (certPage === 'all') {
        const pages: HTMLElement[] = [];
        if (frontPageRef.current) pages.push(frontPageRef.current);
        if (backPageRef.current) pages.push(backPageRef.current);

        if (pages.length > 0) {
          const filename = `TCT_E-Training_Certificate_2Pages_A4_${orientSuffix}_${langSuffix}_${user.empId || 'Employee'}.pdf`;
          const success = await downloadMultiPagePdf(pages, {
            filename,
            orientation,
            format: 'a4',
            scale: 2.5
          });

          if (success) {
            playSuccessChime();
            setDownloadMessage(`บันทึกและดาวน์โหลดไฟล์ PDF ครบ 2 หน้า (หน้า-หลัง) ขนาด A4 เรียบร้อยแล้ว!`);
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 5000);
            return;
          }
        }
      } else {
        const targetEl = certPage === 'front' ? frontPageRef.current : backPageRef.current;
        if (targetEl) {
          const sideSuffix = certPage === 'front' ? 'Page1_Front' : 'Page2_Back';
          const filename = `TCT_E-Training_Certificate_${sideSuffix}_A4_${orientSuffix}_${langSuffix}_${user.empId || 'Employee'}.pdf`;
          const success = await downloadElementAsPdf(targetEl, {
            filename,
            orientation,
            format: 'a4',
            scale: 2.5
          });

          if (success) {
            playSuccessChime();
            setDownloadMessage(`บันทึกและดาวน์โหลดไฟล์ PDF ขนาด A4 (${certPage === 'front' ? 'หน้า 1 ด้านหน้า' : 'หน้า 2 ด้านหลัง'}) เรียบร้อยแล้ว!`);
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 5000);
            return;
          }
        }
      }

      if (certificateRef.current) {
        const filename = `TCT_E-Training_Certificate_A4_${orientSuffix}_${langSuffix}_${user.empId || 'Employee'}_${user.department || 'TCT'}.pdf`;
        await downloadElementAsPdf(certificateRef.current, {
          filename,
          orientation,
          format: 'a4',
          scale: 2.5
        });
      } else {
        handlePrint();
      }
    } catch (err) {
      console.error('PDF download error:', err);
      handlePrint();
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!canShowCertificate) {
      playCyberClick();
      setDownloadMessage('❌ ระบบไม่อนุญาตให้ออกหรือดาวน์โหลดใบประกาศนียบัตร: พนักงานยังไม่ผ่านเกณฑ์การประเมิน Post-Test');
      setDownloadSuccess(false);
      return;
    }

    const targetElement = (certPage === 'back' && backPageRef.current) 
      ? backPageRef.current 
      : (frontPageRef.current || certificateRef.current);
    if (!targetElement) return;

    playCyberClick();
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const dataUrl = await toPng(targetElement, {
        pixelRatio: 2.5, // Ultra-high resolution crisp output
        backgroundColor: '#FFFDF9',
        cacheBust: true,
        fontEmbedCSS: '',
        skipFonts: true,
      });

      const link = document.createElement('a');
      const langSuffix = certLanguage === 'th' ? 'TH' : 'EN';
      const orientSuffix = orientation === 'portrait' ? 'Portrait_210x297mm' : 'Landscape_297x210mm';
      const sideSuffix = certPage === 'back' ? 'Back_Transcript' : 'Front_Certificate';
      const filename = `TCT_E-Training_${sideSuffix}_A4_${orientSuffix}_${langSuffix}_${user.empId || 'Employee'}_${user.department || 'TCT'}.png`;
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      playSuccessChime();
      setDownloadMessage(`ดาวน์โหลดรูปภาพใบรับรอง (${certPage === 'back' ? 'ด้านหลัง - Transcript' : 'ด้านหน้า - เกียรติบัตร'}) สำเร็จ!`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4500);
    } catch (err) {
      console.warn('html-to-image notice:', err);
      handlePrint();
    } finally {
      setIsDownloading(false);
    }
  };

  const preScore = (rawPreScore !== null && rawPreScore !== undefined) ? rawPreScore : 0;
  const postScore = (rawPostScore !== null && rawPostScore !== undefined) ? rawPostScore : 0;
  const miniGameScore = (courseProgress ? (courseProgress.miniGameScore ?? user.miniGameScore) : user.miniGameScore) ?? 0;
  const metrics = calculateLearningMetrics(preScore, postScore);
  
  const gradeTh = postScore === 10 
    ? 'ดีเยี่ยมยอด (Distinction - 100%)' 
    : (postScore !== null && postScore >= 9) 
    ? 'ดีเยี่ยม (Excellent - 90%)' 
    : (postScore !== null && postScore >= passingScore)
    ? 'ผ่านเกณฑ์มาตรฐาน (Passed - 80%)'
    : 'ยังไม่ผ่านเกณฑ์มาตรฐาน (Under 80%)';

  const gradeEn = postScore === 10 
    ? 'Distinction (100% Top Score)' 
    : (postScore !== null && postScore >= 9) 
    ? 'Excellent (90% High Honors)' 
    : (postScore !== null && postScore >= passingScore)
    ? 'Standard Pass (80% Met)'
    : 'Not Passed (< 80%)';

  const certificateDateTh = (courseProgress?.certificateDate) || user.certificateDate || new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const certificateDateEn = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const isAppliedPsychology = currentCourseId === 'applied-psychology';
  const isKyt = currentCourseId === 'kyt-shisa-kanko';
  const isPersonality = currentCourseId === 'personality-psychology' || currentCourseId === 'conflict-management';
  const isPreventive = currentCourseId === 'advanced-preventive-maintenance';
  const isAi = currentCourseId === 'ai-for-tct';
  const certPrefix = currentCourse.code || (
    isAppliedPsychology ? 'TCT-PSY' : 
    (isKyt ? 'TCT-KYT' : 
    (isPersonality ? 'TCT-A001' : 
    (isPreventive ? 'TCT-APM' : 
    (isAi ? 'TCT-AI' : `TCT-${currentCourseId.toUpperCase().slice(0, 4)}`))))
  );

  const courseTitleTh = currentCourse.thaiTitle || currentCourse.title;
  const courseTitleEn = currentCourse.titleEn || currentCourse.title;

  const certificateCode = (courseProgress?.certificateId) || user.certificateId || `${certPrefix}-${new Date().getFullYear()}-${user.empId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'EMP'}-8892`;

  // Curriculum modules for back page transcript
  const rawModules = getCourseModules(currentCourseId);
  const courseModules = rawModules.length > 0
    ? rawModules.map((m, idx) => ({
        code: `MOD-0${idx + 1}`,
        titleTh: m.thaiTitle || m.title,
        titleEn: m.titleEn || m.title,
        hours: m.durationMinutes ? `${(m.durationMinutes / 60).toFixed(1)} ชม.` : '1.0 ชม.',
        status: 'ผ่านเกณฑ์ 100%'
      }))
    : isAppliedPsychology
    ? [
        { code: 'MOD-01', titleTh: 'จิตวิทยาเพื่อความสำเร็จและ Growth Mindset ในการทำงาน', titleEn: 'Psychology of Success & Workplace Growth Mindset', hours: '1.0 ชม.', status: 'ผ่านเกณฑ์ 100%' },
        { code: 'MOD-02', titleTh: 'การบริหารอารมณ์ ความเครียด และการสร้างพลังฟื้นคืน (Resilience)', titleEn: 'Emotional Agility, Stress Management & Resilience', hours: '1.0 ชม.', status: 'ผ่านเกณฑ์ 100%' },
        { code: 'MOD-03', titleTh: 'การสร้างความสุข ความมั่นคง และความผูกพันในงาน (PERMA Model)', titleEn: 'Workplace Happiness, Job Security & PERMA Well-being', hours: '1.0 ชม.', status: 'ผ่านเกณฑ์ 100%' },
      ]
    : isKyt
    ? [
        { code: 'UNIT-01', titleTh: 'จิตวิทยา Human Error และพลัง 4 ประสาทสัมผัส (ตา-มือ-ปาก-สมอง)', titleEn: 'Human Error Psychology & 4-Sense Synchronization', hours: '1.5 ชม.', status: 'ผ่านเกณฑ์ 100%' },
        { code: 'UNIT-02', titleTh: '4 ขั้นตอนมาตรฐาน Shisa Kanko (เตรียมพร้อม-ชี้-พูด-ยืนยัน)', titleEn: '4-Step Shisa Kanko (Prepare, Point, Voice, Confirm)', hours: '1.5 ชม.', status: 'ผ่านเกณฑ์ 100%' },
        { code: 'UNIT-03', titleTh: 'ท่ายืนสรีรศาสตร์ ท่ามือชี้ และการขจัด Phantom Pointing', titleEn: 'Ergonomic Stance & Eliminating Phantom Pointing', hours: '1.5 ชม.', status: 'ผ่านเกณฑ์ 100%' },
        { code: 'UNIT-04', titleTh: 'กฎทองการเปล่งเสียง และ 3 รูปแบบการยืนยัน (Solo/Mutual/Group)', titleEn: 'Vocal Rules & 3 Confirmation Types (Solo/Mutual/Group)', hours: '1.5 ชม.', status: 'ผ่านเกณฑ์ 100%' },
        { code: 'UNIT-05', titleTh: 'การประยุกต์ใช้ 5 สถานการณ์จริง (Machine, Mold, LOTO, QC, 5S)', titleEn: '5 TCT Real Production Cases Application', hours: '1.5 ชม.', status: 'ผ่านเกณฑ์ 100%' },
        { code: 'UNIT-06', titleTh: 'เกณฑ์ประเมิน 4 มิติ และพันธสัญญาความปลอดภัยสู่ Zero Accident', titleEn: '4-Dimension Evaluation & Zero Accident Safety Pledge', hours: '1.5 ชม.', status: 'ผ่านเกณฑ์ 100%' },
      ]
    : [
        { code: 'MOD-01', titleTh: 'หลักการบริหารความเสี่ยงและกรอบแนวคิดมาตรฐานสากล ISO 31000', titleEn: 'Risk Management Principles & ISO 31000 Framework', hours: '1.5 ชม.', status: 'ผ่านเกณฑ์ 100%' },
        { code: 'MOD-02', titleTh: 'การประเมินและวิเคราะห์ความเสี่ยง 5 ระดับ (5x5 Matrix & Root Cause)', titleEn: '5x5 Risk Assessment Matrix & Root Cause Analysis', hours: '1.5 ชม.', status: 'ผ่านเกณฑ์ 100%' },
        { code: 'MOD-03', titleTh: 'ลำดับขั้นการควบคุมความเสี่ยง (Hierarchy of Controls: 5 ขั้น)', titleEn: 'Hierarchy of Risk Mitigation Controls (Elimination to PPE)', hours: '1.5 ชม.', status: 'ผ่านเกณฑ์ 100%' },
        { code: 'MOD-04', titleTh: 'การขับเคลื่อนวัฒนธรรม Zero Accident และกิจกรรม KYT หน้างาน', titleEn: 'Zero Accident Culture & Operational KYT Activity', hours: '1.5 ชม.', status: 'ผ่านเกณฑ์ 100%' },
      ];

  const competencyMatrix = isAppliedPsychology
    ? [
        { nameTh: 'กรอบความคิดแบบเติบโต (Growth Mindset) และการตั้งเป้าหมายสู่งานที่เป็นเลิศ', nameEn: 'Workplace Growth Mindset & High-Performance Goal Setting', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'ทักษะการรู้เท่าทันอารมณ์ การจัดการความเครียด และเทคนิค S-T-O-P', nameEn: 'Emotional Regulation, Stress Management & S-T-O-P Practice', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'พลังแห่งการฟื้นคืน (Resilience) และการสร้างความปลอดภัยทางจิตวิทยาในทีม', nameEn: 'Workplace Resilience & Psychological Safety Facilitation', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'การสร้างความสุขในงานตามโมเดล PERMA และการพัฒนาความมั่นคงในอาชีพ', nameEn: 'PERMA Workplace Well-being & Long-term Career Stability', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
      ]
    : isKyt
    ? [
        { nameTh: 'ทักษะการปฏิบัติ Shisa Kanko 4 ขั้นตอนอย่างถูกต้องและมีสติ', nameEn: 'Accurate 4-Step Point & Call Execution with Full Mindfulness', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'การยืนยันความปลอดภัยสองทาง (Mutual Confirmation) ในงานเสี่ยงสูง', nameEn: 'Mutual Confirmation & Team Hazard Double-Check', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'การตัดแยกพลังงาน Lockout-Tagout (LOTO) และตรวจสอบเครื่องจักร', nameEn: 'LOTO Energy Isolation & Daily Machine Safety Verification', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'การสร้างวัฒนธรรมความปลอดภัยเชิงรุกและเป้าหมาย Zero Accident', nameEn: 'Zero Accident Proactive Culture & Safety Commitment', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
      ]
    : isPersonality
    ? [
        { nameTh: 'ความเข้าใจในความแตกต่างของบุคลิกภาพรายบุคคล', nameEn: 'Personality & Behavioral Differences Understanding', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'ทักษะการปรับตัวและการสื่อสารระหว่างบุคคล (DISC Model)', nameEn: 'Adaptive Interpersonal Communication by DISC', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'การรับฟังอย่างเข้าอกเข้าใจและการแก้ปัญหาความขัดแย้ง', nameEn: 'Empathic Active Listening & Conflict Resolution', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'การส่งเสริมความปลอดภัยทางจิตวิทยาและการทำงานเป็นทีม', nameEn: 'Psychological Safety & High-Trust Collaboration', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
      ]
    : isPreventive
    ? [
        { nameTh: 'การตรวจวิเคราะห์ความผิดปกติของเครื่องจักรก่อนเกิดความเสียหาย', nameEn: 'Proactive Machine Anomaly Detection & PdM', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'การประเมินและวางแผนงานบำรุงรักษาเชิงความน่าเชื่อถือ (RCM)', nameEn: 'Reliability-Centered Maintenance Assessment', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'การประยุกต์ใช้เครื่องมือตรวจวัด (Vibration, Temperature)', nameEn: 'Diagnostic Equipment Application (Vibe & Heat)', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'การทำ Kaizen ลด Downtime และปรับปรุงประสิทธิภาพ OEE', nameEn: 'Kaizen Downtime Elimination & OEE Improvement', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
      ]
    : (rawModules.length > 0
    ? rawModules.slice(0, 4).map((m) => ({
        nameTh: `การประยุกต์ใช้ความรู้และทักษะ: ${m.thaiTitle || m.title}`,
        nameEn: `Practical Application & Competency: ${m.titleEn || m.title}`,
        level: 'ระดับดีเยี่ยม (Proficient)',
        status: 'Certified'
      }))
    : [
        { nameTh: 'การประเมินจุดอันตรายและจัดทำทะเบียนความเสี่ยง (Risk Register)', nameEn: 'Hazard Identification & Risk Register Compilation', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'การวิเคราะห์รากเหง้าปัญหา 5 Whys & ก้างปลา (Fishbone)', nameEn: 'Root Cause Analysis (5 Whys & Fishbone Diagram)', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'การกำหนดมาตรการควบคุมความเสี่ยงตามลำดับขั้น Hierarchy of Controls', nameEn: 'Hierarchy of Controls Mitigation Formulation', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
        { nameTh: 'การตระหนักรู้ด้านความปลอดภัยและกิจกรรมเตือนภัย KYT หน้างาน', nameEn: 'Zero-Accident Safety Awareness & KYT Execution', level: 'ระดับดีเยี่ยม (Proficient)', status: 'Certified' },
      ]);

  if (!canShowCertificate) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 font-sarabun">
        {/* Course Switcher Bar */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg text-white">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-300 shrink-0">เลือกหลักสูตร:</span>
            <select
              value={activeCourseId}
              onChange={(e) => {
                playCyberClick();
                setActiveCourseId(e.target.value);
              }}
              className="bg-slate-800 text-white text-xs rounded-xl px-3 py-1.5 border border-cyan-500/40 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer max-w-[260px] truncate"
            >
              {allAvailableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code ? `${c.code}: ` : ''}{c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <button
                type="button"
                onClick={() => { playCyberClick(); setAdminBypass(true); }}
                className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer border border-purple-400/40"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>โหมดพรีวิวผู้ดูแลระบบ (Admin Preview)</span>
              </button>
            )}
            <button
              onClick={() => { playCyberClick(); onNavigate('dashboard'); }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition-all cursor-pointer"
            >
              กลับสู่แดชบอร์ด
            </button>
          </div>
        </div>

        {/* Certificate Gatekeeper Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-red-200 shadow-xl relative overflow-hidden text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-red-50 border-2 border-red-300 mx-auto flex items-center justify-center text-red-600 shadow-inner">
            <Lock className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold border border-red-300">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>ระบบควบคุมความปลอดภัยและการออกใบประกาศนียบัตร • TCT ACADEMY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              ยังไม่อนุญาตให้ออกใบประกาศนียบัตร
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              หลักสูตร: <strong className="text-slate-900">{courseTitleTh}</strong> ({currentCourse.code})
            </p>
          </div>

          {/* Assessment Status Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 text-left space-y-4 max-w-2xl mx-auto shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="font-bold text-slate-900 text-sm">{user.fullName}</div>
                <div className="text-xs text-slate-500">รหัสพนักงาน: {user.empId} • แผนก: {user.department}</div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {hasPostTest ? 'คะแนนยังไม่ผ่านเกณฑ์' : 'อยู่ระหว่างการฝึกอบรม'}
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-700 font-medium">1. การเข้าเรียนบทเรียน (Modules):</span>
                <span className="font-bold text-slate-900">
                  ผ่านแล้ว {user.completedModules.length} / {courseModules.length || 4} บท
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-700 font-medium">2. คะแนนแบบทดสอบก่อนเรียน (Pre-Test):</span>
                <span className="font-bold text-slate-900 font-mono">
                  {rawPreScore !== null ? `${rawPreScore}/${totalScore} คะแนน` : 'ยังไม่ได้ทดสอบ'}
                </span>
              </div>

              <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                hasPostTest 
                  ? 'bg-red-50 border-red-300 text-red-900' 
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}>
                <div>
                  <div className="font-bold">3. คะแนนแบบทดสอบหลังเรียน (Post-Test):</div>
                  <div className="text-[11px] text-slate-500 font-normal">
                    เกณฑ์ผ่านต้องได้ตั้งแต่ {passingScore}/{totalScore} คะแนน (80% ขึ้นไป)
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-black">
                    {hasPostTest ? `${rawPostScore}/${totalScore}` : 'ยังไม่ได้สอบ'}
                  </span>
                  <div className="text-[10px] font-bold">
                    {hasPostTest ? '❌ ไม่ผ่านเกณฑ์' : 'รอเข้าสอบ'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
              <strong>นโยบายคุณภาพ TCT Academy:</strong> ใบประกาศนียบัตรดิจิทัล E-Certificate จะออกให้และบันทึกประวัติการสำเร็จหลักสูตรอัตโนมัติเฉพาะพนักงานที่สอบผ่านแบบทดสอบ Post-Test ตามเกณฑ์มาตรฐาน {passingScore}/{totalScore} คะแนนขึ้นไปเท่านั้น
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => { playCyberClick(); onNavigate('posttest'); }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{hasPostTest ? 'เข้าสอบแก้ตัว Post-Test อีกครั้ง' : 'เข้าทำแบบทดสอบ Post-Test'}</span>
            </button>

            <button
              onClick={() => { playCyberClick(); onNavigate('dashboard'); }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#005A9C] hover:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>กลับไปทบทวนบทเรียน</span>
            </button>

            <button
              onClick={() => { playCyberClick(); onNavigate('report'); }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 border border-slate-300 cursor-pointer transition-all"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>ดูใบรายงานผล (Training Report)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 font-sarabun">
      {/* Admin Testing Preview Alert Banner */}
      {adminBypass && (
        <div className="bg-amber-600 text-white p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold no-print shadow-md">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-200 animate-bounce" />
            <span>โหมดพรีวิวผู้ดูแลระบบ (Admin Testing Preview): พนักงานท่านนี้ยังไม่ผ่านเกณฑ์จริง ({rawPostScore ?? 0}/{totalScore}) กำลังแสดงผลเพื่อตรวจสอบเอกสาร</span>
          </div>
          <button
            onClick={() => setAdminBypass(false)}
            className="px-3 py-1 bg-black/40 hover:bg-black/60 text-white rounded-lg text-xs cursor-pointer"
          >
            ปิดโหมดพรีวิว
          </button>
        </div>
      )}

      {/* Top Header & Actions Bar (Hidden during Print) */}
      <div className="no-print glass-panel-cyan rounded-3xl p-4 sm:p-6 border border-cyan-500/40 shadow-xl">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-semibold">
                TCT E-TRAINING A4 CERTIFICATE (210 × 297 mm / 21 × 29.7 cm)
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                ผ่านเกณฑ์มาตรฐานสมบูรณ์
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              ใบรับรองผลการฝึกอบรม (TCT E-Training Certificate)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              เอกสารขนาดมาตรฐาน <strong>A4 (210 × 297 มิลลิเมตร หรือ 21 × 29.7 เซนติเมตร)</strong> รองรับทั้ง <strong>แนวตั้ง (Portrait)</strong> และ <strong>แนวนอน (Landscape)</strong> พร้อมระเบียนผลสัมฤทธิ์และสมรรถนะด้านหลัง (Page 2)
            </p>
          </div>

          {/* Action Buttons & Selectors */}
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            {/* Course Selector Dropdown */}
            <div className="flex items-center gap-2 bg-slate-900/90 border-2 border-blue-500/50 rounded-2xl px-3 py-1.5 shadow-lg shadow-blue-500/10">
              <span className="text-xs font-bold text-cyan-300 shrink-0">หลักสูตร:</span>
              <select
                id="cert-course-selector"
                value={activeCourseId}
                onChange={(e) => {
                  playCyberClick();
                  setActiveCourseId(e.target.value);
                }}
                className="bg-slate-800 text-white text-xs rounded-xl px-2.5 py-1 border border-cyan-500/40 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer max-w-[240px] truncate"
              >
                {allAvailableCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code ? `[${c.code}] ` : ''}{c.thaiTitle || c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 0. Page Selector (Both Pages / Front Only / Back Only) */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 border-2 border-emerald-500/50 rounded-2xl p-1 shadow-lg shadow-emerald-500/10">
              <button
                id="cert-page-all-btn"
                type="button"
                onClick={() => { playCyberClick(); setCertPage('all'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  certPage === 'all'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="พิมพ์/แสดงครบทั้ง 2 หน้า (ด้านหน้าเกียรติบัตร + ด้านหลังระเบียนผลสัมฤทธิ์)"
              >
                <span>📑</span>
                <span>ครบ 2 หน้า (หน้า-หลัง)</span>
              </button>
              <button
                id="cert-page-front-btn"
                type="button"
                onClick={() => { playCyberClick(); setCertPage('front'); }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  certPage === 'front'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="หน้า 1: ด้านหน้าใบประกาศนียบัตร"
              >
                <span>🥇</span>
                <span>หน้า 1 (ด้านหน้า)</span>
              </button>
              <button
                id="cert-page-back-btn"
                type="button"
                onClick={() => { playCyberClick(); setCertPage('back'); }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  certPage === 'back'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="หน้า 2: ด้านหลัง ระเบียนผลสัมฤทธิ์และสมรรถนะ Transcript"
              >
                <span>📋</span>
                <span>หน้า 2 (ด้านหลัง)</span>
              </button>
            </div>

            {/* 1. Orientation & Aspect Ratio Selector */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 border-2 border-cyan-500/50 rounded-2xl p-1 shadow-lg shadow-cyan-500/10">
              <button
                id="cert-orient-portrait-btn"
                type="button"
                onClick={() => { playCyberClick(); setOrientation('portrait'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  orientation === 'portrait'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="A4 แนวตั้ง: 210 × 297 มม."
              >
                <span>📄</span>
                <span>A4 แนวตั้ง (210×297 mm)</span>
              </button>

              <button
                id="cert-orient-landscape-btn"
                type="button"
                onClick={() => { playCyberClick(); setOrientation('landscape'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  orientation === 'landscape'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="แนวนอน / Landscape"
              >
                <span>📜</span>
                <span>แนวนอน (Landscape)</span>
              </button>

              {/* Sub-aspect ratio selector when Landscape */}
              {orientation === 'landscape' && (
                <div className="flex items-center gap-1 pl-1 border-l border-cyan-500/40">
                  <button
                    id="cert-aspect-16-9-btn"
                    type="button"
                    onClick={() => { playCyberClick(); setAspectRatio('16:9'); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      aspectRatio === '16:9'
                        ? 'bg-amber-400 text-slate-950 shadow-sm font-extrabold'
                        : 'text-cyan-300 hover:text-white bg-slate-800/80'
                    }`}
                    title="สัดส่วน 16:9 Widescreen / A4 Fit"
                  >
                    16:9
                  </button>
                  <button
                    id="cert-aspect-4-3-btn"
                    type="button"
                    onClick={() => { playCyberClick(); setAspectRatio('4:3'); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      aspectRatio === '4:3'
                        ? 'bg-amber-400 text-slate-950 shadow-sm font-extrabold'
                        : 'text-cyan-300 hover:text-white bg-slate-800/80'
                    }`}
                    title="สัดส่วน 4:3 Standard Classic / A4 Fit"
                  >
                    4:3
                  </button>
                  <button
                    id="cert-aspect-a4-btn"
                    type="button"
                    onClick={() => { playCyberClick(); setAspectRatio('a4'); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      aspectRatio === 'a4'
                        ? 'bg-amber-400 text-slate-950 shadow-sm font-extrabold'
                        : 'text-cyan-300 hover:text-white bg-slate-800/80'
                    }`}
                    title="A4 แนวนอนมาตรฐาน (297×210 mm)"
                  >
                    A4
                  </button>
                </div>
              )}
            </div>

            {/* 2. Language Switcher Toggle */}
            <div className="bg-slate-900/90 border-2 border-amber-500/50 rounded-2xl p-1 flex items-center shadow-lg shadow-amber-500/10">
              <button
                id="cert-lang-th-btn"
                type="button"
                onClick={() => { playCyberClick(); setCertLanguage('th'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  certLanguage === 'th'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🇹🇭</span>
                <span className="whitespace-nowrap">ไทย (TH)</span>
              </button>

              <button
                id="cert-lang-en-btn"
                type="button"
                onClick={() => { playCyberClick(); setCertLanguage('en'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  certLanguage === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🇬🇧</span>
                <span className="whitespace-nowrap">English (EN)</span>
              </button>
            </div>

            {/* Print A4 Certificate Button (Primary) */}
            <button
              id="cert-print-btn"
              type="button"
              onClick={handlePrint}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">พิมพ์ใบรับรอง (A4)</span>
            </button>

            {/* Download PDF Button */}
            <button
              id="cert-download-pdf-btn"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {isPdfGenerating ? (
                <Sparkles className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <FileDown className="w-4 h-4 shrink-0" />
              )}
              <span className="whitespace-nowrap">{isPdfGenerating ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF'}</span>
            </button>

            {/* Back to Dashboard Button */}
            <button
              id="cert-back-dashboard-btn"
              type="button"
              onClick={() => { playCyberClick(); onNavigate('dashboard'); }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2 px-3.5 rounded-xl border border-slate-600 flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">กลับสู่บทเรียน</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadMessage || `ดาวน์โหลดเอกสาร A4 (${orientation === 'portrait' ? 'แนวตั้ง 210×297 mm' : 'แนวนอน 297×210 mm'}) สำเร็จ!`}</span>
          </div>
        )}
      </div>

      {/* Quick Summary Badges (Hidden in Print) */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Pre-test */}
        <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-cyan-500/30 bg-cyan-950/20">
          <div className="text-xs text-cyan-300 font-medium">คะแนนก่อนเรียน (Pre-Test)</div>
          <div className="text-xl sm:text-2xl font-bold text-cyan-400 font-mono mt-0.5">
            {preScore} <span className="text-xs text-cyan-500/80 font-normal">/ 10 ({preScore * 10}%)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">ก่อนเข้ารับการอบรม</div>
        </div>

        {/* Post-test */}
        <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-emerald-500/40 bg-emerald-950/20">
          <div className="text-xs text-emerald-300 font-medium">คะแนนหลังเรียน (Post-Test)</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono mt-0.5">
            {postScore} <span className="text-xs text-emerald-500/80 font-normal">/ 10 ({postScore * 10}%)</span>
          </div>
          <div className="text-[11px] text-emerald-400/90 mt-0.5 font-semibold">ผ่านเกณฑ์มาตรฐาน (Passed)</div>
        </div>

        {/* Knowledge & Skill Growth / Gap Closure */}
        <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-purple-500/40 bg-purple-950/20">
          <div className="text-xs text-purple-300 font-medium">การพัฒนา & ปิดช่องว่างความรู้</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-400 font-mono mt-0.5">
            {metrics.growthPercentage === 100 ? '100%' : `+${metrics.scoreDelta}%`}
          </div>
          <div className="text-[10px] text-purple-300/80 mt-0.5 font-medium truncate" title={metrics.badgeLabelEn}>
            {metrics.badgeLabelEn}
          </div>
        </div>

        {/* Mini Game Score */}
        <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-amber-500/40 bg-amber-950/20">
          <div className="text-xs text-amber-300 font-medium">คะแนนมินิเกม (Mini-Game)</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono mt-0.5">
            {miniGameScore} <span className="text-xs text-amber-500/80 font-normal">pts</span>
          </div>
          <div className="text-[11px] text-amber-300/80 mt-0.5">การประยุกต์ใช้จริงในโรงงาน</div>
        </div>
      </div>

      {/* Dynamic @page print orientation for seamless full-page printing */}
      <style>{`
        @media print {
          @page {
            size: A4 ${orientation} !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* OFFICIAL PARCHMENT & GOLD CORPORATE CERTIFICATE - A4 (210×297 mm / 297×210 mm) */}
      {/* ========================================================================= */}
      <div className="flex flex-col items-center gap-8 pb-8 overflow-x-auto w-full">
        {/* ========================================================================= */}
        {/* PAGE 1: FRONT CERTIFICATE (PORTRAIT OR LANDSCAPE)                         */}
        {/* ========================================================================= */}
        {(certPage === 'all' || certPage === 'front') && (
          <div className="flex flex-col items-center w-full">
            <div className="no-print mb-2 text-xs font-bold text-amber-400 flex items-center gap-1.5 bg-amber-950/70 border border-amber-500/40 px-3.5 py-1 rounded-full shadow">
              <span>🥇 แผ่นที่ 1: ด้านหน้าใบประกาศนียบัตร (A4 Official Certificate Front)</span>
            </div>
            {orientation === 'portrait' ? (
              /* ========================================= */
              /* 1. A4 PORTRAIT FORMAT (210 × 297 mm)     */
              /* ========================================= */
              <div 
                id="certificate-print-area"
                ref={frontPageRef}
                className="certificate-portrait-box certificate-page-portrait w-full max-w-[780px] min-h-0 sm:min-h-[850px] md:min-h-[1020px] aspect-[210/297] bg-[#FFFDF9] text-slate-800 rounded-2xl p-7 sm:p-10 relative overflow-hidden border-[6px] border-[#D97706] shadow-2xl transition-all font-sarabun flex flex-col justify-between"
            style={{
              backgroundImage: 'radial-gradient(#E2E8F0 0.75px, transparent 0.75px)',
              backgroundSize: '16px 16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 0 45px rgba(217, 119, 6, 0.09)'
            }}
          >
            {/* Certificate Decorative Inner Borders & Filigree Corners */}
            <div className="absolute inset-2 sm:inset-3 border-2 border-[#0F2A4A] rounded-xl pointer-events-none" />
            <div className="absolute inset-4 sm:inset-5 border border-[#D97706]/70 rounded-lg pointer-events-none" />

            {/* Corner Classical Ornaments */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-[#D97706] rounded-tl-sm pointer-events-none" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-[#D97706] rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-[#D97706] rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-[#D97706] rounded-br-sm pointer-events-none" />

            {/* Watermark Logo Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
              <img 
                src="/tct-academy-logo.svg" 
                alt="" 
                className="w-[440px] max-w-[70%] object-contain filter grayscale" 
              />
            </div>

            {/* 1. Header (PROMINENT CENTER INSTITUTION TITLE - สัดส่วนสวยงาม สมดุล ชัดเจน) */}
            <div className="relative z-10 text-center space-y-2 pb-3.5 border-b-2 border-[#E2E8F0]">
              <div className="flex flex-col items-center justify-center">
                {/* Official 3D Metallic TCT Academy Logo (Direct Image) */}
                <div className="mb-1 flex justify-center">
                  <TCTLogo size="certPortrait" variant="full" />
                </div>

                {/* Company Accreditation */}
                <div className="text-xs sm:text-sm font-bold text-[#0F2A4A] mt-0.5 tracking-wide font-sarabun">
                  {certLanguage === 'th' ? 'บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • TEIJIN CORD (THAILAND) CO., LTD.' : 'TEIJIN CORD (THAILAND) CO., LTD.'}
                </div>
              </div>

              {/* Certificate Title */}
              <div className="pt-1.5">
                {certLanguage === 'th' ? (
                  <>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F2A4A] font-sarabun">
                      ใบประกาศนียบัตรรับรองผลการฝึกอบรม
                    </h2>
                    <div className="text-xs sm:text-sm font-extrabold text-[#B45309] uppercase tracking-widest mt-1">
                      TCT ACADEMY CERTIFICATE OF COMPETENCY (A4 PORTRAIT)
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F2A4A] font-sarabun">
                      CERTIFICATE OF TRAINING ACHIEVEMENT
                    </h2>
                    <div className="text-xs sm:text-sm font-extrabold text-[#B45309] uppercase tracking-widest mt-1">
                      TCT ACADEMY CERTIFICATE OF COMPETENCY (A4 PORTRAIT)
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 2. Certificate Body (Portrait Vertical Balance) */}
            <div className="relative z-10 py-4 text-center space-y-3.5 flex-1 flex flex-col justify-around">
              <p className="text-sm sm:text-base text-[#334155] font-medium">
                {certLanguage === 'th' 
                  ? 'TCT Academy ขอมอบใบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า'
                  : 'TCT Academy hereby certifies that'}
              </p>

              {/* Recipient Full Name */}
              <div className="py-0.5">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B2545] tracking-normal font-sarabun underline decoration-[#D97706] decoration-4 underline-offset-8">
                  {user.fullName}
                </div>
                <div className="text-xs sm:text-sm text-[#475569] font-mono mt-3 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                  <span className="bg-[#F8FAFC] border border-[#CBD5E1] px-3.5 py-1 rounded-xl shadow-sm">
                    {certLanguage === 'th' ? 'รหัสพนักงาน (ID):' : 'Employee ID:'}{' '}
                    <strong className="text-[#0B2545] font-bold text-sm">{user.empId}</strong>
                  </span>
                  <span className="bg-[#F8FAFC] border border-[#CBD5E1] px-3.5 py-1 rounded-xl shadow-sm">
                    {certLanguage === 'th' ? 'ฝ่าย / แผนก (Dept):' : 'Department:'}{' '}
                    <strong className="text-[#B45309] font-bold text-sm">{formatDepartmentFull(user.department)}</strong>
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#334155] max-w-xl mx-auto leading-relaxed">
                {certLanguage === 'th'
                  ? 'ได้ผ่านการฝึกอบรมและประเมินผลสัมฤทธิ์ตามเกณฑ์มาตรฐานของ TCT Academy ในหลักสูตร'
                  : 'has successfully completed the industrial competency training curriculum certified by TCT Academy:'}
              </p>

              {/* Course Title Card */}
              <div className="bg-[#F8FAFC] border-2 border-[#D97706]/50 rounded-2xl p-3.5 max-w-xl mx-auto shadow-sm">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#0B2545] font-sarabun">
                  {certLanguage === 'th' ? courseTitleTh : courseTitleEn}
                </h3>
                <p className="text-xs sm:text-sm text-[#B45309] font-mono font-bold mt-0.5">
                  TCT ACADEMY • TEIJIN CORD (THAILAND) CO., LTD.
                </p>
              </div>

              {/* Official Scorecard (Portrait) */}
              <div className="max-w-2xl mx-auto bg-white border-2 border-[#CBD5E1] rounded-2xl p-3.5 shadow-md text-left">
                <div className="text-xs font-bold text-[#0B2545] uppercase mb-2.5 flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-[#B45309]" />
                    {certLanguage === 'th'
                      ? 'สรุปผลการประเมินและคะแนนการฝึกอบรม (OFFICIAL SCORECARD)'
                      : 'ASSESSMENT SUMMARY & PERFORMANCE SCORECARD'}
                  </span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {certLanguage === 'th' ? 'PASSED (ผ่านเกณฑ์มาตรฐาน)' : 'PASSED (MET STANDARD)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2">
                    <div className="text-[11px] text-[#64748B] font-semibold">
                      {certLanguage === 'th' ? '1. ก่อนเรียน (Pre-Test)' : '1. Pre-Test Score'}
                    </div>
                    <div className="text-lg sm:text-xl font-black text-[#334155] font-mono mt-0.5">
                      {preScore} / 10
                    </div>
                    <div className="text-[10px] text-[#64748B]">
                      {certLanguage === 'th' ? `คิดเป็น ${preScore * 10}%` : `${preScore * 10}% Score`}
                    </div>
                  </div>

                  <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-2">
                    <div className="text-[11px] text-[#065F46] font-semibold">
                      {certLanguage === 'th' ? '2. หลังเรียน (Post-Test)' : '2. Post-Test Score'}
                    </div>
                    <div className="text-lg sm:text-xl font-black text-[#065F46] font-mono mt-0.5">
                      {postScore} / 10
                    </div>
                    <div className="text-[10px] text-[#065F46] font-bold">
                      {certLanguage === 'th' ? `คิดเป็น ${postScore * 10}% (ผ่าน)` : `${postScore * 10}% (Passed)`}
                    </div>
                  </div>

                  <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl p-2">
                    <div className="text-[10px] text-[#6D28D9] font-semibold">
                      {certLanguage === 'th' ? '3. พัฒนา & ปิดช่องว่างความรู้' : '3. Skill Gain & Gap Closure'}
                    </div>
                    <div className="text-lg sm:text-xl font-black text-[#7C3AED] font-mono mt-0.5">
                      {metrics.growthPercentage === 100 ? '100%' : `+${metrics.scoreDelta}%`}
                    </div>
                    <div className="text-[9.5px] text-[#6D28D9] font-medium leading-tight mt-0.5">
                      {certLanguage === 'th' ? metrics.badgeLabelTh : metrics.badgeLabelEn}
                    </div>
                  </div>

                  <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-2">
                    <div className="text-[11px] text-[#B45309] font-semibold">
                      {certLanguage === 'th' ? '4. มินิเกมสถานการณ์' : '4. Simulation Game'}
                    </div>
                    <div className="text-lg sm:text-xl font-black text-[#B45309] font-mono mt-0.5">
                      {miniGameScore} <span className="text-xs text-[#64748B] font-normal">pts</span>
                    </div>
                    <div className="text-[10px] text-[#64748B]">
                      {certLanguage === 'th' ? 'ความว่องไวและแม่นยำ' : 'Practical Readiness'}
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <div className="text-[#334155]">
                    {certLanguage === 'th' ? 'ระดับผลสัมฤทธิ์:' : 'Achievement Level:'}{' '}
                    <strong className="text-[#B45309] font-bold">
                      {certLanguage === 'th' ? gradeTh : gradeEn}
                    </strong>
                  </div>
                  <div className="text-[#64748B] font-medium">
                    {certLanguage === 'th' ? 'จำนวนรอบทดสอบ Post-test:' : 'Post-test Attempts:'}{' '}
                    <strong className="text-[#0B2545]">{user.postTestAttempts || 1}</strong> {certLanguage === 'th' ? 'ครั้ง' : 'time(s)'}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Certificate Footer (Portrait) */}
            <div className="relative z-10 pt-3.5 mt-1 border-t-2 border-[#E2E8F0] space-y-3 text-xs">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-13 h-13 bg-white border-2 border-[#CBD5E1] rounded-xl p-1 flex items-center justify-center shrink-0 shadow-sm">
                    <QrCode className="w-full h-full text-[#0B2545]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64748B] font-bold uppercase">
                      {certLanguage === 'th' ? 'รหัสเอกสารรับรอง (Serial ID)' : 'Verification Serial ID'}
                    </div>
                    <div className="text-xs font-black text-[#0B2545] font-mono">{certificateCode}</div>
                    <div className="text-[10px] text-[#0B2545] font-bold font-mono">
                      TCT ACADEMY
                    </div>
                    <div className="text-[10px] text-[#64748B] mt-0.5 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-[#B45309]" />
                      {certLanguage === 'th' ? `ออกให้ ณ วันที่: ${certificateDateTh}` : `Issued On: ${certificateDateEn}`}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-15 h-15 rounded-full bg-gradient-to-br from-[#FDE68A] via-[#F59E0B] to-[#B45309] p-0.5 shadow-xl flex items-center justify-center shrink-0 border-2 border-white relative">
                    <div className="w-full h-full bg-[#FFFDF9] rounded-full flex flex-col items-center justify-center text-center p-1 border border-[#D97706]">
                      <Award className="w-5 h-5 text-[#B45309]" />
                      <span className="text-[6px] font-black text-[#0B2545] font-mono uppercase">TCT ACADEMY</span>
                      <span className="text-[5px] font-bold text-[#B45309] font-mono">OFFICIAL SEAL</span>
                    </div>
                    <div className="absolute -bottom-2 -left-1 w-3 h-5 bg-[#B45309] transform rotate-12 -z-10 rounded-sm shadow" />
                    <div className="absolute -bottom-2 -right-1 w-3 h-5 bg-[#B45309] transform -rotate-12 -z-10 rounded-sm shadow" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#E2E8F0]">
                {/* Signatory 1: Personnel & Admin Manager */}
                <div className="text-center space-y-1">
                  <div className="font-bold text-[#0B2545] text-xs font-sarabun">
                    {certLanguage === 'th' ? '( นายกิตติศักดิ์ สร้อยจิตต์ )' : '( Mr. Kittisak Soijit )'}
                  </div>
                  <div className="text-[11px] font-bold text-[#B45309]">
                    {certLanguage === 'th' ? 'ผู้จัดการศูนย์ TCT Academy' : 'Manager of TCT Academy'}
                  </div>
                  <div className="text-[10px] text-[#475569] font-semibold">
                    {certLanguage === 'th' ? 'ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด' : 'TCT Academy Personnel Development & Training Center'}
                  </div>
                </div>

                {/* Signatory 2: General Manager & Factory Manager */}
                <div className="text-center space-y-1">
                  <div className="font-bold text-[#0B2545] text-xs font-sarabun">
                    {certLanguage === 'th' ? '( นายนพดล บำรุงเกียรติ )' : '( Mr. Noppadol Bamrungkiat )'}
                  </div>
                  <div className="text-[11px] font-bold text-[#0B2545]">
                    {certLanguage === 'th' ? 'ผู้จัดการทั่วไปและผู้จัดการโรงงาน / ประธานที่ปรึกษาศูนย์ TCT Academy' : 'General & Factory Manager / Chairman of Advisory Board, TCT Academy'}
                  </div>
                  <div className="text-[10px] text-[#475569] font-bold font-mono">
                    บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • TEIJIN CORD (THAILAND) CO., LTD.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 2. OFFICIAL TCT ACADEMY LANDSCAPE CERTIFICATE (16:9 / 4:3 / A4 297×210 mm) */
          /* ========================================================================= */
          <div 
            id="certificate-print-area"
            ref={frontPageRef}
            className={`certificate-landscape-box certificate-page-landscape w-full ${
              aspectRatio === '16:9'
                ? 'max-w-[1060px] aspect-[16/9]'
                : aspectRatio === '4:3'
                ? 'max-w-[940px] aspect-[4/3]'
                : 'max-w-[1020px] aspect-[297/210]'
            } min-h-0 sm:min-h-[500px] md:min-h-[640px] bg-[#FAF8F5] text-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl transition-all font-sarabun flex flex-col justify-between select-none`}
            style={{
              backgroundImage: customBgImage
                ? `url(${customBgImage})`
                : 'radial-gradient(#E2E8F0 0.75px, transparent 0.75px)',
              backgroundSize: customBgImage ? '100% 100%' : '16px 16px',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 0 45px rgba(217, 119, 6, 0.08)'
            }}
          >
            {/* If NO custom background image is uploaded, render the crisp vector TCT Academy template */}
            {!customBgImage && (
              <>
                {/* 1. Geometric Cyber-Gold Outer Borders & Corner Accents */}
                <div className="absolute inset-2 sm:inset-3 border-2 border-[#0F2A4A] rounded-xl pointer-events-none" />
                <div className="absolute inset-4 sm:inset-5 border border-[#D97706]/70 rounded-lg pointer-events-none" />

                {/* Corner High-Tech Navy/Gold Angled Cuts */}
                <div className="absolute top-2 left-2 w-16 h-16 pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#0F2A4A]" />
                  <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-[#D97706]" />
                  {/* Subtle circuit dots */}
                  <div className="absolute top-8 left-2 w-1 h-3 bg-[#D97706]/40" />
                  <div className="absolute top-2 left-8 w-3 h-1 bg-[#D97706]/40" />
                </div>

                <div className="absolute top-2 right-2 w-16 h-16 pointer-events-none">
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#0F2A4A]" />
                  <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-[#D97706]" />
                  <div className="absolute top-8 right-2 w-1 h-3 bg-[#D97706]/40" />
                  <div className="absolute top-2 right-8 w-3 h-1 bg-[#D97706]/40" />
                </div>

                <div className="absolute bottom-2 left-2 w-16 h-16 pointer-events-none">
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#0F2A4A]" />
                  <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-[#D97706]" />
                  <div className="absolute bottom-8 left-2 w-1 h-3 bg-[#D97706]/40" />
                  <div className="absolute bottom-2 left-8 w-3 h-1 bg-[#D97706]/40" />
                </div>

                <div className="absolute bottom-2 right-2 w-16 h-16 pointer-events-none">
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#0F2A4A]" />
                  <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-[#D97706]" />
                  <div className="absolute bottom-8 right-2 w-1 h-3 bg-[#D97706]/40" />
                  <div className="absolute bottom-2 right-8 w-3 h-1 bg-[#D97706]/40" />
                </div>

                {/* 2. Watermark Logo Background */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.035] pointer-events-none select-none">
                  <img 
                    src="/tct-academy-logo.svg" 
                    alt="" 
                    className="w-[460px] max-w-[65%] object-contain filter grayscale" 
                  />
                </div>

                {/* 3. Top Header: TCT Academy Brand Logo (Direct Image) */}
                <div className="relative z-10 text-center pt-1 pb-2 flex flex-col items-center">
                  {/* Official 3D Metallic TCT Academy Logo */}
                  <div className="mb-1 flex justify-center">
                    <TCTLogo size="certLandscape" variant="full" />
                  </div>

                  {/* Three Gold Stars */}
                  <div className="flex items-center justify-center gap-1.5 text-amber-500 text-xs mb-1">
                    <span>★</span>
                    <span className="text-sm">★</span>
                    <span>★</span>
                  </div>

                  {/* Underline & Subtitle */}
                  <div className="w-48 sm:w-60 h-0.5 bg-gradient-to-r from-transparent via-[#DC2626] to-[#0F2A4A] mx-auto my-0.5" />
                  <p className="text-[11px] sm:text-xs font-semibold text-[#0F2A4A] tracking-wider mt-0.5 font-sarabun">
                    บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด • TEIJIN CORD (THAILAND) CO., LTD.
                  </p>
                </div>
              </>
            )}

            {/* When customBgImage is uploaded, leave top padding for the pre-printed logo */}
            {customBgImage && <div className="h-16 sm:h-20 shrink-0" />}

            {/* ========================================================= */}
            {/* CENTRAL TEXT LAYER - POSITIONED TO PREVENT ANY COLLISION */}
            {/* ========================================================= */}
            <div className="relative z-10 text-center my-auto space-y-2 sm:space-y-3 px-2 sm:px-6">
              {/* Certificate Title */}
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-[#0B2545] tracking-tight font-sarabun uppercase">
                  {certLanguage === 'th' ? 'ใบประกาศนียบัตรรับรองผลการฝึกอบรม' : 'CERTIFICATE OF ACHIEVEMENT'}
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] font-medium mt-0.5">
                  {certLanguage === 'th' 
                    ? 'TCT Academy ศูนย์ฝึกอบรมและพัฒนา ขอมอบใบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า'
                    : 'TCT Academy Training & Development Center hereby certifies that'}
                </p>
              </div>

              {/* Recipient Full Name */}
              <div className="py-0.5">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B2545] tracking-normal font-sarabun">
                  {user.fullName}
                </div>
                <div className="w-44 sm:w-64 h-1 bg-[#D97706] mx-auto mt-1 rounded-full shadow-sm" />
                
                {/* Employee ID & Department Chips */}
                <div className="text-xs text-[#475569] font-mono mt-2 flex flex-wrap items-center justify-center gap-2">
                  <span className="bg-[#F8FAFC]/95 border border-[#CBD5E1] px-3 py-0.5 rounded-lg shadow-sm">
                    {certLanguage === 'th' ? 'รหัสพนักงาน:' : 'Employee ID:'}{' '}
                    <strong className="text-[#0B2545] font-bold">{user.empId}</strong>
                  </span>
                  <span className="bg-[#F8FAFC]/95 border border-[#CBD5E1] px-3 py-0.5 rounded-lg shadow-sm">
                    {certLanguage === 'th' ? 'ฝ่าย/แผนก:' : 'Department:'}{' '}
                    <strong className="text-[#B45309] font-bold">{formatDepartmentFull(user.department)}</strong>
                  </span>
                </div>
              </div>

              {/* Completion Statement */}
              <p className="text-xs text-[#334155] max-w-2xl mx-auto leading-relaxed">
                {certLanguage === 'th'
                  ? 'ได้ผ่านการฝึกอบรมและทดสอบประเมินผลความรู้ตามเกณฑ์มาตรฐานของ TCT Academy ในหลักสูตร:'
                  : 'has successfully completed the industrial competency training curriculum certified by TCT Academy:'}
              </p>

              {/* Course Title Banner */}
              <div className="bg-gradient-to-r from-[#F8FAFC] via-[#FEF3C7]/40 to-[#F8FAFC] border-2 border-[#D97706]/60 rounded-xl py-1.5 px-4 max-w-2xl mx-auto shadow-sm">
                <h3 className="text-sm sm:text-base font-extrabold text-[#0B2545] font-sarabun">
                  {certLanguage === 'th'
                    ? `${courseTitleTh} • TCT ACADEMY`
                    : `${courseTitleEn} • TCT ACADEMY`}
                </h3>
              </div>

              {/* Scorecard Table (Compact, clean 4 Columns) */}
              <div className="max-w-3xl mx-auto bg-white/95 border border-[#CBD5E1] rounded-xl p-2 shadow-sm text-left backdrop-blur-xs">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-1">
                    <div className="text-[9.5px] text-[#64748B] font-semibold">1. Pre-Test</div>
                    <div className="text-sm sm:text-base font-black text-[#334155] font-mono">{preScore} / 10</div>
                    <div className="text-[8.5px] text-[#64748B]">{preScore * 10}%</div>
                  </div>

                  <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg p-1">
                    <div className="text-[9.5px] text-[#065F46] font-semibold">2. Post-Test</div>
                    <div className="text-sm sm:text-base font-black text-[#065F46] font-mono">{postScore} / 10</div>
                    <div className="text-[8.5px] text-[#065F46] font-bold">{postScore * 10}% (ผ่านเกณฑ์)</div>
                  </div>

                  <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg p-1">
                    <div className="text-[9.5px] text-[#6D28D9] font-semibold">3. การพัฒนาความรู้</div>
                    <div className="text-sm sm:text-base font-black text-[#7C3AED] font-mono">
                      {metrics.growthPercentage === 100 ? '100%' : `+${metrics.scoreDelta}%`}
                    </div>
                    <div className="text-[8.5px] text-[#6D28D9] font-medium truncate" title={metrics.badgeLabelTh}>
                      {metrics.badgeLabelTh}
                    </div>
                  </div>

                  <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-1">
                    <div className="text-[9.5px] text-[#B45309] font-semibold">4. มินิเกมประเมินความเร็ว</div>
                    <div className="text-sm sm:text-base font-black text-[#B45309] font-mono">{miniGameScore} pts</div>
                    <div className="text-[8.5px] text-[#64748B]">Practical Reflex</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* BOTTOM FOOTER: DUAL CERTIFIERS, SEAL & QR */}
            {/* ========================================================= */}
            <div className="relative z-10 pt-2 border-t border-[#E2E8F0] grid grid-cols-12 items-end gap-2 text-xs">
              {/* Left Column: Signatory 1 - นายกิตติศักดิ์ สร้อยจิตต์ */}
              <div className="col-span-5 text-left space-y-1">
                <div className="text-[11px] font-bold text-[#0B2545] font-sarabun">
                  {certLanguage === 'th' ? '( นายกิตติศักดิ์ สร้อยจิตต์ )' : '( Mr. Kittisak Soijit )'}
                </div>
                <div className="text-[9.5px] font-bold text-[#B45309]">
                  {certLanguage === 'th' ? 'ผู้จัดการศูนย์ TCT Academy' : 'Manager of TCT Academy'}
                </div>
                <div className="text-[8.5px] text-[#475569] font-semibold">
                  {certLanguage === 'th' ? 'ศูนย์ฝึกอบรมและพัฒนา TCT Academy • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด' : 'TCT Academy Personnel Development & Training Center'}
                </div>
                <div className="text-[8px] text-[#64748B] flex items-center gap-1 font-mono pt-0.5">
                  <Calendar className="w-2.5 h-2.5 text-[#B45309]" />
                  <span>{certLanguage === 'th' ? `วันที่: ${certificateDateTh}` : `Date: ${certificateDateEn}`}</span>
                </div>
              </div>

              {/* Center Column: Bottom Shield & ID */}
              <div className="col-span-2 flex flex-col items-center justify-center text-center">
                {!customBgImage && (
                  <div className="w-8 h-8 rounded-full bg-[#0F2A4A] border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-md mb-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                )}
                <div className="text-[7.5px] font-extrabold tracking-widest text-[#0F2A4A] uppercase font-mono">
                  TCT ACADEMY
                </div>
                <div className="text-[7px] text-[#64748B] font-mono mt-0.5">
                  ID: {certificateCode}
                </div>
              </div>

              {/* Right Column: Signatory 2 - นายนพดล บำรุงเกียรติ & QR */}
              <div className="col-span-5 flex items-end justify-end gap-2 text-right">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-[#0B2545] font-sarabun">
                    {certLanguage === 'th' ? '( นายนพดล บำรุงเกียรติ )' : '( Mr. Noppadol Bamrungkiat )'}
                  </div>
                  <div className="text-[9.5px] font-bold text-[#0B2545]">
                    {certLanguage === 'th' ? 'ผู้จัดการทั่วไปและผู้จัดการโรงงาน / ประธานที่ปรึกษาศูนย์ TCT Academy' : 'General & Factory Manager / Chairman of Advisory Board, TCT Academy'}
                  </div>
                  <div className="text-[8.5px] text-[#475569] font-bold font-mono">
                    บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
                  </div>
                </div>

                {/* QR Code Container Matching Template */}
                {!customBgImage && (
                  <div className="bg-white border border-amber-400 rounded-lg p-0.5 shadow-sm shrink-0 flex flex-col items-center">
                    <QrCode className="w-8 h-8 text-[#0B2545]" />
                    <div className="text-[5.5px] font-black bg-[#0F2A4A] text-white px-0.5 rounded font-mono uppercase mt-0.5">
                      TCT-SEAL
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )}

        {/* ========================================================================= */}
        {/* PAGE 2: BACK PAGE / TRANSCRIPT & COMPETENCY RECORD (A4)                   */}
        {/* ========================================================================= */}
        {(certPage === 'all' || certPage === 'back') && (
          <div className="flex flex-col items-center w-full">
            <div className="no-print mb-2 text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/40 px-3.5 py-1 rounded-full shadow">
              <span>📋 แผ่นที่ 2: ด้านหลัง ระเบียนผลสัมฤทธิ์และสมรรถนะ (A4 Official Transcript &amp; Competency Record)</span>
            </div>

            {orientation === 'portrait' ? (
              /* ===================================================== */
              /* PAGE 2 - PORTRAIT FORMAT (210 × 297 mm)               */
              /* ===================================================== */
              <div 
                ref={backPageRef}
                className="certificate-portrait-box certificate-page-portrait w-full max-w-[780px] min-h-0 sm:min-h-[850px] md:min-h-[1020px] aspect-[210/297] bg-[#FFFDF9] text-slate-800 rounded-2xl p-7 sm:p-9 relative overflow-hidden border-[6px] border-[#D97706] shadow-2xl transition-all font-sarabun flex flex-col justify-between"
                style={{
                  backgroundImage: 'radial-gradient(#E2E8F0 0.75px, transparent 0.75px)',
                  backgroundSize: '16px 16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 0 45px rgba(217, 119, 6, 0.09)',
                  boxSizing: 'border-box'
                }}
              >
                {/* Decorative Borders & Corners */}
                <div className="absolute inset-2 sm:inset-3 border-2 border-[#0F2A4A] rounded-xl pointer-events-none" />
                <div className="absolute inset-4 sm:inset-5 border border-[#D97706]/70 rounded-lg pointer-events-none" />
                <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-[#D97706] rounded-tl-sm pointer-events-none" />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-[#D97706] rounded-tr-sm pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-[#D97706] rounded-bl-sm pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-[#D97706] rounded-br-sm pointer-events-none" />

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <img 
                    src="/tct-academy-logo.svg" 
                    alt="" 
                    className="w-[380px] max-w-[60%] object-contain filter grayscale" 
                  />
                </div>

                {/* 1. Header */}
                <div className="relative z-10 text-center space-y-1.5 pb-2.5 border-b-2 border-[#E2E8F0]">
                  <div className="flex items-center justify-center gap-3">
                    <TCTLogo size="sm" variant="emblem" />
                    <div className="text-left">
                      <div className="text-sm sm:text-base font-black text-[#0B2545] tracking-tight uppercase">
                        TCT ACADEMY • TEIJIN CORD (THAILAND) CO., LTD.
                      </div>
                      <div className="text-[11px] font-bold text-[#B45309]">
                        ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development &amp; Training Center
                      </div>
                    </div>
                  </div>
                  <div className="pt-1">
                    <h2 className="text-base sm:text-lg font-black text-[#0F2A4A] uppercase tracking-wide">
                      {certLanguage === 'th' ? 'ระเบียนแสดงผลสัมฤทธิ์และสมรรถนะการฝึกอบรม' : 'OFFICIAL TRAINING TRANSCRIPT & COMPETENCY RECORD'}
                    </h2>
                    <p className="text-[10.5px] text-[#475569] font-medium">
                      {certLanguage === 'th' ? 'เอกสารแนบท้ายใบประกาศนียบัตร (ด้านหลัง / Page 2 of 2)' : 'Certificate Supplement & Transcript (Reverse Page 2 of 2)'}
                    </p>
                  </div>
                </div>

                {/* 2. Trainee Meta Info Strip */}
                <div className="relative z-10 bg-white/90 border border-slate-200 rounded-xl p-3 shadow-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#64748B] block text-[9.5px] uppercase font-bold">{certLanguage === 'th' ? 'เลขที่ใบรับรอง (Cert ID)' : 'Certificate No.'}:</span>
                      <span className="font-mono font-bold text-[#0F2A4A]">{certificateCode}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[9.5px] uppercase font-bold">{certLanguage === 'th' ? 'รหัสพนักงาน (Emp ID)' : 'Employee ID'}:</span>
                      <span className="font-mono font-bold text-[#0F2A4A]">{user.empId || 'EMP-001'}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[9.5px] uppercase font-bold">{certLanguage === 'th' ? 'ชื่อ-นามสกุล (Trainee)' : 'Trainee Name'}:</span>
                      <span className="font-bold text-[#0F2A4A]">{user.displayName || user.name || 'พนักงาน TCT'}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[9.5px] uppercase font-bold">{certLanguage === 'th' ? 'แผนก/สังกัด (Dept)' : 'Department'}:</span>
                      <span className="font-bold text-[#0F2A4A]">{user.department || 'ฝ่ายผลิต / ส่วนงานเทยิน'}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-[#64748B] text-[9.5px] uppercase font-bold mr-1.5">{certLanguage === 'th' ? 'หลักสูตร (Curriculum):' : 'Course:'}</span>
                      <span className="font-bold text-[#B45309]">{certLanguage === 'th' ? courseTitleTh : courseTitleEn}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {certLanguage === 'th' ? `วันที่รับรอง: ${certificateDateTh}` : `Issued Date: ${certificateDateEn}`}
                    </div>
                  </div>
                </div>

                {/* 3. Section 1: Course Modules Curriculum Breakdown */}
                <div className="relative z-10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>{certLanguage === 'th' ? '1. โครงสร้างหลักสูตรและผลสัมฤทธิ์รายโมดูล (Curriculum Breakdown)' : '1. Curriculum Structure & Module Breakdown'}</span>
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {certLanguage === 'th' ? 'รวมเวลาเรียน: 6.0 ชั่วโมง' : 'Total 6.0 Contact Hours'}
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                    <table className="w-full text-left text-[10.5px]">
                      <thead className="bg-[#0F2A4A] text-white font-bold text-[10px]">
                        <tr>
                          <th className="py-1.5 px-2.5 w-16">{certLanguage === 'th' ? 'รหัส' : 'Code'}</th>
                          <th className="py-1.5 px-2.5">{certLanguage === 'th' ? 'หัวข้อการเรียนรู้ / เนื้อหารายวิชา' : 'Module Subject & Topic'}</th>
                          <th className="py-1.5 px-2 text-center w-20">{certLanguage === 'th' ? 'ชั่วโมง' : 'Hours'}</th>
                          <th className="py-1.5 px-2 text-center w-24">{certLanguage === 'th' ? 'ผลประเมิน' : 'Result'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {courseModules.map((m, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="py-1.5 px-2.5 font-mono font-bold text-[#D97706]">{m.code}</td>
                            <td className="py-1.5 px-2.5 text-slate-800 font-medium">{certLanguage === 'th' ? m.titleTh : m.titleEn}</td>
                            <td className="py-1.5 px-2 text-center font-mono text-slate-600">{m.hours}</td>
                            <td className="py-1.5 px-2 text-center font-bold text-emerald-700 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{certLanguage === 'th' ? 'ผ่าน (Pass)' : 'Passed'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Section 2: Learning Metrics & Evaluation Comparison */}
                <div className="relative z-10 space-y-1.5">
                  <h3 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>{certLanguage === 'th' ? '2. ผลการประเมินและการพัฒนาศักยภาพ (Evaluation & Learning Gain)' : '2. Assessment & Learning Gain Metrics'}</span>
                  </h3>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-white border border-slate-200 rounded-lg p-2 text-center shadow-xs">
                      <div className="text-[9px] text-slate-500 font-bold uppercase">{certLanguage === 'th' ? 'ก่อนเรียน (Pre-Test)' : 'Pre-Test'}</div>
                      <div className="text-sm font-black text-slate-700 mt-0.5">{preScore} / 10</div>
                      <div className="text-[9px] text-slate-400 font-mono">({metrics.prePercentage}%)</div>
                    </div>
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-2 text-center shadow-xs">
                      <div className="text-[9px] text-emerald-700 font-bold uppercase">{certLanguage === 'th' ? 'หลังเรียน (Post-Test)' : 'Post-Test'}</div>
                      <div className="text-sm font-black text-emerald-800 mt-0.5">{postScore} / 10</div>
                      <div className="text-[9px] text-emerald-600 font-mono">({metrics.postPercentage}%)</div>
                    </div>
                    <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-2 text-center shadow-xs">
                      <div className="text-[9px] text-amber-700 font-bold uppercase">{certLanguage === 'th' ? 'พัฒนาการ (Growth)' : 'Skill Gain'}</div>
                      <div className="text-sm font-black text-[#B45309] mt-0.5">+{metrics.scoreDelta}%</div>
                      <div className="text-[9px] text-amber-600 font-mono">Normalized Gain</div>
                    </div>
                    <div className="bg-sky-50/60 border border-sky-200 rounded-lg p-2 text-center shadow-xs">
                      <div className="text-[9px] text-sky-700 font-bold uppercase">{certLanguage === 'th' ? 'ระดับผลสัมฤทธิ์' : 'Proficiency Tier'}</div>
                      <div className="text-[11px] font-black text-[#0B2545] mt-0.5 truncate">{certLanguage === 'th' ? (postScore === 10 ? 'ดีเยี่ยมยอด' : 'ดีเยี่ยม') : (postScore === 10 ? 'Distinction' : 'Excellent')}</div>
                      <div className="text-[9px] text-sky-600 font-mono">เกณฑ์ &gt; 80%</div>
                    </div>
                  </div>
                </div>

                {/* 5. Section 3: Certified Competency Matrix */}
                <div className="relative z-10 space-y-1.5">
                  <h3 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>{certLanguage === 'th' ? '3. เมทริกซ์การรับรองสมรรถนะรายบุคคล (Certified Competency Matrix)' : '3. Certified Core Competency Matrix'}</span>
                  </h3>

                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                    <table className="w-full text-left text-[10.5px]">
                      <thead className="bg-[#0F2A4A] text-white font-bold text-[10px]">
                        <tr>
                          <th className="py-1.5 px-2.5">{certLanguage === 'th' ? 'สมรรถนะหลักที่ผ่านการรับรอง (Core Competency)' : 'Core Competency'}</th>
                          <th className="py-1.5 px-2 text-center w-36">{certLanguage === 'th' ? 'ระดับความเชี่ยวชาญ' : 'Proficiency Standard'}</th>
                          <th className="py-1.5 px-2 text-center w-24">{certLanguage === 'th' ? 'การรับรอง' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {competencyMatrix.map((c, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="py-1.5 px-2.5 font-medium text-slate-800 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] shrink-0" />
                              <span>{certLanguage === 'th' ? c.nameTh : c.nameEn}</span>
                            </td>
                            <td className="py-1.5 px-2 text-center font-bold text-[#0F2A4A] text-[10px]">{c.level}</td>
                            <td className="py-1.5 px-2 text-center font-bold text-emerald-700 text-[10px]">{c.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6. Section 4: Accreditation Statement, Signatures & Stamp */}
                <div className="relative z-10 pt-2 border-t border-slate-200 space-y-3">
                  <div className="text-[9.5px] text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 text-justify">
                    {certLanguage === 'th'
                      ? 'หมายเหตุ: หลักสูตรทั้งหมด ออกแบบและพัฒนาโดย TCT Academy (ศูนย์ฝึกอบรมและพัฒนา บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด) บริหารงานโดย นาย ณฐวัตร พงษ์สาริกิจ หัวหน้าศูนย์ TCT Academy / หัวหน้าแผนกบุคคลและธุรการ Personnel, นายกิตติศักดิ์ สร้อยจิตต์ ผู้จัดการศูนย์ TCT Academy และนายนพดล บำรุงเกียรติ ผู้จัดการทั่วไปและผู้จัดการโรงงาน / ประธานที่ปรึกษาศูนย์ TCT Academy ผู้เข้ารับการอบรมผ่านการประเมินความรู้และสมรรถนะครบถ้วน 100%'
                      : 'Note: Curriculum designed & developed by TCT Academy (Teijin Cord Thailand Co., Ltd.) led by Mr. Nathawat Pongsarikit (Head of TCT Academy & Head of Personnel), Mr. Kittisak Soijit (Manager of TCT Academy), and Mr. Noppadol Bamrungkiat (General & Factory Manager / Chairman of Advisory Board). All competencies completed 100%.'}
                  </div>

                  {/* Certifiers Endorsement & Seal - All 3 Leaders + Official Seal */}
                  <div className="flex items-end justify-between px-1 pt-2 gap-2">
                    {/* 1. Personnel Head / Head of TCT Academy */}
                    <div className="text-center space-y-0.5 flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-[#0B2545] truncate">
                        {certLanguage === 'th' ? '( นายณฐวัตร พงษ์สาริกิจ )' : '( Mr. Nathawat Pongsarikit )'}
                      </div>
                      <div className="text-[8px] text-slate-600 font-medium leading-tight">
                        {certLanguage === 'th' ? 'หัวหน้าศูนย์ TCT Academy / หัวหน้าแผนกบุคคลและธุรการ' : 'Head of TCT Academy / Head of Personnel'}
                      </div>
                    </div>

                    {/* 2. Manager of TCT Academy */}
                    <div className="text-center space-y-0.5 flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-[#0B2545] truncate">
                        {certLanguage === 'th' ? '( นายกิตติศักดิ์ สร้อยจิตต์ )' : '( Mr. Kittisak Soijit )'}
                      </div>
                      <div className="text-[8px] text-slate-600 font-medium leading-tight">
                        {certLanguage === 'th' ? 'ผู้จัดการศูนย์ TCT Academy' : 'Manager of TCT Academy'}
                      </div>
                    </div>

                    {/* Center: Official Seal */}
                    <div className="flex flex-col items-center justify-center shrink-0 px-1">
                      <div className="w-13 h-13 rounded-full border-2 border-[#D97706] bg-amber-50/50 flex flex-col items-center justify-center text-center p-1 shadow-inner">
                        <Shield className="w-3.5 h-3.5 text-[#D97706]" />
                        <span className="text-[6px] font-black text-[#0B2545] font-mono tracking-tighter uppercase leading-none mt-0.5">TCT ACADEMY</span>
                        <span className="text-[5px] font-bold text-[#B45309] font-mono leading-none">VERIFIED</span>
                      </div>
                      <div className="text-[7.5px] font-mono text-slate-400 mt-0.5">{certificateCode}</div>
                    </div>

                    {/* 3. GM & Factory Manager / Chairman of Advisory Board */}
                    <div className="text-center space-y-0.5 flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-[#0B2545] truncate">
                        {certLanguage === 'th' ? '( นายนพดล บำรุงเกียรติ )' : '( Mr. Noppadol Bamrungkiat )'}
                      </div>
                      <div className="text-[8px] text-slate-600 font-bold leading-tight">
                        {certLanguage === 'th' ? 'ผู้จัดการทั่วไปและผู้จัดการโรงงาน / ประธานที่ปรึกษาศูนย์' : 'General & Factory Manager / Chairman of Advisory Board'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ===================================================== */
              /* PAGE 2 - LANDSCAPE FORMAT (297 × 210 mm)              */
              /* ===================================================== */
              <div 
                ref={backPageRef}
                className={`certificate-landscape-box certificate-page-landscape w-full ${
                  aspectRatio === '16:9'
                    ? 'max-w-[1060px] aspect-[16/9]'
                    : aspectRatio === '4:3'
                    ? 'max-w-[960px] aspect-[4/3]'
                    : 'max-w-[1060px] aspect-[297/210]'
                } bg-[#FFFDF9] text-slate-800 rounded-2xl p-6 sm:p-7 relative overflow-hidden border-[6px] border-[#D97706] shadow-2xl transition-all font-sarabun flex flex-col justify-between`}
                style={{
                  backgroundImage: 'radial-gradient(#E2E8F0 0.75px, transparent 0.75px)',
                  backgroundSize: '16px 16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 0 45px rgba(217, 119, 6, 0.09)',
                  boxSizing: 'border-box'
                }}
              >
                {/* Decorative Borders & Corners */}
                <div className="absolute inset-2 sm:inset-3 border-2 border-[#0F2A4A] rounded-xl pointer-events-none" />
                <div className="absolute inset-4 sm:inset-5 border border-[#D97706]/70 rounded-lg pointer-events-none" />
                <div className="absolute top-3 left-3 w-7 h-7 border-t-4 border-l-4 border-[#D97706] rounded-tl-sm pointer-events-none" />
                <div className="absolute top-3 right-3 w-7 h-7 border-t-4 border-r-4 border-[#D97706] rounded-tr-sm pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-7 h-7 border-b-4 border-l-4 border-[#D97706] rounded-bl-sm pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-7 h-7 border-b-4 border-r-4 border-[#D97706] rounded-br-sm pointer-events-none" />

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <img 
                    src="/tct-academy-logo.svg" 
                    alt="" 
                    className="w-[320px] max-w-[60%] object-contain filter grayscale" 
                  />
                </div>

                {/* Top Header */}
                <div className="relative z-10 flex items-center justify-between pb-2 border-b-2 border-[#E2E8F0]">
                  <div className="flex items-center gap-2.5">
                    <TCTLogo size="sm" variant="emblem" />
                    <div>
                      <div className="text-xs sm:text-sm font-black text-[#0B2545] tracking-tight uppercase">
                        TCT ACADEMY • TEIJIN CORD (THAILAND) CO., LTD.
                      </div>
                      <div className="text-[10px] font-bold text-[#B45309]">
                        ศูนย์ฝึกอบรมและพัฒนา TCT Academy Personnel Development &amp; Training Center
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-sm sm:text-base font-black text-[#0F2A4A] uppercase tracking-wide">
                      {certLanguage === 'th' ? 'ระเบียนแสดงผลสัมฤทธิ์และสมรรถนะการฝึกอบรม (OFFICIAL TRANSCRIPT)' : 'OFFICIAL TRAINING TRANSCRIPT & COMPETENCY RECORD'}
                    </h2>
                    <p className="text-[9.5px] text-[#475569] font-medium font-mono">
                      {certificateCode} • {certLanguage === 'th' ? 'ด้านหลัง Page 2 of 2' : 'Reverse Page 2 of 2'}
                    </p>
                  </div>
                </div>

                {/* Meta Bar */}
                <div className="relative z-10 bg-white/90 border border-slate-200 rounded-lg px-3 py-1.5 shadow-xs flex items-center justify-between text-[10.5px]">
                  <div>
                    <span className="text-[#64748B] text-[9.5px] uppercase font-bold mr-1">Trainee:</span>
                    <span className="font-bold text-[#0F2A4A] mr-3">{user.displayName || user.name || 'พนักงาน TCT'} ({user.empId || 'EMP'})</span>
                    <span className="text-[#64748B] text-[9.5px] uppercase font-bold mr-1">Dept:</span>
                    <span className="font-bold text-[#0F2A4A]">{user.department || 'TCT Staff'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] text-[9.5px] uppercase font-bold mr-1">Course:</span>
                    <span className="font-bold text-[#B45309]">{certLanguage === 'th' ? courseTitleTh : courseTitleEn}</span>
                  </div>
                </div>

                {/* 2-Column Main Content for Landscape */}
                <div className="relative z-10 grid grid-cols-12 gap-3.5 my-1.5">
                  {/* Left Column (7 cols): Modules & Evaluation */}
                  <div className="col-span-7 space-y-2">
                    {/* Modules Table */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#0B2545] uppercase flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-[#D97706]" />
                          <span>{certLanguage === 'th' ? '1. รายวิชาและเวลาเรียน (Curriculum)' : '1. Curriculum Structure'}</span>
                        </span>
                        <span className="text-[9.5px] font-bold text-emerald-700">6.0 Contact Hours (Pass 100%)</span>
                      </div>
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                        <table className="w-full text-left text-[10px]">
                          <thead className="bg-[#0F2A4A] text-white font-bold text-[9.5px]">
                            <tr>
                              <th className="py-1 px-2 w-14">{certLanguage === 'th' ? 'รหัส' : 'Code'}</th>
                              <th className="py-1 px-2">{certLanguage === 'th' ? 'หัวข้อการเรียนรู้' : 'Module Subject'}</th>
                              <th className="py-1 px-1.5 text-center w-14">{certLanguage === 'th' ? 'เวลา' : 'Hrs'}</th>
                              <th className="py-1 px-1.5 text-center w-16">{certLanguage === 'th' ? 'ผล' : 'Status'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {courseModules.map((m, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                <td className="py-1 px-2 font-mono font-bold text-[#D97706]">{m.code}</td>
                                <td className="py-1 px-2 text-slate-800 font-medium truncate max-w-[240px]">{certLanguage === 'th' ? m.titleTh : m.titleEn}</td>
                                <td className="py-1 px-1.5 text-center font-mono text-slate-600">{m.hours}</td>
                                <td className="py-1 px-1.5 text-center font-bold text-emerald-700">ผ่าน (Pass)</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Scores Grid */}
                    <div className="grid grid-cols-4 gap-1.5">
                      <div className="bg-white border border-slate-200 rounded-md p-1.5 text-center shadow-xs">
                        <div className="text-[8.5px] text-slate-500 font-bold uppercase">{certLanguage === 'th' ? 'ก่อนเรียน' : 'Pre-Test'}</div>
                        <div className="text-xs font-black text-slate-700">{preScore} / 10 ({metrics.prePercentage}%)</div>
                      </div>
                      <div className="bg-emerald-50/60 border border-emerald-200 rounded-md p-1.5 text-center shadow-xs">
                        <div className="text-[8.5px] text-emerald-700 font-bold uppercase">{certLanguage === 'th' ? 'หลังเรียน' : 'Post-Test'}</div>
                        <div className="text-xs font-black text-emerald-800">{postScore} / 10 ({metrics.postPercentage}%)</div>
                      </div>
                      <div className="bg-amber-50/60 border border-amber-200 rounded-md p-1.5 text-center shadow-xs">
                        <div className="text-[8.5px] text-amber-700 font-bold uppercase">{certLanguage === 'th' ? 'พัฒนาการ' : 'Skill Gain'}</div>
                        <div className="text-xs font-black text-[#B45309]">+{metrics.scoreDelta}%</div>
                      </div>
                      <div className="bg-sky-50/60 border border-sky-200 rounded-md p-1.5 text-center shadow-xs">
                        <div className="text-[8.5px] text-sky-700 font-bold uppercase">{certLanguage === 'th' ? 'เกณฑ์ประเมิน' : 'Result'}</div>
                        <div className="text-xs font-black text-[#0B2545]">{certLanguage === 'th' ? 'ดีเยี่ยม' : 'Excellent'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (5 cols): Competencies & Notes */}
                  <div className="col-span-5 space-y-2">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[#0B2545] uppercase flex items-center gap-1">
                        <Award className="w-3 h-3 text-[#D97706]" />
                        <span>{certLanguage === 'th' ? '2. เมทริกซ์การรับรองสมรรถนะ (Competency)' : '2. Certified Competencies'}</span>
                      </span>
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                        <table className="w-full text-left text-[10px]">
                          <thead className="bg-[#0F2A4A] text-white font-bold text-[9.5px]">
                            <tr>
                              <th className="py-1 px-2">{certLanguage === 'th' ? 'สมรรถนะที่ผ่านการรับรอง' : 'Core Competency'}</th>
                              <th className="py-1 px-1.5 text-center w-20">{certLanguage === 'th' ? 'สถานะ' : 'Status'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {competencyMatrix.map((c, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                <td className="py-1 px-2 font-medium text-slate-800 truncate max-w-[190px]">
                                  {certLanguage === 'th' ? c.nameTh : c.nameEn}
                                </td>
                                <td className="py-1 px-1.5 text-center font-bold text-emerald-700 text-[9px]">Certified</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="text-[8.5px] text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {certLanguage === 'th'
                        ? 'หมายเหตุ: หลักสูตรทั้งหมด ออกแบบและพัฒนาโดย TCT Academy บริหารงานโดย นาย ณฐวัตร พงษ์สาริกิจ (หัวหน้าศูนย์ TCT Academy / หัวหน้าแผนกบุคคลและธุรการ Personnel), นายกิตติศักดิ์ สร้อยจิตต์ (ผู้จัดการศูนย์ TCT Academy) และนายนพดล บำรุงเกียรติ (ผู้จัดการทั่วไปและผู้จัดการโรงงาน / ประธานที่ปรึกษาศูนย์ TCT Academy)'
                        : 'Official transcript: Curriculum designed & developed by TCT Academy. Executive Committee: Mr. Nathawat Pongsarikit (Head of TCT Academy & Head of Personnel), Mr. Kittisak Soijit (Manager of TCT Academy), and Mr. Noppadol Bamrungkiat (General & Factory Manager / Chairman of Advisory Board).'}
                    </div>
                  </div>
                </div>

                {/* Bottom Endorsement & Seal Bar - All 3 Leaders + Official Seal */}
                <div className="relative z-10 pt-2 border-t border-slate-200 flex items-end justify-between px-2 gap-2">
                  <div className="text-center space-y-0.5 flex-1 min-w-0">
                    <div className="text-[9px] font-bold text-[#0B2545] truncate">
                      {certLanguage === 'th' ? '( นายณฐวัตร พงษ์สาริกิจ )' : '( Mr. Nathawat Pongsarikit )'}
                    </div>
                    <div className="text-[7px] text-slate-600 font-medium leading-tight">
                      {certLanguage === 'th' ? 'หัวหน้าศูนย์ TCT Academy / หัวหน้าแผนกบุคคลและธุรการ' : 'Head of TCT Academy / Head of Personnel'}
                    </div>
                  </div>

                  <div className="text-center space-y-0.5 flex-1 min-w-0">
                    <div className="text-[9px] font-bold text-[#0B2545] truncate">
                      {certLanguage === 'th' ? '( นายกิตติศักดิ์ สร้อยจิตต์ )' : '( Mr. Kittisak Soijit )'}
                    </div>
                    <div className="text-[7px] text-slate-600 font-medium leading-tight">
                      {certLanguage === 'th' ? 'ผู้จัดการศูนย์ TCT Academy' : 'Manager of TCT Academy'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 px-1">
                    <div className="w-9 h-9 rounded-full border border-[#D97706] bg-amber-50/50 flex flex-col items-center justify-center text-center">
                      <Shield className="w-3 h-3 text-[#D97706]" />
                      <span className="text-[5px] font-black text-[#0B2545] uppercase leading-none">VERIFIED</span>
                    </div>
                    <div className="text-left">
                      <div className="text-[8.5px] font-mono font-bold text-[#0F2A4A]">{certificateCode}</div>
                      <div className="text-[7px] text-slate-400 font-mono">Date: {certificateDateEn}</div>
                    </div>
                  </div>

                  <div className="text-center space-y-0.5 flex-1 min-w-0">
                    <div className="text-[9px] font-bold text-[#0B2545] truncate">
                      {certLanguage === 'th' ? '( นายนพดล บำรุงเกียรติ )' : '( Mr. Noppadol Bamrungkiat )'}
                    </div>
                    <div className="text-[7px] text-slate-600 font-bold leading-tight">
                      {certLanguage === 'th' ? 'ผู้จัดการทั่วไปและผู้จัดการโรงงาน / ประธานที่ปรึกษาศูนย์' : 'General & Factory Manager / Chairman'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

