import { useState } from "react";
import { MOUM_SAVED, MOUM_ECHOES, POSTS, USERS } from "../data";

interface MoumPageProps {
  onClearNewEcho: () => void;
  hasNewEcho: boolean;
}

export function MoumPage({ onClearNewEcho, hasNewEcho }: MoumPageProps) {
  const [moumTab, setMoumTab] = useState("saved");

  return (
    <>
      <div className="moum-tabs">
        <button className={`moum-tab ${moumTab === "saved" ? "on" : ""}`} onClick={() => setMoumTab("saved")}>저장한 밑줄</button>
        <button className={`moum-tab ${moumTab === "echoes" ? "on" : ""}`} onClick={() => { setMoumTab("echoes"); onClearNewEcho(); }}>
          받은 공감
          {hasNewEcho && <span className="mdot" />}
        </button>
        <button className={`moum-tab ${moumTab === "liked" ? "on" : ""}`} onClick={() => setMoumTab("liked")}>좋아요한</button>
      </div>

      {moumTab === "saved" && (
        <>
          {MOUM_SAVED.map((s, i) => (
            <div key={i} className="moum-card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="moum-quote">"{s.quote}"</div>
              <div className="moum-meta">
                <span>{s.book}</span><span className="qdot" /><span>{s.author}</span>
                <span className="moum-time">{s.savedAt}</span>
              </div>
            </div>
          ))}
          {MOUM_SAVED.length === 0 && (
            <div style={{ padding: 60, textAlign: "center", color: "var(--t3)", fontSize: 13 }}>아직 저장한 밑줄이 없습니다</div>
          )}
        </>
      )}

      {moumTab === "echoes" && (
        <>
          {MOUM_ECHOES.map((e, i) => (
            <div key={i} className={`echo-card ${e.isNew ? "new" : ""}`} style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="echo-from">{e.from}{e.isNew && <span className="echo-new-dot" />}</div>
              <div className="echo-msg">{e.text}</div>
              <div className="echo-ref">내 밑줄: "{e.myQuote}"</div>
              <div className="echo-time">{e.time}</div>
            </div>
          ))}
        </>
      )}

      {moumTab === "liked" && (
        <>
          {POSTS.slice(0, 4).map((p, i) => (
            <div key={i} className="moum-card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="moum-quote">"{p.quote}"</div>
              <div className="moum-meta">
                <span>{USERS[p.userId].name}</span><span className="qdot" /><span>{p.book.title}</span>
                <span className="moum-time">{p.timestamp}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
