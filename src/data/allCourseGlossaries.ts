import { GLOSSARY_TERMS } from './courseData';
import { PREVENTIVE_GLOSSARY_TERMS } from './preventiveCourseData';

export interface GlossaryItem {
  term: string;
  th: string;
  def: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  badgeColor?: string;
}

// Course 3: Conflict Management (CFM) Glossary
export const CONFLICT_GLOSSARY_TERMS = [
  { term: 'TKI (Thomas-Kilmann Model)', th: 'แบบจำลองโทมัส-คิลแมนน์', def: 'เครื่องมือประเมินสไตล์การจัดการความขัดแย้ง 5 รูปแบบ: ร่วมมือ (Collaborating), ประนีประนอม (Compromising), แข่งขัน (Competing), หลีกเลี่ยง (Avoiding), และยอมตาม (Accommodating)' },
  { term: 'Psychological Safety', th: 'ความปลอดภัยทางจิตวิทยา', def: 'บรรยากาศในทีมที่สมาชิกเชื่อมั่นว่าจะไม่ถูกลงโทษหรือดูถูกเมื่อแสดงความคิดเห็น สอบถามข้อสงสัย หรือยอมรับข้อผิดพลาด' },
  { term: 'I-Message', th: 'ประโยคสื่อสารขึ้นต้นด้วยฉัน', def: 'เทคนิคการสื่อสารที่เน้นความรู้สึกและผลกระทบต่อตนเอง เช่น "ฉันรู้สึกกังวลเมื่อ..." แทนการกล่าวโทษผู้อื่นด้วย You-Message' },
  { term: 'Active Listening', th: 'การฟังอย่างตั้งใจเชิงรุก', def: 'การฟังที่ไม่เพียงได้ยินคำพูด แต่จับความรู้สึก เข้าใจเจตนา สบตา และสะท้อนทวนความเข้าใจ (Paraphrasing) โดยไม่ออกตัวขัดจังหวะ' },
  { term: 'BATNA (Best Alternative to a Negotiated Agreement)', th: 'ทางเลือกที่ดีที่สุดกรณีเจรจาไม่สำเร็จ', def: 'แผนสำรองที่ดีที่สุดที่เตรียมไว้ล่วงหน้า หากการเจรจาต่อรองไม่สามารถบรรลุข้อตกลงร่วมกันได้' },
  { term: 'Escalation Ladder', th: 'บันไดระดับความขัดแย้ง', def: 'ลำดับขั้นของความขัดแย้งตั้งแต่การเห็นต่างเล็กน้อย (Differences) > ความตึงเครียด (Tension) > ข้อพิพาท (Dispute) จนถึงการทำลายล้าง (Destruction)' },
  { term: 'Cognitive Conflict vs Affective Conflict', th: 'ความขัดแย้งทางความคิด vs ทางอารมณ์', def: 'ความขัดแย้งที่เน้นประเด็นงานและวิธีการ (เป็นประโยชน์ต่อการพัฒนา) เทียบกับความขัดแย้งระหว่างบุคคลและอารมณ์ (สร้างความเสียหาย)' },
  { term: 'Win-Win Resolution', th: 'การแก้ปัญหาแบบชนะทั้งสองฝ่าย', def: 'การหาทางออกร่วมที่ตอบสนองความต้องการพื้นฐาน (Underlying Interests) ของทุกฝ่าย ไม่ใช่แค่จุดยืนบนผิวเผิน (Positions)' },
  { term: 'Feedback Loop (SBI Model)', th: 'การให้ผลสะท้อนกลับแบบ SBI', def: 'โครงสร้างการให้ฟีดแบ็ก: Situation (สถานการณ์) > Behavior (พฤติกรรมที่สังเกตได้) > Impact (ผลกระทบที่เกิดขึ้น)' }
];

