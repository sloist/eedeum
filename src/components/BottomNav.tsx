import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "./Icons";

// 한줄/노트 탭은 스크롤 위치를 기억합니다
const scrollPositions: Record<string, number> = {};

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  // Hide on write page
  if (path === "/write") return null;

  const isActive = (p: string) => {
    if (p === "/") return path === "/" || path.startsWith("/line/") || path.startsWith("/book/") || path.startsWith("/user/");
    if (p === "/weaves") return path.startsWith("/weaves") || path.startsWith("/weave/");
    if (p === "/shelf") return path.startsWith("/shelf") || path === "/notifications" || path.startsWith("/settings");
    if (p === "/my") return path.startsWith("/my");
    return path.startsWith(p);
  };

  // 스크롤 위치를 기억할 탭들
  const remembersScroll = (p: string) => p === "/" || p === "/weaves";

  const go = (p: string) => {
    const currentActive = isActive(p);

    // 현재 탭의 루트 경로에 스크롤 위치 저장
    const currentRoot = path === "/" ? "/" : "/weaves";
    if (path === "/" || path === "/weaves") {
      scrollPositions[currentRoot] = window.scrollY;
    }

    if (currentActive && path === p) {
      // 같은 탭 재탭 → 최상단으로
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    navigate(p);

    // 기록/서재는 항상 최상단, 한줄/노트는 위치 복원
    if (remembersScroll(p) && scrollPositions[p]) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositions[p]);
      });
    } else {
      window.scrollTo(0, 0);
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    }
  };

  return (
    <nav className="bnav">
      <button className={`nbtn ${isActive("/") ? "on" : ""}`} onClick={() => go("/")}>
        <Icons.Discover /><span>한줄</span>
      </button>
      <button className={`nbtn ${isActive("/my") ? "on" : ""}`} onClick={() => go("/my")}>
        <Icons.Record /><span>기록</span>
      </button>
      <button className={`nbtn ${isActive("/weaves") ? "on" : ""}`} onClick={() => go("/weaves")}>
        <Icons.Note /><span>노트</span>
      </button>
      <button className={`nbtn ${isActive("/shelf") ? "on" : ""}`} onClick={() => go("/shelf")}>
        <Icons.Shelf /><span>서재</span>
      </button>
    </nav>
  );
}
