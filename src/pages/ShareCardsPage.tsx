import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../components/Icons";
import { ShareCard, COLOR_THEMES, STYLE_LABELS, type CardStyle, type CardRatio } from "../components/ShareCard";

const SAMPLE_QUOTES = [
  { quote: "감정을 모른다는 건,\n세상이 조용하다는 뜻이었다.", book: "아몬드", author: "손원평", user: "윤서" },
  { quote: "새는 알에서 나오려고\n투쟁한다.", book: "데미안", author: "헤르만 헤세", user: "재현" },
  { quote: "비교는 기쁨을 훔치는\n도둑이다.", book: "나는 나로 살기로 했다", author: "김수현", user: "소율" },
  { quote: "여행은 나를\n낯선 나에게 데려다준다.", book: "여행의 이유", author: "김영하", user: "하은" },
];

const STYLES: CardStyle[] = ["A", "B", "C", "D", "E", "F"];

export function ShareCardsPage() {
  const navigate = useNavigate();
  const [ratio, setRatio] = useState<CardRatio>("feed");
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const q = SAMPLE_QUOTES[quoteIdx];

  return (
    <div className="sc-page">
      <button className="backbtn" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
        <Icons.Back /> 뒤로
      </button>

      <div className="sc-page-title">공유 카드 디자인</div>
      <div className="sc-page-sub">인스타에 올렸을 때 "이거 뭐야"를 만드는 한 장</div>

      <div className="sc-controls">
        <div className="sc-ctrl-group">
          <button className={`sc-ctrl-btn ${ratio === "feed" ? "on" : ""}`} onClick={() => setRatio("feed")}>피드 4:5</button>
          <button className={`sc-ctrl-btn ${ratio === "story" ? "on" : ""}`} onClick={() => setRatio("story")}>스토리 9:16</button>
        </div>
        <div className="sc-ctrl-group">
          {COLOR_THEMES.map((c, i) => (
            <button key={i} className={`sc-ctrl-btn ${colorIdx === i ? "on" : ""}`} onClick={() => setColorIdx(i)}>{c.name}</button>
          ))}
        </div>
      </div>

      <div className="sc-quote-nav">
        {SAMPLE_QUOTES.map((_, i) => (
          <div key={i} className={`sc-quote-dot ${quoteIdx === i ? "on" : ""}`} onClick={() => setQuoteIdx(i)} />
        ))}
      </div>
      <div style={{ height: 16 }} />

      <div className="sc-card-grid">
        {STYLES.map((s) => (
          <div key={s} className="sc-card-col">
            <div className="sc-card-label">
              {STYLE_LABELS[s]} <span className="sc-card-label-sub">{s}</span>
            </div>
            <ShareCard data={q} style={s} ratio={ratio} colorIdx={colorIdx} />
          </div>
        ))}
      </div>
    </div>
  );
}
