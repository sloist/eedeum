import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { LoadingBar } from "../components/LoadingBar";
import { fetchPublicWeaves } from "../lib/api";

interface WeaveItem {
  id: string;
  shortId: string;
  title: string;
  description: string | null;
  coverColor: string;
  isPublic: boolean;
  blockCount: number;
  userName: string;
  userHandle: string;
  userId?: string;
  updatedAt: string;
  firstQuote?: string | null;
}

export function WeaveListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [weaves, setWeaves] = useState<WeaveItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    fetchPublicWeaves().then(data => {
      if (mounted) { setWeaves(data); setLoading(false); }
    });
    return () => { mounted = false; };
  }, []);

  const getPreview = (w: WeaveItem) => w.description || w.firstQuote || null;

  return (
    <div className="content-fade-in">
      {loading ? (
        <LoadingBar />
      ) : weaves.length === 0 ? (
        <div className="weave-empty">
          <div className="weave-empty-text">문장을 엮어 하나의 흐름으로</div>
          <div className="weave-empty-sub">기록이 쌓이면 노트로 나만의 흐름을 만들 수 있어요</div>
          {user && (
            <button className="weave-new-btn" onClick={() => navigate("/notes/new")}>
              새 노트 만들기
            </button>
          )}
        </div>
      ) : (
        <>
          {user && (
            <div className="weave-top-cta">
              <button className="weave-new-btn-inline" onClick={() => navigate("/notes/new")}>
                + 새 노트
              </button>
            </div>
          )}
          <div className="weave-grid">
            {weaves.map((w) => {
                const preview = getPreview(w);
                return (
                  <article
                    key={w.id}
                    className="weave-booklet"
                      onClick={() => navigate(`/@${w.userHandle}/notes/${w.shortId}`)}
                  >
                    {preview ? (
                      <div className="weave-booklet-excerpt">
                        <p className="weave-booklet-excerpt-text">{preview}</p>
                      </div>
                    ) : <div style={{ flex: 1 }} />}
                    <div className="weave-booklet-cover" style={{ background: w.coverColor }}>
                      <h3 className="weave-booklet-title">{w.title}</h3>
                    </div>
                    <div className="weave-booklet-footer">
                      {w.userName && <span className="weave-booklet-author">{w.userName}</span>}
                    </div>
                  </article>
                );
              })}
            </div>
        </>
      )}
    </div>
  );
}
