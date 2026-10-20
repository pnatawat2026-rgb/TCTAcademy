import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  ExternalLink, 
  Tv, 
  Maximize2, 
  Minimize2, 
  X, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  VolumeX,
  ChevronUp, 
  ChevronDown, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Headphones,
  Copy,
  Check,
  BookOpen,
  Radio,
  Eye,
  Activity,
  CheckCheck,
  MessageSquare,
  MonitorPlay,
  Flame,
  Settings,
  Info,
  Upload,
  FileVideo,
  Trash2
} from 'lucide-react';
import { 
  getModuleVideoConfig, 
  checkIsVideoWatched, 
  markVideoAsWatched, 
  getVideoWatchSeconds, 
  saveVideoWatchSeconds, 
  isNotebookLMUrl,
  ModuleVideoConfig 
} from '../utils/videoManager';
import { getLocalVideoFile, saveLocalVideoFile, deleteLocalVideoFile } from '../utils/videoStorage';
import { playCyberClick, playSuccessChime } from '../utils/soundEffects';

export interface SubtitleCue {
  start: number;
  end: number;
  speaker: string;
  text: string;
  step?: string;
}

export function getLessonSubtitles(courseId: string, moduleId: number): SubtitleCue[] {
  if (courseId === 'kyt-shisa-kanko') {
    if (moduleId === 1) {
      return [
        {
          start: 0,
          end: 25,
          speaker: 'ผู้บรรยาย TCT',
          step: 'บทนำ • จิตวิทยาความปลอดภัย',
          text: 'ยินดีต้อนรับสู่หลักสูตร KYT & Shisa Kanko การคาดการณ์อันตรายและเทคนิคมือชี้-ปากย้ำ บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด'
        },
        {
          start: 25,
          end: 55,
          speaker: 'สถิติสากล',
          step: 'Human Error > 80%',
          text: 'สถิติชี้ชัด: อุบัติเหตุกว่า 80% เกิดจากความผิดพลาดของมนุษย์ (Human Error) จากความเผลอเรอและความเคยชิน (Automatic Pilot)'
        },
        {
          start: 55,
          end: 95,
          speaker: 'ที่มาและประสิทธิผล',
          step: 'ลดอุบัติเหตุ 50-70%',
          text: 'เทคนิค Shisa Kanko (Point & Call) จากระบบรถไฟและโรงงานญี่ปุ่น พิสูจน์แล้วว่าช่วยลดความผิดพลาดและอุบัติเหตุลงได้ถึง 50% - 70%'
        },
        {
          start: 95,
          end: 140,
          speaker: 'กลไกสรีรวิทยา',
          step: '4 ประสาทสัมผัส',
          text: 'กลไก 4 ประสาทสัมผัส: ตาเพ่งมองวัตถุ, มือชี้เป้าหมาย, ปากเปล่งเสียงเรียก, และสมองประมวลผลยืนยัน กระตุ้นสติและความตื่นตัวขึ้น 3 เท่า'
        },
        {
          start: 140,
          end: 185,
          speaker: 'วิทยาศาสตร์พิสูจน์แล้ว',
          step: 'ข้อผิดพลาดลด 6 เท่า',
          text: 'การมองด้วยตาอย่างเดียว มีโอกาสผิดพลาด 2.38 ต่อ 100 ครั้ง แต่เมื่อชี้และส่งเสียง โอกาสผิดพลาดลดเหลือเพียง 0.38 ต่อ 100 ครั้ง'
        },
        {
          start: 185,
          end: 230,
          speaker: 'หลักการปฏิบัติงาน',
          step: 'ขจัดความคุ้นชิน',
          text: 'ความคุ้นชินคือศัตรูตัวร้าย ยิ่งชำนาญยิ่งต้องไม่ประมาท ฝึกฝน Shisa Kanko ในทุกจุดตรวจเพื่อปกป้องตนเองและเพื่อนร่วมงาน'
        },
        {
          start: 230,
          end: 420,
          speaker: 'พันธสัญญา TCT',
          step: 'Zero Accident Culture',
          text: 'ร่วมสร้างวัฒนธรรมความปลอดภัย อุบัติเหตุต้องเป็นศูนย์ ท่านสามารถกดปุ่ม "ดูวิดีโอสำเร็จแล้ว" เพื่อปลดล็อคแบบทดสอบท้ายบทได้ทันที'
        }
      ];
    }
    if (moduleId === 2) {
      return [
        {
          start: 0,
          end: 25,
          speaker: 'ผู้บรรยาย TCT',
          step: '4-Step Mastery',
          text: 'วิดีโอบทที่ 2: เจาะลึก 4 ขั้นตอนมาตรฐานของ Shisa Kanko (Prepare • Point • Voice • Confirm)'
        },
        {
          start: 25,
          end: 65,
          speaker: 'ขั้นตอนที่ 1',
          step: 'Step 1: เตรียมพร้อม (Prepare)',
          text: 'Step 1 เตรียมพร้อม (Prepare): หยุดนิ่ง มีสมาธิ จ้องมองจุดที่จะตรวจสอบอย่างตั้งใจ รวบรวมสมาธิ 1 วินาที'
        },
        {
          start: 65,
          end: 110,
          speaker: 'ขั้นตอนที่ 2',
          step: 'Step 2: ชี้ (Point)',
          text: 'Step 2 ชี้ (Point): ก้าวเท้าเล็กน้อย ยื่นแขนขวาเหยียดตรง นิ้วชี้ตรงไปยังเป้าหมาย ระยะห่าง 30-50 ซม. สายตามองตามปลายนิ้ว'
        },
        {
          start: 110,
          end: 155,
          speaker: 'ขั้นตอนที่ 3',
          step: 'Step 3: พูด (Voice/Call)',
          text: 'Step 3 พูด (Voice/Call): เปล่งเสียงชัดเจน หนักแน่นจากช่องท้อง ระบุชื่ออุปกรณ์และสถานะ เช่น "เกจวัดแรงดัน...", "สวิตช์ฉุกเฉิน..."'
        },
        {
          start: 155,
          end: 200,
          speaker: 'ขั้นตอนที่ 4',
          step: 'Step 4: ยืนยัน (Confirm)',
          text: 'Step 4 ยืนยัน (Confirm): ดึงมือกลับระดับอกหรือข้างศีรษะ พร้อมเปล่งคำยืนยันเสียงดังฟังชัด "ปกติ! โยชิ!"'
        },
        {
          start: 200,
          end: 245,
          speaker: 'ข้อควรระวังสำคัญ',
          step: 'ขจัด Phantom Pointing',
          text: 'ระวังพฤติกรรม Phantom Pointing หรือการชี้หลอกตา ชี้ลวกๆ โดยไม่มองจริง ซึ่งเป็นบ่อเกิดของอุบัติเหตุ'
        },
        {
          start: 245,
          end: 360,
          speaker: 'มาตรฐาน TCT',
          step: 'พร้อมสู่แบบทดสอบ',
          text: 'ฝึกฝน 4 ขั้นตอนจนเป็นอัตโนมัติ ท่านสามารถกดปุ่ม "ดูวิดีโอสำเร็จแล้ว" เพื่อปลดล็อคแบบทดสอบท้ายบท (Quiz) ได้ทันที'
        }
      ];
    }
    if (moduleId === 3) {
      return [
        {
          start: 0,
          end: 30,
          speaker: 'ผู้บรรยาย TCT',
          step: 'สรีรศาสตร์และท่ายืน',
          text: 'วิดีโอบทที่ 3: สรีรศาสตร์ ท่ายืน และการวางตำแหน่งมือตามหลักกายวิภาคศาสตร์'
        },
        {
          start: 30,
          end: 80,
          speaker: 'ท่ายืนมาตรฐาน',
          step: 'ขาแยกกว้างเท่าหัวไหล่',
          text: 'ท่ายืนมาตรฐาน: ขาแยกกว้างเท่าหัวไหล่ ลำตัวตั้งตรง ไม่เอนหน้าหรือแอ่นหลัง น้ำหนักกระจายสองขาอย่างสมดุล'
        },
        {
          start: 80,
          end: 140,
          speaker: 'ตำแหน่งแขนและนิ้ว',
          step: 'แขนเหยียดตรง 45 องศา',
          text: 'แขนขวาเหยียดตรง ทำมุม 45 องศา นิ้วชี้ตรงไปที่จุดตรวจสอบ นิ้วที่เหลือกำแน่นโดยมีนิ้วโป้งกดทับ'
        },
        {
          start: 140,
          end: 200,
          speaker: 'แนวสายตา',
          step: 'สายตามองตามปลายนิ้ว',
          text: 'สายตาต้องจับจ้องตามแนวปลายนิ้วไปยังเป้าหมาย ไม่มองลอยหรือชี้ไปทางแต่มองไปอีกทาง'
        },
        {
          start: 200,
          end: 360,
          speaker: 'สติมั่นคง',
          step: 'พร้อมทำแบบทดสอบ',
          text: 'ท่ายืนที่มั่นคงนำไปสู่สติที่ตื่นตัว เมื่อศึกษาจบแล้ว สามารถกดทำแบบทดสอบท้ายบทได้ทันที'
        }
      ];
    }
    if (moduleId === 4) {
      return [
        {
          start: 0,
          end: 30,
          speaker: 'ผู้บรรยาย TCT',
          step: 'การเปล่งเสียงยืนยัน',
          text: 'วิดีโอบทที่ 4: ศิลปะการเปล่งเสียง และกฎทองของการยืนยัน 3 รูปแบบ (Solo, Mutual, Group)'
        },
        {
          start: 30,
          end: 80,
          speaker: 'กฎทองแห่งเสียง',
          step: 'เสียงชัดเจนจากกระบังลม',
          text: 'เปล่งเสียงจากกระบังลม ชัดถ้อยชัดคำ ไม่พึมพำในลำคอ เสียงดังพอเหมาะให้สมองรับรู้และเพื่อนร่วมงานได้ยิน'
        },
        {
          start: 80,
          end: 140,
          speaker: '3 รูปแบบการยืนยัน',
          step: 'Solo • Mutual • Call-Response',
          text: '1. Solo: ตรวจคนเดียวประจำวัน 2. Mutual: ตรวจสอบคู่ขานรับงานเสี่ยง 3. Call-Response: ขานรับพร้อมเพรียงก่อนเริ่มงาน'
        },
        {
          start: 140,
          end: 200,
          speaker: 'คำยืนยันสากล',
          step: '"ปกติ! โยชิ!"',
          text: 'ใช้คำยืนยันที่เป็นเอกฉันท์ เช่น "ปกติ! โยชิ!", "เรียบร้อย! โยชิ!" เพื่อเป็นสัญญาณว่าระบบปลอดภัยสมบูรณ์'
        },
        {
          start: 200,
          end: 360,
          speaker: 'สรุปบทเรียน',
          step: 'พร้อมทำแบบทดสอบ',
          text: 'การยืนยันคือคำมั่นสัญญาความปลอดภัยต่อเพื่อนร่วมงานและตนเอง เมื่อดูจบแล้ว เข้าสู่แบบทดสอบท้ายบทได้ทันที'
        }
      ];
    }
    if (moduleId === 5) {
      return [
        {
          start: 0,
          end: 30,
          speaker: 'ผู้บรรยาย TCT',
          step: '5 สถานการณ์หน้างาน TCT',
          text: 'วิดีโอบทที่ 5: การประยุกต์ใช้ Shisa Kanko ใน 5 สถานการณ์จริงในโรงงานผลิตเส้นคอร์ด TCT'
        },
        {
          start: 30,
          end: 90,
          speaker: 'สถานการณ์ 1 & 2',
          step: 'Machine Inspection & Mold',
          text: 'ตรวจเกจวัดแรงดัน (Pressure Gauge), การ์ดป้องกันเครื่องจักร (Safety Guard), และการขันน็อตแม่พิมพ์ด้วยประแจทอร์ค'
        },
        {
          start: 90,
          end: 150,
          speaker: 'สถานการณ์ 3',
          step: 'Lockout-Tagout (LOTO)',
          text: 'การตัดแยกพลังงานไฟฟ้า เบรกเกอร์ Off, คล้องกุญแจ Master Lock, แขวนป้าย และทดสอบ Zero Energy'
        },
        {
          start: 150,
          end: 210,
          speaker: 'สถานการณ์ 4 & 5',
          step: 'QC & Safety Patrol 5S',
          text: 'QC ตรวจสภาพเส้นคอร์ดและสีของผ้าใบ, และการเดินตรวจ Safety Patrol ทางเดินสีเขียวและอุปกรณ์ดับเพลิง'
        },
        {
          start: 210,
          end: 360,
          speaker: 'มาตรฐานหน้างาน',
          step: 'พร้อมทำแบบทดสอบ',
          text: 'พบสิ่งผิดปกติแม้เล็กน้อยให้หยุดเครื่องทันที ชี้ด้วยมือ ยืนยันด้วยใจ โรงงาน TCT ปลอดภัย 100%'
        }
      ];
    }
    if (moduleId === 6) {
      return [
        {
          start: 0,
          end: 30,
          speaker: 'ผู้บรรยาย TCT',
          step: 'เกณฑ์ประเมิน 4 มิติ',
          text: 'วิดีโอบทที่ 6: เกณฑ์การประเมินผล 4 มิติ และพันธสัญญาความปลอดภัยสู่ Zero Accident'
        },
        {
          start: 30,
          end: 90,
          speaker: 'เกณฑ์ 4 มิติ',
          step: 'Posture • Vocal • Sequence • Alert',
          text: 'เกณฑ์ประเมิน: 1. ท่าทางสรีรศาสตร์ 2. ความชัดเจนของเสียง 3. ลำดับ 4 ขั้นตอนครบถ้วน 4. ความตื่นตัวและมั่นใจ'
        },
        {
          start: 90,
          end: 150,
          speaker: 'ระบบบัดดี้คู่หู',
          step: 'Buddy Assessment',
          text: 'ระบบ Buddy System (Option B) ร่วมสังเกตและประเมินผลซึ่งกันและกันอย่างสร้างสรรค์เพื่อช่วยกันปรับปรุง'
        },
        {
          start: 150,
          end: 210,
          speaker: 'Safety Pledge',
          step: 'พันธสัญญาความปลอดภัย',
          text: 'การลงนาม Safety Pledge ร่วมสัญญาว่าจะทำ Shisa Kanko ทุกวัน เพื่อตนเอง ครอบครัว และโรงงาน TCT'
        },
        {
          start: 210,
          end: 360,
          speaker: 'Zero Accident',
          step: 'พร้อมทำแบบทดสอบ',
          text: 'เป้าหมายสูงสุดคืออุบัติเหตุเป็นศูนย์อย่างยั่งยืน เมื่อรับชมจบแล้ว สามารถเข้าสู่แบบทดสอบท้ายบทได้ทันที'
        }
      ];
    }
  }

  if (courseId === 'ai-for-tct') {
    if (moduleId === 1) {
      return [
        {
          start: 0,
          end: 30,
          speaker: 'AI Instructor',
          step: 'TCT-AI-101 บทนำ',
          text: 'ยินดีต้อนรับสู่หลักสูตร AI for TCT: ปัญญาประดิษฐ์เพื่อการเพิ่มประสิทธิภาพและความปลอดภัยในการทำงาน'
        },
        {
          start: 30,
          end: 80,
          speaker: 'Generative AI',
          step: 'AI ในโรงงาน TCT',
          text: 'ทำความเข้าใจ Generative AI และเครื่องมือ AI อัจฉริยะในการวิเคราะห์ข้อมูล สรุปรายงาน และช่วยเพิ่มประสิทธิภาพการทำงาน'
        },
        {
          start: 80,
          end: 140,
          speaker: 'การประยุกต์ใช้',
          step: 'ฝ่ายผลิต ธุรการ จัดซื้อ QA',
          text: 'แนวทางการประยุกต์ใช้ AI ในแผนกต่างๆ เช่น การตรวจสอบเอกสาร การร่างอีเมล การจัดตารางงาน และการวิเคราะห์แนวโน้ม'
        },
        {
          start: 140,
          end: 420,
          speaker: 'สรุปบทเรียน',
          step: 'พร้อมทดสอบ',
          text: 'เตรียมความพร้อมบุคลากร TCT สู่ยุคดิจิทัล ท่านสามารถกดปุ่ม "ดูวิดีโอสำเร็จแล้ว" เพื่อปลดล็อคแบบทดสอบท้ายบท'
        }
      ];
    }
    if (moduleId === 2) {
      return [
        {
          start: 0,
          end: 30,
          speaker: 'Security Advisor',
          step: 'Data Privacy & Security',
          text: 'บทเรียนที่ 2: Data Privacy & Information Security — การรักษาความลับของข้อมูล ความมั่นคงปลอดภัยสารสนเทศ'
        },
        {
          start: 30,
          end: 80,
          speaker: 'กฎเหล็กความปลอดภัย',
          step: 'ห้ามใส่ข้อมูลลับ',
          text: 'กฎเหล็ก: ห้ามนำสูตรเคมี ข้อมูลกระบวนการผลิต ข้อมูลลับบริษัท และข้อมูลส่วนบุคคล (PDPA) เข้าสู่ Public AI สาธารณะเด็ดขาด'
        },
        {
          start: 80,
          end: 140,
          speaker: 'มาตรการปกป้องข้อมูล',
          step: 'PDPA & TCT Policy',
          text: 'ปฏิบัติตามมาตรฐาน พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล และนโยบายความมั่นคงปลอดภัยสารสนเทศของบริษัท เทยิน คอร์ด (ประเทศไทย)'
        },
        {
          start: 140,
          end: 480,
          speaker: 'สรุปความปลอดภัย',
          step: 'พร้อมทดสอบ',
          text: 'ตระหนักรู้ ปฏิบัติตามกฎ และใช้ AI อย่างปลอดภัย ท่านสามารถกดปุ่ม "ดูวิดีโอสำเร็จแล้ว" เพื่อปลดล็อคแบบทดสอบท้ายบท'
        }
      ];
    }
  }

  // Generic fallback
  return [
    {
      start: 0,
      end: 30,
      speaker: 'ผู้บรรยาย TCT',
      step: 'บทนำบทเรียน',
      text: `ยินดีต้อนรับสู่วิดีโอบทเรียนอิเล็กทรอนิกส์ บทที่ ${moduleId} บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด`
    },
    {
      start: 30,
      end: 120,
      speaker: 'เนื้อหาหลัก',
      step: 'สาระสำคัญ',
      text: 'ศึกษาเนื้อหาและทำความเข้าใจแนวคิดหลักตามมาตรฐานความปลอดภัยและการปฏิบัติงานขององค์กร'
    },
    {
      start: 120,
      end: 600,
      speaker: 'สรุปผล',
      step: 'พร้อมทดสอบ',
      text: 'ท่านสามารถกดปุ่ม "ดูวิดีโอสำเร็จแล้ว" เพื่อปลดล็อคแบบทดสอบท้ายบท (Quiz) และสะสมคะแนนได้ทันที'
    }
  ];
}

