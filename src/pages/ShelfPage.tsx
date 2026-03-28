import { useNavigate } from "react-router-dom";
import { ProfileHeader } from "../components/ProfileHeader";
import { USERS, MY_SHELF, POSTS, type Post } from "../data";

interface ShelfPageProps {
  onShare: (post: Post) => void;
}

export function ShelfPage({ onShare }: ShelfPageProps) {
  const navigate = useNavigate();
  const heatData = Array.from({ length: 28 }, () => {
    const r = Math.random();
    return r > 0.72 ? 4 : r > 0.5 ? 3 : r > 0.3 ? 2 : r > 0.14 ? 1 : 0;
  });

  return (
    <>
      <ProfileHeader user={USERS.me} showFollow={false} />
      <div className="shint" style={{ cursor: "pointer" }} onClick={() => navigate("/share-cards")}>최근 밑줄 · 인스타그램에 공유하기 →</div>
      <div className="scard" onClick={() => onShare(POSTS[0])}>
        <div className="sqm">"</div>
        <div className="sqt">감정을 모른다는 건,<br />세상이 조용하다는 뜻이었다.</div>
        <div className="sbot">
          <div className="sbk">아몬드<br />손원평</div>
          <div className="slogo">밑줄</div>
        </div>
      </div>
      <div className="mly">
        <div className="mlbl">3월의 기록</div>
        <div className="hmap">
          {heatData.map((lv, i) => <div key={i} className={`hcell ${lv > 0 ? `h${lv}` : ""}`} />)}
        </div>
      </div>
      <div className="sh"><span className="sl">내 서재</span><span className="sm">{MY_SHELF.length}권</span></div>
      <div className="sgrid">
        {MY_SHELF.map((b, i) => (
          <div
            key={i}
            className="sbook"
            style={{ background: b.color }}
            onClick={() => navigate(`/book/${encodeURIComponent(b.title.replace("\n", ""))}`, { state: { author: "" } })}
          >
            <span className="sbtl">{b.title}</span>
            <span className="sbln">{b.lines}개</span>
          </div>
        ))}
      </div>
    </>
  );
}
