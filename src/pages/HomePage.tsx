import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostCard } from "../components/PostCard";
import { POSTS, ALL_BOOKS, TOPICS, USERS, type Post, type Book } from "../data";

interface HomePageProps {
  onShare: (post: Post) => void;
  toast: (msg: string) => void;
}

export function HomePage({ onShare, toast }: HomePageProps) {
  const [subTab, setSubTab] = useState("following");
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredPosts = topicFilter ? POSTS.filter(p => p.topic === topicFilter) : POSTS;

  const onUser = (uid: string) => navigate(`/user/${uid}`);
  const onBook = (book: Book) => navigate(`/book/${encodeURIComponent(book.title)}`, { state: { author: book.author } });

  return (
    <>
      <div className="stabs">
        {([["팔로잉", "following"], ["발견", "discover_tab"], ["지금", "now"]] as const).map(([l, k]) => (
          <button key={k} className={`stab ${subTab === k ? "on" : ""}`} onClick={() => setSubTab(k)}>{l}</button>
        ))}
      </div>

      {subTab === "following" && (
        <>
          <div className="sh">
            <span className="sl">지금 많이 밑줄 긋는 책</span>
            <button className="sm" onClick={() => navigate("/discover")}>더보기</button>
          </div>
          <div className="hscr">
            {ALL_BOOKS.slice(0, 6).map((b, i) => (
              <div key={i} className="tchip" onClick={() => onBook(b)}>
                <div className="tbar" style={{ background: b.color }} />
                <div className="ttl">{b.title}</div>
                <div className="tau">{b.author}</div>
                <div className="tst">{(b.lines ?? 0).toLocaleString()}개의 밑줄</div>
              </div>
            ))}
          </div>
          {POSTS.map((p, i) => <PostCard key={p.id} post={p} idx={i} onUser={onUser} onBook={onBook} onShare={onShare} toast={toast} />)}
        </>
      )}

      {subTab === "discover_tab" && (
        <>
          <div className="sh"><span className="sl">주제로 찾기</span></div>
          <div className="tpscr">
            {TOPICS.map((t, i) => (
              <div key={i} className={`tpill ${topicFilter === t.label ? "on" : ""}`} onClick={() => setTopicFilter(topicFilter === t.label ? null : t.label)}>
                <span className="tpem">{t.emoji}</span><span className="tplb">{t.label}</span>
              </div>
            ))}
          </div>
          {topicFilter && <div className="sh"><span className="sl">'{topicFilter}' 관련 밑줄</span><span className="sm">{filteredPosts.length}개</span></div>}
          {filteredPosts.map((p, i) => <PostCard key={p.id} post={p} idx={i} onUser={onUser} onBook={onBook} onShare={onShare} toast={toast} />)}
        </>
      )}

      {subTab === "now" && (
        <>
          <div className="sh"><span className="sl">지금 이 순간</span></div>
          {POSTS.slice(0, 5).map((p, i) => (
            <div key={i} className="livepost" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="livebadge">방금</div>
              <div className="ptop">
                <div className="pava" style={{ background: p.coverColor }} onClick={() => onUser(p.userId)}>{USERS[p.userId].avatar}</div>
                <div className="pmeta">
                  <span className="pname" onClick={() => onUser(p.userId)}>{USERS[p.userId].name}</span>
                  <div className="pbref">밑줄을 그었습니다</div>
                </div>
              </div>
              <div className="qwrap" style={{ background: p.coverColor + "30" }}>
                <span className="qg">"</span>
                <p className="qtxt">{p.quote}</p>
                <div className="qsrc"><span>{p.book.title}</span><span className="qdot" /><span>{p.book.author}</span></div>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
