import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { fetchWeaveDetail, fetchWeaveBlocks, deleteWeave, fetchUserWeaves } from "../lib/api";
import { Icons } from "../components/Icons";
import { trackEvent } from "../lib/tracking";

interface WeaveBlock {
  id: string;
  type: "underline" | "note" | "divider";
  position: number;
  content: string | null;
  underline: {
    id: string;
    quote: string;
    page: number;
    feeling: string | null;
    userName: string;
    bookTitle: string;
    bookAuthor: string;
  } | null;
}

interface WeaveInfo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  coverColor: string;
  isPublic: boolean;
  userName: string;
}

export function WeaveReaderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [weave, setWeave] = useState<WeaveInfo | null>(null);
  const [blocks, setBlocks] = useState<WeaveBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [otherWeaves, setOtherWeaves] = useState<{ id: string; title: string; coverColor: string; blockCount: number }[]>([]);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");

  const totalPages = blocks.length + 2; // cover + blocks + footer
  const progress = totalPages > 1 ? (currentPage / (totalPages - 1)) * 100 : 0;

  useEffect(() => {
    if (!showMenu) return;
    const handleClick = () => setShowMenu(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showMenu]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    async function load() {
      const [detail, blockData] = await Promise.all([
        fetchWeaveDetail(id!),
        fetchWeaveBlocks(id!),
      ]);
      if (!mounted) return;
      if (detail) {
        setWeave(detail as WeaveInfo);
        const authorWeaves = await fetchUserWeaves(detail.userId);
        if (mounted) {
          setOtherWeaves(
            authorWeaves
              .filter(w => w.id !== id && w.isPublic)
              .map(w => ({ id: w.id, title: w.title, coverColor: w.coverColor, blockCount: w.blockCount }))
          );
        }
      }
      setBlocks(blockData);
      setLoading(false);
      if (user && detail) {
        trackEvent(user.id, {
          eventType: "weave_view", targetType: "weave", targetId: id!,
          source: "weave", metadata: { block_count: blockData.length },
        });
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  const isOwner = user && weave && user.id === weave.userId;

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("이 노트를 삭제하시겠습니까?")) return;
    await deleteWeave(id);
    navigate("/notes", { replace: true });
  };

  // 페이지 전환 — fade out → change → fade in
  const pageRef = useRef<HTMLDivElement>(null);
  const goToPage = useCallback((target: number) => {
    if (target < 0 || target >= totalPages || target === currentPage) return;
    setFadeState("out");
    setTimeout(() => {
      setCurrentPage(target);
      setFadeState("in");
      pageRef.current?.scrollTo(0, 0);
    }, 150);
  }, [currentPage, totalPages]);

  const goNext = useCallback(() => goToPage(currentPage + 1), [goToPage, currentPage]);
  const goPrev = useCallback(() => goToPage(currentPage - 1), [goToPage, currentPage]);

  // 키보드 + 마우스 휠
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goPrev(); }
    };
    let wheelAcc = 0;
    let wheelCooldown = false;
    let wheelResetTimer: ReturnType<typeof setTimeout>;
    const handleWheel = (e: WheelEvent) => {
      if (wheelCooldown) return;
      wheelAcc += e.deltaY;
      clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => { wheelAcc = 0; }, 200);
      if (Math.abs(wheelAcc) > 50) {
        wheelCooldown = true;
        if (wheelAcc > 0) goNext(); else goPrev();
        wheelAcc = 0;
        setTimeout(() => { wheelCooldown = false; }, 400);
      }
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(wheelResetTimer);
    };
  }, [goNext, goPrev]);

  // 터치 스와이프
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const handleStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
    const handleEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx < 0) goNext(); else goPrev();
      }
    };
    window.addEventListener("touchstart", handleStart);
    window.addEventListener("touchend", handleEnd);
    return () => { window.removeEventListener("touchstart", handleStart); window.removeEventListener("touchend", handleEnd); };
  }, [goNext, goPrev]);

  // 현재 페이지 콘텐츠 렌더
  const renderPage = () => {
    if (currentPage === 0 && weave) {
      return (
        <div className="wr-cover">
          <div className="wr-cover-title">{weave.title}</div>
          <div className="wr-color-accent" style={{ background: weave.coverColor }} />
          <div className="wr-cover-author">{weave.userName}</div>
          {weave.description && <div className="wr-cover-desc">{weave.description}</div>}
        </div>
      );
    }

    if (currentPage === totalPages - 1 && weave) {
      return (
        <div className="wr-end">
          <div className="wr-end-count">{blocks.length}개의 조각</div>
          <div className="wr-end-author-card" onClick={() => navigate(`/user/${weave.userId}`)}>
            <span className="wr-end-author-name">{weave.userName}</span>
            <span className="wr-end-author-action">가 남긴 문장 더 보기</span>
          </div>
          {otherWeaves.length > 0 && (
            <div className="wr-end-more">
              <div className="wr-end-more-label">{weave.userName}의 다른 노트</div>
              {otherWeaves.map(w => (
                <div key={w.id} className="wr-end-weave" onClick={() => navigate(`/notes/${w.id}`)}>
                  <div className="wr-end-weave-spine" style={{ background: w.coverColor }} />
                  <div className="wr-end-weave-title">{w.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    const blockIdx = currentPage - 1;
    const block = blocks[blockIdx];
    if (!block) return <div className="empty-inline">아직 조각이 없습니다</div>;

    return (
      <div className="wr-block">
        {block.type === "underline" && block.underline && (
          <>
            <div className="wr-line">
              <div className="wr-line-quote">{block.underline.quote}</div>
            </div>
            <div className="wr-line-source">
              — {block.underline.bookTitle}, {block.underline.bookAuthor}
              {block.underline.page > 0 && ` · p.${block.underline.page}`}
            </div>
          </>
        )}
        {block.type === "note" && block.content && (
          <div className="wr-note">{block.content}</div>
        )}
        {block.type === "divider" && (
          <div className="wr-divider">
            {block.content && <span className="wr-divider-text">{block.content}</span>}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="weave-reader"><div className="empty-inline">불러오는 중...</div></div>;
  if (!weave) return (
    <div className="weave-reader">
      <div className="empty-inline">노트를 찾을 수 없습니다</div>
      <div style={{ textAlign: "center" }}><button className="auth-link" onClick={() => navigate(-1)}>돌아가기</button></div>
    </div>
  );

  return (
    <div className="weave-reader">
      <div className="wr-progress" style={{ width: `${progress}%` }} />

      <div className="wr-header-bar">
        <button className="weave-back-btn" onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icons.Back />
        </button>
        <span className="wr-page-indicator">{currentPage + 1} / {totalPages}</span>
        <span style={{ flex: 1 }} />
        {isOwner && (
          <div className="wr-menu-wrap">
            <button className="wr-menu-trigger" onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}>···</button>
            {showMenu && (
              <div className="wr-menu-dropdown">
                <button className="wr-menu-item" onClick={() => { setShowMenu(false); navigate(`/notes/${id}/edit`); }}>편집하기</button>
                <button className="wr-menu-item danger" onClick={() => { setShowMenu(false); handleDelete(); }}>삭제하기</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 페이드 전환 페이지 */}
      <div ref={pageRef} className={`wr-fade-page ${fadeState === "in" ? "wr-fade-in" : "wr-fade-out"}`}>
        {renderPage()}
      </div>

      {/* 좌우 터치 영역 (데스크톱 클릭) */}
      <div className="wr-nav-zones">
        {currentPage > 0 && <div className="wr-nav-left" onClick={goPrev} />}
        {currentPage < totalPages - 1 && <div className="wr-nav-right" onClick={goNext} />}
      </div>
    </div>
  );
}
