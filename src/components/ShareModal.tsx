import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { ShareCard, STYLE_LABELS, type CardStyle, type CardRatio, type CardFont } from "./ShareCard";
import type { Post } from "../data";

interface ShareModalProps {
  post: Post;
  onClose: () => void;
  toast: (msg: string) => void;
}

const STYLES: CardStyle[] = ["paper", "ink", "poster", "forest", "midnight", "warmth"];
const FONTS: { key: CardFont; label: string }[] = [
  { key: "serif", label: "세리프" },
  { key: "sans", label: "고딕" },
  { key: "handwrite", label: "손글씨" },
];

export function ShareModal({ post, onClose, toast }: ShareModalProps) {
  const [style, setStyle] = useState<CardStyle>("paper");
  const [ratio, setRatio] = useState<CardRatio>("feed");
  const [font, setFont] = useState<CardFont>("serif");
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const cardData = {
    quote: post.quote,
    book: post.book.title,
    author: post.book.author,
    user: post.userName ?? "나",
  };

  const handleSaveImage = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(b => resolve(b), "image/png")
      );
      if (blob && navigator.share && navigator.canShare?.({ files: [new File([blob], "share.png", { type: "image/png" })] })) {
        const file = new File([blob], `이듬_${post.book.title.slice(0, 10)}.png`, { type: "image/png" });
        await navigator.share({ files: [file] });
        toast("공유 완료");
      } else {
        const link = document.createElement("a");
        link.download = `이듬_${post.book.title.slice(0, 10)}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast("이미지가 저장되었습니다");
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") toast("잠시 후 다시 시도해보세요");
    }
    setSaving(false);
  };

  const handleCopyText = async () => {
    const text = `"${post.quote}"\n— ${post.book.title}, ${post.book.author}`;
    try {
      await navigator.clipboard.writeText(text);
      toast("문장이 복사되었습니다");
    } catch {
      toast("잠시 후 다시 시도해보세요");
    }
  };

  return (
    <div className="ov" onClick={onClose}>
      <div className="sht" onClick={e => e.stopPropagation()} style={{ maxHeight: "90vh" }}>
        <div className="shndl" />

        {/* Style picker */}
        <div className="sm-styles">
          {STYLES.map(s => (
            <button key={s} className={`sm-style-btn ${style === s ? "on" : ""}`} onClick={() => setStyle(s)}>
              {STYLE_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Ratio */}
        <div className="sm-styles">
          <button className={`sm-style-btn ${ratio === "square" ? "on" : ""}`} onClick={() => setRatio("square")}>1:1</button>
          <button className={`sm-style-btn ${ratio === "feed" ? "on" : ""}`} onClick={() => setRatio("feed")}>4:5</button>
          <button className={`sm-style-btn ${ratio === "story" ? "on" : ""}`} onClick={() => setRatio("story")}>9:16</button>
        </div>

        {/* Font picker */}
        <div className="sm-styles" style={{ marginBottom: 12 }}>
          {FONTS.map(f => (
            <button key={f.key} className={`sm-style-btn ${font === f.key ? "on" : ""}`} onClick={() => setFont(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Card preview */}
        <div className="sm-card-preview" ref={cardRef}>
          <ShareCard data={cardData} style={style} ratio={ratio} font={font} />
        </div>

        {/* Actions */}
        <div className="share-save-buttons">
          <button className="share-save-btn share-save-btn-primary" onClick={handleSaveImage} disabled={saving}>
            {saving ? "저장 중..." : "이미지 저장"}
          </button>
          <button className="share-save-btn" onClick={handleCopyText}>
            문장 복사
          </button>
        </div>
      </div>
    </div>
  );
}
