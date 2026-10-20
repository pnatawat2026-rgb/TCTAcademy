export interface ModuleVideoConfig {
  moduleId: number;
  courseId?: string;
  youtubeUrl: string;
  videoId: string;
  title: string;
  durationLabel: string;
  description: string;
  defaultDurationSec: number;
}

const STORAGE_KEY_CUSTOM_VIDEOS = 'tct_custom_module_videos_v3';

export const DEFAULT_RISK_MODULE_VIDEOS: Record<number, { url: string; title: string; durationLabel: string; description: string; defaultDurationSec: number }> = {
  1: {
    url: 'https://youtu.be/58dTDWWX0NM',
    title: 'วิดีโอบทที่ 1: หลักการพื้นฐานของการบริหารความเสี่ยงด้านคุณภาพและความปลอดภัย',
    durationLabel: 'ประมาณ 4:30 นาที',
    description: 'หลักการพื้นฐาน ความเสี่ยงเชิงรุก (Proactive Risk) ด้านคุณภาพและความปลอดภัยในกระบวนการทำงานของ Teijin Cord',
    defaultDurationSec: 270
  },
  2: {
    url: 'https://youtu.be/ZToYEJN2YxQ',
    title: 'วิดีโอบทที่ 2: กระบวนการบริหารความเสี่ยง (ระบุ ประเมิน ควบคุม Matrix 5x5)',
    durationLabel: 'ประมาณ 5:15 นาที',
    description: 'การชี้บ่งอันตราย การประเมิน Risk Score (Severity x Likelihood) และ Hierarchy of Controls 5 ระดับ',
    defaultDurationSec: 315
  },
  3: {
    url: 'https://youtu.be/KSfJvXDck_M',
    title: 'วิดีโอบทที่ 3: การจัดการอุบัติการณ์และการเรียนรู้จากเหตุการณ์ (LOTO, Visual & Poka-Yoke)',
    durationLabel: 'ประมาณ 4:45 นาที',
    description: 'การตัดแยกพลังงานอันตราย LOTO, การจัดการหน้างานด้วยภาพ (Visual Control) และระบบป้องกันความผิดพลาด',
    defaultDurationSec: 285
  },
  4: {
    url: 'https://youtu.be/K6tLzsY5JvQ',
    title: 'วิดีโอบทที่ 4: การประยุกต์ใช้ในการทำงานประจำวัน (5 Whys Root Cause & CAPA)',
    durationLabel: 'ประมาณ 5:00 นาที',
    description: 'การวิเคราะห์หาสาเหตุรากเหง้า 5 Whys Root Cause Analysis, แผนแก้ไขเชิงป้องกัน CAPA และการป้องกันการเกิดซ้ำ',
    defaultDurationSec: 300
  }
};

export const DEFAULT_PREVENTIVE_MODULE_VIDEOS: Record<number, { url: string; title: string; durationLabel: string; description: string; defaultDurationSec: number }> = {
  1: {
    url: 'https://youtu.be/sA_w8fjZ6xg',
    title: 'วิดีโอบทที่ 1: ทำไมต้องยกระดับจาก PM แบบเดิม (CBM คืออะไร — ซ่อมตามสภาพจริง)',
    durationLabel: 'ประมาณ 5:00 นาที',
    description: 'เข้าใจข้อจำกัดของ Time-based PM, Over-maintenance และหลักการ Condition-Based Maintenance (CBM) พร้อมขีดจำกัดเตือนภัย (Thresholds)',
    defaultDurationSec: 300
  },
  2: {
    url: 'https://youtu.be/Tv9ilBBaMJ0',
    title: 'วิดีโอบทที่ 2: PdM คืออะไร — คาดการณ์ล่วงหน้าด้วยข้อมูล (P-F Curve & AI/IoT)',
    durationLabel: 'ประมาณ 5:20 นาที',
    description: 'เจาะลึกเส้นโค้ง P-F Curve, หน้าต่างแห่งโอกาส (P-F Interval) และเทคโนโลยี Ultrasound, Vibration, Thermography ในงานบำรุงรักษาเชิงคาดการณ์',
    defaultDurationSec: 320
  },
  3: {
    url: 'https://youtu.be/WEbDm4wFeiI',
    title: 'วิดีโอบทที่ 3: RCM คืออะไร — จัดลำดับความสำคัญเครื่องจักร (Risk Score & FMEA)',
    durationLabel: 'ประมาณ 5:30 นาที',
    description: 'กระบวนการ Reliability-Centered Maintenance (RCM), การวิเคราะห์ FMEA และการจัดกลุ่มเครื่องจักร Critical vs Essential vs Non-Critical',
    defaultDurationSec: 330
  }
};

