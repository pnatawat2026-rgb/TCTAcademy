import { CourseModule, MiniGameScenario, Question } from '../types';

export const COURSE_QUESTIONS: Question[] = [
  {
    id: 1,
    moduleId: 1,
    questionText: 'ความเสี่ยง (Risk) หมายถึงอะไร?',
    choices: [
      { id: 'a', text: 'เหตุการณ์ที่เกิดขึ้นแล้วเท่านั้น', isCorrect: false },
      { id: 'b', text: 'โอกาสที่จะเกิดเหตุการณ์ไม่พึงประสงค์ซึ่งกระทบต่อเป้าหมายองค์กร', isCorrect: true },
      { id: 'c', text: 'ผลกำไรที่คาดหวัง', isCorrect: false },
      { id: 'd', text: 'แผนการตลาดประจำปี', isCorrect: false }
    ],
    explanation: 'ความเสี่ยง (Risk) หมายถึง โอกาสที่จะเกิดเหตุการณ์ไม่พึงประสงค์ซึ่งส่งผลกระทบต่อเป้าหมายขององค์กร ไม่ว่าจะเป็นด้านความปลอดภัย คุณภาพ การผลิต หรือชื่อเสียง'
  },
  {
    id: 2,
    moduleId: 1,
    questionText: 'เหตุใดการบริหารความเสี่ยงเชิงรุก (Proactive) จึงมีต้นทุนรวมต่ำกว่าเชิงรับ (Reactive)?',
    choices: [
      { id: 'a', text: 'เพราะไม่ต้องลงทุนเลย', isCorrect: false },
      { id: 'b', text: 'เพราะการป้องกันล่วงหน้าช่วยลดทั้งความเสียหายทางตรงและต้นทุนแฝงที่มองไม่เห็น', isCorrect: true },
      { id: 'c', text: 'เพราะเชิงรับไม่มีต้นทุนใดๆ', isCorrect: false },
      { id: 'd', text: 'ไม่มีความแตกต่างกัน', isCorrect: false }
    ],
    explanation: 'การรอให้ปัญหาเกิดขึ้นก่อนแล้วค่อยแก้ไข (Reactive) มีต้นทุนแฝง เช่น เวลาที่สูญเสีย ความเชื่อมั่นของลูกค้า ซึ่งสูงกว่าต้นทุนการป้องกันล่วงหน้า (Proactive) เสมอ (โมเดล Iceberg Cost)'
  },
  {
    id: 3,
    moduleId: 1,
    questionText: 'ข้อใดคือความเสี่ยงด้านความปลอดภัย (Safety Risk)?',
    choices: [
      { id: 'a', text: 'สินค้าไม่ได้มาตรฐาน', isCorrect: false },
      { id: 'b', text: 'อุบัติเหตุจากเครื่องจักรหรือการบาดเจ็บจากการทำงาน', isCorrect: true },
      { id: 'c', text: 'อัตราการลาออกของพนักงาน', isCorrect: false },
      { id: 'd', text: 'เครื่องจักรขัดข้องบ่อย', isCorrect: false }
    ],
    explanation: 'ความเสี่ยงด้านความปลอดภัย (Safety Risk) คือโอกาสที่จะเกิดอุบัติเหตุหรือการบาดเจ็บจากการทำงาน เช่น จากเครื่องจักร สารเคมี หรือสภาพแวดล้อมที่ไม่ปลอดภัย'
  },
  {
    id: 4,
    moduleId: 2,
    questionText: 'Risk Matrix ใช้ประเมินความเสี่ยงจากมิติใด?',
    choices: [
      { id: 'a', text: 'ราคาต้นทุนและเวลา', isCorrect: false },
      { id: 'b', text: 'โอกาสเกิด (Likelihood) และความรุนแรงของผลกระทบ (Severity)', isCorrect: true },
      { id: 'c', text: 'จำนวนพนักงานและงบประมาณ', isCorrect: false },
      { id: 'd', text: 'ยอดขายและกำไร', isCorrect: false }
    ],
    explanation: 'Risk Matrix ประเมินจาก 2 มิติหลัก: โอกาสเกิด (Likelihood 1-5) คูณกับ ความรุนแรงของผลกระทบ (Severity 1-5) โดย Risk Score = Likelihood x Severity'
  },
  {
    id: 5,
    moduleId: 2,
    questionText: 'มาตรการควบคุมความเสี่ยงที่มีประสิทธิภาพสูงสุดตามหลัก Hierarchy of Controls คือข้อใด?',
    choices: [
      { id: 'a', text: 'อุปกรณ์ป้องกันส่วนบุคคล (PPE)', isCorrect: false },
      { id: 'b', text: 'การขจัดความเสี่ยง (Elimination)', isCorrect: true },
      { id: 'c', text: 'การควบคุมเชิงบริหารจัดการ (Administrative Controls)', isCorrect: false },
      { id: 'd', text: 'การทดแทน (Substitution)', isCorrect: false }
    ],
    explanation: 'ตามหลัก Hierarchy of Controls ลำดับที่มีประสิทธิภาพสูงสุดคือ Elimination (ขจัดอันตรายที่ต้นเหตุ) > Substitution > Engineering Controls > Administrative Controls และต่ำสุดคือ PPE'
  },
  {
    id: 6,
    moduleId: 2,
    questionText: 'Risk Register มีประโยชน์อย่างไร?',
    choices: [
      { id: 'a', text: 'เป็นเอกสารเก็บประวัติพนักงาน', isCorrect: false },
      { id: 'b', text: 'เป็นทะเบียนบันทึกความเสี่ยง การประเมิน และมาตรการจัดการที่ต้องปรับปรุงให้เป็นปัจจุบันเสมอ', isCorrect: true },
      { id: 'c', text: 'เป็นรายงานยอดขายประจำเดือน', isCorrect: false },
      { id: 'd', text: 'เป็นคู่มือการใช้เครื่องจักร', isCorrect: false }
    ],
    explanation: 'Risk Register คือทะเบียนบันทึกความเสี่ยง การประเมินระดับความเสี่ยง และมาตรการจัดการ พร้อมผู้รับผิดชอบและกำหนดเวลา เพื่อทบทวนให้เป็นปัจจุบันเสมอ'
  },
  {
    id: 7,
    moduleId: 3,
    questionText: 'RCA (Root Cause Analysis) มุ่งเน้นการวิเคราะห์สิ่งใด?',
    choices: [
      { id: 'a', text: 'หาตัวบุคคลมาลงโทษ', isCorrect: false },
      { id: 'b', text: 'กระบวนการและปัจจัยเชิงระบบที่ทำให้เกิดปัญหา', isCorrect: true },
      { id: 'c', text: 'ผลกำไรขาดทุนของหน่วยงาน', isCorrect: false },
      { id: 'd', text: 'ความสัมพันธ์ระหว่างพนักงาน', isCorrect: false }
    ],
    explanation: 'RCA มุ่งเน้นค้นหาสาเหตุเชิงระบบและกระบวนการทำงานเพื่อวางมาตรการป้องกันไม่ให้เกิดซ้ำ ไม่ใช่การหาคนผิดหรือลงโทษบุคคล'
  },
  {
    id: 8,
    moduleId: 3,
    questionText: 'วัฒนธรรม Just Culture ส่งเสริมสิ่งใด?',
    choices: [
      { id: 'a', text: 'การลงโทษพนักงานทุกกรณีที่เกิดข้อผิดพลาด', isCorrect: false },
      { id: 'b', text: 'การให้พนักงานกล้ารายงานอุบัติการณ์โดยไม่กลัวถูกลงโทษ ยกเว้นกรณีประมาทร้ายแรง', isCorrect: true },
      { id: 'c', text: 'การปกปิดข้อมูลอุบัติการณ์จากผู้บริหาร', isCorrect: false },
      { id: 'd', text: 'การลดจำนวนการรายงานให้น้อยที่สุด', isCorrect: false }
    ],
    explanation: 'Just Culture (วัฒนธรรมความปลอดภัยแบบไม่กล่าวโทษ) สร้างบรรยากาศที่ส่งเสริมให้พนักงานกล้ารายงานข้อผิดพลาด/Near Miss อย่างโปร่งใส เพื่อเรียนรู้และปรับปรุงระบบ'
  },
  {
    id: 9,
    moduleId: 4,
    questionText: 'การบำรุงรักษาเชิงป้องกัน (Preventive Maintenance) มีประโยชน์อย่างไรต่อการบริหารความเสี่ยง?',
    choices: [
      { id: 'a', text: 'ไม่มีประโยชน์ชัดเจน', isCorrect: false },
      { id: 'b', text: 'ลดความเสี่ยงจากความเสียหายฉับพลันของเครื่องจักร', isCorrect: true },
      { id: 'c', text: 'เพิ่มต้นทุนโดยไม่จำเป็น', isCorrect: false },
      { id: 'd', text: 'ใช้ได้เฉพาะเครื่องจักรใหม่เท่านั้น', isCorrect: false }
    ],
    explanation: 'Preventive Maintenance ช่วยลดความเสี่ยงด้านความปลอดภัยจากการที่เครื่องจักรพังฉับพลัน และลดความเสี่ยงด้านคุณภาพจากการผลิตชิ้นงานไม่ได้สเปก'
  },
  {
    id: 10,
    moduleId: 4,
    questionText: 'บทบาทของหัวหน้างานในการบริหารความเสี่ยงประจำวันคือข้อใด?',
    choices: [
      { id: 'a', text: 'สังเกตความเสี่ยงในพื้นที่ปฏิบัติงานและส่งเสริมให้พนักงานรายงานความผิดปกติ', isCorrect: true },
      { id: 'b', text: 'รอให้ฝ่ายความปลอดภัยดูแลทั้งหมด', isCorrect: false },
      { id: 'c', text: 'เพิกเฉยต่อความผิดปกติเล็กน้อย', isCorrect: false },
      { id: 'd', text: 'ลงโทษพนักงานที่รายงานปัญหา', isCorrect: false }
    ],
    explanation: 'หัวหน้างานต้องสังเกตความเสี่ยงในหน้างานจริงอย่างต่อเนื่อง จัด Toolbox Talk และส่งเสริมให้พนักงานรายงานความผิดปกติหรือเหตุการณ์เฉียดฉิว (Near Miss) ทันที'
  }
];

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 1,
    courseId: 'risk-management',
    title: 'Module 1: Principles & Fundamentals',
    thaiTitle: 'หลักการพื้นฐานของการบริหารความเสี่ยงด้านคุณภาพและความปลอดภัย',
    durationMinutes: 8,
    youtubeUrl: 'https://youtu.be/58dTDWWX0NM',
    videoTitle: 'วิดีโอบทที่ 1: หลักการพื้นฐานของการบริหารความเสี่ยงด้านคุณภาพและความปลอดภัย',
    videoDurationSec: 270,
    badge: 'Fundamental',
    color: 'from-cyan-500 to-blue-600',
    summaryPoints: [
      'ความเสี่ยงด้านคุณภาพและความเสี่ยงด้านความปลอดภัยมักมีต้นตอร่วมกัน ควรบริหารไปพร้อมกัน',
      'การบริหารความเสี่ยงเชิงรุก (Proactive) มีต้นทุนรวมต่ำกว่าการแก้ไขปัญหาเชิงรับ (Reactive) เสมอ',
      'การบริหารความเสี่ยงเป็นความรับผิดชอบร่วมกัน (Shared Responsibility) ของทุกระดับในองค์กร'
    ],
    quizQuestionIds: [1, 2, 3],
    sections: [
      {
        id: 'm1-1',
        title: '1.1 ความเสี่ยง (Risk) vs อันตราย (Hazard)',
        content: [
          'ความเสี่ยง (Risk) หมายถึง โอกาสที่จะเกิดเหตุการณ์ไม่พึงประสงค์ซึ่งส่งผลกระทบต่อเป้าหมายขององค์กร ไม่ว่าจะเป็นด้านความปลอดภัย คุณภาพ การผลิต หรือชื่อเสียง ความเสี่ยงไม่สามารถขจัดให้หมดไปได้ทั้งหมด แต่สามารถบริหารจัดการให้อยู่ในระดับที่ยอมรับได้ผ่านกระบวนการที่เป็นระบบ',
          'สิ่งที่ต้องแยกให้ออกคือ "อันตราย" (Hazard) ซึ่งหมายถึงสิ่งที่มีศักยภาพก่อให้เกิดความเสียหาย เช่น เครื่องจักรที่มีส่วนเคลื่อนไหว สารเคมีอันตราย หรือพื้นที่ทำงานที่มีเสียงดัง ในขณะที่ "ความเสี่ยง" (Risk) คือโอกาสและความรุนแรงที่อันตรายนั้นจะก่อให้เกิดผลกระทบจริงในสถานการณ์หนึ่งๆ'
        ],
        bulletPoints: [
          'Hazard (อันตราย): แหล่งกำเนิดหรือสภาพการณ์ที่มีศักยภาพก่อความเสียหาย (เช่น ถังกรด, สายพานหมุนเปลือย)',
          'Risk (ความเสี่ยง): ผลรวมของ โอกาสเกิด (Likelihood) x ความรุนแรง (Severity) หากสัมผัสกับ Hazard นั้น'
        ],
        keyHighlight: 'ความเสี่ยง = โอกาสเกิด (Likelihood) × ความรุนแรง (Severity)'
      },
      {
        id: 'm1-2',
        title: '1.2 สองเสาหลักของความเสี่ยง: คุณภาพ & ความปลอดภัย',
        content: [
          'หลักสูตรนี้มุ่งเน้นความเสี่ยง 2 ด้านที่กระทบต่อองค์กรโดยตรงและเชื่อมโยงกันเสมอ:',
          '1. ความเสี่ยงด้านคุณภาพ (Quality Risk): โอกาสที่กระบวนการผลิตจะให้ผลลัพธ์ไม่ได้มาตรฐาน เช่น สินค้ามีข้อบกพร่อง ค่าที่วัดได้เกินเกณฑ์ที่ลูกค้ากำหนด หรือขั้นตอนตรวจสอบคุณภาพถูกข้ามไป',
          '2. ความเสี่ยงด้านความปลอดภัย (Safety Risk): โอกาสที่จะเกิดอุบัติเหตุหรือการบาดเจ็บจากการทำงาน เช่น จากเครื่องจักร สารเคมี หรือสภาพแวดล้อมการทำงานที่ไม่ปลอดภัย'
        ],
        bulletPoints: [
          'ทั้งสองด้านมักมีต้นตอร่วมกัน: เช่น เครื่องจักรที่ขาดการบำรุงรักษา อาจทำให้ได้สินค้าไม่ได้มาตรฐาน (คุณภาพ) ในเวลาเดียวกับที่เสี่ยงต่อการเกิดอุบัติเหตุกับผู้ปฏิบัติงาน (ความปลอดภัย)',
          'การบริหารทั้งสองด้านไปพร้อมกันจึงมีประสิทธิภาพสูงกว่าการแยกจัดการทีละด้าน'
        ],
        keyHighlight: 'สองเสาหลักเชื่อมโยงกัน: ขาดการบำรุงรักษา = สินค้าเสีย (Quality) + เสี่ยงอุบัติเหตุ (Safety)'
      },
      {
        id: 'm1-3',
        title: '1.3 เหตุใดจึงต้องบริหารความเสี่ยงเชิงรุก (Proactive vs Reactive)',
        content: [
          'การรอให้ปัญหาเกิดขึ้นก่อนแล้วค่อยแก้ไข (Reactive) มักมีต้นทุนสูงกว่าการป้องกันล่วงหน้า (Proactive) เพราะต้นทุนที่มองเห็นได้ชัด เช่น ค่าซ่อมหรือค่ารักษาพยาบาล เป็นเพียงส่วนยอดของภูเขาน้ำแข็ง (Iceberg Cost)',
          'ในขณะที่ต้นทุนแฝง เช่น เวลาการผลิตที่สูญเสียไป ค่าปรับส่งมอบล่าช้า หรือความเชื่อมั่นของลูกค้าที่เสียไป มักมีมูลค่าสูงกว่าหลายเท่า'
        ],
        bulletPoints: [
          'เชิงรับ (Reactive): ดัชนีต้นทุนสัมพัทธ์ ~ 100 (เกิดเหตุแล้วซ่อม/จ่ายค่ารักษา/ชดเชย)',
          'เชิงป้องกันตามรอบ (Preventive): ดัชนีต้นทุนสัมพัทธ์ ~ 55 (ตรวจเช็คตามกำหนด)',
          'เชิงรุกเป็นระบบ (Proactive/Systematic): ดัชนีต้นทุนสัมพัทธ์ ~ 25 (ควบคุมต้นเหตุ/ลดความเสี่ยงก่อนเกิดเหตุ)'
        ],
        keyHighlight: 'ต้นทุนแฝงใต้ภูเขาน้ำแข็ง (Iceberg Cost) สูงกว่าค่าเสียหายทางตรงเสมอ'
      },
      {
        id: 'm1-4',
        title: '1.4 บทบาทความรับผิดชอบร่วมกัน (Shared Responsibility)',
        content: [
          'การบริหารความเสี่ยงที่มีประสิทธิผลต้องอาศัยความร่วมมือจากทุกระดับ:',
          '• ผู้บริหาร: กำหนดนโยบาย จัดสรรงบประมาณ และสนับสนุนทรัพยากร',
          '• หัวหน้างาน: สังเกตความเสี่ยงในพื้นที่ จัด Toolbox Talk และติดตามผลมาตรการ',
          '• พนักงานหน้างาน: ปฏิบัติตามมาตรการความปลอดภัยอย่างเคร่งครัด และรายงานความผิดปกติทันที'
        ],
        keyHighlight: 'ความปลอดภัยและคุณภาพเป็นหน้าที่ของทุกคน ไม่ใช่ของฝ่ายใดฝ่ายหนึ่ง'
      }
    ]
  },
  {
    id: 2,
    courseId: 'risk-management',
    title: 'Module 2: Risk Management Process',
    thaiTitle: 'กระบวนการบริหารความเสี่ยง (ระบุ ประเมิน ควบคุม)',
    durationMinutes: 9,
    youtubeUrl: 'https://youtu.be/ZToYEJN2YxQ',
    videoTitle: 'วิดีโอบทที่ 2: การชี้บ่งอันตรายและการประเมินความเสี่ยง (5x5 Matrix & Hierarchy of Controls)',
    videoDurationSec: 315,
    badge: 'Core Matrix',
    color: 'from-purple-500 to-indigo-600',
    summaryPoints: [
      'Risk Score = Likelihood x Severity ช่วยจัดลำดับความสำคัญของความเสี่ยงอย่างเป็นรูปธรรม',
      'Hierarchy of Controls: ควรเริ่มจากการขจัดความเสี่ยงที่ต้นเหตุก่อนพึ่ง PPE เป็นทางเลือกสุดท้าย',
      'Risk Register ต้องเป็นปัจจุบันเสมอ มีผู้รับผิดชอบและกำหนดเวลาชัดเจน'
    ],
    quizQuestionIds: [4, 5, 6],
    sections: [
      {
        id: 'm2-1',
        title: '2.1 การระบุความเสี่ยง (Risk Identification)',
        content: [
          'ขั้นตอนแรกคือการระบุความเสี่ยงที่อาจเกิดขึ้นในแต่ละขั้นตอนของกระบวนการทำงาน โดยใช้วิธีการต่างๆ เช่น:',
          '• การสำรวจพื้นที่ปฏิบัติงาน (Walkthrough Inspection)',
          '• การระดมสมองร่วมกับพนักงานหน้างาน (Brainstorming / Hazard Hunting)',
          '• การทบทวนอุบัติการณ์และข้อร้องเรียนในอดีต (Historical Incident Review)'
        ],
        keyHighlight: 'ค้นหาความเสี่ยงเชิงรุกในหน้างานจริง โดยให้พนักงานผู้ปฏิบัติการมีส่วนร่วม'
      },
      {
        id: 'm2-2',
        title: '2.2 การประเมินความเสี่ยง & Risk Matrix 5x5',
        content: [
          'ประเมินระดับความเสี่ยงจาก 2 มิติหลัก คือ โอกาสเกิด (Likelihood 1-5) และความรุนแรงของผลกระทบ (Severity 1-5) แล้วนำมาจัดวางบน Risk Matrix เพื่อจัดลำดับความสำคัญ โดยคำนวณคะแนน:',
          'Risk Score = Likelihood (โอกาสเกิด) × Severity (ความรุนแรง)',
          '• คะแนน 1 - 5 (สีเขียว - ต่ำ): ยอมรับได้ ติดตามตามปกติ',
          '• คะแนน 6 - 14 (สีเหลือง/ส้ม - ปานกลาง): ต้องมีมาตรการควบคุมเพิ่มเติม',
          '• คะแนน 15 - 25 (สีแดง - สูง): วิกฤต ต้องหยุดหรือจัดการโดยด่วนทันที'
        ],
        interactiveType: 'risk_matrix',
        keyHighlight: 'คลิกจำลองระดับ Likelihood x Severity บนตาราง Risk Matrix ด้านล่างเพื่อวิเคราะห์ระดับความเร่งด่วน'
      },
      {
        id: 'm2-3',
        title: '2.3 ลำดับมาตรการควบคุมความเสี่ยง (Hierarchy of Controls)',
        content: [
          'ลำดับความสำคัญของมาตรการควบคุมเรียงจากมีประสิทธิภาพสูงสุดไปต่ำสุด:',
          '1. การขจัดความเสี่ยง (Elimination): ขจัดอันตรายออกไปทั้งหมด (ประสิทธิภาพสูงสุด)',
          '2. การทดแทน (Substitution): เปลี่ยนไปใช้วัสดุหรือกระบวนการที่อันตรายน้อยกว่า',
          '3. การควบคุมทางวิศวกรรม (Engineering Controls): ติดตั้งการ์ดป้องกัน ระบบระบายอากาศ เซ็นเซอร์ตัดการทำงาน',
          '4. การควบคุมเชิงบริหารจัดการ (Administrative Controls): อบรม จัดทำ SOP ติดป้ายเตือน หมุนเวียนงาน',
          '5. อุปกรณ์ป้องกันส่วนบุคคล (PPE): แว่นตา ถุงมือ หน้ากาก (ประสิทธิภาพต่ำสุด เป็นด่านสุดท้าย)'
        ],
        interactiveType: 'hierarchy_controls',
        keyHighlight: 'PPE เป็นด่านสุดท้าย ไม่ใช่มาตรการแรกในการแก้ปัญหา'
      },
      {
        id: 'm2-4',
        title: '2.4 ทะเบียนความเสี่ยง (Risk Register)',
        content: [
          'ทุกความเสี่ยงและมาตรการที่กำหนดต้องบันทึกลงใน Risk Register พร้อมระบุ:',
          '• จุดเสี่ยง & ลักษณะความเสี่ยง (ด้านคุณภาพ / ความปลอดภัย)',
          '• คะแนนประเมิน (S x L = Risk Score)',
          '• มาตรการควบคุมที่ตกลงกัน',
          '• ผู้รับผิดชอบ (Person in Charge) และกำหนดเวลาแล้วเสร็จ (Due Date)',
          '• สถานะการติดตามและทบทวนให้เป็นปัจจุบันเสมอ'
        ],
        keyHighlight: 'Risk Register ที่ดีต้องมี Action Plan และผู้รับผิดชอบที่ระบุตัวตนชัดเจน'
      }
    ]
  },
  {
    id: 3,
    courseId: 'risk-management',
    title: 'Module 3: Incident Management & Learning',
    thaiTitle: 'การจัดการอุบัติการณ์และการเรียนรู้จากเหตุการณ์',
    durationMinutes: 9,
    youtubeUrl: 'https://youtu.be/KSfJvXDck_M',
    videoTitle: 'วิดีโอบทที่ 3: การควบคุมความปลอดภัยในกระบวนการผลิต (LOTO, Visual Control & Poka-Yoke)',
    videoDurationSec: 285,
    badge: 'Systemic RCA',
    color: 'from-emerald-500 to-teal-600',
    summaryPoints: [
      'Near Miss ทั้งด้านคุณภาพและความปลอดภัยต้องถูกรายงานเสมอ แม้ไม่มีความเสียหายจริงเกิดขึ้น',
      'RCA มุ่งหาสาเหตุเชิงระบบ ไม่ใช่หาผู้กระทำผิดมาลงโทษ ใช้ได้ทั้งอุบัติการณ์คุณภาพและความปลอดภัย',
      'Just Culture ทำให้องค์กรได้รับข้อมูลครบถ้วนขึ้น เพราะพนักงานกล้ารายงานมากขึ้น'
    ],
    quizQuestionIds: [7, 8],
    sections: [
      {
        id: 'm3-1',
        title: '3.1 การรายงานอุบัติการณ์ & Near Miss (เหตุการณ์เกือบเกิดอุบัติเหตุ)',
        content: [
          'อุบัติการณ์ (Incident) ครอบคลุมทั้งด้านความปลอดภัย (เช่น ลื่นล้ม บาดเจ็บ) และด้านคุณภาพ (เช่น สินค้าหลุด spec ถึงมือลูกค้า)',
          'รวมถึง "เหตุการณ์เกือบเกิดความเสียหาย" (Near Miss) เช่น ชิ้นงานเกือบร่วงใส่ศีรษะ หรือเกือบหยิบวัตถุดิบผิดเกรดเข้าเครื่อง ทั้งสองประเภทควรได้รับการบันทึกและรายงานทุกครั้ง แม้ยังไม่มีความเสียหายเกิดขึ้นจริง เพราะเป็นสัญญาณเตือนล่วงหน้าที่ช่วยป้องกันเหตุการณ์รุนแรงในอนาคต (ทฤษฎี Heinrich Pyramid)'
        ],
        keyHighlight: '1 อุบัติเหตุรุนแรง มักเกิดจาก 29 อุบัติเหตุเล็ก และ 300 Near Misses ที่ถูกละเลย'
      },
      {
        id: 'm3-2',
        title: '3.2 การวิเคราะห์สาเหตุเชิงระบบ (Root Cause Analysis: RCA) & 5 Whys',
        content: [
          'การวิเคราะห์ควรมุ่งเน้นที่กระบวนการและปัจจัยเชิงระบบ ไม่ใช่การหาตัวบุคคลมาลงโทษ เครื่องมือที่นิยมใช้คือเทคนิค 5 Whys (ถามทำไม 5 ครั้ง):',
          'ตัวอย่าง: เครื่องจักรหยุดทำงานกะทันหันและสินค้าชิ้นนั้นเสียรูป',
          '• ทำไม 1: ฟิวส์ขาด',
          '• ทำไม 2: มอเตอร์ทำงานหนักเกินกำหนด (Overload)',
          '• ทำไม 3: ระบบหล่อลื่นไม่เพียงพอ แกนหมุนฝืด',
          '• ทำไม 4: ไม่มีการตรวจสอบระดับน้ำมันหล่อลื่นตามรอบ',
          '• ทำไม 5: แผนบำรุงรักษาเชิงป้องกัน (PM) ไม่ได้ระบุรายการตรวจสอบนี้ไว้ — นี่คือสาเหตุที่แท้จริง!'
        ],
        interactiveType: 'rca_whys',
        keyHighlight: 'หาสาเหตุที่ระบบ ไม่ใช่โทษความผิดพลาดของบุคคล'
      },
      {
        id: 'm3-3',
        title: '3.3 ขั้นตอนการตอบสนอง 5 ขั้น เมื่อเกิดอุบัติการณ์',
        content: [
          '1. ควบคุมสถานการณ์: ดูแลความปลอดภัยและปฐมพยาบาลผู้ได้รับผลกระทบเป็นอันดับแรก',
          '2. รักษาสภาพที่เกิดเหตุ: กั้นพื้นที่และบันทึกภาพเพื่อการสืบสวนหาสาเหตุ',
          '3. แจ้งและบันทึกข้อมูล: แจ้งผู้เกี่ยวข้องและบันทึกข้อมูลเบื้องต้นทันที',
          '4. วิเคราะห์และป้องกัน: ดำเนินการ RCA และกำหนดมาตรการป้องกันเชิงระบบ',
          '5. ติดตามและสื่อสาร: ติดตามผลมาตรการและแชร์ Lesson Learned แก่หน่วยงานที่เกี่ยวข้อง'
        ],
        keyHighlight: 'ตอบสนองอย่างรวดเร็ว เป็นขั้นตอน และแปลงทุกเหตุการณ์เป็นบทเรียนปรับปรุงระบบ'
      },
      {
        id: 'm3-4',
        title: '3.4 วัฒนธรรมความปลอดภัยแบบไม่กล่าวโทษ (Just Culture)',
        content: [
          'องค์กรที่มีวัฒนธรรม Just Culture จะส่งเสริมให้พนักงานกล้ารายงานข้อผิดพลาดและ Near Miss โดยไม่ต้องกลัวถูกลงโทษ (เว้นแต่การประมาทเลินเล่ออย่างร้ายแรงหรือการจงใจฝ่าฝืนกฎ)',
          'วัฒนธรรมนี้ทำให้องค์กรได้รับข้อมูลที่แท้จริงครบถ้วน เพื่อนำไปปิดช่องโหว่ของระบบก่อนที่จะเกิดหายนะ จุดสำคัญคือ "การเรียนรู้เพื่อป้องกัน ไม่ใช่การลงโทษ"'
        ],
        keyHighlight: 'พนักงานกล้ารายงาน = ข้อมูลโปร่งใส = องค์กรปลอดภัยและมีคุณภาพ'
      }
    ]
  },
  {
    id: 4,
    courseId: 'risk-management',
    title: 'Module 4: Daily Work Application',
    thaiTitle: 'การประยุกต์ใช้ในการทำงานประจำวัน',
    durationMinutes: 9,
    youtubeUrl: 'https://youtu.be/K6tLzsY5JvQ',
    videoTitle: 'วิดีโอบทที่ 4: การตอบสนองภาวะฉุกเฉิน, RCA 5 Whys & ระบบป้องกันการเกิดซ้ำ (CAPA)',
    videoDurationSec: 300,
    badge: 'Actionable',
    color: 'from-amber-500 to-rose-600',
    summaryPoints: [
      'QC Checkpoint ที่ชัดเจนช่วยดักจับปัญหาคุณภาพได้ตั้งแต่ต้นทาง ก่อนถึงมือลูกค้า',
      'การบำรุงรักษาเชิงป้องกันและการจัดการสารเคมีอย่างเป็นระบบ ลดความเสี่ยงทั้งด้านคุณภาพและความปลอดภัยพร้อมกัน',
      'Near Miss ที่รายงานมากขึ้น สัมพันธ์กับอุบัติการณ์จริงที่ลดลงอย่างมีนัยสำคัญ'
    ],
    quizQuestionIds: [9, 10],
    sections: [
      {
        id: 'm4-1',
        title: '4.1 การตรวจสอบคุณภาพในงานประจำวัน (In-process QC Checkpoint)',
        content: [
          'การกำหนดจุดตรวจสอบคุณภาพ (QC Checkpoint) ระหว่างกระบวนการผลิต พร้อมเกณฑ์ที่ชัดเจนว่าเมื่อใดต้องหยุดสายการผลิตเพื่อแก้ไข (Stop Line Policy)',
          'ช่วยดักจับข้อบกพร่องได้ตั้งแต่ต้นทาง ก่อนที่สินค้าจะหลุดไปถึงลูกค้า และกลายเป็นความเสียหายมูลค่ามหาศาล'
        ],
        keyHighlight: 'หยุดสายการผลิตทันทีที่พบความผิดปกติ ดีกว่าปล่อยให้ของเสียหลุดไปขั้นตอนถัดไป'
      },
      {
        id: 'm4-2',
        title: '4.2 การบำรุงรักษาเชิงป้องกัน (Preventive Maintenance - PM)',
        content: [
          'การตรวจสอบ ทดสอบ และบำรุงรักษาเครื่องจักรอย่างสม่ำเสมอตามแผนที่กำหนดไว้ล่วงหน้า',
          'ช่วยลดทั้งความเสี่ยงด้านความปลอดภัย (เครื่องจักรติดขัด ชิ้นส่วนแตกหัก) และความเสี่ยงด้านคุณภาพ (เครื่องจักรคาลิเบรตคลาดเคลื่อน ผลิตชิ้นงานผิดสเปก)'
        ],
        keyHighlight: 'PM ปกป้องทั้งความปลอดภัยของผู้ปฏิบัติงานและความแม่นยำของคุณภาพสินค้า'
      },
      {
        id: 'm4-3',
        title: '4.3 การจัดการสารเคมี & เอกสาร SDS (Safety Data Sheet)',
        content: [
          'การจัดหา จัดเก็บ ใช้งาน และกำจัดสารเคมีอย่างปลอดภัยตามมาตรฐาน พร้อมจัดทำและติดเอกสารข้อมูลความปลอดภัย (SDS 16 หัวข้อ) ให้พนักงานเข้าถึงได้ง่าย',
          'ควบคู่กับการจัดพื้นที่ทำงานให้มีระบบระบายอากาศ และอุปกรณ์ PPE ที่เหมาะสมกับสารเคมีแต่ละชนิด'
        ],
        keyHighlight: 'อ่าน SDS ก่อนใช้งานสารเคมีทุกครั้ง และตรวจเช็กอุปกรณ์ฉุกเฉิน (เช่น ที่ล้างตา)'
      },
      {
        id: 'm4-4',
        title: '4.4 Toolbox Talk การพูดคุยความปลอดภัย & คุณภาพประจำวัน',
        content: [
          'การพูดคุยสั้นๆ 3-5 นาทีก่อนเริ่มงานทุกวัน เพื่อทบทวนจุดเสี่ยงของงานในวันนั้น ข้อควรระวังด้านคุณภาพ และเปิดโอกาสให้พนักงานแจ้งข้อกังวลหรือความผิดปกติที่สังเกตเห็น',
          'หัวหน้างานควรใช้เวลานี้สร้างความตระหนักรู้และรับฟังเสียงสะท้อนจากผู้ปฏิบัติงานจริง'
        ],
        keyHighlight: 'Toolbox Talk 3 นาที ช่วยป้องกันอุบัติเหตุและของเสียได้ทั้งวัน'
      },
      {
        id: 'm4-5',
        title: '4.5 กรณีศึกษา: ผลลัพธ์จากการนำ Self-Audit & รายงาน Near Miss มาใช้ 6 เดือน',
        content: [
          'ผลการติดตามโรงงานตัวอย่างที่นำ Self-Audit Checklist มาใช้ตรวจพื้นที่ทุกสัปดาห์ และสนับสนุนให้รายงาน Near Miss ผ่านระบบกล่องรับความคิดเห็นและดิจิทัล:',
          '• จำนวนรายงาน Near Miss เพิ่มขึ้นจาก 4 รายการ ในเดือนที่ 1 สู่ 19 รายการ ในเดือนที่ 6 (พนักงานกล้าแจ้งมากขึ้น)',
          '• อุบัติเหตุจริงลดลงจาก 5 ครั้ง ในเดือนที่ 1 เหลือเพียง 1 ครั้ง ในเดือนที่ 6',
          'สะท้อนว่าองค์กรสามารถดักจับและแก้ไขจุดเสี่ยงล่วงหน้าได้สำเร็จอย่างมีประสิทธิภาพ'
        ],
        interactiveType: 'near_miss_chart',
        keyHighlight: 'กราฟแสดงชัดเจน: ยิ่งรายงาน Near Miss สูงขึ้น อุบัติเหตุจริงยิ่งลดลงสู่ศูนย์'
      }
    ]
  }
];

