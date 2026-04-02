// ─────────────────────────────────────────────
// TYPES — kept for backward compat with components
// ─────────────────────────────────────────────

export interface User {
  id?: string;
  name: string;
  avatar: string;
  handle: string;
  bio: string;
  books: number;
  lines: number;
  followers: number;
  following: number;
}

export interface Book {
  id?: string;
  title: string;
  author: string;
  lines?: number;
  readers?: number;
  color?: string;
  topics?: string[];
}

export interface OtherLine {
  userId: string;
  userName?: string;
  quote: string;
  page: number;
}

export interface Echo {
  userId: string;
  userName?: string;
  text: string;
  isSameLine?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  userHandle?: string;
  book: { title: string; author: string; page: number };
  bookId?: string;
  quote: string;
  feeling: string;
  coverColor: string;
  timestamp: string;
  likes: number;
  topic: string;
  echoes: Echo[];
  otherLines: OtherLine[];
  sameLineCount?: number;
}

export interface OwnedBook {
  bookId?: string;
  title: string;
  author: string;
  color: string;
  status: 'reading' | 'owned' | 'finished';
}

export interface MoumSavedItem {
  quote: string;
  book: string;
  author: string;
  savedAt: string;
}

export interface MoumEchoItem {
  from: string;
  text: string;
  myQuote: string;
  time: string;
  isNew: boolean;
}

export interface Topic {
  emoji: string;
  label: string;
  color: string;
}

export interface ShelfBook {
  title: string;
  lines: number;
  color: string;
}

// ─────────────────────────────────────────────
// CONSTANTS (not in DB)
// ─────────────────────────────────────────────

export const TOPICS: Topic[] = [
  { emoji: "🌱", label: "성장", color: "#5A6B55" },
  { emoji: "💌", label: "사랑", color: "#7B5A6B" },
  { emoji: "🤲", label: "위로", color: "#6B5A4A" },
  { emoji: "🔮", label: "철학", color: "#5A5A7B" },
  { emoji: "✈️", label: "여행", color: "#4A6B7B" },
  { emoji: "🤝", label: "관계", color: "#7B6B5A" },
  { emoji: "🎨", label: "예술", color: "#6B4A5A" },
  { emoji: "🧠", label: "심리", color: "#5A6B6B" },
  { emoji: "💡", label: "자기계발", color: "#6B6555" },
];

// Removed: quick reaction chips no longer used
// export const ECHO_CHIPS = ["나도 여기에 밑줄", "이 문장 앞에서 멈춤", "오래 남을 것 같은", "꺼내 읽게 되는"];
