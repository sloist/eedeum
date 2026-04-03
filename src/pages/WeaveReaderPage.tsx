import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
  shortId: string;
  userId: string;
  title: string;
  description: string | null;
  coverColor: string;
  isPublic: boolean;
  userName: string;
  userHandle: string;
}

export function WeaveReaderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handle, id } = useParams<{ handle: string; id: string }>();
  const { user } = useAuth();

  const [weave, setWeave] = useState<WeaveInfo | null>(null);
  const [blocks, setBlocks] = useState<WeaveBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const isFromEditor = !!(location.state as any)?.fromEditor;
  const [showUI, setShowUI] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [otherWeaves, setOtherWeaves] = useState<{ id: string; shortId: string; title: string; coverColor: string; blockCount: number; userHandle: string }[]>([]);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");

  // 블록을 페이지로 묶기 — 밀도 조절
  const pages = (() => {
    const result: { blocks: typeof blocks }[] = [];
    const isShortQuote = (b: typeof blocks[0]) =>
      b.type === "underline" && (b.underline?.quote.length ?? 0) < 60;
    let i = 0;
    while (i < blocks.length) {
      const curr = blocks[i];
      const next = blocks[i + 1];
      // 문장 + 바로 다음 메모 → 합침
      if (curr.type === "underline" && next?.type === "note") {
        result.push({ blocks: [curr, next] });
        i += 2;
      // 연속 짧은 문장 → 2~3개 묶기
      } else if (isShortQuote(curr) && next && isShortQuote(next)) {
        const third = blocks[i + 2];
        if (third && isShortQuote(third)) {
          result.push({ blocks: [curr, next, third] });
          i += 3;
        } else {
          result.push({ blocks: [curr, next] });
          i += 2;
        }
      } else {
        result.push({ blocks: [curr] });
        i += 1;
      }
    }
    return result;
  })();
  const totalPages = pages.length + 2; // cover + pages + footer
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
      const detail = await fetchWeaveDetail(id!);
      if (!mounted) return;
      if (detail) {
        // handle 변경 대응
        const cleanHandle = handle?.replace(/^@/, "");
        if (cleanHandle && detail.userHandle && cleanHandle !== detail.userHandle) {
          navigate(`/@${detail.userHandle}/notes/${detail.shortId}`, { replace: true });
          return;
        }
        setWeave(detail as WeaveInfo);
        // detail.id는 UUID — weave_blocks 조회에 사용
        const [blockData, authorWeaves] = await Promise.all([
          fetchWeaveBlocks(detail.id),
          fetchUserWeaves(detail.userId),
        ]);
        if (!mounted) { setLoading(false); return; }
        setBlocks(blockData);
        setOtherWeaves(
          authorWeaves
            .filter(w => w.id !== id && w.isPublic)
            .map(w => ({ id: w.id, shortId: w.shortId, title: w.title, coverColor: w.coverColor, blockCount: w.blockCount, userHandle: w.userHandle }))
        );
        trackEvent(user?.id ?? "", {
          eventType: "weave_view", targetType: "weave", targetId: detail.id,
          source: "weave", metadata: { block_count: blockData.length },
        });
      }
      setLoading(false);
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
    if (!isFromEditor) setShowUI(false);
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
          <div className="wr-end-author-card" onClick={() => navigate(`/@${weave.userHandle}`)}>
            <span className="wr-end-author-name">{weave.userName}</span>
            <span className="wr-end-author-action">가 남긴 문장 더 보기</span>
          </div>
          {otherWeaves.length > 0 && (
            <div className="wr-end-more">
              <div className="wr-end-more-label">{weave.userName}의 다른 노트</div>
              {otherWeaves.map(w => (
                <div key={w.id} className="wr-end-weave" onClick={() => navigate(`/@${w.userHandle}/notes/${w.shortId}`)}>
                  <div className="wr-end-weave-spine" style={{ background: w.coverColor }} />
                  <div className="wr-end-weave-title">{w.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    const pageIdx = currentPage - 1;
    const page = pages[pageIdx];
    if (!page) return <div className="empty-inline">아직 조각이 없습니다</div>;

    const pageBlocks = page.blocks;

    // 문장+메모 합친 페이지
    if (pageBlocks.length === 2 && pageBlocks[0].type === "underline" && pageBlocks[1].type === "note") {
      const quote = pageBlocks[0];
      const memo = pageBlocks[1];
      return (
        <div className="wr-block wr-block-combined">
          <div className="wr-line">
            <div className="wr-line-quote">{quote.underline!.quote}</div>
          </div>
          <div className="wr-line-source">
            — {quote.underline!.bookTitle}, {quote.underline!.bookAuthor}
            {quote.underline!.page > 0 && ` · p.${quote.underline!.page}`}
          </div>
          {quote.underline!.feeling && (
            <div className="wr-line-feeling">{quote.underline!.feeling}</div>
          )}
          <div className="wr-combined-memo">{memo.content}</div>
        </div>
      );
    }

    // 연속 짧은 문장 묶음
    if (pageBlocks.length >= 2 && pageBlocks.every(b => b.type === "underline")) {
      return (
        <div className="wr-block wr-block-multi">
          {pageBlocks.map((b, i) => (
            <div key={i} className="wr-multi-item">
              <div className="wr-line-quote">{b.underline!.quote}</div>
              <div className="wr-line-source">
                — {b.underline!.bookTitle}, {b.underline!.bookAuthor}
              </div>
              {b.underline!.feeling && (
                <div className="wr-line-feeling">{b.underline!.feeling}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    const block = pageBlocks[0];

    if (block.type === "underline" && block.underline) {
      return (
        <div className="wr-block wr-block-quote">
          <div className="wr-line">
            <div className="wr-line-quote">{block.underline.quote}</div>
          </div>
          <div className="wr-line-source">
            — {block.underline.bookTitle}, {block.underline.bookAuthor}
            {block.underline.page > 0 && ` · p.${block.underline.page}`}
          </div>
          {block.underline.feeling && (
            <div className="wr-line-feeling">{block.underline.feeling}</div>
          )}
        </div>
      );
    }

    if (block.type === "note" && block.content) {
      return (
        <div className="wr-block wr-block-memo">
          <div className="wr-note">{block.content}</div>
        </div>
      );
    }

    if (block.type === "divider") {
      return (
        <div className="wr-block wr-block-divider">
          <div className="wr-divider">
            {block.content && <span className="wr-divider-text">{block.content}</span>}
          </div>
        </div>
      );
    }

    return <div className="wr-block" />;
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
      <div className={`wr-progress ${showUI ? "wr-ui-visible" : "wr-ui-hidden"}`} style={{ width: `${progress}%` }} />

      <div className={`wr-header-bar ${showUI ? "wr-ui-visible" : "wr-ui-hidden"}`}>
        <button className="weave-back-btn" onClick={() => navigate(-1)}>
          <Icons.Back />
        </button>
        <span className="wr-header-title">{weave.title}</span>
        <div className="wr-header-right">
          <span className="wr-page-indicator">{currentPage + 1} / {totalPages}</span>
          {isOwner && (
            <div className="wr-menu-wrap">
              <button className="wr-menu-trigger" onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}>···</button>
              {showMenu && (
                <div className="wr-menu-dropdown">
                  <button className="wr-menu-item" onClick={() => { setShowMenu(false); navigate(`/@${handle}/notes/${id}/edit`); }}>편집하기</button>
                  <button className="wr-menu-item danger" onClick={() => { setShowMenu(false); handleDelete(); }}>삭제하기</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 페이드 전환 페이지 */}
      <div ref={pageRef} className={`wr-fade-page ${fadeState === "in" ? "wr-fade-in" : "wr-fade-out"}`}>
        {renderPage()}
      </div>

      {/* 상단 탭 = UI 토글, 좌우 = 페이지 이동 */}
      <div className="wr-nav-zones">
        <div className="wr-nav-top" onClick={() => { setShowUI(v => !v); setShowMenu(false); }} />
        {currentPage > 0 && <div className="wr-nav-left" onClick={goPrev} />}
        {currentPage < totalPages - 1 && <div className="wr-nav-right" onClick={goNext} />}
      </div>
    </div>
  );
}
