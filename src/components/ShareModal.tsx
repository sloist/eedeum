import { useState } from "react";
import { ShareCard, COLOR_THEMES, STYLE_LABELS, type CardStyle, type CardRatio } from "./ShareCard";
import { USERS, type Post } from "../data";

interface ShareModalProps {
  post: Post;
  onClose: () => void;
  toast: (msg: string) => void;
}

const STYLES: CardStyle[] = ["A", "B", "C", "D", "E", "F"];

export function ShareModal({ post, onClose, toast }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [style, setStyle] = useState<CardStyle>("A");
  const [ratio, setRatio] = useState<CardRatio>("feed");
  const [colorIdx, setColorIdx] = useState(0);

  const user = USERS[post.userId];
  const cardData = {
    quote: post.quote,
    book: post.book.title,
    author: post.book.author,
    user: user?.name ?? "나",
  };

  return (
    <div className="ov" onClick={onClose}>
      <div className="sht" onClick={e => e.stopPropagation()} style={{ maxHeight: "90vh" }}>
        <div className="shndl" />
        <div className="shtl">공유하기</div>

        {/* Style picker */}
        <div className="sm-styles">
          {STYLES.map(s => (
            <button
              key={s}
              className={`sm-style-btn ${style === s ? "on" : ""}`}
              onClick={() => setStyle(s)}
            >
              {STYLE_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Ratio toggle */}
        <div className="sm-ratio-toggle">
          <button className={`sm-ratio-btn ${ratio === "feed" ? "on" : ""}`} onClick={() => setRatio("feed")}>피드 4:5</button>
          <button className={`sm-ratio-btn ${ratio === "story" ? "on" : ""}`} onClick={() => setRatio("story")}>스토리 9:16</button>
        </div>

        {/* Color theme (only for style D) */}
        {style === "D" && (
          <div className="sm-styles" style={{ marginBottom: 14 }}>
            {COLOR_THEMES.map((c, i) => (
              <button
                key={i}
                className={`sm-style-btn ${colorIdx === i ? "on" : ""}`}
                onClick={() => setColorIdx(i)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Card preview */}
        <div className="sm-card-preview">
          <ShareCard data={cardData} style={style} ratio={ratio} colorIdx={colorIdx} />
        </div>

        {/* Share buttons */}
        <div className="shrmod">
          <div className="shrico">
            <button className="shrbtn" onClick={() => toast("인스타 스토리로 공유")}>
              <div className="ic" style={{ background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}>📸</div>
              <span>스토리</span>
            </button>
            <button className="shrbtn" onClick={() => toast("인스타 피드로 공유")}>
              <div className="ic" style={{ background: "linear-gradient(45deg,#405DE6,#5851DB,#833AB4)" }}>📷</div>
              <span>피드</span>
            </button>
            <button className="shrbtn" onClick={() => toast("카카오톡으로 공유")}>
              <div className="ic" style={{ background: "#FEE500" }}>💬</div>
              <span>카카오톡</span>
            </button>
            <button className="shrbtn" onClick={() => { setCopied(true); toast("링크 복사됨"); }}>
              <div className="ic" style={{ background: "var(--bgW)" }}>🔗</div>
              <span>링크 복사</span>
            </button>
          </div>
          {copied && <div className="cpied">✓ 복사되었습니다</div>}
        </div>
      </div>
    </div>
  );
}
