import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Post } from "../data";

interface PostCardProps {
  post: Post;
  onDetail: (postId: string) => void;
  requireAuth?: () => void;
  isLoggedIn?: boolean;
  isMine?: boolean;
  onHidePerson?: (userId: string) => void;
  onHideBook?: (bookId: string) => void;
  onNotInterested?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  followingIds?: Set<string>;
}

export function PostCard({ post, onDetail, isLoggedIn, isMine, onHidePerson, onHideBook, onNotInterested, onDelete, requireAuth, followingIds }: PostCardProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handle = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => { document.removeEventListener("mousedown", handle); document.removeEventListener("touchstart", handle); };
  }, [showMenu]);

  return (
    <div className="feed-item" data-post-id={post.id} onClick={() => onDetail(post.id)}>
      {isMine && <span className="feed-mine-badge">내 기록</span>}
      <span className="feed-quote">{post.quote}</span>

      {post.feeling && (
        <span className="feed-feeling">{post.feeling}</span>
      )}

      <div className="feed-meta">
        <span className="feed-src">{post.book.title} · {post.book.author}</span>
        <div className="feed-meta-right">
          <span className={`feed-author${followingIds?.has(post.userId) && !isMine ? " feed-author-following" : ""}`}>{post.userName}</span>
          <div className="feed-more-wrap" ref={menuRef}>
            <button
              className="feed-more-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoggedIn) { requireAuth?.(); return; }
                setShowMenu(!showMenu);
              }}
              aria-label="더보기"
            >
              ···
            </button>
            {showMenu && (
              <div className="feed-more-menu">
                {isMine ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); navigate(`/write`, { state: { editId: post.id, editQuote: post.quote, editFeeling: post.feeling, editBookTitle: post.book.title, editBookAuthor: post.book.author } }); }}>
                      수정
                    </button>
                    <button className="danger" onClick={(e) => { e.stopPropagation(); onDelete?.(post.id); setShowMenu(false); }}>
                      삭제
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); onHidePerson?.(post.userId); setShowMenu(false); }}>
                      이 작가 안 보기
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onNotInterested?.(post.id); setShowMenu(false); }}>
                      관심 없음
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onHideBook?.(post.bookId || ""); setShowMenu(false); }}>
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
