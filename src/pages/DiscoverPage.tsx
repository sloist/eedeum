import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ALL_BOOKS, TOPICS } from "../data";

interface DiscoverPageProps {
  onSearch: () => void;
}

export function DiscoverPage({ onSearch }: DiscoverPageProps) {
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredBooks = topicFilter ? ALL_BOOKS.filter(b => b.topics?.includes(topicFilter)) : ALL_BOOKS;

  const onBook = (title: string, author: string) => {
    navigate(`/book/${encodeURIComponent(title)}`, { state: { author } });
  };

  return (
    <>
      <input className="dsinp" placeholder="책 제목, 작가, 문장으로 검색" onFocus={onSearch} />
      <div className="sh"><span className="sl">주제로 찾기</span></div>
      <div className="tpscr">
        {TOPICS.map((t, i) => (
          <div key={i} className={`tpill ${topicFilter === t.label ? "on" : ""}`} onClick={() => setTopicFilter(topicFilter === t.label ? null : t.label)}>
            <span className="tpem">{t.emoji}</span><span className="tplb">{t.label}</span>
          </div>
        ))}
      </div>
      <div className="sh">
        <span className="sl">{topicFilter ? `'${topicFilter}' 관련 책` : "밑줄이 가장 많은 책"}</span>
        <span className="sm">{filteredBooks.length}권</span>
      </div>
      {filteredBooks.map((b, i) => (
        <div key={i} className="brow" onClick={() => onBook(b.title, b.author)}>
          <div className="bcov" style={{ background: b.color }}><span className="bcovl">{b.title}</span></div>
          <div className="binf">
            <div className="bint">{b.title}</div>
            <div className="bina">{b.author} · {(b.readers ?? 0).toLocaleString()}명</div>
          </div>
          <div className="bcnt">
            <div className="bcnn">{(b.lines ?? 0).toLocaleString()}</div>
            <div className="bcnl">밑줄</div>
          </div>
        </div>
      ))}
    </>
  );
}
