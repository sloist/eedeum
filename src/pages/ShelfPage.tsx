import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { useModal } from "../lib/ModalContext";
import { ProfileHeader } from "../components/ProfileHeader";
import { LoadingBar } from "../components/LoadingBar";
import { ShelfSaved } from "../components/shelf/ShelfSaved";
import { Icons } from "../components/Icons";
import type { User } from "../data";
import {
  fetchUserProfile,
  fetchUserShelf,
  fetchUserWeaves,
  fetchUserLines,
  fetchSavedLines,
  fetchPrivateMemos,
} from "../lib/api";

export function ShelfPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { requireAuth } = useModal();

  const [profile, setProfile] = useState<User | null>(null);
  const [shelf, setShelf] = useState<{ title: string; author: string; color: string; lines: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLines, setUserLines] = useState<{ id: string; quote: string; bookTitle: string; bookAuthor: string }[]>([]);
  const [weaves, setWeaves] = useState<{ id: string; title: string; description: string | null; coverColor: string; isPublic: boolean; blockCount: number; createdAt: string; updatedAt: string }[]>([]);
  const [savedItems, setSavedItems] = useState<{ id: string; quote: string; book: string; author: string; savedAt: string }[]>([]);
  const [privateMemos, setPrivateMemos] = useState<{ lineId: string; text: string; date: string }[]>([]);
  const [showMyLines, setShowMyLines] = useState(false);
  const [showMyWeaves, setShowMyWeaves] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showMemos, setShowMemos] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    async function load() {
      const [profileData, shelfData, weavesData, lines, saved, memos] = await Promise.all([
        fetchUserProfile(user!.id),
        fetchUserShelf(user!.id),
        fetchUserWeaves(user!.id),
        fetchUserLines(user!.id),
        fetchSavedLines(user!.id),
        fetchPrivateMemos(user!.id),
      ]);
      if (!mounted) return;
      if (profileData) {
        const rawHandle = profileData.handle;
        const cleanHandle = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;
        setProfile({
          name: profileData.name,
          avatar: profileData.avatar_emoji ?? "📖",
          handle: cleanHandle,
          bio: profileData.bio ?? "",
          books: profileData.books,
          lines: profileData.lines,
          followers: profileData.followers,
          following: profileData.following,
        });
      }
      setShelf(shelfData);
      setWeaves(weavesData);
      setUserLines(lines.map((l: any) => ({ id: l.id, quote: l.quote, bookTitle: l.book?.title ?? "", bookAuthor: l.book?.author ?? "" })));
      setSavedItems(saved);
      setPrivateMemos(memos);

      setLoading(false);
      // 서재는 항상 최상단에서 시작
      window.scrollTo(0, 0);
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="shelf-login-prompt">
        <div className="shelf-login-msg">머물렀던 책들이 여기에 모입니다</div>
        <button className="shelf-login-btn" onClick={() => requireAuth()}>로그인</button>
      </div>
    );
  }

  if (loading || !profile) return <LoadingBar />;

  // 대표 문장: 가장 최근 기록의 quote
  const featuredQuote = userLines.length > 0 ? userLines[0].quote : undefined;
  // 대표 노트: 첫 번째 공개 노트
  const featuredWeave = weaves.find(w => w.isPublic) ?? null;

  return (
    <div className="content-fade-in" ref={topRef}>
      <ProfileHeader
        user={profile}
        showFollow={false}
        featuredQuote={featuredQuote}
        featuredWeave={featuredWeave ? { id: featuredWeave.id, title: featuredWeave.title, coverColor: featuredWeave.coverColor } : null}
        onWeaveClick={(id) => navigate(`/weave/${id}`)}
        rightActions={
          <>
            <button className="hd-bell-btn" onClick={() => navigate("/notifications")} aria-label="알림"><Icons.Bell /></button>
            <button className="hd-bell-btn" onClick={() => navigate("/settings")} aria-label="메뉴"><Icons.Menu /></button>
          </>
        }
      />

      {/* 내 글 */}
      {userLines.length > 0 && (
        <>
          <div className="sh" style={{ cursor: "pointer" }} onClick={() => setShowMyLines(!showMyLines)}>
            <span className="sl">내 글</span>
            <span className="sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {userLines.length}개
              <span className={`detail-others-chevron ${showMyLines ? "open" : ""}`} style={{ display: "inline-flex" }}><Icons.ChevD /></span>
            </span>
          </div>
          {showMyLines && (
            <div className="shelf-lines">
              {userLines.map(l => (
                <div key={l.id} className="shelf-line-card" onClick={() => navigate(`/line/${l.id}`)}>
                  <div className="shelf-line-quote">{l.quote}</div>
                  <div className="shelf-line-src">{l.bookTitle} · {l.bookAuthor}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 담아둔 조각 */}
      {savedItems.length > 0 && (
        <>
          <div className="sh" style={{ cursor: "pointer" }} onClick={() => setShowSaved(!showSaved)}>
            <span className="sl">담아둔 조각</span>
            <span className="sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {savedItems.length}개
              <span className={`detail-others-chevron ${showSaved ? "open" : ""}`} style={{ display: "inline-flex" }}><Icons.ChevD /></span>
            </span>
          </div>
          {showSaved && <ShelfSaved savedItems={savedItems} />}
        </>
      )}

      {/* 내 노트 */}
      {weaves.length > 0 && (
        <>
          <div className="sh" style={{ cursor: "pointer" }} onClick={() => setShowMyWeaves(!showMyWeaves)}>
            <span className="sl">내 노트</span>
            <span className="sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {weaves.length}개
              <span className={`detail-others-chevron ${showMyWeaves ? "open" : ""}`} style={{ display: "inline-flex" }}><Icons.ChevD /></span>
            </span>
          </div>
          {showMyWeaves && (
            <div className="weave-grid" style={{ padding: "0 20px 8px" }}>
              {weaves.map(w => (
                <article key={w.id} className="weave-booklet" onClick={() => navigate(`/weave/${w.id}`)}>
                  <div className="weave-booklet-cover" style={{ background: w.coverColor }}>
                    <h3 className="weave-booklet-title">{w.title}</h3>
                  </div>
                  <div className="weave-booklet-body">
                    {w.description && <p className="weave-booklet-desc">{w.description}</p>}
                    <div className="weave-booklet-meta">
                      <span>{w.blockCount}개의 조각</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {/* 내 서재 (책) */}
      {shelf.length > 0 && (
        <>
          <div className="sh"><span className="sl">읽고 있는 책</span><span className="sm">{shelf.length}권</span></div>
          <div className="sgrid">
            {shelf.map((b, i) => (
              <div key={i} className="sbook" style={{ background: b.color }} onClick={() => navigate(`/book/${encodeURIComponent(b.title)}?mine=1`, { state: { author: b.author } })}>
                <span className="sbtl">{b.title}</span>
                <span className="sbln">{b.lines}개</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 나의 댓글 */}
      {privateMemos.length > 0 && (
        <>
          <div className="sh" style={{ cursor: "pointer" }} onClick={() => setShowMemos(!showMemos)}>
            <span className="sl">나의 댓글</span>
            <span className="sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {privateMemos.length}개
              <span className={`detail-others-chevron ${showMemos ? "open" : ""}`} style={{ display: "inline-flex" }}><Icons.ChevD /></span>
            </span>
          </div>
          {showMemos && (
            <div className="shelf-memos">
              {privateMemos.map((m, i) => (
                <div key={i} className="shelf-memo-card" onClick={() => navigate(`/line/${m.lineId}`)}>
                  <div className="shelf-memo-text">{m.text}</div>
                  <div className="shelf-memo-src">{new Date(m.date).toLocaleDateString("ko-KR")}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
