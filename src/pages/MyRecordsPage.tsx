import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { LoadingBar } from "../components/LoadingBar";
import { fetchUserLines, type FeedPost } from "../lib/api";

interface MyRecordsPageProps {
  onCapture: () => void;
  onAuthRequired: () => void;
}

export function MyRecordsPage({ onCapture, onAuthRequired }: MyRecordsPageProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [records, setRecords] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const handleImagePick = (capture?: boolean) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (capture) input.capture = "environment";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        navigate("/write", { state: { imageUrl: url } });
      }
    };
    input.click();
  };

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let mounted = true;
    fetchUserLines(user.id).then(data => {
      if (mounted) { setRecords(data); setLoading(false); }
    });
    return () => { mounted = false; };
  }, [user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="shelf-login-prompt">
        <div className="shelf-login-msg">로그인하면 남길 수 있어요</div>
        <button className="shelf-login-btn" onClick={onAuthRequired}>로그인</button>
      </div>
    );
  }

  const quickInputRef = useRef<HTMLInputElement>(null);

  // 기록 탭 진입 시 항상 최상단
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="content-fade-in">
      <header className="hd">
        <div className="hd-title">기록</div>
        {!loading && records.length > 0 && (
          <div className="hd-count">{records.length}줄</div>
        )}
      </header>

      {/* 상단 빠른 입력 영역 */}
      <div className="my-quick-entry">
        <input
          ref={quickInputRef}
          className="my-quick-input"
          placeholder="멈춘 문장을 남겨보세요"
          readOnly
          onClick={() => onCapture()}
        />
        <div className="my-quick-actions">
          <button className="my-quick-btn" onClick={() => handleImagePick(true)} aria-label="촬영">
            <span>촬영</span>
          </button>
          <button className="my-quick-btn" onClick={() => handleImagePick(false)} aria-label="사진">
            <span>사진</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingBar />
      ) : records.length === 0 ? (
        <div className="my-empty">
          <div className="my-empty-text">아직 남긴 문장이 없습니다</div>
          <div className="my-empty-sub">책을 읽다 멈춘 곳에<br />밑줄을 그어보세요</div>
        </div>
      ) : (
        <div className="memo-list">
          {records.map((r, i) => (
            <article key={r.id} className="memo-card" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => navigate(`/line/${r.id}`)}>
              {r.feeling ? (
                <>
                  <div className="memo-note">{r.feeling}</div>
                  <blockquote className="memo-cite">
                    <span className="memo-cite-text">{r.quote}</span>
                    <span className="memo-cite-src">{r.book.title} · {r.book.author}</span>
                  </blockquote>
                </>
              ) : (
                <>
                  <div className="memo-note memo-note-quote">{r.quote}</div>
                  <div className="memo-cite-src">{r.book.title} · {r.book.author}</div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
