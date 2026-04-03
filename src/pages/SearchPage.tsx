import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchBooksAndLines, fetchPublicWeaves, searchUsers, type DbBook, type DbUser } from "../lib/api";
import { searchBooks, type BookSearchResult } from "../lib/bookSearch";
import { useAuth } from "../lib/AuthContext";
import { trackSearch, trackSearchClick } from "../lib/tracking";

type Tab = "all" | "lines" | "books" | "people" | "notes";

export function SearchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchQ, setSearchQ] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [submitted, setSubmitted] = useState(false);

  const [kakaoBooks, setKakaoBooks] = useState<BookSearchResult[]>([]);
  const [dbBooks, setDbBooks] = useState<DbBook[]>([]);
  const [lines, setLines] = useState<{ id: string; shortId: string; userId: string; userHandle: string; quote: string; bookTitle: string; bookAuthor: string }[]>([]);
  const [people, setPeople] = useState<DbUser[]>([]);
  const [notes, setNotes] = useState<{ id: string; shortId: string; title: string; userName: string; userHandle: string; coverColor: string }[]>([]);
  const [searching, setSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("eedeum_recent_search") || "[]"); } catch { return []; }
  });

  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setSubmitted(true);
    setSearching(true);

    const [kakao, db, users, weaves] = await Promise.all([
      searchBooks(q.trim()),
      searchBooksAndLines(q.trim()),
      searchUsers(q.trim()),
      fetchPublicWeaves(),
    ]);

    setKakaoBooks(kakao);
    setDbBooks(db.books);
    setLines(db.underlines);
    setPeople(users);

    const qLower = q.trim().toLowerCase();
    setNotes(
      weaves
        .filter((w: any) =>
          w.title.toLowerCase().includes(qLower) ||
          (w.description ?? "").toLowerCase().includes(qLower) ||
          (w.userName ?? "").toLowerCase().includes(qLower)
        )
        .slice(0, 10)
        .map((w: any) => ({ id: w.id, shortId: w.shortId, title: w.title, userName: w.userName, userHandle: w.userHandle, coverColor: w.coverColor }))
    );

    setSearching(false);

    // 최근 검색 저장
    const updated = [q.trim(), ...recentSearches.filter(r => r !== q.trim())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("eedeum_recent_search", JSON.stringify(updated));

    if (user) trackSearch(user.id, q, kakao.length + db.books.length + db.underlines.length + users.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(searchQ);
  };

  const goBook = (title: string, author: string) => {
    if (user) trackSearchClick(user.id, searchQ, "book", title);
    navigate(`/book/${encodeURIComponent(title)}`, { state: { author, from: "search" } });
  };

  const kakaoTitles = new Set(kakaoBooks.map(b => b.title.toLowerCase()));
  const allBooks = [...kakaoBooks.map(b => ({ title: b.title, author: b.author, isKakao: true })), ...dbBooks.filter(b => !kakaoTitles.has(b.title.toLowerCase())).map(b => ({ title: b.title, author: b.author, isKakao: false }))];

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "전체", count: allBooks.length + lines.length + people.length + notes.length },
    { key: "lines", label: "문장", count: lines.length },
    { key: "books", label: "책", count: allBooks.length },
    { key: "people", label: "사람", count: people.length },
    { key: "notes", label: "노트", count: notes.length },
  ];

  return (
    <div className="content-fade-in">
      <form className="search-header" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="search-input"
          placeholder="문장, 책, 사람, 노트 찾기"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />
        <button type="submit" className="search-submit" disabled={!searchQ.trim()}>검색</button>
        <button type="button" className="search-close" onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} aria-label="닫기">×</button>
      </form>

      {/* 검색 전: 최근 검색어 */}
      {!submitted && (
        <div className="search-recent">
          {recentSearches.length > 0 && (
            <>
              <div className="search-recent-label">최근 검색</div>
              {recentSearches.map((r, i) => (
                <button key={i} className="search-recent-item" onClick={() => { setSearchQ(r); doSearch(r); }}>
                  {r}
                </button>
              ))}
            </>
          )}
          {recentSearches.length === 0 && (
            <div className="search-hint">
              <div className="search-hint-text">책 제목, 작가, 문장, 사람을 검색해 보세요</div>
            </div>
          )}
        </div>
      )}

      {/* 검색 후: 탭 + 결과 */}
      {submitted && (
        <>
          <div className="search-tabs">
            {tabs.map(t => (
              <button
                key={t.key}
                className={`search-tab ${tab === t.key ? "on" : ""}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}{submitted && t.count > 0 && <span className="search-tab-count">{t.count}</span>}
              </button>
            ))}
          </div>

          <div className="search-results">
            {searching && <div className="empty-inline">찾는 중...</div>}

            {!searching && (
              <>
                {/* 문장 */}
                {(tab === "all" || tab === "lines") && lines.length > 0 && (
                  <div className="search-section">
                    {tab === "all" && <div className="search-section-label">문장</div>}
                    {lines.slice(0, tab === "all" ? 3 : 20).map((p, i) => (
                      <div key={i} className="search-row" onClick={() => {
                        if (p.userHandle && p.shortId) {
                          if (user) trackSearchClick(user.id, searchQ, "underline", p.id);
                          navigate(`/@${p.userHandle}/lines/${p.shortId}`);
                        } else {
                          goBook(p.bookTitle, p.bookAuthor);
                        }
                      }}>
                        <div className="search-row-quote">{p.quote}</div>
                        <div className="search-row-sub">{p.bookTitle} · {p.bookAuthor}</div>
                      </div>
                    ))}
                    {tab === "all" && lines.length > 3 && (
                      <button className="search-more" onClick={() => setTab("lines")}>문장 {lines.length}개 전체 보기</button>
                    )}
                  </div>
                )}

                {/* 책 */}
                {(tab === "all" || tab === "books") && allBooks.length > 0 && (
                  <div className="search-section">
                    {tab === "all" && <div className="search-section-label">책</div>}
                    {allBooks.slice(0, tab === "all" ? 4 : 20).map((b, i) => (
                      <div key={i} className="search-row" onClick={() => goBook(b.title, b.author)}>
                        <div className="search-row-title">{b.title}</div>
                        <div className="search-row-sub">{b.author}</div>
                      </div>
                    ))}
                    {tab === "all" && allBooks.length > 4 && (
                      <button className="search-more" onClick={() => setTab("books")}>책 {allBooks.length}개 전체 보기</button>
                    )}
                  </div>
                )}

                {/* 사람 */}
                {(tab === "all" || tab === "people") && people.length > 0 && (
                  <div className="search-section">
                    {tab === "all" && <div className="search-section-label">사람</div>}
                    {people.slice(0, tab === "all" ? 3 : 20).map((u) => (
                      <div key={u.id} className="search-row" onClick={() => navigate(`/@${u.handle}`)}>
                        <div className="search-row-person">
                          <span className="search-person-avatar">{u.avatar_emoji ?? "📖"}</span>
                          <span className="search-row-title">{u.name}</span>
                        </div>
                        <div className="search-row-sub">@{u.handle}</div>
                      </div>
                    ))}
                    {tab === "all" && people.length > 3 && (
                      <button className="search-more" onClick={() => setTab("people")}>사람 {people.length}명 전체 보기</button>
                    )}
                  </div>
                )}

                {/* 노트 */}
                {(tab === "all" || tab === "notes") && notes.length > 0 && (
                  <div className="search-section">
                    {tab === "all" && <div className="search-section-label">노트</div>}
                    {notes.slice(0, tab === "all" ? 3 : 20).map((n) => (
                      <div key={n.id} className="search-row" onClick={() => navigate(`/@${n.userHandle}/notes/${n.shortId}`)}>
                        <div className="search-row-note">
                          <span className="search-note-dot" style={{ background: n.coverColor }} />
                          <span className="search-row-title">{n.title}</span>
                        </div>
                        <div className="search-row-sub">{n.userName}</div>
                      </div>
                    ))}
                    {tab === "all" && notes.length > 3 && (
                      <button className="search-more" onClick={() => setTab("notes")}>노트 {notes.length}개 전체 보기</button>
                    )}
                  </div>
                )}

                {/* 결과 없음 */}
                {!searching && allBooks.length === 0 && lines.length === 0 && people.length === 0 && notes.length === 0 && (
                  <div className="empty-inline">결과가 없습니다</div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
