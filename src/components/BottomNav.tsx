import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "./Icons";

// 한줄/노트 탭은 스크롤 위치를 기억합니다
export const scrollPositions: Record<string, number> = {};

// 현재 경로가 어떤 탭 루트에 속하는지
function getTabRoot(path: string): string | null {
  if (path === "/" || path.startsWith("/@") || path.startsWith("/book/")) return "/";
  if (path.startsWith("/notes")) return "/notes";
  return null;
}

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isNoteDetail = /^\/@[^/]+\/notes\//.test(path);

  // 노트 읽기 중에는 하단 네비 숨기기
  if (isNoteDetail) return null;

  const isActive = (p: string) => {
    if (p === "/") return !isNoteDetail && (path === "/" || path.startsWith("/@") || path.startsWith("/book/"));
    if (p === "/notes") return path.startsWith("/notes") || isNoteDetail;
    if (p === "/shelf") return path.startsWith("/shelf") || path === "/notifications" || path.startsWith("/settings");
    if (p === "/write") return path === "/write";
    return path.startsWith(p);
  };

  const remembersScroll = (p: string) => p === "/" || p === "/notes";

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
      <button className={`nbtn ${isActive("/write") ? "on" : ""}`} onClick={() => go("/write")}>
        <Icons.Record /><span>기록</span>
      </button>
      <button className={`nbtn ${isActive("/notes") ? "on" : ""}`} onClick={() => go("/notes")}>
        <Icons.Note /><span>노트</span>
      </button>
      <button className={`nbtn ${isActive("/shelf") ? "on" : ""}`} onClick={() => go("/shelf")}>
        <Icons.Shelf /><span>서재</span>
      </button>
    </nav>
  );
}