export const DEFAULT_PERSONALITY_MODULE_VIDEOS: Record<number, { url: string; title: string; durationLabel: string; description: string; defaultDurationSec: number }> = {
  1: {
    url: 'https://youtu.be/KY5TWVz5ZDU',
    title: 'วิดีโอบทที่ 1: จิตวิทยาบุคลิกภาพและการปรับตัวในการทำงาน (Self-Awareness & Adaptation)',
    durationLabel: 'ประมาณ 5:00 นาที',
    description: 'จิตวิทยาบุคลิกภาพ การตระหนักรู้ตนเอง (Self-Awareness) และความยืดหยุ่นในการปรับตัวต่อสิ่งแวดล้อมการทำงาน',
    defaultDurationSec: 300
  },
  2: {
    url: 'https://youtu.be/V_9kH07lXh0',
    title: 'วิดีโอบทที่ 2: ถอดรหัสบุคลิกภาพตามหลักโมเดล DISC (D-I-S-C 4 มิติพฤติกรรม)',
    durationLabel: 'ประมาณ 5:20 นาที',
    description: 'เจาะลึก 4 สไตล์: Dominance, Influence, Steadiness, Conscientiousness และกลยุทธ์การสื่อสารให้ตรงใจ',
    defaultDurationSec: 320
  },
  3: {
    url: 'https://youtu.be/DgaeHmMj5hA',
    title: 'วิดีโอบทที่ 3: ศิลปะการเข้าใจผู้อื่น (Empathy) และบุคลิกภาพที่ควรระวัง',
    durationLabel: 'ประมาณ 5:30 นาที',
    description: 'พลังแห่ง Empathy การรับฟังอย่างลึกซึ้ง และการระวังพฤติกรรมที่เป็นพิษกับกับดักอคติในที่ทำงาน',
    defaultDurationSec: 330
  },
  4: {
    url: 'https://youtu.be/4e0Vb-X7y_M',
    title: 'วิดีโอบทที่ 4: การสื่อสารและการทำงานร่วมกันอย่างสร้างสรรค์สู่วัฒนธรรมองค์กรที่เป็นเลิศ',
    durationLabel: 'ประมาณ 6:00 นาที',
    description: 'เทคนิคการสื่อสารแบบ SBI Model, การสร้าง Psychological Safety และการผสานความหลากหลายสู่ One Team',
    defaultDurationSec: 360
  }
};

export const DEFAULT_CONFLICT_MODULE_VIDEOS = DEFAULT_PERSONALITY_MODULE_VIDEOS;

