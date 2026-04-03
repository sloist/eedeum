import { supabase } from "./supabase";

// ─── 이벤트 타입 체계 ───
// noun_verb 패턴 통일
type EventType =
  // 문장
  | "underline_impression"    // 피드에서 체류(약한 신호)
  | "underline_detail_view"   // 상세 진입
  | "underline_save"          // 담기
  | "underline_echo_create"   // 댓글 작성
  // 공유카드
  | "share_card_create"       // 카드 모달 열기
  | "share_card_save"         // 이미지 저장 (다운로드)
  | "share_card_system_share" // 네이티브 공유 API
  // 책
  | "book_view"               // 책 상세 진입
  // 사람
  | "profile_view"            // 프로필 진입
  | "profile_follow"          // 구독
  // 검색
  | "search_execute"          // 검색 실행
  | "search_result_click"     // 검색 결과 클릭
  // 노트
  | "weave_view"              // 노트 상세 진입
  | "weave_create"            // 노트 생성
  | "weave_add_block"         // 노트에 블록 추가
  | "weave_publish"           // 노트 공개 발행
  | "weave_remove_block"      // 노트에서 블록 제거
  ;

// ─── source 값 고정 ───
// feed, detail, search, book, profile, weave, shelf, record
type Source = "feed" | "detail" | "search" | "book" | "profile" | "weave" | "shelf" | "record";

// ─── target_type ───
type TargetType = "underline" | "book" | "user" | "weave";

interface TrackParams {
  eventType: EventType;
  targetType: TargetType;
  targetId: string;
  source?: Source | string;
  context?: string;          // home_feed, same_book_cluster, search_results, book_page, etc.
  metadata?: Record<string, unknown>;
}

// 세션 ID: 탭 단위로 유지
const SESSION_ID = crypto.randomUUID();

// ─── 중복 방지 ───
const dedup = new Map<string, number>();
const DEDUP_INTERVALS: Record<string, number> = {
  underline_impression: 30_000,   // 같은 문장 노출: 30초
  underline_detail_view: 5_000,   // 같은 상세 진입: 5초
  book_view: 5_000,               // 같은 책 진입: 5초
  profile_view: 5_000,            // 같은 프로필 진입: 5초
  weave_view: 5_000,              // 같은 노트 진입: 5초
  search_execute: 2_000,          // 같은 검색: 2초
};

function isDuplicate(eventType: string, targetId: string): boolean {
  const interval = DEDUP_INTERVALS[eventType];
  if (!interval) return false;
  const key = `${eventType}:${targetId}`;
  const last = dedup.get(key);
  if (last && Date.now() - last < interval) return true;
  dedup.set(key, Date.now());
  return false;
}

// ─── 검색어 정리 ───
function sanitizeQuery(q: string): string {
  return q.trim().replace(/\s+/g, " ").slice(0, 100);
}

// ─── 메인 함수 ───
export function trackEvent(userId: string, params: TrackParams) {
  const { eventType, targetType, targetId, source, context, metadata } = params;

  if (isDuplicate(eventType, targetId)) return;

  // fire-and-forget
  supabase.from("user_events").insert({
    user_id: userId,
    session_id: SESSION_ID,
    event_type: eventType,
    target_type: targetType,
    target_id: targetId,
    source: source || null,
    context: context || null,
    metadata: metadata || {},
  }).then(({ error }) => {
    if (error) console.warn("trackEvent:", error.message);
  });
}

// ─── 편의 함수들 ───

export function trackSearch(userId: string, query: string, resultCount: number) {
  const q = sanitizeQuery(query);
  if (q.length < 1) return;
  trackEvent(userId, {
    eventType: "search_execute",
    targetType: "underline",
    targetId: q,
    source: "search",
    metadata: { query: q, result_count: resultCount },
  });
}

export function trackSearchClick(userId: string, query: string, clickedType: TargetType, clickedId: string, position?: number) {
  const q = sanitizeQuery(query);
  trackEvent(userId, {
    eventType: "search_result_click",
    targetType: clickedType,
    targetId: clickedId,
    source: "search",
    context: "search_results",
    metadata: { query: q, position: position ?? null },
  });
}

export { SESSION_ID };
