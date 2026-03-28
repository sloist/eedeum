import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "./Icons";

interface LeftSidebarProps {
  hasNewEcho: boolean;
  onCapture: () => void;
}

export function LeftSidebar({ hasNewEcho, onCapture }: LeftSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (p: string) => {
    if (p === "/") return path === "/";
    return path.startsWith(p);
  };

  const navItems = [
    { path: "/", icon: <Icons.Home />, label: "홈" },
    { path: "/discover", icon: <Icons.Compass />, label: "탐색" },
    { path: "/moum", icon: <Icons.Drawer />, label: "모음", dot: hasNewEcho },
    { path: "/shelf", icon: <Icons.User />, label: "서재" },
  ];

  return (
    <aside className="left-sidebar">
      <div className="ls-logo" onClick={() => navigate("/")}>
        밑줄<span className="logo-line" />
      </div>

      <nav className="ls-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`ls-nav-item ${isActive(item.path) ? "on" : ""}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.dot && <span className="ls-dot" />}
          </button>
        ))}
      </nav>

      <button className="ls-capture-btn" onClick={onCapture}>
        <Icons.Camera />
        <span>밑줄 긋기</span>
      </button>
    </aside>
  );
}
