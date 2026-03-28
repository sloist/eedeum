import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Icons } from "../components/Icons";
import { USERS, allLinesForBook } from "../data";

export function BookPage() {
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const author = (location.state as { author?: string })?.author ?? "";

  const bookTitle = decodeURIComponent(title ?? "");
  const lines = allLinesForBook(bookTitle);

  return (
    <>
      <button className="backbtn" onClick={() => navigate(-1)}><Icons.Back /> 뒤로</button>
      <div className="cmphd" style={{ padding: "16px 20px" }}>
        <div className="cmptl">{bookTitle}</div>
        <div className="cmpsub">{author} · 사람마다 다른 밑줄</div>
      </div>
      <div style={{ padding: "0 20px 24px" }}>
        {lines.map((l, i) => {
          const lu = USERS[l.userId] || { name: l.userId };
          return (
            <div key={i} className="cmpitm">
              <div className="cmpq">"{l.quote}"</div>
              <div className="cmpur">
                <span className="cmpun" onClick={() => navigate(`/user/${l.userId}`)}>{lu.name}</span>
                <span className="cmppg">p.{l.page}</span>
              </div>
            </div>
          );
        })}
        {lines.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--t3)", fontSize: 13 }}>아직 밑줄이 없습니다</div>
        )}
      </div>
    </>
  );
}
