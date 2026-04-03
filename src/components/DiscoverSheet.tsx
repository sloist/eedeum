import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRandomBookWithRecords } from "../lib/api";

interface DiscoverSheetProps {
  onClose: () => void;
}

export function DiscoverSheet({ onClose }: DiscoverSheetProps) {
  const navigate = useNavigate();
  const [book, setBook] = useState<{
    id: string;
    title: string;
    author: string;
    coverColor: string;
    records: { id: string; shortId: string; quote: string; feeling: string | null; userName: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [entered, setEntered] = useState(false);

  const loadBook = async () => {
    setTransitioning(true);
    await new Promise(r => setTimeout(r, 200));
    const data = await fetchRandomBookWithRecords();
    setBook(data);
    setLoading(false);
    setTransitioning(false);
  };

  useEffect(() => { loadBook(); }, []);
  useEffect(() => { requestAnimationFrame(() => setEntered(true)); }, []);

  const handleClose = () => {
    setEntered(false);
    setTimeout(onClose, 300);
  };

  const firstRecord = book?.records?.[0];

  return (
    <div className={`dsc-backdrop ${entered ? "dsc-entered" : ""}`} onClick={handleClose}>
      <div className={`dsc-book ${entered ? "dsc-book-entered" : ""}`} onClick={e => e.stopPropagation()}>

        {loading ? (
          <div className="dsc-loading">
            <div className="dsc-loading-symbol">✦</div>
          </div>
        ) : (
          <div className={`dsc-inner ${transitioning ? "dsc-transitioning" : ""}`}>
            <div className="dsc-page">
              {/* Quiet label */}
              <div className="dsc-label">누군가 여기서 멈췄습니다</div>

              {/* The quote — hero of this moment */}
              {firstRecord && (
                <div className="dsc-hero-quote" onClick={() => { navigate(`/line/${firstRecord.shortId}`); onClose(); }}>
                  {firstRecord.quote}
                </div>
              )}

              {/* Book — revealed quietly below */}
              <div className="dsc-reveal">
                {book?.title} · {book?.author}
              </div>

              {/* Minimal actions */}
              <div className="dsc-actions">
                <span className="dsc-act" onClick={() => { navigate(`/book/${encodeURIComponent(book?.title ?? "")}`, { state: { author: book?.author } }); onClose(); }}>
                  이 책의 기록 보기
                </span>
                <span className="dsc-act-dot" />
                <span className="dsc-act" onClick={loadBook}>
                  다른 문장
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
