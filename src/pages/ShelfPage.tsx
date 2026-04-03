import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { useModal } from "../lib/ModalContext";
import { ProfileHeader } from "../components/ProfileHeader";
import { LoadingBar } from "../components/LoadingBar";
import { Icons } from "../components/Icons";
import type { User } from "../data";
import {
  fetchUserProfile,
  fetchUserShelf,
  fetchUserWeaves,
  fetchUserLines,
  fetchSavedLines,
  fetchPrivateMemos,
  fetchUserBlocks,
  fetchUserDbProfile,
  fetchUserRank,
  unblock,
} from "../lib/api";

export function ShelfPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { requireAuth } = useModal();

  const [profile, setProfile] = useState<User | null>(null);
  const [shelf, setShelf] = useState<{ title: string; author: string; color: string; lines: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLines, setUserLines] = useState<{ id: string; shortId: string; quote: string; bookTitle: string; bookAuthor: string }[]>([]);
  const [weaves, setWeaves] = useState<{ id: string; shortId: string; title: string; description: string | null; coverColor: string; isPublic: boolean; blockCount: number; userHandle: string; createdAt: string; updatedAt: string }[]>([]);
  const [savedItems, setSavedItems] = useState<{ id: string; shortId: string; userHandle: string; quote: string; book: string; author: string; savedAt: string }[]>([]);
  const [privateMemos, setPrivateMemos] = useState<{ lineId: string; lineHandle: string; text: string; date: string }[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [blocks, setBlocks] = useState<{ blockType: string; targetId: string; label: string }[]>([]);
  const [showBlocks, setShowBlocks] = useState(false);
  const [dbFeaturedLineId, setDbFeaturedLineId] = useState<string | null>(null);
  const [dbFeaturedWeaveId, setDbFeaturedWeaveId] = useState<string | null>(null);
  const [rank, setRank] = useState<{ tier: string; percentile: number } | null>(null);
  const [showRankInfo, setShowRankInfo] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    async function load() {
      const [profileData, shelfData, weavesData, lines, saved, memos, userBlocks, dbProfile] = await Promise.all([
        fetchUserProfile(user!.id),
        fetchUserShelf(user!.id),
        fetchUserWeaves(user!.id),
        fetchUserLines(user!.id),
        fetchSavedLines(user!.id),
        fetchPrivateMemos(user!.id),
        fetchUserBlocks(user!.id),
        fetchUserDbProfile(user!.id),
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
      setUserLines(lines.map((l: any) => ({ id: l.id, shortId: l.shortId, quote: l.quote, bookTitle: l.book?.title ?? "", bookAuthor: l.book?.author ?? "" })));
      setSavedItems(saved);
      setPrivateMemos(memos);
      setBlocks(userBlocks);
      if (dbProfile) {
        setDbFeaturedLineId((dbProfile as any).featured_line_id || null);
        setDbFeaturedWeaveId((dbProfile as any).featured_weave_id || null);
      }

      setLoading(false);
      // Rank 별도 로드
      const rankData = await fetchUserRank(user!.id);
      if (mounted) setRank(rankData);
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="shelf-login-prompt">
        <div className="shelf-login-lead">서재</div>
        <div className="shelf-login-msg">머물렀던 책과 문장이 여기에 쌓입니다</div>
        <button className="shelf-login-btn" onClick={() => requireAuth()}>로그인하고 시작하기</button>
      </div>
    );
  }

  if (loading || !profile) return <LoadingBar />;

  // DB에서 지정한 대표 한줄, 없으면 가장 최근
  const featuredLine = dbFeaturedLineId
    ? userLines.find(l => l.id === dbFeaturedLineId) || (userLines.length > 0 ? userLines[0] : null)
    : (userLines.length > 0 ? userLines[0] : null);
  const featuredQuote = featuredLine?.quote;

  // DB에서 지정한 대표 노트, 없으면 첫 공개 노트
  const featuredWeave = dbFeaturedWeaveId
    ? weaves.find(w => w.id === dbFeaturedWeaveId) || weaves.find(w => w.isPublic) || null
    : weaves.find(w => w.isPublic) ?? null;

  return (
    <div className="content-fade-in" ref={topRef}>
      {/* ─── 프로필 + 액션 ─── */}
      <div className="shelf-profile-area">
        <ProfileHeader
          user={profile}
          showFollow={false}
          targetUserId={user?.id}
          featuredQuote={featuredQuote}
          featuredQuoteId={featuredLine?.shortId}
          onQuoteClick={(id) => navigate(`/@${profile.handle.replace(/^@/, "")}/lines/${id}`)}
          featuredWeave={featuredWeave ? { id: featuredWeave.id, title: featuredWeave.title, coverColor: featuredWeave.coverColor } : null}
          onWeaveClick={(id) => {
            const w = weaves.find(wv => wv.id === id);
            navigate(`/@${profile.handle.replace(/^@/, "")}/notes/${w?.shortId ?? id}`);
          }}
          rightActions={
            <>
              <button className="hd-bell-btn" onClick={() => navigate("/notifications")} aria-label="알림"><Icons.Bell /></button>
              <button className="hd-bell-btn" onClick={() => navigate("/settings")} aria-label="메뉴"><Icons.Menu /></button>
            </>
          }
          onRankClick={() => setShowRankInfo(true)}
        />
      </div>

      {/* ─── 1. 읽고 있는 책 ─── */}
      {shelf.length > 0 && (
        <div className="shelf-section">
          <div className="shelf-section-label">읽고 있는 책</div>
          <div className="sgrid">
            {shelf.map((b, i) => (
              <div key={i} className="sbook" style={{ background: b.color }} onClick={() => navigate(`/book/${encodeURIComponent(b.title)}?mine=1`, { state: { author: b.author } })}>
                <span className="sbtl">{b.title}</span>
                <span className="sbln">{b.lines}개</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 2. 내 노트 ─── */}
      {weaves.length > 0 && (
        <div className="shelf-section">
          <div className="shelf-section-label">노트</div>
          <div className="weave-grid" style={{ padding: "0 20px 8px" }}>
            {weaves.map(w => (
              <article key={w.id} className="weave-booklet" onClick={() => navigate(`/@${w.userHandle}/notes/${w.shortId}`)}>
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
        </div>
      )}

      {/* ─── 3. 내 글 — 문장이 먼저 보이게 ─── */}
      {userLines.length > 0 && (
        <div className="shelf-section">
          <div className="shelf-section-label">기록</div>
          <div className="shelf-lines">
            {userLines.slice(0, showMore ? userLines.length : 5).map(l => (
              <div key={l.id} className="shelf-line-card" onClick={() => navigate(`/@${profile.handle.replace(/^@/, "")}/lines/${l.shortId}`)}>
                <div className="shelf-line-quote">{l.quote}</div>
                <div className="shelf-line-src">{l.bookTitle} · {l.bookAuthor}</div>
              </div>
            ))}
            {userLines.length > 5 && !showMore && (
              <button className="shelf-show-more" onClick={() => setShowMore(true)}>
                전체 보기 ({userLines.length}개)
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── 4. 담아둔 조각 + 나의 댓글 ─── */}
      {(savedItems.length > 0 || privateMemos.length > 0) && (
        <div className="shelf-section shelf-section-muted">
          {savedItems.length > 0 && (
            <>
              <div className="shelf-section-label">담아둔 조각</div>
              <div className="shelf-lines">
                {savedItems.slice(0, 3).map(s => (
                  <div key={s.id} className="shelf-line-card" onClick={() => navigate(`/@${s.userHandle}/lines/${s.shortId}`)}>
                    <div className="shelf-line-quote">{s.quote}</div>
                    <div className="shelf-line-src">{s.book} · {s.author}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {privateMemos.length > 0 && (
            <>
              <div className="shelf-section-label" style={{ marginTop: savedItems.length > 0 ? 16 : 0 }}>나의 메모</div>
              <div className="shelf-memos" style={{ padding: "0 20px 8px" }}>
                {privateMemos.slice(0, 3).map((m, i) => (
                  <div key={i} className="shelf-memo-card" onClick={() => navigate(`/@${m.lineHandle}/lines/${m.lineId}`)}>
                    <div className="shelf-memo-text">{m.text}</div>
                    <div className="shelf-memo-src">{new Date(m.date).toLocaleDateString("ko-KR")}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 숨긴 항목 관리 */}
      {blocks.length > 0 && (() => {
        const hiddenUsers = blocks.filter(b => b.blockType === "user");
        const hiddenBooks = blocks.filter(b => b.blockType === "book");
        const hiddenLines = blocks.filter(b => b.blockType === "underline");
        const renderItem = (b: typeof blocks[0], i: number) => (
          <div key={i} className="shelf-block-item">
            <span className="shelf-block-label">{b.label}</span>
            <button className="shelf-block-undo" onClick={async () => {
              const ok = await unblock(user!.id, b.blockType, b.targetId);
              if (ok) setBlocks(prev => prev.filter(p => !(p.blockType === b.blockType && p.targetId === b.targetId)));
            }}>해제</button>
          </div>
        );
        return (
          <div className="shelf-secondary" style={{ marginTop: 16 }}>
            <div className="sh" style={{ cursor: "pointer" }} onClick={() => setShowBlocks(!showBlocks)}>
              <span className="sl">숨긴 항목</span>
              <span className="sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {blocks.length}개
                <span className={`detail-others-chevron ${showBlocks ? "open" : ""}`} style={{ display: "inline-flex" }}><Icons.ChevD /></span>
              </span>
            </div>
            {showBlocks && (
              <div style={{ padding: "0 20px 12px" }}>
                {hiddenUsers.length > 0 && (
                  <>
                    <div className="shelf-block-category">숨긴 작가</div>
                    {hiddenUsers.map(renderItem)}
                  </>
                )}
                {hiddenBooks.length > 0 && (
                  <>
                    <div className="shelf-block-category">숨긴 책</div>
                    {hiddenBooks.map(renderItem)}
                  </>
                )}
                {hiddenLines.length > 0 && (
                  <>
                    <div className="shelf-block-category">숨긴 글</div>
                    {hiddenLines.map(renderItem)}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {showRankInfo && (
        <div className="ov" onClick={() => setShowRankInfo(false)}>
          <div className="sht" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="shndl" />
            <div style={{ fontFamily: "var(--sn)", fontSize: 15, fontWeight: 600, marginBottom: 16, color: "var(--t1)" }}>
              등급 안내
            </div>
            <div style={{ fontFamily: "var(--sn)", fontSize: 13, color: "var(--t2)", lineHeight: 1.8 }}>
              <div style={{ marginBottom: 16 }}>
                이듬에서의 활동을 바탕으로 등급이 부여됩니다.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--bgW)" }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>깊이 남기는</div>
                  <div style={{ fontSize: 12, color: "var(--t3)" }}>상위 5% · 꾸준히 한줄과 노트를 남기는 사람</div>
                </div>
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--bgW)" }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>꾸준히 쌓는</div>
                  <div style={{ fontSize: 12, color: "var(--t3)" }}>상위 20% · 기록의 습관이 잡힌 사람</div>
                </div>
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--bgW)" }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>기록하는</div>
                  <div style={{ fontSize: 12, color: "var(--t3)" }}>이듬에서 기록을 시작한 사람</div>
                </div>
              </div>
              <div style={{ marginTop: 16, fontSize: 11, color: "var(--t3)", opacity: 0.7 }}>
                기준: 한줄 기록 수 + 노트 수
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
