// ─── Types ───────────────────────────────────────────

export interface DbUser {
  id: string;
  name: string;
  avatar_emoji: string | null;
  handle: string;
  bio: string | null;
  created_at: string;
}

export interface DbBook {
  id: string;
  title: string;
  author: string;
  cover_color: string | null;
  topics: string[] | null;
  created_at: string;
}

export interface DbEcho {
  id: string;
  underline_id: string;
  user_id: string;
  text: string;
  is_same_line: boolean;
  created_at: string;
  users?: DbUser;
}

export interface DbUnderline {
  id: string;
  short_id: string;
  user_id: string;
  book_id: string;
  quote: string;
  page: number;
  feeling: string | null;
  photo_url: string | null;
  created_at: string;
  users?: DbUser;
  books?: DbBook;
  echoes?: DbEcho[];
  likes?: { count: number }[];
  saves?: { count: number }[];
  repost_id?: string | null;
  repost?: {
    id: string;
    user_id: string;
    users?: DbUser;
  } | null;
}

export interface FeedPost {
  id: string;
  shortId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userHandle: string;
  book: { title: string; author: string; page: number };
  bookId: string;
  quote: string;
  feeling: string;
  coverColor: string;
  timestamp: string;
  likes: number;
  topic: string;
  echoes: { userId: string; userName: string; text: string; isSameLine: boolean }[];
  otherLines: { userId: string; userName: string; quote: string; page: number }[];
  sameLineCount: number;
  repostOf?: {
    id: string;
    userName: string;
    userHandle: string;
  } | null;
}
