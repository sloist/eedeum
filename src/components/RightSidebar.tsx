import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "./Icons";
import { useEffect, useState } from "react";
import { fetchDailyQuote, fetchRediscovery } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

export function RightSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isSearchPage = location.pathname === "/search";

  const [dailyQuote, setDailyQuote] = useState<{ quote: string; bookTitle: string; bookAuthor: string } | null>(null);
  const [rediscovery, setRediscovery] = useState<{ quote: string; bookTitle: string; bookAuthor: string; shortId: string; handle: string; createdAt: string } | null>(null);

  useEffect(() => {
    fetchDailyQuote().then(q => setDailyQuote(q));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchRediscovery(user.id).then(r => setRediscovery(r));
  }, [user]);

  return (
    <aside className="right-sidebar">
      {!isSearchPage && (
        <div className="rs-search-link" onClick={() => navigate("/search")}>
          <Icons.Search />
          <span>검색</span>
        </div>
      )}

      {rediscovery && (
        <div className="rs-rediscovery" onClick={() => navigate(`/@${rediscovery.handle}/lines/${rediscovery.shortId}`)}>
          <div className="rs-rediscovery-label">다시 만난 문장</div>
          <div className="rs-rediscovery-quote">{rediscovery.quote.length > 50 ? rediscovery.quote.slice(0, 50) + "…" : rediscovery.quote}</div>
          <div className="rs-rediscovery-src">{rediscovery.bookTitle} · {rediscovery.bookAuthor}</div>
        </div>
      )}

      {dailyQuote && (
        <div className="rs-daily">
          <div className="rs-daily-quote">{dailyQuote.quote.length > 60 ? dailyQuote.quote.slice(0, 60) + "…" : dailyQuote.quote}</div>
          <div className="rs-daily-src">{dailyQuote.bookTitle} · {dailyQuote.bookAuthor}</div>
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
