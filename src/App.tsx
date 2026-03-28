import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Icons } from "./components/Icons";
import { BottomNav } from "./components/BottomNav";
import { LeftSidebar } from "./components/LeftSidebar";
import { RightSidebar } from "./components/RightSidebar";
import { SearchOverlay } from "./components/SearchOverlay";
import { ShareModal } from "./components/ShareModal";
import { CaptureSheet } from "./components/CaptureSheet";
import { Toast } from "./components/Toast";
import { HomePage } from "./pages/HomePage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { MoumPage } from "./pages/MoumPage";
import { ShelfPage } from "./pages/ShelfPage";
import { UserPage } from "./pages/UserPage";
import { BookPage } from "./pages/BookPage";
import { ShareCardsPage } from "./pages/ShareCardsPage";
import type { Post } from "./data";
import "./styles/global.css";
import "./styles/share-cards.css";

function AppLayout() {
  const navigate = useNavigate();
  const [showCap, setShowCap] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [hasNewEcho, setHasNewEcho] = useState(true);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }, []);

  const openShare = (post: Post) => {
    setSharePost(post);
    setShowShare(true);
  };

  const openSearch = () => setShowSearch(true);
  const openCapture = () => setShowCap(true);

  return (
    <div className="app-shell">
      {/* Left Sidebar — desktop only */}
      <LeftSidebar hasNewEcho={hasNewEcho} onCapture={openCapture} />

      {/* Center Feed */}
      <div className="app">
        <header className="hd">
          <div className="logo" onClick={() => navigate("/")}>밑줄<span className="logo-line" /></div>
          <div className="hdr">
            <button className="hdb" onClick={openSearch}><Icons.Search /></button>
          </div>
        </header>

        <div className="ct">
          <Routes>
            <Route path="/" element={<HomePage onShare={openShare} toast={toast} />} />
            <Route path="/discover" element={<DiscoverPage onSearch={openSearch} />} />
            <Route path="/moum" element={<MoumPage hasNewEcho={hasNewEcho} onClearNewEcho={() => setHasNewEcho(false)} />} />
            <Route path="/shelf" element={<ShelfPage onShare={openShare} />} />
            <Route path="/user/:userId" element={<UserPage onShare={openShare} toast={toast} />} />
            <Route path="/book/:title" element={<BookPage />} />
            <Route path="/share-cards" element={<ShareCardsPage />} />
          </Routes>
        </div>

        {/* Bottom Nav — mobile only */}
        <BottomNav hasNewEcho={hasNewEcho} onCapture={openCapture} />
      </div>

      {/* Right Sidebar — desktop only */}
      <RightSidebar onSearch={openSearch} />

      {/* Overlays */}
      {showCap && <CaptureSheet onClose={() => setShowCap(false)} toast={toast} />}
      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}
      {showShare && sharePost && <ShareModal post={sharePost} onClose={() => setShowShare(false)} toast={toast} />}
      {showToast && <Toast message={toastMsg} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
