/**
 * 이듬 콘텐츠 필터 — 1차 거름망
 *
 * 목적: 명백하게 이상한 것만 빠르게 걸러냄
 * 완벽한 검열이 아니라 "이건 확실히 아니다"만 잡는 구조
 */

// ─── 1. 명백한 욕설/비속어 (클라이언트 사전 차단용) ───
// 변형(ㅅㅂ, 시발, s1bal 등)은 DB trigger에서 잡음
const PROFANITY_EXACT = [
  "시발", "씨발", "씨팔", "시팔", "씹", "좆", "지랄",
  "개새끼", "미친놈", "미친년", "병신", "ㅅㅂ", "ㅆㅂ",
  "ㅂㅅ", "ㅈㄹ", "꺼져", "닥쳐", "존나", "졸라",
  "fuck", "shit", "bitch", "dick", "asshole",
];

// ─── 2. 광고 패턴 ───
const AD_PATTERNS = [
  /https?:\/\/\S+/i,                        // URL
  /\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{4}/,     // 전화번호
  /카[카톡].*[아이이]디|카톡\s*[:：]?\s*\S+/,  // 카카오톡 ID
  /텔레그램|telegram/i,
  /무료\s*상담|수익.*보장|투자.*수익/,
  /bit\.ly|t\.co|tinyurl/i,
];

// ─── 3. 문제집/시험 패턴 ───
const EXAM_PATTERNS = [
  /다음\s*(중|보기|문장|글)/,
  /[①②③④⑤⑴⑵⑶⑷⑸]/,
  /\(\s*[1-5]\s*\)/,                          // (1) (2) (3)
  /정답[은는이가]\s/,
  /보기에서\s*(골|찾|선택)/,
  /밑줄\s*친\s*부분/,                          // 시험 지문
  /다음\s*물음에?\s*답/,
];

// ─── 4. 원문이 아닌 것 같은 패턴 ───
const NON_ORIGINAL_PATTERNS = [
  /#{3,}/,                                     // 해시태그 3개 이상
  /@\w+\s.*@\w+/,                              // 멘션 2개 이상
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{27BF}]{4,}/u, // 이모지 4개 연속
];

// ─── 공개 API ───

export type FilterResult = {
  blocked: boolean;       // true면 제출 자체를 막음
  suspicious: boolean;    // true면 제출은 되지만 hidden 처리 (DB에서도 이중으로 검사)
  reason: string | null;
};

/**
 * 클라이언트 사전 검사 — createLine / addEcho 호출 전에 실행
 */
export function checkContent(text: string): FilterResult {
  if (!text || text.trim().length === 0) {
    return { blocked: false, suspicious: false, reason: null };
  }

  const normalized = text.toLowerCase().replace(/\s+/g, "");

  // 1) 명백한 욕설 → 차단
  for (const word of PROFANITY_EXACT) {
    if (normalized.includes(word.toLowerCase())) {
      return { blocked: true, suspicious: false, reason: "부적절한 표현이 포함되어 있습니다" };
    }
  }

  // 2) 광고 → 의심
  for (const pattern of AD_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: false, suspicious: true, reason: "ad" };
    }
  }

  // 3) 문제집 → 의심
  for (const pattern of EXAM_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: false, suspicious: true, reason: "exam" };
    }
  }

  // 4) 원문이 아닌 것 → 의심
  for (const pattern of NON_ORIGINAL_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: false, suspicious: true, reason: "non_original" };
    }
  }

  // 5) 너무 짧은 문장 (quote 전용으로 쓸 때)
  if (text.trim().length < 3) {
    return { blocked: false, suspicious: true, reason: "too_short" };
  }

  return { blocked: false, suspicious: false, reason: null };
}

/**
 * quote + feeling 합쳐서 검사
 */
export function checkLineContent(quote: string, feeling?: string): FilterResult {
  const quoteResult = checkContent(quote);
  if (quoteResult.blocked) return quoteResult;

  if (feeling) {
    const feelingResult = checkContent(feeling);
    if (feelingResult.blocked) return feelingResult;
    if (feelingResult.suspicious) return feelingResult;
  }

  return quoteResult;
}
