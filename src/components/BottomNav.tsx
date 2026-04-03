import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "./Icons";

// 한줄/노트 탭은 스크롤 위치를 기억합니다
const scrollPositions: Record<string, number> = {};

// 현재 경로가 어떤 탭 루트에 속하는지
function getTabRoot(path: string): string | null {
  if (path === "/" || path.startsWith("/line/") || path.startsWith("/book/") || path.startsWith("/user/")) return "/";
  if (path.startsWith("/weaves") || path.startsWith("/weave/")) return "/weaves";
  return null;
}

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (p: string) => {
    if (p === "/") return path === "/" || path.startsWith("/line/") || path.startsWith("/book/") || path.startsWith("/user/");
    if (p === "/weaves") return path.startsWith("/weaves") || path.startsWith("/weave/");
    if (p === "/shelf") return path.startsWith("/shelf") || path === "/notifications" || path.startsWith("/settings");
    if (p === "/my") return path === "/my" || path === "/write";
    return path.startsWith(p);
  };

  const remembersScroll = (p: string) => p === "/" || p === "/weaves";

  const go = (p: string) => {
    const currentActive = isActive(p);

    // 현재 탭 루트의 스크롤 위치 저장
    const currentRoot = getTabRoot(path);
    if (currentRoot) {
      scrollPositions[currentRoot] = window.scrollY;
    }

    if (currentActive && path === p) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    navigate(p);

    // 한줄/노트는 위치 복원, 나머지는 최상단
    if (remembersScroll(p) && scrollPositions[p]) {
      // 여러 프레임 기다려서 React 렌더 후 복원
      const savedY = scrollPositions[p];
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedY);
        });
      });
    } else {
      requestAnimationFrame(() => window.scrollTo(0, 0));
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