export const DEFAULT_KYT_MODULE_VIDEOS: Record<number, { url: string; title: string; durationLabel: string; description: string; defaultDurationSec: number }> = {
  1: {
    url: 'https://notebook.google.com/notebook/db13f816-0e4f-41d4-b830-96d26d78217f/artifact/55681ffc-a88e-4a9f-8be4-5d97320a456b?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_',
    title: 'วิดีโอบทที่ 1: ตอนที่ 1 ทำไม Shisa Kanko จึงสำคัญ? (Google NotebookLM Deep Dive)',
    durationLabel: 'วิดีโอบทเรียนตอนที่ 1',
    description: 'เข้าใจรากเหง้าของ Human Error กว่า 80% เกิดจากความพลั้งเผลอ และสถิติลดอุบัติเหตุ 50-70% ในโรงงานอุตสาหกรรม (Google NotebookLM Video Artifact)',
    defaultDurationSec: 420
  },
  2: {
    url: 'https://notebook.google.com/notebook/db13f816-0e4f-41d4-b830-96d26d78217f/artifact/8a954194-13a5-4cda-858c-c31d11e45c4a?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_',
    title: 'วิดีโอบทที่ 2: ตอนที่ 2 4 ขั้นตอนชี้-ปากย้ำ (Prepare • Point • Voice • Confirm)',
    durationLabel: 'วิดีโอบทเรียนตอนที่ 2',
    description: '4 ขั้นตอนมาตรฐานสู่การปฏิบัติที่เป็นเลิศ: เตรียมพร้อม, ชี้เป้าหมาย, เปล่งเสียง, ดึงมือยืนยันความปลอดภัย (Google NotebookLM Video Artifact)',
    defaultDurationSec: 360
  },
  3: {
    url: 'https://notebook.google.com/notebook/db13f816-0e4f-41d4-b830-96d26d78217f/artifact/b2edab69-ffc1-41c2-b321-c5587933d260?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_',
    title: 'วิดีโอบทที่ 3: ตอนที่ 3 สรีรศาสตร์ ท่ายืน และการวางตำแหน่งมือ (Google NotebookLM Deep Dive)',
    durationLabel: 'วิดีโอบทเรียนตอนที่ 3',
    description: 'ท่ายืนมั่นคง แขนเหยียดตรง ทำมุมสายตา และการกำจัดพฤติกรรม Phantom Pointing ชี้หลอกตา ไร้สติ (Google NotebookLM Video Artifact)',
    defaultDurationSec: 360
  },
  4: {
    url: 'https://notebook.google.com/notebook/db13f816-0e4f-41d4-b830-96d26d78217f/artifact/e59f27b8-2062-49d2-8db1-ce5eb6f1186b?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_',
    title: 'วิดีโอบทที่ 4: ตอนที่ 4 กฎทองแห่งการเปล่งเสียง และรูปแบบการยืนยัน (Solo, Mutual, Group)',
    durationLabel: 'วิดีโอบทเรียนตอนที่ 4',
    description: 'การออกเสียงจากกระบังลม ชัดเจน มั่นใจ รูปแบบ Solo, Mutual Confirmation และ Group Touch & Call (Google NotebookLM Video Artifact)',
    defaultDurationSec: 360
  },
  5: {
    url: 'https://notebook.google.com/notebook/db13f816-0e4f-41d4-b830-96d26d78217f/artifact/53d8f2b4-d6a0-499c-8946-1f2bc5e780c8?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_',
    title: 'วิดีโอบทที่ 5: ตอนที่ 5 5 สถานการณ์จริงในโรงงาน TCT (Machine, Mold, LOTO, QC, 5S)',
    durationLabel: 'วิดีโอบทเรียนตอนที่ 5',
    description: 'การนำเทคนิคไปใช้จริงในสายการผลิตชิ้นส่วนเส้นคอร์ดและสายพาน Teijin Cord (Google NotebookLM Video Artifact)',
    defaultDurationSec: 360
  },
  6: {
    url: 'https://notebook.google.com/notebook/db13f816-0e4f-41d4-b830-96d26d78217f/artifact/e11fd54a-f1da-4017-bbc8-5800d7b9b5a3?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_',
    title: 'วิดีโอบทที่ 6: ตอนที่ 6 เกณฑ์การประเมิน 4 มิติ และพันธสัญญาความปลอดภัยสู่ Zero Accident',
    durationLabel: 'วิดีโอบทเรียนตอนที่ 6',
    description: 'เกณฑ์การประเมิน 4 มิติและการยกระดับสู่วัฒนธรรมความปลอดภัย อุบัติเหตุต้องเป็นศูนย์ (Google NotebookLM Video Artifact)',
    defaultDurationSec: 360
  }
};

