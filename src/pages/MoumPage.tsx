import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { LoadingBar } from "../components/LoadingBar";
import {
  fetchSavedLines,
  fetchReceivedEchoes,
  fetchLikedLines,
} from "../lib/api";

interface MoumPageProps {
  onClearNewEcho: () => void;
  hasNewEcho: boolean;
}

interface NotificationItem {
  type: "echo" | "like" | "save";
  name: string;
  text: string;
  time: string;
  isNew: boolean;
}

export function MoumPage({ onClearNewEcho, hasNewEcho }: MoumPageProps) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [moumTab, setMoumTab] = useState("saved");

  const [savedItems, setSavedItems] = useState<{ id: string; shortId: string; quote: string; book: string; author: string; savedAt: string }[]>([]);
  const [echoItems, setEchoItems] = useState<{ lineId: string; from: string; text: string; myQuote: string; time: string; isNew: boolean }[]>([]);
  const [likedItems, setLikedItems] = useState<{ id: string; shortId: string; quote: string; book: string; author: string; userName: string; timestamp: string }[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    async function load() {
      const [saved, echoes, liked] = await Promise.all([
        fetchSavedLines(user!.id),
        fetchReceivedEchoes(user!.id),
        fetchLikedLines(user!.id),
      ]);
      if (!mounted) return;
      setSavedItems(saved);
      setEchoItems(echoes);
      setLikedItems(liked);

      // Build notification items from echoes
      const notifs: NotificationItem[] = echoes.map(e => ({
        type: "echo" as const,
        name: e.from,
        text: `${e.from}님이 이어 남겼어요`,
        time: e.time,
        isNew: e.isNew,
      }));
      setNotifications(notifs);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="shelf-login-prompt">
        <div className="shelf-login-msg">로그인하면 담아둔 조각과 함께 머문 기록을 확인할 수 있습니다</div>
        <button className="shelf-login-btn" onClick={() => navigate("/")}>홈으로</button>
      </div>
    );
  }

  return (
    <>
      <div className="moum-tabs">
        <button className={`moum-tab ${moumTab === "saved" ? "on" : ""}`} onClick={() => setMoumTab("saved")}>담아둔 조각</button>
        <button className={`moum-tab ${moumTab === "echoes" ? "on" : ""}`} onClick={() => { setMoumTab("echoes"); onClearNewEcho(); }}>
          함께 머문 기록
          {hasNewEcho && <span className="mdot" />}
        </button>
        <button className={`moum-tab ${moumTab === "liked" ? "on" : ""}`} onClick={() => setMoumTab("liked")}>머물렀던 것들</button>
        <button className={`moum-tab ${moumTab === "notifs" ? "on" : ""}`} onClick={() => setMoumTab("notifs")}>알림</button>
      </div>

      {loading ? (
        <LoadingBar />
      ) : (
        <div className="content-fade-in">
          {moumTab === "saved" && (
            <>
              {savedItems.map((s, i) => (
                <div
                  key={i}
                  className="moum-record-card"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => navigate(`/line/${s.shortId}`)}
                >
                  <div className="mrc-quote">{s.quote}</div>
                  <div className="mrc-meta">
                    <span>{s.book}</span>
                    <span className="qdot" />
                    <span>{s.author}</span>
                    <span style={{ marginLeft: "auto" }}>{s.savedAt}</span>
                  </div>
                </div>
              ))}
              {savedItems.length === 0 && (
                <div className="empty-cta">
                  <div className="empty-cta-text">아직 담아둔 조각이 없습니다</div>
                  <div className="empty-cta-sub">홈에서 마음에 드는 문장을 담아보세요</div>
                  <button className="empty-cta-btn" onClick={() => navigate("/")}>홈으로 가기</button>
                </div>
              )}
            </>
          )}

          {moumTab === "echoes" && (
            <>
              {echoItems.map((e, i) => (
                <div
                  key={i}
                  className="moum-echo-card"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => navigate(`/line/${e.lineId}`)}
                >
                  <div className="mec-quote">{e.myQuote}</div>
                  <div className="mec-echo">{e.text}</div>
                  <div className="mec-from">
                    {e.from}
                    {e.isNew && <span className="echo-new-dot" />}
                    <span style={{ marginLeft: "auto" }}>{e.time}</span>
                  </div>
                </div>
              ))}
              {echoItems.length === 0 && (
                <div className="empty-cta">
                  <div className="empty-cta-text">아직 함께 머문 기록이 없습니다</div>
                  <div className="empty-cta-sub">기록을 남기면 다른 사람들의 반응이 여기에 모입니다</div>
                </div>
              )}
            </>
          )}

          {moumTab === "liked" && (
            <>
              {likedItems.map((p, i) => (
                <div
                  key={i}
                  className="moum-record-card"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => navigate(`/line/${p.shortId}`)}
                >
                  <div className="mrc-quote">{p.quote}</div>
                  <div className="mrc-meta">
                    <span>{p.book}</span>
                    <span className="qdot" />
                    <span>{p.author}</span>
                    <span style={{ marginLeft: "auto" }}>{p.timestamp}</span>
                  </div>
                </div>
              ))}
              {likedItems.length === 0 && (
                <div className="empty-cta">
                  <div className="empty-cta-text">아직 머물렀던 기록이 없습니다</div>
                  <div className="empty-cta-sub">마음에 남는 문장에 머물러보세요</div>
                  <button className="empty-cta-btn" onClick={() => navigate("/")}>홈으로 가기</button>
                </div>
              )}
            </>
          )}

          {moumTab === "notifs" && (
            <>
              {notifications.map((n, i) => (
                <div key={i} className={`echo-card ${n.isNew ? "new" : ""}`} style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="echo-msg">{n.text}</div>
                  <div className="echo-time">{n.time}</div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="empty-inline">아직 알림이 없습니다</div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
