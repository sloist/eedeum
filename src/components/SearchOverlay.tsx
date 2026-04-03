import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchBooksAndLines, type DbBook } from "../lib/api";
import { searchBooks, type BookSearchResult } from "../lib/bookSearch";

interface SearchOverlayProps {
  onClose: () => void;
}

export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [searchQ, setSearchQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [kakaoBooks, setKakaoBooks] = useState<BookSearchResult[]>([]);
  const [bookResults, setBookResults] = useState<DbBook[]>([]);
  const [lineResults, setUnderlineResults] = useState<{ quote: string; bookTitle: string; bookAuthor: string }[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!searchQ.trim()) {
      setKakaoBooks([]);
      setBookResults([]);
      setUnderlineResults([]);
      return;
    }
    let mounted = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      const [kakaoResults, supabaseResults] = await Promise.all([
        searchBooks(searchQ.trim()),
        searchBooksAndLines(searchQ.trim()),
      ]);
      if (!mounted) return;
      setKakaoBooks(kakaoResults);
      setBookResults(supabaseResults.books);
      setUnderlineResults(supabaseResults.underlines);
      setSearching(false);
    }, 300);
    return () => { mounted = false; clearTimeout(timer); };
  }, [searchQ]);

  const goBook = (title: string, author: string) => {
    navigate(`/book/${encodeURIComponent(title)}`, { state: { author } });
    onClose();
  };

  // Deduplicate: remove Supabase books that also appear in Kakao results
  const kakaoTitles = new Set(kakaoBooks.map(b => b.title.toLowerCase()));
  const filteredDbBooks = bookResults.filter(b => !kakaoTitles.has(b.title.toLowerCase()));

  return (
    <div className="srcov">
      <div className="srcbar">
        <input ref={searchRef} placeholder="책, 작가, 문장 검색" value={searchQ} onChange={e => setSearchQ(e.target.value)} autoFocus />
        <button className="srccan" onClick={onClose}>취소</button>
      </div>
      <div className="srcres">
        {!searchQ.trim() && (
          <div style={{ padding: 20 }}>
            <div className="sl" style={{ marginBottom: 12 }}>인기 검색어</div>
            {["한강", "데미안", "위로", "아몬드", "여행"].map((w, i) => (
              <div key={i} className="brow" onClick={() => setSearchQ(w)} style={{ padding: "10px 20px" }}>
                <span style={{ fontSize: 13, color: "var(--t2)" }}>{i + 1}. {w}</span>
              </div>
            ))}
          </div>
        )}
        {searching && searchQ.trim() && (
          <div className="empty-inline">검색 중...</div>
        )}
        {kakaoBooks.length > 0 && (
          <>
            <div className="sh"><span className="sl">책</span></div>
            {kakaoBooks.slice(0, 8).map((b, i) => (
              <div key={`kakao-${i}`} className="brow" onClick={() => goBook(b.title, b.author)}>
                {b.thumbnail ? (
                  <img src={b.thumbnail} alt="" style={{ width: 36, height: 52, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                ) : (
                  <div className="bcov" style={{ background: b.coverColor ?? "#8B7355" }}><span className="bcovl">{b.title}</span></div>
                )}
                <div className="binf">
                  <div className="bint">{b.title}</div>
                  <div className="bina">{b.author}{b.publisher ? ` · ${b.publisher}` : ""}</div>
                </div>
              </div>
            ))}
          </>
        )}
        {filteredDbBooks.length > 0 && (
          <>
            {kakaoBooks.length === 0 && <div className="sh"><span className="sl">책</span></div>}
            {kakaoBooks.length > 0 && filteredDbBooks.length > 0 && <div className="sh"><span className="sl">서재의 책</span></div>}
            {filteredDbBooks.map((b, i) => (
              <div key={`db-${i}`} className="brow" onClick={() => goBook(b.title, b.author)}>
                <div className="bcov" style={{ background: b.cover_color ?? "#8B7355" }}><span className="bcovl">{b.title}</span></div>
                <div className="binf"><div className="bint">{b.title}</div><div className="bina">{b.author}</div></div>
              </div>
            ))}
          </>
        )}
        {lineResults.length > 0 && (
          <>
            <div className="sh"><span className="sl">기록</span></div>
            {lineResults.slice(0, 4).map((p, i) => (
              <div key={i} className="brow" onClick={() => goBook(p.bookTitle, p.bookAuthor)}>
                <div className="binf">
                  <div className="bint" style={{ fontFamily: "var(--sf)" }}>"{p.quote}"</div>
                  <div className="bina">{p.bookTitle} · {p.bookAuthor}</div>
                </div>
              </div>
            ))}
          </>
        )}
        {searchQ.trim() && !searching && kakaoBooks.length === 0 && bookResults.length === 0 && lineResults.length === 0 && (
          <div className="empty-inline">검색 결과가 없습니다</div>
        )}
      </div>
    </div>
  );
}
