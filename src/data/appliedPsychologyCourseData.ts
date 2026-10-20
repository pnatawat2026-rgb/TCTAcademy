import { CourseModule, MiniGameScenario, Question, TraineeRecord } from '../types';

export const APPLIED_PSYCHOLOGY_QUESTIONS: Question[] = [
  {
    id: 1,
    moduleId: 1,
    questionText: 'ตามหลักจิตวิทยาเพื่อความสำเร็จ โมเดล "Growth Mindset (กรอบความคิดแบบเติบโต)" ของ Dr. Carol Dweck มีหลักการพื้นฐานที่ถูกต้องที่สุดอย่างไรในการทำงาน?',
    choices: [
      { id: 'a', text: 'ความฉลาดและความสามารถของคนเราเป็นสิ่งติดตัวมาแต่กำเนิด ไม่สามารถเปลี่ยนแปลงหรือพัฒนาเพิ่มได้', isCorrect: false },
      { id: 'b', text: 'ทักษะ สติปัญญา และความสามารถในการทำงานสามารถพัฒนาให้เชี่ยวชาญขึ้นได้เสมอผ่านการเรียนรู้ ความพยายาม และการฝึกฝนอย่างถูกวิธี', isCorrect: true },
      { id: 'c', text: 'การยอมรับความผิดพลาดถือเป็นสัญลักษณ์ของความล้มเหลวที่แก้ไขไม่ได้', isCorrect: false },
      { id: 'd', text: 'คนเก่งคือคนที่ไม่ต้องใช้ความพยายาม หากต้องพยายามแปลว่าตนเองไม่มีพรสวรรค์', isCorrect: false }
    ],
    explanation: 'Growth Mindset คือความเชื่อมั่นว่าทักษะและศักยภาพของมนุษย์สามารถพัฒนาและขยายตัวได้ตลอดเวลาผ่านการฝึกฝน การเรียนรู้จากข้อผิดพลาด และการเปิดรับฟีดแบ็ก ซึ่งเป็นรากฐานของความสำเร็จในการทำงานและการพัฒนาสายอาชีพ'
  },
  {
    id: 2,
    moduleId: 1,
    questionText: 'ในสถานการณ์ที่สายการผลิตพบปัญหาของเสีย (Defect) หรือเครื่องจักรหยุดชะงัก พนักงานที่มีกรอบความคิด Growth Mindset ควรมีพฤติกรรมตอบสนองอย่างไร?',
    choices: [
      { id: 'a', text: 'รีบหาคนผิดมาลงโทษและปฏิเสธความรับผิดชอบของตนเอง', isCorrect: false },
      { id: 'b', text: 'ท้อถอยและเชื่อว่าปัญหานี้ไม่มีทางแก้ไขได้เพราะตนเองไม่มีความสามารถพอ', isCorrect: false },
      { id: 'c', text: 'มองปัญหาเป็นโอกาสในการเรียนรู้ ร่วมมือวิเคราะห์รากเหง้าสาเหตุ (RCA) และคิดค้นแนวทางป้องกันร่วมกับทีมอย่างสร้างสรรค์', isCorrect: true },
      { id: 'd', text: 'แอบปกปิดข้อมูลไม่ให้หัวหน้าทราบเพื่อรักษาหน้าตาตนเอง', isCorrect: false }
    ],
    explanation: 'ผู้มี Growth Mindset จะมองอุปสรรคและข้อผิดพลาดเป็น "ข้อมูลป้อนกลับ (Feedback)" เพื่อการพัฒนา ไม่ใช่มองเป็นสิ่งบั่นทอนคุณค่าในตนเอง ทำให้มุ่งเน้นการแก้ปัญหาที่ต้นตอและสร้างนวัตกรรมในการทำงาน'
  },
  {
    id: 3,
    moduleId: 1,
    questionText: 'ตามทฤษฎีจิตวิทยาความสำเร็จของ Dr. Angela Duckworth องค์ประกอบหลักของ "ความเพียรพยายาม (Grit)" ที่ส่งผลต่อความสำเร็จในระยะยาวประกอบด้วย 2 ปัจจัยใด?',
    choices: [
      { id: 'a', text: 'โชคชะตา และ ฐานะทางครอบครัว', isCorrect: false },
      { id: 'b', text: 'ความหลงใหลในเป้าหมาย (Passion) และ ความทรหดอดทนไม่ยอมแพ้ (Perseverance)', isCorrect: true },
      { id: 'c', text: 'ความสามารถในการทำงานรวดเร็วเพียงอย่างเดียว โดยไม่คำนึงถึงคุณภาพ', isCorrect: false },
      { id: 'd', text: 'การยอมทำตามคำสั่งโดยไม่ใช้ความคิดริเริ่ม', isCorrect: false }
    ],
    explanation: 'Grit (ความทรหด) คือพลังขับเคลื่อนที่แท้จริงสู่ความสำเร็จ เกิดจากการผสมผสานระหว่าง Passion (ความรักและความมุ่งมั่นในเป้าหมาย) และ Perseverance (ความพากเพียรต่อเนื่อง อดทนต่ออุปสรรคและความยากลำบาก)'
  },
  {
    id: 4,
    moduleId: 2,
    questionText: '"ความยืดหยุ่นทางอารมณ์ (Emotional Agility)" ในสถานที่ทำงาน หมายถึงความสามารถในข้อใด?',
    choices: [
      { id: 'a', text: 'การกดข่มอารมณ์โกรธไว้ข้างในแล้วทำเป็นยิ้มแย้มตลอดเวลา', isCorrect: false },
      { id: 'b', text: 'การปล่อยให้อารมณ์ครอบงำและแสดงความเกรี้ยวกราดใส่เพื่อนร่วมงานทันที', isCorrect: false },
      { id: 'c', text: 'การตระหนักรู้เท่าทันอารมณ์ ความคิด และความรู้สึกของตนเองอย่างมีสติ และสามารถเลือกแสดงออกด้วยพฤติกรรมที่สอดคล้องกับคุณค่าและเป้าหมายของงาน', isCorrect: true },
      { id: 'd', text: 'การไม่สนใจความรู้สึกของผู้อื่นและทำงานเฉพาะหน้าที่ของตนเอง', isCorrect: false }
    ],
    explanation: 'Emotional Agility คือความสามารถในการรู้เท่าทันอารมณ์ของตนเอง ไม่ติดกับดักอารมณ์ลบ และสามารถกำกับพฤติกรรมให้มีเหตุผล สร้างสรรค์ และเกิดประโยชน์สูงสุดต่อความสัมพันธ์และงาน'
  },
  {
    id: 5,
    moduleId: 2,
    questionText: 'เมื่อเกิดความเครียดหรืออารมณ์โกรธกะทันหันในการทำงาน เทคนิคการหยุดพักจิตใจ "S-T-O-P" มีลำดับขั้นตอนที่ถูกต้องอย่างไร?',
    choices: [
      { id: 'a', text: 'S: สั่งการ -> T: ตำหนิ -> O: ออกคำสั่ง -> P: ผลักดัน', isCorrect: false },
      { id: 'b', text: 'S: Stop (หยุดชะงัก) -> T: Take a breath (หายใจลึกๆ) -> O: Observe (สังเกตอารมณ์และร่างกาย) -> P: Proceed (ก้าวต่อไปด้วยสติและปัญญา)', isCorrect: true },
      { id: 'c', text: 'S: Shout (ตะโกน) -> T: Talk (พูดแทรก) -> O: Oppose (คัดค้าน) -> P: Postpone (เลื่อนงาน)', isCorrect: false },
      { id: 'd', text: 'S: Silence (เงียบ) -> T: Threaten (ข่มขู่) -> O: Overrule (ยกเลิก) -> P: Punish (ลงโทษ)', isCorrect: false }
    ],
    explanation: 'เทคนิค S-T-O-P เป็นเครื่องมือทางสติ (Mindfulness) ที่ทรงพลัง: Stop (หยุดก่อนตอบโต้), Take a breath (สูดลมหายใจลึกผ่อนคลายระบบประสาท), Observe (รู้ตัวว่ากำลังคิดหรือรู้สึกอะไร), และ Proceed (เลือกตัดสินใจและลงมือทำอย่างมีสติ)'
  },
  {
    id: 6,
    moduleId: 2,
    questionText: '"พลังการฟื้นคืน (Resilience)" มีบทบาทสำคัญอย่างยิ่งต่อพนักงานในโรงงานอุตสาหกรรมในแง่มุมใด?',
    choices: [
      { id: 'a', text: 'ช่วยให้ทำงานติดต่อกันได้ 24 ชั่วโมงโดยไม่เหน็ดเหนื่อย', isCorrect: false },
      { id: 'b', text: 'ช่วยให้สามารถลุกขึ้นใหม่ได้อย่างรวดเร็วหลังเผชิญความผิดพลาดหรือการเปลี่ยนแปลง โดยไม่สูญเสียความเชื่อมั่นและกำลังใจ', isCorrect: true },
      { id: 'c', text: 'ช่วยให้สามารถเอาชนะเพื่อนร่วมงานในการประเมินผลประจำปี', isCorrect: false },
      { id: 'd', text: 'ช่วยให้หลีกเลี่ยงงานที่ยากและซับซ้อนได้สำเร็จ', isCorrect: false }
    ],
    explanation: 'Resilience (ความยืดหยุ่นฟื้นตัวเร็ว) เปรียบเหมือนลูกเทนนิสที่ตกลงพื้นแล้วกระเด้งกลับขึ้นมา ช่วยให้พนักงานรับมือกับความกดดัน ความเปลี่ยนแปลง และฟื้นสภาพจิตใจจากวิกฤตได้อย่างเข้มแข็ง'
  },
  {
    id: 7,
    moduleId: 2,
    questionText: 'การสร้าง "ความปลอดภัยทางจิตวิทยา (Psychological Safety)" ในทีมงาน ช่วยลดอุบัติเหตุและข้อผิดพลาดในโรงงานได้อย่างไร?',
    choices: [
      { id: 'a', text: 'ทำให้พนักงานกล้าแจ้งเตือนจุดเสี่ยง กล้าถามข้อสงสัย และกล้ารายงาน Near Miss ทันทีโดยไม่ต้องกลัวการถูกตำหนิหรือลงโทษ', isCorrect: true },
      { id: 'b', text: 'ทำให้พนักงานทำงานสบายขึ้นโดยไม่ต้องปฏิบัติตามมาตรฐาน SOP', isCorrect: false },
      { id: 'c', text: 'ทำให้หัวหน้างานไม่ต้องตรวจสอบผลงานของลูกน้อง', isCorrect: false },
      { id: 'd', text: 'ทำให้ทุกคนในทีมต้องคิดเห็นเหมือนกันทุกเรื่องห้ามโต้แย้ง', isCorrect: false }
    ],
    explanation: 'Psychological Safety ทำให้พนักงานรู้สึกปลอดภัยที่จะพูดความจริง ยกมือทักท้วงเมื่อเห็นสิ่งผิดปกติ และแจ้งอุบัติการณ์เกือบเกิด (Near Miss) ได้ทันท่วงที จึงเป็นหัวใจสำคัญของการป้องกันอุบัติเหตุ Zero Accident'
  },
  {
    id: 8,
    moduleId: 3,
    questionText: 'ตามโมเดล PERMA ของจิตวิทยาเชิงบวก (Positive Psychology) ข้อใดคือองค์ประกอบของ "ความสุขที่แท้จริงในที่ทำงาน"?',
    choices: [
      { id: 'a', text: 'เงินเดือนสูงที่สุดอย่างเดียว โดยไม่ต้องสนใจสุขภาพหรือความสัมพันธ์กับใคร', isCorrect: false },
      { id: 'b', text: 'P (อารมณ์บวก), E (ความผูกพันจดจ่อในงาน), R (สัมพันธภาพที่ดี), M (ความหมายในงาน), A (ความสำเร็จลุล่วง)', isCorrect: true },
      { id: 'c', text: 'การมีตำแหน่งสูงและมีอำนาจสั่งการผู้อื่นได้ตามใจชอบ', isCorrect: false },
      { id: 'd', text: 'การทำงานให้น้อยที่สุดในแต่ละวันเพื่อรอเวลากลับบ้าน', isCorrect: false }
    ],
    explanation: 'โมเดล PERMA ของ Dr. Martin Seligman ชี้ว่าความสุขและสุขภาวะที่ยั่งยืน (Well-being) ประกอบด้วย: Positive Emotion (อารมณ์บวก), Engagement (ความจดจ่อมีสมาธิ), Relationships (มิตรภาพและความไว้วางใจ), Meaning (การเห็นคุณค่าในงาน), และ Accomplishment (ความภาคภูมิใจในผลสำเร็จ)'
  },
  {
    id: 9,
    moduleId: 3,
    questionText: 'ปัจจัยสำคัญที่สุดในการสร้าง "ความมั่นคงในอาชีพ (Job Security)" และการเติบโตก้าวหน้าอย่างยั่งยืนร่วมกับบริษัท TCT คือข้อใด?',
    choices: [
      { id: 'a', text: 'การพึ่งพาคนอื่นและไม่ยอมเรียนรู้ทักษะใหม่', isCorrect: false },
      { id: 'b', text: 'การทำงานไปวันๆ โดยไม่สนใจคุณภาพและมาตรฐานความปลอดภัย', isCorrect: false },
      { id: 'c', text: 'การยกระดับทักษะตนเองอย่างต่อเนื่อง (Upskilling/Reskilling), มีวินัยความปลอดภัย และส่งมอบคุณค่าที่เป็นเลิศให้กับทีมและองค์กร', isCorrect: true },
      { id: 'd', text: 'การเปลี่ยนงานบ่อยๆ ทุกๆ 3 เดือน', isCorrect: false }
    ],
    explanation: 'ความมั่นคงในอาชีพที่แท้จริงเกิดจาก "ความสามารถในการสร้างคุณค่า (Employability & Value Creation)" เมื่อพนักงานมี Growth Mindset หมั่นฝึกฝนทักษะ รักษามาตรฐานคุณภาพและความปลอดภัย ย่อมเป็นทรัพยากรบุคคลที่มีคุณค่าสูงสุดของ TCT'
  },
  {
    id: 10,
    moduleId: 3,
    questionText: 'การสร้างวัฒนธรรมการทำงานที่มี "ความสุข ความสำเร็จ และความมั่นคงร่วมกัน" ในครอบครัว TCT Academy ควรเริ่มต้นจากจุดใด?',
    choices: [
      { id: 'a', text: 'รอให้ผู้บริหารระดับสูงมาสั่งการเปลี่ยนแปลงเพียงอย่างเดียว', isCorrect: false },
      { id: 'b', text: 'เริ่มต้นที่ตัวเราเอง: ส่งต่อรอยยิ้ม คำขอบคุณ การรับฟังด้วยใจจริง และความร่วมมือเกื้อกูลกันในทุกวันทำงาน', isCorrect: true },
      { id: 'c', text: 'การเปรียบเทียบข้อด้อยของแผนกอื่นกับแผนกตนเอง', isCorrect: false },
      { id: 'd', text: 'การนิ่งเฉยเมื่อเพื่อนร่วมงานต้องการความช่วยเหลือ', isCorrect: false }
    ],
    explanation: 'วัฒนธรรมองค์กรที่อบอุ่นและแข็งแกร่งเริ่มต้นจากพฤติกรรมเล็กๆ ของพนักงานทุกคนในทุกๆ วัน การชื่นชม การช่วยเหลือเกื้อกูล และการเคารพซึ่งกันและกันจะสร้างสภาพแวดล้อมที่เต็มไปด้วยความสุข ความผูกพัน และความสำเร็จร่วมกันอย่างยั่งยืน'
  }
];

