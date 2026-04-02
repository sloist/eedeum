import { supabase } from "../supabase";
import type { DbBook, DbUnderline, DbUser, FeedPost } from "./types";
import { mapLineToFeedPost } from "./helpers";
import { getCached, setCache } from "../cache";

export const EDITOR_USER_ID = "9b080172-cbfb-4181-bfcc-eb5c5b3931d9";

export async function fetchLineAsFeedPost(lineId: string): Promise<FeedPost | null> {
  const { data } = await supabase
    .from("underlines")
    .select(`
      *,
      users!underlines_user_id_fkey(*),
      books(*),
      echoes(*, users(*)),
      likes(count)
    `)
    .eq("id", lineId)
    .single();

  if (!data) return null;
  return mapLineToFeedPost(data as DbUnderline);
}

export async function fetchFeedPosts(): Promise<FeedPost[]> {
  const cached = getCached<FeedPost[]>("feed");
  if (cached) return cached;

  const { data, error } = await supabase
    .from("underlines")
    .select(`
      *,
      users!underlines_user_id_fkey(*),
      books(*),
      echoes(*, users(*)),
      likes(count),
      saves(count)
    `)
    .neq("user_id", EDITOR_USER_ID)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("fetchFeedPosts error:", error);
    return [];
  }

  const underlines = (data ?? []) as DbUnderline[];

  // Group underlines by book for "otherLines"
  const bookGroups: Record<string, DbUnderline[]> = {};
  for (const u of underlines) {
    const bookId = u.book_id;
    if (!bookGroups[bookId]) bookGroups[bookId] = [];
    bookGroups[bookId].push(u);
  }

  const result = underlines.map(u => {
    const siblings = (bookGroups[u.book_id] ?? []).filter(s => s.id !== u.id);
    const otherLines = siblings.slice(0, 3).map(s => ({
      userId: s.user_id,
      userName: s.users?.name ?? "?",
      quote: s.quote,
      page: s.page,
    }));
    return mapLineToFeedPost(u, otherLines);
  });

  setCache("feed", result, 60000);
  return result;
}

export async function fetchBookPosts(bookTitle: string): Promise<FeedPost[]> {
  const { data } = await supabase
    .from("underlines")
    .select(`
      *,
      users!underlines_user_id_fkey(*),
      books!inner(*),
      echoes(*, users(*)),
      likes(count)
    `)
    .eq("books.title", bookTitle)
    .order("created_at", { ascending: false });

  return (data ?? []).map(u => mapLineToFeedPost(u as DbUnderline));
}

export async function fetchDailyQuote() {
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("daily_quotes")
    .select(`
      *,
      underlines(*, users!underlines_user_id_fkey(*), books(*))
    `)
    .eq("display_date", today)
    .single();

  if (!data || !data.underlines) {
    // Fallback: deterministic daily pick based on date hash
    const { count } = await supabase
      .from("underlines")
      .select("*", { count: "exact", head: true });
    const total = count ?? 1;
    // Simple date-based hash: sum of char codes
    const dateHash = today.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const offset = dateHash % Math.max(total, 1);

    const { data: fallback } = await supabase
      .from("underlines")
      .select(`*, users!underlines_user_id_fkey(*), books(*)`)
      .order("created_at", { ascending: true })
      .range(offset, offset);

    if (!fallback || fallback.length === 0) return null;
    const u = fallback[0];
    return {
      quote: u.quote,
      bookTitle: (u.books as unknown as DbBook)?.title ?? "",
      bookAuthor: (u.books as unknown as DbBook)?.author ?? "",
    };
  }

  const u = data.underlines as unknown as DbUnderline;
  return {
    quote: u.quote,
    bookTitle: (u.books as unknown as DbBook)?.title ?? "",
    bookAuthor: (u.books as unknown as DbBook)?.author ?? "",
  };
}

export interface EditorialQuote {
  id: string;
  quote: string;
  feeling: string | null;
  bookTitle: string;
  bookAuthor: string;
}

export async function fetchEditorialPicks(): Promise<EditorialQuote[]> {
  // Get editor's records, pick 3 based on today's date
  const { data } = await supabase
    .from("underlines")
    .select("*, books(*)")
    .eq("user_id", EDITOR_USER_ID)
    .order("created_at", { ascending: true });

  if (!data || data.length === 0) return [];

  const today = new Date().toISOString().split("T")[0];
  const dateHash = today.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);

  // Pick 2 deterministically
  const picks: EditorialQuote[] = [];
  for (let i = 0; i < Math.min(2, data.length); i++) {
    const idx = (dateHash + i * 7) % data.length;
    const u = data[idx];
    const book = u.books as unknown as DbBook;
    picks.push({
      id: u.id,
      quote: u.quote,
      feeling: u.feeling,
      bookTitle: book?.title ?? "",
      bookAuthor: book?.author ?? "",
    });
  }
  return picks;
}

