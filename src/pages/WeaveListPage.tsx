import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingBar } from "../components/LoadingBar";
import { fetchPublicWeaves } from "../lib/api";

interface WeaveItem {
  id: string;
  title: string;
  description: string | null;
  coverColor: string;
  isPublic: boolean;
  blockCount: number;
  userName: string;
  userId?: string;
  updatedAt: string;
  firstQuote?: string | null;
}

export function WeaveListPage() {
  const navigate = useNavigate();
  const [weaves, setWeaves] = useState<WeaveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchPublicWeaves().then(data => {
      if (mounted) { setWeaves(data); setLoading(false); }
    });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="content-fade-in">
      {loading ? (
        <LoadingBar />
      ) : weaves.length === 0 ? (
        <div className="empty-cta">
          <div className="empty-cta-text">아직 공개된 노트가 없습니다</div>
          <div className="empty-cta-sub">기록이 어느 정도 쌓이면 여기에 다른 사람들의 노트가 나타납니다</div>
        </div>
      ) : (
        <div className="weave-grid">
          {weaves.map(w => (
            <article key={w.id} className="weave-booklet" onClick={() => navigate(`/weave/${w.id}`)}>
              <div className="weave-booklet-cover" style={{ background: w.coverColor }}>
                <h3 className="weave-booklet-title">{w.title}</h3>
              </div>
              <div className="weave-booklet-body">
                {w.description && <p className="weave-booklet-desc">{w.description}</p>}
                {w.firstQuote && !w.description && (
                  <p className="weave-booklet-preview">{w.firstQuote}</p>
                )}
                <div className="weave-booklet-meta">
                  {w.userName && <span>{w.userName}</span>}
                  <span>{w.blockCount}개의 조각</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