// Course 4: AI for TCT (AI-101) Glossary
export const AI_GLOSSARY_TERMS = [
  { term: 'LLM (Large Language Model)', th: 'โมเดลภาษาขนาดใหญ่', def: 'โมเดลปัญญาประดิษฐ์ที่ถูกฝึกฝนด้วยคลังข้อมูลมหาศาลเพื่อเข้าใจ ประมวลผล สรุปความ และสร้างข้อความภาษาธรรมชาติได้อย่างสละสลวย' },
  { term: 'Prompt Engineering', th: 'วิศวกรรมคำสั่งปัญญาประดิษฐ์', def: 'เทคนิคการออกแบบโครงสร้างคำสั่ง (Context, Role, Task, Format) เพื่อสั่งการให้ AI สร้างผลลัพธ์ที่แม่นยำ ตรงตามวัตถุประสงค์งาน' },
  { term: 'Hallucination', th: 'อาการเพ้อ/แต่งเรื่องของ AI', def: 'ภาวะที่โมเดล AI สร้างคำตอบที่ดูน่าเชื่อถือแต่เป็นข้อมูลเท็จหรือไม่ตรงกับความจริง ซึ่งต้องมีกระบวนการ Fact-checking กำกับเสมอ' },
  { term: 'RAG (Retrieval-Augmented Generation)', th: 'การเสริมการตอบด้วยคลังเอกสารจริง', def: 'เทคนิคเชื่อมต่อ AI เข้ากับฐานข้อมูลเอกสารหรือคู่มือ SOP ของบริษัท เพื่อให้ AI อ้างอิงคำตอบจากข้อเท็จจริงภายในองค์กรอย่างแม่นยำ' },
  { term: 'Predictive AI vs Generative AI', th: 'AI พยากรณ์ vs AI สร้างสรรค์', def: 'AI ที่ใช้คาดการณ์แนวโน้มและจำแนกข้อมูล (เช่น คาดการณ์เครื่องจักรเสีย) เทียบกับ AI ที่สามารถสร้างเนื้อหาใหม่ (ข้อความ, ภาพ, โค้ด)' },
  { term: 'Computer Vision (CV)', th: 'ระบบการมองเห็นด้วยคอมพิวเตอร์', def: 'เทคโนโลยี AI ประมวลผลภาพถ่ายหรือวิดีโอจากกล้องในสายการผลิต เพื่อตรวจจับข้อบกพร่อง (Defect Detection) ของเส้นคอร์ดและผลิตภัณฑ์' },
  { term: 'Data Privacy & Corporate Security', th: 'ความปลอดภัยข้อมูลองค์กร', def: 'แนวปฏิบัติในการไม่ป้อนข้อมูลความลับทางการค้า ข้อมูลลูกค้า หรือรหัสผ่านลงในบริการ Public AI ที่ไม่ได้ทำข้อตกลง Enterprise' },
  { term: 'Fine-Tuning', th: 'การปรับจูนโมเดลเฉพาะทาง', def: 'การนำโมเดล AI พื้นฐานมาเทรนเพิ่มเติมด้วยชุดข้อมูลเฉพาะขององค์กร เช่น ศัพท์เทคนิคเส้นด้ายและการผลิตของ TCT' },
  { term: 'Token', th: 'หน่วยคำของโมเดล AI', def: 'หน่วยย่อยของคำหรือพยางค์ที่โมเดล AI ใช้ในการอ่านและประมวลผลข้อความ (โดยเฉลี่ย 1 คำภาษาอังกฤษ ≈ 1.3 tokens, ภาษาไทย ≈ 2-4 tokens)' }
];

// Course 5: Personality Psychology (TCT-A001) Glossary
export const PERSONALITY_GLOSSARY_TERMS = [
  { term: 'DISC Profile', th: 'แบบประเมินบุคลิกภาพ DISC', def: 'โมเดลพฤติกรรม 4 สไตล์: D (Dominance - เด็ดขาด), I (Influence - มนุษยสัมพันธ์), S (Steadiness - มั่นคงสม่ำเสมอ), และ C (Conscientiousness - ละเอียดรอบคอบ)' },
  { term: 'Growth Mindset', th: 'กรอบความคิดแบบเติบโต', def: 'ความเชื่อว่าความสามารถ ทักษะ และสติปัญญาสามารถพัฒนาได้ผ่านความพยายาม การเรียนรู้จากข้อผิดพลาด และการเปิดรับฟีดแบ็ก' },
  { term: 'Johari Window', th: 'หน้าต่างโจฮารี', def: 'แบบจำลองความตระหนักรู้ในตนเอง 4 บาน: ด้านเปิดเผย (Open), ด้านจุดบอด (Blind Spot), ด้านซ่อนเร้น (Hidden), และด้านที่ไม่มีใครรู้ (Unknown)' },
  { term: 'Emotional Intelligence (EQ / EI)', th: 'ความฉลาดทางอารมณ์', def: 'ความสามารถในการรับรู้ เข้าใจ ควบคุมอารมณ์ตนเอง และเห็นอกเห็นใจอารมณ์ของผู้อื่นเพื่อสร้างสัมพันธภาพที่ดีในการทำงาน' },
  { term: 'Empathy (Cognitive vs Affective)', th: 'ความเข้าอกเข้าใจผู้อื่น', def: 'การเข้าใจมุมมองและความคิดของเพื่อนร่วมงาน (ทางความคิด) ร่วมกับการเชื่อมโยงความรู้สึกและใส่ใจความทุกข์ร้อนของผู้อื่น (ทางอารมณ์)' },
  { term: 'Self-Regulation', th: 'การควบคุมกำกับอารมณ์ตนเอง', def: 'ทักษะในการจัดการกับสภาวะอารมณ์หงุดหงิดหรือความกดดันหน้างาน ไม่ให้แสดงพฤติกรรมก้าวร้าวหรือตัดสินใจผิดพลาด' },
  { term: 'Cognitive Bias', th: 'ความเอนเอียงทางความคิด', def: 'ข้อผิดพลาดเชิงระบบในการคิดและตัดสินใจ เช่น อคติเข้าข้างตนเอง (Confirmation Bias) หรือภาพเหมารวม (Halo Effect)' }
];

