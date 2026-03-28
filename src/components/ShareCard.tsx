export interface ShareCardData {
  quote: string;
  book: string;
  author: string;
  user: string;
}

export type CardStyle = "A" | "B" | "C" | "D" | "E" | "F";
export type CardRatio = "feed" | "story";

export const COLOR_THEMES = [
  { bg: "linear-gradient(155deg, #8B7355 0%, #6B5B4A 100%)", text: "#FDFAF5", name: "브라운" },
  { bg: "linear-gradient(155deg, #5A6B55 0%, #3D4F3A 100%)", text: "#F0F5EE", name: "포레스트" },
  { bg: "linear-gradient(155deg, #4A5A6B 0%, #354555 100%)", text: "#EEF2F5", name: "네이비" },
  { bg: "linear-gradient(155deg, #6B5A6B 0%, #4F3D4F 100%)", text: "#F5EEF5", name: "플럼" },
];

export const STYLE_LABELS: Record<CardStyle, string> = {
  A: "클래식 다크",
  B: "종이",
  C: "세로선",
  D: "색감",
  E: "타이포",
  F: "필름",
};

interface ShareCardProps {
  data: ShareCardData;
  style: CardStyle;
  ratio: CardRatio;
  colorIdx?: number;
}

export function ShareCard({ data, style, ratio, colorIdx = 0 }: ShareCardProps) {
  const rc = ratio === "feed" ? "ratio-feed" : "ratio-story";
  const ct = COLOR_THEMES[colorIdx];

  switch (style) {
    case "A":
      return (
        <div className={`card-wrap card-a ${rc}`}>
          <div className="card-inner">
            <div className="cq-mark">"</div>
            <div className="cq-text">{data.quote}</div>
            <div className="cq-bottom">
              <div className="cq-book">{data.book}<br />{data.author}</div>
              <div className="cq-logo">밑줄</div>
            </div>
          </div>
        </div>
      );

    case "B":
      return (
        <div className={`card-wrap card-b ${rc}`}>
          <div className="card-inner">
            <div className="cq-line" />
            <div className="cq-text">{data.quote}</div>
            <div className="cq-bottom">
              <div className="cq-book">{data.book}<br />{data.author}</div>
              <div className="cq-logo">밑줄</div>
            </div>
          </div>
        </div>
      );

    case "C":
      return (
        <div className={`card-wrap card-c ${rc}`}>
          <div className="card-inner">
            <div className="cq-main">
              <div className="cq-vline" />
              <div className="cq-text">{data.quote}</div>
            </div>
            <div className="cq-bottom">
              <div>
                <div className="cq-book">{data.book} · {data.author}</div>
                <div className="cq-user">{data.user}의 밑줄</div>
              </div>
              <div className="cq-logo">밑줄</div>
            </div>
          </div>
        </div>
      );

    case "D":
      return (
        <div className={`card-wrap card-d ${rc}`} style={{ background: ct.bg, color: ct.text }}>
          <div className="card-inner">
            <div className="cq-text">{data.quote}</div>
            <div className="cq-bottom">
              <div className="cq-book">{data.book}<br />{data.author}</div>
              <div className="cq-logo" style={{ borderBottomColor: ct.text + "25" }}>밑줄</div>
            </div>
          </div>
        </div>
      );

    case "E":
      return (
        <div className={`card-wrap card-e ${rc}`}>
          <div className="card-inner">
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div className="cq-text">{data.quote}</div>
              <div className="cq-divider" />
            </div>
            <div className="cq-bottom">
              <div className="cq-book">{data.book} · {data.author}</div>
              <div className="cq-logo">밑 줄</div>
            </div>
          </div>
        </div>
      );

    case "F":
      return (
        <div className={`card-wrap card-f ${rc}`}>
          <div className="film-border">
            <div className="film-inner">
              <div className="cq-text">{data.quote}</div>
              <div className="cq-bottom">
                <div className="cq-book">{data.book}<br />{data.author}</div>
              </div>
            </div>
            <div className="film-meta">
              <span>{data.user}의 밑줄</span>
              <span className="cq-logo">밑줄</span>
            </div>
          </div>
        </div>
      );
  }
}
