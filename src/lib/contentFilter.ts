/**
 * 이듬 콘텐츠 필터 — 1차 거름망
 *
 * 1,145개 한국어 비속어/욕설 리스트 기반 (bad_word_list)
 * + 광고/문제집/원문아닌것 패턴 매칭
 */

import { BAD_WORDS } from "./badwords";

// ─── 비속어 Set (O(1) 정확 매칭) + 부분 매칭용 배열 ───
const BAD_WORD_SET = new Set(BAD_WORDS.map(w => w.toLowerCase()));

// 2글자 이상인 단어만 부분 매칭 (1글자는 오탐이 많음)
const BAD_WORDS_PARTIAL = BAD_WORDS.filter(w => w.length >= 2).map(w => w.toLowerCase());

// ─── 광고 패턴 ───
const AD_PATTERNS = [
  /https?:\/\/\S+/i,
  /\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{4}/,
  /카[카톡].*[아이이]디|카톡\s*[:：]?\s*\S+/,
  /텔레그램|telegram/i,
  /무료\s*상담|수익.*보장|투자.*수익/,
  /bit\.ly|t\.co|tinyurl/i,
];

// ─── 문제집/시험 패턴 ───
const EXAM_PATTERNS = [
  /다음\s*(중|보기|문장|글)/,
  /[①②③④⑤⑴⑵⑶⑷⑸]/,
  /\(\s*[1-5]\s*\)/,
  /정답[은는이가]\s/,
  /보기에서\s*(골|찾|선택)/,
  /밑줄\s*친\s*부분/,
  /다음\s*물음에?\s*답/,
];

// ─── 원문이 아닌 것 패턴 ───
const NON_ORIGINAL_PATTERNS = [
  /#{3,}/,
  /@\w+\s.*@\w+/,
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{27BF}]{4,}/u,
];

// ─── 공개 API ───

export type FilterResult = {
  blocked: boolean;
  suspicious: boolean;
  reason: string | null;
};

/**
 * 클라이언트 사전 검사
 * - 비속어 → 즉시 차단
 * - 광고/문제집/원문아닌것 → suspicious (hidden 처리)
 */
export function checkContent(text: string): FilterResult {
  if (!text || text.trim().length === 0) {
    return { blocked: false, suspicious: false, reason: null };
  }

  // 공백 제거한 버전 (우회 방지: "시 발" → "시발")
  const normalized = text.toLowerCase().replace(/\s+/g, "");
  // 원본 소문자 (패턴 매칭용)
  const lower = text.toLowerCase();

  // 1) 비속어 — 단어 단위 정확 매칭
  const words = lower.split(/[\s,.\-!?~·…]+/).filter(Boolean);
  for (const w of words) {
    if (BAD_WORD_SET.has(w)) {
      return { blocked: true, suspicious: false, reason: "부적절한 표현이 포함되어 있습니다" };
    }
  }

  // 2) 비속어 — 공백 제거 후 부분 매칭 (우회 방지)
  for (const bad of BAD_WORDS_PARTIAL) {
    if (normalized.includes(bad)) {
      return { blocked: true, suspicious: false, reason: "부적절한 표현이 포함되어 있습니다" };
    }
  }

  // 3) 광고 → 의심
  for (const pattern of AD_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: false, suspicious: true, reason: "ad" };
    }
  }

  // 4) 문제집 → 의심
  for (const pattern of EXAM_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: false, suspicious: true, reason: "exam" };
    }
  }

  // 5) 원문이 아닌 것 → 의심
  for (const pattern of NON_ORIGINAL_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: false, suspicious: true, reason: "non_original" };
    }
  }

  // 6) 너무 짧은 문장
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
