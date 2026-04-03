import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { ShareCard, STYLE_LABELS, type CardStyle, type CardRatio, type CardFont } from "./ShareCard";
import type { Post } from "../data";
import { useAuth } from "../lib/AuthContext";
import { trackEvent } from "../lib/tracking";

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
  const { user } = useAuth();
  const [style, setStyle] = useState<CardStyle>("paper");

  // share_card_create: 모달 열린 시점
  useEffect(() => {
    if (user) {
      trackEvent(user.id, {
        eventType: "share_card_create", targetType: "underline", targetId: post.id,
        source: "detail",
      });
    }
  }, []);
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
      const cardMeta = { card_style: style, card_ratio: ratio, card_font: font, has_feeling: !!post.feeling };
      const fileName = `이듬_${post.book.title.slice(0, 10)}.png`;

      // 다운로드 fallback 함수
      const downloadFallback = () => {
        const link = document.createElement("a");
        link.download = fileName;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast("카드가 저장되었습니다");
        if (user) {
          trackEvent(user.id, {
            eventType: "share_card_save", targetType: "underline", targetId: post.id,
            source: "detail", metadata: cardMeta,
          });
        }
      };

      if (blob && navigator.share) {
        try {
          const file = new File([blob], fileName, { type: "image/png" });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file] });
            toast("공유 완료");
            if (user) {
              trackEvent(user.id, {
                eventType: "share_card_system_share", targetType: "underline", targetId: post.id,
                source: "detail", metadata: cardMeta,
              });
            }
          } else {
            downloadFallback();
          }
        } catch (shareErr) {
          if ((shareErr as Error)?.name !== "AbortError") downloadFallback();
        }
      } else {
        downloadFallback();
      }
    } catch (e) {
      console.error("ShareCard error:", e);
      toast("카드 생성에 실패했습니다. 다시 시도해주세요");
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
      <div className="sht" onClick={e => e.stopPropagation()}>
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
        <div className="sm-card-preview">
          <div ref={cardRef} style={{ display: "inline-block" }}>
            <ShareCard data={cardData} style={style} ratio={ratio} font={font} />
          </div>
        </div>

        {/* Actions */}
        <div className="share-save-buttons">
          <button className="share-save-btn share-save-btn-primary" onClick={handleSaveImage} disabled={saving}>
            {saving ? "저장 중..." : "카드 저장"}
          </button>
          <button className="share-save-btn" onClick={handleCopyText}>
            문장 복사
          </button>
        </div>
      </div>
    </div>
  );
}