export const DEFAULT_AI_MODULE_VIDEOS: Record<number, { url: string; title: string; durationLabel: string; description: string; defaultDurationSec: number }> = {
  1: {
    url: '',
    title: 'บทที่ 1: AI for TCT คืออะไร',
    durationLabel: 'ศึกษาเอกสาร',
    description: 'ทำความเข้าใจ AI และ Generative AI ในบริบทโรงงานผลิตเส้นคอร์ด TCT พร้อมกิจกรรมและการประยุกต์ใช้ในแต่ละฝ่าย (ไม่มีวิดีโอบังคับ)',
    defaultDurationSec: 0
  },
  2: {
    url: '',
    title: 'บทที่ 2: Data Privacy & Information Security',
    durationLabel: 'ศึกษาเอกสาร',
    description: 'Data Privacy & Information Security — การรักษาความลับของข้อมูล ความมั่นคงปลอดภัยสารสนเทศ กฎเหล็กห้ามใส่สูตรเคมีและข้อมูลลับบริษัท และ PDPA (ไม่มีวิดีโอบังคับ)',
    defaultDurationSec: 0
  },
  3: {
    url: '',
    title: 'บทที่ 3: TH AI Passport & Digital Identity',
    durationLabel: 'ศึกษาเอกสาร',
    description: 'ศึกษาเนื้อหาเอกสารและทำกิจกรรมจำลองการลงทะเบียน TH AI Passport (ไม่มีวิดีโอบังคับ)',
    defaultDurationSec: 0
  },
  4: {
    url: '',
    title: 'บทที่ 4: Prompt Engineering Basics (เทคนิคสูตร C-T-F-T)',
    durationLabel: 'ศึกษาเอกสาร & เวิร์กช็อป',
    description: 'ศึกษาโครงสร้าง Prompt และทดลองใช้ Prompt Builder Generator จำลอง (ไม่มีวิดีโอบังคับ)',
    defaultDurationSec: 0
  },
  5: {
    url: '',
    title: 'บทที่ 5: Practical AI Use Cases for TCT (กรณีศึกษาการใช้งานจริงในแต่ละฝ่าย)',
    durationLabel: 'ศึกษาเอกสาร & กรณีศึกษา',
    description: 'ศึกษาแนวทางและกรณีศึกษาการประยุกต์ใช้ AI ในฝ่ายผลิต จัดซื้อ ธุรการ และ QA (ไม่มีวิดีโอบังคับ)',
    defaultDurationSec: 0
  },
  6: {
    url: '',
    title: 'บทที่ 6: AI Ethics, Human-in-the-Loop & แผนปฏิบัติการ 30-60-90 วัน',
    durationLabel: 'ศึกษาเอกสาร & แผนงาน',
    description: 'ศึกษาจริยธรรม AI และบันทึกแผนปฏิบัติการ 30-60-90 วัน (ไม่มีวิดีโอบังคับ)',
    defaultDurationSec: 0
  },
  7: {
    url: '',
    title: 'บทที่ 7: การใช้งาน TH AI Passport (aipass.go.th)',
    durationLabel: 'ศึกษาเอกสาร & คู่มือ',
    description: 'คู่มือและขั้นตอนการใช้งานระบบ TH AI Passport สำหรับการลงทะเบียน ยืนยันตัวตน และการรับรองทักษะดิจิทัลของบุคลากร TCT (ไม่มีวิดีโอบังคับ)',
    defaultDurationSec: 0
  }
};

export const DEFAULT_APPLIED_PSYCHOLOGY_MODULE_VIDEOS: Record<number, { url: string; title: string; durationLabel: string; description: string; defaultDurationSec: number }> = {
  1: {
    url: 'https://notebooklm.link.google/Qi5XeX4RLPge',
    title: 'วิดีโอบทที่ 1: จิตวิทยาเพื่อความสำเร็จและ Growth Mindset ในการทำงาน',
    durationLabel: 'วิดีโอบทเรียนตอนที่ 1',
    description: 'จิตวิทยาเพื่อความสำเร็จ การปรับเปลี่ยนกรอบคิดสู่ Growth Mindset และการตั้งเป้าหมายสู่ความเป็นเลิศ (Google NotebookLM Video Link)',
    defaultDurationSec: 360
  },
  2: {
    url: 'https://notebooklm.link.google/JLnqF426neNW',
    title: 'วิดีโอบทที่ 2: การบริหารอารมณ์ ความเครียด และการสร้างพลังฟื้นคืน (Resilience)',
    durationLabel: 'วิดีโอบทเรียนตอนที่ 2',
    description: 'การบริหารอารมณ์หน้างาน ความยืดหยุ่นทางจิตวิทยา (Emotional Agility) และเทคนิค S-T-O-P (Google NotebookLM Video Link)',
    defaultDurationSec: 360
  },
  3: {
    url: 'https://notebooklm.link.google/DCVV2tHiM0Qh',
    title: 'วิดีโอบทที่ 3: การสร้างความสุข ความมั่นคง และความผูกพันในงาน',
    durationLabel: 'วิดีโอบทเรียนตอนที่ 3',
    description: 'ศาสตร์แห่งความสุขในงานตามโมเดล PERMA ความมั่นคงในอาชีพ (Job Security) และการเติบโตอย่างยั่งยืนร่วมกับ TCT (Google NotebookLM Video Link)',
    defaultDurationSec: 360
  }
};