export const COURSE_MODULES_APPLIED_PSYCHOLOGY: CourseModule[] = [
  {
    id: 1,
    courseId: 'applied-psychology',
    title: 'Module 1: จิตวิทยาเพื่อความสำเร็จและ Growth Mindset ในการทำงาน',
    thaiTitle: 'จิตวิทยาเพื่อความสำเร็จ • ปรับเปลี่ยนกรอบคิดสู่ Growth Mindset และเป้าหมายความเป็นเลิศ',
    durationMinutes: 20,
    youtubeUrl: 'https://notebooklm.link.google/Qi5XeX4RLPge',
    videoTitle: 'วิดีโอบทที่ 1: จิตวิทยาเพื่อความสำเร็จและ Growth Mindset ในการทำงาน (NotebookLM Deep Dive)',
    videoDurationSec: 360,
    badge: 'Growth Mindset',
    color: 'from-teal-600 to-emerald-700',
    summaryPoints: [
      'เข้าใจแก่นแท้ของจิตวิทยาความสำเร็จ และความแตกต่างระหว่าง Fixed Mindset กับ Growth Mindset',
      'เรียนรู้การเปลี่ยนมุมมองต่อความผิดพลาด ให้กลายเป็นโอกาสเรียนรู้และการพัฒนาอย่างก้าวกระโดด',
      'เทคนิคการตั้งเป้าหมายที่มีพลังและการเสริมสร้างความเพียรพยายาม (Grit) สู่ผลงานที่เป็นเลิศ'
    ],
    quizQuestionIds: [1, 2, 3],
    sections: [
      {
        id: 'apw-1-1',
        title: '1.1 จิตวิทยาแห่งความสำเร็จและกรอบคิดแบบเติบโต (Growth Mindset)',
        content: [
          'ในโลกการทำงานยุคใหม่ที่เต็มไปด้วยการเปลี่ยนแปลงทางเทคโนโลยีและการแข่งขันสูง ทัศนคติและกรอบความคิด (Mindset) คือตัวกำหนดชะตาชีวิตและความสำเร็จของบุคคล',
          'งานวิจัยของ Dr. Carol Dweck จากมหาวิทยาลัยสแตนฟอร์ด ค้นพบว่ามนุษย์เรามีกรอบคิด 2 แบบ:',
          '1. Fixed Mindset (กรอบคิดแบบตายตัว): เชื่อว่าพรสวรรค์และความฉลาดเป็นสิ่งที่มีขีดจำกัด กลัวความล้มเหลว หลีกเลี่ยงความท้าทาย และมักมองคำวิจารณ์เป็นการโจมตีตนเอง',
          '2. Growth Mindset (กรอบคิดแบบเติบโต): เชื่อว่าศักยภาพของมนุษย์สามารถพัฒนาได้อย่างไร้ขีดจำกัดผ่านความพยายามและการเรียนรู้ มองความล้มเหลวเป็นบทเรียน และพร้อมรับความท้าทายเพื่อยกระดับตนเอง'
        ],
        bulletPoints: [
          'อย่าพูดว่า "ฉันทำไม่ได้" แต่ให้เปลี่ยนเป็น "ฉันยังทำไม่ได้ในตอนนี้ แต่ถ้าฝึกฝนฉันจะทำได้"',
          'มองข้อผิดพลาดในการทำงานเป็น "สัญญาณบอกทาง" ไม่ใช่ "ตราบาป"',
          'ความพยายามไม่ได้เป็นเครื่องบ่งชี้ว่าเราไม่เก่ง แต่เป็นเส้นทางเดียวที่จะทำให้เราเก่งขึ้น'
        ],
        keyHighlight: 'ความสำเร็จไม่ได้ขึ้นอยู่กับจุดเริ่มต้น แต่ขึ้นอยู่กับความพร้อมที่จะเรียนรู้และพัฒนาอย่างต่อเนื่อง'
      },
      {
        id: 'apw-1-2',
        title: '1.2 พลังแห่งความเพียร (Grit) และการตั้งเป้าหมายสู่ความเป็นเลิศ',
        content: [
          'ความสำเร็จในโรงงาน TCT ไม่ได้เกิดขึ้นเพียงชั่วข้ามคืน แต่เกิดจากความทุ่มเทอย่างต่อเนื่องในทุกๆ กะการทำงาน',
          'Grit คือการผสานรวมระหว่างความหลงใหลในเป้าหมาย (Passion) และความไม่ยอมแพ้ต่ออุปสรรค (Perseverance) เมื่อเรามี Grit เราจะสามารถรักษามาตรฐานการผลิตที่มีคุณภาพสูงและก้าวข้ามทุกวิกฤตได้อย่างสง่างาม'
        ],
        bulletPoints: [
          'ตั้งเป้าหมายย่อยประจำวัน (Daily Micro-Goals) ที่ชัดเจนและวัดผลได้',
          'สร้างแรงบันดาลใจจากความภาคภูมิใจในชิ้นงานที่ส่งมอบให้ลูกค้า',
          'เฉลิมฉลองความก้าวหน้าเล็กๆ น้อยๆ เพื่อเติมไฟในการทำงานอย่างสม่ำเสมอ'
        ],
        keyHighlight: 'คนเก่งอาจไปได้เร็ว แต่คนที่ไม่ยอมแพ้จะไปได้ไกลและประสบความสำเร็จอย่างยั่งยืน'
      }
    ]
  },
  {
    id: 2,
    courseId: 'applied-psychology',
    title: 'Module 2: การบริหารอารมณ์ ความเครียด และการสร้างพลังฟื้นคืน (Resilience)',
    thaiTitle: 'การบริหารอารมณ์และความเครียด • ความยืดหยุ่นทางจิตวิทยาและการฟื้นตัวอย่างรวดเร็ว (Resilience)',
    durationMinutes: 20,
    youtubeUrl: 'https://notebooklm.link.google/JLnqF426neNW',
    videoTitle: 'วิดีโอบทที่ 2: การบริหารอารมณ์ ความเครียด และการสร้างพลังฟื้นคืน (NotebookLM Deep Dive)',
    videoDurationSec: 360,
    badge: 'Resilience & EQ',
    color: 'from-emerald-600 to-cyan-700',
    summaryPoints: [
      'เข้าใจกลไกของความเครียดหน้างาน และผลกระทบต่อสมาธิ ความปลอดภัย และการตัดสินใจ',
      'ฝึกฝนทักษะการรู้เท่าทันอารมณ์และการดึงสติด้วยเทคนิค S-T-O-P อย่างมีประสิทธิภาพ',
      'สร้างพลังฟื้นคืน (Resilience) และสร้างบรรยากาศแห่งความปลอดภัยทางใจ (Psychological Safety) ในทีม'
    ],
    quizQuestionIds: [4, 5, 6, 7],
    sections: [
      {
        id: 'apw-2-1',
        title: '2.1 การรู้เท่าทันอารมณ์และการจัดการความเครียดหน้างาน',
        content: [
          'ในกระบวนการผลิตที่มีความเร่งด่วนและต้องควบคุมคุณภาพอย่างเข้มงวด ความเครียดและความเหนื่อยล้าอาจส่งผลให้เกิดอารมณ์ฉุนเฉียวหรือขาดสมาธิ ซึ่งเป็นสาเหตุสำคัญของ Human Error และอุบัติเหตุ',
          'การบริหารอารมณ์ (Emotional Agility) ไม่ใช่การเก็บกดอารมณ์ แต่คือการรู้ตัวว่ากำลังเกิดอารมณ์อะไร และสามารถเลือกวิธีตอบสนองที่มีสติและเป็นมืออาชีพ'
        ],
        bulletPoints: [
          'ใช้เทคนิค S-T-O-P: Stop (หยุด) > Take a breath (หายใจลึก) > Observe (สังเกตอารมณ์) > Proceed (เดินหน้าต่อด้วยสติ)',
          'แยกแยะระหว่าง "สิ่งที่เราควบคุมได้" (การกระทำ, คำพูด, ความคิดของเรา) กับ "สิ่งที่เราควบคุมไม่ได้" (พฤติกรรมคนอื่น, สภาพอากาศ)',
          'จัดสรรเวลาพักผ่อนและดูแลสุขภาพกายใจให้พร้อมปฏิบัติงานอย่างปลอดภัย'
        ],
        keyHighlight: 'เมื่อเรารู้เท่าทันอารมณ์ เราจะเป็นผู้ควบคุมสถานการณ์ ไม่ใช่ให้อารมณ์มาควบคุมเรา'
      },
      {
        id: 'apw-2-2',
        title: '2.2 พลังการฟื้นคืน (Resilience) และความปลอดภัยทางจิตวิทยาในทีม',
        content: [
          'Resilience คือภูมิคุ้มกันทางใจที่ช่วยให้เราลุกขึ้นใหม่ได้เร็วเมื่อเจอความผิดหวังหรืออุปสรรค และเป็นทักษะที่สามารถฝึกฝนได้',
          'ขณะเดียวกัน ทีมงานที่มี "ความปลอดภัยทางจิตวิทยา (Psychological Safety)" สมาชิกจะรู้สึกไว้วางใจ กล้าพูดความจริง กล้าบอกเมื่อเครื่องจักรมีอาการผิดปกติ และกล้ารายงานข้อผิดพลาดตั้งแต่เนิ่นๆ ส่งผลให้เกิดการป้องกันอุบัติเหตุได้อย่างแท้จริง'
        ],
        bulletPoints: [
          'เปลี่ยนคำถามจาก "ใครทำผิด?" เป็น "เกิดอะไรขึ้น และเราจะร่วมมือกันแก้ไขและป้องกันได้อย่างไร?"',
          'รับฟังความคิดเห็นและข้อเสนอแนะของเพื่อนร่วมงานทุกระดับด้วยความเคารพ',
          'ให้กำลังใจและช่วยเหลือเกื้อกูลกันในยามที่ทีมต้องเผชิญกับช่วงเวลาที่ยากลำบาก'
        ],
        keyHighlight: 'ทีมที่ปลอดภัยทางใจ คือทีมที่ไร้อุบัติเหตุ และเปี่ยมไปด้วยประสิทธิภาพสูงสุด'
      }
    ]
  },
  {
    id: 3,
    courseId: 'applied-psychology',
    title: 'Module 3: การสร้างความสุข ความมั่นคง และความผูกพันในงาน',
    thaiTitle: 'ความสุขและความมั่นคงในงาน • สมดุลชีวิต ความผูกพันในองค์กร และความมั่นคงยั่งยืน',
    durationMinutes: 20,
    youtubeUrl: 'https://notebooklm.link.google/DCVV2tHiM0Qh',
    videoTitle: 'วิดีโอบทที่ 3: การสร้างความสุข ความมั่นคง และความผูกพันในงาน (NotebookLM Deep Dive)',
    videoDurationSec: 360,
    badge: 'Workplace Wellbeing',
    color: 'from-cyan-600 to-blue-800',
    summaryPoints: [
      'ประยุกต์ใช้โมเดล PERMA เพื่อสร้างความสุขและความพึงพอใจในชีวิตการทำงานประจำวัน',
      'เข้าใจปัจจัยที่แท้จริงของการสร้างความมั่นคงในอาชีพ (Job Security) ในระยะยาว',
      'การร่วมสร้างวัฒนธรรมครอบครัว TCT Academy ที่มีความสุข ความภาคภูมิใจ และเติบโตไปด้วยกัน'
    ],
    quizQuestionIds: [8, 9, 10],
    sections: [
      {
        id: 'apw-3-1',
        title: '3.1 ศาสตร์แห่งความสุขในที่ทำงานด้วยโมเดล PERMA',
        content: [
          'ความสุขในการทำงานไม่ได้เกิดขึ้นโดยบังเอิญ แต่เกิดจากการบ่มเพาะสุขภาวะตามหลักวิทยาศาสตร์จิตวิทยาเชิงบวก (PERMA Model):',
          '• P - Positive Emotions: การมองหาเรื่องดีๆ ยิ้มแย้ม และสร้างบรรยากาศแจ่มใส',
          '• E - Engagement: การมีสมาธิจดจ่อและเพลิดเพลินกับการลงมือทำงานอย่างตั้งใจ (Flow State)',
          '• R - Relationships: มิตรภาพและความสัมพันธ์อันดีกับเพื่อนร่วมงานและหัวหน้างาน',
          '• M - Meaning: การเห็นคุณค่าในงานว่าชิ้นส่วนเส้นคอร์ดที่เราผลิตช่วยสร้างความปลอดภัยให้ยานยนต์ทั่วโลก',
          '• A - Accomplishment: ความภาคภูมิใจเมื่อบรรลุเป้าหมายการผลิตที่ปลอดภัยและมีคุณภาพ'
        ],
        bulletPoints: [
          'กล่าวคำทักทายและ "ขอบคุณ" เพื่อนร่วมงานอย่างจริงใจทุกวัน',
          'มองเห็นคุณค่าและความสำคัญของบทบาทหน้าที่ตนเองต่อความสำเร็จของโรงงาน',
          'สนับสนุนซึ่งกันและกันทั้งในเรื่องงานและกำลังใจ'
        ],
        keyHighlight: 'คนทำงานที่มีความสุข คือคนที่ส่งมอบงานที่มีคุณภาพและความปลอดภัยสูงสุด'
      },
      {
        id: 'apw-3-2',
        title: '3.2 การสร้างความมั่นคงในอาชีพ (Job Security) และการเติบโตอย่างยั่งยืน',
        content: [
          'ความมั่นคงในอาชีพที่แท้จริงในยุคศตวรรษที่ 21 ไม่ได้เกิดจากการหยุดนิ่งอยู่กับที่ แต่เกิดจาก "ความสามารถในการเรียนรู้และปรับตัว (Adaptability & Lifelong Learning)"',
          'บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด และศูนย์ฝึกอบรม TCT Academy มุ่งมั่นยกระดับศักยภาพของพนักงานทุกคน เพื่อให้ทุกคนมีความก้าวหน้า มีความมั่นคงในอาชีพ และมีคุณภาพชีวิตที่ดีร่วมกับครอบครัวอย่างยั่งยืน'
        ],
        bulletPoints: [
          'หมั่นพัฒนาทักษะตนเองทั้ง Hard Skills และ Soft Skills อย่างต่อเนื่อง',
          'ยึดมั่นในวินัยความปลอดภัย และคุณภาพงานในทุกขั้นตอน',
          'ร่วมเป็นส่วนหนึ่งของการสร้าง TCT Academy ให้เป็นศูนย์กลางแห่งการเรียนรู้และความเป็นเลิศ'
        ],
        keyHighlight: 'ความมั่นคงที่ยั่งยืน เริ่มต้นจากการพัฒนาตนเองให้มีคุณค่าและพร้อมเติบโตไปพร้อมกับองค์กร'
      }
    ]
  }
];

