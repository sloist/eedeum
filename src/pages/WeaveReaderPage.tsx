import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { fetchWeaveDetail, fetchWeaveBlocks, deleteWeave, fetchUserWeaves } from "../lib/api";
import { Icons } from "../components/Icons";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pages: cover + each block + footer
  const totalPages = blocks.length + 2; // cover + blocks + footer
  const progress = totalPages > 1 ? (currentPage / (totalPages - 1)) * 100 : 0;

  const goToPage = useCallback((page: number) => {
    if (!scrollRef.current) return;
    const clamped = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(clamped);
    const target = scrollRef.current.children[clamped] as HTMLElement;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
  }, [totalPages]);

  // Observe which page is visible
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const idx = Array.from(container.children).indexOf(entry.target as HTMLElement);
            if (idx >= 0) setCurrentPage(idx);
          }
        }
      },
      { root: container, threshold: 0.5 }
    );
    Array.from(container.children).forEach(child => observer.observe(child));
    return () => observer.disconnect();
  }, [blocks]);

  // Close menu on outside click
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
        // Fetch other weaves by same author
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
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  const isOwner = user && weave && user.id === weave.userId;

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("이 노트를 삭제하시겠습니까?")) return;
    await deleteWeave(id);
    navigate("/weaves", { replace: true });
  };

  if (loading) {
    return (
      <div className="weave-reader">
        <div className="empty-inline">불러오는 중...</div>
      </div>
    );
  }

  if (!weave) {
    return (
      <div className="weave-reader">
        <div className="empty-inline">노트를 찾을 수 없습니다</div>
        <div style={{ textAlign: "center" }}>
          <button className="auth-link" onClick={() => navigate(-1)}>돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="weave-reader">
      <div className="wr-progress" style={{ width: `${progress}%` }} />

      {/* Header bar */}
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
                <button className="wr-menu-item" onClick={() => { setShowMenu(false); navigate(`/weave/${id}/edit`); }}>편집하기</button>
                <button className="wr-menu-item danger" onClick={() => { setShowMenu(false); handleDelete(); }}>삭제하기</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Horizontal swipe container */}
      <div className="wr-swipe" ref={scrollRef}>
        {/* Cover page */}
        <div className="wr-swipe-page">
          <div className="wr-cover">
            <div className="wr-cover-title">{weave.title}</div>
            <div className="wr-color-accent" style={{ background: weave.coverColor }} />
            <div className="wr-cover-author">{weave.userName}</div>
            {weave.description && <div className="wr-cover-desc">{weave.description}</div>}
          </div>
        </div>

        {/* Content pages — each block is a page */}
        {blocks.map(block => (
          <div key={block.id} className="wr-swipe-page">
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
          </div>
        ))}

        {blocks.length === 0 && (
          <div className="wr-swipe-page">
            <div className="empty-inline">아직 조각이 없습니다</div>
          </div>
        )}

        {/* Footer page */}
        <div className="wr-swipe-page">
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
                  <div key={w.id} className="wr-end-weave" onClick={() => navigate(`/weave/${w.id}`)}>
                    <div className="wr-end-weave-spine" style={{ background: w.coverColor }} />
                    <div className="wr-end-weave-title">{w.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
