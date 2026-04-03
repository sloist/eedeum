import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import { Toast } from "../../components/Toast";

export function DeleteAccountPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const toast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const isConfirmed = confirmText === "이듬을 떠납니다";

  const handleDelete = async () => {
    if (!user || !isConfirmed) return;
    setDeleting(true);

    // Delete user data from users table (cascading should handle related data)
    const { error } = await supabase.from("users").delete().eq("id", user.id);
    if (error) {
      setDeleting(false);
      toast("잠시 후 다시 시도해보세요");
      return;
    }

    await signOut();
    navigate("/");
  };

  return (
    <div className="content-fade-in settings-sub-page">
      <div className="settings-sub-title">이듬을 떠나기</div>

      <div className="settings-danger-zone">
        <div style={{ fontSize: 14, fontWeight: 600, color: "#D4534B", marginBottom: 12, letterSpacing: -0.2 }}>
          정말 탈퇴하시겠습니까?
        </div>
        <p className="settings-note" style={{ color: "var(--t2)" }}>
          계정을 삭제하면 모든 기록, 노트, 서재 정보가 영구적으로 삭제됩니다.
          이 작업은 되돌릴 수 없습니다.
        </p>

        <div className="settings-field" style={{ marginTop: 20 }}>
          <label className="settings-field-label">
            탈퇴를 원하시면 아래에 '이듬을 떠납니다'를 입력해주세요
          </label>
          <input
            className="auth-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="이듬을 떠납니다"
          />
        </div>

        <button
          className="settings-danger-btn"
          disabled={!isConfirmed || deleting}
          onClick={handleDelete}
        >
          {deleting ? "삭제 중..." : "이듬을 떠납니다"}
        </button>
      </div>

      {showToast && <Toast message={toastMsg} />}
    </div>
  );
}
