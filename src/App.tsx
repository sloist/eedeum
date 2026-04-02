import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import { ModalProvider, useModal } from "./lib/ModalContext";
import { BottomNav } from "./components/BottomNav";
import { LeftSidebar } from "./components/LeftSidebar";
import { Icons } from "./components/Icons";
import { RightSidebar } from "./components/RightSidebar";
import { LoadingBar } from "./components/LoadingBar";
import "./styles/global.css";
import "./styles/share-cards.css";
import "./styles/auth.css";

// Eager: main tabs (instant navigation)
import { HomePage } from "./pages/HomePage";
import { MyRecordsPage } from "./pages/MyRecordsPage";
import { WeaveListPage } from "./pages/WeaveListPage";
import { ShelfPage } from "./pages/ShelfPage";

// Lazy: sub-pages (loaded on demand)
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
const WritePage = lazy(() => import("./pages/WritePage").then(m => ({ default: m.WritePage })));

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
  "/weaves":        { title: "노트", right: "search-notes" },
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
        <div className="logo" onClick={() => navigate("/")}>이듬</div>
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
  const navigate = useNavigate();
  const location = useLocation();
  const isWideContent = ["/weaves", "/shelf", "/settings", "/discover", "/weave/", "/my"].some(
    (p) => location.pathname.startsWith(p),
  );

  const { toast, openShare, requireAuth, feedKey, newPostId, onNewPostHandled } = useModal();

  // Scroll to top on sub-page navigation (not main tabs — BottomNav handles those)
  useEffect(() => {
    const mainTabs = ["/", "/my", "/weaves", "/shelf"];
    if (!mainTabs.includes(location.pathname)) {
      window.scrollTo(0, 0);
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }
  }, [location.pathname]);

  return (
    <div className={`app-shell ${isWideContent ? "wide-content" : ""}`}>
      {/* Left Sidebar — desktop only */}
      <LeftSidebar onAuthRequired={requireAuth} />

      {/* Center Feed */}
      <div className="app">
        <AppHeader />

        <div className="ct">
          <Suspense fallback={<LoadingBar />}>
          <Routes>
            <Route path="/" element={<HomePage onShare={openShare} toast={toast} feedKey={feedKey} newPostId={newPostId} onNewPostHandled={onNewPostHandled} requireAuth={requireAuth} />} />
            {/* /discover merged into home */}
            <Route path="/my" element={<MyRecordsPage onCapture={() => navigate("/write")} onAuthRequired={requireAuth} />} />
            <Route path="/write" element={<WritePage />} />
            <Route path="/weaves" element={<WeaveListPage />} />
            <Route path="/notifications" element={<NotificationsListPage />} />
            <Route path="/shelf" element={<ShelfPage />} />
            <Route path="/user/:userId" element={<UserPage onShare={openShare} toast={toast} />} />
            <Route path="/book/:title" element={<BookPage />} />
            <Route path="/line/:id" element={<UnderlinePage />} />
            <Route path="/weave/new" element={<WeaveEditorPage />} />
            <Route path="/weave/:id" element={<WeaveReaderPage />} />
            <Route path="/weave/:id/edit" element={<WeaveEditorPage />} />
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
          </Routes>
          </Suspense>
        </div>

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
