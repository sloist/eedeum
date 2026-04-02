import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PostCard } from "../components/PostCard";
import { LoadingBar } from "../components/LoadingBar";
import type { Post, Book } from "../data";
import { fetchFeedPosts, fetchLineAsFeedPost, type FeedPost } from "../lib/api";

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
    id: fp.id, userId: fp.userId, userName: fp.userName, userAvatar: fp.userAvatar,
    userHandle: fp.userHandle, book: fp.book, bookId: fp.bookId, quote: fp.quote,
    feeling: fp.feeling, coverColor: fp.coverColor, timestamp: fp.timestamp,
    likes: fp.likes, topic: fp.topic,
    echoes: fp.echoes.map(e => ({ userId: e.userId, userName: e.userName, text: e.text, isSameLine: e.isSameLine })),
    otherLines: fp.otherLines.map(o => ({ userId: o.userId, userName: o.userName, quote: o.quote, page: o.page })),
    sameLineCount: fp.sameLineCount,
  };
}

export function HomePage({ onShare, toast, feedKey, newPostId, onNewPostHandled, requireAuth }: HomePageProps) {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    const feedData = await fetchFeedPosts();
    setPosts(feedData.map(feedPostToPost));
  }, []);

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


  const onUser = (uid: string) => navigate(`/user/${uid}`);
  const onBook = (book: Book) => navigate(`/book/${encodeURIComponent(book.title)}`, { state: { author: book.author } });
  const onDetail = (postId: string) => navigate(`/line/${postId}`);

  // Build mixed flow with book clusters
  const buildFlow = () => {
    const bookGroups: Record<string, Post[]> = {};
    posts.forEach(p => {
      const key = p.book.title;
      if (!bookGroups[key]) bookGroups[key] = [];
      bookGroups[key].push(p);
    });
    const clusterQueue = Object.entries(bookGroups)
      .filter(([, ps]) => ps.length >= 2)
      .map(([, ps]) => ps);

    const flow: React.ReactNode[] = [];
    let clusterIdx = 0;

    posts.forEach((p, i) => {
      flow.push(
        <PostCard key={p.id} post={p} idx={i} onUser={onUser} onBook={onBook} onShare={onShare} onDetail={onDetail} toast={toast} requireAuth={requireAuth} />
      );
      if ((i + 1) % 4 === 0 && clusterIdx < clusterQueue.length) {
        const group = clusterQueue[clusterIdx];
        const book = group[0].book;
        clusterIdx++;
        flow.push(
          <div key={`fbc-${book.title}`} className="fbc" onClick={() => onBook(book)}>
            <div className="fbc-label">이 책의 다른 한줄</div>
            <div className="fbc-lines">
              {group.slice(0, 3).map((gp, gi) => (
                <div key={gi} className="fbc-line">{gp.quote}</div>
              ))}
            </div>
            <div className="fbc-src">
              {book.title} · {book.author}
              {group.length > 3 && ` · 외 ${group.length - 3}개`}
            </div>
          </div>
        );
      }
    });
    return flow;
  };

  if (loading) return <LoadingBar />;

  return (
    <div className="content-fade-in">
      {/* Feed stream */}
      {posts.length === 0 ? (
        <div className="empty-cta">
          <div className="empty-cta-text">아직 기록된 문장이 없습니다</div>
        </div>
      ) : (
        <div className="feed-stream">
          {buildFlow()}
        </div>
      )}
    </div>
  );
}