export const MINI_GAME_SCENARIOS: MiniGameScenario[] = [
  {
    id: 1,
    scenario: 'พบน้ำมันเครื่องจักรหยดลงบนพื้นทางเดิน ค่อยเช็ดตอนสิ้นสัปดาห์เพราะงานกำลังเร่งด่วน',
    category: 'Safety',
    isCorrectBehavior: false,
    explanation: 'ผิด! ต้องกั้นพื้นที่ แจ้งหัวหน้างาน และทำความสะอาดคราบน้ำมันทันทีเพื่อป้องกันอุบัติเหตุลื่นล้ม'
  },
  {
    id: 2,
    scenario: 'เมื่อพบว่าชิ้นงานผลิตผิดสเปก 1 ชิ้น ควรหยุดตรวจสอบเครื่องจักรทันทีเพื่อป้องกันของเสียจำนวนมาก',
    category: 'Quality',
    isCorrectBehavior: true,
    explanation: 'ถูกต้อง! การหยุดแก้ไขตั้งแต่จุดกำเนิด (Stop Line) ช่วยดักจับของเสียไม่ให้หลุดไปยังขั้นตอนถัดไป'
  },
  {
    id: 3,
    scenario: 'การสวมใส่อุปกรณ์ PPE (เช่น หมวกนิรภัย/ถุงมือ) คือมาตรการแรกสุดและมีประสิทธิภาพสูงสุดในการกำจัดอันตราย',
    category: 'Process',
    isCorrectBehavior: false,
    explanation: 'ผิด! PPE เป็นด่านสุดท้าย (ลำดับที่ 5) มาตรการสูงสุดคือการขจัดอันตรายที่ต้นเหตุ (Elimination)'
  },
  {
    id: 4,
    scenario: 'เกิดเหตุการณ์เกือบโดนชิ้นงานตกใส่ (Near Miss) แต่ไม่มีใครบาดเจ็บ จึงไม่ต้องรายงานให้เสียเวลา',
    category: 'Culture',
    isCorrectBehavior: false,
    explanation: 'ผิด! Near Miss ต้องรายงานทุกครั้ง เพราะเป็นสัญญาณเตือนล่วงหน้าที่ช่วยป้องกันอุบัติเหตุร้ายแรง'
  },
  {
    id: 5,
    scenario: 'ก่อนเริ่มงานทุกวัน หัวหน้างานและทีมร่วมทำ Toolbox Talk 3 นาที เพื่อทบทวนจุดเสี่ยงและคุณภาพของวันนั้น',
    category: 'Safety',
    isCorrectBehavior: true,
    explanation: 'ถูกต้อง! Toolbox Talk สั้นๆ ช่วยกระตุ้นความตระหนักรู้และป้องกันความผิดพลาดตลอดกะทำงาน'
  },
  {
    id: 6,
    scenario: 'การวิเคราะห์สาเหตุที่แท้จริง (RCA) ควรมุ่งเน้นการหาตัวคนทำผิดเพื่อลงโทษตัดเงินเดือน',
    category: 'Culture',
    isCorrectBehavior: false,
    explanation: 'ผิด! RCA มุ่งหาสาเหตุเชิงระบบและกระบวนการทำงาน เพื่อวางระบบป้องกันไม่ให้เกิดขึ้นซ้ำ'
  },
  {
    id: 7,
    scenario: 'อ่านและปฏิบัติตามเอกสาร SDS (Safety Data Sheet) ก่อนสัมผัสหรือเคลื่อนย้ายสารเคมีอันตรายทุกครั้ง',
    category: 'Safety',
    isCorrectBehavior: true,
    explanation: 'ถูกต้อง! SDS ให้ข้อมูลสำคัญเรื่องอันตราย การปฐมพยาบาล และ PPE ที่จำเป็นอย่างครบถ้วน'
  },
  {
    id: 8,
    scenario: 'Risk Score ในตาราง Risk Matrix คำนวณจาก โอกาสเกิด (Likelihood) x ความรุนแรง (Severity)',
    category: 'Process',
    isCorrectBehavior: true,
    explanation: 'ถูกต้อง! Risk Score = Likelihood x Severity ใช้จัดลำดับความสำคัญของความเสี่ยงอย่างเป็นรูปธรรม'
  },
  {
    id: 9,
    scenario: 'เพื่อลดต้นทุน ควรเลื่อนการบำรุงรักษาเชิงป้องกัน (PM) ออกไปจนกว่าเครื่องจักรจะเสียจึงค่อยซ่อม',
    category: 'Quality',
    isCorrectBehavior: false,
    explanation: 'ผิด! การรอซ่อมหลังเครื่องพัง (Reactive) มีต้นทุนความเสียหายแฝงสูงกว่าการบำรุงรักษาเชิงป้องกัน (PM) หลายเท่า'
  },
  {
    id: 10,
    scenario: 'วัฒนธรรม Just Culture ส่งเสริมให้พนักงานกล้ารายงานข้อผิดพลาดโดยไม่กลัวถูกลงโทษที่ไม่เป็นธรรม',
    category: 'Culture',
    isCorrectBehavior: true,
    explanation: 'ถูกต้อง! Just Culture ทำให้ได้ข้อมูลครบถ้วนเพื่อพัฒนาความปลอดภัยของระบบอย่างแท้จริง'
  }
];

