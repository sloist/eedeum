export interface ShareCardData {
  quote: string;
  book: string;
  author: string;
  user: string;
}

export type CardStyle = "paper" | "ink" | "poster" | "forest" | "midnight" | "warmth";
export type CardRatio = "feed" | "story" | "square";
export type CardFont = "serif" | "sans" | "handwrite";

export const STYLE_LABELS: Record<CardStyle, string> = {
  paper: "종이",
  ink: "잉크",
  poster: "포스터",
  forest: "숲",
  midnight: "밤",
  warmth: "온기",
};

const FONT_FAMILY: Record<CardFont, string> = {
  serif: "'Noto Serif KR', serif",
  sans: "'Pretendard Variable', sans-serif",
  handwrite: "cursive",
};

interface ShareCardProps {
  data: ShareCardData;
  style: CardStyle;
  ratio: CardRatio;
  font?: CardFont;
}

function Watermark({ light }: { light?: boolean }) {
  return (
    <div className={`sc-watermark ${light ? "sc-watermark-light" : ""}`}>
      eedeum
    </div>
  );
}

export function ShareCard({ data, style, ratio, font = "serif" }: ShareCardProps) {
  const rc = ratio === "feed" ? "sc-feed" : ratio === "story" ? "sc-story" : "sc-square";
  const fontStyle = { fontFamily: FONT_FAMILY[font] };
  const isLight = style === "paper" || style === "poster";

  return (
    <div className={`sc ${rc} sc-${style}`}>
      <div className="sc-body">
        <div className="sc-quote" style={fontStyle}>{data.quote}</div>
      </div>
      <div className="sc-foot">
        {style === "poster" ? (
          <>
            <span>{data.book}</span>
            <span>{data.author}</span>
          </>
        ) : (
          <span>{data.book} · {data.author}</span>
        )}
      </div>
      <Watermark light={!isLight} />
    </div>
  );
}
