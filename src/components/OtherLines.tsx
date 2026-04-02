import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "./Icons";

type OtherLine = {
  id: string;
  quote: string;
  userName: string;
  page: number;
};

type Props = {
  otherLines: OtherLine[];
};

export function OtherLines({ otherLines }: Props) {
  const navigate = useNavigate();
  const [othersOpen, setOthersOpen] = useState(false);

  if (!otherLines || otherLines.length === 0) return null;

  return (
    <div className="detail-others">
      <button className={`detail-others-toggle ${othersOpen ? "open" : ""}`} onClick={() => setOthersOpen(!othersOpen)}>
        <span>이 책의 다른 한 줄 {otherLines.length}</span>
        <span className="detail-others-chevron"><Icons.ChevD /></span>
      </button>
      {othersOpen && otherLines.slice(0, 5).map((ol, i) => (
        <div key={i} className="detail-other-card" onClick={() => navigate(`/line/${ol.id}`)}>
          <div className="detail-other-quote">{ol.quote}</div>
          <div className="detail-other-meta">
            <span>{ol.userName}</span>
            {ol.page > 0 && <><span className="qdot" /><span>p.{ol.page}</span></>}
          </div>
        </div>
      ))}
    </div>
  );
}