interface ModuleVideoPlayerProps {
  moduleId: number;
  courseId?: string;
  empId: string;
  onVideoComplete?: () => void;
  isAlreadyCompleted?: boolean;
  onSelectModule?: (moduleId: number) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const ModuleVideoPlayer: React.FC<ModuleVideoPlayerProps> = ({
  moduleId,
  courseId = 'advanced-preventive-maintenance',
  empId,
  onVideoComplete,
  isAlreadyCompleted = false,
  onSelectModule
}) => {
  // If AI course, completely disable and hide video player per user request
  if (courseId === 'ai-for-tct') {
    return null;
  }

  const isKyt = courseId === 'kyt-shisa-kanko';
  const [currentEp, setCurrentEp] = useState<number>(moduleId);

  useEffect(() => {
    setCurrentEp(moduleId);
  }, [moduleId]);

  const activeEp = isKyt ? currentEp : moduleId;

  const [videoConfig, setVideoConfig] = useState<ModuleVideoConfig>(() => getModuleVideoConfig(moduleId, courseId));
  const [isWatched, setIsWatched] = useState<boolean>(() => isAlreadyCompleted || checkIsVideoWatched(empId, moduleId, courseId));
  const [isFloating, setIsFloating] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  
  // Local video file state from IndexedDB
  const [localVideo, setLocalVideo] = useState<{ objectUrl: string; fileName: string; fileSize: number } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoElemRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let isMounted = true;
    getLocalVideoFile(courseId, moduleId).then((res) => {
      if (isMounted && res) {
        setLocalVideo(res);
      }
    });

    const handler = (e: any) => {
      if (e.detail?.courseId === courseId && e.detail?.moduleId === moduleId) {
        getLocalVideoFile(courseId, moduleId).then((res) => {
          if (isMounted) setLocalVideo(res);
        });
      }
    };
    window.addEventListener('tct_video_file_updated', handler);
    return () => {
      isMounted = false;
      window.removeEventListener('tct_video_file_updated', handler);
    };
  }, [courseId, moduleId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const objUrl = await saveLocalVideoFile(courseId, moduleId, file, file.name);
      setLocalVideo({
        objectUrl: objUrl,
        fileName: file.name,
        fileSize: file.size
      });
      setShowNotification(`แนบไฟล์วิดิโอ "${file.name}" เรียบร้อยแล้ว พร้อมเล่นได้ทันที`);
      setTimeout(() => setShowNotification(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteLocalVideo = async () => {
    if (confirm('คุณต้องการลบไฟล์วิดิโอที่แนบไว้สำหรับบทเรียนนี้ใช่หรือไม่?')) {
      await deleteLocalVideoFile(courseId, moduleId);
      setLocalVideo(null);
      setShowNotification('ลบไฟล์วิดิโอเรียบร้อยแล้ว');
      setTimeout(() => setShowNotification(null), 3000);
    }
  };
  
  const [watchSeconds, setWatchSeconds] = useState<number>(() => {
    const saved = getVideoWatchSeconds(empId, moduleId, courseId);
    if (isAlreadyCompleted || checkIsVideoWatched(empId, moduleId, courseId)) {
      const cfg = getModuleVideoConfig(moduleId, courseId);
      return Math.max(saved, cfg.defaultDurationSec);
    }
    return saved;
  });

  const [videoDuration, setVideoDuration] = useState<number>(() => {
    const cfg = getModuleVideoConfig(moduleId, courseId);
    return cfg.defaultDurationSec || 300;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [skipWarning, setSkipWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const isNotebookLM = isNotebookLMUrl(videoConfig.youtubeUrl);

  const containerRef = useRef<HTMLDivElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);
  const maxAllowedTimeRef = useRef<number>(watchSeconds);
  const lastSpokenCueRef = useRef<string>('');

  const cues = getLessonSubtitles(courseId, activeEp);
  const activeCue = cues.find(c => watchSeconds >= c.start && watchSeconds < c.end) || cues[0];

  const handleSeek = (targetSec: number) => {
    const clamped = Math.max(0, Math.min(videoDuration, targetSec));
    setWatchSeconds(clamped);
    if (!isWatched) {
      maxAllowedTimeRef.current = Math.max(maxAllowedTimeRef.current, clamped);
    }
    saveVideoWatchSeconds(empId, activeEp, clamped, courseId);
    if (clamped >= Math.max(60, videoDuration - 3)) {
      handleCompleteVideo();
    }
  };

  const handleToggleFullscreen = () => {
    playCyberClick();
    if (!document.fullscreenElement) {
      playerWrapperRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Speech narration when cue changes while playing
  useEffect(() => {
    if (isNotebookLM && isPlaying && !isMuted && activeCue && showCaptions) {
      if (lastSpokenCueRef.current !== activeCue.text) {
        lastSpokenCueRef.current = activeCue.text;
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(activeCue.text);
            utterance.lang = 'th-TH';
            utterance.rate = playbackSpeed;
            window.speechSynthesis.speak(utterance);
          } catch (e) {
            // Ignored if speech unavailable
          }
        }
      }
    } else if (!isPlaying || isMuted) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
    }
  }, [isNotebookLM, isPlaying, isMuted, activeCue, showCaptions, playbackSpeed]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
    };
  }, []);

  const handleCopyLink = () => {
    playCyberClick();
    navigator.clipboard.writeText(videoConfig.youtubeUrl);
    setCopied(true);
    setShowNotification('📋 คัดลอกลิงก์ Google NotebookLM เรียบร้อยแล้ว!');
    setTimeout(() => {
      setCopied(false);
      setShowNotification(null);
    }, 4000);
  };

  const handleOpenEpisode = (ep: number, url: string) => {
    playCyberClick();
    setCurrentEp(ep);
    if (onSelectModule) {
      onSelectModule(ep);
    }
    setIsPlaying(true);
    setShowNotification(`🚀 กำลังเปิด Google NotebookLM ตอนที่ ${ep} ในแท็บใหม่ — ระบบเริ่มจับเวลาการเรียนรู้ให้อัตโนมัติ`);
    setTimeout(() => setShowNotification(null), 6000);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenNotebookLM = () => {
    playCyberClick();
    setIsPlaying(true);
    setShowNotification(`🚀 กำลังเปิด Google NotebookLM ตอนที่ ${activeEp} ในแท็บใหม่ — ระบบเริ่มจับเวลาการเรียนรู้ให้อัตโนมัติ`);
    setTimeout(() => setShowNotification(null), 6000);
    window.open(videoConfig.youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  // Sync config when activeEp or courseId changes
  useEffect(() => {
    const config = getModuleVideoConfig(activeEp, courseId);
    setVideoConfig(config);
    setVideoDuration(config.defaultDurationSec || 300);
    const watched = isAlreadyCompleted || checkIsVideoWatched(empId, activeEp, courseId);
    setIsWatched(watched);
    const saved = getVideoWatchSeconds(empId, activeEp, courseId);
    maxAllowedTimeRef.current = watched ? config.defaultDurationSec : saved;
    setWatchSeconds(saved);
  }, [activeEp, courseId, empId, isAlreadyCompleted]);

  // Listen to storage events
  useEffect(() => {
    const handleStorage = () => {
      setVideoConfig(getModuleVideoConfig(activeEp, courseId));
      setIsWatched(isAlreadyCompleted || checkIsVideoWatched(empId, activeEp, courseId));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [activeEp, courseId, empId, isAlreadyCompleted]);

  // Load YouTube IFrame API if not already present
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize or re-attach YouTube Player
  useEffect(() => {
    let checkInterval: any = null;

    const initPlayer = () => {
      if (isNotebookLMUrl(videoConfig.youtubeUrl)) return;
      if (window.YT && window.YT.Player && iframeRef.current) {
        try {
          playerRef.current = new window.YT.Player(iframeRef.current, {
            events: {
              onReady: (event: any) => {
                const duration = event.target.getDuration();
                if (duration && duration > 0) {
                  setVideoDuration(Math.floor(duration));
                }
              },
              onStateChange: (event: any) => {
                // YT.PlayerState.PLAYING === 1
                if (event.data === 1) {
                  setIsPlaying(true);
                } 
                // YT.PlayerState.PAUSED === 2
                else if (event.data === 2) {
                  setIsPlaying(false);
                } 
                // YT.PlayerState.ENDED === 0
                else if (event.data === 0) {
                  setIsPlaying(false);
                  // Verify that actual watched time is at least 95% of duration before completing
                  if (maxAllowedTimeRef.current >= Math.max(60, (playerRef.current?.getDuration() || videoDuration) * 0.9)) {
                    handleCompleteVideo();
                  } else {
                    setSkipWarning('⚠️ ท่านยังดูไม่ครบเวลาของวิดีโอ (ตรวจพบการข้าม) กรุณาเปิดดูให้ครบเวลาจึงจะปลดล็อคข้อสอบได้');
                    setTimeout(() => setSkipWarning(null), 7000);
                  }
                }
              }
            }
          });
        } catch (e) {
          console.warn('YouTube Player initialization notice:', e);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          initPlayer();
        }
      }, 500);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [videoConfig.videoId]);

  // Anti-Skipping & Progress Timer while video is playing
  useEffect(() => {
    if (isPlaying && !isWatched) {
      progressTimerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const currentTime = Math.floor(playerRef.current.getCurrentTime());
            const duration = Math.floor(playerRef.current.getDuration()) || videoDuration;

            // Continuously update max watched seconds
            const nextSec = Math.max(maxAllowedTimeRef.current, currentTime);
            maxAllowedTimeRef.current = nextSec;
            setWatchSeconds(nextSec);
            saveVideoWatchSeconds(empId, moduleId, nextSec, courseId);

            // If watched until full duration (or >= 98% of total)
            if (nextSec >= Math.max(60, duration - 3)) {
              handleCompleteVideo();
            }
          } catch (err) {
            // Fallback interval increment
            setWatchSeconds((prev) => {
              const next = prev + 1;
              maxAllowedTimeRef.current = next;
              saveVideoWatchSeconds(empId, moduleId, next, courseId);
              if (next >= Math.max(60, videoDuration - 3)) {
                handleCompleteVideo();
              }
              return next;
            });
          }
        } else {
          // Fallback interval increment based on playback speed
          setWatchSeconds((prev) => {
            const next = prev + Math.max(1, Math.round(playbackSpeed));
            maxAllowedTimeRef.current = Math.max(maxAllowedTimeRef.current, next);
            saveVideoWatchSeconds(empId, moduleId, next, courseId);
            if (next >= Math.max(60, videoDuration - 3)) {
              handleCompleteVideo();
            }
            return next;
          });
        }
      }, 1000);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, isWatched, videoDuration, empId, activeEp, moduleId, courseId, playbackSpeed]);

  // Handle Video Completion
  const handleCompleteVideo = () => {
    setIsWatched(true);
    markVideoAsWatched(empId, activeEp, courseId);
    if (activeEp !== moduleId) {
      markVideoAsWatched(empId, moduleId, courseId);
    }
    playSuccessChime();
    setShowNotification('🎉 ยืนยันการรับชมวิดีโอสำเร็จแล้ว! ระบบได้ปลดล็อคแบบทดสอบท้ายบทให้เรียบร้อยแล้ว');
    setTimeout(() => setShowNotification(null), 8000);
    if (onVideoComplete) onVideoComplete();
  };

  // Scroll listener: Detect when main video container scrolls out of view -> trigger Floating Picture-in-Picture
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isPastView = rect.bottom < 80;
      setIsFloating(isPastView);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const progressPercent = Math.min(100, Math.round((watchSeconds / Math.max(60, videoDuration)) * 100));
  const currentMin = Math.floor(watchSeconds / 60);
  const currentSec = watchSeconds % 60;
  const durationMin = Math.floor(videoDuration / 60);
  const durationSec = videoDuration % 60;

  const remainingSeconds = Math.max(0, videoDuration - watchSeconds);
  const remainMin = Math.floor(remainingSeconds / 60);
  const remainSec = remainingSeconds % 60;

  const scrollToVideo = () => {
    playCyberClick();
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // -------------------------------------------------------------
  // Render Local Video File Player (if user/admin uploaded MP4/WebM to IndexedDB)
  // -------------------------------------------------------------
  if (localVideo) {
    return (
      <div 
        ref={containerRef}
        id={`module-video-container-${moduleId}`}
        className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-md relative overflow-hidden font-sarabun text-slate-800 space-y-4"
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-0.5 rounded-full bg-blue-50 text-[#002D5A] border border-blue-200">
                <FileVideo className="w-3.5 h-3.5 text-blue-700" />
                <span>วิดีโอบทเรียนไฟล์ MP4 แนบในเครื่อง • บทที่ {moduleId}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {localVideo.fileName} ({(localVideo.fileSize / (1024 * 1024)).toFixed(1)} MB)
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {videoConfig.title || `บทเรียนที่ ${moduleId}`}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="video/mp4,video/webm,video/quicktime,video/*" 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
              title="เปลี่ยนไฟล์วิดิโอสำหรับบทนี้"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>เปลี่ยนไฟล์วิดิโอ</span>
            </button>
            <button
              type="button"
              onClick={handleDeleteLocalVideo}
              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer border border-rose-200"
              title="ลบไฟล์วิดิโอที่แนบไว้"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {isWatched ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ดูจบแล้ว ✓</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleCompleteVideo}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ดูจบแล้ว (ปลดล็อคข้อสอบ)</span>
              </button>
            )}
          </div>
        </div>

        {/* Video Player Element */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video shadow-inner flex items-center justify-center">
          <video 
            ref={videoElemRef}
            src={localVideo.objectUrl}
            controls
            playsInline
            className="w-full h-full object-contain"
            onTimeUpdate={(e) => {
              const current = Math.floor((e.target as HTMLVideoElement).currentTime);
              const duration = Math.floor((e.target as HTMLVideoElement).duration || 240);
              setWatchSeconds(current);
              setVideoDuration(duration);
              saveVideoWatchSeconds(empId, moduleId, current, courseId);
              if (current >= duration - 3 && duration > 5) {
                handleCompleteVideo();
              }
            }}
            onEnded={handleCompleteVideo}
          />
        </div>

        {/* Subtitle Cue Banner */}
        {activeCue && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-900 mr-2">{activeCue.step || activeCue.speaker}:</span>
              <span>{activeCue.text}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If this module has no video configured (e.g. text/practical workshop modules)
  if (!videoConfig.youtubeUrl || videoConfig.youtubeUrl.trim() === '') {
    return (
      <div 
        ref={containerRef}
        id={`module-video-container-${moduleId}`}
        className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 relative overflow-hidden shadow-sm space-y-4 font-sarabun"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="video/mp4,video/webm,video/quicktime,video/*" 
          className="hidden" 
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#002D5A] flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-6 h-6 text-[#002D5A]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-50 text-[#002D5A] border border-blue-200 font-bold">
                  เอกสารการเรียนรู้ & กิจกรรมฝึกปฏิบัติ • MODULE 0{moduleId}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ปลดล็อคแบบทดสอบท้ายบท 100%
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {videoConfig.title || `บทเรียนที่ ${moduleId}`}
              </h2>
              <p className="text-xs text-slate-600">
                {videoConfig.description || 'บทเรียนนี้เน้นการศึกษาเนื้อหาเอกสาร กิจกรรมจำลองสถานการณ์ และแบบทดสอบท้ายบท'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#002D5A] border border-blue-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="แนบไฟล์วิดิโอ MP4 จากเครื่องลงในบทเรียนนี้"
            >
              <Upload className="w-4 h-4 text-blue-700" />
              <span>{isUploading ? 'กำลังอัปโหลด...' : 'แนบไฟล์วิดิโอ (MP4/WebM)'}</span>
            </button>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>พร้อมทำแบบทดสอบได้ทันที</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dedicated Launcher Card for Courses with NotebookLM (Shisa Kanko & AI Course)
  if (isNotebookLM) {
    const isKyt = courseId === 'kyt-shisa-kanko';
    const isAppliedPsychology = courseId === 'applied-psychology';
    return (
      <div 
        ref={containerRef}
        id={`module-video-container-${moduleId}`}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md relative overflow-hidden font-sarabun text-slate-800 space-y-6"
      >
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Header Ribbon */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                isAppliedPsychology ? 'bg-teal-50 text-teal-900 border-teal-200' : (isKyt ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-blue-50 text-[#005A9C] border-blue-200')
              }`}>
                {isAppliedPsychology ? <Sparkles className="w-3.5 h-3.5 text-teal-600" /> : (isKyt ? <Flame className="w-3.5 h-3.5 text-amber-600" /> : <Sparkles className="w-3.5 h-3.5 text-[#005A9C]" />)}
                <span>
                  {isAppliedPsychology
                    ? `จิตวิทยาประยุกต์ในการทำงาน • บทที่ ${moduleId} • รอบที่ 1 (12-16 ต.ค. 2569)`
                    : isKyt 
                    ? `หลักสูตร SHISA KANKO (KYT) • ตอนที่ ${moduleId} • มือชี้-ปากย้ำ`
                    : `AI FOR TCT • GOOGLE NOTEBOOKLM DEEP DIVE • บทที่ ${moduleId}`}
                </span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                {videoConfig.durationLabel || `ความยาวประมาณ ${durationMin}:${durationSec.toString().padStart(2, '0')} นาที`}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {videoConfig.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {videoConfig.description}
            </p>
          </div>

          {/* Status Badge */}
          <div className="shrink-0 flex items-center gap-2">
            {isWatched ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ดูวิดีโอจบแล้ว (ปลดล็อคแบบทดสอบแล้ว)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>ต้องดูวิดีโอจนจบก่อน (ห้ามกดข้าม)</span>
              </div>
            )}
          </div>
        </div>

        {/* Episode Selector Ribbon for Shisa Kanko (ตอนที่ 1 ถึง ตอนที่ 6) */}
        {isKyt && (
          <div className="relative z-10 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-600">
              <span className="font-bold flex items-center gap-1.5 text-slate-800">
                <BookOpen className="w-4 h-4 text-[#005A9C]" />
                <span>หลักสูตร Shisa Kanko มีวิดีโอครบทั้ง 6 ตอน (คลิกเพื่อสลับดูวิดีโอแต่ละตอนได้ทันที):</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full w-fit">
                กำลังเปิดดู: ตอนที่ {activeEp}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { ep: 1, name: 'ตอนที่ 1', sub: 'Human Error' },
                { ep: 2, name: 'ตอนที่ 2', sub: '4 ขั้นตอน' },
                { ep: 3, name: 'ตอนที่ 3', sub: 'สรีรศาสตร์' },
                { ep: 4, name: 'ตอนที่ 4', sub: 'การเปล่งเสียง' },
                { ep: 5, name: 'ตอนที่ 5', sub: '5 สถานการณ์' },
                { ep: 6, name: 'ตอนที่ 6', sub: 'การประเมินผล' }
              ].map(({ ep, name, sub }) => {
                const isCurrentEp = ep === activeEp;
                const isEpWatched = checkIsVideoWatched(empId, ep, courseId);
                return (
                  <button
                    key={ep}
                    type="button"
                    onClick={() => {
                      playCyberClick();
                      setCurrentEp(ep);
                      if (onSelectModule) {
                        onSelectModule(ep);
                      }
                    }}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 min-h-[52px] ${
                      isCurrentEp
                        ? 'bg-amber-400 text-slate-950 font-black border-amber-500 shadow-md ring-2 ring-amber-400/50'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-xs font-mono font-bold">
                      <span>{name}</span>
                      {isEpWatched && <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrentEp ? 'text-slate-950' : 'text-emerald-600'}`} />}
                    </div>
                    <div className={`text-[10px] truncate max-w-full ${isCurrentEp ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                      {sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Episode Selector Ribbon for Applied Psychology (บทที่ 1 ถึง บทที่ 3) */}
        {isAppliedPsychology && (
          <div className="relative z-10 bg-slate-50 border border-teal-200/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-600">
              <span className="font-bold flex items-center gap-1.5 text-teal-950">
                <BookOpen className="w-4 h-4 text-teal-700" />
                <span>หลักสูตรจิตวิทยาประยุกต์ในการทำงาน มีบทเรียนวิดีโอครบทั้ง 3 บท (คลิกเพื่อสลับดูวิดีโอแต่ละบทได้ทันที):</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-teal-900 bg-teal-100 border border-teal-300 px-2.5 py-0.5 rounded-full w-fit">
                กำลังเปิดดู: บทที่ {activeEp}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { ep: 1, name: 'บทที่ 1', sub: 'จิตวิทยาเพื่อความสำเร็จ & Growth Mindset' },
                { ep: 2, name: 'บทที่ 2', sub: 'บริหารอารมณ์ ความเครียด & Resilience' },
                { ep: 3, name: 'บทที่ 3', sub: 'สร้างความสุข ความมั่นคง & เติบโตร่วมกัน' }
              ].map(({ ep, name, sub }) => {
                const isCurrentEp = ep === activeEp;
                const isEpWatched = checkIsVideoWatched(empId, ep, courseId);
                return (
                  <button
                    key={ep}
                    type="button"
                    onClick={() => {
                      playCyberClick();
                      setCurrentEp(ep);
                      if (onSelectModule) {
                        onSelectModule(ep);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 min-h-[54px] ${
                      isCurrentEp
                        ? 'bg-teal-600 text-white font-bold border-teal-700 shadow-md ring-2 ring-teal-400/40'
                        : 'bg-white hover:bg-teal-50/60 text-slate-700 border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                      <span>{name}</span>
                      {isEpWatched && <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrentEp ? 'text-white' : 'text-emerald-600'}`} />}
                    </div>
                    <div className={`text-[10px] truncate max-w-full ${isCurrentEp ? 'text-teal-100 font-medium' : 'text-slate-500'}`}>
                      {sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Notification Banner */}
        {showNotification && (
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2.5 animate-fadeIn shadow-xs font-medium">
            <Info className="w-4 h-4 text-[#005A9C] shrink-0" />
            <span>{showNotification}</span>
          </div>
        )}

        {/* Big Interactive Action Card */}
        <div className="relative z-10 bg-gradient-to-br from-[#002855] via-[#003875] to-[#005A9C] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-blue-100 font-bold">
              <Headphones className="w-4 h-4 text-amber-300" />
              <span>Google NotebookLM Video & Audio Deep Dive</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {isKyt 
                ? `เข้าดูวิดีโอตอนที่ ${activeEp} ใน Google NotebookLM` 
                : 'เข้าศึกษาเนื้อหาและรับฟังบรรยายใน Google NotebookLM'}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              พนักงานกดลิงก์ด้านล่างเพื่อเปิดดูวิดีโอใน Google NotebookLM ในแท็บใหม่ ระบบจะจับเวลาการเรียนรู้ให้อัตโนมัติ <strong>การกดดูต้องดูวิดีโอจนจบก่อนห้ามกดข้าม</strong> เมื่อดูครบเวลาจึงสามารถทำแบบทดสอบท้ายบท (Quiz) ได้
            </p>

            {/* Direct Link Preview Bar */}
            <div className="p-2.5 rounded-xl bg-black/40 border border-cyan-400/30 text-[11px] font-mono text-cyan-200 flex items-center gap-2 overflow-hidden">
              <span className="shrink-0 text-amber-300 font-bold">🔗 ลิงก์ตอนที่ {activeEp}:</span>
              <a 
                href={videoConfig.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setIsPlaying(true)}
                className="truncate underline text-cyan-300 hover:text-white transition-colors"
                title={videoConfig.youtubeUrl}
              >
                {videoConfig.youtubeUrl}
              </a>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-center md:items-end gap-3 shrink-0 w-full md:w-auto">
            <button
              type="button"
              id={`btn-open-notebooklm-${activeEp}`}
              onClick={handleOpenNotebookLM}
              className="w-full md:w-auto px-7 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-amber-500/25 cursor-pointer transition-all hover:scale-105 active:scale-98"
            >
              <ExternalLink className="w-5 h-5 text-slate-950" />
              <span>กดลิงก์เพื่อไปดูวิดีโอตอนที่ {activeEp}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-100 text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์'}</span>
              </button>

              {isPlaying && !isWatched && (
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    setIsPlaying(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-medium flex items-center gap-1 border border-amber-300/30 cursor-pointer"
                  title="หยุดจับเวลาชั่วคราว"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>พักเวลา</span>
                </button>
              )}

              {!isPlaying && !isWatched && watchSeconds > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    setIsPlaying(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-medium flex items-center gap-1 border border-emerald-400/40 cursor-pointer"
                  title="จับเวลาต่อ"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>จับเวลาต่อ</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Timer & Tracking Status Bar (Strict Anti-Skipping) */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              isWatched ? 'bg-emerald-100 text-emerald-700' : isPlaying ? 'bg-blue-100 text-[#005A9C] animate-pulse' : 'bg-slate-200 text-slate-600'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>สถานะ: {isWatched ? 'รับชมวิดีโอจบแล้ว (ปลดล็อคข้อสอบเรียบร้อย)' : isPlaying ? 'กำลังเปิดดูวิดีโอ (ระบบจับเวลาอยู่)' : 'รอกดเปิดลิงก์เพื่อเริ่มดูวิดีโอ'}</span>
                {!isWatched && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                    ห้ามกดข้าม
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                เวลาที่ดูแล้ว: <strong>{currentMin}:{currentSec.toString().padStart(2, '0')}</strong> นาที / ความยาวทั้งหมด: <strong>{durationMin}:{durationSec.toString().padStart(2, '0')}</strong> นาที
                {!isWatched && remainingSeconds > 0 && (
                  <span className="text-amber-700 font-semibold ml-2">
                    (เหลืออีก {remainMin}:{remainSec.toString().padStart(2, '0')} นาที)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${isWatched ? 'bg-emerald-500' : 'bg-[#005A9C]'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono font-bold text-slate-800 text-xs shrink-0">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Warning Policy Note */}
        {!isWatched && (
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>คำแนะนำ:</strong> เมื่อกดเปิดลิงก์แล้ว ให้เปิดดูวิดีโอใน Google NotebookLM จนจบ เมื่อแถบเวลาครบ 100% ระบบจะปลดล็อคแบบทดสอบท้ายบท (Quiz) ให้โดยอัตโนมัติ
            </span>
          </div>
        )}

        {/* Full Directory Card Grid for NotebookLM Courses (KYT: 6 Episodes, Applied Psychology: 3 Episodes) */}
        {(isKyt || isAppliedPsychology) && (
          <div className="relative z-10 bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <BookOpen className={`w-5 h-5 ${isAppliedPsychology ? 'text-teal-600' : 'text-amber-600'}`} />
                <span>
                  {isAppliedPsychology
                    ? 'สารบัญวิดีโอการเรียนรู้จิตวิทยาประยุกต์ในการทำงาน ครบทั้ง 3 บท (Google NotebookLM)'
                    : 'สารบัญวิดีโอการเรียนรู้ Shisa Kanko ครบทั้ง 6 ตอน (Google NotebookLM)'}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {isAppliedPsychology
                  ? 'รอบที่ 1: 12 ตุลาคม 2569 - 16 ตุลาคม 2569 • ศึกษาครบทั้ง 3 บทเรียนเพื่อปลดล็อคแบบทดสอบ Post-Test'
                  : 'พนักงานสามารถคลิกเปิดดูวิดีโอได้ทุกตอน และต้องดูจนจบก่อนทำแบบทดสอบ'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {(isAppliedPsychology ? [
                {
                  ep: 1,
                  title: 'บทที่ 1: จิตวิทยาเพื่อความสำเร็จและ Growth Mindset',
                  desc: 'จิตวิทยาความสำเร็จ • กรอบคิดแบบเติบโต (Growth Mindset) • พลังความเพียร (Grit) สู่ผลงานระดับโลก',
                  url: 'https://notebooklm.link.google/Qi5XeX4RLPge'
                },
                {
                  ep: 2,
                  title: 'บทที่ 2: การบริหารอารมณ์ ความเครียด และการฟื้นคืน (Resilience)',
                  desc: 'Emotional Agility • สติหน้างานและการฝึก S-T-O-P • ความปลอดภัยทางจิตวิทยา (Psychological Safety)',
                  url: 'https://notebooklm.link.google/JLnqF426neNW'
                },
                {
                  ep: 3,
                  title: 'บทที่ 3: การสร้างความสุข ความมั่นคง และความผูกพันในงาน',
                  desc: 'โมเดลความสุข PERMA • ความมั่นคงในอาชีพ (Job Security) • การเติบโตร่วมกันอย่างยั่งยืนใน TCT',
                  url: 'https://notebooklm.link.google/DCVV2tHiM0Qh'
                }
              ] : [
                {
                  ep: 1,
                  title: 'ตอนที่ 1: ทำไม Shisa Kanko จึงสำคัญ?',
                  desc: 'Human Error > 80% • ลดอุบัติเหตุ 50-70% • พลังแห่ง 4 ประสาทสัมผัส',
                  url: 'https://notebook.google.com/notebook/db13f816-0e4f-41d4-b830-96d26d78217f/artifact/55681ffc-a88e-4a9f-8be4-5d97320a456b?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_'
                },
                {
                  ep: 2,
                  title: 'ตอนที่ 2: 4 ขั้นตอนชี้-ปากย้ำ',
                  desc: 'Prepare • Point • Voice • Confirm 4 ขั้นตอนมาตรฐานสู่การปฏิบัติที่เป็นเลิศ',
                  url: 'https://notebook.google.com/notebook/db13f816-0e4f-41d4-b830-96d26d78217f/artifact/8a954194-13a5-4cda-858c-c31d11e45c4a?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_'
                },
                {
                  ep: 3,
                  title: 'ตอนที่ 3: สรีรศาสตร์ ท่ายืน และการวางมือ',
                  desc: 'ท่ายืนมั่นคง แขนเหยียดตรง ทำมุม 45° และการกำจัด Phantom Pointing',
                  url: 'https://notebook.google.com/notebook/db13f816-0e4f-41d4-b830-96d26d78217f/artifact/b2edab69-ffc1-41c2-b321-c5587933d260?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_'
                },
                {
                  ep: 4,
                  title: 'ตอนที่ 4: กฎทองแห่งการเปล่งเสียง',
                  desc: 'เสียงจากกระบังลม • 3 รูปแบบการยืนยัน Solo, Mutual, Group Touch & Call',
                  url: 'https://notebook.google.com/notebook/db13f816-0e4f-41d4-b830-96d26d78217f/artifact/e59f27b8-2062-49d2-8db1-ce5eb6f1186b?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_'
                },
                {
                  ep: 5,
                  title: 'ตอนที่ 5: 5 สถานการณ์จริงในโรงงาน TCT',
                  desc: 'ตรวจเครื่องจักร, Mold Setup, Lockout-Tagout, QC และ Safety Patrol 5S',
                  url: 'https://notebook.google.com/notebook/db13f816-0e4f-41d4-b830-96d26d78217f/artifact/53d8f2b4-d6a0-499c-8946-1f2bc5e780c8?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_'
                },
                {
                  ep: 6,
                  title: 'ตอนที่ 6: เกณฑ์การประเมินผล 4 มิติ',
                  desc: 'เกณฑ์ 4 มิติ • ระบบบัดดี้ Buddy System • พันธสัญญา Zero Accident',
                  url: 'https://notebook.google.com/notebook/db13f816-0e4f-41d4-b830-96d26d78217f/artifact/e11fd54a-f1da-4017-bbc8-5800d7b9b5a3?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_'
                }
              ]).map((item) => {
                const isCurrent = item.ep === activeEp;
                const isItemWatched = checkIsVideoWatched(empId, item.ep, courseId);
                return (
                  <div
                    key={item.ep}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isCurrent
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full ${
                          isCurrent ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-100 text-slate-700'
                        }`}>
                          ตอนที่ {item.ep}
                        </span>
                        {isItemWatched ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ดูจบแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            รอดูให้จบ
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEpisode(item.ep, item.url)}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#002855] to-[#005A9C] hover:from-[#001f42] hover:to-[#00477d] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
                        <span>เปิดดูวิดีโอตอนที่ {item.ep}</span>
                      </button>

                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => {
                            playCyberClick();
                            setCurrentEp(item.ep);
                            if (onSelectModule) {
                              onSelectModule(item.ep);
                            }
                          }}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer text-center"
                        >
                          สลับมาดูตอนที่ {item.ep}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* 1. Main In-Page Video Section */}
      <div 
        ref={containerRef}
        id={`module-video-container-${moduleId}`}
        className="glass-panel rounded-2xl p-5 sm:p-6 border border-cyan-500/40 relative overflow-hidden bg-slate-900/90 shadow-xl shadow-cyan-950/20 space-y-4"
      >
        {/* Glowing cyber accents */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Video Header & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                <span>วิดีโอบทเรียนทางการ • MODULE 0{moduleId}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {videoConfig.durationLabel}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              {videoConfig.title}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {videoConfig.description}
            </p>
          </div>

          {/* Watch Status Badge */}
          <div className="shrink-0 flex items-center gap-2">
            {/* Watched Status & Completion Button */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {isWatched ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-md shadow-emerald-950/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>รับชมวิดีโอสำเร็จแล้ว (ปลดล็อคแบบทดสอบ 100%)</span>
                </div>
              ) : (
                <button
                  type="button"
                  id={`btn-mark-watched-header-${moduleId}`}
                  onClick={handleCompleteVideo}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 cursor-pointer transition-all hover:scale-105 active:scale-95 border border-emerald-400/40"
                  title="กดปุ่มนี้เพื่อยืนยันว่าดูวิดีโอสำเร็จแล้วและปลดล็อคแบบทดสอบทันที"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>ดูวิดีโอสำเร็จแล้ว (ปลดล็อคข้อสอบ)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Video Learning Guide Banner */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-cyan-300">ระบบวิดีโอบทเรียนอิเล็กทรอนิกส์ (E-Training Video):</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                ท่านสามารถรับชมวิดีโอประกอบการเรียนรู้ หรือกดปุ่ม <span className="text-emerald-400 font-bold">"ดูวิดีโอสำเร็จแล้ว"</span> เพื่อปลดล็อคแบบทดสอบท้ายบท (Quiz) และอ่านเนื้อหาประกอบได้ทันที
              </p>
            </div>
          </div>

          {!isWatched && (
            <button
              type="button"
              id={`btn-complete-video-banner-${moduleId}`}
              onClick={handleCompleteVideo}
              className="shrink-0 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ดูวิดีโอสำเร็จแล้ว</span>
            </button>
          )}
        </div>

        {/* Warning if user tried to skip forward */}
        {skipWarning && (
          <div className="p-3 rounded-xl bg-red-950/90 border border-red-500/60 text-xs text-red-200 flex items-center gap-2.5 animate-bounce shadow-lg shadow-red-950/40">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-semibold">{skipWarning}</span>
          </div>
        )}

        {/* Video / Multimedia Embed Frame Container */}
        {isNotebookLM ? (
          <div 
            ref={playerWrapperRef}
            className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-500/50 shadow-2xl group select-none flex flex-col justify-between ${
              isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0 aspect-auto h-screen' : ''
            }`}
          >
            {/* Background Ambient Aura & Grid Screen */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#060a1f] via-[#09112e] to-[#040612] pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

            {/* Top Video HUD Bar */}
            <div className="relative z-20 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/80 border border-red-500/50 text-red-300 text-[10px] font-mono font-bold shadow-md">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`} />
                  <span>{isPlaying ? 'LIVE DIGITAL VIDEO' : 'VIDEO PLAYER READY'}</span>
                </span>
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40 hidden sm:inline-block">
                  HD 1080p • STEREO
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* CC Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    setShowCaptions(!showCaptions);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    showCaptions ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                  title="เปิด/ปิด คำบรรยายไทย"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>CC ไทย</span>
                </button>

                {/* Audio Narrator Mute Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    setIsMuted(!isMuted);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    !isMuted ? 'bg-indigo-950 text-indigo-300 border-indigo-500/50' : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                  title={isMuted ? 'เปิดเสียงบรรยาย' : 'ปิดเสียงบรรยาย'}
                >
                  {isMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
                  <span className="hidden sm:inline">{isMuted ? 'ปิดเสียง' : 'เสียงบรรยาย'}</span>
                </button>

                {/* Optional Original NotebookLM Link */}
                <button
                  type="button"
                  onClick={handleOpenNotebookLM}
                  className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                  title="เปิดดูแหล่งข้อมูลต้นฉบับบน Google NotebookLM ในแท็บใหม่"
                >
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                  <span className="hidden md:inline">เปิด NotebookLM</span>
                </button>
              </div>
            </div>

            {/* Video Stage & Graphics */}
            <div 
              className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 cursor-pointer"
              onClick={() => {
                playCyberClick();
                setIsPlaying(!isPlaying);
              }}
            >
              {/* If Paused: Large Play Button Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all hover:bg-black/30">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-1 shadow-2xl shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-slate-950/90 flex items-center justify-center pl-1">
                      <Play className="w-9 h-9 sm:w-11 sm:h-11 text-cyan-400 fill-cyan-400" />
                    </div>
                  </div>
                  <div className="mt-3 px-4 py-1.5 rounded-full bg-slate-900/95 border border-cyan-400/40 text-xs sm:text-sm font-bold text-white shadow-xl flex items-center gap-2">
                    <MonitorPlay className="w-4 h-4 text-cyan-400" />
                    <span>คลิกเพื่อเริ่มรับชมวิดีโอบนหน้านี้ทันที</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 drop-shadow">
                    ระบบเล่นวิดีโอและเสียงบรรยายบทเรียนตรงบนหน้านี้ ไม่ต้องสลับแท็บ
                  </p>
                </div>
              )}

              {/* Graphic Scene Content */}
              <div className="w-full max-w-2xl flex flex-col items-center justify-center space-y-3 pointer-events-none">
                {/* Course-Specific Visual Flow */}
                {courseId === 'kyt-shisa-kanko' ? (
                  moduleId === 2 ? (
                    /* KYT Module 2: 4-Step Interactive Standard Flow */
                    <div className="w-full space-y-2.5">
                      <div className="text-center">
                        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/40 font-bold uppercase tracking-wider">
                          4 ขั้นตอนมาตรฐาน Shisa Kanko (Point & Call)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        {[
                          { num: 1, name: 'เตรียมพร้อม', en: 'Prepare', desc: 'หยุดนิ่ง สมาธิ 1 วิ' },
                          { num: 2, name: 'ชี้เป้าหมาย', en: 'Point', desc: 'เหยียดแขนตรง 30-50 ซม.' },
                          { num: 3, name: 'เปล่งเสียง', en: 'Voice', desc: 'เสียงดังจากช่องท้อง' },
                          { num: 4, name: 'ยืนยันดึงมือ', en: 'Confirm', desc: 'ดึงมือกลับ "ปกติ! โยชิ!"' }
                        ].map((s) => {
                          const isActive = activeCue?.step?.includes(s.en) || activeCue?.step?.includes(s.name);
                          return (
                            <div 
                              key={s.num} 
                              className={`p-2.5 rounded-xl border transition-all ${
                                isActive 
                                  ? 'bg-amber-950/90 border-amber-400 shadow-lg shadow-amber-500/30 scale-105 ring-2 ring-amber-400/40 text-amber-200' 
                                  : 'bg-slate-900/70 border-slate-700/80 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono opacity-80 mb-0.5">
                                <span>STEP 0{s.num}</span>
                                {isActive && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                              </div>
                              <div className="font-bold text-xs sm:text-sm text-white">{s.name}</div>
                              <div className="text-[10px] text-cyan-300/80 font-mono">{s.en}</div>
                              <div className="text-[9px] text-slate-300 mt-1 hidden sm:block">{s.desc}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* KYT Module 1: 4 Senses & Zero Accident Engine */
                    <div className="w-full space-y-2.5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/90 border border-indigo-400/50 text-indigo-300 text-xs font-mono font-bold">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>ZERO ACCIDENT CULTURE • วิทยาศาสตร์ 4 ประสาทสัมผัส</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-xs text-white">
                        <span className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex items-center gap-1 font-bold">
                          👁️ ตาเพ่งมอง
                        </span>
                        <span className="text-slate-500">→</span>
                        <span className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex items-center gap-1 font-bold">
                          👆 มือเหยียดชี้
                        </span>
                        <span className="text-slate-500">→</span>
                        <span className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex items-center gap-1 font-bold">
                          🗣️ ปากส่งเสียง
                        </span>
                        <span className="text-slate-500">→</span>
                        <span className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 flex items-center gap-1 font-bold text-emerald-300">
                          🧠 สมองยืนยัน
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-300 font-mono">
                        ⚡ ผลลัพธ์พิสูจน์แล้ว: ลด Human Error 50% - 70% • อัตราผิดพลาดลดเหลือเพียง 0.38%
                      </div>
                    </div>
                  )
                ) : (
                  /* AI Course or default scene */
                  <div className="w-full space-y-2 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/90 border border-blue-400/50 text-blue-300 text-xs font-mono font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>TCT AI & DIGITAL TRANSFORMATION STUDIO</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white drop-shadow">
                      {videoConfig.title}
                    </h3>
                  </div>
                )}

                {/* Animated Equalizer Waveform Soundbar */}
                <div className="flex items-center justify-center gap-1 sm:gap-1.5 pt-2 h-10">
                  {[20, 45, 60, 85, 40, 95, 70, 30, 80, 50, 90, 65, 35, 75, 100, 55, 85, 45, 70, 90, 35, 60, 80, 50, 95, 40, 75, 30].map((h, i) => (
                    <span 
                      key={i} 
                      className={`w-1 sm:w-1.5 rounded-full transition-all duration-300 ${
                        isPlaying 
                          ? 'bg-gradient-to-t from-cyan-500 via-indigo-400 to-purple-400' 
                          : 'bg-slate-700/60'
                      }`}
                      style={{ 
                        height: isPlaying ? `${Math.max(15, (h * ((watchSeconds % 3) + 1)) % 100)}%` : '15%',
                        opacity: isPlaying ? 0.9 : 0.4
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Subtitles (Closed Captions) Bar */}
              {showCaptions && activeCue && (
                <div className="w-full max-w-2xl mt-auto pt-2">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md shadow-2xl flex items-start gap-2.5 animate-fadeIn">
                    <div className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] font-bold shrink-0 border border-cyan-500/30 mt-0.5">
                      {activeCue.step || activeCue.speaker}
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-amber-200 leading-snug drop-shadow">
                      {activeCue.text}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom In-Video Control Bar */}
            <div className="relative z-20 px-3 sm:px-4 py-2.5 bg-gradient-to-t from-black/95 via-black/85 to-transparent border-t border-slate-800/80 flex flex-col gap-2">
              {/* Scrubber Timeline Bar */}
              <div 
                className="w-full h-2 sm:h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/80 cursor-pointer relative group/timeline"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  handleSeek(Math.floor(pos * videoDuration));
                }}
                title="คลิกเพื่อเลื่อนตำแหน่งเวลา"
              >
                {/* Max Watched Buffer */}
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-slate-700/50"
                  style={{ width: `${Math.min(100, Math.round((maxAllowedTimeRef.current / Math.max(1, videoDuration)) * 100))}%` }}
                />
                {/* Current Playhead */}
                <div 
                  className={`h-full transition-all duration-150 ${isWatched ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-400'}`}
                  style={{ width: `${Math.min(100, Math.round((watchSeconds / Math.max(1, videoDuration)) * 100))}%` }}
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between gap-2 text-xs">
                {/* Left Controls: Play/Pause, Rewind, Time */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playCyberClick();
                      setIsPlaying(!isPlaying);
                    }}
                    className="p-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 cursor-pointer transition-transform active:scale-95"
                    title={isPlaying ? 'หยุดชั่วคราว' : 'เล่นต่อ'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-cyan-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playCyberClick();
                      handleSeek(watchSeconds - 10);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="ย้อนหลัง 10 วินาที"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <div className="font-mono text-xs text-slate-300 pl-1">
                    <span className="text-cyan-300 font-bold">{currentMin}:{currentSec.toString().padStart(2, '0')}</span>
                    <span className="text-slate-500"> / </span>
                    <span className="text-slate-400">{durationMin}:{durationSec.toString().padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Right Controls: Speed, Quick Complete, Fullscreen */}
                <div className="flex items-center gap-2">
                  {/* Playback Speed Selector */}
                  <div className="flex items-center bg-slate-900/90 rounded-lg border border-slate-700 p-0.5 text-[10px] font-mono">
                    {[1.0, 1.25, 1.5].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => {
                          playCyberClick();
                          setPlaybackSpeed(spd);
                        }}
                        className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                          playbackSpeed === spd ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  {/* Watching status on Video Bar */}
                  {!isWatched ? (
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span className="hidden sm:inline">ห้ามกดข้าม ({progressPercent}%)</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="hidden sm:inline">ปลดล็อคแล้ว</span>
                    </span>
                  )}

                  {/* Fullscreen Button */}
                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'ดูแบบเต็มจอ (Fullscreen)'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl group">
            <iframe
              ref={iframeRef}
              id={`yt-player-module-${moduleId}`}
              className="w-full h-full object-cover"
              src={`https://www.youtube.com/embed/${videoConfig.videoId}?enablejsapi=1&rel=0&playsinline=1&modestbranding=1`}
              title={videoConfig.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

            {/* Top Floating Controls */}
            <div className="absolute top-2 left-2 pointer-events-auto bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-mono text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span>TCT E-TRAINING VIDEO • YOUTUBE</span>
            </div>

            <a
              href={videoConfig.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 pointer-events-auto bg-red-950/80 hover:bg-red-900/90 text-white hover:text-red-200 text-[11px] font-bold px-2.5 py-1 rounded-md border border-red-500/40 backdrop-blur-sm flex items-center gap-1.5 transition-colors shadow-lg"
              title="เปิดดูบนแอป YouTube / แท็บใหม่"
            >
              <Play className="w-3 h-3 text-red-400 fill-red-400" />
              <span>เปิดบน YouTube</span>
            </a>
          </div>
        )}

        {/* Progress & Live Player Stats */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center border border-cyan-500/30 text-cyan-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">ความคืบหน้าการรับชม:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {currentMin}:{currentSec.toString().padStart(2, '0')} / {durationMin}:{durationSec.toString().padStart(2, '0')} นาที
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                💡 ท่านสามารถเลื่อนจอเพื่ออ่านเนื้อหาและทำกิจกรรมด้านล่างได้ วิดีโอจะลอยเป็นป๊อบอัพที่มุมจออัตโนมัติ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
            <div className="w-24 sm:w-32 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-300 ${isWatched ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-400 to-cyan-400'}`}
                style={{ width: `${isWatched ? 100 : progressPercent}%` }}
              />
            </div>
            <span className={`font-mono font-bold text-xs ${isWatched ? 'text-emerald-400' : 'text-amber-300'}`}>
              {isWatched ? '100%' : `${progressPercent}%`}
            </span>

            {/* Quick Completion Button */}
            {!isWatched && (
              <button
                type="button"
                id={`btn-complete-video-footer-${moduleId}`}
                onClick={handleCompleteVideo}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1 cursor-pointer transition-all active:scale-95 ml-2"
                title="กดปุ่มนี้เมื่อดูวิดีโอสำเร็จแล้ว"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ดูวิดีโอสำเร็จแล้ว</span>
              </button>
            )}
          </div>
        </div>

        {/* Toast Alert */}
        {showNotification && (
          <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{showNotification}</span>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 2. Floating Picture-in-Picture Mini Video Player Pop-up              */}
      {/* Pops up automatically when user scrolls down into reading materials  */}
      {/* ==================================================================== */}
      {isFloating && (
        <div 
          id="floating-pip-video-player"
          className={`fixed z-50 transition-all duration-300 ease-in-out ${
            isMinimized 
              ? 'bottom-20 md:bottom-4 right-2 sm:right-4 w-72 sm:w-80 max-w-[calc(100vw-1rem)]' 
              : 'bottom-20 md:bottom-6 right-2 sm:right-6 w-80 sm:w-96 max-w-[calc(100vw-1rem)]'
          }`}
        >
          <div className="glass-panel rounded-2xl p-2.5 sm:p-3 border-2 border-cyan-400/80 shadow-2xl shadow-cyan-950/60 bg-[#0B132B]/95 backdrop-blur-xl space-y-2 ring-2 ring-cyan-500/20">
            {/* Pop-up Top Bar */}
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                <span className="font-bold text-slate-100 truncate text-[11px] sm:text-xs">
                  {videoConfig.title}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Scroll to Top / Return to Full View */}
                <button
                  type="button"
                  onClick={scrollToVideo}
                  title="กลับไปยังวิดีโอขนาดเต็มด้านบน"
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Minimize / Expand Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    setIsMinimized(!isMinimized);
                  }}
                  title={isMinimized ? 'ขยายหน้าต่างวิดีโอ' : 'ย่อหน้าต่างวิดีโอ'}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* Close Pop-up */}
                <button
                  type="button"
                  onClick={() => {
                    playCyberClick();
                    setIsFloating(false);
                  }}
                  title="ปิดหน้าต่างลอย"
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Video Body when Not Minimized */}
            {!isMinimized && (
              isNotebookLM ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/40 p-2.5 flex flex-col justify-between text-center group">
                  <div className="flex items-center justify-between text-[10px] text-cyan-300 font-mono">
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`} />
                      <span>{isPlaying ? 'PLAYING' : 'PAUSED'}</span>
                    </span>
                    <span className="text-amber-300 font-bold">{currentMin}:{currentSec.toString().padStart(2, '0')}</span>
                  </div>

                  {/* Mini animated wave and cue text */}
                  <div className="space-y-1 my-auto">
                    <p className="text-[11px] font-bold text-white line-clamp-1">
                      {videoConfig.title}
                    </p>
                    {activeCue && (
                      <p className="text-[10px] text-amber-200 line-clamp-1 drop-shadow">
                        {activeCue.text}
                      </p>
                    )}
                    <div className="flex items-center justify-center gap-1 h-3 pt-0.5">
                      {[15, 30, 50, 80, 45, 90, 60, 30, 75, 40, 85, 55, 30].map((h, i) => (
                        <span 
                          key={i} 
                          className={`w-1 rounded-full ${isPlaying ? 'bg-cyan-400' : 'bg-slate-700'}`} 
                          style={{ height: isPlaying ? `${Math.max(20, (h * ((watchSeconds % 3) + 1)) % 100)}%` : '20%' }} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playCyberClick();
                        setIsPlaying(!isPlaying);
                      }}
                      className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-white" />}
                      <span>{isPlaying ? 'หยุดชั่วคราว' : 'เล่นวิดีโอ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={scrollToVideo}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer"
                      title="กลับไปยังจอใหญ่ด้านบน"
                    >
                      <Maximize2 className="w-3 h-3 text-cyan-400" />
                      <span>ขยายจอ</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-slate-800">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoConfig.videoId}?enablejsapi=1&rel=0&playsinline=1&modestbranding=1`}
                    title={`${videoConfig.title} (Mini Player)`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )
            )}

            {/* Floating Player Footer & Status */}
            <div className="flex items-center justify-between gap-2 text-[11px] pt-1">
              <div className="flex items-center gap-1.5 text-slate-300">
                {isWatched ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                    <CheckCircle2 className="w-3 h-3" /> ดูจบแล้ว (ปลดล็อค)
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompleteVideo}
                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>ดูสำเร็จแล้ว</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={scrollToVideo}
                  className="text-[10px] text-cyan-300 hover:underline flex items-center gap-0.5"
                >
                  <span>จอใหญ่</span>
                  <ChevronUp className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
