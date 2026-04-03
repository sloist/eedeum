import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Icons } from "../components/Icons";
import { LoadingBar } from "../components/LoadingBar";
import { useAuth } from "../lib/AuthContext";
import { fetchBookDetail } from "../lib/api";
import { trackEvent } from "../lib/tracking";

export function BookPage() {
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const author = (location.state as { author?: string })?.author ?? "";
  const isMine = searchParams.get("mine") === "1";

  const bookTitle = decodeURIComponent(title ?? "");

  const [allLines, setAllLines] = useState<{ id: string; shortId: string; userId: string; userName: string; userHandle: string; quote: string; page: number; feeling?: string; createdAt?: string; echoCount?: number }[]>([]);
  const [bookAuthor, setBookAuthor] = useState(author);
  const [loading, setLoading] = useState(true);
  const [showMine, setShowMine] = useState(isMine);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const detail = await fetchBookDetail(bookTitle);
      if (!mounted) return;
      if (detail) {
        setAllLines(detail.lines);
        if (detail.book.author) setBookAuthor(detail.book.author);
        if (user) {
          const from = (location.state as any)?.from || "detail";
          trackEvent(user.id, {
            eventType: "book_view", targetType: "book", targetId: detail.book.id || bookTitle,
            source: from, context: "book_page", metadata: { author: detail.book.author },
          });
        }
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [bookTitle]);

  const lines = showMine && user
    ? allLines.filter(l => l.userId === user.id)
    : allLines;

  return (
    <>
      <button className="backbtn" onClick={() => navigate(-1)}><Icons.Back /> 뒤로</button>
      <div className="cmphd">
        <div className="cmptl">{bookTitle}</div>
        <div className="cmpsub">{bookAuthor}</div>
      </div>

      {/* Filter toggle */}
      {user && allLines.some(l => l.userId === user.id) && (
        <div className="book-filter">
          <button className={`book-filter-btn ${showMine ? "on" : ""}`} onClick={() => setShowMine(true)}>내 기록</button>
          <button className={`book-filter-btn ${!showMine ? "on" : ""}`} onClick={() => setShowMine(false)}>모든 기록</button>
        </div>
      )}

      {!loading && <div className="cmpsub" style={{ padding: "0 24px 12px" }}>{lines.length}개의 기록</div>}

      <div>
        {loading ? (
          <LoadingBar />
        ) : (
          <div className="content-fade-in">
            {lines.map((l, i) => (
              <div key={i} className="cmpitm" onClick={() => navigate(`/@${l.userHandle}/lines/${l.shortId}`)}>
                <div className="cmpq">{l.quote}</div>
                {l.feeling && <div className="cmpfeel">{l.feeling}</div>}
                <div className="cmpur">
                  <span>{l.userName}</span>
                  <span className="qdot" />
                  <span>p.{l.page}</span>
                </div>
              </div>
            ))}
            {lines.length === 0 && (
              <div className="empty-cta">
                <div className="empty-cta-text">{showMine ? "이 책에 남긴 기록이 없습니다" : "아직 기록이 없습니다"}</div>
                {showMine && (
                  <button className="empty-cta-btn" onClick={() => setShowMine(false)}>모든 기록 보기</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
