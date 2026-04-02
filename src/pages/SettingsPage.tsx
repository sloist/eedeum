import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Icons } from "../components/Icons";
import { Toast } from "../components/Toast";
import { useAuth } from "../lib/AuthContext";


interface SettingsPageProps {
  requireAuth?: () => void;
}

export function SettingsPage({ requireAuth }: SettingsPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("eedeum_theme") === "dark");
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("eedeum_fontsize") || "default");

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }, []);

  const handleToggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute("data-theme-transitioning", "");
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("eedeum_theme", next ? "dark" : "light");
    toast(next ? "다크모드 켜짐" : "다크모드 꺼짐");
    setTimeout(() => document.documentElement.removeAttribute("data-theme-transitioning"), 300);
  };

  const handleAccountAction = (action: string) => {
    if (!user) {
      requireAuth?.();
      return;
    }
    navigate(action);
  };

  return (
    <div className="content-fade-in">
      <div className="settings-page">
        {/* 읽기 환경 */}
        <div className="settings-group-label">읽기 환경</div>
        <div className="settings-list">
          <div className="settings-font-preview">
            <div className="sfp-sizes">
              {(["small", "default", "large"] as const).map(s => (
                <button
                  key={s}
                  className={`sfp-btn ${fontSize === s ? "sfp-on" : ""}`}
                  onClick={() => {
                    setFontSize(s);
                    document.documentElement.setAttribute("data-fontsize", s);
                    localStorage.setItem("eedeum_fontsize", s);
                  }}
                >
                  {{ small: "가", default: "가", large: "가" }[s]}
                </button>
              ))}
            </div>
            <p className="qtxt" style={{ borderLeft: "2px solid var(--acS)", paddingLeft: 16, margin: "12px 4px 4px" }}>사람은 누구나 자기만의 사정이 있다.</p>
            <p className="pfeel" style={{ paddingLeft: 16, margin: "4px 4px 0" }}>이 문장 앞에서 한참 멈췄다</p>
          </div>
          <button className="settings-item" onClick={handleToggleDark}>
            <span>다크모드</span>
            <span className={`settings-toggle-label ${darkMode ? "settings-toggle-on" : "settings-toggle-off"}`}>
              {darkMode ? "ON" : "OFF"}
            </span>
          </button>

        </div>

        {/* 계정 — 로그인 시만 실제 접근 */}
        <div className="settings-group-label">계정</div>
        <div className="settings-list">
          <button className={`settings-item ${!user ? "settings-item-muted" : ""}`} onClick={() => handleAccountAction("/settings/profile")}>
            <span>프로필 편집</span>
            <Icons.Back />
          </button>
          <button className={`settings-item ${!user ? "settings-item-muted" : ""}`} onClick={() => handleAccountAction("/settings/account")}>
            <span>계정 정보</span>
            <Icons.Back />
          </button>
          <button className={`settings-item ${!user ? "settings-item-muted" : ""}`} onClick={() => handleAccountAction("/settings/notifications")}>
            <span>알림 설정</span>
            <Icons.Back />
          </button>
        </div>

        {/* 안내 */}
        <div className="settings-group-label">안내</div>
        <div className="settings-list">
          <button className="settings-item" onClick={() => navigate("/settings/about")}><span>소개</span><Icons.Back /></button>
          <button className="settings-item" onClick={() => navigate("/settings/community")}><span>커뮤니티 가이드</span><Icons.Back /></button>
          <button className="settings-item" onClick={() => navigate("/settings/help")}><span>도움말</span><Icons.Back /></button>
          <button className="settings-item" onClick={() => navigate("/settings/privacy")}><span>개인정보처리방침</span><Icons.Back /></button>
          <button className="settings-item" onClick={() => navigate("/settings/terms")}><span>이용약관</span><Icons.Back /></button>
          <button className="settings-item" onClick={() => window.open("mailto:hello@eedeum.com?subject=버그 제보", "_blank")}><span>버그 제보</span><Icons.Back /></button>
        </div>

        {/* 로그인/로그아웃 */}
        <div className="settings-list" style={{ marginTop: 16 }}>
          {user ? (
            <button className="settings-item" onClick={() => {
              if (window.confirm("로그아웃 하시겠습니까?")) {
                supabase.auth.signOut().then(() => navigate("/"));
              }
            }}>
              <span>로그아웃</span>
            </button>
          ) : (
            <button className="settings-item" onClick={() => requireAuth?.()}>
              <span>로그인</span>
            </button>
          )}
        </div>
        <div className="settings-footer">
          2026 eedeum from <a href="https://iroun.com" target="_blank" rel="noopener noreferrer">iroun</a>
        </div>
      </div>
      {showToast && <Toast message={toastMsg} />}
    </div>
  );
}
