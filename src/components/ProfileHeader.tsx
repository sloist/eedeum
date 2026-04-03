import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import type { User } from "../data";
import { useAuth } from "../lib/AuthContext";
import { useModal } from "../lib/ModalContext";
import { toggleFollow, checkIsFollowing, fetchUserRank } from "../lib/api";

interface FollowBtnProps {
  targetUserId?: string;
}

function FollowBtn({ targetUserId }: FollowBtnProps) {
  const { user } = useAuth();
  const { toast } = useModal();
  const [f, setF] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !targetUserId) return;
    checkIsFollowing(user.id, targetUserId).then(setF);
  }, [user, targetUserId]);

  const handleClick = async () => {
    if (!user) {
      return;
    }
    if (!targetUserId) return;
    if (loading) return;
    setLoading(true);
    const nowFollowing = await toggleFollow(user.id, targetUserId);
    setF(nowFollowing);
    toast(nowFollowing ? "구독을 시작했습니다" : "구독을 해제했습니다");
    setLoading(false);
  };

  return (
    <button className={`flwbtn ${f ? "following" : "follow"}`} onClick={handleClick}>
      {f ? "구독 중" : "구독"}
    </button>
  );
}

interface ProfileHeaderProps {
  user: User;
  showFollow: boolean;
  targetUserId?: string;
  rightActions?: React.ReactNode;
  featuredQuote?: string;
  featuredWeave?: { id: string; title: string; coverColor: string } | null;
  onWeaveClick?: (id: string) => void;
  featuredQuoteId?: string;
  onQuoteClick?: (id: string) => void;
  onRankClick?: () => void;
}

export function ProfileHeader({ user: profileUser, showFollow, targetUserId, rightActions, featuredQuote, featuredWeave, onWeaveClick, featuredQuoteId, onQuoteClick, onRankClick }: ProfileHeaderProps) {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const isSelf = authUser && targetUserId && authUser.id === targetUserId;
  const [rank, setRank] = useState<{ tier: string; percentile: number } | null>(null);

  useEffect(() => {
    if (!targetUserId) return;
    fetchUserRank(targetUserId).then(r => setRank(r));
  }, [targetUserId]);

  return (
    <>
      <div className="prof-h">
        <div className="prof-pic">{profileUser.avatar}</div>
        <div className="prof-right">
          <div className="prof-name-row">
            <span className="prof-nm">{profileUser.name}</span>
            <span className="prof-hdl">@{profileUser.handle.replace(/^@/, "")}</span>
            {rightActions && <span className="prof-actions">{rightActions}</span>}
          </div>
          {profileUser.bio && <div className="prof-bio">{profileUser.bio}</div>}
          {rank && <button className="rank-badge" onClick={onRankClick}>{rank.tier}</button>}
        </div>
      </div>
      {showFollow && !isSelf && <FollowBtn targetUserId={targetUserId} />}
      {isSelf && <button className="prof-edit-link" onClick={() => navigate("/settings")}>프로필 편집</button>}

      {/* 대표 문장 + 대표 노트 */}
      {(featuredQuote || featuredWeave) && (
        <div className="prof-featured">
          {featuredQuote && (
            <div className="prof-featured-quote" style={{ cursor: featuredQuoteId ? "pointer" : undefined }} onClick={() => featuredQuoteId && onQuoteClick?.(featuredQuoteId)}>{featuredQuote}</div>
          )}
          {featuredWeave && (
            <div className="prof-featured-weave" style={{ background: featuredWeave.coverColor }} onClick={() => onWeaveClick?.(featuredWeave.id)}>
              <span className="prof-featured-weave-title">{featuredWeave.title}</span>
            </div>
          )}
        </div>
      )}

      <div className="prof-stats-sub">
        {profileUser.books > 0 && <span>{profileUser.books}권의 책</span>}
        {profileUser.books > 0 && profileUser.lines > 0 && <span className="prof-stats-dot">·</span>}
        {profileUser.lines > 0 && <span>{profileUser.lines}개의 문장</span>}
        {(profileUser.books > 0 || profileUser.lines > 0) && <span className="prof-stats-dot">·</span>}
        <span>구독자 {profileUser.followers}</span>
        <span className="prof-stats-dot">·</span>
        <span>구독 중 {profileUser.following}</span>
      </div>
    </>
  );
}