/**
 * Checks if a URL is a Google NotebookLM link
 */
export function isNotebookLMUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('notebook.google.com') || url.includes('notebooklm.google.com') || url.includes('notebooklm.link.google');
}

/**
 * Extracts YouTube Video ID from various URL formats
 */
export function extractYouTubeId(url: string): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const cleanUrl = url.trim();

  // If NotebookLM, return empty or dummy placeholder
  if (isNotebookLMUrl(cleanUrl)) {
    return 'notebooklm';
  }

  // If already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  // Regex to match YouTube URLs
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = cleanUrl.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }

  // Fallback for Shorts: youtube.com/shorts/VIDEO_ID
  const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) {
    return shortsMatch[1];
  }

  return '';
}

/**
 * Retrieves video configuration for a given module and course
 */
export function getModuleVideoConfig(moduleId: number, courseId: string = 'advanced-preventive-maintenance'): ModuleVideoConfig {
  const isAI = courseId === 'ai-for-tct';

  // AI Course: Strict policy per user instruction - completely no videos in AI Course
  if (isAI) {
    const defaultConf = DEFAULT_AI_MODULE_VIDEOS[moduleId] || {
      url: '',
      title: `บทเรียนที่ ${moduleId}`,
      durationLabel: 'ศึกษาเอกสาร',
      description: 'ศึกษาเนื้อหาเอกสารและทำกิจกรรมฝึกปฏิบัติ (ไม่มีวิดีโอ)',
      defaultDurationSec: 0
    };
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_VIDEOS);
      if (raw) {
        const stored = JSON.parse(raw);
        const customKey = `${courseId}_${moduleId}`;
        if (stored[customKey]) {
          delete stored[customKey];
          localStorage.setItem(STORAGE_KEY_CUSTOM_VIDEOS, JSON.stringify(stored));
        }
      }
    } catch {
      // ignore
    }
    return {
      moduleId,
      courseId,
      youtubeUrl: '',
      videoId: '',
      title: defaultConf.title,
      durationLabel: defaultConf.durationLabel,
      description: defaultConf.description,
      defaultDurationSec: 0
    };
  }

  const isKyt = courseId === 'kyt-shisa-kanko';
  const isAppliedPsychology = courseId === 'applied-psychology';
  const isPersonality = courseId === 'personality-psychology' || courseId === 'conflict-management';
  const isPreventive = courseId === 'advanced-preventive-maintenance';

  let defaultConf: { url: string; title: string; durationLabel: string; description: string; defaultDurationSec: number };

  if (isKyt) {
    const modNum = typeof moduleId === 'string' ? parseInt(moduleId, 10) : Number(moduleId);
    const validMod = (!isNaN(modNum) && modNum >= 1 && modNum <= 6) ? modNum : 1;
    defaultConf = DEFAULT_KYT_MODULE_VIDEOS[validMod] || DEFAULT_KYT_MODULE_VIDEOS[1];
  } else if (isAppliedPsychology) {
    const modNum = typeof moduleId === 'string' ? parseInt(moduleId, 10) : Number(moduleId);
    const validMod = (!isNaN(modNum) && modNum >= 1 && modNum <= 3) ? modNum : 1;
    defaultConf = DEFAULT_APPLIED_PSYCHOLOGY_MODULE_VIDEOS[validMod] || DEFAULT_APPLIED_PSYCHOLOGY_MODULE_VIDEOS[1];
  } else {
    const dictionary = isPersonality 
      ? DEFAULT_PERSONALITY_MODULE_VIDEOS 
      : (isPreventive ? DEFAULT_PREVENTIVE_MODULE_VIDEOS : DEFAULT_RISK_MODULE_VIDEOS);
    defaultConf = dictionary[moduleId] || {
      url: '',
      title: `บทเรียนที่ ${moduleId}`,
      durationLabel: 'ศึกษาเอกสาร',
      description: 'ศึกษาเนื้อหาเอกสารและทำกิจกรรมฝึกปฏิบัติ',
      defaultDurationSec: 0
    };
  }

  // Check if admin has set a custom or updated video link
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_VIDEOS);
    if (raw) {
      const stored = JSON.parse(raw);
      const customKey = `${courseId}_${moduleId}`;

      if (stored[customKey] && stored[customKey].url !== undefined && stored[customKey].url.trim() !== '') {
        const customUrl = stored[customKey].url.trim();
        return {
          moduleId,
          courseId,
          youtubeUrl: customUrl,
          videoId: isNotebookLMUrl(customUrl) ? 'notebooklm' : extractYouTubeId(customUrl),
          title: stored[customKey].title || defaultConf.title,
          durationLabel: stored[customKey].durationLabel || defaultConf.durationLabel,
          description: stored[customKey].description || defaultConf.description,
          defaultDurationSec: defaultConf.defaultDurationSec
        };
      }
    }
  } catch (err) {
    console.error('Failed to parse custom module video configuration:', err);
  }

  return {
    moduleId,
    courseId,
    youtubeUrl: defaultConf.url,
    videoId: isNotebookLMUrl(defaultConf.url) ? 'notebooklm' : extractYouTubeId(defaultConf.url),
    title: defaultConf.title,
    durationLabel: defaultConf.durationLabel,
    description: defaultConf.description,
    defaultDurationSec: defaultConf.defaultDurationSec
  };
}

