import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PostCard } from "../components/PostCard";
import { LoadingBar } from "../components/LoadingBar";
import type { Post, Book } from "../data";
import { fetchFeedPosts, fetchLineAsFeedPost, fetchUserBlocks, blockUser, blockBook, blockUnderline, deleteUnderline, fetchFollowingIds, type FeedPost } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { trackEvent } from "../lib/tracking";

interface HomePageProps {
  onShare: (post: Post) => void;
  toast: (msg: string) => void;
  feedKey?: number;
  newPostId?: string | null;
  onNewPostHandled?: () => void;
  requireAuth?: () => void;
}

function feedPostToPost(fp: FeedPost): Post {
  return {
    id: fp.id, shortId: fp.shortId, userId: fp.userId, userName: fp.userName, userAvatar: fp.userAvatar,
    userHandle: fp.userHandle, book: fp.book, bookId: fp.bookId, quote: fp.quote,
    feeling: fp.feeling, coverColor: fp.coverColor, timestamp: fp.timestamp,
    likes: fp.likes, topic: fp.topic,
    echoes: fp.echoes.map(e => ({ userId: e.userId, userName: e.userName, text: e.text, isSameLine: e.isSameLine })),
    otherLines: fp.otherLines.map(o => ({ userId: o.userId, userName: o.userName, quote: o.quote, page: o.page })),
    sameLineCount: fp.sameLineCount,
  };
}

// (HomePage는 /line/ 이동 시에도 마운트 유지됨 — 캐시 불필요)

export function HomePage({ toast, feedKey, newPostId, onNewPostHandled, requireAuth }: HomePageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const loadFeed = useCallback(async () => {
    const feedData = await fetchFeedPosts();
    let filtered = feedData;
    if (user) {
      fetchFollowingIds(user.id).then(ids => setFollowingIds(new Set(ids)));
      const blocks = await fetchUserBlocks(user.id);
      if (blocks.length > 0) {
        const blockedUsers = new Set(blocks.filter(b => b.blockType === "user").map(b => b.targetId));
        const blockedBooks = new Set(blocks.filter(b => b.blockType === "book").map(b => b.targetId));
        const blockedLines = new Set(blocks.filter(b => b.blockType === "underline").map(b => b.targetId));
        filtered = feedData.filter(p =>
          !blockedUsers.has(p.userId) &&
          !blockedBooks.has(p.bookId) &&
          !blockedLines.has(p.id)
        );
      }
    }
    setPosts(filtered.map(feedPostToPost));
  }, [user, feedKey]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadFeed().then(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [feedKey, loadFeed]);

  useEffect(() => {
    if (!newPostId) return;
    (async () => {
      const fp = await fetchLineAsFeedPost(newPostId);
      if (fp) setPosts(prev => [feedPostToPost(fp), ...prev.filter(p => p.id !== newPostId)]);
      onNewPostHandled?.();
    })();
  }, [newPostId, onNewPostHandled]);

  // 체류 추적
  useEffect(() => {
    if (!user || !feedRef.current || posts.length === 0) return;
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const postId = (entry.target as HTMLElement).dataset.postId;
          if (!postId) continue;
          if (entry.isIntersecting) {
            const timer = setTimeout(() => {
              trackEvent(user.id, {
                eventType: "underline_impression", targetType: "underline", targetId: postId,
                source: "feed", context: "home_feed", metadata: { dwell_ms: 2000 },
              });
              timers.delete(postId);
            }, 2000);
            timers.set(postId, timer);
          } else {
            const timer = timers.get(postId);
            if (timer) { clearTimeout(timer); timers.delete(postId); }
          }
        }
      },
      { threshold: 0.5 }
    );
    const items = feedRef.current.querySelectorAll("[data-post-id]");
    items.forEach(el => observer.observe(el));
    return () => { observer.disconnect(); timers.forEach(t => clearTimeout(t)); };
  }, [user, posts]);

  const onBook = (book: Book) => navigate(`/book/${encodeURIComponent(book.title)}`, { state: { author: book.author, from: "feed" } });
  const onDetail = (postId: string) => {
    if (user) {
      trackEvent(user.id, {
        eventType: "underline_detail_view", targetType: "underline", targetId: postId,
        source: "feed", context: "home_feed",
      });
    }
    navigate(`/line/${postId}`, { state: { from: "feed", backgroundLocation: location } });
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;
    if (!window.confirm("이 기록을 삭제할까요?")) return;
    const ok = await deleteUnderline(postId);
    if (ok) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast("삭제되었습니다");
    }
  };

  const handleHidePerson = async (userId: string) => {
    if (!user) return;
    const ok = await blockUser(user.id, userId);
    if (ok) {
      setPosts(prev => prev.filter(p => p.userId !== userId));
      toast("이 작가의 한줄이 더 이상 표시되지 않습니다");
    }
  };
  const handleHideBook = async (bookId: string) => {
    if (!user) return;
    const ok = await blockBook(user.id, bookId);
    if (ok) {
      setPosts(prev => prev.filter(p => p.bookId !== bookId));
      toast("이 책의 한줄이 더 이상 표시되지 않습니다");
    }
  };
  const handleNotInterested = async (postId: string) => {
    if (!user) return;
    const ok = await blockUnderline(user.id, postId);
    if (ok) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast("관심 없음으로 표시했습니다");
    }
  };

  const buildFlow = () => {
    const flow: React.ReactNode[] = [];
    const shownClusterBooks = new Set<string>();
    posts.forEach((p, i) => {
      flow.push(
        <PostCard key={p.id} post={p} onDetail={onDetail} requireAuth={requireAuth} isLoggedIn={!!user} isMine={user?.id === p.userId} onHidePerson={handleHidePerson} onHideBook={handleHideBook} onNotInterested={handleNotInterested} onDelete={handleDelete} followingIds={followingIds} />
      );
      const next = posts[i + 1];
      if (next && next.book.title === p.book.title && !shownClusterBooks.has(p.book.title)) {
        shownClusterBooks.add(p.book.title);
        const sameBookPosts = posts.filter(pp => pp.book.title === p.book.title && pp.id !== p.id);
        if (sameBookPosts.length > 0) {
          const book = p.book;
          flow.push(
            <div key={`fbc-${book.title}-${i}`} className="fbc" onClick={() => onBook(book)}>
              <div className="fbc-lines">
                {sameBookPosts.slice(0, 2).map((gp, gi) => (
                  <div key={gi} className="fbc-line">{gp.quote}</div>
                ))}
              </div>
              <div className="fbc-src">{book.title} · {book.author}</div>
            </div>
          );
        }
      }
    });
    return flow;
  };

  if (loading) return <LoadingBar />;

  return (
    <div>
      {posts.length === 0 ? (
        <div className="empty-cta">
          <div className="empty-cta-quote">멈춘 문장이 머무는 곳</div>
          <div className="empty-cta-text">아직 기록된 문장이 없습니다</div>
          {user ? (
            <div className="empty-cta-sub">기록 탭에서 첫 문장을 남겨보세요</div>
          ) : (
            <>
              <div className="empty-cta-sub">책을 ��다 밑줄 친 문장, 오래 남는 한 줄을 여기에 남겨두세요</div>
              <button className="empty-cta-btn" onClick={() => requireAuth?.()}>로그인하고 시작하기</button>
            </>
          )}
        </div>
      ) : (
        <div className="feed-stream" ref={feedRef}>
          {buildFlow()}
        </div>
      )}
    </div>
  );
}
