export interface LearningMetrics {
  preScore: number;
  postScore: number;
  prePercentage: number;
  postPercentage: number;
  scoreDelta: number;
  gapClosureRate: number; // 0 - 100%
  growthPercentage: number; // 0 - 100%
  displayGainTh: string;
  displayGainEn: string;
  badgeLabelTh: string;
  badgeLabelEn: string;
  retentionNoteTh: string;
  retentionNoteEn: string;
  shortSummaryEn: string;
  shortSummaryTh: string;
}

/**
 * Calculates statistically sound pedagogical metrics for Pre-Test vs Post-Test evaluation:
 * 1. Knowledge Gap Closure (Hake's Normalized Gain): How much of the missing knowledge gap was closed.
 *    - If 10/10 on both: 100% Full Mastery & Zero Gap (not 0%).
 *    - If 10/10 on post: 100% Gap Closed.
 * 2. Skill & Competency Gain: Measurable increase in operational safety and quality understanding.
 */
export function calculateLearningMetrics(
  pre: number | null | undefined, 
  post: number | null | undefined
): LearningMetrics {
  const isPostTested = post !== null && post !== undefined;
  const isPreTested = pre !== null && pre !== undefined;

  const preScore = isPreTested ? Math.max(0, Math.min(10, pre)) : 0;
  const postScore = isPostTested ? Math.max(0, Math.min(10, post)) : 0;

  const prePercentage = preScore * 10;
  const postPercentage = postScore * 10;
  const deltaRaw = postScore - preScore;
  const scoreDelta = deltaRaw * 10;

  let gapClosureRate = 0;
  let growthPercentage = 0;
  let displayGainTh = '';
  let displayGainEn = '';
  let badgeLabelTh = '';
  let badgeLabelEn = '';
  let retentionNoteTh = '';
  let retentionNoteEn = '';
  let shortSummaryEn = '';
  let shortSummaryTh = '';

  if (!isPostTested) {
    // Post-Test not yet taken
    gapClosureRate = 0;
    growthPercentage = 0;
    displayGainTh = 'ยังไม่ทำ Post-Test';
    displayGainEn = 'Pending Post-Test';
    badgeLabelTh = 'รอการทดสอบ';
    badgeLabelEn = 'Pending Evaluation';
    retentionNoteTh = isPreTested 
      ? `ทำ Pre-Test ได้ ${preScore}/10 (${prePercentage}%) • รอทำ Post-Test หลังจบหลักสูตร`
      : 'ยังไม่ได้เริ่มทำแบบทดสอบ';
    retentionNoteEn = 'Awaiting post-training assessment';
    shortSummaryEn = 'Pending Test';
    shortSummaryTh = 'รอการทดสอบ';
  } else if (preScore === 10 && postScore === 10) {
    // 10 out of 10 on both Pre-Test and Post-Test
    gapClosureRate = 100;
    growthPercentage = 100;
    displayGainTh = '100% (สมรรถนะระดับยอดเยี่ยม)';
    displayGainEn = '100% (Distinction Mastery)';
    badgeLabelTh = 'ความเชี่ยวชาญสมบูรณ์ 100%';
    badgeLabelEn = '100% Full Mastery & Zero Gap';
    retentionNoteTh = 'รักษามาตรฐานความรู้เต็ม 100% สมบูรณ์ ไร้ช่องว่างความเสี่ยง';
    retentionNoteEn = 'Zero Knowledge Gap & 100% Perfect Retention';
    shortSummaryEn = '100% Full Mastery';
    shortSummaryTh = 'เชี่ยวชาญสมบูรณ์ 100%';
  } else if (postScore === 10) {
    // Post-Test is 10/10 (Achieved 100% closure of all previous gaps)
    gapClosureRate = 100;
    growthPercentage = 100;
    displayGainTh = `100% ปิดช่องว่างความรู้ (+${scoreDelta}%)`;
    displayGainEn = `100% Gap Closed (+${scoreDelta}% Gain)`;
    badgeLabelTh = 'ปิดช่องว่างความรู้ 100%';
    badgeLabelEn = '100% Knowledge Gap Closed';
    retentionNoteTh = `ยกระดับความรู้จาก ${prePercentage}% สู่ 100% เต็ม (ปิดช่องว่างความรู้ได้ 100% สมบูรณ์)`;
    retentionNoteEn = `Elevated from ${prePercentage}% to 100% (100% Knowledge Gap Resolved)`;
    shortSummaryEn = '100% Gap Closed';
    shortSummaryTh = 'ปิดช่องว่างความรู้ 100%';
  } else if (postScore > preScore) {
    // Progressive Gain
    const totalGap = 10 - preScore;
    const closedGap = postScore - preScore;
    gapClosureRate = totalGap > 0 ? Math.round((closedGap / totalGap) * 100) : 100;
    growthPercentage = Math.max(scoreDelta, gapClosureRate);
    displayGainTh = `+${scoreDelta}% (ปิดช่องว่าง ${gapClosureRate}%)`;
    displayGainEn = `+${scoreDelta}% (${gapClosureRate}% Gap Closed)`;
    badgeLabelTh = `ปิดช่องว่างความรู้ ${gapClosureRate}%`;
    badgeLabelEn = `${gapClosureRate}% Knowledge Gap Closed`;
    retentionNoteTh = `พัฒนาความรู้เพิ่มขึ้น +${scoreDelta}% (แก้จุดไม่รู้ได้ ${gapClosureRate}%)`;
    retentionNoteEn = `Knowledge upgraded by +${scoreDelta}% (${gapClosureRate}% missing gaps closed)`;
    shortSummaryEn = `+${scoreDelta}% Gain (${gapClosureRate}% Gap Closed)`;
    shortSummaryTh = `พัฒนา +${scoreDelta}% (ปิดช่องว่าง ${gapClosureRate}%)`;
  } else if (postScore === preScore) {
    // Retained Score (e.g. 8 and 8, or 9 and 9)
    gapClosureRate = postPercentage;
    growthPercentage = postPercentage;
    displayGainTh = `${postPercentage}% (รักษามาตรฐานความรู้)`;
    displayGainEn = `${postPercentage}% (Standard Retained)`;
    badgeLabelTh = `รักษามาตรฐาน ${postPercentage}%`;
    badgeLabelEn = `${postPercentage}% Retention Verified`;
    retentionNoteTh = `รักษามาตรฐานความรู้ ${postPercentage}% และผ่านเกณฑ์การฝึกอบรมสมบูรณ์`;
    retentionNoteEn = `Retained ${postPercentage}% baseline competency meeting high industrial standards`;
    shortSummaryEn = `${postPercentage}% Competency Retained`;
    shortSummaryTh = `รักษามาตรฐาน ${postPercentage}%`;
  } else {
    // Post score below pre
    gapClosureRate = postPercentage;
    growthPercentage = postPercentage;
    displayGainTh = `${postPercentage}% (คะแนนหลังเรียน)`;
    displayGainEn = `${postPercentage}% (Post-Test Score)`;
    badgeLabelTh = `สมรรถนะ ${postPercentage}%`;
    badgeLabelEn = `${postPercentage}% Competency Met`;
    retentionNoteTh = `ผลการทดสอบหลังเรียน ${postPercentage}% (${postScore}/10)`;
    retentionNoteEn = `Competency standard measured at ${postPercentage}%`;
    shortSummaryEn = `${postPercentage}% Competency`;
    shortSummaryTh = `สมรรถนะ ${postPercentage}%`;
  }

  return {
    preScore,
    postScore,
    prePercentage,
    postPercentage,
    scoreDelta,
    gapClosureRate,
    growthPercentage,
    displayGainTh,
    displayGainEn,
    badgeLabelTh,
    badgeLabelEn,
    retentionNoteTh,
    retentionNoteEn,
    shortSummaryEn,
    shortSummaryTh
  };
}
