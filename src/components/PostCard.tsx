import { useState, useRef, useEffect } from "react";
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
}

export function PostCard({ post, onDetail, isLoggedIn, isMine, onHidePerson, onHideBook, onNotInterested, requireAuth }: PostCardProps) {
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
      <span className="feed-quote">{post.quote}</span>

      {post.feeling && (
        <span className="feed-feeling">{post.feeling}</span>
      )}

      <div className="feed-meta">
        <span className="feed-src">{post.book.title} · {post.book.author}</span>
        <div className="feed-meta-right">
          <span className="feed-author">{post.userName}</span>
          {!isMine && (
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
                  <button onClick={(e) => { e.stopPropagation(); onHidePerson?.(post.userId); setShowMenu(false); }}>
                    이 사람 안 보기
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onNotInterested?.(post.id); setShowMenu(false); }}>
                    관심 없음
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onHideBook?.(post.bookId || ""); setShowMenu(false); }}>
                    이 책 안 보기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
