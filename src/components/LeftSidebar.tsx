import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";
import { Icons } from "./Icons";

interface LeftSidebarProps {
  onAuthRequired: () => void;
}

export function LeftSidebar({ onAuthRequired }: LeftSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const { user, loading: authLoading } = useAuth();
  const [showMore, setShowMore] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [popPos, setPopPos] = useState({ bottom: 0, left: 0 });

  const isActive = (p: string) => {
    if (p === "/") return path === "/";
    return path.startsWith(p);
  };

  useEffect(() => {
    if (!showMore) return;
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPopPos({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
    }
    const handle = (e: Event) => {
      if (popRef.current?.contains(e.target as Node)) return;
      if (btnRef.current?.contains(e.target as Node)) return;
      setShowMore(false);
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => { document.removeEventListener("mousedown", handle); document.removeEventListener("touchstart", handle); };
  }, [showMore]);

  const go = (p: string) => { setShowMore(false); navigate(p); };

  const popover = showMore ? createPortal(
    <div
      ref={popRef}
      style={{
        position: "fixed",
        bottom: popPos.bottom,
        left: popPos.left,
        width: 130,
        background: "var(--bgC)",
        borderRadius: 10,
        border: "0.5px solid var(--bdL)",
        boxShadow: "0 8px 32px rgba(31,26,21,0.12), 0 2px 6px rgba(31,26,21,0.06)",
        padding: "6px 0",
        zIndex: 9999,
        animation: "rise .15s ease",
      }}
    >
      <button className="ls-pop-item" onClick={() => go("/settings")}>설정</button>
      <div className="ls-pop-divider" />
      <button className="ls-pop-item" onClick={() => go("/settings/about")}>소개</button>
      <button className="ls-pop-item" onClick={() => go("/settings/help")}>도움말</button>
      <button className="ls-pop-item" onClick={() => go("/settings/privacy")}>개인정보처리방침</button>
      <button className="ls-pop-item" onClick={() => go("/settings/terms")}>이용약관</button>
      <div className="ls-pop-divider" />
      {authLoading ? null : user ? (
        <button className="ls-pop-item" onClick={() => {
          if (window.confirm("로그아웃 하시겠습니까?")) {
            setShowMore(false); supabase.auth.signOut().then(() => navigate("/"));
          }
        }}>로그아웃</button>
      ) : (
        <button className="ls-pop-item" onClick={() => { setShowMore(false); onAuthRequired(); }}>로그인</button>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <aside className="left-sidebar">
        <div className="ls-logo" onClick={() => navigate("/")}>
          <span className="ls-logo-icon"><Icons.Logo /></span>
          이듬
        </div>

        <nav className="ls-main">
          <button className={`ls-nav-item ${isActive("/") ? "on" : ""}`} onClick={() => navigate("/")}>
            <Icons.Discover /><span>한줄</span>
          </button>
          <button className={`ls-nav-item ${isActive("/write") ? "on" : ""} ${!user ? "ls-muted" : ""}`} onClick={() => user ? navigate("/write") : onAuthRequired()}>
            <Icons.Record /><span>기록</span>
          </button>
          <button className={`ls-nav-item ${isActive("/notes") ? "on" : ""}`} onClick={() => navigate("/notes")}>
            <Icons.Note /><span>노트</span>
          </button>
          <button className={`ls-nav-item ${isActive("/shelf") ? "on" : ""} ${!user ? "ls-muted" : ""}`} onClick={() => user ? navigate("/shelf") : onAuthRequired()}>
            <Icons.Shelf /><span>서재</span>
          </button>
        </nav>

        <button className="ls-nav-item ls-search-btn" onClick={() => navigate("/search")}>
          <Icons.Search /><span>검색</span>
        </button>

        <div className="ls-more-wrap">
          <button ref={btnRef} className="ls-nav-item ls-more-btn" onClick={() => setShowMore(!showMore)}>
            <Icons.More /><span>더보기</span>
          </button>
        </div>
      </aside>
      {popover}
    </>
  );
}