/**
 * Saves or updates custom video URL for a module (used by Admin)
 */
export function saveModuleVideoConfig(
  moduleId: number, 
  youtubeUrl: string, 
  courseId: string = 'advanced-preventive-maintenance',
  title?: string, 
  durationLabel?: string, 
  description?: string
): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_VIDEOS);
    const stored = raw ? JSON.parse(raw) : {};
    const defaultConf = getModuleVideoConfig(moduleId, courseId);

    const customKey = `${courseId}_${moduleId}`;
    stored[customKey] = {
      url: youtubeUrl.trim(),
      title: title?.trim() || defaultConf.title,
      durationLabel: durationLabel?.trim() || defaultConf.durationLabel,
      description: description?.trim() || defaultConf.description
    };

    localStorage.setItem(STORAGE_KEY_CUSTOM_VIDEOS, JSON.stringify(stored));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save module video config:', err);
  }
}

/**
 * Check if employee has finished watching the module video
 */
export function checkIsVideoWatched(empId: string, moduleId: number, courseId: string = 'advanced-preventive-maintenance'): boolean {
  if (courseId === 'ai-for-tct') {
    return true; // No videos in AI course, quiz is always unlocked
  }
  if (!empId) return false;
  const cfg = getModuleVideoConfig(moduleId, courseId);
  // If no video is assigned for this module, it is automatically considered watched
  if (!cfg.youtubeUrl || cfg.youtubeUrl.trim() === '') {
    return true;
  }
  const keyCourse = `tct_video_completed_${empId}_${courseId}_${moduleId}`;
  const keyLegacy = `tct_video_completed_${empId}_${moduleId}`;
  return localStorage.getItem(keyCourse) === 'true' || localStorage.getItem(keyLegacy) === 'true';
}

/**
 * Mark video as completed/watched
 */
export function markVideoAsWatched(empId: string, moduleId: number, courseId: string = 'advanced-preventive-maintenance'): void {
  if (!empId) return;
  const keyCourse = `tct_video_completed_${empId}_${courseId}_${moduleId}`;
  const keyLegacy = `tct_video_completed_${empId}_${moduleId}`;
  localStorage.setItem(keyCourse, 'true');
  localStorage.setItem(keyLegacy, 'true');

  // Also ensure minimum seconds is recorded if zero
  const cfg = getModuleVideoConfig(moduleId, courseId);
  const currentSec = getVideoWatchSeconds(empId, moduleId, courseId);
  if (currentSec < (cfg.defaultDurationSec * 0.8)) {
    saveVideoWatchSeconds(empId, moduleId, cfg.defaultDurationSec, courseId);
  }

  window.dispatchEvent(new Event('storage'));
}

/**
 * Get current recorded watch progress in seconds
 */
