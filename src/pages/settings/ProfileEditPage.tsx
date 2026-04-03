import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { fetchUserDbProfile, updateUserProfile, fetchUserLines, fetchUserWeaves } from "../../lib/api";
import { Toast } from "../../components/Toast";

const EMOJI_OPTIONS = ["📖", "🌿", "🍂", "🌙", "☕", "🎧", "✏️", "🌸", "🌊", "🎵", "📝", "🪴"];

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("📖");
  const [featuredLineId, setFeaturedLineId] = useState<string | null>(null);
  const [featuredWeaveId, setFeaturedWeaveId] = useState<string | null>(null);
  const [userLines, setUserLines] = useState<{ id: string; quote: string }[]>([]);
  const [userWeaves, setUserWeaves] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const toast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchUserDbProfile(user.id),
      fetchUserLines(user.id),
      fetchUserWeaves(user.id),
    ]).then(([profile, lines, weaves]) => {
      if (profile) {
        setName(profile.name || "");
        setHandle(profile.handle || "");
        setBio(profile.bio || "");
        setAvatarEmoji(profile.avatar_emoji || "📖");
        setFeaturedLineId((profile as any).featured_line_id || null);
        setFeaturedWeaveId((profile as any).featured_weave_id || null);
      }
      setUserLines(lines.map((l: any) => ({ id: l.id, quote: l.quote })));
      setUserWeaves(weaves.filter((w: any) => w.isPublic).map((w: any) => ({ id: w.id, title: w.title })));
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) { toast("이름을 입력해주세요"); return; }
    if (!handle.trim()) { toast("핸들을 입력해주세요"); return; }
    setSaving(true);
    const ok = await updateUserProfile(user.id, {
      name: name.trim(),
      handle: handle.trim().replace(/^@/, ""),
      bio: bio.trim(),
      avatar_emoji: avatarEmoji,
      featured_line_id: featuredLineId,
      featured_weave_id: featuredWeaveId,
    });
    setSaving(false);
    if (ok) {
      toast("프로필이 저장되었습니다");
      setTimeout(() => navigate("/settings"), 800);
    } else {
      toast("잠시 후 다시 시도해보세요");
    }
  };

  if (loading) {
    return (
      <div className="content-fade-in settings-sub-page">
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--t3)", fontSize: 13 }}>불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="content-fade-in settings-sub-page">
      <div className="settings-field">
        <label className="settings-field-label">프로필 이모지</label>
        <div className="emoji-picker">
          {EMOJI_OPTIONS.map((emoji) => (
            <button key={emoji} className={`emoji-option${avatarEmoji === emoji ? " selected" : ""}`} onClick={() => setAvatarEmoji(emoji)} type="button">
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-field">
        <label className="settings-field-label">이름</label>
        <input className="auth-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력하세요" />
      </div>

      <div className="settings-field">
        <label className="settings-field-label">핸들</label>
        <input className="auth-input" type="text" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@핸들" />
      </div>

      <div className="settings-field">
        <label className="settings-field-label">한 줄 소개</label>
        <input className="auth-input" type="text" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="한 줄로 자신을 소개해보세요" />
      </div>

      {/* 대표 한줄 선택 */}
      {userLines.length > 0 && (
        <div className="settings-field">
          <label className="settings-field-label">대표 한줄</label>
          <select
            className="auth-input"
            value={featuredLineId || ""}
            onChange={(e) => setFeaturedLineId(e.target.value || null)}
            style={{ fontSize: 13 }}
          >
            <option value="">자동 (가장 최근 기록)</option>
            {userLines.map((l) => (
              <option key={l.id} value={l.id}>{l.quote.slice(0, 40)}{l.quote.length > 40 ? "…" : ""}</option>
            ))}
          </select>
        </div>
      )}

      {/* 대표 노트 선택 */}
      {userWeaves.length > 0 && (
        <div className="settings-field">
          <label className="settings-field-label">대표 노트</label>
          <select
            className="auth-input"
            value={featuredWeaveId || ""}
            onChange={(e) => setFeaturedWeaveId(e.target.value || null)}
            style={{ fontSize: 13 }}
          >
            <option value="">자동 (첫 번째 공개 노트)</option>
            {userWeaves.map((w) => (
              <option key={w.id} value={w.id}>{w.title}</option>
            ))}
          </select>
        </div>
      )}

      <button className="subbtn" onClick={handleSave} disabled={saving} style={{ width: "100%", marginTop: 8 }}>
        {saving ? "저장 중..." : "저장"}
      </button>

      {showToast && <Toast message={toastMsg} />}
    </div>
  );
}