export const APPLIED_PSYCHOLOGY_GLOSSARY_TERMS = [
  { term: 'Growth Mindset', th: 'กรอบความคิดแบบเติบโต', def: 'ความเชื่อว่าความสามารถ สติปัญญา และทักษะการทำงานสามารถพัฒนาได้เสมอผ่านการเรียนรู้ ความพยายาม และการฝึกฝน' },
  { term: 'Grit', th: 'ความเพียรพยายามทรหด', def: 'การผสานระหว่างความหลงใหลในเป้าหมาย (Passion) และความมุ่งมั่นไม่ยอมแพ้ต่ออุปสรรค (Perseverance) สู่ความสำเร็จระยะยาว' },
  { term: 'Emotional Agility', th: 'ความยืดหยุ่นทางอารมณ์', def: 'ความสามารถในการรู้เท่าทันอารมณ์ตนเอง ไม่ติดกับดักอารมณ์ลบ และเลือกแสดงออกด้วยพฤติกรรมที่มีสติและสร้างสรรค์' },
  { term: 'S-T-O-P Technique', th: 'เทคนิคการหยุดสติ 4 ขั้น', def: 'เครื่องมือดึงสติหน้างาน: Stop (หยุด) > Take a breath (หายใจลึก) > Observe (สังเกตอารมณ์/ร่างกาย) > Proceed (ก้าวต่อไปด้วยสติ)' },
  { term: 'Resilience', th: 'พลังฟื้นคืนทางใจ', def: 'ความสามารถในการฟื้นตัวอย่างรวดเร็วหลังเผชิญความผิดพลาด ความเครียด หรือวิกฤต โดยไม่สูญเสียความเชื่อมั่น' },
  { term: 'PERMA Model', th: 'แบบจำลองสุขภาวะ 5 เสาหลัก', def: 'ทฤษฎีความสุขของ Martin Seligman: Positive Emotion (อารมณ์บวก), Engagement (ความจดจ่อ), Relationships (สัมพันธภาพ), Meaning (คุณค่าในงาน), Accomplishment (ความสำเร็จ)' },
  { term: 'Job Security & Employability', th: 'ความมั่นคงในอาชีพและการสร้างคุณค่า', def: 'ความมั่นคงที่ยั่งยืนซึ่งเกิดจากการยกระดับทักษะตนเองอย่างต่อเนื่อง (Upskilling) และการส่งมอบคุณค่าที่แท้จริงแก่องค์กร' }
];

/**
 * Get all combined glossary terms with normalized course metadata
 */
export function getAllGlossaryTerms(): GlossaryItem[] {
  const list: GlossaryItem[] = [
    ...GLOSSARY_TERMS.map(t => ({
      ...t,
      courseId: 'risk-management',
      courseCode: 'QSRM-001',
      courseTitle: 'หลักสูตร 1: การบริหารความเสี่ยง (QSRM)',
      badgeColor: 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300'
    })),
    ...PREVENTIVE_GLOSSARY_TERMS.map(t => ({
      ...t,
      courseId: 'advanced-preventive-maintenance',
      courseCode: 'APM-002',
      courseTitle: 'หลักสูตร 2: บำรุงรักษาเชิงป้องกัน (APM)',
      badgeColor: 'border-purple-500/40 bg-purple-950/60 text-purple-300'
    })),
    ...CONFLICT_GLOSSARY_TERMS.map(t => ({
      ...t,
      courseId: 'conflict-management',
      courseCode: 'CFM-003',
      courseTitle: 'หลักสูตร 3: การจัดการความขัดแย้ง (CFM)',
      badgeColor: 'border-amber-500/40 bg-amber-950/60 text-amber-300'
    })),
    ...AI_GLOSSARY_TERMS.map(t => ({
      ...t,
      courseId: 'ai-for-tct',
      courseCode: 'AI-101',
      courseTitle: 'หลักสูตร 4: AI for TCT Organization',
      badgeColor: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
    })),
    ...PERSONALITY_GLOSSARY_TERMS.map(t => ({
      ...t,
      courseId: 'personality-psychology',
      courseCode: 'TCT-A001',
      courseTitle: 'หลักสูตร 5: จิตวิทยาบุคลิกภาพ (A001)',
      badgeColor: 'border-blue-500/40 bg-blue-950/60 text-blue-300'
    })),
    ...APPLIED_PSYCHOLOGY_GLOSSARY_TERMS.map(t => ({
      ...t,
      courseId: 'applied-psychology',
      courseCode: 'TCT-PSY-01',
      courseTitle: 'หลักสูตร 7: จิตวิทยาประยุกต์ในการทำงาน (PSY-01)',
      badgeColor: 'border-teal-500/40 bg-teal-950/60 text-teal-300'
    }))
  ];

  return list;
}
