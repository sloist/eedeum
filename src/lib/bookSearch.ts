export interface BookSearchResult {
  title: string;
  author: string;
  publisher?: string;
  thumbnail?: string;
  isbn?: string;
  coverColor?: string;
}

// Kakao Book Search API
const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY || "";

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  if (!query.trim()) return [];

  // If Kakao API key is available, use it
  if (KAKAO_REST_KEY) {
    try {
      const res = await fetch(
        `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=15`,
        { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
      );
      if (res.ok) {
        const data = await res.json();
        return data.documents.map((doc: any) => ({
          title: doc.title,
          author: (doc.authors || []).join(", "),
          publisher: doc.publisher,
          thumbnail: doc.thumbnail,
          isbn: doc.isbn,
          coverColor: generateColorFromTitle(doc.title),
        }));
      }
    } catch (e) {
      console.warn("Kakao API failed, falling back to local search");
    }
  }

  // Fallback: return empty, let caller fall back to existing search
  return [];
}

// Generate a warm color from book title (deterministic)
export function generateColorFromTitle(title: string): string {
  const colors = [
    "#8B7355", "#6B5B4A", "#6B5A7B", "#4A5A6B", "#5A6B55",
    "#8B7B55", "#5A6B6B", "#7B5A5A", "#6B6B5A", "#5A5A7B",
    "#4A6B5A", "#7B6B4A", "#4A5A7B", "#7B5A7B", "#6B5A5A", "#5A7B6B",
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i);
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
}
