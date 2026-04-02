import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchBooksAndLines, type DbBook } from "../lib/api";
import { searchBooks, type BookSearchResult } from "../lib/bookSearch";

export function SearchPage() {
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState("");
  const [kakaoBooks, setKakaoBooks] = useState<BookSearchResult[]>([]);
  const [bookResults, setBookResults] = useState<DbBook[]>([]);
  const [lineResults, setUnderlineResults] = useState<{ quote: string; bookTitle: string; bookAuthor: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
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
    }, 300);
    return () => { mounted = false; clearTimeout(timer); };
  }, [searchQ]);

  const goBook = (title: string, author: string) => {
    navigate(`/book/${encodeURIComponent(title)}`, { state: { author } });
  };

  const kakaoTitles = new Set(kakaoBooks.map(b => b.title.toLowerCase()));
  const filteredDbBooks = bookResults.filter(b => !kakaoTitles.has(b.title.toLowerCase()));

  return (
    <div className="content-fade-in">
      <div className="search-header">
        <input
          ref={inputRef}
          className="search-input"
          placeholder="문장, 책, 사람 찾기"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />
        <button className="search-close" onClick={() => navigate(-1)} aria-label="닫기">×</button>
      </div>

      <div className="search-results">
        {!searchQ.trim() && (
          <div className="search-hint">
            <div className="search-hint-text">책 제목, 작가 이름, 또는 기억나는 문장을 입력해 보세요</div>
          </div>
        )}

        {searching && <div className="empty-inline">검색 중...</div>}

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
          <div className="empty-inline">검색 결과가 없습니다</div>
        )}
      </div>
    </div>
  );
}