export const APPLIED_PSYCHOLOGY_MINI_GAME_SCENARIOS: MiniGameScenario[] = [
  {
    id: 401,
    scenario: 'เมื่อหัวหน้างานให้ข้อเสนอแนะเกี่ยวกับจุดบกพร่องในชิ้นงาน พนักงานควรตั้งใจรับฟังด้วย Growth Mindset แล้วนำไปปรับปรุงขั้นตอนการทำงานทันที',
    category: 'Process',
    isCorrectBehavior: true,
    explanation: 'ถูกต้อง! การมองข้อเสนอแนะเป็นโอกาสในการเรียนรู้และพัฒนาฝีมือ คือหัวใจของ Growth Mindset'
  },
  {
    id: 402,
    scenario: 'เมื่อเกิดความล่าช้าในสายการผลิต ควรกล่าวโทษเพื่อนร่วมงานในที่ประชุมทันทีเพื่อพิสูจน์ว่าตนเองไม่ผิด',
    category: 'Culture',
    isCorrectBehavior: false,
    explanation: 'ผิด! การกล่าวโทษทำลายความไว้วางใจและความปลอดภัยทางใจ ควรใช้การสื่อสารอย่างสร้างสรรค์และร่วมกันแก้ปัญหาที่ต้นตอ'
  },
  {
    id: 403,
    scenario: 'เมื่อรู้สึกเครียดหรือเหนื่อยล้าสะสม พนักงานควรใช้เทคนิค S-T-O-P หยุดพักหายใจลึกๆ ดึงสติก่อนเริ่มขั้นตอนงานที่มีความเสี่ยงสูง',
    category: 'Safety',
    isCorrectBehavior: true,
    explanation: 'ถูกต้อง! การดึงสติและผ่อนคลายความเครียดช่วยลด Human Error และป้องกันอุบัติเหตุได้อย่างมีประสิทธิภาพ'
  },
  {
    id: 404,
    scenario: 'เมื่อสังเกตเห็นเพื่อนร่วมงานใหม่มีท่าทางกังวลหรือไม่เข้าใจขั้นตอน SOP ควรเข้าไปสอบถามและให้คำแนะนำด้วยความเป็นมิตร',
    category: 'Culture',
    isCorrectBehavior: true,
    explanation: 'ถูกต้อง! การมีน้ำใจเกื้อกูลและสร้างสัมพันธภาพที่ดี (Relationships) ช่วยสร้างบรรยากาศการทำงานที่อบอุ่นและปลอดภัย'
  },
  {
    id: 405,
    scenario: 'หากเครื่องจักรส่งเสียงผิดปกติ พนักงานควรเพิกเฉยและปล่อยให้เป็นหน้าที่ของกะถัดไปเพื่อจะได้ไม่ต้องทำงานเพิ่ม',
    category: 'Safety',
    isCorrectBehavior: false,
    explanation: 'ผิด! การมีจิตสำนึกแห่งความรับผิดชอบและความปลอดภัยต้องแจ้งเตือนหรือกดปุ่มตรวจสอบทันที เพื่อป้องกันความเสียหายร้ายแรง'
  },
  {
    id: 406,
    scenario: 'การตั้งเป้าหมายการทำงานประจำวัน (Daily Goals) ที่ชัดเจน ช่วยเพิ่มพลังความมุ่งมั่น (Grit) และความสุขเมื่อทำงานได้สำเร็จตามเป้า',
    category: 'Process',
    isCorrectBehavior: true,
    explanation: 'ถูกต้อง! การมีเป้าหมายที่ชัดเจนช่วยกระตุ้นพลังขับเคลื่อนและความรู้สึกภาคภูมิใจในความสำเร็จ (Accomplishment)'
  },
  {
    id: 407,
    scenario: 'ความมั่นคงในอาชีพของพนักงานเกิดขึ้นจากการนิ่งเฉยและปฏิเสธการเรียนรู้ระบบหรือเทคโนโลยีใหม่ๆ ของโรงงาน',
    category: 'Process',
    isCorrectBehavior: false,
    explanation: 'ผิด! ความมั่นคงที่แท้จริงเกิดจากการเป็นผู้เรียนรู้ตลอดชีวิต (Lifelong Learner) พร้อมปรับตัวและเพิ่มคุณค่าให้ตนเองเสมอ'
  },
  {
    id: 408,
    scenario: 'เมื่อทำงานผิดพลาด พนักงานที่มีพลังฟื้นคืน (Resilience) จะไม่จมอยู่กับความเศร้า แต่จะวิเคราะห์สาเหตุและเริ่มต้นใหม่อย่างรอบคอบ',
    category: 'Process',
    isCorrectBehavior: true,
    explanation: 'ถูกต้อง! Resilience ช่วยให้เราลุกขึ้นใหม่ได้อย่างเข้มแข็งและนำบทเรียนมาเป็นบันไดสู่ความสำเร็จ'
  },
  {
    id: 409,
    scenario: 'การกล่าวคำขอบคุณและชื่นชมเพื่อนร่วมงานเมื่อได้รับความช่วยเหลือ ช่วยสร้างพลังบวกและส่งเสริมสุขภาวะในที่ทำงาน (Positive Emotion)',
    category: 'Culture',
    isCorrectBehavior: true,
    explanation: 'ถูกต้อง! คำขอบคุณและการชื่นชมเป็นยาวิเศษที่สร้างความผูกพันและรอยยิ้มในสถานที่ทำงาน'
  },
  {
    id: 410,
    scenario: 'การสร้างความปลอดภัยทางจิตวิทยา (Psychological Safety) ทำให้ทุกคนในกะกล้าเตือนจุดอันตรายและกล้ารายงานข้อผิดพลาดอย่างโปร่งใส',
    category: 'Safety',
    isCorrectBehavior: true,
    explanation: 'ถูกต้อง! ความปลอดภัยทางจิตวิทยาคือเสาหลักแห่งความปลอดภัยและเป้าหมาย Zero Accident ขององค์กร'
  }
];

