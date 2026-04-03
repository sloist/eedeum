import { useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import { fetchUserDbProfile } from "../../lib/api";
import { Toast } from "../../components/Toast";

export function AccountPage() {
  const { user } = useAuth();
  const [createdAt, setCreatedAt] = useState("");
  const [showPwForm, setShowPwForm] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
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
    fetchUserDbProfile(user.id).then((profile) => {
      if (profile) {
        const d = new Date(profile.created_at);
        setCreatedAt(`${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`);
      }
    });
  }, [user]);

  const handleChangePassword = async () => {
    if (newPw.length < 6) {
      toast("비밀번호는 6자 이상이어야 합니다");
      return;
    }
    if (newPw !== confirmPw) {
      toast("비밀번호가 일치하지 않습니다");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);
    if (error) {
      toast("잠시 후 다시 시도해보세요");
    } else {
      toast("비밀번호가 변경되었습니다");
      setNewPw("");
      setConfirmPw("");
      setShowPwForm(false);
    }
  };

  return (
    <div className="content-fade-in settings-sub-page">

      <div className="settings-field">
        <label className="settings-field-label">이메일</label>
        <div className="settings-field-value">{user?.email ?? "-"}</div>
      </div>

      <div className="settings-field">
        <label className="settings-field-label">가입일</label>
        <div className="settings-field-value">{createdAt || "-"}</div>
      </div>

      {!showPwForm ? (
        <button
          className="subbtn"
          onClick={() => setShowPwForm(true)}
          style={{ width: "100%", marginTop: 8 }}
        >
          비밀번호 변경
        </button>
      ) : (
        <div style={{ marginTop: 8 }}>
          <div className="settings-field">
            <label className="settings-field-label">새 비밀번호</label>
            <input
              className="auth-input"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="6자 이상 입력"
            />
          </div>
          <div className="settings-field">
            <label className="settings-field-label">비밀번호 확인</label>
            <input
              className="auth-input"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="한 번 더 입력"
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="subbtn"
              onClick={handleChangePassword}
              disabled={saving}
              style={{ flex: 1 }}
            >
              {saving ? "변경 중..." : "변경하기"}
            </button>
            <button
              className="subbtn"
              onClick={() => { setShowPwForm(false); setNewPw(""); setConfirmPw(""); }}
              style={{ flex: 1, background: "var(--bgW)", color: "var(--t2)" }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {showToast && <Toast message={toastMsg} />}
    </div>
  );
}
