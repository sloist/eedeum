import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { CaptureSheet } from "../components/CaptureSheet";
import { ShareModal } from "../components/ShareModal";
import { Toast } from "../components/Toast";
import { Onboarding } from "../components/Onboarding";
import { AuthPage } from "../pages/AuthPage";
import { useAuth } from "./AuthContext";
import type { Post } from "../data";

interface ModalContextValue {
  toast: (msg: string) => void;
  openShare: (post: Post) => void;
  openCapture: () => void;
  requireAuth: () => void;
  feedKey: number;
  newPostId: string | null;
  onNewPostHandled: () => void;
  notifyNewPost: (id: string) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [showCap, setShowCap] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [feedKey, setFeedKey] = useState(0);
  const [newPostId, setNewPostId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("eedeum_onboarded"));
  const [showAuthModal, setShowAuthModal] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Escape 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (showAuthModal) { setShowAuthModal(false); return; }
      if (showShare) { setShowShare(false); return; }
      if (showCap) { setShowCap(false); return; }
      if (showOnboarding) { setShowOnboarding(false); return; }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showAuthModal, showShare, showCap, showOnboarding]);

  const toast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    setShowToast(true);
    toastTimer.current = setTimeout(() => setShowToast(false), 2500);
  }, []);

  const requireAuth = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const openShare = useCallback((post: Post) => {
    setSharePost(post);
    setShowShare(true);
  }, []);

  const openCapture = useCallback(() => {
    if (!user) { requireAuth(); return; }
    setShowCap(true);
  }, [user, requireAuth]);

  const onNewPostHandled = useCallback(() => {
    setNewPostId(null);
  }, []);

  const value: ModalContextValue = {
    toast,
    openShare,
    openCapture,
    requireAuth,
    feedKey,
    newPostId,
    onNewPostHandled,
    notifyNewPost: (id: string) => setNewPostId(id),
  };

  return (
    <ModalContext.Provider value={value}>
      {children}

      {/* Overlays */}
      {showCap && (
        <CaptureSheet
          onClose={(id) => {
            setShowCap(false);
            if (id) setNewPostId(id);
            else setFeedKey((k) => k + 1);
          }}
          toast={toast}
        />
      )}
      {showShare && sharePost && (
        <ShareModal post={sharePost} onClose={() => setShowShare(false)} toast={toast} />
      )}
      {showToast && <Toast message={toastMsg} />}
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      {showAuthModal && (
        <div className="auth-gate-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="auth-gate" onClick={(e) => e.stopPropagation()}>
            <button className="auth-gate-close" onClick={() => setShowAuthModal(false)}>
              &times;
            </button>
            <AuthPage onSuccess={() => setShowAuthModal(false)} isModal />
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
