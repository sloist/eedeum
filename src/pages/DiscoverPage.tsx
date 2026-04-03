import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingBar } from "../components/LoadingBar";
import { TOPICS } from "../data";
import { fetchBooks, searchBooksAndLines, type DbBook } from "../lib/api";
import { searchBooks, type BookSearchResult } from "../lib/bookSearch";

interface BookRow {
  id: string;
  title: string;
  author: string;
  cover_color: string | null;
  topics: string[] | null;
  lines: number;
  uniqueReaders: number;
  topQuotes: { id: string; shortId: string; quote: string }[];
}

export function DiscoverPage() {
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchQ, setSearchQ] = useState("");
  const [kakaoBooks, setKakaoBooks] = useState<BookSearchResult[]>([]);
  const [bookResults, setBookResults] = useState<DbBook[]>([]);
  const [lineResults, setUnderlineResults] = useState<{ quote: string; bookTitle: string; bookAuthor: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchBooks(topicFilter ?? undefined).then(data => {
      if (!mounted) return;
      setBooks(
        (data as BookRow[])
          .filter(b => b.topQuotes && b.topQuotes.length > 0)
          .sort((a, b) => {
            // Deterministic daily shuffle — not ranking
            const day = new Date().getDate();
            const ha = (a.id.charCodeAt(0) + day) % 100;
            const hb = (b.id.charCodeAt(0) + day) % 100;
            return ha - hb;
          })
      );
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [topicFilter]);

  useEffect(() => {
    if (!searchQ.trim()) { setKakaoBooks([]); setBookResults([]); setUnderlineResults([]); return; }
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

  const onBook = (title: string, author: string) => {
    navigate(`/book/${encodeURIComponent(title)}`, { state: { author } });
  };

  const isSearching = searchQ.trim().length > 0;
  const kakaoTitles = new Set(kakaoBooks.map(b => b.title.toLowerCase()));
  const filteredDbBooks = bookResults.filter(b => !kakaoTitles.has(b.title.toLowerCase()));

  return (
    <>
      <div className="discover-search-bar">
        <input
          ref={searchRef}
          className="dsinp"
          placeholder="책 제목, 작가, 문장으로 검색"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />
        {isSearching && (
          <button className="srccan discover-cancel" onClick={() => { setSearchQ(""); searchRef.current?.blur(); }}>취소</button>
        )}
      </div>

      {isSearching ? (
        <div className="discover-search-results">
          {searching && <div className="empty-inline">검색 중...</div>}
          {kakaoBooks.length > 0 && (
            <>
              <div className="sh"><span className="sl">책</span></div>
              {kakaoBooks.slice(0, 8).map((b, i) => (
                <div key={`kakao-${i}`} className="brow" onClick={() => onBook(b.title, b.author)}>
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
              {kakaoBooks.length > 0 && <div className="sh"><span className="sl">서재의 책</span></div>}
              {filteredDbBooks.map((b, i) => (
                <div key={`db-${i}`} className="brow" onClick={() => onBook(b.title, b.author)}>
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
                <div key={i} className="brow" onClick={() => onBook(p.bookTitle, p.bookAuthor)}>
                  <div className="binf">
                    <div className="bint" style={{ fontFamily: "var(--sf)" }}>"{p.quote}"</div>
                    <div className="bina">{p.bookTitle} · {p.bookAuthor}</div>
                  </div>
                </div>
              ))}
            </>
          )}
          {!searching && kakaoBooks.length === 0 && bookResults.length === 0 && lineResults.length === 0 && (
            <div className="empty-inline">검색 결과가 없습니다</div>
          )}
        </div>
      ) : (
        <>
          <div className="sh"><span className="sl">주제로 찾기</span></div>
          <div className="topic-grid">
            {TOPICS.map((t, i) => (
              <div key={i} className={`topic-grid-item ${topicFilter === t.label ? "on" : ""}`} onClick={() => setTopicFilter(topicFilter === t.label ? null : t.label)}>
                <span>{t.emoji}</span><span>{t.label}</span>
              </div>
            ))}
          </div>

          <div className="sh">
            <span className="sl">{topicFilter ? `'${topicFilter}' 관련 문장` : "사람들이 멈춘 곳"}</span>
          </div>
          {loading ? (
            <LoadingBar />
          ) : (
            <div className="dsc-flow content-fade-in">
              {books.map((b, i) => (
                <div key={i} className="dsc-cluster">
                  {b.topQuotes.map((q, qi) => (
                    <div key={qi} className="dsc-q" onClick={() => navigate(`/line/${q.shortId}`)}>
                      <div className="dsc-q-text">{q.quote}</div>
                    </div>
                  ))}
                  <div className="dsc-q-from" onClick={() => onBook(b.title, b.author)}>
                    {b.title} · {b.author}
                  </div>
                </div>
              ))}
              {books.length === 0 && (
                <div className="empty-cta">
                  <div className="empty-cta-text">아직 기록된 문장이 없습니다</div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
