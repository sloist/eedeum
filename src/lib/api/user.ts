import { supabase } from "../supabase";
import type { DbBook, DbUnderline, DbUser, FeedPost } from "./types";
import { mapLineToFeedPost, timeAgo } from "./helpers";
import { getCached, setCache } from "../cache";

export async function fetchUserProfile(userId: string): Promise<any | null> {
  const cacheKey = `user:profile:${userId}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !user) return null;

  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  const { count: lineCount } = await supabase
    .from("underlines")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { data: userBooksData } = await supabase
    .from("user_books")
    .select("book_id")
    .eq("user_id", userId);

  const result = {
    ...user as DbUser,
    followers: followerCount ?? 0,
    following: followingCount ?? 0,
    lines: lineCount ?? 0,
    books: userBooksData?.length ?? 0,
  };

  setCache(cacheKey, result, 60000);
  return result;
}

export async function fetchUserByHandle(handle: string) {
  const cleanHandle = handle.replace(/^@/, "");
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("handle", cleanHandle)
    .single();
  return data as DbUser | null;
}

export async function fetchUserShelf(userId: string): Promise<any[]> {
  const cacheKey = `user:shelf:${userId}`;
  const cached = getCached<any[]>(cacheKey);
  if (cached) return cached;

  const { data } = await supabase
    .from("underlines")
    .select(`book_id, books(*)`)
    .eq("user_id", userId);

  // Group by book
  const bookMap: Record<string, { title: string; author: string; color: string; lines: number }> = {};
  for (const row of data ?? []) {
    const book = row.books as unknown as DbBook;
    if (!book) continue;
    if (!bookMap[book.id]) {
      bookMap[book.id] = { title: book.title, author: book.author, color: book.cover_color ?? "#8B7355", lines: 0 };
    }
    bookMap[book.id].lines++;
  }

  const result = Object.values(bookMap);
  setCache(cacheKey, result, 60000);
  return result;
}

export async function fetchUserBooks(userId: string) {
  const { data } = await supabase
    .from("user_books")
    .select(`*, books(*)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map(ub => ({
    bookId: ub.book_id,
    title: (ub.books as unknown as DbBook)?.title ?? "",
    author: (ub.books as unknown as DbBook)?.author ?? "",
    color: (ub.books as unknown as DbBook)?.cover_color ?? "#8B7355",
    status: ub.status as "reading" | "owned" | "finished",
  }));
}

export async function fetchUserLines(userId: string): Promise<FeedPost[]> {
  const { data } = await supabase
    .from("underlines")
    .select(`
      *,
      users!underlines_user_id_fkey(*),
      books(*),
      echoes(*, users(*)),
      likes(count),
      saves(count)
    `)
    .eq("user_id", userId)
    .neq("is_draft", true)
    .neq("is_private", true)
    .order("created_at", { ascending: false });

  return (data ?? []).map(u => mapLineToFeedPost(u as DbUnderline));
}

/** 다시 만난 문장 — 30일 이상 된 내 기록 중 랜덤 1개 */
export async function fetchRediscovery(userId: string): Promise<{ quote: string; bookTitle: string; bookAuthor: string; feeling: string | null; createdAt: string; shortId: string; handle: string } | null> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data } = await supabase
    .from("underlines")
    .select("*, books(*), users!underlines_user_id_fkey(*)")
    .eq("user_id", userId)
    .eq("is_draft", false)
    .lt("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: true });

  if (!data || data.length === 0) return null;
  // 날짜 기반 결정적 랜덤 (하루 한 번 바뀜)
  const today = new Date().toISOString().slice(0, 10);
  const hash = today.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const pick = data[hash % data.length];
  const book = pick.books as any;
  const user = pick.users as any;
  return {
    quote: pick.quote,
    bookTitle: book?.title ?? "",
    bookAuthor: book?.author ?? "",
    feeling: pick.feeling,
    createdAt: pick.created_at,
    shortId: pick.short_id,
    handle: user?.handle ?? "",
  };
}

