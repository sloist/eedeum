import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchBooksAndLines, fetchPublicWeaves, type DbBook } from "../lib/api";
import { searchBooks, type BookSearchResult } from "../lib/bookSearch";
import { useAuth } from "../lib/AuthContext";
import { trackSearch, trackSearchClick } from "../lib/tracking";

export function SearchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const scope = params.get("scope"); // "notes" or null (= global)
  const isNotesScope = scope === "notes";

  const [searchQ, setSearchQ] = useState("");
  const [kakaoBooks, setKakaoBooks] = useState<BookSearchResult[]>([]);
  const [bookResults, setBookResults] = useState<DbBook[]>([]);
  const [lineResults, setUnderlineResults] = useState<{ quote: string; bookTitle: string; bookAuthor: string }[]>([]);
  const [noteResults, setNoteResults] = useState<{ id: string; title: string; userName: string; coverColor: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // 전역 검색
  useEffect(() => {
    if (isNotesScope) return;
    if (!searchQ.trim()) { setKakaoBooks([]); setBookResults([]); setUnderlineResults([]); return; }
    let mounted = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      const [kakao, db] = await Promise.all([
        searchBooks(searchQ.trim()),
        searchBooksAndLines(searchQ.trim()),
      ]);
      if (!mounted) return;
      setKakaoBooks(kakao);
      setBookResults(db.books);
      setUnderlineResults(db.underlines);
      setSearching(false);
      if (user) {
        trackSearch(user.id, searchQ, kakao.length + db.books.length + db.underlines.length);
      }
    }, 300);
    return () => { mounted = false; clearTimeout(timer); };
  }, [searchQ, isNotesScope]);

  // 노트 검색
  useEffect(() => {
    if (!isNotesScope) return;
    if (!searchQ.trim()) { setNoteResults([]); return; }
    let mounted = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      const weaves = await fetchPublicWeaves();
      if (!mounted) return;
      const q = searchQ.trim().toLowerCase();
      const filtered = weaves
        .filter((w: any) =>
          w.title.toLowerCase().includes(q) ||
          (w.description ?? "").toLowerCase().includes(q) ||
          (w.userName ?? "").toLowerCase().includes(q)
        )
        .slice(0, 10)
        .map((w: any) => ({ id: w.id, title: w.title, userName: w.userName, coverColor: w.coverColor }));
      setNoteResults(filtered);
      setSearching(false);
    }, 300);
    return () => { mounted = false; clearTimeout(timer); };
  }, [searchQ, isNotesScope]);

  const goBook = (title: string, author: string, position?: number) => {
    if (user) {
      trackSearchClick(user.id, searchQ, "book", title, position);
    }
    navigate(`/book/${encodeURIComponent(title)}`, { state: { author, from: "search" } });
  };

  const kakaoTitles = new Set(kakaoBooks.map(b => b.title.toLowerCase()));
  const filteredDbBooks = bookResults.filter(b => !kakaoTitles.has(b.title.toLowerCase()));

  const placeholder = isNotesScope ? "노트 찾기" : "문장, 책, 사람 찾기";
  const hint = isNotesScope
    ? "노트 제목이나 작성자를 입력해 보세요"
    : "책 제목, 작가 이름, 또는 기억나는 문장을 입력해 보세요";

  return (
    <div className="content-fade-in">
      <div className="search-header">
        <input
          ref={inputRef}
          className="search-input"
          placeholder={placeholder}
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />
        <button className="search-close" onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} aria-label="닫기">×</button>
      </div>

      <div className="search-results">
        {!searchQ.trim() && (
          <div className="search-hint">
            <div className="search-hint-text">{hint}</div>
          </div>
        )}

        {searching && <div className="empty-inline">찾는 중...</div>}

        {/* ─── 전역 검색 결과 ─── */}
        {!isNotesScope && (
          <>
            {kakaoBooks.length > 0 && (
              <>
                <div className="sh"><span className="sl">책</span></div>
                {kakaoBooks.slice(0, 6).map((b, i) => (
                  <div key={`k-${i}`} className="search-row" onClick={() => goBook(b.title, b.author)}>
                    <div className="search-row-title">{b.title}</div>
                    <div className="search-row-sub">{b.author}</div>
                  </div>
                ))}
              </>
            )}

            {filteredDbBooks.length > 0 && (
              <>
                {kakaoBooks.length === 0 && <div className="sh"><span className="sl">책</span></div>}
                {filteredDbBooks.map((b, i) => (
                  <div key={`d-${i}`} className="search-row" onClick={() => goBook(b.title, b.author)}>
                    <div className="search-row-title">{b.title}</div>
                    <div className="search-row-sub">{b.author}</div>
                  </div>
                ))}
              </>
            )}

            {lineResults.length > 0 && (
              <>
                <div className="sh"><span className="sl">문장</span></div>
                {lineResults.slice(0, 6).map((p, i) => (
                  <div key={`u-${i}`} className="search-row" onClick={() => goBook(p.bookTitle, p.bookAuthor)}>
                    <div className="search-row-quote">{p.quote}</div>
                    <div className="search-row-sub">{p.bookTitle} · {p.bookAuthor}</div>
                  </div>
                ))}
              </>
            )}

            {searchQ.trim() && !searching && kakaoBooks.length === 0 && bookResults.length === 0 && lineResults.length === 0 && (
              <div className="empty-inline">결과가 없습니다</div>
            )}
          </>
        )}

        {/* ─── 노트 검색 결과 ─── */}
        {isNotesScope && (
          <>
            {noteResults.length > 0 && (
              <>
                <div className="sh"><span className="sl">노트</span></div>
                {noteResults.map((n) => (
                  <div key={n.id} className="search-row" onClick={() => navigate(`/weave/${n.id}`)}>
                    <div className="search-row-note">
                      <span className="search-note-dot" style={{ background: n.coverColor }} />
                      <span className="search-row-title">{n.title}</span>
                    </div>
                    <div className="search-row-sub">{n.userName}</div>
                  </div>
                ))}
              </>
            )}

            {searchQ.trim() && !searching && noteResults.length === 0 && (
              <div className="empty-inline">결과가 없습니다</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
