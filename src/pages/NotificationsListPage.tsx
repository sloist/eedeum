import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { useModal } from "../lib/ModalContext";
import { LoadingBar } from "../components/LoadingBar";
import { fetchNotifications, markNotificationsRead } from "../lib/api";

export function NotificationsListPage() {
  const { user, loading: authLoading } = useAuth();
  const { requireAuth } = useModal();
  const navigate = useNavigate();
  const [items, setItems] = useState<{ id: string; from: string; text: string; lineId: string | null; time: string; isNew: boolean; type: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    async function load() {
      const notifications = await fetchNotifications(user!.id);
      if (!mounted) return;
      setItems(notifications);
      setLoading(false);
      // Mark all as read after loading
      markNotificationsRead(user!.id);
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="shelf-login-prompt">
        <div className="shelf-login-msg">로그인하면 볼 수 있어요</div>
        <button className="shelf-login-btn" onClick={() => requireAuth()}>로그인</button>
      </div>
    );
  }

  return (
    <div className="content-fade-in">

      {loading ? (
        <LoadingBar />
      ) : (
        <>
          {items.map((n, i) => (
            <div
              key={n.id}
              className={`echo-card ${n.isNew ? "new" : ""}`}
              style={{ animationDelay: `${i * 0.06}s`, cursor: n.lineId ? "pointer" : "default" }}
              onClick={() => n.lineId && navigate(`/line/${n.lineId}`)}
            >
              <div className="echo-msg">{n.text}</div>
              <div className="echo-time">{n.time}</div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="empty-cta">
              <div className="empty-cta-text">아직 알림이 없습니다</div>
              <div className="empty-cta-sub">남긴 문장에 머문 흔적이 여기에 쌓입니다</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