export async function fetchUserDbProfile(userId: string): Promise<DbUser | null> {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  return data as DbUser | null;
}

export async function fetchMonthlyActivity(userId: string, year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  const { data } = await supabase
    .from("underlines")
    .select("id, created_at")
    .eq("user_id", userId)
    .gte("created_at", startDate)
    .lt("created_at", endDate);

  // Group by day
  const days: Record<number, number> = {};
  for (const row of data ?? []) {
    const day = new Date(row.created_at).getDate();
    days[day] = (days[day] ?? 0) + 1;
  }

  // Get days in month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Build heatmap data
  const heatmap: { day: number; count: number; level: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const count = days[d] ?? 0;
    const level = count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;
    heatmap.push({ day: d, count, level });
  }

  const totalLines = (data ?? []).length;

  // Most active book this month
  const { data: withBooks } = await supabase
    .from("underlines")
    .select("book_id, books(title)")
    .eq("user_id", userId)
    .gte("created_at", startDate)
    .lt("created_at", endDate);

  const bookCounts: Record<string, number> = {};
  for (const row of withBooks ?? []) {
    const title = (row.books as any)?.title ?? "?";
    bookCounts[title] = (bookCounts[title] ?? 0) + 1;
  }

  const topBook = Object.entries(bookCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { heatmap, totalLines, topBook };
}

export async function fetchSavedLines(userId: string) {
  const { data } = await supabase
    .from("saves")
    .select(`
      created_at,
      underlines(*, users!underlines_user_id_fkey(*), books(*))
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map(s => {
    const u = s.underlines as unknown as DbUnderline;
    return {
      id: u?.id ?? "",
      shortId: u?.short_id ?? "",
      userHandle: (u?.users as any)?.handle ?? "",
      quote: u?.quote ?? "",
      book: u?.books?.title ?? "",
      author: u?.books?.author ?? "",
      savedAt: timeAgo(s.created_at),
    };
  });
}

export async function fetchLikedLines(userId: string) {
  const { data } = await supabase
    .from("likes")
    .select(`
      created_at,
      underlines(*, users!underlines_user_id_fkey(*), books(*))
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map(l => {
    const u = l.underlines as unknown as DbUnderline;
    return {
      id: u?.id ?? "",
      shortId: u?.short_id ?? "",
      userHandle: (u?.users as any)?.handle ?? "",
      quote: u?.quote ?? "",
      book: u?.books?.title ?? "",
      author: u?.books?.author ?? "",
      userName: u?.users?.name ?? "",
      timestamp: timeAgo(l.created_at),
    };
  });
}

export async function fetchReceivedEchoes(userId: string) {
  // Get all underline IDs for this user
  const { data: myUnderlines } = await supabase
    .from("underlines")
    .select("id, short_id, quote")
    .eq("user_id", userId);

  if (!myUnderlines || myUnderlines.length === 0) return [];

  const lineIds = myUnderlines.map(u => u.id);
  const quoteMap: Record<string, string> = {};
  const shortIdMap: Record<string, string> = {};
  for (const u of myUnderlines) {
    quoteMap[u.id] = u.quote;
    shortIdMap[u.id] = u.short_id;
  }

  const { data: echoes } = await supabase
    .from("echoes")
    .select(`*, users(*)`)
    .in("underline_id", lineIds)
    .neq("user_id", userId)
    .order("created_at", { ascending: false });

  return (echoes ?? []).map(e => ({
    lineId: shortIdMap[e.underline_id] ?? e.underline_id,
    from: (e.users as unknown as DbUser)?.name ?? "?",
    text: e.text,
    isSameLine: !!e.is_same_line,
    myQuote: quoteMap[e.underline_id] ?? "",
    time: timeAgo(e.created_at),
    isNew: (Date.now() - new Date(e.created_at).getTime()) < 86400000, // < 24h
  }));
}

export async function fetchRecommendedUsers() {
  const { data } = await supabase
    .from("users")
    .select("*")
    .limit(5);

  return (data ?? []) as DbUser[];
}

export async function fetchNewLinesForOwnedBooks(userId: string) {
  // Get the user's books
  const { data: userBooks } = await supabase
    .from("user_books")
    .select("book_id")
    .eq("user_id", userId);

  if (!userBooks || userBooks.length === 0) return [];

  const bookIds = userBooks.map(ub => ub.book_id);

  const { data } = await supabase
    .from("underlines")
    .select(`*, users!underlines_user_id_fkey(*), books(*)`)
    .in("book_id", bookIds)
    .neq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []).map(u => ({
    quote: u.quote,
    userName: (u.users as unknown as DbUser)?.name ?? "?",
    bookTitle: (u.books as unknown as DbBook)?.title ?? "",
    bookAuthor: (u.books as unknown as DbBook)?.author ?? "",
    timestamp: timeAgo(u.created_at),
  }));
}

export async function createUserProfile(authId: string, name: string, handle: string, bio?: string) {
  const { data, error } = await supabase
    .from("users")
    .insert({
      id: authId,
      name,
      handle: handle.replace(/^@/, ""),
      bio: bio ?? "이듬에서 기록하는 사람",
    })
    .select()
    .single();

  if (error) {
    console.error("createUserProfile error:", error);
    return null;
  }
  return data as DbUser;
}

export async function updateUserProfile(userId: string, updates: { name?: string; handle?: string; bio?: string; avatar_emoji?: string; featured_line_id?: string | null; featured_weave_id?: string | null }) {
  const { error } = await supabase.from("users").update(updates).eq("id", userId);
  return !error;
}

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select(`
      id,
      type,
      read,
      created_at,
      underline_id,
      echo_id,
      actor:users!notifications_actor_id_fkey(id, name, handle),
      underlines!notifications_underline_id_fkey(short_id, users!underlines_user_id_fkey(handle))
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const typeTextMap: Record<string, (name: string) => string> = {
    echo: (name) => `${name}님이 당신의 한 줄에 댓글을 남겼어요`,
    like: (name) => `${name}님이 당신의 한 줄에 공감했어요`,
    follow: (name) => `${name}님이 당신의 한 줄을 읽기 시작했어요`,
    reply: (name) => `${name}님이 당신의 댓글에 답글을 남겼어요`,
  };

  return data.map((n: any) => {
    const actorName = n.actor?.name ?? "?";
    const getText = typeTextMap[n.type];
    return {
      id: n.id,
      text: getText ? getText(actorName) : `${actorName}님의 알림`,
      from: actorName,
      lineId: (n.underlines as any)?.short_id ?? n.underline_id,
      lineHandle: (n.underlines as any)?.users?.handle ?? "",
      time: timeAgo(n.created_at),
      isNew: !n.read,
      type: n.type,
    };
  });
}

export async function markNotificationsRead(userId: string) {
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
}

export async function fetchUserRank(userId: string): Promise<{ tier: string; percentile: number } | null> {
  const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true });
  if (!totalUsers) return null;

  const { data: allLines } = await supabase.from("underlines").select("user_id");
  const { data: allWeaves } = await supabase.from("weaves").select("user_id");

  const scores = new Map<string, number>();
  allLines?.forEach((l: any) => scores.set(l.user_id, (scores.get(l.user_id) || 0) + 2));
  allWeaves?.forEach((w: any) => scores.set(w.user_id, (scores.get(w.user_id) || 0) + 5));

  const myScore = scores.get(userId) || 0;
  const allScores = [...scores.values()].sort((a, b) => b - a);
  const myRank = allScores.findIndex(s => s <= myScore);
  const percentile = Math.round(((myRank + 1) / Math.max(allScores.length, 1)) * 100);

  let tier: string;
  if (percentile <= 5) tier = "깊이 남기는";
  else if (percentile <= 20) tier = "꾸준히 쌓는";
  else tier = "기록하는";

  return { tier, percentile };
}
