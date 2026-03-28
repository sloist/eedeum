import { useParams, useNavigate } from "react-router-dom";
import { ProfileHeader } from "../components/ProfileHeader";
import { PostCard } from "../components/PostCard";
import { Icons } from "../components/Icons";
import { USERS, userPosts, type Post, type Book } from "../data";

interface UserPageProps {
  onShare: (post: Post) => void;
  toast: (msg: string) => void;
}

export function UserPage({ onShare, toast }: UserPageProps) {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  if (!userId || !USERS[userId]) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--t3)" }}>사용자를 찾을 수 없습니다</div>;
  }

  const u = USERS[userId];
  const up = userPosts(userId);
  const isMe = userId === "me";

  const onUser = (uid: string) => navigate(`/user/${uid}`);
  const onBook = (book: Book) => navigate(`/book/${encodeURIComponent(book.title)}`, { state: { author: book.author } });

  return (
    <>
      <button className="backbtn" onClick={() => navigate(-1)}><Icons.Back /> 뒤로</button>
      <ProfileHeader user={u} showFollow={!isMe} />
      <div className="sh"><span className="sl">{u.name}의 밑줄</span><span className="sm">{up.length}개</span></div>
      <div className="uposts">
        {up.length > 0
          ? up.map((p, i) => <PostCard key={p.id} post={p} idx={i} onUser={onUser} onBook={onBook} onShare={onShare} toast={toast} />)
          : <div style={{ padding: 40, textAlign: "center", color: "var(--t3)", fontSize: 13 }}>아직 밑줄이 없습니다</div>
        }
      </div>
    </>
  );
}
