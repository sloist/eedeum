import type { DbUnderline, FeedPost } from "./types";

// ─── Rate Limiter ────────────────────────────────────

const rateLimits: Record<string, number[]> = {};

export function checkRateLimit(action: string, maxPerMinute: number): boolean {
  const now = Date.now();
  if (!rateLimits[action]) rateLimits[action] = [];
  rateLimits[action] = rateLimits[action].filter(t => now - t < 60000);
  if (rateLimits[action].length >= maxPerMinute) return false;
  rateLimits[action].push(now);
  return true;
}

// ─── Helpers ─────────────────────────────────────────

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}시간 전`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "어제";
  if (diffD < 7) return `${diffD}일 전`;
  const diffW = Math.floor(diffD / 7);
  if (diffW < 5) return `${diffW}주 전`;
  return `${Math.floor(diffD / 30)}달 전`;
}

export function mapLineToFeedPost(
  u: DbUnderline,
  otherLines: { userId: string; userName: string; quote: string; page: number }[] = []
): FeedPost {
  const user = u.users;
  const book = u.books;
  const likesCount = u.likes?.[0]?.count ?? 0;
  const echoList = (u.echoes ?? []).map(e => ({
    userId: e.user_id,
    userName: e.users?.name ?? "?",
    text: e.text,
    isSameLine: e.is_same_line,
  }));
  const sameLineCount = echoList.filter(e => e.isSameLine).length;

  return {
    id: u.id,
    userId: u.user_id,
    userName: user?.name ?? "?",
    userAvatar: user?.avatar_emoji ?? "📖",
    userHandle: user?.handle ?? "",
    book: {
      title: book?.title ?? "",
      author: book?.author ?? "",
      page: u.page,
    },
    bookId: u.book_id,
    quote: u.quote,
    feeling: u.feeling ?? "",
    coverColor: book?.cover_color ?? "#8B7355",
    timestamp: timeAgo(u.created_at),
    likes: likesCount,
    topic: book?.topics?.[0] ?? "",
    echoes: echoList,
    otherLines,
    sameLineCount,
  };
}
