import { Component, useEffect, useRef, useState, lazy, Suspense, type ReactNode, type ErrorInfo } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import { ModalProvider, useModal } from "./lib/ModalContext";
import { BottomNav, scrollPositions } from "./components/BottomNav";
import { LeftSidebar } from "./components/LeftSidebar";
import { Icons } from "./components/Icons";
import { RightSidebar } from "./components/RightSidebar";
import { LoadingBar } from "./components/LoadingBar";
import "./styles/global.css";
import "./styles/share-cards.css";
import "./styles/auth.css";

// Eager: main tabs (instant navigation)
import { HomePage } from "./pages/HomePage";
import { WeaveListPage } from "./pages/WeaveListPage";
import { ShelfPage } from "./pages/ShelfPage";

// Lazy: sub-pages (loaded on demand)
const LegacyLineRedirect = lazy(() => import("./pages/LegacyRedirects").then(m => ({ default: m.LegacyLineRedirect })));
const LegacyUserRedirect = lazy(() => import("./pages/LegacyRedirects").then(m => ({ default: m.LegacyUserRedirect })));
const LegacyNoteRedirect = lazy(() => import("./pages/LegacyRedirects").then(m => ({ default: m.LegacyNoteRedirect })));
const UserPage = lazy(() => import("./pages/UserPage").then(m => ({ default: m.UserPage })));
const BookPage = lazy(() => import("./pages/BookPage").then(m => ({ default: m.BookPage })));
const SearchPage = lazy(() => import("./pages/SearchPage").then(m => ({ default: m.SearchPage })));
const UnderlinePage = lazy(() => import("./pages/UnderlinePage").then(m => ({ default: m.UnderlinePage })));
const WeaveEditorPage = lazy(() => import("./pages/WeaveEditorPage").then(m => ({ default: m.WeaveEditorPage })));
const WeaveReaderPage = lazy(() => import("./pages/WeaveReaderPage").then(m => ({ default: m.WeaveReaderPage })));
const ShareCardsPage = lazy(() => import("./pages/ShareCardsPage").then(m => ({ default: m.ShareCardsPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const NotificationsListPage = lazy(() => import("./pages/NotificationsListPage").then(m => ({ default: m.NotificationsListPage })));
const ProfileEditPage = lazy(() => import("./pages/settings/ProfileEditPage").then(m => ({ default: m.ProfileEditPage })));
const AccountPage = lazy(() => import("./pages/settings/AccountPage").then(m => ({ default: m.AccountPage })));
const NotificationsPage = lazy(() => import("./pages/settings/NotificationsPage").then(m => ({ default: m.NotificationsPage })));
const AboutPage = lazy(() => import("./pages/settings/AboutPage").then(m => ({ default: m.AboutPage })));
const HelpPage = lazy(() => import("./pages/settings/HelpPage").then(m => ({ default: m.HelpPage })));
const PrivacyPage = lazy(() => import("./pages/settings/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("./pages/settings/TermsPage").then(m => ({ default: m.TermsPage })));
const DeleteAccountPage = lazy(() => import("./pages/settings/DeleteAccountPage").then(m => ({ default: m.DeleteAccountPage })));
const CommunityGuidePage = lazy(() => import("./pages/settings/CommunityGuidePage").then(m => ({ default: m.CommunityGuidePage })));
const FeedbackPage = lazy(() => import("./pages/settings/FeedbackPage").then(m => ({ default: m.FeedbackPage })));
const WritePage = lazy(() => import("./pages/WritePage").then(m => ({ default: m.WritePage })));

/* ------------------------------------------------------------------ */
/* Error Boundary                                                      */
/* ------------------------------------------------------------------ */

class RouteErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Route error:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#999" }}>
          <div style={{ marginBottom: 12 }}>페이지를 불러올 수 없습니다</div>
          <button style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 6, background: "none", cursor: "pointer" }}
            onClick={() => { this.setState({ error: null }); window.location.href = "/"; }}>홈으로</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/* Header configuration                                                */
/* ------------------------------------------------------------------ */

interface HeaderConfig {
  logo?: boolean;
  title?: string;
  back?: boolean;
  center?: string;
  right?: "search" | "search-notes" | "bell-menu" | "none";
  compact?: boolean;
}

const HEADER_CONFIG: Record<string, HeaderConfig> = {
  "/":              { logo: true, right: "search" },
  "/notes":         { title: "노트", right: "search-notes" },
  "/settings":      { back: true, center: "더보기", right: "none" },
  "/notifications": { back: true, center: "알림", right: "none" },
  "/settings/about": { back: true, center: "소개", right: "none" },
  "/settings/help": { back: true, center: "도움말", right: "none" },
  "/settings/privacy": { back: true, center: "개인정보처리방침", right: "none" },
  "/settings/terms": { back: true, center: "이용약관", right: "none" },
  "/settings/profile": { back: true, center: "프로필 편집", right: "none" },
  "/settings/account": { back: true, center: "계정 정보", right: "none" },
  "/settings/notifications": { back: true, center: "알림 설정", right: "none" },
  "/settings/delete-account": { back: true, center: "계정 삭제", right: "none" },
  "/settings/community": { back: true, center: "커뮤니티 가이드", right: "none" },
  "/settings/feedback": { back: true, center: "버그 제보", right: "none" },
};

function AppHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const config = HEADER_CONFIG[pathname];
  if (!config) return null;

  const cls = `hd${config.compact ? " hd-compact" : ""}`;

  return (
    <header className={cls}>
      {/* Left section */}
      {config.back && (
        <button className="hd-back-btn" onClick={() => navigate(-1)} aria-label="뒤로">
          <Icons.Back />
        </button>
      )}
      {config.logo && (
        <div className="logo" onClick={() => navigate("/")}><span className="logo-icon"><Icons.Logo /></span>이듬</div>
      )}
      {config.title && <div className="hd-title">{config.title}</div>}

      {/* Center section */}
      {config.center && <div className="hd-center-title">{config.center}</div>}

      {/* Right section */}
      {config.right === "search" && (
        <div className="hdr">
          <button className="hd-bell-btn" onClick={() => navigate("/search")} aria-label="찾기">
            <Icons.Search />
          </button>
        </div>
      )}
      {config.right === "search-notes" && (
        <div className="hdr">
          <button className="hd-bell-btn" onClick={() => navigate("/search?scope=notes")} aria-label="노트 찾기">
            <Icons.Search />
          </button>
        </div>
      )}
      {config.right === "bell-menu" && (
        <div className="hdr" style={{ marginLeft: "auto" }}>
          <button className="hd-bell-btn" onClick={() => navigate("/notifications")} aria-label="알림">
            <Icons.Bell />
          </button>
          <button className="hd-bell-btn" onClick={() => navigate("/settings")} aria-label="메뉴">
            <Icons.Menu />
          </button>
        </div>
      )}
      {config.right === "none" && <div className="hdr" />}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* App Layout                                                          */
/* ------------------------------------------------------------------ */

function AppLayout() {
  const location = useLocation();

  // backgroundLocation: 피드에서 상세를 열면 state에 저장됨
  const backgroundLocation = (location.state as any)?.backgroundLocation;
  // 라우팅 기준: backgroundLocation이 있으면 그걸로 (피드 유지), 없으면 실제 location
  const routeLocation = backgroundLocation || location;

  const isWideContent = ["/shelf", "/settings", "/discover", "/notes/", "/write"].some(
    (p) => routeLocation.pathname.startsWith(p),
  );

  const { toast, openShare, requireAuth, feedKey, newPostId, onNewPostHandled } = useModal();
  const appRef = useRef<HTMLDivElement>(null);
  const [overlayBounds, setOverlayBounds] = useState({ left: 0, width: 0 });

  // .app의 실제 위치를 읽어서 오버레이 bounds 설정
  useEffect(() => {
    if (!backgroundLocation || !appRef.current) return;
    const update = () => {
      const rect = appRef.current!.getBoundingClientRect();
      setOverlayBounds({ left: rect.left, width: rect.width });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [backgroundLocation]);

  // 오버레이 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (backgroundLocation) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [backgroundLocation]);

  // 서브페이지 진입 시: 이전 탭 스크롤 저장 + 서브페이지는 top으로
  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    if (backgroundLocation) return; // 오버레이 열릴 때 스크롤 유지

    const prev = prevPathRef.current;
    prevPathRef.current = location.pathname;

    // 이전 경로가 탭 루트면 스크롤 위치 저장
    const tabRoots = ["/", "/notes"];
    if (tabRoots.includes(prev)) {
      scrollPositions[prev] = window.scrollY;
    }

    // 탭 루트로 돌아오면 스크롤 복원, 아니면 top으로
    if (tabRoots.includes(location.pathname) && scrollPositions[location.pathname]) {
      const savedY = scrollPositions[location.pathname];
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, savedY)));
    } else if (!["/", "/write", "/notes", "/shelf"].includes(location.pathname)) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, backgroundLocation]);

  return (
    <div className={`app-shell ${isWideContent ? "wide-content" : ""}`}>
      {/* Left Sidebar — desktop only */}
      <LeftSidebar onAuthRequired={requireAuth} />

      {/* Center Feed */}
      <div className="app" ref={appRef}>
        <AppHeader />

        <div className="ct">
          {/* 메인 라우트: backgroundLocation 기준으로 렌더 → 피드가 언마운트 안 됨 */}
          <RouteErrorBoundary>
          <Suspense fallback={<LoadingBar />}>
          <Routes location={routeLocation}>
            <Route path="/" element={<HomePage onShare={openShare} toast={toast} feedKey={feedKey} newPostId={newPostId} onNewPostHandled={onNewPostHandled} requireAuth={requireAuth} />} />
            <Route path="/:handle/lines/:id" element={<UnderlinePage />} />
            <Route path="/:handle/notes/:id" element={<WeaveReaderPage />} />
            <Route path="/:handle/notes/:id/edit" element={<WeaveEditorPage />} />
            <Route path="/:handle" element={<UserPage />} />
            <Route path="/write" element={<WritePage />} />
            <Route path="/notes" element={<WeaveListPage />} />
            <Route path="/notes/new" element={<WeaveEditorPage />} />
            <Route path="/notifications" element={<NotificationsListPage />} />
            <Route path="/shelf" element={<ShelfPage />} />
            <Route path="/book/:title" element={<BookPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/share-cards" element={<ShareCardsPage />} />
            <Route path="/settings" element={<SettingsPage requireAuth={requireAuth} />} />
            <Route path="/settings/profile" element={<ProfileEditPage />} />
            <Route path="/settings/account" element={<AccountPage />} />
            <Route path="/settings/notifications" element={<NotificationsPage />} />
            <Route path="/settings/about" element={<AboutPage />} />
            <Route path="/settings/help" element={<HelpPage />} />
            <Route path="/settings/privacy" element={<PrivacyPage />} />
            <Route path="/settings/terms" element={<TermsPage />} />
            <Route path="/settings/delete-account" element={<DeleteAccountPage />} />
            <Route path="/settings/community" element={<CommunityGuidePage />} />
            <Route path="/settings/feedback" element={<FeedbackPage />} />
            {/* 레거시 URL 리다이렉트 */}
            <Route path="/line/:id" element={<LegacyLineRedirect />} />
            <Route path="/user/:userId" element={<LegacyUserRedirect />} />
            <Route path="/notes/:id" element={<LegacyNoteRedirect />} />
          </Routes>
          </Suspense>
          </RouteErrorBoundary>

        </div>

        {/* 상세 오버레이 — position:fixed, .app 너비에 맞춤 */}
        {backgroundLocation && (
          <div className="line-overlay" style={{ left: overlayBounds.left, width: overlayBounds.width || "100%" }}>
            <RouteErrorBoundary>
            <Suspense fallback={<LoadingBar />}>
              <Routes>
                <Route path="/:handle/lines/:id" element={<UnderlinePage />} />
              </Routes>
            </Suspense>
            </RouteErrorBoundary>
          </div>
        )}

        {/* Bottom Nav — mobile only */}
        <BottomNav />
      </div>

      {/* Right Sidebar — desktop only */}
      <RightSidebar />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ModalProvider>
          <AppLayout />
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