export interface DepartmentItem {
  code: string;
  nameEn: string;
  nameTh: string;
  title: string;
  desc: string;
}

export const DEPARTMENTS: DepartmentItem[] = [
  { code: 'P', nameEn: 'Production', nameTh: 'ฝ่ายผลิต', title: 'P - Production', desc: 'Production (ฝ่ายผลิต)' },
  { code: 'PP', nameEn: 'Production Plan', nameTh: 'วางแผนการผลิต', title: 'PP - Production Plan', desc: 'Production Plan (วางแผนการผลิต)' },
  { code: 'PS', nameEn: 'Personnel', nameTh: 'ฝ่ายบุคคลและธุรการ', title: 'PS - Personnel', desc: 'Personnel (ฝ่ายบุคคลและธุรการ)' },
  { code: 'ESH', nameEn: 'Environmental Safety and Health', nameTh: 'สิ่งแวดล้อม ความปลอดภัย และอาชีวอนามัย', title: 'ESH - Environmental Safety and Health', desc: 'Environmental Safety and Health (ความปลอดภัย สิ่งแวดล้อม และอาชีวอนามัย)' },
  { code: 'ST', nameEn: 'Setter', nameTh: 'เซ็ตเตอร์', title: 'ST - Setter', desc: 'Setter (เครื่องเซ็ตเตอร์เส้นคอร์ด)' },
  { code: 'SEC', nameEn: 'Single End Cord', nameTh: 'เส้นคอร์ดเดี่ยว', title: 'SEC - Single End Cord', desc: 'Single End Cord (ฝ่ายเส้นคอร์ดเดี่ยว)' },
  { code: 'MN', nameEn: 'Maintenance', nameTh: 'ซ่อมบำรุง', title: 'MN - Maintenance', desc: 'Maintenance (ซ่อมบำรุงวิศวกรรม)' },
  { code: 'TC', nameEn: 'Technical', nameTh: 'ฝ่ายเทคนิค', title: 'TC - Technical', desc: 'Technical (ฝ่ายเทคนิค)' },
  { code: 'TR', nameEn: 'Test Room', nameTh: 'ห้องทดสอบ', title: 'TR - Test Room', desc: 'Test Room (ห้องทดสอบ / วิเคราะห์เส้นคอร์ด)' },
  { code: 'QA', nameEn: 'Quality Assurance', nameTh: 'ประกันคุณภาพ', title: 'QA - Quality Assurance', desc: 'Quality Assurance (ประกันคุณภาพ)' },
  { code: 'FI', nameEn: 'Final Inspection', nameTh: 'ตรวจสอบขั้นสุดท้าย', title: 'FI - Final Inspection', desc: 'Final Inspection (ตรวจสอบคุณภาพขั้นสุดท้าย)' },
  { code: 'TW', nameEn: 'Twisting', nameTh: 'ตีเกลียว', title: 'TW - Twisting', desc: 'Twisting (ฝ่ายตีเกลียวเส้นคอร์ด)' },
  { code: 'RW', nameEn: 'Rewind', nameTh: 'กรอเส้นด้าย', title: 'RW - Rewind', desc: 'Rewind (ฝ่ายกรอเส้นด้าย / รีไวนด์)' }
];

