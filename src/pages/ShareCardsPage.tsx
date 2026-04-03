import { useNavigate } from "react-router-dom";
import { Icons } from "../components/Icons";

export function ShareCardsPage() {
  const navigate = useNavigate();
  return (
    <div className="content-fade-in">
      <button className="backbtn" onClick={() => navigate(-1)}><Icons.Back /> 뒤로</button>
      <div className="empty-cta">
        <div className="empty-cta-text">공유 카드는 기록 상세에서 이용할 수 있습니다</div>
      </div>
    </div>
  );
}
