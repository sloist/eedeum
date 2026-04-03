import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ProfileHeader } from "../components/ProfileHeader";
import { PostCard } from "../components/PostCard";
import { LoadingBar } from "../components/LoadingBar";
import { Icons } from "../components/Icons";
import type { Post, User } from "../data";
import { fetchUserProfile, fetchUserLines, fetchUserWeaves, type FeedPost } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { trackEvent } from "../lib/tracking";

export function UserPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [weaves, setWeaves] = useState<{ id: string; title: string; coverColor: string; blockCount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;

    async function load() {
      const [profileData, linesData, weavesData] = await Promise.all([
        fetchUserProfile(userId!),
        fetchUserLines(userId!),
        fetchUserWeaves(userId!),
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
      setPosts(linesData.map((fp: FeedPost) => ({
        id: fp.id,
        userId: fp.userId,
        userName: fp.userName,
        userAvatar: fp.userAvatar,
        userHandle: fp.userHandle,
        book: fp.book,
        bookId: fp.bookId,
        quote: fp.quote,
        feeling: fp.feeling,
        coverColor: fp.coverColor,
        timestamp: fp.timestamp,
        likes: fp.likes,
        topic: fp.topic,
        echoes: fp.echoes.map(e => ({ userId: e.userId, userName: e.userName, text: e.text, isSameLine: e.isSameLine })),
        otherLines: fp.otherLines.map(o => ({ userId: o.userId, userName: o.userName, quote: o.quote, page: o.page })),
        sameLineCount: fp.sameLineCount,
      })));
      setWeaves(weavesData.filter(w => w.isPublic).map(w => ({ id: w.id, title: w.title, coverColor: w.coverColor, blockCount: w.blockCount })));
      if (user && userId && user.id !== userId) {
        const from = (location.state as any)?.from || "detail";
        trackEvent(user.id, {
          eventType: "profile_view", targetType: "user", targetId: userId,
          source: from, context: "user_profile",
        });
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [userId]);

  const onDetail = (postId: string) => navigate(`/line/${postId}`);

  if (!userId) {
    return <div className="empty-inline">사용자를 찾을 수 없습니다</div>;
  }

  if (loading) {
    return (
      <>
        <button className="backbtn" onClick={() => navigate(-1)}><Icons.Back /> 뒤로</button>
        <LoadingBar />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <button className="backbtn" onClick={() => navigate(-1)}><Icons.Back /> 뒤로</button>
        <div className="empty-inline">사용자를 찾을 수 없습니다</div>
      </>
    );
  }

  return (
    <div className="content-fade-in">
      <button className="backbtn" onClick={() => navigate(-1)}><Icons.Back /> 뒤로</button>
      <ProfileHeader user={profile} showFollow={true} targetUserId={userId} />
      {weaves.length > 0 && (
        <>
          <div className="sh"><span className="sl">{profile.name}의 노트</span></div>
          <div className="user-weaves">
            {weaves.slice(0, 3).map(w => (
              <div key={w.id} className="user-weave-item" onClick={() => navigate(`/notes/${w.id}`)}>
                <div className="user-weave-spine" style={{ background: w.coverColor }} />
                <div className="user-weave-title">{w.title}</div>
                <div className="user-weave-count">{w.blockCount}개 조각</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="sh"><span className="sl">{profile.name}의 기록</span><span className="sm">{posts.length}개</span></div>
      <div className="uposts">
        {posts.length > 0
          ? posts.map((p) => <PostCard key={p.id} post={p} onDetail={onDetail} />)
          : <div className="empty-inline">아직 기록이 없습니다</div>
        }
      </div>
    </div>
  );
}
