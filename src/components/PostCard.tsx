import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Post } from "../data";

interface PostCardProps {
  post: Post;
  onDetail: (postId: string, handle: string) => void;
  requireAuth?: () => void;
  isLoggedIn?: boolean;
  isMine?: boolean;
  onHidePerson?: (userId: string) => void;
  onHideBook?: (bookId: string) => void;
  onNotInterested?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onUndoHide?: (postId: string, type: string, targetId: string) => void;
  followingIds?: Set<string>;
}

export function PostCard({ post, onDetail, isLoggedIn, isMine, onHidePerson, onHideBook, onNotInterested, onDelete, onUndoHide, requireAuth, followingIds }: PostCardProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [hideStep, setHideStep] = useState<"reason" | null>(null);
  const [pendingHide, setPendingHide] = useState<{ label: string; type: string; targetId: string; action?: (id: string) => void } | null>(null);
  const [hidden, setHidden] = useState<{ reason: string; type: string; targetId: string } | null>(null);
  const [hideReason, setHideReason] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handle = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setHideStep(null);
      }
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => { document.removeEventListener("mousedown", handle); document.removeEventListener("touchstart", handle); };
  }, [showMenu]);

  const startHide = (e: React.MouseEvent, label: string, type: string, targetId: string, action?: (id: string) => void) => {
    e.stopPropagation();
    setPendingHide({ label, type, targetId, action });
    setHideStep("reason");
  };

  const confirmHide = (e: React.MouseEvent, reason: string) => {
    e.stopPropagation();
    if (!pendingHide) return;
    setShowMenu(false);
    setHideStep(null);
    setHideReason(reason);
    setHidden({ reason: pendingHide.label, type: pendingHide.type, targetId: pendingHide.targetId });
    pendingHide.action?.(pendingHide.targetId);
    setPendingHide(null);
  };

  if (hidden) {
    return (
      <div className="feed-item feed-item-hidden">
        <div className="feed-hidden-left">
          <span className="feed-hidden-msg">{hidden.reason}</span>
          {hideReason && <span className="feed-hidden-reason">{hideReason}</span>}
        </div>
        <button
          className="feed-hidden-undo"
          onClick={(e) => {
            e.stopPropagation();
            onUndoHide?.(post.id, hidden.type, hidden.targetId);
            setHidden(null);
            setHideReason("");
          }}
        >
          되돌리기
        </button>
      </div>
    );
  }

  return (
    <div className="feed-item" data-post-id={post.id} onClick={() => onDetail(post.shortId, post.userHandle ?? "")}>
      {isMine && !post.repostOf && <span className="feed-mine-badge">내 기록</span>}
      {post.repostOf && (
        <span className="feed-repost-badge" onClick={(e) => { e.stopPropagation(); navigate(`/@${post.repostOf!.userHandle.replace(/^@/, "")}`); }}>
          ↻ {post.repostOf.userName}님의 한줄
        </span>
      )}
      <span className="feed-quote">{post.quote}</span>

      {post.feeling && (
        <span className="feed-feeling">{post.feeling}</span>
      )}

      <div className="feed-meta">
        <span className="feed-src"><span style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); navigate(`/book/${encodeURIComponent(post.book.title)}`, { state: { author: post.book.author } }); }}>{post.book.title}</span> · {post.book.author}</span>
        <div className="feed-meta-right">
          <span className={`feed-author${followingIds?.has(post.userId) && !isMine ? " feed-author-following" : ""}`}>{post.userName}</span>
          <div className="feed-more-wrap" ref={menuRef}>
            <button
              className="feed-more-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoggedIn) { requireAuth?.(); return; }
                setShowMenu(!showMenu);
                setHideStep(null);
              }}
              aria-label="더보기"
            >
              ···
            </button>
            {showMenu && (
              <div className="feed-more-menu">
                {isMine ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); navigate(`/write`, { state: { editId: post.id, editQuote: post.quote, editFeeling: post.feeling, editBookTitle: post.book.title, editBookAuthor: post.book.author, editPage: post.book.page } }); }}>
                      수정
                    </button>
                    <button className="danger" onClick={(e) => { e.stopPropagation(); onDelete?.(post.id); setShowMenu(false); }}>
                      삭제
                    </button>
                  </>
                ) : hideStep === "reason" ? (
                  <>
                    <button className="feed-more-back" onClick={(e) => { e.stopPropagation(); setHideStep(null); }}>
                      ← 이유 선택
                    </button>
                    <button onClick={(e) => confirmHide(e, "내 취향이 아니에요")}>내 취향이 아니에요</button>
                    <button onClick={(e) => confirmHide(e, "이미 읽은 책이에요")}>이미 읽은 책이에요</button>
                    <button onClick={(e) => confirmHide(e, "비슷한 글이 많아요")}>비슷한 글이 많아요</button>
                    <button onClick={(e) => confirmHide(e, "")}>이유 없음</button>
                  </>
                ) : (
                  <>
                    <button onClick={(e) => startHide(e, "이 작가의 한줄을 숨겼습니다", "user", post.userId, onHidePerson)}>
                      이 작가 안 보기
                    </button>
                    <button onClick={(e) => startHide(e, "이 게시글을 숨겼습니다", "underline", post.id, onNotInterested)}>
                      관심 없음
                    </button>
                    <button onClick={(e) => startHide(e, "이 책의 한줄을 숨겼습니다", "book", post.bookId || "", onHideBook)}>
                      이 책 안 보기
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