export function getVideoWatchSeconds(empId: string, moduleId: number, courseId: string = 'advanced-preventive-maintenance'): number {
  if (!empId) return 0;
  const keyCourse = `tct_video_progress_sec_${empId}_${courseId}_${moduleId}`;
  const valCourse = localStorage.getItem(keyCourse);
  if (valCourse) {
    return parseInt(valCourse, 10) || 0;
  }
  const keyLegacy = `tct_video_progress_sec_${empId}_${moduleId}`;
  const valLegacy = localStorage.getItem(keyLegacy);
  return valLegacy ? parseInt(valLegacy, 10) || 0 : 0;
}

/**
 * Save current recorded watch progress
 */
export function saveVideoWatchSeconds(empId: string, moduleId: number, seconds: number, courseId: string = 'advanced-preventive-maintenance'): void {
  if (!empId) return;
  const keyCourse = `tct_video_progress_sec_${empId}_${courseId}_${moduleId}`;
  const keyLegacy = `tct_video_progress_sec_${empId}_${moduleId}`;
  const secStr = Math.floor(seconds).toString();
  localStorage.setItem(keyCourse, secStr);
  localStorage.setItem(keyLegacy, secStr);
}

export const DEFAULT_MODULE_VIDEOS = DEFAULT_RISK_MODULE_VIDEOS;

export function resetModuleVideosToDefault(): void {
  localStorage.removeItem(STORAGE_KEY_CUSTOM_VIDEOS);
}

export function formatWatchTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 นาที';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} นาที ${s > 0 ? `${s} วินาที` : ''}`.trim();
}

export interface VideoModuleStat {
  moduleId: number;
  title: string;
  seconds: number;
  minutes: number;
  watchMinutes: number;
  watchSeconds: number;
  formatted: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface VideoWatchSummary {
  totalSeconds: number;
  totalMinutes: number;
  totalWatchSeconds: number;
  totalWatchMinutes: number;
  formattedTotalText: string;
  allCompleted: boolean;
  modules: Record<number, VideoModuleStat>;
  modulesList: VideoModuleStat[];
}

/**
 * Calculates complete video watch statistics for training report
 */
export function getCourseVideoWatchSummary(
  empId: string,
  courseId: string = 'advanced-preventive-maintenance',
  moduleCount: number = 3
): VideoWatchSummary {
  let totalSeconds = 0;
  const modulesList: VideoModuleStat[] = [];
  const modulesMap: Record<number, VideoModuleStat> = {};
  let allDone = true;

  for (let i = 1; i <= moduleCount; i++) {
    const config = getModuleVideoConfig(i, courseId);
    let sec = getVideoWatchSeconds(empId, i, courseId);
    const isCompleted = checkIsVideoWatched(empId, i, courseId);

    if (!isCompleted) {
      allDone = false;
    }

    // If marked as completed but seconds somehow zero, backfill with default
    if (isCompleted && sec < 60) {
      sec = config.defaultDurationSec;
    }

    totalSeconds += sec;
    const mins = Math.round((sec / 60) * 10) / 10;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const formatted = `${m} นาที ${s > 0 ? `${s} วินาที` : ''}`.trim();

    const stat: VideoModuleStat = {
      moduleId: i,
      title: config.title,
      seconds: sec,
      minutes: mins,
      watchMinutes: m,
      watchSeconds: sec,
      formatted: sec > 0 ? formatted : 'ยังไม่ได้รับชม',
      isCompleted,
      completedAt: isCompleted ? new Date().toLocaleDateString('th-TH') : undefined
    };

    modulesList.push(stat);
    modulesMap[i] = stat;
  }

  const totalMinutes = Math.round((totalSeconds / 60) * 10) / 10;
  const totalM = Math.floor(totalSeconds / 60);
  const totalS = totalSeconds % 60;
  const formattedTotalText = `${totalM} นาที ${totalS > 0 ? `${totalS} วินาที` : ''}`.trim();

  return {
    totalSeconds,
    totalMinutes,
    totalWatchSeconds: totalSeconds,
    totalWatchMinutes: totalM,
    formattedTotalText: totalSeconds > 0 ? formattedTotalText : '0 นาที',
    allCompleted: allDone,
    modules: modulesMap,
    modulesList
  };
}