export const DEPARTMENT_CODES = ['P', 'PP', 'PS', 'ESH', 'ST', 'SEC', 'MN', 'TC', 'TR', 'QA', 'FI', 'TW', 'RW'];

export const DEPARTMENT_LOOKUP: Record<string, { nameEn: string; nameTh: string; label: string }> = {
  P: { nameEn: 'Production', nameTh: 'ฝ่ายผลิต', label: 'P - Production (ฝ่ายผลิต)' },
  PP: { nameEn: 'Production Plan', nameTh: 'วางแผนการผลิต', label: 'PP - Production Plan (วางแผนการผลิต)' },
  PS: { nameEn: 'Personnel', nameTh: 'ฝ่ายบุคคลและธุรการ', label: 'PS - Personnel (ฝ่ายบุคคลและธุรการ)' },
  ESH: { nameEn: 'Environmental Safety and Health', nameTh: 'สิ่งแวดล้อม ความปลอดภัย และอาชีวอนามัย', label: 'ESH - Environmental Safety and Health (สิ่งแวดล้อม ความปลอดภัย และอาชีวอนามัย)' },
  ST: { nameEn: 'Setter', nameTh: 'เซ็ตเตอร์', label: 'ST - Setter (เซ็ตเตอร์)' },
  SEC: { nameEn: 'Single End Cord', nameTh: 'เส้นคอร์ดเดี่ยว', label: 'SEC - Single End Cord (เส้นคอร์ดเดี่ยว)' },
  MN: { nameEn: 'Maintenance', nameTh: 'ซ่อมบำรุง', label: 'MN - Maintenance (ซ่อมบำรุง)' },
  TC: { nameEn: 'Technical', nameTh: 'ฝ่ายเทคนิค', label: 'TC - Technical (ฝ่ายเทคนิค)' },
  TR: { nameEn: 'Test Room', nameTh: 'ห้องทดสอบ', label: 'TR - Test Room (ห้องทดสอบ)' },
  QA: { nameEn: 'Quality Assurance', nameTh: 'ประกันคุณภาพ', label: 'QA - Quality Assurance (ประกันคุณภาพ)' },
  FI: { nameEn: 'Final Inspection', nameTh: 'ตรวจสอบขั้นสุดท้าย', label: 'FI - Final Inspection (ตรวจสอบขั้นสุดท้าย)' },
  TW: { nameEn: 'Twisting', nameTh: 'ตีเกลียว', label: 'TW - Twisting (ตีเกลียว)' },
  RW: { nameEn: 'Rewind', nameTh: 'กรอเส้นด้าย', label: 'RW - Rewind (กรอเส้นด้าย / รีไวนด์)' }
};

