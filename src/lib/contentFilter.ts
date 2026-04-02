/**
 * 이듬 콘텐츠 필터 v2
 *
 * 원칙: 좁고 확실하게. 오탐 < 미탐.
 * 명백한 것만 차단/숨김. 애매한 건 통과.
 *
 * 이듬은 문장 서비스라서 정상 문장을 잘못 잡는 게 더 치명적.
 */

import { BAD_WORDS } from "./badwords";

// ─── 오탐 위험 단어 제외 목록 ───
// 문장 서비스에서 자연스럽게 쓰이는 단어들
const FALSE_POSITIVE_WORDS = new Set([
  "씹", "씹어", "곱씹", "되씹", "씹히", "씹는",  // 곱씹다, 되씹다
  "카톡", "카카오톡", "텔레그램",                    // 단독 언급은 허용
  "닥치", "닥친",                                    // "눈앞에 닥친"
]);

// ─── 비속어 Set (1,145개) — 오탐 위험 단어 제외 ───
const SAFE_BAD_WORDS = BAD_WORDS
  .filter(w => w.length >= 2)
  .filter(w => !FALSE_POSITIVE_WORDS.has(w))
  .map(w => w.toLowerCase());

const BAD_WORD_SET = new Set(SAFE_BAD_WORDS);

// ─── 명백한 욕설 변형 패턴 (정규식) ───
// 공백/특수문자 삽입 우회까지 대응
const PROFANITY_REGEX = [
  /시[\s.!1|i]*발/i,
  /씨[\s.!1|i]*[발팔]/i,
  /ㅅ[\s.!1]*ㅂ/,
  /ㅆ[\s.!1]*ㅂ/,
  /병[\s.\-]*[신싄]/,
  /ㅂ[\s.\-]*ㅅ/,
  /개새[끼기키]/,
  /개색[기끼키]/,
  /미친[놈년넘]/,
  /씹[새년창덕할]/,
  /존[\s]*나/,
  /졸[\s]*라/,
  /ㅈ[\s]*ㄴ/,
  /ㅈ[\s]*ㄹ/,
];

// ─── 광고: URL ───
const AD_LINK_PATTERNS = [
  /https?:\/\/\S+/i,
  /www\.\S+/i,
  /bit\.ly|t\.co|tinyurl|open\.kakao\.com|forms\.gle/i,
];

// ─── 광고: 전화번호 ───
const PHONE_PATTERN = /\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{4}/;

// ─── 광고: 메신저 유도 (조합형 — 둘 다 있어야 잡힘) ───
const MESSENGER_WORDS = /카톡|카카오톡|오픈채팅|텔레그램|telegram|디엠|dm/i;
const INDUCEMENT_WORDS = /문의|상담|연락|추가|가능|주세요|환영|안내|보내/i;

// ─── 광고: 전형적 사기/광고 문구 ───
const AD_PHRASES = /무료\s*상담|수익\s*보장|고수익|부업\s*추천|재택\s*부업|투자\s*리딩|주식\s*리딩|코인\s*리딩|원금\s*보장|당일\s*정산|즉시\s*수익|수수료\s*없/i;

// ─── 시험/문제집 (조합형 — 단독 패턴은 공격적이므로 조건 강화) ───
const EXAM_SYMBOLS = /[①②③④⑤⑴⑵⑶⑷⑸]/;
const EXAM_CONTEXT = /정답|보기|고르|답을|맞는/i;
const EXAM_FULL = /다음\s*(중|보기에서).*고르|정답\s*(은|는|이)\s*\d|보기에서\s*(고르|골라|찾아|선택)|옳은\s*것(만|을)|틀린\s*것(만|을)/i;

// ─── 공개 API ───

export type FilterResult = {
  blocked: boolean;
  suspicious: boolean;
  reason: string | null;  // profanity, ad_link, phone_number, contact_inducement, ad_phrase, exam_pattern
};

const PASS: FilterResult = { blocked: false, suspicious: false, reason: null };

/**
 * 클라이언트 사전 검사
 */
export function checkContent(text: string): FilterResult {
  if (!text || text.trim().length < 2) return PASS;

  const lower = text.toLowerCase();
  // 공백 제거 (우회 방지용, 정규식 매칭과 별도)
  const compact = lower.replace(/\s+/g, "");

  // ① 욕설 — 정규식 변형 패턴
  for (const rx of PROFANITY_REGEX) {
    if (rx.test(text)) {
      return { blocked: true, suspicious: false, reason: "부적절한 표현이 포함되어 있습니다" };
    }
  }

  // ② 욕설 — bad_word_list 단어 매칭 (단어 단위)
  const words = compact.split(/[,.\-!?~·…\s]+/).filter(w => w.length >= 2);
  for (const w of words) {
    if (BAD_WORD_SET.has(w)) {
      return { blocked: true, suspicious: false, reason: "부적절한 표현이 포함되어 있습니다" };
    }
  }

  // ③ URL → 숨김
  for (const rx of AD_LINK_PATTERNS) {
    if (rx.test(text)) {
      return { blocked: false, suspicious: true, reason: "ad_link" };
    }
  }

  // ④ 전화번호 → 숨김
  if (PHONE_PATTERN.test(text)) {
    return { blocked: false, suspicious: true, reason: "phone_number" };
  }

  // ⑤ 메신저 유도 (조합형) → 숨김
  if (MESSENGER_WORDS.test(lower) && INDUCEMENT_WORDS.test(lower)) {
    return { blocked: false, suspicious: true, reason: "contact_inducement" };
  }

  // ⑥ 광고 문구 → 숨김
  if (AD_PHRASES.test(text)) {
    return { blocked: false, suspicious: true, reason: "ad_phrase" };
  }

  // ⑦ 시험/문제집 (조합형) → 숨김
  if (EXAM_SYMBOLS.test(text) && EXAM_CONTEXT.test(text)) {
    return { blocked: false, suspicious: true, reason: "exam_pattern" };
  }
  if (EXAM_FULL.test(text)) {
    return { blocked: false, suspicious: true, reason: "exam_pattern" };
  }

  return PASS;
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
