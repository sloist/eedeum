import { useNavigate } from "react-router-dom";
import { ALL_BOOKS, TOPICS, USERS } from "../data";
import { Icons } from "./Icons";
import { useState } from "react";

interface RightSidebarProps {
  onSearch: () => void;
}

export function RightSidebar({ onSearch }: RightSidebarProps) {
  const navigate = useNavigate();
  const [topicFilter, setTopicFilter] = useState<string | null>(null);

  const trendingBooks = ALL_BOOKS.slice(0, 5);
  const recommendedUsers = [
    USERS.yoonseo,
    USERS.jaehyun,
    USERS.soyul,
  ];
  const recommendedIds = ["yoonseo", "jaehyun", "soyul"];

  return (
    <aside className="right-sidebar">
      <div className="rs-search" onClick={onSearch}>
        <Icons.Search />
        <span>책, 작가, 문장 검색</span>
      </div>

      <div className="rs-section">
        <div className="rs-title">지금 많이 밑줄 긋는 책</div>
        {trendingBooks.map((b, i) => (
          <div
            key={i}
            className="rs-book-row"
            onClick={() => navigate(`/book/${encodeURIComponent(b.title)}`, { state: { author: b.author } })}
          >
            <div className="rs-book-cover" style={{ background: b.color }}>
              <span>{b.title.slice(0, 2)}</span>
            </div>
            <div className="rs-book-info">
              <div className="rs-book-title">{b.title}</div>
              <div className="rs-book-author">{b.author}</div>
            </div>
            <div className="rs-book-count">{(b.lines ?? 0).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="rs-section">
        <div className="rs-title">주제로 찾기</div>
        <div className="rs-topics">
          {TOPICS.map((t, i) => (
            <button
              key={i}
              className={`rs-topic ${topicFilter === t.label ? "on" : ""}`}
              onClick={() => setTopicFilter(topicFilter === t.label ? null : t.label)}
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rs-section">
        <div className="rs-title">추천 유저</div>
        {recommendedUsers.map((u, i) => (
          <div
            key={i}
            className="rs-user-row"
            onClick={() => navigate(`/user/${recommendedIds[i]}`)}
          >
            <div className="rs-user-avatar">{u.avatar}</div>
            <div className="rs-user-info">
              <div className="rs-user-name">{u.name}</div>
              <div className="rs-user-handle">{u.handle}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