export async function fetchLineDetail(lineId: string): Promise<any | null> {
  const cacheKey = `feed:line:${lineId}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const { data: line } = await supabase
    .from("underlines")
    .select(`*, users!underlines_user_id_fkey(*), books(*)`)
    .eq("id", lineId)
    .single();

  if (!line) return null;

  const user = line.users as DbUser;
  const book = line.books as DbBook;

  // Fetch echoes
  const { data: echoes } = await supabase
    .from("echoes")
    .select(`*, users!echoes_user_id_fkey(*)`)
    .eq("underline_id", lineId)
    .order("created_at", { ascending: true });

  // Fetch like count
  const { count: likeCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("underline_id", lineId);

  // Fetch other lines from same book
  const { data: otherLines } = await supabase
    .from("underlines")
    .select(`*, users!underlines_user_id_fkey(*)`)
    .eq("book_id", book.id)
    .neq("id", lineId)
    .order("page", { ascending: true })
    .limit(5);

  const result = {
    id: line.id,
    userId: user?.id ?? "",
    userName: user?.name ?? "?",
    userAvatar: user?.avatar_emoji ?? "📖",
    userHandle: user?.handle ?? "",
    quote: line.quote,
    page: line.page,
    feeling: line.feeling,
    bookId: book?.id ?? "",
    bookTitle: book?.title ?? "",
    bookAuthor: book?.author ?? "",
    coverColor: book?.cover_color ?? "#8B7355",
    feelingPrivate: line.feeling_private ?? false,
    likes: likeCount ?? 0,
    createdAt: line.created_at,
    echoes: (echoes ?? []).map(e => ({
      id: e.id,
      userId: e.user_id,
      userName: (e.users as DbUser)?.name ?? "?",
      text: e.text,
      isSameLine: e.is_same_line,
      parentId: e.parent_id ?? null,
      pinned: e.pinned ?? false,
    })),
    otherLines: (otherLines ?? []).map(o => ({
      id: o.id,
      userId: o.user_id,
      userName: (o.users as DbUser)?.name ?? "?",
      quote: o.quote,
      page: o.page,
    })),
  };

  setCache(cacheKey, result, 30000);
  return result;
}

/** 같은 한줄, 다른 시선 — 같은 quote를 기록한 다른 사용자의 감상 */
export async function fetchSameQuoteLines(quote: string, excludeLineId: string): Promise<{ id: string; userId: string; userName: string; feeling: string | null }[]> {
  const { data } = await supabase
    .from("underlines")
    .select(`id, user_id, feeling, users!underlines_user_id_fkey(name)`)
    .eq("quote", quote)
    .neq("id", excludeLineId)
    .limit(10);

  if (!data) return [];
  return data.map((d: any) => ({
    id: d.id,
    userId: d.user_id,
    userName: (d.users as DbUser)?.name ?? "?",
    feeling: d.feeling,
  }));
}

export async function fetchDiscoverQuotes(topic?: string) {
  let query = supabase
    .from("underlines")
    .select(`*, users!underlines_user_id_fkey(*), books(*)`)
    .order("created_at", { ascending: false })
    .limit(30);

  if (topic) {
    // Filter by book topic
    const { data: topicBooks } = await supabase
      .from("books")
      .select("id")
      .contains("topics", [topic]);
    if (topicBooks && topicBooks.length > 0) {
      query = query.in("book_id", topicBooks.map(b => b.id));
    }
  }

  const { data } = await query;
  return (data ?? []).map(u => ({
    id: u.id,
    quote: u.quote,
    feeling: u.feeling,
    userName: (u.users as any)?.name ?? "?",
    userId: u.user_id,
    bookTitle: (u.books as any)?.title ?? "",
    bookAuthor: (u.books as any)?.author ?? "",
    coverColor: (u.books as any)?.cover_color ?? "#8B7355",
  }));
}

export async function fetchRandomBookWithRecords() {
  const { data: books } = await supabase
    .from("books")
    .select("id, title, author, cover_color");

  if (!books || books.length === 0) return null;

  const book = books[Math.floor(Math.random() * books.length)];

  const { data: underlines } = await supabase
    .from("underlines")
    .select("id, quote, feeling, users!underlines_user_id_fkey(name)")
    .eq("book_id", book.id)
    .order("created_at", { ascending: false })
    .limit(3);

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverColor: book.cover_color ?? "#7B6548",
    records: (underlines ?? []).map((u: any) => ({
      id: u.id,
      quote: u.quote.length > 80 ? u.quote.slice(0, 80) + "..." : u.quote,
      feeling: u.feeling,
      userName: (u.users as any)?.name ?? "?",
    })),
  };
}