export function formatDepartment(code: string | undefined): string {
  if (!code) return '-';
  const clean = code.trim().toUpperCase();
  const found = DEPARTMENT_LOOKUP[clean];
  if (found) {
    return `${clean} - ${found.nameEn}`;
  }
  return clean;
}

export function formatDepartmentFull(code: string | undefined): string {
  if (!code) return '-';
  const clean = code.trim().toUpperCase();
  const found = DEPARTMENT_LOOKUP[clean];
  if (found) {
    return found.label;
  }
  return clean;
}

export const allCourses = [
  {
    id: 'advanced-preventive-maintenance',
    title: 'การยกระดับการบำรุงรักษาเชิงป้องกัน (CBM, PdM, RCM)',
    category: 'วิศวกรรมและการซ่อมบำรุงขั้นสูง',
    duration: '30 นาที',
    level: 'ระดับช่างเทคนิคและวิศวกร',
    description: 'เรียนรู้การเปลี่ยนผ่านจาก Time-based PM สู่ CBM ตรวจวัดสภาพจริง, วิเคราะห์เส้นโค้ง P-F Curve, และจัดลำดับความสำคัญเครื่องจักรด้วย RCM & FMEA Matrix'
  },
  {
    id: 'risk-management',
    title: 'การบริหารความเสี่ยงด้วยคุณภาพและความปลอดภัย',
    category: 'ระบบคุณภาพและความปลอดภัย',
    duration: '35 นาที',
    level: 'ระดับพนักงานทั่วไปและหัวหน้างาน',
    description: 'หลักการระบุ ชี้บ่ง และประเมินความเสี่ยงด้วย 5x5 Matrix, Hierarchy of Controls, 4-Step KYT, LOTO และการวิเคราะห์รากเหง้า 5 Whys'
  }
];

