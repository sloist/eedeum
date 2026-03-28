import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ALL_BOOKS, POSTS } from "../data";

interface SearchOverlayProps {
  onClose: () => void;
}

export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [searchQ, setSearchQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const searchResults = searchQ.trim() ? ALL_BOOKS.filter(b => b.title.includes(searchQ) || b.author.includes(searchQ)) : [];
  const searchPostResults = searchQ.trim() ? POSTS.filter(p => p.quote.includes(searchQ) || p.book.title.includes(searchQ)) : [];

  const goBook = (title: string, author: string) => {
    navigate(`/book/${encodeURIComponent(title)}`, { state: { author } });
    onClose();
  };

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
        {searchResults.length > 0 && (
          <>
            <div className="sh"><span className="sl">책</span></div>
            {searchResults.map((b, i) => (
              <div key={i} className="brow" onClick={() => goBook(b.title, b.author)}>
                <div className="bcov" style={{ background: b.color }}><span className="bcovl">{b.title}</span></div>
                <div className="binf"><div className="bint">{b.title}</div><div className="bina">{b.author}</div></div>
              </div>
            ))}
          </>
        )}
        {searchPostResults.length > 0 && (
          <>
            <div className="sh"><span className="sl">밑줄</span></div>
            {searchPostResults.slice(0, 4).map((p, i) => (
              <div key={i} className="brow" onClick={onClose}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--sf)", fontSize: 13, color: "var(--tq)", marginBottom: 4 }}>"{p.quote}"</div>
                  <div className="bina">{p.book.title} · {p.book.author}</div>
                </div>
              </div>
            ))}
          </>
        )}
        {searchQ.trim() && searchResults.length === 0 && searchPostResults.length === 0 && (
          <div style={{ padding: 60, textAlign: "center", color: "var(--t3)", fontSize: 13 }}>검색 결과가 없습니다</div>
        )}
      </div>
    </div>
  );
}
