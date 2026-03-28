import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "./Icons";

interface BottomNavProps {
  hasNewEcho: boolean;
  onCapture: () => void;
}

export function BottomNav({ hasNewEcho, onCapture }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (p: string) => {
    if (p === "/") return path === "/";
    return path.startsWith(p);
  };

  return (
    <nav className="bnav">
      <button className={`nbtn ${isActive("/") ? "on" : ""}`} onClick={() => navigate("/")}>
        <Icons.Home /><span>홈</span>
      </button>
      <button className={`nbtn ${isActive("/discover") ? "on" : ""}`} onClick={() => navigate("/discover")}>
        <Icons.Compass /><span>탐색</span>
      </button>
      <div className="nctr">
        <div className="corb" onClick={onCapture}><Icons.Camera /></div>
      </div>
      <button className={`nbtn ${isActive("/moum") ? "on" : ""}`} onClick={() => navigate("/moum")}>
        <Icons.Drawer /><span>모음</span>
        {hasNewEcho && <span className="ndot" />}
      </button>
      <button className={`nbtn ${isActive("/shelf") ? "on" : ""}`} onClick={() => navigate("/shelf")}>
        <Icons.User /><span>서재</span>
      </button>
    </nav>
  );
}