// รายชื่อผู้เข้าอบรมหลักสูตรที่ 7: จิตวิทยาประยุกต์ในการทำงาน เพื่อความสำเร็จ ความสุข และความมั่นคง (TCT-PSY-01)
// รอบที่ 1: 12 ตุลาคม 2569 - 16 ตุลาคม 2569 (จำนวน 20 ท่านแรก)
export const APPLIED_PSYCHOLOGY_INITIAL_TRAINEES: TraineeRecord[] = [
  {
    id: 'psy-tr-25056',
    empId: '25056',
    fullName: 'นาย ณฐวัตร พงษ์สาริกิจ',
    department: 'PS',
    position: 'SUPERVISOR',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-13',
    status: 'passed',
    preTestScore: 10,
    postTestScore: 10,
    postTestAttempts: 1,
    miniGameScore: 10,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-25056-001',
    certificateDate: '13 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนนเต็ม 20/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 10,
        postTestScore: 10,
        postTestAttempts: 1,
        miniGameScore: 10,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-25056-001',
        certificateDate: '13 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนนเต็ม 20/20)'
      }
    }
  },
  {
    id: 'psy-tr-08013',
    empId: '08013',
    fullName: 'นาย กิตติศักดิ์ สร้อยจิตต์',
    department: 'PS',
    position: 'MANAGER',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-14',
    status: 'passed',
    preTestScore: 9,
    postTestScore: 10,
    postTestAttempts: 1,
    miniGameScore: 10,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-08013-002',
    certificateDate: '14 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 20/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 9,
        postTestScore: 10,
        postTestAttempts: 1,
        miniGameScore: 10,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-08013-002',
        certificateDate: '14 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 20/20)'
      }
    }
  },
  {
    id: 'psy-tr-06025',
    empId: '06025',
    fullName: 'น.ส. จารุณี อินทรโสภา',
    department: 'PS',
    position: 'CHIEF',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-14',
    status: 'passed',
    preTestScore: 9,
    postTestScore: 10,
    postTestAttempts: 1,
    miniGameScore: 10,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-06025-003',
    certificateDate: '14 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 20/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 9,
        postTestScore: 10,
        postTestAttempts: 1,
        miniGameScore: 10,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-06025-003',
        certificateDate: '14 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 20/20)'
      }
    }
  },
  {
    id: 'psy-tr-17001',
    empId: '17001',
    fullName: 'น.ส. ดวงพร ไชยวีระ',
    department: 'PS',
    position: 'WORKER',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-15',
    status: 'passed',
    preTestScore: 8,
    postTestScore: 9,
    postTestAttempts: 1,
    miniGameScore: 9,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-17001-004',
    certificateDate: '15 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 18/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 8,
        postTestScore: 9,
        postTestAttempts: 1,
        miniGameScore: 9,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-17001-004',
        certificateDate: '15 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 18/20)'
      }
    }
  },
  {
    id: 'psy-tr-01002',
    empId: '01002',
    fullName: 'น.ส. มลฤดี ศิริคุณ',
    department: 'PP',
    position: 'CHIEF',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-15',
    status: 'passed',
    preTestScore: 8,
    postTestScore: 10,
    postTestAttempts: 1,
    miniGameScore: 10,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-01002-005',
    certificateDate: '15 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 20/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 8,
        postTestScore: 10,
        postTestAttempts: 1,
        miniGameScore: 10,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-01002-005',
        certificateDate: '15 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 20/20)'
      }
    }
  },
  {
    id: 'psy-tr-03007',
    empId: '03007',
    fullName: 'นาย นาวา เกษร',
    department: 'MN',
    position: 'SUPERVISOR',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-15',
    status: 'passed',
    preTestScore: 7,
    postTestScore: 9,
    postTestAttempts: 1,
    miniGameScore: 9,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-03007-006',
    certificateDate: '15 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 18/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 7,
        postTestScore: 9,
        postTestAttempts: 1,
        miniGameScore: 9,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-03007-006',
        certificateDate: '15 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 18/20)'
      }
    }
  },
  {
    id: 'psy-tr-11003',
    empId: '11003',
    fullName: 'นาย ชลิต เสือน้อย',
    department: 'MN',
    position: 'MANAGER',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-15',
    status: 'passed',
    preTestScore: 9,
    postTestScore: 10,
    postTestAttempts: 1,
    miniGameScore: 10,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-11003-007',
    certificateDate: '15 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 20/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 9,
        postTestScore: 10,
        postTestAttempts: 1,
        miniGameScore: 10,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-11003-007',
        certificateDate: '15 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 20/20)'
      }
    }
  },
  {
    id: 'psy-tr-18034',
    empId: '18034',
    fullName: 'น.ส. วนิดา เพิ่มความประเสริฐ',
    department: 'QA',
    position: 'SUPERVISOR',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-15',
    status: 'passed',
    preTestScore: 8,
    postTestScore: 10,
    postTestAttempts: 1,
    miniGameScore: 10,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-18034-008',
    certificateDate: '15 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 20/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 8,
        postTestScore: 10,
        postTestAttempts: 1,
        miniGameScore: 10,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-18034-008',
        certificateDate: '15 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 20/20)'
      }
    }
  },
  {
    id: 'psy-tr-15030',
    empId: '15030',
    fullName: 'น.ส. หฤทัย ถึงอินทร์',
    department: 'ESH',
    position: 'CHIEF',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-16',
    status: 'passed',
    preTestScore: 9,
    postTestScore: 10,
    postTestAttempts: 1,
    miniGameScore: 10,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-15030-009',
    certificateDate: '16 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 20/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 9,
        postTestScore: 10,
        postTestAttempts: 1,
        miniGameScore: 10,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-15030-009',
        certificateDate: '16 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 20/20)'
      }
    }
  },
  {
    id: 'psy-tr-10019',
    empId: '10019',
    fullName: 'นาย อมร ศรีพรหม',
    department: 'SEC',
    position: 'SUPERVISOR',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-16',
    status: 'passed',
    preTestScore: 8,
    postTestScore: 9,
    postTestAttempts: 1,
    miniGameScore: 9,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-10019-010',
    certificateDate: '16 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 18/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 8,
        postTestScore: 9,
        postTestAttempts: 1,
        miniGameScore: 9,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-10019-010',
        certificateDate: '16 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 18/20)'
      }
    }
  },
  {
    id: 'psy-tr-07008',
    empId: '07008',
    fullName: 'น.ส. พัทยา มาตราช',
    department: 'PP',
    position: 'CLERK',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-16',
    status: 'passed',
    preTestScore: 8,
    postTestScore: 9,
    postTestAttempts: 1,
    miniGameScore: 9,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-07008-011',
    certificateDate: '16 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 18/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 8,
        postTestScore: 9,
        postTestAttempts: 1,
        miniGameScore: 9,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-07008-011',
        certificateDate: '16 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 18/20)'
      }
    }
  },
  {
    id: 'psy-tr-14025',
    empId: '14025',
    fullName: 'น.ส. สุภาวดี จอมทอง',
    department: 'PP',
    position: 'CLERK',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-16',
    status: 'passed',
    preTestScore: 7,
    postTestScore: 8,
    postTestAttempts: 1,
    miniGameScore: 8,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-14025-012',
    certificateDate: '16 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 16/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 7,
        postTestScore: 8,
        postTestAttempts: 1,
        miniGameScore: 8,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-14025-012',
        certificateDate: '16 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 16/20)'
      }
    }
  },
  {
    id: 'psy-tr-00021',
    empId: '00021',
    fullName: 'นาย สัญชัย รู้จัก',
    department: 'TR',
    position: 'LEADER',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-16',
    status: 'passed',
    preTestScore: 8,
    postTestScore: 9,
    postTestAttempts: 1,
    miniGameScore: 9,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-00021-013',
    certificateDate: '16 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 18/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 8,
        postTestScore: 9,
        postTestAttempts: 1,
        miniGameScore: 9,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-00021-013',
        certificateDate: '16 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 18/20)'
      }
    }
  },
  {
    id: 'psy-tr-03003',
    empId: '03003',
    fullName: 'นาย พิรุณ มาตทอง',
    department: 'TW',
    position: 'LEADER',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-16',
    status: 'passed',
    preTestScore: 8,
    postTestScore: 9,
    postTestAttempts: 1,
    miniGameScore: 9,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-03003-014',
    certificateDate: '16 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 18/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 8,
        postTestScore: 9,
        postTestAttempts: 1,
        miniGameScore: 9,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-03003-014',
        certificateDate: '16 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 18/20)'
      }
    }
  },
  {
    id: 'psy-tr-02010',
    empId: '02010',
    fullName: 'นาย เกตุแก้ว ทรัพย์ขำ',
    department: 'ST',
    position: 'LEADER',
    enrolledAt: '2026-10-12',
    completedAt: '2026-10-16',
    status: 'passed',
    preTestScore: 7,
    postTestScore: 9,
    postTestAttempts: 1,
    miniGameScore: 9,
    completedModules: [1, 2, 3],
    evaluationSubmitted: true,
    satisfactionScore: 5,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    certificateId: 'TCT-PSY-2026-02010-015',
    certificateDate: '16 ตุลาคม 2569',
    currentStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 18/20)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 7,
        postTestScore: 9,
        postTestAttempts: 1,
        miniGameScore: 9,
        completedModules: [1, 2, 3],
        evaluationSubmitted: true,
        certificateId: 'TCT-PSY-2026-02010-015',
        certificateDate: '16 ตุลาคม 2569',
        lastActiveStep: 'จบหลักสูตร & ได้รับวุฒิบัตร (คะแนน 18/20)'
      }
    }
  },
  {
    id: 'psy-tr-06059',
    empId: '06059',
    fullName: 'นาย ประไพ รื่นบุตร',
    department: 'PP',
    position: 'SENIOR LEADER',
    enrolledAt: '2026-10-12',
    status: 'in_progress',
    preTestScore: 8,
    postTestScore: null,
    postTestAttempts: 0,
    miniGameScore: 0,
    completedModules: [1],
    evaluationSubmitted: false,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    currentStep: 'กำลังเรียนบทที่ 2 (การบริหารอารมณ์และความเครียด)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 8,
        postTestScore: null,
        postTestAttempts: 0,
        miniGameScore: 0,
        completedModules: [1],
        evaluationSubmitted: false,
        lastActiveStep: 'กำลังเรียนบทที่ 2 (การบริหารอารมณ์และความเครียด)'
      }
    }
  },
  {
    id: 'psy-tr-00023',
    empId: '00023',
    fullName: 'นาย กรรณจพงษ์ คลีรัมย์',
    department: 'TR',
    position: 'SENIOR LEADER',
    enrolledAt: '2026-10-12',
    status: 'in_progress',
    preTestScore: 7,
    postTestScore: null,
    postTestAttempts: 0,
    miniGameScore: 0,
    completedModules: [1, 2],
    evaluationSubmitted: false,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    currentStep: 'กำลังเรียนบทที่ 3 (ความสุขและความมั่นคงในงาน)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 7,
        postTestScore: null,
        postTestAttempts: 0,
        miniGameScore: 0,
        completedModules: [1, 2],
        evaluationSubmitted: false,
        lastActiveStep: 'กำลังเรียนบทที่ 3 (ความสุขและความมั่นคงในงาน)'
      }
    }
  },
  {
    id: 'psy-tr-00024',
    empId: '00024',
    fullName: 'นาย สรรพสิทธิ์ ขันสัมฤทธิ์',
    department: 'AD1',
    position: 'SENIOR LEADER',
    enrolledAt: '2026-10-12',
    status: 'in_progress',
    preTestScore: 8,
    postTestScore: null,
    postTestAttempts: 0,
    miniGameScore: 0,
    completedModules: [1],
    evaluationSubmitted: false,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    currentStep: 'กำลังเรียนบทที่ 2 (การบริหารอารมณ์และความเครียด)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 8,
        postTestScore: null,
        postTestAttempts: 0,
        miniGameScore: 0,
        completedModules: [1],
        evaluationSubmitted: false,
        lastActiveStep: 'กำลังเรียนบทที่ 2 (การบริหารอารมณ์และความเครียด)'
      }
    }
  },
  {
    id: 'psy-tr-08029',
    empId: '08029',
    fullName: 'นาย ต้อม ศรีกุนชร',
    department: 'FI',
    position: 'LEADER',
    enrolledAt: '2026-10-12',
    status: 'in_progress',
    preTestScore: 9,
    postTestScore: null,
    postTestAttempts: 0,
    miniGameScore: 0,
    completedModules: [1, 2],
    evaluationSubmitted: false,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    currentStep: 'กำลังเรียนบทที่ 3 (ความสุขและความมั่นคงในงาน)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: 9,
        postTestScore: null,
        postTestAttempts: 0,
        miniGameScore: 0,
        completedModules: [1, 2],
        evaluationSubmitted: false,
        lastActiveStep: 'กำลังเรียนบทที่ 3 (ความสุขและความมั่นคงในงาน)'
      }
    }
  },
  {
    id: 'psy-tr-09001',
    empId: '09001',
    fullName: 'นาย วัชรินทร์ จุลแก้ว',
    department: 'ST',
    position: 'LEADER',
    enrolledAt: '2026-10-12',
    status: 'not_started',
    preTestScore: null,
    postTestScore: null,
    postTestAttempts: 0,
    miniGameScore: 0,
    completedModules: [],
    evaluationSubmitted: false,
    selectedCourseId: 'applied-psychology',
    enrolledCourses: ['applied-psychology'],
    currentStep: 'ลงทะเบียนเข้าเรียนรอบที่ 1 แล้ว (รอเริ่มเรียน 12-16 ต.ค. 2569)',
    coursesProgress: {
      'applied-psychology': {
        preTestScore: null,
        postTestScore: null,
        postTestAttempts: 0,
        miniGameScore: 0,
        completedModules: [],
        evaluationSubmitted: false,
        lastActiveStep: 'ลงทะเบียนเข้าเรียนรอบที่ 1 แล้ว (รอเริ่มเรียน 12-16 ต.ค. 2569)'
      }
    }
  }
];

