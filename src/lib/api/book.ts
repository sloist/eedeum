import { supabase } from "../supabase";
import type { DbBook, DbUser } from "./types";

export async function fetchBooks(topicFilter?: string) {
  let query = supabase.from("books").select("*");
  if (topicFilter) {
    query = query.contains("topics", [topicFilter]);
  }
  const { data } = await query.order("created_at", { ascending: false });

  const books = (data ?? []) as DbBook[];

  // Get underline counts and unique readers for each book
  const bookIds = books.map(b => b.id);
  const countsMap: Record<string, number> = {};
  const readersMap: Record<string, Set<string>> = {};

  const quotesMap: Record<string, { id: string; shortId: string; quote: string; likes: number }[]> = {};

  if (bookIds.length > 0) {
    const { data: countData } = await supabase
      .from("underlines")
      .select("id, short_id, book_id, user_id, quote, likes(count)")
      .in("book_id", bookIds);

    for (const row of (countData ?? []) as any[]) {
      countsMap[row.book_id] = (countsMap[row.book_id] ?? 0) + 1;
      if (!readersMap[row.book_id]) readersMap[row.book_id] = new Set();
      readersMap[row.book_id].add(row.user_id);
      if (!quotesMap[row.book_id]) quotesMap[row.book_id] = [];
      quotesMap[row.book_id].push({
        id: row.id,
        shortId: row.short_id,
        quote: row.quote,
        likes: row.likes?.[0]?.count ?? 0,
      });
    }
  }

  // Sort quotes by likes desc, take top 3
  for (const bookId in quotesMap) {
    quotesMap[bookId].sort((a, b) => b.likes - a.likes);
    quotesMap[bookId] = quotesMap[bookId].slice(0, 3);
  }

  return books.map(b => ({
    ...b,
    lines: countsMap[b.id] ?? 0,
    uniqueReaders: readersMap[b.id]?.size ?? 0,
    topQuotes: (quotesMap[b.id] ?? []).map(q => ({ id: q.id, shortId: q.shortId, quote: q.quote })),
  }));
}

export async function fetchBookDetail(title: string) {
  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("title", title)
    .limit(1);
  const book = books?.[0] ?? null;

  if (!book) return null;

  const { data: underlines } = await supabase
    .from("underlines")
    .select(`*, users!underlines_user_id_fkey(*), echoes(count)`)
    .eq("book_id", book.id)
    .order("page", { ascending: true });

  return {
    book: book as DbBook,
    lines: (underlines ?? []).map(u => ({
      id: u.id,
      shortId: u.short_id,
      userId: u.user_id,
      userName: (u.users as DbUser)?.name ?? "?",
      quote: u.quote,
      page: u.page,
      feeling: u.feeling ?? undefined,
      createdAt: u.created_at ?? undefined,
      echoCount: (u.echoes as unknown as { count: number }[])?.[0]?.count ?? 0,
    })),
  };
}

export async function searchBooksAndLines(query: string) {
  const q = `%${query}%`;

  const [{ data: books }, { data: underlines }] = await Promise.all([
    supabase.from("books").select("*").or(`title.ilike.${q},author.ilike.${q}`).limit(10),
    supabase.from("underlines").select(`*, books(*)`).ilike("quote", q).limit(10),
  ]);

  return {
    books: (books ?? []) as DbBook[],
    underlines: (underlines ?? []).map(u => ({
      quote: u.quote,
      bookTitle: (u.books as unknown as DbBook)?.title ?? "",
      bookAuthor: (u.books as unknown as DbBook)?.author ?? "",
    })),
  };
}

export async function findOrCreateBook(title: string, author: string, coverColor?: string) {
  // Try to find existing
  const { data: existing } = await supabase
    .from("books")
    .select("*")
    .eq("title", title)
    .eq("author", author)
    .maybeSingle();

  if (existing) return existing as DbBook;

  // Create new
  const colors = ["#8B7355", "#6B5B4A", "#5A6B55", "#4A5A6B", "#7B5A6B", "#6B5A7B"];
  const color = coverColor || colors[Math.floor(Math.random() * colors.length)];

  const { data, error } = await supabase
    .from("books")
    .insert({ title, author, cover_color: color })
    .select()
    .single();

  if (error) {
    console.error("findOrCreateBook error:", error);
    return null;
  }
  return data as DbBook;
}

export async function addUserBook(userId: string, bookId: string, status: string) {
  const { error } = await supabase
    .from("user_books")
    .insert({ user_id: userId, book_id: bookId, status });

  if (error) console.error("addUserBook error:", error);
  return !error;
}

export async function removeUserBook(userId: string, bookId: string) {
  const { error } = await supabase
    .from("user_books")
    .delete()
    .eq("user_id", userId)
    .eq("book_id", bookId);

  if (error) console.error("removeUserBook error:", error);
  return !error;
}
