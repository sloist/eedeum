import { useState } from "react";
import type { User } from "../data";

function FollowBtn() {
  const [f, setF] = useState(false);
  return (
    <button className={`flwbtn ${f ? "following" : "follow"}`} onClick={() => setF(!f)}>
      {f ? "팔로잉" : "팔로우"}
    </button>
  );
}

interface ProfileHeaderProps {
  user: User;
  showFollow: boolean;
}

export function ProfileHeader({ user, showFollow }: ProfileHeaderProps) {
  return (
    <>
      <div className="prof-h">
        <div className="prof-pic">{user.avatar}</div>
        <div className="prof-right">
          <div className="prof-nm">{user.name}</div>
          <div className="prof-hdl">{user.handle}</div>
          <div className="prof-bio">{user.bio}</div>
          <div className="prof-stats">
            <div className="pst-item"><span className="pst-num">{user.books}</span><span className="pst-lbl">책</span></div>
            <div className="pst-item"><span className="pst-num">{user.lines}</span><span className="pst-lbl">밑줄</span></div>
            <div className="pst-item"><span className="pst-num">{user.followers}</span><span className="pst-lbl">팔로워</span></div>
            <div className="pst-item"><span className="pst-num">{user.following}</span><span className="pst-lbl">팔로잉</span></div>
          </div>
        </div>
      </div>
      {showFollow && <FollowBtn />}
    </>
  );
}