export const GLOSSARY_TERMS = [
  { term: 'Risk', th: 'ความเสี่ยง', def: 'โอกาสที่จะเกิดเหตุการณ์ไม่พึงประสงค์ซึ่งกระทบต่อเป้าหมายองค์กร' },
  { term: 'Hazard', th: 'อันตราย', def: 'สิ่งที่มีศักยภาพก่อให้เกิดความเสียหาย เช่น เครื่องจักร สารเคมี' },
  { term: 'Likelihood', th: 'โอกาสเกิด', def: 'ความน่าจะเป็นที่ความเสี่ยงนั้นจะเกิดขึ้นจริง (คะแนน 1-5)' },
  { term: 'Severity', th: 'ความรุนแรง', def: 'ระดับผลกระทบหากความเสี่ยงนั้นเกิดขึ้นจริง (คะแนน 1-5)' },
  { term: 'Risk Matrix', th: 'ตารางประเมินความเสี่ยง', def: 'เครื่องมือจัดลำดับความสำคัญความเสี่ยงจาก Likelihood x Severity' },
  { term: 'Risk Register', th: 'ทะเบียนความเสี่ยง', def: 'บันทึกความเสี่ยง การประเมิน และมาตรการจัดการอย่างเป็นระบบพร้อมผู้รับผิดชอบ' },
  { term: 'Hierarchy of Controls', th: 'ลำดับมาตรการควบคุมความเสี่ยง', def: 'Elimination > Substitution > Engineering > Administrative > PPE' },
  { term: 'Near Miss', th: 'เหตุการณ์เกือบเกิดอุบัติเหตุ', def: 'เหตุการณ์ที่เกือบก่อความเสียหายแต่ยังไม่เกิดความสูญเสียจริง' },
  { term: 'RCA (Root Cause Analysis)', th: 'การวิเคราะห์หาสาเหตุที่แท้จริง', def: 'กระบวนการค้นหาสาเหตุต้นตอของปัญหาเชิงระบบ เช่น เทคนิค 5 Whys' },
  { term: 'Just Culture', th: 'วัฒนธรรมความปลอดภัยแบบไม่กล่าวโทษ', def: 'ส่งเสริมการรายงานปัญหาโดยไม่กลัวถูกลงโทษอย่างไม่เป็นธรรม' },
  { term: 'Toolbox Talk', th: 'การพูดคุยความปลอดภัยประจำวัน', def: 'การพูดคุยสั้นๆ 3-5 นาทีก่อนเริ่มงานเพื่อทบทวนความเสี่ยงและมาตรการ' },
  { term: 'SDS (Safety Data Sheet)', th: 'เอกสารข้อมูลความปลอดภัย', def: 'เอกสารข้อมูลความปลอดภัยของสารเคมีแต่ละชนิด 16 หัวข้อ' },
  { term: 'Incident Rate', th: 'อัตราการเกิดอุบัติเหตุ', def: 'จำนวนอุบัติเหตุเทียบกับจำนวนพนักงาน ใช้วัดความปลอดภัยโดยรวม' },
  { term: 'ROI (Return on Investment)', th: 'ผลตอบแทนจากการลงทุน', def: 'การเปรียบเทียบต้นทุนที่ลงทุนกับผลประโยชน์/ความเสียหายที่ประหยัดได้' }
];
