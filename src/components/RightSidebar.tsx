import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "./Icons";
import { useEffect, useState, useRef } from "react";
import { fetchBooks, fetchPublicWeaves, fetchDailyQuote, fetchRediscovery } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

export function RightSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isWeaves = location.pathname.startsWith("/notes") || location.pathname.startsWith("/notes/");

  const [searchQ, setSearchQ] = useState("");
  const [rediscovery, setRediscovery] = useState<{ quote: string; bookTitle: string; bookAuthor: string; shortId: string; handle: string; createdAt: string } | null>(null);
  const [searchResults, setSearchResults] = useState<{ title: string; author: string }[]>([]);
  const [noteResults, setNoteResults] = useState<{ id: string; shortId: string; userHandle: string; title: string; userName: string }[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [dailyQuote, setDailyQuote] = useState<{ quote: string; bookTitle: string; bookAuthor: string } | null>(null);

  // 탭 변경 시 검색 초기화
  useEffect(() => {
    setSearchQ("");
    setSearchResults([]);
    setNoteResults([]);
  }, [isWeaves]);

  // 오늘의 문장
  useEffect(() => {
    fetchDailyQuote().then(q => setDailyQuote(q));
  }, []);

  // 다시 만난 문장
  useEffect(() => {
    if (!user) return;
    fetchRediscovery(user.id).then(r => setRediscovery(r));
  }, [user]);

  // 책/문장 검색 (한줄 탭 등)
  useEffect(() => {
    if (isWeaves) return;
    if (!searchQ.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      const books = await fetchBooks();
      const q = searchQ.toLowerCase();
      setSearchResults(
        books
          .filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
          .slice(0, 5)
          .map(b => ({ title: b.title, author: b.author }))
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ, isWeaves]);

  // 노트 검색 (노트 탭)
  useEffect(() => {
    if (!isWeaves) return;
    if (!searchQ.trim()) { setNoteResults([]); return; }
    const timer = setTimeout(async () => {
      const weaves = await fetchPublicWeaves();
      const q = searchQ.trim().toLowerCase();
      setNoteResults(
        weaves
          .filter((w: any) =>
            w.title.toLowerCase().includes(q) ||
            (w.description ?? "").toLowerCase().includes(q) ||
            (w.userName ?? "").toLowerCase().includes(q)
          )
          .slice(0, 6)
          .map((w: any) => ({ id: w.id, shortId: w.shortId, userHandle: w.userHandle, title: w.title, userName: w.userName }))
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ, isWeaves]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showBookDropdown = !isWeaves && searchFocused && searchResults.length > 0;
  const showNoteDropdown = isWeaves && searchFocused && noteResults.length > 0;

  return (
    <aside className="right-sidebar">
      <div className="rs-search" ref={searchRef}>
        <Icons.Search />
        <input
          className="rs-search-input"
          type="text"
          placeholder={isWeaves ? "노트 검색" : "책, 작가, 문장 검색"}
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          onFocus={() => setSearchFocused(true)}
        />
        {showBookDropdown && (
          <div className="rs-search-dropdown">
            {searchResults.map((b, i) => (
              <div
                key={i}
                className="rs-search-item"
                onClick={() => {
                  navigate(`/book/${encodeURIComponent(b.title)}`, { state: { author: b.author } });
                  setSearchQ("");
                  setSearchFocused(false);
                }}
              >
                <span className="rs-search-item-title">{b.title}</span>
                <span className="rs-search-item-author">{b.author}</span>
              </div>
            ))}
          </div>
        )}
        {showNoteDropdown && (
          <div className="rs-search-dropdown">
            {noteResults.map((n) => (
              <div
                key={n.id}
                className="rs-search-item"
                onClick={() => {
                  navigate(`/@${n.userHandle}/notes/${n.shortId}`);
                  setSearchQ("");
                  setSearchFocused(false);
                }}
              >
                <span className="rs-search-item-title">{n.title}</span>
                <span className="rs-search-item-author">{n.userName}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {dailyQuote && (
        <div className="rs-daily">
          <div className="rs-daily-quote">{dailyQuote.quote.length > 60 ? dailyQuote.quote.slice(0, 60) + "…" : dailyQuote.quote}</div>
          <div className="rs-daily-src">{dailyQuote.bookTitle} · {dailyQuote.bookAuthor}</div>
        </div>
      )}

      {rediscovery && (
        <div className="rs-rediscovery" onClick={() => navigate(`/@${rediscovery.handle}/lines/${rediscovery.shortId}`)}>
          <div className="rs-rediscovery-label">다시 만난 문장</div>
          <div className="rs-rediscovery-quote">{rediscovery.quote.length > 50 ? rediscovery.quote.slice(0, 50) + "…" : rediscovery.quote}</div>
          <div className="rs-rediscovery-src">{rediscovery.bookTitle} · {rediscovery.bookAuthor}</div>
        </div>
      )}

      <div className="rs-footer">
        <div className="rs-copyright">
          © 2026 이듬
        </div>
      </div>
    </aside>
  );
}
